## ADDED Requirements

### Requirement: Composite figures split into recoverable rectangles

A `composite-figures` problem SHALL show an L-shaped figure with one consistent length unit
and every outer and cut-out measurement needed to split it into rectangles. It SHALL provide
the rectangle area and perimeter references without marking either as correct and SHALL
require the exact numeric area through the existing keypad without requiring a unit.

Generated cut-outs SHALL remain strictly inside the outer rectangle and SHALL leave two
positive rectangular pieces. The displayed measurements SHALL determine the same total
whether the learner adds those pieces or subtracts the cut-out from the outer rectangle.

#### Scenario: Two rectangles recover the composite area

- **WHEN** an outer 9-by-7 rectangle has a 4-by-3 corner removed
- **THEN** the exact composite area is 51
- **AND** the worked solution shows a valid rectangular split

### Requirement: Prism volume multiplies three visible dimensions

A `volume-prism` problem SHALL show a rectangular prism with generated length, width, and
height in one consistent length unit. It SHALL provide `V = Bh` and `V = Bh/3` without marking
either as correct, derive base area from the visible length and width, and require the exact
numeric volume through the existing keypad.

#### Scenario: Base area is multiplied by prism height

- **WHEN** a prism shows length 6 cm, width 4 cm, and height 5 cm
- **THEN** its base area is 24 square centimetres
- **AND** its exact volume answer is 120

### Requirement: Cylinder volume uses the shared pi policy

A `volume-cylinder` problem SHALL show a cylinder with generated radius and perpendicular
height in one length unit while providing `V = πr²h` and `V = πr²h/3` without marking either
as correct. It SHALL state π = 3.14, round the numeric target to the nearest tenth, declare the
existing approximate tolerance 0.05, and enable decimal keypad entry without requiring a
unit or π symbol.

#### Scenario: Cylinder radius supplies its circular base

- **WHEN** a cylinder has radius 3 m and height 5 m
- **THEN** verification applies `3.14 × 3² × 5`
- **AND** the displayed target is 141.3 with tolerance 0.05

### Requirement: Fractional solid formulas cover cones pyramids and spheres

A `volume-cone-pyramid-sphere` problem SHALL generate cone, rectangular-pyramid, and sphere
figures across sampled problems. A cone SHALL show radius and perpendicular height and provide
`V = πr²h` with `V = πr²h/3`. A pyramid SHALL show base length, base width, and perpendicular
height and provide `V = Bh` with `V = Bh/3`. A sphere SHALL show radius and provide
`V = 4πr³/3` with `SA = 4πr²`. No provided formula SHALL be marked as the answer.

Cone and sphere targets SHALL use π = 3.14, nearest-tenth rounding, approximate tolerance
0.05, and decimal keypad entry. Pyramid values SHALL make one third of base area times height
a whole number and SHALL use an exact answer.

#### Scenario: Each solid family occurs

- **WHEN** the grouped skill is sampled across all difficulties
- **THEN** cone, pyramid, and sphere figures all occur
- **AND** each answer follows the matching provided formula and visible measurements

#### Scenario: A pyramid keeps the one-third factor exact

- **WHEN** a pyramid has a 6-by-4 base and height 9
- **THEN** its exact numeric volume is 72
- **AND** the worked solution applies one third after finding the base area

### Requirement: Surface area unfolds every rectangular-prism face

A `surface-area` problem SHALL show a rectangular-prism net rather than a solid. Its six
faces SHALL be visible, grouped as two of each dimension pair, and labelled from generated
length, width, and height values in one unit. It SHALL provide
`SA = 2lw + 2lh + 2wh` and `V = lwh` without marking either as correct and require the exact
numeric surface area through the existing keypad.

#### Scenario: A net counts all six faces

- **WHEN** a net represents a prism with length 5 cm, width 3 cm, and height 2 cm
- **THEN** the exact surface area is `2(15) + 2(10) + 2(6) = 62`
- **AND** no solid picture replaces or obscures the net

### Requirement: Pythagorean problems identify the hypotenuse before solving

A `pythagorean` problem SHALL show a right triangle with a visible right-angle mark, one
consistent length unit, two known side lengths, and either a leg or the hypotenuse marked as
missing. It SHALL provide the radical forms `c = √(a² + b²)` and
`a = √(c² − b²)` through structured math notation without marking either as correct.

Generated triangles SHALL use scaled Pythagorean triples so the missing side is an exact whole
number. Across sampled problems both missing-side roles SHALL occur. The existing numeric
keypad SHALL accept the whole-number answer and every predicted decimal value without
requiring a unit or radical entry.

