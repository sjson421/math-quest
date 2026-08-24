## Purpose

Chart rendering presents labelled bar, line, and scatter data as accessible, phone-readable
graphics whose visible marks and non-visual values come from one validated declaration.

## ADDED Requirements

### Requirement: A chart carries its complete mathematical structure

A chart SHALL declare a trimmed non-empty title of at most 32 characters, horizontal and
vertical axis labels of at most 16 characters each, and one of three kinds: bar, line, or
scatter. It SHALL carry every label and numeric value used to draw the chart as structured
data rather than authored SVG, prose, or presentation coordinates. Every numeric scale field,
series value, and point coordinate SHALL be a safe integer from −999 through 999.

Bar and line charts SHALL carry two through six distinct category labels of at most eight
characters each and one or two distinctly named series with labels of at most 12 characters
each. Every categorical series SHALL contain exactly one value for each category. Its vertical
scale SHALL have ordered bounds, a positive step that divides the span into two through ten
integer intervals, and SHALL contain every value. A bar chart's scale SHALL include zero so bar
length has a truthful baseline.

Scatter charts SHALL carry one or two distinctly named series, with labels of at most 12
characters each, of three through twelve points per series. Both numeric axes SHALL have
ordered bounds and positive steps that divide their spans into two through ten integer
intervals, and SHALL contain every point. A scatter series that requests a trend line SHALL
contain at least two distinct horizontal coordinates; its line SHALL be derived from that
series rather than declared separately and clipped to the rectangular plot bounds.

#### Scenario: A categorical chart aligns values with labels

- **WHEN** a line chart declares labels `Jan`, `Feb`, and `Mar` and a series with values 4, 7,
  and 5
- **THEN** those three values align with those labels in declaration order
- **AND** no authored drawing coordinates are needed to recover the relationship

#### Scenario: A scatterplot carries its plotted evidence

- **WHEN** a scatter series declares six points inside its two axis scales
- **THEN** every plotted mark is derived from those six ordered pairs
- **AND** any requested trend line is computed from the same points

#### Scenario: Invalid chart data is rejected

- **WHEN** a chart has duplicate, empty, or overlong labels; mismatched category and value
  counts; non-integer, unsafe, or out-of-range values; unsupported series or item counts; an
  invalid tick scale; or a requested trend line with no horizontal variation
- **THEN** it is rejected rather than rendered as a different or misleading chart

### Requirement: Every chart has one derived accessible name and a textual data path

Each rendered chart SHALL expose exactly one image role whose accessible name is derived from
its title, kind, axes, and series names. The axes, ticks, labels, legend, bars, lines, points,
and trend marks inside the graphic SHALL be excluded from the accessibility tree.

The same declaration SHALL also expose every category or ordered pair and every series value
through semantic table markup with a caption, column headers, and data cells. The table MAY be
visually hidden, but it SHALL remain reachable as structured text without requiring pointer
input or chart interpretation.

#### Scenario: A two-series bar chart is announced once

- **WHEN** a labelled two-series bar chart is rendered
- **THEN** assistive technology finds one image named from the chart declaration
- **AND** it does not encounter individual SVG marks as separate content

#### Scenario: Categorical values remain reachable as text

- **WHEN** a bar or line chart has category labels and two named series
- **THEN** its semantic table has one category row per label and one value column per series
- **AND** every table value equals the value used to draw its corresponding mark

#### Scenario: Scatter values remain reachable as text

- **WHEN** a scatter chart has one or two named point series
- **THEN** its semantic table identifies each series and exposes every x and y coordinate
- **AND** no separately authored text can disagree with the plotted points

### Requirement: Charts render on the offline phone surface

Bar, line, and scatter charts SHALL render from local application markup without canvas, a
runtime service, external assets, or a separately downloaded rendering dependency. They SHALL
share axes, tick labels, axis titles, and a series legend. Multiple series SHALL remain
distinguishable without relying on color alone.

#### Scenario: Static rendering exposes every chart kind

- **WHEN** representative bar, line, and scatter declarations are rendered in the node-side
  component test environment
- **THEN** their SVG axes, labels, legends, data marks, optional trend line, singular image
  names, and semantic data tables are present in static markup
- **AND** no canvas or external asset is present

#### Scenario: The densest supported charts fit a phone

- **WHEN** a six-category two-series categorical chart and a twelve-point two-series scatter
  chart use the maximum supported text lengths and four-character numeric labels with ten tick
  intervals at a 375-pixel viewport
- **THEN** neither the page nor the chart composition overflows horizontally
- **AND** category labels, tick labels, legends, bars, line points, scatter points, and trend
  lines remain legible and do not collide

#### Scenario: Series do not depend on color alone

- **WHEN** a chart renders two series
- **THEN** grouped bars use distinct patterns and line or scatter series use distinct marker or
  stroke styles in addition to palette color
- **AND** the legend exposes the same non-color distinction

#### Scenario: The installed app needs no chart download

- **WHEN** the app renders a chart while offline
- **THEN** all chart markup and styling are already available locally

### Requirement: A chart display uses the existing lesson entry

A problem SHALL be able to present a chart as its display while continuing to use the answer
control declared by its input mode. Chart rendering SHALL NOT introduce another answer value,
input mode, or submission path. A keypad or expression answer SHALL use a neutral `Answer`
frame beneath the chart; an answer control that owns its own surface SHALL not gain a duplicate
display entry. No chart SHALL be presented as equal to the answer entry.

#### Scenario: A chart-reading choice keeps one answer surface

- **WHEN** a chart problem declares choice input
- **THEN** the chart appears with the existing choice controls
- **AND** the display does not repeat the selected choice or add another answer frame

#### Scenario: A numeric chart answer uses neutral framing

- **WHEN** a chart problem declares keypad input
- **THEN** the existing entry slot appears beneath a neutral `Answer` label
- **AND** the display does not assert that the chart equals the typed number

### Requirement: Chart infrastructure fails closed before content assigns meaning

Chart validation, learner-text collection, recorded output, and difficulty-source measurement
SHALL each read the structured chart declaration explicitly. Recorded output SHALL include all
labels, scales, series, points, and the trend-line request. Until a content operation declares
which chart relationship determines the answer, independent answer verification SHALL reject
the problem rather than trust its stated answer.

#### Scenario: Infrastructure cannot invent a chart answer

- **WHEN** a valid chart display reaches independent verification without operation-specific
  chart data
- **THEN** verification reports that operation-specific data is required
- **AND** it does not accept the problem's stated answer as evidence

#### Scenario: Every chart source survives recorded output

- **WHEN** a chart declaration is recorded for deterministic review
- **THEN** the record identifies its kind, title, axes, categories when present, every series
  value or point, and whether each scatter trend line is requested
- **AND** changing any chart source value changes the record
