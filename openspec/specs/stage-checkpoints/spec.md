# Stage Checkpoints

## Purpose

Recognize a learner's transition across a fully playable curriculum stage without confusing
the end of currently built content with completion of the stage declared in the manifest.

## Requirements

### Requirement: A complete stage is checkpoint-eligible

A stage SHALL be checkpoint-eligible only when every skill the curriculum manifest declares
for that stage is implemented and every one of those skills has reached the mastery threshold
that unlocks what follows. Completion SHALL be evaluated over the manifest's full membership,
not only the playable subset used by navigation progress bars.

#### Scenario: Stage A reaches its boundary

- **WHEN** every Stage A skill is implemented and holds mastery 2 or higher
- **THEN** Stage A is complete and eligible for its checkpoint

#### Scenario: A partly built stage is not complete

- **WHEN** every playable skill in a stage holds mastery 2 or higher but at least one manifest
  skill in that stage is still planned
- **THEN** the stage is not complete
- **AND** no checkpoint is offered for the end of its currently playable subset

#### Scenario: One implemented skill is below the boundary

- **WHEN** every skill in a stage is implemented but any one holds mastery below 2
- **THEN** the stage is not complete

### Requirement: Crossing the boundary triggers one checkpoint

The system SHALL trigger a checkpoint only when lesson completion changes the containing
stage from incomplete to complete. A stage already complete before the lesson SHALL NOT
trigger again, and loading or restoring progress that is already complete SHALL NOT invent a
new crossing.

#### Scenario: Final threshold lesson crosses the stage

- **WHEN** completing a lesson raises the last below-threshold skill in an eligible stage from
  mastery 1 to mastery 2
- **THEN** that lesson outcome carries the completed stage checkpoint

#### Scenario: Repeating the final skill does not repeat the checkpoint

- **WHEN** a later lesson completes in a stage that was already complete
- **THEN** no stage checkpoint is triggered

#### Scenario: Restored completion does not replay a checkpoint

- **WHEN** the app loads or restores a progress record in which a stage is already complete
- **THEN** no checkpoint is triggered without a lesson crossing the boundary

### Requirement: The checkpoint follows the lesson celebration

When a lesson crosses a stage boundary, the existing lesson-complete celebration SHALL remain
first. Continuing from it SHALL show a distinct stage checkpoint naming the completed stage,
and continuing from the checkpoint SHALL return to the same unit skill level that the lesson
would otherwise return to. A lesson that crosses no stage boundary and earns no pin upgrade
SHALL keep its existing single-continue exit flow.

A lesson MAY also earn a pin upgrade. Where it does, the upgrade SHALL be shown after the
stage checkpoint when both are earned, and directly after the lesson-complete celebration
when only the upgrade is. Each screen SHALL present one Continue action, so the learner
advances through whichever of the three are due with one tap each and reaches the same
destination either way.

Learner-facing checkpoint copy SHALL describe crossing a progression boundary and SHALL NOT
claim that the stage is fully mastered or that there is nothing left to practise. It SHALL
keep one clear Continue action rather than introducing choices at the boundary.

#### Scenario: Stage checkpoint is shown in sequence

- **WHEN** a learner continues from the lesson-complete celebration for a lesson that crossed
  a stage boundary
- **THEN** a distinct celebration names the completed stage
- **AND** the learner has not yet returned to the skill tree

#### Scenario: Continuing from the checkpoint returns to the lesson's unit

- **WHEN** the learner continues from the stage checkpoint and no pin upgrade was earned
- **THEN** the skill level of the unit where the lesson began is shown

#### Scenario: Ordinary lesson exit is unchanged

- **WHEN** a learner continues from a lesson-complete celebration that crossed no stage
  boundary and earned no pin upgrade
- **THEN** the learner returns directly to the skill level of the unit where the lesson began

#### Scenario: A pin upgrade alone follows the celebration

- **WHEN** a learner continues from the lesson-complete celebration for a lesson that earned
  a pin upgrade but crossed no stage boundary
- **THEN** the pin upgrade is shown
- **AND** continuing from it returns to the skill level of the unit where the lesson began

#### Scenario: Both are shown, checkpoint first

- **WHEN** a lesson both crosses a stage boundary and earns a pin upgrade
- **THEN** the stage checkpoint is shown before the pin upgrade
- **AND** continuing from the pin upgrade returns to the skill level of the unit where the
  lesson began

#### Scenario: Checkpoint copy does not overstate mastery

- **WHEN** a learner sees a checkpoint after every stage skill reaches mastery 2
- **THEN** the celebration describes reaching the stage boundary without claiming mastery 5
- **AND** it presents one Continue action with no competing progression choices
