## Context

See proposal.md — Why. The prerequisite change already gave expression answers an opt-in degree-two grammar, `x²` entry, expanded polynomial canonicalization, and exact structural comparison. Unit 18a therefore needs content, not a new input capability.

Three existing contracts shape the implementation. Generated answers must be independently derivable from structured visible-source data; text predictions for expression answers are not centrally removed when algebraically equal to the answer; and the installed 375-pixel layout currently bounds `inline` source text at 18 characters. A complete addition or subtraction of two trinomials exceeds that bound before the learner types the answer.

## Goals / Non-Goals

**Goals:**

- Ship six generators with independently checked quadratic arithmetic and factoring.
- Keep every authored expression conventional, enterable, and readable on the installed phone width.
- Make the two Unit 18a walls diagnose distinct mistakes that a learner can actually submit.

**Non-Goals:**

- No wider expression grammar, answer union, input mode, or Stage F capability.
- No non-monic trinomial factoring, zero-product solving, root pairs, or quadratic-formula work.
- No parsing learner-facing display strings in the shared verification sweep.

## Decisions

### Use the existing degree-two expression answer in two comparison forms

Every scoped answer declares `{ kind: 'expression', variable: 'x', maxDegree: 2 }`. Addition, subtraction, monomial multiplication, and FOIL use `form: 'expanded'`, so an algebraically equivalent distributed form is accepted. Greatest-common-factor and trinomial factoring use `form: 'exact'`, so returning the displayed expansion is wrong while reordered factors remain correct.

A separate polynomial input mode or general power grammar was rejected because the shipped expression answer already accepts every character and equivalence these six skills require.

### Keep polynomial source data separate from Unit 13 algebra data

Add a closed `PolynomialData` union and a named coefficient record `{ quadratic, linear, constant }`. Its operations carry only visible sources:

- add/subtract: the two source coefficient records
- monomial multiplication: the outer numeric coefficient and the inner linear coefficients, with the visible outer `x` fixed by the operation
- FOIL: the two visible signed constants in monic binomials
- common-factor factoring: the displayed quadratic and linear coefficients
- trinomial factoring: the displayed linear and constant coefficients

The shared verifier independently adds, subtracts, distributes, multiplies, takes a greatest common factor, or searches integer factor pairs. In particular, factoring payloads do not carry an opaque answer string. The same exhaustive switch supplies recorded output, learner-text collection, and source-magnitude evidence.

Extending `AlgebraData` was rejected because its arms describe Unit 13 substitution and linear rewriting; a separate union makes a Unit 18 operation impossible to handle as a superficially similar linear case.

### Use an unframed rewrite display for complete polynomial sources

All six tasks ask for a rewriting of the shown expression, the same semantic case that already uses the unframed `story` display for `words-to-expression`. Use that existing display arm with `PolynomialData`, keep the polynomial source at reading size so it can wrap between spaced terms, and give expression-mode story slots an explicit bounded size instead of inheriting the numeric `text-6xl` wrapper.

The ordinary `inline` row was rejected because it is intentionally `whitespace-nowrap` and measured only through 18 source characters plus its live slot. Narrowing addition and subtraction enough to fit would remove terms needed to prove that equal degrees, not positions, are combined. A new polynomial display arm was rejected because the existing unframed source-above-answer layout has the required interaction and responsive behavior; this change only corrects its expression sizing.

### Centralize conventional polynomial writing inside the unit

Use one generator-side formatter for named coefficients in descending degree. It omits zero terms, writes coefficient magnitudes of one as `x²` or `x`, places spaces around learner-facing operators, and uses typographic minus on screen. Answers and predictions use the same mathematical conventions but emit the pad's accepted compact characters. The independent verifier implements its own formatter from source records so sharing a formatting bug cannot make a wrong answer pass.

### Constrain arithmetic draws around the intended mistake

Addition and subtraction draw positive source coefficients from difficulty bands. Subtraction draws both orderings as difficulty rises, so negative result terms become possible while the operation remains the only sign abstraction. Its two required predictions are:

| tag | mistake |
| --- | --- |
| `subtracted-first-term-only` | subtract the quadratic term but add the remaining terms |
| `added-polynomials` | add every coefficient of the second polynomial |

`mult-monomial` draws `kx(ax + b)` and predicts distributing to only the first term and multiplying coefficients without carrying the second `x` into `x²`. `foil` draws signed monic binomials across the ladder and predicts keeping only the first and last products and multiplying the two constants into the middle coefficient. Coefficient bands and sign families expand with difficulty; focused tests prove every family appears and source magnitude rises.

### Derive exact factorizations from constrained visible coefficients

For `factor-gcf-poly`, draw displayed coefficients `gm` and `gn` with `g > 1` and `gcd(m, n) = 1`. The answer is `gx(mx + n)`. Predictions include the unchanged expansion, factoring out `g` but not the shared `x`, and dividing only one coefficient. The coprime inner pair makes `g` the unique greatest numeric factor.

For the `factor-trinomial` wall, use a bounded table of integer operand frames. Each frame names a correct unordered pair, a different pair with the same product, and a different pair with the same sum. Apply positive, both-negative, and opposite-sign families across difficulty. The visible trinomial carries only the correct sum and product; the verifier searches the bounded integer domain and derives the unique pair independently. The two required predictions are:

| tag | mistake |
| --- | --- |
| `matched-product-only` | choose the alternate pair with the right product and wrong sum |
| `matched-sum-only` | choose the alternate pair with the right sum and wrong product |

Non-monic trinomials were rejected because they introduce the ac-method procedure, while the roadmap names the factor-pair search itself as this wall. Arbitrary random pairs were rejected because they cannot guarantee two distinct, reachable wrong pairs after answer comparison and deduplication.

### Test each generator at its ownership boundary

The focused Unit 18 suite parses or reads every visible source independently, recomputes the result, asserts answer form and degree, checks difficulty and family coverage, and replays every prediction through the expression pad before checking it is wrong and diagnosable. The shared generator sweep adds exhaustive `PolynomialData` handling, while recorded snapshots make wording and source operands reviewable. Browser validation uses the widest addition/subtraction source and both exact factoring answers at 375 pixels.

## Risks / Trade-offs

- **[Risk] A text prediction is algebraically correct even though its string differs from the canonical answer** → Run every prediction through `checkAnswer`, the degree-two keypad, and `diagnose` in focused tests.
- **[Risk] Signed factor frames collapse two predictions or admit a second correct factorization** → Store pre-validated correct/product-only/sum-only frames, test each frame directly, and independently search the displayed sum/product.
- **[Risk] Long source or answer text overflows despite the unframed layout** → Add first-paint coverage and exercise the widest generated cases in the real app at 375 pixels with a full live entry.
- **[Risk] A new structured operation is omitted from a quiet fallback** → Add exhaustive cases to verification, recorded output, learner-text collection, and source magnitude, plus a synthetic failure case where applicable.
- **[Trade-off] The first trinomial factoring content is monic only** → This keeps the lesson on the roadmap's product-and-sum search; non-monic factoring remains outside the mapped course rather than arriving as undeclared procedure.

## Migration Plan

This is additive generated content. Registering the six generators changes their derived state from planned to implemented; no stored progress or sync payload changes. Rollback removes the registration, module, display-data arms, and presentation adjustment, returning the skills to planned without migrating learner data.
