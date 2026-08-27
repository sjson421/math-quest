# unit-07-fractions-meaning Specification

## Purpose

Unit 7 establishes fraction meaning through generated representations, vocabulary,
equivalence, comparison, and lowest terms before the course introduces fraction operations.

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

### Requirement: The remaining Unit 7 skills are playable as conceptual fraction content

The system SHALL generate Stage D Unit 7 skills `simplify-fractions`, `compare-same-den`, and
`compare-diff-den` under their manifest ids. Each SHALL satisfy the existing determinism,
computed-answer, measurable-difficulty, variety, agreement, and content requirements.

`simplify-fractions` SHALL accept a fraction through the fraction keypad and require lowest
terms. `compare-same-den` and `compare-diff-den` SHALL ask for the relation between two proper
fractions through numeric stable-id choices. None of the three SHALL ask the learner to add,
subtract, multiply, or divide fractions.

#### Scenario: Each skill uses its intended representation and control

- **WHEN** the three generators are sampled across every difficulty
- **THEN** simplification uses structured fraction notation and fraction entry
- **AND** both comparison skills use structured fraction notation and choice input

#### Scenario: Unit 7 becomes complete in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all nine Unit 7 skills resolve as implemented in manifest order
- **AND** Unit 8 remains planned

#### Scenario: The completed unit remains conceptual

- **WHEN** any scoped Unit 7 problem is presented
- **THEN** it asks about lowest terms or the relative size of represented fractions
- **AND** it does not ask for fraction addition, subtraction, multiplication, or division

### Requirement: Lowest-terms problems separate right value from right form

A `simplify-fractions` problem SHALL show a reducible proper fraction and derive its exact
lowest-terms answer from the displayed numerator and denominator. The answer SHALL require
simplified fraction form, so an equivalent unreduced entry receives the existing
right-value/wrong-form response instead of completing the problem.

Every generated problem SHALL retain two distinct diagnosable arithmetic mistakes in addition
to that form response: reducing only the numerator and reducing only the denominator. Neither
prediction SHALL equal the correct rational value or the other prediction.

#### Scenario: An unreduced equivalent answer asks for lowest terms

- **WHEN** the learner enters the displayed fraction or another reducible equivalent form
- **THEN** the value is acknowledged as right without completing the problem
- **AND** the learner is asked to write the answer in lowest terms

#### Scenario: Reducing only one part is diagnosed

- **WHEN** the learner divides only the numerator or only the denominator by the common factor
- **THEN** the resulting slash-form wrong answer matches a distinct predicted misconception
- **AND** the feedback names which part was left unchanged

### Requirement: Fraction comparisons are derived from exact represented values

Both comparison skills SHALL derive the correct `<`, `=`, or `>` choice from the exact rational
values carried by their two displayed fractions. `compare-same-den` SHALL compare distinct
numerators over one denominator. `compare-diff-den` SHALL use unequal denominators and SHALL
draw non-equal fractions for which comparing numerators alone gives the wrong relation.

Every `compare-diff-den` problem SHALL retain two distinct numeric choice diagnoses: the
relation produced by comparing numerators alone and an equality choice. The correct choice and
both diagnoses SHALL remain distinct after central misconception filtering.

#### Scenario: Like fractions compare their numerators

- **WHEN** two distinct proper fractions share a denominator
- **THEN** independent verification selects their relation from the numerators
- **AND** the generated choice id agrees with that relation

#### Scenario: Unlike fractions defeat numerator-only comparison

- **WHEN** two proper fractions have different denominators
- **THEN** independent verification compares their exact rational values
- **AND** the numerator-only relation is a wrong diagnosable choice rather than the answer

#### Scenario: The unlike-denominator wall retains two diagnoses

- **WHEN** any `compare-diff-den` problem is generated
- **THEN** numerator-only comparison and false equality both survive as distinct predictions
- **AND** submitting either numeric choice id produces its specific feedback

### Requirement: Unit 7 skills carry reviewed intro teaching lines

Each Stage D Unit 7 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `fraction-meaning` | A fraction writes selected equal parts over all equal parts. |
| `fraction-of-shape` | Count shaded equal parts over all equal parts in the shape. |
| `name-parts` | A fraction's top number counts selected parts; its bottom counts all equal parts. |
| `fractions-numberline` | Split the space from zero to one into equal parts, then count right. |
| `equivalent-visual` | Equivalent fractions name the same amount with different equal pieces. |
| `equivalent-multiply` | Multiply or divide both fraction parts by the same number. |
| `simplify-fractions` | Lowest terms use no shared factor except 1. |
| `compare-same-den` | With matching denominators, the larger top number makes the larger fraction. |
| `compare-diff-den` | Rename both fractions with one shared denominator, then compare their top numbers. |

#### Scenario: Every Unit 7 intro uses its reviewed line

- **WHEN** the Unit 7 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `numerator`, `denominator`, `equivalent fraction`, or `lowest terms`

#### Scenario: Unit 7 examples retain represented answers

- **WHEN** each Unit 7 intro generates its stable difficulty-1 example
- **THEN** exact fractions, choice labels, number-line targets, and shaded amounts can be recomputed independently from the visible notation or diagram
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, number line, or misconception
