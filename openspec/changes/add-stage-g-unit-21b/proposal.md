## Why

Increment 21a stopped after the statistics half of Unit 21, leaving `basic-probability`,
`compound-probability`, and `counting-outcomes` planned and roadmap item 26 open. Increment
21b is the unit's last three skills and the last content Stage G needs, and it carries the one
decision the roadmap deferred to it: a probability typed as `0.5`, `1/2`, or `50%` is one
value written three ways, and the unit has to pick one.

## What Changes

- Add Stage G, Unit 21 generators in manifest order for `basic-probability`,
  `compound-probability`, and `counting-outcomes`.
- Settle the deferred answer-form question: a probability answers as a **fraction**, declared
  through the existing `requireFraction` form check. The pad has one adaptive cell and a
  fraction skill takes it for the slash, so no decimal point is reachable on these problems: the
  form check states the answer's written form and is proved against `checkAnswer`, exactly as
  `write-ratio` already ships it. Simplest form is not additionally required, matching
  `write-ratio`, where a ratio of counts requires the notation and only the skill that teaches
  reduction requires the reduction.
- Carry typed probability source data — favourable and total counts, and the two events a
  compound problem combines — beside each visible story so independent verification can rebuild
  every display and answer without parsing generated prose or trusting the stated answer.
- Constrain every generated probability to stay strictly between 0 and 1, including the
  combined value of an `or` problem, so the answer is always a genuine fraction.
- Give the `compound-probability` wall at least two collision-proof diagnoses: applying the
  other operation the cue asked for, and adding numerators and denominators across the two
  events.
- Answer `counting-outcomes` as an exact whole number through the existing keypad, since a
  number of arrangements is a count rather than a likelihood.
- Record Stage G's use of the already-available `fraction-input` alongside its existing
  `choice-input`, `math-notation`, `diagram`, and `chart` requirements.
- Add reviewed teaching lines and stable worked examples for all three skills.
- Register the three generators, mark curriculum rows 21.7 through 21.9 complete, refresh the
  status prose, record 21b as shipped, close roadmap item 26, and raise the playable total from
  192 to 195.
- Add no new runtime capability, renderer, answer control, or display kind.

## Capabilities

### New Capabilities

None. Increment 21a created `unit-21-data-probability`; this increment extends it.

### Modified Capabilities

- `unit-21-data-probability`: Add the three probability skills, their required fraction answer
  form, the compound wall's predictions, and the whole-number counting answer.
- `problem-generation`: Extend the closed statistics operation union to probability, requiring
  its counts to reach independent verification, recorded output, learner text, and difficulty
  evidence, and requiring a fractional answer to be rebuilt exactly rather than approximately.
- `curriculum-manifest`: Complete Stage G through `counting-outcomes`, add the already-available
  `fraction-input` requirement, and advance the playable total to 195 without changing manifest
  membership, prerequisites, pacing markers, or capability availability.

## Non-goals

- Stage H and Unit 22, which remain the only planned skills after this increment.
- A percent or decimal answer form for probability, and any new `requirePercent` mechanism.
- Conditional probability, probability without replacement, permutations distinguished from
  combinations, factorial notation, or tree diagrams. Unit 21 teaches the fundamental counting
  principle as multiplication of independent choices.
- A new display kind, renderer, answer control, input mode, chart kind, or manifest capability.
- Changes to Unit 20, lesson adaptation, progress, persistence, sync, review scheduling,
  skip-ahead, or timed mode.

## Impact

- Curriculum model and content: `src/lib/types.ts`, the existing Unit 21 generator module and
  its tests, generator verification, recorded output, learner-text collection, difficulty
  measurement, and `src/curriculum/index.ts`.
- Existing presentation: the story display and the numeric keypad with its fraction slash; no
  new renderer or answer control. The fraction form check and its `not-fraction` feedback are
  already built and unchanged.
- Authorities and status: `src/curriculum/manifest/stage-g.ts`, curriculum rows 21.7 through
  21.9 and related status prose, README and roadmap status prose, coverage and manifest
  assertions, and snapshots.
- Dependencies and persistence: no new package, service, network requirement, stored-progress
  field, sync payload, API, or data migration.
