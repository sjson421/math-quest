## ADDED Requirements

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
