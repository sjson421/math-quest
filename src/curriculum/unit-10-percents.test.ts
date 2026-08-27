import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem, diagnose } from '../lib/generator'
import { rational } from '../lib/rational'
import type { Difficulty, PercentData, Problem } from '../lib/types'
import { manifestIndex } from './index'
import { sample, unrenderedKeys } from './recorded-output'
import { unit10 } from './unit-10-percents'

describe.each(unit10.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit10.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 10 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const exact = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
  return rational(problem.answer.n, problem.answer.d)
}

const inlineText = (problem: Problem) => {
  if (problem.display.kind !== 'inline') throw new Error('expected inline display')
  return problem.display.text
}

const storyPercent = (problem: Problem): PercentData => {
  if (problem.display.kind !== 'story' || !problem.display.percent) {
    throw new Error('expected percent story data')
  }
  return problem.display.percent
}

const storyText = (problem: Problem) => {
  if (problem.display.kind !== 'story') throw new Error('expected story display')
  return problem.display.text
}

const meanAt = (id: string, difficulty: Difficulty, value: (data: PercentData) => number) => {
  const values = problems(id)
    .filter((problem) => problem.difficulty === difficulty)
    .map((problem) => value(storyPercent(problem)))
  return values.reduce((sum, entry) => sum + entry, 0) / values.length
}

const teachingLines = [
  ['percent-meaning', 'A percent tells how many parts out of 100.'],
  ['percent-to-decimal', 'Divide a percent by 100, moving the decimal point two places left.'],
  ['decimal-to-percent', 'Multiply a decimal by 100 to write its percent.'],
  ['percent-to-fraction', 'Write the percent over 100, then reduce the fraction.'],
  ['percent-of', 'Multiply the quantity by the percent written as a decimal.'],
  ['find-the-percent', 'Divide the part by the whole, then multiply by 100.'],
  ['find-the-whole', 'Divide the part by the percent written as a decimal.'],
  ['percent-change', 'Divide the change by the original amount, then multiply by 100.'],
  ['discount-tax-tip', 'Find the percent amount, then add or subtract it from the price.'],
  ['simple-interest', 'Use I = Prt, writing the percent rate as a decimal.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit10.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 10 skill: ${id}`)
  return found
}

describe('Stage D Unit 10 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage D Unit 10 intro examples', () => {
  it('recomputes every fixed example from visible percent relationships', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)

      if (id === 'percent-meaning' || id === 'percent-to-decimal' || id === 'percent-to-fraction') {
        const match = /^(\d+)%$|^(\d+) out of 100$/.exec(inlineText(problem))
        const percent = Number(match?.[1] ?? match?.[2])
        expect(percent).toBeGreaterThan(0)
        if (id === 'percent-meaning') expect(exact(problem)).toEqual(rational(percent, 1))
        else expect(exact(problem)).toEqual(rational(percent, 100))
        if (id === 'percent-to-fraction') expect(problem.answer).toMatchObject({ requireSimplified: true })
        continue
      }

      if (id === 'decimal-to-percent') {
        if (problem.display.kind !== 'inline' || problem.display.decimal?.operation !== 'to-percent') {
          throw new Error('expected decimal-to-percent data')
        }
        const { value } = problem.display.decimal
        expect(exact(problem)).toEqual(rational(value.coefficient * 100, 10 ** value.scale))
        continue
      }

      if (id === 'percent-of') {
        const match = /^(\d+)% of (\d+)$/.exec(inlineText(problem))
        if (!match) throw new Error('expected percent-of display')
        const [, percent, quantity] = match.map(Number)
        expect(exact(problem)).toEqual(rational(percent * quantity, 100))
        continue
      }

      const data = storyPercent(problem)
      switch (data.operation) {
        case 'find-percent':
          expect(exact(problem)).toEqual(rational(data.part * 100, data.whole))
          break
        case 'find-whole':
          expect(exact(problem)).toEqual(rational(data.part * 100, data.percent))
          break
        case 'percent-change':
          expect(exact(problem)).toEqual(
            rational(Math.abs(data.current - data.original) * 100, data.original),
          )
          break
        case 'discount':
        case 'tax':
        case 'tip': {
          const adjustment = data.baseCents * data.percent / 100
          const final = data.operation === 'discount'
            ? data.baseCents - adjustment
            : data.baseCents + adjustment
          expect(exact(problem)).toEqual(rational(final, 100))
          break
        }
        case 'simple-interest':
          expect(exact(problem)).toEqual(
            rational(data.principalCents * data.percent * data.years, 100 * 100),
          )
          break
        default: {
          const unhandled: never = data
          throw new Error(`Unhandled Unit 10 intro: ${JSON.stringify(unhandled)}`)
        }
      }
    }
  })
})

