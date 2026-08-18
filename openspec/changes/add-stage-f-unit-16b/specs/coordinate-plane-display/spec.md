## ADDED Requirements

### Requirement: A linear equation remains structured beside its graph

A coordinate-plane problem MAY present a linear equation in slope-intercept form beside its
graph. The visible `y = mx + b` equation SHALL be derived from structured integer slope and
intercept values, with conventional omission of coefficient `1`, natural subtraction for a
negative intercept, and one complete accessible text representation.

The context SHALL appear with the same passive plane that owns the problem and SHALL NOT add a
second graph, answer entry, canvas, or runtime dependency.

#### Scenario: Equation and graph share one relationship

- **WHEN** structured context declares slope `2` and intercept `−3`
- **THEN** the learner sees `y = 2x − 3` beside the one coordinate plane
- **AND** any matching displayed line is derived from that same relationship

#### Scenario: A negative unit slope is written naturally

- **WHEN** structured context declares slope `−1` and intercept `2`
- **THEN** the learner sees `y = −x + 2`
- **AND** no implementation-only coefficient or ASCII subtraction leaks into the equation

### Requirement: Two candidate lines remain one graph-reading choice composition

A graph-from-equation problem SHALL be able to show exactly two mathematically distinct lines
on the existing passive coordinate plane while ordinary text choices remain its only answer
surface. The first line SHALL retain the renderer's solid style and line-1 accessible order;
the second SHALL retain its dashed style and line-2 accessible order. Text choices SHALL
identify those same ordinal styles without embedding another graph.

The equation context, both candidate lines, and choices SHALL remain legible without
horizontal overflow at a 375-pixel viewport.

#### Scenario: Choice identities map to rendered line order

- **WHEN** a graph-from-equation plane declares two candidate lines
- **THEN** `Line 1 (solid)` identifies the first declared line
- **AND** `Line 2 (dashed)` identifies the second declared line

#### Scenario: Candidate lines need no graphical choice cards

- **WHEN** the learner chooses which line matches the equation
- **THEN** one full-sized plane renders both candidates
- **AND** the choice buttons remain ordinary labelled text controls

#### Scenario: Equation choices fit at phone width

- **WHEN** a representative two-line equation problem is presented at 375 pixels wide
- **THEN** its equation, graph, line styles, and choice controls do not overflow horizontally
- **AND** both candidates remain visually distinguishable without color alone
