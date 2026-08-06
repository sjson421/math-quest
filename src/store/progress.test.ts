/**
 * What the learner is allowed to start.
 *
 * `isUnlocked()` is the only thing standing between a learner and a lesson —
 * `Home.tsx` passes its result straight to `disabled` — so the rules it applies
 * are worth pinning against the *real* manifest graph rather than a fixture. A
 * fixture would let the store and the curriculum drift apart, which is the exact
 * failure this change exists to remove.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { implementedSkillIds, skillStates } from '../curriculum'
import { stageA } from '../curriculum/manifest'
import {
  UNLOCK_THRESHOLD,
  initialProgress,
  isUnlocked,
  useProgress,
  type Progress,
  type SkillProgress,
} from './progress'

// The store persists through idb-keyval, and these tests run in node. Stubbing
// the storage keeps the reconciliation logic under test without dragging in a
// fake IndexedDB — what is being asserted is what the store computes, not where
// it writes.
vi.mock('idb-keyval', () => ({
  get: vi.fn(async () => undefined),
  set: vi.fn(async () => undefined),
}))

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

const MASTERED = { mastery: UNLOCK_THRESHOLD, attempts: 30, correct: 25 }

/** Every playable skill this record can open, in curriculum order. */
const openSkills = (progress: Progress) =>
  implementedSkillIds.filter((id) => isUnlocked(id, progress))

/** Unit 1 finished to threshold — the state that opens Unit 2 under the manifest. */
const throughUnit1 = () =>
  progressWith({
    'add-facts-small': MASTERED,
    'add-facts': MASTERED,
    'add-tens': MASTERED,
    'add-2digit-nocarry': MASTERED,
    'add-2digit-carry': MASTERED,
    'add-3digit': MASTERED,
    'add-three-numbers': MASTERED,
    'add-words': MASTERED,
  })

describe('the unlock rules', () => {
  it('opens a skill once every prerequisite has reached the threshold', () => {
    expect(isUnlocked('add-2digit-nocarry', progressWith({ 'add-tens': MASTERED }))).toBe(true)
  })

  it('keeps a skill locked while a prerequisite is one short', () => {
    const nearly = progressWith({ 'add-tens': { mastery: UNLOCK_THRESHOLD - 1, attempts: 12 } })

    expect(isUnlocked('add-2digit-nocarry', nearly)).toBe(false)
  })

  it('opens the root skill from first launch', () => {
    expect(openSkills(initialProgress())).toEqual(['read-numbers'])
  })

  it('locks an id the manifest does not know', () => {
    expect(isUnlocked('not-a-skill', initialProgress())).toBe(false)
  })
})

describe('the manifest is the authority', () => {
  it('gates Unit 2 behind the whole of Unit 1', () => {
    // The change in one assertion. Under the generators' hand-written graph
    // `sub-facts` sat directly behind `add-facts` and would be open here.
    const justAddFacts = progressWith({ 'add-facts': MASTERED })

    // `add-facts` itself is open only because it has been practised — it now
    // sits behind `add-facts-small`, which this record has never touched.
    expect(openSkills(justAddFacts)).toEqual(['read-numbers', 'add-facts', 'add-tens'])
    expect(isUnlocked('sub-facts', justAddFacts)).toBe(false)
  })

  it('opens Unit 2 once Unit 1 is finished', () => {
    // `sub-facts-small` is Unit 2's first skill, so it is what the boundary
    // opens. `sub-facts` used to be, and now sits behind it.
    expect(isUnlocked('sub-facts-small', throughUnit1())).toBe(true)
    expect(isUnlocked('sub-facts', throughUnit1())).toBe(false)
  })

  it('no longer asks sub-2digit-borrow for add-2digit-carry', () => {
    // The cross-edge the registry invented and the curriculum document never
    // declared. `add-2digit-carry` is left at zero — that is the whole assertion,
    // and it is unreachable through normal play, which is the point: the graph is
    // what is under test here, not the route to it.
    const dropped = progressWith({ 'sub-2digit-noborrow': MASTERED })

    expect(isUnlocked('sub-2digit-borrow', dropped)).toBe(true)
  })

  it('locks a skill that has no generator, however far the learner has come', () => {
    // 177 of the 201 are planned. They must never be offered or hold anyone up.
    // Unit 3's ids, because Unit 2's have generators as of this change — the
    // examples move forward each time a unit lands, which is the point.
    const finished = throughUnit1()

    expect(isUnlocked('mult-meaning', finished)).toBe(false)
    expect(isUnlocked('times-2', finished)).toBe(false)
    expect(isUnlocked('read-numbers', initialProgress())).toBe(true)
  })
})

