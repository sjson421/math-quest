/**
 * Marking a block known and taking it back, against the real course tree.
 *
 * Blocks come from the manifest rather than a fixture because the whole point of
 * these functions is that the curriculum decides what a block holds — a fixture
 * would let the two drift apart, which is the failure the derivation exists to
 * remove. `unit-0` is the first block a learner could skip and the one whose
 * downstream unlock is checkable; `stage-a` is the same skills addressed as a
 * stage; `stage-h` is a block nobody can play yet.
 */

import { describe, expect, it } from 'vitest'
import { course, courseUnitById, getSkill, implementedSkillIds, skillStates } from '../curriculum'
import { stages, allUnits } from '../curriculum/manifest'
import {
  UNLOCK_THRESHOLD,
  MAX_MASTERY,
  initialProgress,
  isUnlocked,
  type Progress,
  type SkillProgress,
} from '../store/progress'
import { readReviewState, selectReviewSkills } from './review'
import { makeRng } from './rng'
import {
  blockHasDeclaredSource,
  checkPasses,
  CHECK_PROBLEM_COUNT,
  SKIP_MASTERY,
  markKnown,
  nextFreshStartStage,
  playableBlockSkills,
  readPriorMastery,
  readSource,
  selectCheckSkills,
  skipResultDestination,
  unmark,
  unitCanBeSkipped,
  warmUpSuggestion,
} from './skip'

/** The local day every mark below is made on, so its schedule is checkable. */
const TODAY = '2026-08-31'

const UNIT = 'unit-0'
const STAGE = 'stage-a'
/** A block whose stage is waiting on infrastructure, so none of it is playable. */
const PLANNED_UNIT = 'unit-22'
const PLANNED_STAGE = 'stage-h'

const unit0 = courseUnitById.get(UNIT)!.skills.map((skill) => skill.id)
/** The first skill behind the whole of Unit 0 — what a skip of it should open. */
const DOWNSTREAM = 'add-facts-small'

const skill = (record: Partial<SkillProgress> = {}): SkillProgress => ({
  mastery: 0,
  lastPracticed: null,
  attempts: 0,
  correct: 0,
  ...record,
})

/** A progress record with the named skills overridden, everything else at zero. */
function progressWith(skills: Record<string, Partial<SkillProgress>>): Progress {
  const base = initialProgress()
  return {
    ...base,
    skills: {
      ...base.skills,
      ...Object.fromEntries(Object.entries(skills).map(([id, s]) => [id, skill(s)])),
    },
  }
}

const sourcesOf = (progress: Progress, ids: readonly string[]) =>
  ids.map((id) => readSource(progress.skills[id]))

const masteriesOf = (progress: Progress, ids: readonly string[]) =>
  ids.map((id) => progress.skills[id]?.mastery)

describe('playable skip blocks', () => {
  it('reads stage and unit membership from the playable course tree', () => {
    expect(playableBlockSkills(UNIT)?.map(({ id }) => id)).toEqual(unit0)
    expect(playableBlockSkills(STAGE)?.map(({ id }) => id)).toEqual(unit0)
    expect(playableBlockSkills(PLANNED_UNIT)).toBeUndefined()
    expect(playableBlockSkills('not-a-block')).toBeUndefined()
  })

  it('finds declared source without treating practised mastery as a skip', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 3, attempts: 20 } })
    const skipped = progressWith({ [unit0[0]]: { mastery: 3, source: 'tested-out' } })

    expect(blockHasDeclaredSource(practised, UNIT)).toBe(false)
    expect(blockHasDeclaredSource(skipped, UNIT)).toBe(true)
    expect(blockHasDeclaredSource(initialProgress(), 'not-a-block')).toBe(false)
  })

  it('allows wholly locked or wholly unstarted units, but not part-practised ones', () => {
    const fresh = initialProgress()
    expect(unitCanBeSkipped(UNIT, fresh, (id) => isUnlocked(id, fresh))).toBe(true)

    const locked = progressWith({})
    expect(unitCanBeSkipped('unit-1', locked, (id) => isUnlocked(id, locked))).toBe(true)

    const started = progressWith({ [unit0[0]]: { attempts: 1 } })
    expect(unitCanBeSkipped(UNIT, started, (id) => isUnlocked(id, started))).toBe(false)
    expect(unitCanBeSkipped(PLANNED_UNIT, fresh, () => false)).toBe(false)
  })

  it('finds the next stage in curriculum order by remaining skip mastery', () => {
    const fresh = initialProgress()
    expect(nextFreshStartStage(fresh)?.stage.id).toBe(STAGE)

    const stageSkills = courseUnitById.get(UNIT)!.skills.map(({ id }) => id)
    const afterStage = progressWith(
      Object.fromEntries(stageSkills.map((id) => [id, { mastery: SKIP_MASTERY }])),
    )

    expect(nextFreshStartStage(afterStage)?.stage.id).toBe('stage-b')
  })
})

