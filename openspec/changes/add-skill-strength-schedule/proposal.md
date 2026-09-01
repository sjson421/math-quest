## Why

Math Quest records mastery and aggregate answer history, but it cannot tell when a practised
skill should return or how strong the learner's recall is. Roadmap increment 27a must establish
that durable, migration-safe foundation before review lessons, skip-ahead safety, or review
surfaces can use it.

## What Changes

- Add per-skill recall strength, next-review date, and review-attempt count to progress.
- Add a pure, deterministic scheduler that starts or refreshes a schedule after a completed
  standard lesson and updates it from later review results.
- Define when a scheduled skill is due using the learner's local calendar day.
- Give records that predate review fields stable read-time defaults without rewriting stored
  skill objects or losing unknown data.
- Keep review state inside the existing local-first progress blob so normal persistence and
  background sync carry it without changing the server endpoint.

This is course-wide learning infrastructure. No curriculum stage, unit, generator, or skill id
changes are in scope; exact skill ids: none. No rendering or input capability is required.

## Capabilities

### New Capabilities

- `review-scheduling`: Per-skill recall state, due-date rules, schedule transitions, and
  compatibility behavior for legacy progress records.

### Modified Capabilities

- None.

## Non-goals

- Building a multi-skill review lesson or changing the current single-skill lesson queue (27b).
- Adding the due-review entry point, skill-tree strength display, or mistake insight surface
  (27c).
- Implementing skip-ahead, tested-out progress, or its low-strength safety net (item 28).
- Changing mastery, unlocking, lesson length, rewards, misconception counts, or the progress
  endpoint.

## Impact

- Affected areas: pure helpers under `src/lib/`, `SkillProgress` and lesson completion in
  `src/store/progress.ts`, and their focused tests.
- Stored progress gains optional per-skill fields. Existing and restored legacy blobs remain
  valid and retain unknown fields.
- Sync keeps using the existing opaque JSON document and monotonic `updatedAt` behavior.
- No new runtime dependency, public API, curriculum capability, or application screen.
