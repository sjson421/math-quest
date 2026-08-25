## MODIFIED Requirements

### Requirement: Learner-facing text stays within authoring limits

Every generated problem SHALL continue to satisfy the fixed hint and solution limits below. A skill whose roadmap intro increment has shipped SHALL also carry exactly one authored teaching line and present exactly one generated worked example. During the staged 25a–25d rollout, a playable generator outside the completed intro increments MAY omit the teaching line and SHALL keep its existing lesson flow rather than presenting an empty intro.

Limits per skill:

| Element | Limit |
|---|---|
| Teaching line | exactly 1 when the skill's intro has shipped; 1 sentence |
| Worked example | exactly 1 when the skill's intro has shipped |
| Hint | 1 sentence |
| Solution steps | at most 4 |
| Words per solution step | at most 12 |
| New vocabulary words | at most 1 per teaching line |

Teaching lines are fixed authored sources, so their checks SHALL run directly over every required generator rather than rely on generated-problem sampling. The same curated vocabulary authority used for forward references SHALL reject a later-unit term and SHALL count terms introduced in the current unit, rejecting a teaching line that introduces more than one.

#### Scenario: Solution step count is enforced

- **WHEN** a generator produces a problem with 5 or more solution steps
- **THEN** the content check fails and names the skill

#### Scenario: Solution step length is enforced

- **WHEN** any solution step's text exceeds 12 words
- **THEN** the content check fails and reports the step and its word count

#### Scenario: Hint is a single sentence

- **WHEN** a generator produces a hint containing more than one sentence
- **THEN** the content check fails

#### Scenario: Every problem carries a hint and a solution

- **WHEN** a generator produces a problem
- **THEN** the hint is non-empty
- **AND** at least one solution step is present

#### Scenario: A required teaching line is checked at its source

- **WHEN** a generator in a completed intro increment has an empty or multi-sentence teaching line
- **THEN** the content check fails and names the skill and teaching-line rule

#### Scenario: A teaching line introduces too much vocabulary

- **WHEN** a teaching line contains more than one curated term introduced in that skill's unit
- **THEN** the content check fails and names the terms

#### Scenario: A later increment is not forced forward

- **WHEN** a playable skill is outside the intro increments completed so far
- **THEN** the teaching-line presence gate does not fail for that skill