describe('check selection and scoring', () => {
  it('takes eight distinct skills from a large block deterministically', () => {
    const first = selectCheckSkills('stage-b', makeRng(42))!
    const second = selectCheckSkills('stage-b', makeRng(42))!

    expect(first).toHaveLength(CHECK_PROBLEM_COUNT)
    expect(new Set(first.map(({ id }) => id)).size).toBe(CHECK_PROBLEM_COUNT)
    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id))
  })

  it('covers every skill before repeating in a small block', () => {
    const small = course
      .flatMap((stage) => stage.units)
      .find(({ skills }) => skills.length < CHECK_PROBLEM_COUNT)!
    const ids = small.skills.map(({ id }) => id)
    const selected = selectCheckSkills(small.unit.id, makeRng(42))!

    expect(selected).toHaveLength(CHECK_PROBLEM_COUNT)
    expect(new Set(selected.slice(0, ids.length).map(({ id }) => id))).toEqual(new Set(ids))
  })

  it('refuses unknown and empty blocks and keeps only seven or eight as passing', () => {
    expect(selectCheckSkills('not-a-block', makeRng(1))).toBeUndefined()
    expect(selectCheckSkills(PLANNED_STAGE, makeRng(1))).toBeUndefined()
    expect(checkPasses(6)).toBe(false)
    expect(checkPasses(7)).toBe(true)
    expect(checkPasses(8)).toBe(true)
    expect(checkPasses(9)).toBe(false)
  })
})

describe('skip result routing', () => {
  const back = { name: 'units' as const, stageId: 'stage-a' }

  it('returns fresh-start passes to home for the next stage', () => {
    expect(skipResultDestination(true, true, 'unit-1', back)).toBeNull()
  })

  it('returns unit passes to their exact tree level', () => {
    expect(skipResultDestination(true, false, undefined, back)).toEqual(back)
  })

  it('returns failed checks to the frontier unit', () => {
    expect(skipResultDestination(false, true, 'unit-1', back)).toEqual({
      name: 'skills',
      unitId: 'unit-1',
    })
  })

  it('falls back to the original tree level when no frontier exists', () => {
    expect(skipResultDestination(false, false, undefined, back)).toEqual(back)
  })
})

describe('reading a skill s source', () => {
  it('reads a record written before skipping existed as practised', () => {
    const legacy = skill({ mastery: 3, attempts: 40, correct: 31 })

    expect(readSource(legacy)).toBe('practiced')
    expect(legacy).not.toHaveProperty('source')
  })

  it('reads back each value it stores', () => {
    expect(readSource(skill({ source: 'practiced' }))).toBe('practiced')
    expect(readSource(skill({ source: 'tested-out' }))).toBe('tested-out')
    expect(readSource(skill({ source: 'self-assessed' }))).toBe('self-assessed')
  })

  it('reads a value it does not recognise as practised rather than failing', () => {
    // A hand-edited backup or a corrupt blob. Practised is the reading that
    // cannot destroy anything: a reversal leaves a practised skill alone.
    const corrupt = skill({ mastery: 4, source: 'guessed' as never })

    expect(readSource(corrupt)).toBe('practiced')
    expect(corrupt.mastery).toBe(4)
  })

  it('leaves fields it does not know about alone', () => {
    const withExtras = { ...skill({ mastery: 2 }), fromALaterVersion: 'kept' }

    expect(readSource(withExtras)).toBe('practiced')
    expect(withExtras.fromALaterVersion).toBe('kept')
  })

  it('reads a missing record as practised', () => {
    expect(readSource(undefined)).toBe('practiced')
  })

  it('answers the same way however many times the same record is read', () => {
    const legacy = skill({ mastery: 3 })

    expect(readSource(legacy)).toBe(readSource(legacy))
    expect(legacy).toEqual(skill({ mastery: 3 }))
  })
})

