## 1. Recorded source and prior mastery on a skill

- [x] 1.1 Add both optional fields to `SkillProgress` in `src/store/progress.ts` — `source:
  'practiced' | 'tested-out' | 'self-assessed'` and `priorMastery: number`, the mastery a skill
  held immediately before a mark raised it — seed them as `'practiced'` and `0` in
  `emptySkill()`, and leave `reconcile()` unchanged so the per-skill-object merge keeps carrying
  legacy and unknown fields with no migration.
- [x] 1.2 Add two read-time readers in `src/lib/skip.ts`, neither mutating the record it was
  given, following the pattern `readReviewState()` uses for review fields: one returning a
  skill's source, defaulting an absent value and normalising an unrecognised one to
  `'practiced'`; one returning its prior mastery, reading absent, malformed, negative or
  fractional as `0` and clamping the result to the mastery the skill currently holds, so no
  stored value can make a reversal raise a level.
- [x] 1.3 Cover both readers in `src/lib/skip.test.ts`: for source, an absent value, each valid
  value, a malformed value; for prior mastery, an absent value, a valid one, a negative, a
  fraction, and one above the current mastery clamping down to it. For both, a record carrying
  unknown extra fields, no input mutation, and repeated reads of the same legacy record
  returning the same answer.

## 2. Marking a block known

- [x] 2.1 Add block resolution to `src/lib/skip.ts` that maps a stage or unit id to its playable
  skills through `courseStageById` and `courseUnitById`, returning nothing for an unknown id or a
  block with no playable skill. Add no new derivation over the manifest.
- [x] 2.2 Add the pure mark mutation returning a new `Progress` or `null`: raise each resolved
  skill to `max(mastery, 3)`, record the declared source **and the mastery the skill held before
  the raise** only on the skills it actually raised, leave every other field of every skill
  untouched, and return `null` when the block resolves to nothing or when it raises no skill, so
  re-marking a block already at mastery 3 writes nothing.
- [x] 2.3 Add the `markBlockKnown` store action that persists only a non-null result, so a
  refusal advances no version and schedules no push.
- [x] 2.4 Cover marking in `src/lib/skip.test.ts`: a unit, a stage, a skill practised to mastery 1
  raised to 3 recording both the declared source and 1 as its prior mastery, a skill already above
  3 keeping its mastery and its practised source with no prior mastery recorded, unplayable skills
  neither raised nor given a source and still locked, a skill downstream of the block unlocking
  once its prerequisites clear the threshold, an unknown block returning `null`, an already-known
  block returning `null`, no mutation of the input record, and no change to attempts, correct
  counts, misconceptions, intro state, stored review fields, XP, coins, or streak.

## 3. Taking a block back

- [x] 3.1 Add the pure reversal mutation returning a new `Progress` or `null`: restore exactly
  those resolved skills whose source is `'tested-out'` or `'self-assessed'` to their recorded
  prior mastery, clearing source to `'practiced'` and prior mastery to `0` in the same write;
  leave practised skills entirely alone; and return `null` when the block holds none.
- [x] 3.2 Add the `unmarkBlock` store action on the same persist-only-on-non-null rule.
- [x] 3.3 Cover reversal in `src/lib/skip.test.ts`: a never-practised skipped block returning to 0
  and gated by its prerequisites once more, a skill practised to mastery 1 before the mark
  returning to 1 rather than 0 with its attempts and correct counts intact and reading as
  practised again, a skill practised to 5 before the mark never reached at all, mastery earned
  after the skip surviving, a block with nothing to reverse returning `null`, and no change to
  attempts, correct counts, misconceptions, intro state, stored review fields, XP, coins, or
  streak.

## 4. Practising a skipped skill

- [x] 4.1 Set `source` to `'practiced'` and clear `priorMastery` to `0` inside the existing
  `completeLesson()` mutation, in the same write that raises mastery, leaving its rewards, review
  scheduling, checkpoint, pin, and streak-milestone behavior exactly as they are.
- [x] 4.2 Extend `src/store/progress.test.ts` to prove: a lesson converts a skipped skill's source
  and clears its prior mastery; a converted skill survives a later reversal of its block; both
  store actions produce exactly one strictly advancing `updatedAt`; a refused action advances
  nothing; unknown skill fields survive marking and reversal, reusing the existing replacement and
  remote-adoption cases rather than repeating them; and marking a block known announces no
  checkpoint, pin upgrade, or streak milestone.
- [x] 4.3 Prove in `src/store/progress.test.ts` that a block's skip state stays derived: the
  record either action produces differs from its input only in per-skill `mastery`, `source` and
  `priorMastery` and in `updatedAt`, carrying no block, unit, or stage key; and a stored record
  that omits a skill the manifest now offers reconciles that skill to mastery 0 reading as
  practised with prior mastery 0, with no block state to migrate.

## 5. Documentation

- [x] 5.1 Record roadmap increment 28a as shipped in `docs/roadmap.md`, matching the format used
  for 27a, and correct the two clauses of its description this change deliberately departs from:
  the mutation raises to mastery 3 rather than setting every skill there, and a reversal returns
  only the skills the skip granted, each to the mastery it held before the mark. Leave roadmap
  item 28 and increments 28b and 28c open, and do not change the progress line, curriculum status,
  skill ids, generators, or playable counts.
- [x] 5.2 Correct the three sentences in `docs/curriculum.md` — under *What a skip actually does*
  and *The safety net* — that the shipped mechanism contradicts: a skip raises to mastery 3 rather
  than setting every skill there, records the source only on the skills it raised, and a reversal
  returns only those skills to the mastery each held before the skip rather than resetting the
  block to 0. Correct the appendix bullet naming the stored fields too: the two fields
  `SkillProgress` gains are `source` and the prior mastery a mark records, not `source` and the
  existing mastery set to 3. Leave the low-strength review bullet alone, since 28c owns it, and
  change no table, heading, or skill id — the document is parsed at build time.
- [x] 5.3 Add the two fields and their read-time defaults to the stored-progress rules in
  `AGENTS.md` and `docs/invariants.md` only if the existing reconcile or unlock wording would
  otherwise be wrong; make no change if both already read correctly.
  *No change made: `reconcile()`'s per-object merge and the `attempts > 0 || mastery > 0`
  unlock check are both stated generically and stay true under restore-to-prior — a reversal
  returns a never-practised skill to 0 with no attempts, so it is gated again, and a
  part-practised one to the level it earned, so it stays unlocked.*

## 6. Verification

- [x] 6.1 Run the focused `src/lib/skip.test.ts` and `src/store/progress.test.ts` files and fix
  every in-scope failure.
- [x] 6.2 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`;
  accept only explicitly documented pre-existing warnings.
- [x] 6.3 Follow `docs/environment.md` to run the real app at 375 by 812 pixels, drive
  `markBlockKnown` and `unmarkBlock` for one unit from the store, verify in IndexedDB that the
  marked skills hold mastery 3 with the declared source, that a skill practised to mastery 1
  beforehand is raised to 3 recording 1 as its prior mastery and is returned to 1 by the reversal,
  that a skill practised past 3 keeps its mastery and practised source through both actions, and
  that a never-practised granted skill returns to 0; confirm Home and the skill tree still render
  without overflow, capture and inspect one passing screenshot, and stop any temporary server.
