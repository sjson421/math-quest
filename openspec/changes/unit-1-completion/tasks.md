## 1. Engine: the binary-operand assumption

Capability work, kept separate from the three generators that consume it. Each task lands with
its own tests, and none of the seven shipped generators is edited — `unit-01-add-sub.test.ts`
must stay green untouched throughout this section.

- [x] 1.1 Add `stackTrace(operands: number[])` and `StackPlace`/`StackTrace` to
      `engine/column.ts`, addition only, per design *Decision 1*. Columns hold `digits[]`,
      `incoming` and `carry` as quantities rather than flags. Add a throwing place accessor for
      it, factoring the existing `place()` error path rather than copying it. Extend
      `columnTrace`'s doc comment to point at the stack, where its "carry is 0 or 1" note does
      not hold. Export both from `engine/index.ts`.
- [x] 1.2 Cover the stack trace in `engine/column.test.ts`: digits in operand order; a column
      carrying 2 (`9 + 8 + 7`); a carry propagating past a column whose own digits sum to
      nothing (`x0 + y0 + z9` style); the result matching a plain sum across the full width;
      and the accessor naming the operands and the width it has when a place is missing, as
      `place()` already does for the binary trace. Include the
      synthetic failing case, per the repository's rule that a checker returning "no problems"
      looks exactly like a clean codebase.
- [x] 1.3 Add `drawOperands({ label, rng, band, count, where })` to `engine/draw.ts`, returning
      `number[]` over the same retry-and-report loop. Leave `drawPair` untouched, for the
      seed-stability reason in design *Decision 3*. Export from `engine/index.ts`.
- [x] 1.4 Cover it in `engine/draw.test.ts`: the requested count is returned, `where` rejects
      and redraws, the same seed draws the same operands, and exhausting the attempts throws an
      error naming the label and the band.
- [x] 1.5 Widen `forgotCarry` to the structural `CarryingTrace` (design *Decision 2*) and add
      `offBy(correct, step, { tag, low, high })` with `offByOne` reduced to a wrapper at step 1
      (design *Decision 6*). The tags `off-by-one-low` and `off-by-one-high` MUST be unchanged.
- [x] 1.6 Cover both in `engine/misconceptions.test.ts`: `forgotCarry` over a stack whose carry
      is 2 predicts a value short by 20, not 10; `forgotCarry` over the existing binary traces
      is unchanged; `offBy` at step 10 produces the pair `add-tens` needs; `offByOne` still
      produces its exact former tags and values.
- [x] 1.7 Run `npx vitest run src/curriculum/engine src/curriculum/unit-01-add-sub.test.ts`.
      The engine tests pass and the recorded-output snapshots are untouched — no `-u`, and a
      diff here means section 1 changed shipped content and must be fixed rather than
      re-recorded.

## 2. Generators

One task per generator. Each writes the skill and confirms it against the whole suite before
the next starts, so a content-contract failure is attributable to one skill.

Each generator MUST declare the `name` and `blurb` its manifest entry already carries —
`add-facts-small` "Small Sums" / "Sums to 10", `add-tens` "Adding Tens" / "20 + 30",
`add-three-numbers` "Three Addends" / "Add a stack of three numbers"
(`manifest/stage-b.ts:30`, `:41`, `:64`). `Home.tsx:152` renders the *generator's* name and
blurb to the learner, not the manifest's, and **no test compares the two** — so a divergence
here ships silently. All three blurbs are within the 32-character card limit.

- [x] 2.1 `add-facts-small` (1.1) — inline display, ladder and `a + b ≤ 10` constraint per
      design *Decision 4*, misconceptions `off-by-one-low`/`off-by-one-high`/`subtracted` per
      *Decision 5*. Counting-on hint and a three-step solution in the register `add-facts`
      already uses. Register it at the head of `unit01.skills` (*Decision 8*).
- [x] 2.2 `add-tens` (1.3) — inline display, tens drawn as a count and multiplied by 10,
      misconceptions `dropped-place-value` and `off-by-ten-low`/`off-by-ten-high`. The hint
      names the place-value move, which is the whole skill. Register it third.
- [x] 2.3 `add-three-numbers` (1.7) — column display with three operands, built on
      `stackTrace` and `drawOperands`, constrained to carry out of the ones and to exclude the
      third addend `= 10 × carry`. Misconceptions `forgot-carry` and `added-two-of-three`.
      Solution: ones column, write-and-carry, tens column including the carry, and the total —
      four steps, which is the contract's limit, at 12 words or fewer each. Register it
      seventh.