describe('a practised skill is never re-locked', () => {
  it('keeps sub-facts open for a learner who had already started it', () => {
    // The strand this change would otherwise cause: `sub-facts` used to sit
    // behind `add-facts` alone, so a learner could be mid-lesson in it with all
    // of Unit 1 still ahead of them.
    const midLesson = progressWith({
      'add-facts': { mastery: 3, attempts: 40, correct: 34 },
      'sub-facts': { attempts: 1, correct: 0 },
    })

    expect(isUnlocked('sub-facts', midLesson)).toBe(true)
    expect(midLesson.skills['sub-facts'].mastery).toBe(0)
  })

  it('keeps sub-2digit-borrow open, which the roadmap did not predict', () => {
    // Its own edges got shorter, but it inherits `sub-facts`, so it ends up
    // behind six skills where it used to be behind four. It can strand too.
    const practised = progressWith({
      'add-facts': MASTERED,
      'sub-facts': { mastery: 2, attempts: 30, correct: 24 },
      'sub-2digit-borrow': { attempts: 3, correct: 1 },
    })

    expect(isUnlocked('sub-2digit-borrow', practised)).toBe(true)
  })

  it('counts mastery with no attempts as practised', () => {
    // A handed-over backup file, and the shape skipping ahead is specified to
    // write: mastery 3 on every skill in the block, no attempts at all.
    const skipped = progressWith({ 'sub-facts': { mastery: 3 } })

    expect(isUnlocked('sub-facts', skipped)).toBe(true)
  })

  it('does not grandfather a skill the learner never touched', () => {
    // A fresh record: no attempts, no mastery, so nothing to grandfather.
    expect(isUnlocked('sub-facts', initialProgress())).toBe(false)
  })

  it('still refuses a practised skill that can no longer be generated', () => {
    // Rule 1 beats rule 2. Not reachable with today's playable skills, but the
    // order is what stops a future capability requirement handing back a lesson
    // that cannot be built.
    //
    // The id comes from the registry rather than being named. This case used to
    // say `div-meaning`, and Unit 4 shipping it turned a test about a rule into
    // a failure about which unit exists — any planned skill proves the same rule.
    const planned = [...skillStates].find(([, state]) => state === 'planned')?.[0]
    expect(planned, 'every skill is built; this rule needs a planned one').toBeDefined()

    const practisedButPlanned = progressWith({ [planned!]: { attempts: 9, mastery: 2 } })

    expect(isUnlocked(planned!, practisedButPlanned)).toBe(false)
  })

  it('keeps add-facts open for a learner who reached it before 1.1 existed', () => {
    // The strand this change would otherwise cause, and the first time the rule
    // has been load-bearing rather than defensive: `add-facts` was the root of
    // the course until `add-facts-small` gained a generator, so every existing
    // record has practice on a skill that has since grown a prerequisite it has
    // never met.
    const wasTheRoot = progressWith({ 'add-facts': { mastery: 3, attempts: 40, correct: 34 } })

    expect(isUnlocked('add-facts', wasTheRoot)).toBe(true)
    expect(wasTheRoot.skills['add-facts'].mastery).toBe(3)
    expect(isUnlocked('add-facts-small', wasTheRoot)).toBe(false)
  })

  it('keeps add-facts-small open after Unit 0 becomes its prerequisite', () => {
    const practised = progressWith({
      'add-facts-small': { mastery: 1, attempts: 4, correct: 3 },
    })

    expect(isUnlocked('add-facts-small', practised)).toBe(true)
    expect(practised.skills['add-facts-small'].mastery).toBe(1)
  })
})

describe('surviving the sync round trip', () => {
  const strandable = () =>
    progressWith({
      'add-facts': { mastery: 3, attempts: 40, correct: 34 },
      'sub-facts': { attempts: 1, correct: 0 },
    })

  beforeEach(() => {
    useProgress.getState().reset()
  })

  it('keeps the same skills open after a restore from file', () => {
    const before = openSkills(strandable())

    useProgress.getState().replaceProgress(strandable())

    expect(openSkills(useProgress.getState().progress)).toEqual(before)
    expect(before).toContain('sub-facts')
  })

  it('keeps the same skills open after adopting the server copy', () => {
    useProgress.getState().adoptRemote(strandable(), 1234)

    expect(openSkills(useProgress.getState().progress)).toContain('sub-facts')
  })

  it('gives the same answer however many times the record is restored', () => {
    useProgress.getState().replaceProgress(strandable())
    const once = openSkills(useProgress.getState().progress)

    useProgress.getState().replaceProgress(useProgress.getState().progress)
    useProgress.getState().adoptRemote(useProgress.getState().progress, 99)

    expect(openSkills(useProgress.getState().progress)).toEqual(once)
  })

  it('reconciles a record that predates the skills it is merged over', () => {
    // A Phase 1 blob: two skills, no `updatedAt`, nothing else. Everything the
    // manifest has gained since must default in rather than throw.
    const ancient = {
      version: 1,
      xp: 60,
      skills: { 'add-facts': skill({ mastery: 3, attempts: 40, correct: 34 }) },
    } as unknown as Progress

    useProgress.getState().replaceProgress(ancient)

    expect(openSkills(useProgress.getState().progress)).toEqual([
      'read-numbers',
      'add-facts',
      'add-tens',
    ])
  })
})

describe('stage checkpoint lesson outcomes', () => {
  beforeEach(() => {
    useProgress.getState().reset()
  })

  it('returns the boundary crossed by the same mastery transition it persists', () => {
    const stageSkills = stageA.units.flatMap((unit) => unit.skills)
    const beforeBoundary = progressWith(
      Object.fromEntries(
        stageSkills.map(({ id }) => [
          id,
          id === 'round-to-100'
            ? { mastery: UNLOCK_THRESHOLD - 1, attempts: 12, correct: 10 }
            : MASTERED,
        ]),
      ),
    )
    useProgress.getState().replaceProgress(beforeBoundary)

    const outcome = useProgress.getState().completeLesson('round-to-100')

    expect(outcome.checkpoint).toEqual({ id: 'stage-a', name: 'Numbers' })
    expect(useProgress.getState().progress.skills['round-to-100'].mastery).toBe(
      UNLOCK_THRESHOLD,
    )
  })

  it('does not return the checkpoint on a later lesson', () => {
    const stageSkills = stageA.units.flatMap((unit) => unit.skills)
    useProgress.getState().replaceProgress(
      progressWith(Object.fromEntries(stageSkills.map(({ id }) => [id, MASTERED]))),
    )

    const outcome = useProgress.getState().completeLesson('round-to-100')

    expect(outcome.checkpoint).toBeUndefined()
    expect(useProgress.getState().progress.skills['round-to-100'].mastery).toBe(
      UNLOCK_THRESHOLD + 1,
    )
  })
})
