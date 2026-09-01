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
