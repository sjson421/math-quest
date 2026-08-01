# Choice Input

## Purpose

Choice input lets a learner answer a problem from its authored options without exposing the
numeric keypad or requiring the device's system keyboard.

## Requirements

### Requirement: A choice problem presents its declared options

When a problem declares choice input, the lesson SHALL present every declared choice as an
answer control in declaration order. The control SHALL show each choice's learner-facing label
and SHALL NOT expose its internal id as learner-facing text.

The numeric keypad SHALL NOT be shown for a choice problem. A keypad problem SHALL continue to
show the keypad and SHALL NOT show choice controls merely because choice data is present.

#### Scenario: Choice input replaces the keypad

- **WHEN** the current problem declares choice input with three choices
- **THEN** the lesson shows the three declared labels in declaration order
- **AND** the lesson shows no numeric keypad

#### Scenario: Keypad input remains unchanged

- **WHEN** the current problem declares keypad input
- **THEN** the lesson shows the numeric keypad
- **AND** the lesson does not show choice controls

### Requirement: Choosing an option submits its stable id

Selecting a declared choice SHALL submit that choice's stable id to the existing answer
checker. The lesson SHALL use the same correct-answer, incorrect-answer, progress-recording,
and re-queue behavior as every other checked answer.

#### Scenario: Correct choice advances the lesson

- **WHEN** a learner selects the choice whose id matches the problem's choice answer
- **THEN** the answer is handled as correct
- **AND** the lesson advances through its existing correct-answer flow

#### Scenario: Incorrect choice uses normal feedback

- **WHEN** a learner selects a choice whose id does not match the problem's choice answer
- **THEN** the answer is handled as incorrect
- **AND** the lesson uses its existing incorrect-answer and re-queue flow

#### Scenario: A rapid repeat activation records once

- **WHEN** the same presented choice control is activated again before feedback replaces it
- **THEN** only the first activation is handled
- **AND** exactly one attempt is recorded

### Requirement: Choices are usable as custom touch controls

Each declared choice SHALL be a labelled button that can be reached by assistive technology
and activated without opening a system keyboard. The choice labels SHALL remain readable at
phone width.

#### Scenario: A learner answers without a keyboard

- **WHEN** a choice problem is presented on a phone
- **THEN** each option is available as a labelled touch control
- **AND** selecting one does not invoke the device keyboard
