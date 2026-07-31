import { describe, expect, it } from 'vitest'
import { columnTrace, digitAt, place } from './column'

/** Compact view of one column, so a failure names the place that is wrong. */
const summarise = (trace: ReturnType<typeof columnTrace>) =>
  trace.places.map((p) => `place ${p.place}: ${p.top}/${p.bottom} → ${p.digit} carry ${p.carry}`)

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
})

describe('place', () => {
  it('names the trace when a skill asks for a column it does not have', () => {
    const trace = columnTrace(23, 45, '+')
    expect(() => place(trace, 2)).toThrow('has 2 columns, no place 2')
  })
})
