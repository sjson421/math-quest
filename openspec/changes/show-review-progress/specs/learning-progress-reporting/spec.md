## Purpose

Shows learners how well each skill is being recalled and which diagnosed mistake patterns recur
most often, using progress evidence the app already stores.

## ADDED Requirements

### Requirement: Skill cards report normalized recall strength

Every playable skill at the skill level SHALL report recall strength from 0 through 5. Recall
strength SHALL be labelled separately from mastery so the learner is not told that weaker recall
has removed earned course progress.

The reported value SHALL use the same normalized read behavior as review scheduling. A legacy,
restored, or malformed optional review field SHALL therefore produce the safe value review
scheduling uses rather than disappearing or exposing invalid data.

#### Scenario: Recall and mastery are distinct

- **WHEN** a playable skill has mastery 4 and normalized recall strength 2
- **THEN** its skill card reports recall strength 2 of 5
- **AND** its mastery still reports level 4 of 5

#### Scenario: Legacy recall is reported safely

- **WHEN** a playable skill lacks stored review fields and its legacy progress normalizes to
  recall strength 3
- **THEN** its skill card reports recall strength 3 of 5
- **AND** the stored skill object is not rewritten to produce the report

#### Scenario: An untouched playable skill reports zero recall

- **WHEN** a playable skill has never completed a lesson and has no review schedule
- **THEN** its skill card reports recall strength 0 of 5

### Requirement: Settings reports recurring diagnosed mistakes

Settings SHALL show a “Things to watch” insight when the learner has recorded diagnosed
misconception tags. It SHALL list no more than the three highest-frequency tags in descending
count order, pair each with its count, and present each internal tag as readable learner-facing
text. The insight SHALL describe patterns without scolding or marking the learner incorrect.

#### Scenario: Highest-frequency patterns are shown

- **WHEN** the learner has four diagnosed misconception tags with different counts
- **THEN** Settings lists the three tags with the highest counts in descending order
- **AND** each listed pattern includes its recorded count

#### Scenario: Internal tags are made readable

- **WHEN** a listed misconception is stored under an internal hyphenated tag
- **THEN** Settings presents a readable phrase rather than the raw hyphenated identifier

#### Scenario: Empty progress has no empty insight

- **WHEN** the learner has no recorded diagnosed misconception tag
- **THEN** Settings does not show the “Things to watch” insight
