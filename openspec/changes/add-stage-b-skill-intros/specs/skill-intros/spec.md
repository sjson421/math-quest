## MODIFIED Requirements

### Requirement: The worked example is complete, accessible markup

The intro SHALL reuse the existing exhaustive problem display renderer and SHALL suppress its interactive answer slot. It SHALL present one separate, clearly labelled correct answer for every existing answer shape, including exact, approximate, choice, expression, point, and root-pair answers, followed by the shared worked-step list. It SHALL expose no keypad, choice buttons, placement targets, hint control, or answer submission action.

Every Stage A intro SHALL keep its teaching line, example, answer, worked steps, leave action, and forward action readable at a 375-by-812-pixel viewport without horizontal or page overflow. The teaching line, example, answer, and actions SHALL have clear accessible names and reading order.

Every Stage B intro SHALL keep the same complete content and actions readable at a
375-by-812-pixel viewport without horizontal or page overflow.

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
