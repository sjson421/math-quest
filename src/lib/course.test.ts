/**
 * Where the learner is, and how far through.
 *
 * `currentUnitId` is asserted against the *real* course tree and the real unlock
 * graph, for the reason `progress.test.ts` gives: it decides which screen the app
 * opens on, and a fixture would let it drift from the curriculum it is supposed
 * to be reading. The mastery arithmetic gets synthetic units as well, because
 * "counts playable skills only" cannot be shown by a unit whose skills are all
 * built.
 */

import { describe, expect, it } from 'vitest'
import { course } from '../curriculum'
import type { CourseStage, CourseUnit, SkillEntry, UnitEntry } from '../curriculum/manifest'
import { currentUnitId, stageProgress, unitProgress } from './course'
import {
  initialProgress,
  MAX_MASTERY,
  UNLOCK_THRESHOLD,
  type Progress,
  type SkillProgress,
} from '../store/progress'

const skill = (record: Partial<SkillProgress> = {}): SkillProgress => ({
  mastery: 0,
  lastPracticed: null,
  attempts: 0,
  correct: 0,
  ...record,
})

/** A progress record with the named skills at the given mastery, rest at zero. */
function progressAt(masteries: Record<string, number>): Progress {
  const base = initialProgress()
  return {
    ...base,
    skills: {
      ...base.skills,
      ...Object.fromEntries(
        Object.entries(masteries).map(([id, mastery]) => [id, skill({ mastery })]),
      ),
    },
  }
}

const unitIds = course.flatMap(({ units }) => units.map(({ unit }) => unit.id))
const skillsIn = (unitId: string): readonly SkillEntry[] =>
  course.flatMap(({ units }) => units).find(({ unit }) => unit.id === unitId)?.skills ?? []

/** Every skill of the named units at one mastery level. */
const every = (unitIdList: string[], mastery: number): Record<string, number> =>
  Object.fromEntries(
    unitIdList.flatMap((id) => skillsIn(id).map((entry) => [entry.id, mastery])),
  )

describe('currentUnitId', () => {
  it('opens a new learner at the first unit', () => {
    expect(currentUnitId(course, initialProgress())).toBe('unit-0')
  })

  it('moves on once a unit is taken to the unlock threshold', () => {
    const progress = progressAt(every(['unit-0'], UNLOCK_THRESHOLD))

    expect(currentUnitId(course, progress)).toBe('unit-1')
  })

  it('does not go back for skills left short of maximum mastery', () => {
    // The case that fails under a "below MAX_MASTERY" rule. Every earlier skill
    // sits at 2 — enough to have opened what follows, well short of 5 — so that
    // rule would name read-numbers and open Unit 0 at a learner already in
    // Unit 2.
    const progress = progressAt({
      ...every(['unit-0', 'unit-1'], UNLOCK_THRESHOLD),
      'sub-facts-small': 1,
    })

    expect(UNLOCK_THRESHOLD).toBeLessThan(MAX_MASTERY)
    expect(currentUnitId(course, progress)).toBe('unit-2')
  })

  it('stays on a skill that is started but not yet past the threshold', () => {
    const progress = progressAt({
      ...every(['unit-0'], UNLOCK_THRESHOLD),
      'add-facts-small': UNLOCK_THRESHOLD - 1,
    })

    expect(currentUnitId(course, progress)).toBe('unit-1')
  })

  it('opens at the frontier even when the rest of its unit is locked', () => {
    // A new learner: read-numbers is the course's only root, so the other seven
    // skills of Unit 0 are locked behind it.
    const progress = initialProgress()
    const opener = skillsIn('unit-0')[0]

    expect(opener.id).toBe('read-numbers')
    expect(currentUnitId(course, progress)).toBe('unit-0')
  })

  it('skips a locked skill rather than opening at its unit', () => {
    // sub-facts-small is at mastery 0 and would be the frontier if unlocked
    // state were ignored, but nothing in Unit 1 has been touched.
    expect(currentUnitId(course, initialProgress())).not.toBe('unit-2')
  })

  it('falls back to the last unit when everything built is past the threshold', () => {
    const progress = progressAt(every(unitIds, MAX_MASTERY))

    expect(currentUnitId(course, progress)).toBe(unitIds.at(-1))
    expect(unitIds.at(-1)).toBe('unit-6')
  })

  it('has no answer for an empty course', () => {
    expect(currentUnitId([], initialProgress())).toBeUndefined()
  })
})

