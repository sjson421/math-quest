## Context

See `proposal.md` for motivation and the two delta specs for behavior.

`lib/lesson.ts` currently stores one `baseDifficulty` and a queue of `Problem | null`. Its
problem factory accepts only a difficulty, so every null slot implicitly belongs to the skill
closed over by `Lesson.tsx`. The component also closes attempt recording, intros, and completion
over that one skill. This correctly owns standard lesson pacing, but it cannot preserve a skill
identity for an unseen mixed-session slot.

The shipped review foundation already normalizes legacy review fields, determines due state,
and produces the next review state from one result. The progress store already records attempts
by skill id and routes every local mutation through one persistence helper. Review therefore
needs no new progress fields, migration, sync call, endpoint behavior, input mode, or generator.

Component tests render first paint without a DOM. Tap-driven sequencing, lazy generation, and
completion policy must remain pure where Node tests can drive them. Scripted Chromium remains
the final check for the standard lesson surface affected by the shared-loop refactor.

## Goals / Non-Goals

**Goals:**

- Make skill identity and base difficulty explicit per queue slot.
- Keep one owner for lazy generation, warm-up, recovery, retries, answer controls, and feedback.
- Select a deterministic, bounded snapshot of due skills without storing session state.
- Persist each review result atomically against its own skill.
- Reuse the existing repeat-lesson economy and streak transition once per completed review.
- Leave standard lesson output and progression behavior unchanged.

**Non-Goals:**

- Generalizing the queue into a configurable workflow or public session framework.
- Persisting or restoring an interrupted queue.
- Adding a visible route to review before roadmap increment 27c.
- Adding selection policies for check-first or Stage H before those consumers exist.
- Changing scheduler intervals, mastery-derived difficulty, reward rates, or generated content.

## Decisions

### 1. Replace implicit null positions with explicit lazy slots

Add a small lesson source carrying a `SkillGenerator` and its base difficulty. A queue slot
carries that source plus either its generated `Problem` or `null`. The generalized session
constructor accepts a non-empty ordered source list; the standard constructor repeats one
source for the manifest-selected target.

The problem factory widens from `(difficulty) => Problem` to `(skill, difficulty) => Problem`.
Materializing the current slot reads that slot's source. The opening slot applies the existing
warm-up to its own base, later slots apply the existing session recovery state to their own
bases, and a miss moves the whole populated slot. This preserves the exact problem, skill,
difficulty, and seed result on retry.

Keep `correctCount`, `targetCorrect`, and one `LessonPacing` on the session. The target is the
original source count; inserted retries do not raise it. Recovery remains a property of the
learning session rather than resetting at each skill boundary.

Alternative considered: store only a skill id and resolve the generator whenever a slot becomes
current. Rejected because the selected source list already holds immutable registered
generators, and repeated registry lookup would split ownership between the queue and component.

Alternative considered: eagerly generate every selected problem. Rejected because recovery
changes only later unseen problems, and the lesson invariant requires that adaptation to stay
lazy.

Alternative considered: add a second review queue. Rejected because it would duplicate the
warm-up, recovery, exact-retry, and completion gates that future check-first and Stage H also
need.

### 2. Select due work as a pure snapshot over ordered candidates

Add a pure selector beside the review scheduler. It accepts manifest-derived implemented
candidate generators in curriculum order, their skill records, and a local day. It normalizes
each record with the existing review reader, keeps only candidates due that day, sorts by
next-review date, relies on the input order for equal-date stability, and takes the first ten.
The fixed limit is exported once as review policy, not exposed as user configuration.

Each due skill contributes one source. If fewer than ten are due, the lesson is shorter; filling
the queue with not-due skills or duplicate attempts would contradict the per-skill schedule. The
selected list is evaluated once before the session begins. Answer writes do not reorder or
remove later slots.

The selector accepts ordered candidates rather than importing the curriculum registry. This
keeps date and ordering policy pure while leaving the manifest-derived implemented list as the
only runtime authority at the caller.

Alternative considered: shuffle due skills. Rejected because a backlog needs a fair,
deterministic drain and the oldest date is the only urgency signal the scheduler stores.

Alternative considered: persist the chosen ids. Rejected because the queue is transient,
answer evidence already persists immediately, and restoring an interrupted session would add a
new data lifecycle outside this increment.

### 3. Share one practice loop behind standard and review wrappers

Keep `Lesson` as the standard public wrapper so `App` and its lazy import do not change. Extract
the current answer surface and transition code into one internal practice loop driven by a
discriminated standard or review configuration. Add an exported `ReviewLesson` wrapper that
accepts the selected generators for increment 27c to mount later.

Standard configuration retains automatic first-time intros, the current manual intro action,
manifest quick length, mastery completion, checkpoint/pin/streak sequence, and exit destination.
Review configuration starts directly in practice, reads the current slot's skill for generation
and attempt recording, and renders a review-specific completion heading without a skill level.
Both modes reuse every answer control and feedback path.

