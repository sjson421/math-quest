# Skill Progression

## Purpose

How a learner moves through the course: mastery levels, what unlocks a skill,
how difficulty follows mastery, and how a lesson ends. The through-line is that progress is
never taken away — there is no failure state, and stored progress survives the course growing
underneath it.

## Requirements

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

Prerequisites SHALL be taken from the curriculum manifest's derived unlock graph — the
manifest's prerequisite edges with `planned` skills seen through — and from no other source.
There SHALL be exactly one prerequisite graph in the system, and it SHALL be the manifest's,
at runtime as well as at design time.

Because `planned` skills are transparent, a skill's prerequisites SHALL be the nearest
`implemented` skills behind it. A skill that is itself `planned` SHALL be locked, whatever
its prerequisites hold, since a skill with no generator cannot be played.

The three rules SHALL be applied in this order, and the first that decides wins:

1. A `planned` skill is locked.
2. A practised skill is unlocked — see *A practised skill is never re-locked*.
3. Otherwise, every prerequisite must have reached mastery 2.

Rule 1 outranks rule 2 deliberately: offering a lesson that cannot be generated is worse for
the learner than a skill that closes because the course itself is unfinished.

#### Scenario: All prerequisites met

- **WHEN** every prerequisite of a skill is at mastery 2 or above
- **THEN** the skill is unlocked

#### Scenario: One prerequisite short

- **WHEN** any prerequisite of a skill is at mastery 1 or below
- **THEN** the skill remains locked

#### Scenario: Root skill needs nothing

- **WHEN** a skill declares no prerequisites
- **THEN** it is unlocked from first launch

#### Scenario: Manifest is the runtime authority

- **WHEN** the manifest and any other source would imply different prerequisites for a skill
- **THEN** the manifest's derived unlock edges decide whether the skill is unlocked

#### Scenario: Planned prerequisite is seen through

- **WHEN** a skill's manifest prerequisite has no generator
- **THEN** unlocking is decided by the nearest implemented skills behind it
- **AND** the learner is never held behind a skill that cannot be played

#### Scenario: Planned skill is not offered

- **WHEN** a skill has no generator, or its stage requires a capability that is not built
- **THEN** it is locked regardless of the mastery of its prerequisites
- **AND** it is locked even if the learner has practised it before

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

Every lesson SHALL end after 10 correct answers. There SHALL be no hearts, lives, or failure
state. An incorrect answer SHALL re-queue that problem later in the same session, so a lesson
cannot be completed without eventually answering every problem correctly.

> The manifest records which skills are `quick` — 19 of them — but lesson length does not yet
> read the flag, so a quick skill still ends at 10. Shortening those lessons to 5 is a
> behaviour change this change did not make; it lands as its own delta against this
> requirement.

#### Scenario: Standard lesson length

- **WHEN** a learner answers the 10th problem correctly
- **THEN** the lesson completes

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

### Requirement: A practised skill is never re-locked

A skill the learner has already practised SHALL remain unlocked for as long as its progress
record survives and the skill remains playable, even when a later change to the curriculum
graph would place it behind prerequisites the learner has not met. A skill counts as
practised once it holds any recorded attempt or any mastery above 0.

This rule SHALL hold permanently at read time rather than as a one-time migration, because a
progress record can arrive from the backup endpoint at any point in the future and that
endpoint stores the record opaquely without ever migrating it. Applying the rule SHALL NOT
require reading, writing, or adding any stored field beyond those a progress record already
carries.

Preserving mastery alone SHALL NOT be treated as sufficient. Unlocking gates whether a lesson
can be *started*, so a learner whose skill is re-locked keeps a mastery level they can no
longer practise or raise. Equally, no re-locking rule SHALL ever reduce a mastery level: a
graph change adjusts what is open, never what has been earned.

#### Scenario: Tightened prerequisites do not strand a learner

- **WHEN** a skill's prerequisites become stricter than they were when the learner practised it
- **AND** the learner's stored record for that skill shows at least one attempt
- **THEN** the skill stays unlocked
- **AND** its mastery is unchanged

#### Scenario: Inherited tightening is covered too

- **WHEN** a skill's own edges are unchanged or fewer, but a prerequisite of its prerequisite
  has become stricter, so the skill sits behind more skills than before
- **AND** the learner had already practised it
- **THEN** the skill stays unlocked

#### Scenario: Dropped edge takes effect immediately

- **WHEN** an edge is removed from a skill's prerequisites
- **THEN** that former prerequisite's mastery no longer affects whether the skill unlocks
- **AND** no practice history is required for the edge to stop applying

#### Scenario: Never practised, never grandfathered

- **WHEN** a skill has no recorded attempts and mastery 0
- **THEN** it is unlocked only by its current prerequisites

#### Scenario: Restored backup keeps the same skills open

- **WHEN** a progress record is restored from the backup endpoint or a handed-over file
- **THEN** every playable skill practised in that record is unlocked
- **AND** the outcome is the same whether the record is restored once or many times

#### Scenario: Mastery without attempts still counts as practised

- **WHEN** a progress record holds mastery above 0 for a skill with no recorded attempts
- **THEN** that skill counts as practised and stays unlocked

### Requirement: Skills are presented in curriculum order

Skills SHALL be presented to the learner in the order the curriculum manifest declares them,
so that the order they are read in matches the order they unlock in. A learner SHALL NOT
encounter a locked skill above a skill that is open to them, except where a skill they have
already practised has been grandfathered past a tightened gate.

This matters because the unlock graph is a line: presenting it out of order turns a sequence
into a scatter of padlocks, and the learner has no way to tell which card is next.

#### Scenario: Presentation order follows the manifest

- **WHEN** the learner is shown the skills available to them
- **THEN** they appear in manifest order, not in the order their generators were written
