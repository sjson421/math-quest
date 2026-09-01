# skip-ahead Specification

## Purpose

Lets a learner declare a stage or unit already known so the course opens past it, and take
that declaration back at any time without losing anything they actually practised. Every
mastery level therefore records how it was reached, which is what makes a skip reversible and
what later lets the app watch a skipped skill more closely than a practised one.

## Requirements

### Requirement: Every mastery level records how it was reached

Each skill's progress SHALL carry the source of its mastery: practised, tested out of, or
self-assessed. Practised SHALL mean the learner reached that mastery by completing lessons,
and SHALL be the meaning of a record that carries no source at all.

A skill whose mastery a block mark raised SHALL also carry the mastery it held immediately
before that mark. The source says a level was granted rather than earned; it does not say what
the learner had already reached, and nothing else in the record recovers that — attempts and
correct counts do not map to a mastery level. Both values SHALL be recorded together, on
exactly the skills a mark raises, and cleared together.

The default SHALL be applied when the record is read, not by rewriting stored skills. A
progress record that predates either field SHALL remain valid, SHALL keep every field it
carries that the app does not recognise, and SHALL NOT be migrated on load, on restore from
the backup endpoint, or on adopting a server copy. A stored source that is not one of the
three values SHALL read as practised rather than failing the load or discarding the record.

A stored prior mastery SHALL be read as a value that cannot raise the skill: absent, malformed,
negative or fractional SHALL read as zero, and a value above the mastery the skill now holds
SHALL read as that current mastery. Taking a block back therefore SHALL NOT raise a mastery
level, whatever a corrupt or hand-edited record carries.

Recording the source or the prior mastery SHALL NOT change how a skill unlocks, how difficulty
is chosen, how long a lesson runs, or what a lesson rewards.

#### Scenario: A record without a source reads as practised

- **WHEN** a stored progress record holds a skill with mastery and no recorded source
- **THEN** that skill's source reads as practised
- **AND** the stored skill object is not rewritten

#### Scenario: A record without a prior mastery reads as zero

- **WHEN** a stored progress record holds a skill with no recorded prior mastery
- **THEN** that skill's prior mastery reads as zero
- **AND** the stored skill object is not rewritten

#### Scenario: An unrecognised source is not fatal

- **WHEN** a restored record holds a source value the app does not recognise
- **THEN** that skill's source reads as practised
- **AND** the record loads normally and keeps its other fields

#### Scenario: A prior mastery cannot raise the level it restores

- **WHEN** a restored record holds a prior mastery that is malformed, negative, or greater than
  the mastery that skill now holds
- **THEN** it reads as a value no higher than the current mastery
- **AND** the record loads normally and keeps its other fields

#### Scenario: Restoring is repeatable

- **WHEN** the same legacy record is restored more than once
- **THEN** the resulting sources and prior masteries are identical every time

### Requirement: Marking a block known raises it to mastery 3

The learner SHALL be able to mark one block — a stage or a unit of the curriculum — as already
known, declaring either that they tested out of it or that they assessed it themselves.

Marking a block known SHALL raise every playable skill in that block to mastery 3: clear of
the unlock threshold so everything downstream opens, and short of the maximum so a skipped
skill reads as not needed yet rather than finished. Skills in the block that cannot be played
SHALL NOT be raised and SHALL NOT gain a recorded source, since they are locked whatever their
mastery holds and are already transparent to unlocking.

A skill already at mastery 3 or above SHALL keep the mastery it has: marking a block known
SHALL never lower a mastery level. The declared source SHALL be recorded only on the skills
the mark actually raised, so a skill the learner had already practised to that level keeps its
practised source.

Each raised skill SHALL record the mastery it held immediately before the mark, alongside the
declared source. A skill the learner had practised part-way — to mastery 1 or 2, below the
unlock threshold's reach — is still raised, because leaving it where it stands would keep the
course shut and defeat the skip. Recording the level it came from is what lets a reversal
return the learner exactly where they stood.

The change SHALL be one local progress mutation that strictly advances the stored version,
preserves unknown fields, and is carried by the existing background sync without any change to
the endpoint or its stored document. Marking a block known SHALL NOT change attempts, correct
counts, recorded misconceptions, intro state, XP, coins, or the streak, SHALL NOT write any
review field, and SHALL NOT announce a stage checkpoint, a pin upgrade, or a streak milestone —
a skip is a declaration, not an achievement.

Writing no review field is not the same as leaving review untouched: a record saved before those
fields existed derives its strength from its mastery, so raising that mastery moves the derived
strength and next review date by the rule already in place. What a skip *should* do to review
scheduling SHALL be decided where the safety net is built rather than settled here by accident.

A request SHALL be refused — nothing written, the stored version unchanged — when it names a
block the curriculum does not declare, a block holding no playable skill, or a block in which
every playable skill already stands at mastery 3 or above, since such a mark raises nothing and
records nothing.

#### Scenario: A whole unit opens what follows it

- **WHEN** a learner marks a unit as already known
- **THEN** every playable skill in that unit is at mastery 3
- **AND** each of those skills records the declared source
- **AND** skills whose prerequisites are now all at or above the unlock threshold are unlocked

#### Scenario: A stage is one block too

- **WHEN** a learner marks a stage as already known
- **THEN** every playable skill in every unit of that stage is at mastery 3

#### Scenario: A part-practised skill records where it came from

- **WHEN** a learner marks a unit known that holds a skill they had already practised to
  mastery 1
