## Context

Stage E declares `requires: ['math-notation', 'expression-input']` at the stage level, but
this increment (12a) does not need `expression-input` for any of its six skills — that
capability is needed starting with increment 13a. `expression-input`'s grammar explicitly
excludes exponents (see `openspec/specs/expression-input/spec.md`), which rules out an
answer format of "the resulting power" (e.g. `2⁵`) for `exponent-multiply`/`exponent-divide`.
See proposal.md for the resolution: those two skills ask for the resulting exponent as a
plain number, keeping the shared base fixed and visible in the problem statement.

## Goals / Non-Goals

**Goals:**
- Six new generators under `src/curriculum/`, following the existing generator shape
  (`SkillGenerator`, seeded, `Answer` exact/choice as appropriate).
- Every power and radical rendered through `MathNotation`'s existing `superscript`/`root`
  kinds — the first content to exercise either.
- `evaluate-powers` predicts two distinct, non-colliding misconceptions per the wall
  contract in `src/lib/content-rules.ts`.

**Non-Goals:**
- No manifest, capability, or `AVAILABLE_CAPABILITIES` change — Unit 12 is already declared
  and stage-gated by existing capabilities.
- No expression-answer format for any Unit 12a skill.
- No negative-exponent or zero-exponent content (12b's `zero-neg-exponents`).

## Decisions

- **Add `PowerData` to `src/lib/types.ts`, mirroring `RatioData`/`FractionData`.** The
  `math` display kind's independent-verification contract currently accepts only
  `fraction` or `ratio` payloads (a bare `notation`/`label` pair is explicitly rejected —
  see `problem-generation`'s existing test harness, which throws "a math display needs
  operation-specific data for independent verification" otherwise). Every Unit 12a problem
  therefore carries a `power: PowerData` payload alongside its `superscript`/`root`
  notation, covering `expand-power` (exponent-meaning), `evaluate-power`, `square` /
  `square-root` (perfect-squares' two directions), `estimate-root`, and `power-multiply` /
  `power-divide`.
- **`exponent-meaning` asks for the exponent, not the evaluated product.** Alternative
  considered: ask for the expanded repeated-multiplication form or the evaluated value —
  rejected because the exponent itself is already visible in a plain `evaluate-powers`-style
  display, making the question trivial. Instead the problem shows the repeated-
  multiplication expansion (e.g. "3 × 3 × 3 × 3") next to the same base in superscript with
  its exponent blanked out ("3^?"), and asks for the missing exponent — the factor count.
  This is what "Repeated multiplication" (the manifest blurb) actually tests, and it stays
  clearly distinct from `evaluate-powers`.
- **`estimate-roots` answers with one integer, not a pair.** The `Answer` union (exact,
  approx, choice, expression) has no pair-valued arm — the roadmap explicitly names a pair
  answer as new capability work, first needed by 18b's `quadratic-formula`. Since the
  greater bound is always exactly one more than the lesser, asking for the lesser bound
  alone is a complete, unambiguous answer that needs no new `Answer` shape.
- **`exponent-multiply`/`exponent-divide` answer with the resulting exponent, not the
  resulting power.** Alternatives considered: (a) require the fully evaluated numeric
  product/quotient (e.g. 2³ × 2² = 32) — rejected because it tests arithmetic rather than
  the exponent rule the skill and its blurb ("Add the exponents" / "Subtract the
  exponents") name; (b) require the power in `baseᵉ` form via `expression-input` — rejected
  because that grammar excludes exponents by spec, and extending it is capability work out
  of scope for a content increment. Asking for the exponent alone, with the base fixed and
  shown, tests exactly the rule and stays inside the numeric keypad.
- **`estimate-roots` asks for the bounding integer pair, not a rounded value.** Matches the
  curriculum blurb ("Between which whole numbers") and gives a checkable exact answer
  (`n` and `n+1`) rather than an ambiguous "closest to" judgment.
- **`perfect-squares` is bidirectional (square or square root) within one generator**,
  consistent with how existing Stage D generators vary direction per skill (e.g. Unit 9's
  decimal/fraction conversion pair) rather than splitting into two skills — Unit 12 assigns
  only one manifest id to this content.
- **`evaluate-powers` misconceptions**: multiplying base × exponent (3⁴ → 12), and swapping
  base and exponent (3⁴ → 4³ = 64). Both are arithmetic-distinct from the correct answer for
  every generated base/exponent pair the generator selects (base ≥ 2, exponent ≥ 2, base ≠
  exponent to keep the swap misconception distinct), so neither is dropped by
  `generateProblem`'s answer-collision filtering.

## Risks / Trade-offs

- [Risk] The swap misconception (4³ vs 3⁴) collides with the correct answer when base
  equals exponent (e.g. 4⁴). → Mitigation: the generator excludes base == exponent from its
  operand selection for `evaluate-powers`.
- [Risk] `exponent-multiply`/`exponent-divide` generating an exponent of 0 or negative reads
  oddly without `zero-neg-exponents` content yet shipped. → Mitigation: operand selection
  keeps the resulting exponent ≥ 1, per the spec's "keeps the result's exponent positive"
  requirement.
