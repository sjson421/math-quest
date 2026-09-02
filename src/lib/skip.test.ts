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
import { course, courseUnitById, implementedSkillIds, skillStates } from '../curriculum'
import { stages, allUnits } from '../curriculum/manifest'
import {
  UNLOCK_THRESHOLD,
  MAX_MASTERY,
  initialProgress,
  isUnlocked,
  type Progress,
  type SkillProgress,
} from '../store/progress'
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
} from './skip'

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

    const after = markKnown(before, UNIT, 'self-assessed')!

    expect(after).not.toBeNull()
    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => SKIP_MASTERY))
    expect(sourcesOf(after, unit0)).toEqual(unit0.map(() => 'self-assessed'))
  })

  it('opens what the block was holding up', () => {
    const before = initialProgress()
    expect(isUnlocked(DOWNSTREAM, before)).toBe(false)

    const after = markKnown(before, UNIT, 'tested-out')!

    // Mastery 3 clears the threshold on purpose, and stops short of the maximum
    // so the skill still reads as not needed yet rather than finished.
    expect(SKIP_MASTERY).toBeGreaterThan(UNLOCK_THRESHOLD)
    expect(SKIP_MASTERY).toBeLessThan(MAX_MASTERY)
    expect(isUnlocked(DOWNSTREAM, after)).toBe(true)
  })

  it('takes a stage as one block too', () => {
    const after = markKnown(initialProgress(), STAGE, 'tested-out')!

    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => SKIP_MASTERY))
  })

  it('never lowers mastery the learner earned, and leaves its source practised', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 5, attempts: 60, correct: 52 } })

    const after = markKnown(practised, UNIT, 'self-assessed')!

    expect(after.skills[unit0[0]].mastery).toBe(5)
    expect(readSource(after.skills[unit0[0]])).toBe('practiced')
    expect(after.skills[unit0[1]].mastery).toBe(SKIP_MASTERY)
  })

  it('records where a part-practised skill came from, so it can be returned there', () => {
    // Mastery 1 is below UNLOCK_THRESHOLD, so leaving it where it stands would
    // keep the course shut and defeat the skip. Once raised it is
    // indistinguishable from a skill found at 0 unless the level is written down.
    const practised = progressWith({ [unit0[0]]: { mastery: 1, attempts: 8, correct: 5 } })

    const after = markKnown(practised, UNIT, 'self-assessed')!

    expect(after.skills[unit0[0]].mastery).toBe(SKIP_MASTERY)
    expect(readSource(after.skills[unit0[0]])).toBe('self-assessed')
    expect(readPriorMastery(after.skills[unit0[0]])).toBe(1)
  })

  it('records no prior mastery for a skill it never raised', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 5, attempts: 60, correct: 52 } })

    const after = markKnown(practised, UNIT, 'self-assessed')!

    expect(after.skills[unit0[0]]).not.toHaveProperty('priorMastery')
    expect(readPriorMastery(after.skills[unit0[1]])).toBe(0)
  })

  it('refuses a block the curriculum does not declare', () => {
    expect(markKnown(initialProgress(), 'not-a-block', 'tested-out')).toBeNull()
  })

  it('refuses a block that is already known, so nothing is written', () => {
    const known = markKnown(initialProgress(), UNIT, 'tested-out')!

    expect(markKnown(known, UNIT, 'self-assessed')).toBeNull()
  })

  it('leaves a block nobody can play alone, and still locked', () => {
    const before = initialProgress()

    expect(markKnown(before, PLANNED_UNIT, 'tested-out')).toBeNull()
    expect(markKnown(before, PLANNED_STAGE, 'tested-out')).toBeNull()

    for (const entry of allUnits.find((unit) => unit.id === PLANNED_UNIT)!.skills) {
      expect(skillStates.get(entry.id)).toBe('planned')
      expect(before.skills).not.toHaveProperty(entry.id)
      expect(isUnlocked(entry.id, before)).toBe(false)
    }
  })

  it('writes only skills that can be played', () => {
    const after = markKnown(initialProgress(), STAGE, 'tested-out')!

    for (const [id, record] of Object.entries(after.skills))
      if (record.mastery > 0) expect(implementedSkillIds).toContain(id)
  })

  it('leaves the record it was given untouched', () => {
    const before = initialProgress()
    const copy = structuredClone(before)

    markKnown(before, UNIT, 'tested-out')

    expect(before).toEqual(copy)
  })

  it('writes no review field onto a skill the record does not carry', () => {
    const base = initialProgress()
    const { [unit0[1]]: _absent, ...missingOne } = base.skills

    const raised = markKnown({ ...base, skills: missingOne }, UNIT, 'tested-out')!.skills[unit0[1]]

    expect(raised.mastery).toBe(SKIP_MASTERY)
    expect(raised.source).toBe('tested-out')
    // The only shape that can show this: every skill a stored record carries
    // already holds review fields, so spreading the store's default under a
    // raised skill would be invisible everywhere else. What a skip should do to
    // review scheduling is the safety net's to decide, not this mutation's.
    expect(raised).not.toHaveProperty('strength')
    expect(raised).not.toHaveProperty('nextReview')
    expect(raised).not.toHaveProperty('reviewAttempts')
  })

  it('records a corrupt mastery as no prior level rather than storing it raw', () => {
    // A hand-edited backup. Writing the raw value would store a level the reader
    // rejects, so the reversal would drop the skill to 0 and the record would
    // disagree with itself about what the mark found.
    const after = markKnown(progressWith({ [unit0[0]]: { mastery: 2.5 } }), UNIT, 'tested-out')!

    expect(after.skills[unit0[0]].priorMastery).toBe(0)
    expect(readPriorMastery(after.skills[unit0[0]])).toBe(0)
  })

  it('changes mastery, source and prior mastery and nothing else', () => {
    const before = progressWith({
      [unit0[0]]: {
        attempts: 12,
        correct: 9,
        lastPracticed: '2026-08-31',
        introSeen: true,
        strength: 2,
        nextReview: '2026-09-03',
        reviewAttempts: 4,
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

    const after = markKnown(withCounters, UNIT, 'tested-out')!

    expect(after.skills[unit0[0]]).toEqual({
      ...withCounters.skills[unit0[0]],
      mastery: SKIP_MASTERY,
      source: 'tested-out',
      priorMastery: 0,
    })
    expect(after.xp).toBe(140)
    expect(after.coins).toBe(60)
    expect(after.streakCount).toBe(7)
    expect(after.mistakes).toEqual({ 'carried-twice': 3 })
  })
})

describe('taking a block back', () => {
  it('returns a never-practised skip to zero and to its prerequisites', () => {
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed')!

    const after = unmark(skipped, UNIT)!

    expect(masteriesOf(after, unit0)).toEqual(unit0.map(() => 0))
    expect(sourcesOf(after, unit0)).toEqual(unit0.map(() => 'practiced'))
    expect(isUnlocked(DOWNSTREAM, after)).toBe(false)
  })

  it('never reaches a skill the mark did not raise', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 4, attempts: 50, correct: 41 } })
    const skipped = markKnown(practised, UNIT, 'tested-out')!

    const after = unmark(skipped, UNIT)!

    expect(after.skills[unit0[0]]).toEqual(practised.skills[unit0[0]])
    expect(after.skills[unit0[1]].mastery).toBe(0)
  })

  it('returns a part-practised skill to the level it held, not to zero', () => {
    const practised = progressWith({ [unit0[0]]: { mastery: 1, attempts: 8, correct: 5 } })
    const skipped = markKnown(practised, UNIT, 'self-assessed')!

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
    const once = unmark(markKnown(practised, UNIT, 'tested-out')!, UNIT)!

    const after = unmark(markKnown(once, UNIT, 'tested-out')!, UNIT)!

    expect(after.skills[unit0[0]].mastery).toBe(2)
    expect(masteriesOf(after, unit0)).toEqual(masteriesOf(once, unit0))
  })

  it('keeps mastery earned after the skip', () => {
    // What `completeLesson()` writes when a learner plays a skill they skipped:
    // the source is converted, so the reversal has nothing to take back from it.
    const skipped = markKnown(initialProgress(), UNIT, 'self-assessed')!
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
    const skipped = markKnown(initialProgress(), UNIT, 'tested-out')!
    const copy = structuredClone(skipped)

    unmark(skipped, UNIT)

    expect(skipped).toEqual(copy)
  })

  it('changes mastery, source and prior mastery and nothing else', () => {
    const before = progressWith({
      [unit0[0]]: {
        attempts: 12,
        correct: 9,
        lastPracticed: '2026-08-31',
        introSeen: true,
        strength: 2,
        nextReview: '2026-09-03',
        reviewAttempts: 4,
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
      ...markKnown(carried, UNIT, 'tested-out')!,
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
    })
    expect(after.xp).toBe(140)
    expect(after.coins).toBe(60)
    expect(after.streakCount).toBe(7)
    expect(after.mistakes).toEqual({ 'carried-twice': 3 })
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
