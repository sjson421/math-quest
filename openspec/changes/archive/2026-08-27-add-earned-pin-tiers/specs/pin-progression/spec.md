## Purpose

The one thing a learner wears that says how far through the course they have come. The
character's charm gains five tiers, earned by taking skills past the bar that opens what
follows, and each is announced once when it arrives. Nothing here is bought, chosen, or
stored.

## ADDED Requirements

### Requirement: The pin has exactly five tiers

Every character SHALL declare exactly five pin tiers. Tier 1 SHALL be that character's own
charm drawn as it is with nothing added, so a fresh record looks unchanged. Each later tier
SHALL keep that same charm identifiable and add to what surrounds it, so a tier is never a
different object from the one before it.

A tier SHALL be legible without motion, and SHALL remain distinguishable from its neighbours
at the smallest size the mascot is drawn at.

#### Scenario: A fresh record wears the plain charm

- **WHEN** a learner has taken no skill past the unlock threshold
- **THEN** the character's own charm is drawn with nothing added to it

#### Scenario: Each character keeps its own charm at every tier

- **WHEN** any tier is drawn for a character
- **THEN** that character's own charm is present in it
- **AND** no character is shown another character's charm

#### Scenario: A tier reads without motion

- **WHEN** a tier is drawn with animation disabled
- **THEN** everything distinguishing it from the tier below remains visible

### Requirement: The tier is earned by skills taken past the unlock threshold

The pin tier SHALL be determined by the number of skills whose mastery is at or above the
threshold that unlocks what follows them. Five ascending thresholds SHALL map that count onto
the five tiers.

The count SHALL be absolute rather than a proportion of what is playable, so that adding
skills to the course SHALL NOT lower any learner's tier.

Nothing else SHALL affect the tier — not coins, not experience, not streaks, not which
character is being played as, and not anything the learner owns or wears.

#### Scenario: Reaching a threshold raises the tier

- **WHEN** a learner's count of skills at or above the unlock threshold reaches a tier's
  threshold
- **THEN** the pin is drawn at that tier from then on

#### Scenario: New course content does not demote

- **WHEN** skills are added to the course and the learner practises none of them
- **THEN** the learner's pin tier is unchanged

#### Scenario: Switching character keeps the tier

- **WHEN** a learner changes which character they play as
- **THEN** the new character's charm is drawn at the same tier the previous one was

#### Scenario: Buying nothing is required

- **WHEN** a learner has never spent a coin
- **THEN** their pin tier is whatever their mastery has earned

### Requirement: The tier is derived, never stored

The pin tier SHALL be computed from mastery already in the progress record. No field
recording the tier, the tiers reached, or the upgrades already shown SHALL be added to that
record.

Restoring a progress record on another device SHALL therefore show the tier that record's
mastery earns, with no separate state to carry, reconcile, or fall out of step.

#### Scenario: Restoring a record shows the earned tier

- **WHEN** a progress record is restored on a new device
- **THEN** the pin is drawn at the tier that record's mastery earns

#### Scenario: No upgrade is announced for progress made elsewhere

- **WHEN** a restored record is already past a tier threshold
- **THEN** no upgrade is announced for a threshold crossed before the restore

### Requirement: Crossing a threshold is announced exactly once

A lesson that takes the learner across a tier threshold SHALL show one upgrade screen naming
the new tier and drawing the character wearing it. The announcement SHALL follow from the
transition that lesson caused, so repeating the lesson, or any later lesson at the same tier,
SHALL show nothing.

The upgrade SHALL cost the learner nothing and SHALL require no choice: it presents one
action that continues.

#### Scenario: The upgrade is announced when it is earned

- **WHEN** a lesson takes the learner's count across a tier threshold
- **THEN** an upgrade screen shows the character wearing the new tier

#### Scenario: The same lesson again announces nothing

- **WHEN** the learner completes another lesson without crossing a further threshold
- **THEN** no upgrade screen is shown

#### Scenario: The upgrade asks nothing of the learner

- **WHEN** an upgrade screen is shown
- **THEN** it presents one action that continues
- **AND** no coins are spent and nothing is chosen
