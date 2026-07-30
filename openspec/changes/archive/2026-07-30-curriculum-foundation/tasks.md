## 1. Manifest types and derivation

- [x] 1.1 Add manifest types to `src/curriculum/manifest/types.ts`: `StageEntry`, `UnitEntry`, `SkillEntry` (id, name, blurb, optional `quick`, `wall`, `prerequisites` override), and the `Capability` union (katex, fraction-input, diagram, expression-input, number-line, coordinate-plane, chart, timed)
- [x] 1.2 Implement `resolvePrerequisites()` in `src/curriculum/manifest/resolve.ts`: default to previous skill in unit, apply unit-level `dependsOn` to the unit's first skill, let an explicit `prerequisites` array replace the default entirely
- [x] 1.3 Implement `resolveSkillState()`: returns `implemented` when a generator is registered AND every capability the stage requires is available, otherwise `planned`
- [x] 1.4 Implement pass-through unlock resolution — a `planned` skill is transparent, so its dependants inherit its prerequisites rather than being blocked
- [x] 1.5 `resolve.test.ts` — cover the derivation rules themselves against synthetic stages: each prerequisite rule and its precedence, capability gating, pass-through across a run of planned skills, edge dedup, and the cycle guard

## 2. Transcribe the manifest

Source of truth is `docs/curriculum.md`. Use its skill ids verbatim.

> **Resolved:** `with-parentheses` was declared twice — 5.2 (Order of Operations) and 14.6
> (Linear Equations). 14.6 is now `equation-parentheses`; 5.2 keeps the original id. Every
> other count in the document checks out, so this was the only reconciliation needed.
>
> **`name` and `blurb` are authored, not transcribed.** 90 of the 201 rows leave the Skill
> cell empty, so those two fields are written fresh at transcription time and the document
> cross-check covers ids and markers only. Adult tone applies: describe the skill, never
> talk down to the learner.

- [x] 2.0 Rename one of the two `with-parentheses` skills in `docs/curriculum.md`, then use the new id in the manifest so document and manifest agree from the start
- [x] 2.1 `stage-a.ts` — Unit 0, 8 skills
- [x] 2.2 `stage-b.ts` — Units 1–5, 44 skills
- [x] 2.3 `stage-c.ts` — Unit 6, 9 skills; no stage-level `requires` — number-line is needed by 6.1 alone, and `requires` is stage-wide, so declaring it would hold the other eight keypad-answerable skills behind a tap-to-place input mode. Revisit if capability needs move to the skill entry.
- [x] 2.4 `stage-d.ts` — Units 7–11, 50 skills; mark katex, fraction-input, diagram requirements
- [x] 2.5 `stage-e.ts` — Units 12–15, 34 skills; mark expression-input requirement
- [x] 2.6 `stage-f.ts` — Units 16–19, 28 skills; mark coordinate-plane requirement
- [x] 2.7 `stage-g.ts` — Units 20–21, 22 skills; mark diagram and chart requirements
- [x] 2.8 `stage-h.ts` — Unit 22, 6 modules; mark timed requirement
- [x] 2.9 `src/curriculum/manifest/index.ts` — re-export all stages, expose `allSkills`, `skillById`, `unitById`, `stageById`; also `allUnits`, and `types`/`resolve` re-exported so consumers have one import site
- [x] 2.10 Carry `quick` and `wall` flags across from the curriculum document — 19 `quick` and 46 wall, verified position-by-position against the document rather than by count

> **`requires` is each stage's full capability set, not only what it introduces.** A reader
> should not have to walk back through earlier stages to assemble the real set, so Stage E
> and F restate katex, and F restates expression-input. Two deliberate exceptions, both
> commented in place: Stage C declares nothing (number-line is needed by 6.1 alone, and a
> stage-wide marker would block eight keypad-answerable skills), and Stage H declares only
> `timed` (its reviews sample items from every earlier stage, which no stage-level field can
> express). The clean fix for both is an optional `requires` on the skill entry — not taken
> here, since it widens the change beyond transcription.

## 3. Structural validation tests

