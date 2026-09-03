## MODIFIED Requirements

### Requirement: Each skill has independent review state

Each skill progress record SHALL support a recall strength from 0 through 5, a next-review
local calendar date or no scheduled review, a non-negative review-attempt count, and a
non-negative review-correct count. Recall strength SHALL be separate from mastery: changing
recall strength MUST NOT reduce mastery, change unlocks, or change rewards.

The review-correct count SHALL count only review answers recorded as correct, so that a skill's
review accuracy is derivable from the record alone. It SHALL be separate from the skill's
aggregate correct count, which also counts standard lesson answers and therefore cannot answer
how a skill has fared in review. It SHALL never exceed the review-attempt count.

A newly created skill record SHALL start at strength 0 with no next-review date, zero review
attempts, and zero review correct.

#### Scenario: Fresh skill has no review due

- **WHEN** progress creates a skill record that has never completed a lesson
- **THEN** its recall strength is 0
- **AND** it has no next-review date
- **AND** its review-attempt count is 0
- **AND** its review-correct count is 0

#### Scenario: Recall strength does not replace mastery

- **WHEN** a skill's recall strength changes
- **THEN** its mastery and unlock state remain unchanged

#### Scenario: Review accuracy is not aggregate accuracy

- **WHEN** a skill records a standard lesson answer and a review answer
- **THEN** its aggregate counts reflect both answers
- **AND** its review-attempt and review-correct counts reflect only the review answer

### Requirement: Legacy review state is defaulted on every read

A skill object that predates review scheduling SHALL remain valid. When review fields are
absent, the system SHALL derive strength from mastery clamped to 0 through 5, derive the
next-review date from a valid `lastPracticed` day plus that strength's interval, and read the
review-attempt and review-correct counts as 0. An absent or invalid `lastPracticed` value SHALL
leave the legacy skill unscheduled.

Defaults and safe normalization SHALL be applied whenever progress is read, including after a
file restore or remote adoption. Reading SHALL NOT eagerly rewrite the stored skill object.
Unknown skill fields SHALL remain intact. Finite numeric review values outside their valid
ranges SHALL be clamped; malformed values and malformed calendar dates SHALL fall back to the
same safe legacy defaults. A stored review-correct count greater than the stored review-attempt
count SHALL read as the review-attempt count, so no record can report accuracy above 100%.

#### Scenario: Completed legacy skill receives a derived schedule

- **WHEN** a legacy skill has mastery 3 and `lastPracticed` 2026-08-31 but no review fields
- **THEN** it reads at strength 3 with next-review date 2026-09-07, zero review attempts, and
  zero review correct
- **AND** the stored skill object is not rewritten by that read

#### Scenario: Uncompleted legacy skill stays unscheduled

- **WHEN** a legacy skill has mastery 0 and no valid `lastPracticed` day
- **THEN** it reads at strength 0 with no next-review date, zero review attempts, and zero
  review correct

#### Scenario: Restored legacy and unknown data survive together

- **WHEN** a file restore or remote adoption supplies a legacy skill with an unknown field
- **THEN** review state receives the same read-time defaults as local legacy progress
- **AND** mastery, attempt history, unlock behavior, and the unknown field are preserved

#### Scenario: Impossible stored accuracy is clamped

- **WHEN** a restored skill holds a review-correct count above its review-attempt count, or a
  negative, fractional, or malformed review-correct value
- **THEN** it reads as a count no greater than the review-attempt count and no less than zero
- **AND** the record loads normally and keeps its other fields

### Requirement: Every recorded review answer updates its own skill

A correct or incorrect review answer SHALL update the skill carried by the current slot. One
local progress mutation SHALL update that skill's aggregate attempt and correct counts, its
normalized recall strength, next-review date, review-attempt count, and review-correct count. A
diagnosed incorrect answer SHALL update the matching progress-level misconception-tag count in
the same mutation.

The review-correct count SHALL increase by one for a correct review answer and SHALL NOT change
for an incorrect one. Completing a standard lesson SHALL NOT change it, for the same reason it
does not change the review-attempt count.

Every recorded answer, including an incorrect answer and a later answer to its re-queued
problem, SHALL be a separate review result. An unfinished or wrong-form entry that records no
attempt SHALL change none of these fields. Review answers SHALL NOT change mastery, unlocks,
intro state, XP, coins, streaks, checkpoints, or pin tiers.

The mutation SHALL preserve unknown skill fields, strictly advance the local progress version,
write through existing local persistence, and remain compatible with opaque background sync.

#### Scenario: Correct answer updates only its slot skill

- **WHEN** a correct answer is recorded for one slot in a mixed review
- **THEN** that slot's aggregate attempt and correct counts each increase by one
- **AND** its recall strength, next-review date, review-attempt count, and review-correct count
  reflect one correct review result on the supplied local day
- **AND** no other selected skill changes

#### Scenario: Diagnosed miss is recorded and re-queued

- **WHEN** an incorrect review answer matches a predicted misconception
- **THEN** that slot's aggregate attempt count and review-attempt count each increase by one
- **AND** its aggregate correct count and its review-correct count do not increase
- **AND** its recall state reflects one incorrect review result
- **AND** the matching progress-level misconception-tag count increases in the same local
  mutation
- **AND** the exact missed problem remains eligible for the session's normal retry behavior

#### Scenario: Correct retry is another review result

- **WHEN** a previously missed review problem returns and is answered correctly
- **THEN** the same skill receives a second aggregate attempt and review attempt
- **AND** its aggregate correct count and its review-correct count each increase by one
- **AND** its recall state reflects the correct retry after the earlier miss

#### Scenario: Standard practice leaves review counts alone

- **WHEN** a learner completes a standard lesson for a skill that has review history
- **THEN** its review-attempt and review-correct counts are unchanged

#### Scenario: Non-attempt changes nothing

- **WHEN** a review entry is unfinished or otherwise records no attempt
- **THEN** aggregate accuracy, misconceptions, recall state, mastery, and persistence version
  remain unchanged

#### Scenario: Review write preserves compatibility

- **WHEN** a legacy or restored skill object with unknown fields records a review answer
- **THEN** review fields are normalized before the result is applied
- **AND** mastery, unlock evidence, and unknown fields survive the one versioned local write
- **AND** the existing sync document format remains unchanged
