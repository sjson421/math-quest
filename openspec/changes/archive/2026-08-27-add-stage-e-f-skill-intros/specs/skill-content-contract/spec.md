## ADDED Requirements

### Requirement: Learner-facing text stays within complete authoring limits

Every generated problem SHALL continue to satisfy the fixed hint and solution limits below.
Every playable generator SHALL also carry exactly one authored teaching line and present
exactly one generated worked example. A newly playable generator SHALL NOT omit its teaching
line or fall back to a problem-first lesson.

Limits per skill:

| Element | Limit |
|---|---|
| Teaching line | exactly 1; 1 sentence |
| Worked example | exactly 1 |
| Hint | 1 sentence |
| Solution steps | at most 4 |
| Words per solution step | at most 12 |
| New vocabulary words | at most 1 per teaching line |

Teaching lines are fixed authored sources, so their checks SHALL run directly over every
playable generator rather than rely on generated-problem sampling. The same curated
vocabulary authority used for forward references SHALL reject a later-unit term and SHALL
count terms introduced in the current unit, rejecting a teaching line that introduces more
than one.

#### Scenario: Solution step count is enforced

- **WHEN** a generator produces a problem with 5 or more solution steps
- **THEN** the content check fails and names the skill

#### Scenario: Solution step length is enforced

- **WHEN** any solution step's text exceeds 12 words
- **THEN** the content check fails and reports the step and its word count

#### Scenario: Hint is a single sentence

- **WHEN** a generator produces a problem with a hint containing more than one sentence
- **THEN** the content check fails

#### Scenario: Every problem carries a hint and a solution

- **WHEN** a generator produces a problem
- **THEN** the hint is non-empty
- **AND** at least one solution step is present

#### Scenario: A required teaching line is checked at its source

- **WHEN** a playable generator has an empty or multi-sentence teaching line
- **THEN** the content check fails and names the skill and teaching-line rule

#### Scenario: A teaching line introduces too much vocabulary

- **WHEN** a teaching line contains more than one curated term introduced in that skill's unit
- **THEN** the content check fails and names the terms

#### Scenario: A future playable generator cannot omit teaching content

- **WHEN** a generator is added for a planned Stage G or Stage H skill
- **THEN** its declaration requires one authored teaching line
- **AND** its lesson presents the existing stable worked example before first practice

## REMOVED Requirements

### Requirement: Learner-facing text stays within authoring limits

**Reason**: Its temporary staged-rollout scenario permits playable generators outside
increments 25a–25d to omit teaching lines. Increment 25d completes every playable skill, so
that exception is no longer true or needed.

**Migration**: The successor requirement, “Learner-facing text stays within complete
authoring limits,” preserves all hint, solution, vocabulary, and authored-source limits while
requiring teaching content on every playable generator.
