import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import { makeRng } from '../lib/rng'
import type { Difficulty, Display, Problem } from '../lib/types'
import { expandedForm, numberWords, unit00 } from './unit-00-numbers'

const SEEDS = [1, 12345, 67890, 424242, 987654321]
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

type InlineDisplay = Extract<Display, { kind: 'inline' }>

const inline = (problem: Problem): InlineDisplay | undefined =>
  problem.display.kind === 'inline' ? problem.display : undefined

/**
 * The carried payload, narrowed by shape rather than by operation.
 *
 * The display data names its fields per operation, so "the number on screen" is
 * asked for once here instead of at two dozen call sites. Narrowing on the field
 * rather than the operation keeps these independent of the operation assertions
 * beside them — a skill carrying the wrong operation still fails those, loudly,
 * instead of quietly returning nothing here.
 */
const carried = (display?: InlineDisplay): number | undefined => {
  const data = display?.wholeNumber
  return data && 'value' in data ? data.value : undefined
}

const comparePair = (display?: InlineDisplay): number[] => {
  const data = display?.wholeNumber
  return data && 'left' in data ? [data.left, data.right] : []
}

const orderedValues = (display?: InlineDisplay): number[] => {
  const data = display?.wholeNumber
  return data && 'values' in data ? data.values : []
}

