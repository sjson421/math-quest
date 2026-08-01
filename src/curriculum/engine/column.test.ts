import { describe, expect, it } from 'vitest'
import { borrowChain, columnTrace, digitAt, place, stackPlace, stackTrace } from './column'

/** Compact view of one column, so a failure names the place that is wrong. */
const summarise = (trace: ReturnType<typeof columnTrace>) =>
  trace.places.map((p) => `place ${p.place}: ${p.top}/${p.bottom} → ${p.digit} carry ${p.carry}`)

/** The same, for a stack — the digits are a list, so they read as one. */
const summariseStack = (trace: ReturnType<typeof stackTrace>) =>
  trace.places.map(
    (p) => `place ${p.place}: ${p.digits.join('+')} → ${p.digit} carry ${p.carry}`,
  )

describe('digitAt', () => {
  it('reads places right to left', () => {
    expect(digitAt(507, 0)).toBe(7)
    expect(digitAt(507, 1)).toBe(0)
    expect(digitAt(507, 2)).toBe(5)
  })

  it('reads past the end as zero', () => {
    expect(digitAt(7, 3)).toBe(0)
  })
})

describe('columnTrace, addition', () => {
  it('traces a pair that needs no carrying', () => {
    const trace = columnTrace(23, 45, '+')
    expect(summarise(trace)).toEqual([
      'place 0: 3/5 → 8 carry 0',
      'place 1: 2/4 → 6 carry 0',
    ])
    expect(trace.result).toBe(68)
  })

  it('separates the raw column sum from the carried total', () => {
    // `add-2digit-carry`'s hint is about the raw sum exceeding 9, while its
    // final step shows the tens column with the carry included. Both come from
    // one trace, which is the point.
    const trace = columnTrace(27, 45, '+')
    const ones = place(trace, 0)
    const tens = place(trace, 1)

    expect(ones.raw).toBe(12)
    expect(ones.digit).toBe(2)
    expect(ones.carry).toBe(1)
    expect(tens.raw).toBe(6)
    expect(tens.incoming).toBe(1)
    expect(tens.total).toBe(7)
    expect(trace.result).toBe(72)
  })

  it('traces a carry cascading through every place', () => {
    const trace = columnTrace(199, 1, '+')
    expect(summarise(trace)).toEqual([
      'place 0: 9/1 → 0 carry 1',
      'place 1: 9/0 → 0 carry 1',
      'place 2: 1/0 → 2 carry 0',
    ])
    expect(trace.result).toBe(200)
  })

  it('reconstructs the result from the digits it wrote', () => {
    const trace = columnTrace(456, 789, '+')
    const fromDigits = trace.places.reduce((sum, p) => sum + p.digit * 10 ** p.place, 0)
    const carriedOut = trace.places[trace.places.length - 1].carry
    expect(fromDigits + carriedOut * 10 ** trace.places.length).toBe(trace.result)
  })
})

describe('columnTrace, subtraction', () => {
  it('traces a pair that needs no borrowing', () => {
    const trace = columnTrace(48, 23, '−')
    expect(summarise(trace)).toEqual([
      'place 0: 8/3 → 5 carry 0',
      'place 1: 4/2 → 2 carry 0',
    ])
    expect(trace.result).toBe(25)
  })

  it('reports the borrowed ones and the reduced tens', () => {
    // The two values `sub-2digit-borrow` builds by hand today.
    const trace = columnTrace(52, 27, '−')
    expect(place(trace, 0).borrowed).toBe(12)
    expect(place(trace, 0).digit).toBe(5)
    expect(place(trace, 0).carry).toBe(1)
    expect(place(trace, 1).reduced).toBe(4)
    expect(place(trace, 1).digit).toBe(2)
    expect(trace.result).toBe(25)
  })

  it('borrows across a zero', () => {
    const trace = columnTrace(100, 1, '−')
    expect(summarise(trace)).toEqual([
      'place 0: 0/1 → 9 carry 1',
      'place 1: 0/0 → 9 carry 1',
      'place 2: 1/0 → 0 carry 0',
    ])
    expect(trace.result).toBe(99)
  })

  it('reconstructs the result from the digits it wrote', () => {
    const trace = columnTrace(803, 267, '−')
    const fromDigits = trace.places.reduce((sum, p) => sum + p.digit * 10 ** p.place, 0)
    expect(fromDigits).toBe(trace.result)
  })

  it('stands every chained column at a digit a learner would write', () => {
    // `sub-across-zero`'s canonical problem. The working is: the hundreds go
    // 5 → 4, the tens stand at 9, the ones at 10.
    const trace = columnTrace(500, 237, '−')
    expect(trace.places.map((p) => p.borrowed)).toEqual([10, 9, 4])
    expect(trace.result).toBe(263)
  })

  it('reports a negative `reduced` on the column a borrow passes through', () => {
    // Pinned as the trap the field's comment describes, not as desired output.
    // `reduced` means "after lending, before receiving" and a chain receives
    // first, so the tens read −1 — consistent, and not a digit anybody writes.
    // A generator reaching for it here would phrase that into a solution step.
    expect(place(columnTrace(500, 237, '−'), 1).reduced).toBe(-1)
    expect(place(columnTrace(500, 237, '−'), 1).borrowed).toBe(9)
  })
})

