## 1. The equation display arm

- [x] 1.1 Add `EquationData` to `src/lib/types.ts` — one arm per skill, carrying the source
      values in `design.md`'s table and **no solution field**. Add the `equation` arm to
      `Display`, carrying `text`, `variable` and `equation: EquationData`.
- [x] 1.2 Handle the new arm in `ProblemView.tsx`: the equation on one row, the `x = [slot]`
      frame beneath it, and no appended equality. Keep `EntrySlot` untouched.
- [x] 1.3 Handle the new arm in `recorded-output.ts`'s `formatDisplay`, with a
      `formatEquationData` beside the existing payload formatters, so per-problem `keypad`
      declarations reach the review surface.
- [x] 1.4 Component tests in `ProblemView.test.tsx`: the equation renders once, the slot is
      framed by the variable, no second equals sign appears, and an empty entry still shows
      the cursor. Cover the longest equation the draws can produce.

## 2. Independent verification

- [x] 2.1 Extend `generators.test.ts`'s `recompute()` with an `equation` branch, exhaustive
      over `EquationData`, deriving each skill's answer per `design.md`'s table from the
      carried operands. The derivation must not read a solution — there is none to read.
- [x] 2.2 In the same branch, rebuild the expected equation text from the carried values and
      fail naming the problem if the displayed text disagrees.
- [x] 2.3 Extend `generators.test.ts`'s `sourceMagnitude()` with an `equation` branch that
      narrows over `EquationData` explicitly. **This one is not compile-forced** — the
      function ends in a fallback to `answerValue(problem)` (`:1355`), so omitting it leaves
      the difficulty ladder measured from the answer with a green build. Add the branch above
      that fallback and assert an equation problem's magnitude comes from its operands.
- [x] 2.4 Add the `equation` width measurement to `coverage.test.ts` as its own band, with
      the threshold set from the widest equation the six draws actually produce. This is what
      `answer-entry`'s no-wrap-at-375px scenario is checked by in the suite; 5.2 checks it in
      the browser.
- [x] 2.5 Update the four built-skill count assertions in `coverage.test.ts` (`:73`, `:297`,
      `:356`, `:393`) from 129 to 135.

## 3. Generators

Each ships with its own tests in `src/curriculum/unit-14-linear-equations.test.ts`: the
worked example from the spec, the composition bounds, and the predicted misconceptions
surviving `generateProblem`.

- [x] 3.1 Create `src/curriculum/unit-14-linear-equations.ts` and register the unit in
      `src/curriculum/index.ts`.
- [x] 3.2 `equation-balance` — a true numeric equality plus one operation applied to both
      sides; answer is what each side becomes. Predictions: one side changed only, and the
      change applied twice. Confirm it stays `quick` from the manifest.
- [x] 3.3 `one-step-addsub` — `x + b = c` and `x − b = c`, composed from a chosen solution.
      Prediction: the displayed operation repeated instead of undone.
- [x] 3.4 `one-step-multdiv` — `ax = c` and `x / a = c`, the division family composed so the
      solution is whole. Predictions: multiplying where it multiplies, dividing where it
      divides (only when whole).
- [x] 3.5 `two-step` — `ax ± b = c` composed as `b = a·k`, `c = a·x ± b`, with `a ≥ 2` and
      `k ≥ 1`. Test that **both** wall predictions are whole and distinct from the answer and
      from each other across all five difficulties.
- [x] 3.6 `vars-both-sides` — composed from `x`, `a > b`, and `c` **as a multiple of
      `(a − b)`**, then `d = (a − b)x + c`. Predictions: coefficients subtracted the wrong
      way (giving `−x`), and the constants left unmoved (giving `d / (a − b)`). Test both are
      whole on every draw.
- [x] 3.7 `equation-parentheses` — `a(x ± b) = c` with `a ≥ 2` and **`b` a non-zero multiple
      of `a`**, then `c = a(x ± b)`. Prediction: distributed to the first term only, giving
      `(c − b) / a`. Test it is whole and distinct from the answer on every draw — it is the
      skill's only prediction, so `alwaysFiltered` fails if it never survives.
- [x] 3.8 Derive `keypad.allowNegative` per problem from the answer and its surviving
      predictions together, per `answer-entry`'s rule. Test a problem whose prediction is
      negative and whose answer is not.

## 4. Contract and documentation

- [x] 4.1 Run the content contract over the six skills — ≤4 solution steps, ≤12 words each,
      single-sentence hints, and two distinct surviving predictions on `two-step`.
- [x] 4.2 Assert in `coverage.test.ts` that all six resolve as `implemented` and that
      `AVAILABLE_CAPABILITIES` is unchanged, so the no-new-capability claim is checked rather
      than assumed.
- [x] 4.3 Update the recorded-output snapshot and read the diff, confirming every equation,
      keypad declaration and prediction is what the spec describes.
- [x] 4.4 Mark 14.1–14.6 ✅ in `docs/curriculum.md`, and mark item 21's `14a` increment
      shipped in `docs/roadmap.md` with what it left behind. Leave item 21's checkbox open —
      `14b` and `15` remain.
- [x] 4.5 Update the roadmap's playable-skill count from the manifest, not by hand.

## 5. Verification

- [x] 5.1 `npm test` green, `npm run build` clean (`tsc -b`, not `tsc --noEmit`), `npm run
      lint` with only the three known `Settings.tsx` warnings.
- [x] 5.2 Real-app browser validation per `docs/environment.md`: play each of the six skills
      at 375px, confirm no equation wraps, the `x = [slot]` frame reads correctly with the
      slot empty and full, and the sign key appears exactly where declared.
