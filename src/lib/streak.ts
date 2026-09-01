/**
 * The streak: what keeps one alive, what a freeze covers, and what a run is worth.
 *
 * Pure, for the reason `pin.ts` and `checkpoint.ts` are: a node test has no DOM
 * and attaches no handlers, so a decision the store makes inline is a decision
 * no test can reach. The streak was exactly that until this module existed —
 * the break lived in `hydrate()` and the increment in `completeLesson()`, and
 * neither had a single test.
 *
 * Local calendar helpers live in `calendar.ts`, shared by streaks and review
 * scheduling. This module owns only streak policy.
 *
 * ## What is stored and what is derived
 *
 * Only `streakFreezes` is new stored state, and it is stored because spending
 * one is spending a resource. Everything else here is derived from the two
 * fields the record already carried:
 *
 * - the **multiplier** is a function of `streakCount`
 * - a **milestone** is a transition between two records, the trick `pin.ts`
 *   turns, so it fires once without a seen-flag to default and reconcile
 * - **at risk** is a function of `lastActiveDay` and today
 *
 * ## Why opening the app can spend a freeze, and why that is safe
 *
 * A freeze protects a day the learner did not open the app, so it cannot be
 * spent by hand on the day it is needed — by then the day is gone. It is bought
 * in advance and consumed on the next open.
 *
 * That makes it the one piece of streak arithmetic that is **not** a stable
 * derivation. Breaking a streak recomputes identically on every load and so was
 * never persisted; spending a freeze must be written down, and must not happen
 * twice because the app was opened twice.
 *
 * `openStreak` closes that by **moving `lastActiveDay` forward to yesterday**
 * whenever freezes cover the gap. The second open of the same day then sees a
 * gap of one, which is the ordinary alive case, and spends nothing. Idempotence
 * is a property of the returned record rather than a flag someone has to check.
 */

/**
 * The subset of `Progress` this file reads, structural for the reason
 * `pin.ts`'s is: the store imports this module, so importing its types back
 * would be a runtime cycle.
 */
type StreakDays = {
  streakCount: number
  lastActiveDay: string | null
}

type StreakRecord = StreakDays & { streakFreezes: number }

import { dayBefore, daysBetween, isDayKey } from './calendar'

/* ------------------------------------------------------------------------- *
 * Freezes
 * ------------------------------------------------------------------------- */

/** Two lessons' worth of coins, so a freeze is a real trade against a cosmetic. */
export const STREAK_FREEZE_PRICE = 30

/**
 * How many freezes can be held at once.
 *
 * **The cap is the whole reason a freeze does not make the streak meaningless.**
 * Coins arrive at a fixed rate forever, so an uncapped stock converts saving
 * directly into an unbreakable streak, and a number that cannot be lost is not
 * measuring anything. Two covers an illness or a weekend away and leaves a
 * longer absence costing what it costs.
 */
export const MAX_STREAK_FREEZES = 2

/** Whether another freeze can be bought, before the price is even considered. */
export const canHoldFreeze = (record: StreakRecord): boolean =>
  record.streakFreezes < MAX_STREAK_FREEZES

/** What opening the app on `today` does to the streak. */
export type StreakOpening = {
  streakCount: number
  lastActiveDay: string | null
  streakFreezes: number
  /**
   * How many freezes this opening spent. Non-zero is the caller's signal that
   * the result has to be persisted — a break does not, because recomputing it
   * on the next load gives the same answer.
   */
  spent: number
}

/**
 * Where the streak stands when the app opens.
 *
 * Four cases, and the order they are tested in is the order they can occur:
 *
 * 1. **Never practised.** Nothing to keep, nothing to spend.
 * 2. **Nothing missed** — practised today or yesterday. A gap of one is alive,
 *    not at risk of being spent on: yesterday's lesson still counts today.
 * 3. **Freezes cover every missed day.** They are spent, and `lastActiveDay`
 *    advances to yesterday so this cannot run twice. Note that a broken-but-
 *    zero streak is deliberately not worth protecting.
 * 4. **They do not cover it.** The streak breaks and **no freeze is spent** —
 *    partial cover saves nothing, so charging for it would take the learner's
 *    coins and give them the same broken streak.
 *
 * A gap below zero, which a device whose clock moved backwards can produce,
 * lands in case 2 and changes nothing. That is the behaviour the store had
 * before this module and there is no better answer available here.
 */
export function openStreak(record: StreakRecord, today: string): StreakOpening {
  const { streakCount, lastActiveDay, streakFreezes } = record
  const unchanged = { streakCount, lastActiveDay, streakFreezes, spent: 0 }

  if (lastActiveDay === null) return unchanged
  if (!isDayKey(lastActiveDay)) {
    return { streakCount: 0, lastActiveDay, streakFreezes, spent: 0 }
  }

  const gap = daysBetween(lastActiveDay, today)
  if (gap <= 1) return unchanged

  const missed = gap - 1
  if (streakCount > 0 && missed <= streakFreezes) {
    return {
      streakCount,
      lastActiveDay: dayBefore(today),
      streakFreezes: streakFreezes - missed,
      spent: missed,
    }
  }

  return { streakCount: 0, lastActiveDay, streakFreezes, spent: 0 }
}

