## Why

Review scheduling and mixed review lessons are built, but learners cannot start one from the
app or see their recall strength. Roadmap increment 27c must expose that shipped behavior while
retaining the recurring-mistake insight Settings already provides.

## What Changes

- Add one review entry to the common Home surface only while at least one implemented skill is
  due, and start the existing bounded, oldest-first review snapshot from it.
- Return from active review, or continue from its completion screen, to the same course-tree
  level where the learner started it.
- Show each playable skill's normalized recall strength on its skill-tree card, clearly separate
  from mastery.
- Keep the existing Settings “Things to watch” insight: show up to three most frequent diagnosed
  misconception tags with readable learner-facing labels, and show no empty insight card.
- Treat this as a course-wide product surface. No curriculum stage or unit changes; exact skill
  ids: none. No generator or manifest entry changes, and no input, rendering, or curriculum
  capability is added.

## Non-goals

- No scheduler interval, due-order, lesson queue, retry, reward, mastery, unlock, intro, streak,
  checkpoint, or pin change.
- No new progress field, schema version, migration, sync protocol, endpoint, or dependency.
- No future-review preview, reminder, manual review of not-due skills, per-skill mistake history,
  or new diagnostic interpretation.
- No skip-ahead behavior from item 28, Stage H mixed-review content, timed mode, or score estimate.
- No second review implementation or duplicate mistake-insight surface.

## Capabilities

### New Capabilities

- `learning-progress-reporting`: Report normalized recall strength per playable skill and the
  learner's highest-frequency diagnosed mistake patterns without inventing new stored state.

### Modified Capabilities

- `review-scheduling`: Make the existing bounded due-skill review lesson reachable through a
  due-only Home entry and define its return behavior.
- `skill-tree-navigation`: Allow skill cards to add separately labelled recall reporting while
  preserving lesson entry, locking, and mastery behavior.

## Impact

- App-level screen routing and lazy mounting in `src/App.tsx`.
- The common Home shell and focused first-paint coverage under `src/components/`.
- Skill-card recall reporting through the existing `readReviewState()` normalization path.
- Existing Settings insight receives an explicit requirement and regression coverage; its
  production behavior need not change.
- Existing IndexedDB persistence, background sync, progress document shape, server endpoint,
  curriculum registry, and generated content remain unchanged.