describe('reading the mastery a mark found', () => {
  it('reads a record written before the field existed as zero', () => {
    const legacy = skill({ mastery: 3, attempts: 40, correct: 31 })

    expect(readPriorMastery(legacy)).toBe(0)
    expect(legacy).not.toHaveProperty('priorMastery')
  })

  it('reads back a level it stores', () => {
    expect(readPriorMastery(skill({ mastery: SKIP_MASTERY, priorMastery: 2 }))).toBe(2)
  })

  it('reads a negative or fractional level as zero', () => {
    // A hand-edited backup. Zero is the level a skip finds on a skill nobody has
    // touched, and the only reading that cannot invent progress.
    expect(readPriorMastery(skill({ mastery: 3, priorMastery: -2 }))).toBe(0)
    expect(readPriorMastery(skill({ mastery: 3, priorMastery: 1.5 }))).toBe(0)
    expect(readPriorMastery(skill({ mastery: 3, priorMastery: NaN }))).toBe(0)
    expect(readPriorMastery(skill({ mastery: 3, priorMastery: '2' as never }))).toBe(0)
  })

  it('never reads back more than the skill currently holds', () => {
    // Taking a block back is the one thing allowed to lower a mastery level, so
    // no stored value may make it raise one.
    expect(readPriorMastery(skill({ mastery: 2, priorMastery: 5 }))).toBe(2)
    expect(readPriorMastery(skill({ mastery: 0, priorMastery: 4 }))).toBe(0)
    // The level clamped against is read by the same rule. Clamping against a
    // corrupt one directly would return it, and a reversal would write it.
    expect(readPriorMastery(skill({ mastery: NaN, priorMastery: 1 }))).toBe(0)
    expect(readPriorMastery(skill({ mastery: 2.5, priorMastery: 1 }))).toBe(0)
  })

  it('leaves fields it does not know about alone', () => {
    const withExtras = { ...skill({ mastery: 3, priorMastery: 1 }), fromALaterVersion: 'kept' }

    expect(readPriorMastery(withExtras)).toBe(1)
    expect(withExtras.fromALaterVersion).toBe('kept')
  })

  it('reads a missing record as zero', () => {
    expect(readPriorMastery(undefined)).toBe(0)
  })

  it('answers the same way however many times the same record is read', () => {
    const legacy = skill({ mastery: 3 })

    expect(readPriorMastery(legacy)).toBe(readPriorMastery(legacy))
    expect(legacy).toEqual(skill({ mastery: 3 }))
  })
})

