## Purpose

Timed mode gives explicitly timed practice sessions one accurate, accessible elapsed clock
without introducing time pressure anywhere else in the course.

## ADDED Requirements

### Requirement: Timing is an explicit property of one practice session

A practice session SHALL be untimed by default. A caller SHALL be able to opt one session into
timing when that session starts. The timed session SHALL keep one start instant across every
problem, hint, answer, feedback transition, and exact retry in that session.

When a first-time teaching intro precedes practice, timing SHALL begin only when the learner
starts practice. Reviewing the intro after a timed session has started SHALL NOT reset or pause
the session clock.

#### Scenario: Existing lesson modes stay untimed

- **WHEN** a standard lesson, mixed review, or skip check starts without an explicit timed-session
  request
- **THEN** it has no active clock
- **AND** no timer appears on its lesson surface

#### Scenario: Timing begins after the automatic intro

- **WHEN** a timed standard lesson first shows its teaching intro
- **THEN** no session time elapses before the learner starts practice
- **AND** practice starts with one new session clock at zero

#### Scenario: One clock spans the complete active session

- **WHEN** a timed learner moves between problems, reads a hint, receives feedback, retries an
  earlier problem, or reviews the intro
- **THEN** the same clock continues from its original start
- **AND** none of those transitions resets or pauses it

### Requirement: The elapsed clock remains accurate after delayed updates

The clock SHALL display elapsed whole seconds derived from the session's fixed start and a
monotonic current time. It SHALL NOT derive elapsed time by counting render or interval events.
Delayed or throttled updates SHALL therefore catch up to the actual elapsed duration, and the
display SHALL never show a negative duration or move backwards.

Elapsed durations below one hour SHALL use `m:ss`; durations of one hour or more SHALL use
`h:mm:ss`. Seconds, and minutes within an hour, SHALL always use two digits after a separator.

#### Scenario: Elapsed time has stable formatting

- **WHEN** a timed session has elapsed for 0, 65, and 3,605 whole seconds
- **THEN** its visible values are `0:00`, `1:05`, and `1:00:05` respectively

#### Scenario: A throttled clock catches up

- **WHEN** timer updates are delayed while 65 seconds pass from the fixed session start
- **THEN** the next update displays `1:05`
- **AND** it does not display the number of interval callbacks that happened

#### Scenario: Invalid negative elapsed time clamps safely

- **WHEN** the supplied current instant precedes the recorded session start
- **THEN** the clock displays `0:00`
- **AND** it does not expose a negative duration

### Requirement: The timed lesson clock is accessible and phone-readable

An active timed session SHALL render one compact visible clock with an accessible name that
identifies it as elapsed time and exposes its current value. Updating once per elapsed second
SHALL NOT use an assertive or polite live region that interrupts the learner on every tick.

The clock, progress indicator, progress count, leave action, and any available intro-review
action SHALL fit the 375-pixel lesson surface without horizontal page overflow or clipped text.
The clock SHALL use tabular numerals so its width does not jump as digits change.

#### Scenario: Assistive technology can inspect time without tick announcements

- **WHEN** an active timed session is rendered
- **THEN** assistive technology can identify one elapsed-time clock and read its current value
- **AND** each tick is not announced through a live region

#### Scenario: Timed header fits the phone target

- **WHEN** a timed lesson with its progress count and intro-review action is viewed at 375 by 812
  pixels
- **THEN** the page and lesson header have no horizontal overflow
- **AND** every header action and value remains visible and legible

### Requirement: Timing remains transient and does not control lesson outcomes

Completing or leaving a timed session SHALL stop its display updates and discard its clock. A
later session SHALL start with a new clock at zero. Timing SHALL NOT be written to learner
progress, sync data, a global setting, or any other persisted record.

Elapsed time reaching any value SHALL NOT submit an answer, record an attempt, end a session,
change a score, alter difficulty or recovery, or change completion rewards. Timed and untimed
sessions SHALL otherwise preserve the same lesson behavior.

#### Scenario: Leaving discards session time

- **WHEN** a learner leaves a timed session and later starts another session
- **THEN** the first clock no longer updates
- **AND** the new session starts at `0:00` with no restored elapsed value

#### Scenario: Elapsed time does not expire the lesson

- **WHEN** a timed session remains active for any elapsed duration
- **THEN** no answer or attempt is recorded because of the clock
- **AND** existing answer, retry, recovery, completion, and reward rules remain unchanged
