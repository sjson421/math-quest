## 1. Capability work — the three shipped surfaces Unit 6 is the first to reach

- [x] 1.1 Add the distance-from-zero variant to `WholeNumberData` in `src/lib/types.ts`, and
      give `generators.test.ts` its `displayedText` and `recompute` branches — the display is
      `|v|` and the answer is the magnitude of the carried value. Add synthetic cases beside
      the existing `divide-remainder` ones proving the branch names an offender: a display
      that disagrees with its carried value, and an answer key that kept the sign.
- [x] 1.2 Derive a compared display's minus sign in `generators.test.ts`'s `displayedText`
      independently of the generator, so `compare` renders `−7 ? −3` rather than ASCII. Assert
      `compare-numbers`' existing positive displays are unaffected.
- [x] 1.3 Move the minus-glyph swap into `entryLabel` in `src/lib/keypad.ts` and rewrite
      `tickLabel` in `src/lib/number-line.ts` as `entryLabel(tickEntry(tick))`. Behaviour is
      unchanged; `npx vitest run src/lib/number-line.test.ts src/lib/keypad.test.ts
      src/components/NumberLineInput.test.tsx` must pass untouched.
- [x] 1.4 Apply `entryLabel` in the keypad branch of `visibleEntry` in
      `src/components/Lesson.tsx`, beside the choice and number-line branches that already
      translate. **The test landed in `keypad.test.ts`, not `Lesson.test.tsx`:** a static
      render attaches no handlers and opens with an empty entry, so a typed sign is
      unreachable from the component — the same limitation that put `placedLabel`'s coverage
      in `number-line.test.ts`. Covered there instead, including that a tick and a typed
      answer agree on the same value.
- [x] 1.5 Render `keypad` and `numberLine` in `format()` and add both to `RENDERED_KEYS` in
      `src/curriculum/recorded-output.ts`. Confirm no snapshot for Units 0–5 moves — if one
      does, it is a field being set unnoticed and must be understood before continuing.

## 2. The unit module and its two non-keypad skills

- [x] 2.1 Create `src/curriculum/unit-06-negatives.ts` with the unit's private shapes: signed
      rendering to the typographic minus, the four signed operations, and the derivation that
      turns an answer plus its predictions into the problem's answer-entry declaration
      (a sign is permitted when any of them is below zero). Export `unit06` empty for now.
      **Found while implementing:** `ProblemSpec` in `engine/problem.ts` had no `keypad` or
      `numberLine`, so `defineSkill` could not carry either — `Problem` has both, the
      authoring type did not. Widened, which is one field each and not a promotion of
      anything Unit 6 owns into the engine.
- [x] 2.2 Write `negatives-numberline` (6.1, `quick`): a number-line problem placing a value
      on a line symmetric about zero that widens with difficulty, never targeting zero.
      Predicts `mirrored-across-zero` and `counted-the-zero`, both of which are real ticks.
- [x] 2.3 Write `compare-negatives` (6.2, wall): a choice problem carrying `compare` display
      data, drawing both-negative and across-zero pairs and never an equal pair. Predicts
      `reversed-comparison` and `called-equal`.
- [x] 2.4 Register `unit06` in `src/curriculum/index.ts` and create
      `src/curriculum/unit-06-negatives.test.ts` with the recorded-output snapshot block, the
      shared `sweep()` fixture, and an independently written reader for the unit's displays.
      Record 6.1 and 6.2.

## 3. The keypad generators

- [x] 3.1 Write `add-neg-pos` (6.3, wall): `−a + b` with `a ≠ b`. Predicts `added-magnitudes`
      and `wrong-sign`.
- [x] 3.2 Write `add-two-negs` (6.4): `−a + −b` with `a ≠ b`. Predicts `dropped-the-signs`
      and `subtracted-instead`.
- [x] 3.3 Write `sub-negatives` (6.5, major wall): both shapes, `a − (−b)` and `−a − (−b)`,
      with `a ≠ b`. Predicts `still-subtracted` plus `negated-the-whole` on the first shape
      and `dropped-both-signs` on the second — two distinct surviving tags on every problem,
      three across the skill.
- [x] 3.4 Write `mult-negatives` (6.6): all three sign combinations, excluding `(2, 2)` on the
      both-negative draw where the predicted addition equals the product. Predicts
      `wrong-sign` and `added-instead`.
- [x] 3.5 Write `div-negatives` (6.7): composed from the quotient outward so exactness is
      structural. Predicts `wrong-sign` and `multiplied-instead`.
