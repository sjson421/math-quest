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

### Requirement: A probability answers as a fraction

Every `basic-probability` and `compound-probability` problem SHALL require its exact
probability written as a fraction through the existing numeric keypad, which offers the fraction
slash in its one adaptive cell and therefore no decimal point on these problems.

The declared form SHALL still be checked, so the answer contract is explicit and stays correct
if that cell ever changes: a right value written as a decimal SHALL be reported as a form miss
rather than a wrong answer — it SHALL NOT advance, it SHALL record a miss and re-queue the
problem, and it SHALL NOT reveal the worked solution, because the arithmetic was already
correct.

Simplest form SHALL NOT be additionally required. An unreduced entry equal in value SHALL be
accepted, matching a written ratio of counts rather than the skills that teach reduction.

Every generated probability SHALL be strictly greater than 0 and strictly less than 1,
including the combined value of an `or` problem, so no problem asks for a fraction whose
answer is a whole number.

#### Scenario: The pad offers the fraction slash, not a decimal point

- **WHEN** a probability problem declares its keypad
- **THEN** it allows fraction entry and declares no decimal entry
- **AND** the pad's one adaptive cell shows the slash, so a decimal is not typable

#### Scenario: A decimal entry is diagnosed as a form miss

- **WHEN** `0.5` is checked against an exact probability of `1/2`
- **THEN** the result is a form miss naming the value correct and asking for a fraction
- **AND** its response records a miss, re-queues the problem, and keeps the worked solution
  hidden

#### Scenario: An unreduced fraction is accepted

- **WHEN** the exact probability is `1/2` and the learner submits `4/8`
- **THEN** the answer is correct
- **AND** no simplest-form prompt is shown

#### Scenario: No generated probability is certain or impossible

- **WHEN** either probability skill is sampled across seeds and difficulties
- **THEN** every exact answer lies strictly between 0 and 1
- **AND** every exact answer has a denominator greater than 1

### Requirement: Basic probability compares favourable outcomes with the total

A `basic-probability` problem SHALL state a situation with a countable set of equally likely
outcomes and ask for the probability of one described event. It SHALL carry the favourable
count and the total count as typed source data beside the visible story, and the visible story
SHALL state counts that agree with that data.

The exact answer SHALL be the favourable count over the total count. Every problem SHALL
predict at least one collision-proof numeric misconception: comparing the favourable count with
the remaining outcomes instead of the total.

#### Scenario: The denominator is the whole outcome set

- **WHEN** a bag holds 3 red and 5 blue counters and the question asks for red
- **THEN** the exact answer is `3/8`
- **AND** `3/5` diagnoses comparing red with the other colour instead of the total

### Requirement: Compound probability distinguishes and from or

A `compound-probability` problem SHALL combine two stated events under exactly one cue. An
`and` problem SHALL combine two independent events by multiplying their probabilities. An `or`
problem SHALL combine two mutually exclusive events over one outcome set by adding theirs.
Both cues SHALL occur across seeded samples, and the problem SHALL carry each event's
favourable and total counts and its cue as typed source data.

As a curriculum wall, every generated problem SHALL retain at least two distinct numeric
misconceptions after central filtering: applying the operation the other cue calls for, and
combining the two events by adding numerators and denominators. Each prediction SHALL be
reachable through the declared keypad and SHALL differ from the exact answer and from every
other retained prediction, for every draw the generator allows.

#### Scenario: An and problem multiplies independent events

- **WHEN** one spinner lands on red with probability `1/2` and a second lands on blue with
  probability `1/3`, and the question asks for red and blue
- **THEN** the exact answer is `1/6`
- **AND** `5/6` diagnoses adding where the cue asked for multiplication
- **AND** `2/5` diagnoses adding numerators and denominators

#### Scenario: An or problem adds exclusive events

- **WHEN** a bag of 10 counters holds 3 red and 4 green, and the question asks for red or green
- **THEN** the exact answer is `7/10`
- **AND** `3/25` diagnoses multiplying where the cue asked for addition
- **AND** `7/20` diagnoses adding numerators and denominators

### Requirement: Counting outcomes multiplies the independent choices

A `counting-outcomes` problem SHALL state two or more independent stages, each with its own
number of choices, and ask how many complete outcomes are possible. It SHALL carry every
stage's choice count as typed source data, and the exact answer SHALL be their product,
required as a whole number through the existing keypad with no fraction form.

Every problem SHALL predict the sum of the stage counts as a collision-proof misconception,
which is adding where the counting principle multiplies.

#### Scenario: Each stage multiplies the running total

- **WHEN** an outfit is built from 4 shirts, 3 trousers, and 2 hats
- **THEN** the exact answer is 24
- **AND** 9 diagnoses adding the stage counts instead of multiplying them

### Requirement: Unit 21b generation grows without degenerate data

Every selected generator SHALL be deterministic for one seed and difficulty. Outcome-set
sizes, event counts, or the number and size of independent stages SHALL grow measurably from
difficulty 1 through difficulty 5. Generated data SHALL vary across samples and SHALL reject
any draw that makes an answer ambiguous, drives a probability to 0 or 1, or makes a required
misconception collide with the answer or with another retained prediction.

#### Scenario: Higher difficulty increases visible work

- **WHEN** each selected skill is sampled across all five difficulties
- **THEN** its highest-difficulty source work is measurably larger than its lowest-difficulty
  source work
- **AND** both compound cues and every stage count occur across seeded samples

### Requirement: Unit 21b skills carry reviewed intro teaching lines

Each selected generator SHALL carry exactly the teaching line assigned below. Its intro SHALL
pair that line with the stable difficulty-1 example, correct answer, existing story display,
and worked steps. A probability intro SHALL show its correct answer as a fraction.

| Skill id | Teaching line |
|---|---|
| `basic-probability` | Probability compares the outcomes you want with all outcomes. |
| `compound-probability` | Multiply for and; add for or. |
| `counting-outcomes` | Multiply the number of choices at each step. |

#### Scenario: Every selected intro uses its reviewed line

- **WHEN** Unit 21b generator sources are checked
- **THEN** all three ids carry exactly the assigned teaching line
- **AND** every line satisfies the sentence, vocabulary, and forward-reference limits

#### Scenario: Intro answers remain independently recoverable

- **WHEN** each selected intro generates its fixed difficulty-1 example
- **THEN** its typed counts independently determine its exact answer
- **AND** the compound example retains both named wall predictions
