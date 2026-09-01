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
}

export type ReviewCandidate = {
  skill: SkillGenerator
  progress: ReviewSkill
}

export type ReviewState = {
  strength: number
  nextReview: string | null
  reviewAttempts: number
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

/** Read one skill's review fields without changing its stored object. */
export function readReviewState(skill: ReviewSkill): ReviewState {
  const legacyStrength = clampStrength(skill.mastery, 0)
  const strength = clampStrength(skill.strength, legacyStrength)
  const nextReview =
    skill.nextReview === null
      ? null
      : isDayKey(skill.nextReview)
        ? skill.nextReview
        : legacyNextReview(skill, strength)

  return {
    strength,
    nextReview,
    reviewAttempts: normalizeReviewAttempts(skill.reviewAttempts),
  }
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
  }
}

/** Produce review fields after one correct or incorrect review result. */
export function scheduleAfterReview(
  current: Pick<ReviewState, 'strength' | 'reviewAttempts'>,
  correct: boolean,
  today: string,
): ReviewState {
  const strength = clampStrength(current.strength, 0) + (correct ? 1 : -1)
  const nextStrength = clampStrength(strength, 0)

  return {
    strength: nextStrength,
    nextReview: nextReviewDate(today, nextStrength),
    reviewAttempts: Math.min(MAX_REVIEW_ATTEMPTS, normalizeReviewAttempts(current.reviewAttempts) + 1),
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
