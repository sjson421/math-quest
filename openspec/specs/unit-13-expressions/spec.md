# unit-13-expressions Specification

## Purpose

Unit 13a teaches what a variable is, evaluating and translating expressions, spotting like
terms, and combining/distributing, as the first content to consume `expression-input`.

## Requirements

### Requirement: The first six Unit 13 skills are playable as expression content

The system SHALL generate six Unit 13 skills — `variable-meaning`, `evaluate-expression`,
`words-to-expression`, `identify-like-terms`, `combine-like-terms`, and `distributive` —
under their manifest ids. Each SHALL satisfy the existing determinism, computed-answer,
measurable difficulty, variety, agreement, and content requirements using only Stage E's
available capabilities.

#### Scenario: Increment 13a leaves Unit 13 incomplete in curriculum order

- **WHEN** the six increment 13a generators are registered
- **THEN** `variable-meaning` through `distributive` resolve as implemented in manifest order
- **AND** `distribute-negative` and `factor-gcf` remain planned
- **AND** roadmap item 21 remains open for its remaining increments

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
