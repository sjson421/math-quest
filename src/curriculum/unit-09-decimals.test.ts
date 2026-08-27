import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem, diagnose } from '../lib/generator'
import { rational } from '../lib/rational'
import type { DecimalData, DecimalValue, Difficulty, Problem } from '../lib/types'
import { manifestIndex } from './index'
import { sample, unrenderedKeys } from './recorded-output'
import { unit09 } from './unit-09-decimals'

describe.each(unit09.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problems = (id: string) => {
  const skill = unit09.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 9 skill ${id}`)
  return difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
}

const decimalData = (problem: Problem): DecimalData => {
  if (problem.display.kind === 'inline' && problem.display.decimal) return problem.display.decimal
  if (problem.display.kind === 'decimal-column') return problem.display.decimal
  throw new Error('expected decimal semantic data')
}

const exact = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
  return rational(problem.answer.n, problem.answer.d)
}

const power = (scale: number) => 10 ** scale
const number = (value: DecimalValue) => value.coefficient / power(value.scale)
const text = (value: DecimalValue) => {
  const divisor = power(value.scale)
  return `${Math.floor(value.coefficient / divisor)}.${String(value.coefficient % divisor).padStart(value.scale, '0')}`
}

const teachingLines = [
  ['decimal-place-value', 'Count places to the right of the decimal point.'],
  ['read-decimals', 'The word "and" marks the decimal point when writing digits.'],
  ['compare-decimals', 'Add ending zeros, then compare matching places from left to right.'],
  ['round-decimals', 'Check the next digit: 5 or more rounds up.'],
  ['add-decimals', 'Line up decimal points, then add matching places.'],
  ['sub-decimals', 'Line up decimal points, then subtract matching places.'],
  ['mult-decimals', 'Multiply as whole numbers, then restore all decimal places.'],
  ['div-decimal-by-whole', 'Divide as whole numbers and bring the decimal point straight up.'],
  ['div-by-decimal', 'Shift both decimal points equally until the divisor is whole.'],
  ['fraction-to-decimal', 'Divide the top number by the bottom number to write a decimal.'],
  ['decimal-to-fraction', "Write a decimal's digits over their place value, then reduce."],
  ['money-problems', 'Multiply the price by the needed quantity, then write the total in dollars.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit09.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 9 skill: ${id}`)
  return found
}

const answerChoiceLabel = (problem: Problem): string => {
  if (problem.answer.kind !== 'choice') throw new Error(`Expected choice answer for ${problem.skillId}`)
  const answerId = problem.answer.id
  const choice = problem.choices?.find((candidate) => candidate.id === answerId)
  if (!choice) throw new Error(`Missing answer choice for ${problem.skillId}`)
  return choice.label
}

const fractionValues = (problem: Problem): [number, number] => {
  if (problem.display.kind !== 'math' || problem.display.notation.kind !== 'fraction') {
    throw new Error('expected fraction notation')
  }
  const numerator = problem.display.notation.numerator
  const denominator = problem.display.notation.denominator
  if (numerator.kind !== 'text' || denominator.kind !== 'text') throw new Error('expected fraction text')
  return [Number(numerator.value), Number(denominator.value)]
}

