# review-scheduling Specification

## Purpose

Tracks how strongly each practised skill is recalled and when it should return, while keeping
older local and restored progress records safe without a migration.

## Requirements

### Requirement: Each skill has independent review state

Each skill progress record SHALL support a recall strength from 0 through 5, a next-review
local calendar date or no scheduled review, and a non-negative review-attempt count. Recall
strength SHALL be separate from mastery: changing recall strength MUST NOT reduce mastery,
change unlocks, or change rewards.

A newly created skill record SHALL start at strength 0 with no next-review date and zero review
attempts.

#### Scenario: Fresh skill has no review due

- **WHEN** progress creates a skill record that has never completed a lesson
- **THEN** its recall strength is 0
- **AND** it has no next-review date
- **AND** its review-attempt count is 0

#### Scenario: Recall strength does not replace mastery

- **WHEN** a skill's recall strength changes
- **THEN** its mastery and unlock state remain unchanged

### Requirement: Standard lesson completion starts or refreshes review

Completing a standard skill lesson SHALL set recall strength to the greater of its current
normalized strength and the mastery reached by that completion. It SHALL schedule the skill
from the completion's local calendar day using the interval for that resulting strength.
Completing a standard lesson SHALL NOT increment the review-attempt count.

The interval ladder SHALL be 1 day at strengths 0 and 1, 3 days at strength 2, 7 days at
strength 3, 14 days at strength 4, and 30 days at strength 5.

#### Scenario: First completed lesson returns tomorrow

- **WHEN** a skill completes its first standard lesson and reaches mastery 1
- **THEN** its recall strength becomes 1
- **AND** its next-review date is one local calendar day after completion
- **AND** its review-attempt count remains 0

#### Scenario: Deeper practice keeps stronger recall

- **WHEN** a standard lesson reaches mastery 3 for a skill whose normalized strength is 1
- **THEN** its recall strength becomes 3
- **AND** its next-review date is seven local calendar days after completion

#### Scenario: Standard practice does not weaken an existing schedule

- **WHEN** a standard lesson reaches mastery 3 for a skill whose normalized strength is 4
- **THEN** its recall strength remains 4
- **AND** its next-review date is fourteen local calendar days after completion

### Requirement: Review results adjust strength and reschedule

The scheduler SHALL produce a complete next review state from a skill's current state, one
recorded review result, and the learner's current local calendar day. A correct result SHALL
raise recall strength by 1, capped at 5. An incorrect result SHALL lower recall strength by 1,
floored at 0. Either result SHALL increment the review-attempt count by 1 and schedule the next
review using the interval for the resulting strength.

#### Scenario: Correct review extends the interval

- **WHEN** a skill at strength 2 records a correct review on 2026-08-31
- **THEN** its strength becomes 3
- **AND** its review-attempt count increases by 1
- **AND** its next-review date becomes 2026-09-07

#### Scenario: Incorrect review shortens the interval

- **WHEN** a skill at strength 4 records an incorrect review on 2026-08-31
- **THEN** its strength becomes 3
- **AND** its review-attempt count increases by 1
- **AND** its next-review date becomes 2026-09-07

#### Scenario: Strength remains within bounds

- **WHEN** a correct review is recorded at strength 5 or an incorrect review is recorded at
  strength 0
- **THEN** strength remains within 0 through 5
- **AND** the review-attempt count still increases

### Requirement: Due status follows local calendar days

A skill SHALL be due when it has a next-review date on or before the supplied local calendar
day. A skill with no next-review date, or with a date after the supplied day, SHALL not be due.
Calendar arithmetic SHALL advance named local days across month, year, leap-day, and daylight-
saving boundaries rather than adding fixed 24-hour durations.

#### Scenario: Skill is due on its scheduled day

- **WHEN** a skill's next-review date and the supplied local day are both 2026-09-07
- **THEN** the skill is due

#### Scenario: Overdue skill remains due

