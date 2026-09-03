## Context

See `proposal.md` — Why. The design-relevant state of the repository:

- `lib/review.ts` holds the whole scheduler as pure functions over a structural `ReviewSkill`:
  `readReviewState()` normalises and defaults, `scheduleAfterLesson()` and
  `scheduleAfterReview()` produce the two ways a schedule moves today, and
  `selectReviewSkills()` picks a bounded due set.
- `lib/skip.ts` holds the block mutations as pure functions returning a new `Progress` or
  `null`, with `null` meaning refused. It imports `store/progress` **type-only** on purpose: the
  store imports it, so a value import would be a runtime cycle.
- `readReviewState()` derives strength from mastery when the stored field is absent. This is
  right for a legacy record that reached its mastery through lessons, and wrong for one a skip
  raised.
- `selectReviewSkills()` is called once, over *every* implemented skill, and filters on due date
  alone. Nothing filters on unlock state or on whether the learner has practised the skill.
- `unlockPrerequisites` maps every manifest id to its **playable** prerequisites; planned skills
  are already collapsed out of the values.

Two constraints shape everything below. The progress blob is synced opaquely and merged per
skill object by `reconcile()`, so a new field must be optional and defaulted where it is read.
Component tests render first paint to a string in node with no handlers attached, so any
decision behind a tap has to live in a pure function to be testable at all — which is why
`skip.ts` and `wardrobe.ts` exist in the shape they do.

## Goals / Non-Goals

**Goals:**

- Make the skip's review guarantee true for *every* stored record, including one that predates
  review scheduling, rather than only for records the current app wrote.
- Keep the reversal exactly reversible, without adding a stored field per thing it must undo.
- Keep both warm-up triggers in one pure derivation with one surface, since they produce the
  same offer.

**Non-Goals:**

- Changing `selectReviewSkills()`, its bound, its ordering, or the review reward. The design
  works by writing correct schedules, not by teaching selection about skips.
- A general "notifications" or "insights" framework. There is one derived suggestion.

## Decisions

### Pin the strength at the mark; do not derive it, and do not lower it

**Decision.** `markKnown()` writes an explicit `strength` on each raised skill, equal to
`readReviewState(skill).strength` computed *before* the mastery is raised, plus a `nextReview`
one interval for that strength after the supplied day.

**Why.** The read-time default derives strength from mastery. Raising mastery to 3 on a record
with no stored strength silently moves that skill to a 7-day interval — slower than a practised
skill. Writing the strength the skill actually held both fixes that and states the intent in the
record instead of leaving it to a default that means something else here.

**Why not lower it to 0 for everyone.** "Low strength" is easy to read as "set strength 0", but
strength is earned recall evidence, and a skill practised to strength 2 has evidence a skip did
not erase. Lowering it would make the mark destroy something, which is the one thing 28a was
built to avoid. Pinning is strictly weaker and sufficient: the risky case — a skill nobody
touched — is already at 0.

**Consequence worth naming.** Because the written strength equals what the derivation would
produce both before the mark and after a reversal, the mark changes only *when* the skill is
next due, never how strongly it is held. That is what lets the reversal leave strength alone.

### Undo the schedule by re-deriving it, not by storing it

**Decision.** `unmark()` writes, on each skill it resets, the next-review date that skill's own
`lastPracticed` implies at its recorded strength — which is no scheduled review at all when
`lastPracticed` is absent or malformed.

**Why not a stored `priorNextReview`.** 28a already stores `priorMastery` because a mastery level
genuinely cannot be recovered from the record. A next-review date can: it is
`lastPracticed + interval(strength)`, which is precisely the rule `readReviewState()` already
applies to a legacy record. Storing it would be a second field that must be written, cleared,
normalised, and defended against corruption, to recover something already derivable.

**Why this is correctness, not tidiness.** `selectReviewSkills()` filters on due date alone. A
reversal that returned a skill to mastery 0 and left its date behind would put a locked,
never-practised skill into a review lesson. The alternative of clearing the date unconditionally
also fixes that, but silently drops a real schedule from a part-practised skill; re-deriving
restores it.

### One new counter, and only one

**Decision.** Add `reviewCorrect?: number` to `SkillProgress`, maintained only by
`recordReviewAttempt()`, normalised in `readReviewState()` and clamped to at most
`reviewAttempts`.

