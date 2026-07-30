## Why

Progress lives only in IndexedDB on one iPhone. iOS can evict web app storage, and a lost
or reset phone takes months of streak with it. The current mitigation is a manual export
button the learner has to remember to press — which means the backup is only as good as
her habit of making one, and she will not make one the day before she needs it.

A server-side copy is the only thing that actually survives eviction, device loss, and
reinstall. For a single learner the cost is effectively zero: roughly 200 requests and a
few KB per month, against a free tier measured in hundreds of thousands of commands and
hundreds of megabytes.

The earlier "no backend" decision was a simplicity choice, not a requirement. Storage
eviction is the worst failure this app has, and this is the fix.

## What Changes

- Add a **single serverless endpoint** on the existing Vercel deployment, backed by KV,
  storing one JSON blob per learner.
- Add **background sync**: pull on launch, debounced push after each lesson. The app stays
  local-first — IndexedDB remains the working store and the app is fully usable offline.
- Add a **recovery key** as identity. One generated, human-transcribable key, no account,
  no password, no email. Entering it on a new device restores everything.
- The recovery key is **always viewable in Settings**, not shown once. With file export
  removed, the key becomes the only route back to the data, so it must never be
  irretrievable.
- **BREAKING (UI):** remove the manual **Export backup** button. Sync supersedes it as the
  routine backup path.
- Retain a **one-time restore-from-file** path so any backup JSON already exported during
  Phase 1 is not stranded. This is recovery-only, not presented as a routine action.
- Add **sync status** to Settings — last synced time, and a clear offline/failed state so a
  silent sync failure cannot masquerade as everything being fine.

## Capabilities

### New Capabilities

- `progress-sync`: Server-side persistence of learner progress, the pull/push lifecycle,
  offline queuing and retry, conflict detection between a device and the server, and the
  sync status surfaced to the learner.
- `recovery-key`: Identity without accounts — key generation, display and re-display,
  entry on a new device, and the restore flow. Also covers the honest security posture,
  since the key is a bearer credential.

### Modified Capabilities

None. `openspec/specs/` currently holds no backup or settings spec, so removing the export
button changes no existing requirement — it is captured under `progress-sync` as the
routine backup path.

## Impact

**New files**
- `api/progress.ts` — the Vercel serverless function (GET, PUT)
- `src/lib/sync.ts` — client pull/push, debounce, offline queue, retry
- `src/lib/recovery-key.ts` — generation, formatting, validation
- `src/components/RecoveryKey.tsx` — first-run display, Settings re-display, entry form
- tests for each

**Modified**
- `src/store/progress.ts` — `updatedAt` on the progress record; trigger push on mutation
- `src/components/Settings.tsx` — remove export button, add recovery key and sync status
- `README.md` — replace the "back it up from settings" guidance
- `docs/curriculum.md` — the skip-ahead section references backup carrying `source`; confirm
  it still holds once sync is the transport

**Dependencies**
- `@vercel/kv` (or Upstash Redis client) — server-side only
- No new client dependencies

**Risk: moderate — higher than any change so far, because it can lose data.**
- Removing export deletes the existing safety net. Mitigated by gating removal behind a
  proven-working sync (see tasks) and retaining recovery-only file import.
- A bad merge could overwrite good progress with stale state. Mitigated by a version guard
  that rejects stale writes rather than silently clobbering.
- The recovery key is now the only route to the data. Mitigated by always-viewable display.

## Non-goals

- **No real authentication.** The recovery key is a bearer token. Anyone holding it can
  read and write that progress. Acceptable for math-lesson data; it must be described
  honestly and never called secure.
- **No encryption at rest.** The data is lesson progress, not anything sensitive.
- **No multi-device merge.** Conflict handling detects and refuses stale writes; it does
  not field-wise merge two diverged devices. One learner, one phone. Revisit only if that
  changes.
- **No accounts, email, passwords, or login UI.**
- **No sync of settings or cosmetics** beyond what already lives in the progress record.
- **No server-side validation of progress contents.** The server stores an opaque blob.
- **Not a general backup service.** One key, one blob, one learner.