- **WHEN** a skill's next-review date is before the supplied local day
- **THEN** the skill is due

#### Scenario: Unscheduled or future skill is not due

- **WHEN** a skill has no next-review date or its next-review date is after the supplied local day
- **THEN** the skill is not due

### Requirement: Legacy review state is defaulted on every read

A skill object that predates review scheduling SHALL remain valid. When review fields are
absent, the system SHALL derive strength from mastery clamped to 0 through 5, derive the
next-review date from a valid `lastPracticed` day plus that strength's interval, and read the
review-attempt count as 0. An absent or invalid `lastPracticed` value SHALL leave the legacy
skill unscheduled.

Defaults and safe normalization SHALL be applied whenever progress is read, including after a
file restore or remote adoption. Reading SHALL NOT eagerly rewrite the stored skill object.
Unknown skill fields SHALL remain intact. Finite numeric review values outside their valid
ranges SHALL be clamped; malformed values and malformed calendar dates SHALL fall back to the
same safe legacy defaults.

#### Scenario: Completed legacy skill receives a derived schedule

- **WHEN** a legacy skill has mastery 3 and `lastPracticed` 2026-08-31 but no review fields
- **THEN** it reads at strength 3 with next-review date 2026-09-07 and zero review attempts
- **AND** the stored skill object is not rewritten by that read

#### Scenario: Uncompleted legacy skill stays unscheduled

- **WHEN** a legacy skill has mastery 0 and no valid `lastPracticed` day
- **THEN** it reads at strength 0 with no next-review date and zero review attempts

#### Scenario: Restored legacy and unknown data survive together

- **WHEN** a file restore or remote adoption supplies a legacy skill with an unknown field
- **THEN** review state receives the same read-time defaults as local legacy progress
- **AND** mastery, attempt history, unlock behavior, and the unknown field are preserved

### Requirement: Review state uses existing local-first persistence

Persisted review fields SHALL remain inside the existing progress document. A lesson completion
that changes review state SHALL remain a normal local progress mutation, including a strictly
advancing `updatedAt`, local IndexedDB persistence, and background sync scheduling. The server
endpoint SHALL continue to store, return, and conflict-check the progress document without
interpreting or migrating review fields.

#### Scenario: Scheduled state survives remote adoption

- **WHEN** a server progress document containing review fields is adopted
- **THEN** those fields are available through the same normalized reads as local progress
- **AND** the server-supplied `updatedAt` remains the adopted local version

#### Scenario: Completing a lesson persists its schedule

- **WHEN** a standard lesson completion starts or refreshes review state
- **THEN** the updated skill and a strictly newer `updatedAt` are written locally
- **AND** the existing sync subscriber can carry the unchanged progress document format

### Requirement: Due skills form a bounded review lesson

The system SHALL select review slots from manifest-derived implemented skills whose normalized
next-review date is on or before the supplied local calendar day. Each selected skill SHALL
appear once. Selection SHALL place earlier next-review dates first, break equal-date ties by
curriculum order, and stop after ten skills. A review lesson SHALL contain every selected slot
when fewer than ten skills are due.

The selected order SHALL remain fixed for that session even as answers reschedule individual
skills.

#### Scenario: Oldest due skills enter first

- **WHEN** more than ten implemented skills are due on different dates
- **THEN** the review lesson contains the ten skills with the earliest next-review dates
- **AND** each selected skill appears once

#### Scenario: Equal dates follow curriculum order

- **WHEN** multiple due skills have the same normalized next-review date
- **THEN** those skills are ordered as the curriculum manifest presents them

#### Scenario: A small due set makes a short review

- **WHEN** between one and nine implemented skills are due
- **THEN** the review lesson contains one slot for every due skill
- **AND** no not-yet-due, unscheduled, planned, or duplicate skill is added to fill ten slots

#### Scenario: Rescheduling does not change an active lesson

