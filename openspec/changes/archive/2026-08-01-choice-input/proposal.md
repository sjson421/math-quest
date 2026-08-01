## Why

`Problem.inputMode: 'choice'`, `problem.choices`, `Answer.kind: 'choice'`, and answer checking
already exist, but the lesson always renders the number keypad. Choice problems therefore
cannot be answered, blocking the first consumer at `compare-numbers` (0.5) and the rest of
Stage A.

## What Changes

- Render a problem's declared choices as the lesson's answer control when its input mode is
  `choice`, while keeping keypad problems unchanged.
- Submit a selected choice through the existing answer-checking and lesson-feedback path.
- Record `choice-input` as an available stage capability and make Stages A, C, and D depend
  on it, matching every named consumer.
- Add component-level coverage for the choice control and lesson input selection.
- Update the roadmap and repository status documentation to record the shipped capability.

This is capability work for Stage A, Unit 0. It adds no generators: `compare-numbers`,
`order-numbers`, `compare-negatives`, `name-parts`, and `compare-decimals` remain planned
future consumers and their identifiers are unchanged.

## Capabilities

### New Capabilities

- `choice-input`: Present declared choices, capture one selection, and submit its stable id
  through the existing lesson answer flow.

### Modified Capabilities

- `curriculum-manifest`: Add choice input to the stage capability vocabulary, mark it built,
  and record the dependency on each stage with a named consumer.

## Impact

- `src/components/`: a choice answer control and lesson wiring, without the system keyboard.
- `src/curriculum/manifest/`: the `choice-input` capability, Stage A/C/D requirements, and
  availability.
- Tests: static-render component coverage in the existing Node environment, stable-id answer
  checks, and manifest resolution coverage.
- Documentation: curriculum capability table, roadmap completion/status, and the active
  OpenSpec queue note.
- No progress-schema, sync, API, dependency, or generator change.

## Non-goals

- No Unit 0 or other skill generator ships in this change.
- No authored choice content or ordering interaction ships in this change.
- No KaTeX, fraction input, diagram, number-line, coordinate-plane, expression, chart, or
  timed capability changes.
- No change to numeric keypad behavior, lesson targets, re-queueing, mastery, or feedback.
