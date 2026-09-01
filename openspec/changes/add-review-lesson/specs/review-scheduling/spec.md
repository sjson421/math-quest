## ADDED Requirements

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
- **AND** the matching progress-level misconception-tag count increases in the same local mutation
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