- [x] 3.1 `manifest.test.ts`: counts match the document — 8 stages, 23 units, 201 skills, and per-stage skill counts
- [x] 3.2 Every skill id is unique across the whole course; a duplicate names both entries
- [x] 3.3 Every prerequisite resolves to a manifest entry; a dangling id names the skill and the missing target
- [x] 3.4 The resolved prerequisite graph is acyclic; a cycle reports its full path
- [x] 3.5 Every skill is reachable from a root, and at least one root exists — asserted as *exactly* one root (`read-numbers`), since a second one means a skill was cut loose and should have to be introduced deliberately
- [x] 3.6 Snapshot the fully-resolved prerequisite graph so derivation changes surface as a reviewable diff

> Each reporting helper is paired with a synthetic case proving it names the offender — a
> duplicate, a dangling id, a cycle path, an unreachable skill — so 7.3's manual break-and-check
> confirms the wiring rather than the messages themselves.

## 4. Cross-check against the curriculum document

- [x] 4.1 Parse skill ids out of the `docs/curriculum.md` tables — anchor on the id column (`| N.N | \`id\` | … |`), **not** on backticked tokens anywhere in the row, or the `` `quick` `` marker in the Note column parses as a phantom skill id. All 201 rows match that one anchor. Parser lives in `curriculum-doc.ts`, test support only — it reads from disk with `node:fs`, so app code must never import it.
- [x] 4.2 Assert the parsed set equals the manifest set exactly — this is what catches a semantically-wrong-but-structurally-valid id such as `times-78` for `times-7-8`. Verified by injecting exactly that typo: five assertions fail, naming both spellings. Order and unit membership are checked too, not just set equality.
- [x] 4.3 Assert `quick` and wall markers agree between document and manifest — expect 19 `quick` and 46 wall; markers live in the Note column alongside other text, `plot-points` (16.1) carries both, and four wall rows are a bare ⚠️ with no explanation. The four are named: `div-by-decimal`, `function-notation`, `area-circle`, `compound-probability`.
- [x] 4.4 Assert the document's declared counts agree with its own tables, so a hand-edit to a unit heading or the stage map cannot silently disagree with the rows beneath it — covers the title block, unit headings, stage map skill counts, stage-map unit coverage, and the per-stage counts repeated in the Build order section

## 5. Generator coverage

- [x] 5.1 Build the generator registry in `src/curriculum/index.ts` keyed by manifest id — the name collision is resolved by renaming: the registry is `generators`, so `skillById` means manifest entries and nothing else. `progress.ts` and `generators.test.ts` updated; `units`, `allSkills`, `unitBySkillId` and `getSkill` keep their names, so `Home` and `Lesson` are untouched. Adds `manifestIndex`, `skillStates`, `skillState()` and `implementedSkillIds`.
- [x] 5.2 Test: every registered generator has a manifest entry; an unregistered id fails and is named
- [x] 5.3 Test: manifest entries with no generator resolve as `planned` and do **not** fail
- [x] 5.4 Test: the six existing Unit 1/2 generators resolve as `implemented`, and `sub-facts` / `sub-2digit-borrow` report Unit 2 membership — the document's six ✅ markers name exactly these six ids, so assert against the parsed ✅ set rather than a hardcoded list
- [x] 5.5 Verify only `implemented` skills are offered to the learner, and `planned` skills stay hidden — asserted both directions (nothing planned leaks in, nothing implemented is missing) and confirmed in the running app: Home lists exactly the six, with the other 195 absent

> **`isUnlocked()` deliberately still uses the generators' hand-written prerequisites.**
> Switching it to the manifest's derived pass-through graph would re-lock `sub-facts` for
> anyone who has `add-facts` but not `add-3digit`, and this change's Non-Goals rule out store
> and UI behaviour changes. The derived unlock graph is tested but not yet wired to play.

## 6. Content contract enforcement

