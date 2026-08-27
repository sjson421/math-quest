# Unit 09 Decimals

## Purpose

Unit 9 builds practical decimal sense and exact arithmetic, then completes it with
multiplication, division, decimal/fraction conversion, and a money-applied word problem.

## Requirements

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

### Requirement: Unit 9 skills carry reviewed intro teaching lines

Each Stage D Unit 9 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `decimal-place-value` | Count places to the right of the decimal point. |
| `read-decimals` | The word "and" marks the decimal point when writing digits. |
| `compare-decimals` | Add ending zeros, then compare matching places from left to right. |
| `round-decimals` | Check the next digit: 5 or more rounds up. |
| `add-decimals` | Line up decimal points, then add matching places. |
| `sub-decimals` | Line up decimal points, then subtract matching places. |
| `mult-decimals` | Multiply as whole numbers, then restore all decimal places. |
| `div-decimal-by-whole` | Divide as whole numbers and bring the decimal point straight up. |
| `div-by-decimal` | Shift both decimal points equally until the divisor is whole. |
| `fraction-to-decimal` | Divide the top number by the bottom number to write a decimal. |
| `decimal-to-fraction` | Write a decimal's digits over their place value, then reduce. |
| `money-problems` | Multiply the price by the needed quantity, then write the total in dollars. |

#### Scenario: Every Unit 9 intro uses its reviewed line

- **WHEN** the Unit 9 generator set is checked at its authored source
- **THEN** all 12 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `decimal`, `tenths`, or `hundredths`

#### Scenario: Unit 9 examples retain exact decimal answers

- **WHEN** each Unit 9 intro generates its stable difficulty-1 example
- **THEN** its answer can be recomputed independently from the visible decimal, fraction, column, choice, or carried money quantities, including required decimal and fraction forms
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, keypad rule, story frame, or misconception
