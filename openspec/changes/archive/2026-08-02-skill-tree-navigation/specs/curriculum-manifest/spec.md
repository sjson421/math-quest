## ADDED Requirements

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