const skill = (id: string) => {
  const found = unit00.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 0 skill: ${id}`)
  return found
}

describe('numberWords', () => {
  it.each([
    [0, 'zero'],
    [19, 'nineteen'],
    [20, 'twenty'],
    [21, 'twenty-one'],
    [105, 'one hundred five'],
    [120, 'one hundred twenty'],
    [987, 'nine hundred eighty-seven'],
  ])('writes %i as %s', (value, words) => {
    expect(numberWords(value)).toBe(words)
  })
})

describe('read-numbers', () => {
  it('shows words, accepts digits, and derives both diagnoses from the value', () => {
    const problem = generateProblem(skill('read-numbers'), 12345, 3)
    const display = problem.display.kind === 'inline' ? problem.display : undefined
    const value = carried(display)

    expect(value).toBeTypeOf('number')
    expect(display?.wholeNumber?.operation).toBe('read')
    expect(display?.text).toBe(numberWords(value!))
    expect(problem.answer).toEqual({ kind: 'exact', n: value, d: 1 })
    expect(problem.inputMode).toBe('keypad')
    expect(problem.misconceptions?.map((m) => m.tag)).toEqual([
      'swapped-last-digits',
      'dropped-leading-place',
    ])
  })

  it('keeps generated values in 10–999 with distinct predictions', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const problem = skill('read-numbers').generate(makeRng(seed), 5)
      const display = problem.display.kind === 'inline' ? problem.display : undefined
      const value = carried(display)
      const predicted = problem.misconceptions?.map((m) => m.value) ?? []

      expect(value).toBeGreaterThanOrEqual(10)
      expect(value).toBeLessThanOrEqual(999)
      expect(new Set(predicted).size).toBe(predicted.length)
      expect(predicted).not.toContain(value)
    }
  })
})

describe('place-value-tens', () => {
  it('answers with the tens digit across the difficulty range', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const problem = generateProblem(skill('place-value-tens'), seed, difficulty)
        const display = problem.display.kind === 'inline' ? problem.display : undefined
        const value = carried(display) ?? -1

        expect(display?.text).toBe(String(value))
        expect(display?.wholeNumber?.operation).toBe('tens-digit')
        expect(problem.answer).toEqual({
          kind: 'exact',
          n: Math.floor(value / 10) % 10,
          d: 1,
        })
      }
    }
  })

  it('uses the hundreds digit when the tens digit is zero', () => {
    const problem = Array.from({ length: 5_000 }, (_, seed) =>
      generateProblem(skill('place-value-tens'), seed, 5),
    ).find((candidate) => {
      const display = candidate.display.kind === 'inline' ? candidate.display : undefined
      const value = carried(display) ?? -1
      return Math.floor(value / 10) % 10 === 0
    })
    const display = problem?.display.kind === 'inline' ? problem.display : undefined
    const value = carried(display) ?? -1

    expect(problem).toBeDefined()
    expect(problem?.misconceptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tag: 'ones-digit', value: value % 10 }),
        expect.objectContaining({
          tag: 'hundreds-digit',
          value: Math.floor(value / 100),
        }),
      ]),
    )
  })

  it('uses singular wording for one ten', () => {
    const problem = generateProblem(skill('place-value-tens'), 1, 1)

    expect(problem.misconceptions?.find((m) => m.tag === 'whole-tens')?.nudge).toContain(
      '1 ten as a value',
    )
  })
})

describe('place-value-hundreds', () => {
  it('answers with the hundreds digit across the difficulty range', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const problem = generateProblem(skill('place-value-hundreds'), seed, difficulty)
        const display = problem.display.kind === 'inline' ? problem.display : undefined
        const value = carried(display) ?? -1

        expect(display?.wholeNumber?.operation).toBe('hundreds-digit')
        expect(problem.answer).toEqual({
          kind: 'exact',
          n: Math.floor(value / 100),
          d: 1,
        })
        expect(problem.misconceptions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              tag: 'tens-digit',
              value: Math.floor(value / 10) % 10,
            }),
            expect.objectContaining({
              tag: 'whole-hundreds',
              value: Math.floor(value / 100) * 100,
            }),
          ]),
        )
      }
    }
  })

  it('includes values whose lower places contain zeroes', () => {
    const values = Array.from({ length: 2_000 }, (_, seed) => {
      const problem = generateProblem(skill('place-value-hundreds'), seed, 5)
      return carried(inline(problem))
    })

    expect(values.some((value) => value !== undefined && value % 10 === 0)).toBe(true)
    expect(values.some((value) => value !== undefined && Math.floor(value / 10) % 10 === 0)).toBe(true)
  })

  it('uses singular wording for one hundred', () => {
    const problem = Array.from({ length: 1_000 }, (_, seed) =>
      generateProblem(skill('place-value-hundreds'), seed, 1),
    ).find((candidate) => candidate.answer.kind === 'exact' && candidate.answer.n === 1)

    expect(problem).toBeDefined()
    expect(problem?.misconceptions?.find((m) => m.tag === 'whole-hundreds')?.nudge).toContain(
      '1 hundred as a value',
    )
  })
})

describe('expanded-form', () => {
  it.each([
    [105, '100 + 5'],
    [120, '100 + 20'],
    [307, '300 + 7'],
    [987, '900 + 80 + 7'],
  ])('writes %i as %s', (value, expected) => {
    expect(expandedForm(value)).toBe(expected)
  })

  it('derives the expression, answer, and diagnoses from each value', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const problem = generateProblem(skill('expanded-form'), seed, difficulty)
        const display = problem.display.kind === 'inline' ? problem.display : undefined
        const value = carried(display) ?? -1
        const hundreds = Math.floor(value / 100)
        const tens = Math.floor(value / 10) % 10
        const ones = value % 10

        expect(display?.text).toBe(expandedForm(value))
        expect(display?.wholeNumber?.operation).toBe('expanded-form')
        expect(problem.answer).toEqual({ kind: 'exact', n: value, d: 1 })
        expect(problem.misconceptions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tag: 'plain-digit-sum', value: hundreds + tens + ones }),
            expect.objectContaining({
              tag: 'omitted-place',
              value: tens === 0 ? ones : hundreds * 100 + ones,
            }),
          ]),
        )
      }
    }
  })

  it('includes values with zero ones and zero tens', () => {
    const values = Array.from({ length: 2_000 }, (_, seed) => {
      const problem = generateProblem(skill('expanded-form'), seed, 5)
      return carried(inline(problem))
    })

    expect(values.some((value) => value !== undefined && value % 10 === 0)).toBe(true)
    expect(values.some((value) => value !== undefined && Math.floor(value / 10) % 10 === 0)).toBe(true)
  })
})

describe('compare-numbers', () => {
  it('covers every relation with shuffled unique choices', () => {
    const relations = new Set<number>()
    const orders = new Set<string>()

    for (let seed = 1; seed <= 500; seed += 1) {
      const problem = generateProblem(skill('compare-numbers'), seed, 5)
      const display = problem.display.kind === 'inline' ? problem.display : undefined
      const [left, right] = comparePair(display)
      const relation = left < right ? -1 : left > right ? 1 : 0
      const choiceIds = problem.choices?.map((choice) => choice.id) ?? []

      relations.add(relation)
      orders.add(choiceIds.join(','))
      expect(display?.text).toBe(`${left} ? ${right}`)
      expect(display?.wholeNumber?.operation).toBe('compare')
      expect(problem.inputMode).toBe('choice')
      expect(problem.answer).toEqual({ kind: 'choice', id: String(relation) })
      expect(new Set(choiceIds).size).toBe(3)
      expect(new Set(problem.choices?.map((choice) => choice.label))).toEqual(
        new Set(['<', '=', '>']),
      )
      expect(problem.misconceptions?.map((m) => m.value)).not.toContain(relation)
    }

    expect(relations).toEqual(new Set([-1, 0, 1]))
    expect(orders.size).toBeGreaterThan(1)
  })

  it('derives reversal and equality diagnoses from unequal pairs', () => {
    const problem = Array.from({ length: 100 }, (_, seed) =>
      generateProblem(skill('compare-numbers'), seed, 3),
    ).find((candidate) => candidate.answer.kind === 'choice' && candidate.answer.id !== '0')
    const relation = Number(problem?.answer.kind === 'choice' ? problem.answer.id : 0)

    expect(problem).toBeDefined()
    expect(problem?.misconceptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tag: 'reversed-comparison', value: -relation }),
        expect.objectContaining({ tag: 'called-equal', value: 0 }),
      ]),
    )
  })
})

describe('order-numbers', () => {
  it('maps ascending, descending, and last-two-swap labels to unique ids', () => {
    for (const difficulty of DIFFICULTIES) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const problem = generateProblem(skill('order-numbers'), seed, difficulty)
        const display = problem.display.kind === 'inline' ? problem.display : undefined
        const values = orderedValues(display)
        const ascending = [...values].sort((a, b) => a - b)
        const descending = [...ascending].reverse()
        const swapped = [ascending[0], ascending[2], ascending[1]]
        const choices = new Map(problem.choices?.map((choice) => [choice.id, choice.label]))

        expect(values).toHaveLength(3)
        expect(new Set(values).size).toBe(3)
        expect(display?.text).toBe(values.join(', '))
        expect(display?.wholeNumber?.operation).toBe('order-ascending')
        expect(problem.answer).toEqual({ kind: 'choice', id: '0' })
        expect(new Set(problem.choices?.map((choice) => choice.id)).size).toBe(3)
        expect(choices.get('0')).toBe(ascending.join(', '))
        expect(choices.get('1')).toBe(descending.join(', '))
        expect(choices.get('2')).toBe(swapped.join(', '))
        expect(problem.misconceptions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tag: 'descending-order', value: 1 }),
            expect.objectContaining({ tag: 'last-two-swapped', value: 2 }),
          ]),
        )
      }
    }
  })
})

describe('round-to-10', () => {
  it('uses midpoint-up rounding across both sides of halfway', () => {
    const remainders = new Set<'below' | 'midpoint' | 'above'>()

    for (let seed = 1; seed <= 1_000; seed += 1) {
      const problem = generateProblem(skill('round-to-10'), seed, 5)
      const display = problem.display.kind === 'inline' ? problem.display : undefined
      const value = carried(display) ?? -1
      const remainder = value % 10

      if (remainder < 5) remainders.add('below')
      else if (remainder === 5) remainders.add('midpoint')
      else remainders.add('above')
      expect(remainder).not.toBe(0)
      expect(display?.text).toBe(String(value))
      expect(display?.wholeNumber?.operation).toBe('round-to-10')
      expect(problem.answer).toEqual({
        kind: 'exact',
        n: Math.round(value / 10) * 10,
        d: 1,
      })
    }

    expect(remainders).toEqual(new Set(['below', 'midpoint', 'above']))
  })

  it('declares both neighbours and unchanged, then filters the correct neighbour', () => {
    const raw = skill('round-to-10').generate(makeRng(12345), 5)
    const problem = generateProblem(skill('round-to-10'), 12345, 5)
    const display = raw.display.kind === 'inline' ? raw.display : undefined
    const value = carried(display) ?? -1
    const lower = Math.floor(value / 10) * 10
    const upper = lower + 10

    expect(raw.misconceptions?.map((m) => m.value)).toEqual([lower, upper, value])
    expect(problem.misconceptions).toHaveLength(2)
    expect(problem.misconceptions?.map((m) => m.value)).not.toContain(
      Math.round(value / 10) * 10,
    )
  })
})

describe('round-to-100', () => {
  it('uses midpoint-up rounding and keeps two distinct diagnoses', () => {
    const positions = new Set<'below' | 'midpoint' | 'above'>()

    for (let seed = 1; seed <= 1_000; seed += 1) {
      const problem = generateProblem(skill('round-to-100'), seed, 5)
      const display = problem.display.kind === 'inline' ? problem.display : undefined
      const value = carried(display) ?? -1
      const remainder = value % 100
      const lower = Math.floor(value / 100) * 100
      const upper = lower + 100
      const nearestTen = Math.round(value / 10) * 10

      if (remainder < 50) positions.add('below')
      else if (remainder === 50) positions.add('midpoint')
      else positions.add('above')
      expect(nearestTen).not.toBe(lower)
      expect(nearestTen).not.toBe(upper)
      expect(display?.wholeNumber?.operation).toBe('round-to-100')
      expect(problem.answer).toEqual({
        kind: 'exact',
        n: Math.round(value / 100) * 100,
        d: 1,
      })
      expect(problem.misconceptions).toHaveLength(2)
      expect(new Set(problem.misconceptions?.map((m) => m.value)).size).toBe(2)
    }

    expect(positions).toEqual(new Set(['below', 'midpoint', 'above']))
  })

  it('declares neighbouring hundreds and rounding only to tens', () => {
    const raw = skill('round-to-100').generate(makeRng(12345), 5)
    const display = raw.display.kind === 'inline' ? raw.display : undefined
    const value = carried(display) ?? -1
    const lower = Math.floor(value / 100) * 100

    expect(raw.misconceptions?.map((m) => m.value)).toEqual([
      lower,
      lower + 100,
      Math.round(value / 10) * 10,
    ])
  })
})

describe.each(unit00.map((candidate) => [candidate.id, candidate] as const))(
  'recorded Unit 0 output: %s',
  (_id, candidate) => {
    it('matches the reviewed learner-facing problems', () => {
      const sample = DIFFICULTIES.flatMap((difficulty) =>
        SEEDS.map((seed) => generateProblem(candidate, seed, difficulty)),
      )

      expect(sample).toMatchSnapshot()
    })
  },
)
