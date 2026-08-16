## Purpose

Unit 16a teaches the first six coordinate-plane and linear-graph skills through generated,
independently verifiable problems on the existing offline graph and answer surfaces.

## ADDED Requirements

### Requirement: Plotting points diagnoses ordered-pair mistakes

A `plot-points` problem SHALL state one non-axis integer ordered pair and require the learner
to place that exact point through coordinate-plane input. The target's coordinates SHALL be
distinct so reversing `(x, y)` produces a different reachable point.

As both a `quick` skill and a wall, each problem SHALL preserve the manifest's five-correct
lesson target and SHALL carry at least two distinct reachable point misconceptions: reversing
the coordinate order and reversing the vertical direction. Neither prediction SHALL equal the
answer or the other prediction after central point filtering.

#### Scenario: The first coordinate sets horizontal position

- **WHEN** a problem asks the learner to plot `(−2, 3)`
- **THEN** the exact point answer is `{ x: −2, y: 3 }`
- **AND** `(3, −2)` is diagnosed as reversed coordinate order

#### Scenario: Every wall diagnosis can be placed

- **WHEN** any `plot-points` problem is generated
- **THEN** its answer and both predicted points lie on the displayed lattice
- **AND** two distinct misconception tags survive to the learner

### Requirement: Quadrants are read from one plotted point

A `quadrants` problem SHALL display exactly one integer point whose x and y coordinates are
both non-zero and require the learner to choose Quadrant I, II, III, or IV. All four choices
SHALL be offered, and the correct stable choice identity SHALL be derived from the signs of the
plotted point rather than from its authored label.

#### Scenario: A negative x and positive y identify Quadrant II

- **WHEN** the displayed point is `(−3, 2)`
- **THEN** the correct choice is Quadrant II
- **AND** all four quadrant choices remain available

#### Scenario: Axis points are excluded

- **WHEN** a `quadrants` problem is generated
- **THEN** neither coordinate of its plotted point is zero
- **AND** exactly one quadrant applies

### Requirement: A table row is placed on the graph

A `table-to-graph` problem SHALL present a semantic two-column x/y table containing at least
three distinct integer coordinate rows from one linear relationship. It SHALL identify one row
by its x-value and require that row's ordered pair through coordinate-plane input. Every other
row SHALL already appear as a plotted point, while the target row SHALL not be pre-plotted.

The answer SHALL be derived from the identified table row, not from prose or the stated point
answer. The table, plotted points, and target SHALL agree, and a swapped x/y prediction SHALL
remain a reachable wrong placement.

#### Scenario: The named table row supplies the point

- **WHEN** a table contains rows `(−2, −1)`, `(0, 1)`, and `(2, 3)` and asks for the row where
  `x = 2`
- **THEN** the exact point answer is `(2, 3)`
- **AND** the other two rows are already plotted

#### Scenario: The table is structured content rather than a chart

- **WHEN** a `table-to-graph` problem is presented
- **THEN** its x and y values are exposed as table headers and cells
- **AND** no chart capability, canvas, authored SVG, or runtime download is required

### Requirement: Slope from a graph uses marked lattice points

A `slope-from-graph` problem SHALL display one non-horizontal, non-vertical line and two
distinct marked integer points on that line. The absolute rise and run between those points
SHALL differ, so the slope is not `1` or `−1`. It SHALL require the exact reduced slope through
the numeric keypad, permitting a fraction slash when the reduced denominator is greater than
one and a sign whenever the answer or a reachable prediction is negative.

The answer SHALL be derived as rise over run from the two marked points. A finite, distinct
run-over-rise prediction SHALL be carried and SHALL be enterable on the declared keypad.

#### Scenario: Rise over run is read from the graph

- **WHEN** the marked points are `(−2, −1)` and `(2, 1)`
- **THEN** the exact slope is `2/4`, reduced to `1/2`
- **AND** the keypad permits the fraction slash

#### Scenario: A negative slope can be entered

- **WHEN** the marked line falls as x increases
- **THEN** the reduced slope answer is negative
- **AND** the keypad permits a sign

### Requirement: Slope from two points preserves subtraction order

A `slope-from-points` problem SHALL display exactly two distinct integer points with no line
drawn between them and require their exact reduced slope through the numeric keypad. The two
points SHALL differ in both x and y, and the absolute rise and run SHALL differ, so the slope
is finite, non-zero, and not `1` or `−1`.

As a wall, every problem SHALL carry at least two distinct surviving misconceptions:

- subtracting the y-coordinates in one point order and the x-coordinates in the other, which
  negates the correct slope;
- dividing run by rise, which takes the reciprocal.

Both predictions SHALL be finite, distinct from the answer and from each other, and enterable
through the problem's declared keypad.

#### Scenario: Both differences use the same point order

- **WHEN** the displayed points are `(−1, 1)` and `(3, 3)`
- **THEN** the exact slope is `(3 − 1) / (3 − (−1)) = 1/2`
- **AND** `−1/2` is diagnosed as inconsistent subtraction order
- **AND** `2` is diagnosed as run over rise

#### Scenario: Every wall problem retains two diagnoses

- **WHEN** any `slope-from-points` problem is generated
- **THEN** two distinct misconception tags survive central filtering
- **AND** neither predicted value equals the exact slope

### Requirement: A y-intercept is read where a line crosses the vertical axis

A `y-intercept` problem SHALL display one non-vertical line with an integer y-intercept and
require that signed integer through the numeric keypad. The answer SHALL be independently
derived from the displayed line's two defining points rather than carried as an unverified
label.

The skill SHALL predict reading another line property, such as its slope, as the intercept;
that prediction SHALL differ from the answer and SHALL be enterable through the declared
keypad.

#### Scenario: The crossing at x zero is the answer

- **WHEN** a displayed line passes through `(0, −3)` and `(2, 1)`
- **THEN** the exact y-intercept is `−3`
- **AND** the keypad permits a sign

#### Scenario: A non-integer intercept is not generated

- **WHEN** any `y-intercept` problem is generated in this increment
- **THEN** its displayed line crosses the y-axis at an integer lattice value
- **AND** that value lies inside the displayed bounds

### Requirement: Unit 16a is playable without another capability

The system SHALL register `plot-points`, `quadrants`, `table-to-graph`, `slope-from-graph`,
`slope-from-points`, and `y-intercept` in manifest order. Every scoped skill SHALL satisfy the
existing determinism, independent-answer, difficulty, variety, content, recorded-output, and
phone-layout gates. Stage F SHALL declare the already-available `choice-input` capability used
by `quadrants` without changing `AVAILABLE_CAPABILITIES`.

This increment SHALL leave `slope-intercept` through `parallel-perpendicular` planned and
SHALL leave roadmap item 23 open.

#### Scenario: Six skills become implemented

- **WHEN** the six Unit 16a generators are registered
- **THEN** all six resolve as `implemented` in manifest order
- **AND** the playable total becomes 151

#### Scenario: The unit remains incomplete

- **WHEN** increment 16a is complete
- **THEN** Unit 16's final four skills remain planned
- **AND** Stage F declares `choice-input` beside its existing required capabilities
- **AND** `AVAILABLE_CAPABILITIES` remains unchanged