- [x] 2.4 Add ✅ to rows 1.1, 1.3 and 1.7 of `docs/curriculum.md`. Nothing else in that
      document changes — it is imported with `?raw` and 17 tests read its tables.
- [x] 2.5 Record the three new snapshots in `unit-01-add-sub.test.ts` and **read them**: five
      seeds × five difficulties each. Check the wording, the arithmetic in every `detail`, and
      that each predicted value is the mistake its tag claims. This is authored content
      arriving, not a fixture being accepted. The seven existing snapshots MUST be unchanged in
      the same diff.
- [x] 2.6 Run `npx vitest run src/curriculum` and confirm the three new skills pass ~1000
      sampled problems each: answers recomputed from the display, no misconception equal to the
      answer or to another, the content contract, determinism, difficulty scaling, and variety.

## 3. Coverage, unlock graph, and the store

The consequences of three skills becoming playable. Separated from section 2 because these are
assertions about the course, not about a generator.

- [x] 3.1 Update `curriculum/coverage.test.ts`: 7 → 10 implemented, 194 → 191 planned. The ✅
      set stays derived from the document rather than hardcoded. Re-read the comments that
      describe the seven — the one about the two subtraction skills shipping from a Unit 1 file
      still reads true, so leave it; correct any that no longer do.
- [x] 3.2 Update the committed unlock-graph snapshot and **review it as a graph**, against the
      table in design *Decision 7*: `add-facts-small` is the new root, `add-facts` falls behind
      it, `add-2digit-nocarry` moves to `add-tens`, `add-words` moves to `add-three-numbers`,
      and every subtraction edge is unchanged.
- [x] 3.3 Update `store/progress.test.ts` for the new graph: `throughUnit1()` gains the three
      skills, the root assertion becomes `add-facts-small`, and the two cases using
      `add-facts-small`/`add-tens` as `planned` examples move to ids that are still planned
      (`sub-facts-small`, `sub-tens`). Keep what each case was testing — do not weaken a case
      into agreement with the new numbers.
- [x] 3.4 Add a case asserting the grandfathering this change is the first to actually need: a
      record with attempts on `add-facts` and nothing else keeps `add-facts` unlocked even
      though it now sits behind `add-facts-small`, and its mastery is unchanged.
- [x] 3.5 Run `npm test`. Everything green, including the manifest and curriculum-document
      cross-checks, which are what catch a ✅ marker that disagrees with the registry.
- [x] 3.6 Correct the two documentation facts this change falsifies. `docs/roadmap.md` opens
      "**Status: 7 of 201 skills are playable.** All seven are in Units 1–2" and says of itself
      that this is the only progress number in the repository's documentation — it becomes 10,
      still all in Units 1–2, still no capability beyond the plain keypad. And `AGENTS.md`
      states "**The active queue is empty**", which stops being true the moment this change is
      committed unarchived. Nothing else in either document changes here.
- [x] 3.7 Tick roadmap item 2, in the form items 0 and 1 already use:
      `- [x] **2 · Unit 1, the remaining three** — S — **shipped 2026-07-31**`. The whole item
      ships in this change — it was not split — so leaving the box unchecked would point the
      next run of this workflow at an item that is already done.

## 4. Verify

- [x] 4.1 Run `npm run build`, then `npm run lint`. Types pass under the real build config, not
      only `tsc --noEmit`. Only the three documented pre-existing `Settings.tsx` warnings
      remain; investigate anything else.
- [x] 4.2 Run `openspec validate unit-1-completion --strict` and confirm the delta
      spec describes what was actually built. If implementation diverged from either
      requirement in `specs/problem-generation/spec.md`, correct the spec — do not archive an
      aspiration as fact.
- [x] 4.3 Drive the real app in the browser preview. Confirm the Home screen shows ten cards in
      curriculum order with `add-facts-small` first and open; play it through to completion and
      confirm the lesson still ends at 10 correct, since the `quick` flag is deliberately not
      honoured yet. Then open `add-three-numbers` (writing a progress record into IndexedDB
      under `math-quest-progress` is the fastest route, deleted afterwards) and confirm the
      three-operand column renders as three right-aligned rows with a single `+` against the
      last — the one path in this change that no test can see. Capture a screenshot of each.
