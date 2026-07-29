import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { allSkills, skillById } from '../curriculum'

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
  }
}

type Store = {
  progress: Progress
  loaded: boolean
  hydrate: () => Promise<void>
  recordAttempt: (skillId: string, correct: boolean, misconceptionTag?: string) => void
  completeLesson: (skillId: string) => { xpGained: number; coinsGained: number; leveledUp: boolean }
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
  }
}

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

      persist({
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
      })

      return { xpGained, coinsGained, leveledUp }
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

/** A skill is available once every prerequisite has reached the threshold. */
export function isUnlocked(skillId: string, progress: Progress): boolean {
  const skill = skillById.get(skillId)
  if (!skill) return false
  return skill.prerequisites.every(
    (id) => (progress.skills[id]?.mastery ?? 0) >= UNLOCK_THRESHOLD,
  )
}

/** Difficulty tracks mastery, so lessons get harder as a skill is learned. */
export function difficultyFor(mastery: number) {
  return Math.min(5, Math.max(1, mastery + 1)) as 1 | 2 | 3 | 4 | 5
}
