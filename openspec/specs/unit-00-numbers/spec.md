# unit-00-numbers Specification

## Purpose
Defines independent verification and shipped playability for whole-number content in Unit 0.
## Requirements
### Requirement: Whole-number representation problems are independently verifiable

A problem that asks about a whole number without presenting binary arithmetic SHALL carry the
learner-visible values and the requested operation in machine-readable form. The correct
answer SHALL be independently derivable from that display data without trusting the answer
declared by the generator or parsing learner-facing prose.

This covers a property of a single number as much as its representation: which numbers divide
it, which numbers it divides into, and whether it has any divisor besides one and itself are
all derivable from the displayed value and the named operation.

For a choice problem, verification SHALL derive the expected learner-facing label from the
display data and then resolve the id of the declared choice carrying that label. Choice ids
SHALL be unique within the problem. These rules keep the internal id out of the lesson surface
without making it an unverifiable answer key or allowing two buttons to submit one answer.

#### Scenario: A keypad answer is recomputed from displayed number data

- **WHEN** a problem asks the learner to read, expand, inspect, or round a displayed whole number
- **THEN** verification computes the expected number from the displayed value and operation
- **AND** fails if it differs from the numeric answer the generator declared

#### Scenario: A choice answer is recomputed through its visible label

- **WHEN** a problem asks the learner to compare or order displayed numbers
- **THEN** verification computes the expected choice label from those numbers and the operation
- **AND** resolves the stable id of the declared choice carrying that label
- **AND** fails if that id differs from the choice answer the generator declared

#### Scenario: A number-property answer is recomputed through its visible label

- **WHEN** a problem asks which numbers are factors or multiples of a displayed value, or whether it is prime
- **THEN** verification derives the expected label from that value and the named operation
- **AND** resolves the stable id of the declared choice carrying that label
- **AND** fails if that id differs from the choice answer the generator declared

#### Scenario: Display metadata and visible choices cannot disagree silently

- **WHEN** the expected label derived from a whole-number display is absent or duplicated
- **THEN** verification fails and names the problem instead of accepting its stored answer

#### Scenario: Choice ids are unique

- **WHEN** a whole-number problem declares authored choices
- **THEN** every declared choice has a different stable id
- **AND** verification fails if two buttons would submit the same id

### Requirement: Stage A Unit 0 is playable as generated content

The system SHALL generate all eight Stage A Unit 0 skills under their manifest ids:
`read-numbers`, `place-value-tens`, `place-value-hundreds`, `expanded-form`,
`compare-numbers`, `order-numbers`, `round-to-10`, and `round-to-100`. Each SHALL satisfy the
existing determinism, computed-answer, measurable-difficulty, variety, agreement, and content
requirements.

Compare and order problems SHALL use authored choice controls. Read, place-value,
expanded-form, and rounding problems SHALL use the custom numeric keypad. No Unit 0 problem
may invoke a system keyboard.

Each generator SHALL also carry the following teaching line as its Stage A intro content:

| Skill id | Teaching line |
|---|---|
| `read-numbers` | A numeral uses digits to show a number. |
| `place-value-tens` | The tens digit is second from the right. |
| `place-value-hundreds` | The hundreds digit is third from the right. |
| `expanded-form` | Expanded form shows a number as a sum of its place values. |
| `compare-numbers` | Compare digit counts, then matching places from the left; all matches mean equal. |
| `order-numbers` | Ascending order lists numbers from smallest to largest. |
| `round-to-10` | Rounding uses the ones digit: below 5 goes down, 5 or more goes up. |
| `round-to-100` | Use the final two digits: below 50 goes down, 50 or more goes up. |

The generated problems, hints, solution steps, and predictions SHALL remain unchanged by adding these lines. In particular, `round-to-100` SHALL retain its rounded-down, rounded-up, and rounded-only-to-tens predictions so at least two distinct values survive central filtering on every generated problem.

#### Scenario: Every Unit 0 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage A manifest
- **THEN** all eight Unit 0 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order

#### Scenario: Comparison and ordering use authored choices

- **WHEN** a comparison or ordering problem is generated
- **THEN** its declared choices contain exactly one label derived as correct from the displayed numbers
- **AND** the answer is the stable id of that choice

#### Scenario: The midpoint rounds upward

- **WHEN** a `round-to-10` or `round-to-100` problem displays a value exactly halfway between neighbours
- **THEN** the computed answer is the higher neighbour

#### Scenario: The rounding wall retains two diagnoses

- **WHEN** any `round-to-100` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** each names a rounding error that produces its predicted value

#### Scenario: Every Stage A skill has its reviewed teaching line

- **WHEN** the Stage A generator set is checked at source
- **THEN** all eight ids carry the teaching line assigned to them above
- **AND** no Stage B–F generator is made incomplete by this increment
