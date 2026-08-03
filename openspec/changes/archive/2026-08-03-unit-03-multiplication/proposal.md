## Why

Stage B currently ends after subtraction because all 14 Unit 3 skills are planned. Shipping
the complete multiplication unit opens the next course boundary while extending the shared
engine for the two genuinely new forms this unit teaches: carrying within a multiplication
row and aligning partial products in two-digit multiplication.

## What Changes

**Scope: Stage B · Unit 3 · Multiplication.** Skill ids, verbatim from
`docs/curriculum.md`: `mult-meaning` (3.1, `quick`), `times-2` (3.2, `quick`),
`times-10` (3.3, `quick`), `times-5` (3.4), `times-3` (3.5), `times-4` (3.6),
`times-6` (3.7), `times-9` (3.8), `times-7-8` (3.9, wall), `times-mixed` (3.10),
`mult-by-10-100` (3.11), `mult-2by1` (3.12, wall), `mult-2by2` (3.13, wall), and
`mult-words` (3.14).

- Add all 14 generators in curriculum order, with measurable difficulty ladders, computed
  answers, seeded output, and plain non-negative integer answers on the custom keypad.
- Extend the arithmetic engine with multiplication traces that expose per-column products,
  carries that may exceed one, and aligned partial-product rows without pretending
  multiplication is another binary `ColumnOperator`.
- Predict table-fact errors, place-value errors, missed carries, misplaced carries, a missing
  placeholder zero, and wrong partial-product addition. Each wall keeps at least two distinct
  diagnoses after central collision filtering.
- Add a fixed multiplication frame bank for `mult-words` and register every authored frame
  in the existing source-level checks.
- Add independent recomputation and recorded-output coverage for every new generator and
  focused engine tests for multiplication traces and misconception factories.
- Mark Unit 3 built in `docs/curriculum.md`, update roadmap status and item 10, and keep the
  active-change note in `AGENTS.md` accurate until archive.

### Non-goals

- Unit 4 division and its quotient/remainder/bring-down trace remain roadmap item 11.
- Unit 5 order of operations remains roadmap item 12.
- Existing addition and subtraction output is not reworded or re-recorded. Shared engine
  changes must preserve their snapshots.
- No new input mode or rendering surface is introduced. Unit 3 needs neither KaTeX, fraction
  input, diagrams, a coordinate plane, nor a system keyboard.
- The engine does not gain a generic expression tree or long-division trace. Multiplication
  helpers model only the column work consumed by `mult-2by1` and `mult-2by2`.

## Capabilities

### New Capabilities

None. This is Stage B content plus the shared problem-generation machinery it requires.

### Modified Capabilities

- `problem-generation`: add multiplication-row and partial-product behavior, and require all
  14 Stage B Unit 3 skills to resolve as playable generated content.

## Impact

- `src/curriculum/engine/` gains multiplication traces, focused tests, and misconception
  factories while the existing `ColumnOperator` remains addition/subtraction-specific.
- `src/curriculum/unit-03-multiplication.ts` and its recorded-output test/snapshot add the
  complete unit; `src/curriculum/index.ts` registers its generators.
- `src/curriculum/phrasing/multiplication.ts` adds the authored multiplication stories and
  `src/curriculum/phrasing/frames.test.ts` checks the complete bank.
- `src/curriculum/generators.test.ts` independently recomputes multiplication answers from
  visible operands and enforces determinism, difficulty, variety, and wall coverage; focused
  Unit 3 tests prove trace-to-hint, solution, and misconception agreement.
- `docs/curriculum.md`, `docs/roadmap.md`, and `AGENTS.md` reflect shipped scope and the
  temporary active OpenSpec queue.
- The progress record, sync endpoint, manifest ids, prerequisite declarations, capabilities,
  and keypad behavior do not change.
