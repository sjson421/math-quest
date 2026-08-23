# Unit 16 Coordinate Plane & Lines Specification

## Purpose

Unit 16a teaches the first six coordinate-plane and linear-graph skills through generated,
independently verifiable problems on the existing offline graph and answer surfaces.

## Requirements

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

### Requirement: Slope-intercept form identifies both coefficients

A `slope-intercept` problem SHALL show a generated equation in the form `y = mx + b` together
with its matching plotted line and SHALL ask for either its slope or y-intercept. The slope
SHALL be a non-zero integer and the intercept SHALL be an in-bounds integer distinct from the
slope. The exact numeric answer SHALL be derived from the selected coefficient, and the other
coefficient SHALL be carried as a reachable misconception.

#### Scenario: The x coefficient is the slope

- **WHEN** the equation is `y = 2x − 3` and the problem asks for slope
- **THEN** the exact answer is `2`
- **AND** `−3` is diagnosed as reading the intercept instead

#### Scenario: The constant is the y-intercept

- **WHEN** the equation is `y = −2x + 3` and the problem asks for y-intercept
- **THEN** the exact answer is `3`
- **AND** `−2` is diagnosed as reading the slope instead

### Requirement: An equation selects one of two rendered lines

A `graph-from-equation` problem SHALL show a generated `y = mx + b` equation with non-zero
integer slope and integer y-intercept beside one coordinate plane containing exactly two
distinct candidate lines. It SHALL require an ordinary text choice between `Line 1 (solid)`
and `Line 2 (dashed)`. Exactly one candidate SHALL have the equation's slope and intercept,
and the matching candidate SHALL occupy both declaration positions across sampled problems.

The wrong line SHALL result from a named, reachable equation-reading mistake such as reversing
rise and run or reversing the intercept sign. Its stable choice id SHALL be the problem's
text-valued misconception and SHALL differ from the answer id by construction.

#### Scenario: The matching candidate is selected

- **WHEN** the equation is `y = 2x + 1`, line 1 has that relationship, and line 2 does not
- **THEN** `Line 1 (solid)` is the correct choice
- **AND** the answer is derived from line 1's defining points

#### Scenario: The correct line does not leak by position

- **WHEN** graph-from-equation problems are sampled across seeds
- **THEN** each candidate identity is correct in some problems
- **AND** each choice-button position contains the correct answer in some problems

### Requirement: A plotted line is written as an expression

An `equation-from-graph` problem SHALL display one non-vertical line with a non-zero integer
slope and integer y-intercept and SHALL ask for the right side of `y =`. The learner SHALL
answer through existing single-variable expression input in `x`. The answer SHALL compare
under expanded linear-expression semantics, so an algebraically equivalent order is accepted.

#### Scenario: The graph supplies slope and intercept

- **WHEN** the line has slope `−2` and crosses the y-axis at `3`
- **THEN** `−2x + 3` is the expected right-side expression
- **AND** the answer is derived from the displayed line rather than an authored label

#### Scenario: Equivalent linear order is accepted

- **WHEN** the target right side is `2x − 3`
- **THEN** an expanded equivalent such as `−3 + 2x` is correct
- **AND** no equals sign or second variable is required from the learner

### Requirement: Parallel and perpendicular slopes preserve their relationship

A `parallel-perpendicular` problem SHALL display one non-horizontal, non-vertical line and ask
for the exact slope of a line parallel or perpendicular to it. Parallel answers SHALL equal
the reference slope. Perpendicular answers SHALL be its negative reciprocal. The keypad SHALL
offer a sign or fraction slash whenever the answer or a reachable prediction requires one.

A perpendicular problem SHALL diagnose at least one of using the unsigned reciprocal or
keeping the original slope. A parallel problem SHALL diagnose applying the negative reciprocal
when the slope should remain unchanged.

#### Scenario: Parallel lines keep slope

- **WHEN** the displayed line has slope `2/3` and a parallel slope is requested
- **THEN** the exact answer is `2/3`

#### Scenario: Perpendicular lines use the negative reciprocal

- **WHEN** the displayed line has slope `2/3` and a perpendicular slope is requested
- **THEN** the exact answer is `−3/2`
- **AND** the keypad permits both a sign and a fraction slash

### Requirement: Unit 16 remains complete as Unit 17 ships

The system SHALL keep all ten Unit 16 generators implemented in manifest order while Unit 17
becomes playable. Stage F's requirements and `AVAILABLE_CAPABILITIES` SHALL remain unchanged,
and roadmap item 23 SHALL stay open for Units 18–19.

#### Scenario: Unit 17 joins the completed coordinate-plane unit

- **WHEN** the four Unit 17 generators are registered
- **THEN** all ten Unit 16 skills and all four Unit 17 skills resolve as implemented
- **AND** the playable total becomes 159

#### Scenario: Remaining Stage F units stay planned

- **WHEN** increment 17 is complete
- **THEN** every skill in Units 18–19 remains planned
- **AND** roadmap item 23 remains unchecked
