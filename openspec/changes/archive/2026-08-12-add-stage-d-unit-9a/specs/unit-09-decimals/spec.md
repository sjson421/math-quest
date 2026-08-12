## Purpose

Unit 9a builds practical decimal sense and exact arithmetic before later decimal
multiplication, division, conversions, and money applications add more procedures.

## ADDED Requirements

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
- **AND** the six Unit 9b skills remain planned

### Requirement: Decimal places connect names, digits, and exact values

A `decimal-place-value` problem SHALL display a nonnegative decimal through hundredths and
ask for the digit in a stated tenths or hundredths place. A `read-decimals` problem SHALL
write a nonnegative decimal through hundredths in words and require the same value in digits.
Both displays SHALL preserve interior and trailing zero places whenever those places carry
the concept being tested.

#### Scenario: A requested decimal digit is identified

- **WHEN** a place-value problem displays `3.47` and asks for the hundredths digit
- **THEN** the exact answer is `7`
- **AND** a nearby-place digit is available as a diagnosable mistake when it differs

#### Scenario: Decimal words are written in digits

- **WHEN** a reading problem displays "three and four hundredths"
- **THEN** the exact answer is `3.04`
- **AND** writing `3.4` is diagnosed as moving the digit into the tenths place

### Requirement: Decimal comparison diagnoses the longer-numeral wall

A `compare-decimals` problem SHALL compare two unequal nonnegative decimals exactly. Its draw
SHALL include pairs with different written lengths where the longer numeral is not the larger
value. Every generated problem SHALL retain two distinct wrong choice diagnoses after the
central answer-collision and duplicate-value filter, including the named longer-means-bigger
mistake and choosing equality.

#### Scenario: More written digits do not decide the comparison

- **WHEN** a problem compares `0.9` with `0.15`
- **THEN** the correct choice is `>`
- **AND** choosing `<` is diagnosed as treating the longer numeral as larger

#### Scenario: Both wall diagnoses always survive

- **WHEN** any decimal-comparison problem is generated
- **THEN** its two prediction values differ from the correct relation and from each other
- **AND** either wrong choice can be submitted and diagnosed

### Requirement: Decimal rounding names its target place

A `round-decimals` problem SHALL state whether a decimal is rounded to the nearest whole or
nearest tenth and SHALL derive the exact result from the digit immediately to that place's
right. A midpoint digit of 5 SHALL round upward. The displayed value SHALL not already be at
the requested precision.

#### Scenario: A hundredth rounds a tenth upward

- **WHEN** a problem asks for `2.35` rounded to the nearest tenth
- **THEN** the exact answer is `2.4`
- **AND** truncating to `2.3` is diagnosed separately from leaving `2.35` unchanged

### Requirement: Decimal addition and subtraction align place values

An `add-decimals` or `sub-decimals` problem SHALL display two nonnegative decimal operands
through hundredths and SHALL derive its exact answer by aligning equal places. At least some
draws SHALL use operands with different written precision. Subtraction SHALL keep the result
nonnegative, and both skills SHALL predict computed place-alignment mistakes.

#### Scenario: Different written precision still aligns by place

- **WHEN** an addition problem displays `1.2 + 0.35`
- **THEN** the exact answer is `1.55`
- **AND** verification treats the tenths operand as `1.20` without requiring the learner to
  type a trailing zero

#### Scenario: Decimal subtraction stays exact and nonnegative

- **WHEN** a subtraction problem displays two decimals at unequal or equal precision
- **THEN** the first value is at least the second and their exact difference is accepted
- **AND** a computed answer from misaligned places is diagnosable when it differs
