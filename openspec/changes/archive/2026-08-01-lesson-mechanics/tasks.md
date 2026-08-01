## 1. Lesson Policy

- [x] 1.1 Add synthetic tests for standard and quick targets, warm-up and recovery difficulty
  clamping, recorded-miss streaks, correct-answer resets, and unrecorded entries.
- [x] 1.2 Implement the pure lesson target, difficulty, and sticky recovery policy under
  `src/lib/` until the policy tests pass.

## 2. Lazy Retry Queue

- [x] 2.1 Add synthetic queue tests proving unseen slots are generated only when current,
  misses return up to three positions later with a near-end clamp, multiple misses keep their
  order, and retries preserve the original problem object.
- [x] 2.2 Implement lazy queue transitions over the remaining correct-answer slots until the
  queue tests pass.

## 3. Lesson Integration

- [x] 3.1 Add a pure session integration test that drives recorded submissions through three
  consecutive misses, proves the next unseen problem uses recovery difficulty, preserves a
  pre-recovery retry unchanged, and refuses completion while a retry remains.
- [x] 3.2 Extend first-paint component tests to prove manifest `quick` metadata selects 5,
  non-quick and unknown ids select 10, and the opening problem uses clamped warm-up difficulty.
- [x] 3.3 Refactor `Lesson` to read manifest pacing and delegate submission, generation, retry,
  and completion decisions to the tested pure session transitions.

## 4. Documentation and Automated Verification

- [x] 4.1 Run the closest policy and component tests, then the full test, build, lint, and
  strict OpenSpec validation gates; resolve every in-scope failure.
- [x] 4.2 Mark roadmap item 4 shipped and update repository status or invariant text made stale
  by the completed mechanics, without changing curriculum commitments.

## 5. Browser Exercise

- [x] 5.1 Drive the real app in the browser: start implemented quick and standard lessons,
  verify their 5/10 targets and opening flow, and exercise three consecutive misses followed
  by continued play without learner-visible recovery messaging.

  Verified with Playwright against the Vite app on 2026-08-01: `Small Sums` opened at 0/5,
  `Addition Facts` opened at 0/10, and three misses were followed by an unannounced next
  problem whose correct answer advanced the quick lesson to 1/5. The temporary IndexedDB
  prerequisite override was deleted after the exercise.