describe('marking a block known', () => {
  it('raises every skill in a unit and records why', () => {
    const before = initialProgress()

    const after = markKnown(before, UNIT, 'self-assessed', TODAY)!

    expect(after).not.toBeNull()
    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => SKIP_MASTERY))
    expect(sourcesOf(after, unit0)).toEqual(unit0.map(() => 'self-assessed'))
  })

  it('opens what the block was holding up', () => {
    const before = initialProgress()
    expect(isUnlocked(DOWNSTREAM, before)).toBe(false)

    const after = markKnown(before, UNIT, 'tested-out', TODAY)!

    // Mastery 3 clears the threshold on purpose, and stops short of the maximum
    // so the skill still reads as not needed yet rather than finished.
    expect(SKIP_MASTERY).toBeGreaterThan(UNLOCK_THRESHOLD)
    expect(SKIP_MASTERY).toBeLessThan(MAX_MASTERY)
    expect(isUnlocked(DOWNSTREAM, after)).toBe(true)
  })

  it('takes a stage as one block too', () => {
    const after = markKnown(initialProgress(), STAGE, 'tested-out', TODAY)!

    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => SKIP_MASTERY))
  })

  it('never lowers mastery the learner earned, and leaves its source practised', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 5, attempts: 60, correct: 52 } })

    const after = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    expect(after.skills[unit0[0]].mastery).toBe(5)
    expect(readSource(after.skills[unit0[0]])).toBe('practiced')
    expect(after.skills[unit0[1]].mastery).toBe(SKIP_MASTERY)
  })

  it('records where a part-practised skill came from, so it can be returned there', () => {
    // Mastery 1 is below UNLOCK_THRESHOLD, so leaving it where it stands would
    // keep the course shut and defeat the skip. Once raised it is
    // indistinguishable from a skill found at 0 unless the level is written down.
    const practised = progressWith({ [unit0[0]]: { mastery: 1, attempts: 8, correct: 5 } })

    const after = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    expect(after.skills[unit0[0]].mastery).toBe(SKIP_MASTERY)
    expect(readSource(after.skills[unit0[0]])).toBe('self-assessed')
    expect(readPriorMastery(after.skills[unit0[0]])).toBe(1)
  })

  it('records no prior mastery for a skill it never raised', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 5, attempts: 60, correct: 52 } })

    const after = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    expect(after.skills[unit0[0]]).not.toHaveProperty('priorMastery')
    expect(readPriorMastery(after.skills[unit0[1]])).toBe(0)
  })

  it('refuses a block the curriculum does not declare', () => {
    expect(markKnown(initialProgress(), 'not-a-block', 'tested-out', TODAY)).toBeNull()
  })

  it('refuses a block that is already known, so nothing is written', () => {
    const known = markKnown(initialProgress(), UNIT, 'tested-out', TODAY)!

    expect(markKnown(known, UNIT, 'self-assessed', TODAY)).toBeNull()
  })

  it('leaves a block nobody can play alone, and still locked', () => {
    const before = initialProgress()

    expect(markKnown(before, PLANNED_UNIT, 'tested-out', TODAY)).toBeNull()
    expect(markKnown(before, PLANNED_STAGE, 'tested-out', TODAY)).toBeNull()

    for (const entry of allUnits.find((unit) => unit.id === PLANNED_UNIT)!.skills) {
      expect(skillStates.get(entry.id)).toBe('planned')
      expect(before.skills).not.toHaveProperty(entry.id)
      expect(isUnlocked(entry.id, before)).toBe(false)
    }
  })

  it('writes only skills that can be played', () => {
    const after = markKnown(initialProgress(), STAGE, 'tested-out', TODAY)!

    for (const [id, record] of Object.entries(after.skills))
      if (record.mastery > 0) expect(implementedSkillIds).toContain(id)
  })

  it('leaves the record it was given untouched', () => {
    const before = initialProgress()
    const copy = structuredClone(before)

    markKnown(before, UNIT, 'tested-out', TODAY)

    expect(before).toEqual(copy)
  })

  it('writes only the two review fields it schedules, on a skill the record does not carry', () => {
    const base = initialProgress()
    const { [unit0[1]]: _absent, ...missingOne } = base.skills

    const raised = markKnown({ ...base, skills: missingOne }, UNIT, 'tested-out', TODAY)!.skills[unit0[1]]

    expect(raised.mastery).toBe(SKIP_MASTERY)
    expect(raised.source).toBe('tested-out')
    expect(raised.strength).toBe(0)
    expect(raised.nextReview).toBe('2026-09-01')
    // The only shape that can show this: every skill a stored record carries
    // already holds review fields, so spreading the store's default under a
    // raised skill would be invisible everywhere else. A mark is not a review
    // result and counts nothing.
    expect(raised).not.toHaveProperty('reviewAttempts')
    expect(raised).not.toHaveProperty('reviewCorrect')
  })

  it('records a corrupt mastery as no prior level rather than storing it raw', () => {
    // A hand-edited backup. Writing the raw value would store a level the reader
    // rejects, so the reversal would drop the skill to 0 and the record would
    // disagree with itself about what the mark found.
    const after = markKnown(progressWith({ [unit0[0]]: { mastery: 2.5 } }), UNIT, 'tested-out', TODAY)!

    expect(after.skills[unit0[0]].priorMastery).toBe(0)
    expect(readPriorMastery(after.skills[unit0[0]])).toBe(0)
  })

  it('changes mastery, source, prior mastery and the schedule, and nothing else', () => {
    const before = progressWith({
      [unit0[0]]: {
        attempts: 12,
        correct: 9,
        lastPracticed: '2026-08-20',
        introSeen: true,
        strength: 2,
        nextReview: '2026-08-23',
        reviewAttempts: 4,
        reviewCorrect: 1,
      },
    })
    const withCounters = {
      ...before,
      xp: 140,
      coins: 60,
      streakCount: 7,
      mistakes: { 'carried-twice': 3 },
      skills: {
        ...before.skills,
        // A field written by a later build, arriving from the backup endpoint.
        [unit0[0]]: { ...before.skills[unit0[0]], fromALaterVersion: 'kept' },
      },
    }

    const after = markKnown(withCounters, UNIT, 'tested-out', TODAY)!

    expect(after.skills[unit0[0]]).toEqual({
      ...withCounters.skills[unit0[0]],
      mastery: SKIP_MASTERY,
      source: 'tested-out',
      priorMastery: 0,
      // The strength it already held, and that strength's interval after the
      // day of the mark. Neither review count moves.
      strength: 2,
      nextReview: '2026-09-03',
    })
    expect(after.xp).toBe(140)
    expect(after.coins).toBe(60)
    expect(after.streakCount).toBe(7)
    expect(after.mistakes).toEqual({ 'carried-twice': 3 })
  })
})