- **THEN** that skill is at mastery 3
- **AND** it records the declared source
- **AND** it records 1 as the mastery it held before the mark

#### Scenario: Earned mastery is never lowered

- **WHEN** a learner marks a block known that contains a skill they had practised to mastery 5
- **THEN** that skill stays at mastery 5
- **AND** its source stays practised
- **AND** no prior mastery is recorded for it

#### Scenario: A skip is not an achievement

- **WHEN** marking a block known takes the learner past a stage boundary or a pin threshold
- **THEN** no checkpoint, pin upgrade, or streak milestone is announced
- **AND** no XP, coins, or streak day is awarded

#### Scenario: Unplayable skills are left alone

- **WHEN** a block contains skills with no generator, or whose stage requires infrastructure
  that is not built
- **THEN** the mark raises no mastery and records no source for them
- **AND** they remain locked

#### Scenario: An unknown block writes nothing

- **WHEN** a block is named that the curriculum manifest does not declare
- **THEN** no progress is written
- **AND** the stored version is unchanged, so nothing is pushed

#### Scenario: A block that is already known writes nothing

- **WHEN** a block is marked known in which every playable skill already stands at mastery 3 or
  above
- **THEN** no progress is written
- **AND** the stored version is unchanged, so nothing is pushed

### Requirement: Taking a block back restores only what the skip granted

The learner SHALL be able to take back a block they marked as known, at any time. This SHALL be
the only action that lowers a mastery level, and it SHALL lower one only as far as the level
that skip found.

Taking a block back SHALL restore exactly those skills in the block whose recorded source is
tested out of or self-assessed to the mastery each of them held immediately before the mark, and
SHALL clear their source back to practised and their recorded prior mastery with it. For a skill
the skip found untouched that restores mastery 0; for one the learner had practised part-way it
restores the level they had earned. A reversal therefore returns the learner to where they
stood and cannot cost them work they did. A skill in the block whose source is practised SHALL
be left entirely unchanged, whatever its mastery.

Taking a block back SHALL NOT change attempts, correct counts, recorded misconceptions, intro
state, XP, coins, or the streak, and SHALL NOT write any review field — a legacy record's
derived strength follows its mastery back down for the same reason it followed it up. It SHALL
be one local progress mutation under the same version and sync rules as marking a block known,
and SHALL be refused without writing anything when the block holds no skill the skip granted.

#### Scenario: A skipped block returns to zero

- **WHEN** a learner takes back a unit they had marked as known and never practised
- **THEN** every skill in that unit is at mastery 0
- **AND** each of those skills reads as practised again
- **AND** none of them carries a recorded prior mastery any more
- **AND** the skills are gated by their prerequisites once more

#### Scenario: Practice inside a skipped block survives

- **WHEN** a learner marks a unit known, completes lessons for one of its skills, and then
  takes the unit back
- **THEN** that skill keeps the mastery its lessons earned
- **AND** the rest of the unit returns to mastery 0

#### Scenario: Mastery earned before the skip survives

- **WHEN** a learner practises a skill to mastery 1, later marks its unit known so the mark
  raises it to 3, and then takes the unit back
- **THEN** that skill is back at mastery 1, the level it held before the mark
- **AND** it reads as practised again
- **AND** its attempts and correct counts are unchanged

#### Scenario: A skill the mark never raised is not reached

- **WHEN** a learner takes back a block holding a skill they had practised to mastery 5 before
  marking it
- **THEN** that skill is untouched, at mastery 5

#### Scenario: Nothing to take back writes nothing

- **WHEN** a block is taken back that holds no tested-out or self-assessed skill
- **THEN** no progress is written
- **AND** the stored version is unchanged

### Requirement: Practising a skipped skill makes it practised

Completing a lesson for a skill whose source is tested out of or self-assessed SHALL set that
skill's source to practised and clear the prior mastery recorded with it, in the same mutation
that raises its mastery. A skipped skill the learner has since played is no longer an untested
claim and has no granted level left to restore, so taking its block back afterwards SHALL leave
it alone.

Completing a lesson SHALL otherwise behave exactly as it does today, including its mastery
increase, rewards, review scheduling, checkpoint, pin, and streak-milestone behavior.

#### Scenario: One lesson converts the claim

- **WHEN** a learner completes a lesson for a self-assessed skill
- **THEN** that skill's source becomes practised
- **AND** it carries no recorded prior mastery
- **AND** its mastery rises by one under the existing rule

#### Scenario: Conversion outlives the block

- **WHEN** a learner completes a lesson for a tested-out skill and later takes its block back
- **THEN** that skill is not reset

### Requirement: A block's skip state is derived, never stored

The progress record SHALL NOT carry block-level, unit-level, or stage-level skip state.
Whether a block counts as marked known SHALL be derived from the recorded sources of its
skills.

The curriculum manifest is the only authority for which skills a block contains, so a block
that gains or loses a skill SHALL need no migration and SHALL NOT be able to disagree with
what the record holds. A stored block flag would be a second authority that the manifest, the
progress record, and the backup endpoint would each have to keep in step.

#### Scenario: A block gains a skill after a skip

- **WHEN** a unit marked known gains a newly playable skill
- **THEN** no stored block state is stale or has to be migrated
- **AND** the new skill is at mastery 0, reads as practised, and is gated by its prerequisites

#### Scenario: The record carries no block flag

- **WHEN** a progress record is written after a block is marked known
- **THEN** it differs from the record it replaced only in per-skill mastery, source, and prior
  mastery, and in the stored version
- **AND** it carries no block, unit, or stage key
