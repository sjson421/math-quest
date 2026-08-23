## 1. Expression grammar declaration

- [x] 1.1 Add the optional degree-two bound to expression answers, keep omission equivalent
  to degree one, remove `Problem.expression` from the `Problem` type and recorded-output key
  registry, and make lesson routing plus recorded output read and state the answer-owned
  variable and bound (under 2 hours)
- [x] 1.2 Remove the redundant `Problem.expression` declarations from existing Unit 13, 14,
  and 16 generators and update their focused fixtures and assertions without changing
  generated learner content (under 2 hours)

## 2. Bounded quadratic canonicalization

- [x] 2.1 Extend the tokenizer and AST with the declared variable's Unicode square, reject
  caret powers and `xx`, and replace linear evaluation with coefficient-vector addition,
  negation, and bounded multiplication through degree two (under 2 hours)
- [x] 2.2 Extend expanded serialization and tests for quadratic term order, coefficients,
  signs, distribution, like-term collection, and equivalent expanded/factored forms while
  pinning every existing linear result; independently assert concrete canonical strings such
  as `(x + 2)(x + 3)` producing `x²+5x+6` instead of only comparing two calls through the
  same normalizer (under 2 hours)
- [x] 2.3 Extend exact serialization and tests for reversed binomial factors, nested grouping,
  square structure, factored-versus-expanded rejection, malformed syntax, and fail-closed
  higher-degree intermediates including later cancellation, with fixed expected structures
  derived independently from the serializer (under 2 hours)
- [x] 2.4 Pass the answer's declared bound through `checkAnswer` and add answer tests for
  correct expanded quadratics, correct exact factorizations, wrong structure, the linear
  default, and unparseable out-of-bound entries against concrete authored canonical answers
  rather than self-derived expected values (under 2 hours)

## 3. Degree-two keypad

- [x] 3.1 Extend `applyExpressionKey` with the same degree declaration, accepting `²` only
  directly after the declared variable for degree-two entry and refusing it everywhere else,
  with focused pure-function tests (under 2 hours)
- [x] 3.2 Reserve the final-row square cell in `ExpressionKeypad`, render a non-interactive
  spacer for linear problems and the accessible `²` key for degree-two problems, keep Check
  in the same three-column position, and update first-paint component coverage (under 2 hours)

## 4. Documentation and verification

- [x] 4.1 Update roadmap item 23 to list seven changes and record the quadratic expression
  prerequisite before 18a while leaving every Unit 18 skill planned and the item unchecked
  (under 2 hours)
- [x] 4.2 Run the focused expression, answer, keypad, component, recorded-output, and Unit 13,
  14, and 16 suites, then run `openspec validate --strict`, `npm test`, `npm run build`, and
  `npm run lint`; retain only documented pre-existing warnings (under 2 hours)
- [x] 4.3 Temporarily mount a synthetic degree-two expression problem in the real app and use
  `docs/environment.md` at 375px to enter and submit `x² + 5x + 6` and `(x + 2)(x + 3)` under
  their respective forms; inspect the keypad, square entry, answer-slot fit, accepted results,
  and a rejected higher-degree entry; remove the fixture, rerun the build, stop the server,
  and confirm its port is free (under 2 hours)
