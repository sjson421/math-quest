import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import type { Difficulty } from '../lib/types'
import { borrowChain, columnTrace } from './engine'
import { format, sample, unrenderedKeys } from './recorded-output'
import { unit02 } from './unit-02-subtraction'

/**
 * The wording gate for Unit 2. The formatting is shared with Unit 1's; what
 * stays here is the recording, because the snapshot is keyed by this file and
 * these titles.
 *
 * `sub-facts` and `sub-2digit-borrow` moved here from `unit-01-addition.ts`, and
 * their entries were transplanted from that file's snapshot unchanged. A diff on
 * either is a regression, not a prompt to re-record.
 */

describe.each(unit02.map((s) => [s.id, s] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

describe('what the unit guarantees about every problem it makes', () => {
  const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1)
  const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

  const everyProblem = (skill: (typeof unit02)[number]) =>
    DIFFICULTIES.flatMap((d) => SEEDS.map((seed) => generateProblem(skill, seed, d)))

  it('never asks for a negative difference', () => {
    // Unit 6 brings negatives and the sign key with them. Until then a
    // difference below zero is a problem the pad cannot answer, so it must not
    // be generated rather than merely be unlikely.
    const negative = unit02.flatMap((skill) =>
      everyProblem(skill)
        .filter((p) => p.answer.kind === 'exact' && p.answer.n / p.answer.d < 0)
        .map((p) => `${p.skillId}: ${JSON.stringify(p.display)}`),
    )

    expect(negative).toEqual([])
  })

  it('offers digits only, on every skill', () => {
    // No `keypad` rules means whole non-negative digits. A skill here that
    // declared `allowNegative` would be reaching for Unit 6's surface early.
    const declared = unit02.flatMap((skill) =>
      everyProblem(skill)
        .filter((p) => p.inputMode !== 'keypad' || p.keypad !== undefined)
        .map((p) => `${p.skillId}: ${p.inputMode} ${JSON.stringify(p.keypad)}`),
    )

    expect([...new Set(declared)]).toEqual([])
  })

  it('makes the borrowing skills borrow, and the no-borrow skill not', () => {
    // The draws enforce this, but the draws are where it would be lost — a
    // widened band that stopped requiring a borrow would leave three skills
    // teaching the previous one's lesson under a harder name.
    const borrows = (p: ReturnType<typeof generateProblem>) => {
      if (p.display.kind !== 'column') throw new Error(`${p.skillId} is not a column problem`)
      const [a, b] = p.display.operands
      return columnTrace(a, b, '−').places.some((place) => place.carry === 1)
    }

    for (const id of ['sub-2digit-borrow', 'sub-3digit-borrow', 'sub-across-zero']) {
      const skill = unit02.find((s) => s.id === id)!
      expect(everyProblem(skill).every(borrows), `${id} must always borrow`).toBe(true)
    }

    const noBorrow = unit02.find((s) => s.id === 'sub-2digit-noborrow')!
    expect(everyProblem(noBorrow).some(borrows), 'sub-2digit-noborrow must never borrow').toBe(
      false,
    )
  })

  it('sends the across-zero borrow past a column that cannot lend', () => {
    // What separates the wall from `sub-3digit-borrow`: the tens have nothing
    // of their own, so the borrow travels. A draw that stopped producing this
    // would leave the unit with two copies of one skill.
    const skill = unit02.find((s) => s.id === 'sub-across-zero')!

    for (const problem of everyProblem(skill)) {
      if (problem.display.kind !== 'column') throw new Error('expected a column problem')
      const [a, b] = problem.display.operands
      const chain = borrowChain(columnTrace(a, b, '−'), 0)
      expect(chain.through.length, `${a} − ${b} borrows from the column next door`).toBe(1)
    }
  })
})

describe('the gate itself', () => {
  it('renders every field the generators set', () => {
    expect(
      unrenderedKeys(unit02),
      'add these to RENDERED_KEYS and render them in format()',
    ).toEqual([])
  })

  it('notices a reworded hint', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    const problem = generateProblem(unit02[0], 1, 1)
    const reworded = { ...problem, hint: 'Something else entirely.' }
    expect(format(reworded, 1)).not.toBe(format(problem, 1))
  })

  it('notices a changed misconception nudge', () => {
    const problem = generateProblem(unit02[0], 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 ? { ...m, nudge: 'Reworded.' } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
