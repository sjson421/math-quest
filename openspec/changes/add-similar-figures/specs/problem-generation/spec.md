## MODIFIED Requirements

### Requirement: Geometry answers are recoverable from visible source data

A geometry display SHALL carry an operation, figure family, unit, and every measurement needed
to rebuild its visible figure, provided formula reference set, and numeric answer without
consulting the generator's stated answer. Independent verification SHALL reject an operation
whose figure, formulas, measurements, prompt, answer policy, or answer disagree.

Verification SHALL recompute exact results for Unit 20a polygons, composite area, rectangular
prism volume, rectangular-pyramid volume, rectangular-prism surface area, scaled Pythagorean
triples, and similar figures. For circumference, circle area, cylinder volume, cone volume,
and sphere volume, verification SHALL use π = 3.14, round the target to the nearest tenth, and
require the declared approximate tolerance to equal 0.05. It SHALL derive every formula
conversion, cut-out, base area, one-third or four-thirds factor, face pair, and missing side
from the carried source values.

For similar figures, verification SHALL divide the known large side by its corresponding
visible small side, then multiply the other visible small side by that scale factor to recover
the exact missing large side. It SHALL reject a problem whose side role, visible measurements,
proportion references, prompt, exact answer kind, answer value, or keypad declaration
disagrees. It SHALL also reject a non-whole scale, a scale no greater than one, equal small
sides, or a carried missing answer.

#### Scenario: Polygon verification uses the carried dimensions

- **WHEN** a triangle figure carries base 8 and height 5
- **THEN** independent verification derives 20 from those values and the one-half formula
- **AND** it fails if the displayed labels or stated exact answer disagree

#### Scenario: Circle verification checks policy as well as arithmetic

- **WHEN** a circle-area figure carries diameter 10
- **THEN** independent verification derives radius 5, applies 3.14, and rounds 78.5
- **AND** it fails if the target or tolerance differs from 78.5 plus or minus 0.05

#### Scenario: A prism net and solid share dimensions but not answers

- **WHEN** length 5, width 3, and height 2 are carried by a prism-volume problem and a
  surface-area problem
- **THEN** verification derives volume 30 for the solid and surface area 62 for the net
- **AND** it rejects either operation if it declares the other's answer or formula set

#### Scenario: A missing right-triangle side is rebuilt

- **WHEN** a Pythagorean figure carries known legs 3 and 4 with the hypotenuse missing
- **THEN** verification derives the exact answer 5 and both radical references
- **AND** it rejects an answer, side role, or formula set that disagrees with those values

#### Scenario: Verification rebuilds a missing large width

- **WHEN** a problem shows small sides 4 cm and 3 cm and a corresponding large length of 8 cm
- **THEN** verification derives scale factor 2 and exact answer 6
- **AND** changing only the stated answer or known-side role fails verification

#### Scenario: Invalid correspondence fails closed

- **WHEN** the known large side does not divide evenly by the corresponding small side
- **THEN** verification rejects the problem instead of rounding or trusting its stated answer

### Requirement: Geometry wording gates record every visible field

Recorded output and learner-text collection SHALL include the geometry operation, figure
family, complete measurements, units and unit powers, side or face roles, derived accessible
figure name, provided formulas, answer kind, target, tolerance, keypad rules, and predicted
misconceptions. Adding an unrendered geometry field or operation SHALL fail the gate rather
than pass silently.

For similar figures, recorded output and learner-text collection SHALL include both figure
roles, both small measurements, the known large-side role and value, unit, missing-side role,
derived accessible name, both proportion references, exact answer, input mode, keypad rules,
hint, solution, and every predicted misconception. Adding an unhandled similar-figure field
or operation SHALL fail exhaustive recording, learner-text collection, difficulty evidence,
or independent verification rather than pass silently.

#### Scenario: A generated figure is fully reviewable

- **WHEN** a Unit 20 problem is recorded
- **THEN** a reviewer can recover its figure, formula choices, answer policy, input rules, and
  diagnoses from the recorded entry
- **AND** no authored field set by the generator is omitted

#### Scenario: Grouped solids remain distinguishable

- **WHEN** cone, pyramid, and sphere problems are recorded from their shared skill
- **THEN** each entry names its specific family, source measurements, formulas, and exact or
  rounded policy
- **AND** no family can inherit another family's unrecorded fields

#### Scenario: A generated pair is fully reviewable

- **WHEN** a `similar-figures` problem is recorded
- **THEN** a reviewer can recover the three visible sides, corresponding scale, missing role,
  formulas, and exact answer policy
- **AND** no authored field set by the generator is omitted
