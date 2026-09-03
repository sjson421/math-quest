## Why

Skipping ahead is only safe if the app watches what was skipped. Today it does not: marking a
block known deliberately writes no review field, so a skipped skill is scheduled for review
never — the one class of skill the course has no evidence about is the one class it never
checks. Item 28a left that decision open in words, in `src/lib/skip.ts` and in the
`skip-ahead` baseline; this is the increment that settles it.

Worse than absent, the current default is backwards. `readReviewState()` derives strength from
mastery when the stored field is missing, so a record saved before review existed and then
raised to mastery 3 by a skip reads as strength 3 — a 7-day interval, *slower* than a skill the
learner actually practised.

Two of the safety net's three promises also have no counter behind them. `reviewAttempts`
counts review answers, but nothing counts how many were right, so "accuracy across review
attempts" is not derivable from the record at all.

## What Changes

- **A skip schedules the review it grants.** Marking a block known writes an explicit recall
  strength and next-review date on exactly the skills it raised, pinned to the strength the
  skill already held rather than the mastery the skip just granted. An untouched skill enters
  at strength 0 and is due the next day — sooner than any practised skill.
- **Taking a block back withdraws that schedule.** The reversal restores the next-review date
  the skill's own last practice implies: none for a skill the skip found untouched, and its
  real date for one it found part-practised. This is a correctness requirement, not tidiness —
  review selection filters on due date alone, with no unlock or practice filter, so a leftover
  date would put a re-locked, never-practised skill into a review lesson.
- **A review correct count.** One new optional field on skill progress, counted only by review
  answers, in the same read-time-defaulted shape as the fields item 27a added. No migration,
  no schema-version change, no endpoint change.
- **One warm-up offer, from two kinds of evidence.** A skipped skill whose review accuracy
  falls below 60% across 5 or more review attempts, and a practised skill failing repeatedly
  whose prerequisite is still an unearned skip claim, both produce the same quiet suggestion:
  warm this unit up. The suggestion is derived on read and stores nothing, so it clears itself
  when accuracy recovers or the skip is withdrawn.
- **Where it appears.** A card on the course tree beside the review entry point, naming the
  unit and — for the downstream case — the skill that pointed at it. It leads to the unit,
  where item 28a's "Actually, let me practice this" already stands. Reversing a skip lowers a
  mastery level, so it keeps the deliberate, labelled control it already has.

## Scope

Tooling and mechanics only. No curriculum stage, unit, or skill id is in scope, no generator
is added or changed, and no capability is required — the safety net reads the manifest's
existing prerequisite graph and the progress record.

## Non-goals

- **Any new curriculum content.** Stage H and Unit 22 are item 30's.
- **Changing what a skip grants.** Mastery 3, the source, and the prior mastery are item 28a's
  and are not revisited.
- **Changing review selection, its bound, its ordering, or its reward.** The safety net changes
  what is *scheduled*, never how a due set is chosen or paid.
- **A stored dismissal for the warm-up offer.** The suggestion is derived, so declining it is
  simply not acting on it; a persisted "don't show me this" would be new synced state for a
  card that already disappears on its own.
- **Reversing a skip from the offer itself.** One tap that lowers mastery is exactly what 28a
  gave a labelled control.
- **A second review accuracy surface.** The existing per-skill recall display is unchanged;
  the new counter feeds the safety net, not the skill tree.

## Capabilities

### New Capabilities

None. The safety net is the behavior the `skip-ahead` baseline already names in its purpose —
"what later lets the app watch a skipped skill more closely than a practised one" — so it lands
there rather than in a capability of its own.

### Modified Capabilities

- `skip-ahead`: marking a block known and taking it back now write review fields, which both
  requirements currently forbid and explicitly defer to this increment; and the safety net's
  warm-up suggestion and its two kinds of evidence are added.
- `review-scheduling`: skill review state gains a review correct count, maintained by recorded
  review answers alongside the existing review attempt count and defaulted at read time like
  the rest.

## Impact

- `src/lib/review.ts` — a third scheduler beside `scheduleAfterLesson` and
  `scheduleAfterReview`, and the correct count in `ReviewSkill`, `ReviewState`, and
  `readReviewState()`.
- `src/lib/skip.ts` — `markKnown()` and `unmark()` write review fields and therefore take the
  local day; the warm-up derivation joins them.
- `src/store/progress.ts` — `SkillProgress` and `emptySkill()` gain the counter,
  `recordReviewAttempt()` maintains it, and the two block mutations pass the day.
- `src/components/Home.tsx`, `src/components/SkipAhead.tsx` — the warm-up card and its route to
  the unit.
- `src/App.tsx` — passing the derived suggestion into the tree.
- Progress records, local and restored, keep loading unchanged: the new field is optional and
  defaulted on read, and the sync document format does not move.
