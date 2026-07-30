## Context

Phase 1 shipped six generators in a single file, `src/curriculum/unit-01-add-sub.ts`, with
prerequisites written by hand as string literals. That works at six skills. It does not
work at 201 across 23 changes, where a mistyped prerequisite id or a duplicate skill id
would pass every existing test.

`docs/curriculum.md` now defines the full course, but it is prose — nothing validates
against it. This change turns it into data.

The constraint shaping every decision below: **the manifest is written once and in full
now, while generators arrive one unit at a time over months.** A skill that exists in the
manifest but has no generator is the normal state, not an error, and the design has to
treat it as such rather than as a gap to be reported.

## Goals / Non-Goals

**Goals:**

- One authority for skill ids, unit and stage membership, and prerequisite edges.
- Catch drift automatically — duplicate ids, dangling prerequisites, cycles, orphans, and
  generators registered under ids nobody declared.
- Make prerequisite authoring cheap enough that 201 entries do not become 201 chances to
  make a mistake.
- Let a `planned` skill sit in the graph without breaking play or validation.

**Non-Goals:**

- No generators, no UI, no store behaviour changes.
- No enforcement of *pedagogical* quality — the manifest checks structure, not whether the
  sequencing is good.
- No runtime cost. Validation is test-time; the manifest is inert data at runtime.

## Decisions

### 1. Manifest split by stage, not one file and not per-unit

`src/curriculum/manifest/stage-{a..h}.ts`, re-exported from an index.

- **One 1200-line file** was rejected: 201 entries in one module is hostile to review, and
  every content change would touch it.
- **Per-unit files (23)** was rejected: the manifest is written *once, now*, whereas
  per-unit files only pay off if each unit is edited separately later. Generators live in
  per-unit files; the manifest does not need to mirror that.
- **Per-stage (8)** matches how the curriculum document is organised and how a human
  reasons about the course, and keeps each file reviewable in one sitting.

### 2. Prerequisites are derived by default, declared only on exception

Writing prerequisites explicitly for 201 skills is the single largest source of
transcription error in this change. Instead:

- **Default:** a skill's prerequisite is the previous skill in its unit.
- **Unit-level:** a unit declares `dependsOn: [unitId, ...]`. The *first* skill of that
  unit takes the *last* skill of each named unit as prerequisites.
- **Override:** a skill may declare `prerequisites: [...]` explicitly, replacing the
  default entirely. Used where the curriculum document specifies a non-linear edge.

This reduces hand-written edges from ~201 to roughly 25 unit-level declarations plus a
handful of overrides, and the derivation itself is tested.

**Trade-off:** derivation is indirection — reading a skill entry no longer tells you its
prerequisites outright. Mitigated by a `resolvePrerequisites()` helper and a test that
snapshots the fully-resolved graph, so the expanded form is reviewable.

### 3. `planned` is derived, never stored

A skill's state is computed at load: `implemented` when the generator registry has its id
*and* every capability its stage requires is available; `planned` otherwise.

Storing the state would immediately go stale. Deriving it means adding a generator flips
the skill on with no bookkeeping, and a skill blocked purely on missing infrastructure
(fractions needing KaTeX) reports honestly instead of appearing broken.

Capability *availability* is a declared set of its own — `AVAILABLE_CAPABILITIES` in
`resolve.ts`, empty today because nothing beyond the number keypad exists. Landing a
capability is then a one-line edit that flips its whole stage on. The resolvers take the
generator registry and the availability set as parameters rather than importing them, so
derivation stays pure and testable before any manifest entry exists.

### 4. Planned skills are transparent to the unlock graph

A `planned` skill must not become a wall. Two candidate behaviours:

- **Block** — dependants stay locked until the generator exists. Rejected: it makes the
  app look broken and stalls the learner behind our build order.
- **Pass through** — a planned skill is skipped when resolving unlock, so its dependants
  inherit *its* prerequisites instead.

Pass-through is chosen. The learner only ever sees a contiguous run of implemented skills,
and inserting a generator later slots it into place without stranding anything.

**Trade-off:** a learner can reach a skill whose conceptual prerequisite is not yet built.
Acceptable — the alternative is an unplayable app, and build order follows curriculum order
anyway, so the window is narrow.

Expansion terminates at the first `implemented` skill, so the cycle guard inside
pass-through protects the traversal from hanging — it is not a graph check. Whole-graph
acyclicity is validated separately, because a cycle among implemented skills never gets
walked here.

### 5. Content contract is a runtime check over sampled problems, not a static lint