describe('Stage D Unit 9 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage D Unit 9 intro examples', () => {
  it('recomputes every fixed example from visible decimal or carried data', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)

      if (id === 'fraction-to-decimal') {
        const [numerator, denominator] = fractionValues(problem)
        expect(exact(problem)).toEqual(rational(numerator, denominator))
        expect(problem.answer).toMatchObject({ requireDecimal: true })
        continue
      }

      if (id === 'money-problems') {
        if (problem.display.kind !== 'story' || problem.display.operands?.length !== 2) {
          throw new Error('expected money story operands')
        }
        const [priceCents, quantity] = problem.display.operands
        expect(problem.display.operator).toBe('×')
        expect(exact(problem)).toEqual(rational(priceCents * quantity, 100))
        continue
      }

      if (id === 'compare-decimals') {
        const data = decimalData(problem)
        if (data.operation !== 'compare') throw new Error('expected decimal comparison data')
        const left = number(data.left)
        const right = number(data.right)
        const relation = left < right ? -1 : 1
        expect(problem.answer).toEqual({ kind: 'choice', id: String(relation) })
        expect(answerChoiceLabel(problem)).toBe(left < right ? '<' : '>')
        continue
      }

      const data = decimalData(problem)
      switch (data.operation) {
        case 'digit': {
          const digits = String(data.value.coefficient % power(data.value.scale)).padStart(data.value.scale, '0')
          const digit = Number(digits[data.place === 'tenths' ? 0 : 1])
          expect(exact(problem)).toEqual(rational(digit, 1))
          break
        }
        case 'read':
          expect(exact(problem)).toEqual(rational(data.value.coefficient, power(data.value.scale)))
          break
        case 'round': {
          const factor = power(data.value.scale - data.targetScale)
          const rounded = Math.floor((data.value.coefficient + factor / 2) / factor)
          expect(exact(problem)).toEqual(rational(rounded, power(data.targetScale)))
          break
        }
        case 'add':
        case 'sub': {
          const scale = Math.max(data.left.scale, data.right.scale)
          const left = data.left.coefficient * power(scale - data.left.scale)
          const right = data.right.coefficient * power(scale - data.right.scale)
          const result = data.operation === 'add' ? left + right : left - right
          expect(exact(problem)).toEqual(rational(result, power(scale)))
          break
        }
        case 'mult':
          expect(exact(problem)).toEqual(
            rational(data.left.coefficient * data.right.coefficient, power(data.left.scale + data.right.scale)),
          )
          break
        case 'div-whole':
          expect(exact(problem)).toEqual(rational(data.dividend.coefficient, data.divisor * power(data.dividend.scale)))
          break
        case 'div-decimal':
          expect(exact(problem)).toEqual(
            rational(
              data.dividend.coefficient * power(data.divisor.scale),
              data.divisor.coefficient * power(data.dividend.scale),
            ),
          )
          break
        case 'display':
          expect(exact(problem)).toEqual(rational(data.value.coefficient, power(data.value.scale)))
          expect(problem.answer).toMatchObject({ requireFraction: true })
          break
        default:
          throw new Error(`Unhandled Unit 9 intro: ${data.operation}`)
      }
    }
  })
})

describe('decimal-place-value', () => {
  it('derives the requested digit from exact visible places', () => {
    for (const problem of problems('decimal-place-value')) {
      const data = decimalData(problem)
      if (data.operation !== 'digit' || problem.display.kind !== 'inline') throw new Error('expected digit data')
      const digits = String(data.value.coefficient % power(data.value.scale)).padStart(data.value.scale, '0')
      const answer = Number(digits[data.place === 'tenths' ? 0 : 1])

      expect(problem.display.text).toBe(text(data.value))
      expect(exact(problem)).toEqual(rational(answer, 1))
      expect(problem.prompt).toContain(data.place)
    }
  })

  it('covers tenths, hundredths, and zero placeholders with surviving diagnoses', () => {
    const all = problems('decimal-place-value')
    expect(new Set(all.map((problem) => (decimalData(problem) as Extract<DecimalData, { operation: 'digit' }>).place))).toEqual(
      new Set(['tenths', 'hundredths']),
    )
    expect(all.some((problem) => exact(problem).n === 0)).toBe(true)
    expect(all.every((problem) => (problem.misconceptions?.length ?? 0) >= 1)).toBe(true)
  })
})

describe('read-decimals', () => {
  it('answers decimal words with their exact coefficient and scale', () => {
    for (const problem of problems('read-decimals')) {
      const data = decimalData(problem)
      if (data.operation !== 'read' || problem.display.kind !== 'inline') throw new Error('expected read data')

      expect(problem.display.text).toContain(' and ')
      expect(problem.display.text).toMatch(/tenth|hundredth/)
      expect(exact(problem)).toEqual(rational(data.value.coefficient, power(data.value.scale)))
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(checkAnswer(problem.answer, text(data.value)).status).toBe('correct')
    }
  })

  it('includes interior-zero hundredths and diagnoses moving them into tenths', () => {
    const zeroTenths = problems('read-decimals').filter((problem) => {
      const data = decimalData(problem)
      return data.operation === 'read' && data.value.scale === 2 && Math.floor(data.value.coefficient / 10) % 10 === 0
    })
    expect(zeroTenths.length).toBeGreaterThan(0)
    for (const problem of zeroTenths) {
      const data = decimalData(problem) as Extract<DecimalData, { operation: 'read' }>
      const whole = Math.floor(data.value.coefficient / 100)
      const fraction = data.value.coefficient % 100
      expect(diagnose(problem, String(whole + fraction / 10))?.tag).toBe('used-tenths-place')
    }
  })
})

