# unit-13-expressions Specification

## Purpose

Unit 13 teaches what a variable is, evaluating and translating expressions, spotting like
terms, combining them, distributing across a sign, and factoring a common factor back out,
as the first content to consume `expression-input` and the first to need its `exact`
comparison form.

## Requirements

### Requirement: Variable meaning and expression evaluation answer numerically

A `variable-meaning` problem SHALL substitute a given value into a one-term expression and
require the resulting number through the existing numeric keypad. An `evaluate-expression`
problem SHALL substitute a given value into a multi-term expression and require the
resulting number the same way, distinct from `variable-meaning` by the number of terms
substituted rather than by input shape.

#### Scenario: A one-term substitution is evaluated

- **WHEN** a `variable-meaning` problem substitutes `x = 4` into `3x`
- **THEN** the exact answer is 12

#### Scenario: A multi-term substitution is evaluated

- **WHEN** an `evaluate-expression` problem substitutes `x = 4` into `3x + 2`
- **THEN** the exact answer is 14

### Requirement: Words-to-expression translates a phrase and predicts order reversal

A `words-to-expression` problem SHALL display a phrase naming an operation on a variable and
require the matching expression through `inputMode: 'expression'` with comparison form
`expanded`. As a wall, it SHALL predict at least two distinct misconceptions that survive
`generateProblem`'s answer-collision and dedup filtering, including the operand-order
reversal that occurs when a "less than" or "subtracted from" phrase is translated left to
right instead of reversed.

#### Scenario: A "less than" phrase reverses order in the correct answer

- **WHEN** a problem displays "5 less than a number"
- **THEN** the exact answer is `x - 5`
- **AND** a predicted misconception is the reversed form `5 - x`

### Requirement: Like terms are identified by matching variable letter

An `identify-like-terms` problem SHALL display a target term and a set of choices — one
sharing the target's variable letter, one using a different variable letter, and one a plain
constant with no variable — and require selecting the choice that shares the target's
variable letter, through the existing choice input.

#### Scenario: A matching variable letter is the correct choice

- **WHEN** the target term is `3x` and the choices include `5x`, `5y`, and `9`
- **THEN** `5x` is the correct choice

### Requirement: Combining like terms and distributing answer as an expanded expression

A `combine-like-terms` problem SHALL display a sum of two terms in the declared variable
plus a constant and require their combined form through `inputMode: 'expression'` with
comparison form `expanded` — keeping within the grammar's single-variable limit, the
"unlike terms" being combined are the variable terms and the constant, not two different
variable letters. A `distributive` problem SHALL display a coefficient applied to a
parenthesized sum of the variable and a constant and require the distributed form the same
way. Each, as a wall, SHALL predict at least two distinct surviving misconceptions:
`combine-like-terms` including the value produced by folding the constant into the
variable term's coefficient, and `distributive` including the value produced by
distributing to only the first term inside the parentheses.

#### Scenario: Combining like terms predicts the constant folded into the coefficient

- **WHEN** a problem displays `3x + 2x + 4`
- **THEN** the exact answer is `5x + 4`
- **AND** a predicted misconception folds the constant into the coefficient, e.g. `9x`

#### Scenario: Distributing predicts a first-term-only miss

- **WHEN** a problem displays `3(x + 4)`
- **THEN** the exact answer is `3x + 12`
- **AND** a predicted misconception distributes only to the first term, e.g. `3x + 4`

#### Scenario: An undistributed equivalent is accepted for distributive

- **WHEN** the canonical answer to a `distributive` problem is `3x + 12`
- **AND** the comparison form is `expanded`
- **THEN** an entry of `3(x + 4)` is also correct, since factoring is not this skill's point

### Requirement: All eight Unit 13 skills are playable as expression content

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
