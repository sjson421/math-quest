## MODIFIED Requirements

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

## ADDED Requirements

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
