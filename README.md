# Math Quest

A cute, offline-first GED math prep app that builds from number sense to test-ready algebra,
geometry, data, and calculator skills. Math Quest is a standards-based PWA, so it runs in a
browser and can be installed on devices that support web apps.

## Status: playable foundations, whole course mapped

**186 of 201 skills are playable.** The current loop includes mastery levels, XP, coins,
stage checkpoints, a companion character the learner chooses and dresses, a pin that
climbs through five tiers as the course is worked through, a room to decorate, and progress
backup.

Day streaks carry stakes: a run pays a rising coin multiplier, announces milestones at 3, 7,
14, 30 and 100 days, and opens three cosmetics that cannot be bought any other way. A missed
day breaks it unless a bought freeze covers that day, which happens on its own the next time
the app opens — at most two are held, because a streak that can simply be bought stops
measuring anything. An item bought behind a streak stays owned once the streak is gone.

The rest of the course now exists as data rather than intent: all **201 skills** across 8
stages and 23 units are declared in `src/curriculum/manifest/`, with prerequisites, unit
membership, and pacing markers, cross-checked against [`docs/curriculum.md`](docs/curriculum.md).
A skill becomes playable by gaining a generator, never by being added to the manifest — so
how many are playable is a fact about the code, and the status line of
[`docs/roadmap.md`](docs/roadmap.md) is where it is written down, deliberately in only one
place.

Stages A through F have complete playable content, and Stage G now opens Unit 20 through
similar figures: perimeter, rectangle and triangle area, parallelogram and trapezoid area,
circle measures, composite figures, prism and round-solid volume, surface area, missing
right-triangle sides, and scaled corresponding sides. Geometry figures carry labelled dimensions and GED formula choices;
non-circular results are exact, while circle and round-solid volume answers use π = 3.14 and
round to the nearest tenth. Unit 8
covers like- and unlike-denominator addition and subtraction, mixed-number conversion and
arithmetic, fraction multiplication and division, and fixed-frame word problems. Structured
math notation, fraction input, expression input, and shaded-shape diagram rendering are
built, and the keypad offers mixed-number entry with `requireMixed` form checking. Unit 9 is
complete: decimal place value, reading, comparison, rounding, the four operations,
decimal/fraction conversion, and a money word problem. Unit 10 is complete: percent meaning
and conversions, inverse percent relationships, percent change, discount/tax/tip, and simple
interest. Unit 11 covers ratios, unit rates, proportions, scale drawings, stated unit
conversions, and fixed-frame ratio word problems that distinguish part-to-part from
part-to-whole. Unit 12 opens Stage E and is complete: exponent meaning and evaluation,
squares and roots, same-base and power-of-power rules, zero and negative exponents,
scientific notation, and full order of operations with exponents. Unit 13 is complete: what
a variable is, evaluating and translating expressions, spotting like terms, combining,
distributing across a sign, and factoring a common factor back out — the first content to
use expression input, and the first to ask for an answer whose written form matters as much
as its value, since the expanded expression a factoring question displays is a wrong answer
to it. Later units still need timed mode.

