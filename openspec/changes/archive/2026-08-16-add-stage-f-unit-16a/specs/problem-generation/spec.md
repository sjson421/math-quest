## ADDED Requirements

### Requirement: Coordinate-plane content declares the operation being verified

A generated coordinate-plane content problem SHALL carry a closed operation-specific source
record beside its generic plane declaration. The record SHALL distinguish plotting a stated
point, plotting a selected table row, identifying a quadrant, finding slope from a graph,
finding slope from two points, and finding a y-intercept.

Independent verification SHALL validate the plane first, validate that the operation's source
data agrees with the visible points, lines, or table, and then derive the answer without
reading the problem's stated answer. A coordinate-plane problem without recognized operation
data SHALL continue to fail closed rather than fall through to the stated answer.

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

#### Scenario: Missing operation data still fails closed

- **WHEN** a coordinate-plane display carries no recognized content operation
- **THEN** independent verification names the problem and rejects it
- **AND** it does not trust a numeric, choice, or point answer attached to the graph

### Requirement: Coordinate operation data reaches every authored-content gate

The learner-text and recorded-output gates SHALL handle coordinate operation data explicitly.
The wording snapshot SHALL state the operation, target point or complete table rows where
present, and the plane declaration. Learner-text collection SHALL include every target or
table value rendered beside the graph.

#### Scenario: A table operation is recorded completely

- **WHEN** a generated coordinate display carries table rows and a selected x-value
- **THEN** its recorded output includes every row and the selected value
- **AND** changing either produces a reviewable snapshot difference

#### Scenario: A new coordinate operation cannot disappear silently

- **WHEN** the closed coordinate operation union gains an unhandled arm
- **THEN** exhaustive verification, text, or recorded-output handling fails
- **AND** the new arm cannot inherit unrelated graph semantics
