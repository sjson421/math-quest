## Why

Review scheduling now says when each skill should return, but the lesson queue can generate
problems for only one skill. Roadmap increment 27b must add one reusable mixed-skill session
before review entry, skip-ahead checks, or Stage H mixed practice can use it.

## What Changes

- Generalize lesson queue slots so each lazy slot retains its own skill and base difficulty,
  while standard single-skill lessons keep their current length and behavior.
- Select at most ten playable due skills for one review lesson, prioritizing the oldest due
  dates and using curriculum order to break ties.
- Run selected skills through the existing warm-up, silent recovery, answer feedback, and exact
  retry behavior without eagerly generating later problems.
- Record each review answer against its slot's skill in one local progress mutation, updating
  that skill's aggregate accuracy and review state plus the progress-level misconception-tag
  count for a diagnosed miss, without changing mastery or unlocks.
- Complete a review lesson with the existing repeat-lesson XP, coin, daily-goal, and streak
  treatment once for the whole session.
- Treat this as course-wide lesson/review infrastructure; exact skill ids: none. Add no new
  rendering, input, manifest, or curriculum capability, and change no curriculum stage, unit,
  generator, or skill id.

## Non-goals

- No Home review entry point, skill-tree strength display, or recurring-mistake insight; roadmap
  increment 27c owns those surfaces.
- No skip-ahead selection or safety-net behavior from item 28.
- No Stage H generator, mixed-review content, timer, or score estimate.
- No change to standard lesson mastery, quick flags, intros, rewards, checkpoints, pins, or
  generated problem content.
- No progress schema version, sync protocol, endpoint, or dependency change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `review-scheduling`: Add bounded due-skill selection, per-answer review persistence, and
  review-lesson completion behavior.
- `skill-progression`: Extend the existing lazy queue, difficulty, recovery, and exact-retry
  requirements to ordered mixed-skill slots while preserving standard lessons.

## Impact

- Pure session and review policy under `src/lib/`, with focused tests.
- Shared lesson rendering in `src/components/Lesson.tsx`, plus first-paint coverage for review.
- Zustand progress actions and tests in `src/store/progress.ts` and
  `src/store/progress.test.ts`.
- Existing local IndexedDB and background sync carry the unchanged progress document format.
- No new package, API, manifest, curriculum document, or generator.
