## Why

Stage D's capability infrastructure is complete, but none of its content is playable. The
first ordered increment must turn Unit 7's first six conceptual fraction skills into generated,
independently verifiable lessons before later fraction procedures can build on them.

## What Changes

- Add generators for Stage D, Unit 7 skills `fraction-meaning`, `fraction-of-shape`,
  `name-parts`, `fractions-numberline`, `equivalent-visual`, and `equivalent-multiply`.
- Exercise the existing fraction keypad, diagram, choice, number-line, and structured math
  surfaces in the control mode each concept needs.
- Add narrow fraction-operation data to math displays and rational metadata to value-bearing
  choices so independent verification derives conceptual answers without evaluating arbitrary
  notation or parsing learner-facing prose.
- Add Unit 7 recorded-output and independent content tests, register the six generators, and
  record the resulting 67-skill playable total in the curriculum and roadmap authorities.

### Non-goals

- Implementing `simplify-fractions`, `compare-same-den`, `compare-diff-den`, or any Unit 8–11
  generator; roadmap item 19 remains open after this increment.
- Adding or changing a rendering or input capability, a general math-notation evaluator, or a
  required fraction-form answer rule.
- Changing manifest membership, prerequisites, capability requirements, stored progress, or
  sync data.

## Capabilities

### New Capabilities

- `unit-07-fractions-meaning`: Generated, playable content for the first six conceptual Unit 7
  fraction skills.

### Modified Capabilities

- `problem-generation`: Independently verify math-display fraction operations and
  value-bearing choices from structured data rather than authored answers or prose.

## Impact

The generator registry gains one Unit 7 module and six skills. Problem display and choice data
gain optional authoring fields consumed by verification and recorded-output gates; no lesson
state, answer-checking, progress, sync, runtime dependency, or manifest capability changes.
Curriculum and roadmap documentation record the newly playable skills while leaving the parent
roadmap item unchecked.
