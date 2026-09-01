import { describe, expect, it } from 'vitest'
import {
  isReviewDue,
  readReviewState,
  selectReviewSkills,
  REVIEW_INTERVALS,
  reviewInterval,
  scheduleAfterLesson,
  scheduleAfterReview,
  type ReviewCandidate,
} from './review'
import type { SkillGenerator } from './types'

const skill = (over: Record<string, unknown> = {}) => ({
  mastery: 0,
  lastPracticed: null,
  ...over,
})

const generator = (id: string): SkillGenerator => ({
  id,
  name: id,
  blurb: id,
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: id,
    prompt: id,
    display: { kind: 'inline', text: id },
    answer: { kind: 'exact', n: 1, d: 1 },
    inputMode: 'keypad',
    hint: id,
    solution: [{ text: id }],
    difficulty,
  }),
})

const candidate = (id: string, over: Record<string, unknown> = {}): ReviewCandidate => ({
  skill: generator(id),
  progress: skill(over),
})

describe('review state defaults', () => {
  it('starts a fresh skill unscheduled at strength zero', () => {
    expect(readReviewState(skill())).toEqual({
      strength: 0,
      nextReview: null,
      reviewAttempts: 0,
    })
  })

  it('derives a completed legacy skill without changing it', () => {
    const legacy = skill({ mastery: 3, lastPracticed: '2026-08-31' })
    const before = { ...legacy }

    expect(readReviewState(legacy)).toEqual({
      strength: 3,
      nextReview: '2026-09-07',
      reviewAttempts: 0,
    })
    expect(legacy).toEqual(before)
  })

  it('honors explicit low strength and an explicit unscheduled value', () => {
    expect(
      readReviewState(skill({ mastery: 3, lastPracticed: '2026-08-31', strength: 0, nextReview: null })),
    ).toEqual({ strength: 0, nextReview: null, reviewAttempts: 0 })
  })

  it('normalizes malformed and out-of-range fields through safe defaults', () => {
    expect(
      readReviewState(
        skill({
          mastery: 3,
          lastPracticed: '2026-08-31',
          strength: 'strong',
          nextReview: '2026-02-30',
          reviewAttempts: -2.8,
        }),
      ),
    ).toEqual({ strength: 3, nextReview: '2026-09-07', reviewAttempts: 0 })

    expect(
      readReviewState(
        skill({ mastery: 99, lastPracticed: 'not-a-day', strength: Infinity, reviewAttempts: NaN }),
      ),
    ).toEqual({ strength: 5, nextReview: null, reviewAttempts: 0 })

    expect(
      readReviewState(skill({ mastery: 3, lastPracticed: '2026-08-31', strength: 2.9, reviewAttempts: 4.9 })),
    ).toEqual({ strength: 2, nextReview: '2026-09-03', reviewAttempts: 4 })
  })

  it('leaves an edge-of-range legacy date safely unscheduled', () => {
    expect(readReviewState(skill({ mastery: 1, lastPracticed: '9999-12-31' }))).toEqual({
      strength: 1,
      nextReview: null,
      reviewAttempts: 0,
    })
  })

  it('caps review attempts before arithmetic can lose an increment', () => {
    expect(readReviewState(skill({ reviewAttempts: Number.MAX_VALUE })).reviewAttempts).toBe(
      Number.MAX_SAFE_INTEGER,
    )
    expect(
      scheduleAfterReview({ strength: 0, reviewAttempts: Number.MAX_VALUE }, false, '2026-08-31'),
    ).toMatchObject({ reviewAttempts: Number.MAX_SAFE_INTEGER })
  })
})

describe('review intervals', () => {
  it('uses fixed intervals for every strength', () => {
    expect(REVIEW_INTERVALS).toEqual([1, 1, 3, 7, 14, 30])
    for (const [strength, days] of REVIEW_INTERVALS.entries()) {
      expect(reviewInterval(strength)).toBe(days)
    }
  })
})

describe('lesson scheduling', () => {
  it('raises recall to newly reached mastery and keeps attempts', () => {
    expect(
      scheduleAfterLesson(
        skill({ mastery: 3, strength: 1, reviewAttempts: 2 }),
        '2026-08-31',
      ),
    ).toEqual({ strength: 3, nextReview: '2026-09-07', reviewAttempts: 2 })
  })

  it('keeps stronger recall when standard practice repeats', () => {
    expect(
      scheduleAfterLesson(
        skill({ mastery: 3, strength: 4, nextReview: null, reviewAttempts: 2 }),
        '2026-08-31',
      ),
    ).toEqual({ strength: 4, nextReview: '2026-09-14', reviewAttempts: 2 })
  })
})

