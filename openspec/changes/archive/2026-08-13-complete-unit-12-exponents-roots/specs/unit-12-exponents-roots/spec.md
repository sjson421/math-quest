## MODIFIED Requirements

### Requirement: The first six Unit 12 skills are playable as exponent and root content

The system SHALL generate all ten Stage E Unit 12 skills, from `exponent-meaning` through
`pemdas-exponents`, under their manifest ids. Each SHALL satisfy the existing determinism,
computed-answer, measurable difficulty, variety, agreement, and content requirements using
only Stage E's available capabilities.

Every scoped problem SHALL display any power using the `superscript` math-notation kind and
any radical using the `root` math-notation kind, carry a `PowerData` payload on its `math`
display for independent verification, and require its answer through the existing numeric
keypad. No scoped problem SHALL require a new rendering, input, or answer-shape capability.

#### Scenario: Increment 12b completes Unit 12 in curriculum order

- **WHEN** the four increment 12b generators are registered after the six increment 12a
  generators
- **THEN** all ten Unit 12 skills resolve as implemented in manifest order
- **AND** Unit 13 remains planned
- **AND** roadmap item 21 remains open for its Units 13–15 increments

## ADDED Requirements

### Requirement: A power raised to a power multiplies the exponents

A `power-of-power` problem SHALL display a power raised to another power using nested
superscript notation, keep the base fixed and visible, and require the resulting exponent
as an exact whole number. The answer SHALL be the product of the inner and outer exponents.
As a wall, every generated problem SHALL retain two distinct predicted misconceptions:
adding the exponents as in same-base multiplication, and keeping only the inner exponent.

#### Scenario: Nested powers require exponent multiplication

- **WHEN** a problem displays (2³)⁴ = 2^?
- **THEN** the exact answer is 12
- **AND** 7 is diagnosed as adding the exponents
- **AND** 3 is diagnosed as ignoring the outer exponent

### Requirement: Zero and negative exponents describe reciprocal powers

The `zero-neg-exponents` generator SHALL produce both zero-exponent and negative-exponent
questions across its seeded output. A zero exponent SHALL have exact answer 1. A negative
exponent SHALL have exact answer `1 / base^magnitude` in simplest form and SHALL enable the
existing fraction keypad entry. Both forms SHALL use superscript notation and concise
guidance that describes the rule without introducing a new answer or input mode. A negative
exponent problem that predicts negating the positive power SHALL permit sign entry so that
mistake can be submitted and diagnosed.

#### Scenario: A negative exponent is evaluated as a reciprocal

- **WHEN** a problem displays 3⁻²
- **THEN** the exact answer is 1/9
- **AND** the fraction slash is available for entry

#### Scenario: A nonzero base to the zero power is one

- **WHEN** a problem displays 7⁰
- **THEN** the exact answer is 1

### Requirement: Scientific notation converts powers of ten to ordinary numbers

A `scientific-notation` problem SHALL display a normalized positive coefficient from 1 up
to but not including 10 multiplied by a positive or negative integer power of ten, using
structured multiplication and superscript notation, and require the equivalent ordinary
number. The answer SHALL be exact, and decimal entry SHALL be enabled whenever the answer
or a reachable predicted misconception needs it. Every problem SHALL predict moving the
decimal only one place and moving it in the direction opposite the exponent, with both
values distinct from the correct answer and each other. Difficulty SHALL increase through
larger exponent magnitudes and decimal coefficients rather than through unbounded answer
length.

#### Scenario: A negative power of ten moves the decimal left

- **WHEN** a problem displays 3.4 × 10⁻³
- **THEN** the exact answer is 0.0034

#### Scenario: A positive power of ten moves the decimal right

- **WHEN** a problem displays 6 × 10⁴
- **THEN** the exact answer is 60000

### Requirement: Full order of operations includes exponentiation

A `pemdas-exponents` problem SHALL display a structured expression containing a power and
ordinary arithmetic, and SHALL require its exact nonnegative whole-number value. Generated
families SHALL exercise both exponentiation before multiplication or addition and
parentheses before exponentiation, completing the rule introduced by `pemdas`. The visible
notation, answer, and predicted wrong-rule values SHALL derive from one expression tree,
while the global generator verifier SHALL independently rebuild and evaluate the display
from its operation-specific power data.

#### Scenario: Exponents are evaluated before multiplication and addition

- **WHEN** a problem displays 3 + 2³ × 4
- **THEN** the exact answer is 35
- **AND** a learner who reads 2³ as 2 × 3 can receive a specific diagnosis

#### Scenario: Parentheses are evaluated before their exponent

- **WHEN** a problem displays (2 + 3)² ÷ 5
- **THEN** the exact answer is 5
