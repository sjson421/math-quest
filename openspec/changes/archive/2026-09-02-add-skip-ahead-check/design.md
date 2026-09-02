## Context

See `proposal.md` for motivation and `specs/skip-ahead/spec.md` for behavior.

The reusable pieces already exist, but their boundaries matter:

- `src/lib/skip.ts` resolves a stage or unit through the derived playable course tree and owns
  the pure `markKnown` and `unmark` mutations. The progress store imports that module, so it may
  import only progress types back from the store without creating a runtime cycle.
- `src/lib/lesson.ts` owns lazy mixed-skill slots, adaptive difficulty, and exact retries.
  `src/components/Lesson.tsx` owns every answer surface and now drives both standard and review
  practice through one discriminated loop.
- A stored attempt makes an implemented skill permanently unlocked before prerequisites are
  checked. A check answer therefore cannot use either ordinary attempt action without turning a
  failed assessment into unlock evidence.
- Component tests render first paint in Node and attach no handlers. Selection, eligibility,
  scoring, and state changes behind taps need pure functions with focused tests.
- `currentUnitId()` already gives the first course-frontier unit. A second definition of
  "unmastered" would drift from navigation.

## Goals / Non-Goals

**Goals:**

- Keep one playable-block authority, one problem renderer, and one answer-comparison path.
- Make eight-slot selection and seven-correct scoring deterministic under a supplied seed and
  testable without a DOM.
- Keep assessment evidence transient until one existing block mark records a successful result.
- Preserve standard lesson and review behavior without weakening their warm-up, recovery, retry,
  reward, or persistence contracts.
- Keep first-launch presentation compatible with old, restored, and remotely adopted progress.

**Non-Goals:**

- Turning lesson sessions into a configurable workflow framework.
- Persisting a selected skill snapshot, partial score, or interrupted assessment.
- Generalizing this check policy for Stage H timed work before that consumer exists.
- Adding any review safety-net behavior from 28c.

## Decisions

### 1. Extend the existing pure skip policy, not the course tree or components

Expose the playable skills already resolved inside `src/lib/skip.ts` and add pure readers for:

- whether a block carries any tested-out or self-assessed skill;
- whether a unit is eligible because it is wholly locked or wholly unstarted;
- the next first-launch stage in manifest order;
- one seeded eight-generator check snapshot; and
- the seven-of-eight outcome.

The selector accepts an RNG rather than calling `Math.random()` internally. It shuffles one
playable block snapshot and takes without replacement; when fewer than eight skills exist, it
starts another shuffled pass only after the current pass has included every skill. The component
creates one seed when the route starts and retains the returned generators for the session.
Problems still receive their own seeded generation stream through the existing problem factory.

Eligibility accepts the existing unlock decision from its caller rather than importing the
store's `isUnlocked` value. This keeps the current type-only store dependency and avoids the
`progress store -> skip policy -> progress store` runtime cycle.

Alternative considered: select from manifest ids in `App` or `Home`. Rejected because block
membership and sampling would then have UI owners beside the block mutation's course-tree owner.

Alternative considered: choose each slot independently with replacement. Rejected because a
three-skill unit could repeat one skill before showing another, which is not a check across the
block.

### 2. Add a narrow fixed check session beside practice sessions

Keep `LessonSession` semantics unchanged: standard and review practice still warm up, recover,
re-queue misses, and complete only when every original slot is correct.

Add a small `CheckSession` in `src/lib/lesson.ts` that reuses `LessonSource`, `LessonSlot`, the
problem factory, and lazy current-slot materialization. It owns only an answered count, a correct
count, and its remaining fixed sources. Every source is generated at difficulty 3. Advancing a
recorded correct or incorrect answer removes that slot once, increments the answered count, and
materializes the next slot at the same difficulty. It completes after eight recorded results.
An unrecorded response never advances it.

This shares the mechanism 27b built without changing practice policy to fit assessment policy.

Alternative considered: add completion, retry, pacing, and difficulty configuration flags to
`LessonSession`. Rejected because two concrete policies do not justify a public session framework,
and invalid flag combinations could silently weaken standard lessons.

Alternative considered: build a second assessment queue and problem component. Rejected because
it would duplicate lazy generation, six answer controls, answer comparison, diagnostic feedback,
and submission gating.

### 3. Add a third discriminated mode to the shared lesson surface

Export a `SkipCheckLesson` wrapper from `src/components/Lesson.tsx` beside `Lesson` and
`ReviewLesson`. Its mode receives the fixed generator snapshot and completion callback. The
shared loop continues to own problem generation, answer controls, answer comparison, feedback,
solution display, submission gating, and responsive layout.

Mode-specific behavior stays explicit:

- standard records ordinary attempts and completes one skill lesson;
- review records review attempts and completes one review lesson;
- skip check records no store attempt, hides the pre-answer hint and intro affordance, advances
  its `CheckSession` after either recorded result, and reports only the final correct count.

Wrong-form entries keep the existing recorded-incorrect policy and consume one check result after
their feedback; only unfinished entries keep the existing no-attempt policy and remain on the
current problem. An incorrect value may show the existing diagnostic and solution before its
action advances to the next original slot; it is never re-queued. Leaving unmounts the transient
session without a write.

