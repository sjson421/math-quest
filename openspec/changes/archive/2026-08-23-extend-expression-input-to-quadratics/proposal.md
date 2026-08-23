## Why

Roadmap item 23 says Unit 18a answers with expressions, but the shipped expression-input
grammar deliberately rejects every expression above degree one. Adding, multiplying, and
factoring polynomials therefore cannot use the required answer surface until that shared
capability accepts conventional quadratic notation.

## What Changes

- Keep linear expression entry as the default and let an expression problem opt into a
  maximum degree of two.
- Make the expression `Answer` the single runtime owner of its variable and degree, removing
  the parallel `Problem.expression` declaration.
- Offer a superscript-two key only on degree-two expression problems, and make the same
  declaration govern the key set, parser, and answer checker.
- Extend expanded canonicalization through quadratic terms while preserving exact-form
  grouping for factored expressions.
- Keep malformed or out-of-scope expressions distinct from wrong answers, including higher
  powers, extra variables, division, decimals, and repeated-variable `xx` notation.
- Update roadmap item 23 to record this prerequisite before increment 18a and correct the
  item's change count.

This change is tooling-only. It adds no generators and ships none of the six Unit 18a skill
ids: `add-polynomials`, `sub-polynomials`, `mult-monomial`, `foil`, `factor-gcf-poly`, or
`factor-trinomial`.

## Capabilities

### New Capabilities

None. Stage F already requires the shipped `expression-input` capability.

### Modified Capabilities

- `expression-input`: Add a declared degree-two grammar and quadratic canonical comparison
  while preserving the existing linear default and comparison forms.
- `answer-entry`: Offer and accept the square key only when the current expression problem
  declares degree-two entry.

## Non-goals

- No Unit 18 generator, curriculum completion marker, playable-count change, or manifest
  capability change.
- No general exponent grammar, multiplication key, second variable, decimal coefficient,
  division, rational expression, computer algebra system, or new input mode.
- No root-pair answer shape for `quadratic-formula`; that remains increment 18b's first
  decision.

## Impact

The change affects the expression answer declaration, expression parser and canonicalizer,
answer checking, expression keypad rules and layout, focused component and library tests,
and roadmap wording. It preserves stored progress and sync payloads, adds no dependency, and
does not change stage availability.
