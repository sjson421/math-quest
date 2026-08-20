## Purpose

Teach the four Unit 17 systems methods with generated, independently checkable problems whose
solutions are exact integer ordered pairs entered on the existing coordinate plane.

## ADDED Requirements

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
The system SHALL generate `system-words` from a fixed adult-tone frame whose visible quantities
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
