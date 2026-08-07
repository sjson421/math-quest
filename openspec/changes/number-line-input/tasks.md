## 1. The tick set

- [x] 1.1 Add `src/lib/number-line.ts`: a `NumberLineSpec` of `{ start, step, count }` in
      exact `Rational`s, `ticks(spec)` returning them in ascending order as
      `start + i × step` and rejecting a non-positive `step`, `tickLabel()` for a tick's
      learner-facing text, and `tickEntry()` for the `parseInput`-compatible string a
      confirmed placement submits.
- [x] 1.2 Add the placement policy to the same module as a pure function: given a spec and
      which tick is placed (or none), what entry a confirmation would submit and whether
      confirming is available at all. This is the rule that a tap is not an answer, and
      `docs/testing.md` puts anything behind a tap in `lib/` — inside the component the node
      suite cannot execute it.
- [x] 1.3 Add `src/lib/number-line.test.ts`: ticks are exact and ascending for whole-number,
      quarter and third spacing; a negative `start` works and a zero or negative `step` is
      rejected; `count` of 1 works; `tickEntry()` round-trips through `parseInput` back to
      the same rational for every tick of each of those lines — recomputed from the tick, not
      read back from the formatter; `tickLabel()` shows a whole number as a whole number and
      a fraction as a fraction; nothing placed yields no submission and no confirmation.

## 2. The problem declaration

- [x] 2.1 Widen `Problem.inputMode` to `'keypad' | 'choice' | 'number-line'` and add
      `numberLine?: NumberLineSpec` to `Problem` in `src/lib/types.ts`, documenting why the
      declaration is per problem rather than per skill.
- [x] 2.2 Run `npm run build` and fix every site the widened union breaks or silently
      changes; confirm by inspection that no `inputMode` branch reaches a default it did not
      choose (`src/components/Lesson.tsx`, `src/components/ProblemView.tsx`,
      `src/curriculum/engine/problem.ts`).

## 3. The control

- [x] 3.1 Add `src/components/NumberLineInput.tsx`: one labelled button per tick in ascending
      order with the tick's value as its accessible name, full-height tap targets, label
      thinning when ticks are dense, the placed tick shown as marked, and a confirm control
      disabled until something is placed.
- [x] 3.2 Add `src/components/NumberLineInput.test.tsx` (static render, node environment):
      every tick is a button, in ascending order; every tick carries its value as an
      accessible name whether or not its label is drawn; no `<input>` and no system-keyboard
      surface; a dense line still renders one button per tick.

## 4. Lesson wiring

- [x] 4.1 Replace the two-way input branch in `src/components/Lesson.tsx` with a three-way one
      that names each mode. A tap sets the lesson's existing `entry` to the placed tick's
      submitted string and does nothing else; confirming calls the same `submit()` a Check
      press calls, so the submission gate, attempt recording and re-queue policy apply
      unchanged and a repeat confirmation records once.
- [x] 4.2 Rewrite `ProblemView`'s entry-slot mode check so each mode names the treatment it
      wants and number-line takes the numeric slot; a fourth mode must choose rather than
      inherit.
- [x] 4.3 Extend `src/components/Lesson.test.tsx` with a synthetic number-line skill: the
      lesson shows the line, shows no keypad and no choice controls, and a keypad problem
      still shows no line.

## 5. Capability registration

- [x] 5.1 Add `'number-line'` to `AVAILABLE_CAPABILITIES` in
      `src/curriculum/manifest/resolve.ts`.
- [x] 5.2 Add `'number-line'` to `requires` on Stage C and Stage D, and rewrite the stale
      reasoning in the `stage-c.ts` header comment — declaring the capability held its other
      eight skills back only while it was unbuilt — and the "all four" count in `stage-d.ts`.
- [x] 5.3 Extend `src/curriculum/manifest/manifest.test.ts` and
      `src/curriculum/coverage.test.ts`: number-line input is available, Stages C and D
      require it, and no skill's state and no offered-skill set changed — every Stage C and
      Stage D skill is still `planned`.

## 6. Documentation

- [x] 6.1 Update the capability table row in `docs/curriculum.md` to read as built, matching
      how the choice-input and fraction-keypad rows are worded.
- [x] 6.2 Update `docs/roadmap.md`: the status paragraph's claim that `AVAILABLE_CAPABILITIES`
      holds only `choice-input`, and item 13's entry recording what shipped and what did not.

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run build`, and `npm run lint`, and resolve everything but the
      three documented pre-existing `Settings.tsx` warnings.
- [x] 7.2 Drive the real app in a browser at 375px per `docs/environment.md`. The capability
      is declared by no skill, so reaching it needs a temporary generator: edit exactly one
      named generator file to emit a number-line problem, and record which file. Then place a
      value, move it to another tick, confirm a wrong placement and see the wrong-answer
      panel, confirm a right one and see the lesson advance, and confirm that tapping alone
      leaves the correct count and the attempt record untouched. Check the ticks are tappable
      and legible at 375px.
- [x] 7.3 Revert the temporary generator edit with `git checkout --` on that one file, then
      prove it: `git status --short` shows only this change's intended paths plus the four
      pre-existing files this workflow never touched, and `git diff -- src/curriculum/` is
      empty of it. A temporary edit that survives into phase 8 would ship a fake problem.
