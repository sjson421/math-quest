# Invariants, expanded

[AGENTS.md](../AGENTS.md) states each invariant as a single rule; this document keeps the
reasoning and the history, in the same order. Read it before changing code a rule names —
the rule alone does not say what goes wrong when it breaks.

- **The manifest is the authority** for skill ids, unit/stage membership, and prerequisites:
  `src/curriculum/manifest/`, one file per stage, 201 skills. `docs/curriculum.md` is its
  human twin and the two **cross-check in the test suite** — editing a skill row in one
  without the other is a test failure, by design.
- **The navigation reads `course`, a derivation, not a list.** `resolveCourseTree()` returns
  the stages and units holding a playable skill, in manifest order at all three levels. It
  replaced a hand-written `units: Unit[]`, which had already drifted — its literals said
  `unit-00` where the manifest says `unit-0`, and nothing failed because nothing read the
  hand-written id. Unit modules export `SkillGenerator[]` now; there is no `Unit` type and
  no second place a unit's name, id, order or membership is written down.
- **`docs/curriculum.md` is load-bearing, not reference material.** `manifest/curriculum-doc.ts`
  imports it with `?raw`, so moving, renaming, or trimming its tables breaks the build and 17
  tests. It is also the *only* external check on 201 hand-transcribed ids, it holds the
  design for work not yet built (skip-ahead, anti-discouragement mechanics, GED mapping), and
  `openspec/specs/curriculum-manifest` requires it to keep existing. Do not "clean it up".
- **Skill ids are verbatim.** Never re-spell one. `times-7-8` is not `times-78`.
- **A skill ships by gaining a generator**, never by being added to the manifest. State is
  derived at load: `implemented` needs a registered generator *and* every capability its
  stage requires. `planned` is the normal state for 183 of 201 skills, not an error.
- **`AVAILABLE_CAPABILITIES`** in `manifest/resolve.ts` is the one-line switch that turns a
  stage on once its infrastructure exists. It contains `choice-input` today.
- **Two different `skillById`s.** `curriculum/index.ts` exports `generators` (the registry,
  `SkillGenerator`); `manifest/index.ts` exports `skillById` (manifest entries). Do not
  conflate them, and do not reintroduce the old name for the registry.
- **`src` is type-checked with browser types only**, deliberately, so app code cannot reach
  a Node builtin and typecheck its way into a runtime error. Test-support code that needs a
  repo file uses a `?raw` import (see `manifest/curriculum-doc.ts`).
- **The manifest is the runtime unlock authority.** `isUnlocked()` reads
  `unlockPrerequisites` from `curriculum/index.ts` — the manifest's edges with planned skills
  seen through. **Generators do not declare prerequisites**; `SkillGenerator` has no such
  field, and adding one back would be a second graph nothing keeps in step.
- **A practised skill is never re-locked**, whatever the graph does afterwards. `isUnlocked()`
  checks `attempts > 0 || mastery > 0` before prerequisites, on every read rather than as a
  migration, because a record can arrive from the sync endpoint at any time and that endpoint
  never migrates. A skill with no generator is still locked — that rule outranks it, so a
  lesson is never offered that cannot be built.
- **The manifest is the runtime authority for `quick`.** The 19 marked skills end at 5
  correct; standard lessons end at 10. `Lesson.tsx` reads the manifest entry by generator id,
  and `SkillGenerator` deliberately does not duplicate the flag.
- **Lesson adaptation is session-local and lazy.** `src/lib/lesson.ts` owns the remaining
  correct-answer slots, warm-up difficulty and sticky recovery after three consecutive
  recorded misses. Re-queued problems keep the exact object originally presented; only an
  unseen slot is generated at the adjusted difficulty.
- **`reconcile()` in `store/progress.ts` merges stored skills over defaults per skill
  object, not per field.** That is what lets `SkillProgress` gain fields without a sync
  change. A version that picks named fields out of a stored skill breaks the sync contract.
