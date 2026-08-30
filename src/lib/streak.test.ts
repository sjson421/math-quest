/**
 * The streak, its freezes, and what a run is worth.
 *
 * The opening cases are checked from both sides of every boundary, because a
 * gap of one is alive and a gap of two has already missed a day, and an
 * off-by-one there either eats a freeze the learner did not owe or breaks a
 * streak they kept.
 *
 * Two properties get their own blocks because they are the ones a future change
 * is most likely to break quietly: opening twice in a day must spend once, and
 * a freeze that cannot save the streak must not be taken.
 */

import { describe, expect, it } from 'vitest'
import {
  advanceStreak,
  canHoldFreeze,
  coinsFor,
  crossedStreakMilestone,
  dayBefore,
  daysBetween,
  MAX_STREAK_FREEZES,
  openStreak,
  STREAK_MILESTONES,
  streakAtRisk,
  streakMultiplier,
  todayKey,
} from './streak'

const record = (streakCount: number, lastActiveDay: string | null, streakFreezes = 0) => ({
  streakCount,
  lastActiveDay,
  streakFreezes,
})

describe('calendar days', () => {
  it('names a local day, not a UTC one', () => {
    // 31 December 2025, late evening local. UTC has already rolled over in any
    // timezone east of the meridian; the learner's streak has not.
    expect(todayKey(new Date(2025, 11, 31, 23, 30))).toBe('2025-12-31')
  })

  it('counts whole days between two keys', () => {
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0)
    expect(daysBetween('2026-03-01', '2026-03-02')).toBe(1)
    expect(daysBetween('2026-03-01', '2026-03-08')).toBe(7)
  })

  it('steps back over a month and a year boundary', () => {
    expect(dayBefore('2026-03-01')).toBe('2026-02-28')
    expect(dayBefore('2026-01-01')).toBe('2025-12-31')
  })

  it('steps back across a spring-forward boundary without losing the day', () => {
    // 8 March 2026 is the US DST switch. A naive `-86400000` lands at 23:00 on
    // the 7th, which still keys correctly — but on the autumn switch the same
    // arithmetic lands at 01:00 and the day before that is a day too far. Both
    // directions are checked here because only one of them is ever wrong.
    expect(dayBefore('2026-03-08')).toBe('2026-03-07')
    expect(dayBefore('2026-11-02')).toBe('2026-11-01')
  })
})

describe('opening the app', () => {
  it('leaves a record that has never practised alone', () => {
    expect(openStreak(record(0, null, 2), '2026-03-10')).toEqual({
      streakCount: 0,
      lastActiveDay: null,
      streakFreezes: 2,
      spent: 0,
    })
  })

  it('changes nothing when the lesson was today or yesterday', () => {
    for (const day of ['2026-03-10', '2026-03-09']) {
      const opened = openStreak(record(5, day, 1), '2026-03-10')

      expect(opened, `last active ${day}`).toEqual({
        streakCount: 5,
        lastActiveDay: day,
        streakFreezes: 1,
        spent: 0,
      })
    }
  })

  it('breaks the streak when a day was missed and nothing covers it', () => {
    expect(openStreak(record(9, '2026-03-08', 0), '2026-03-10')).toEqual({
      streakCount: 0,
      lastActiveDay: '2026-03-08',
      streakFreezes: 0,
      spent: 0,
    })
  })

  it('spends one freeze to cover one missed day', () => {
    expect(openStreak(record(9, '2026-03-08', 1), '2026-03-10')).toEqual({
      streakCount: 9,
      lastActiveDay: '2026-03-09',
      streakFreezes: 0,
      spent: 1,
    })
  })

  it('spends two to cover two, which is everything the cap allows', () => {
    expect(openStreak(record(9, '2026-03-07', 2), '2026-03-10')).toEqual({
      streakCount: 9,
      lastActiveDay: '2026-03-09',
      streakFreezes: 0,
      spent: 2,
    })
  })

  it('does not spend a freeze that cannot save the streak', () => {
    // Three days missed, two freezes held. Partial cover saves nothing, so
    // taking them would charge the learner for the same broken streak.
    const opened = openStreak(record(9, '2026-03-06', 2), '2026-03-10')

    expect(opened.streakCount, 'the streak still breaks').toBe(0)
    expect(opened.streakFreezes, 'and the freezes are still there').toBe(2)
    expect(opened.spent).toBe(0)
  })

  it('does not spend a freeze on a streak of zero', () => {
    const opened = openStreak(record(0, '2026-03-08', 2), '2026-03-10')

    expect(opened.streakFreezes).toBe(2)
    expect(opened.spent).toBe(0)
  })

  it('treats a backwards clock as nothing missed rather than as a break', () => {
    const opened = openStreak(record(4, '2026-03-12', 1), '2026-03-10')

    expect(opened.streakCount, 'the streak survives a clock change').toBe(4)
    expect(opened.spent).toBe(0)
  })
})

