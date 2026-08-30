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
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { implementedSkillIds, skillStates } from '../curriculum'
import { stageA } from '../curriculum/manifest'
import { dayBefore, MAX_STREAK_FREEZES, todayKey } from '../lib/streak'
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
  introSeen: false,
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

describe('skill intro presentation state', () => {
  beforeEach(() => {
    useProgress.getState().reset()
    vi.mocked(idbSet).mockClear()
  })

  it('seeds new skills unseen and marks only the intro flag', () => {
    const before = useProgress.getState().progress
    const beforeSkill = before.skills['read-numbers']
    const beforeOpen = isUnlocked('read-numbers', before)

    useProgress.getState().markIntroSeen('read-numbers')

    const after = useProgress.getState().progress
    expect(initialProgress().skills['read-numbers'].introSeen).toBe(false)
    expect(after.skills['read-numbers']).toEqual({ ...beforeSkill, introSeen: true })
    expect({ ...after, updatedAt: before.updatedAt }).toEqual({
      ...before,
      skills: { ...before.skills, 'read-numbers': { ...beforeSkill, introSeen: true } },
    })
    expect(isUnlocked('read-numbers', after)).toBe(beforeOpen)
  })

  it('does not persist a second mark on an already seen intro', () => {
    useProgress.getState().markIntroSeen('read-numbers')
    const afterFirst = useProgress.getState().progress
    const writes = vi.mocked(idbSet).mock.calls.length

    useProgress.getState().markIntroSeen('read-numbers')

    expect(vi.mocked(idbSet).mock.calls).toHaveLength(writes)
    expect(useProgress.getState().progress).toEqual(afterFirst)
  })

  it('reads missing or malformed state as unseen while preserving opaque skill fields', () => {
    const { introSeen: _omitted, ...legacyFields } = skill()
    const legacySkill = { ...legacyFields, legacyField: 'keep-me' }
    const legacy = {
      ...progressWith({}),
      skills: { ...progressWith({}).skills, 'read-numbers': legacySkill },
    } as unknown as Progress

    useProgress.getState().replaceProgress(legacy)
    expect(useProgress.getState().progress.skills['read-numbers'].introSeen).toBeUndefined()
    expect((useProgress.getState().progress.skills['read-numbers'] as SkillProgress & { legacyField: string }).legacyField)
      .toBe('keep-me')

    const malformed = {
      ...useProgress.getState().progress,
      skills: {
        ...useProgress.getState().progress.skills,
        'read-numbers': { ...legacySkill, introSeen: 'yes' },
      },
    } as unknown as Progress
    useProgress.getState().replaceProgress(malformed)
    expect(useProgress.getState().progress.skills['read-numbers'].introSeen).not.toBe(true)
  })

  it('keeps true state and unknown fields through remote adoption', () => {
    const remote = {
      ...progressWith({}),
      skills: {
        ...progressWith({}).skills,
        'read-numbers': { ...skill({ introSeen: true }), remoteField: 7 },
      },
    } as unknown as Progress

    useProgress.getState().adoptRemote(remote, 4321)
    const restored = useProgress.getState().progress.skills['read-numbers'] as SkillProgress & { remoteField: number }

    expect(restored.introSeen).toBe(true)
    expect(restored.remoteField).toBe(7)
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

  it('carries the wardrobe both ways', () => {
    const dressed = {
      ...progressWith({}),
      inventory: ['round-glasses', 'party-hat'],
      equipped: { face: 'round-glasses' },
    }

    useProgress.getState().adoptRemote(dressed, 4321)

    expect(useProgress.getState().progress.inventory).toEqual(['round-glasses', 'party-hat'])
    expect(useProgress.getState().progress.equipped).toEqual({ face: 'round-glasses' })
  })

  it('gives a record predating cosmetics an empty wardrobe rather than failing', () => {
    const ancient = { version: 1, xp: 60, skills: {} } as unknown as Progress

    useProgress.getState().replaceProgress(ancient)

    expect(useProgress.getState().progress.inventory).toEqual([])
    expect(useProgress.getState().progress.equipped).toEqual({})
  })

  it('keeps a cosmetic id the catalogue no longer knows', () => {
    // Retained rather than discarded, exactly as an unknown *skill* id is. The
    // server stores the record opaquely and never migrates it, so a copy naming
    // a retired item can arrive at any time and must not lose data on the way
    // through.
    const retired = {
      ...progressWith({}),
      inventory: ['sombrero'],
      equipped: { headwear: 'sombrero' },
    }

    useProgress.getState().adoptRemote(retired, 5555)

    expect(useProgress.getState().progress.inventory).toEqual(['sombrero'])
    expect(useProgress.getState().progress.equipped).toEqual({ headwear: 'sombrero' })
  })

  it('defaults a corrupt wardrobe to empty rather than letting it through', () => {
    const corrupt = {
      ...progressWith({}),
      inventory: 'round-glasses',
      equipped: 'face',
    } as unknown as Progress

    useProgress.getState().adoptRemote(corrupt, 6666)

    expect(useProgress.getState().progress.inventory).toEqual([])
    expect(useProgress.getState().progress.equipped).toEqual({})
  })

  it('carries the room both ways', () => {
    const decorated = {
      ...progressWith({}),
      inventory: ['blossom-rug', 'round-window'],
      room: { rug: 'blossom-rug', wall: 'round-window' },
    }

    useProgress.getState().adoptRemote(decorated, 7777)

    expect(useProgress.getState().progress.room).toEqual({
      rug: 'blossom-rug',
      wall: 'round-window',
    })
  })

  it('gives a record predating the room an empty one rather than failing', () => {
    // The wardrobe half of this record is fully formed, so it is specifically
    // the newest field being absent that is under test — not a record so old
    // that everything defaults at once.
    const beforeTheRoom = {
      ...progressWith({}),
      inventory: ['round-glasses'],
      equipped: { face: 'round-glasses' },
    } as unknown as Progress

    useProgress.getState().replaceProgress(beforeTheRoom)

    expect(useProgress.getState().progress.room).toEqual({})
    expect(useProgress.getState().progress.equipped).toEqual({ face: 'round-glasses' })
  })

  it('defaults a corrupt room to empty while the rest of the record survives', () => {
    // `{ ...'ab' }` is `{ 0: 'a', 1: 'b' }`, so a bare spread would leave a room
    // of indexed characters standing in slots that do not exist.
    const corrupt = {
      ...progressWith({}),
      xp: 140,
      inventory: ['blossom-rug'],
      room: 'rug',
    } as unknown as Progress

    useProgress.getState().adoptRemote(corrupt, 8888)

    expect(useProgress.getState().progress.room).toEqual({})
    expect(useProgress.getState().progress.xp).toBe(140)
    expect(useProgress.getState().progress.inventory).toEqual(['blossom-rug'])
  })

  it('keeps a decoration id the catalogue no longer knows', () => {
    const retired = {
      ...progressWith({}),
      inventory: ['chandelier'],
      room: { wall: 'chandelier' },
    }

    useProgress.getState().adoptRemote(retired, 9999)

    expect(useProgress.getState().progress.inventory).toEqual(['chandelier'])
    expect(useProgress.getState().progress.room).toEqual({ wall: 'chandelier' })
  })
})

describe('spending coins', () => {
  beforeEach(() => {
    useProgress.getState().reset()
  })

  const withCoins = (coins: number) => {
    useProgress.getState().replaceProgress({ ...progressWith({}), coins })
  }

  it('charges the price and records what was bought', () => {
    withCoins(100)

    useProgress.getState().buyItem('round-glasses')

    expect(useProgress.getState().progress.coins).toBe(60)
    expect(useProgress.getState().progress.inventory).toEqual(['round-glasses'])
  })

  it('leaves the version alone when a purchase is refused', () => {
    withCoins(10)
    const before = useProgress.getState().progress.updatedAt

    useProgress.getState().buyItem('round-glasses')

    expect(useProgress.getState().progress.updatedAt).toBe(before)
    expect(useProgress.getState().progress.inventory).toEqual([])
    expect(useProgress.getState().progress.coins).toBe(10)
  })

  it('leaves the version alone when taking off an empty slot', () => {
    withCoins(0)
    const before = useProgress.getState().progress.updatedAt

    useProgress.getState().unequipSlot('face')

    expect(useProgress.getState().progress.updatedAt).toBe(before)
  })

  it('advances the version on a real purchase, so sync notices', () => {
    withCoins(100)
    const before = useProgress.getState().progress.updatedAt

    useProgress.getState().buyItem('round-glasses')

    expect(useProgress.getState().progress.updatedAt).toBeGreaterThan(before)
  })

  it('wears and removes without touching the balance', () => {
    withCoins(100)
    useProgress.getState().buyItem('round-glasses')
    const afterBuying = useProgress.getState().progress.coins

    useProgress.getState().equipItem('round-glasses')
    expect(useProgress.getState().progress.equipped).toEqual({ face: 'round-glasses' })

    useProgress.getState().unequipSlot('face')
    expect(useProgress.getState().progress.equipped).toEqual({})
    expect(useProgress.getState().progress.coins).toBe(afterBuying)
    expect(useProgress.getState().progress.inventory).toEqual(['round-glasses'])
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

/**
 * The streak, at the store level.
 *
 * `lib/streak.test.ts` pins the arithmetic; what is checked here is the part
 * only the store can get wrong — which openings are written to disk, which are
 * left as derivations, and what a completed lesson pays.
 */
describe('keeping a streak', () => {
  beforeEach(() => {
    useProgress.getState().reset()
    vi.mocked(idbGet).mockReset()
    vi.mocked(idbGet).mockResolvedValue(undefined)
    vi.mocked(idbSet).mockClear()
  })

  const stored = (over: Partial<Progress>): Progress => ({ ...initialProgress(), ...over })

  const hydrateWith = async (over: Partial<Progress>) => {
    vi.mocked(idbGet).mockResolvedValueOnce(stored(over))
    await useProgress.getState().hydrate()
    return useProgress.getState().progress
  }

  it('leaves a streak alone when yesterday had a lesson', async () => {
    const progress = await hydrateWith({
      streakCount: 6,
      lastActiveDay: dayBefore(todayKey()),
    })

    expect(progress.streakCount).toBe(6)
    expect(vi.mocked(idbSet)).not.toHaveBeenCalled()
  })

  it('breaks a stale streak without writing, because a break recomputes', async () => {
    const progress = await hydrateWith({
      streakCount: 12,
      lastActiveDay: '2020-01-01',
    })

    expect(progress.streakCount).toBe(0)
    // The behaviour freezes had to preserve: a break is a stable derivation of
    // `lastActiveDay`, so persisting it would be a write on every cold start.
    expect(vi.mocked(idbSet), 'a break is derived, never stored').not.toHaveBeenCalled()
  })

  it('spends a freeze to cover a missed day, and writes that down', async () => {
    const progress = await hydrateWith({
      streakCount: 12,
      lastActiveDay: dayBefore(dayBefore(todayKey())),
      streakFreezes: 2,
    })

    expect(progress.streakCount, 'the streak survives').toBe(12)
    expect(progress.streakFreezes).toBe(1)
    expect(progress.lastActiveDay, 'moved up so a second open spends nothing').toBe(
      dayBefore(todayKey()),
    )
    // Spending is not a derivation — it has to survive the reload and reach the
    // server, which means a write and an advanced version.
    expect(vi.mocked(idbSet)).toHaveBeenCalledTimes(1)
    expect(progress.updatedAt).toBeGreaterThan(0)
  })

  it('spends nothing on the second open of the same day', async () => {
    const covered = await hydrateWith({
      streakCount: 12,
      lastActiveDay: dayBefore(dayBefore(todayKey())),
      streakFreezes: 2,
    })
    vi.mocked(idbSet).mockClear()

    const reopened = await hydrateWith(covered)

    expect(reopened.streakFreezes, 'still one, not zero').toBe(1)
    expect(reopened.streakCount).toBe(12)
    expect(vi.mocked(idbSet)).not.toHaveBeenCalled()
  })

  it('clamps a corrupt freeze count rather than letting it through', async () => {
    const wild = await hydrateWith({ streakFreezes: 999 as number })
    expect(wild.streakFreezes).toBe(MAX_STREAK_FREEZES)

    const negative = await hydrateWith({ streakFreezes: -4 as number })
    expect(negative.streakFreezes).toBe(0)

    const junk = await hydrateWith({ streakFreezes: 'lots' as unknown as number })
    expect(junk.streakFreezes).toBe(0)
  })

  it('gives a record that predates freezes none rather than failing', async () => {
    const legacy = stored({ streakCount: 4 })
    delete (legacy as Partial<Progress>).streakFreezes
    vi.mocked(idbGet).mockResolvedValueOnce(legacy)

    await useProgress.getState().hydrate()

    expect(useProgress.getState().progress.streakFreezes).toBe(0)
    expect(useProgress.getState().progress.streakCount).toBe(4)
  })
})

describe('what a lesson pays', () => {
  beforeEach(() => {
    useProgress.getState().reset()
  })

  const startingFrom = (over: Partial<Progress>) => {
    useProgress.getState().replaceProgress({ ...progressWith({}), ...over })
  }

  it('extends a streak that had yesterday, and pays the base rate under a week', () => {
    startingFrom({ streakCount: 3, lastActiveDay: dayBefore(todayKey()) })

    const outcome = useProgress.getState().completeLesson('add-facts-small')

    expect(useProgress.getState().progress.streakCount).toBe(4)
    expect(outcome.coinsGained, 'unchanged from before the multiplier existed').toBe(15)
  })

  it('restarts a streak that missed a day', () => {
    startingFrom({ streakCount: 20, lastActiveDay: '2020-01-01' })

    useProgress.getState().completeLesson('add-facts-small')

    expect(useProgress.getState().progress.streakCount).toBe(1)
  })

  it('does not count a second lesson on the same day twice', () => {
    startingFrom({ streakCount: 3, lastActiveDay: dayBefore(todayKey()) })

    useProgress.getState().completeLesson('add-facts-small')
    useProgress.getState().completeLesson('add-facts-small')

    expect(useProgress.getState().progress.streakCount).toBe(4)
  })

  it('pays the rate of the run this lesson just extended', () => {
    // Day 6 finishing into day 7, which is where 1.25x begins. Paying the day-6
    // rate here would mean the screen saying "day 7" beside 15 coins.
    startingFrom({ streakCount: 6, lastActiveDay: dayBefore(todayKey()) })

    const outcome = useProgress.getState().completeLesson('add-facts-small')

    expect(useProgress.getState().progress.streakCount).toBe(7)
    expect(outcome.coinsGained).toBe(18)
  })

  it('pays a repeat lesson at the same multiplier', () => {
    startingFrom({
      streakCount: 29,
      lastActiveDay: dayBefore(todayKey()),
      skills: { ...progressWith({}).skills, 'add-facts-small': skill({ mastery: 5 }) },
    })

    const outcome = useProgress.getState().completeLesson('add-facts-small')

    expect(outcome.leveledUp, 'already at the cap').toBe(false)
    expect(outcome.coinsGained, '8 at 2x').toBe(16)
  })

  it('reports the milestone it crossed and pays it on top', () => {
    startingFrom({ streakCount: 2, lastActiveDay: dayBefore(todayKey()), coins: 0 })

    const outcome = useProgress.getState().completeLesson('add-facts-small')

    expect(outcome.streakMilestone).toEqual({ days: 3, coins: 25, index: 1, of: 5 })
    expect(
      useProgress.getState().progress.coins,
      'the lesson and the milestone both land',
    ).toBe(15 + 25)
  })

  it('reports no milestone on an ordinary day', () => {
    startingFrom({ streakCount: 3, lastActiveDay: dayBefore(todayKey()) })

    expect(useProgress.getState().completeLesson('add-facts-small').streakMilestone)
      .toBeUndefined()
  })
})

describe('buying a streak freeze', () => {
  beforeEach(() => {
    useProgress.getState().reset()
  })

  const withCoins = (coins: number, streakFreezes = 0) => {
    useProgress.getState().replaceProgress({ ...progressWith({}), coins, streakFreezes })
  }

  it('charges thirty coins and hands over one freeze', () => {
    withCoins(100)

    useProgress.getState().buyStreakFreeze()

    expect(useProgress.getState().progress.coins).toBe(70)
    expect(useProgress.getState().progress.streakFreezes).toBe(1)
  })

  it('refuses at the cap, however many coins are held', () => {
    withCoins(10_000, MAX_STREAK_FREEZES)
    const before = useProgress.getState().progress.updatedAt

    useProgress.getState().buyStreakFreeze()

    expect(useProgress.getState().progress.streakFreezes).toBe(MAX_STREAK_FREEZES)
    expect(useProgress.getState().progress.coins).toBe(10_000)
    expect(useProgress.getState().progress.updatedAt, 'no push for a refusal').toBe(before)
  })

  it('refuses when the coins are not there', () => {
    withCoins(29)
    const before = useProgress.getState().progress.updatedAt

    useProgress.getState().buyStreakFreeze()

    expect(useProgress.getState().progress.streakFreezes).toBe(0)
    expect(useProgress.getState().progress.coins).toBe(29)
    expect(useProgress.getState().progress.updatedAt).toBe(before)
  })

  it('leaves the wardrobe out of it', () => {
    withCoins(100)

    useProgress.getState().buyStreakFreeze()

    // A freeze is held on its own count, never as an inventory id — which is
    // what keeps `buy()`'s already-owned refusal true of everything in it.
    expect(useProgress.getState().progress.inventory).toEqual([])
  })
})
