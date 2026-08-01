## MODIFIED Requirements

### Requirement: Difficulty follows mastery

Each lesson SHALL have a base generator difficulty derived from current mastery so a skill
gets harder as it is learned. Base difficulty SHALL be `mastery + 1`, clamped to the range
1–5.

The opening problem SHALL be generated one difficulty band below base difficulty, clamped at
difficulty 1. Later new problems SHALL use base difficulty until recovery begins.

After three consecutive recorded misses, later new problems SHALL use a difficulty one band
below base difficulty, clamped at difficulty 1, for the rest of the lesson. A correct answer
before the third consecutive miss SHALL reset the consecutive-miss count. An unfinished entry
that records no attempt SHALL neither advance nor reset that count. The difficulty adjustment
SHALL NOT be announced to the learner. Re-queued problems SHALL remain the exact problems
originally presented, including their original difficulty.

#### Scenario: Difficulty rises with mastery

- **WHEN** a skill is at mastery 0
- **THEN** its base lesson difficulty is 1

#### Scenario: Difficulty is clamped

- **WHEN** a skill is at mastery 5
- **THEN** its base lesson difficulty is 5, not 6

#### Scenario: Opening warm-up below base difficulty

- **WHEN** a lesson's base difficulty is above 1
- **THEN** the opening problem is generated one difficulty band lower
- **AND** the next new problem uses base difficulty unless recovery has begun

#### Scenario: Opening warm-up clamps at minimum difficulty

- **WHEN** a lesson's base difficulty is 1
- **THEN** the opening problem is generated at difficulty 1

#### Scenario: Three consecutive misses trigger silent recovery

- **WHEN** a learner records three misses in a row during one lesson
- **THEN** every later new problem in that lesson is generated one difficulty band below base
  difficulty, clamped at difficulty 1
- **AND** the lesson does not display or announce the adjustment

#### Scenario: Correct answer breaks a miss streak

- **WHEN** a learner records one or two misses and then answers correctly
- **THEN** the consecutive-miss count resets
- **AND** recovery does not begin from those earlier misses

#### Scenario: Unfinished entry does not change a miss streak

- **WHEN** an answer entry is unfinished and no attempt is recorded
- **THEN** the consecutive-miss count is unchanged

#### Scenario: Recovery does not rewrite re-queued problems

- **WHEN** a problem generated before recovery is missed and later returns after recovery began
- **THEN** the same problem returns with the difficulty at which it was first generated

### Requirement: Lessons end on correct answers, never on failure

A standard lesson SHALL end after 10 correct answers. A lesson for a skill whose curriculum
manifest entry is marked `quick` SHALL end after 5 correct answers. Lesson length SHALL come
from the manifest rather than the generator so pacing metadata has one authority.

There SHALL be no hearts, lives, or failure state. Problems SHALL be generated only as the
lesson needs them. A recorded miss SHALL re-queue that exact problem up to three problem
positions later in the same session, clamped to the number of required positions remaining,
so a lesson cannot be completed without eventually answering every presented problem
correctly.

#### Scenario: Standard lesson length

- **WHEN** a learner answers the 10th problem correctly for a skill not marked `quick`
- **THEN** the lesson completes

#### Scenario: Quick lesson length

- **WHEN** a learner answers the 5th problem correctly for a skill marked `quick` in the
  curriculum manifest
- **THEN** the lesson completes

#### Scenario: Wrong answer re-queues

- **WHEN** a learner answers a problem incorrectly
- **THEN** the correct-answer count does not increase
- **AND** that exact problem returns up to three problem positions later in the same session,
  or sooner when fewer required positions remain
- **AND** no life, heart, or attempt is deducted

#### Scenario: Late wrong answer cannot be bypassed

- **WHEN** a learner records a miss with fewer than three required problem positions left
- **THEN** the missed problem is re-queued within the remaining positions
- **AND** the lesson does not complete until that problem is answered correctly