**Why.** Review accuracy is not derivable today. `reviewAttempts` is review-only, but the only
correct count is the aggregate one, which also counts standard lesson answers. Reusing it would
mean a skipped skill's accuracy silently included lessons the learner abandoned part-way, and
would make the accuracy read inconsistent with the attempt count it is divided by.

**Why the clamp.** A hand-edited or corrupt blob could report accuracy above 100%, which would
make the safety net *stop* watching exactly the record that is least trustworthy. Clamping to
the attempt count is the reading that cannot invent evidence, in the same spirit as
`readPriorMastery()` bounding by current mastery.

**Alternative rejected: derive accuracy from strength.** Strength moves ±1 per result and clamps
at 0 and 5, so it saturates and cannot distinguish 5 attempts at 40% from 30 at 40%.

### Two triggers, one suggestion, one surface

**Decision.** A pure derivation returns at most one
`WarmUpSuggestion { unitId, unitName, reason, skillId }`, from either trigger, chosen
deterministically in curriculum order. `App` passes it to `Home`, which renders one card beside
the review entry point; acting on it navigates to that unit.

**Why one.** Both triggers answer the same question — which unit should the learner warm up —
and differ only in the evidence. Two derivations and two cards would mean two places to keep the
tone, the threshold, and the "is there still something to take back" check in step.

**Why different counters per trigger.** The skipped skill is watched through review because
review is the only place the app sees it at all; a downstream skill is watched through its
aggregate counts because that is where it actually fails, in ordinary lessons. Both use the same
5-attempt, 60% rule so there is one threshold to explain.

**Why the card navigates rather than reverses.** Taking a skip back lowers a mastery level. 28a
gave that a labelled, deliberate control on the unit. A one-tap reversal from a card the learner
did not ask for would be the app undoing their declaration on their behalf.

**Why nothing is stored.** A dismissal flag would be new synced state whose only job is to hide a
card that already clears itself when accuracy recovers, when the skill is practised, or when the
skip is withdrawn. Storing it would also mean deciding when to un-dismiss.

### Where the code goes

`scheduleAfterSkip()` joins `scheduleAfterLesson()` and `scheduleAfterReview()` in
`lib/review.ts` — it is a scheduling rule, and putting it in `skip.ts` would put a third
scheduler outside the module that owns the ladder. The warm-up derivation goes in `lib/skip.ts`,
which already owns `readSource()`, the block/unit mapping, and the type-only import discipline.
`markKnown()` and `unmark()` take the local day as a parameter, exactly as the store already
supplies `todayKey()` to the review schedulers, so both stay pure and testable.

## Risks / Trade-offs

- **A skip now writes review fields, which its spec previously forbade** → The baseline text
  deferred the decision here in as many words, and both requirements are modified in this
  change's delta rather than contradicted silently.
- **A part-practised skill's next-review date is rescheduled from the day of the mark, and not
  restored to the exact prior value on reversal** → Rescheduling at the same strength from a
  later day moves the date later, so a mark postpones a pending review by up to one interval.
  The reversal restores the date the skill's own last practice implies, which is the same value
  unless a review had already rescheduled it; the residual case returns a skill to review
  slightly earlier than it would have been, which is the safe direction.
- **Review history survives a reversal, so a re-marked block can qualify for a warm-up offer
  immediately** → Correct rather than surprising: the poor review accuracy really happened. The
  offer leads to practice, which clears it honestly.
- **Aggregate counts never decay, so a skill failed badly long ago can keep raising the
  downstream suggestion after the learner improves** → Accepted for this increment. The offer is
  quiet, costs nothing to ignore, and is cleared for good by practising the prerequisite, which
  is the action it asks for.
- **A new optional field could be dropped by a client that does not know it** → It is optional
  and defaulted on read; a record without it reads as zero review correct, which raises no
  suggestion rather than a false one.

## Migration Plan

None required. `reviewCorrect` is optional, seeded by `emptySkill()` for new records, defaulted
at read time for old ones, and merged per skill object by `reconcile()` like every field 27a and
28a added. The progress schema version does not move and the sync endpoint stores the document
opaquely, so local records, restored backups, and adopted server copies all load unchanged.
Rollback is removing the code: a record carrying `reviewCorrect` loads fine on a build that does
not know the field, since unknown fields are preserved and never interpreted.
