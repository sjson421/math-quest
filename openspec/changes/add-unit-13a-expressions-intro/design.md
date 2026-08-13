## Context

`unit-12-exponents-roots.ts` is the template: `defineSkill`/`band`/`Ladder` helpers from
`./engine`, `intAnswer` for numeric answers, and per-problem `misconceptions` for walls. The
`expression-input` capability (`src/lib/expression.ts`, `src/lib/answer.ts`) already
implements parsing and `expanded`/`exact` canonical-form comparison; `Problem.inputMode`
already includes `'expression'` and `ProblemView`/`ExpressionKeypad` already render it
(item 20b). No prior generator has used `kind: 'expression'` yet — see proposal.md.

## Goals / Non-Goals

**Goals:**
- Ship six Unit 13a generators with content-rules-compliant walls.
- Exercise `inputMode: 'expression'` end-to-end in the real app for the first time,
  confirming the variable-key pad and canonical comparison work for actual content rather
  than only the component's own tests.

**Non-Goals:**
- No change to `expression-input`, `math-notation`, or any other capability's behavior.
- No `'exact'`-form expression skill; that is `factor-gcf` (13.8, increment 13b).

## Decisions

- **`variable-meaning` vs `evaluate-expression` split by term count, not input shape.**
  Both substitute a value and answer numerically via the keypad. Distinguishing them by
  degree (one term vs. several) rather than by a different answer type keeps
  `variable-meaning` a genuine `quick` on-ramp (5-correct) while `evaluate-expression`
  covers the general case. Alternative considered: give `variable-meaning` a choice-input
  "what does the letter represent" conceptual question instead of a numeric one — rejected
  because it would test vocabulary rather than the substitution skill the curriculum row
  ("A letter is a number") names, and every other Unit 13 skill after it assumes
  substitution is already understood.

- **`identify-like-terms` uses choice input, not expression input.** The skill's operation —
  recognizing whether two terms share a variable part — has no numeric or expression-shaped
  answer; the learner points at the matching term. This mirrors `name-parts` (7.3) and
  `compare-decimals` (9.3), the existing precedent for a choice-input content skill in a
  keypad-heavy unit.

- **`words-to-expression`, `combine-like-terms`, `distributive` all use `form: 'expanded'`.**
  Confirmed by the roadmap's own item 20a note (these three, plus `distribute-negative`,
  are the walls that "answer with an expression") and by 12b's design record that `2(x + 1)`
  and `2x + 2` are one answer at 13.6. `'exact'` is reserved for `factor-gcf` (13.8), where
  distinguishing factored from expanded form is the entire point — out of scope here.

- **`AlgebraData` carries source operands for every `inline` display this change adds,
  mirroring `PowerData`.** Implementation surfaced an artifact assumption the proposal
  missed: `generators.test.ts`'s shared `recompute()`/`sourceMagnitude()` sweep treats any
  `inline` display without a structured payload as plain arithmetic text, fed to a
  numeric-only expression evaluator — which cannot parse a variable letter. Every other
  built skill already carries a payload (`WholeNumberData`, `DecimalData`, `FractionData`,
  `RatioData`, `PowerData`) for exactly this reason; Unit 13a's `inline` displays are the
  first to show a variable, so they needed the same treatment. Alternative considered:
  parse the displayed text back into operands with a regex in the shared sweep, matching
  what `unit-13-expressions.test.ts`'s own per-skill tests do — rejected for the *shared*
  sweep specifically, because that file already establishes structured-payload
  verification as the house style for every other unit, and a second style (regex-parsing
  learner text) for only Unit 13 would be a second, quietly diverging convention the next
  content change would have to guess between.

- **Wall misconceptions are produced as already-expanded strings, not re-parsed.** Each wall
  generator computes its misconception directly in the shape a learner's error would
  produce (e.g., the reversed-order string for `words-to-expression`), matching how
  `evaluate-powers` (Unit 12) computes misconception values arithmetically rather than by
  mutating its own answer.

## Risks / Trade-offs

- [Risk] First real content through `ExpressionKeypad` could surface a UX or grammar gap
  the component's own tests didn't (e.g. entering `x` without a coefficient, or a leading
  `-x`) → Mitigation: task list ends with real-app browser validation per
  docs/environment.md specifically exercising all three expression-input skills, not just
  automated tests.
- [Risk] `identify-like-terms` choices could accidentally collide in value or label,
  producing an ambiguous or duplicate-looking choice set → Mitigation: constrain generated
  choices' coefficients/variables so labels are always visually distinct, verified by a
  generator test asserting choice uniqueness.
