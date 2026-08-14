## MODIFIED Requirements

### Requirement: The first six Unit 13 skills are playable as expression content

The system SHALL generate all eight Unit 13 skills, from `variable-meaning` through
`factor-gcf`, under their manifest ids. Each SHALL satisfy the existing determinism,
computed-answer, measurable difficulty, variety, agreement, and content requirements using
only Stage E's available capabilities.

No scoped problem SHALL write a coefficient of one — a term with coefficient one is written
`x`, never `1x`, in its display, its answer, its solution steps, and its predicted
misconceptions alike. Under the `exact` comparison form `1x` and `x` are different answers,
so an answer authored with an explicit one would grade a learner's natural entry wrong.

#### Scenario: Increment 13b completes Unit 13 in curriculum order

- **WHEN** the two increment 13b generators are registered after the six increment 13a
  generators
- **THEN** all eight Unit 13 skills resolve as implemented in manifest order
- **AND** no Unit 13 skill remains planned
- **AND** roadmap item 21 remains open for its Units 14–15 increments

## ADDED Requirements

### Requirement: Distributing a negative answers as an expanded expression and predicts sign errors

A `distribute-negative` problem SHALL display a negative coefficient applied to a
parenthesized sum or difference of the declared variable and a constant, and require the
distributed form through `inputMode: 'expression'` with comparison form `expanded`. Its
answer SHALL have a negative variable term, so the entry begins with a unary minus. The
coefficient drawn SHALL be at least two, since a coefficient of one collapses two of the
predicted mistakes into the same value.

As the unit's major wall it SHALL predict at least two distinct misconceptions that survive
`generateProblem`'s dedup filtering, including the second term's sign left unflipped — the
mistake the skill exists to name. No predicted misconception SHALL equal the problem's own
canonical answer, which an expression answer is not centrally protected from.

#### Scenario: A negative distributed across a difference flips the second sign

- **WHEN** a problem displays `−3(x − 4)`
- **THEN** the exact answer is `-3x + 12`
- **AND** a predicted misconception leaves the second term's sign unflipped, `-3x - 12`

#### Scenario: A negative distributed across a sum keeps the second term negative

- **WHEN** a problem displays `−3(x + 4)`
- **THEN** the exact answer is `-3x - 12`

#### Scenario: Only the first term is multiplied

- **WHEN** a problem displays `−3(x − 4)`
- **THEN** a predicted misconception multiplies only the variable term, `-3x - 4`

### Requirement: Factoring out a greatest common factor answers as an exact factored form

A `factor-gcf` problem SHALL display a sum of a variable term and a constant whose
coefficients share a greatest common factor above one, and require the factored form —
that common factor outside a parenthesized sum — through `inputMode: 'expression'` with
comparison form `exact`. The displayed expanded sum SHALL therefore be judged incorrect
rather than correct, since undoing the distribution is the whole skill.

The factor drawn SHALL be the greatest common factor of the two displayed coefficients, so
exactly one factored answer is correct. A factoring by a smaller shared factor above one
SHALL be a predicted misconception, and no predicted misconception SHALL equal the canonical
answer.

#### Scenario: The greatest common factor is taken outside

- **WHEN** a problem displays `6x + 9`
- **THEN** the exact answer is `3(2x + 3)`

#### Scenario: A remaining coefficient of one is not written

- **WHEN** a problem displays `3x + 12`
- **THEN** the exact answer is `3(x + 4)`, not `3(1x + 4)`

#### Scenario: The expanded form the learner was shown is not an answer

- **WHEN** the canonical answer to a `factor-gcf` problem is `3(2x + 3)`
- **THEN** an entry of `6x + 9` is incorrect, distinct from an unparseable or blank entry

#### Scenario: A re-ordered factored form is still accepted

- **WHEN** the canonical answer to a `factor-gcf` problem is `3(2x + 3)`
- **THEN** an entry of `3(3 + 2x)` is correct

#### Scenario: Factoring by a smaller shared factor is diagnosed

- **WHEN** a problem displays `12x + 18` and the greatest common factor is 6
- **THEN** a predicted misconception factors by a smaller shared factor above one, e.g.
  `2(6x + 9)`
