## MODIFIED Requirements

### Requirement: Stage capability requirements are recorded

Each stage SHALL record the capabilities its skills require — choice input, KaTeX rendering,
fraction keypad input, diagram rendering, expression input, number-line input,
coordinate-plane input, chart rendering, and timed mode. Recording a requirement SHALL NOT
imply it is built.

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
