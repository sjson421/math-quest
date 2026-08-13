# Unit 11 Ratios and Proportions Specification

## Purpose

Unit 11a teaches directed ratios, unit rates, equivalent proportions, scale drawings, and
within-system measurement conversion before the closing ratio-word-problem wall.

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
- **AND** `ratio-words` remains planned
- **AND** roadmap item 19 remains open for increment 11b

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
