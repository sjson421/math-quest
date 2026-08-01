## 1. Record the manifest capability

- [x] 1.1 Add failing manifest tests that require `choice-input` to be a recognised available
      capability, require Stages A, C, and D to declare it, and prove a synthetic stage still
      stays planned when its required choice capability is withheld.
- [x] 1.2 Add `choice-input` to the `Capability` union and `AVAILABLE_CAPABILITIES`, make Stages
      A, C, and D require it, correct their capability comments, and update the curriculum
      capability table. Run the closest manifest and curriculum-document tests.

## 2. Build and cover the choice control

- [x] 2.1 Add a failing static-render test for a presentational choice control: every label
      appears once in declaration order as a native button and internal ids are not visible.
- [x] 2.2 Implement the choice control with one `onChoose(id)` callback and rerun its test.

## 3. Verify and wire choice submission

- [x] 3.1 Add explicit answer-checker tests proving a matching choice id is correct and a
      non-matching id is incorrect.
- [x] 3.2 Extend the lesson first-paint test with a synthetic choice problem, proving its
      declared options replace the keypad while a keypad problem ignores stray choice data.
- [x] 3.3 Branch the lesson's answer surface on `problem.inputMode`; submit a selected id
      directly through the existing answer policy, and map the stored id back to its label for
      feedback display. Run the lesson, choice-control, answer, submit, and lesson-session tests.
- [x] 3.4 Add a failing Node test for a pure submission gate: the first same-batch acquisition
      succeeds, a repeat is rejected, and releasing permits the next acquisition.
- [x] 3.5 Implement the synchronous gate and hold it in `Lesson` across recorded feedback or a
      correct transition. Release it on dismiss, after advancing, and immediately for an
      unrecorded unfinished entry. Rerun the focused lesson and submission tests.

## 4. Correct documentation falsified by the change

- [x] 4.1 Update `docs/roadmap.md`: record choice input in the status line, mark item 5 shipped
      on 2026-08-01 with the implemented contract and deferred generators, and update item 6's
      dependency wording without changing its remaining scope. Correct item 9's stale built-skill
      count and item 14's Stage C capability wording in the same file.
- [x] 4.2 Update `AGENTS.md` to name `choice-input` as the active change, correct the stale
      planned-skill count, and record `choice-input` as the first available stage capability;
      archiving will restore the empty-queue statement in its separate commit.

## 5. Verify the completed change

- [x] 5.1 Run targeted tests, then `npm test`, `npm run build`, and `npm run lint` in order;
      investigate every failure and every lint result beyond the three documented
      `Settings.tsx` warnings.
- [x] 5.2 Run `openspec validate choice-input --type change --strict`, inspect the complete diff
      against the recorded baseline, and confirm every implementation task remains checked.

## 6. Exercise the real app

- [x] 6.1 Drive the app in a controlled real browser at phone width. Exercise a choice problem
      through a temporary development-only harness that is removed before review: verify
      ordered readable labels, usable phone layout, no keypad or system keyboard, correct and
      incorrect stable ids, persisted attempt/correct counts, re-queue behavior, internal ids
      never displayed, and rapid repeat taps. Then exercise a built keypad lesson as a regression
      check and stop any server started by this workflow.

## 7. Address completion-review feedback

- [x] 7.1 Add a failing static-render contract proving a selected choice label uses a bounded,
      wrapping presentation rather than the numeric entry slot's calculated width.
- [x] 7.2 Pass the declared input mode into `ProblemView`, preserve numeric entry sizing, and
      render choice feedback in a compact label slot. Re-run focused tests and the post-selection
      375px browser measurement.
