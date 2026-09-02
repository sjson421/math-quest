## 1. Pure Skip Policy

- [x] 1.1 Extend `src/lib/skip.ts` with manifest-derived playable block readers for block mark
  state, locked-or-unstarted unit eligibility, and the next stage in an active fresh-start
  sequence, without adding stored block state or a runtime store import.
- [x] 1.2 Add seeded eight-slot skill selection and the seven-correct outcome rule in
  `src/lib/skip.ts`; select without replacement until every playable skill has appeared and
  refuse unknown or empty blocks.
- [x] 1.3 Extend `src/lib/skip.test.ts` with independent coverage for stage and unit membership,
  partial declared-source state, unit eligibility, stage order, deterministic large- and
  small-block samples, unknown blocks, and pass/fail boundaries.

## 2. Fixed Check Session

- [x] 2.1 Add the narrow fixed-difficulty `CheckSession` path in `src/lib/lesson.ts`, reusing
  lazy mixed-skill sources and slots while tracking answered and correct counts separately and
  advancing each recorded result exactly once.
- [x] 2.2 Extend `src/lib/lesson.test.ts` to prove all eight sources stay at difficulty 3, later
  slots remain lazy, a miss advances without recovery or retry, an unrecorded result stays put,
  and existing standard and mixed practice semantics remain unchanged.

## 3. Fresh-Start Presentation State

- [x] 3.1 Add `skipOfferSeen` and one idempotent dismissal action to `src/store/progress.ts`.
  Seed new progress as unseen; reconcile an absent legacy value as seen when the record has a
  positive version timestamp or learning evidence, while preserving an explicit `false` during
  a multi-stage sequence.
- [x] 3.2 Extend `src/store/progress.test.ts` to prove new, legacy-local, restored, and remotely
  adopted defaults; preservation of unknown top-level and skill fields; one versioned dismissal
  write; no learning or reward change; and no schema-version or sync endpoint-format change.

## 4. Shared Check Practice Surface

- [x] 4.1 Extend the discriminated practice mode in `src/components/Lesson.tsx` and export a
  `SkipCheckLesson` wrapper that uses the fixed generator snapshot, existing answer controls and
  diagnostic feedback, no intro or pre-answer hint, no store attempt action, and the fixed check
  transition for correct and incorrect results, including wrong-form responses recorded as
  incorrect.
- [x] 4.2 Add server-rendered coverage in `src/components/Lesson.test.tsx` for check first paint,
  fixed eight-result progress, every existing input-mode route, absent hint and review-intro
  controls, and distinct neutral check result surfaces without lesson rewards.
- [x] 4.3 Prove through pure and store tests that abandoning, failing, and partially completing a
  check leave skill objects, misconceptions, rewards, unlocks, `updatedAt`, IndexedDB writes, and
  sync scheduling unchanged; prove wrong-form responses consume one result without a store write,
  and only a passing callback can request the existing tested-out mark.

## 5. Entry Points, Results, and Routing

- [x] 5.1 Add one skip choice/result component under `src/components/` for the shared "Check
  first" and "Just skip it" routes, neutral failed-check guidance to the current frontier unit,
  and a pass result that carries no achievement or reward treatment.
- [x] 5.2 Extend `Home` with the additive first-launch stage card and unit-level action: show a
  new skip only for locked or unstarted units, show the shipped reversal for a partly or wholly
  marked unit, and leave partly practised open units without a skip offer.
- [x] 5.3 Extend `App`'s screen union and keyed routing so both entry points freeze one check
  snapshot, direct skip writes `self-assessed`, passing check writes `tested-out`, failure opens
  `currentUnitId()`, unit flows return to their exact tree level, and the active first-launch
  flow recalculates the next stage until the learner starts practice.
- [x] 5.4 Add first-paint component tests for fresh-stage, unit-choice, no-offer, and reversal
  states, plus pure routing/state tests for direct skip, seven- and eight-correct pass, six-correct
  fail, exit without a write, next-stage continuation, and return destinations.

## 6. Documentation and Regression Gates

- [x] 6.1 Update `docs/roadmap.md` to mark increment 28b shipped while leaving item 28 unchecked
  for 28c; keep `docs/curriculum.md` unchanged unless implementation reveals a real contract
  mismatch, and record any required correction in this task before editing it.
- [x] 6.2 Run focused skip, lesson, progress, Home, and new skip-surface tests, then run
  `npm test`, `npm run build`, `npm run lint`, and
  `openspec validate add-skip-ahead-check --strict`; confirm the generator suite independently
  recomputes answers from displayed inputs, and fix every in-scope failure.
- [x] 6.3 Following `docs/environment.md`, run scripted real Chromium at 375 px through the
  fresh-stage offer, direct skip, deterministic seven-correct pass, six-correct fail and frontier
  offer, unit reversal, check exit, and an ordinary lesson regression. Derive submitted correct
  answers from visible operands and data rather than reading each generated problem's stored
  answer. Assert no overflow or duplicate actions, capture one passing screenshot, inspect it,
  and record the observed layout and behavior here.

  Browser validation passed with `node /tmp/math-quest-browser/validate-skip.mjs`. At 375 × 812,
  the fresh-stage offer, direct skip, seven-of-eight pass, six-of-eight neutral practice result,
  unit reversal, check exit, and ordinary lesson all behaved as expected; no page errors,
  duplicate actions, or horizontal overflow appeared. The inspected passing screenshot shows a
  centered result card with the star, "Ready for what comes next" heading, 7/8 score, and a full-
  width Continue button with clear spacing.