Alternative considered: route check answers through `recordAttempt` and undo them after failure.
Rejected because each write would permanently unlock the presented skill immediately, sync
intermediate evidence, and make rollback vulnerable to interruption.

### 4. Route both entry points through one choice and result surface

Add skip screens to `App`'s existing `Screen` union. Each carries the selected block, its exact
back tree level, and whether it belongs to the fresh-start sequence or a unit affordance. A
dedicated choice surface shows "Check first", "Just skip it", and a back/start-practice action.
Starting a check resolves and freezes its generator snapshot before mounting `SkipCheckLesson`.

The first-launch card is additive to the normal Home skill level: `openingLevel()` still resolves
the learner's current unit. The card offers the current earliest stage in the sequence. A passed
or direct stage skip returns with the Home screen unpinned, so the existing frontier recalculates
and the card can offer the next stage. Choosing normal practice ends the sequence. Starting an
ordinary lesson from the card's underlying tree also ends it.

An eligible unit's skill-level screen opens the same choice surface for that unit. A marked unit
shows the reversal action instead; the shipped `unmarkBlock` action remains its only mutation.

A passing check calls `markBlockKnown(blockId, 'tested-out')` once. Direct skip calls
`markBlockKnown(blockId, 'self-assessed')` once. A failing check calls neither; it obtains the
existing `currentUnitId(course, progress)` result and offers that destination with neutral copy.
No completion outcome or achievement component is reused because a skip is not an achievement.

Alternative considered: make a selected later stage mark every earlier stage too. Rejected
because one skip is defined as one stage or unit block mutation, and silently widening it would
grant mastery outside the assessed block.

Alternative considered: replace the normal first screen with a separate onboarding tree.
Rejected because the current-unit opening rule remains useful and the additive card can offer
the same optional sequence without a second navigation hierarchy.

### 5. Persist one presentation flag with a legacy-aware default

Add `skipOfferSeen` to `Progress` and seed it as `false` for a new record. One idempotent store
action sets it to `true` through the existing `persist()` path when the learner starts normal
practice, dismisses the offer, or finishes the sequence. Marks made while the learner continues
stage-by-stage preserve explicit `false`, so a refresh can resume at the next unmarked stage.

`reconcile()` handles an absent legacy field deliberately. It defaults to `true` when the stored
record has any existing learning evidence or a positive version timestamp, and to `false` only
for an otherwise untouched record. An explicit stored boolean always wins. The whole stored
record and each whole stored skill continue to spread over defaults, preserving unknown fields.

No schema-version or endpoint change is needed. The existing background subscriber syncs the
top-level field opaquely. An older client ignores and preserves it through the top-level record
spread, so rollback does not damage progress.

Alternative considered: keep dismissal only in React state or `localStorage`. Rejected because a
reload would repeat first-launch onboarding, and a learner's synced progress already provides
the correct cross-device compatibility boundary.

Alternative considered: infer dismissal forever from `updatedAt`. Rejected because the first
stage mark advances that timestamp while the learner may still be moving through the optional
stage sequence; an explicit `false` must survive those writes.

## Risks / Trade-offs

- **Shared-loop changes regress standard or review practice.** → Keep their wrappers and pure
  `LessonSession` unchanged; add check-specific branches only at source construction, recording,
  advancing, hint visibility, and completion. Run focused, full, and real-app regression gates.
- **Random selection makes tests or an active check unstable.** → Supply a seeded RNG to the pure
  selector and freeze the selected generator array once when the route starts.
- **A legacy learner sees onboarding after updating.** → Default an absent flag to seen whenever
  the stored record contains a version timestamp or learning evidence, and cover old local and
  remote shapes in store tests.
- **A check accidentally grants unlock evidence.** → Never call either attempt action in check
  mode; assert unchanged skill objects, progress version, rewards, and unlock results after
  partial, failed, and abandoned checks.
- **A direct or passed skip moves the computed frontier while a stale screen remains pinned.** →
  Carry explicit back context for unit flows and deliberately clear the screen for the
  first-launch sequence so `openingLevel()` recomputes from the persisted block mark.
- **The check can sample a broad stage unevenly.** → Selection is uniform without replacement,
  but eight slots cannot cover a stage larger than eight skills. This is the roadmap's fixed
  assessment size; problem generation still varies within each selected skill.

## Migration Plan

1. Add and prove pure block-state, eligibility, seeded selection, scoring, and fixed check-session
   behavior without changing any caller.
2. Add the compatibility-safe presentation field and store action, including legacy, restore,
   remote-adoption, versioning, and unknown-field tests.
3. Extend the shared lesson surface with check mode and prove first paint plus every session
   transition while standard and review tests stay unchanged.
4. Add choice, result, first-launch, unit, reversal, and routing surfaces.
5. Run focused tests, full tests, build, lint, strict OpenSpec validation, and scripted Chromium
   validation at 375 px for direct skip, pass, fail, reversal, and ordinary lesson regression.

Rollback removes the new routes, check mode, policy readers, and store action. Stored
`skipOfferSeen` values remain harmless unknown top-level data that older code preserves. Any
tested-out or self-assessed skills written before rollback remain valid under the already-shipped
28a contract and can still be reversed by a newer client later.
