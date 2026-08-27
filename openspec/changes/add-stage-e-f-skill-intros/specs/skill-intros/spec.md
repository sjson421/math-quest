## MODIFIED Requirements

### Requirement: The worked example is complete, accessible markup

The intro SHALL reuse the existing exhaustive problem display renderer and SHALL suppress its interactive answer slot. It SHALL present one separate, clearly labelled correct answer for every existing answer shape, including exact, approximate, choice, expression, point, and root-pair answers, followed by the shared worked-step list. It SHALL expose no keypad, choice buttons, placement targets, hint control, or answer submission action.

Every Stage A intro SHALL keep its teaching line, example, answer, worked steps, leave action, and forward action readable at a 375-by-812-pixel viewport without horizontal or page overflow. The teaching line, example, answer, and actions SHALL have clear accessible names and reading order.

Every Stage B intro SHALL keep the same complete content and actions readable at a
375-by-812-pixel viewport without horizontal or page overflow.

Every Stage C and Stage D intro SHALL keep the same complete content and actions readable at
a 375-by-812-pixel viewport without horizontal or page overflow. Diagram-based examples SHALL
render through the same accessible diagram markup used by practice problems and SHALL remain
complete at that viewport.

Every Stage E and Stage F intro SHALL keep the same complete content and actions readable at
a 375-by-812-pixel viewport without horizontal or page overflow. Notation, equation,
coordinate-plane, expression-answer, and root-pair examples SHALL render through the same
accessible markup used by practice problems and SHALL remain complete at that viewport.

#### Scenario: An intro is not an answer surface

- **WHEN** a worked example is shown
- **THEN** its display and correct answer are readable as markup
- **AND** no answer input or submission control is offered

#### Scenario: Every answer shape has a learner-facing label

- **WHEN** an intro example carries any supported answer shape
- **THEN** its correct answer is rendered as learner-facing text rather than an internal id or encoding

#### Scenario: Stage A fits the installed phone surface

- **WHEN** each of the eight Stage A intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Stage B fits the installed phone surface

- **WHEN** each of the 44 Stage B intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Stages C and D fit the installed phone surface

- **WHEN** each of the 59 Stage C and Stage D intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: A diagram intro keeps the practice representation

- **WHEN** a Stage D intro presents a generated diagram example
- **THEN** the full diagram remains readable as accessible markup
- **AND** the intro adds no second diagram renderer or interactive answer surface

#### Scenario: Stages E and F fit the installed phone surface

- **WHEN** each of the 62 Stage E and Stage F intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Advanced examples keep their practice representation

- **WHEN** a Stage E or Stage F intro presents notation, an equation, a coordinate plane, an expression answer, or a root pair
- **THEN** the full representation remains readable as accessible markup
- **AND** the intro adds no second renderer or interactive answer surface
