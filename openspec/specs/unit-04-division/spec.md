# unit-04-division Specification

## Purpose
Defines long-division working, quotient or remainder answers, and shipped playability for division content in Unit 4.
## Requirements
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

### Requirement: Unit 4 skills carry reviewed intro teaching lines

Each Stage B Unit 4 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `div-meaning` | Division shares a total equally or counts equal groups. |
| `div-facts` | Use a multiplication fact backward to find how many groups fit. |
| `div-remainder` | A remainder is what stays after making every full group. |
| `div-by-10-100` | Dividing by 10 or 100 shifts every digit right one or two places. |
| `long-div-1digit` | Repeat divide, multiply, subtract, and bring down for each digit. |
| `long-div-remainder` | Count only full groups; an unfinished group does not add one. |
| `long-div-2digit` | Estimate each quotient digit, multiply to check, then adjust if needed. |
| `factors` | A factor divides a number exactly with nothing left over. |
| `multiples` | A multiple comes from multiplying a number by a whole number. |
| `primes` | A prime number can be divided exactly only by 1 and itself. |
| `div-words` | Find the total and number of equal groups, then divide. |

#### Scenario: Every Unit 4 intro uses its reviewed line

- **WHEN** the Unit 4 generator set is checked at its authored source
- **THEN** all 11 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `remainder`, `factor`, `multiple`, `prime`, or `composite`

#### Scenario: Unit 4 examples retain computed answers

- **WHEN** each Unit 4 intro generates its stable difficulty-1 example
- **THEN** keypad answers and choice labels can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, or misconception
