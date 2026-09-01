## MODIFIED Requirements

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
