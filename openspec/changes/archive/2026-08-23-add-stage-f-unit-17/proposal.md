## Why

Stage F currently stops after coordinate-plane and line reading because Unit 17 has no
generators. The next roadmap increment can now teach systems of equations without new input
infrastructure: every answer is an exact integer ordered pair, which the existing
coordinate-plane surface already accepts.

## What Changes

- Add the four Stage F Unit 17 generators in curriculum order:
  `system-by-graphing`, `substitution`, `elimination`, and `system-words`.
- Present graphing with two existing line marks, present algebraic methods as two structured
  equations, and present word problems through a fixed adult-tone frame whose quantities also
  derive the two visible equations.
- Submit every answer as a structured ordered pair through coordinate-plane input. Algebraic
  and story problems reuse the same plane as the point-entry surface without drawing solution
  geometry that would reveal the answer.
- Extend operation-specific coordinate data, rendering, learner-text collection, recorded
  output, difficulty evidence, and independent verification for all four system methods.
- Give the `elimination` wall at least two distinct, wrong, reachable point predictions,
  including scaling coefficients without scaling the right-hand side.
- Register Unit 17, mark its four curriculum rows built, update the playable total and roadmap
  increment, and validate the complete lesson composition at a 375-pixel viewport.

### Non-goals

- Implementing Units 18 or 19, changing the scope or completion state of roadmap item 23, or
  adding polynomial, quadratic, function, chart, or timed content.
- Adding a second ordered-pair entry mode, a text encoding for points, a new display arm, or a
  new manifest capability.
- Teaching coincident, parallel, or no-solution systems; this increment keeps the roadmap's
  ordered-pair answer contract and generates one integer intersection throughout.
- Changing generic coordinate-plane geometry, progress storage, sync payloads, lesson
  adaptation, or runtime dependencies.

## Capabilities

### New Capabilities

- `unit-17-systems-equations`: Generated graphing, substitution, elimination, and fixed-frame
  systems word problems with exact ordered-pair answers and wall diagnostics.

### Modified Capabilities

- `coordinate-plane-display`: Show structured pairs of equations or a systems story beside the
  one coordinate-plane answer surface without adding a second graph or entry control.
- `problem-generation`: Rebuild visible system context and independently derive each integer
  intersection from closed operation-specific data rather than trusting the authored answer.
- `unit-16-coordinate-plane-lines`: Retire the completed-16b snapshot that says every Unit 17–19
  skill remains planned while preserving Unit 16's completed state and capability contract.

## Impact

The generator registry gains one Unit 17 module and focused test/snapshot coverage. Shared
coordinate operation types and their exhaustive render, text, recording, verification, and
difficulty consumers gain four arms. `docs/curriculum.md` and `docs/roadmap.md` record the
four newly playable skills, bringing the documented total from 155 to 159 while leaving the
larger roadmap checkbox open. No dependency, manifest edge, capability flag, progress shape,
or API changes.
