# Math Quest

A gamified math app that starts at counting and builds toward GED level. Built as an
installable iPhone home-screen web app (PWA) — no App Store, no Apple Developer account,
no Mac required.

## Status: playable loop, whole course mapped

A full playable loop over every skill built so far — mastery levels, XP, coins, streaks,
and backup.

The rest of the course now exists as data rather than intent: all **201 skills** across 8
stages and 23 units are declared in `src/curriculum/manifest/`, with prerequisites, unit
membership, and pacing markers, cross-checked against [`docs/curriculum.md`](docs/curriculum.md).
A skill becomes playable by gaining a generator, never by being added to the manifest — so
how many are playable is a fact about the code, and the status line of
[`docs/roadmap.md`](docs/roadmap.md) is where it is written down, deliberately in only one
place.

Stages A, B, and C are playable. Structured math notation, fraction input, and shaded-shape
diagram rendering are built for Stage D; its fraction generators are next. Later stages still
need expression input, a tap-to-plot coordinate plane, charts, and timed mode.

**[`docs/roadmap.md`](docs/roadmap.md) is the plan from here to v1.0** — every remaining
milestone, what blocks what, and the unbuilt product features (dress-up, skip-ahead,
review, stage checkpoints). It lives in one place so it cannot drift out of step with this
file.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # generators, manifest, curriculum cross-check, content contract
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

- `src/curriculum/unit-00-numbers.ts` … `unit-04-division.ts` — the built generators, one
  file per curriculum unit, added a unit at a time
- `src/lib/generator.ts` — the factory every problem passes through
- `src/lib/rng.ts` — seeded RNG (`mulberry32`) plus `constrain()` for rejecting degenerate
  problems like `x + 0`

Seeding means any problem is reproducible from its seed, which makes bugs debuggable.

### The course is a manifest, and the document is its check

`docs/curriculum.md` describes the whole course in prose; `src/curriculum/manifest/` is the
same thing as data, one file per stage. It is the authority for skill ids, unit and stage
membership, and prerequisite edges — and the two cross-check each other in the test suite,
so either can be edited but they cannot quietly disagree.

Three things are derived rather than written down, because hand-writing them across 201
skills is 201 chances to make a mistake:

- **Prerequisites** — the previous skill in the unit, plus the last skill of any unit this
  one declares `dependsOn`. An explicit `prerequisites` array overrides that where the
  course genuinely branches. A snapshot test commits the fully expanded graph, so a change
  to the rules shows up as a reviewable diff.
- **State** — a skill is `implemented` only when a generator is registered for its id *and*
  every capability its stage needs is built. Otherwise it is `planned`, which is the normal
  state, not an error. Nothing is stored, so adding a generator flips its skill on with no
  bookkeeping.
- **Unlock edges** — a `planned` skill is transparent: its dependants inherit *its*
  prerequisites rather than waiting behind our build order.

Only `implemented` skills reach the learner. The validation suite fails on a duplicate id, a
prerequisite that resolves to nothing, a cycle, an unreachable skill, a generator registered
under an id the course never declared, or an id that disagrees with the document — each
naming the offending entry, since a bare failure on a 201-node graph is untraceable.

### Generated text has a contract

Brevity is a requirement, not a preference: a worked example beats prose for a novice, and
long explanations are where an adult restarting math disengages. Because the text is
generated, `src/lib/content-rules.ts` runs over sampled problems inside the test suite —
at most 4 solution steps, at most 12 words each, single-sentence hints, and at least two
distinct predicted misconceptions on any skill marked a difficulty wall.

It earned its keep immediately: enforcing it caught three of the six generators that existed
at the time, including a wall skill that had only one prediction left on some problems once
the engine discarded a predicted value that coincided with the real answer.

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

A standard lesson ends after 10 **correct** answers; curriculum skills marked `quick` end
after 5. Every lesson opens one difficulty band below its current level, and three consecutive
misses quietly lower later new problems for the rest of the lesson. A missed problem is
re-queued a few places back, so the session cannot be finished without eventually getting it
right. Same forward pressure as a lives system, none of the punishment — and Duolingo's
hearts exist to sell refills, which is irrelevant here.

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

One caveat worth stating: all of this is covered by tests and was exercised by hand against
the deployed endpoint, but **the full round trip has not yet been run on an actual iPhone** —
install, complete a lesson, clear site data, reinstall, restore from the key. Until that
happens, treat sync as verified in principle rather than in practice.

Manual **Export backup** is superseded by sync and disappears once sync has succeeded at
least once on that device; it stays put until then, so a device where sync has never
worked is never left with no backup at all. **Restore from a file** remains available as a
recovery action, so backups exported before sync existed are not stranded.

## Layout

```
src/
  lib/          rng, rational arithmetic, answer checking, keypad rules, haptics,
                content rules, types
  curriculum/   generators, plus the registry that resolves them against the manifest
    manifest/   the whole course as data — one file per stage, and the derivation rules
  components/   Mascot, Lesson, Keypad, ProblemView, Settings, and the course tree —
                Home wraps StageList, UnitList and SkillList
  store/        zustand + IndexedDB persistence, mastery and unlock rules
docs/           curriculum.md — the course in prose, cross-checked against the manifest
                roadmap.md — everything left to build, and what blocks what
openspec/       specs/ — what the system does today, as requirements
                changes/archive/ — how it got that way
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

On top of that, the suite guards the course itself — the manifest's structure, its agreement
with `docs/curriculum.md` down to each row's markers, generator coverage, and the content
contract over sampled text. Every reporting helper is paired with a synthetic case proving it
names the offender, because a checker that returns "no problems" looks exactly like a clean
course.
