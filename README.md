# Math Quest

A gamified math app that starts at counting and builds toward GED level. Built as an
installable iPhone home-screen web app (PWA) — no App Store, no Apple Developer account,
no Mac required.

## Status: Phase 1 complete

A full playable loop over Unit 1 (adding & subtracting), with six skills, mastery levels,
XP, coins, streaks, and backup.

| Phase | Scope | State |
|---|---|---|
| 1 | Playable skeleton, Unit 1, mascot v1, persistence, backup | ✅ done |
| 2 | Skill tree UI, cosmetics shop, decoratable room, full animation | next |
| 3 | Spaced repetition, review lessons, stats, streak notifications | |
| 4 | Units 0, 2–17 — the curriculum bulk | |
| 5 | GED prep: timed mixed tests, formula sheet, calculator sections | |

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # generator + answer-checker + keypad tests
npm run build        # production build into dist/
npm run icons        # regenerate app icons after changing the mascot
```

## Getting it onto the iPhone

The app must be served over HTTPS for the service worker and install to work, so deploy
rather than using the LAN dev server:

1. Push to GitHub, import the repo at [vercel.com](https://vercel.com) — the Vite preset
   needs no configuration. Free tier is plenty.
2. On the iPhone, open the deployed URL **in Safari** (not Chrome — only Safari can install).
3. Share → **Add to Home Screen**.
4. Launch from the new icon. It opens fullscreen with no browser chrome and works offline.

For quick iteration against a phone on the same network, `npm run dev:lan` exposes the dev
server — good enough for layout checks, though PWA install and offline behaviour need the
deployed HTTPS build.

## How it works

### Problems are generated, not stored

Every skill owns a generator that computes its own answer from the operands it just chose.
Nothing is hardcoded, so problems never run out and the answer key cannot drift from the
question.

- `src/curriculum/unit-01-add-sub.ts` — the six Unit 1 generators
- `src/lib/generator.ts` — the factory every problem passes through
- `src/lib/rng.ts` — seeded RNG (`mulberry32`) plus `constrain()` for rejecting degenerate
  problems like `x + 0`

Seeding means any problem is reproducible from its seed, which makes bugs debuggable.

### Answers are compared as exact rationals

`1/2`, `2/4`, `0.5`, and `.50` are all the same number. Input is parsed into an exact
rational (`src/lib/rational.ts`) rather than a float, so comparison has no tolerance slop.
Skills that specifically teach simplest form can flag `requireSimplified`, which reports
"not simplified" separately from "wrong".

### Wrong answers are diagnosed, not just rejected

Because a generator knows every intermediate value, it can predict the exact number a
learner lands on for a given mistake — forgetting to carry, flipping a column to avoid
borrowing, adding when asked to subtract. When a typed answer matches one, the app names
the actual error instead of saying "incorrect". Recurring mistakes accumulate in
`progress.mistakes` and surface in Settings.

This is the diagnostic value of multiple choice without giving up free response.

### No hearts

A lesson ends after 10 **correct** answers. A missed problem is re-queued a few places
back, so the session cannot be finished without eventually getting it right. Same forward
pressure as a lives system, none of the punishment — and Duolingo's hearts exist to sell
refills, which is irrelevant here.

### Progress is local-first, with a recovery key

The device is the working store: everything lives in IndexedDB, and the app is fully
usable offline. `navigator.storage.persist()` is requested on first launch, but iOS can
still evict web app storage — and losing months of streak is the worst failure this app
has — so a copy also syncs to a small serverless endpoint.

Identity is a single **recovery key** (`MATH-XXXX-XXXX-XXXX-XXXX`), generated on first
run. No account, no password, no email. Typing it into Math Quest on a new phone brings
everything back. It lives permanently in **Settings → Your recovery key**, never a
one-time reveal, because with file export gone it is the only route back to the data.

The key is a **bearer credential**, not a password: anyone holding it can read and write
that progress, and it is not encrypted. That trade is deliberate for single-learner math
progress, and it is stated plainly wherever the key appears. There is no reset — a lost
key cannot be recovered.

Sync is last-write-wins behind a version guard, so a stale device is refused rather than
allowed to silently overwrite newer progress. **Settings → Backup** shows when progress
last reached the server and distinguishes synced, pending, offline, and failed, so a quiet
failure cannot masquerade as success.

Manual **Export backup** is superseded by sync and disappears once sync has succeeded at
least once on that device; it stays put until then, so a device where sync has never
worked is never left with no backup at all. **Restore from a file** remains available as a
recovery action, so backups exported before sync existed are not stranded.

## Layout

```
src/
  lib/          rng, rational arithmetic, answer checking, keypad rules, haptics, types
  curriculum/   units as data — each skill is a generator
  components/   Mascot, Lesson, Keypad, ProblemView, Home, Settings
  store/        zustand + IndexedDB persistence, mastery and unlock rules
scripts/        icon generation from the mascot artwork
```

## Design notes

**Kawaii presentation, adult content.** Pastels, rounded shapes, and a companion mascot —
but the language addresses a capable adult who simply hasn't been taught this yet. The
mascot never baby-talks and never scolds; the wrong-answer state is sympathetic rather
than disappointed, and error feedback deliberately avoids alarm-red styling.

**Pip** is an original character, built as layered SVG (`src/components/Mascot.tsx`) so
expressions and future outfits are composable data rather than separate drawings. Adding a
new outfit is a few lines of geometry, not an art commission.

**The custom keypad** matters more than it looks. The iOS system keyboard covers half the
screen and makes the app feel like a web form.

**Haptics** work on iOS 18+ via the native `switch`-element trick (`src/lib/haptics.ts`),
since Safari does not implement the Vibration API. Feature-detected, silent no-op elsewhere.

## Testing

`npm test` runs ~1000 generated problems per skill and, for each one, **recomputes the
answer independently from what is displayed on screen** rather than trusting the
generator's own arithmetic. It also asserts no degenerate output, no misconception value
colliding with the correct answer, difficulty actually scaling, determinism per seed, and
that the prerequisite graph is acyclic.

A wrong answer key is the one bug this app cannot survive, so that check is the priority.
