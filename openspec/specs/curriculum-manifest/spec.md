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

### Requirement: The playable course structure is derived

The system SHALL derive the playable structure of the course from the manifest and the
registered generators: the stages, and the units within them, that hold at least one
`implemented` skill, each carrying its `implemented` skills. A stage or unit whose skills are
all `planned` SHALL be absent from that structure rather than present and empty.

The structure SHALL be derived rather than stored, for the same reason per-skill state is:
registering a generator SHALL place its skill under the unit and stage the manifest declares
for it, with no second list to keep in step. There SHALL be no other authority for which
unit or stage a playable skill belongs to.

Every level of the derived structure SHALL be in curriculum order — stages in manifest
order, units in manifest order within their stage, and skills in manifest order within their
unit — regardless of the order their generators were written or registered in.

#### Scenario: Membership follows the manifest, not the generator files

- **WHEN** a generator is registered in a source file that does not correspond to its unit
- **THEN** the derived structure places its skill under the unit the manifest declares

#### Scenario: A unit with no generator is absent

- **WHEN** every skill of a unit is `planned`
- **THEN** that unit does not appear in the derived structure

#### Scenario: A stage with no generator is absent

- **WHEN** every skill of a stage is `planned`
- **THEN** that stage does not appear in the derived structure

#### Scenario: A partly built unit carries only its playable skills

- **WHEN** a unit holds both `implemented` and `planned` skills
- **THEN** it appears in the derived structure
- **AND** it carries its `implemented` skills only

#### Scenario: A new generator needs no second edit

- **WHEN** a generator is registered for a skill in a unit that had none
- **THEN** that unit appears in the derived structure in its manifest position
- **AND** no separate list of units is edited to make it appear

#### Scenario: Every level is in curriculum order

- **WHEN** the derived structure is read
- **THEN** its stages, each stage's units, and each unit's skills are in the order the
  manifest declares them

### Requirement: Stage capability requirements remain complete

Each stage SHALL record the capabilities its skills require — choice input, structured math
notation, fraction keypad input, diagram rendering, expression input, number-line input,
coordinate-plane input, root-pair input, chart rendering, and timed mode. Recording a
requirement SHALL NOT imply it is built.

A stage's record SHALL name every capability its own skills need, not only the one it
introduces, so the set can be read off the stage rather than assembled from earlier ones.

#### Scenario: Capability requirement is queryable

- **WHEN** a stage is inspected
- **THEN** it lists the capabilities its skills depend on
- **AND** each capability is marked available or unavailable

#### Scenario: Skill needing an unavailable capability stays planned

- **WHEN** a skill requires a capability that is not yet built
- **THEN** it resolves as `planned` regardless of whether a generator exists

#### Scenario: Consumer stages record the built choice capability

- **WHEN** Stages A, C, and D are inspected
- **THEN** each lists choice input as a required capability
- **AND** choice input is marked available

#### Scenario: Consumer stages record the built number-line capability

- **WHEN** Stages C and D are inspected
- **THEN** each lists number-line input as a required capability
- **AND** number-line input is marked available

#### Scenario: Marking a capability built unlocks nothing on its own

- **WHEN** a capability becomes available and every skill needing it has no generator
- **THEN** no skill changes from `planned` to `implemented`
- **AND** the set of skills offered to the learner is unchanged

#### Scenario: Consumer stages record the built math notation capability

- **WHEN** Stages D, E, F, and G are inspected
- **THEN** each lists `math-notation` as a required capability
- **AND** `math-notation` is marked available
- **AND** none lists the rejected `katex` capability name

#### Scenario: Stage D records built fraction input without unlocking

- **WHEN** Stage D is inspected after math notation, fraction input, and diagram rendering
  become available
- **THEN** it lists `fraction-input` and `diagram` as required available capabilities
- **AND** its skills without generators remain planned
- **AND** the set of skills offered to the learner is unchanged

#### Scenario: Diagram availability is recorded without content

- **WHEN** the diagram renderer and capability flag are present before any Stage D generator
- **THEN** Stage D has no unavailable capability requirement
- **AND** no Stage D skill becomes playable until its generator is registered

#### Scenario: Stage E records built expression input without unlocking

- **WHEN** Stage E is inspected after `expression-input` becomes available
- **THEN** it lists `expression-input` as a required available capability
- **AND** its skills without generators remain planned
- **AND** the set of skills offered to the learner is unchanged

#### Scenario: Stage E records built fraction input when Unit 12 consumes it

- **WHEN** `zero-neg-exponents` requires an exact reciprocal through fraction entry
- **THEN** Stage E lists `fraction-input` as a required available capability
- **AND** no new capability implementation or availability flag is needed

#### Scenario: Stage F records complete coordinate-plane infrastructure without content

- **WHEN** coordinate-plane display and confirmed point placement are both built
- **THEN** Stage F lists `coordinate-plane` as an available required capability
- **AND** all Stage F skills without generators remain planned
- **AND** coordinate-plane availability alone changes no playable skill

#### Scenario: Stage F records root-pair input before its content

- **WHEN** exact two-root entry is built before Unit 18b generators
- **THEN** Stage F lists `root-pair-input` as an available required capability
- **AND** `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula` remain planned
- **AND** the playable skill total remains 165
