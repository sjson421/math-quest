# Unit 17 Systems Equations Specification

## Purpose

Teach the four Unit 17 systems methods with generated, independently checkable problems whose
solutions are exact integer ordered pairs entered on the existing coordinate plane.

## Requirements

### Requirement: Systems by graphing use one two-line plane

The system SHALL generate `system-by-graphing` with two distinct nonparallel lines on one
coordinate plane. Their unique intersection SHALL be an integer lattice point inside the
declared bounds, and the learner SHALL answer by placing that ordered pair on the same plane.

#### Scenario: The visible intersection is the answer

- **WHEN** the two displayed lines intersect at `(−2, 3)`
- **THEN** confirming `(−2, 3)` is correct
- **AND** reversing the coordinate order remains a diagnosable wrong point when it is distinct

### Requirement: Substitution presents one isolated variable

The system SHALL generate `substitution` with two structured linear equations, exactly one of
which already isolates one variable. Substituting that expression into the other equation
SHALL produce one integer ordered-pair solution inside the answer plane.

#### Scenario: The isolated expression is substituted

- **WHEN** the system shows `y = 2x + 1` and `x + y = 7`
- **THEN** the derived solution is `(2, 5)`
- **AND** the answer is submitted as an ordered pair rather than as either coordinate alone

### Requirement: Elimination scales a complete equation

The system SHALL generate `elimination` with two standard-form equations for which one equation
must be multiplied by a non-unit integer before one variable cancels. The resulting system
SHALL have one integer ordered-pair solution inside the answer plane.

Every generated problem SHALL retain at least two distinct, wrong, reachable point
misconceptions after central answer-collision and duplicate filtering. One SHALL represent
scaling the selected equation's coefficients without scaling its right-hand side; another
SHALL represent subtracting the original equations before the required scaling.

#### Scenario: Scaling reaches both sides

- **WHEN** one equation must be multiplied before subtraction cancels a variable
- **THEN** every term and its right-hand side are multiplied by the same factor
- **AND** the exact remaining variable and then the other coordinate form the answer point

#### Scenario: Wall diagnoses survive generation

- **WHEN** an elimination problem is generated at any supported difficulty and seed
- **THEN** both required point predictions are on the declared coordinate lattice
- **AND** neither prediction equals the answer or the other prediction

### Requirement: System word problems expose their two equations

The system SHALL generate `system-words` from a fixed respectful-tone frame whose visible quantities
determine two equations and one nonnegative integer ordered-pair solution inside the declared
answer plane. The situation, variable meanings, and both equations SHALL agree with the same
structured source data.

#### Scenario: Pass counts and revenue determine the pair

- **WHEN** a frame states the total passes sold, each pass price, and total revenue
- **THEN** the visible equations express both total count and total revenue
- **AND** the answer gives the two pass counts in the stated variable order

### Requirement: Unit 17 ships as one ordered increment

The system SHALL register `system-by-graphing`, `substitution`, `elimination`, and
`system-words` in manifest order. Each SHALL resolve as implemented while later Stage F skills
remain planned, and generated learner text SHALL satisfy the course content contract.

#### Scenario: The registry exposes exactly the selected increment

- **WHEN** the Unit 17 generators are registered
- **THEN** all four Unit 17 ids resolve as implemented
- **AND** `add-polynomials` and later Stage F ids remain planned

### Requirement: Unit 17 skills carry reviewed intro teaching lines

Each Stage F Unit 17 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `system-by-graphing` | The point where both lines meet solves both equations. |
| `substitution` | Replace an isolated letter with its equal expression in the other equation. |
| `elimination` | Scale every term in one equation, then add or subtract to cancel one letter. |
| `system-words` | Translate total count and total value into two equations, then solve them together. |

#### Scenario: Every Unit 17 intro uses its reviewed line

- **WHEN** the Unit 17 generator set is checked at its authored source
- **THEN** all four ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 17 examples retain system solution points

- **WHEN** each Unit 17 intro generates its stable difficulty-1 example
- **THEN** its intersection point can be recomputed independently from the two visible structured equations or carried story quantities
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, plane, story data, or misconception