**[`docs/roadmap.md`](docs/roadmap.md) is the plan from here to v1.0** — every remaining
milestone, what blocks what, and the product features still unbuilt (skip-ahead, review and
spaced repetition, timed mode, streak reminders). It lives in one place so it cannot drift
out of step with this file.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # generators, manifest, curriculum cross-check, content contract
npm run build        # production build into dist/
npm run icons        # regenerate app icons after changing the mascot
```

## Installing the PWA

The app must be served over HTTPS for the service worker and install to work, so deploy
rather than using the LAN dev server:

1. Push to GitHub, import the repo at [vercel.com](https://vercel.com) — the Vite preset
   needs no configuration. Free tier is plenty.
2. On an iPhone, open the deployed URL **in Safari** (not Chrome — only Safari can install).
3. Share → **Add to Home Screen**.
4. Launch from the new icon. It opens fullscreen with no browser chrome and works offline.

Other browsers can use the deployed app directly; install and offline support vary by browser.
For quick iteration against a phone on the same network, `npm run dev:lan` exposes the dev
server — good enough for layout checks, though PWA install and offline behaviour need the
deployed HTTPS build.

## How it works

### Problems are generated, not stored

Every skill owns a generator that computes its own answer from the operands it just chose.
Nothing is hardcoded, so problems never run out and the answer key cannot drift from the
question.

- `src/curriculum/unit-*.ts` — the built generators, one file per curriculum unit, added a
  unit at a time
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

Brevity is a requirement, not a preference: a worked example beats a long explanation when a
new idea is hard to approach. Because the text is generated, `src/lib/content-rules.ts` runs
over sampled problems inside the test suite —
at most 4 solution steps, at most 12 words each, single-sentence hints, and at least two
distinct predicted misconceptions on any skill marked a difficulty wall.

Stages A through F and Unit 20 through similar figures now open all 186 playable skills with one
authored teaching line and one stable, generated difficulty-1 worked example. Starting practice
records only that the intro was seen; it does not count as an attempt or change mastery. The same
example remains available through **Review intro**, and each authored line is checked directly for
sentence and vocabulary limits before generated samples run.

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

The device is the working store: everything lives in IndexedDB, and the app is fully usable
offline. `navigator.storage.persist()` is requested on first launch, but browsers can still
evict web app storage, so a copy also syncs to a small serverless endpoint.

Identity is a single **recovery key** (`MATH-XXXX-XXXX-XXXX-XXXX`), generated on first
run. No account, no password, no email. Typing it into Math Quest on a new phone brings
everything back. It lives permanently in **Settings → Your recovery key**, never a
one-time reveal, because with file export gone it is the only route back to the data.

The key is a **bearer credential**, not a password: anyone holding it can read and write
that progress, and it is not encrypted. That trade keeps recovery lightweight, and it is
stated plainly wherever the key appears. There is no reset — a lost key cannot be recovered.

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
  components/   Mascot, Room, Shop, Lesson, Keypad, ProblemView, Settings, and the course
                tree — Home wraps StageList, UnitList and SkillList
  cosmetics/    the characters, the one catalogue their wardrobe and the room share,
                the palette, and the motion rules
  store/        zustand + IndexedDB persistence, mastery and unlock rules
api/            the serverless progress endpoint — one opaque JSON blob per recovery key
docs/           curriculum.md — the course in prose, cross-checked against the manifest
                roadmap.md — everything left to build, and what blocks what
openspec/       specs/ — what the system does today, as requirements
                changes/archive/ — how it got that way
scripts/        icon generation from the mascot artwork
```

## Design notes

**Kawaii presentation, serious practice.** Pastels, rounded shapes, and a companion mascot
make practice inviting. The language stays clear and respectful: Pip never baby-talks or
scolds, and error feedback is sympathetic rather than alarm-red.

**Three original characters** ship — Pip the bunny, free and where every record starts, plus
Mochi and Taro at 500 coins each. All are layered SVG (`src/components/Mascot.tsx`), and a
character supplies geometry, colour and eight named **anchors**, never a second drawing of the
mascot: `Mascot.tsx` owns the expressions, the blink, the bob and the ear swing for all of
them. Every one of the eleven cosmetics is hung off those anchors rather than off literal
coordinates, so a hat is "cross the brow, this much wider than the head" and fits a bunny, a
cat and a capybara alike. Buying a character therefore costs the learner no accessory, and
adding one costs the wardrobe nothing.

**Coins buy looks, never progress.** One purse and one catalogue (`src/cosmetics/`) carry
the characters, the ten cosmetics across four slots, and the eleven decorations that furnish
the room behind the character (`src/components/Room.tsx`). Nothing bought there gates or
accelerates a lesson. The authoring rules — the two coordinate systems, slot and occlusion
order, palette and geometry limits — live in the `mascot-design` skill, settled before any
cosmetic existed so that later items could not each invent their own conventions.

**The pin is the one thing coins cannot buy.** Each character's charm has five tiers, and it
climbs as the learner takes more skills past the mastery bar that opens the next one — at 15,
45, 90 and 150. The tier is derived from mastery rather than stored, so there is no field to
migrate and a restored record simply shows what it earned; crossing a threshold is announced
once, after the lesson that did it (`src/lib/pin.ts`, `src/cosmetics/charm.tsx`).

**The custom keypad** matters more than it looks. Mobile system keyboards can cover half the
screen and make a focused lesson feel like a web form.

**Haptics** work on iOS 18+ via the native `switch`-element trick (`src/lib/haptics.ts`),
since Safari does not implement the Vibration API. Feature-detected, silent no-op elsewhere.

**Sound** is one synthesised celebration chime (`src/lib/sound.ts`) — three Web Audio notes,
so no asset, no licence and no decoder — under the same best-effort contract as haptics, and
a mute toggle sits on Home. The mute flag lives in `localStorage` rather than in progress,
because it is about this phone and not this learner: a lesson done quietly in a waiting room
should not silence the tablet at home.

**Reduced motion is honoured by the rainbow wings only.** That is a known gap, not a
decision that the rest of the animation is exempt — `src/cosmetics/wings.tsx` says so at the
point of use.

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
