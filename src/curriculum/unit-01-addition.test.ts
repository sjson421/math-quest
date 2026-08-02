import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
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