As a curriculum wall, every generated problem SHALL retain two distinct numeric predictions
after central filtering: treating the wrong known side as the hypotenuse, and stopping at the
sum or difference of squares without taking the square root. Neither prediction SHALL equal
the answer or the other prediction.

#### Scenario: A missing hypotenuse uses addition under the radical

- **WHEN** the right triangle shows legs 3 ft and 4 ft with the hypotenuse missing
- **THEN** the exact answer is 5
- **AND** subtracting the leg squares diagnoses incorrect hypotenuse placement
- **AND** 25 diagnoses omitting the square root

#### Scenario: A missing leg isolates the hypotenuse square

- **WHEN** the right triangle shows hypotenuse 13 in and one leg 5 in
- **THEN** the exact missing leg is 12
- **AND** adding the known squares diagnoses incorrect hypotenuse placement
- **AND** 144 diagnoses omitting the square root

### Requirement: Unit 20b generation scales without degenerate figures

Every selected generator SHALL be deterministic for one seed and difficulty. Measurement
ranges SHALL grow measurably from difficulty 1 through difficulty 5, use positive finite
values, vary every grouped figure family, keep labels inside the supported figure surface,
and reject draws that produce invalid cut-outs, fractional exact targets, or wall-prediction
collisions.

Every displayed figure, formula, prompt, answer, keypad declaration, hint, and worked step
SHALL agree with its operation data. Exact results SHALL identify square or cubic units in
learner-facing wording without requiring the unit to be entered; π-based results SHALL expose
their nearest-tenth rule.

#### Scenario: Higher difficulty increases the work

- **WHEN** each selected skill is sampled across all five difficulties
- **THEN** its highest-difficulty measurements are measurably larger than its lowest-difficulty
  measurements
- **AND** sampled problems contain varied source measurements and required figure families

#### Scenario: Existing answer surfaces remain sufficient

- **WHEN** any Unit 20b problem is presented
- **THEN** it uses the existing keypad with exact or approximate numeric checking
- **AND** no diagram, formula, unit, or radical becomes a second answer surface

### Requirement: Unit 20b skills carry reviewed intro teaching lines

Each selected generator SHALL carry exactly the teaching line assigned below. Its intro SHALL
pair that line with the stable difficulty-1 example, correct answer, provided formulas, and
existing worked steps.

| Skill id | Teaching line |
|---|---|
| `composite-figures` | Split a complex shape, then add each piece. |
| `volume-prism` | A prism's volume is its base size times its height. |
| `volume-cylinder` | A cylinder uses its circular base and height to find volume. |
| `volume-cone-pyramid-sphere` | Cones and pyramids use one-third; spheres use four-thirds. |
| `surface-area` | A net shows every face that must be added. |
| `pythagorean` | The hypotenuse is longest and sits opposite the right angle. |

#### Scenario: Every selected intro uses its reviewed line

- **WHEN** Unit 20b generator sources are checked
- **THEN** all six ids carry exactly the assigned teaching line
- **AND** every line satisfies the sentence, vocabulary, and forward-reference limits

#### Scenario: Intro answers are independently recoverable

- **WHEN** each selected intro generates its fixed difficulty-1 example
- **THEN** its figure measurements and provided formulas independently determine its exact or
  rounded answer
- **AND** the Pythagorean intro retains both named predictions

### Requirement: Increment 20b extends Unit 20 through Pythagorean work

The system SHALL register `composite-figures`, `volume-prism`, `volume-cylinder`,
`volume-cone-pyramid-sphere`, `surface-area`, and `pythagorean` after the six Unit 20a
generators in manifest order. All twelve SHALL resolve as implemented through the already
available Stage G capabilities, while `similar-figures` and every Unit 21 skill remain
planned.

#### Scenario: The second increment becomes playable

- **WHEN** all six Unit 20b generators are registered
- **THEN** `perimeter` through `pythagorean` resolve as implemented in manifest order
- **AND** the playable total is 185
- **AND** `similar-figures` through `counting-outcomes` remain planned

## REMOVED Requirements

### Requirement: Increment 20a opens the first six Stage G skills

**Reason**: Its completion scenario requires every later Unit 20 skill to remain planned,
which becomes false when increment 20b ships.

**Migration**: Replace it with `Increment 20b extends Unit 20 through Pythagorean work`, which
preserves the six Unit 20a generators and advances the same manifest-order, capability, and
planned-skill contract to the twelve-skill boundary.
