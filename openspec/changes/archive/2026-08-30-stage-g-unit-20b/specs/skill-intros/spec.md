## MODIFIED Requirements

### Requirement: Stage G geometry intros preserve the practice representation

Each selected Unit 20 intro SHALL render its stable geometry figure and provided formula choices
through the same accessible markup used in practice, suppress the interactive answer frame,
and present a separate learner-facing exact or approximate correct answer followed by the
worked steps.

All twelve complete intros through `pythagorean` SHALL remain readable at a 375-by-812-pixel
viewport without horizontal or page overflow. The complete figure, dimension labels, relevant
right-angle or radius marks, prism net faces, formulas, correct answer, teaching line, worked
steps, leave action, and forward action SHALL remain visible and legible.

#### Scenario: A geometry intro is not a second answer surface

- **WHEN** a selected Stage G intro opens
- **THEN** it shows the same figure and formula choices as its fixed practice problem
- **AND** it exposes no keypad, answer slot, hint control, or submission action

#### Scenario: Approximate circle answers remain learner-facing

- **WHEN** a circumference or circle-area intro opens
- **THEN** its correct answer shows the rounded numeric target rather than an internal tolerance
  or encoding

#### Scenario: Approximate solid answers remain learner-facing

- **WHEN** a cylinder, cone, or sphere intro opens
- **THEN** its correct answer shows the rounded nearest-tenth target without the internal
  tolerance or unit-entry syntax

#### Scenario: Every Unit 20 intro through 20b fits the installed phone surface

- **WHEN** all twelve selected intros are exercised at 375 by 812 pixels
- **THEN** each complete intro remains readable without horizontal or page overflow
- **AND** the surface-area net and longest radical formula remain visible and legible
