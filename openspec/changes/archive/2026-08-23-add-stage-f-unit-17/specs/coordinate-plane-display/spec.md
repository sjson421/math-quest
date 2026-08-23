## ADDED Requirements

### Requirement: A coordinate-plane answer may carry a system context
A coordinate-plane problem SHALL be able to show either two structured linear equations or a
fixed-frame systems situation with its two derived equations above the existing plane. The
context SHALL state the variable order used by the ordered-pair answer and provide one complete
accessible reading of every equation and story quantity.

The context and the coordinate-plane placement surface SHALL remain one lesson display. It
SHALL NOT add a second graph, a second answer control, canvas, or a runtime dependency.

#### Scenario: Algebraic systems use an empty answer plane
- **WHEN** substitution or elimination presents two equations
- **THEN** those equations appear above one coordinate-plane placement surface
- **AND** the plane draws no line or point that reveals the solution

#### Scenario: A graphing system keeps its two visible lines
- **WHEN** systems by graphing presents two lines
- **THEN** the same full system context and plane remain distinguishable by accessible names
- **AND** the solid and dashed line styles continue to distinguish the two equations without
  relying on color alone

#### Scenario: Systems fit the installed width
- **WHEN** representative equation and word-problem systems render at 375 pixels wide
- **THEN** their context, compact answer plane, and ordered-pair confirmation controls do not
  overflow horizontally or hide the learner's current selection