describe('the review a skip schedules', () => {
  /** The review state of one skill of the marked unit, as the app reads it. */
  const reviewOf = (progress: Progress, id: string) => readReviewState(progress.skills[id])

  it('brings a never-practised skipped skill back the next day', () => {
    const after = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!

    for (const id of unit0) {
      expect(reviewOf(after, id)).toMatchObject({ strength: 0, nextReview: '2026-09-01' })
    }
  })

  it('keeps the strength a part-practised skill earned, and its longer interval', () => {
    const practised = progressWith({
      [unit0[0]]: { mastery: 2, attempts: 20, correct: 15, strength: 2, lastPracticed: '2026-08-20' },
    })

    const after = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    expect(reviewOf(after, unit0[0])).toMatchObject({ strength: 2, nextReview: '2026-09-03' })
  })

  it('does not schedule a legacy record from the mastery the mark just granted', () => {
    // The failure this exists for: the read-time default derives strength from
    // mastery, so scheduling after the raise would read strength 3 and put a
    // skipped skill seven days out — slower than a practised one.
    const base = initialProgress()
    const legacy = {
      ...base,
      skills: {
        ...base.skills,
        [unit0[0]]: { mastery: 0, lastPracticed: null, attempts: 0, correct: 0 },
      },
    }

    const after = markKnown(legacy, UNIT, 'tested-out', TODAY)!

    expect(after.skills[unit0[0]].strength).toBe(0)
    expect(after.skills[unit0[0]].nextReview).toBe('2026-09-01')
  })

  it('leaves the schedule of a skill it did not raise alone', () => {
    const practised = progressWith({
      [unit0[0]]: {
        mastery: 4,
        attempts: 50,
        correct: 41,
        strength: 4,
        nextReview: '2026-12-01',
        lastPracticed: '2026-08-20',
      },
    })

    const after = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    expect(after.skills[unit0[0]]).toEqual(practised.skills[unit0[0]])
  })

  it('counts nothing while scheduling', () => {
    const practised = progressWith({
      [unit0[0]]: { attempts: 12, correct: 9, reviewAttempts: 4, reviewCorrect: 1 },
    })

    const after = markKnown(practised, UNIT, 'tested-out', TODAY)!

    expect(after.skills[unit0[0]]).toMatchObject({
      attempts: 12,
      correct: 9,
      reviewAttempts: 4,
      reviewCorrect: 1,
    })
  })
})

