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

### Requirement: The final six Unit 8 skills are playable as fraction-operation content

The system SHALL generate Stage D Unit 8 skills `mixed-to-improper`, `add-mixed`,
`sub-mixed`, `mult-fractions`, `div-fractions`, and `fraction-words` under their manifest ids.
Each SHALL satisfy the existing determinism, computed-answer, measurable-difficulty, variety,
display-agreement, and content requirements using only Stage D's available capabilities.

#### Scenario: Each skill uses its intended representation and control

- **WHEN** the six generators are sampled across every difficulty
- **THEN** mixed conversion and arithmetic and fraction multiplication and division use
  structured fraction notation with keypad entry
- **AND** fraction word problems use fixed story frames with fraction keypad entry

#### Scenario: Unit 8 becomes complete in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all twelve Unit 8 skills resolve as implemented in manifest order
- **AND** Unit 9 remains planned

### Requirement: A mixed number converts to its exact improper fraction

A `mixed-to-improper` problem SHALL display a positive mixed number and derive its improper
fraction by multiplying the whole part by the denominator and adding the numerator. The
answer SHALL require lowest terms and SHALL be enterable through the fraction keypad.

#### Scenario: Whole and fraction parts form the numerator

- **WHEN** a problem displays `2 3/4`
- **THEN** the exact answer is `11/4`
- **AND** the displayed whole, numerator, and denominator are sufficient to re-derive it

#### Scenario: A dropped fraction part is diagnosed

- **WHEN** the learner converts only the whole part and enters `8/4` for `2 3/4`
- **THEN** the submission matches a prediction that names the omitted numerator

### Requirement: Mixed-number arithmetic requires a genuine mixed result

An `add-mixed` or `sub-mixed` problem SHALL display two positive mixed numbers and SHALL
derive an exact positive answer from every displayed part. The answer SHALL require genuine
mixed form and lowest terms through the existing mixed-number keypad behavior.

Every `sub-mixed` problem SHALL require borrowing one whole because the minuend's fractional
part is smaller than the subtrahend's. It SHALL retain two distinct diagnosable mistakes after
the central filter: reversing the fractional subtraction without borrowing, and reducing the
whole while adding one piece rather than one denominator of pieces.

#### Scenario: Addition regroups an improper fractional part

- **WHEN** the displayed fractional parts add to more than one whole
- **THEN** the answer carries that whole into the result
- **AND** an equivalent entry with an improper fractional part receives the existing
  right-value-wrong-form response

#### Scenario: Subtraction borrows from the whole

- **WHEN** the minuend's fractional numerator is smaller than the subtrahend's over their
  shared denominator
- **THEN** one whole is rewritten as one denominator of fractional pieces before subtraction

#### Scenario: Both borrowing mistakes remain diagnosable

- **WHEN** any `sub-mixed` problem is generated
- **THEN** the two required predicted values are distinct from each other and the answer
- **AND** either value can be entered with the problem's keypad

### Requirement: Fraction multiplication and division use exact rational operations

A `mult-fractions` or `div-fractions` problem SHALL display two positive proper fractions,
derive the exact result from both displayed fractions and the operator, and require lowest
terms through fraction keypad entry.

Every `div-fractions` problem SHALL use unequal operands and retain two distinct diagnosable
mistakes after the central filter: inverting the first fraction instead of the second, and
multiplying straight across without inverting either fraction.

#### Scenario: Multiplication works straight across

- **WHEN** a multiplication problem displays `2/3 × 3/5`
- **THEN** the answer is the reduced value of `6/15`

#### Scenario: Division flips only the divisor

- **WHEN** a division problem displays `2/3 ÷ 4/5`
- **THEN** the answer is the reduced value of `2/3 × 5/4`

#### Scenario: Both division-wall mistakes survive

- **WHEN** any `div-fractions` problem is generated
- **THEN** flipping the first fraction and multiplying without flipping remain distinct from
  each other and from the answer

### Requirement: Fraction word problems ask for a proper part-over-whole fraction

A `fraction-words` problem SHALL select a fixed adult-situation frame, mention a part, its
whole, and an irrelevant quantity, and ask what fraction of the whole the part represents.
It SHALL carry the relevant part and whole as machine-readable division operands, require the
answer in lowest terms, and predict the three comprehension errors invited by the frame.

#### Scenario: The story answer is exact and recomputable

- **WHEN** a story says 5 of 12 items have a property
- **THEN** its exact answer is `5/12`
- **AND** verification derives that answer from carried operands rather than parsing prose

#### Scenario: The irrelevant quantity remains irrelevant

- **WHEN** the learner divides the named part by the story's irrelevant quantity
- **THEN** the submission matches the frame's wrong-pair diagnosis
