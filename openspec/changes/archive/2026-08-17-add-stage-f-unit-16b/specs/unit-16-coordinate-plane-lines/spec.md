## ADDED Requirements

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

### Requirement: Unit 16 is complete without another capability

The system SHALL register all ten Unit 16 generators in manifest order. The four generators in
increment 16b SHALL satisfy the existing determinism, independent-answer, difficulty, variety,
content, recorded-output, and phone-layout gates. Stage F and `AVAILABLE_CAPABILITIES` SHALL
remain unchanged.

Roadmap item 23 SHALL remain open for Units 17–19 even though Unit 16 is complete.

#### Scenario: Four more skills become implemented

- **WHEN** the four Unit 16b generators are registered
- **THEN** all ten Unit 16 skills resolve as `implemented` in manifest order
- **AND** the playable total becomes 155

#### Scenario: Later Stage F units remain planned

- **WHEN** increment 16b is complete
- **THEN** every skill in Units 17–19 remains planned
- **AND** roadmap item 23 remains unchecked

## REMOVED Requirements

### Requirement: Unit 16a is playable without another capability

**Reason**: Increment 16b completes the unit, so the requirement that its final four skills
remain planned becomes false.

**Migration**: The new `Unit 16 is complete without another capability` requirement retains
the unchanged availability contract and replaces the obsolete completion state.
