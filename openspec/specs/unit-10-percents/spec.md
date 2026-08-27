# unit-10-percents Specification

## Purpose

Unit 10 opens the percent domain: reading a percent as a part of 100, converting between
percent and both other rational notations, and finding a percent of a quantity — the
foundation increment 10b's percent-of-unknown skills build on.

## Requirements

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
- **AND** all five Unit 10b skills also resolve as implemented
- **AND** Unit 10 is complete while Unit 11 remains planned

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

### Requirement: The remaining five Unit 10 skills are playable as percent content

The system SHALL generate Stage D Unit 10 skills `find-the-percent`, `find-the-whole`,
`percent-change`, `discount-tax-tip`, and `simple-interest` under their manifest ids. Each
SHALL satisfy the existing determinism, computed-answer, measurable difficulty, variety,
agreement, and content requirements using only Stage D's available capabilities.

Every scoped answer SHALL use the existing keypad for a whole-number or exact decimal
answer. No scoped problem SHALL require a new display, input, or answer capability.

#### Scenario: Unit 10 completes in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all ten Unit 10 skills resolve as implemented after Unit 9
- **AND** Unit 11 remains planned

### Requirement: Finding the percent divides the part by the whole

A `find-the-percent` problem SHALL state a positive whole-number part and whole, ask what
percent the part is of the whole, and require the exact whole-number percent obtained by
dividing part by whole and multiplying by 100.

Every problem SHALL preserve two distinct diagnoses after answer-collision filtering: using
the correct division without converting the ratio to a percent, and dividing whole by part.

#### Scenario: A part is converted to a percent of its whole

- **WHEN** a problem states that 12 is part of a whole of 60
- **THEN** the exact answer is `20`
- **AND** `0.2` diagnoses an unscaled ratio
- **AND** `5` diagnoses division in the wrong order

### Requirement: Finding the whole reverses a percent-of calculation

A `find-the-whole` problem SHALL state a positive whole-number part and a whole-number
percent below 100, ask for the original whole, and require the exact whole-number result of
dividing the part by the percent in decimal form.

Every problem SHALL preserve two distinct diagnoses after answer-collision filtering:
applying the percent to the known part again, and dividing by the percent as though it were
a whole number.

#### Scenario: A known percent and part recover the whole

- **WHEN** a problem states that 15 is 20% of an unknown whole
- **THEN** the exact answer is `75`
- **AND** applying 20% to 15 diagnoses reusing the forward operation
- **AND** dividing 15 by 20 diagnoses treating the percent as a whole number

### Requirement: Percent change uses the original value as its base

A `percent-change` problem SHALL cover both increases and decreases between positive
whole-number values. It SHALL require the exact whole-number percent change, computed as
the absolute change divided by the original value and multiplied by 100.

#### Scenario: An increase is measured from the original value

- **WHEN** a value increases from 80 to 100
- **THEN** the exact answer is `25`
- **AND** dividing the change by 100 diagnoses using the new value as the base

#### Scenario: A decrease is measured from the original value

- **WHEN** a value decreases from 80 to 60
- **THEN** the exact answer is `25`
- **AND** the answer remains a positive percent change

### Requirement: Discounts, tax, and tips produce final money totals

A `discount-tax-tip` problem SHALL cover discount, sales-tax, and tip contexts. It SHALL
state an exact dollar amount and a whole-number percent, ask for the final price or bill,
and require the exact money total after subtracting a discount or adding tax or tip.

#### Scenario: A discount reduces the original price

- **WHEN** an item costs `$80.00` and is discounted by 25%
- **THEN** the exact final price is `$60.00`

#### Scenario: Tax or tip increases the original amount

- **WHEN** a bill is `$40.00` and a 15% tip is added
- **THEN** the exact final bill is `$46.00`

### Requirement: Simple interest supplies and applies the GED formula

A `simple-interest` problem SHALL display the formula `I = Prt`, state an exact principal,
whole-number annual rate, and whole-number time in years, and require the exact interest
earned without adding the principal.

#### Scenario: Principal, rate, and time determine interest

- **WHEN** the principal is `$500.00`, the annual rate is 5%, and the time is 2 years
- **THEN** the exact interest is `$50.00`
- **AND** the displayed formula makes recall of the formula unnecessary

### Requirement: Unit 10 skills carry reviewed intro teaching lines

Each Stage D Unit 10 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `percent-meaning` | A percent tells how many parts out of 100. |
| `percent-to-decimal` | Divide a percent by 100, moving the decimal point two places left. |
| `decimal-to-percent` | Multiply a decimal by 100 to write its percent. |
| `percent-to-fraction` | Write the percent over 100, then reduce the fraction. |
| `percent-of` | Multiply the quantity by the percent written as a decimal. |
| `find-the-percent` | Divide the part by the whole, then multiply by 100. |
| `find-the-whole` | Divide the part by the percent written as a decimal. |
| `percent-change` | Divide the change by the original amount, then multiply by 100. |
| `discount-tax-tip` | Find the percent amount, then add or subtract it from the price. |
| `simple-interest` | Use I = Prt, writing the percent rate as a decimal. |

#### Scenario: Every Unit 10 intro uses its reviewed line

- **WHEN** the Unit 10 generator set is checked at its authored source
- **THEN** all ten ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one current-unit `percent` term

#### Scenario: Unit 10 examples retain exact percent answers

- **WHEN** each Unit 10 intro generates its stable difficulty-1 example
- **THEN** its percent, part, whole, change, final money total, or interest answer can be recomputed independently from the visible or carried quantities
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, keypad rule, story data, or misconception
