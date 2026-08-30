## ADDED Requirements

### Requirement: Stage G opens through its first content increment

The registry SHALL add the six selected Unit 20 generators under their existing manifest ids
without changing manifest membership, prerequisites, quick markers, wall markers, or Stage G
capability requirements. The manifest and curriculum document SHALL continue to agree.

The first six skills SHALL resolve as implemented because `math-notation`, `diagram`, and
`chart` are already available. Every later Stage G skill SHALL remain planned and transparent
to runtime unlocking until its own generator ships.

#### Scenario: Registry addition preserves manifest authority

- **WHEN** increment 20a is registered
- **THEN** its six ids match the existing Unit 20 manifest entries in order
- **AND** no prerequisite or stage capability is copied into a generator

#### Scenario: Partial Stage G status is explicit

- **WHEN** skill states are resolved after increment 20a
- **THEN** exactly `perimeter` through `area-circle` are implemented in Stage G
- **AND** the remaining 16 Stage G skills are planned
- **AND** the total implemented count is 179 of 201

### Requirement: Partial roadmap completion stays aligned

Curriculum rows 20.1 through 20.6 SHALL be marked complete, the roadmap status count SHALL
state 179 playable skills, and ordered increment 20a SHALL be recorded as shipped. Roadmap
item 26 SHALL remain unchecked until increments 20b, 20c, 21a, and 21b also ship.

#### Scenario: One increment does not close the parent item

- **WHEN** all six 20a skills are playable
- **THEN** their curriculum rows and roadmap increment show completion
- **AND** the Stage G Units 20–21 checkbox remains open