- **WHEN** a recorded answer moves one selected skill's next-review date into the future
- **THEN** the remaining selected slots and their order stay unchanged

### Requirement: Every recorded review answer updates its own skill

A correct or incorrect review answer SHALL update the skill carried by the current slot. One
local progress mutation SHALL update that skill's aggregate attempt and correct counts, its
normalized recall strength, next-review date, and review-attempt count. A diagnosed incorrect
answer SHALL update the matching progress-level misconception-tag count in the same mutation.

Every recorded answer, including an incorrect answer and a later answer to its re-queued
problem, SHALL be a separate review result. An unfinished or wrong-form entry that records no
attempt SHALL change none of these fields. Review answers SHALL NOT change mastery, unlocks,
intro state, XP, coins, streaks, checkpoints, or pin tiers.

The mutation SHALL preserve unknown skill fields, strictly advance the local progress version,
write through existing local persistence, and remain compatible with opaque background sync.

#### Scenario: Correct answer updates only its slot skill

- **WHEN** a correct answer is recorded for one slot in a mixed review
- **THEN** that slot's aggregate attempt and correct counts each increase by one
- **AND** its recall strength, next-review date, and review-attempt count reflect one correct
  review result on the supplied local day
- **AND** no other selected skill changes

#### Scenario: Diagnosed miss is recorded and re-queued

- **WHEN** an incorrect review answer matches a predicted misconception
- **THEN** that slot's aggregate attempt count and review-attempt count each increase by one
- **AND** its aggregate correct count does not increase
- **AND** its recall state reflects one incorrect review result
- **AND** the matching progress-level misconception-tag count increases in the same local
  mutation
- **AND** the exact missed problem remains eligible for the session's normal retry behavior

#### Scenario: Correct retry is another review result

- **WHEN** a previously missed review problem returns and is answered correctly
- **THEN** the same skill receives a second aggregate attempt and review attempt
- **AND** its aggregate correct count increases by one
- **AND** its recall state reflects the correct retry after the earlier miss

#### Scenario: Non-attempt changes nothing

- **WHEN** a review entry is unfinished or otherwise records no attempt
- **THEN** aggregate accuracy, misconceptions, recall state, mastery, and persistence version
  remain unchanged

#### Scenario: Review write preserves compatibility

- **WHEN** a legacy or restored skill object with unknown fields records a review answer
- **THEN** review fields are normalized before the result is applied
- **AND** mastery, unlock evidence, and unknown fields survive the one versioned local write
- **AND** the existing sync document format remains unchanged

### Requirement: Completing review is one repeat lesson outcome

A review lesson SHALL complete after every selected slot has been answered correctly, including
any required retries. Completion SHALL award the same XP and base coins as one completed
standard lesson that does not raise mastery, apply the current streak multiplier to those coins,
advance daily-goal and streak state once, and announce a crossed streak milestone through the
existing completion sequence.

Review completion SHALL NOT change any skill's mastery, create a stage checkpoint, create a pin
upgrade, or award completion more than once. Recall strength SHALL NOT alter the payout. Leaving
before completion SHALL award no completion reward, while already recorded review answers remain
persisted.

#### Scenario: Completed review pays once without mastery

- **WHEN** the learner answers every selected review slot correctly
- **THEN** one repeat-lesson XP and coin reward is recorded
- **AND** daily-goal and streak state advance once
- **AND** every selected skill's mastery and unlock state remain unchanged

#### Scenario: Review can announce a streak milestone

- **WHEN** completing a review lesson crosses a streak milestone
- **THEN** that milestone is announced once through the existing completion sequence
- **AND** no stage checkpoint or pin upgrade is announced

#### Scenario: Leaving review keeps evidence but pays nothing

- **WHEN** the learner leaves after recording some review answers but before every selected slot
  is correct
- **THEN** those recorded answers and schedules remain persisted
- **AND** no completion XP, coins, daily-goal progress, or streak completion is recorded
