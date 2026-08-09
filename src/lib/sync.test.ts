import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProgressHandler, type ProgressStore, type StoredProgress } from '../../api/progress'
import { initialProgress, nextVersion, type Progress } from '../store/progress'
import {
  createSync,
  DEBOUNCE_MS,
  emptyMeta,
  hasProvenSync,
  isDangerouslyStale,
  STALE_WARNING_MS,
  type Sync,
  type SyncMeta,
  type SyncNotice,
  type SyncSnapshot,
} from './sync'
import { buy } from './wardrobe'

const KEY = 'MATH-A1B2-C3D4-E5F6-G7H8'

const progressAt = (updatedAt: number, xp = updatedAt): Progress => ({
  ...initialProgress(),
  updatedAt,
  xp,
})

/**
 * The tests run the client against the *real* endpoint handler over an
 * in-memory store. A hand-written fake server would let the two drift apart,
 * and the version guard is exactly the thing that must not drift.
 */
function harness(options: { local?: Progress; meta?: SyncMeta; online?: boolean } = {}) {
  const documents = new Map<string, StoredProgress>()
  const store: ProgressStore = {
    async get(key) {
      return documents.get(key) ?? null
    },
    async set(key, value) {
      documents.set(key, value)
    },
  }
  const handle = createProgressHandler(store)

  let progress = options.local ?? initialProgress()
  let online = options.online ?? true
  let meta: SyncMeta | null = options.meta ?? null
  let listener: ((progress: Progress) => void) | null = null

  const notices: SyncNotice[] = []
  const snapshots: SyncSnapshot[] = []
  const requests: { method: string; body: unknown }[] = []

  const fetchImpl = vi.fn(async (_input: unknown, init?: RequestInit) => {
    if (!online) throw new TypeError('Load failed')
    requests.push({
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    })
    return handle(new Request('https://example.test/api/progress', init))
  })

  const sync: Sync = createSync({
    fetch: fetchImpl as unknown as typeof fetch,
    loadMeta: async () => meta,
    saveMeta: async (next) => {
      meta = next
    },
    getKey: () => KEY,
    getProgress: () => progress,
    adoptProgress: (next, version) => {
      progress = { ...next, updatedAt: version }
      listener?.(progress)
    },
    subscribe: (cb) => {
      listener = cb
      return () => {
        listener = null
      }
    },
    isOnline: () => online,
    onSnapshot: (snapshot) => snapshots.push(snapshot),
    onNotice: (notice) => notices.push(notice),
  })

  return {
    sync,
    notices,
    snapshots,
    requests,
    fetchImpl,
    documents,
    get progress() {
      return progress
    },
    get meta() {
      return meta
    },
    /** A local mutation, the way the store would make it. */
    mutate(updatedAt: number, xp = updatedAt) {
      progress = { ...progress, updatedAt, xp }
      listener?.(progress)
    },
    /** A local mutation that changed something other than xp. */
    mutateTo(next: Progress, updatedAt: number) {
      progress = { ...next, updatedAt }
      listener?.(progress)
    },
    setOnline(value: boolean) {
      online = value
    },
    /** Put a document on the server without going through the client. */
    async seedServer(serverProgress: Progress) {
      documents.set(`progress:${KEY}`, {
        progress: serverProgress,
        updatedAt: serverProgress.updatedAt,
      })
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('pull', () => {
  it('adopts the server copy when it is newer', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.seedServer(progressAt(5000, 99))

    await h.sync.start()

    expect(h.progress.xp).toBe(99)
    expect(h.progress.updatedAt).toBe(5000)
    expect(h.notices).toContainEqual(expect.objectContaining({ kind: 'restored' }))
    expect(h.sync.snapshot().status).toBe('synced')
  })

  it('pushes when the local copy is newer, leaving local untouched', async () => {
    const h = harness({ local: progressAt(9000, 42) })
    await h.seedServer(progressAt(1000, 7))

    await h.sync.start()

    expect(h.progress.xp).toBe(42)
    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 9000 })
    expect(h.sync.snapshot().status).toBe('synced')
  })

  it('transfers nothing when the versions match', async () => {
    const local = progressAt(4000, 30)
    const h = harness({ local })
    await h.seedServer(local)

    await h.sync.start()

    // One GET, no PUT.
    expect(h.requests.map((r) => r.method)).toEqual(['GET'])
    expect(h.notices).toEqual([])
    expect(h.sync.snapshot().status).toBe('synced')
  })

  it('initialises the server when it holds nothing', async () => {
    const h = harness({ local: progressAt(3000, 21) })

    await h.sync.start()

    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 3000 })
    expect(h.sync.snapshot().everSynced).toBe(true)
  })

  it('does not push an untouched install', async () => {
    // A fresh device has nothing worth storing; wait for a first lesson.
    const h = harness({ local: initialProgress() })

    await h.sync.start()

    expect(h.requests.map((r) => r.method)).toEqual(['GET'])
    expect(h.documents.size).toBe(0)
    expect(h.sync.snapshot().status).toBe('never')
  })
})

