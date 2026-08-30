## Purpose

Teach the first six Unit 20 geometry skills through generated figures, provided GED formulas,
exact source measurements, and independently checked numeric answers.

## ADDED Requirements

### Requirement: Perimeter is derived from every outer side

A `perimeter` problem SHALL show a rectangle with generated length and width measurements,
one consistent length unit, and the provided rectangle references `P = 2l + 2w` and `A = lw`
without marking either as correct. It SHALL require the exact numeric perimeter through the
existing keypad and SHALL NOT require a unit to be typed.

#### Scenario: Both pairs of sides contribute

- **WHEN** the figure has length 7 cm and width 4 cm
- **THEN** the exact answer is 22
- **AND** the worked solution applies the provided formula to both pairs of equal sides

### Requirement: Rectangle area uses length times width

An `area-rectangle` problem SHALL show a rectangle with generated length and width
measurements, one consistent length unit, a visible right-angle mark, and the provided rectangle
references `P = 2l + 2w` and `A = lw` without marking either as correct. It SHALL require the
exact numeric area through the existing keypad.

#### Scenario: Rectangle dimensions produce square units

- **WHEN** the figure has length 8 m and width 3 m
- **THEN** the exact numeric answer is 24
- **AND** the prompt and worked solution identify the result as square metres without requiring
  the learner to type the unit

### Requirement: Triangle area keeps the one-half factor

An `area-triangle` problem SHALL show a triangle with generated base and perpendicular height,
one consistent length unit, a visible height guide and right-angle mark, and the provided area
references `A = bh` and `A = bh/2` without marking either as correct. Generated values SHALL
produce an exact whole-number area.

As a curriculum wall, every generated problem SHALL retain two distinct numeric
misconceptions after central filtering: omitting the one-half factor and adding base to height
instead of multiplying them. Neither prediction SHALL equal the correct answer or the other
prediction.

#### Scenario: One-half is applied after multiplication

- **WHEN** the figure has base 6 ft and height 4 ft
- **THEN** the exact numeric answer is 12
- **AND** 24 diagnoses the omitted-half mistake
- **AND** 10 diagnoses adding the dimensions

### Requirement: Parallelograms and trapezoids use their matching formulas

An `area-parallelogram-trapezoid` problem SHALL generate both parallelogram and trapezoid
figures across sampled problems. Each figure SHALL show every measurement needed by its
provided formula reference set, a perpendicular height guide with a right-angle mark, and one
consistent length unit.

Both figures SHALL provide `A = bh` and `A = (b1 + b2)h/2` without marking either as correct.
A parallelogram SHALL require the exact product of base and height. A trapezoid SHALL require
the exact result from the second formula and use values that produce a whole-number area.

#### Scenario: Figure family selects the formula

- **WHEN** the generated figure is a trapezoid with bases 5 in and 9 in and height 4 in
- **THEN** both provided area formulas are visible without a highlighted answer
- **AND** the exact numeric answer is 28

#### Scenario: Both figure families are practised

- **WHEN** the skill is sampled across all difficulties
- **THEN** both parallelogram and trapezoid figures occur
- **AND** each answer is derived from the measurements visible on that figure

### Requirement: Circumference converts radius to diameter

A `circumference` problem SHALL show a circle whose generated radius is labelled with one
length unit while providing `C = πd` and `A = πr²` without marking either as correct. The
problem SHALL state `π = 3.14`, require the learner to choose circumference, use diameter equal
to twice the shown radius, and round the result to the nearest tenth.

The expected answer SHALL be the nearest-tenth target under the existing approximate-answer
comparison with tolerance 0.05. The decimal key SHALL be available, and no unit or π symbol
SHALL be entered.

As a curriculum wall, every generated problem SHALL retain two distinct numeric predictions:
using the shown radius directly as the diameter and using the circle-area calculation instead.
Both predictions SHALL be rounded to the same nearest-tenth form the learner enters and SHALL
remain distinct from the accepted target and each other.

#### Scenario: Radius is doubled before applying the provided formula

