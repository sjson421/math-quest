## ADDED Requirements

### Requirement: Skills have six mastery levels

Each skill SHALL hold a mastery level from 0 to 5. Level 0 means never completed.
Completing a lesson SHALL raise mastery by exactly 1, capped at 5.

#### Scenario: Completing a lesson raises mastery

- **WHEN** a learner completes a lesson for a skill at mastery 2
- **THEN** that skill's mastery becomes 3

#### Scenario: Mastery is capped

- **WHEN** a learner completes a lesson for a skill already at mastery 5
- **THEN** mastery remains 5
- **AND** the lesson still awards XP and coins

### Requirement: Skills unlock at prerequisite mastery 2

A skill SHALL be available when every one of its prerequisites has reached mastery 2 or
higher. A skill with no prerequisites SHALL always be available. The threshold is 2 rather
than 5 so the course keeps moving instead of demanding perfection before progress.

#### Scenario: All prerequisites met

- **WHEN** every prerequisite of a skill is at mastery 2 or above
- **THEN** the skill is unlocked

#### Scenario: One prerequisite short

- **WHEN** any prerequisite of a skill is at mastery 1 or below
- **THEN** the skill remains locked

#### Scenario: Root skill needs nothing

- **WHEN** a skill declares no prerequisites
- **THEN** it is unlocked from first launch

### Requirement: Difficulty follows mastery

Generator difficulty SHALL be derived from current mastery so a skill gets harder as it is
learned. Difficulty SHALL be `mastery + 1`, clamped to the range 1–5.

#### Scenario: Difficulty rises with mastery

- **WHEN** a skill is at mastery 0
- **THEN** its lessons generate at difficulty 1

#### Scenario: Difficulty is clamped

- **WHEN** a skill is at mastery 5
- **THEN** its lessons generate at difficulty 5, not 6

### Requirement: Lessons end on correct answers, never on failure

A standard lesson SHALL end after 10 correct answers. A `quick` lesson SHALL end after 5.
There SHALL be no hearts, lives, or failure state. An incorrect answer SHALL re-queue that
problem later in the same session, so a lesson cannot be completed without eventually
answering every problem correctly.

#### Scenario: Standard lesson length

- **WHEN** a learner answers the 10th problem correctly in a non-quick lesson
- **THEN** the lesson completes

#### Scenario: Quick lesson length

- **WHEN** a skill is marked `quick`
- **THEN** its lesson completes after 5 correct answers

#### Scenario: Wrong answer re-queues

- **WHEN** a learner answers incorrectly
- **THEN** the correct-answer count does not increase
- **AND** that problem returns later in the same session
- **AND** no life, heart, or attempt is deducted

### Requirement: Progress survives manifest growth

Adding skills to the manifest SHALL NOT invalidate stored progress. Unknown skills in
stored progress SHALL be preserved rather than discarded, and manifest skills absent from
stored progress SHALL default to mastery 0.

#### Scenario: New skills appear at zero

- **WHEN** the manifest gains a skill not present in stored progress
- **THEN** it loads at mastery 0 without a migration

#### Scenario: Stored progress for an unknown id is kept

- **WHEN** stored progress contains a skill id no longer in the manifest
- **THEN** the record is retained rather than deleted
- **AND** the skill is not offered to the learner
