/**
 * The pin tier: the one thing the learner wears that says how far they have come.
 *
 * Pure, for the reason `checkpoint.ts` and `submit.ts` are: a node test has no
 * DOM and attaches no handlers, so a decision a component makes for itself is
 * unreachable from a test.
 *
 * **Nothing here is stored.** The tier is a function of mastery the record
 * already holds, and the upgrade is a *transition* between two records rather
 * than a snapshot of one — which is what makes the fanfare fire exactly once
 * without a seen-flag to default, reconcile, and argue about on restore. It is
 * the same trick `crossedStageCheckpoint()` turns, for the same reason.
 */

/**
 * The subset of `Progress` this file reads. Structural rather than the real
 * type because `store/progress.ts` imports *this* module, so importing its
 * values back would be a runtime cycle — which is also why `threshold` arrives
 * as an argument instead of as `UNLOCK_THRESHOLD`, keeping one authority for it.
 */
type MasteryRecord = {
  skills: Readonly<Record<string, { mastery: number } | undefined>>
}

export type PinTier = 1 | 2 | 3 | 4 | 5

export type PinUpgrade = {
  tier: PinTier
  /** What the new frame is called, for the copy on the upgrade screen. */
  name: string
  /** How many tiers there are, so the screen can say where this one sits. */
  of: number
}

/**
 * Skills past the bar, per tier.
 *
 * **The bar is the unlock threshold**, the same one that decides a skill has
 * been taken far enough to open what follows. Reusing it means the pin measures
 * the thing the course already measures rather than inventing a second idea of
 * progress that could disagree with the tree.
 *
 * **An absolute count, deliberately, not a share of what is playable.** A share
 * has today's playable skills in its denominator, so shipping Stage G would drop
 * every learner's percentage overnight and demote a pin nobody had touched. A
 * count only ever rises. The accepted cost is that these numbers are calibrated
 * against a course that is still growing: 192 of the 201 skills are playable, so
 * 150 is reachable now and stays reachable.
 */
export const PIN_THRESHOLDS = [0, 15, 45, 90, 150] as const

/**
 * What each frame is called. Describes the pin, never the learner.
 *
 * Nouns rather than adjectives, because they have to read in "Ring — tier 2 of
 * 5" as well as on their own. An earlier set was adjectival and drifted out of
 * step with the geometry the moment the ladder was reordered — a pin announced
 * as "backed" while it was drawing a bare ring. Keep these beside
 * `charm.tsx`'s `tieredCharms` and change them together.
 *
 * Index 0 is never announced: tier 1 is the floor, and `crossedPinTier` only
 * ever reports an increase.
 */
const TIER_NAMES = ['Plain', 'Ring', 'Medal', 'Studded medal', 'Rosette'] as const

/** How many skills the learner has taken to or past the bar. */
export function skillsPastBar(record: MasteryRecord, threshold: number): number {
  return Object.values(record.skills).filter((skill) => (skill?.mastery ?? 0) >= threshold)
    .length
}

/** The tier that count earns. Always at least 1 — there is no unpinned state. */
export function pinTier(record: MasteryRecord, threshold: number): PinTier {
  const count = skillsPastBar(record, threshold)
  // Highest threshold the count clears. Walked from the top so the first hit
  // wins and a count past every threshold cannot fall through to tier 1.
  for (let i = PIN_THRESHOLDS.length - 1; i > 0; i--)
    if (count >= PIN_THRESHOLDS[i]) return (i + 1) as PinTier

  return 1
}

type CrossingOptions = {
  before: MasteryRecord
  after: MasteryRecord
  threshold: number
}

/**
 * The tier boundary crossed by one persisted lesson, if any.
 *
 * A transition, not a snapshot, which is what makes it fire once while storing
 * nothing: a later lesson at the same tier finds no crossing, and a record
 * restored from another device is already past the boundary on both sides, so
 * it announces nothing rather than celebrating work the learner did not just do.
 */
export function crossedPinTier({
  before,
  after,
  threshold,
}: CrossingOptions): PinUpgrade | undefined {
  const was = pinTier(before, threshold)
  const now = pinTier(after, threshold)

  if (now <= was) return undefined

  return { tier: now, name: TIER_NAMES[now - 1], of: PIN_THRESHOLDS.length }
}
