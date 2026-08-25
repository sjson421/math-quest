import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import {
  allSkills,
  manifestIndex,
  skillState,
  skillStates,
  unlockPrerequisites,
} from '../curriculum'
import { crossedStageCheckpoint, type StageCheckpoint } from '../lib/checkpoint'
import { DEFAULT_CHARACTER, type CosmeticSlot, type Equipped, type Placed, type RoomSlot } from '../cosmetics'
import { buy, equip, unequip } from '../lib/wardrobe'

const STORAGE_KEY = 'math-quest-progress'
const SCHEMA_VERSION = 1

/** Mastery a prerequisite must reach before it unlocks what follows. */
export const UNLOCK_THRESHOLD = 2
export const MAX_MASTERY = 5

export type SkillProgress = {
  mastery: number
  lastPracticed: string | null
  attempts: number
  correct: number
  /** Presentation state only; it never contributes to learning evidence. */
  introSeen?: boolean
}

export type Progress = {
  version: number
  /**
   * Milliseconds, advancing on every local mutation. This is what decides which
   * copy is newer when the device and the server disagree, so it must move
   * strictly forward — see `nextVersion`. Zero means untouched: a fresh install
   * has nothing worth pushing, and any server copy beats it.
   */
  updatedAt: number
  xp: number
  coins: number
  streakCount: number
  lastActiveDay: string | null
  dailyGoal: number
  todayXp: number
  todayDate: string
  skills: Record<string, SkillProgress>
  /** Misconception tag → times hit. Drives "you keep doing X" insights later. */
  mistakes: Record<string, number>
  /**
   * Catalogue ids the learner has bought, in the order they bought them. One
   * list across both kinds: a decoration is bought with the coins a cosmetic is
   * bought with, so a second inventory would be a second thing to keep in step.
   */
  inventory: string[]
  /**
   * Who the learner is playing as. Always set — there is no state in which
   * nobody is on screen — so this is a bare id rather than a slot map, and a
   * record that predates characters reconciles to the free one.
   */
  character: string
  /**
   * Slot → the cosmetic worn in it. An absent slot means the character's own
   * default, which is why nothing here changes when the character does.
   */
  equipped: Equipped
  /** Slot → the decoration standing in it. An absent slot means nothing there. */
  room: Placed
}

export type LessonOutcome = {
  xpGained: number
  coinsGained: number
  leveledUp: boolean
  checkpoint?: StageCheckpoint
}

/** Local calendar day. Deliberately not UTC — streaks should follow the learner. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`)
  const b = new Date(`${to}T00:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

const emptySkill = (): SkillProgress => ({
  mastery: 0,
  lastPracticed: null,
  attempts: 0,
  correct: 0,
  introSeen: false,
})

/**
 * `Date.now()` repeats within a millisecond, and two mutations can land in the
 * same tick. The version has to advance strictly or a change becomes invisible
 * to the conflict guard.
 */
export function nextVersion(previous: number, now = Date.now()): number {
  return Math.max(now, previous + 1)
}

export function initialProgress(): Progress {
  return {
    version: SCHEMA_VERSION,
    updatedAt: 0,
    xp: 0,
    coins: 0,
    streakCount: 0,
    lastActiveDay: null,
    dailyGoal: 30,
    todayXp: 0,
    todayDate: todayKey(),
    skills: Object.fromEntries(allSkills.map((s) => [s.id, emptySkill()])),
    mistakes: {},
    inventory: [],
    character: DEFAULT_CHARACTER,
    equipped: {},
    room: {},
  }
}

type Store = {
  progress: Progress
  loaded: boolean
  hydrate: () => Promise<void>
  recordAttempt: (skillId: string, correct: boolean, misconceptionTag?: string) => void
  markIntroSeen: (skillId: string) => void
  completeLesson: (skillId: string) => LessonOutcome
  buyItem: (id: string) => void
  equipItem: (id: string) => void
  unequipSlot: (slot: CosmeticSlot | RoomSlot) => void
  replaceProgress: (next: Progress) => void
  adoptRemote: (next: Progress, version: number) => void
  reset: () => void
}

