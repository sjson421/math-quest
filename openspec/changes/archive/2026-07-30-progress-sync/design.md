## Context

Progress lives in one IndexedDB store on one device. A browser can evict it, and a lost phone
takes everything. `navigator.storage.persist()` reduces the odds but guarantees nothing.

The current answer is a manual export button, which is only as reliable as remembering to
press it. This change moves the durable copy off the device, and — per an explicit product
decision — removes the export button once sync is proven.

That removal is what shapes most of this design. Deleting the existing safety net means
the replacement has to be more careful than a sync layer would otherwise need to be:
failures must be loud, stale writes must be impossible, and the recovery key must never be
irretrievable.

Scale is trivial and worth stating, because it justifies the simplest possible approach:
roughly 200 requests and a few KB per month for the initial deployment, against a free tier
of hundreds of thousands of commands and 256 MB.

## Goals / Non-Goals

**Goals:**

- Progress survives storage eviction, device loss, reinstall, and device change.
- The app stays fully usable offline; sync never blocks learning.
- A stale device can never overwrite newer progress.
- A silent sync failure is impossible — a failing sync is visible.
- No accounts, passwords, or login.

**Non-Goals:**

- Real authentication or encryption. The key is a bearer token over HTTPS.
- Field-wise merge of two diverged devices.
- Server-side understanding of the progress schema.
- Any server-side game logic. The server is a key–value store with an auth check.

## Decisions

### 1. Last-write-wins with a version guard, not a merge

The server stores `updatedAt` alongside the blob. A push declares the version the client
last saw; the server refuses if its own is newer.

- **Field-wise merge** was considered and rejected. It looks attractive because mastery and
  XP are monotonic — but coins are *spent*, and a streak legitimately resets. A merge would
  need per-field semantics for every field, would grow with the data model, and would be
  the most bug-prone code in the app. With one active device per learner, conflicts are close
  to impossible.
- **Plain last-write-wins with no guard** was rejected because the one realistic conflict —
  an old device waking with stale state — is exactly the case it silently loses.

The guard turns a silent data loss into a visible, recoverable conflict. That is the whole
value; actual merging is not needed.

### 2. Sync is a store subscriber, not scattered call sites

`src/lib/sync.ts` subscribes to the Zustand store and schedules a debounced push on
change. Components never call sync.

Sprinkling `syncNow()` through `completeLesson`, purchases, and skip-ahead guarantees a
future feature forgets one. A subscriber cannot be forgotten. It also keeps the store free
of network concerns, which keeps it testable.

**Debounce: 3 seconds**, plus an immediate flush on `visibilitychange` to hidden — the
common case is finishing a lesson and immediately backgrounding the app, and a pending
debounce would otherwise be lost.

### 3. The queue holds latest state, not a log

A failed push marks a single dirty flag rather than appending to a queue of operations.
Retry sends current state.

Progress is a snapshot, not an event stream. Replaying intermediate states has no value,
and a growing offline queue is a second thing that can corrupt.

### 4. Recovery key: Crockford base32, grouped, 20 characters

Format `MATH-XXXX-XXXX-XXXX-XXXX`, ~100 bits of entropy.

- Crockford base32 excludes `I`, `L`, `O`, `U` — the characters that are misread when
  copied by hand, which is exactly how this key will be handled.
- Case-insensitive, and normalisation maps `0`/`O` and `1`/`I`/`L` on entry, so a
  transcription slip still works.
- `MATH-` prefix makes it recognisable on a scrap of paper months later.
- **UUID rejected:** 36 characters of hex including ambiguous glyphs, hostile to typing on
  a phone.
- 100 bits makes guessing another learner's key infeasible, which matters because the key
  is the only access control.

### 5. Key is always visible, never a one-time reveal

Standard practice for recovery codes is to show once and hide. That is correct when a
password can reset it. Here there is no reset — with export removed, the key is the only
route to the data. A one-time reveal converts "the learner didn't write it down" into
permanent loss.

So: full key in Settings, always, with tap-to-copy.

**Trade-off:** anyone with physical access to the unlocked phone can read it. Given
single-user math data on a personal device, this is the right side of the trade.

### 6. Export removal is gated at runtime, not just sequenced in tasks

The export path stays reachable until at least one sync has succeeded on that device. It
is not a build-time deletion.

A learner whose sync has never worked — bad key, offline install, misconfigured
deployment — would otherwise be left with no backup at all and no signal. The gate makes
that state impossible.

`exportProgress()` and `importProgress()` are **retained as functions**. Only the routine
export button is removed. Import stays reachable as a recovery action so Phase 1 backup
files are not stranded.

### 7. Vercel serverless + KV, colocated with the app

One file, `api/progress.ts`, deployed with the existing project. No new hosting, no CORS,
no second deploy target.

- **Supabase** rejected: full Postgres and auth for one JSON blob.
- **Cloudflare Workers** rejected: a second platform and deploy pipeline for no benefit,
  since the app is already on Vercel.
- **GitHub Gist** rejected: requires a token in the client with account-wide gist scope —
  strictly worse security for the same result.

## Risks / Trade-offs

**[Removing export deletes the only working safety net]** → Runtime gate keeps it until a
sync has demonstrably succeeded; import retained for recovery; sync failure over 24 hours
raises a visible warning.

**[Lost key means unrecoverable data]** → Always-visible key with copy affordance;
consequence stated plainly on first run. Genuinely unfixable by design, and the honest
response is to make losing it hard rather than to pretend there is a fallback.

**[Free tier terms change and sync silently stops]** → Local-first means the app never
breaks. The 24-hour warning surfaces prolonged failure. Import remains as an escape hatch,
and the server is a single file that can be redeployed elsewhere.

**[Key is a bearer token in the client]** → Accepted and documented rather than mitigated.
Data is lesson progress. The spec forbids describing it as secure.

**[Debounced push lost on abrupt termination]** → Flush on `visibilitychange`; dirty flag
persists locally so a lost push is retried next launch.

**[Two devices diverge]** → Version guard converts silent loss into a visible conflict. Not
merged — out of scope until there is a second device.

## Migration Plan

1. Deploy the endpoint. Nothing calls it.
2. Ship key generation and display. Still no sync — the key is inert.
3. Enable sync. Export button remains, gated.
4. Confirm a real round trip on the actual phone: complete a lesson, clear site data,
   reinstall, restore by key.
5. Only then does the gate open and the export button disappear.

**Rollback:** disable the sync subscriber. Local storage is untouched throughout and
remains the source of truth, so no data is at risk at any step.

## Open Questions

- **Should the key be shown during onboarding, or after the first lesson?** Up front is
  safer but front-loads a chore before any investment exists. Leaning toward after the
  first completed lesson, when there is something worth protecting.
- **Is 24 hours the right threshold for the failure warning?** Long enough to ignore a
  weekend offline, short enough to matter. Untested.
- **Should sync be pull-on-focus as well as on launch?** An installed PWA can stay
  resident for days without a cold start. Probably yes, but only worth it once a second
  device exists.
