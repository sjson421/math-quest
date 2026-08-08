## ADDED Requirements

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

### Requirement: A signed value is displayed and verified as one value

A problem MAY display a negative value, and MAY predict a mistake whose value is negative.
Where a sign is shown to the learner it SHALL use the same notation the rest of the course
uses for subtraction, and independent verification SHALL read a displayed sign as part of the
value it belongs to rather than as an operation applied to it.

One notation, in one place, is the requirement. The notation a learner reads and the notation
an answer is submitted in are allowed to differ — they already do — but a value that appears
twice in one view SHALL appear the same way both times. A display showing one sign glyph
beside an answer slot showing another is the control disagreeing with itself about what it
just did, which reads as a defect and cannot be distinguished from one.

#### Scenario: A signed display is recomputed correctly

- **WHEN** a problem displays arithmetic with one or more negative operands
- **THEN** verification evaluates it with each sign attached to its own value
- **AND** fails if the result differs from the answer the generator declared

#### Scenario: A predicted mistake may be negative

- **WHEN** a generator predicts a mistake whose value is below zero
- **THEN** the prediction is carried and diagnosed like any other
- **AND** it is filtered only if it equals the correct answer or another prediction

#### Scenario: One value does not appear in two notations at once

- **WHEN** a value the learner has entered is shown back beside a problem that also shows a sign
- **THEN** both are drawn with the same sign notation

### Requirement: The wording gate records every field a generator sets

The per-unit recorded-output gate SHALL render every field a problem carries, and SHALL fail
naming any field a generator sets that it does not render.

A field the gate does not render is a field the gate does not protect. What a problem permits
to be typed into it, and which line a value is placed on, are both authored decisions that
change what the learner sees and can be got wrong silently — so both are recorded alongside
the prompt, the display and the answer rather than left to a reviewer to notice missing.

#### Scenario: An answer-entry declaration is recorded

- **WHEN** a generator declares which character classes its answer may use
- **THEN** the recorded output for that problem shows the declaration

#### Scenario: A declared number line is recorded

- **WHEN** a generator declares the line its answer is placed on
- **THEN** the recorded output for that problem shows that line

#### Scenario: An unrendered field fails the gate

- **WHEN** a generator sets a field the gate does not render
- **THEN** the gate fails and names that field

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
