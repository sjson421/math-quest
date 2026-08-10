# unit-07-fractions-meaning Specification

## Purpose

Unit 7 establishes fraction meaning through generated representations and vocabulary before
the course introduces fraction procedures or arithmetic.

## Requirements

### Requirement: The first six Unit 7 skills are playable as conceptual fraction content

The system SHALL generate Stage D Unit 7 skills `fraction-meaning`, `fraction-of-shape`,
`name-parts`, `fractions-numberline`, `equivalent-visual`, and `equivalent-multiply` under
their manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements.

These skills SHALL ask about representations, names, placement, and equivalence without asking
the learner to perform fraction arithmetic. `fraction-meaning` SHALL accept a fraction through
the fraction keypad, `fraction-of-shape` SHALL derive a fraction from a shaded diagram,
`name-parts` SHALL use choice input, `fractions-numberline` SHALL place an exact rational on a
declared number line, `equivalent-visual` SHALL choose an equivalent prose description of a
diagram, and `equivalent-multiply` SHALL enter the missing whole number while scaling a
fraction up or down.

#### Scenario: Each skill uses its intended representation and control

- **WHEN** the six generators are sampled across every difficulty
- **THEN** each problem uses the display and input mode assigned to its concept
- **AND** no problem asks for a capability outside Stage D's existing requirements

#### Scenario: The increment becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented
- **AND** they follow Unit 6 and precede the three still-planned Unit 7 skills

#### Scenario: The unit remains conceptual

- **WHEN** any scoped Unit 7 problem is presented
- **THEN** it asks the learner to read, name, place, or recognize a fraction relationship
- **AND** it does not ask for fraction addition, subtraction, multiplication, or division

### Requirement: Equivalent visuals have one verifiable equivalent description

An `equivalent-visual` problem SHALL pair a shaded equal-part diagram with prose choices whose
rational values are carried as structured data. Exactly one choice SHALL equal the fraction
shown by the diagram, and the correct answer SHALL be derived from that equality rather than
from the authored answer id or by parsing the choice label.

#### Scenario: A reducible diagram has one equivalent choice

- **WHEN** a diagram shows two of four equal parts shaded
- **THEN** exactly one choice carries the value one half
- **AND** independent verification selects that choice from its rational value

#### Scenario: A choice label cannot silently disagree with its value

- **WHEN** an equivalent description is generated
- **THEN** the prose label and rational metadata are derived from the same chosen counts
- **AND** an independent Unit 7 semantic check fails if they disagree
