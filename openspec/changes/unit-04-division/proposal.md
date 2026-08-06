## Why

Stage B stops after multiplication: all 11 Unit 4 skills are planned, so division — the last
arithmetic operation before order of operations closes the stage — is unreachable. Shipping
the unit also forces two questions the roadmap deliberately left open, and both are cheaper
to answer now than to inherit: long division needs a trace the engine does not have, and
`factors`, `multiples` and `primes` need an answer surface for a set of numbers rather than
one number.

## What Changes

**Scope: Stage B · Unit 4 · Division.** Skill ids, verbatim from `docs/curriculum.md`:
`div-meaning` (4.1, `quick`), `div-facts` (4.2), `div-remainder` (4.3),
`div-by-10-100` (4.4), `long-div-1digit` (4.5, wall), `long-div-remainder` (4.6),
`long-div-2digit` (4.7, wall), `factors` (4.8), `multiples` (4.9), `primes` (4.10),
and `div-words` (4.11).

- Add all 11 generators in curriculum order, with measurable difficulty ladders, answers
  computed from the operands each generator just chose, seeded reproducible output, and
  non-negative whole-number answers on the existing keypad or the built `choice-input`.
- Extend the engine with a **long-division trace** — per quotient digit: the digit brought
  down, the working value it joins, the quotient digit, the amount subtracted, and the
  remainder carried into the next step — plus the misconception factories the two walls
  derive from it. Multiplication and column traces are untouched.
- **Answer the roadmap's open multi-value question with the capability already built.**
  `factors`, `multiples` and `primes` answer through `choice-input`, whose options are
  complete authored lists (or the classification itself). No new input mode is introduced,
  so this stays a content change rather than becoming capability work.
- **Record `choice-input` on Stage B**, which for the first time contains consumers of it.
  `AVAILABLE_CAPABILITIES` is untouched and no skill's state changes — the capability is
  already built — but the manifest's rule is that a stage lists every capability its own
  skills need, and two tests currently pin Stage B's absence of one.
- Widen independent verification to cover a displayed division expression **whose answer is
  not its quotient** (`div-remainder` shows `47 ÷ 5` and asks for 2) and number-property
  problems answered by choice. Today the recomputation would divide and disagree.
- Compose long-division operands from a chosen quotient and divisor rather than drawing and
  filtering, which is what Unit 2 learned the hard way when a three-property filter exhausted
  its attempts in front of a learner.
- Add a division frame bank for `div-words`, register it in the source-level frame check, and
  give the `÷` operator its own check quantities — which the phrasing bank's own comment
  reserves for this unit.
- Predict, per skill: the wrong operation, one group too many or too few, the quotient given
  where the remainder was asked, a shift in the wrong direction, a dropped final bring-down,
  a step remainder never carried forward, and a leading quotient digit estimated high or low.
  Each wall keeps at least two distinct diagnoses on **every** problem after the central
  collision filter, not merely on average.
- Mark Unit 4 built in `docs/curriculum.md`, tick roadmap item 11, and keep the active-change
  note in `AGENTS.md` accurate until archive.

### Non-goals

- **No new input mode.** Multi-value entry, expression input, number-line input and
  coordinate input all remain later roadmap items. If a Unit 4 skill cannot be expressed on
  the keypad or through choices, it is rewritten, not given a new surface.
- Unit 5 order of operations remains roadmap item 12, and Stage B stays open at the end of
  this change.
- No stage capability is built and `AVAILABLE_CAPABILITIES` is untouched. Stage B records
  the already-built `choice-input`; nothing waits on anything unbuilt.
- Existing Unit 0–3 output is not reworded or re-recorded. Engine additions must leave every
  recorded snapshot byte-identical.
- Decimal quotients are out of scope. Every Unit 4 answer is a non-negative whole number;
  division that does not come out exactly is taught through remainders, not decimals, which
  arrive in Unit 9.
- The long-division trace models only what Unit 4 consumes. It is not generalised toward
  polynomial division or decimal quotients on speculation.
- No KaTeX, diagram, chart, or coordinate-plane rendering.

## Capabilities

### New Capabilities

None. This is Stage B content plus the shared generation machinery it requires, using the
`choice-input` capability that already ships.

### Modified Capabilities

- `problem-generation`: add long-division working as a first-class trace; widen the
  independently-verifiable requirement so a problem may display an arithmetic expression
  whose answer is a *property* of that division rather than its quotient, and so a
  number-property problem may be answered by choice; require all 11 Stage B Unit 4 skills to
  resolve as playable generated content.
- `word-problem-phrasing`: division stories predict multiplication as their wrong operation
  rather than addition, and a division frame's quantities must divide exactly — including by
  the distractor, whose predicted value is otherwise a fraction no keypad can produce and no
  learner can ever be diagnosed with.

## Impact

- `src/curriculum/engine/` gains a division trace module, its misconception factories, and
  focused tests; `engine/index.ts` re-exports them. `ColumnOperator`, the multiplication
  trace, and every existing helper keep their current behaviour.
- `src/curriculum/unit-04-division.ts` and its recorded-output test and snapshot add the
  complete unit; `src/curriculum/index.ts` registers its generators.
- `src/lib/types.ts` widens the machine-readable display data so a division property or a
  number-property choice is verifiable; nothing rendering-facing reads that data today.
- `src/curriculum/generators.test.ts` recomputes the new operations independently from what is
  displayed, and keeps its synthetic cases proving the checker names an offender.
- `src/curriculum/phrasing/division.ts` adds the authored stories; `phrasing.ts` gains `÷`
  check quantities and its wrong-operation partner; `phrasing/frames.test.ts` registers and
  checks the bank under Unit 4's forward-reference rule.
- `src/curriculum/manifest/stage-b.ts` gains `requires: ['choice-input']` and loses the header
  comment claiming no capability requirements. `manifest.test.ts` adds Stage B to the stages
  it asserts record a named consumer, and `coverage.test.ts`'s "Stage B needs no unbuilt
  capability" case moves from asserting `requires` is undefined to asserting it holds only
  built capabilities — the property it was really protecting.
- `docs/curriculum.md` marks Unit 4 built (the manifest cross-check enforces it),
  `docs/roadmap.md` ticks item 11 and restates the progress line, and `AGENTS.md` tracks the
  active change until archive. The document's capability table is unaffected: choice input is
  still first needed at Stage A, and nothing cross-checks a stage's `requires` against it.
- The progress record, sync endpoint, manifest ids, prerequisite declarations,
  `AVAILABLE_CAPABILITIES`, every skill's resolved state, keypad rules, and every component
  stay unchanged.
