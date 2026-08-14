## Why

Roadmap item 21's `14a` increment is the next unfinished work: Unit 14's first six skills,
`equation-balance` through `equation-parentheses`. Unit 13 shipped the expressions the unit
manipulates, so the content is unblocked — but nothing in the course has ever displayed an
**equation**, and the one display shape available appends its own `= answer` frame. A
problem reading `3x + 5 = 20` under that frame renders `3x + 5 = 20 = 5`, which is false.
The frame has to be settled before any of these six generators can be written.

## What Changes

Stage E, Unit 14 (`unit-14`, "Linear Equations"), exactly six skill ids:
`equation-balance`, `one-step-addsub`, `one-step-multdiv`, `two-step` (wall),
`vars-both-sides`, `equation-parentheses`. All six answer numerically on the existing
keypad; no new input mode and no new entry in `AVAILABLE_CAPABILITIES`.

- **A new `equation` arm on the `Display` union**, carrying the equation's text, the
  variable letter, and an `EquationData` payload. Rendered as the equation on one row with
  the answer slot framed as `x = [slot]` beneath it — not as an appended equality.
- **`EquationData`**, a new union parallel to the existing `AlgebraData`/`PowerData`
  payloads, carrying each skill's source coefficients and constants so the solution is
  re-derived rather than trusted.
- **Six generators** in a new `src/curriculum/unit-14-linear-equations.ts`, registered in
  `curriculum/index.ts`.
- **The `two-step` wall's draw composes rather than filters.** Both of its predicted
  mistakes — undoing in the wrong order, and adding where the balance subtracts — are whole
  numbers only when the coefficient divides the constant, so the operands are built from a
  chosen solution rather than drawn and rejected.
- **Per-problem sign permission** derived from the answer and its predictions together, the
  rule `answer-entry` already states and Unit 6 established.
- **The measured width gate gains a band for the new kind.** `coverage.test.ts` caps inline
  text at 18 characters *because* an inline row also carries a trailing `= [slot]`. An
  equation row carries no such trailing frame, so it is measured under its own budget rather
  than borrowed into inline's.
- Documentation: `docs/curriculum.md`'s ✅ markers for 14.1–14.6, and roadmap item 21's
  `14a` increment marked shipped.

### Non-goals

- **Unit 14's remaining four skills** (`with-fractions`, `special-solutions`,
  `equation-words`, `rearrange-formula`). They are the roadmap's `14b` increment, and two of
  them break the keypad — `rearrange-formula` answers with an expression and
  `special-solutions` answers with neither a value nor an expression. Deciding their input
  shapes here would be guessing ahead of the increment that owns them.
- **Structured notation for equations.** `14b`'s `with-fractions` will want real stacked
  fractions inside an equation; this change renders equation text as text, per item 18's
  rule of building for the consumers that exist.
- **A variable node in the shared engine expression tree.** `NumericExpression` models no
  variable, and Unit 13 built its displays from string templates plus carried data rather
  than extending it. Unit 14a follows that precedent; a single consumer does not justify a
  second graph in `engine/`.
- **No new capability flag.** Every one of these six skills answers on the keypad that has
  existed since item 3.

## Capabilities

### New Capabilities

- `unit-14-linear-equations`: what each of the six skills asks, what its answer is, how the
  `two-step` wall's operands are composed so both predictions survive, and which entry
  affordances each problem declares.

### Modified Capabilities

- `problem-generation`: adds the requirement that an equation display carries independently
  verifiable source data — the third display case, after "the answer is the value of what is
  shown" and "the answer is a rewriting of it", where the answer is the value that makes the
  displayed statement true.
- `answer-entry`: adds the requirement that an equation's answer slot is framed by the
  variable it solves for, rather than by appending an equality to a display that already
  contains one.

## Impact

- **New**: `src/curriculum/unit-14-linear-equations.ts` and its test file;
  `openspec/specs/unit-14-linear-equations/`.
- **`src/lib/types.ts`**: `Display` gains an `equation` arm; `EquationData` is added.
- **`src/components/ProblemView.tsx`**: a new case in the exhaustive display switch — a
  compile error until it is handled.
- **`src/curriculum/recorded-output.ts`**: a new case in `formatDisplay`, likewise
  compile-forced, so the per-problem declarations reach the review surface.
- **`src/curriculum/generators.test.ts`**: two sites — answer re-derivation and the
  difficulty-ladder operand read.
- **`src/curriculum/coverage.test.ts`**: the width measurement extended to the new kind.
- **`src/curriculum/index.ts`**: six generators registered.
- **Docs**: `docs/curriculum.md` ✅ markers, `docs/roadmap.md` item 21.
- **Unchanged**: `AVAILABLE_CAPABILITIES`, the manifest, `api/progress.ts`, `src/lib/sync.ts`,
  and the progress reconcile contract. This change stores nothing new.
