## Context

See proposal.md — Why. The constraints that actually shape the approach are already in the
repository:

- `hasPractised()` in `src/store/progress.ts` already documents this increment's premise:
  *"skipping ahead is specified to set mastery 3 with no attempts at all"*. So a skipped skill
  unlocks through the existing practised rule and `isUnlocked()` needs no change.
- `reconcile()` merges stored skills over defaults **per skill object**, which AGENTS.md names
  as an invariant. An added optional per-skill field therefore rides along with no migration,
  and a version that picked named fields out of a stored skill would break the sync contract.
- 27a set the precedent for per-skill optional fields: `strength`, `nextReview` and
  `reviewAttempts` are seeded by `emptySkill()`, defaulted and validated **at read time** in
  `readReviewState()`, and never clamped inside `reconcile()`.
- Decisions behind a tap must live in a pure function under `src/lib/`: component tests render
  first paint to a string in node with no handlers attached (`docs/testing.md`). `wardrobe.ts`
  is the shape — pure functions returning a new record or `null`, with the store persisting
  only a non-null result so a refusal advances no version and schedules no push.
- Sync is a store subscriber, not something callers invoke; its own header names skip-ahead as
  a reason that design exists.

## Goals / Non-Goals

**Goals:**

- One authority for what a block contains: the curriculum manifest, through the derived course
  tree that already holds only playable skills per unit and stage.
- A reversal that cannot destroy earned practice, and that returns the learner to exactly the
  level they stood at before the mark.
- Legacy and restored records valid unchanged, under the existing opaque-sync contract.

**Non-Goals:**

- Scope boundaries are in proposal.md — Non-goals. At the design level, this change adds no
  new module boundary, no new store, and no new derivation over the manifest: it reuses the
  course tree that navigation already reads.

## Decisions

### `source` is what makes the reversal safe — it is not groundwork for 28c

The obvious reading of `source` is that it exists for the safety net two increments away. It
does not. The reversal in this increment is *"actually, let me practice this"*, and it has to
distinguish mastery the skip granted from mastery the learner earned. Without a recorded
source there is no way to tell them apart: both are just mastery 3, and resetting the block
would delete real work.

That is why the field ships here rather than with the feature that reads it for its own
purposes. It is half the answer — it says *which* skills a reversal may touch, and the decision
two below says what each of them returns to. It also settles its own default — a record with no source is one written before
skipping existed, so the mastery in it came from lessons, and **practised** is the honest
reading rather than a placeholder.

*Alternative rejected:* store the set of skipped skill ids at the block or progress level. It
is a second authority over the same fact, it goes stale when a unit gains a skill, and
`reconcile()` and the backup endpoint would both have to keep it in step with the per-skill
records. The per-skill field is the same information stored once, where it is read.

### Raise to mastery 3, never set it

`skill-progression` states that no rule may reduce a mastery level. A block skip that assigns
3 would demote a learner who had practised a skill to 5 inside a unit they then marked known —
which is a plausible thing to do, since the mark is per block and their practice is per skill.
So the mutation raises: `max(mastery, 3)`.

The source is recorded **only on the skills the mark actually raised**. This falls out of the
same reasoning and is what makes the reversal correct: a skill left at 5 keeps `practised`, so
taking the block back does not touch it.

### The prior mastery is stored too, because `source` does not say *from where*

`source` distinguishes a granted level from an earned one. It does not say what the learner had
already reached, and that gap is not academic: a skill practised to mastery 1 or 2 is still
raised by a mark, because `UNLOCK_THRESHOLD` is 2 and leaving such a skill where it stands would
keep the course shut and defeat the skip outright. Once raised it is indistinguishable from a
skill the skip found at 0, so a reversal driven by `source` alone has to choose between two
wrong answers: reset to 0 and destroy one or two levels the learner earned, which
`skill-progression` forbids, or leave the skill at 3 and keep a level they neither earned nor
still claim.

So the mark records the level it found, on exactly the skills it raised, and the reversal
restores it. The two fields are written in the same assignment, cleared in the same two places,
and read through the same read-time defaulting — one fact about a granted level, stored in the
two parts that are actually independent.

*Alternatives rejected:* reset to 0 and accept the loss — it is the failure
`skill-progression` exists to prevent. Leave a part-practised skill at 3 — a withdrawn claim
leaves mastery behind, and the learner who asked to practise the unit still finds it half
skipped. Withhold `source` from part-practised skills so the reversal never reaches them — the
same outcome, and worse for the record, because `source` would then mean "granted" on one skill
and "granted, but we declined to say so" on another. Derive the prior level from `attempts` or
`correct` — neither maps to a mastery level, which is why mastery is stored in the first place.

