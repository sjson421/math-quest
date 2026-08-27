import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { checkTeachingLine } from '../lib/content-rules'
import { diagnose, generateProblem } from '../lib/generator'
import { rational, toNumber } from '../lib/rational'
import type { Difficulty, PowerData, Problem } from '../lib/types'
import { manifestIndex } from './index'
import { sample, unrenderedKeys } from './recorded-output'
import { unit12 } from './unit-12-exponents-roots'

describe.each(unit12.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit12.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 12 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const powerData = (problem: Problem): PowerData => {
  if (problem.display.kind !== 'math' || !problem.display.power) {
    throw new Error('expected power data')
  }
  return problem.display.power
}

const meanAt = (id: string, difficulty: Difficulty, value: (data: PowerData) => number) => {
  const values = problems(id)
    .filter((problem) => problem.difficulty === difficulty)
    .map((problem) => value(powerData(problem)))
  return values.reduce((sum, entry) => sum + entry, 0) / values.length
}

const teachingLines = [
  ['exponent-meaning', 'An exponent tells how many times to use the base as a factor.'],
  ['evaluate-powers', 'A power uses its base as a factor as many times as the exponent says.'],
  ['perfect-squares', 'Squaring a number multiplies it by itself; finding a square root reverses that.'],
  ['estimate-roots', 'Compare nearby whole-number squares to find which two the root lies between.'],
  ['exponent-multiply', 'For matching bases multiplied together, add the exponents.'],
  ['exponent-divide', 'For matching bases divided, subtract the second exponent from the first.'],
  ['power-of-power', 'When a power is raised again, multiply the two exponents.'],
  ['zero-neg-exponents', 'A zero exponent gives 1; a negative exponent gives one over the positive power.'],
  ['scientific-notation', 'A positive exponent moves the decimal right; a negative exponent moves it left.'],
  ['pemdas-exponents', 'Evaluate parentheses first, then powers, multiplication or division, and addition or subtraction.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit12.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 12 skill: ${id}`)
  return found
}

describe('Stage E Unit 12 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    const generator = teachingSkill(id)
    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage E Unit 12 intro examples', () => {
  it('recomputes every fixed example from visible or semantic power data', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)
      const data = powerData(problem)
      if (problem.answer.kind !== 'exact') throw new Error(`${id}: expected an exact answer`)

      switch (data.operation) {
        case 'expand-power': {
          if (problem.display.kind !== 'math') throw new Error(`${id}: expected math display`)
          const visibleFactors = problem.display.label.split(' equals ')[0].split(' × ')
          expect(visibleFactors).toHaveLength(data.exponent)
          expect(problem.answer).toMatchObject({ n: visibleFactors.length, d: 1 })
          break
        }
        case 'evaluate-power':
          expect(problem.answer).toMatchObject({ n: data.base ** data.exponent, d: 1 })
          break
        case 'square':
          expect(problem.answer).toMatchObject({ n: data.value * data.value, d: 1 })
          break
        case 'square-root':
          expect(problem.answer).toMatchObject({ n: Math.sqrt(data.value), d: 1 })
          break
        case 'estimate-root': {
          const lower = Math.floor(Math.sqrt(data.value))
          expect(lower * lower).toBeLessThan(data.value)
          expect((lower + 1) * (lower + 1)).toBeGreaterThan(data.value)
          expect(problem.answer).toMatchObject({ n: lower, d: 1 })
          break
        }
        case 'power-multiply':
          expect(problem.answer).toMatchObject({ n: data.leftExponent + data.rightExponent, d: 1 })
          break
        case 'power-divide':
          expect(problem.answer).toMatchObject({ n: data.leftExponent - data.rightExponent, d: 1 })
          break
        case 'power-of-power':
          expect(problem.answer).toMatchObject({ n: data.innerExponent * data.outerExponent, d: 1 })
          break
        case 'zero-exponent':
          expect(problem.answer).toMatchObject({ n: 1, d: 1 })
          break
        case 'negative-exponent':
          expect({ n: problem.answer.n, d: problem.answer.d }).toEqual(rational(1, data.base ** data.magnitude))
          expect(problem.answer.requireFraction).toBe(true)
          break
        case 'scientific-notation': {
          const expected = data.exponent >= 0
            ? rational(data.coefficient * 10 ** data.exponent, 10 ** data.coefficientScale)
            : rational(data.coefficient, 10 ** (data.coefficientScale + Math.abs(data.exponent)))
          expect({ n: problem.answer.n, d: problem.answer.d }).toEqual(expected)
          break
        }
        case 'pemdas-power-first':
          expect(problem.answer).toMatchObject({
            n: data.addend + data.base ** data.exponent * data.factor,
            d: 1,
          })
          break
        case 'pemdas-group-power':
          expect({ n: problem.answer.n, d: problem.answer.d }).toEqual(
            rational((data.left + data.right) ** data.exponent, data.divisor),
          )
          break
        default: {
          const unhandled: never = data
          throw new Error(`Unhandled Unit 12 intro: ${JSON.stringify(unhandled)}`)
        }
      }
    }
  })
})