describe('compare-decimals', () => {
  it('always presents the longer-numeral trap and maps the exact relation', () => {
    for (const problem of problems('compare-decimals')) {
      const data = decimalData(problem)
      if (data.operation !== 'compare' || problem.answer.kind !== 'choice') throw new Error('expected comparison data')
      const left = number(data.left)
      const right = number(data.right)
      const relation = left < right ? -1 : 1
      const longer = data.left.scale === 2 ? left : right
      const shorter = data.left.scale === 1 ? left : right

      expect(shorter).toBeGreaterThan(longer)
      expect(problem.answer.id).toBe(String(relation))
      expect(problem.inputMode).toBe('choice')
      expect(problem.misconceptions?.map(({ tag }) => tag)).toEqual(['longer-means-bigger', 'called-equal'])
      expect(diagnose(problem, String(-relation))?.tag).toBe('longer-means-bigger')
      expect(diagnose(problem, '0')?.tag).toBe('called-equal')
    }
  })
})

describe('round-decimals', () => {
  it('rounds half up from exact source digits to the stated place', () => {
    const all = problems('round-decimals')
    for (const problem of all) {
      const data = decimalData(problem)
      if (data.operation !== 'round') throw new Error('expected round data')
      const factor = power(data.value.scale - data.targetScale)
      const rounded = Math.floor((data.value.coefficient + factor / 2) / factor)

      expect(exact(problem)).toEqual(rational(rounded, power(data.targetScale)))
      expect(data.value.coefficient % factor).not.toBe(0)
      expect(problem.prompt).toContain(data.targetScale === 0 ? 'whole' : 'tenth')
    }
    expect(all.some((problem) => {
      const data = decimalData(problem) as Extract<DecimalData, { operation: 'round' }>
      return data.value.coefficient % power(data.value.scale - data.targetScale) === 5
    })).toBe(true)
  })
})

describe.each([
  ['add-decimals', 'add'],
  ['sub-decimals', 'sub'],
] as const)('%s', (id, operation) => {
  it('aligns exact coefficients at the larger scale and derives the answer', () => {
    const all = problems(id)
    for (const problem of all) {
      const data = decimalData(problem)
      if (data.operation !== operation || problem.display.kind !== 'decimal-column') throw new Error('expected decimal column')
      const scale = Math.max(data.left.scale, data.right.scale)
      const left = data.left.coefficient * power(scale - data.left.scale)
      const right = data.right.coefficient * power(scale - data.right.scale)
      const result = operation === 'add' ? left + right : left - right

      expect(exact(problem)).toEqual(rational(result, power(scale)))
      expect(problem.keypad).toEqual({ allowDecimal: true })
      if (operation === 'sub') expect(result).toBeGreaterThan(0)
    }
    expect(all.some((problem) => {
      const data = decimalData(problem) as Extract<DecimalData, { operation: 'add' | 'sub' }>
      return data.left.scale !== data.right.scale
    })).toBe(true)
  })

  it('computes the place-misalignment prediction from unpromoted coefficients', () => {
    for (const problem of problems(id)) {
      const data = decimalData(problem)
      if (data.operation !== operation) throw new Error('expected arithmetic data')
      const scale = Math.max(data.left.scale, data.right.scale)
      const misaligned =
        (operation === 'add'
          ? data.left.coefficient + data.right.coefficient
          : Math.abs(data.left.coefficient - data.right.coefficient)) / power(scale)
      const prediction = problem.misconceptions?.find(({ tag }) => tag === 'misaligned-places')
      const answer = exact(problem)
      const collides = misaligned === answer.n / answer.d
      if (collides) {
        expect(prediction).toBeUndefined()
      } else {
        expect(prediction).toBeDefined()
        expect(prediction?.value).toBe(misaligned)
      }
    }
  })

  it(`covers ${operation === 'add' ? 'carrying' : 'borrowing'} across the decimal point`, () => {
    const exercisesBoundary = problems(id).some((problem) => {
      const data = decimalData(problem)
      if (data.operation !== operation) return false
      const scale = Math.max(data.left.scale, data.right.scale)
      const divisor = power(scale)
      const left = data.left.coefficient * power(scale - data.left.scale)
      const right = data.right.coefficient * power(scale - data.right.scale)
      return operation === 'add'
        ? (left % divisor) + (right % divisor) >= divisor
        : left % divisor < right % divisor
    })

    expect(exercisesBoundary).toBe(true)
  })
})

