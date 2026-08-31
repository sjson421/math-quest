# unit-21-data-probability Specification

## Purpose

Teach the first six Unit 21 data and statistics skills through generated value lists and
accessible charts whose exact answers remain recoverable from visible source data.

## Requirements

### Requirement: Mean divides the total across every value

A `mean` problem SHALL show a generated list of whole-number values and require the exact
whole-number mean through the existing keypad. The list SHALL contain enough structured source
data to recover its visible order, count, sum, and answer without parsing learner-facing text.
Generated sums SHALL divide evenly by the number of values.

#### Scenario: Every value contributes to the mean

- **WHEN** the visible list is `4, 6, 8, 10`
- **THEN** the exact answer is 7
- **AND** the worked solution totals all four values before dividing by 4

### Requirement: Median sorts before finding the middle

A `median` problem SHALL show an intentionally unsorted list and require its exact
whole-number median through the existing keypad. Seeded problems SHALL include odd and even
list lengths; an even list SHALL have two sorted middle values whose average is a whole number.

As a curriculum wall, every generated problem SHALL retain two distinct numeric
misconceptions after central filtering: reading the middle position or positions from the
unsorted display, and calculating the arithmetic mean instead. Both predictions SHALL be
reachable through the declared keypad and SHALL differ from the median and each other.

#### Scenario: The displayed middle is not the sorted middle

- **WHEN** the visible order is `10, 1, 8, 2, 4`
- **THEN** sorting gives `1, 2, 4, 8, 10` and the exact median is 4
- **AND** 8 diagnoses using the unsorted middle
- **AND** 5 diagnoses calculating the mean

#### Scenario: An even list averages two sorted values

- **WHEN** the visible order is `2, 1, 11, 6`
- **THEN** sorting gives `1, 2, 6, 11` and the exact median is 4
- **AND** the worked solution averages 2 and 6 rather than choosing one of them

### Requirement: Mode and range alternate within one skill

A `mode-range` problem SHALL ask for either the mode or the range of a generated list. Every
list SHALL have exactly one mode, and the range SHALL be the greatest value minus the least.
Both operations SHALL occur across seeded samples and SHALL require an exact whole number
through the existing keypad.

#### Scenario: One list supports both requested properties

- **WHEN** the visible list is `2, 4, 4, 7, 9`
- **THEN** a mode problem has exact answer 4
- **AND** a range problem has exact answer 7

### Requirement: Weighted mean uses each declared weight

A `weighted-mean` problem SHALL show generated value-and-weight pairs. Its exact answer SHALL
equal the sum of every value times its weight divided by total weight. Draws SHALL produce a
whole-number result and a distinct whole-number ordinary mean so ignoring the weights remains a
reachable diagnosis through the same keypad.

#### Scenario: Larger weights contribute more copies

- **WHEN** values 60, 75, and 90 have weights 1, 2, and 3
- **THEN** the weighted total is 480 and total weight is 6
- **AND** the exact answer is 80 rather than the unweighted mean 75

### Requirement: Bar and line problems read one declared chart value

A `read-bar-line` problem SHALL generate both bar and line charts across seeded samples using
the existing validated chart surface. Each problem SHALL identify one category and series,
then require the exact integer at that chart position through the existing keypad. The target
selector SHALL refer to the same structured labels and values used by the visual marks and
semantic data table.

Charts SHALL stay within the existing category, series, label, scale, and phone-layout limits.
When two series are present, the requested series SHALL be named so no answer depends on color
or position alone.

#### Scenario: A categorical target selects one source value

- **WHEN** a line chart declares January, February, and March values 4, 7, and 5 for series
  `Books`
- **THEN** a prompt asking for February's `Books` value has exact answer 7
- **AND** verification recovers 7 from that category and series rather than the stated answer

#### Scenario: Both categorical chart kinds are practised

- **WHEN** `read-bar-line` is sampled across all difficulties
- **THEN** both bar and line charts occur
- **AND** one-series and two-series declarations remain unambiguous and readable

### Requirement: Scatterplots derive the direction of their trend line

A `read-scatterplot` problem SHALL show one validated scatter series with a trend line derived
from its plotted points. It SHALL ask whether the overall trend is increasing, decreasing, or
flat and SHALL use the existing choice surface. Independent verification SHALL derive that
choice from the least-squares slope of the visible points rather than from a carried answer
label.

Seeded samples SHALL produce all three trend directions. Every generated set SHALL have
distinct horizontal coordinates, a visible trend segment, and enough separation from zero to
make a non-flat direction unambiguous.

#### Scenario: A rising point set has an increasing trend

- **WHEN** the plotted points produce a positive least-squares slope
- **THEN** the derived trend line rises from left to right
- **AND** the correct choice is `Increasing`

#### Scenario: A horizontal trend remains a valid reading

- **WHEN** the plotted points produce a zero least-squares slope
- **THEN** the derived trend line is horizontal
- **AND** the correct choice is `Flat`

### Requirement: Unit 21a generation grows without degenerate data

Every selected generator SHALL be deterministic for one seed and difficulty. Value counts,
value magnitudes, weights, chart categories, chart scales, or scatter point sets SHALL grow
measurably from difficulty 1 through difficulty 5. Generated data SHALL remain inside its
display limits, vary across samples, and reject any draw that makes an answer ambiguous or a
required misconception collide.

#### Scenario: Higher difficulty increases visible work

- **WHEN** each selected skill is sampled across all five difficulties
- **THEN** its highest-difficulty source work is measurably larger than its lowest-difficulty
  source work
- **AND** every grouped list, chart kind, requested operation, and trend direction occurs

### Requirement: Unit 21a skills carry reviewed intro teaching lines

Each selected generator SHALL carry exactly the teaching line assigned below. Its intro SHALL
pair that line with the stable difficulty-1 example, correct answer, existing display, and
worked steps.

| Skill id | Teaching line |
|---|---|
| `mean` | Mean shares the total equally across all values. |
| `median` | Sort the values before finding the middle. |
| `mode-range` | Mode is most common; range is highest minus lowest. |
| `weighted-mean` | Multiply each value by its weight, then divide by total weight. |
| `read-bar-line` | Match the chart label to its bar or line value. |
| `read-scatterplot` | A trend line shows the overall direction of paired data. |

#### Scenario: Every selected intro uses its reviewed line

- **WHEN** Unit 21a generator sources are checked
- **THEN** all six ids carry exactly the assigned teaching line
- **AND** every line satisfies the sentence, vocabulary, and forward-reference limits

#### Scenario: Intro answers remain independently recoverable

- **WHEN** each selected intro generates its fixed difficulty-1 example
- **THEN** its list or chart source data independently determines its exact or choice answer
- **AND** the median example retains both named wall predictions