describe('exponent-meaning', () => {
  it('requires the factor count, not the evaluated product', () => {
    for (const problem of problems('exponent-meaning')) {
      const data = powerData(problem)
      if (data.operation !== 'expand-power') throw new Error('expected expand-power data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBe(data.exponent)
      expect(problem.answer.d).toBe(1)
    }
  })

  it('grows base and exponent with difficulty', () => {
    expect(meanAt('exponent-meaning', 5, (data) => data.operation === 'expand-power' ? data.base + data.exponent : 0))
      .toBeGreaterThan(meanAt('exponent-meaning', 1, (data) => data.operation === 'expand-power' ? data.base + data.exponent : 0))
  })

  it('is varied across the seeded sample', () => {
    expect(new Set(problems('exponent-meaning').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
  })
})

describe('evaluate-powers', () => {
  it('evaluates the power and predicts both distinct misconceptions', () => {
    for (const problem of problems('evaluate-powers')) {
      const data = powerData(problem)
      if (data.operation !== 'evaluate-power') throw new Error('expected evaluate-power data')
      const answer = data.base ** data.exponent
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBe(answer)
      expect(data.base).not.toBe(data.exponent)
      expect(diagnose(problem, String(data.base * data.exponent))?.tag).toBe('multiplied-base-by-exponent')
      expect(diagnose(problem, String(data.exponent ** data.base))?.tag).toBe('swapped-base-and-exponent')
      expect(problem.misconceptions).toHaveLength(2)
    }
  })

  it('grows base and exponent with difficulty', () => {
    expect(meanAt('evaluate-powers', 5, (data) => data.operation === 'evaluate-power' ? data.base + data.exponent : 0))
      .toBeGreaterThan(meanAt('evaluate-powers', 1, (data) => data.operation === 'evaluate-power' ? data.base + data.exponent : 0))
  })

  it('is varied across the seeded sample', () => {
    expect(new Set(problems('evaluate-powers').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
  })
})

describe('perfect-squares', () => {
  it('covers both squaring and root directions with exact answers to 144', () => {
    const directions = new Set<string>()
    for (const problem of problems('perfect-squares')) {
      const data = powerData(problem)
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      if (data.operation === 'square') {
        expect(problem.answer.n).toBe(data.value * data.value)
        directions.add('square')
      } else if (data.operation === 'square-root') {
        expect(data.value).toBeLessThanOrEqual(144)
        expect(Number.isInteger(Math.sqrt(data.value))).toBe(true)
        expect(problem.answer.n).toBe(Math.sqrt(data.value))
        directions.add('square-root')
      } else {
        throw new Error('expected square or square-root data')
      }
    }
    expect(directions).toEqual(new Set(['square', 'square-root']))
  })

  it('grows the source number with difficulty', () => {
    const sourceValue = (data: PowerData) =>
      data.operation === 'square' ? data.value : data.operation === 'square-root' ? Math.sqrt(data.value) : 0
    expect(meanAt('perfect-squares', 5, sourceValue)).toBeGreaterThan(meanAt('perfect-squares', 1, sourceValue))
  })
})

describe('estimate-roots', () => {
  it('bounds a non-perfect square and requires the lesser whole number', () => {
    for (const problem of problems('estimate-roots')) {
      const data = powerData(problem)
      if (data.operation !== 'estimate-root') throw new Error('expected estimate-root data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      const n = problem.answer.n
      expect(Number.isInteger(Math.sqrt(data.value))).toBe(false)
      expect(n * n).toBeLessThan(data.value)
      expect((n + 1) * (n + 1)).toBeGreaterThan(data.value)
    }
  })

  it('grows the radicand with difficulty', () => {
    expect(meanAt('estimate-roots', 5, (data) => data.operation === 'estimate-root' ? data.value : 0))
      .toBeGreaterThan(meanAt('estimate-roots', 1, (data) => data.operation === 'estimate-root' ? data.value : 0))
  })
})

describe('exponent-multiply', () => {
  it('adds the exponents and keeps the base fixed', () => {
    for (const problem of problems('exponent-multiply')) {
      const data = powerData(problem)
      if (data.operation !== 'power-multiply') throw new Error('expected power-multiply data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBe(data.leftExponent + data.rightExponent)
      expect(diagnose(problem, String(data.leftExponent * data.rightExponent))?.tag).toBe('multiplied-exponents')
    }
  })

  it('grows both exponents with difficulty', () => {
    expect(meanAt('exponent-multiply', 5, (data) => data.operation === 'power-multiply' ? data.leftExponent + data.rightExponent : 0))
      .toBeGreaterThan(meanAt('exponent-multiply', 1, (data) => data.operation === 'power-multiply' ? data.leftExponent + data.rightExponent : 0))
  })
})

describe('exponent-divide', () => {
  it('subtracts the exponents, keeps a positive result, and keeps the base fixed', () => {
    for (const problem of problems('exponent-divide')) {
      const data = powerData(problem)
      if (data.operation !== 'power-divide') throw new Error('expected power-divide data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(data.leftExponent).toBeGreaterThan(data.rightExponent)
      expect(problem.answer.n).toBe(data.leftExponent - data.rightExponent)
      expect(problem.answer.n).toBeGreaterThan(0)
      expect(diagnose(problem, String(data.leftExponent + data.rightExponent))?.tag).toBe('added-exponents')
    }
  })

  it('grows both exponents with difficulty', () => {
    expect(meanAt('exponent-divide', 5, (data) => data.operation === 'power-divide' ? data.leftExponent + data.rightExponent : 0))
      .toBeGreaterThan(meanAt('exponent-divide', 1, (data) => data.operation === 'power-divide' ? data.leftExponent + data.rightExponent : 0))
  })
})

describe('power-of-power', () => {
  it('multiplies nested exponents and retains both wall diagnoses', () => {
    for (const problem of problems('power-of-power')) {
      const data = powerData(problem)
      if (data.operation !== 'power-of-power') throw new Error('expected power-of-power data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      const answer = data.innerExponent * data.outerExponent

      expect(problem.answer).toMatchObject({ n: answer, d: 1 })
      expect(diagnose(problem, String(data.innerExponent + data.outerExponent))?.tag)
        .toBe('added-exponents')
      expect(diagnose(problem, String(data.innerExponent))?.tag)
        .toBe('ignored-outer-exponent')
      expect(problem.misconceptions).toHaveLength(2)
      expect(new Set(problem.misconceptions?.map((entry) => entry.value)).size).toBe(2)
      expect(problem.display.kind === 'math' && problem.display.notation.kind).toBe('row')
    }
  })

  it('varies and grows its operands with difficulty', () => {
    expect(new Set(problems('power-of-power').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
    const magnitude = (data: PowerData) => data.operation === 'power-of-power'
      ? data.base + data.innerExponent + data.outerExponent
      : 0
    expect(meanAt('power-of-power', 5, magnitude)).toBeGreaterThan(meanAt('power-of-power', 1, magnitude))
  })
})

describe('zero-neg-exponents', () => {
  it('covers zero and reciprocal rules with every prediction enterable', () => {
    const families = new Set<string>()

    for (const problem of problems('zero-neg-exponents')) {
      const data = powerData(problem)
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      families.add(data.operation)

      if (data.operation === 'zero-exponent') {
        expect(problem.answer).toMatchObject({ n: 1, d: 1 })
        expect(diagnose(problem, '0')?.tag).toBe('answered-zero')
        expect(problem.keypad).toBeUndefined()
      } else if (data.operation === 'negative-exponent') {
        const denominator = data.base ** data.magnitude
        expect(problem.answer).toMatchObject({ n: 1, d: denominator, requireFraction: true })
        expect(problem.keypad).toMatchObject({ allowFraction: true, allowNegative: true })
        expect(diagnose(problem, String(denominator))?.tag).toBe('kept-positive-exponent')
        expect(diagnose(problem, String(-denominator))?.tag).toBe('negated-positive-power')
        expect(checkAnswer(problem.answer, `1/${denominator}`)).toEqual({ status: 'correct' })
      } else {
        throw new Error('expected zero or negative exponent data')
      }
    }

    expect(families).toEqual(new Set(['zero-exponent', 'negative-exponent']))
  })

  it('varies and grows its source values with difficulty', () => {
    expect(new Set(problems('zero-neg-exponents').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
    const magnitude = (data: PowerData) => data.operation === 'zero-exponent'
      ? data.base
      : data.operation === 'negative-exponent'
        ? data.base + data.magnitude
        : 0
    expect(meanAt('zero-neg-exponents', 5, magnitude))
      .toBeGreaterThan(meanAt('zero-neg-exponents', 1, magnitude))
  })
})

describe('scientific-notation', () => {
  const scaled = (coefficient: number, scale: 0 | 1, exponent: number) =>
    exponent >= 0
      ? rational(coefficient * 10 ** exponent, 10 ** scale)
      : rational(coefficient, 10 ** (scale + Math.abs(exponent)))

  it('places the decimal exactly and diagnoses both wrong directions', () => {
    const signs = new Set<number>()

    for (const problem of problems('scientific-notation')) {
      const data = powerData(problem)
      if (data.operation !== 'scientific-notation') throw new Error('expected scientific-notation data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      const expected = scaled(data.coefficient, data.coefficientScale, data.exponent)
      const onePlace = scaled(data.coefficient, data.coefficientScale, Math.sign(data.exponent))
      const reversed = scaled(data.coefficient, data.coefficientScale, -data.exponent)

      signs.add(Math.sign(data.exponent))
      expect(data.coefficient / 10 ** data.coefficientScale).toBeGreaterThanOrEqual(1)
      expect(data.coefficient / 10 ** data.coefficientScale).toBeLessThan(10)
      expect(problem.answer).toMatchObject(expected)
      expect(problem.answer.requireDecimal).toBe(data.exponent < 0 ? true : false)
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(diagnose(problem, String(toNumber(onePlace)))?.tag).toBe('moved-one-place')
      expect(diagnose(problem, String(toNumber(reversed)))?.tag).toBe('reversed-exponent-direction')
    }

    expect(signs).toEqual(new Set([-1, 1]))
  })

  it('varies and grows coefficient/exponent magnitude with difficulty', () => {
    expect(new Set(problems('scientific-notation').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(40)
    const magnitude = (data: PowerData) => data.operation === 'scientific-notation'
      ? data.coefficient / 10 ** data.coefficientScale + Math.abs(data.exponent)
      : 0
    expect(meanAt('scientific-notation', 5, magnitude))
      .toBeGreaterThan(meanAt('scientific-notation', 1, magnitude))
  })
})

describe('pemdas-exponents', () => {
  it('covers both structured families with exact whole-number work', () => {
    const families = new Set<string>()

    for (const problem of problems('pemdas-exponents')) {
      const data = powerData(problem)
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      families.add(data.operation)

      if (data.operation === 'pemdas-power-first') {
        const powerValue = data.base ** data.exponent
        expect(problem.answer).toMatchObject({ n: data.addend + powerValue * data.factor, d: 1 })
        expect(diagnose(problem, String(data.addend + data.base * data.exponent * data.factor))?.tag)
          .toBe('multiplied-base-by-exponent')
        expect(diagnose(problem, String((data.addend + data.base) ** data.exponent * data.factor))?.tag)
          .toBe('added-before-exponent')
      } else if (data.operation === 'pemdas-group-power') {
        const group = data.left + data.right
        expect(group ** data.exponent % data.divisor).toBe(0)
        expect(data.right ** data.exponent % data.divisor).toBe(0)
        expect(problem.answer).toMatchObject({ n: group ** data.exponent / data.divisor, d: 1 })
        expect(diagnose(problem, String(group * data.exponent / data.divisor))?.tag)
          .toBe('multiplied-base-by-exponent')
        expect(diagnose(problem, String(data.left + data.right ** data.exponent / data.divisor))?.tag)
          .toBe('ignored-parentheses')
        expect(problem.solution.map((step) => step.detail)).toEqual([
          `${data.left} + ${data.right} = ${group}`,
          `${group}^${data.exponent} = ${group ** data.exponent}`,
          `${group ** data.exponent} ÷ ${data.divisor} = ${group ** data.exponent / data.divisor}`,
        ])
      } else {
        throw new Error('expected a PEMDAS exponent family')
      }

      expect(problem.solution.every((step) => !step.detail?.includes('/'))).toBe(true)
    }

    expect(families).toEqual(new Set(['pemdas-power-first', 'pemdas-group-power']))
  })

  it('varies and grows its operands with difficulty', () => {
    expect(new Set(problems('pemdas-exponents').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(40)
    const magnitude = (data: PowerData) => data.operation === 'pemdas-power-first'
      ? data.addend + data.base + data.exponent + data.factor
      : data.operation === 'pemdas-group-power'
        ? data.left + data.right + data.exponent
        : 0
    expect(meanAt('pemdas-exponents', 5, magnitude))
      .toBeGreaterThan(meanAt('pemdas-exponents', 1, magnitude))
  })
})

it('records every field Unit 12 sets', () => {
  expect(unrenderedKeys(unit12)).toEqual([])
})
