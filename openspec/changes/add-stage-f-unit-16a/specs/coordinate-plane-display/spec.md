## ADDED Requirements

### Requirement: Coordinate content context remains structured beside the graph

A coordinate-plane problem MAY present operation-specific context beside its graph. A stated
point SHALL be rendered from a structured ordered pair. A table-to-graph problem SHALL render
its structured rows as semantic table markup with x and y headers and SHALL identify the row
the learner is asked to place.

The context SHALL appear with the same passive or interactive plane that owns the problem; it
SHALL NOT create a second graph, second plane declaration, second answer entry, canvas, or
external asset. The graph SHALL retain exactly one derived image name, while a table SHALL
retain its own table semantics rather than being folded into that image name.

#### Scenario: A target point accompanies one interactive plane

- **WHEN** `plot-points` states an ordered pair and declares coordinate-plane input
- **THEN** the ordered pair is visible beside the single interactive plane
- **AND** placement and confirmation continue through that plane's existing answer surface

#### Scenario: A semantic table accompanies one interactive plane

- **WHEN** `table-to-graph` presents x/y rows and declares coordinate-plane input
- **THEN** the lesson exposes x and y headers and every row as table markup
- **AND** presents one interactive plane and no other answer control

#### Scenario: Passive graph reading keeps its existing surface

- **WHEN** a quadrant, slope, or intercept problem carries operation-specific coordinate data
- **THEN** the plane retains one derived accessible image name
- **AND** its declared choice or keypad input remains the only answer surface

### Requirement: Coordinate context and graph fit together on a phone

The operation context, graph, adjustment controls when present, confirmation control, and
answer entry when present SHALL fit without horizontal overflow at a 375-pixel viewport. The
context SHALL remain legible without shrinking graph tick labels below the existing graph
contract.

#### Scenario: The table-to-graph composition fits at phone width

- **WHEN** a representative table-to-graph problem is presented at 375 pixels wide
- **THEN** the semantic table, interactive plane, nudge controls, and confirmation control do
  not overflow horizontally
- **AND** the table headers, target row, plotted points, and placement remain visually distinct

#### Scenario: A passive slope problem fits with its answer frame

- **WHEN** a representative fractional slope problem is presented at 375 pixels wide
- **THEN** the graph, neutral answer frame, and fraction-capable keypad do not overflow
- **AND** the two marked points and line remain visually legible