- [x] 3.6 Write `absolute-value` (6.8): `|v|` carrying the new display variant, never zero,
      drawing negative values more often than positive. Predicts `kept-the-sign`. Introduces
      the unit's one new vocabulary word.
- [x] 3.7 Write `negatives-mixed` (6.9): draws one of the 6.3–6.8 shapes and calls the same
      private builder the standalone skill calls, so a reworded diagnosis cannot land on one
      and not the other.

## 4. The unit's own gate

- [x] 4.1 Record all nine skills in `unit-06-negatives.test.ts`'s snapshot and assert
      `unrenderedKeys(unit06)` is empty — which is what proves the per-problem sign
      declaration is under review.
- [x] 4.2 Add the unit's property sweep over a wide seed set: every answer and every predicted
      value is a whole number; every display is read back by the independent reader and agrees
      with the declared answer; every skill's *surviving* misconception tags number at least
      two on every problem for the three wall skills; the answer-entry declaration permits a
      sign exactly when a negative value is plausible; only 6.1 declares a line and only 6.2
      uses choices.
- [x] 4.3 Assert the ladders measurably widen — including that `add-neg-pos`'s mean answer
      magnitude grows, which a symmetric widening of both operands would not deliver.

## 5. Opening Stage C

- [x] 5.1 Update `src/curriculum/coverage.test.ts`: 52 → 61 built, 149 → 140 unbuilt, six
      units → seven, two stages → three, and re-record the unlock-graph snapshot after reading
      the new edges rather than accepting them.
- [x] 5.2 Narrow coverage's "unlocks nothing by making the number line available" case to
      Stage D, keeping the property it pins — a built capability does not make its content
      playable — now that Stage C's content exists.
- [x] 5.3 Correct `src/lib/course.test.ts`, which pins `unit-5` as the last unit anything
      built falls back to. Stage C makes that `unit-6`; keep the property, move the value.
- [x] 5.4 Add a Stage C case to `src/lib/checkpoint.test.ts` mirroring its Stage B one:
      mastering all nine skills of the stage's only unit crosses a boundary at
      `negatives-mixed`. Its existing cases stand — the synthetic part-built stage is
      unaffected and Stage B is still complete — so this is an addition, not a correction.

## 6. Documentation

- [x] 6.1 Mark 6.1–6.9 built in `docs/curriculum.md`, ✅ first in the Note column ahead of the
      existing `quick` and ⚠️ markers, matching the format every built row already uses. The
      capability table's number-line row already reads correctly and needs no edit.
- [x] 6.2 Tick roadmap item 14, mark it shipped with the date, and rewrite its body as a
      retrospective in the voice items 12 and 13 already use — what it left behind, and the
      sign-key rule as implemented rather than as originally written, saying why the narrower
      rule could not hold.
- [x] 6.3 Rewrite the roadmap's status paragraph, not only its count. It currently says 52 of
      201, that Stages A and B are both complete, and that no skill declares a number line
      because its two consumers are unwritten. All three stop being true here.
- [x] 6.4 Update the active-queue line in `docs/workflow.md` to name this change while it is
      active — that file, not `AGENTS.md`, is where the note now lives. Archiving sets it back
      to empty; leaving it claiming an empty queue in between is the drift the line prevents.

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run build` and `npm run lint`, in that order, and read the
      output rather than the exit code. The three documented `Settings.tsx` lint warnings may
      remain; nothing else may.
- [x] 7.2 Drive the real app in a browser at 375px with a Playwright script run from the
      shell, following `docs/environment.md`: the script and its `playwright-core` dependency
      live in a scratch directory outside the repo, and reuse the Chromium already at
      `~/.cache/ms-playwright` rather than installing one. Play `negatives-numberline` to a
      placement and a confirm, play `sub-negatives` to a typed negative answer, and play
      `absolute-value`. **Extended while running it:** typing an arbitrary wrong number only
      reached the generic fallback message, so the script now derives the wall's own predicted
      mistake from the expression on screen and asserts the specific nudge appears.
- [x] 7.3 Capture a screenshot at 375px of every state that renders differently — the pad
      showing the sign key, a half-typed negative entry beside the problem it answers, a
      placed number line, and a wrong-answer diagnosis — and **read them**. The entry slot
      against the display above it is the specific thing to look at: that pair is what task
      1.4 fixed, and no element query reaches whether the two glyphs now match.
      **Two defects found this way and fixed:** a nudge that restated its own first worked
      step almost verbatim (6.5 and 6.3), and a number line that thinned its labels from the
      left end and so left zero unlabelled on roughly half of 6.1's lines — on the one skill
      whose hint says to start counting there.
