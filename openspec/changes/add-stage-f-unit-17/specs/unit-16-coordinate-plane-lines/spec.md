## ADDED Requirements

### Requirement: Unit 16 remains complete as Unit 17 ships

The system SHALL keep all ten Unit 16 generators implemented in manifest order while Unit 17
becomes playable. Stage F's requirements and `AVAILABLE_CAPABILITIES` SHALL remain unchanged,
and roadmap item 23 SHALL stay open for Units 18–19.

#### Scenario: Unit 17 joins the completed coordinate-plane unit

- **WHEN** the four Unit 17 generators are registered
- **THEN** all ten Unit 16 skills and all four Unit 17 skills resolve as implemented
- **AND** the playable total becomes 159

#### Scenario: Remaining Stage F units stay planned

- **WHEN** increment 17 is complete
- **THEN** every skill in Units 18–19 remains planned
- **AND** roadmap item 23 remains unchecked

## REMOVED Requirements

### Requirement: Unit 16 is complete without another capability

**Reason**: Unit 17 now becomes playable, so the retained scenario that every Unit 17–19 skill
remains planned is false even though Unit 16's completed and capability states do not change.

**Migration**: The new `Unit 16 remains complete as Unit 17 ships` requirement preserves Unit
16's implemented state, the unchanged Stage F capability contract, and the open roadmap item
while advancing the planned boundary to Unit 18.
