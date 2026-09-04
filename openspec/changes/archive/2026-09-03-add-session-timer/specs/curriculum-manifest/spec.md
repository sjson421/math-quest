## MODIFIED Requirements

### Requirement: Stage capability requirements remain complete after Unit 19

Each stage SHALL record the capabilities its skills require — choice input, structured math
notation, fraction keypad input, diagram rendering, expression input, number-line input,
coordinate-plane input, root-pair input, chart rendering, and timed mode. Recording a
requirement SHALL NOT imply it is built.

A stage's record SHALL name every capability its own skills need, not only the one it
introduces, so the set can be read off the stage rather than assembled from earlier ones.

The existing `timed` capability SHALL be marked available only after session-local timing,
accessible clock markup, cleanup, and phone-layout validation are built. Stage H SHALL retain
`timed` as its declared stage requirement. No generator, skill id, unit membership,
prerequisite, quick marker, or wall marker SHALL be added or changed by capability activation.

Because every Stage H skill still lacks a registered generator, adding `timed` to the available
capability set SHALL leave all six Stage H skills planned, keep Stage H absent from the playable
course tree, and keep the implemented total at 195 of 201.

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

#### Scenario: Unit 19 completes Stage F without a capability change

- **WHEN** the five Unit 19 generators are registered after Units 16–18 are complete
- **THEN** Stage F still lists `choice-input`, `math-notation`, `expression-input`, `coordinate-plane`, and `root-pair-input` as available required capabilities
- **AND** every one of its 28 skills resolves as implemented
- **AND** the playable skill total is 173

#### Scenario: Chart availability completes Stage G infrastructure without content

- **WHEN** chart rendering and its capability flag are present before any Stage G generator
- **THEN** Stage G lists `math-notation`, `diagram`, and `chart` as available required
  capabilities
- **AND** all 22 Stage G skills remain planned
- **AND** the playable skill total remains 173

#### Scenario: Stage H remains gated by timed mode

- **WHEN** chart rendering is available while timed mode is not
- **THEN** all six Stage H skills remain planned
- **AND** chart availability does not change the Stage H capability state

#### Scenario: Timed capability becomes available

- **WHEN** timed session infrastructure is complete
- **THEN** `timed` is present in the available capability set
- **AND** Stage H still declares `timed` as its required capability

#### Scenario: Availability alone does not ship Stage H content

- **WHEN** skill state is resolved after `timed` becomes available but before any Stage H
  generator is registered
- **THEN** all six Stage H skills remain planned
- **AND** Stage H remains absent from the playable course tree
- **AND** exactly 195 of 201 skills remain implemented
