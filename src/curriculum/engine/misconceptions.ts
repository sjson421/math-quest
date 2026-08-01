import type { Misconception } from '../../lib/types'
import type { CarryingTrace, ColumnTrace } from './column'
import { requirePlace } from './column'

/**
 * The wrong answers column arithmetic actually produces.
 *
 * Two families live here and they are not the same thing. Carry and borrow
 * errors are *arithmetic* — the learner did place value and dropped a term — so
 * they are computed as arithmetic. Writing `612` for `27 + 45` is *not*
 * arithmetic: the learner wrote each column's sum side by side, and the honest
 * model of that is string concatenation.
 *
 * The distinction matters because the old code used concatenation for both, and
 * that is what broke at three digits: `add-3digit` had to leave the idiom behind
 * to express a carry it could no longer spell.
 */

/** Digits high place to low, written out the way a learner writes them. */
const concat = (parts: number[]) => Number([...parts].reverse().join(''))

/**
 * One step off in each direction.
 *
 * The step is what varies: counting on to a sum miscounts by one, while adding
 * whole tens miscounts by ten. The nudges are per skill either way — counting up
 * one too few on single-digit addition wants different words from a subtraction
 * slip.
 */
export const offBy = (
  correct: number,
  step: number,
  { tag, low, high }: { tag: string; low: string; high: string },
): Misconception[] => [
  { value: correct - step, tag: `${tag}-low`, nudge: low },
  { value: correct + step, tag: `${tag}-high`, nudge: high },
]

/**
 * The step-of-one case, which four skills use.
 *
 * A wrapper rather than a second implementation: `off-by-one-low` and
 * `off-by-one-high` appear in the recorded output of `add-facts` and
 * `sub-facts`, so those tags have to survive verbatim.
 */
export const offByOne = (
  correct: number,
  nudges: { low: string; high: string },
): Misconception[] => offBy(correct, 1, { tag: 'off-by-one', ...nudges })

/** Ran the other operation. The most common error on a facts skill. */
export const wrongOperation = (
  a: number,
  b: number,
  operator: '+' | '−',
  nudge: string,
): Misconception =>
  operator === '+'
    ? { value: Math.abs(a - b), tag: 'subtracted', nudge }
    : { value: a + b, tag: 'added', nudge }

/**
 * Forgot to carry out of one place.
 *
 * Arithmetic, not concatenation: dropping the carry out of place `n` removes
 * exactly one unit of the place above, whatever the width of the number. This is
 * the case the string idiom could not express past two digits.
 */
export const forgotCarry = (
  trace: CarryingTrace,
  n: number,
  { tag, nudge }: { tag: string; nudge: string },
): Misconception => {
  // `CarryingTrace` carries no operands, so the message names the total — which
  // is still enough to identify the problem that asked for a column too far.
  const column = requirePlace(trace.places, n, () => `a trace totalling ${trace.result}`)
  // Multiplied, not subtracted as a unit, so a stack dropping a carry of 2 is
  // short by 20 rather than 10. `CarryingTrace` is what lets a stack in here.
  return { value: trace.result - column.carry * 10 ** (n + 1), tag, nudge }
}

/**
 * Wrote each column's sum side by side instead of carrying between them.
 *
 * Only meaningful where a column can actually overflow. On a skill whose draw
 * forbids carrying, every column sum is a single digit, so writing them side by
 * side *is* the correct answer — the prediction equals the answer on every
 * problem and is filtered away every time. `add-2digit-nocarry` shipped in
 * exactly that state; `alwaysFiltered` in `generators.test.ts` now catches it.
 */
export const digitConcat = (trace: ColumnTrace, nudge: string): Misconception => ({
  value: concat(trace.places.map((p) => p.raw)),
  tag: 'digit-concat',
  nudge,
})

/**
 * Did not line the columns up — added each digit of one operand to the *wrong*
 * digit of the other.
 *
 * For 23 + 45 that is 3 + 4 in the ones and 2 + 5 in the tens, giving 77, which
 * is `a` plus `b` with its digits swapped. Expressed as that sum rather than as
 * a concatenation so it stays well-formed when a misaligned column overflows —
 * a learner who lands on 13 in the ones carries it like any other column.
 *
 * Two places, and addition specifically — the value is built by adding, so a
 * subtraction trace would get arithmetic that means nothing. A wider or a
 * borrowing version needs a skill that wants one, and should be written with
 * that skill rather than guessed at now.
 */
export const misalignedColumns = (trace: ColumnTrace, nudge: string): Misconception => {
  const ones = requirePlace(trace.places, 0, () => `${trace.a} + ${trace.b}`)
  const tens = requirePlace(trace.places, 1, () => `${trace.a} + ${trace.b}`)

  return {
    value: trace.a + (ones.bottom * 10 + tens.bottom),
    tag: 'misaligned-columns',
    nudge,
  }
}

/**
 * Carried nothing and wrote the whole two-digit column sum into one place.
 * Genuinely a concatenation: the digits go down as they were computed.
 */
export const wroteFullColumn = (
  trace: ColumnTrace,
  n: number,
  { tag, nudge }: { tag: string; nudge: string },
): Misconception => ({
  value: concat(trace.places.filter((p) => p.place >= n).map((p) => p.raw)),
  tag,
  nudge,
})

/**
 * Took the smaller digit from the larger in every column rather than borrowing.
 * The canonical subtraction error, and a concatenation because each column is
 * resolved on its own and written down.
 */
export const flippedColumns = (trace: ColumnTrace, nudge: string): Misconception => ({
  value: concat(trace.places.map((p) => Math.abs(p.top - p.bottom))),
  tag: 'flipped-column',
  nudge,
})

/**
 * Borrowed the ten but left the lending column at its original digit.
 *
 * Two-place borrowing specifically. A wider version needs a skill that borrows
 * across more than one column — `sub-across-zero` — and it should be written
 * with that skill rather than guessed at now.
 */
export const borrowedWithoutReducing = (
  trace: ColumnTrace,
  nudge: string,
): Misconception => ({
  value: concat(
    trace.places.map((p) => (p.place === 0 ? p.borrowed - p.bottom : p.top - p.bottom)),
  ),
  tag: 'forgot-to-reduce-tens',
  nudge,
})

/** Borrowed, subtracted the ones, then left the column above untouched. */
export const skippedUpperSubtraction = (
  trace: ColumnTrace,
  nudge: string,
): Misconception => ({
  value: concat(trace.places.map((p) => (p.place === 0 ? p.borrowed - p.bottom : p.top))),
  tag: 'skipped-tens-subtraction',
  nudge,
})
