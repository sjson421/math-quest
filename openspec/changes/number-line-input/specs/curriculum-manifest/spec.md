## MODIFIED Requirements

### Requirement: Stage capability requirements are recorded

Each stage SHALL record the capabilities its skills require — choice input, KaTeX rendering,
fraction keypad input, diagram rendering, expression input, number-line input,
coordinate-plane input, chart rendering, and timed mode. Recording a requirement SHALL NOT
imply it is built.

A stage's record SHALL name every capability its own skills need, not only the one it
introduces, so the set can be read off the stage rather than assembled from earlier ones.

#### Scenario: Capability requirement is queryable

- **WHEN** a stage is inspected
- **THEN** it lists the capabilities its skills depend on
- **AND** each capability is marked available or unavailable

#### Scenario: Skill needing an unavailable capability stays planned

- **WHEN** a skill requires a capability that is not yet built
- **THEN** the skill resolves as `planned` regardless of whether a generator exists

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
