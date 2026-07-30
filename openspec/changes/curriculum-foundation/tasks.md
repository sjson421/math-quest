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
- [ ] 2.5 `stage-e.ts` — Units 12–15, 34 skills; mark expression-input requirement
- [ ] 2.6 `stage-f.ts` — Units 16–19, 28 skills; mark coordinate-plane requirement
- [ ] 2.7 `stage-g.ts` — Units 20–21, 22 skills; mark diagram and chart requirements
- [ ] 2.8 `stage-h.ts` — Unit 22, 6 modules; mark timed requirement
- [ ] 2.9 `src/curriculum/manifest/index.ts` — re-export all stages, expose `allSkills`, `skillById`, `unitById`, `stageById`
- [ ] 2.10 Carry `quick` and `wall` flags across from the curriculum document

## 3. Structural validation tests

- [ ] 3.1 `manifest.test.ts`: counts match the document — 8 stages, 23 units, 201 skills, and per-stage skill counts
- [ ] 3.2 Every skill id is unique across the whole course; a duplicate names both entries
- [ ] 3.3 Every prerequisite resolves to a manifest entry; a dangling id names the skill and the missing target
- [ ] 3.4 The resolved prerequisite graph is acyclic; a cycle reports its full path
- [ ] 3.5 Every skill is reachable from a root, and at least one root exists
- [ ] 3.6 Snapshot the fully-resolved prerequisite graph so derivation changes surface as a reviewable diff

## 4. Cross-check against the curriculum document

- [ ] 4.1 Parse skill ids out of the `docs/curriculum.md` tables — anchor on the id column (`| N.N | \`id\` | … |`), **not** on backticked tokens anywhere in the row, or the `` `quick` `` marker in the Note column parses as a phantom skill id. All 201 rows match that one anchor.
- [ ] 4.2 Assert the parsed set equals the manifest set exactly — this is what catches a semantically-wrong-but-structurally-valid id such as `times-78` for `times-7-8`
- [ ] 4.3 Assert `quick` and wall markers agree between document and manifest — expect 19 `quick` and 46 wall; markers live in the Note column alongside other text, `plot-points` (16.1) carries both, and four wall rows are a bare ⚠️ with no explanation
- [ ] 4.4 Assert the document's declared counts agree with its own tables, so a hand-edit to a unit heading or the stage map cannot silently disagree with the rows beneath it

## 5. Generator coverage

- [ ] 5.1 Build the generator registry in `src/curriculum/index.ts` keyed by manifest id
- [ ] 5.2 Test: every registered generator has a manifest entry; an unregistered id fails and is named
- [ ] 5.3 Test: manifest entries with no generator resolve as `planned` and do **not** fail
- [ ] 5.4 Test: the six existing Unit 1/2 generators resolve as `implemented`, and `sub-facts` / `sub-2digit-borrow` report Unit 2 membership — the document's six ✅ markers name exactly these six ids, so assert against the parsed ✅ set rather than a hardcoded list
- [ ] 5.5 Verify only `implemented` skills are offered to the learner, and `planned` skills stay hidden

## 6. Content contract enforcement

- [ ] 6.1 `src/lib/content-rules.ts` — `checkContent(problem, skillEntry)` returning structured violations
- [ ] 6.2 Enforce: ≤4 solution steps, ≤12 words per step, single-sentence hint, non-empty hint and solution
- [ ] 6.3 Enforce: wall-marked skills predict ≥2 distinct misconceptions
- [ ] 6.4 Build the vocabulary map (~30 terms → introducing unit) and check for forward references
- [ ] 6.5 Wire the content check into the existing per-generator test harness in `src/curriculum/generators.test.ts`
- [ ] 6.6 Confirm all six existing generators pass the contract; fix any that do not

## 7. Verify

- [ ] 7.1 `npm test` — all suites green, including the 70 pre-existing tests
- [ ] 7.2 `npx tsc --noEmit` clean and `npm run build` succeeds
- [ ] 7.3 Deliberately break the manifest (duplicate id, dangling prerequisite, injected cycle) and confirm each test fails with a useful message, then revert
- [ ] 7.4 Drive the real app in a browser: home screen renders, the six implemented skills appear, no planned skills leak into the UI, and a lesson still completes end to end
- [ ] 7.5 Confirm stored progress from before this change still loads with mastery intact
- [ ] 7.6 Reconcile `docs/curriculum.md` with anything the transcription proved wrong, so document and manifest agree — known so far: the duplicate `with-parentheses` handled in 2.0. Confirm the ✅ markers still name the implemented set, since this change does not add generators.
