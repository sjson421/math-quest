## Context

See proposal.md — Why. The shipped expression path already has the right answer kind, input
mode, recursive-descent AST, comparison forms, and keypad component. Its deliberate degree-one
gate is the only capability boundary Unit 18a crosses. The baseline also requires the pad and
entry logic to read one declaration, and existing linear generators currently repeat their
variable in both `Problem.answer` and `Problem.expression`.

The implementation must preserve the structural meaning of `exact`, the fail-closed
`unparseable` result, browser-only app types, no new dependency, and a usable layout at the
installed 375px width.

## Goals / Non-Goals

**Goals:**

- Extend the existing parser and both comparison forms through degree two without changing
  default linear behavior.
- Make one expression-answer declaration own the variable and maximum degree used by the
  checker, keypad, entry rules, and recorded output.
- Give quadratic problems conventional square entry without adding a general power grammar.

**Non-Goals:**

- Evaluating expressions at a variable value or building a general symbolic algebra system.
- Supporting degree three or higher, arbitrary superscripts, caret syntax, explicit
  multiplication signs, multiple variables, decimals, or division.
- Adding Unit 18 structured display data, generators, misconceptions, or content tests.

## Decisions

**Extend the existing expression capability rather than add a new mode.** Stage F already
requires `expression-input`, and the current AST and answer forms express the required
semantics. A second quadratic mode would duplicate lesson routing, entry echo, diagnosis,
and recorded-output behavior without creating a distinct learner interaction.

**Use the expression answer as the single grammar declaration.** Add an optional
`maxDegree: 2` to the existing expression `Answer`; omission means degree one. The lesson
shall derive the keypad's variable and maximum degree from that answer, and the redundant
`Problem.expression` object shall be removed. A shared type can name the declaration, but
the runtime value must have one owner. Keeping parallel answer and keypad declarations was
rejected because their variable or degree could disagree even if their TypeScript shapes
matched.

**Represent expanded expressions as bounded coefficient vectors.** Replace the linear
`{ constant, coeff }` evaluator with a polynomial coefficient vector covering degrees zero,
one, and two. Addition negates or adds coefficients by degree; multiplication convolves the
vectors and fails as soon as a nonzero coefficient would land above the declared maximum.
This preserves exact integer arithmetic and extends the current normalizer directly. A
string-rewrite approach was rejected because distribution, nested parentheses, signs, and
like-term collection are already the reasons the parser uses an AST.

The evaluator shall reject an out-of-range intermediate before later cancellation. Silently
reducing an authored degree-three expression to degree two or below would accept grammar the
problem did not declare and make malformed work look valid.

**Add one bounded square token, not a general exponent node.** Tokenize `²` only when it
immediately follows the declared variable in a degree-two grammar, representing that square
as a dedicated AST node. Keep caret syntax and repeated-variable `xx` invalid. Products such
as `x(x + 1)` and `(x + 1)(x + 2)` remain ordinary juxtaposition in the existing AST and are
accepted when their evaluated degree stays in range. A general exponent parser or CAS was
rejected because Unit 18a needs only a variable square and the repository intentionally kept
Unit 12 exponent answers numeric.

**Keep exact serialization structural while extending its degree gate.** Both forms first
evaluate the AST against the declared maximum degree. `expanded` serializes the quadratic,
linear, and constant coefficients in descending degree with existing coefficient and sign
conventions. `exact` continues to sort sum terms and product factors while preserving nested
grouping; the new square node has its own stable serialization. Thus reversed binomial
factors compare equal, but a factored quadratic and its expansion do not.

**Reserve a stable keypad cell for the superscript-two key.** Keep the four-column keypad
and its current digit, operator, parenthesis, variable, and backspace positions. Use the
first cell of the final row for `²` on degree-two problems and a non-interactive spacer on
linear problems; let Check span the remaining three cells. The key is accepted only after
the declared variable and emits the same Unicode character the parser recognizes. A fifth
column was rejected because it narrows every key at 375px, and an added full row was rejected
because it increases lesson height.

**Update the roadmap before content follows.** The implementation shall insert this
prerequisite before 18a, change item 23 from six changes to seven, and keep all Unit 18 rows
planned. This makes the next preparation run select the six-generator 18a content against an
honest dependency record.

## Risks / Trade-offs

- **[Risk] Polynomial multiplication accidentally accepts a higher-degree expression after
  cancellation** → Fail during each convolution that would create a nonzero coefficient
  above the declared bound, and pin cancellation cases in parser and checker tests.
- **[Risk] Exact comparison loses factor grouping while adding the square node** → Preserve
  the current structural serializer and add tests for reversed factors, regrouping, and
  factored-versus-expanded quadratics.
- **[Risk] Linear consumers change behavior** → Make degree two opt-in, migrate them only by
  removing the redundant `Problem.expression` field, and rerun all existing expression,
  answer, generator, recorded-output, and component tests.
- **[Risk] The narrower Check control or a longer quadratic entry does not fit on a phone** →
  render the real expression surface at 375px, enter representative expanded and factored
  answers, and inspect the keypad and answer slot before completing the change.

## Migration Plan

This is an additive answer-contract change plus removal of an unstored duplicate field.
Existing generator answers omit `maxDegree` and remain linear. Update their fixtures and
recorded-output derivation to use the answer-owned variable, then add the optional quadratic
path. No progress or sync migration is needed because generated `Problem` objects are
session-local and are not persisted.

Rollback restores the redundant problem field and degree-one evaluator/keypad. No stored
data or manifest capability flag needs reversal.
