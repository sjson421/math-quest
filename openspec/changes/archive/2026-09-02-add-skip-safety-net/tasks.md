## 1. The review-correct counter

- [x] 1.1 Add `reviewCorrect` to `ReviewSkill` and `ReviewState` in `src/lib/review.ts`, and
      normalise it in `readReviewState()`: absent, negative, fractional or malformed reads as 0,
      and a value above the normalised review-attempt count reads as that count.
- [x] 1.2 Increment it in `scheduleAfterReview()` on a correct result only, and carry it
      unchanged through `scheduleAfterLesson()`.
- [x] 1.3 Add `reviewCorrect?: number` to `SkillProgress` and seed it in `emptySkill()` in
      `src/store/progress.ts`; confirm `recordReviewAttempt()` persists it through the existing
      single write and that `reconcile()` needs no change.
- [x] 1.4 Tests in `src/lib/review.test.ts` and `src/store/progress.test.ts`: fresh record reads
      zero; a correct review answer raises it and an incorrect one does not; a retry after a miss
      raises it; completing a standard lesson leaves it alone; a legacy record without the field
      reads zero; a stored value above the attempt count, negative, or malformed clamps; an
      unknown field on the same skill survives the write.

## 2. Scheduling what a skip grants

- [x] 2.1 Add `scheduleAfterSkip(skill, today)` to `src/lib/review.ts`, returning the strength the
      skill already reads at, that strength's interval after `today`, and its review counts
      unchanged.
- [x] 2.2 Add a re-derivation for the reversal — the next-review date a skill's own
      `lastPracticed` implies at its recorded strength, and none when that day is absent or
      malformed — reusing the rule `readReviewState()` already applies to a legacy record rather
      than writing a second copy of it.
- [x] 2.3 Tests in `src/lib/review.test.ts`: an untouched skill schedules to the next day; a
      skill at strength 2 schedules three days out; a record carrying no review fields schedules
      from the strength it read, not from a mastery raised afterwards; the re-derivation returns
      no date for a skill with no valid last-practised day; neither function changes review
      counts.

## 3. Marking a block known schedules its review

- [x] 3.1 Give `markKnown()` in `src/lib/skip.ts` the local day, and write `strength` and
      `nextReview` from `scheduleAfterSkip()` on exactly the skills it raises — computed before
      the mastery is raised. Leave skills it does not raise untouched.
- [x] 3.2 Pass `todayKey()` from `markBlockKnown()` in `src/store/progress.ts`.
- [x] 3.3 Tests in `src/lib/skip.test.ts`: a marked unit's raised skills read strength 0 and are
      due the next day; a skill practised to strength 2 keeps strength 2 and is due in three
      days; a record with no review fields is not scheduled from its granted mastery; a skill
      already at mastery 3 keeps its own strength and date; the mark still changes no attempt,
      correct, review-attempt or review-correct count; a refused mark still writes nothing.
- [x] 3.4 Test in `src/store/progress.test.ts` pinning the whole guarantee end to end: a skipped
      skill and a lesson-practised skill both at mastery 3 on the same day, the skipped one due
      first.

## 4. Taking a block back withdraws that schedule

- [x] 4.1 Write the re-derived next-review date in `unmark()` on exactly the skills it resets,
      leaving strength, review counts and every other field alone.
- [x] 4.2 Tests in `src/lib/skip.test.ts`: a never-practised reversed skill has no next-review
      date; a part-practised one returns to the date its own last practice implies; a skill the
      mark never raised is untouched; review-attempt and review-correct counts survive a
      reversal.
- [x] 4.3 Test that a reversal removes the skill from the due set `selectReviewSkills()` returns,
      so a re-locked, never-practised skill cannot reach a review lesson.

## 5. The warm-up derivation

- [x] 5.1 Add the shared rule to `src/lib/skip.ts`: at least 5 attempts and accuracy below 60%,
      applied to review counts for a skipped skill and to aggregate counts for a failing one.
- [x] 5.2 Derive the skipped-skill trigger — a skill whose source is tested out of or
      self-assessed that fails the rule on its review counts — and return its unit.
- [x] 5.3 Derive the downstream trigger — a failing skill with at least one `unlockPrerequisites`
      entry whose source is a skip claim — and return that prerequisite's unit plus the failing
      skill's id.
- [x] 5.4 Return at most one suggestion, chosen deterministically in curriculum order, and only
      for a unit that still holds a skill whose source is a skip claim.
- [x] 5.5 Tests in `src/lib/skip.test.ts` covering each spec scenario: 5 attempts at 40% raises
      it; 4 attempts does not; exactly 60% does not; a practised skill does not; recovery clears
      it; taking the block back clears it; a failing skill names its skipped prerequisite; a
      practised prerequisite raises nothing; practising the prerequisite clears it; two
      qualifying units yield one stable choice; a unit with nothing left to take back is not
      offered.

## 6. The offer on screen

- [x] 6.1 Add a `WarmUpOffer` card to `src/components/SkipAhead.tsx` — the unit name, the failing
      skill when the suggestion carries one, warm-up framing with no failure or penalty wording,
      and one action.
- [x] 6.2 Render it in `src/components/Home.tsx` beside the review entry point, taking the
      suggestion as a prop so the level components still read no store, and route its action
      through the existing `onNavigate` to that unit.
- [x] 6.3 Derive the suggestion in `src/App.tsx` and pass it down.
- [x] 6.4 Component tests in `src/components/Home.test.tsx` and
      `src/components/SkipAhead.test.tsx` over `renderToStaticMarkup`: the card appears only with
      a suggestion; it names the unit, and the skill for the downstream reason; both the review
      card and the warm-up card render together without either being dropped; the card is absent
      when there is no suggestion.

## 7. Documentation and gates

- [x] 7.1 In `docs/roadmap.md`, mark the `28c` heading shipped with its date and check item 28,
      the way item 27's three increments were closed — the increments carry the dates and the
      item carries the tick. The status paragraph is a playable-skill and capability count that
      says of itself that everything below it is scope rather than status, and it has never
      carried an account of skip-ahead, so it does not change.
- [x] 7.2 Run `npm test`, `npm run build` and `npm run lint`; all green.
- [x] 7.3 Browser validation per `docs/environment.md`: with the dev server running, seed
      `math-quest-progress` in IndexedDB with a self-assessed unit whose skill has 5 review
      attempts and 2 correct, confirm the warm-up card appears beside the review card and opens
      the unit showing "Actually, let me practice this", then seed a reversed record and confirm
      no locked skill is offered for review. Take one screenshot at 375px, read it, and say what
      it looked like.
