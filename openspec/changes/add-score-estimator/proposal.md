## Why

Stage H's future full-length practice forms need to turn earned practice points into a useful
GED Mathematical Reasoning score estimate. GED Testing Service does not publish one universal
raw-score conversion, so the app must make its approximation inspectable and keep the official-
score caveat beside every result.

## What Changes

- Add a deterministic, dependency-free mapping from earned and possible practice points to an
  estimated 100–200 GED Mathematical Reasoning scaled score, using published reference points
  that a reader can inspect.
- Add a reusable result card that shows the raw practice points, labels the scaled result and
  performance band as estimates, and keeps the mapping, source links, and form-equating caveat
  available with the result.
- Keep estimation local and offline. Item 30 can compose the card into its future full-length
  result flow without changing the estimator or claiming that Math Quest issues official scores.
- Add pure and static component coverage, plus temporary-fixture browser proof at 375 by 812
  pixels.
- Update the README, curriculum status notes, capability inventory, and roadmap to record the
  estimator as built while all six Stage H modules remain planned.

This is tooling-only infrastructure for Stage H, Unit 22. Exact skill ids in scope: none.

## Non-goals

- No generator or test form for `calculator-skills`, `formula-sheet`, `review-quantitative`,
  `review-algebraic`, `timed-practice-1`, or `timed-practice-2`.
- No decision about full-length form size, sampling, item weights, time limits, expiry, rewards,
  progress recording, or how item 30 navigates to its result.
- No change to the session clock, lesson queues, eight-problem skip checks, manifest capability
  availability, generator registry, playable course, persisted progress, or sync payload.
- No global Settings calculator, runtime network request, third-party scoring table, claim of an
  exact official conversion, or GED Ready replacement.

## Capabilities

### New Capabilities

- `ged-score-estimation`: Transparent, offline GED Mathematical Reasoning practice-score
  estimation and honest result presentation.

### Modified Capabilities

None.

## Impact

- One pure score-model owner under `src/lib/`, with validation and deterministic tests.
- One reusable result component under `src/components/`, with static accessibility and wording
  coverage.
- Temporary real-app fixture wiring for browser validation only; no permanent navigation or
  learner-reachable test form until item 30.
- Status prose in `README.md`, `docs/curriculum.md`, and `docs/roadmap.md`.
- No runtime dependency, API, manifest, generator, progress schema, sync, or server change.
