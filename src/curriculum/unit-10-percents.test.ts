import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { generateProblem, diagnose } from '../lib/generator'
import { rational } from '../lib/rational'
import type { Difficulty, Problem } from '../lib/types'
import { sample, unrenderedKeys } from './recorded-output'
import { unit10 } from './unit-10-percents'

describe.each(unit10.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problems = (id: string) => {
  const skill = unit10.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 10 skill ${id}`)
  return difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
}

const exact = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
  return rational(problem.answer.n, problem.answer.d)
}

const inlineText = (problem: Problem) => {
  if (problem.display.kind !== 'inline') throw new Error('expected inline display')
  return problem.display.text
}

describe('percent-meaning', () => {
  it('answers a parts-out-of-100 statement or a percent with the same count', () => {
    for (const problem of problems('percent-meaning')) {
      const text = inlineText(problem)
      const percentMatch = /^(\d+)%$/.exec(text)
      const outOfMatch = /^(\d+) out of 100$/.exec(text)
      const count = Number((percentMatch ?? outOfMatch)?.[1])
      expect(percentMatch ?? outOfMatch).not.toBeNull()
      expect(exact(problem)).toEqual(rational(count, 1))
    }
  })

  it('presents both directions of the statement', () => {
    const all = problems('percent-meaning')
    expect(all.some((p) => /%$/.test(inlineText(p)))).toBe(true)
    expect(all.some((p) => /out of 100$/.test(inlineText(p)))).toBe(true)
  })
})

describe('percent-to-decimal', () => {
  it('divides the displayed percent by 100 exactly', () => {
    for (const problem of problems('percent-to-decimal')) {
      const text = inlineText(problem)
      const percent = Number(/^(\d+)%$/.exec(text)?.[1])
      expect(exact(problem)).toEqual(rational(percent, 100))
      expect(problem.keypad).toEqual({ allowDecimal: true })
    }
  })

  it('grows the percent band with difficulty', () => {
    const percentAt = (difficulty: Difficulty) =>
      problems('percent-to-decimal')
        .filter((p) => p.difficulty === difficulty)
        .map((p) => Number(/^(\d+)%$/.exec(inlineText(p))?.[1]))
    const meanAt = (difficulty: Difficulty) => {
      const values = percentAt(difficulty)
      return values.reduce((sum, v) => sum + v, 0) / values.length
    }
    expect(meanAt(5)).toBeGreaterThan(meanAt(1))
  })
})

describe('decimal-to-percent', () => {
  it('multiplies the displayed decimal by 100 exactly, inverse of percent-to-decimal', () => {
    for (const problem of problems('decimal-to-percent')) {
      const text = inlineText(problem)
      const match = /^0\.(\d{2})$/.exec(text)
      if (!match) throw new Error(`expected a two-place decimal, got "${text}"`)
      const percent = Number(match[1])
      expect(exact(problem)).toEqual(rational(percent, 1))
    }
  })

  it('predicts both wrong shifts, always distinct from the answer and each other', () => {
    for (const problem of problems('decimal-to-percent')) {
      const percent = exact(problem).n
      const unmoved = problem.misconceptions?.find(({ tag }) => tag === 'unmoved-point')
      const oneShift = problem.misconceptions?.find(({ tag }) => tag === 'shifted-one-place')
      expect(unmoved?.value).toBe(percent / 100)
      expect(oneShift?.value).toBe(percent / 10)
      expect(unmoved?.value).not.toBe(percent)
      expect(oneShift?.value).not.toBe(percent)
      expect(unmoved?.value).not.toBe(oneShift?.value)
    }
  })

  it('is the inverse of percent-to-decimal for the same percent', () => {
    const problem = generateProblem(unit10.find((s) => s.id === 'decimal-to-percent')!, 42, 3)
    const text = inlineText(problem)
    const percent = Number(/^0\.(\d{2})$/.exec(text)?.[1])
    expect(checkAnswer(problem.answer, String(percent)).status).toBe('correct')
  })
})

describe('percent-to-fraction', () => {
  it('reduces the percent over 100 to lowest terms and requires simplified form', () => {
    for (const problem of problems('percent-to-fraction')) {
      const text = inlineText(problem)
      const percent = Number(/^(\d+)%$/.exec(text)?.[1])
      const reduced = rational(percent, 100)
      expect(exact(problem)).toEqual(reduced)
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.requireSimplified).toBe(true)
      const alreadyReduced = reduced.d === 100
      expect(checkAnswer(problem.answer, `${percent}/100`).status).toBe(alreadyReduced ? 'correct' : 'not-simplified')
    }
  })

  it('diagnoses an unreduced entry when the percent is not already in lowest terms', () => {
    const reducible = problems('percent-to-fraction').filter((p) => {
      const percent = Number(/^(\d+)%$/.exec(inlineText(p))?.[1])
      const reduced = rational(percent, 100)
      return reduced.d !== 100
    })
    expect(reducible.length).toBeGreaterThan(0)
    for (const problem of reducible) {
      const percent = Number(/^(\d+)%$/.exec(inlineText(problem))?.[1])
      expect(diagnose(problem, `${percent}/100`)).toBeUndefined()
      expect(checkAnswer(problem.answer, `${percent}/100`).status).toBe('not-simplified')
    }
  })
})

describe('percent-of', () => {
  it('computes an exact whole-number part from the displayed percent and quantity', () => {
    for (const problem of problems('percent-of')) {
      const text = inlineText(problem)
      const match = /^(\d+)% of (\d+)$/.exec(text)
      if (!match) throw new Error(`expected a "n% of m" sentence, got "${text}"`)
      const [, percent, quantity] = match.map(Number)
      expect((percent * quantity) % 100).toBe(0)
      expect(exact(problem)).toEqual(rational((percent * quantity) / 100, 1))
    }
  })

  it('grows the quantity with difficulty', () => {
    const quantityAt = (difficulty: Difficulty) =>
      problems('percent-of')
        .filter((p) => p.difficulty === difficulty)
        .map((p) => Number(/of (\d+)$/.exec(inlineText(p))?.[1]))
    const meanAt = (difficulty: Difficulty) => {
      const values = quantityAt(difficulty)
      return values.reduce((sum, v) => sum + v, 0) / values.length
    }
    expect(meanAt(5)).toBeGreaterThan(meanAt(1))
  })
})

it('records every field Unit 10 sets', () => {
  expect(unrenderedKeys(unit10)).toEqual([])
})
