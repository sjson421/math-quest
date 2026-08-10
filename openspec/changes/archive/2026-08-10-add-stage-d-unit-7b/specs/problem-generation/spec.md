## MODIFIED Requirements

### Requirement: A displayed problem carries enough to recompute its answer

Whatever a problem shows the learner SHALL be sufficient to re-derive the correct answer
independently, without consulting the answer the generator stated. A problem whose answer can
only be taken on trust is not verifiable, and a wrong answer key is the one defect this app
cannot survive.

A displayed expression MAY contain more than one operation. Recomputation SHALL read every
operand and every operator the display shows, so an expression cannot present a term the check
does not see. A structured math display whose answer is a fraction property SHALL carry the
specific fraction operation and its integer source values rather than rely on a general
notation evaluator. A comparison SHALL carry both fractions and derive their relation from
exact rational values. A value-bearing choice SHALL carry its rational value as structured
data when verification must compare it with another representation.

#### Scenario: Answer is recomputed from the display, not the generator

- **WHEN** the content check examines a generated problem
- **THEN** it re-derives the answer from the displayed operands and operators alone
- **AND** fails if that value differs from the answer the generator stated

#### Scenario: Prose alone is not sufficient

- **WHEN** a problem presents its quantities as prose rather than as an expression
- **THEN** it also carries those quantities in machine-readable form
- **AND** the recomputation uses those rather than parsing the prose

#### Scenario: Every operation in a displayed expression is read

- **WHEN** a problem displays an expression containing more than one operator
- **THEN** recomputation reads every operand and operator shown
- **AND** fails and names the problem if the display cannot be read as an expression

#### Scenario: A fraction property is derived without evaluating arbitrary notation

- **WHEN** a math display asks the learner to read, name, place, complete, simplify, or compare a fraction
- **THEN** it carries the operation and integer values needed to derive that answer
- **AND** verification fails if the visible notation disagrees with the carried values

#### Scenario: A diagram selects an equivalent value-bearing choice

- **WHEN** a diagram problem asks which prose choice represents the same rational amount
- **THEN** verification compares the diagram's part counts with structured choice values
- **AND** it neither parses the prose labels nor trusts the stated choice id
