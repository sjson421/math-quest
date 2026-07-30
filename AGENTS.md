# Working on Math Quest

A PWA that teaches math from counting to GED level. React 19 + Vite + TypeScript, zustand
over IndexedDB, framer-motion, vitest. No CSS framework beyond Tailwind v4.

Read these rather than re-deriving them:

- **[README.md](README.md)** — how the app works and why (generators, rationals, sync).
- **[docs/curriculum.md](docs/curriculum.md)** — the course. Authority for content.
- **[docs/roadmap.md](docs/roadmap.md)** — what is left, in what order, what blocks what.

## Commands

```bash
npm run dev          # never run a dev server from bash if a preview tool exists
npm test             # full suite, ~3s
npx vitest run src/lib/content-rules.test.ts   # one file
npm run build        # tsc -b + vite build
npm run lint         # oxlint (3 pre-existing Settings.tsx warnings are expected)
```

**`npx tsc --noEmit` is not sufficient.** It uses a different config from the build.
`npm run build` runs `tsc -b` across `tsconfig.{app,node,api}.json`, and only that catches,
for example, a Node builtin imported from `src`. Run the build before claiming types pass.

## Invariants

Break these and something fails loudly — or worse, quietly.

- **The manifest is the authority** for skill ids, unit/stage membership, and prerequisites:
  `src/curriculum/manifest/`, one file per stage, 201 skills. `docs/curriculum.md` is its
  human twin and the two **cross-check in the test suite** — editing a skill row in one
  without the other is a test failure, by design.
- **`docs/curriculum.md` is load-bearing, not reference material.** `manifest/curriculum-doc.ts`
  imports it with `?raw`, so moving, renaming, or trimming its tables breaks the build and 17
  tests. It is also the *only* external check on 201 hand-transcribed ids, it holds the
  design for work not yet built (skip-ahead, anti-discouragement mechanics, GED mapping), and
  `openspec/specs/curriculum-manifest` requires it to keep existing. Do not "clean it up".
- **Skill ids are verbatim.** Never re-spell one. `times-7-8` is not `times-78`.
- **A skill ships by gaining a generator**, never by being added to the manifest. State is
  derived at load: `implemented` needs a registered generator *and* every capability its
  stage requires. `planned` is the normal state for 195 of 201 skills, not an error.
- **`AVAILABLE_CAPABILITIES`** in `manifest/resolve.ts` is the one-line switch that turns a
  stage on once its infrastructure exists. It is empty today.
- **Two different `skillById`s.** `curriculum/index.ts` exports `generators` (the registry,
  `SkillGenerator`); `manifest/index.ts` exports `skillById` (manifest entries). Do not
  conflate them, and do not reintroduce the old name for the registry.
- **`src` is type-checked with browser types only**, deliberately, so app code cannot reach
  a Node builtin and typecheck its way into a runtime error. Test-support code that needs a
  repo file uses a `?raw` import (see `manifest/curriculum-doc.ts`).
- **`isUnlocked()` still uses the generators' hand-written prerequisites**, not the
  manifest's derived graph. Deliberate: switching it re-locks skills for existing learners.
  See roadmap B2 before changing it.
- **The `quick` flag is carried but not honoured.** The manifest marks 19 skills `quick`;
  `Lesson.tsx` hardcodes `TARGET_CORRECT = 10` and never reads it. The baseline spec states
  the 10 deliberately, so shortening those lessons to 5 is a `MODIFIED` delta against
  `skill-progression` (roadmap B1), not a bug fix.
- **`reconcile()` in `store/progress.ts` merges stored skills over defaults per skill
  object, not per field.** That is what lets `SkillProgress` gain fields without a sync
  change. A version that picks named fields out of a stored skill breaks the sync contract.

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

## Test map

| File | Covers |
|---|---|
| `curriculum/generators.test.ts` | ~1000 problems/skill, answer recomputed independently, content contract |
| `curriculum/coverage.test.ts` | registry ↔ manifest, planned vs implemented, what the learner is offered |
| `manifest/manifest.test.ts` | counts, uniqueness, dangling prereqs, cycles, reachability, graph snapshot |
| `manifest/curriculum-doc.test.ts` | manifest ↔ `docs/curriculum.md`, and the document against itself |
| `manifest/resolve.test.ts` | derivation rules against synthetic stages |
| `lib/*.test.ts`, `api/progress.test.ts` | answers, keypad, rationals, recovery key, sync |

Every reporting helper is paired with a synthetic case proving it names the offender. Keep
that habit: a checker that returns "no problems" looks exactly like a clean codebase.

## Workflow

Work is planned as **OpenSpec changes**. Skills live in `.claude/skills/` and
`.codex/skills/`: `/openspec-propose` → `/openspec-apply-change` →
`/openspec-archive-change`. Task lists are the running record — mark each item done as it
lands, and note decisions inline rather than only in chat.

- `openspec/specs/` is the **baseline**: what the system does today, five capabilities —
  `curriculum-manifest`, `skill-progression`, `skill-content-contract`, `progress-sync`,
  `recovery-key`. A change amending built behaviour writes `## MODIFIED Requirements`
  against one of these; `## ADDED` is for genuinely new surface.
- `openspec/changes/` holds active work; `openspec/changes/archive/YYYY-MM-DD-<name>/`
  holds shipped changes. **The active queue is empty** — both changes shipped 2026-07-30.
- Archive as soon as a change completes, and sync its deltas into the baseline first.
  A completed change left active means the next one has nothing accurate to amend.
- **A delta spec must describe what the change actually built.** `curriculum-foundation`
  proposed quick lessons ending at 5; that was never implemented, so the requirement was
  corrected to the shipped 10 before syncing. Do not archive an aspiration as fact.
- **Sizing**, from the `tasks` rules in `openspec/config.yaml` (one task per generator plus
  its tests, under 2 hours each): a content change is **one unit**, not one stage — a
  50-skill stage would be ~100 tasks. Capability work is its own change, never bundled with
  the content it unblocks. Create changes just-in-time, one or two ahead of the work;
  proposals written months early against unbuilt infrastructure rot.

Style: no semicolons, single quotes, 2-space indent, comments that say *why*. Match the
density of the file you are in — this codebase comments its reasoning, not its syntax.

## Environment notes

- Drive the app with the browser preview tools, not `npm run dev` in a shell.
- If the preview pane is not displayed, `requestAnimationFrame` never fires, so
  `AnimatePresence mode="wait"` never completes an exit and **screens will not swap** no
  matter how a click is dispatched. Nothing is broken; ask for the pane to be shown.
- Progress lives in IndexedDB under `math-quest-progress`. Writing a record there directly
  is the fastest way to test migration or unlock behaviour — delete it afterwards.
- The manifest ships in the bundle (~6 KB gzipped) because state is derived at load.
  Validation is test-time and costs nothing at runtime.
- **Sync has never been verified on real hardware.** The iPhone round trip, airplane-mode
  queue, client-adopts-on-409, and failure visibility rest on `lib/sync.test.ts`,
  `api/progress.test.ts`, and a hand-run against production covering the server half only.
  Treat a sync bug report as plausible rather than surprising; see the note at the end of
  `openspec/changes/archive/2026-07-30-progress-sync/tasks.md`.
