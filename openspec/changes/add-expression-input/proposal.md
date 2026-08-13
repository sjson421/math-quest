## Why

Roadmap item 20b (docs/roadmap.md:748-753) blocks Unit 13 (roadmap item 21), which needs
four walls — `words-to-expression`, `combine-like-terms`, `distributive`, and
`distribute-negative` (docs/roadmap.md:740-742) — to answer with a variable expression. Item
20a already generalized misconception diagnosis to non-scalar values; this change ships the
missing half: a way to type an expression on the keypad and a way to decide when two typed
expressions count as the same answer.

## What Changes

- Add a hand-rolled recursive-descent parser and normalizer for single-variable integer
  expressions (`src/lib/expression.ts`): one generator-chosen letter, integer coefficients,
  infix `+`/`−`, unary `−`, parentheses, and implicit juxtaposition multiplication (`2x`).
- Add an `'expression'` `Answer` kind carrying a canonical string and a per-answer `form`
  (`'expanded'` collapses `2(x+1)` and `2x+2` to one answer; `'exact'` keeps them distinct),
  so which comparison a skill wants is a generator decision on the answer, not a per-skill
  checker.
- Extend `checkAnswer` to parse, canonicalize, and compare expression answers under the
  declared form.
- Add an expression keypad layout: digits, a contextual variable key (labelled with that
  problem's letter), infix `+`/`−`, and parentheses — a distinct layout from the numeric pad
  rather than squeezed into its already-full bottom row.
- Extend `Problem['inputMode']` with `'expression'` and extend every exhaustive consumer
  (`ProblemView`'s `SLOT` record, and any other switch keyed on `inputMode`).
- Mark the existing manifest capability `expression-input` available in
  `AVAILABLE_CAPABILITIES`, proving availability alone adds no playable skill.
- Add a coverage test pinning that nothing unlocks from the capability flip alone.

This is capability infrastructure for Stage E, Unit 13. No curriculum generator is added and
no skill gains a generator in this change.

### Non-goals

- Any Unit 13 generator, or marking any curriculum skill row built — that is roadmap item 21,
  proposed separately once this capability exists.
- Exponents, multiple-variable terms, or division within an expression — nothing before
  Stage F needs them, and Unit 13's skill set (docs/curriculum.md:340-351) does not either.
- A general-purpose CAS or algebraic simplifier — the grammar and canonicalization cover
  exactly what Unit 13 needs, not arbitrary algebra.
- Rendering expressions through a new `Display` kind — they render as existing `MathNotation`
  text/row nodes.

## Capabilities

### New Capabilities

- `expression-input`: typing, parsing, and canonical-form comparison for single-variable
  integer expression answers.

### Modified Capabilities

- `answer-entry`: a problem gains a new answer-entry surface (expression) alongside the
  existing keypad/choice/number-line surfaces, with its own declared character classes and
  its own wrong-answer outcomes for an unparseable or wrong-form entry.
- `curriculum-manifest`: mark the existing `expression-input` requirement available while
  preserving generator-gated skill state and today's playable-skill count.

## Impact

The `Answer` and `Problem['inputMode']` unions, `checkAnswer`, `Keypad`/`applyKey`, and
`ProblemView`'s exhaustive `inputMode`/`Display['kind']` consumers gain an expression arm. A
new `src/lib/expression.ts` owns parsing and canonicalization, with focused unit tests. No
runtime dependency, generator registry, stored progress shape, sync payload, or playable
skill changes.
