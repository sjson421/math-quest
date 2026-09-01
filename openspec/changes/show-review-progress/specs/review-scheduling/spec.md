## ADDED Requirements

### Requirement: Due review is reachable from the course tree

The common course-tree surface SHALL present one review entry if and only if at least one
implemented skill is due on the learner's current local day. The entry SHALL be available from
the stage, unit, and skill levels without exposing a control for future, unscheduled, planned,
or otherwise unplayable skills.

Activating the entry SHALL start the existing bounded due-skill selection as one fixed review
lesson snapshot. Leaving the active review, or continuing from its completion screen, SHALL
return to the exact course-tree level and stage or unit from which it was started. The due entry
SHALL then reflect current persisted review state.

#### Scenario: No due work means no review entry

- **WHEN** no implemented skill is due on the current local day
- **THEN** the course-tree surface shows no review entry

#### Scenario: Due work can start review

- **WHEN** at least one implemented skill is due on the current local day
- **THEN** the course-tree surface shows one review entry
- **AND** activating it starts the bounded due-skill snapshot in the order review selection
  defines

#### Scenario: Review returns to its starting tree level

- **WHEN** a learner starts review from one unit's skill level and then leaves the active review
  or continues from its completion screen
- **THEN** that same unit's skill level is shown again
- **AND** due-entry visibility is recomputed from the persisted review results

#### Scenario: Every tree level offers the same due entry

- **WHEN** review is due while the learner navigates between the stage, unit, and skill levels
- **THEN** each level's common course surface offers one review entry
