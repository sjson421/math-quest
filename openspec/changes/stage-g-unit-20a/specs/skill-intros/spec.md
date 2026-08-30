## ADDED Requirements

### Requirement: Stage G geometry intros preserve the practice representation

Each selected Unit 20 intro SHALL render its stable geometry figure and provided formula choices
through the same accessible markup used in practice, suppress the interactive answer frame,
and present a separate learner-facing exact or approximate correct answer followed by the
worked steps.

All six complete intros SHALL remain readable at a 375-by-812-pixel viewport without
horizontal or page overflow. The figure labels, right-angle marks, formulas, correct answer,
teaching line, worked steps, leave action, and forward action SHALL remain visible and
legible.

#### Scenario: A geometry intro is not a second answer surface

- **WHEN** a selected Stage G intro opens
- **THEN** it shows the same figure and formula choices as its fixed practice problem
- **AND** it exposes no keypad, answer slot, hint control, or submission action

#### Scenario: Approximate circle answers remain learner-facing

- **WHEN** a circumference or circle-area intro opens
- **THEN** its correct answer shows the rounded numeric target rather than an internal tolerance
  or encoding

#### Scenario: Every Unit 20a intro fits the installed phone surface

- **WHEN** all six selected intros are exercised at 375 by 812 pixels
- **THEN** each complete intro remains readable without horizontal or page overflow
