## Why

Stage E's Unit 12 is next after Stage D's completion. Its first six skills establish what
an exponent is, evaluating powers, perfect squares and root estimation, and the
multiply/divide power rules, before scientific notation and order-of-operations-with-
exponents close the unit. Both capabilities this content needs — `math-notation`'s
`superscript` and `root` kinds, and `expression-input` — already shipped, so this
increment is unblocked content work.

## What Changes

- Add Stage E Unit 12 generators for `exponent-meaning`, `evaluate-powers`,
  `perfect-squares`, `estimate-roots`, `exponent-multiply`, and `exponent-divide`.
  `exponent-meaning` shows a repeated-multiplication row alongside a power in superscript
  with its exponent blanked out, and asks for the missing exponent — the count of factors —
  distinct from `evaluate-powers`, which asks for the evaluated product.
- Use the existing math-notation superscript and root rendering for powers and radicals,
  and the existing numeric keypad for every answer. `exponent-multiply` and
  `exponent-divide` display both same-base powers and require the resulting exponent as a
  number (add/subtract the shown exponents) rather than an expression answer, since
  `expression-input`'s grammar explicitly excludes exponents. No new rendering or
  answer-entry capability is required.
- Predict two distinct misconceptions for the `evaluate-powers` wall: reading 3⁴ as 3 × 4
  (multiply base by exponent instead of repeated multiplication), and reading 3⁴ as 4³
  (swapping base and exponent).
- Register and record the six generators, mark curriculum rows 12.1–12.6 playable, and
  advance the documented playable total while leaving roadmap item 21 open for the
  remaining six increments (12b, 13a, 13b, 14a, 14b, 15).

## Non-goals

- Do not implement `power-of-power`, `zero-neg-exponents`, `scientific-notation`, or
  `pemdas-exponents`; those are increment 12b.
- Do not add any input, rendering, or answer-shape capability. `math-notation`'s
  `superscript` and `root` kinds already exist in `src/lib/types.ts`; this change only
  consumes them.
- Do not change the manifest graph, stage capability flags, progress model, or sync format.
- Do not extend `estimate-roots` beyond perfect-square-adjacent whole-number bounds, and do
  not give it a pair-valued answer: it requires only the lesser of its two bounding whole
  numbers (the greater is always one more). A genuine pair answer is explicitly deferred to
  roadmap item 23's 18b increment (`quadratic-formula`), the first skill the roadmap names
  as needing that shape; introducing it here would be answer-shape capability work outside
  a content-only change.

## Capabilities

### New Capabilities

- `unit-12-exponents-roots`: Playable Unit 12a exponent-meaning, power-evaluation,
  perfect-square, root-estimation, and power multiply/divide content under the six
  manifest ids.

### Modified Capabilities

- `problem-generation`: a `math` display already carries `FractionData` or `RatioData` for
  independent verification of a fraction or ratio problem; add `PowerData` as a third,
  mutually exclusive option so exponent/root notation is equally verifiable without a new
  Display kind.

## Impact

- New Unit 12 generator and focused test modules under `src/curriculum/`.
- Registry, coverage snapshots/assertions, curriculum status markers, README summary, and
  roadmap progress text updated to reflect 117 playable skills.
- No new package, network dependency, runtime service, migration, or public API.