describe('unitProgress', () => {
  const unit0 = course[0].units[0]

  it('reports nothing for an untouched unit', () => {
    expect(unitProgress(unit0, initialProgress())).toEqual({
      earned: 0,
      possible: 8 * MAX_MASTERY,
      share: 0,
    })
  })

  it('reports half when half the available mastery is held', () => {
    const half = skillsIn('unit-0').slice(0, 4)
    const progress = progressAt(
      Object.fromEntries(half.map((entry) => [entry.id, MAX_MASTERY])),
    )

    expect(unitProgress(unit0, progress).share).toBe(0.5)
  })

  it('reports full when every playable skill is mastered', () => {
    const progress = progressAt(every(['unit-0'], MAX_MASTERY))

    expect(unitProgress(unit0, progress).share).toBe(1)
  })

  it('counts playable skills only, so a half-written unit can still read full', () => {
    // The unit *declares* four skills; two have generators. A learner who has
    // mastered both sees a finished unit, not 50 % of something unwritten.
    const declared = ['p1', 'p2', 'p3', 'p4'].map(
      (id): SkillEntry => ({ id, name: id, blurb: id }),
    )
    const partial: CourseUnit = {
      unit: { id: 'unit-partial', name: 'Partial', skills: declared } as UnitEntry,
      skills: declared.slice(0, 2),
    }
    const progress = progressAt({ p1: MAX_MASTERY, p2: MAX_MASTERY })

    expect(unitProgress(partial, progress)).toEqual({
      earned: 2 * MAX_MASTERY,
      possible: 2 * MAX_MASTERY,
      share: 1,
    })
  })

  it('falls back below full when a new generator enlarges the unit', () => {
    // The accepted cost of counting only what is playable, asserted rather than
    // left as a surprise: the same mastery reads 100% then 67% because there is
    // genuinely more of the unit to learn than there was.
    const declared = ['p1', 'p2', 'p3'].map(
      (id): SkillEntry => ({ id, name: id, blurb: id }),
    )
    const unit: UnitEntry = { id: 'unit-growing', name: 'Growing', skills: declared }
    const progress = progressAt({ p1: MAX_MASTERY, p2: MAX_MASTERY })

    const before: CourseUnit = { unit, skills: declared.slice(0, 2) }
    const after: CourseUnit = { unit, skills: declared }

    expect(unitProgress(before, progress).share).toBe(1)
    expect(unitProgress(after, progress).share).toBeCloseTo(2 / 3)
    expect(unitProgress(after, progress).possible).toBe(3 * MAX_MASTERY)
  })

  it('reports nothing rather than dividing by zero for a unit with no skills', () => {
    const empty: CourseUnit = {
      unit: { id: 'unit-empty', name: 'Empty', skills: [] } as UnitEntry,
      skills: [],
    }

    expect(unitProgress(empty, initialProgress())).toEqual({
      earned: 0,
      possible: 0,
      share: 0,
    })
  })
})

describe('stageProgress', () => {
  const stageB = course[1]

  it('aggregates every playable skill across a stage of units', () => {
    expect(stageB.stage.id).toBe('stage-b')
    expect(stageProgress(stageB, initialProgress()).possible).toBe(44 * MAX_MASTERY)
  })

  it('weights each unit by its playable skill count', () => {
    const progress = progressAt(every(['unit-1'], MAX_MASTERY))

    expect(stageProgress(stageB, progress).share).toBeCloseTo(8 / 44)
  })

  it('is zero for a stage with no playable unit', () => {
    const bare: CourseStage = { stage: stageB.stage, units: [] }

    expect(stageProgress(bare, initialProgress()).share).toBe(0)
  })
})
