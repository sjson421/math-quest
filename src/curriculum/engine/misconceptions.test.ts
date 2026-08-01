import { describe, expect, it } from 'vitest'
import { columnTrace, digitAt, stackPlace, stackTrace } from './column'
import {
  borrowedWithoutReducing,
  chainStoppedAtLender,
  digitConcat,
  flippedColumns,
  forgotCarry,
  misalignedColumns,
  offBy,
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

  it('keeps its tags verbatim now that it delegates', () => {
    // `off-by-one-low` and `off-by-one-high` are in the recorded output of
    // `add-facts` and `sub-facts`. Reimplementing this on `offBy` is only safe
    // while the tags it produces are byte-identical.
    expect(offByOne(5, { low: 'l', high: 'h' }).map((m) => m.tag)).toEqual([
      'off-by-one-low',
      'off-by-one-high',
    ])
  })
})

describe('offBy', () => {
  it('steps by ten for the whole-tens skill', () => {
    expect(offBy(50, 10, { tag: 'off-by-ten', low: 'l', high: 'h' })).toEqual([
      { value: 40, tag: 'off-by-ten-low', nudge: 'l' },
      { value: 60, tag: 'off-by-ten-high', nudge: 'h' },
    ])
  })

  it('never predicts the correct answer, whatever the step', () => {
    // The one property the central dedup would otherwise have to catch.
    for (const step of [1, 10, 100]) {
      for (const prediction of offBy(70, step, { tag: 't', low: 'l', high: 'h' })) {
        expect(prediction.value).not.toBe(70)
      }
    }
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

describe('misalignedColumns', () => {
  const noCarry = pairs(
    (a, b) => d(a, 0) + d(b, 0) <= 9 && d(a, 1) + d(b, 1) <= 9 && d(a, 0) > 0 && d(b, 0) > 0,
  )

  it('adds each digit to the wrong one, the way a misread column does', () => {
    // 3 + 4 in the ones and 2 + 5 in the tens, written down as 77.
    expect(misalignedColumns(columnTrace(23, 45, '+'), 'n').value).toBe(77)
  })

  it('is `a` plus `b` with its digits swapped, across every pair the skill admits', () => {
    expect(noCarry.length).toBeGreaterThan(100)

    for (const [a, b] of noCarry) {
      const swapped = d(b, 0) * 10 + d(b, 1)
      expect(misalignedColumns(columnTrace(a, b, '+'), 'n').value, `${a} + ${b}`).toBe(
        a + swapped,
      )
    }
  })

  it('is a real prediction on most pairs, unlike the one it replaced', () => {
    // The whole point. `digitConcat` equalled the answer on every no-carry pair,
    // so it was filtered away every time and the skill diagnosed nothing. This
    // one coincides only when `b`'s digits match, which is why it survives.
    const collapses = noCarry.filter(
      ([a, b]) => misalignedColumns(columnTrace(a, b, '+'), 'n').value === a + b,
    )

    expect(collapses.length).toBeGreaterThan(0)
    expect(collapses.every(([, b]) => d(b, 0) === d(b, 1))).toBe(true)
    expect(collapses.length / noCarry.length).toBeLessThan(0.2)
  })

  it('shows why digitConcat could never work here', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    // This is the shipped bug, pinned: on a no-carry pair the old prediction is
    // the answer, every time.
    for (const [a, b] of noCarry) {
      expect(digitConcat(columnTrace(a, b, '+'), 'n').value, `${a} + ${b}`).toBe(a + b)
    }
  })

  it('names the trace when handed a single-column pair', () => {
    expect(() => misalignedColumns(columnTrace(4, 5, '+'), 'n')).toThrow(
      '4 + 5 has 1 columns, no place 1',
    )
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

describe('forgotCarry over a stack', () => {
  it('is short by the full carry, not by one ten', () => {
    // The prediction a boolean carry gets quietly wrong. 9 + 8 + 7 is 24, so a
    // learner who writes the 4 and carries nothing is 20 light, not 10.
    const trace = stackTrace([19, 18, 17])
    expect(stackPlace(trace, 0).carry).toBe(2)

    const built = forgotCarry(trace, 0, { tag: 'forgot-carry', nudge: 'n' })
    expect(built.value).toBe(trace.result - 20)
    expect(built.value).not.toBe(trace.result - 10)
  })

  it('agrees with the binary trace wherever the carry is one', () => {
    // The generalisation must not have moved the case that already shipped.
    for (let a = 15; a <= 95; a += 4) {
      for (let b = 16; b <= 96; b += 7) {
        if (d(a, 0) + d(b, 0) <= 9) continue
        const binary = forgotCarry(columnTrace(a, b, '+'), 0, { tag: 't', nudge: 'n' })
        const stacked = forgotCarry(stackTrace([a, b]), 0, { tag: 't', nudge: 'n' })
        expect(stacked.value, `${a} + ${b}`).toBe(binary.value)
      }
    }
  })

  it('names the width when asked for a carry out of a place that is not there', () => {
    const trace = stackTrace([4, 7, 5])
    expect(() => forgotCarry(trace, 1, { tag: 't', nudge: 'n' })).toThrow(
      'a trace totalling 16 has 1 columns, no place 1',
    )
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

describe('misalignedColumns on a subtraction', () => {
  const noBorrow = pairs(
    (a, b) => d(a, 0) >= d(b, 0) && d(a, 1) >= d(b, 1) && d(b, 0) > 0 && d(b, 1) > 0,
  )

  it('takes the digit-swapped subtrahend, not addition arithmetic', () => {
    // 68 − 23 misread is 8 − 3 in the ones and 6 − 2 in the tens; lining the
    // columns up wrongly takes 32 instead, giving 36.
    expect(misalignedColumns(columnTrace(68, 23, '−'), 'n').value).toBe(36)
  })

  it('is `a` minus `b` with its digits swapped, across every pair the skill admits', () => {
    expect(noBorrow.length).toBeGreaterThan(100)

    for (const [a, b] of noBorrow) {
      const swapped = d(b, 0) * 10 + d(b, 1)
      expect(misalignedColumns(columnTrace(a, b, '−'), 'n').value, `${a} − ${b}`).toBe(
        a - swapped,
      )
    }
  })

  it('leaves the addition value exactly as it was', () => {
    // The widening's one obligation: `add-2digit-nocarry` ships this prediction,
    // and its recorded output is a gate.
    const adding = pairs((a, b) => d(a, 0) + d(b, 0) <= 9 && d(a, 1) + d(b, 1) <= 9)

    for (const [a, b] of adding) {
      const swapped = d(b, 0) * 10 + d(b, 1)
      expect(misalignedColumns(columnTrace(a, b, '+'), 'n').value, `${a} + ${b}`).toBe(
        a + swapped,
      )
    }
  })

  it('names the trace with its own operator when handed a single column', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    expect(() => misalignedColumns(columnTrace(9, 5, '−'), 'n')).toThrow(
      '9 − 5 has 1 columns, no place 1',
    )
  })
})

describe('borrowing across a zero', () => {
  const trace = columnTrace(500, 237, '−')

  it('predicts a number rather than NaN, which the old expression did not', () => {
    // The shipped bug this widening fixes: the old form gave every place above
    // the ones `top − bottom`, which is 0 − 3 in the tens here, and a negative
    // part concatenates into `NaN`. Pinned as arithmetic rather than as a
    // literal so the reason survives.
    const legacy = Number(
      [...trace.places]
        .reverse()
        .map((p) => (p.place === 0 ? p.borrowed - p.bottom : p.top - p.bottom))
        .join(''),
    )

    expect(legacy).toBeNaN()
    expect(borrowedWithoutReducing(trace, 'n').value).toBe(373)
  })

  it('predicts the chain stopped at its lender', () => {
    // Hundreds correctly 5 → 4, but the tens are read as the 10 they became
    // rather than the 9 they end at: ten above the answer, per crossed column.
    expect(chainStoppedAtLender(trace, 0, 'n').value).toBe(263 + 10)
    expect(chainStoppedAtLender(columnTrace(1000, 237, '−'), 0, 'n').value).toBe(763 + 110)
  })

  it('keeps the wall its three distinct diagnoses', () => {
    const values = [
      flippedColumns(trace, 'n').value,
      borrowedWithoutReducing(trace, 'n').value,
      chainStoppedAtLender(trace, 0, 'n').value,
    ]

    expect(values).toEqual([337, 373, 273])
    expect(new Set([...values, trace.result]).size).toBe(4)
  })

  it('refuses to predict a stopped chain where nothing was crossed', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    // With no crossed column the value would equal the answer and be filtered on
    // every problem, leaving the skill predicting nothing at all.
    expect(() => chainStoppedAtLender(columnTrace(52, 27, '−'), 0, 'n')).toThrow(
      '52 − 27 borrows at place 0 without crossing a column',
    )
  })
})
