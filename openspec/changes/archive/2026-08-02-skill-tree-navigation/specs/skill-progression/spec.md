## MODIFIED Requirements

### Requirement: Skills are presented in curriculum order

Skills SHALL be presented to the learner in the order the curriculum manifest declares them,
so that the order they are read in matches the order they unlock in. Stages and units SHALL
be presented in manifest order too, so the same guarantee holds at every level the learner
navigates rather than only at the innermost one.

Within a unit, a learner SHALL NOT encounter a locked skill above a skill that is open to
them, except where a skill they have already practised has been grandfathered past a
tightened gate. The invariant is stated within a unit because a learner can now open a unit
whose skills are all still locked — the whole of Unit 1 sits behind Unit 0. Ordering keeps
such a unit legible; it cannot make it open, and it is not required to.

This matters because the unlock graph is a line: presenting it out of order turns a sequence
into a scatter of padlocks, and the learner has no way to tell which card is next.

#### Scenario: Presentation order follows the manifest

- **WHEN** the learner is shown the skills available to them
- **THEN** they appear in manifest order, not in the order their generators were written

#### Scenario: Units and stages follow the manifest too

- **WHEN** the learner is shown the stages of the course, or the units of a stage
- **THEN** they appear in the order the manifest declares them

#### Scenario: A unit behind its predecessor is still ordered

- **WHEN** a learner opens a unit every skill of which is locked
- **THEN** its skills are still shown in manifest order
- **AND** the unit's position among its stage's units is unchanged by being locked
