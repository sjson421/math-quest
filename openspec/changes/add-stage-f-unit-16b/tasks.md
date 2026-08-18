## 1. Structured operations and independent verification

- [x] 1.1 Add the four Unit 16b coordinate-operation records and render conventional
  slope-intercept equation context from their structured coefficients.
- [x] 1.2 Handle all four operations exhaustively in recorded output, learner-text collection,
  difficulty-source reporting, and the global independent verifier.
- [x] 1.3 Add focused context and synthetic verifier tests that prove equation formatting,
  visible line agreement, exact answer derivation, candidate choice mapping, and named failures.

## 2. Unit 16b generators and focused tests

- [x] 2.1 Implement `slope-intercept` with finite integer-slope draws, alternating coefficient
  questions, an exact keypad answer, and the other coefficient as a collision-free prediction.
- [x] 2.2 Add independent `slope-intercept` tests for equation/line agreement, both requested
  properties, prediction survival, difficulty, input rules, and variety.
- [x] 2.3 Implement `graph-from-equation` with one two-line plane, randomized matching-line
  identity, ordinary solid/dashed text choices, and one specific wrong-line diagnosis.
- [x] 2.4 Add independent `graph-from-equation` tests for exact candidate relationships, both
  correct identities and button positions, line-style/choice mapping, diagnosis, difficulty,
  and variety.
- [x] 2.5 Implement `equation-from-graph` with an integer-slope plotted line and an expanded
  right-side expression answer in `x` through existing expression input.
- [x] 2.6 Add independent `equation-from-graph` tests for slope/intercept derivation, visible
  line agreement, algebraically equivalent answers, grammar bounds, difficulty, and variety.
- [x] 2.7 Implement `parallel-perpendicular` from a separate finite rational-slope candidate
  set with both relationships, exact answers, collision-free predictions, and reachable keys.
- [x] 2.8 Add independent `parallel-perpendicular` tests for rational reference slopes, negative
  reciprocals, both relationships, prediction survival, keypad reachability, difficulty, and
  variety.

## 3. Integration and repository gates

- [x] 3.1 Register the four generators in manifest order, update implemented-state and playable-
  count expectations, mark Unit 16's four curriculum rows complete, and record roadmap 16b as
  shipped while leaving item 23 unchecked.
- [x] 3.2 Record representative output for all four skills and review every snapshot for adult
  tone, equation notation, line/choice agreement, solution correctness, and predictions.
- [x] 3.3 Run the focused Unit 16, coordinate context, coordinate-plane component, global
  verifier, content-rule, recorded-output, coverage, and curriculum-document suites.
- [x] 3.4 Run `npm test`, `npm run build`, and `npm run lint`; accept only the three documented
  pre-existing `Settings.tsx` lint warnings.
  - Verification note: the complete Vitest suite, build, and lint pass. `npm test` reaches only
    the recorded pre-existing model-routing edits in the two protected roadmap-workflow files;
    the validator passes against their baseline versions, and no implementation test fails.

## 4. Real-app validation

- [x] 4.1 Start the app only if needed, seed prerequisite progress in disposable IndexedDB,
  and use a scratch Playwright script with shared Chromium at 375 pixels to select the matching
  solid/dashed line for one equation and submit one equation-from-graph expression; assert no
  overflow and correct feedback, capture and visually inspect one passing screenshot, clear
  disposable state, and stop any server started for the check.