The text being constrained is *generated*, so a static analyser cannot see it. The check
runs inside the existing test suite: sample N problems per generator across all
difficulties, then assert step count, per-step word count, hint sentence count, and wall
skills predicting ≥2 misconceptions.

This rides on the existing per-generator test harness rather than adding tooling.

### 6. Forward-reference checking uses a curated term list, not language analysis

Detecting "mentions a concept from a later unit" in general is not tractable. The design
is deliberately narrow: a hand-maintained map of ~30 real math terms (`numerator`,
`exponent`, `slope`, `coefficient`, …) to the unit that introduces each. The check greps
skill text for those terms and fails if one appears before its introducing unit.

**Honest limitation:** this catches vocabulary leakage, not conceptual leakage. A skill
could still assume unbuilt understanding without using a flagged word. Accepted — the
narrow version is cheap and catches the common case; the general version is not worth
building.

## Risks / Trade-offs

**[201 hand-transcribed ids will contain typos]** → Uniqueness, dangling-prerequisite, and
reachability tests catch structural errors. A *semantically* wrong-but-valid id (e.g.
`times-7-8` entered as `times-78`) survives all three — mitigated by a test asserting
manifest ids match those parsed directly out of `docs/curriculum.md`, making the document
and the manifest cross-check each other.

**[Derived prerequisites hide the real graph]** → `resolvePrerequisites()` plus a
committed snapshot test of the fully-expanded graph, so any change to derivation shows up
as a reviewable diff.

**[Pass-through unlock lets a learner outrun the build]** → Narrow by construction, since
build order follows curriculum order. Stage capability requirements keep whole stages
`planned` until their infrastructure lands.

**[The manifest and the document drift apart]** → They cross-check in CI. Either can be
edited, but the tests fail until both agree. The document's skill tables parse cleanly off
one row anchor — `| N.N | \`id\` | … |` — which is the form the cross-check must use. A
looser scrape for backticked tokens also picks up the `` `quick` `` marker in the Note
column and reports it as a phantom skill id.

**[`with-parentheses` is declared twice — 5.2 and 14.6]** → **Confirmed defect in
`docs/curriculum.md`, found while transcribing.** Every other count in the document is
internally consistent (8 stages, 23 units, 201 rows, every per-unit and per-stage total
agreeing with the stage map), so this is the single reconciliation the transcription
exercise turned up. Two skills cannot share an id: progress is keyed by skill id, so they
would silently overwrite each other's mastery — exactly the failure the uniqueness rule
exists to prevent. **Resolved:** 14.6 is renamed `equation-parentheses`, matching Unit 14's
existing `equation-balance` / `equation-words` convention; 5.2 keeps the original id.
Nothing in `src/` referenced either, since neither has a generator yet.

**[Content contract fires on legitimate copy]** → Limits are deliberately generous
(4 steps, 12 words). If a skill genuinely cannot fit, that is a signal the skill is too
big and should be split — which is the stated pacing principle, so the check surfaces a
real design problem rather than an authoring nuisance.

## Migration Plan

Additive; no data migration and no rollback complexity.

1. Add the manifest and its tests. Nothing consumes it yet — tests pass or fail in
   isolation.
2. Point `src/curriculum/index.ts` at the manifest to resolve `implemented` vs `planned`,
   keeping existing exports intact so `Home` and `Lesson` are untouched.
3. Add the content-contract check to the existing generator test harness.

Stored progress is unaffected: skill ids do not change, and `reconcile()` in
`src/store/progress.ts` already merges unknown keys over defaults.

**Rollback:** delete the manifest directory and revert the `index.ts` change. No
persistent state depends on any of it.

## Open Questions

- **Where do skill `name` and `blurb` come from?** The document supplies an id for all 201
  rows but leaves the Skill cell empty on 90 of them, so both learner-facing fields are
  authored during transcription rather than copied. The cross-check therefore covers ids and
  markers, not names — which is the right split, but it does mean 90 short strings enter the
  app without the document as a check on tone. Worth a read-through pass once Stage B lands.
- **Does the vocabulary map earn its keep?** It needs manual upkeep as units are written.
  If it produces mostly false positives through Stage B, drop it rather than maintaining it.
- **Should `docs/curriculum.md` be generated *from* the manifest instead of cross-checked
  against it?** Single-source would be cleaner, but the document carries prose the manifest
  has no place for. Revisit if the cross-check proves noisy.
- **How are word-problem skills represented?** They sit at the end of Units 1–4 and 8–11
  and need a templated phrasing bank rather than pure generation. The manifest should
  probably mark them, but the shape of that marker is unknown until the first one is built.
