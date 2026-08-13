# expression-input Specification

## Purpose

Lets a problem ask for a single-variable integer expression as its answer, and decide
whether two differently-written expressions count as the same answer.

## Requirements

### Requirement: A problem declares its expression grammar

A problem asking for an expression answer SHALL declare the single variable letter its
answer uses. The accepted grammar SHALL be limited to: integer coefficients, that variable,
infix `+` and `−`, unary `−`, parentheses, and implicit multiplication by juxtaposition
(e.g. `2x`). Exponents, additional variables, and division SHALL NOT be accepted.

#### Scenario: A declared letter is accepted

- **WHEN** a problem declares the variable `x`
- **THEN** an entry using `x` may be parsed
- **AND** an entry using any other letter is rejected as unparseable

#### Scenario: An out-of-grammar entry is rejected

- **WHEN** an entry contains an exponent, a second variable letter, or a division
- **THEN** the entry is rejected as unparseable rather than partially interpreted

### Requirement: An expression answer declares its comparison form

An expression `Answer` SHALL declare a comparison form of `expanded` or `exact`. Under
`expanded`, an entry is correct when it is algebraically equal to the canonical answer after
fully distributing and combining like terms — so `2(x + 1)` and `2x + 2` are the same answer.
Under `exact`, an entry is correct only when it matches the canonical answer's structure
(the same grouping into a sum of a coefficient-times-parenthesized-factor versus a fully
distributed sum), so a factored and an expanded form of the same value are different answers.

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

### Requirement: An unparseable expression entry is not a wrong answer

An entry that does not parse under the declared grammar SHALL be reported distinctly from an
entry that parses but is mathematically wrong, matching how a malformed numeric entry is
already distinguished from an incorrect one.

#### Scenario: A malformed entry is reported as unparseable

- **WHEN** an entry has unbalanced parentheses or a dangling operator
- **THEN** it is reported as unparseable
- **AND** it is not counted as an incorrect attempt
