## 1. Shared calendar days

- [x] 1.1 Move local day-key creation and named-day arithmetic from `lib/streak.ts` into a
  shared `lib/calendar.ts`; add strict day validation and forward day addition, update imports,
  and preserve the progress store's existing `todayKey` export.
- [x] 1.2 Add focused calendar tests for local day naming, malformed dates, month and year
  rollover, leap day, and both daylight-saving boundaries; keep streak tests focused on
  unchanged streak behavior.

## 2. Review state and scheduler

- [x] 2.1 Add optional `strength`, `nextReview`, and `reviewAttempts` fields to `SkillProgress`,
  seed explicit defaults in new skill records, and implement pure review-state normalization,
  lesson scheduling, review-result scheduling, interval lookup, and due checks in
  `lib/review.ts`.
- [x] 2.2 Add focused review tests for new and legacy defaults, explicit low-strength overrides,
  malformed-field normalization, no input mutation, every interval, correct and incorrect
  transitions, bounds, attempt counting, and due/overdue/future decisions.

## 3. Progress integration and compatibility

- [x] 3.1 Integrate standard lesson scheduling into the existing `completeLesson()` transition
  so mastery, `lastPracticed`, and review fields persist in one versioned write without changing
  rewards, checkpoints, pins, streaks, unlocks, or review-attempt counts.
- [x] 3.2 Extend store tests to prove new-record defaults, exact lesson schedules, one local
  mutation, strictly advancing `updatedAt`, unchanged learning outcomes, repeated legacy reads,
  unknown-field preservation, file replacement, remote adoption, and rollback-compatible opaque
  skill objects.
- [x] 3.3 Record roadmap increment 27a as shipped while leaving roadmap item 27 and increments
  27b and 27c open; do not change curriculum status, skill ids, generators, or playable counts.

## 4. Verification

- [x] 4.1 Run the focused calendar, streak, review, and progress-store test files and fix every
  in-scope failure.
- [x] 4.2 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`; accept
  only explicitly documented pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to run the real app at 375 by 812 pixels, complete a
  standard lesson, verify its IndexedDB skill record holds the expected strength, next local-day
  review date, and zero review attempts, confirm Home still renders without overflow, capture and
  inspect one passing screenshot, and stop any temporary server.
