## Purpose

Coordinate-plane display presents linear graphs as structured, accessible, phone-readable
figures before the learner is asked to place anything on the plane.

## ADDED Requirements

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
the answer control declared by its existing input mode. Coordinate-plane display SHALL NOT
introduce point placement, another answer value, another submission path, or capability
availability. When the input mode is choice, the choices SHALL own the answer surface and the
display SHALL NOT repeat the selected choice as an answer echo. Number-line input SHALL
likewise keep its number line as the answer surface without a display-owned echo. When the
input mode is keypad or expression, the display SHALL frame the existing entry neutrally as
`Answer`. No input mode SHALL assert that the coordinate plane equals the answer entry.

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

#### Scenario: Display infrastructure does not make Stage F playable

- **WHEN** coordinate-plane display exists without coordinate-plane input or a Stage F
  generator
- **THEN** the coordinate-plane manifest capability remains unavailable
- **AND** every Stage F skill remains planned
