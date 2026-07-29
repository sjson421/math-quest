/**
 * Background sync between the device and the server copy.
 *
 * Two rules shape everything here:
 *
 * 1. **The device is the working store.** Sync is additive. A failure never
 *    blocks a lesson, delays an answer, or interrupts the learner. Every path
 *    that can fail ends in "record it and try again later".
 *
 * 2. **A stale device must never overwrite newer progress.** Pushes declare the
 *    version they last saw; the server refuses if its own is newer. A refusal
 *    is resolved by adopting the server copy and saying so — never by pushing
 *    harder.
 *
 * Sync is a *store subscriber*, not something components call. Sprinkling
 * `syncNow()` through lesson completion, purchases, and skip-ahead guarantees
 * some future feature forgets one; a subscriber cannot be forgotten.
 */

import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { useProgress, type Progress } from '../store/progress'
import { useRecoveryKey } from '../store/recovery-key'

export const SYNC_ENDPOINT = '/api/progress'

/** Long enough to coalesce a burst of answers, short enough to feel immediate. */
export const DEBOUNCE_MS = 3_000

/** Exponential, capped. Retrying forever at a slow rate beats giving up on data. */
const BACKOFF_MS = [5_000, 15_000, 60_000, 300_000, 900_000]

/** After this long without reaching the server, say so plainly in Settings. */
export const STALE_WARNING_MS = 24 * 60 * 60 * 1000

export type SyncStatus =
  /** Nothing has ever reached the server from this device. */
  | 'never'
  | 'synced'
  /** Local changes are waiting to go out. */
  | 'pending'
  | 'offline'
  | 'failed'

export type SyncSnapshot = {
  status: SyncStatus
  lastSyncedAt: number | null
  /** When the current run of failures started; null when not failing. */
  failingSince: number | null
  /** At least one successful sync on this device. Gates export removal. */
  everSynced: boolean
}

/** Something the learner needs told, because progress changed under them. */
export type SyncNotice = { kind: 'restored' | 'conflict' | 'nothing-stored'; message: string }

/** What survives a restart. The dirty flag is why a lost push comes back. */
export type SyncMeta = {
  /** The `updatedAt` this device last saw on the server. */
  serverVersion: number | null
  lastSyncedAt: number | null
  dirty: boolean
  failingSince: number | null
  everSynced: boolean
}

export const emptyMeta = (): SyncMeta => ({
  serverVersion: null,
  lastSyncedAt: null,
  dirty: false,
  failingSince: null,
  everSynced: false,
})

export type SyncEnv = {
  fetch: typeof fetch
  loadMeta: () => Promise<SyncMeta | null>
  saveMeta: (meta: SyncMeta) => Promise<void>
  getKey: () => string | null
  getProgress: () => Progress
  adoptProgress: (progress: Progress, version: number) => void
  subscribe: (listener: (progress: Progress) => void) => () => void
  isOnline: () => boolean
  onSnapshot: (snapshot: SyncSnapshot) => void
  onNotice: (notice: SyncNotice) => void
  now?: () => number
  endpoint?: string
  debounceMs?: number
}

type PullBody = {
  stored: boolean
  progress: Progress | null
  updatedAt: number | null
}

export type PullOutcome = 'restored' | 'pushed' | 'in-sync' | 'nothing-stored' | 'failed'

export type Sync = ReturnType<typeof createSync>

