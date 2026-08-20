## MODIFIED Requirements

### Requirement: Coordinate-plane content declares the operation being verified

A generated coordinate-plane content problem SHALL carry a closed operation-specific source
record beside its generic plane declaration. The record SHALL distinguish plotting a stated
point, plotting a selected table row, identifying a quadrant, finding slope from a graph,
finding slope from two points, finding a y-intercept, reading slope-intercept form, selecting
a graph for an equation, writing an equation from a graph, finding a parallel or perpendicular
slope, and solving a system by graphing, substitution, elimination, or a fixed word-problem
frame.

Independent verification SHALL validate the plane first, validate that the operation's source
data agrees with the visible points, lines, equation context, table, variable labels, or story
quantities, and then derive the answer without reading the problem's stated answer. Equation
text shown beside a graph SHALL be rebuilt from the same structured values used for
verification. A coordinate-plane problem without recognized operation data SHALL continue to
fail closed rather than fall through to the stated answer.

For a Unit 17 system, verification SHALL solve the two represented equations by exact integer
arithmetic. The derived answer SHALL be an integer coordinate on the declared input lattice. A
malformed, singular, inconsistent, underdetermined, out-of-bounds, or visually disagreeing
system SHALL fail closed and name its skill.

#### Scenario: A point answer comes from visible source data

- **WHEN** coordinate-plane input asks for a stated point or one identified table row
- **THEN** verification derives the exact ordered pair from the operation record
- **AND** fails if the carried plane or table disagrees with that source

#### Scenario: Table rows retain one linear relationship

- **WHEN** a table-to-graph operation carries three or more unique-x rows
- **THEN** verification proves every row is collinear by exact integer cross-products
- **AND** rejects the problem if one row leaves that relationship

#### Scenario: A quadrant comes from coordinate signs

- **WHEN** a quadrant problem displays one non-axis point
- **THEN** verification derives the quadrant choice identity from that point's x and y signs
- **AND** verifies that the derived identity is among the offered choices

#### Scenario: Slope is derived exactly from two points

- **WHEN** a slope problem carries two distinct points
- **THEN** verification computes change in y over change in x in one consistent order
- **AND** rejects a horizontal or vertical draw in the selected Unit 16a skills
- **AND** compares the reduced exact value with the stated answer

#### Scenario: An intercept comes from the displayed line

- **WHEN** a y-intercept problem displays one non-vertical line
- **THEN** verification derives its value at x zero from the line's defining points
- **AND** fails if that value differs from the stated answer

#### Scenario: Slope-intercept data agrees with its line and question

- **WHEN** a slope-intercept problem carries a slope, intercept, and selected property
- **THEN** verification rebuilds the visible equation and matches the line to those values
- **AND** derives the requested coefficient as an exact answer

#### Scenario: A graph choice matches one candidate line

- **WHEN** graph-from-equation data carries an integer slope and intercept beside two lines
- **THEN** verification finds exactly one candidate with that slope and intercept
- **AND** maps its declaration index to the offered line choice without trusting the answer id

#### Scenario: An equation answer is derived from the displayed graph

- **WHEN** an equation-from-graph problem displays one non-vertical integer-slope line
- **THEN** verification derives its slope and y-intercept from the line's defining points
- **AND** compares the right side of `y =` under existing expanded-expression semantics

#### Scenario: A related slope is derived from the reference line

- **WHEN** a parallel-or-perpendicular problem displays one non-horizontal, non-vertical line
- **THEN** verification derives its exact slope and applies the declared relationship
- **AND** compares the resulting reduced rational with the stated answer

#### Scenario: Graph geometry derives a system intersection

- **WHEN** `system-by-graphing` declares two nonparallel visible lines
- **THEN** verification derives their unique exact intersection from their defining points
- **AND** compares that point with the structured answer without trusting it

#### Scenario: Algebraic methods derive the same ordered pair

- **WHEN** substitution or elimination carries two visible linear equations
- **THEN** verification solves their coefficient records exactly
- **AND** rejects any equation text that disagrees with those coefficients or constants

#### Scenario: Story quantities rebuild the equations

- **WHEN** `system-words` carries its fixed frame and quantities
- **THEN** verification rebuilds the learner-facing sentence and both equations from that data
- **AND** derives the two named counts in the displayed variable order

#### Scenario: Invalid systems fail closed

- **WHEN** system data is malformed, singular, inconsistent, underdetermined, out of bounds, or
  disagrees with visible context
- **THEN** independent verification names the skill and rejects it
- **AND** it does not trust the attached point answer

#### Scenario: Missing operation data still fails closed

- **WHEN** a coordinate-plane display carries no recognized content operation
- **THEN** independent verification names the problem and rejects it
- **AND** it does not trust a numeric, choice, or point answer attached to the graph

### Requirement: Coordinate operation data reaches every authored-content gate

The learner-text and recorded-output gates SHALL handle coordinate operation data explicitly.
The wording snapshot SHALL state the operation, target point or complete table rows where
present, and the plane declaration. Learner-text collection SHALL include every target or
table value rendered beside the graph.

For linear-equation operations, recorded output SHALL additionally state the slope, intercept,
relationship source, system equation pair, or complete story source where present, and both
candidate lines where present. Learner-text collection SHALL include every equation, variable
meaning, and story quantity rendered beside the graph. Difficulty evidence for Unit 17 SHALL
come from visible plane bounds and source coefficients or quantities rather than from the
stated answer alone.

#### Scenario: A table operation is recorded completely

- **WHEN** a generated coordinate display carries table rows and a selected x-value
- **THEN** its recorded output includes every row and the selected value
- **AND** changing either produces a reviewable snapshot difference

#### Scenario: A new coordinate operation cannot disappear silently

- **WHEN** the closed coordinate operation union gains an unhandled arm
- **THEN** exhaustive verification, text, or recorded-output handling fails
- **AND** the new arm cannot inherit unrelated graph semantics

#### Scenario: An equation operation is recorded completely

- **WHEN** generated coordinate data carries a slope and intercept
- **THEN** recorded output includes both source values and the formatted equation context
- **AND** changing either produces a reviewable snapshot difference

#### Scenario: A graph choice records both candidates

- **WHEN** graph-from-equation presents two lines
- **THEN** recorded output states both defining pairs in declaration order
- **AND** the correct choice identity can be reviewed against that order

#### Scenario: System data is recorded completely

- **WHEN** a generated coordinate display carries a Unit 17 system operation
- **THEN** recorded output states the operation, both equations or complete story source, plane,
  answer point, and point-valued predictions
- **AND** changing any source value produces a reviewable snapshot difference

#### Scenario: A swapped system operation cannot pass unnoticed

- **WHEN** a generated system carries equation data under the wrong Unit 17 operation
- **THEN** exhaustive recording and independent verification identify the operation mismatch
- **AND** the content checks do not treat the authored answer as evidence of correctness
