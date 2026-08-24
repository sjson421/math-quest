# root-pair-input Specification

## Purpose
Lets a learner enter and confirm two exact numeric roots without treating them as an ordered coordinate or a single expression.
## Requirements
### Requirement: A root-pair problem uses one dedicated answer surface

A problem that declares root-pair input SHALL carry an exact root-pair answer and SHALL route only to the root-pair answer surface. It SHALL NOT fall through to choice, coordinate-plane, expression, number-line, or single-value keypad input.

The displayed problem and the root-pair control SHALL remain separate: the problem states the equation or formula, while the control owns both answer slots. No internal submitted encoding SHALL appear in the problem display or either learner-facing slot.

#### Scenario: Root-pair input cannot fall through

- **WHEN** a problem declares root-pair input with an exact root-pair answer
- **THEN** the learner receives one two-slot root-pair control
- **AND** no other answer control or scalar answer frame is presented

#### Scenario: A mismatched answer fails closed

- **WHEN** a problem declares root-pair input without an exact root-pair answer
- **THEN** the lesson does not present a plausible fallback control

### Requirement: Each root is entered through the numeric grammar the problem permits

The root-pair surface SHALL present two independently editable slots labelled Root 1 and Root 2. One slot SHALL be active at a time, and selecting either slot SHALL make subsequent keypad actions edit that slot without changing the other.

Both slots SHALL use the problem's one numeric-entry declaration. The keys shown, characters accepted, and answer echo SHALL follow the existing numeric rules for signs, fractions, decimals, and mixed numbers. A fraction or minus sign SHALL be displayed in the same learner-facing notation as a single numeric entry.

#### Scenario: Selecting a slot preserves its partner

- **WHEN** Root 1 contains `-3` and the learner selects Root 2 and enters `4`
- **THEN** Root 1 still shows `−3`
- **AND** Root 2 shows `4`

#### Scenario: Both slots read one numeric declaration

- **WHEN** a root-pair problem permits a sign and a fraction slash
- **THEN** either active slot accepts those keys
- **AND** neither slot accepts a numeric character class the problem did not permit

### Requirement: A complete pair is confirmed deliberately

The root-pair surface SHALL provide one Check action for the pair. Check SHALL remain disabled until both slots contain complete numeric entries. Entering or replacing a value SHALL NOT submit automatically, and the learner SHALL be able to revise either slot before confirmation.

Confirmation SHALL submit the two exact parsed values through the lesson's shared answer path once. Correctness, diagnosis, attempt recording, requeue, feedback, and rapid-submit protection SHALL remain owned by that shared path.

#### Scenario: One root cannot be submitted as a pair

- **WHEN** only one root slot contains a complete value
- **THEN** Check is disabled
- **AND** no attempt can be recorded from the incomplete pair

#### Scenario: Both roots confirm once

- **WHEN** both root slots contain complete values and the learner activates Check
- **THEN** the pair is submitted once through the shared lesson answer path
- **AND** neither slot is submitted as a separate attempt

### Requirement: Root-pair input remains accessible and usable on the installed phone

Each root slot SHALL be labelled, selectable button markup that exposes which slot is active. Keypad controls and Check SHALL keep their accessible names and touch sizes. The complete control, including two filled fraction-capable slots and the numeric keypad, SHALL fit without horizontal or page overflow at 375 pixels.

The surface SHALL render as local application markup and CSS without canvas, a runtime service, or downloaded assets, and its first paint SHALL be inspectable in the node-side component test environment.

#### Scenario: Assistive technology can choose either root

- **WHEN** the root-pair surface is rendered
- **THEN** Root 1 and Root 2 are separately named controls
- **AND** exactly one exposes the active state

#### Scenario: The fullest pair fits the lesson surface

- **WHEN** two representative signed fraction entries and the keypad are rendered at 375 pixels
- **THEN** the page and answer surface do not overflow horizontally
- **AND** the Check action remains reachable