export function createSync(env: SyncEnv) {
  const now = env.now ?? (() => Date.now())
  const endpoint = env.endpoint ?? SYNC_ENDPOINT
  const debounceMs = env.debounceMs ?? DEBOUNCE_MS

  let meta = emptyMeta()
  let timer: ReturnType<typeof setTimeout> | null = null
  let failures = 0
  let unsubscribe: (() => void) | null = null
  /** One request at a time; a second would race the version guard. */
  let inFlight: Promise<void> | null = null

  const snapshot = (): SyncSnapshot => ({
    status: statusFor(),
    lastSyncedAt: meta.lastSyncedAt,
    failingSince: meta.failingSince,
    everSynced: meta.everSynced,
  })

  function statusFor(): SyncStatus {
    if (meta.failingSince !== null) return env.isOnline() ? 'failed' : 'offline'
    if (meta.dirty) return 'pending'
    return meta.everSynced ? 'synced' : 'never'
  }

  function commit() {
    void env.saveMeta(meta).catch(() => {})
    env.onSnapshot(snapshot())
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function markSuccess(serverVersion: number) {
    meta = {
      serverVersion,
      lastSyncedAt: now(),
      dirty: false,
      failingSince: null,
      everSynced: true,
    }
    failures = 0
    commit()
  }

  function markFailure() {
    meta = { ...meta, dirty: true, failingSince: meta.failingSince ?? now() }
    commit()
    scheduleRetry()
  }

  function scheduleRetry() {
    clearTimer()
    const delay = BACKOFF_MS[Math.min(failures, BACKOFF_MS.length - 1)]
    failures += 1
    timer = setTimeout(() => {
      timer = null
      void push()
    }, delay)
  }

  const authHeaders = (key: string) => ({ authorization: `Bearer ${key}` })

  /**
   * Compare the two copies and move data in whichever direction is correct.
   * Called once on launch, after the key is known.
   *
   * `adoptRegardless` is for an explicit restore: the learner typed that key
   * *asking* for its progress, so a stored copy wins even when the local clock
   * happens to read later.
   */
  async function pull({ notify = true, adoptRegardless = false } = {}): Promise<PullOutcome> {
    const key = env.getKey()
    if (!key) return 'failed'
    if (!env.isOnline()) {
      meta = { ...meta, dirty: meta.dirty, failingSince: meta.failingSince ?? now() }
      commit()
      return 'failed'
    }

    let body: PullBody
    try {
      const response = await env.fetch(endpoint, { headers: authHeaders(key) })
      if (!response.ok) {
        markFailure()
        return 'failed'
      }
      body = (await response.json()) as PullBody
    } catch {
      markFailure()
      return 'failed'
    }

    const local = env.getProgress()

    if (!body.stored || body.updatedAt === null || body.progress === null) {
      meta = { ...meta, serverVersion: null }
      // An untouched install has nothing worth storing; wait for a first lesson.
      if (local.updatedAt > 0) {
        await pushNow()
      } else {
        commit()
      }
      return 'nothing-stored'
    }

    const server = body.updatedAt
    meta = { ...meta, serverVersion: server }

    if (adoptRegardless || server > local.updatedAt) {
      // Record the version *before* adopting: adopting writes to the store,
      // which wakes the subscriber, which would otherwise read a stale
      // `serverVersion` and schedule a pointless push of what we just received.
      markSuccess(server)
      env.adoptProgress(body.progress, server)
      if (notify) {
        env.onNotice({
          kind: 'restored',
          message: 'Your progress was restored from your last device.',
        })
      }
      return 'restored'
    }

    if (local.updatedAt > server) {
      await pushNow()
      return 'pushed'
    }

    markSuccess(server)
    return 'in-sync'
  }

  /** Send current state. Never a queue of operations — progress is a snapshot. */
  async function pushNow(): Promise<void> {
    const key = env.getKey()
    if (!key) return

    const local = env.getProgress()
    if (local.updatedAt === 0) {
      commit()
      return
    }

    if (!env.isOnline()) {
      meta = { ...meta, dirty: true, failingSince: meta.failingSince ?? now() }
      commit()
      return
    }

    let response: Response
    try {
      response = await env.fetch(endpoint, {
        method: 'PUT',
        headers: { ...authHeaders(key), 'content-type': 'application/json' },
        body: JSON.stringify({
          progress: local,
          updatedAt: local.updatedAt,
          baseVersion: meta.serverVersion,
        }),
      })
    } catch {
      markFailure()
      return
    }

    if (response.status === 409) {
      // The server holds something newer. Adopting is the only safe resolution;
      // retrying would be exactly the silent overwrite the guard exists to stop.
      try {
        const conflict = (await response.json()) as PullBody
        if (conflict.progress !== null && conflict.updatedAt !== null) {
          markSuccess(conflict.updatedAt)
          env.adoptProgress(conflict.progress, conflict.updatedAt)
          env.onNotice({
            kind: 'conflict',
            message: 'Newer progress was already saved, so that copy is now on this device.',
          })
          return
        }
      } catch {
        /* fall through to the generic failure path */
      }
      markFailure()
      return
    }

    if (!response.ok) {
      markFailure()
      return
    }

    markSuccess(local.updatedAt)
  }

  /** Serialised so a debounce firing mid-pull cannot race the version guard. */
  function push(): Promise<void> {
    const run = (inFlight ?? Promise.resolve()).then(pushNow, pushNow)
    inFlight = run.finally(() => {
      if (inFlight === run) inFlight = null
    })
    return inFlight
  }

  /** Local progress changed. Mark it unsent and coalesce into one request. */
  function onProgressChange(progress: Progress) {
    // Adopting a server copy also fires the subscriber. Only a version beyond
    // what the server already holds is a genuine local change.
    if (progress.updatedAt <= (meta.serverVersion ?? 0)) return

    meta = { ...meta, dirty: true }
    commit()

    clearTimer()
    timer = setTimeout(() => {
      timer = null
      void push()
    }, debounceMs)
  }

  return {
    snapshot,

    /** Load persisted state, subscribe, and reconcile with the server once. */
    async start(): Promise<void> {
      meta = (await env.loadMeta().catch(() => null)) ?? emptyMeta()
      // A device that shut down mid-push comes back still owing one.
      failures = 0
      env.onSnapshot(snapshot())

      unsubscribe?.()
      unsubscribe = env.subscribe(onProgressChange)

      await pull()
    },

    pull,
    push,

    /**
     * The learner entered a different key. The previous key's sync state is
     * meaningless under the new identity, so it is thrown away rather than
     * carried over — a stale `serverVersion` would make the first push look
     * stale or, worse, look current.
     *
     * Caller is responsible for having stored the new key first.
     */
    async switchKey(): Promise<PullOutcome> {
      clearTimer()
      failures = 0
      meta = emptyMeta()
      return pull({ notify: false, adoptRegardless: true })
    },

    /**
     * Send anything pending right now. The common case is finishing a lesson
     * and immediately backgrounding the app, where a pending debounce would
     * otherwise be lost.
     */
    async flush(): Promise<void> {
      const pendingDebounce = timer !== null
      clearTimer()
      if (pendingDebounce || meta.dirty) await push()
    },

    /** Connectivity came back. Retry with current state. */
    async handleOnline(): Promise<void> {
      env.onSnapshot(snapshot())
      if (meta.dirty) {
        failures = 0
        await push()
      }
    },

    stop() {
      clearTimer()
      unsubscribe?.()
      unsubscribe = null
    },
  }
}

/** True once this device has proven it can reach the server. */
export function hasProvenSync(snapshot: SyncSnapshot): boolean {
  return snapshot.everSynced
}

/** Failing long enough that the learner should be told progress is not backed up. */
export function isDangerouslyStale(snapshot: SyncSnapshot, at = Date.now()): boolean {
  return snapshot.failingSince !== null && at - snapshot.failingSince > STALE_WARNING_MS
}

type SyncStatusStore = SyncSnapshot & {
  notice: SyncNotice | null
  set: (snapshot: SyncSnapshot) => void
  notify: (notice: SyncNotice) => void
  dismiss: () => void
}

/** What Settings and the notice banner read. Written only by the sync engine. */
export const useSyncStatus = create<SyncStatusStore>((set) => ({
  status: 'never',
  lastSyncedAt: null,
  failingSince: null,
  everSynced: false,
  notice: null,
  set: (snapshot) => set(snapshot),
  notify: (notice) => set({ notice }),
  dismiss: () => set({ notice: null }),
}))

/* ------------------------------------------------------------------------- *
 * Browser wiring
 * ------------------------------------------------------------------------- */

const SYNC_META_KEY = 'math-quest-sync'

let instance: Sync | null = null

/**
 * Build the real sync engine and attach it to the browser. Called once during
 * hydration, after the recovery key is loaded.
 */
export async function initSync(): Promise<Sync> {
  if (instance) return instance

  // Generates and stores a key on first run, so sync always has an identity.
  await useRecoveryKey.getState().load()

  const sync = createSync({
    fetch: (...args) => fetch(...args),
    loadMeta: async () => (await idbGet<SyncMeta>(SYNC_META_KEY)) ?? null,
    saveMeta: (meta) => idbSet(SYNC_META_KEY, meta),
    getKey: () => useRecoveryKey.getState().key,
    getProgress: () => useProgress.getState().progress,
    adoptProgress: (progress, version) => useProgress.getState().adoptRemote(progress, version),
    subscribe: (listener) =>
      useProgress.subscribe((state, previous) => {
        if (state.progress !== previous.progress) listener(state.progress)
      }),
    isOnline: () => navigator.onLine !== false,
    onSnapshot: (snapshot) => useSyncStatus.getState().set(snapshot),
    onNotice: (notice) => useSyncStatus.getState().notify(notice),
  })

  instance = sync

  window.addEventListener('online', () => void sync.handleOnline())
  window.addEventListener('offline', () => useSyncStatus.getState().set(sync.snapshot()))

  // iOS may never fire `beforeunload` or run code after the app is swiped away,
  // so backgrounding is the last reliable moment to get a pending push out.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void sync.flush()
  })
  window.addEventListener('pagehide', () => void sync.flush())

  await sync.start()
  return sync
}

/** The live engine, if `initSync` has run. */
export function currentSync(): Sync | null {
  return instance
}

/**
 * Adopt a key the learner typed in. Validation is the caller's job — this is
 * only reached once the format check has passed.
 */
export async function restoreFromKey(key: string): Promise<PullOutcome> {
  const sync = await initSync()
  await useRecoveryKey.getState().replace(key)
  return sync.switchKey()
}
