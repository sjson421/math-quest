# Unit 11 Ratios and Proportions Specification

## Purpose

Unit 11 teaches directed ratios, unit rates, equivalent proportions, scale drawings,
within-system measurement conversion, and interpreting part-to-part and part-to-whole
ratio stories.

## Requirements

### Requirement: The first six Unit 11 skills are playable as ratio and proportion content

The system SHALL generate Stage D Unit 11 skills `write-ratios`, `simplify-ratios`,
`unit-rate`, `solve-proportions`, `scale-drawings`, and `unit-conversion` under their
manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements using only Stage D's available
capabilities.

Every scoped problem SHALL use the existing fraction keypad, whole-number keypad, choice
input, math notation, or story display. No scoped problem SHALL require a new rendering,
input, or answer capability.

#### Scenario: Increment 11a becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented after `simple-interest`
- **AND** `ratio-words` resolves as implemented after `unit-conversion`
- **AND** roadmap item 19 is complete after increment 11b

### Requirement: Writing ratios preserves comparison order

A `write-ratios` problem SHALL state two positive category counts, name the requested
first-to-second comparison, and require that directed ratio in fraction form. The exact
answer SHALL be first count divided by second count, and reversing the comparison order
SHALL be diagnosable.

#### Scenario: A directed comparison becomes a ratio

- **WHEN** a problem states 3 red tiles and 5 blue tiles and asks for red to blue
- **THEN** the exact answer is `3/5` in fraction form
- **AND** `5/3` diagnoses reversing the comparison order

### Requirement: Simplifying ratios requires lowest terms

A `simplify-ratios` problem SHALL display a reducible positive ratio and require the same
ratio in lowest terms using fraction entry. Both terms SHALL share a factor greater than
one, and the reduced terms SHALL be coprime.

#### Scenario: A ratio reduces by its common factor

- **WHEN** a problem displays the ratio 12 to 18
- **THEN** the exact answer is `2/3`
- **AND** an equivalent unreduced entry is treated as right in value but not simplified

### Requirement: Unit rate compares two offers by one-unit cost

A `unit-rate` problem SHALL present two offers with positive item counts and exact prices,
require the learner to choose the better value, and derive that choice by comparing the two
prices per item. Every problem SHALL have exactly one lower unit price.

#### Scenario: Lower unit price is the better value

- **WHEN** one offer costs $12 for 4 items and another costs $20 for 5 items
- **THEN** the first offer is the unique correct choice because $3 per item is below $4

### Requirement: Solving proportions finds a missing whole-number term

A `solve-proportions` problem SHALL display two equal ratios with exactly one term missing
and require the positive whole-number value that makes the proportion true. Problems SHALL
cover a missing numerator and a missing denominator, and the answer SHALL be derivable by
cross multiplication.

#### Scenario: Cross multiplication finds a missing numerator

- **WHEN** a problem displays `3/4 = ?/20`
- **THEN** the exact answer is `15`
- **AND** substituting 15 makes the two ratios equal

### Requirement: Scale drawings convert in both directions

A `scale-drawings` problem SHALL state an exact drawing-to-actual scale and one measurement,
then require the corresponding measurement on the other side of the scale. Problems SHALL
cover drawing-to-actual and actual-to-drawing conversion with positive whole-number
answers.

#### Scenario: A drawing measurement becomes an actual measurement

- **WHEN** a scale states 1 centimeter on the drawing represents 4 meters and the drawing
  measurement is 6 centimeters
- **THEN** the exact actual measurement is 24 meters

#### Scenario: An actual measurement becomes a drawing measurement

- **WHEN** the same scale is stated and the actual measurement is 24 meters
- **THEN** the exact drawing measurement is 6 centimeters

### Requirement: Unit conversion applies a stated within-system relationship

A `unit-conversion` problem SHALL draw from a fixed set of customary-to-customary or
metric-to-metric relationships covering length, capacity, and weight or mass. It SHALL state
the applicable one-unit relationship in the problem, convert in both directions, and
require a positive whole-number answer. It SHALL NOT require a cross-system conversion or
unstated lookup knowledge.

#### Scenario: A customary measure converts to a smaller unit

- **WHEN** a problem states that 1 foot equals 12 inches and asks for 7 feet in inches
- **THEN** the exact answer is 84

#### Scenario: A metric measure converts to a larger unit

- **WHEN** a problem states that 1000 milliliters equal 1 liter and asks for 5000
  milliliters in liters
- **THEN** the exact answer is 5

### Requirement: Ratio word problems distinguish part-to-part from part-to-whole

The system SHALL generate the Stage D Unit 11 skill `ratio-words` under its manifest id.
Each problem SHALL present two positive, unequal category counts in an authored adult-context
story, state their total, and request either the first-to-second ratio or the first-to-whole
ratio. The exact answer SHALL preserve the requested order, use fraction entry, and be
recomputable from structured category counts and comparison type carried with the story.

Problems SHALL cover both comparison types across the seeded sample, vary their authored
context, and grow their counts measurably across the five difficulty bands. The skill SHALL
use only Stage D's existing story, exact-rational, and fraction-keypad capabilities.

#### Scenario: A part-to-part story compares the two categories

- **WHEN** a story states 3 completed items and 2 deferred items, for 5 items in all, and
  requests completed to deferred
- **THEN** the exact answer is `3/2` in fraction form

#### Scenario: A part-to-whole story compares one category with the total

- **WHEN** the same counts request completed items to all items
- **THEN** the exact answer is `3/5` in fraction form

#### Scenario: Both comparison modes become playable

- **WHEN** seeded problems are sampled across the full difficulty range
- **THEN** both part-to-part and part-to-whole questions appear
- **AND** `ratio-words` resolves as implemented after `unit-conversion`

### Requirement: Ratio word problems diagnose the wall's two comprehension errors

Every `ratio-words` problem SHALL predict the value produced by using the other available
comparison and the value produced by reversing the requested comparison. Both predictions
SHALL differ from the correct answer and from each other after central filtering.

#### Scenario: Part-to-part is mistaken for part-to-whole

- **WHEN** a problem asks for 3 completed items to 2 deferred items
- **THEN** `3/5` diagnoses using the whole as the second term
- **AND** `2/3` diagnoses reversing the requested category order

#### Scenario: Part-to-whole is mistaken for part-to-part

- **WHEN** a problem asks for 3 completed items to all 5 items
- **THEN** `3/2` diagnoses using only the other category as the second term
- **AND** `5/3` diagnoses reversing the requested part-to-whole comparison
