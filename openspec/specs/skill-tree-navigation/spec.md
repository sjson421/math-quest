# Skill Tree Navigation

## Purpose

How a learner browses a 23-unit, 201-skill course to reach a lesson: the stage → unit →
skill hierarchy, where the app opens inside it, how much of a unit or stage is reported as
mastered, and what stays out of sight because it is not built yet.

## Requirements

### Requirement: The course is browsed as stage, then unit, then skill

The learner SHALL reach a lesson through three levels: a stage level listing the course's
playable stages, a unit level listing one stage's playable units, and a skill level listing
one unit's playable skills. Each level SHALL present only the entries of the level directly
beneath it — the stage level SHALL NOT list skills, and the unit level SHALL NOT list them
either.

Choosing an unlocked skill at the skill level SHALL start that skill's lesson exactly as it does
today. Lesson entry, unlocking, and mastery behavior SHALL remain unchanged. Additional
learning-progress reporting on a skill card SHALL be labelled separately from mastery and SHALL
NOT change whether the skill can be started.

#### Scenario: Choosing a stage opens its units

- **WHEN** the learner selects a stage at the stage level
- **THEN** the unit level opens listing that stage's playable units
- **AND** no skill of any unit is listed at that level

#### Scenario: Choosing a unit opens its skills

- **WHEN** the learner selects a unit at the unit level
- **THEN** the skill level opens listing that unit's playable skills
- **AND** only that unit's skills are listed

#### Scenario: Choosing a skill still starts its lesson

- **WHEN** the learner selects an unlocked skill at the skill level
- **THEN** that skill's lesson starts
- **AND** the lesson behaves exactly as it did before the hierarchy existed

#### Scenario: A locked skill cannot be started

- **WHEN** the learner selects a locked skill at the skill level
- **THEN** no lesson starts

#### Scenario: Recall reporting does not change lesson entry

- **WHEN** a playable skill card reports recall strength separately from mastery
- **THEN** an unlocked skill still starts its lesson
- **AND** a locked skill still cannot be started

### Requirement: The tree opens at the learner's current unit

The app SHALL open at the skill level of the learner's current unit rather than at the stage
level. The daily path is a single skill, and opening at the root of the hierarchy would put
two extra taps in front of every lesson — the hierarchy exists to make 201 skills navigable,
not to make the next one harder to reach.

The current unit SHALL be the unit holding the first playable skill, in curriculum order,
that is unlocked and has not yet reached the mastery level at which it opens the skills
behind it. That is the learner's frontier: the first skill they have not yet taken far
enough to move the course forward.

The threshold SHALL be the unlock threshold rather than maximum mastery. A learner who keeps
moving leaves skills behind them at the level that opened the next one and above, so a rule
reading "not yet at maximum mastery" would name the earliest skill still short of 5 and open
the app at the start of the course indefinitely.

When no playable skill meets that description, the current unit SHALL be the last playable
unit, so a learner who has taken everything built so far to the threshold lands at the end of
the course rather than the beginning.

#### Scenario: A new learner opens at the first unit

- **WHEN** a learner with no stored progress opens the app
- **THEN** the skill level of the first playable unit is shown

#### Scenario: A returning learner opens at the unit they are working through

- **WHEN** a learner has taken every skill of the first playable unit to the unlock threshold
  and holds no mastery beyond it
- **THEN** the skill level of the next playable unit is shown

#### Scenario: A skill left at the unlock threshold is not the frontier

- **WHEN** a learner holds the unlock threshold, but not maximum mastery, on every skill of an
  earlier unit and has begun a later one
- **THEN** the app opens at the later unit
- **AND** it does not return to the earlier unit merely because its skills are short of
  maximum mastery

#### Scenario: A barely started skill is still the frontier

- **WHEN** the learner's furthest skill holds some mastery but has not reached the unlock
  threshold
- **THEN** the app opens at that skill's unit

#### Scenario: The frontier's unit may be locked around it

- **WHEN** the learner's frontier skill sits in a unit whose other skills are all locked
- **THEN** that unit is the one the app opens at

#### Scenario: Everything built so far is past the threshold

- **WHEN** every playable skill has reached at least the unlock threshold
- **THEN** the skill level of the last playable unit is shown

### Requirement: Only built course is shown

