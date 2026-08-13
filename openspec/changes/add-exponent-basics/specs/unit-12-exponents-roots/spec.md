## Purpose

Unit 12a teaches what an exponent means, evaluating powers, perfect squares, estimating
roots, and the multiply/divide power rules, using the existing math-notation superscript
and root rendering.

## ADDED Requirements

### Requirement: The first six Unit 12 skills are playable as exponent and root content

The system SHALL generate Stage E Unit 12 skills `exponent-meaning`, `evaluate-powers`,
`perfect-squares`, `estimate-roots`, `exponent-multiply`, and `exponent-divide` under their
manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements using only Stage E's available
capabilities.

Every scoped problem SHALL display any power using the `superscript` math-notation kind and
any radical using the `root` math-notation kind, carry a `PowerData` payload on its `math`
display for independent verification, and require its answer through the existing numeric
keypad. No scoped problem SHALL require a new rendering, input, or answer-shape capability.

#### Scenario: Increment 12a becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented
- **AND** `power-of-power`, `zero-neg-exponents`, `scientific-notation`, and
  `pemdas-exponents` remain planned
- **AND** roadmap item 21 remains open for its remaining increments

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