describe('taking a block back', () => {
  it('returns a never-practised skip to zero and to its prerequisites', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!

    const after = unmark(skipped, UNIT)!

    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => 0))
    expect(sourcesOf(after, unit0)).toEqual(unit0.map(() => 'practiced'))
    expect(isUnlocked(DOWNSTREAM, after)).toBe(false)
  })

  it('never reaches a skill the mark did not raise', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 4, attempts: 50, correct: 41 } })
    const skipped = markKnown(practised, UNIT, 'tested-out', TODAY)!

    const after = unmark(skipped, UNIT)!

    expect(after.skills[unit0[0]]).toEqual(practised.skills[unit0[0]])
    expect(after.skills[unit0[1]].mastery).toBe(0)
  })

  it('returns a part-practised skill to the level it held, not to zero', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 1, attempts: 8, correct: 5 } })
    const skipped = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    const after = unmark(skipped, UNIT)!

    expect(after.skills[unit0[0]].mastery).toBe(1)
    expect(readSource(after.skills[unit0[0]])).toBe('practiced')
    expect(readPriorMastery(after.skills[unit0[0]])).toBe(0)
    expect(after.skills[unit0[0]].attempts).toBe(8)
    expect(after.skills[unit0[0]].correct).toBe(5)
    // The skills the skip found untouched still go all the way back.
    expect(after.skills[unit0[1]].mastery).toBe(0)
  })

  it('restores the same pair when a block is marked again after a reversal', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 2, attempts: 20, correct: 14 } })
    const once = unmark(markKnown(practised, UNIT, 'tested-out', TODAY)!, UNIT)!

    const after = unmark(markKnown(once, UNIT, 'tested-out', TODAY)!, UNIT)!

    expect(after.skills[unit0[0]].mastery).toBe(2)
    expect(masteriesOf(after, unit0)).toEqual(masteriesOf(once, unit0))
  })

  it('keeps mastery earned after the skip', () => {
    // What `completeLesson()` writes when a learner plays a skill they skipped:
    // the source is converted, so the reversal has nothing to take back from it.
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    const played = {
      ...skipped,
      skills: {
        ...skipped.skills,
        [unit0[0]]: { ...skipped.skills[unit0[0]], mastery: 4, source: 'practiced' as const },
      },
    }

    const after = unmark(played, UNIT)!

    expect(after.skills[unit0[0]].mastery).toBe(4)
    expect(after.skills[unit0[1]].mastery).toBe(0)
  })

  it('refuses a block holding nothing the skip granted', () => {
    expect(unmark(initialProgress(), UNIT)).toBeNull()
    expect(unmark(initialProgress(), 'not-a-block')).toBeNull()
    expect(
      unmark(progressWith({ [unit0[0]]: { mastery: 5, attempts: 60, correct: 52 } }), UNIT),
    ).toBeNull()
  })

  it('leaves the record it was given untouched', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'tested-out', TODAY)!
    const copy = structuredClone(skipped)

    unmark(skipped, UNIT)

    expect(skipped).toEqual(copy)
  })

  it('changes mastery, source, prior mastery and the schedule, and nothing else', () => {
    const before = progressWith({
      [unit0[0]]: {
        attempts: 12,
        correct: 9,
        lastPracticed: '2026-08-20',
        introSeen: true,
        strength: 2,
        nextReview: '2026-08-23',
        reviewAttempts: 4,
        reviewCorrect: 1,
      },
    })
    const carried = {
      ...before,
      skills: {
        ...before.skills,
        [unit0[0]]: { ...before.skills[unit0[0]], fromALaterVersion: 'kept' },
      },
    }
    const skipped = {
      ...markKnown(carried, UNIT, 'tested-out', TODAY)!,
      xp: 140,
      coins: 60,
      streakCount: 7,
      mistakes: { 'carried-twice': 3 },
    }

    const after = unmark(skipped, UNIT)!

    expect(after.skills[unit0[0]]).toEqual({
      ...carried.skills[unit0[0]],
      mastery: 0,
      source: 'practiced',
      priorMastery: 0,
      // Back to the date this skill's own last practice implies, which is the
      // one it carried before the mark rescheduled it.
      nextReview: '2026-08-23',
    })
    expect(after.xp).toBe(140)
    expect(after.coins).toBe(60)
    expect(after.streakCount).toBe(7)
    expect(after.mistakes).toEqual({ 'carried-twice': 3 })
  })
})

