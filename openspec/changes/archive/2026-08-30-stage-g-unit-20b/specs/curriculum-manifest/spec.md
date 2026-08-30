## ADDED Requirements

### Requirement: Stage G extends through its second content increment

The registry SHALL add the six selected Unit 20b generators under their existing manifest ids
after the six Unit 20a generators without changing manifest membership, prerequisites, quick
markers, wall markers, or Stage G capability requirements. The manifest and curriculum
document SHALL continue to agree.

The first twelve Unit 20 skills SHALL resolve as implemented because `math-notation`,
`diagram`, and `chart` are already available. `similar-figures` and every Unit 21 skill SHALL
remain planned and transparent to runtime unlocking until their generators ship.

#### Scenario: Registry addition preserves manifest authority

- **WHEN** increment 20b is registered
- **THEN** its six ids follow increment 20a and match the existing Unit 20 manifest entries in
  order
- **AND** no prerequisite or stage capability is copied into a generator

#### Scenario: Partial Stage G status advances explicitly

- **WHEN** skill states are resolved after increment 20b
- **THEN** exactly `perimeter` through `pythagorean` are implemented in Stage G
- **AND** the remaining 10 Stage G skills are planned
- **AND** the total implemented count is 185 of 201

### Requirement: Second partial roadmap increment stays aligned

Curriculum rows 20.1 through 20.12 SHALL be marked complete, the roadmap status count SHALL
state 185 playable skills, and ordered increments 20a and 20b SHALL be recorded as shipped.
Roadmap item 26 SHALL remain unchecked until increments 20c, 21a, and 21b also ship.

#### Scenario: Two increments do not close the parent item

- **WHEN** all twelve skills through `pythagorean` are playable
- **THEN** their curriculum rows and both shipped increments show completion
- **AND** the Stage G Units 20–21 checkbox remains open

## REMOVED Requirements

### Requirement: Stage G opens through its first content increment

**Reason**: Its partial-status scenario requires the sixteen skills after `area-circle` to
remain planned, which becomes false when increment 20b ships.

**Migration**: Replace it with `Stage G extends through its second content increment`, which
preserves manifest authority and unchanged Stage G capabilities while advancing the same
implemented/planned boundary from six to twelve skills.

### Requirement: Partial roadmap completion stays aligned

**Reason**: Its status count and curriculum range stop at increment 20a and become stale when
the next six Unit 20 skills ship.

**Migration**: Replace it with `Second partial roadmap increment stays aligned`, which retains
the open parent-item rule and advances the documented count, completed rows, and shipped
increment list through 20b.
