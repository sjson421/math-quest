## MODIFIED Requirements

### Requirement: The first six Unit 9 skills are playable as decimal content

The system SHALL generate Stage D Unit 9 skills `decimal-place-value`, `read-decimals`,
`compare-decimals`, `round-decimals`, `add-decimals`, and `sub-decimals` under their
manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements using only Stage D's available
capabilities.

Numeric decimal answers SHALL use the existing decimal keypad. `compare-decimals` SHALL use
the existing choice control with `<`, `=`, and `>` choices. No scoped problem SHALL require
fraction entry or a new display or input mode.

#### Scenario: Each skill uses its intended control

- **WHEN** the six generators are sampled across every difficulty
- **THEN** place value, reading, rounding, addition, and subtraction accept exact numeric
  keypad answers with a decimal point wherever the answer can require one
- **AND** comparison selects one of the three relation symbols by choice

#### Scenario: The increment becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented after Unit 8
- **AND** Unit 9's remaining six skills resolve as implemented once 9b ships alongside them

## ADDED Requirements

### Requirement: The remaining six Unit 9 skills are playable as decimal content

The system SHALL generate Stage D Unit 9 skills `mult-decimals`, `div-decimal-by-whole`,
`div-by-decimal`, `fraction-to-decimal`, `decimal-to-fraction`, and `money-problems` under
their manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements using only Stage D's available
capabilities.

`fraction-to-decimal` SHALL require its answer in decimal notation and `decimal-to-fraction`
SHALL require its answer in fraction notation, both using the required-form mechanism the
answer-entry contract declares. Every other scoped skill's numeric answer SHALL use the
existing decimal keypad.

#### Scenario: Unit 9 is fully playable

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all twelve Unit 9 skills resolve as implemented
- **AND** Units 10 and 11 remain planned

### Requirement: Decimal multiplication counts total decimal places

A `mult-decimals` problem SHALL display two nonnegative decimal operands through hundredths and
SHALL derive its exact answer as their exact product. The generator SHALL predict the
misplaced-decimal-point mistake of placing the point as if the operands' place counts had not
been summed.

#### Scenario: The product's point reflects both operands' places

- **WHEN** a problem displays `1.2 × 0.3`
- **THEN** the exact answer is `0.36`
- **AND** `0.36` misplaced as `3.6` or `.036` is available as a diagnosable mistake

### Requirement: Decimal division separates dividing by a whole from shifting both decimals

A `div-decimal-by-whole` problem SHALL display a decimal dividend and a whole-number divisor
constructed so the quotient terminates exactly, through the decimal places Unit 9 covers. A
`div-by-decimal` problem SHALL display a decimal dividend and a decimal divisor, also
constructed for an exact terminating quotient, and SHALL predict the mistake of shifting only
one of the two decimal points before dividing.

#### Scenario: A whole-number divisor keeps the dividend's point in place

- **WHEN** a `div-decimal-by-whole` problem displays `4.8 ÷ 4`
- **THEN** the exact answer is `1.2`

#### Scenario: Both points shift before a decimal divisor divides

- **WHEN** a `div-by-decimal` problem displays `4.8 ÷ 0.4`
- **THEN** the exact answer is `12`
- **AND** shifting only the divisor's point is available as a diagnosable mistake

### Requirement: Decimal-fraction conversion requires the taught form

A `fraction-to-decimal` problem SHALL display a proper or improper fraction with a
terminating decimal equivalent and SHALL require its answer written as a decimal. A
`decimal-to-fraction` problem SHALL display a decimal through hundredths and SHALL require its
answer written as a fraction. Neither skill SHALL accept the other notation for the same value,
even though it is numerically equal.

#### Scenario: A fraction converts to its decimal equivalent

- **WHEN** a `fraction-to-decimal` problem displays `3/4`
- **THEN** the exact answer is `0.75`
- **AND** an entry of `3/4` is answered as right in value but wrong form

#### Scenario: A decimal converts to its fraction equivalent

- **WHEN** a `decimal-to-fraction` problem displays `0.75`
- **THEN** the exact answer is `3/4`
- **AND** an entry of `0.75` is answered as right in value but wrong form

### Requirement: Money problems apply decimal arithmetic in an authored frame

A `money-problems` problem SHALL draw its wording from the word-problem-phrasing frame bank
and SHALL carry its price and quantity as exact integer cents. Its underlying operation SHALL
be multiplication (price times quantity), and its answer SHALL be verified by independently
recomputing that product from the carried quantities and expressing it as a dollar amount.

#### Scenario: A money story's answer matches its carried quantities

- **WHEN** a `money-problems` problem is generated
- **THEN** its answer equals the result of its carried operation over its carried quantities
