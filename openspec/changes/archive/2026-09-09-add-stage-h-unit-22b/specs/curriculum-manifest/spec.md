## REMOVED Requirements

### Requirement: Stage H opens with its first content increment

**Reason**: The 199-of-201 boundary and requirement that both forms remain planned become false when 30b ships.
**Migration**: Replace this boundary with complete Stage H coverage below. Preserve all four previously implemented skills and their curriculum markers.

### Requirement: Stage G remains complete when Stage H opens

**Reason**: Its status scenario requires 199 playable skills and two planned forms; the completed course supersedes that boundary.
**Migration**: Preserve every Stage G skill, capability, curriculum row and shipped roadmap increment under the complete-course requirement below.

## ADDED Requirements

### Requirement: Stage H completes the playable course

`timed-practice-1` and `timed-practice-2` SHALL be registered after `review-algebraic` in their existing manifest order. All six Unit 22 skills SHALL resolve as implemented, all 201 course skills SHALL be playable, and no manifest skill SHALL remain planned. The course tree SHALL derive all six Stage H entries in manifest order from registration and existing capabilities.

All manifest ids, memberships, prerequisites, quick markers, wall markers and available capabilities SHALL remain unchanged. Stage H SHALL retain its existing inherited input/display requirements plus `timed`. No generator SHALL duplicate prerequisite, unit-membership or pacing metadata from the manifest. The two new skills SHALL each carry an authored teaching line and stable example under the content and intro contracts.

Curriculum rows 22.5 and 22.6 SHALL gain completion markers without altering their ids or the curriculum tables' structure. Rows 22.1–22.4 SHALL remain complete. README, curriculum and roadmap status prose SHALL reflect 201 playable skills with both timed forms implemented. Roadmap increment 30b and parent item 30 SHALL be marked complete only once their implementation and verification are complete; item 31 SHALL remain pending.

#### Scenario: Both forms close Stage H

- **WHEN** the two form generators are registered and skill state is resolved
- **THEN** Unit 22 contains all six implemented skills in manifest order
- **AND** the playable course contains 201 skills with no planned ids

#### Scenario: Registration preserves curriculum authority

- **WHEN** the manifest and curriculum are checked after registration
- **THEN** all 201 ids, memberships, prerequisites, quick and wall markers match the existing authority
- **AND** both new completion markers agree with registration without duplicating manifest metadata in generators

#### Scenario: Roadmap completion follows verified implementation

- **WHEN** both forms and their required checks are complete
- **THEN** status documents report the complete playable course and mark 30b and item 30 complete
- **AND** item 31 remains unchecked

### Requirement: Earlier stages remain complete when the course closes

All previously implemented Stage A–G content SHALL remain implemented with its existing order, requirements, prerequisites and pacing. In particular, all twenty-two Stage G skills from `perimeter` through `counting-outcomes` SHALL remain implemented, with `basic-probability`, `compound-probability` and `counting-outcomes` registered after `read-scatterplot` in manifest order.

Stage G SHALL retain `choice-input`, `math-notation`, `fraction-input`, `diagram` and `chart` as its complete available capability requirements. Curriculum rows 20.1–21.9 SHALL remain complete. Roadmap increments 20a, 20b, 20c, 21a and 21b SHALL remain shipped and item 26 SHALL remain closed when global counts change to 201.

#### Scenario: Stage G retains content and capabilities

- **WHEN** both Stage H forms become implemented
- **THEN** all twenty-two Stage G skills and curriculum rows remain complete in their existing order
- **AND** Stage G's content requirements and manifest graph are unchanged

#### Scenario: Updated totals do not reopen shipped work

- **WHEN** the roadmap reports 201 playable skills
- **THEN** every previously closed item remains closed, including item 26 and its five increments
- **AND** completion of Stage H does not remove earlier content