### Reversal is defined by source, not by mastery

Resetting "everything at exactly mastery 3" would be a heuristic that misfires the moment a
learner practises a skipped skill up to 4 or happens to have earned exactly 3 elsewhere in the
block. Resetting by source is exact, and it is the reason the field is stored rather than
derived. `source` decides *which* skills a reversal reaches; the recorded prior mastery decides
*what each one returns to*.

### Completing a lesson clears the source

This is required by the reversal rather than added for tidiness. A learner who skips a unit
and then plays one of its skills has produced exactly the evidence the skip lacked; if the
source stayed `self-assessed`, a later reversal would wipe lessons they completed. One
assignment inside the existing completion mutation covers it — clearing the recorded prior
mastery with it, since a converted skill has no granted level left to restore — and it keeps
the three values meaning what they say.

### Playable skills only

The mutation writes records only for skills in the course tree — the derivation that already
drops `planned` skills and the units and stages left empty by them. Writing records for
unplayable skills would change nothing today, because rule 1 of unlocking locks them and
`unlockPrerequisites` already sees through them, and it would pre-decide content that did not
exist when the learner made the claim. `courseUnitById` and `courseStageById` answer "which
skills are in this block" without a new derivation.

### A new pure module rather than a branch in the store

`src/lib/skip.ts`, holding the block resolution and both mutations over a `Progress` record,
returning a new record or `null`. Two store actions persist a non-null result. This matches
`wardrobe.ts` exactly, including the refusal semantics: an unknown block, a mark that raises
nothing because the block already stands at mastery 3, and a reversal with nothing to reverse
all write nothing and advance no version, so no empty push is scheduled. The mark needs that
refusal as much as the reversal does — re-marking a block the learner already knows is the
ordinary way to reach it, and `persist` advances the version whatever it is handed.

*Alternative rejected:* put the mutations directly in the store actions. Nothing behind a tap
would then be reachable from a node test, which is the specific mistake `lib/submit.ts` and
`lib/wardrobe.ts` exist to avoid.

### Validation at read time, not in `reconcile()`

A corrupt or hand-edited `source` is normalised where it is read, as 27a normalises strength
and review dates, and the stored prior mastery is clamped in the same place. That clamp is not
cosmetic: it is bounded above by the mastery the skill currently holds, so no stored value can
make a reversal *raise* a level and break the one rule `skill-progression` grants this change.
A separate `MAX_MASTERY` bound would add nothing, and would be the wrong bound: `reconcile()`
caps `streakFreezes` but never a stored mastery, so the level a reversal must not exceed is the
one the record actually holds rather than the nominal maximum. Adding a clamp to `reconcile()`
instead would put per-skill validation in two places for one record shape, and its
`streakFreezes` clamp is not the precedent to follow here: that one guards a top-level scalar,
not a per-skill field.

### No checkpoint or pin fanfare

`crossedStageCheckpoint()` and `crossedPinTier()` are transitions computed inside lesson
completion, so a skip that runs outside that path announces nothing without any suppression
logic. The derived pin *tier* still rises, which is correct — the curriculum says a skip clears
the unlock threshold — and the next lesson's before/after pair simply does not re-cross it.

## Risks / Trade-offs

- **Mechanism with no caller until 28b.** → Accepted and deliberate, and the same shape 27a
  shipped. The pure functions and store actions are covered by their own tests, so the
  increment is verifiable on its own rather than resting on a screen that does not exist yet.
- **A skip can raise the pin tier with no lesson behind it.** → The curriculum makes a skip
  clear the unlock threshold, and the pin measures that same threshold on purpose, so the tier
  is honest about what the learner has open. Nothing is announced, so the app never
  congratulates anyone for skipping.
- **A learner who marks a stage known and takes back one unit is left with a partly skipped
  stage.** → Correct behavior, not a gap: blocks are addressed independently and the state is
  derived per skill, so there is no stage-level flag left disagreeing with its units.
- **Two optional per-skill fields, not one.** → Both are stored because neither can be derived,
  and they answer different questions: `source` distinguishes granted mastery from earned
  mastery, and the recorded prior mastery says how much of it was granted. Nothing else in the
  record holds either. They are written and cleared together, so they cannot drift apart.

## Migration Plan

None. Both fields are optional and absent from every existing record; `reconcile()`'s
per-object merge carries old skills through untouched and the read-time defaults supply the
meaning. Rollback is removing the code — records written by this change carry two extra
per-skill keys that an older build ignores and preserves, which is the same contract the backup
endpoint has always had for unknown fields.
