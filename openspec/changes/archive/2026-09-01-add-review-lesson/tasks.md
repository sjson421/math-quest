## 1. Mixed lesson queue

- [x] 1.1 Generalize `src/lib/lesson.ts` around a non-empty ordered source list whose lazy
  slots retain their `SkillGenerator`, per-skill base difficulty, and generated problem; keep a
  standard constructor that repeats one source for the existing manifest-selected target.
- [x] 1.2 Extend `src/lib/lesson.test.ts` to prove per-slot generators and difficulties, one
  opening warm-up, session-wide recovery across skills, lazy materialization, exact populated-slot
  retries, completion only after every original slot is correct, and unchanged 5/10 standard
  lesson targets.

## 2. Due review selection

- [x] 2.1 Add pure review-lesson selection beside `src/lib/review.ts`: normalize ordered
  implemented candidates, keep one slot per due skill, order oldest dates first with stable
  curriculum-order ties, cap the result at ten, and retain every due skill when fewer than ten
  exist.
- [x] 2.2 Extend `src/lib/review.test.ts` for empty and small due sets, more-than-ten backlogs,
  equal-date order, future and unscheduled exclusions, legacy and malformed field normalization,
  no duplicates, no input mutation, and a selected snapshot that callers can hold stable while
  results reschedule skills.

## 3. Atomic review progress

- [x] 3.1 Factor the existing aggregate attempt and progress-level misconception update inside
  `src/store/progress.ts`, then add `recordReviewAttempt()` so one correct, incorrect, or retried
  answer updates only its slot skill's aggregate counts and normalized review schedule plus any
  matching progress-level `mistakes` tag count through one versioned persistence write without
  changing mastery, `lastPracticed`, intros, or unknown fields.
- [x] 3.2 Add store tests for correct, diagnosed incorrect, and repeated review results;
  non-attempt no-ops; strictly advancing `updatedAt`; one local write per answer; mastery and
  unlock preservation; unchanged XP, coins, daily-goal, and streak state; unknown-field
  retention; legacy normalization; and unchanged opaque sync shape after local, restored, and
  remotely adopted records.
- [x] 3.3 Extract the common completed-lesson reward and streak transition used by
  `completeLesson()`, add `completeReviewLesson()` with the repeat-lesson coin rate and no skill,
  checkpoint, or pin mutation, and keep standard completion outcomes byte-for-byte equivalent.
- [x] 3.4 Extend store and pure session/completion tests to prove review awards XP, multiplied
  repeat coins, daily-goal progress, streak credit, and any crossed streak milestone exactly once
  while preserving all mastery and unlock state; prove recall strength does not affect payout and
  an incomplete review keeps recorded answers but earns no completion reward; prove standard
  lesson rewards and milestone ordering remain unchanged.

## 4. Shared lesson surface

- [x] 4.1 Refactor `src/components/Lesson.tsx` behind one practice loop with discriminated
  standard and review wrappers. Keep `Lesson`'s existing public props and intro/completion path;
  add an exported `ReviewLesson` that starts directly from selected generators, records against
  the current slot, uses every existing answer control and feedback path, and renders review
  completion without a skill level.
- [x] 4.2 Extend first-paint component coverage for review progress, the first selected skill's
  problem and input mode, review completion copy and reward surface, and the unchanged standard
  lesson intro/practice surfaces. Keep tap-driven transitions in pure lesson and completion
  tests, as required by `docs/testing.md`.
- [x] 4.3 Record roadmap increment 27b as shipped while leaving roadmap item 27 and increment
  27c open. Do not add a Home review entry, alter curriculum status, change any skill id or
  generator, or change the playable count.

## 5. Verification

- [x] 5.1 Run the focused lesson, review, progress-store, checkpoint, and Lesson component test
  files and fix every in-scope failure.
- [x] 5.2 Run `openspec validate add-review-lesson --strict`, `npm test`, `npm run build`, and
  `npm run lint`; accept only explicitly documented pre-existing warnings.
- [x] 5.3 Follow `docs/environment.md` to drive the real app at 375 by 812 pixels: start and
  complete a standard lesson through at least two generated positions, verify mastery, review
  schedule, XP, coins, and streak still persist as before, confirm Home exposes no premature
  review entry, completion returns to the same unit, and Home has no overflow, capture and inspect
  one passing screenshot, then stop any temporary server.