/** Merge a loaded blob over defaults so new skills appear without a migration. */
function reconcile(stored: Progress): Progress {
  const base = initialProgress()
  return {
    ...base,
    ...stored,
    version: SCHEMA_VERSION,
    updatedAt: typeof stored.updatedAt === 'number' ? stored.updatedAt : 0,
    skills: { ...base.skills, ...stored.skills },
    mistakes: { ...stored.mistakes },
    // Shape-checked rather than spread blindly. A record predating cosmetics has
    // none of these fields, and a corrupt one can carry anything: `{ ...'ab' }`
    // is `{ 0: 'a', 1: 'b' }`, which would survive as a junk wardrobe.
    inventory: Array.isArray(stored.inventory) ? [...stored.inventory] : [],
    character: typeof stored.character === 'string' ? stored.character : DEFAULT_CHARACTER,
    equipped: isSlotRecord<Equipped>(stored.equipped) ? { ...stored.equipped } : {},
    room: isSlotRecord<Placed>(stored.room) ? { ...stored.room } : {},
  }
}

/**
 * One guard for both slot maps. It is generic only so the caller names which map
 * it got back; the check itself is the same, because the failure it exists for —
 * a string spreading into indexed characters — is the same for either.
 */
const isSlotRecord = <T,>(value: unknown): value is T =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const useProgress = create<Store>((set, get) => {
  /**
   * Every local write goes through here, which is what makes the version
   * trustworthy — there is no way to change progress without advancing it.
   */
  const persist = (progress: Progress) => {
    const versioned = { ...progress, updatedAt: nextVersion(progress.updatedAt) }
    set({ progress: versioned })
    void idbSet(STORAGE_KEY, versioned)
  }

  return {
    progress: initialProgress(),
    loaded: false,

    async hydrate() {
      // Ask iOS not to evict us. Best-effort; installed PWAs are usually granted.
      if (navigator.storage?.persist) {
        void navigator.storage.persist().catch(() => {})
      }

      const stored = await idbGet<Progress>(STORAGE_KEY).catch(() => undefined)
      const progress = stored ? reconcile(stored) : initialProgress()

      // Roll the daily counter if the app was last opened on a previous day.
      const today = todayKey()
      if (progress.todayDate !== today) {
        progress.todayDate = today
        progress.todayXp = 0
      }

      // A missed day breaks the streak. Checked on load so the home screen is
      // honest the moment it opens, not only after finishing a lesson.
      if (progress.lastActiveDay && daysBetween(progress.lastActiveDay, today) > 1) {
        progress.streakCount = 0
      }

      set({ progress, loaded: true })
    },

    recordAttempt(skillId, correct, misconceptionTag) {
      const p = get().progress
      const skill = p.skills[skillId] ?? emptySkill()
      const mistakes = { ...p.mistakes }
      if (!correct && misconceptionTag) {
        mistakes[misconceptionTag] = (mistakes[misconceptionTag] ?? 0) + 1
      }
      persist({
        ...p,
        mistakes,
        skills: {
          ...p.skills,
          [skillId]: {
            ...skill,
            attempts: skill.attempts + 1,
            correct: skill.correct + (correct ? 1 : 0),
          },
        },
      })
    },

    markIntroSeen(skillId) {
      const p = get().progress
      const skill = p.skills[skillId]
      if (!skill || skill.introSeen === true) return

      persist({
        ...p,
        skills: {
          ...p.skills,
          [skillId]: { ...skill, introSeen: true },
        },
      })
    },

    completeLesson(skillId) {
      const p = get().progress
      const skill = p.skills[skillId] ?? emptySkill()
      const today = todayKey()

      const leveledUp = skill.mastery < MAX_MASTERY
      const xpGained = 20
      const coinsGained = leveledUp ? 15 : 8

      let streakCount = p.streakCount
      if (p.lastActiveDay !== today) {
        const gap = p.lastActiveDay ? daysBetween(p.lastActiveDay, today) : Infinity
        streakCount = gap === 1 ? p.streakCount + 1 : 1
      }

      const next = {
        ...p,
        xp: p.xp + xpGained,
        coins: p.coins + coinsGained,
        streakCount,
        lastActiveDay: today,
        todayDate: today,
        todayXp: (p.todayDate === today ? p.todayXp : 0) + xpGained,
        skills: {
          ...p.skills,
          [skillId]: {
            ...skill,
            mastery: Math.min(MAX_MASTERY, skill.mastery + 1),
            lastPracticed: today,
          },
        },
      }

      const checkpoint = crossedStageCheckpoint({
        skillId,
        before: p,
        after: next,
        locations: manifestIndex,
        states: skillStates,
        threshold: UNLOCK_THRESHOLD,
      })

      persist(next)

      return { xpGained, coinsGained, leveledUp, checkpoint }
    },

    /**
     * The three catalogue actions all persist only on a non-null result, so a
     * refusal — cannot afford, already owned, slot already empty — leaves
     * `updatedAt` alone and schedules no push. They cover both kinds: the pure
     * functions route on the item's own `kind`, so nothing here has to.
     */
    buyItem(id) {
      const next = buy(get().progress, id)
      if (next) persist(next)
    },

    equipItem(id) {
      const next = equip(get().progress, id)
      if (next) persist(next)
    },

    unequipSlot(slot) {
      const next = unequip(get().progress, slot)
      if (next) persist(next)
    },

    /**
     * A file the learner handed us. It counts as a local edit — a Phase 1
     * backup carries no version at all — so it advances and gets pushed.
     */
    replaceProgress(next) {
      persist(reconcile(next))
    },

    /**
     * The server's copy. Deliberately *not* a local edit: adopting keeps the
     * server's version so the client does not immediately push it back, which
     * would turn every restore into a needless round trip.
     */
    adoptRemote(next, version) {
      const progress = { ...reconcile(next), updatedAt: version }
      set({ progress })
      void idbSet(STORAGE_KEY, progress)
    },

    reset() {
      persist(initialProgress())
    },
  }
})

