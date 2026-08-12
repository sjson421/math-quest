import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { generateProblem, diagnose } from '../lib/generator'
import { rational } from '../lib/rational'
import type { DecimalData, DecimalValue, Difficulty, Problem } from '../lib/types'
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

it('records every field Unit 9 sets', () => {
  expect(unrenderedKeys(unit09)).toEqual([])
})
