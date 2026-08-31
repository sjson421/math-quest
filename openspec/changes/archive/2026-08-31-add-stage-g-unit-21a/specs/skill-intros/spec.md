## ADDED Requirements

### Requirement: Stage G data intros preserve list and chart representations

Each Unit 21a intro SHALL render its stable value list or chart through the same accessible
markup used in practice, suppress every interactive answer surface, and present one separate
learner-facing correct answer followed by the existing worked steps. A chart intro SHALL keep
its derived image name, visual marks, trend line where present, and semantic source-value
table.

All six Unit 21a intros SHALL remain readable at a 375-by-812-pixel viewport without
horizontal or page overflow. Their complete teaching line, list or chart, correct answer,
worked steps, leave action, and forward action SHALL remain visible and legible.

#### Scenario: A list intro is not an answer surface

- **WHEN** a mean, median, mode/range, or weighted-mean intro opens
- **THEN** it shows the same ordered source values as its fixed practice problem
- **AND** it exposes no keypad, answer slot, hint control, or submission action

#### Scenario: A chart intro keeps both accessible paths

- **WHEN** a bar, line, or scatter intro opens
- **THEN** it renders the same chart image, labels, marks, and semantic data table as practice
- **AND** it exposes no keypad, choice buttons, answer frame, or submission action

#### Scenario: Unit 21a intros fit the installed phone

- **WHEN** all six selected intros are exercised at 375 by 812 pixels
- **THEN** each complete intro remains readable without horizontal or page overflow
- **AND** chart axes, labels, marks, trend lines, and worked content remain visible and legible
