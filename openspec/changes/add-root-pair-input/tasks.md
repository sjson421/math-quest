## 1. Exact Root-Pair Model

- [x] 1.1 Add the shared exact root-pair value and pure private-entry codec, with focused tests for empty state, raw two-slot round trips, rational normalization, reversed order, and repeated values.
- [x] 1.2 Extend answer checking so root pairs compare as exact unordered two-value collections and incomplete or malformed pairs are unparseable, with independent checker and submit-policy tests.
- [x] 1.3 Couple root-pair answers to root-pair input during generation and extend central misconception filtering and diagnosis, with focused tests for answer collisions, reversed duplicates, equivalent fractions, repeated-root mistakes, malformed authored pairs, pairs on the wrong input surface, and invalid learner entries.

## 2. Two-Slot Lesson Input

- [x] 2.1 Share numeric entry echo rendering and add an optional complete-pair Check readiness override to the existing keypad, preserving all single-value behavior in component and keypad tests.
- [x] 2.2 Add the root-pair input surface and pure slot-update/readiness helpers, with two labelled selectable slots, one active state, one numeric keypad, exact per-problem key rules, and static first-paint tests for complete and incomplete pairs.
- [x] 2.3 Route root-pair input exhaustively through the lesson and visible-entry policy, suppress the private tuple from generic problem displays, and add lesson fixtures proving no fallback control or duplicate answer surface appears.

## 3. Exhaustive Gates and Capability State

- [x] 3.1 Extend recorded output, answer-value reporting, learner-text collection, and independent-verification tripwires to name root-pair answers and input semantically, with synthetic tests that fail on missing content-specific source data.
- [x] 3.2 Add `root-pair-input` to the capability type, Stage F requirements, and available capabilities together; replace the obsolete 145-skill Stage F capability requirement with its current successor, and update coverage tests to prove all 165 current skills remain playable and the three Unit 18b skills remain planned.
- [x] 3.3 Update `AGENTS.md`, `docs/curriculum.md`, and `docs/roadmap.md` to state current planned-skill and available-capability facts, record the built root-pair capability, insert an `18b prerequisite`, change item 23 to eight changes, retain the unchecked item, and pass the manifest/document cross-check.

## 4. Verification

- [x] 4.1 Run the focused library, component, lesson, manifest, coverage, recorded-output, and generator test files changed by the implementation; fix every new failure.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; require green tests and build, with only the three documented pre-existing `Settings.tsx` lint warnings.
- [x] 4.3 Temporarily mount a synthetic root-pair problem in the real app, then follow `docs/environment.md` in scripted Chromium at 375 pixels: select and revise both slots, enter a signed fraction pair, confirm once, observe feedback, assert no overflow, capture one passing screenshot, and inspect it visually. Remove the fixture, rerun the build, stop any server started for the check, and confirm its port is free before completing the task.
