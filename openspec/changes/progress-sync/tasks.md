## 1. Recovery key

- [x] 1.1 `src/lib/recovery-key.ts` — generate a Crockford base32 key, ~100 bits, formatted `MATH-XXXX-XXXX-XXXX-XXXX`
- [x] 1.2 Implement `normalizeKey()` — uppercase, strip spaces and hyphens, map `O`→`0` and `I`/`L`→`1`, then re-group
- [x] 1.3 Implement `isValidKey()` — format and checksum-free length validation, usable before any network call
- [x] 1.4 Tests: generated keys always validate; normalisation accepts lowercase, missing hyphens, extra spaces, and ambiguous-character substitutions; malformed keys rejected; no ambiguous characters ever generated; 10k generations produce no collisions
- [x] 1.5 Persist the key in IndexedDB, separate from the progress record so clearing progress does not discard it

## 2. Server endpoint

- [x] 2.1 Add `@vercel/kv` and create `api/progress.ts`
- [x] 2.2 `GET` — read bearer key from the `Authorization` header, validate format, return `{ progress, updatedAt }` or a not-stored response
- [x] 2.3 `PUT` — accept `{ progress, updatedAt, baseVersion }`; reject with 409 and the current copy when stored `updatedAt` is newer than `baseVersion`
- [x] 2.4 Reject missing or malformed keys as unauthorised, and never create a document for one
- [x] 2.5 Treat the blob as opaque — no schema validation, no interpretation, no migration
- [x] 2.6 Cap request body size so a corrupted client cannot fill the store
- [x] 2.7 Tests against a KV mock: round trip, not-stored, stale-write rejection, unauthorised, oversized body

## 3. Client sync

- [x] 3.1 Add `updatedAt` to the progress record; advance it on every local mutation in `src/store/progress.ts`
- [x] 3.2 `src/lib/sync.ts` — `pull()`: fetch, compare versions, adopt server copy if newer, push if local is newer, push if server holds nothing
- [x] 3.3 `push()` — send current state with `baseVersion`; on 409 adopt the server copy and notify rather than retrying blindly
- [x] 3.4 Subscribe to the Zustand store; schedule a debounced push (3s) on change — no component ever calls sync directly
- [x] 3.5 Flush pending push on `visibilitychange` to hidden
- [x] 3.6 Persist a dirty flag so a push pending at termination is retried on next launch
- [x] 3.7 Retry on `online` and on launch, with bounded backoff; retry latest state only, never a queue of operations
- [x] 3.8 Call `pull()` once during hydration, after the key is loaded
- [x] 3.9 Tests: server-newer adopts, local-newer pushes, equal does nothing, empty server initialises, 409 adopts server copy, offline queues then retries, debounce coalesces a burst into one request

## 4. Recovery key UI

- [x] 4.1 `src/components/RecoveryKey.tsx` — full key always visible in Settings, tap to copy with confirmation
- [x] 4.2 First-run explainer after the first completed lesson: what it is for, where to find it again, and that it cannot be recovered if lost
- [x] 4.3 Key entry form — validate locally before any request; clear message on malformed input
- [x] 4.4 Restore flow: fetch by key, adopt server progress, store the key
- [x] 4.5 Warn and require explicit confirmation when entering a different key while local progress exists
- [x] 4.6 Handle a well-formed key with nothing stored — accept it, say there was nothing to restore
- [x] 4.7 Wording review: conveys that whoever holds the key has access; makes no claim of security, privacy, or encryption

## 5. Sync status

- [x] 5.1 Show last-synced time in Settings
- [x] 5.2 Distinguish four states explicitly: synced, pending, offline, failed
- [x] 5.3 Never-synced is its own state with plain wording, not an empty timestamp
- [x] 5.4 Warn visibly when pushes have failed for more than 24 hours
- [x] 5.5 Tone check — status text stays warm and non-alarming, consistent with the rest of the app

## 6. Retire the export button

The gate itself ships before section 7, per the migration plan in `design.md` — it is a
runtime gate, so the button cannot vanish before sync has proven itself on the device, and
7.7 has nothing to verify until it exists. Only 6.5's on-device confirmation waits.

- [x] 6.1 Gate the export button at runtime on "at least one successful sync on this device"
- [x] 6.2 Remove the export button from the Settings UI once the gate is satisfied
- [x] 6.3 Retain `exportProgress()` and `importProgress()` as functions — only the routine button goes
- [x] 6.4 Keep file import reachable as a recovery action so Phase 1 backup files are not stranded
- [ ] 6.5 Verify a backup file exported before this change still restores, and then syncs to the server
      — logic covered by tests (`legacy backup files` in `src/lib/sync.test.ts`); on-device confirmation outstanding
- [x] 6.6 Update `README.md` — replace "back it up from settings" with the recovery-key model
- [x] 6.7 Re-check the skip-ahead note in `docs/curriculum.md` — `source` must survive a sync round trip, not just file export

## 7. Verify on the real device

- [x] 7.1 `npm test` green, `npx tsc --noEmit` clean, `npm run build` succeeds
- [x] 7.2 Deploy to Vercel and confirm the endpoint responds
      — production: `https://math-quest-pearl-zeta.vercel.app`, project `sjson421s-projects/math-quest`,
      store `upstash-kv-coffee-notebook`. Verified live against the deployed endpoint: 401 unauthorised,
      401 malformed key, 405 wrong method, 200 not-stored, PUT/GET round trip, 409 stale rejection with
      the stored copy left unchanged, 413 oversized body.
- [ ] 7.3 **Full round trip on the iPhone:** complete a lesson → confirm synced → clear site data → reinstall from home screen → enter the key → confirm progress, streak, and mastery all return
- [ ] 7.4 Airplane-mode run: complete a lesson offline, confirm it is queued, re-enable network, confirm it syncs
- [ ] 7.5 Force a stale write by hand and confirm the server rejects it and the client adopts the server copy
      — server half confirmed by hand against production (409 returned with its current copy; stored
      document unchanged). Client-adopts-on-409 still needs the device.
- [ ] 7.6 Confirm a failing sync is visible in Settings and cannot look like success
- [ ] 7.7 Confirm the export button is still present until 7.3 has passed, and only then disappears
