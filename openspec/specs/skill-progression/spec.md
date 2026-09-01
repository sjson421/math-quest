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

Exactly one thing SHALL be able to reduce a mastery level: the learner taking back a block
they marked as already known, and then only for the skills that skip itself granted. That is
not a re-locking rule and not a system decision — it is the learner withdrawing a claim they
made, and it SHALL never reach a mastery level the learner earned by practice. Any other
reduction of a stored mastery level SHALL be treated as a defect.

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

#### Scenario: Only a withdrawn skip reduces mastery

- **WHEN** a learner takes back a block they had marked as already known
- **THEN** the skills that skip granted return to the mastery each held before the mark, which
  is 0 for a skill the skip found untouched
- **AND** every skill in that block whose mastery the learner earned by practice keeps it,
  including one the mark raised from a level they had part-practised
- **AND** no rule other than this one has reduced a stored mastery level

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

### Requirement: Lesson sessions can carry ordered mixed-skill slots

A lesson session SHALL accept a fixed ordered sequence of one or more problem slots. Each slot
SHALL retain the skill that generates it and that skill's base difficulty before a problem is
generated. Problems SHALL remain lazy: only the current unseen slot is generated.

The first slot in the session SHALL use the existing opening warm-up rule against its own base
difficulty. Each later unseen slot SHALL use its own base difficulty unless session-wide silent
recovery has begun, in which case it SHALL use one band below that base, clamped at difficulty
1. Recorded answers across all slots SHALL contribute to the same consecutive-miss and recovery
state. A miss SHALL re-queue the exact slot and generated problem under the existing retry rule.

The session SHALL complete only after every original slot has been answered correctly. Standard
single-skill lessons SHALL be built as repeated slots for that one skill and retain their current
manifest-selected target, intro, mastery completion, reward, and navigation behavior.

#### Scenario: Mixed slots generate from their own skills

- **WHEN** a mixed session advances from a slot for one skill to an unseen slot for another
  skill
- **THEN** the new problem is generated by the second slot's skill
- **AND** it uses the second slot's base difficulty under the active pacing state

#### Scenario: Mixed session has one warm-up

- **WHEN** a mixed session starts above difficulty 1
- **THEN** only its first slot receives the opening one-band warm-up
- **AND** a later unseen slot uses its own base difficulty unless recovery has begun

#### Scenario: Recovery crosses skill boundaries

- **WHEN** three consecutive recorded misses occur across different skills in one mixed session
- **THEN** session-wide recovery begins
- **AND** every later unseen slot generates one band below its own base difficulty
- **AND** the adjustment is not announced

#### Scenario: Mixed retry retains skill and problem

- **WHEN** a problem in a mixed session is missed and later returns
- **THEN** the exact generated problem returns with the same skill and difficulty
- **AND** the session cannot complete until that slot is answered correctly

#### Scenario: Standard lessons remain single-skill sessions

- **WHEN** a standard lesson starts for a quick or non-quick skill
- **THEN** every slot belongs to that skill
- **AND** its correct-answer target remains 5 for quick skills and 10 otherwise
- **AND** its existing intro, attempt, mastery, completion, and exit behavior remains unchanged
