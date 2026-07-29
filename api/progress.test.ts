import { beforeEach, describe, expect, it } from 'vitest'
import { createProgressHandler, type ProgressStore, type StoredProgress } from './progress'

const KEY = 'MATH-A1B2-C3D4-E5F6-G7H8'
const ENDPOINT = 'https://example.test/api/progress'

function memoryStore() {
  const data = new Map<string, StoredProgress>()
  const store: ProgressStore = {
    async get(key) {
      return data.get(key) ?? null
    },
    async set(key, value) {
      data.set(key, value)
    },
  }
  return { store, data }
}

let store: ProgressStore
let data: Map<string, StoredProgress>
let handle: (request: Request) => Promise<Response>

beforeEach(() => {
  ;({ store, data } = memoryStore())
  handle = createProgressHandler(store)
})

const get = (auth?: string) =>
  handle(new Request(ENDPOINT, { headers: auth ? { authorization: auth } : {} }))

// `null` means send no Authorization header at all — distinct from omitting the
// argument, which uses the good key.
const put = (body: unknown, auth: string | null = `Bearer ${KEY}`, headers = {}) =>
  handle(
    new Request(ENDPOINT, {
      method: 'PUT',
      headers: { ...(auth ? { authorization: auth } : {}), ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

describe('round trip', () => {
  it('stores a blob and reads it back unchanged', async () => {
    const progress = { xp: 40, skills: { 'add-1': { mastery: 2 } } }

    const written = await put({ progress, updatedAt: 1000, baseVersion: null })
    expect(written.status).toBe(200)

    const read = await get(`Bearer ${KEY}`)
    expect(read.status).toBe(200)
    expect(await read.json()).toEqual({ stored: true, progress, updatedAt: 1000 })
  })

  it('accepts the key in whatever form the learner typed it', async () => {
    await put({ progress: { xp: 1 }, updatedAt: 1000, baseVersion: null })

    // Same key, lowercase and unhyphenated, must reach the same document.
    const read = await get(`Bearer ${KEY.toLowerCase().replace(/-/g, '')}`)
    expect(await read.json()).toMatchObject({ stored: true, updatedAt: 1000 })
  })

  it('keeps different keys apart', async () => {
    await put({ progress: { xp: 1 }, updatedAt: 1000, baseVersion: null })

    const read = await get('Bearer MATH-ZZZZ-ZZZZ-ZZZZ-ZZZZ')
    expect(await read.json()).toMatchObject({ stored: false })
  })
})

describe('nothing stored', () => {
  it('is a normal answer, not an error', async () => {
    const read = await get(`Bearer ${KEY}`)
    expect(read.status).toBe(200)
    expect(await read.json()).toEqual({ stored: false, progress: null, updatedAt: null })
  })
})

describe('stale writes', () => {
  beforeEach(async () => {
    await put({ progress: { xp: 100 }, updatedAt: 5000, baseVersion: null })
  })

  it('rejects a write based on an older version and returns the current copy', async () => {
    const response = await put({ progress: { xp: 20 }, updatedAt: 6000, baseVersion: 4000 })

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: 'stale',
      stored: true,
      progress: { xp: 100 },
      updatedAt: 5000,
    })
  })

  it('leaves the stored copy untouched when it refuses', async () => {
    await put({ progress: { xp: 20 }, updatedAt: 6000, baseVersion: 4000 })

    const read = await get(`Bearer ${KEY}`)
    expect(await read.json()).toMatchObject({ progress: { xp: 100 }, updatedAt: 5000 })
  })

  it('accepts a write from a client that has seen the current version', async () => {
    const response = await put({ progress: { xp: 120 }, updatedAt: 7000, baseVersion: 5000 })
    expect(response.status).toBe(200)

    const read = await get(`Bearer ${KEY}`)
    expect(await read.json()).toMatchObject({ progress: { xp: 120 }, updatedAt: 7000 })
  })

  it('refuses a client that thinks nothing is stored when something is', async () => {
    // A fresh install pushing over an existing key must not wipe it.
    const response = await put({ progress: { xp: 0 }, updatedAt: 9000, baseVersion: null })
    expect(response.status).toBe(409)
  })
})

describe('authorisation', () => {
  it('rejects a request with no key', async () => {
    expect((await get()).status).toBe(401)
    expect((await put({ progress: {}, updatedAt: 1 }, null)).status).toBe(401)
  })

  it('rejects a malformed key', async () => {
    expect((await get('Bearer not-a-key')).status).toBe(401)
    expect((await get('Bearer MATH-A1B2-C3D4-E5F6')).status).toBe(401)
  })

  it('rejects a key that is not a bearer token', async () => {
    expect((await get(KEY)).status).toBe(401)
  })

  it('never creates a document for a rejected key', async () => {
    await put({ progress: { xp: 1 }, updatedAt: 1000 }, 'Bearer nonsense')
    expect(data.size).toBe(0)
  })
})

describe('body limits', () => {
  it('rejects an oversized body by its declared length', async () => {
    const response = await put({ progress: {}, updatedAt: 1 }, `Bearer ${KEY}`, {
      'content-length': String(10 * 1024 * 1024),
    })
    expect(response.status).toBe(413)
    expect(data.size).toBe(0)
  })

  it('rejects an oversized body that declares no length', async () => {
    const progress = { blob: 'x'.repeat(300 * 1024) }
    const response = await put({ progress, updatedAt: 1, baseVersion: null })

    expect(response.status).toBe(413)
    expect(data.size).toBe(0)
  })

  it('accepts a realistically sized record', async () => {
    const skills = Object.fromEntries(
      Array.from({ length: 201 }, (_, i) => [`skill-${i}`, { mastery: 3, attempts: 40 }]),
    )
    const response = await put({ progress: { skills }, updatedAt: 1, baseVersion: null })
    expect(response.status).toBe(200)
  })
})

describe('the blob is opaque', () => {
  it('stores whatever shape it is handed', async () => {
    // No schema validation: a future client field must not need a server change.
    const progress = { totally: 'unknown', nested: [1, { two: 3 }], nul: null }
    await put({ progress, updatedAt: 1, baseVersion: null })

    const read = await get(`Bearer ${KEY}`)
    expect(await read.json()).toMatchObject({ progress })
  })

  it('still requires the fields it does depend on', async () => {
    expect((await put({ progress: {} })).status).toBe(400)
    expect((await put({ updatedAt: 1 })).status).toBe(400)
    expect((await put('{ not json')).status).toBe(400)
    expect((await put('"a string"')).status).toBe(400)
    expect((await put({ progress: {}, updatedAt: 1, baseVersion: 'nope' })).status).toBe(400)
  })
})

describe('methods', () => {
  it('refuses anything but GET and PUT', async () => {
    for (const method of ['POST', 'DELETE', 'PATCH']) {
      const response = await handle(
        new Request(ENDPOINT, { method, headers: { authorization: `Bearer ${KEY}` } }),
      )
      expect(response.status, method).toBe(405)
      expect(response.headers.get('allow')).toBe('GET, PUT')
    }
  })
})
