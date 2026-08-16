## 1. Point value and pure input policy

- [x] 1.1 Add the structured point answer/misconception value, coordinate-plane input mode,
  canonical point codec, ordered lattice-target derivation, placement resolution, target
  reachability validation, and focused pure tests.
- [x] 1.2 Extend answer checking for exact ordered points, including swapped-coordinate and
  malformed-entry tests.
- [x] 1.3 Extend central misconception filtering and diagnosis for valid, answer-colliding,
  duplicate, swapped, cross-kind, and invalid point predictions, with focused tests.
- [x] 1.4 Extend recorded output for point answers and misconceptions, and keep independent
  coordinate-plane answer verification explicitly fail-closed until content supplies
  operation-specific source data, with synthetic tests.

## 2. Coordinate-plane answer surface

- [x] 2.1 Add the markup-based lattice controls and selected-point presentation to the existing
  coordinate-plane renderer, then add the disabled-until-placed confirmation surface and
  roving keyboard navigation, with static component tests for sparse and 441-target planes.
- [x] 2.2 Route coordinate-plane input through the lesson's existing entry, submission gate,
  feedback, progress, and requeue path; extend every exhaustive input-mode consumer and add
  lesson composition tests proving other controls do not leak in.
- [x] 2.3 Add x−, y−, origin, y+, and x+ controls at least 48 CSS pixels high and wide as the
  dense plane's equivalent touch route; reuse the pending placement path, disable movement at
  axis boundaries, preserve keyboard focus and placement at boundaries, and add focused static
  and browser interaction coverage.

## 3. Capability and roadmap state

- [x] 3.1 Mark `coordinate-plane` available and update coverage tests to prove Stage F has no
  unavailable requirement while all 28 generator-less skills remain planned, the playable
  total remains 145, and input-mode capability coverage includes the new mode.
- [x] 3.2 Close roadmap item 22 and update `docs/roadmap.md` and `docs/curriculum.md` capability
  prose to describe the shipped point-input behavior without claiming any Stage F generator.

## 4. Verification

- [x] 4.1 Run the focused point-helper, answer, generator, coordinate component, lesson,
  recorded-output, and coverage tests; fix every failure in scope.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; confirm only the documented
  pre-existing Settings warnings remain.
- [x] 4.3 Run the real app in scripted Chromium at 375px, verify placement can be corrected
  before Check by pointer and keyboard, correct and swapped-point submissions use the expected
  lesson flows, measure all five nudge controls at no less than 48 by 48 CSS pixels, use the
  nudge route to reach a non-origin point on the 441-target plane without submitting or crossing
  a boundary, assert no horizontal overflow, capture a passing screenshot, and visually inspect
  target alignment and selected-point placement.