const expectDiagnosable = (problem: Problem, tag: string, expectedValue: number) => {
  const misconception = problem.misconceptions?.find((entry) => entry.tag === tag)
  expect(misconception).toBeDefined()
  if (!misconception) throw new Error(`expected ${tag} misconception`)
  expect(misconception.value).toBe(expectedValue)
  const keypadEntry = String(misconception.value)
  expect(keypadEntry).toMatch(/^\d+(?:\.\d+)?$/)
  expect(keypadEntry.length).toBeLessThanOrEqual(10)
  expect(diagnose(problem, keypadEntry)?.tag).toBe(tag)
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

describe('find-the-percent', () => {
  it('divides the part by the whole and preserves both wall diagnoses', () => {
    for (const problem of problems('find-the-percent')) {
      const data = storyPercent(problem)
      if (data.operation !== 'find-percent') throw new Error('expected find-percent data')
      const answer = rational(data.part * 100, data.whole)

      expect(data.part).toBeGreaterThan(0)
      expect(data.part).toBeLessThan(data.whole)
      expect(answer.d).toBe(1)
      expect(exact(problem)).toEqual(answer)
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(new Set(problem.misconceptions?.map(({ value }) => value)).size).toBe(2)
      expectDiagnosable(problem, 'left-as-ratio', data.part / data.whole)
      expectDiagnosable(problem, 'divided-whole-by-part', data.whole / data.part)
    }
  })

  it('varies its exact relationships and grows the whole with difficulty', () => {
    expect(new Set(problems('find-the-percent').map(storyText)).size).toBeGreaterThan(100)
    expect(meanAt('find-the-percent', 5, (data) => data.operation === 'find-percent' ? data.whole : 0))
      .toBeGreaterThan(meanAt('find-the-percent', 1, (data) => data.operation === 'find-percent' ? data.whole : 0))
  })
})

describe('find-the-whole', () => {
  it('reverses percent-of and preserves both wall diagnoses', () => {
    for (const problem of problems('find-the-whole')) {
      const data = storyPercent(problem)
      if (data.operation !== 'find-whole') throw new Error('expected find-whole data')
      const answer = rational(data.part * 100, data.percent)

      expect(data.part).toBeGreaterThan(0)
      expect(data.percent).toBeGreaterThan(0)
      expect(data.percent).toBeLessThan(100)
      expect(answer.d).toBe(1)
      expect(exact(problem)).toEqual(answer)
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(new Set(problem.misconceptions?.map(({ value }) => value)).size).toBe(2)
      expectDiagnosable(problem, 'applied-percent-again', (data.part * data.percent) / 100)
      expectDiagnosable(problem, 'used-whole-percent', data.part / data.percent)
    }
  })

  it('varies its exact relationships and grows the part with difficulty', () => {
    expect(new Set(problems('find-the-whole').map(storyText)).size).toBeGreaterThan(100)
    expect(meanAt('find-the-whole', 5, (data) => data.operation === 'find-whole' ? data.part : 0))
      .toBeGreaterThan(meanAt('find-the-whole', 1, (data) => data.operation === 'find-whole' ? data.part : 0))
  })
})

describe('percent-change', () => {
  it('uses the original value as the base for increases and decreases', () => {
    const directions = new Set<string>()

    for (const problem of problems('percent-change')) {
      const data = storyPercent(problem)
      if (data.operation !== 'percent-change') throw new Error('expected percent-change data')
      const change = Math.abs(data.current - data.original)
      const expected = rational(change * 100, data.original)

      directions.add(data.current > data.original ? 'increase' : 'decrease')
      expect(data.original).toBeGreaterThan(0)
      expect(data.current).toBeGreaterThan(0)
      expect(expected.d).toBe(1)
      expect(exact(problem)).toEqual(expected)
      expectDiagnosable(problem, 'used-new-value-as-base', (change * 100) / data.current)
    }

    expect(directions).toEqual(new Set(['increase', 'decrease']))
  })

  it('varies its relationships and grows the original value with difficulty', () => {
    expect(new Set(problems('percent-change').map(storyText)).size).toBeGreaterThan(100)
    expect(meanAt('percent-change', 5, (data) => data.operation === 'percent-change' ? data.original : 0))
      .toBeGreaterThan(meanAt('percent-change', 1, (data) => data.operation === 'percent-change' ? data.original : 0))
  })
})

describe('discount-tax-tip', () => {
  it('applies all three contexts to exact integer-cent final totals', () => {
    const contexts = new Set<string>()

    for (const problem of problems('discount-tax-tip')) {
      const data = storyPercent(problem)
      if (data.operation !== 'discount' && data.operation !== 'tax' && data.operation !== 'tip') {
        throw new Error('expected applied percent data')
      }
      const adjustmentCents = (data.baseCents * data.percent) / 100
      const subtract = data.operation === 'discount'
      const finalCents = subtract ? data.baseCents - adjustmentCents : data.baseCents + adjustmentCents
      const oppositeCents = subtract ? data.baseCents + adjustmentCents : data.baseCents - adjustmentCents
      const adjustment = problem.misconceptions?.find(({ tag }) => tag === 'answered-adjustment-only')
      const opposite = problem.misconceptions?.find(({ tag }) => tag === 'used-opposite-direction')

      contexts.add(data.operation)
      expect(Number.isInteger(adjustmentCents)).toBe(true)
      expect(exact(problem)).toEqual(rational(finalCents, 100))
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(adjustment?.value).toBe(adjustmentCents / 100)
      expect(opposite?.value).toBe(oppositeCents / 100)
    }

    expect(contexts).toEqual(new Set(['discount', 'tax', 'tip']))
  })

  it('varies its applications and grows the base amount with difficulty', () => {
    expect(new Set(problems('discount-tax-tip').map(storyText)).size).toBeGreaterThan(100)
    expect(meanAt('discount-tax-tip', 5, (data) =>
      data.operation === 'discount' || data.operation === 'tax' || data.operation === 'tip' ? data.baseCents : 0,
    )).toBeGreaterThan(meanAt('discount-tax-tip', 1, (data) =>
      data.operation === 'discount' || data.operation === 'tax' || data.operation === 'tip' ? data.baseCents : 0,
    ))
  })
})

describe('simple-interest', () => {
  it('uses the displayed formula and exact principal, rate, and time data', () => {
    for (const problem of problems('simple-interest')) {
      const data = storyPercent(problem)
      if (data.operation !== 'simple-interest') throw new Error('expected simple-interest data')
      const interestCents = (data.principalCents * data.percent * data.years) / 100
      const wholeRate = problem.misconceptions?.find(({ tag }) => tag === 'used-whole-percent-rate')
      const balance = problem.misconceptions?.find(({ tag }) => tag === 'answered-final-balance')

      expect(storyText(problem)).toContain('I = Prt.')
      expect(data.principalCents % 100).toBe(0)
      expect(data.years).toBeGreaterThanOrEqual(1)
      expect(data.years).toBeLessThanOrEqual(problem.difficulty + 1)
      expect(Number.isInteger(interestCents)).toBe(true)
      expect(exact(problem)).toEqual(rational(interestCents, 100))
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(wholeRate?.value).toBe(interestCents)
      expect(balance?.value).toBe((data.principalCents + interestCents) / 100)
    }
  })

  it('varies its terms and grows the principal with difficulty', () => {
    expect(new Set(problems('simple-interest').map(storyText)).size).toBeGreaterThan(100)
    expect(meanAt('simple-interest', 5, (data) => data.operation === 'simple-interest' ? data.principalCents : 0))
      .toBeGreaterThan(meanAt('simple-interest', 1, (data) => data.operation === 'simple-interest' ? data.principalCents : 0))
  })
})

it('records every field Unit 10 sets', () => {
  expect(unrenderedKeys(unit10)).toEqual([])
})