describe('the review a reversal withdraws', () => {
  it('leaves a never-practised reversed skill unscheduled', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!

    const after = unmark(skipped, UNIT)!

    for (const id of unit0) {
      expect(after.skills[id].nextReview).toBeNull()
      expect(readReviewState(after.skills[id]).nextReview).toBeNull()
    }
  })

  it('returns a part-practised skill to the schedule its own practice implies', () => {
    const practised = progressWith({
      [unit0[0]]: { mastery: 2, attempts: 20, correct: 15, strength: 2, lastPracticed: '2026-08-20' },
    })
    const skipped = markKnown(practised, UNIT, 'self-assessed', TODAY)!

    const after = unmark(skipped, UNIT)!

    expect(after.skills[unit0[0]].nextReview).toBe('2026-08-23')
    expect(after.skills[unit0[0]].strength).toBe(2)
  })

  it('keeps the review history the skip collected', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'tested-out', TODAY)!
    const reviewed = {
      ...skipped,
      skills: {
        ...skipped.skills,
        [unit0[0]]: { ...skipped.skills[unit0[0]], reviewAttempts: 5, reviewCorrect: 2 },
      },
    }

    const after = unmark(reviewed, UNIT)!

    expect(after.skills[unit0[0]]).toMatchObject({ reviewAttempts: 5, reviewCorrect: 2 })
  })

  it('takes a re-locked skill out of the due set review selects from', () => {
    // The failure this exists for: selection filters on due date alone, with no
    // unlock or practice filter, so a date left behind would put a locked,
    // never-practised skill into a review lesson.
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    const candidates = (progress: Progress) =>
      unit0.map((id) => ({ skill: getSkill(id), progress: progress.skills[id] }))

    expect(selectReviewSkills(candidates(skipped), '2026-09-01').map(({ id }) => id)).toEqual(unit0)

    const after = unmark(skipped, UNIT)!

    expect(selectReviewSkills(candidates(after), '2026-09-01')).toEqual([])
    expect(isUnlocked(unit0[0], after)).toBe(isUnlocked(unit0[0], initialProgress()))
  })
})