describe('conflict', () => {
  it('adopts the server copy when a push is refused as stale', async () => {
    const h = harness({ local: progressAt(2000, 20) })
    await h.sync.start() // server is empty, so this stores 2000

    // Another device writes something newer behind our back.
    await h.seedServer(progressAt(8000, 500))

    h.mutate(3000, 25)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(h.progress.xp).toBe(500)
    expect(h.progress.updatedAt).toBe(8000)
    expect(h.notices).toContainEqual(expect.objectContaining({ kind: 'conflict' }))
    // The server's copy is what survives.
    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 8000 })
  })

  it('does not push again after adopting, so a conflict cannot loop', async () => {
    const h = harness({ local: progressAt(2000, 20) })
    await h.sync.start()
    await h.seedServer(progressAt(8000, 500))

    h.mutate(3000, 25)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    const after = h.requests.length
    await vi.advanceTimersByTimeAsync(60_000)
    expect(h.requests.length).toBe(after)
    expect(h.sync.snapshot().status).toBe('synced')
  })
})

describe('debounce', () => {
  it('coalesces a burst of changes into one request', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()
    const before = h.requests.length

    h.mutate(2000, 20)
    h.mutate(2100, 30)
    h.mutate(2200, 40)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    const puts = h.requests.slice(before).filter((r) => r.method === 'PUT')
    expect(puts).toHaveLength(1)
    // And it carries the latest state, not the first.
    expect(puts[0].body).toMatchObject({ updatedAt: 2200 })
  })

  it('does not send before the window closes', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()
    const before = h.requests.length

    h.mutate(2000, 20)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 100)

    expect(h.requests.length).toBe(before)
    expect(h.sync.snapshot().status).toBe('pending')
  })

  it('flushes a pending push when the app is backgrounded', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()

    h.mutate(2000, 20)
    await h.sync.flush()

    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 2000 })
  })

  it('pushes a purchase, carrying the reduced balance and the new wardrobe', async () => {
    // Nothing in `sync.ts` knows what a cosmetic is. This passes because sync is
    // a store *subscriber* rather than something the shop remembers to call —
    // which is the whole reason it was built that way.
    const before = { ...progressAt(1000, 10), coins: 100 }
    const h = harness({ local: before })
    await h.sync.start()

    h.mutateTo(buy(before, 'round-glasses')!, 2000)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    const stored = h.documents.get(`progress:${KEY}`)?.progress as Progress
    expect(stored.coins).toBe(60)
    expect(stored.inventory).toEqual(['round-glasses'])
  })
})

describe('offline', () => {
  it('queues a change and sends it on reconnect', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()

    h.setOnline(false)
    h.mutate(2000, 20)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(h.sync.snapshot().status).toBe('offline')
    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 1000 })

    h.setOnline(true)
    await h.sync.handleOnline()

    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 2000 })
    expect(h.sync.snapshot().status).toBe('synced')
  })

  it('retries only the latest state, never a queue of intermediate ones', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()

    h.setOnline(false)
    h.mutate(2000, 20)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
    h.mutate(3000, 30)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    h.setOnline(true)
    const before = h.requests.length
    await h.sync.handleOnline()

    const puts = h.requests.slice(before).filter((r) => r.method === 'PUT')
    expect(puts).toHaveLength(1)
    expect(puts[0].body).toMatchObject({ updatedAt: 3000 })
  })

  it('keeps the dirty flag so a push pending at termination comes back', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()

    h.setOnline(false)
    h.mutate(2000, 20)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(h.meta?.dirty).toBe(true)

    // Next launch: same persisted meta, connectivity restored.
    const relaunch = harness({ local: progressAt(2000, 20), meta: h.meta ?? emptyMeta() })
    await relaunch.sync.start()

    expect(relaunch.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 2000 })
    expect(relaunch.sync.snapshot().status).toBe('synced')
  })
})

