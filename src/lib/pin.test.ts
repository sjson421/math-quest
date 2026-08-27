/**
 * The pin tier, and the one lesson that raises it.
 *
 * The boundaries are checked from both sides rather than in the middle: an
 * off-by-one in a threshold table is invisible at 44 and at 46 and wrong at 45.
 */

import { describe, expect, it } from 'vitest'
import { PIN_THRESHOLDS, crossedPinTier, pinTier, skillsPastBar } from './pin'

const BAR = 2

/** A record with `count` skills at the bar and `below` skills short of it. */
const record = (count: number, below = 3) => ({
  skills: Object.fromEntries([
    ...Array.from({ length: count }, (_, i) => [`at-${i}`, { mastery: BAR }]),
    ...Array.from({ length: below }, (_, i) => [`under-${i}`, { mastery: BAR - 1 }]),
  ]),
})

describe('counting skills past the bar', () => {
  it('counts only those at or above it', () => {
    expect(skillsPastBar(record(4), 5), 'four at 2, none at 5').toBe(0)
    expect(skillsPastBar(record(4), BAR)).toBe(4)
  })

  it('reads a missing or malformed skill as zero rather than throwing', () => {
    const holey = { skills: { a: { mastery: 3 }, b: undefined } }

    expect(skillsPastBar(holey, BAR)).toBe(1)
  })
})

describe('the tier a count earns', () => {
  it('starts at 1, because there is no unpinned state', () => {
    expect(pinTier({ skills: {} }, BAR)).toBe(1)
    expect(pinTier(record(0), BAR)).toBe(1)
  })

  it.each(PIN_THRESHOLDS.map((at, i) => [i + 1, at] as const))(
    'reaches tier %i exactly at %i skills',
    (tier, at) => {
      if (at > 0) expect(pinTier(record(at - 1), BAR), 'one short').toBe(tier - 1)

      expect(pinTier(record(at), BAR), 'exactly at').toBe(tier)
      expect(pinTier(record(at + 1), BAR), 'one past').toBe(tier)
    },
  )

  it('holds the top tier however far past it the learner goes', () => {
    expect(pinTier(record(PIN_THRESHOLDS.at(-1)! * 2), BAR)).toBe(PIN_THRESHOLDS.length)
  })
})

describe('crossing a boundary', () => {
  it('reports the tier the lesson reached', () => {
    const upgrade = crossedPinTier({
      before: record(PIN_THRESHOLDS[1] - 1),
      after: record(PIN_THRESHOLDS[1]),
      threshold: BAR,
    })

    expect(upgrade?.tier).toBe(2)
    expect(upgrade?.name.length).toBeGreaterThan(0)
  })

  it('fires once — a later lesson at the same tier finds nothing', () => {
    const after = record(PIN_THRESHOLDS[1] + 5)

    expect(
      crossedPinTier({ before: record(PIN_THRESHOLDS[1]), after, threshold: BAR }),
    ).toBeUndefined()
  })

  it('announces nothing for a record restored already past the boundary', () => {
    // Both sides are past it, which is what a restore looks like: the crossing
    // happened on another device and is not this lesson's to celebrate.
    const restored = record(PIN_THRESHOLDS[2] + 1)

    expect(
      crossedPinTier({ before: restored, after: restored, threshold: BAR }),
    ).toBeUndefined()
  })

  it('reports one upgrade when a lesson vaults two thresholds at once', () => {
    // Not reachable from one lesson today, but the rule should be the reached
    // tier rather than the next one up — a learner should never be shown a pin
    // they are already past.
    const upgrade = crossedPinTier({
      before: record(0),
      after: record(PIN_THRESHOLDS[2]),
      threshold: BAR,
    })

    expect(upgrade?.tier).toBe(3)
  })

  it('never reports a downgrade when the course grows under the learner', () => {
    // Adding unpractised skills raises the denominator of any share and leaves
    // an absolute count alone. This is the check that keeps it a count.
    const before = record(PIN_THRESHOLDS[2])
    const after = record(PIN_THRESHOLDS[2], 40)

    expect(pinTier(after, BAR)).toBe(pinTier(before, BAR))
    expect(crossedPinTier({ before, after, threshold: BAR })).toBeUndefined()
  })
})
