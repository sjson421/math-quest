## REMOVED Requirements

### Requirement: Stage G extends through its third content increment

**Reason**: Its status requires every Unit 21 skill to remain planned and the playable total
to remain 186, which becomes false when increment 21a ships.

**Migration**: Replace it with `Stage G extends through its fourth content increment`, which
preserves manifest authority while adding the already-built choice-input requirement and
advancing the implemented boundary through the first six Unit 21 skills.

### Requirement: Third partial roadmap increment stays aligned

**Reason**: Its completed curriculum range and status count stop at Unit 20 and become stale
when increment 21a ships.

**Migration**: Replace it with `Fourth partial roadmap increment stays aligned`, which retains
the open parent-item rule and advances the completed rows, count, and shipped increment list
through 21a.

## ADDED Requirements

### Requirement: Stage G extends through its fourth content increment

The registry SHALL add `mean`, `median`, `mode-range`, `weighted-mean`, `read-bar-line`, and
`read-scatterplot` under their existing manifest ids after `similar-figures` without changing
manifest membership, prerequisites, quick markers, or wall markers. Because
`read-scatterplot` uses choice input, Stage G SHALL add the already-available `choice-input` to
its existing `math-notation`, `diagram`, and `chart` requirements without changing
`AVAILABLE_CAPABILITIES`. The manifest and curriculum document SHALL continue to agree.

All thirteen Unit 20 skills and the first six Unit 21 skills SHALL resolve as implemented
because `choice-input`, `math-notation`, `diagram`, and `chart` are already available. The final
three Unit 21 skills SHALL remain planned and transparent to runtime unlocking until increment
21b ships.

#### Scenario: Registry addition preserves manifest authority

- **WHEN** increment 21a is registered
- **THEN** `mean` through `read-scatterplot` follow `similar-figures` in manifest order
- **AND** Stage G records `choice-input`, `math-notation`, `diagram`, and `chart` as its complete
  available capability requirements
- **AND** no prerequisite, pacing marker, unit membership, or stage capability is copied into
  a generator

#### Scenario: Partial Stage G status advances explicitly

- **WHEN** skill states are resolved after increment 21a
- **THEN** exactly `perimeter` through `read-scatterplot` are implemented in Stage G
- **AND** `basic-probability` through `counting-outcomes` remain planned
- **AND** the total implemented count is 192 of 201

### Requirement: Fourth partial roadmap increment stays aligned

Curriculum rows 20.1 through 21.6 SHALL be marked complete, and curriculum status prose SHALL
identify the first six Unit 21 skills as playable and the final three as planned. The roadmap
status count SHALL state 192 playable skills, and ordered increments 20a, 20b, 20c, and 21a
SHALL be recorded as shipped. Roadmap item 26 and increment 21b SHALL remain open.

#### Scenario: Unit 21a does not close the parent item

- **WHEN** the first six Unit 21 skills are playable
- **THEN** their curriculum rows and increment 21a show completion
- **AND** the Stage G Units 20–21 checkbox remains open for the three probability skills
