import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import type { Problem } from '../lib/types'
import { manifestIndex } from './index'
import { format, sample, unrenderedKeys } from './recorded-output'
import { unit01 } from './unit-01-addition'

/**
 * The behaviour-preservation gate for the generator-engine extraction.
 *
 * Recorded before the engine existed. A diff here while moving a generator onto
 * shared helpers is a regression, not a prompt to re-record.
 *
 * The formatting moved to `recorded-output.ts` once Unit 2 grew a gate of its
 * own; what stays here is the recording, because the snapshot is keyed by this
 * file and these titles. Five seeds rather than the 200 per difficulty
 * `generators.test.ts` draws: a wording regression from an extraction is
 * systematic, so it shows up in the first few seeds or not at all, and 30,000
 * problems is not a reviewable diff.
 */

describe.each(unit01.map((s) => [s.id, s] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the output recorded before the engine extraction', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const teachingLines = [
  ['add-facts-small', 'Addition combines two amounts into one total.'],
  ['add-facts', 'Start with the larger number and count on the smaller number.'],
  ['add-tens', 'Add the counts of tens, then read the result as tens.'],
  ['add-2digit-nocarry', 'Line up ones under ones and tens under tens, then add each column.'],
  ['add-2digit-carry', 'When the ones total 10 or more, write the ones digit and carry the ten.'],
  ['add-3digit', 'Add from right to left, carrying into the next column when needed.'],
  ['add-three-numbers', 'Add all three digits in each column, then carry every full ten.'],
  ['add-words', 'Find the two amounts being combined, then add them.'],
] as const

const skill = (id: string) => {
  const found = unit01.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 1 skill: ${id}`)
  return found
}

const shownAddends = (problem: Problem): number[] => {
  if (problem.display.kind === 'inline') {
    const addends = problem.display.text.split(' + ').map(Number)
    if (addends.length === 2 && addends.every(Number.isInteger)) return addends
    throw new Error(`Cannot parse addition: ${problem.display.text}`)
  }

  if (problem.display.kind === 'column') {
    return problem.display.operands
  }
  if (problem.display.kind === 'story') {
    const { operands } = problem.display
    if (operands) return operands
  }

  throw new Error(`Expected addition operands for ${problem.skillId}`)
}

describe('Stage B Unit 1 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = skill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage B Unit 1 intro examples', () => {
  it('recomputes every fixed example from its visible addends', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(skill(id), 1, 1)
      const addends = shownAddends(problem)
      const sum = addends.reduce((total, addend) => total + addend, 0)

      expect(problem.answer).toEqual({ kind: 'exact', n: sum, d: 1 })
    }
  })
})

describe('the gate itself', () => {
  it('renders every field the generators set', () => {
    expect(
      unrenderedKeys(unit01),
      'add these to RENDERED_KEYS and render them in format()',
    ).toEqual([])
  })

  it('notices a reworded hint', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    const problem = generateProblem(unit01[0], 1, 1)
    const reworded = { ...problem, hint: 'Something else entirely.' }
    expect(format(reworded, 1)).not.toBe(format(problem, 1))
  })

  it('notices a changed misconception nudge', () => {
    const problem = generateProblem(unit01[0], 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 ? { ...m, nudge: 'Reworded.' } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
