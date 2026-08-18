# coordinate-plane-display Specification

## Purpose

Coordinate-plane display presents linear graphs as structured, accessible, phone-readable
figures before the learner is asked to place anything on the plane.

## Requirements

### Requirement: A coordinate plane carries its mathematical structure

A coordinate plane SHALL declare an x-axis and y-axis as inclusive integer bounds with a
positive integer step. Each axis SHALL have a negative minimum and positive maximum, place
zero on a declared tick, divide into a whole number of equal intervals, and contain from two
through twenty intervals. The plane MAY declare distinct integer points and SHALL declare no
more than two lines, each defined by two distinct integer points on that infinite line.
When two lines are declared, they SHALL describe mathematically distinct infinite lines.

The declaration SHALL carry graph values as structured data rather than authored SVG or other
presentation markup. A declared point SHALL lie within both axis bounds. A declared line SHALL
cross the visible bounds at two exact, distinct intersections that remain distinct in the
numeric graph coordinate returned by direct rational-to-number conversion and in the fixed
viewBox coordinates produced by the renderer's transform. Invalid axes, duplicate points,
degenerate lines, coincident line declarations, lines whose exact intersections collapse in
either numeric coordinate space, a third line, and graphs containing non-finite or non-integer
coordinates SHALL be rejected rather than rendered misleadingly.

#### Scenario: A bounded graph carries points and one line

- **WHEN** a plane declares integer axes from −5 through 5, points at (−2, 1) and (2, 3),
  and a line through (0, 2) and (2, 3)
- **THEN** the bounds, tick spacing, points, and line are recoverable from the declaration
- **AND** no authored drawing is needed to recover that graph

#### Scenario: Two defining points describe the visible part of an infinite line

- **WHEN** a line is defined by two distinct integer points and crosses the plane bounds
- **THEN** its visible segment reaches the bounds derived from that same line
- **AND** neither endpoint of the visible segment needs to be authored separately

#### Scenario: Invalid graph data is rejected

- **WHEN** an axis does not cross zero, does not place zero on a tick, its step does not divide
  its span, a point is outside the bounds, a line has no visible segment, or two declarations
  describe the same infinite line
- **THEN** the plane is rejected rather than rendered as a different graph

#### Scenario: An unrenderably short exact segment fails closed

- **WHEN** a line has two exact boundary intersections but either direct graph-coordinate
  rounding or the fixed viewBox transform maps both intersections to the same numeric point
- **THEN** the plane is rejected rather than drawing a zero-length line

#### Scenario: Rational conversion avoids interpolation cancellation

- **WHEN** a line through (10000000000000000, 1) and (−10000000000000000, −1) is clipped to
  axes from −5 through 5
- **THEN** its boundary ordinates convert directly from their exact fractions to 5e−16 and
  −5e−16
- **AND** floating interpolation does not perturb those coordinates before the one required
  numeric rounding

#### Scenario: The fixed viewBox owns transform collapse

- **WHEN** the line through (6, −4) and (1125899906842631, 1125899906842620) has distinct
  graph-space numeric boundary intersections but the fixed viewBox maps both to (292, 292)
- **THEN** the renderer rejects the line rather than drawing a zero-length mark

### Requirement: Every graph has one derived accessible name

Each rendered plane SHALL expose exactly one image role whose accessible name describes and
is derived from its axis bounds, tick spacing, plotted points, and line-defining points. The
axes, gridlines, ticks, labels, points, and line marks inside the figure SHALL be excluded from
the accessibility tree.

#### Scenario: A one-line graph is announced once

- **WHEN** a plane from −5 through 5 on both axes contains a line through (0, 1) and (2, 3)
- **THEN** assistive technology finds one image named with both axis ranges and that line
- **AND** it does not encounter the SVG's individual ticks or marks as separate content

#### Scenario: A two-line graph names both lines in declaration order

- **WHEN** a plane declares two lines
- **THEN** its accessible name identifies line 1 and line 2 with each line's two defining
  points
- **AND** the accessible name cannot drift from the values used to draw either line

### Requirement: Coordinate planes render on the offline phone surface

Coordinate planes SHALL render from local application markup without canvas, a runtime
service, external assets, or a separately downloaded rendering dependency. Axes, integer
gridlines, numeric tick labels, plotted points, and one or two clipped lines SHALL remain
legible without horizontal overflow at a 375-pixel viewport. When two lines are present they
SHALL remain distinguishable without relying on color alone.

#### Scenario: Static rendering exposes the complete graph

- **WHEN** representative point, one-line, and two-line planes are rendered in the node-side
  component test environment
- **THEN** their SVG axes, gridlines, labels, points, lines, and singular accessible
  names are present in static markup
- **AND** line centerlines end at their computed plot-boundary intersections
- **AND** a plot-area clip keeps the full painted stroke inside the rectangular graph bounds

#### Scenario: The densest supported plane fits a phone

- **WHEN** a plane with twenty intervals on each axis, plotted points, and two crossing lines
  is rendered at 375 pixels wide
- **THEN** neither the page nor the graph overflows horizontally
- **AND** adjacent gridlines remain at least 12 CSS pixels apart
- **AND** the two line styles remain visually distinct

#### Scenario: The installed app needs no graph download

- **WHEN** the app renders a coordinate plane while offline
- **THEN** all graph markup and styling are already available locally

### Requirement: A coordinate-plane display uses the existing lesson entry

A problem SHALL be able to present a coordinate plane as its display while continuing to use
the answer control declared by its input mode. Coordinate-plane display by itself SHALL NOT
introduce point placement, another answer value, another submission path, or capability
availability. When the input mode is choice, the choices SHALL own the answer surface and the
display SHALL NOT repeat the selected choice as an answer echo. Number-line input SHALL
likewise keep its number line as the answer surface without a display-owned echo. When the
input mode is keypad or expression, the display SHALL frame the existing entry neutrally as
`Answer`. No input mode SHALL assert that the coordinate plane equals the answer entry.

When the problem explicitly declares coordinate-plane input, the same coordinate-plane
declaration SHALL instead supply the interactive point surface specified by
`coordinate-plane-input`. That mode SHALL replace the passive graph in the lesson rather than
rendering a second copy.

#### Scenario: A graph-reading problem keeps its declared answer control

- **WHEN** a problem presents a coordinate plane and declares choice input
- **THEN** the lesson presents the graph with its existing choice answer surface
- **AND** the selected choice continues through the ordinary answer checker
- **AND** the display does not repeat the selected choice or present a graph-equals-choice
  relationship

#### Scenario: A keypad or expression graph answer uses neutral framing

- **WHEN** a problem presents a coordinate plane and declares keypad or expression input
- **THEN** the lesson presents its existing entry slot beneath a neutral `Answer` label
- **AND** the display does not assert that the coordinate plane equals the typed value

#### Scenario: Number-line input keeps its own answer surface

- **WHEN** a problem presents a coordinate plane and declares number-line input
- **THEN** the lesson presents its existing number-line answer surface without a display-owned
  entry echo
- **AND** the display does not assert that the coordinate plane equals the placed value

#### Scenario: Coordinate-plane input replaces the passive graph

- **WHEN** a problem presents a coordinate plane and declares coordinate-plane input
- **THEN** the lesson presents one interactive graph derived from that display declaration
- **AND** it does not also present the passive graph or another answer surface

#### Scenario: Display infrastructure does not make Stage F playable

- **WHEN** coordinate-plane display exists without coordinate-plane input
- **THEN** the coordinate-plane manifest capability remains unavailable
- **AND** every Stage F skill remains planned

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
