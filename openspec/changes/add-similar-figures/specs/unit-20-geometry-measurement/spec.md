## REMOVED Requirements

### Requirement: Increment 20b extends Unit 20 through Pythagorean work

**Reason**: Its completion scenario requires `similar-figures` to remain planned and the playable total to remain 185, which becomes false when increment 20c ships.

**Migration**: Replace it with `Increment 20c completes Unit 20 with similar figures`, which preserves all twelve existing generators and advances the same manifest-order, capability, and planned-skill contract to the thirteen-skill Unit 20 boundary.

## ADDED Requirements

### Requirement: Similar figures derive one missing corresponding side

The system SHALL generate the Stage G, Unit 20 skill `similar-figures` as a pair of small and large similar rectangles. Each problem SHALL show both side lengths on the small rectangle, one corresponding numeric side on the large rectangle, and a missing marker on the large rectangle's other side.

The known large side SHALL be a whole-number scale factor greater than one times its corresponding small side. The exact whole-number answer SHALL be the other small side multiplied by that same factor. The figure data SHALL carry the two small sides, the one known large side, its side role, and one supported length unit; it SHALL NOT carry the missing answer.

Seeded problems SHALL vary which large side is known. Each prompt, hint, worked solution, and unit reference SHALL agree with the visible side roles and SHALL use the existing numeric keypad without requiring a unit or proportion entry.

Every problem SHALL predict copying the known large side into the missing position and treating the side growth as an additive difference. Unequal small sides and the whole-number scale constraint SHALL keep both predicted values distinct from the answer and from each other after central filtering.

#### Scenario: A known large length determines the missing width

- **WHEN** the small rectangle is 4 cm by 3 cm and the large rectangle's corresponding length is 8 cm
- **THEN** the scale factor is 2 and the exact missing width is 6
- **AND** the answer is derived from the three visible numeric sides
- **AND** 8 diagnoses copying the known large side while 7 diagnoses adding the same side difference

#### Scenario: A known large width determines the missing length

- **WHEN** the small rectangle is 5 ft by 2 ft and the large rectangle's corresponding width is 6 ft
- **THEN** the scale factor is 3 and the exact missing length is 15
- **AND** the answer remains reachable through the ordinary whole-number keypad

### Requirement: Similar-figure generation grows without degenerate pairs

The generator SHALL be deterministic for one seed and difficulty. Small-side and scale ranges SHALL grow measurably from difficulty 1 through difficulty 5, remain positive finite whole numbers, keep the two small sides unequal, and produce a valid whole-number scale greater than one. Both known-side roles SHALL occur across seeded samples.

Every generated figure, proportion reference, prompt, exact answer, hint, and worked step SHALL agree. The generator SHALL carry the teaching line `Corresponding sides in similar figures use the same scale factor.` and its stable difficulty-1 intro SHALL use the same paired figure, exact answer, and worked steps as practice.

#### Scenario: Difficulty increases the visible work

- **WHEN** `similar-figures` is sampled across all five difficulties
- **THEN** its highest-difficulty source measurements are measurably larger than its lowest-difficulty measurements
- **AND** no sampled pair is square, unscaled, fractional, or missing a source side

#### Scenario: The intro teaches the same relationship as practice

- **WHEN** the fixed difficulty-1 intro is generated
- **THEN** it uses the reviewed teaching line and paired-figure display
- **AND** its three numeric labels and proportion references independently determine its exact answer

### Requirement: Increment 20c completes Unit 20 with similar figures

The system SHALL register `similar-figures` after `pythagorean` in manifest order. All thirteen Unit 20 skills SHALL resolve as implemented through the already available Stage G capabilities, while every Unit 21 skill remains planned.

#### Scenario: The third increment completes Unit 20

- **WHEN** the `similar-figures` generator is registered
- **THEN** `perimeter` through `similar-figures` resolve as implemented in manifest order
- **AND** the playable total is 186
- **AND** `mean` through `counting-outcomes` remain planned