describe('mult-decimals', () => {
  it('derives an exact product from independently reconstructed coefficients', () => {
    for (const problem of problems('mult-decimals')) {
      const data = decimalData(problem)
      if (data.operation !== 'mult' || problem.display.kind !== 'decimal-column') throw new Error('expected mult data')
      const result = data.left.coefficient * data.right.coefficient
      expect(exact(problem)).toEqual(rational(result, power(2)))
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(data.left.scale).toBe(1)
      expect(data.right.scale).toBe(1)
    }
  })

  it('predicts both directions of a misplaced decimal point, always distinct', () => {
    for (const problem of problems('mult-decimals')) {
      const data = decimalData(problem)
      if (data.operation !== 'mult') throw new Error('expected mult data')
      const result = data.left.coefficient * data.right.coefficient
      const answer = exact(problem)
      const tooBig = problem.misconceptions?.find(({ tag }) => tag === 'misplaced-point-fewer-places')
      const tooSmall = problem.misconceptions?.find(({ tag }) => tag === 'misplaced-point-extra-place')
      expect(tooBig?.value).toBe(result / power(1))
      expect(tooSmall?.value).toBe(result / power(3))
      expect(tooBig?.value).not.toBe(answer.n / answer.d)
      expect(tooSmall?.value).not.toBe(tooBig?.value)
    }
  })

  it('grows operand magnitude with difficulty', () => {
    const all = problems('mult-decimals')
    const magnitude = (difficulty: Difficulty) => {
      const at = all.filter((p) => p.difficulty === difficulty)
      const left = (p: Problem) => number((decimalData(p) as Extract<DecimalData, { operation: 'mult' }>).left)
      return at.reduce((sum, p) => sum + left(p), 0) / at.length
    }
    expect(magnitude(5)).toBeGreaterThan(magnitude(1))
  })
})

describe('div-decimal-by-whole', () => {
  it('constructs an exact quotient from a whole-number divisor', () => {
    for (const problem of problems('div-decimal-by-whole')) {
      const data = decimalData(problem)
      if (data.operation !== 'div-whole' || problem.display.kind !== 'inline') throw new Error('expected div-whole data')
      expect(problem.display.text).toBe(`${text(data.dividend)} ÷ ${data.divisor}`)
      expect(data.dividend.coefficient % data.divisor).toBe(0)
      expect(exact(problem)).toEqual(rational(data.dividend.coefficient / data.divisor, power(data.dividend.scale)))
      expect(problem.keypad).toEqual({ allowDecimal: true })
    }
  })
})

