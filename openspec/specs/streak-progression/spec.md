# Streak Progression Specification

## Purpose

The run of consecutive days a learner has practised: what keeps it, what covers a missed
day, what it is worth, and what it announces. It is the only thing in the app the learner
can lose, which is why the rules below are as concerned with what the app must *not* claim
or confiscate as with what it counts.

Nothing here gates or accelerates learning. A streak changes what a lesson pays and what the
shop will sell; it never changes what is taught, what unlocks, or how hard a problem is.

## Requirements

### Requirement: A day is the learner's local calendar day

Every streak decision SHALL be made in the device's local calendar day, never in UTC. The
day a lesson is finished, the day a streak breaks, and the day a freeze covers SHALL all use
the same definition, from one place.

#### Scenario: A late-evening lesson counts for that local day

- **WHEN** a lesson is finished at 23:30 local time
- **THEN** it counts for the local calendar day it was finished on
- **AND** not the following day, whatever the UTC offset

### Requirement: A streak survives a gap of one day and breaks beyond it

A streak SHALL advance by one when a lesson is finished on the day after the last active
day, and SHALL restart at one when a lesson is finished after a longer gap. A second lesson
on the same day SHALL NOT advance it again.

A streak that has missed a day SHALL break on the next open of the app, so that what the
home screen shows is true the moment it is opened rather than only after another lesson.

A break SHALL be derived from the record rather than stored: recomputing it on a later open
SHALL give the same answer, and no field recording it SHALL be added to the record.

A device whose clock has moved backwards SHALL be treated as having missed nothing rather
than as having broken the streak.

#### Scenario: Practising on consecutive days advances the streak

- **WHEN** a learner whose last lesson was yesterday finishes a lesson
- **THEN** the streak is one longer

#### Scenario: A second lesson the same day does not advance it

- **WHEN** a learner finishes a second lesson on a day that already has one
- **THEN** the streak is unchanged

#### Scenario: A missed day breaks the streak on opening

- **WHEN** the app is opened and a day passed with no lesson and nothing covering it
- **THEN** the streak reads zero
- **AND** nothing is written to storage, because the break recomputes

### Requirement: A streak freeze covers a missed day and is spent exactly once

A learner SHALL be able to buy a streak freeze with coins and hold at most a fixed small
number of them. A freeze SHALL be consumed automatically when the app is opened after a
missed day, because the day a freeze protects is one the learner did not open the app on and
so cannot spend it during.

Freezes SHALL be spent only when the held freezes cover **every** missed day. When they do
not, the streak SHALL break and no freeze SHALL be spent, so that a learner is never charged
for cover that saved nothing.

Spending SHALL be written to storage and SHALL be idempotent: opening the app repeatedly on
the same day SHALL spend at most the freezes that day's gap required.

A freeze SHALL NOT be held in the item inventory and SHALL NOT be a catalogue item, so that
the rule that every catalogue item is permanent and uniquely owned remains true.

A streak already at zero SHALL NOT consume a freeze.

#### Scenario: One freeze covers one missed day

- **WHEN** the app is opened after exactly one missed day and one freeze is held
- **THEN** the streak is unchanged
- **AND** the held count is one lower
- **AND** the change is persisted

#### Scenario: Opening again the same day spends nothing further

- **WHEN** the app is opened a second time on a day whose gap a freeze already covered
- **THEN** no further freeze is spent and the streak is unchanged

#### Scenario: Partial cover takes nothing

- **WHEN** the app is opened after three missed days with two freezes held
- **THEN** the streak breaks
- **AND** both freezes are still held

#### Scenario: A spent freeze is reported when the learner returns

- **WHEN** the app is opened and a freeze covers a missed day
- **THEN** the home screen says a freeze covered it
- **AND** an open that spends nothing says nothing, so the report never outlives
  the day it describes

#### Scenario: The cap refuses another purchase

- **WHEN** a learner already holding the maximum tries to buy a freeze
- **THEN** the purchase is refused and no coins are deducted

### Requirement: A longer streak pays more coins per lesson

The coins a finished lesson pays SHALL be multiplied by a factor determined by the streak
the lesson has just extended. The lowest tier SHALL be a multiplier of one, so a learner who
keeps no streak earns exactly what they earned before the multiplier existed.

The multiplier SHALL be applied to coins only. It SHALL NOT change experience, mastery, the
daily goal, or anything else a lesson records.

The paid amount SHALL match the rate the app displays rather than exceeding it by rounding.

#### Scenario: A learner with no streak earns the base rate

- **WHEN** a lesson is finished on a streak below the first tier
- **THEN** the coins paid are the unmultiplied amount

#### Scenario: The rate follows the streak the lesson just extended

- **WHEN** a lesson takes the streak onto a new multiplier tier
- **THEN** that lesson is paid at the new tier's rate

#### Scenario: Only coins change

- **WHEN** a lesson is paid at a multiplier above one
- **THEN** the experience it awards is the same as at the base rate

### Requirement: Milestone days are announced once and pay a bonus

Reaching a milestone day SHALL show one screen naming the run and paying a coin bonus. The
announcement SHALL follow from the transition that lesson caused, so a later lesson at the
same streak SHALL show nothing, and a record restored already past a milestone SHALL
announce nothing.

Where one record crosses several milestones at once, the furthest reached SHALL be the one
announced.

No milestone state SHALL be stored: which milestones have been announced SHALL be derivable
from the streak itself.

The screen SHALL describe the days counted and SHALL NOT make a claim about the learner.

#### Scenario: The milestone is announced on the day it is reached

- **WHEN** a lesson takes the streak onto a milestone day
- **THEN** a screen names that run and the bonus it paid

#### Scenario: The day after announces nothing

- **WHEN** the next lesson extends the streak past that milestone
- **THEN** no milestone screen is shown

#### Scenario: A restored record announces nothing it did not just earn

- **WHEN** a record is restored already past a milestone
- **THEN** no milestone is announced for a day crossed before the restore

### Requirement: The streak is shown prominently and warns before it is lost

The home screen SHALL show the streak as its own element rather than as one figure among
several, SHALL state how many freezes are held when any are, and SHALL show the multiplier
when it is above the base rate.

When a live streak has no lesson yet today, the screen SHALL say so plainly in words. That
warning SHALL be legible without motion, and SHALL NOT depend on animation to be noticed.

A streak of zero SHALL NOT be warned about: there is nothing yet to lose, and warning would
be the app inventing a loss.

The screen SHALL show one line of state at a time, so a warning is never stacked beneath
something less urgent.

#### Scenario: An unpractised day is warned about

- **WHEN** the home screen is opened on a live streak with no lesson finished today
- **THEN** it says the streak is not yet kept today, in words

#### Scenario: A new learner is not warned

- **WHEN** the home screen is opened with a streak of zero
- **THEN** no warning is shown

#### Scenario: The warning does not require motion

- **WHEN** the home screen is rendered with animation disabled
- **THEN** the warning is fully legible
