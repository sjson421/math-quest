# Working on Math Quest

A PWA that teaches math from counting to GED level. React 19 + Vite + TypeScript, zustand
over IndexedDB, framer-motion, vitest. No CSS framework beyond Tailwind v4.

Read these rather than re-deriving them:

- **[README.md](README.md)** — how the app works and why (generators, rationals, sync).
- **[docs/curriculum.md](docs/curriculum.md)** — the course. Authority for content.
- **[docs/roadmap.md](docs/roadmap.md)** — what is left, in what order, what blocks what.

Task docs — read the one that matches the work and skip the rest:

- **[docs/invariants.md](docs/invariants.md)** — the reasoning behind every rule below.
  Read it before changing code a rule names.
- **[docs/testing.md](docs/testing.md)** — what each test suite covers, and how component
  tests work without a DOM.
- **[docs/workflow.md](docs/workflow.md)** — the OpenSpec process: baseline, changes,
  archiving, sizing.
- **[docs/environment.md](docs/environment.md)** — scripted browser validation, IndexedDB
  shortcuts, sync caveats.

## Commands

```bash
npm run dev          # background session for scripted browser checks; see docs/environment.md
npm test             # full suite, ~3s
npx vitest run src/lib/content-rules.test.ts   # one file
npm run build        # tsc -b + vite build
npm run lint         # oxlint (3 pre-existing Settings.tsx warnings are expected)
```

**`npx tsc --noEmit` is not sufficient.** It uses a different config from the build.
`npm run build` runs `tsc -b` across `tsconfig.{app,node,api}.json`, and only that catches,
for example, a Node builtin imported from `src`. Run the build before claiming types pass.

## Invariants

Break these and something fails loudly — or worse, quietly. Each rule is stated once here;
[docs/invariants.md](docs/invariants.md) gives the reasoning, in the same order.

- **The manifest is the authority** for skill ids, unit/stage membership, and
  prerequisites: `src/curriculum/manifest/`, one file per stage, 201 skills.
  `docs/curriculum.md` is its human twin and the two cross-check in the test suite — edit
  both or neither.
- **The navigation reads `course`, a derivation, not a list.** Unit modules export
  `SkillGenerator[]`; there is no `Unit` type and no second place a unit's name, id,
  order, or membership is written down.
- **`docs/curriculum.md` is load-bearing, not reference material** — imported `?raw`.
  Moving, renaming, or trimming its tables breaks the build and 17 tests. Do not "clean
  it up".
- **Skill ids are verbatim.** Never re-spell one. `times-7-8` is not `times-78`.
- **A skill ships by gaining a generator**, never by being added to the manifest. State is
  derived at load: `implemented` needs a registered generator *and* every capability its
  stage requires. `planned` is the normal state for 183 of 201 skills, not an error.
- **`AVAILABLE_CAPABILITIES`** in `manifest/resolve.ts` is the one-line switch that turns
  a stage on once its infrastructure exists. It contains `choice-input` and `number-line`
  today.
- **Two different `skillById`s.** `curriculum/index.ts` exports `generators` (the
  registry); `manifest/index.ts` exports `skillById` (manifest entries). Do not conflate
  them, and do not reintroduce the old name for the registry.
- **`src` is type-checked with browser types only**; test-support code that needs a repo
  file uses a `?raw` import (see `manifest/curriculum-doc.ts`).
- **The manifest is the runtime unlock authority.** Generators do not declare
  prerequisites; `SkillGenerator` has no such field, and adding one back would be a second
  graph nothing keeps in step.
- **A practised skill is never re-locked** — `isUnlocked()` checks `attempts > 0 ||
  mastery > 0` before prerequisites, on every read. A skill with no generator is still
  locked; that rule outranks it.
- **The manifest is the runtime authority for `quick`.** The 19 marked skills end at 5
  correct; standard lessons end at 10. `SkillGenerator` does not duplicate the flag.
- **Lesson adaptation is session-local and lazy** in `src/lib/lesson.ts`. Re-queued
  problems keep the exact object originally presented; only an unseen slot is generated at
  the adjusted difficulty.
- **`reconcile()` in `store/progress.ts` merges stored skills over defaults per skill
  object, not per field.** A version that picks named fields out of a stored skill breaks
  the sync contract.

## Content rules

Learner-facing text is generated, so it is checked at test time by `src/lib/content-rules.ts`
over ~1000 sampled problems per skill: **≤4 solution steps, ≤12 words per step,
single-sentence hint, and ≥2 distinct predicted misconceptions on any skill marked a wall.**

- `generateProblem()` centrally drops any misconception whose value equals the correct
  answer, and dedups by value. A wall skill therefore needs predictions that cannot collide
  with the answer *or each other* — the count in the source is not the count that survives.
- **Skill blurbs stay ≤32 characters.** The Home card truncates beyond that on a phone.
- **Adult tone.** Describe the skill; never talk down, never scold. Wrong answers are
  diagnosed, not marked incorrect.

## Workflow

Work is planned as **OpenSpec changes**: `/openspec-propose` → `/openspec-apply-change` →
`/openspec-archive-change`, with task lists as the running record — mark each item done as
it lands. Archive a change as soon as it completes, syncing its deltas into the baseline
first; a completed change left active means the next one has nothing accurate to amend.
The process details — baseline layout, sizing, what a delta may claim — are in
[docs/workflow.md](docs/workflow.md).

Style: no semicolons, single quotes, 2-space indent, comments that say *why*. Match the
density of the file you are in — this codebase comments its reasoning, not its syntax.