describe('failure', () => {
  it('reports failure rather than silence, and retries on a backoff', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    await h.sync.start()

    h.fetchImpl.mockRejectedValue(new TypeError('Load failed'))
    h.mutate(2000, 20)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    expect(h.sync.snapshot().status).toBe('failed')
    expect(h.sync.snapshot().failingSince).not.toBeNull()

    const attempts = h.fetchImpl.mock.calls.length
    await vi.advanceTimersByTimeAsync(5_000)
    expect(h.fetchImpl.mock.calls.length).toBeGreaterThan(attempts)
  })

  it('never lets a failure look like a success', async () => {
    const h = harness({ local: progressAt(1000, 10) })
    h.fetchImpl.mockRejectedValue(new TypeError('Load failed'))

    await h.sync.start()

    const snapshot = h.sync.snapshot()
    expect(snapshot.status).toBe('failed')
    expect(snapshot.lastSyncedAt).toBeNull()
    expect(snapshot.everSynced).toBe(false)
  })

  it('warns only once failure has run past a day', () => {
    const at = 1_000_000_000
    const failing = (since: number | null): SyncSnapshot => ({
      status: 'failed',
      lastSyncedAt: null,
      failingSince: since,
      everSynced: false,
    })

    expect(isDangerouslyStale(failing(null), at)).toBe(false)
    expect(isDangerouslyStale(failing(at - STALE_WARNING_MS + 1000), at)).toBe(false)
    expect(isDangerouslyStale(failing(at - STALE_WARNING_MS - 1000), at)).toBe(true)
  })
})

describe('switching keys', () => {
  it('adopts the stored copy even when the local clock reads later', async () => {
    // An explicit restore is a request for *that* key's progress, so the
    // server copy wins regardless of timestamps.
    const h = harness({ local: progressAt(9_999_999, 3) })
    await h.seedServer(progressAt(1000, 250))

    const outcome = await h.sync.switchKey()

    expect(outcome).toBe('restored')
    expect(h.progress.xp).toBe(250)
  })

  it('reports a well-formed key with nothing stored, and keeps local progress', async () => {
    const h = harness({ local: progressAt(4000, 60) })

    const outcome = await h.sync.switchKey()

    expect(outcome).toBe('nothing-stored')
    expect(h.progress.xp).toBe(60)
    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({ updatedAt: 4000 })
  })

  it('discards the previous key sync state', async () => {
    const h = harness({
      local: progressAt(4000, 60),
      meta: { ...emptyMeta(), serverVersion: 123456, everSynced: true },
    })

    await h.sync.switchKey()

    // A carried-over serverVersion would have made this first push look current.
    expect(h.meta?.serverVersion).toBe(4000)
  })
})

describe('export gate', () => {
  /**
   * Removing the export button is the one irreversible part of this change, so
   * the gate is what makes it safe: the old safety net cannot disappear before
   * the new one has demonstrably worked on this device.
   */
  it('keeps export available until a sync has actually succeeded', async () => {
    const h = harness({ local: progressAt(4000, 60), online: false })

    await h.sync.start()

    expect(hasProvenSync(h.sync.snapshot())).toBe(false)
  })

  it('retires export once progress has reached the server', async () => {
    const h = harness({ local: progressAt(4000, 60) })

    await h.sync.start()

    expect(h.sync.snapshot().status).toBe('synced')
    expect(hasProvenSync(h.sync.snapshot())).toBe(true)
  })

  it('does not reopen the gate when a later sync fails', async () => {
    const h = harness({ local: progressAt(4000, 60) })
    await h.sync.start()

    h.setOnline(false)
    h.mutate(5000, 99)
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)

    // Failing now does not undo the fact that sync has worked here before, so
    // the button stays gone rather than flickering back on a flaky connection.
    expect(h.sync.snapshot().status).toBe('offline')
    expect(hasProvenSync(h.sync.snapshot())).toBe(true)
  })
})

describe('legacy backup files', () => {
  /**
   * Files exported during Phase 1 predate versioning entirely. They must not be
   * mistaken for an untouched install, or a restore would sit on the device and
   * never reach the server.
   */
  it('gives a version-less backup a version that counts as a real change', () => {
    // Exactly what a Phase 1 file holds: no `updatedAt` key at all.
    const { updatedAt: _omitted, ...legacy } = { ...initialProgress(), xp: 420 }
    const stored = legacy as Partial<Progress>

    expect(stored.updatedAt).toBeUndefined()

    // `reconcile` floors a missing version at 0; `persist` then advances it, so
    // the restore reads as a local change rather than an untouched install.
    const restoredAt = nextVersion(
      typeof stored.updatedAt === 'number' ? stored.updatedAt : 0,
      10_000,
    )

    expect(restoredAt).toBeGreaterThan(0)
  })

  it('pushes a restored legacy backup to a server holding nothing', async () => {
    const restored = progressAt(nextVersion(0, 10_000), 420)
    const h = harness({ local: restored })

    await h.sync.start()

    expect(h.documents.get(`progress:${KEY}`)).toMatchObject({
      progress: { xp: 420 },
    })
  })
})
