## Context

See `proposal.md` for motivation. Unit 18 currently ends with six expression-answer generators in one module and carries operation-specific `PolynomialData` so the global test suite can rebuild each visible expression and answer. Root-pair input is already exact, unordered, fraction-capable, and deliberately fails independent verification when content supplies no operation data. The existing notation tree already renders and phone-bounds the full nested quadratic formula.

The three new skills span two answer shapes and three presentation needs: a polynomial rewrite, a factored equation, and a supplied formula paired with a generated standard-form equation. They must reuse existing surfaces without turning a content increment into capability work.

## Goals / Non-Goals

**Goals:**

- Keep one Unit 18 source-data union as the authority for visible operands and independently derived answers.
- Produce bounded frames whose correct answers and predicted mistakes remain exact, enterable, and distinct after central normalization.
- Reuse the existing story, equation, math-notation, expression, and root-pair surfaces without a formula-specific rendering path.
- Make difficulty grow through operand size, sign families, and rational roots rather than longer explanations or unsupported algebra.

**Non-Goals:**

- A general quadratic solver or symbolic simplifier.
- Irrational, repeated, or complex roots, or entry of radicals as answers.
- A new notation node, multi-line formula layout, or new lesson input mode.
- Changes to persisted progress, sync, adaptation, manifest membership, or prerequisites.

## Decisions

### Extend Unit 18 operation data across existing display arms

Add three operation-specific arms to `PolynomialData`: one carrying the square root behind a difference of squares, one carrying the two visible factor constants of a zero-product equation, and one carrying standard-form coefficients `a`, `b`, and `c`. Each arm holds visible sources, never a copied answer.

Keep `difference-of-squares` on the existing story-with-polynomial-data path because its answer rewrites the displayed polynomial and must not gain an appended equality. Allow an equation display to carry polynomial data instead of `EquationData` for `solve-by-factoring`, and allow a math display to carry polynomial data instead of fraction, ratio, or power data for `quadratic-formula`. These are mutually exclusive type branches. The existing renderers continue to consume the same equation and notation fields; only exhaustive data consumers gain the polynomial branch.

The independent polynomial builder will rebuild the text, prompt where applicable, structured notation and accessible label, source values, and answer. Root-pair recomputation remains fail-closed unless one of the new operation arms is present, so the existing synthetic tripwire still catches unaudited root-pair content.

Putting the factored equation on the story arm was rejected because it is a mathematical statement with an existing semantic display. Adding the Unit 18 arms to `EquationData` was rejected because it would split one unit's verification and recorded-output contract across two source-data unions. A new quadratic display was rejected because current renderers already cover every required visual.

### Factor a visible difference of squares through exact expression entry

Draw an integer `n` above one and show `x² − n²`. The canonical answer is `(x − n)(x + n)` under degree-two `exact` comparison, which already accepts factor reversal and rejects the displayed expansion. Difficulty raises the bounded magnitude of `n`.

Predict `(x − n)(x − n)` for using the same sign twice and `(x − n²)(x + n²)` for failing to take the square root. The frame bounds make both expressions typable and keep them distinct from the conjugate answer.

Returning roots was rejected because this skill teaches recognition and factorization; the following skill introduces the zero-product step. Choice input was rejected because it tests recognition instead of producing the factors.

### Derive both zero-product roots from visible factors

Draw distinct nonzero factor constants `p` and `q`, excluding `p + q = 0`, and show `(x + p)(x + q) = 0` on the equation display. The exact unordered answer is `−p, −q`. Difficulty moves from positive constants through mixed signs and larger magnitudes while keeping the equation short enough for the installed phone.

Predict `p, q` for copying the constants without solving each factor and `−p, −p` for stopping after one factor. Distinct nonzero constants keep the repeated-root prediction separate; excluding opposite constants prevents the sign-error pair from becoming the correct unordered pair. Keypad signs are enabled whenever any correct or predicted root needs one.

An expanded equation was rejected because it adds factoring work to the skill whose stated concept is the zero-product rule. Two scalar questions were rejected because they would make one equation count as two lesson problems and lose the pair-level diagnosis.

### Construct exact quadratic-formula frames from rational roots

Choose two distinct reduced rational roots `p₁/q₁` and `p₂/q₂`, with positive denominators, then expand `(q₁x − p₁)(q₂x − p₂)` into integer coefficients and divide any common coefficient factor. This guarantees a positive perfect-square discriminant and makes the stated roots independently recoverable from `a`, `b`, and `c`. Constrain frames so `a`, `b`, and `c` are nonzero and `b` is nonzero. Early bands use denominators of one; later bands introduce small denominators and larger coefficients.

Put the generated standard-form equation and the explicit `a`, `b`, `c` mapping in the prompt. Use the existing math display for the supplied general formula, built from the same five notation primitives as its representative fixture. The root-pair keypad enables a fraction slash when either correct root or a reachable prediction is fractional. This keeps substitution as the learner's work while the formula remains visible and phone-sized.

Predict the exact pair produced by using `b` instead of `−b`, and the pair produced by dividing by `a` instead of `2a`. Nonzero `b` prevents the first from becoming the correct unordered pair; nonzero roots keep the denominator error wrong. Reject any frame where the two predictions normalize to the same unordered pair.

Generating arbitrary coefficients and filtering for square discriminants was rejected because it wastes seeded draws and obscures difficulty control. Showing only a pre-substituted formula was rejected because it removes the substitution skill. Plain slash text was rejected because the installed notation capability exists for this nested formula.

### Update exhaustive gates and governing status together

Register the three generators after `factor-trinomial`, extend recorded output and the independent verifier exhaustively, add focused generator tests plus independent global recomputation, and update Stage F coverage from 165 to 168 playable skills with five Unit 19 skills planned.

Mark the three curriculum rows playable, update the roadmap header and 18b increment while leaving item 23 unchecked, and update current governing counts that would otherwise mislead the implementation session. The Unit 18 baseline requirement whose scenario freezes 18b as planned is retired in favor of a completed-unit successor. The curriculum-manifest capability requirement is restated in full with only its root-pair consumer scenario advanced, avoiding dropped scenarios during archive.

## Risks / Trade-offs

- **[Risk] Widening equation and math display data breaks an exhaustive consumer** → Use mutually exclusive union branches and update recorded output, source-value measurement, coverage fixtures, and independent verification in the same task; keep the no-data root-pair tripwire.
- **[Risk] A root-pair misconception equals the answer after sign or order normalization** → Constrain source frames before problem creation and assert answer exclusion, pairwise distinction, and diagnosis over sampled seeds.
- **[Risk] Rational-root construction silently carries a reducible coefficient triple** → Normalize the expanded coefficients and independently recover roots from the displayed `a`, `b`, and `c` in focused tests.
- **[Risk] The prompt, formula, and answer disagree** → Build and verify all three from the same operation data, including exact prompt and accessible-label checks.
- **[Risk] The supplied formula plus two fraction slots and keypad exceed the phone lesson height** → Cover the longest static presentation and validate a representative signed-fraction problem in the real app at 375 pixels.
- **[Trade-off] Quadratic-formula problems exclude irrational and repeated roots** → This keeps answers exact on the shipped input surface; those root families remain explicit non-goals rather than being approximated or hidden behind choices.

## Migration Plan

Ship the source-data branches, three generators, tests, registration, and governing status updates as one content change. No stored-data migration is needed. Rollback removes the implementation commit; existing progress and the already-shipped root-pair capability remain valid.
