import { addDays, daysBetween, isDayKey } from './calendar'
import type { SkillGenerator } from './types'

/**
 * Review fields are optional in stored skills because older progress blobs do
 * not carry them. The scheduler reads this structural shape so it stays pure
 * and independent of the store that persists it.
 */
export type ReviewSkill = {
  mastery: number
  lastPracticed: string | null
  strength?: number
  nextReview?: string | null
  reviewAttempts?: number
  reviewCorrect?: number
}

export type ReviewCandidate = {
  skill: SkillGenerator
  progress: ReviewSkill
}

export type ReviewState = {
  strength: number
  nextReview: string | null
  reviewAttempts: number
  reviewCorrect: number
}

/** Days between a review and its next return, indexed by strength 0 through 5. */
export const REVIEW_INTERVALS = [1, 1, 3, 7, 14, 30] as const
export const REVIEW_LESSON_LIMIT = 10

const MAX_STRENGTH = REVIEW_INTERVALS.length - 1
const MAX_REVIEW_ATTEMPTS = Number.MAX_SAFE_INTEGER

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

function clampStrength(value: unknown, fallback: number): number {
  const source = isFiniteNumber(value) ? value : fallback
  return Math.max(0, Math.min(MAX_STRENGTH, Math.floor(source)))
}

function normalizeReviewAttempts(value: unknown): number {
  return isFiniteNumber(value)
    ? Math.min(MAX_REVIEW_ATTEMPTS, Math.max(0, Math.floor(value)))
    : 0
}

/**
 * Bounded above by the attempt count it is divided by, which is the point rather
 * than a nicety: it is what stops `scheduleAfterReview()` healing a hand-edited
 * or corrupt blob into a perfect record — without it, an answer that was wrong
 * would carry a count above its attempts forward as one more right answer.
 */
function normalizeReviewCorrect(value: unknown, attempts: number): number {
  return isFiniteNumber(value) ? Math.min(attempts, Math.max(0, Math.floor(value))) : 0
}

export function reviewInterval(strength: number): number {
  return REVIEW_INTERVALS[clampStrength(strength, 0)]
}

function nextReviewDate(day: string, strength: number): string | null {
  try {
    return addDays(day, reviewInterval(strength))
  } catch {
    // A day at the supported range's edge has no representable following day.
    return null
  }
}

function legacyNextReview(skill: ReviewSkill, strength: number): string | null {
  return isDayKey(skill.lastPracticed)
    ? nextReviewDate(skill.lastPracticed, strength)
    : null
}

/**
 * One skill's strength, falling back to the mastery a record predating review
 * scheduling implies.
 */
function readStrength(skill: ReviewSkill): number {
  return clampStrength(skill.strength, clampStrength(skill.mastery, 0))
}

/** Read one skill's review fields without changing its stored object. */
export function readReviewState(skill: ReviewSkill): ReviewState {
  const strength = readStrength(skill)
  const nextReview =
    skill.nextReview === null
      ? null
      : isDayKey(skill.nextReview)
        ? skill.nextReview
        : legacyNextReview(skill, strength)

  const reviewAttempts = normalizeReviewAttempts(skill.reviewAttempts)

  return {
    strength,
    nextReview,
    reviewAttempts,
    reviewCorrect: normalizeReviewCorrect(skill.reviewCorrect, reviewAttempts),
  }
}

/**
 * The next-review date a skill's own last practice implies, and none when it has
 * no valid one.
 *
 * The rule `readReviewState()` already applies to a legacy record, named so the
 * reversal can restore a schedule instead of storing one — see `unmark()` in
 * `lib/skip.ts`. A next-review date is `lastPracticed + interval(strength)`, so
 * it is recoverable and a stored copy of it would be a second field to write,
 * clear, normalise and defend.
 */
export function nextReviewFromPractice(skill: ReviewSkill): string | null {
  return legacyNextReview(skill, readStrength(skill))
}

/** Start or refresh a schedule after a standard lesson completion. */
export function scheduleAfterLesson(skill: ReviewSkill, today: string): ReviewState {
  const current = readReviewState(skill)
  const mastery = clampStrength(skill.mastery, 0)
  const strength = Math.max(current.strength, mastery)

  return {
    strength,
    nextReview: nextReviewDate(today, strength),
    reviewAttempts: current.reviewAttempts,
    reviewCorrect: current.reviewCorrect,
  }
}

/**
 * Schedule the review a skip grants, at the strength the skill already holds.
 *
 * The strength is pinned rather than derived because the read-time default
 * derives strength from mastery: a record predating review scheduling, raised to
 * `SKIP_MASTERY` by a mark, would otherwise read at strength 3 and return in
 * seven days — slower than a practised skill, which is the opposite of watching
 * it. Call this *before* the mastery is raised.
 *
 * Nothing is lowered. Strength is earned recall evidence, so a skill practised
 * part-way keeps the interval it bought; the risky skill — the one nobody has
 * touched — already sits at 0 and is therefore due the next day.
 */
export function scheduleAfterSkip(skill: ReviewSkill, today: string): ReviewState {
  const current = readReviewState(skill)

  return { ...current, nextReview: nextReviewDate(today, current.strength) }
}

/** Produce review fields after one correct or incorrect review result. */
export function scheduleAfterReview(
  current: Pick<ReviewState, 'strength' | 'reviewAttempts' | 'reviewCorrect'>,
  correct: boolean,
  today: string,
): ReviewState {
  const strength = clampStrength(current.strength, 0) + (correct ? 1 : -1)
  const nextStrength = clampStrength(strength, 0)
  const priorAttempts = normalizeReviewAttempts(current.reviewAttempts)
  // Bounded by the attempts already recorded rather than by the one being added,
  // so a blob claiming more correct answers than attempts cannot have its
  // correct count raised by an answer that was wrong.
  const priorCorrect = normalizeReviewCorrect(current.reviewCorrect, priorAttempts)
  const reviewAttempts = Math.min(MAX_REVIEW_ATTEMPTS, priorAttempts + 1)

  return {
    strength: nextStrength,
    nextReview: nextReviewDate(today, nextStrength),
    reviewAttempts,
    // Counted only while the attempt it belongs to was counted, so a saturated
    // record cannot drift toward a perfect one it never earned.
    reviewCorrect: priorCorrect + (correct && reviewAttempts > priorAttempts ? 1 : 0),
  }
}

/** A scheduled skill is due on its date and every local day after it. */
export function isReviewDue(
  state: Pick<ReviewState, 'nextReview'>,
  today: string,
): boolean {
  return isDayKey(state.nextReview) && isDayKey(today) && daysBetween(state.nextReview, today) >= 0
}

/** Pick one deterministic, bounded source snapshot for a review lesson. */
export function selectReviewSkills(
  candidates: readonly ReviewCandidate[],
  today: string,
): SkillGenerator[] {
  const seen = new Set<string>()
  const due = candidates.flatMap((candidate, index) => {
    if (seen.has(candidate.skill.id)) return []
    seen.add(candidate.skill.id)

    const review = readReviewState(candidate.progress)
    if (!isReviewDue(review, today)) return []

    return [{ candidate, nextReview: review.nextReview!, index }]
  })

  return due
    .toSorted((left, right) =>
      left.nextReview === right.nextReview
        ? left.index - right.index
        : left.nextReview.localeCompare(right.nextReview),
    )
    .slice(0, REVIEW_LESSON_LIMIT)
    .map(({ candidate }) => candidate.skill)
}