describe('review result scheduling', () => {
  it('raises strength after a correct result', () => {
    expect(
      scheduleAfterReview({ strength: 2, reviewAttempts: 4 }, true, '2026-08-31'),
    ).toEqual({ strength: 3, nextReview: '2026-09-07', reviewAttempts: 5 })
  })

  it('lowers strength after an incorrect result', () => {
    expect(
      scheduleAfterReview({ strength: 4, reviewAttempts: 4 }, false, '2026-08-31'),
    ).toEqual({ strength: 3, nextReview: '2026-09-07', reviewAttempts: 5 })
  })

  it('keeps both bounds and still counts attempts', () => {
    expect(scheduleAfterReview({ strength: 5, reviewAttempts: 0 }, true, '2026-08-31')).toEqual({
      strength: 5,
      nextReview: '2026-09-30',
      reviewAttempts: 1,
    })
    expect(scheduleAfterReview({ strength: 0, reviewAttempts: 0 }, false, '2026-08-31')).toEqual({
      strength: 0,
      nextReview: '2026-09-01',
      reviewAttempts: 1,
    })
  })

  it('leaves a schedule safely empty at the supported date boundary', () => {
    expect(scheduleAfterLesson(skill({ mastery: 0 }), '9999-12-31')).toMatchObject({
      nextReview: null,
    })
    expect(scheduleAfterReview({ strength: 0, reviewAttempts: 0 }, false, '9999-12-31')).toMatchObject({
      nextReview: null,
    })
  })
})

describe('review due status', () => {
  it('includes scheduled and overdue days', () => {
    expect(isReviewDue({ nextReview: '2026-09-07' }, '2026-09-07')).toBe(true)
    expect(isReviewDue({ nextReview: '2026-09-07' }, '2026-09-08')).toBe(true)
  })

  it('excludes unscheduled, future, and malformed dates', () => {
    expect(isReviewDue({ nextReview: null }, '2026-09-07')).toBe(false)
    expect(isReviewDue({ nextReview: '2026-09-08' }, '2026-09-07')).toBe(false)
    expect(isReviewDue({ nextReview: '2026-02-30' }, '2026-09-07')).toBe(false)
    expect(isReviewDue({ nextReview: '2026-09-07' }, 'not-a-day')).toBe(false)
  })
})

describe('review lesson selection', () => {
  it('keeps every due skill in a small set and excludes future or unscheduled work', () => {
    const selected = selectReviewSkills(
      [
        candidate('due', { nextReview: '2026-09-07' }),
        candidate('future', { nextReview: '2026-09-08' }),
        candidate('unscheduled'),
      ],
      '2026-09-07',
    )

    expect(selected.map(({ id }) => id)).toEqual(['due'])
  })

  it('takes oldest dates first and caps a backlog at ten skills', () => {
    const candidates = Array.from({ length: 12 }, (_, index) =>
      candidate(`skill-${index}`, { nextReview: `2026-08-${String(20 + index).padStart(2, '0')}` }),
    )

    expect(selectReviewSkills(candidates, '2026-09-07').map(({ id }) => id)).toEqual(
      Array.from({ length: 10 }, (_, index) => `skill-${index}`),
    )
  })

  it('keeps curriculum order for equal dates', () => {
    const selected = selectReviewSkills(
      [
        candidate('third', { nextReview: '2026-09-07' }),
        candidate('first', { nextReview: '2026-09-01' }),
        candidate('second', { nextReview: '2026-09-01' }),
      ],
      '2026-09-07',
    )

    expect(selected.map(({ id }) => id)).toEqual(['first', 'second', 'third'])
  })

  it('normalizes legacy and malformed review fields before selecting', () => {
    const selected = selectReviewSkills(
      [
        candidate('legacy', { mastery: 3, lastPracticed: '2026-08-31' }),
        candidate('malformed', {
          mastery: 2,
          lastPracticed: '2026-09-04',
          nextReview: 'not-a-day',
          strength: 'strong',
        }),
        candidate('invalid', { nextReview: '2026-02-30' }),
      ],
      '2026-09-07',
    )

    expect(selected.map(({ id }) => id)).toEqual(['legacy', 'malformed'])
  })

  it('deduplicates without mutating input and returns a stable snapshot', () => {
    const candidates = [
      candidate('first', { nextReview: '2026-09-07' }),
      candidate('first', { nextReview: '2026-09-01' }),
      candidate('second', { nextReview: '2026-09-07' }),
    ]
    const before = candidates.map((item) => ({ ...item, progress: { ...item.progress } }))
    const selected = selectReviewSkills(candidates, '2026-09-07')

    expect(selected.map(({ id }) => id)).toEqual(['first', 'second'])
    expect(candidates).toEqual(before)

    const beforeReschedule = selected.map(({ id }) => id)
    const rescheduled = scheduleAfterReview(
      readReviewState(candidates[0].progress),
      true,
      '2026-09-07',
    )

    expect(rescheduled.nextReview).toBe('2026-09-08')
    expect(selected.map(({ id }) => id)).toEqual(beforeReschedule)
  })
})
