## ADDED Requirements

### Requirement: Geometry answers are recoverable from visible source data

A geometry display SHALL carry an operation, figure family, unit, and every measurement needed
to rebuild its visible figure, provided formula reference set, and numeric answer without
consulting the generator's stated answer. Independent verification SHALL reject an operation
whose figure, formulas, measurements, prompt, or answer disagree.

For polygon operations, verification SHALL recompute the exact result. For circle operations,
verification SHALL use π = 3.14, derive radius or diameter from the measure shown, round the
target to the nearest tenth, and require the declared approximate tolerance to equal 0.05.

#### Scenario: Polygon verification uses the carried dimensions

- **WHEN** a triangle figure carries base 8 and height 5
- **THEN** independent verification derives 20 from those values and the one-half formula
- **AND** it fails if the displayed labels or stated exact answer disagree

#### Scenario: Circle verification checks policy as well as arithmetic

- **WHEN** a circle-area figure carries diameter 10
- **THEN** independent verification derives radius 5, applies 3.14, and rounds 78.5
- **AND** it fails if the target or tolerance differs from 78.5 plus or minus 0.05

### Requirement: Geometry wording gates record every visible field

Recorded output and learner-text collection SHALL include the geometry operation, figure
family, complete measurements, units, derived accessible figure name, provided formulas,
answer kind, target, tolerance, keypad rules, and predicted misconceptions. Adding an
unrendered geometry field SHALL fail the gate rather than pass silently.

#### Scenario: A generated figure is fully reviewable

- **WHEN** a Unit 20a problem is recorded
- **THEN** a reviewer can recover its figure, formula choices, answer policy, input rules, and
  diagnoses from the recorded entry
- **AND** no authored field set by the generator is omitted
