import { describe, expect, it } from 'vitest'
import { diagnose, generateProblem } from '../lib/generator'
import type { Difficulty, PowerData, Problem } from '../lib/types'
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

it('records every field Unit 12 sets', () => {
  expect(unrenderedKeys(unit12)).toEqual([])
})
