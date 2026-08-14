## MODIFIED Requirements

### Requirement: An expression answer declares its comparison form

An expression `Answer` SHALL declare a comparison form of `expanded` or `exact`. Under
`expanded`, an entry is correct when it is algebraically equal to the canonical answer after
fully distributing and combining like terms — so `2(x + 1)` and `2x + 2` are the same answer.
Under `exact`, an entry is correct only when it matches the canonical answer's structure
(the same grouping into a sum of a coefficient-times-parenthesized-factor versus a fully
distributed sum), so a factored and an expanded form of the same value are different answers.

Under `exact`, two entries SHALL compare equal only when they differ by the order of a sum's
terms or a product's factors. Differing in how the expression is grouped SHALL compare
unequal, whatever the nesting depth: a product of a number and a sum is never the same
answer as a sum containing that product.

The comparison form SHALL be a property of the answer the generator produces, not of a
per-skill checker, so the same comparison mechanism serves every skill.

#### Scenario: Expanded form accepts a re-ordered sum

- **WHEN** the canonical answer is `2x + 3` and the form is `expanded`
- **THEN** an entry of `3 + 2x` is correct

#### Scenario: Expanded form accepts an undistributed equivalent

- **WHEN** the canonical answer is `2x + 2` and the form is `expanded`
- **THEN** an entry of `2(x + 1)` is correct

#### Scenario: Exact form rejects a differently-structured equivalent

- **WHEN** the canonical answer is `2(x + 1)` and the form is `exact`
- **THEN** an entry of `2x + 2` is incorrect, distinct from an unparseable or blank entry

#### Scenario: Exact form accepts the same structure differently ordered

- **WHEN** the canonical answer is `2x + 2` and the form is `exact`
- **THEN** an entry of `2 + 2x` is correct

#### Scenario: Exact form rejects a regrouping that reuses the same numbers

- **WHEN** the canonical answer is `3(x + 4)` and the form is `exact`
- **THEN** an entry of `3(4) + x` is incorrect, because the grouping differs even though
  both entries name the same numbers in the same order
