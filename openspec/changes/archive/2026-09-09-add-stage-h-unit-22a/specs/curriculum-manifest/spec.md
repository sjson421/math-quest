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

When no Stage H generator is registered, adding `timed` to the available capability set
SHALL leave all six Stage H skills planned, keep Stage H absent from the playable course tree,
and keep the implemented total at 195 of 201.

Once mixed-review generators are registered, Stage H SHALL also declare every content
capability reached by its own exercises and their source pools. Its requirement set SHALL be
the observed content requirements plus retained `timed`. All ten capabilities are already
available; their availability SHALL NOT change in this content increment. Retaining `timed`
SHALL NOT add a clock to any of the four untimed lessons.

Content requirement evidence SHALL include input modes, display kinds, embedded math notation
and fraction-entry declarations from the source generators and new authored exercises.
Timing SHALL be checked separately as the retained stage requirement, not claimed as an
observed property of these untimed exercises.

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

#### Scenario: Stage H records inherited content requirements and retained timing

- **WHEN** Stage H's authored exercises and every mixed-review pool member are checked
- **THEN** its declared requirements equal their observed content requirements plus `timed`
- **AND** every declared requirement is already available
- **AND** the four new lessons remain untimed

## ADDED Requirements

### Requirement: Stage H opens with its first content increment

The registry SHALL add `calculator-skills`, `formula-sheet`, `review-quantitative`, and
`review-algebraic` in their existing manifest order. Manifest membership, ids, prerequisites,
quick markers, wall markers, and available capabilities SHALL remain unchanged. Stage H's
requirements SHALL change only as specified above.

Those four skills SHALL resolve as implemented, making 199 of 201 skills playable.
`timed-practice-1` and `timed-practice-2` SHALL be the only planned skills. Curriculum rows
22.1–22.4 SHALL show completion and continue to agree with the manifest. Stage H SHALL enter
the course tree with exactly its four implemented skills.

README, curriculum and roadmap status prose SHALL reflect the new boundary. Increment 30a
SHALL be recorded as shipped only after implementation; roadmap item 30 SHALL remain unchecked
until increment 30b ships.

#### Scenario: Four skills open Stage H

- **WHEN** the four generators are registered and skill state is resolved
- **THEN** those four ids resolve as implemented and the total is 199 of 201
- **AND** the course tree contains Unit 22 with those four skills in manifest order
- **AND** both timed-practice ids stay planned and absent from the playable tree

#### Scenario: Registration preserves curriculum authority

- **WHEN** the manifest and curriculum are checked after registration
- **THEN** all 201 ids, memberships, prerequisites and pacing markers are unchanged
- **AND** rows 22.1–22.4 are complete and match the implemented set
- **AND** no prerequisite, pacing marker, unit membership, or stage capability is copied into
  a generator

#### Scenario: The parent item stays open

- **WHEN** roadmap status is updated after 30a ships
- **THEN** it records 199 playable skills and completion of 30a
- **AND** item 30 remains unchecked with 30b still pending

### Requirement: Stage G remains complete when Stage H opens

All twenty-two Stage G skills from `perimeter` through `counting-outcomes` SHALL remain
implemented. Unit 21's `basic-probability`, `compound-probability`, and `counting-outcomes`
SHALL remain registered after `read-scatterplot` in manifest order. Stage G SHALL retain
`choice-input`, `math-notation`, `fraction-input`, `diagram`, and `chart` as its complete
available capability requirements. Its manifest membership, prerequisites and pacing markers
SHALL remain unchanged.

Curriculum rows 20.1 through 21.9 SHALL remain complete. Roadmap increments 20a, 20b, 20c, 21a
and 21b SHALL remain recorded as shipped and roadmap item 26 SHALL remain closed. Updated
global counts SHALL reflect Stage H's first four playable skills rather than reopening
completed Stage G work.

#### Scenario: Stage G content and capability boundary stays complete

- **WHEN** Stage H's first four generators are registered
- **THEN** every Stage G skill stays implemented with the same order and requirements
- **AND** all twenty-two Stage G curriculum rows stay complete

#### Scenario: Stage G roadmap completion survives updated totals

- **WHEN** the roadmap is updated to 199 playable skills
- **THEN** all five Stage G increments remain shipped and item 26 remains checked
- **AND** only the two Stage H timed forms remain planned

## REMOVED Requirements

### Requirement: Stage G completes with its fifth content increment

**Reason**: Of its two scenarios, "Stage G status reaches its boundary" fixes the total at 195
and the only planned skills as Stage H's six, which this increment falsifies. Its other
scenario, "Registry addition preserves manifest authority", stays true: the Stage G preservation
requirement below restates the Unit 21 registration order and the five capability requirements,
and the Stage H opening requirement restates that no prerequisite, pacing marker, unit membership
or stage capability is copied into a generator. The replacement pair states the new 199-skill boundary while preserving Stage G's
registration order, capability declaration and complete content.

**Migration**: No data migration. Use the Stage G preservation requirement and Stage H opening
requirement above for the current completion boundary.

### Requirement: The final roadmap increment closes Stage G

**Reason**: Its standing total and description of all Stage H as planned become false.
The Stage G preservation requirement explicitly retains rows 20.1–21.9, increments
20a–21b and closed roadmap item 26; the Stage H requirement states the new totals.

**Migration**: No runtime or stored-data migration. Replace the obsolete global-status wording
with these two current requirements.
