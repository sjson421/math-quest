## Why

Stage G stops after geometry because Unit 21 has no generators. Increment 21a adds its first
six data and statistics skills, including the two production consumers the chart capability
was built to support.

## What Changes

- Add Stage G, Unit 21 generators in manifest order for `mean`, `median`, `mode-range`,
  `weighted-mean`, `read-bar-line`, and `read-scatterplot`.
- Carry typed statistics source data beside each visible list or chart so independent
  verification can rebuild every display and answer without trusting generated prose or the
  stated answer.
- Generate exact whole-number list and categorical-chart answers through the existing keypad.
  Generate scatter trend readings through existing choice input and the existing derived trend
  line.
- Give the `median` wall two collision-proof diagnoses: using the middle of the unsorted list
  and calculating the mean instead.
- Add reviewed teaching lines and stable worked examples for all six skills, with accessible
  list and chart presentation on the installed phone surface.
- Register the six generators, mark curriculum rows 21.1 through 21.6 complete, refresh the
  curriculum's Stage G and playable/planned status prose, record 21a as shipped, and raise the
  playable total from 186 to 192 while leaving roadmap item 26 and increment 21b open.
- Add no new runtime capability. Record Stage G's use of already-available `choice-input`
  alongside its existing `math-notation`, `diagram`, and `chart` requirements.

## Capabilities

### New Capabilities

- `unit-21-data-probability`: Generated mean, median, mode/range, weighted-mean, categorical
  chart-reading, and scatter-trend lessons for Stage G increment 21a.

### Modified Capabilities

- `problem-generation`: Require list and chart statistics operations to carry complete typed
  source data through independent verification, recorded output, learner text, and measurable
  difficulty evidence.
- `skill-intros`: Extend stable, accessible phone-sized intros to the six Unit 21a list and
  chart representations.
- `curriculum-manifest`: Advance Stage G's implemented boundary through `read-scatterplot` and
  record its existing choice-input dependency without changing manifest membership,
  prerequisites, pacing markers, or capability availability.

## Non-goals

- Unit 21b skills `basic-probability`, `compound-probability`, and `counting-outcomes`, including
  their required fraction answer form.
- New chart kinds, chart interaction, another renderer, another display kind, another input
  mode, or a new manifest capability.
- Changes to Unit 20, Stage H, lesson adaptation, progress, persistence, sync, review scheduling,
  skip-ahead, or timed mode.
- Fractional, decimal, approximate, or free-response trend answers in increment 21a.

## Impact

- Curriculum model and content: `src/lib/types.ts`, a new Unit 21 generator module and tests,
  generator verification, recorded output, learner-text collection, difficulty measurement,
  and `src/curriculum/index.ts`.
- Existing presentation: the story display for wrapped value lists and the chart display,
  semantic table, keypad frame, choice surface, and intro renderer; no new renderer or answer
  control.
- Authorities and status: `src/curriculum/manifest/stage-g.ts`, curriculum rows 21.1 through
  21.6 and related status prose, README and roadmap status prose, coverage and manifest
  assertions, and snapshots.
- Dependencies and persistence: no new package, service, network requirement, stored-progress
  field, sync payload, API, or data migration.
