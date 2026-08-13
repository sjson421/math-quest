## MODIFIED Requirements

### Requirement: The first six Unit 11 skills are playable as ratio and proportion content

The system SHALL generate Stage D Unit 11 skills `write-ratios`, `simplify-ratios`,
`unit-rate`, `solve-proportions`, `scale-drawings`, and `unit-conversion` under their
manifest ids. Each SHALL satisfy the existing determinism, computed-answer, measurable
difficulty, variety, agreement, and content requirements using only Stage D's available
capabilities.

Every scoped problem SHALL use the existing fraction keypad, whole-number keypad, choice
input, math notation, or story display. No scoped problem SHALL require a new rendering,
input, or answer capability.

#### Scenario: Increment 11a becomes playable in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all six scoped skills resolve as implemented after `simple-interest`
- **AND** `ratio-words` resolves as implemented after `unit-conversion`
- **AND** roadmap item 19 is complete after increment 11b

## ADDED Requirements

### Requirement: Ratio word problems distinguish part-to-part from part-to-whole

The system SHALL generate the Stage D Unit 11 skill `ratio-words` under its manifest id.
Each problem SHALL present two positive, unequal category counts in an authored adult-context
story, state their total, and request either the first-to-second ratio or the first-to-whole
ratio. The exact answer SHALL preserve the requested order, use fraction entry, and be
recomputable from structured category counts and comparison type carried with the story.

Problems SHALL cover both comparison types across the seeded sample, vary their authored
context, and grow their counts measurably across the five difficulty bands. The skill SHALL
use only Stage D's existing story, exact-rational, and fraction-keypad capabilities.

#### Scenario: A part-to-part story compares the two categories

- **WHEN** a story states 3 completed items and 2 deferred items, for 5 items in all, and
  requests completed to deferred
- **THEN** the exact answer is `3/2` in fraction form

#### Scenario: A part-to-whole story compares one category with the total

- **WHEN** the same counts request completed items to all items
- **THEN** the exact answer is `3/5` in fraction form

#### Scenario: Both comparison modes become playable

- **WHEN** seeded problems are sampled across the full difficulty range
- **THEN** both part-to-part and part-to-whole questions appear
- **AND** `ratio-words` resolves as implemented after `unit-conversion`

### Requirement: Ratio word problems diagnose the wall's two comprehension errors

Every `ratio-words` problem SHALL predict the value produced by using the other available
comparison and the value produced by reversing the requested comparison. Both predictions
SHALL differ from the correct answer and from each other after central filtering.

#### Scenario: Part-to-part is mistaken for part-to-whole

- **WHEN** a problem asks for 3 completed items to 2 deferred items
- **THEN** `3/5` diagnoses using the whole as the second term
- **AND** `2/3` diagnoses reversing the requested category order

#### Scenario: Part-to-whole is mistaken for part-to-part

- **WHEN** a problem asks for 3 completed items to all 5 items
- **THEN** `3/2` diagnoses using only the other category as the second term
- **AND** `5/3` diagnoses reversing the requested part-to-whole comparison
