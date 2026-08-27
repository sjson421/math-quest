# unit-06-negatives Specification

## Purpose
Defines distance-from-zero verification and shipped playability for negative-number content in Unit 6.
## Requirements
### Requirement: A displayed value may be asked for its distance from zero

A problem MAY display a value and ask how far it lies from zero rather than what it evaluates
to. Such a problem SHALL carry the displayed value and the requested operation in
machine-readable form, and independent verification SHALL derive the answer from that carried
value.

Reading the display as arithmetic SHALL NOT be treated as the answer. Distance from zero is
not an arithmetic operator, so the display is not an expression that can be evaluated — and
if the sign were simply dropped from the display to make it one, the problem would stop
asking its question. This is the same separation `divide-remainder` needed: the answer is a
property of what is shown, not its value.

#### Scenario: A distance-from-zero answer is verified from the carried value

- **WHEN** a problem displays a value and asks how far it is from zero
- **THEN** verification computes the magnitude of the carried value
- **AND** fails if it differs from the answer the generator declared

#### Scenario: A negative value and its magnitude are not confused

- **WHEN** a problem displays a negative value and asks how far it is from zero
- **THEN** the expected answer is the value without its sign
- **AND** verification fails if the generator declared the signed value instead

#### Scenario: The displayed value and the carried value agree

- **WHEN** a problem carries a value alongside a distance-from-zero display
- **THEN** the value shown to the learner is the carried value
- **AND** verification fails and names the problem if they disagree

### Requirement: Stage C Unit 6 is playable as generated content

The system SHALL generate all nine Stage C Unit 6 skills under their manifest ids:
`negatives-numberline`, `compare-negatives`, `add-neg-pos`, `add-two-negs`, `sub-negatives`,
`mult-negatives`, `div-negatives`, `absolute-value`, and `negatives-mixed`. Each SHALL satisfy
the existing determinism, computed-answer, measurable-difficulty, variety, agreement, and
content requirements.

Every Unit 6 value SHALL be a whole number, positive or negative. No Unit 6 problem may
require a rendering or input mode Stage C does not already declare: answers are typed on the
custom keypad, chosen among declared options, or placed on a declared number line.

`negatives-numberline` SHALL place its value on a line rather than typing it, and
`compare-negatives` SHALL answer among declared choices. Every other Unit 6 skill SHALL answer
on the keypad.

The two skills the curriculum document marks as walls, and the one it marks a major wall,
SHALL each carry at least two distinct predicted mistakes that survive collision filtering on
**every** problem they generate, not on average.

#### Scenario: Every Unit 6 skill resolves as playable

- **WHEN** the course is derived from the manifest and the generator registry
- **THEN** all nine Unit 6 skills resolve as implemented
- **AND** they are offered in curriculum order

#### Scenario: Unit 6 values stay whole

- **WHEN** any Unit 6 problem is generated at any difficulty
- **THEN** its correct answer is a whole number
- **AND** every value it predicts as a mistake is a whole number

#### Scenario: A negative answer can be entered

- **WHEN** a Unit 6 problem's correct answer is below zero
- **THEN** the problem permits a sign to be entered

#### Scenario: The walls keep two diagnoses on every problem

- **WHEN** a Unit 6 wall skill generates a problem at any difficulty
- **THEN** at least two distinctly tagged predicted mistakes survive to the learner

#### Scenario: Opening Stage C makes it completable

- **WHEN** the last Unit 6 skill is mastered
- **THEN** the Stage C checkpoint is reached, because Unit 6 is the whole of Stage C

### Requirement: Unit 6 skills carry reviewed intro teaching lines

Each Stage C Unit 6 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `negatives-numberline` | Negative numbers sit to the left of zero on a number line. |
| `compare-negatives` | Farther left on the number line means smaller. |
| `add-neg-pos` | With different signs, subtract the sizes and keep the larger size's sign. |
| `add-two-negs` | Add the sizes of two negative numbers, then keep the negative sign. |
| `sub-negatives` | Subtracting a negative is the same as adding its positive size. |
| `mult-negatives` | When multiplying, matching signs give positive and different signs give negative. |
| `div-negatives` | When dividing, matching signs give positive and different signs give negative. |
| `absolute-value` | Absolute value is a number's distance from zero. |
| `negatives-mixed` | Choose the operation first, then apply its negative-number rule. |

#### Scenario: Every Unit 6 intro uses its reviewed line

- **WHEN** the Unit 6 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 6 examples retain computed answers

- **WHEN** each Unit 6 intro generates its stable difficulty-1 example
- **THEN** keypad values, comparison choices, and number-line targets can be recomputed independently from the values visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, number line, or misconception
