# Curriculum Manifest

## Purpose

The single machine-readable description of the course: every skill id, its unit
and stage membership, its prerequisites, and its pacing markers. `docs/curriculum.md` is the
human-readable companion and the two cross-check each other, so neither can drift.

The manifest is written in full while generators arrive one unit at a time, which is why a
skill with no generator is a normal state rather than a gap.

## Requirements

### Requirement: Canonical curriculum manifest

The system SHALL maintain a single machine-readable manifest describing the entire course:
8 stages, 23 units, and 201 skills. The manifest SHALL be the authority for skill ids,
unit membership, stage membership, and prerequisite relationships. `docs/curriculum.md`
SHALL remain the human-readable companion, and the two MUST agree.

#### Scenario: Manifest matches the curriculum document

- **WHEN** the manifest is loaded
- **THEN** it contains exactly 8 stages, 23 units, and 201 skills
- **AND** each stage's skill count matches the stage map in `docs/curriculum.md`

#### Scenario: Skill ids are taken verbatim

- **WHEN** a skill is added to the manifest
- **THEN** its id matches the id recorded in `docs/curriculum.md` character for character

### Requirement: Skill ids are unique

Every skill id in the manifest SHALL be unique across the entire course. A duplicate id is
a build failure, not a warning, because two generators claiming one id would silently
overwrite each other's progress records.

#### Scenario: Duplicate id is rejected

- **WHEN** two manifest entries declare the same id
- **THEN** manifest validation fails and names both offending entries

### Requirement: Prerequisite graph is valid

Each skill SHALL declare zero or more prerequisite skill ids. The resulting graph MUST be
acyclic, every prerequisite MUST resolve to a manifest entry, and every skill MUST be
reachable by following prerequisites forward from at least one root skill.

#### Scenario: Cycle is detected

- **WHEN** prerequisites form a cycle of any length
- **THEN** validation fails and reports the full cycle path

#### Scenario: Dangling prerequisite is detected

- **WHEN** a skill names a prerequisite id that is not in the manifest
- **THEN** validation fails and names the skill and the missing id

#### Scenario: Unreachable skill is detected

- **WHEN** a skill cannot be reached from any root skill by following prerequisites
- **THEN** validation fails and names the orphaned skill

#### Scenario: At least one root exists

- **WHEN** the manifest is validated
- **THEN** at least one skill has no prerequisites

### Requirement: Skills are planned or implemented

A manifest entry SHALL exist before its generator does. Each skill SHALL resolve to one of
two states: `implemented` when a generator is registered for its id, or `planned` when it
is not. A `planned` skill is a normal, expected state — not an error — because the
manifest is populated in full while generators arrive one unit at a time.

#### Scenario: Skill with no generator is planned

- **WHEN** a manifest entry has no registered generator
- **THEN** it resolves as `planned`
- **AND** validation passes

#### Scenario: Generator with no manifest entry is rejected

- **WHEN** a generator is registered under an id absent from the manifest
- **THEN** validation fails and names the unregistered id

#### Scenario: Planned skills are excluded from play

- **WHEN** the app presents skills to the learner
- **THEN** only `implemented` skills are offered
- **AND** `planned` skills do not block their dependants from being reachable in the graph

### Requirement: Stage capability requirements are recorded

Each stage SHALL record the capabilities its skills require — KaTeX rendering, fraction
keypad input, diagram rendering, expression input, number-line input, coordinate-plane
input, chart rendering, and timed mode. Recording a requirement SHALL NOT imply it is
built.

#### Scenario: Capability requirement is queryable

- **WHEN** a stage is inspected
- **THEN** it lists the capabilities its skills depend on
- **AND** each capability is marked available or unavailable

#### Scenario: Skill needing an unavailable capability stays planned

- **WHEN** a skill requires a capability that is not yet built
- **THEN** the skill resolves as `planned` regardless of whether a generator exists

### Requirement: Skills carry pacing metadata

Each skill SHALL record whether it is a `quick` skill and whether it is a known
difficulty wall. These markers come from `docs/curriculum.md` and drive lesson length and
misconception-authoring effort respectively.

#### Scenario: Quick skill is marked

- **WHEN** a skill is marked `quick` in the curriculum document
- **THEN** the manifest entry carries a `quick` flag

#### Scenario: Wall skill is marked

- **WHEN** a skill is flagged as a difficulty wall in the curriculum document
- **THEN** the manifest entry records it, so authoring coverage can be checked
