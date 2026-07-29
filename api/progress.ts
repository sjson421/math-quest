/**
 * One JSON blob per recovery key. That is the entire server.
 *
 * The blob is **opaque** — this endpoint never validates, interprets, or
 * migrates the progress schema. Adding a field to the client must never require
 * touching this file. The only thing it understands is `updatedAt`, because
 * that is what makes a stale write detectable.
 *
 * Auth is the recovery key as a bearer token. That is not real authentication
 * and is not described as such anywhere; see the recovery-key spec.
 */

// The `.js` extension is deliberate and points at `recovery-key.ts`. Vercel
// typechecks this directory under `nodenext` (package.json declares
// `"type": "module"`), which requires explicit extensions on relative imports;
// the local `bundler` resolution in tsconfig.api.json accepts them too. Dropping
// it builds fine here and warns on every deploy.
import { isValidKey, normalizeKey } from '../src/lib/recovery-key.js'

export const config = { runtime: 'edge' }

/**
 * A progress record is a few KB. The cap is generous headroom against a
 * corrupted client filling the store, not a schema constraint.
 */
const MAX_BODY_BYTES = 256 * 1024

export type StoredProgress = {
  progress: unknown
  updatedAt: number
}

/** The slice of a key–value store this endpoint needs. Keeps it mockable. */
export type ProgressStore = {
  get(key: string): Promise<StoredProgress | null>
  set(key: string, value: StoredProgress): Promise<void>
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

/** Namespaced so the store can hold something else later without a migration. */
const storeKeyFor = (recoveryKey: string) => `progress:${normalizeKey(recoveryKey)}`

/**
 * The recovery key from `Authorization: Bearer <key>`, or null if absent or
 * malformed. A malformed key is rejected before it can name a document, so a
 * typo can never bring a new empty record into existence.
 */
function readKey(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  if (!match) return null

  const candidate = match[1].trim()
  return isValidKey(candidate) ? normalizeKey(candidate) : null
}

/** Cheap rejection on the declared length, then on what actually arrived. */
async function readBody(request: Request): Promise<{ text: string } | { tooLarge: true }> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { tooLarge: true }

  const text = await request.text()
  // A body can arrive chunked with no content-length, so measure it for real.
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { tooLarge: true }

  return { text }
}

export function createProgressHandler(store: ProgressStore) {
  return async function handle(request: Request): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'PUT') {
      return new Response(null, { status: 405, headers: { allow: 'GET, PUT' } })
    }

    const key = readKey(request)
    if (!key) return json({ error: 'unauthorized' }, 401)

    if (request.method === 'GET') {
      const stored = await store.get(storeKeyFor(key))

      // Nothing stored is a normal answer for a new learner, not an error.
      return stored
        ? json({ stored: true, progress: stored.progress, updatedAt: stored.updatedAt })
        : json({ stored: false, progress: null, updatedAt: null })
    }

    const body = await readBody(request)
    if ('tooLarge' in body) return json({ error: 'too-large' }, 413)

    let parsed: unknown
    try {
      parsed = JSON.parse(body.text)
    } catch {
      return json({ error: 'malformed-body' }, 400)
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return json({ error: 'malformed-body' }, 400)
    }

    const { progress, updatedAt, baseVersion } = parsed as {
      progress?: unknown
      updatedAt?: unknown
      baseVersion?: unknown
    }

    // `updatedAt` is the one field with meaning here. Everything else is opaque.
    if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) {
      return json({ error: 'missing-updated-at' }, 400)
    }
    if (progress === undefined) return json({ error: 'missing-progress' }, 400)
    if (baseVersion !== null && baseVersion !== undefined && typeof baseVersion !== 'number') {
      return json({ error: 'malformed-base-version' }, 400)
    }

    const stored = await store.get(storeKeyFor(key))

    // A client that has never seen the server sends no baseVersion. If something
    // is already stored, it is by definition newer than what this client knows,
    // so the write is refused rather than allowed to clobber it.
    const seen = typeof baseVersion === 'number' ? baseVersion : null
    if (stored && (seen === null || stored.updatedAt > seen)) {
      return json(
        { error: 'stale', stored: true, progress: stored.progress, updatedAt: stored.updatedAt },
        409,
      )
    }

    await store.set(storeKeyFor(key), { progress, updatedAt })
    return json({ ok: true, updatedAt })
  }
}

/**
 * Upstash rather than `@vercel/kv`: Vercel KV is deprecated and cannot be
 * provisioned for a new project — the marketplace hands out Upstash Redis,
 * which is what `@vercel/kv` wrapped anyway. Imported lazily so tests and
 * typechecking never need credentials.
 */
function upstashStore(): ProgressStore {
  let client: Promise<{
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<unknown>
  }> | null = null

  // Read off `globalThis` rather than the `process` global: the edge runtime
  // provides the values but not the Node type definitions, and the client test
  // suite imports this module to exercise the handler.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env

  const connect = async () => {
    const { Redis } = await import('@upstash/redis')
    return new Redis({
      url: env?.KV_REST_API_URL ?? env?.UPSTASH_REDIS_REST_URL ?? '',
      token: env?.KV_REST_API_TOKEN ?? env?.UPSTASH_REDIS_REST_TOKEN ?? '',
    })
  }

  return {
    async get(key) {
      client ??= connect()
      return ((await (await client).get(key)) as StoredProgress | null) ?? null
    },
    async set(key, value) {
      client ??= connect()
      await (await client).set(key, value)
    },
  }
}

export default createProgressHandler(upstashStore())