describe('borrowChain', () => {
  it('names the column that pays, not the one next door', () => {
    const chain = borrowChain(columnTrace(500, 237, '−'), 0)
    expect(chain.through.map((p) => p.place)).toEqual([1])
    expect(chain.lender.place).toBe(2)
    // What the learner writes: the lender drops by one, the column in between
    // stands at nine.
    expect(chain.lender.reduced).toBe(4)
    expect(chain.through[0].borrowed).toBe(9)
  })

  it('travels two columns when both are empty', () => {
    const chain = borrowChain(columnTrace(1000, 237, '−'), 0)
    expect(chain.through.map((p) => p.place)).toEqual([1, 2])
    expect(chain.lender.place).toBe(3)
  })

  it('reports an ordinary borrow as a chain of nothing', () => {
    const chain = borrowChain(columnTrace(52, 27, '−'), 0)
    expect(chain.through).toEqual([])
    expect(chain.lender.place).toBe(1)
    expect(chain.lender.reduced).toBe(4)
  })

  it('refuses a column that does not borrow', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    // An empty chain here would be phrased into a hint about a borrow that
    // never happened, so it throws instead.
    expect(() => borrowChain(columnTrace(48, 23, '−'), 0)).toThrow(
      '48 − 23 does not borrow at place 0',
    )
  })
})

describe('stackTrace', () => {
  it('keeps each place\'s digits in operand order', () => {
    const trace = stackTrace([24, 37, 15])
    expect(stackPlace(trace, 0).digits).toEqual([4, 7, 5])
    expect(stackPlace(trace, 1).digits).toEqual([2, 3, 1])
    expect(trace.result).toBe(76)
  })

  it('carries two out of a column, not one', () => {
    // The case the binary trace cannot produce, and the reason this trace
    // exists: 9 + 8 + 7 is 24, so two tens move up.
    const trace = stackTrace([19, 18, 17])
    const ones = stackPlace(trace, 0)

    expect(ones.raw).toBe(24)
    expect(ones.digit).toBe(4)
    expect(ones.carry).toBe(2)
    expect(stackPlace(trace, 1).incoming).toBe(2)
    expect(trace.result).toBe(54)
  })

  it('separates the raw column sum from the carried total', () => {
    // `add-three-numbers` shows the raw sum in its ones step and the carried
    // total in its tens step. Both come from one trace, which is the point.
    const trace = stackTrace([24, 37, 15])
    const tens = stackPlace(trace, 1)

    expect(stackPlace(trace, 0).raw).toBe(16)
    expect(tens.raw).toBe(6)
    expect(tens.incoming).toBe(1)
    expect(tens.total).toBe(7)
  })

  it('propagates a carry through a column whose own digits add to nothing', () => {
    // The tens digits are all 0, so the column is carried entirely by what
    // arrives from below. Off-by-one handling of `incoming` fails here.
    const trace = stackTrace([309, 208, 107])
    expect(summariseStack(trace)).toEqual([
      'place 0: 9+8+7 → 4 carry 2',
      'place 1: 0+0+0 → 2 carry 0',
      'place 2: 3+2+1 → 6 carry 0',
    ])
    expect(trace.result).toBe(624)
  })

  it('reconstructs the result from the digits it wrote', () => {
    // Independent of the trace's own `result`: the digits it says the learner
    // writes must be the answer, including whatever carried off the top.
    const trace = stackTrace([95, 87, 68])
    const fromDigits = trace.places.reduce((sum, p) => sum + p.digit * 10 ** p.place, 0)
    const carriedOut = trace.places[trace.places.length - 1].carry

    expect(fromDigits + carriedOut * 10 ** trace.places.length).toBe(trace.result)
    expect(trace.result).toBe(250)
  })

  it('widens to the longest operand rather than the first', () => {
    const trace = stackTrace([7, 250, 40])
    expect(trace.places).toHaveLength(3)
    expect(stackPlace(trace, 2).digits).toEqual([0, 2, 0])
    expect(trace.result).toBe(297)
  })
})

describe('place', () => {
  it('names the trace when a skill asks for a column it does not have', () => {
    const trace = columnTrace(23, 45, '+')
    expect(() => place(trace, 2)).toThrow('has 2 columns, no place 2')
  })

  it('names the stack the same way', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    // Sharing the throw between the two traces is only worth it if the stack's
    // message still identifies which stack ran short.
    const trace = stackTrace([24, 37, 15])
    expect(() => stackPlace(trace, 2)).toThrow('24 + 37 + 15 has 2 columns, no place 2')
  })
})
