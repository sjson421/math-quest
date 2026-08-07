## Purpose

Number-line input lets a learner answer by placing a value on a line rather than typing it,
for the skills where locating a number *is* the thing being taught — reading below zero, and
placing a fraction between two whole numbers.

## ADDED Requirements

### Requirement: A problem declares the line it wants

A problem SHALL be able to declare a number line as its answer control, describing the line
as a first position, a spacing between positions, and how many positions there are. The
declared positions SHALL be the only values the learner can place.

The declaration belongs to the problem rather than to the skill or the stage, matching how a
problem already declares what its typed answer may contain. One skill can ask about several
lines — a line of whole numbers and a line divided into quarters are the same skill at
different difficulties — and only the generator knows which it has just built.

Positions SHALL be exact. A line divided into thirds or fifths has positions that cannot be
written as terminating decimals, and a position that is nearly right is a wrong answer.

#### Scenario: The declared positions are the whole tappable set

- **WHEN** a problem declares a line of eleven positions one apart starting at −5
- **THEN** the learner can place a value on any of −5 through 5
- **AND** no value between two declared positions can be placed

#### Scenario: A line of fractions keeps its positions exact

- **WHEN** a problem declares positions one third apart
- **THEN** each position is the exact value it represents
- **AND** no position is rounded or approximated to reach it

#### Scenario: A problem that declares no line is unaffected

- **WHEN** a problem carries no number-line declaration
- **THEN** it is answered exactly as it was before, by pad or by choice

### Requirement: The line replaces the other answer controls

When a problem declares number-line input, the lesson SHALL present the declared line as its
answer control, and SHALL NOT present the numeric keypad or choice controls. A keypad or
choice problem SHALL continue to present its own control and SHALL NOT present a line merely
because line data is present.

Which control appears is decided by the problem's declared input mode alone. A problem
carrying data for a control it did not ask for is data the lesson ignores, not a second
switch.

#### Scenario: A number-line problem shows no keypad

- **WHEN** the current problem declares number-line input
- **THEN** the lesson shows the declared line
- **AND** the lesson shows no numeric keypad and no choice controls

#### Scenario: Keypad and choice problems are unchanged

- **WHEN** the current problem declares keypad input
- **THEN** the lesson shows the numeric keypad
- **AND** the lesson shows no number line

### Requirement: Placing a value is not yet answering

Tapping a position SHALL place a value and show where it landed, without submitting it. The
learner SHALL be able to move the placed value to another position any number of times before
confirming, and SHALL confirm deliberately to submit.

Until the learner confirms, no attempt is recorded, the problem is not re-queued, and no
worked solution is shown. A line packs many positions into a phone's width, so a tap that
lands one position out is a slip rather than a wrong answer — charging an attempt for it
would punish the learner's aim instead of their arithmetic. This is the same rule the lesson
already applies to an entry that has been started but not finished.

#### Scenario: A tap places without submitting

- **WHEN** a learner taps a position on the line
- **THEN** the placed value is shown on the line
- **AND** no attempt is recorded and no feedback is shown

#### Scenario: A misplaced value can be corrected

- **WHEN** a learner taps a position and then taps a different one
- **THEN** the value is placed at the position tapped most recently
- **AND** only that value is submitted when the learner confirms

#### Scenario: Confirming is unavailable until a value is placed

- **WHEN** a number-line problem is presented and nothing has been placed
- **THEN** the learner cannot confirm an answer

### Requirement: A confirmed placement is checked like any other answer

Confirming a placed value SHALL submit that value to the existing answer checker as the exact
value of the position placed on. The lesson SHALL use the same correct-answer,
wrong-answer, progress-recording and re-queue behaviour as every other checked answer.

A position's value is an ordinary number, so number-line input introduces no new kind of
answer and no new kind of result to handle.

#### Scenario: A correct placement advances the lesson

- **WHEN** a learner confirms a placement whose value equals the problem's answer
- **THEN** the answer is handled as correct
- **AND** the lesson advances through its existing correct-answer flow

#### Scenario: A wrong placement uses the normal feedback

- **WHEN** a learner confirms a placement whose value is not the problem's answer
- **THEN** the answer is handled as incorrect
- **AND** the lesson uses its existing wrong-answer, diagnosis and re-queue flow

#### Scenario: A rapid repeat confirmation records once

- **WHEN** a confirmation is activated again before feedback replaces the control
- **THEN** only the first activation is handled
- **AND** exactly one attempt is recorded

### Requirement: The line is usable as a custom touch control

Each declared position SHALL be a labelled control that can be reached by assistive
technology and activated without opening a system keyboard, and the line SHALL remain
readable and tappable at phone width. Positions SHALL be presented in ascending order, left
to right.

Labels SHALL show a position's value in the form the skill teaches — a whole number as a
whole number, a fraction as a fraction. Where showing every label would crowd the line, a
line MAY label only some positions, and every position SHALL remain reachable and identified
to assistive technology whether or not its label is drawn.

#### Scenario: A learner places a value without a keyboard

- **WHEN** a number-line problem is presented on a phone
- **THEN** each position is available as a labelled touch control
- **AND** placing a value does not invoke the device keyboard

#### Scenario: Positions read left to right in ascending order

- **WHEN** a line of positions is presented
- **THEN** the smallest value is leftmost and the largest is rightmost

#### Scenario: An unlabelled position is still reachable

- **WHEN** a line draws labels on only some of its positions
- **THEN** every position can still be placed on
- **AND** every position is still identified to assistive technology by its value
