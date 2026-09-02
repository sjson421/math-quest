## Why

The reversible skip mutation exists, but learners cannot reach it and there is no check that
can test a whole stage or unit without changing practice progress. Roadmap increment 28b now
adds both optional entry points and reuses the mixed-skill lesson surface shipped in 27b.

## What Changes

- Offer a first-launch, stage-by-stage starting-point flow and a small "I already know this"
  affordance on any locked or unstarted unit. Both open the same two optional routes: the
  suggested check first, or a direct self-assessed skip.
- Sample exactly eight problems across the selected playable stage or unit at fixed difficulty
  3. Seven or eight correct answers mark the block `tested-out`; fewer correct answers leave
  progress unchanged and offer the learner's first unmastered unit with neutral copy.
- Keep check answers session-local. They do not count as practice or review attempts, change
  mastery or recall, unlock individual skills, award rewards, or re-queue misses. Unfinished
  entries remain on the same problem and do not consume one of the eight results.
- Use the existing reversible block mutation for both successful routes: a passed check marks
  `tested-out`, while "Just skip it" marks `self-assessed`. A marked unit offers "Actually, let
  me practice this" and uses the shipped reversal.
- Persist only whether the fresh-start offer was dismissed or completed. A legacy record with
  prior learning evidence does not receive first-launch onboarding; an otherwise untouched legacy
  record remains eligible for the offer.
- Treat this as course-wide skip and lesson infrastructure. Curriculum stages, units,
  generators, and exact skill ids in scope: none. No new rendering, input, or manifest
  capability is required.

## Non-goals

- No low-strength review entry, accuracy-based warm-up offer, or downstream prerequisite
  diagnosis; roadmap increment 28c owns the safety net.
- No generator, problem content, prerequisite, mastery threshold, review schedule, lesson
  reward, checkpoint, pin, streak, or sync protocol change.
- No recorded assessment history, resumable interrupted check, timed behavior, score estimate,
  or Stage H content.
- No change to the normal course-tree opening level after the optional fresh-start offer is
  dismissed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skip-ahead`: Add the two learner-facing routes, fixed eight-problem check, pass/fail outcome,
  first-launch stage flow, unit affordance, and reachable reversal.

## Impact

- Pure skip policy and fixed check-session behavior under `src/lib/`, with focused tests.
- Shared lesson rendering and check result surfaces under `src/components/`.
- Course-tree entry controls and screen routing in `Home` and `App`.
- One additive presentation field and dismissal action in the Zustand progress record; existing
  IndexedDB reconciliation and opaque background sync carry it without an endpoint change or
  schema-version bump.
- No package, API, manifest, curriculum document, capability switch, or generator change.