Review remains intentionally unmounted from `App` in this increment. Pure session tests cover
all transitions, store tests cover every write, and server-rendered component tests cover review
first paint and completion markup. Browser validation exercises a standard lesson at 375 px to
catch shared-loop layout or navigation regressions and confirms no premature review entry appears
on Home.

Alternative considered: add a temporary URL or hidden Home control for review validation.
Rejected because it would create a product or maintenance surface owned by increment 27c solely
to exercise code that pure and server-rendered tests can reach now.

### 4. Record each review result in one store mutation

Add `recordReviewAttempt(skillId, correct, misconceptionTag?)`. Factor the existing aggregate
attempt and progress-level misconception-tag update so standard and review actions share it. The
review action reads the current whole skill object, normalizes its review state, applies one
correct or incorrect review transition for today's local day, and merges the skill's aggregate
counts and review fields plus any `progress.mistakes` tag count before calling `persist()` once.

The whole skill is spread into the replacement. Mastery, `lastPracticed`, intro state, and
unknown fields remain unchanged. The one `persist()` call strictly advances `updatedAt`, writes
IndexedDB, and lets the existing subscriber schedule sync. An entry whose submit policy records
nothing never calls either attempt action.

Every recorded retry is a new result. This matches aggregate accuracy, the shipped scheduler's
one-result API, and item 28's later safety-net denominator. A miss can lower strength and its
correct retry can raise it again; both remain visible in attempts and review attempts.

Alternative considered: update recall only when the whole review completes. Rejected because
leaving midway would lose real learning evidence and require retaining a second results buffer.

Alternative considered: call `recordAttempt()` and then persist review state separately.
Rejected because two writes could sync an aggregate attempt without its schedule and would
advance the conflict version twice for one answer.

### 5. Complete review through the existing repeat-lesson reward policy

Extract the common XP, coin, daily-goal, streak, and streak-milestone transition currently inside
`completeLesson()`. Standard completion applies it and then keeps its current mastery,
checkpoint, and pin work. A new `completeReviewLesson()` applies the same transition with the
non-level-up base coin rate, returns a normal lesson outcome with `leveledUp: false`, and performs
no skill mutation, checkpoint, or pin calculation.

Review pays once when the queue completes, regardless of how many one-per-skill slots were due.
This matches the existing fixed completion payout for five-problem quick lessons and ten-problem
standard lessons. It is not farmable through the due selector: every recorded slot is
rescheduled before the lesson can be offered again. Strength never affects payout.

Alternative considered: prorate rewards by due-skill count. Rejected because it adds a new
economy policy without repository precedent and makes a legitimate one-skill review worth less
than another completed lesson.

Alternative considered: award nothing for review. Rejected because review is learner work and
the existing product contract treats completed lessons as daily-goal, streak, XP, and coin work.

## Risks / Trade-offs

- **Shared-loop extraction can regress standard lessons.** Keep the standard wrapper API and
  first-time intro path unchanged; pin queue policy in pure tests, first paint in component tests,
  and the real standard flow in Chromium.
- **A large legacy backlog can take many review lessons to drain.** Oldest-first selection and
  immediate rescheduling ensure each completed lesson exposes the next ten rather than starving
  them randomly.
- **A short due set receives a full repeat reward.** Due skills cannot be replayed immediately,
  and fixed payout already spans quick and standard lesson lengths.
- **A learner can leave after a miss that has already rescheduled.** This follows the shipped
  rule that every incorrect review result schedules the next return; the lower strength keeps
  its interval short, while the recorded evidence is not lost.
- **Review UI is not reachable from Home until 27c.** Keep all behavior callable through pure,
  store, and server-rendered tests; browser-check only the shared standard path and deferred-entry
  boundary in this increment.
- **Optional review fields can be read unsafely.** Route selection and result updates through the
  existing normalization helper; never branch directly on stored optional fields.

## Migration Plan

1. Generalize the pure lesson queue and prove standard and mixed behavior with focused tests.
2. Add deterministic due selection and its edge-case coverage beside the shipped scheduler.
3. Add the atomic review-attempt and shared completion transitions with store compatibility,
   versioning, reward, and streak tests.
4. Extract the shared practice loop, add review first-paint/completion coverage, and keep the
   standard `Lesson` wrapper wired as before.
5. Run focused tests, full tests, build, lint, strict OpenSpec validation, and scripted 375 px
   browser validation of the standard lesson and absent Home review entry.

No data rewrite, schema-version bump, sync change, or deployment ordering is required. Rollback
removes the unused review wrapper and selectors; review fields and any results recorded by a
newer client remain valid under the already-shipped 27a normalization and opaque-sync contract.
