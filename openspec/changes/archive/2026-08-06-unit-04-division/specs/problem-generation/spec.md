## ADDED Requirements

### Requirement: Long division exposes its per-digit working

A long-division problem SHALL derive its quotient from the displayed dividend and divisor one
quotient digit at a time. Each step SHALL distinguish the dividend digit brought down, the
working value that digit joins, the quotient digit chosen for that place, the amount
subtracted, and the remainder carried into the next step.

Steps SHALL run from the highest place to the lowest, which is the order the work is done. The
quotient digits together with the final remainder SHALL reconstruct the dividend exactly, so
hints, solution steps, and predicted misconceptions describe the same working rather than each
recomputing the division on their own terms.

#### Scenario: A step divides the remainder carried into it, not the digit alone

- **WHEN** a step follows one that left a non-zero remainder
- **THEN** the value it divides is that remainder shifted one place plus the digit brought down
- **AND** its quotient digit is chosen against that combined value

#### Scenario: The working reconstructs the dividend

- **WHEN** every step of a long division is complete
- **THEN** the quotient multiplied by the divisor, plus the final remainder, equals the dividend
- **AND** the quotient equals the value independently recomputed from the displayed operands

#### Scenario: The algorithm wall retains two diagnoses

- **WHEN** any `long-div-1digit` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** one names a final digit that was never brought down
- **AND** one names a step remainder that was never carried forward

#### Scenario: The estimating wall retains two diagnoses

- **WHEN** any `long-div-2digit` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** both follow from estimating one quotient digit too high or too low in its own place

### Requirement: A displayed expression may be asked for a property of its result

A problem MAY display an arithmetic expression whose correct answer is a property of that
arithmetic rather than its value — the remainder of a division, or its whole-number quotient
where a remainder is discarded. Such a problem SHALL carry the displayed operands and the
property requested in machine-readable form, and its prompt SHALL name which is wanted.

Independent verification SHALL derive the answer from the carried operands and the named
property. Evaluating the displayed expression alone SHALL NOT be treated as the answer,
because for these problems it is not.

#### Scenario: A remainder answer is verified as a remainder

- **WHEN** a problem displays a division and asks what is left over
- **THEN** verification computes the remainder from the carried dividend and divisor
- **AND** fails if it differs from the answer the generator declared

#### Scenario: A quotient answer discards its remainder

- **WHEN** a problem displays a division that does not come out exactly and asks for the quotient
- **THEN** verification computes the whole-number quotient from the carried operands
- **AND** the stated answer excludes the remainder, which the worked solution still names

#### Scenario: The displayed expression and the carried operands agree

- **WHEN** a problem carries operands alongside a displayed expression
- **THEN** the expression shown to the learner is built from exactly those operands
- **AND** verification fails and names the problem if they disagree

### Requirement: Stage B Unit 4 is playable as generated content

The system SHALL generate all 11 Stage B Unit 4 skills under their manifest ids:
`div-meaning`, `div-facts`, `div-remainder`, `div-by-10-100`, `long-div-1digit`,
`long-div-remainder`, `long-div-2digit`, `factors`, `multiples`, `primes`, and `div-words`.
Each SHALL satisfy the existing determinism, computed-answer, measurable-difficulty, variety,
agreement, phrasing, and content requirements.

Every Unit 4 answer SHALL be a non-negative whole number entered on the custom numeric keypad,
or a choice among declared options. No Unit 4 problem may require an input or rendering
capability that has not been built, and no Unit 4 answer may be a fraction or a decimal.

#### Scenario: Every Unit 4 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage B manifest
- **THEN** all 11 Unit 4 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order after Unit 3

#### Scenario: Division never produces a fractional answer

- **WHEN** any Unit 4 problem is generated at any difficulty
- **THEN** its correct answer is a non-negative integer
- **AND** a division that does not come out exactly is asked as a remainder or a whole quotient

#### Scenario: Set-valued skills answer through choices rather than a new input mode

- **WHEN** `factors`, `multiples`, or `primes` presents a problem
- **THEN** the learner picks among declared options rather than entering several values
- **AND** no capability outside `AVAILABLE_CAPABILITIES` is required to play it

#### Scenario: Division stories remain independently verifiable

- **WHEN** a `div-words` problem presents authored prose
- **THEN** it carries the two divided quantities and the division operator separately
- **AND** its answer is recomputed from those carried quantities rather than parsed prose

## MODIFIED Requirements

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
