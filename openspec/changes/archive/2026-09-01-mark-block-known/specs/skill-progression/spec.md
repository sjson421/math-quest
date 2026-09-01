## MODIFIED Requirements

### Requirement: A practised skill is never re-locked

A skill the learner has already practised SHALL remain unlocked for as long as its progress
record survives and the skill remains playable, even when a later change to the curriculum
graph would place it behind prerequisites the learner has not met. A skill counts as
practised once it holds any recorded attempt or any mastery above 0.

This rule SHALL hold permanently at read time rather than as a one-time migration, because a
progress record can arrive from the backup endpoint at any point in the future and that
endpoint stores the record opaquely without ever migrating it. Applying the rule SHALL NOT
require reading, writing, or adding any stored field beyond those a progress record already
carries.

Preserving mastery alone SHALL NOT be treated as sufficient. Unlocking gates whether a lesson
can be *started*, so a learner whose skill is re-locked keeps a mastery level they can no
longer practise or raise. Equally, no re-locking rule SHALL ever reduce a mastery level: a
graph change adjusts what is open, never what has been earned.

Exactly one thing SHALL be able to reduce a mastery level: the learner taking back a block
they marked as already known, and then only for the skills that skip itself granted. That is
not a re-locking rule and not a system decision — it is the learner withdrawing a claim they
made, and it SHALL never reach a mastery level the learner earned by practice. Any other
reduction of a stored mastery level SHALL be treated as a defect.

#### Scenario: Tightened prerequisites do not strand a learner

- **WHEN** a skill's prerequisites become stricter than they were when the learner practised it
- **AND** the learner's stored record for that skill shows at least one attempt
- **THEN** the skill stays unlocked
- **AND** its mastery is unchanged

#### Scenario: Inherited tightening is covered too

- **WHEN** a skill's own edges are unchanged or fewer, but a prerequisite of its prerequisite
  has become stricter, so the skill sits behind more skills than before
- **AND** the learner had already practised it
- **THEN** the skill stays unlocked

#### Scenario: Dropped edge takes effect immediately

- **WHEN** an edge is removed from a skill's prerequisites
- **THEN** that former prerequisite's mastery no longer affects whether the skill unlocks
- **AND** no practice history is required for the edge to stop applying

#### Scenario: Never practised, never grandfathered

- **WHEN** a skill has no recorded attempts and mastery 0
- **THEN** it is unlocked only by its current prerequisites

#### Scenario: Restored backup keeps the same skills open

- **WHEN** a progress record is restored from the backup endpoint or a handed-over file
- **THEN** every playable skill practised in that record is unlocked
- **AND** the outcome is the same whether the record is restored once or many times

#### Scenario: Mastery without attempts still counts as practised

- **WHEN** a progress record holds mastery above 0 for a skill with no recorded attempts
- **THEN** that skill counts as practised and stays unlocked

#### Scenario: Only a withdrawn skip reduces mastery

- **WHEN** a learner takes back a block they had marked as already known
- **THEN** the skills that skip granted return to the mastery each held before the mark, which
  is 0 for a skill the skip found untouched
- **AND** every skill in that block whose mastery the learner earned by practice keeps it,
  including one the mark raised from a level they had part-practised
- **AND** no rule other than this one has reduced a stored mastery level