describe('the warm-up a weak skip earns', () => {
  /** The unit `add-facts-small` sits behind, and its only unlock prerequisite. */
  const DOWNSTREAM_PREREQUISITE = 'round-to-100'

  /** A marked unit whose named skill has answered review problems. */
  const reviewed = (skillId: string, reviewAttempts: number, reviewCorrect: number) => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    return {
      ...skipped,
      skills: {
        ...skipped.skills,
        [skillId]: { ...skipped.skills[skillId], reviewAttempts, reviewCorrect },
      },
    }
  }

  it('offers the unit of a skipped skill reviewing badly', () => {
    expect(warmUpSuggestion(reviewed(unit0[0], 5, 2))).toEqual({
      unitId: UNIT,
      unitName: 'Numbers & Place Value',
      reason: 'weak-review',
    })
  })

  it('waits for enough evidence', () => {
    expect(warmUpSuggestion(reviewed(unit0[0], 4, 1))).toBeUndefined()
  })

  it('leaves a skill doing well enough alone', () => {
    expect(warmUpSuggestion(reviewed(unit0[0], 5, 3))).toBeUndefined()
  })

  it('does not watch a practised skill this way', () => {
    const practised = progressWith({
      [unit0[0]]: { mastery: 3, attempts: 20, correct: 15, reviewAttempts: 5, reviewCorrect: 2 },
    })

    expect(warmUpSuggestion(practised)).toBeUndefined()
  })

  it('clears itself when review accuracy recovers, with nothing written', () => {
    const weak = reviewed(unit0[0], 5, 2)
    expect(warmUpSuggestion(weak)).toBeDefined()

    const recovered = {
      ...weak,
      skills: {
        ...weak.skills,
        [unit0[0]]: { ...weak.skills[unit0[0]], reviewAttempts: 10, reviewCorrect: 7 },
      },
    }

    expect(warmUpSuggestion(recovered)).toBeUndefined()
  })

  it('clears itself when the block is taken back', () => {
    const weak = reviewed(unit0[0], 5, 2)

    expect(warmUpSuggestion(unmark(weak, UNIT)!)).toBeUndefined()
  })

  it('points a failing skill back at the prerequisite it was allowed to skip', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    const failing: Progress = {
      ...skipped,
      skills: {
        ...skipped.skills,
        [DOWNSTREAM]: { ...skipped.skills[DOWNSTREAM], attempts: 6, correct: 3 },
      },
    }

    expect(readSource(failing.skills[DOWNSTREAM_PREREQUISITE])).toBe('self-assessed')
    expect(warmUpSuggestion(failing)).toEqual({
      unitId: UNIT,
      unitName: 'Numbers & Place Value',
      reason: 'repeated-failure',
      skillId: DOWNSTREAM,
    })
  })

  it('reads a corrupt aggregate count rather than trusting it', () => {
    // The aggregate counts come straight off the stored record, so they get the
    // same defence every other stored number here gets: a malformed attempt
    // count is no evidence, and a fractional or negative pair still reads as
    // the counts it plainly means.
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    const withCounts = (attempts: unknown, correct: unknown): Progress => ({
      ...skipped,
      skills: {
        ...skipped.skills,
        [DOWNSTREAM]: {
          ...skipped.skills[DOWNSTREAM],
          attempts: attempts as number,
          correct: correct as number,
        },
      },
    })

    expect(warmUpSuggestion(withCounts('six', 'three'))).toBeUndefined()
    expect(warmUpSuggestion(withCounts(Number.NaN, 0))).toBeUndefined()
    expect(warmUpSuggestion(withCounts(6.9, -4))).toMatchObject({ reason: 'repeated-failure' })
  })

  it('raises nothing when a failing skill was earned all the way up', () => {
    const failing = progressWith({ [DOWNSTREAM]: { mastery: 1, attempts: 6, correct: 3 } })

    expect(warmUpSuggestion(failing)).toBeUndefined()
  })

  it('raises nothing once too few attempts back the failure', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!

    expect(
      warmUpSuggestion({
        ...skipped,
        skills: {
          ...skipped.skills,
          [DOWNSTREAM]: { ...skipped.skills[DOWNSTREAM], attempts: 4, correct: 1 },
        },
      }),
    ).toBeUndefined()
  })

  it('clears itself once the prerequisite is practised', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!
    const failing: Progress = {
      ...skipped,
      skills: {
        ...skipped.skills,
        [DOWNSTREAM]: { ...skipped.skills[DOWNSTREAM], attempts: 6, correct: 3 },
      },
    }
    // What completing a lesson for the skipped prerequisite writes.
    const practised = {
      ...failing,
      skills: {
        ...failing.skills,
        [DOWNSTREAM_PREREQUISITE]: {
          ...failing.skills[DOWNSTREAM_PREREQUISITE],
          source: 'practiced' as const,
        },
      },
    }

    expect(warmUpSuggestion(practised)).toBeUndefined()
  })

  it('offers one unit, and the same one on every read', () => {
    const both = markKnown(
      markKnown(initialProgress(), UNIT, 'self-assessed', TODAY)!,
      'unit-1',
      'self-assessed',
      TODAY,
    )!
    const weak = {
      ...both,
      skills: {
        ...both.skills,
        [unit0[0]]: { ...both.skills[unit0[0]], reviewAttempts: 5, reviewCorrect: 2 },
        'add-facts-small': {
          ...both.skills['add-facts-small'],
          reviewAttempts: 5,
          reviewCorrect: 1,
        },
      },
    }

    expect(warmUpSuggestion(weak)).toMatchObject({ unitId: UNIT })
    expect(warmUpSuggestion(weak)).toEqual(warmUpSuggestion(weak))
  })

  it('does not offer a unit with nothing left to take back', () => {
    // The same weak review record, after every skill in the unit became
    // practised: there is no claim left to withdraw, so the offer would lead
    // nowhere the learner can act. The guarantee holds structurally rather than
    // through a separate check — both readings key off a declared skill, so the
    // unit a suggestion names always still holds one.
    const weak = reviewed(unit0[0], 5, 2)
    const allPractised = {
      ...weak,
      skills: Object.fromEntries(
        Object.entries(weak.skills).map(([id, record]) => [
          id,
          unit0.includes(id) ? { ...record, source: 'practiced' as const } : record,
        ]),
      ),
    }

    expect(blockHasDeclaredSource(allPractised, UNIT)).toBe(false)
    expect(warmUpSuggestion(allPractised)).toBeUndefined()
  })
})

describe('the two id spaces a block is looked up in', () => {
  it('keeps unit ids and stage ids disjoint', () => {
    // A block is one id, resolved as a unit first and a stage second. The day
    // the two unions overlap, that routes silently to the wrong block.
    const stageIds = new Set(stages.map((stage) => stage.id))

    expect(allUnits.filter((unit) => stageIds.has(unit.id))).toEqual([])
  })
})
