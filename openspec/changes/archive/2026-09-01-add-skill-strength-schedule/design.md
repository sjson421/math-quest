## Context

See `proposal.md` for motivation and `specs/review-scheduling/spec.md` for the behavior
contract.

`SkillProgress` currently holds mastery, `lastPracticed`, aggregate attempts and correct
answers, plus the optional intro flag. `emptySkill()` supplies defaults for new records, but
`reconcile()` intentionally merges each stored skill object over the default skill map as one
object. It does not merge fields within a stored skill. That preserves unknown fields and the
opaque-sync contract, but a record saved before review fields existed will continue to lack
them after hydration, file restore, or remote adoption.

`completeLesson()` already owns the one persisted transition that raises mastery and sets
`lastPracticed`. Every local mutation passes through one persistence helper that advances
`updatedAt`; sync observes the store instead of being called by features. The endpoint stores
the progress JSON opaquely and understands only the version guard.

Calendar-day helpers currently live in `lib/streak.ts` because streaks were their only owner.
Review scheduling becomes a second user of the same local-day rules. Tests run without a DOM,
so scheduling and date decisions must remain pure under `lib/`.

## Goals / Non-Goals

**Goals:**

- Give every read of a skill one safe, deterministic review-state interpretation.
- Keep scheduling policy pure and independent of Zustand, IndexedDB, React, and the manifest.
- Persist a standard lesson's mastery and review schedule as one atomic progress mutation.
- Preserve old-client, old-record, file-restore, and remote-adoption compatibility without an
  eager migration or schema-version bump.
- Establish the scheduler API that increment 27b can call for each skill in a mixed review.

**Non-Goals:**

- Selecting due skills, ordering a review queue, or adding a store action for review answers.
- Decaying strength merely because time passed; strength changes only from learning evidence.
- Tuning intervals dynamically per learner or adding SM-2 ease factors.
- Rendering strength or due state anywhere.

## Decisions

### 1. Store optional fields and normalize them through one read helper

Extend `SkillProgress` with these optional persisted fields:

```ts
strength?: number
nextReview?: string | null
reviewAttempts?: number
```

They are optional because the runtime truth includes records written by earlier clients. New
records created by `emptySkill()` will write explicit defaults. A pure `readReviewState()`
helper in `lib/review.ts` will return a required, normalized `ReviewState` for every caller.
Code that makes review decisions must use this helper rather than reading optional fields
directly.

An explicit valid value wins, including `strength: 0` beside mastery 3 and
`nextReview: null`. That distinction is required by future skip-ahead behavior: a skipped skill
may deliberately carry low strength even though skip-ahead sets mastery 3. Only an absent or
malformed field takes the legacy path.

Legacy strength derives from mastery, clamped to 0 through 5. Legacy `nextReview` derives from
a valid `lastPracticed` day plus the interval for that strength; without a valid completed-
lesson day it remains unscheduled. Legacy review attempts read as zero. Finite numeric values
are floored and clamped, invalid dates fall back to legacy derivation, and the helper returns a
new value without mutating its input.

Alternative considered: merge `emptySkill()` into every stored skill inside `reconcile()`.
Rejected because a restored or remotely adopted old blob can arrive at any time, so migration
would need to run forever; it would also weaken the invariant that stored skill objects and
their unknown fields pass through intact.

Alternative considered: make fields required and rely on TypeScript. Rejected because it
would make the type deny the legacy values the app is required to accept.

### 2. Use a small discrete recall ladder

`lib/review.ts` will own an immutable interval table indexed by normalized strength:

| Strength | Days until next review |
| --- | ---: |
| 0 | 1 |
| 1 | 1 |
| 2 | 3 |
| 3 | 7 |
| 4 | 14 |
| 5 | 30 |

`scheduleAfterLesson()` will take the skill after mastery has increased, raise strength to the
greater of normalized strength and resulting mastery, leave review attempts unchanged, and
schedule from the supplied local day.

`scheduleAfterReview()` will raise strength by one for a correct result or lower it by one for
an incorrect result, clamp to the same bounds, increment review attempts once, and schedule
from the supplied local day. It returns review fields only, ready for a later store action to
merge into the skill. `isReviewDue()` will report due only when a valid scheduled date is on or
before the supplied day.

