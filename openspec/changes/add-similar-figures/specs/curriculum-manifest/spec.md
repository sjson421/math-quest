## REMOVED Requirements

### Requirement: Stage G extends through its second content increment

**Reason**: Its partial-status scenario requires `similar-figures` and all Unit 21 skills to remain planned and the playable total to remain 185, which becomes false when increment 20c ships.

**Migration**: Replace it with `Stage G extends through its third content increment`, which preserves manifest authority and unchanged Stage G capabilities while advancing the implemented boundary from twelve to thirteen Unit 20 skills.

### Requirement: Second partial roadmap increment stays aligned

**Reason**: Its status count and completed curriculum range stop at increment 20b and become stale when `similar-figures` ships.

**Migration**: Replace it with `Third partial roadmap increment stays aligned`, which retains the open parent-item rule and advances the documented count, completed rows, and shipped increment list through 20c.

## ADDED Requirements

### Requirement: Stage G extends through its third content increment

The registry SHALL add `similar-figures` under its existing manifest id after `pythagorean` without changing manifest membership, prerequisites, quick markers, wall markers, or Stage G capability requirements. The manifest and curriculum document SHALL continue to agree.

All thirteen Unit 20 skills SHALL resolve as implemented because `math-notation`, `diagram`, and `chart` are already available. Every Unit 21 skill SHALL remain planned and transparent to runtime unlocking until its generator ships.

#### Scenario: Registry addition preserves manifest authority

- **WHEN** increment 20c is registered
- **THEN** `similar-figures` follows `pythagorean` and matches the existing final Unit 20 manifest entry
- **AND** no prerequisite or stage capability is copied into the generator

#### Scenario: Partial Stage G status advances explicitly

- **WHEN** skill states are resolved after increment 20c
- **THEN** exactly `perimeter` through `similar-figures` are implemented in Stage G
- **AND** the remaining 9 Stage G skills are planned
- **AND** the total implemented count is 186 of 201

### Requirement: Third partial roadmap increment stays aligned

Curriculum rows 20.1 through 20.13 SHALL be marked complete, the roadmap status count SHALL state 186 playable skills, and ordered increments 20a, 20b, and 20c SHALL be recorded as shipped. Roadmap item 26 SHALL remain unchecked until increments 21a and 21b also ship.

#### Scenario: Unit 20 completion does not close the parent item

- **WHEN** all thirteen Unit 20 skills are playable
- **THEN** their curriculum rows and all three Unit 20 increments show completion
- **AND** the Stage G Units 20–21 checkbox remains open