describe('finishing a lesson', () => {
  it('extends a streak whose last lesson was yesterday', () => {
    expect(advanceStreak(record(6, '2026-03-09'), '2026-03-10')).toBe(7)
  })

  it('restarts at one after a gap', () => {
    expect(advanceStreak(record(20, '2026-03-01'), '2026-03-10')).toBe(1)
  })

  it('starts at one for a learner who has never practised', () => {
    expect(advanceStreak(record(0, null), '2026-03-10')).toBe(1)
  })

  it('counts days rather than lessons, so a second one today changes nothing', () => {
    expect(advanceStreak(record(4, '2026-03-10'), '2026-03-10')).toBe(4)
  })

  it('picks up exactly where a freeze left the record', () => {
    // The join between the two halves of the rule: a freeze moves the last
    // active day to yesterday, so today's lesson has to read as an ordinary
    // consecutive day rather than as a restart.
    const covered = openStreak(record(9, '2026-03-08', 1), '2026-03-10')

    expect(advanceStreak(covered, '2026-03-10')).toBe(10)
  })
})

describe('opening twice in one day', () => {
  it('spends on the first open and nothing on the second', () => {
    const first = openStreak(record(9, '2026-03-08', 2), '2026-03-10')
    expect(first.spent).toBe(1)

    // The whole reason `lastActiveDay` moves forward: the second open is an
    // ordinary alive case, so idempotence needs no flag to carry it.
    const second = openStreak(first, '2026-03-10')
    expect(second.spent).toBe(0)
    expect(second.streakFreezes).toBe(first.streakFreezes)
    expect(second.streakCount).toBe(9)
  })

  it('is stable however many times it runs', () => {
    let state = openStreak(record(9, '2026-03-05', 2), '2026-03-10')
    expect(state.streakCount, 'five days missed is past the cap').toBe(0)

    for (let i = 0; i < 5; i++) {
      const next = openStreak(state, '2026-03-10')
      expect(next, `open ${i + 2}`).toEqual(state)
      state = next
    }
  })
})

describe('holding freezes', () => {
  it('allows another below the cap and refuses at it', () => {
    expect(canHoldFreeze(record(3, null, 0))).toBe(true)
    expect(canHoldFreeze(record(3, null, MAX_STREAK_FREEZES - 1))).toBe(true)
    expect(canHoldFreeze(record(3, null, MAX_STREAK_FREEZES))).toBe(false)
  })
})

describe('whether the streak is at risk', () => {
  it('is at risk on a live streak with no lesson today', () => {
    expect(streakAtRisk(record(6, '2026-03-09'), '2026-03-10')).toBe(true)
  })

  it('is safe once today has a lesson', () => {
    expect(streakAtRisk(record(6, '2026-03-10'), '2026-03-10')).toBe(false)
  })

  it('says nothing at all on a streak of zero', () => {
    // There is nothing to lose yet, and warning here would be the app inventing
    // a loss to motivate with.
    expect(streakAtRisk(record(0, null), '2026-03-10')).toBe(false)
    expect(streakAtRisk(record(0, '2026-03-01'), '2026-03-10')).toBe(false)
  })
})

describe('what a run is worth', () => {
  it.each([
    [0, 1],
    [1, 1],
    [6, 1],
    [7, 1.25],
    [13, 1.25],
    [14, 1.5],
    [29, 1.5],
    [30, 2],
    [365, 2],
  ])('pays %i-day streaks at %ix', (days, multiplier) => {
    expect(streakMultiplier(days)).toBe(multiplier)
  })

  it('leaves the base rate exactly as it was before streaks paid anything', () => {
    expect(coinsFor(15, 0)).toBe(15)
    expect(coinsFor(8, 0)).toBe(8)
    expect(coinsFor(15, 6)).toBe(15)
  })

  it('floors, so the rate shown is the rate paid', () => {
    // 15 × 1.25 is 18.75. A learner told "1.25×" who receives 19 is being paid
    // by a rule nobody wrote down.
    expect(coinsFor(15, 7)).toBe(18)
    expect(coinsFor(8, 7)).toBe(10)
    expect(coinsFor(15, 14)).toBe(22)
    expect(coinsFor(15, 30)).toBe(30)
  })
})

describe('milestones', () => {
  it('fires on the day it is reached and not the day after', () => {
    expect(crossedStreakMilestone({ before: { streakCount: 2 }, after: { streakCount: 3 } }))
      .toEqual({ days: 3, coins: 25, index: 1, of: STREAK_MILESTONES.length })

    expect(
      crossedStreakMilestone({ before: { streakCount: 3 }, after: { streakCount: 4 } }),
      'day four is past it, not on it',
    ).toBeUndefined()
  })

  it.each(STREAK_MILESTONES.map((m, i) => [m.days, m.coins, i + 1] as const))(
    'pays %i coins at day %i',
    (days, coins, index) => {
      const crossed = crossedStreakMilestone({
        before: { streakCount: days - 1 },
        after: { streakCount: days },
      })

      expect(crossed).toEqual({ days, coins, index, of: STREAK_MILESTONES.length })
    },
  )

  it('announces the furthest one when a record jumps several', () => {
    // A restored backup can arrive well past where it left. Announcing day 3
    // to someone who is on day 40 would celebrate the wrong thing.
    const crossed = crossedStreakMilestone({
      before: { streakCount: 0 },
      after: { streakCount: 40 },
    })

    expect(crossed?.days).toBe(30)
  })

  it('says nothing when the streak did not move or fell', () => {
    expect(
      crossedStreakMilestone({ before: { streakCount: 7 }, after: { streakCount: 7 } }),
    ).toBeUndefined()
    expect(
      crossedStreakMilestone({ before: { streakCount: 30 }, after: { streakCount: 0 } }),
    ).toBeUndefined()
  })
})
