import { describe, expect, it } from 'vitest'
import { columnTrace, digitAt } from './column'
import {
  borrowedWithoutReducing,
  digitConcat,
  flippedColumns,
  forgotCarry,
  offByOne,
  skippedUpperSubtraction,
  wroteFullColumn,
  wrongOperation,
} from './misconceptions'

/**
 * These factories exist to replace expressions written by hand in
 * `unit-01-add-sub.ts`, so most of what follows re-derives the old expression
 * and demands the same number back. The golden snapshot would catch a
 * difference once the generators move across; this catches it beforehand, and
 * says which prediction changed rather than which problem.
 */

const d = digitAt

/** Every two-digit pair a skill's constraint admits. */
const pairs = (accept: (a: number, b: number) => boolean) => {
  const out: [number, number][] = []
  for (let a = 10; a <= 99; a += 1) {
    for (let b = 10; b <= 99; b += 1) {
      if (accept(a, b)) out.push([a, b])
    }
  }
  return out
}

describe('offByOne', () => {
  it('predicts one either side, tagged separately', () => {
    expect(offByOne(12, { low: 'too few', high: 'too many' })).toEqual([
      { value: 11, tag: 'off-by-one-low', nudge: 'too few' },
      { value: 13, tag: 'off-by-one-high', nudge: 'too many' },
    ])
  })
})

describe('wrongOperation', () => {
  it('predicts the difference on an addition problem', () => {
    expect(wrongOperation(7, 4, '+', 'n')).toEqual({ value: 3, tag: 'subtracted', nudge: 'n' })
  })

  it('predicts the sum on a subtraction problem', () => {
    expect(wrongOperation(7, 4, '−', 'n')).toEqual({ value: 11, tag: 'added', nudge: 'n' })
  })

  it('never predicts a negative difference', () => {
    expect(wrongOperation(4, 7, '+', 'n').value).toBe(3)
  })
})

describe('digitConcat matches the expression it replaces', () => {
  it('reproduces add-2digit-nocarry over every pair the skill admits', () => {
    const admitted = pairs(
      (a, b) =>
        d(a, 0) + d(b, 0) <= 9 && d(a, 1) + d(b, 1) <= 9 && d(a, 0) > 0 && d(b, 0) > 0,
    )
    expect(admitted.length).toBeGreaterThan(100)

    for (const [a, b] of admitted) {
      const legacy = Number(`${d(a, 1) + d(b, 1)}${d(a, 0) + d(b, 0)}`)
      expect(digitConcat(columnTrace(a, b, '+'), 'n').value, `${a} + ${b}`).toBe(legacy)
    }
  })
})

describe('carrying predictions match the expressions they replace', () => {
  const carrying = pairs((a, b) => d(a, 0) + d(b, 0) > 9)

  it('reproduces add-2digit-carry forgot-carry', () => {
    for (const [a, b] of carrying) {
      const onesSum = d(a, 0) + d(b, 0)
      const tensSum = d(a, 1) + d(b, 1)
      const legacy = Number(`${tensSum}${onesSum % 10}`)
      const built = forgotCarry(columnTrace(a, b, '+'), 0, { tag: 'forgot-carry', nudge: 'n' })
      expect(built.value, `${a} + ${b}`).toBe(legacy)
    }
  })

  it('reproduces add-2digit-carry wrote-full-ones', () => {
    for (const [a, b] of carrying) {
      const legacy = Number(`${d(a, 1) + d(b, 1)}${d(a, 0) + d(b, 0)}`)
      const built = wroteFullColumn(columnTrace(a, b, '+'), 0, {
        tag: 'wrote-full-ones',
        nudge: 'n',
      })
      expect(built.value, `${a} + ${b}`).toBe(legacy)
    }
  })
})

describe('forgotCarry at three digits', () => {
  /**
   * The case the string idiom could not express. `add-3digit` abandoned
   * concatenation and wrote place-value subtraction by hand; this is that
   * arithmetic, generalised.
   */
  const threeDigit = () => {
    const out: [number, number][] = []
    for (let a = 100; a <= 989; a += 7) {
      for (let b = 100; b <= 989; b += 11) {
        if (d(a, 0) + d(b, 0) > 9 || d(a, 1) + d(b, 1) > 9) out.push([a, b])
      }
    }
    return out
  }

  it('reproduces forgot-carry-ones and forgot-carry-tens', () => {
    const cases = threeDigit()
    expect(cases.length).toBeGreaterThan(1000)

    for (const [a, b] of cases) {
      const sum = a + b
      const onesSum = d(a, 0) + d(b, 0)
      const carryOnes = onesSum > 9 ? 1 : 0
      const tensSum = d(a, 1) + d(b, 1) + carryOnes
      const carryTens = tensSum > 9 ? 1 : 0

      const trace = columnTrace(a, b, '+')
      expect(
        forgotCarry(trace, 0, { tag: 'forgot-carry-ones', nudge: 'n' }).value,
        `${a} + ${b} ones`,
      ).toBe(sum - (carryOnes ? 10 : 0))
      expect(
        forgotCarry(trace, 1, { tag: 'forgot-carry-tens', nudge: 'n' }).value,
        `${a} + ${b} tens`,
      ).toBe(sum - (carryTens ? 100 : 0))
    }
  })
})

describe('borrowing predictions match the expressions they replace', () => {
  const borrowing = pairs((a, b) => b < a && d(a, 0) < d(b, 0) && a - b > 0 && b >= 11)

  it('reproduces flipped-column', () => {
    for (const [a, b] of borrowing) {
      const legacy = Number(`${Math.abs(d(a, 1) - d(b, 1))}${Math.abs(d(a, 0) - d(b, 0))}`)
      expect(flippedColumns(columnTrace(a, b, '−'), 'n').value, `${a} − ${b}`).toBe(legacy)
    }
  })

  it('reproduces forgot-to-reduce-tens', () => {
    for (const [a, b] of borrowing) {
      const legacy = Number(`${d(a, 1) - d(b, 1)}${d(a, 0) + 10 - d(b, 0)}`)
      expect(borrowedWithoutReducing(columnTrace(a, b, '−'), 'n').value, `${a} − ${b}`).toBe(
        legacy,
      )
    }
  })

  it('reproduces skipped-tens-subtraction', () => {
    for (const [a, b] of borrowing) {
      const legacy = Number(`${d(a, 1)}${d(a, 0) + 10 - d(b, 0)}`)
      expect(skippedUpperSubtraction(columnTrace(a, b, '−'), 'n').value, `${a} − ${b}`).toBe(
        legacy,
      )
    }
  })

  it('keeps the third borrowing prediction distinct where the first two collide', () => {
    // 31 − 16 predicts 25 twice, which is why `sub-2digit-borrow` carries a
    // third: two predictions that dedup into one fail the wall rule.
    const trace = columnTrace(31, 16, '−')
    const flipped = flippedColumns(trace, 'n').value
    const unreduced = borrowedWithoutReducing(trace, 'n').value
    const skipped = skippedUpperSubtraction(trace, 'n').value

    expect(flipped).toBe(unreduced)
    expect(skipped).not.toBe(flipped)
    expect(skipped).not.toBe(trace.result)
  })
})
