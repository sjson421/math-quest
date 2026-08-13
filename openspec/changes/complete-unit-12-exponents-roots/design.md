## Context

See `proposal.md` for motivation and scope. Unit 5 owns a local expression tree for
arithmetic precedence, rendering, correct evaluation, and wrong-rule evaluation. Its own
comment sets the extraction rule: a helper moves to the engine when a second unit needs it.
`pemdas-exponents` is that second consumer, but it also needs the power precedence tier and
structured `MathNotation` rather than Unit 5's inline text alone.

Unit 12a established a separate `PowerData` union on math displays. The global generator
suite rebuilds both notation and answers from that operation-specific payload rather than
trusting generator arithmetic. All capabilities needed by 12b are already available, but
Stage E deliberately left built fraction input undeclared until `zero-neg-exponents`
settled its answer form; choosing an exact reciprocal resolves that manifest decision.

## Goals / Non-Goals

**Goals:**

- Preserve every recorded Unit 5 problem while giving Units 5 and 12 one expression model
  for arithmetic structure, precedence, rendering, and evaluation.
- Keep each new Unit 12 answer independently derivable from primitive operation data.
- Keep numeric results and visible expression widths bounded across all difficulty bands.
- Guarantee two surviving diagnoses on every `power-of-power` wall problem.

**Non-Goals:**

- The shared numeric expression tree does not parse learner input and does not replace the
  algebraic canonical-form parser used by expression input.
- The tree does not add exponentiation to the `Operator` union; powers are a distinct node
  because they render structurally and associate differently from binary arithmetic.
- No general symbolic-algebra, arbitrary exponent, or scientific-notation answer grammar.

## Decisions

- **Extract and extend the Unit 5 tree in `curriculum/engine/`.** The shared expression is a
  discriminated tree containing numeric leaves, binary arithmetic nodes, and power nodes.
  It evaluates recursively and can render either Unit 5's exact inline text or nested
  `MathNotation`. Unit 5 imports the extracted helpers and retains its current public test
  surface or updates tests to the engine path without changing generated output.

  A separate Unit 12 tree was rejected because it would duplicate precedence and
  parenthesis rules exactly when the second unit makes the engine extraction rule apply.
  Widening `Operator` with exponentiation was rejected because it would force every
  arithmetic switch to accept an operator that is neither rendered nor associated like the
  four existing binary operators.

- **Keep `PowerData` operation-specific.** Add arms for power-of-power, zero/negative
  exponents, scientific notation, and two PEMDAS expression families. Each arm carries
  primitive operands plus an explicit family or direction where needed. The global verifier
  reconstructs the expected notation and answer with its own switch. Carrying the authored
  expression tree itself was rejected because sharing the generator's already-built tree
  would weaken the independent display-agreement check.

- **Constrain the wall at draw time.** `power-of-power` uses inner and outer exponents of at
  least 2, excludes the one collision where multiplication equals addition, and predicts
  `inner + outer` (`added-exponents`) plus `inner` (`ignored-outer-exponent`). These values
  are distinct from each other and from `inner × outer` before `generateProblem` filters
  them.

- **Teach zero and negative exponents as two seeded families.** Zero-power problems answer
  1 and diagnose answering 0. Negative-power problems answer the exact reciprocal and
  diagnose keeping the positive power or negating it. The negative family declares both
  fraction entry and sign entry, so every exact answer and predicted value remains typable;
  Stage E adds built `fraction-input` to its requirements because this is its first consumer.

- **Scientific notation is read into an ordinary number.** The display uses a normalized
  integer or one-decimal coefficient and a signed power of ten. Positive and negative
  exponent families both occur; exact rational construction avoids floating-point answer
  drift, and exponent magnitude is capped so the phone-width and keypad remain practical.
  Every problem predicts moving the decimal only one place (`moved-one-place`) and moving it
  in the direction opposite the exponent (`reversed-exponent-direction`). Both are rebuilt
  from coefficient and exponent data, constrained away from the answer and each other, and
  every problem declares decimal entry because at least one reachable value contains a
  decimal point.
  Asking learners to type `a × 10ⁿ` was rejected because expression input deliberately has
  no exponent grammar and extending it would be separate capability work.

- **Use two structural PEMDAS families.** One family places a power before multiplication
  and addition; the other raises a parenthesized sum before exact division. The shared tree
  produces visible notation and the correct value, and wrong-rule transforms replace a
  power with base-times-exponent or discard the intended grouping. Operands are composed
  outward where division must be exact, avoiding reject-heavy generation and fractional
  intermediate work.

## Risks / Trade-offs

- [Risk] Extracting Unit 5 logic could repoint seeded output or change parentheses. → Keep
  random draws inside generators, snapshot Unit 5 before and after, and add direct shared-
  model tests for unchanged arithmetic rendering.
- [Risk] Scientific notation can create long or floating-point-sensitive answers. → Use
  integer coefficient data plus a decimal scale, build exact rational answers, cap exponent
  magnitude, and exercise the 375px layout in real Chromium.
- [Risk] Wrong-rule predictions can collide after operand selection. → Assert surviving
  tags and values across the complete seeded sweep, with the wall's collision excluded by
  construction.
- [Risk] A generic tree could tempt future symbolic use beyond its contract. → Keep it
  numeric and curriculum-internal; expression-input canonicalization remains separate.

## Migration Plan

The change adds generators and refactors only derived curriculum code. There is no stored
state migration. Rollback is the commit revert; previously practised skills remain covered
by the existing never-relock read rule if generator availability changes during rollback.