/**
 * Whether the learner has ever worked on this skill.
 *
 * `attempts` is the direct signal — it moves on the first answer of the first
 * lesson, before any mastery is earned. `mastery` is the belt-and-braces half:
 * it cannot rise without attempts through normal play, but a handed-over backup
 * file can carry it, and skipping ahead is specified to set mastery 3 with no
 * attempts at all.
 *
 * A missing record reads as not practised. `initialProgress()` seeds only the
 * skills with generators, so most of the 201 manifest ids have no entry.
 */
function hasPractised(record: SkillProgress | undefined): boolean {
  return (record?.attempts ?? 0) > 0 || (record?.mastery ?? 0) > 0
}

/**
 * Whether a lesson for this skill can be started.
 *
 * Three rules, and the first that decides wins:
 *
 *  1. A skill we cannot generate is locked — no generator, or a stage waiting on
 *     infrastructure that is not built.
 *  2. A skill the learner has already practised stays open. The curriculum graph
 *     moves as the course is built, and a skill that closes behind someone is a
 *     mastery they can keep but never raise. This is checked on every read rather
 *     than migrated once, because a record can arrive from the sync endpoint at
 *     any time and that endpoint stores it opaquely without ever migrating it.
 *  3. Otherwise every prerequisite must have reached the threshold.
 *
 * Rule 1 outranks rule 2 deliberately: handing back a skill whose lesson cannot
 * be generated is worse than one that closes because the course is unfinished.
 *
 * Prerequisites come from the manifest and from nowhere else — generators do not
 * declare their own. `unlockPrerequisites` has already seen through the skills
 * with no generator, so nobody is held behind our build order.
 */
export function isUnlocked(skillId: string, progress: Progress): boolean {
  if (skillState(skillId) !== 'implemented') return false
  if (hasPractised(progress.skills[skillId])) return true

  return (unlockPrerequisites.get(skillId) ?? []).every(
    (id) => (progress.skills[id]?.mastery ?? 0) >= UNLOCK_THRESHOLD,
  )
}

/** Difficulty tracks mastery, so lessons get harder as a skill is learned. */
export function difficultyFor(mastery: number) {
  return Math.min(5, Math.max(1, mastery + 1)) as 1 | 2 | 3 | 4 | 5
}