describe('div-by-decimal', () => {
  it('constructs an exact whole-number quotient by shifting both points', () => {
    for (const problem of problems('div-by-decimal')) {
      const data = decimalData(problem)
      if (data.operation !== 'div-decimal' || problem.display.kind !== 'inline') throw new Error('expected div-decimal data')
      expect(problem.display.text).toBe(`${text(data.dividend)} ÷ ${text(data.divisor)}`)
      const quotient = (data.dividend.coefficient * power(data.divisor.scale)) / (data.divisor.coefficient * power(data.dividend.scale))
      expect(Number.isInteger(quotient)).toBe(true)
      expect(exact(problem)).toEqual(rational(quotient, 1))
    }
  })

  it('predicts shifting only one point, in both directions, always distinct from the answer', () => {
    for (const problem of problems('div-by-decimal')) {
      const data = decimalData(problem)
      if (data.operation !== 'div-decimal') throw new Error('expected div-decimal data')
      const quotient = exact(problem).n
      const shift = power(data.divisor.scale)
      const shiftedDivisorOnly = problem.misconceptions?.find(({ tag }) => tag === 'shifted-divisor-only')
      const shiftedDividendOnly = problem.misconceptions?.find(({ tag }) => tag === 'shifted-dividend-only')
      expect(shiftedDivisorOnly?.value).toBe(quotient / shift)
      expect(shiftedDividendOnly?.value).toBe(quotient * shift)
      expect(shiftedDivisorOnly?.value).not.toBe(quotient)
      expect(shiftedDividendOnly?.value).not.toBe(shiftedDivisorOnly?.value)
    }
  })
})

describe('fraction-to-decimal', () => {
  it('converts a terminating fraction to its exact decimal, requiring decimal notation', () => {
    for (const problem of problems('fraction-to-decimal')) {
      if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'simplify') {
        throw new Error('expected fraction display')
      }
      const { numerator, denominator } = problem.display.fraction
      expect(exact(problem)).toEqual(rational(numerator * 100, denominator * 100))
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.requireDecimal).toBe(true)
      const asFraction = `${numerator}/${denominator}`
      expect(checkAnswer(problem.answer, asFraction).status).toBe('not-decimal')
    }
  })

  it('grows the denominator band with difficulty', () => {
    const denominatorsAt = (difficulty: Difficulty) =>
      problems('fraction-to-decimal')
        .filter((p) => p.difficulty === difficulty)
        .map((p) => (p.display.kind === 'math' && p.display.fraction?.operation === 'simplify' ? p.display.fraction.denominator : 0))
    const meanAt = (difficulty: Difficulty) => {
      const values = denominatorsAt(difficulty)
      return values.reduce((sum, v) => sum + v, 0) / values.length
    }
    expect(meanAt(5)).toBeGreaterThan(meanAt(1))
  })
})

describe('decimal-to-fraction', () => {
  it('converts a decimal to its exact fraction, requiring fraction notation', () => {
    for (const problem of problems('decimal-to-fraction')) {
      const data = decimalData(problem)
      if (data.operation !== 'display' || problem.display.kind !== 'inline') throw new Error('expected display data')
      expect(problem.display.text).toBe(text(data.value))
      expect(exact(problem)).toEqual(rational(data.value.coefficient, power(data.value.scale)))
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.requireFraction).toBe(true)
      expect(checkAnswer(problem.answer, text(data.value)).status).toBe('not-fraction')
    }
  })

  it('never draws a whole number, which would have no fractional part to name', () => {
    for (const problem of problems('decimal-to-fraction')) {
      const data = decimalData(problem)
      if (data.operation !== 'display') throw new Error('expected display data')
      expect(data.value.coefficient % power(data.value.scale)).not.toBe(0)
    }
  })
})

describe('money-problems', () => {
  it('carries an integer-cent price and quantity whose product matches the stated dollar answer', () => {
    for (const problem of problems('money-problems')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected story display')
      const [priceCents, quantity] = problem.display.operands
      expect(problem.display.operator).toBe('×')
      expect(exact(problem)).toEqual(rational(priceCents * quantity, 100))
      expect(problem.keypad).toEqual({ allowDecimal: true })
    }
  })

  it('predicts the price alone and the price times the wrong quantity, in dollars', () => {
    for (const problem of problems('money-problems')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected story display')
      const [priceCents] = problem.display.operands
      const answeredPart = problem.misconceptions?.find(({ tag }) => tag === 'answered-part')
      expect(answeredPart?.value).toBe(priceCents / 100)
    }
  })
})

it('records every field Unit 9 sets', () => {
  expect(unrenderedKeys(unit09)).toEqual([])
})
