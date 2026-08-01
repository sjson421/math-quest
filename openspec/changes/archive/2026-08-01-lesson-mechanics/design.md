## Context

See `proposal.md` for motivation and `specs/skill-progression/spec.md` for the behavior
contract. `Lesson.tsx` currently computes one mastery-derived difficulty, generates ten
`Problem` objects during its initial render, and uses that concrete array both as the source
of the current problem and as the retry queue. Component tests use server rendering and
cannot attach handlers, so interaction policy needs a pure boundary under `src/lib/`.

The curriculum manifest already owns the `quick` flag. The generator registry deliberately
does not repeat manifest metadata, and that boundary must remain intact. No generator changes
are involved, so there are no new or changed misconception predictions, including for wall
skills.

## Goals / Non-Goals

**Goals:**

- Keep manifest pacing metadata authoritative without widening `SkillGenerator`.
- Generate only the current unseen problem while preserving an exact missed problem for a
  later retry.
- Express difficulty and consecutive-miss policy as pure functions with synthetic offender
  cases.
- Preserve the existing first-paint, submission, diagnosis, reward, and progress boundaries.

**Non-Goals:**

- Persist lesson-local queue or recovery state across a reload.
- Change generated problem content or retroactively lower a re-queued problem's difficulty.
- Expose lesson difficulty or recovery state in the UI.

## Decisions

### Read `quick` directly from the manifest lookup

`Lesson` will use the selected generator id to read `skillById` from the manifest and pass
the entry's boolean into a pure target function. Unknown synthetic ids default to the
standard target, which keeps component fixtures useful without creating a second manifest.

Adding `quick` to `SkillGenerator` was rejected because it would duplicate curriculum
metadata across the manifest and generator registry. Passing a target from `Home` was also
rejected because it would make every caller responsible for preserving the pacing rule.

### Represent remaining correct answers as lazy queue slots

Each queue position will represent one correct answer still required. The current position is
a concrete `Problem`, later positions are either concrete missed problems awaiting a retry or
empty slots for unseen problems, and only the next current empty slot is materialized. A miss
is inserted at the lesser of three positions or the number of positions remaining, matching
the current near-end behavior without generating future problems early or creating work
beyond the 5/10-correct target.

A queue holding only one problem was rejected because it cannot place a missed problem three
positions back when those positions do exist. A fixed three-slot horizon was rejected because
it can put a late retry behind newly invented obligations and either bypass the retry at the
target or require more than the target number of correct answers. Generating a concrete
lookahead was rejected because recovery could make already-generated unseen problems stale.

### Keep lesson pacing in a pure state transition

A small lesson-policy module will own the correct target, difficulty selection, and a pacing
state containing consecutive recorded misses plus a sticky recovery flag. A correct recorded
attempt resets the consecutive count, an incorrect recorded attempt increments it and makes
recovery sticky at three, and an unrecorded unfinished entry leaves it unchanged.

The pure module will combine pacing, queue, correct count, and completion in session
transitions. Tests will drive recorded submission results through those transitions so the
recovery flag, next generated difficulty, retry obligations, and completion decision are
verified together. The component delegates these decisions and retains only feedback,
animation, entry, progress writes, and rewards.

Counting all rejected submissions was rejected because `unparseable` is explicitly not an
attempt. Allowing later correct answers to turn recovery off was rejected because the
curriculum says the drop lasts for the rest of the lesson.

### Difficulty changes apply only when a problem is generated

The warm-up uses `max(1, base - 1)`. Later new problems use base difficulty until recovery,
then the same one-band-lower rule. A missed problem keeps the exact `Problem` object and its
original `difficulty` when re-queued.

Regenerating a missed problem at lower difficulty was rejected because the learner would no
longer be required to answer every presented problem correctly. Mutating its difficulty field
was rejected because it would make metadata disagree with the operands already generated.

## Risks / Trade-offs

- [A retry queue containing lazy slots is less obvious than a concrete array] → Keep session
  transitions pure and exhaustively test ordering, materialization, late misses, and
  completion.
- [React strict rendering can call an initializer more than once in development] → Keep the
  session seed stable in a ref and treat each mount attempt as its own disposable session,
  matching current behavior.
- [Manifest lookup failure could shorten a synthetic or malformed skill unexpectedly] →
  Unknown ids default to 10; only an explicit manifest `quick` flag selects 5.
- [Recovery cannot make an already-presented hard problem easier] → Preserve exact retries as
  required and apply recovery to every newly generated problem for the rest of the lesson.

## Migration Plan

This is stateless lesson-local behavior, so deployment needs no data migration. Rollback is a
code rollback; stored progress and sync payloads are unchanged in either direction.
