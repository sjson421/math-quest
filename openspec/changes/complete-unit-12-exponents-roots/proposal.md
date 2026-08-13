## Why

Stage E Unit 12 currently stops after the same-base multiply and divide rules. The next
ordered roadmap increment completes the unit so the learner can use powers inside powers,
interpret zero and negative exponents, read scientific notation, and finish the order of
operations sequence begun in Unit 5.

## What Changes

- Add generators for exactly `power-of-power`, `zero-neg-exponents`,
  `scientific-notation`, and `pemdas-exponents` in Stage E Unit 12.
- Extend Unit 12's structured power data so every new display and answer can be rebuilt by
  the independent generator verifier.
- Generalize Unit 5's local arithmetic-expression model into a shared engine model with a
  power node, preserving existing Unit 5 output while letting `pemdas-exponents` derive its
  notation, answer, and predicted mistakes from one tree.
- Add the already-built `fraction-input` capability to Stage E's manifest requirements now
  that `zero-neg-exponents` has settled on an exact fraction answer.
- Register the four generators in manifest order and update recorded output, coverage,
  curriculum markers, README, and roadmap status. Roadmap item 21 remains open for Units
  13–15.

### Non-goals

- No Unit 13, 14, or 15 generator.
- No prerequisite, capability implementation, answer-shape, input-mode, or rendering
  change.
- No exponent syntax in expression input; all scoped answers use the existing numeric
  keypad, including decimal or fraction entry where needed.
- No coordinate-plane, chart, or timed-mode work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-12-exponents-roots`: Complete the remaining four Unit 12 skills and their
  independent-verification contract.
- `curriculum-manifest`: Record built fraction input as a Stage E requirement now that a
  Stage E generator consumes it.

## Impact

The change affects Unit 12 generators and tests, Stage E's manifest requirement list, the
shared curriculum expression model, `PowerData`, the global independent generator verifier,
recorded snapshots, generator coverage, and the three learner-facing status authorities. It
adds no dependency and changes no stored progress or sync data.