- [x] 6.1 `src/lib/content-rules.ts` — `checkContent(problem, skillEntry)` returning structured violations. Signature is `checkContent(problem, { skill, unit })`: the forward-reference rule needs the unit, which a bare `SkillEntry` does not carry, and `manifestIndex.get(id)` already returns that shape.
- [x] 6.2 Enforce: ≤4 solution steps, ≤12 words per step, single-sentence hint, non-empty hint and solution — word count is the step's `text` only, since `detail` is arithmetic rather than prose; sentence splitting ignores a `.` followed by a digit so `0.5` is not two sentences
- [x] 6.3 Enforce: wall-marked skills predict ≥2 distinct misconceptions — distinct by *tag*, so two predictions of one mistake count once
- [x] 6.4 Build the vocabulary map (~30 terms → introducing unit) and check for forward references — 50 technical terms. Everyday teaching words (`sum`, `difference`, `product`, `carry`, `borrow`, `column`) are deliberately excluded: they are how the early units talk, and including them would bury real hits under noise. A test pins that exclusion so it reads as a decision.
- [x] 6.5 Wire the content check into the existing per-generator test harness in `src/curriculum/generators.test.ts` — runs over all 1000 sampled problems per skill and reports every distinct violation in one failure
- [x] 6.6 Confirm all six existing generators pass the contract; fix any that do not — **three failed.** `add-2digit-carry` and `add-3digit` had two-sentence hints; `sub-2digit-borrow` had 5 steps, a 14-word step, and — as a wall skill — dropped to one surviving misconception whenever the ones digits were five apart, because two of its predictions collided and the third equalled the answer. All fixed; the replacement prediction cannot collide by construction.

> **The contract found real defects, which is the point.** Worth noting for later authoring:
> the `sub-2digit-borrow` misconception gap was invisible to every existing test — the
> central filter in `generateProblem()` silently drops a prediction that equals the correct
> answer, so a wall skill can ship with nothing to say precisely on the problems where it
> matters most.

## 7. Verify

- [x] 7.1 `npm test` — all suites green, including the 70 pre-existing tests. 222 tests across 11 files; the pre-existing suites are untouched apart from the `skillById` → `generators` rename and three generator text fixes from 6.6.
- [x] 7.2 `npx tsc --noEmit` clean and `npm run build` succeeds — **`tsc -b` initially failed.** `curriculum-doc.ts` imported `node:fs`, but `tsconfig.app.json` types `src` with browser types only, deliberately, so app code cannot reach a Node builtin and typecheck its way into a runtime error. The parser now takes the document as a `?raw` import. Confirmed the document text is *not* in the built bundle.
- [x] 7.3 Deliberately break the manifest (duplicate id, dangling prerequisite, injected cycle) and confirm each test fails with a useful message, then revert — all three reported precisely. The duplicate message gained a row position: `times-2 declared in stage-b/unit-3#2 and stage-b/unit-3#10`, because both halves of a duplicate are often in the same unit and naming the unit twice does not say which rows to look at.
- [x] 7.4 Drive the real app in a browser: home screen renders, the six implemented skills appear, no planned skills leak into the UI, and a lesson still completes end to end — completed a full Carrying lesson (10 correct, +20 XP, +15 coins, level 1). The repaired one-sentence hint and the 4-step solution both render as intended.
- [x] 7.5 Confirm stored progress from before this change still loads with mastery intact — wrote a legacy 3-skill record straight into IndexedDB: mastery 5/3/2 preserved, streak, coins and daily XP intact, unlock states correct, and a field the app no longer reads survived the round trip. Test record deleted afterwards.
- [x] 7.6 Reconcile `docs/curriculum.md` with anything the transcription proved wrong, so document and manifest agree — the `with-parentheses` duplicate (2.0) remains the only reconciliation the exercise turned up; every other count and marker in the document verified against its own tables. The six ✅ markers still name exactly the six registered generators, asserted in `coverage.test.ts` against the parsed set.

> **The manifest is not free at runtime.** All 201 entries ship, because `skillStates` is
> derived at load: 20 KB minified, 6.3 KB gzipped, inside a 384 KB / 122 KB bundle. Validation
> stays test-time as designed, but "the manifest is inert data at runtime" means inert, not
> absent. Worth revisiting only if bundle size becomes a real constraint.