/**
 * The streak after a lesson finished on `today`.
 *
 * The counterpart to `openStreak`: that one says what the days away did to a
 * streak, this one says what a day's work does. Both belong here so the two
 * halves of one rule cannot drift — the store held this half inline, which is
 * how a streak that every screen reads came to have no test of it at all.
 *
 * A second lesson the same day changes nothing: the streak counts days, not
 * lessons, and the daily goal is what counts the work inside one.
 */
export function advanceStreak(record: StreakDays, today: string): number {
  if (record.lastActiveDay === today) return record.streakCount

  const gap = record.lastActiveDay && isDayKey(record.lastActiveDay)
    ? daysBetween(record.lastActiveDay, today)
    : Infinity

  return gap === 1 ? record.streakCount + 1 : 1
}

/**
 * Whether today's lesson is still owed on a streak worth keeping.
 *
 * What the home screen warns on. False on a streak of zero: there is nothing at
 * risk yet, and warning about it would be the app inventing a loss to motivate
 * with.
 */
export const streakAtRisk = (record: StreakDays, today: string): boolean =>
  record.streakCount > 0 && record.lastActiveDay !== today

/* ------------------------------------------------------------------------- *
 * What a run is worth
 * ------------------------------------------------------------------------- */

/**
 * Coins per lesson, by how long the run is.
 *
 * Ascending, like `STREAK_MILESTONES` — both are ladders and a reader climbs
 * them the same way. `findLast` takes the highest tier cleared, which is what
 * lets the order match rather than being reversed for the lookup's benefit and
 * reversed back again wherever it is drawn.
 *
 * The base rate is unchanged at tier 0: a learner who never keeps a streak
 * earns exactly what they earned before this existed, which is what makes the
 * ladder a bonus rather than a penalty that was always being applied.
 */
export const STREAK_TIERS = [
  { days: 0, multiplier: 1 },
  { days: 7, multiplier: 1.25 },
  { days: 14, multiplier: 1.5 },
  { days: 30, multiplier: 2 },
] as const

export function streakMultiplier(streakCount: number): number {
  return STREAK_TIERS.findLast((tier) => streakCount >= tier.days)?.multiplier ?? 1
}

/**
 * What a lesson pays at this streak.
 *
 * Floored rather than rounded, so the number shown on the shop's ladder is the
 * number that lands — 15 at 1.25× is 18.75, and a learner told "1.25×" who
 * receives 19 is being paid by a rule nobody wrote down.
 */
export const coinsFor = (base: number, streakCount: number): number =>
  Math.floor(base * streakMultiplier(streakCount))

/* ------------------------------------------------------------------------- *
 * Milestones
 * ------------------------------------------------------------------------- */

/**
 * The days that pay out, and what they pay.
 *
 * The gaps widen because the value of one more day does: the third day is a
 * habit forming and the hundredth is a year's quarter of showing up. Ascending,
 * and `crossedStreakMilestone` walks from the top so a record that arrives
 * having jumped several — a restored backup — announces the furthest reached
 * rather than the first.
 */
export const STREAK_MILESTONES = [
  { days: 3, coins: 25 },
  { days: 7, coins: 75 },
  { days: 14, coins: 150 },
  { days: 30, coins: 400 },
  { days: 100, coins: 1500 },
] as const

/**
 * The next milestone a live streak is working toward, if any.
 *
 * What the home screen counts down to. `undefined` past the last one: the
 * ladder ends, and inventing a further rung so the card always has something to
 * show would be the app promising a reward it does not have.
 */
export function nextStreakMilestone(
  streakCount: number,
): { days: number; coins: number; away: number } | undefined {
  const next = STREAK_MILESTONES.find(({ days }) => days > streakCount)

  return next && { ...next, away: next.days - streakCount }
}

export type StreakMilestone = {
  days: number
  coins: number
  /** Which one this is, and how many there are, so the screen can say so. */
  index: number
  of: number
}

/**
 * The milestone one lesson took the learner past, if any.
 *
 * A transition rather than a snapshot, the same trick `crossedPinTier` turns
 * and for the same reason: it fires exactly once while storing nothing, and a
 * record restored from another device is already past the day on both sides, so
 * it celebrates nothing the learner did not just do.
 */
export function crossedStreakMilestone({
  before,
  after,
}: {
  before: { streakCount: number }
  after: { streakCount: number }
}): StreakMilestone | undefined {
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    const { days, coins } = STREAK_MILESTONES[i]
    if (before.streakCount < days && after.streakCount >= days) {
      return { days, coins, index: i + 1, of: STREAK_MILESTONES.length }
    }
  }

  return undefined
}