This ladder is deliberately smaller than an SM-2 model. The app has only correct/incorrect
evidence, not graded recall quality, and stores whole progress snapshots. Ease factors and
floating-point intervals would add opaque state without better input. Lowering one rung on a
miss keeps recall responsive without treating one miss as erasing all prior practice.

Alternative considered: derive strength from lifetime accuracy. Rejected because early
answers would permanently dominate later recall and elapsed spacing would have no clear owner.

Alternative considered: use mastery as the schedule directly. Rejected because future review
results and skip-ahead must change recall timing without taking away earned course progress.

### 3. Move named-day arithmetic to a shared calendar module

Create `lib/calendar.ts` as the owner of local day keys, strict day-key validation, named-day
addition, and named-day comparison. Move `todayKey`, `daysBetween`, and `dayBefore` out of
`lib/streak.ts`; add the forward addition needed by review. Streak and review will import the
shared helpers, and the existing `todayKey` re-export from the progress store can remain for
compatibility.

`todayKey(Date)` will continue to read local date parts. Arithmetic will operate on validated
`YYYY-MM-DD` components as calendar days, not elapsed milliseconds, so daylight-saving changes
cannot shift the result. Calendar tests will own month, year, leap-day, and daylight-saving
boundaries; streak tests will keep only streak behavior.

Alternative considered: import date helpers from `streak.ts`. Rejected because review is not a
streak concern and the existing comment explicitly gives streak ownership only while nothing
else reads those helpers.

Alternative considered: store timestamps. Rejected because the product schedules by learner
days, `lastPracticed` already uses local day keys, and timestamps would make timezone changes
affect a rule that needs only a named date.

### 4. Attach standard scheduling to the existing lesson-completion write

`completeLesson()` will first build the skill with its new mastery and `lastPracticed`, pass
that value and the same `today` key to `scheduleAfterLesson()`, then merge both into the one
`next` progress object it already persists. Checkpoint, pin, streak, reward, and unlock
calculations keep using the same before/after transition. There is no second IndexedDB write and
no new sync call.

The review-result transition remains a pure exported scheduler in this increment. Increment
27b will add the mixed review session and the store action that supplies each slot's skill id.
Keeping that caller out now prevents 27a from changing the single-skill lesson queue early.

Alternative considered: update review state from every `recordAttempt()` call. Rejected because
ordinary lesson attempts are not review attempts, misses are re-queued within a standard
lesson, and the review source does not exist until 27b.

### 5. Preserve opaque persistence and prove both restore paths

No endpoint or sync code changes. Optional fields remain nested in the same progress JSON, and
the existing store subscriber carries the completed lesson mutation. Store tests will cover
new-record defaults, one-write lesson scheduling, unknown-field preservation, file replacement,
remote adoption, repeated legacy reads, and unchanged unlock/mastery state. Pure tests will
cover normalization, transitions, due checks, bounds, and calendar boundaries.

## Risks / Trade-offs

- **Many long-time skills become due when review UI ships**: legacy dates accurately reflect
  elapsed time; 27b must bound each review lesson rather than hiding overdue skills here.
- **Optional fields invite direct unsafe reads**: export required `ReviewState` only through
  `readReviewState()` and keep review decisions in the pure module.
- **Fixed intervals may need tuning after learner evidence exists**: keep the ladder in one
  constant; a later change affects future reschedules without rewriting already stored dates.
- **A bad device clock can move due dates**: named local days match existing streak and practice
  semantics; do not add network time or timezone state for this increment.
- **Corrupt backup values could block review forever**: validate and normalize every review
  field at read time while preserving the original opaque object.

## Migration Plan

1. Add shared calendar and review helpers with focused pure tests.
2. Add optional review fields and explicit defaults for newly created skill records.
3. Integrate standard lesson scheduling into the existing completion mutation and add restore
   and remote-adoption compatibility tests.
4. Run focused tests, full tests, build, lint, and scripted real-app validation.

No eager data rewrite or schema-version bump occurs. Existing clients ignore the new fields and
preserve them because all skill updates spread the whole skill object. Rolling back the client
therefore leaves the fields inert but intact. A later client reads them again; an older server
blob without them follows the same legacy normalization path.
