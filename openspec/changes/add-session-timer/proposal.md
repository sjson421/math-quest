## Why

Stage H remains behind its declared `timed` capability, while the shared lesson session has no
clock state or learner-visible timer. Roadmap increment 29a adds that infrastructure before
Stage H content, keeping time pressure confined to sessions that explicitly request it.

## What Changes

- Add opt-in timing to the transient lesson session. Timing starts when practice starts, derives
  elapsed whole seconds from one monotonic origin, and is discarded when the session completes
  or the learner leaves.
- Show a compact, accessible elapsed-time clock only while a timed session is active. Recompute
  from the origin after delayed or throttled updates so the display does not drift.
- Keep every existing standard, review, and skip-check session untimed unless its caller
  explicitly opts in. Do not add a global setting or persistent timer state.
- Add the existing `timed` name to `AVAILABLE_CAPABILITIES` after the model, component, tests,
  and phone-layout proof are complete. Because Stage H has no generators yet, all six of its
  skills remain planned and the playable count remains 195 of 201.
- Update repository documentation to record timed mode as built and roadmap increment 29a as
  shipped while leaving parent item 29 open for the score estimator.
- Treat this as enabling infrastructure for Stage H, Unit 22. Exact skill ids in scope: none;
  no generator or curriculum row becomes playable in this tooling-only change.

## Non-goals

- No Stage H generator for `calculator-skills`, `formula-sheet`, `review-quantitative`,
  `review-algebraic`, `timed-practice-1`, or `timed-practice-2`.
- No raw-score mapping, scaled estimate, official-test caveat, or other work from increment 29b.
- No countdown, time limit, expiry action, forced answer, pause/resume control, or persisted
  interrupted-session recovery; Stage H content must define any later test policy it needs.
- No change to problem generation, answer checking, retries, recovery, hints, intros, attempt
  recording, mastery, rewards, review scheduling, skip checks, or sync.
- No runtime dependency, API, progress schema, or global Settings control.

## Capabilities

### New Capabilities

- `timed-mode`: Opt-in, session-local elapsed timing and its accessible lesson clock.

### Modified Capabilities

- `curriculum-manifest`: Mark the existing `timed` requirement available without registering a
  Stage H generator or changing the playable course.

## Impact

- Pure elapsed-time policy and lesson-session ownership under `src/lib/`, with deterministic
  tests for formatting, monotonic elapsed derivation, and session defaults.
- Shared lesson header timing markup and interval cleanup in `src/components/Lesson.tsx`, with
  first-paint component coverage and scripted 375-by-812 browser validation.
- Capability availability and unchanged Stage H/playable-count coverage in
  `src/curriculum/manifest/resolve.ts` and `src/curriculum/coverage.test.ts`.
- Capability and roadmap status prose in `AGENTS.md`, `README.md`, `docs/curriculum.md`, and
  `docs/roadmap.md`.
- No package, generator registry, persisted progress, sync payload, or server change.
