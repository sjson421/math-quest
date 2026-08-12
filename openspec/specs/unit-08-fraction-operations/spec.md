# Unit 08 Fraction Operations

## Purpose

Unit 8 introduces fraction arithmetic: adding and subtracting like and unlike fractions,
finding a common denominator, and converting an improper fraction to a mixed number, all
derived from structured displayed data with diagnosable predicted mistakes.

## Requirements

### Requirement: The first six Unit 8 skills are playable as fraction-operation content

The system SHALL generate Stage D Unit 8 skills `add-frac-same-den`, `sub-frac-same-den`,
`common-denominator`, `add-frac-diff-den`, `sub-frac-diff-den`, and `improper-to-mixed` under
their manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements.

`add-frac-same-den` and `sub-frac-same-den` SHALL accept an exact fraction through the
fraction keypad, with the sign key available wherever a predicted mistake is negative.
`common-denominator` SHALL ask for the least common denominator of two displayed proper
fractions as a whole number. `add-frac-diff-den` and `sub-frac-diff-den` SHALL accept an exact
fraction through the fraction keypad and derive their answers over a common denominator.
`improper-to-mixed` SHALL accept a mixed number through the extended keypad and SHALL require
mixed form.

#### Scenario: Each skill uses its intended representation and control

- **WHEN** the six generators are sampled across every difficulty
- **THEN** each problem uses the display and input mode assigned to its concept
- **AND** no problem asks for a capability outside Stage D's existing requirements plus the
  mixed-entry extension

#### Scenario: The increment becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented
- **AND** they follow Unit 7 and precede the six still-planned Unit 8 skills

#### Scenario: The unit's first half is operations, not meaning

- **WHEN** any scoped Unit 8 problem is presented
- **THEN** it asks the learner to add, subtract, find a common denominator, or convert an
  improper fraction
- **AND** it does not ask for multiplication, division, or mixed-number arithmetic

### Requirement: Like-denominator results are derived from both displayed fractions

An `add-frac-same-den` or `sub-frac-same-den` problem SHALL display two proper fractions over
one denominator joined by the operation, and SHALL carry both fractions and the operator so
the exact result is re-derived from the display. The answer SHALL require lowest terms, so a
reducible result receives the existing right-value/wrong-form response.

Every `add-frac-same-den` problem, which is a wall, SHALL retain two distinct diagnosable
arithmetic mistakes after the central answer-collision and duplicate-value filter: adding the
denominators too, and answering with one of the addends. `sub-frac-same-den` SHALL predict
the flipped-order subtraction, whose negative value keeps the sign key on the pad.

#### Scenario: Adding the denominators too is diagnosed

- **WHEN** the learner adds the numerators and the denominators, so `1/5 + 2/5` comes out as
  `3/10`
- **THEN** the submission matches the `adds-denominators` prediction
- **AND** the feedback names the denominator mistake

#### Scenario: An unreduced like-denominator result asks for lowest terms

- **WHEN** the learner enters the right value in a reducible form, such as `4/6` for `2/3`
- **THEN** the value is acknowledged as right without completing the problem
- **AND** the learner is asked to write the answer in lowest terms

### Requirement: Unlike-denominator work asks for the common denominator first

A `common-denominator` problem SHALL display two proper fractions with unequal denominators
and SHALL derive the least common denominator from them as a whole-number answer. The draw
SHALL mix denominator pairs whose LCM is their product with pairs where one divides the
other, so the skill teaches both the product rule and divisibility.

#### Scenario: The least common denominator is the answer

- **WHEN** a `common-denominator` problem displays `1/2` and `1/3`
- **THEN** the answer is `6`
- **AND** a draw with `2/3` and `1/6` answers `6` rather than the product `18`

#### Scenario: A product mistake is diagnosed where it differs

- **WHEN** one denominator divides the other and the learner enters the product
- **THEN** the submission matches the `product-not-lcm` prediction

### Requirement: Unlike-denominator sums and differences are derived over a common denominator

An `add-frac-diff-den` or `sub-frac-diff-den` problem SHALL display two proper fractions over
unequal denominators joined by the operation, SHALL carry both fractions and the operator, and
SHALL derive the exact result over the least common denominator from the display alone. The
answer SHALL require lowest terms.

Every `add-frac-diff-den` problem, which is a major wall, SHALL retain two distinct
diagnosable arithmetic mistakes after the central filter: adding across (numerators and
denominators alike), and converting the denominators while adding the numerators unscaled.
`sub-frac-diff-den` SHALL predict the flipped-order subtraction and adding instead of
subtracting.

#### Scenario: Adding across is diagnosed

- **WHEN** the learner adds numerators and denominators alike, so `1/2 + 1/3` comes out as
  `2/5`
- **THEN** the submission matches the `adds-across` prediction
- **AND** the feedback names the denominator mistake

#### Scenario: Unscaled numerators over a common denominator is diagnosed

- **WHEN** the learner converts the denominators to the LCD but adds the numerators without
  scaling them, so `1/2 + 1/3` comes out as `2/6`
- **THEN** the submission matches the `unscaled-numerators` prediction

#### Scenario: A flipped subtraction is diagnosed

- **WHEN** the learner subtracts in the displayed order's reverse, so `3/4 − 1/3` comes out
  negative
- **THEN** the submission matches the `flipped-order` prediction and can be entered because
  the sign key is available

### Requirement: Improper-to-mixed derives whole and remainder and requires mixed form

An `improper-to-mixed` problem SHALL display an improper fraction and SHALL derive the
mixed-number answer — whole part and proper remainder fraction — from the displayed
numerator and denominator. The answer SHALL require mixed form and lowest terms, so an entry
with the right value typed as an improper fraction receives the new right-value/wrong-form
response asking for mixed form, and a mixed entry that is not reduced receives the
lowest-terms response.

The generator SHALL author two predicted mistakes: the quotient and remainder swapped, and
the quotient paired with the original improper fraction as its remainder. Because this skill
is not a wall, a prediction MAY be removed by the central filter on a draw where its value
collides with the correct answer; both predictions SHALL survive on sampled draws somewhere
across the skill.

#### Scenario: An improper entry is asked for in mixed form

- **WHEN** a learner submits `7/4` for a problem whose answer is `1 3/4`
- **THEN** the learner is told the value is right and asked to write it as a mixed number
- **AND** the worked solution is not shown and the problem does not complete

#### Scenario: An unreduced mixed entry asks for lowest terms

- **WHEN** a learner submits `1 6/8` where the answer is `1 3/4`
- **THEN** the learner is told the value is right and asked for lowest terms
- **AND** the worked solution is not shown

#### Scenario: A mixed entry completes the problem

- **WHEN** a learner submits `1 3/4` where the answer is `1 3/4`
- **THEN** the problem completes with a correct record