A stage or unit holding no playable skill SHALL NOT appear at any level, and a skill that is
not playable SHALL NOT appear either. Unbuilt course SHALL NOT be listed, greyed, counted,
or otherwise teased: a learner SHALL have no way to tell from the navigation surface how
much of the course is unwritten.

A *locked* entry is different from an unbuilt one and SHALL remain visible. A playable skill
the learner has not unlocked SHALL be shown in its locked state, and a unit whose playable
skills are all locked SHALL be shown in a locked state too, because both are course the
learner is working toward rather than course that does not exist.

#### Scenario: A unit with no generator is absent

- **WHEN** every skill of a unit is planned
- **THEN** that unit appears at no level of the hierarchy
- **AND** no count or progress figure anywhere includes it

#### Scenario: A stage with no generator is absent

- **WHEN** every skill of a stage is planned
- **THEN** that stage is not listed at the stage level

#### Scenario: A partly built unit shows only what is playable

- **WHEN** a unit holds both playable and planned skills
- **THEN** the unit is listed
- **AND** its skill level lists only its playable skills

#### Scenario: A locked skill stays visible

- **WHEN** a playable skill's prerequisites are unmet
- **THEN** it is listed at its unit's skill level in a locked state

#### Scenario: A fully locked unit stays visible

- **WHEN** every playable skill of a listed unit is locked
- **THEN** the unit is still listed at its stage's unit level
- **AND** it is shown in a locked state

### Requirement: Units and stages report mastery over what is playable

A unit SHALL report the share of its available mastery the learner has earned: the total
mastery held across its playable skills, over the maximum mastery those same skills could
hold. A stage SHALL report the same figure across every playable skill of its units.

Both figures SHALL count playable skills only. A unit half of whose skills have no generator
SHALL report against the half that can be played, so the learner is never shown a fraction
they cannot finish. Counting unbuilt skills would cap a partly built unit below full for
reasons that have nothing to do with the learner, and would leak how much of the course is
unwritten.

A consequence SHALL be accepted rather than designed around: a unit reporting full progress
falls back below it when a new generator lands, because there is genuinely more of that unit
to learn than there was. Progress SHALL describe what is playable now, not a fixed
denominator.

Progress SHALL be read from stored mastery and SHALL NOT require any new stored field.

#### Scenario: An untouched unit reports no progress

- **WHEN** no skill of a unit holds any mastery
- **THEN** the unit reports zero progress

#### Scenario: A partly learned unit reports partial progress

- **WHEN** the skills of a unit hold half of the mastery they could hold between them
- **THEN** the unit reports half its progress

#### Scenario: A finished unit reports full progress

- **WHEN** every playable skill of a unit is at maximum mastery
- **THEN** the unit reports full progress
- **AND** it does so even while the unit still holds planned skills

#### Scenario: A stage aggregates its units

- **WHEN** a stage's playable units hold mastery between them
- **THEN** the stage reports the share of mastery earned across all of their playable skills

#### Scenario: A new generator enlarges the unit it lands in

- **WHEN** a generator is registered for a skill in a unit whose playable skills were all at
  maximum mastery
- **THEN** the unit reports less than full progress
- **AND** the newly playable skill is counted in the figure

### Requirement: Every level can be left the way it was entered

From the skill level, moving back SHALL return to the unit level of that unit's stage. From
the unit level, moving back SHALL return to the stage level. Leaving a lesson SHALL return
to the skill level of the unit the lesson was started from, whatever the learner's current
unit has since become — finishing a lesson SHALL NOT move the learner somewhere they did not
navigate to.

Settings SHALL remain reachable from every level of the hierarchy, and closing settings SHALL
return to the level it was opened from.

#### Scenario: Moving back from a skill level

- **WHEN** the learner moves back from a unit's skill level
- **THEN** the unit level of that unit's stage is shown

#### Scenario: Moving back from a unit level

- **WHEN** the learner moves back from a stage's unit level
- **THEN** the stage level is shown

#### Scenario: Finishing a lesson returns to its own unit

- **WHEN** a learner completes a lesson that raises mastery enough to change their current
  unit
- **THEN** the skill level of the unit the lesson was started from is shown

#### Scenario: Settings returns to the level it was opened from

- **WHEN** the learner opens settings from the unit level and closes it
- **THEN** the unit level is shown again, on the same stage

