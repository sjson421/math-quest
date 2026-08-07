import { describe, expect, it } from 'vitest'
import { parseInput } from './answer'
import { placement, tickEntry, tickLabel, ticks, type NumberLineSpec } from './number-line'
import { rational, toNumber, type Rational } from './rational'

const spec = (start: Rational, step: Rational, count: number): NumberLineSpec => ({
  start,
  step,
  count,
})

const r = (n: number, d = 1) => rational(n, d)

/** The four shapes of line the course actually asks for. */
const LINES = {
  wholeNumbers: spec(r(-5), r(1), 11),
  quarters: spec(r(0), r(1, 4), 9),
  thirds: spec(r(-1), r(1, 3), 7),
  fifths: spec(r(0), r(1, 5), 6),
}

describe('the tick set', () => {
  it('runs from start to start + (count - 1) x step, ascending', () => {
    expect(ticks(LINES.wholeNumbers).map(toNumber)).toEqual([
      -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
    ])
    expect(ticks(LINES.quarters).map(tickEntry)).toEqual([
      '0', '1/4', '1/2', '3/4', '1', '5/4', '3/2', '7/4', '2',
    ])
  })

  it('keeps a third exact rather than reaching it by decimal', () => {
    // 1/3 has no terminating decimal, so a line built by adding 0.333… drifts
    // and its ticks stop being the values they are drawn as.
    expect(ticks(LINES.thirds).map(tickEntry)).toEqual([
      '-1', '-2/3', '-1/3', '0', '1/3', '2/3', '1',
    ])
  })

  it('accepts a line of one tick', () => {
    expect(ticks(spec(r(7), r(1), 1)).map(tickEntry)).toEqual(['7'])
  })

  it('refuses a step that would not ascend', () => {
    expect(() => ticks(spec(r(0), r(-1), 5))).toThrow(/step must be positive/)
    expect(() => ticks(spec(r(0), r(0), 5))).toThrow(/step must be positive/)
  })

  it('refuses a count that is not a positive whole number', () => {
    expect(() => ticks(spec(r(0), r(1), 0))).toThrow(/count must be/)
    expect(() => ticks(spec(r(0), r(1), 2.5))).toThrow(/count must be/)
  })
})

describe('what a tick submits', () => {
  it('round-trips every tick of every line back to the value it was', () => {
    // The point of the check: the expected rational is recomputed from the tick
    // itself, never read back out of the string under test. Comparing
    // `tickEntry()` against `parseInput(tickEntry())` would agree with itself
    // however wrong both were.
    const wrong: string[] = []

    for (const [name, line] of Object.entries(LINES)) {
      ticks(line).forEach((tick, i) => {
        const parsed = parseInput(tickEntry(tick))
        if (parsed.kind !== 'rational') {
          wrong.push(`${name}[${i}]: ${tickEntry(tick)} did not parse`)
          return
        }
        if (parsed.value.n !== tick.n || parsed.value.d !== tick.d) {
          wrong.push(`${name}[${i}]: ${tickEntry(tick)} parsed as ${parsed.value.n}/${parsed.value.d}`)
        }
      })
    }

    expect(wrong).toEqual([])
  })

  it('names the tick that fails to round-trip', () => {
    // The reporter above returns an empty list on a clean line, which looks
    // identical to a reporter that checks nothing.
    const entry = tickEntry(r(1, 3))
    const parsed = parseInput(entry)

    expect(entry).toBe('1/3')
    expect(parsed.kind === 'rational' && parsed.value).toEqual({ n: 1, d: 3 })
    expect(parseInput('1/').kind).toBe('invalid')
  })
})

describe('what a tick reads as', () => {
  it('shows a whole number as a whole number and a fraction as a fraction', () => {
    expect(tickLabel(r(3))).toBe('3')
    expect(tickLabel(r(3, 4))).toBe('3/4')
    expect(tickLabel(r(0))).toBe('0')
  })

  it('draws a negative with the typographic minus the rest of the app uses', () => {
    // Deliberately not the same string the checker parses: `−3` is what the pad
    // and every display show, `-3` is what `parseInput` reads.
    expect(tickLabel(r(-3))).toBe('−3')
    expect(tickEntry(r(-3))).toBe('-3')
    expect(tickLabel(r(-3, 4))).toBe('−3/4')
  })
})

describe('placing a value', () => {
  const whole = ticks(LINES.wholeNumbers)
  const quarters = ticks(LINES.quarters)

  it('has nothing placed and nothing to confirm before the first tap', () => {
    expect(placement(whole, '')).toEqual({ index: -1, canConfirm: false })
  })

  it('marks the tapped tick, whose value is what confirming submits', () => {
    expect(placement(whole, '-3')).toEqual({ index: 2, canConfirm: true })
    expect(tickEntry(whole[2])).toBe('-3')

    expect(placement(quarters, '3/4')).toEqual({ index: 3, canConfirm: true })
    expect(tickEntry(quarters[3])).toBe('3/4')
  })

  it('places on the tick tapped most recently, not the one before it', () => {
    const first = placement(whole, '-3')
    const second = placement(whole, '4')

    expect(first.index).not.toBe(second.index)
    expect(second).toEqual({ index: 9, canConfirm: true })
  })

  it('offers no confirmation for a value the line does not carry', () => {
    // Not reachable by tapping — but a value off the line is not a placement,
    // and confirming one would submit an answer the learner never chose.
    expect(placement(whole, '99').canConfirm).toBe(false)
    expect(placement(quarters, '1/3').canConfirm).toBe(false)
  })
})
