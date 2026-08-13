## Purpose

Unit 10 opens the percent domain: reading a percent as a part of 100, converting between
percent and both other rational notations, and finding a percent of a quantity — the
foundation increment 10b's percent-of-unknown skills build on.

## ADDED Requirements

### Requirement: The first five Unit 10 skills are playable as percent content

The system SHALL generate Stage D Unit 10 skills `percent-meaning`, `percent-to-decimal`,
`decimal-to-percent`, `percent-to-fraction`, and `percent-of` under their manifest ids. Each
SHALL satisfy the existing determinism, computed-answer, measurable difficulty, variety,
agreement, and content requirements using only Stage D's available capabilities.

Every scoped answer SHALL use the existing decimal or fraction keypad, or a whole-number
answer, whichever form matches what the skill asks for. No scoped problem SHALL require a
new display or input capability.

#### Scenario: The increment becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all five scoped skills resolve as implemented after Unit 9
- **AND** the five Unit 10b skills remain planned

### Requirement: Percent meaning connects a part of 100 to its percent number

A `percent-meaning` problem SHALL state a whole number of parts out of 100 and ask for the
matching percent, or state a percent and ask for the matching parts-out-of-100 count. The
exact answer SHALL equal the stated count.

#### Scenario: Parts out of 100 name a percent

- **WHEN** a problem states 23 parts out of 100
- **THEN** the exact answer is `23`

### Requirement: Percent-to-decimal and decimal-to-percent convert in opposite directions

A `percent-to-decimal` problem SHALL display a whole-number percent and require its decimal
form, dividing by 100. A `decimal-to-percent` problem SHALL display a decimal through
hundredths and require its whole-number percent form, multiplying by 100. Both SHALL derive
their exact answer from the same underlying value so the two skills are inverses of each
other.

`decimal-to-percent` SHALL predict at least two distinct wrong-shift misconceptions:
leaving the decimal's point unmoved, and moving it only one place instead of two.

#### Scenario: A percent converts to its decimal form

- **WHEN** a percent-to-decimal problem displays `45%`
- **THEN** the exact answer is `0.45`

#### Scenario: A decimal converts to its percent form

- **WHEN** a decimal-to-percent problem displays `0.45`
- **THEN** the exact answer is `45`
- **AND** `0.45` is diagnosable as leaving the point unmoved
- **AND** `4.5` is diagnosable as moving the point only one place

### Requirement: Percent-to-fraction reduces to lowest terms

A `percent-to-fraction` problem SHALL display a whole-number percent and require its
fraction form, over a denominator of 100, reduced to lowest terms. The answer SHALL be
diagnosable when submitted with an unreduced numerator and denominator.

#### Scenario: A percent reduces to lowest terms

- **WHEN** a percent-to-fraction problem displays `40%`
- **THEN** the exact answer is `2/5`
- **AND** `40/100` is diagnosable as an unsimplified but numerically correct entry

### Requirement: Percent-of computes a part from a percent and a whole

A `percent-of` problem SHALL display a whole-number percent and a whole-number quantity and
ask for the resulting part, derived as `percent / 100 * quantity`. Every scoped draw SHALL
produce a whole-number exact answer.

#### Scenario: A percent of a quantity is computed

- **WHEN** a percent-of problem displays "15% of 80"
- **THEN** the exact answer is `12`
