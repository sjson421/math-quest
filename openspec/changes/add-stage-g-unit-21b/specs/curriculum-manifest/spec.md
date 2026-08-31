## REMOVED Requirements

### Requirement: Stage G extends through its fourth content increment

**Reason**: Its status requires the final three Unit 21 skills to stay planned and the playable
total to remain 192, which becomes false when increment 21b ships.

**Migration**: Replace it with `Stage G completes with its fifth content increment`, which
preserves manifest authority while adding the already-built fraction-input requirement and
advancing the implemented boundary through `counting-outcomes`.

### Requirement: Fourth partial roadmap increment stays aligned

**Reason**: Its completed curriculum range, status count, and open parent item stop at
increment 21a and become stale when increment 21b closes roadmap item 26.

**Migration**: Replace it with `The final roadmap increment closes Stage G`, which advances the
completed rows, count, and shipped increment list through 21b and records the parent item as
closed.

## ADDED Requirements

### Requirement: Stage G completes with its fifth content increment

The registry SHALL add `basic-probability`, `compound-probability`, and `counting-outcomes`
under their existing manifest ids after `read-scatterplot` without changing manifest
membership, prerequisites, quick markers, or wall markers. Because the two probability skills
answer as fractions on the keypad, Stage G SHALL add the already-available `fraction-input` to
its existing `choice-input`, `math-notation`, `diagram`, and `chart` requirements without
changing `AVAILABLE_CAPABILITIES`. The manifest and curriculum document SHALL continue to
agree.

All twenty-two Stage G skills SHALL resolve as implemented because `choice-input`,
`math-notation`, `diagram`, `chart`, and `fraction-input` are already available. Adding the
fraction-input requirement SHALL change no other stage's resolved state.

#### Scenario: Registry addition preserves manifest authority

- **WHEN** increment 21b is registered
- **THEN** `basic-probability` through `counting-outcomes` follow `read-scatterplot` in
  manifest order
- **AND** Stage G records `choice-input`, `math-notation`, `fraction-input`, `diagram`, and
  `chart` as its complete available capability requirements
- **AND** no prerequisite, pacing marker, unit membership, or stage capability is copied into
  a generator

#### Scenario: Stage G status reaches its boundary

- **WHEN** skill states are resolved after increment 21b
- **THEN** every Stage G skill from `perimeter` through `counting-outcomes` is implemented
- **AND** the only planned skills left are Stage H's six
- **AND** the total implemented count is 195 of 201

### Requirement: The final roadmap increment closes Stage G

Curriculum rows 20.1 through 21.9 SHALL be marked complete, and curriculum status prose SHALL
identify every Stage G skill as playable and Stage H as the only planned work. The roadmap
status count SHALL state 195 playable skills, and ordered increments 20a, 20b, 20c, 21a, and
21b SHALL be recorded as shipped. Roadmap item 26 SHALL be closed, because all five of its
increments have landed.

#### Scenario: Unit 21b closes the parent item

- **WHEN** all nine Unit 21 skills are playable
- **THEN** their curriculum rows and increment 21b show completion
- **AND** the Stage G Units 20–21 checkbox is checked
