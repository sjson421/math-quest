## Why

Stage D Unit 7 has six playable meaning skills but stops before lowest terms and fraction
comparison. The ordered 7b increment completes the unit with three conceptual generators and
makes the existing simplest-form feedback and wall-diagnosis contracts work for fraction
entries.

## What Changes

- Add generators for Stage D Unit 7 skills `simplify-fractions`, `compare-same-den`, and
  `compare-diff-den` under their existing manifest ids.
- Use structured fraction notation and independent semantic data for reducible fractions and
  two-fraction comparisons.
- Exercise the existing fraction keypad, `requireSimplified`, and `not-simplified` response for
  lowest-terms answers; compare fractions through numeric stable-id choices.
- Diagnose predicted slash-form mistakes by parsing submitted numeric input exactly before
  matching it, while preserving whole-number and numeric-choice diagnosis.
- Add independent Unit 7 tests, recorded output, coverage updates, and real-app validation; mark
  curriculum rows 7.7–7.9 playable and update the sole playable count to 70 while roadmap item
  19 remains open.

### Non-goals

- Implementing any Unit 8–11 generator, mixed-number entry, required decimal/fraction output
  forms, or fraction arithmetic.
- Adding or changing a rendering, keypad, choice, or number-line capability.
- Changing manifest membership, prerequisites, stage requirements, stored progress, or sync
  data.
- Generalising misconception values beyond finite numbers or diagnosing the
  `not-simplified` status as an arithmetic error.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-07-fractions-meaning`: Complete Unit 7 with lowest-terms and same/different-denominator
  fraction comparison content.
- `problem-generation`: Independently verify simplification and two-fraction comparison from
  structured display data.
- `answer-entry`: Match finite predicted misconception values against parsed integer, decimal,
  or fraction submissions instead of scalar strings only.

## Impact

The existing Unit 7 generator module, fraction semantic-data union, independent verifier,
recorded-output formatter, answer-diagnosis helper, coverage assertions, and curriculum/roadmap
status documentation change. No dependency, persistence, sync, manifest graph, or public API
changes are required.
