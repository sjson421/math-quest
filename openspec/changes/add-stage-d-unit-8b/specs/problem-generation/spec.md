## ADDED Requirements

### Requirement: Mixed-number displays are independently verifiable

A structured math display that converts or combines mixed numbers SHALL carry every whole,
numerator, denominator, and operator needed to reconstruct both its visible notation and its
exact answer. Verification SHALL fail when the notation, spoken label, or stated answer
disagrees with that data.

#### Scenario: Mixed-to-improper is derived from all three parts

- **WHEN** a display carries whole `2`, numerator `3`, and denominator `4`
- **THEN** verification reconstructs `2 3/4` and derives the exact answer `11/4`

#### Scenario: Mixed arithmetic reads both operands

- **WHEN** a display adds or subtracts two mixed numbers
- **THEN** verification converts both carried mixed numbers to exact improper fractions
- **AND** applies the carried operator without trusting the generator's stated answer

### Requirement: Fraction multiplication and division are independently verifiable

A structured fraction multiplication or division display SHALL carry both fractions and its
operator. Verification SHALL reconstruct the visible notation and SHALL derive the result by
multiplying straight across or multiplying by the divisor's reciprocal, respectively.

#### Scenario: Division reads operand order

- **WHEN** a display carries `a/b ÷ c/d`
- **THEN** verification derives `a/b × d/c`
- **AND** fails if the displayed operands, operator, or stated answer disagree

### Requirement: A proper-fraction story is verified from integer part and whole operands

A story that asks what fraction one integer quantity is of a larger integer whole SHALL carry
the part and whole in that order with division as its operation. Its exact rational answer
SHALL be derived from those operands, not from prose or a rounded decimal.

#### Scenario: Fraction story preserves exactness

- **WHEN** a story carries part `3` and whole `8`
- **THEN** verification derives the exact rational value `3/8`
- **AND** the answer remains equivalent under exact rational comparison