- **WHEN** the circle shows radius 5 cm
- **THEN** the calculation uses diameter 10 cm and `3.14 × 10`
- **AND** the displayed target is 31.4 with tolerance 0.05

#### Scenario: Both circumference diagnoses remain reachable

- **WHEN** any circumference problem is generated
- **THEN** treating radius as diameter has one distinct rounded prediction
- **AND** using circle area has a second distinct rounded prediction

### Requirement: Circle area converts diameter to radius

An `area-circle` problem SHALL show a circle whose generated diameter is labelled with one
length unit while providing `C = πd` and `A = πr²` without marking either as correct. The
diameter SHALL be even so the derived radius is a whole number. The problem SHALL state
`π = 3.14`, require the learner to choose circle area, and ask for a result rounded to the
nearest tenth.

The expected answer SHALL be the nearest-tenth target under the existing approximate-answer
comparison with tolerance 0.05. The decimal key SHALL be available, and no unit, π symbol, or
formula SHALL be entered.

As a curriculum wall, every generated problem SHALL retain two distinct numeric predictions:
squaring the shown diameter instead of the radius and using the circumference calculation.
Both predictions SHALL be rounded to the same nearest-tenth form the learner enters and SHALL
remain distinct from the accepted target and each other.

#### Scenario: Diameter is halved before squaring

- **WHEN** the circle shows diameter 10 m
- **THEN** the calculation uses radius 5 m and `3.14 × 5²`
- **AND** the displayed target is 78.5 with tolerance 0.05

#### Scenario: Both circle-area diagnoses remain reachable

- **WHEN** any circle-area problem is generated
- **THEN** squaring diameter has one distinct rounded prediction
- **AND** using circumference has a second distinct rounded prediction

### Requirement: Unit 20a generation scales without degenerate figures

Every selected generator SHALL be deterministic for one seed and difficulty. Measurement
ranges SHALL grow measurably from difficulty 1 through difficulty 5, use positive finite
values, keep required labels inside the supported figure surface, and reject draws that make
a wall prediction collide with the correct answer or another prediction.

#### Scenario: Higher difficulty increases the work

- **WHEN** each selected skill is sampled across all five difficulties
- **THEN** its highest-difficulty measurements are measurably larger than its
  lowest-difficulty measurements
- **AND** sampled problems contain varied source measurements and figures

### Requirement: Unit 20a skills carry reviewed intro teaching lines

Each selected generator SHALL carry exactly the teaching line assigned below. Its intro SHALL
pair that line with the stable difficulty-1 example, correct answer, provided formulas, and
existing worked steps.

| Skill id | Teaching line |
|---|---|
| `perimeter` | Perimeter adds the lengths of every outer side. |
| `area-rectangle` | Area counts inside a rectangle by multiplying length and width. |
| `area-triangle` | Triangle area is half its base times its perpendicular height. |
| `area-parallelogram-trapezoid` | Parallelograms use base times height; trapezoids halve the sum of their bases times height. |
| `circumference` | Circumference measures around a circle using its full width. |
| `area-circle` | Square half the circle's width, then multiply by pi. |

#### Scenario: Every selected intro uses its reviewed line

- **WHEN** Unit 20a generator sources are checked
- **THEN** all six ids carry exactly the assigned teaching line
- **AND** every line satisfies the sentence, vocabulary, and forward-reference limits

#### Scenario: Intro answers are independently recoverable

- **WHEN** each selected intro generates its fixed difficulty-1 example
- **THEN** its figure measurements and selected provided formula independently determine its
  exact or rounded answer
- **AND** each wall intro retains both named predictions

### Requirement: Increment 20a opens the first six Stage G skills

The system SHALL register `perimeter`, `area-rectangle`, `area-triangle`,
`area-parallelogram-trapezoid`, `circumference`, and `area-circle` in manifest order. All six
SHALL resolve as implemented through the already available Stage G capabilities, while every
later Unit 20 and Unit 21 skill remains planned.

#### Scenario: The selected increment becomes playable

- **WHEN** all six generators are registered
- **THEN** the six selected skills resolve as implemented
- **AND** the playable total is 179
- **AND** `composite-figures` through `counting-outcomes` remain planned
