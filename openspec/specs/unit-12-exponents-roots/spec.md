# Unit 12 Exponents and Roots Specification

## Purpose

Unit 12a teaches what an exponent means, evaluating powers, perfect squares, estimating
roots, and the multiply/divide power rules, using the existing math-notation superscript
and root rendering.

## Requirements

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

### Requirement: Exponent meaning counts repeated-multiplication factors

An `exponent-meaning` problem SHALL display a base's repeated-multiplication expansion (the
base multiplied by itself some number of times) alongside the same base in superscript
notation with its exponent blanked out, and require the missing exponent — the number of
times the base appears as a factor. The exact answer SHALL be that count, distinct from
`evaluate-powers`, which asks for the evaluated product rather than the factor count.

#### Scenario: A repeated-multiplication row names its exponent

- **WHEN** a problem displays "3 × 3 × 3 × 3 = 3^?"
- **THEN** the exact answer is 4, the number of 3s multiplied together

### Requirement: Evaluating powers predicts base-exponent confusion

An `evaluate-powers` problem SHALL display a base raised to an exponent using superscript
notation and require the evaluated product. As a wall, it SHALL predict at least two
distinct misconceptions that survive `generateProblem`'s answer-collision and dedup
filtering: multiplying the base by the exponent instead of repeated multiplication, and
evaluating the exponent raised to the base instead of the base raised to the exponent.

#### Scenario: A power evaluates correctly and predicts multiplication confusion

- **WHEN** a problem displays 3⁴
- **THEN** the exact answer is 81
- **AND** a predicted misconception is 12, from multiplying 3 by 4
- **AND** a second predicted misconception is 64, from evaluating 4³ instead of 3⁴

### Requirement: Perfect squares round-trip to 144

A `perfect-squares` problem SHALL either display a whole number from 1 to 12 and require its
square, or display a perfect square up to 144 using root notation and require its square
root. The exact answer SHALL be the arithmetic square or square root of the displayed value.

#### Scenario: A square root of a perfect square is required

- **WHEN** a problem displays √144
- **THEN** the exact answer is 12

### Requirement: Estimating roots bounds a non-perfect square between consecutive integers

An `estimate-roots` problem SHALL display a positive integer that is not a perfect square,
using root notation, and require the lesser of the two consecutive whole numbers between
which its square root falls (its unstated companion is always one greater). The exact
answer SHALL be the unique integer `n` such that `n² < value < (n+1)²`.

#### Scenario: A non-perfect square is bounded

- **WHEN** a problem displays √50 and asks for the lesser of the two bounding whole numbers
- **THEN** the exact answer is 7, since 7² = 49 and 8² = 64

### Requirement: Multiplying and dividing powers apply the same-base exponent rules

An `exponent-multiply` problem SHALL display two powers sharing a base, connected by
multiplication and using superscript notation, and require the resulting exponent as a
number, computed by adding the two displayed exponents. An `exponent-divide` problem SHALL
display two powers sharing a base, connected by division and using superscript notation,
and require the resulting exponent as a number, computed by subtracting the second
displayed exponent from the first. Both SHALL keep the shared base fixed and visible, use
the existing numeric keypad for entry (no expression-input answer is required), and
generate only exponents that keep the result's exponent positive.

#### Scenario: Same-base powers multiply by adding exponents

- **WHEN** a problem displays 2³ × 2² = 2^? and asks for the missing exponent
- **THEN** the exact answer is 5

#### Scenario: Same-base powers divide by subtracting exponents

- **WHEN** a problem displays 5⁶ ÷ 5² = 5^? and asks for the missing exponent
- **THEN** the exact answer is 4

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
