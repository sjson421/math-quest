## 1. Display shape

- [x] 1.1 Add `notation?: MathNotation` and make `variable` optional on the `equation` arm of
      `Display` in `src/lib/types.ts`, each with a comment naming its consumer and what its
      absence means. `text` keeps all three of its jobs: accessible name, verified form, and
      the plain row.
- [x] 1.2 Add `equation: EquationData` to the `story` arm's payload union in
      `src/lib/types.ts`, with the `never` exclusions the other four arms already carry.
- [x] 1.3 Add the three new `EquationData` arms — `clear-fraction`, `special-solutions` and
      `rearrange` — carrying only quantities the equation puts on screen, never a solution.
      `rearrange` carries both letters.
- [x] 1.4 Render notation in `EquationView` (`src/components/ProblemView.tsx`) when present.
      The `MathNotation` element **replaces** the existing `role="math"` span rather than
      nesting inside it — `MathNotation` supplies its own role and label, and nesting would
      expose two accessible names for one equation. Give the notated row its own size band,
      since the current one is computed from `display.text.length`.
- [x] 1.5 Drop the frame row's label **and its equals sign** when `variable` is absent,
      keeping the slot so the chosen answer is still echoed. Extend `ProblemView.test.tsx`
      for the notated row, the unlabelled row, and that a notated equation exposes exactly
      one accessible name.
- [x] 1.6 Extend `formatDisplay` in `src/curriculum/recorded-output.ts` for all three shapes:
      an absent `variable` (which currently prints `solve undefined`), the `notation` tree,
      and a `story` whose payload is `equation` (which currently falls through to
      `display.operands.join`). `RENDERED_KEYS` guards a problem's own keys, not the interior
      of its display, so without this the gate does not see any of them.

## 2. Independent verification

- [x] 2.1 Extend `expectedEquation` in `src/curriculum/generators.test.ts` with the three new
      arms. Each derives its own answer and rebuilds its own text from carried values; the
      three new arms take their letters from the arm rather than the `variable` parameter.
- [x] 2.2 Widen `expectedEquation`'s return type to `number | string` and return the derived
      answer in the two non-numeric shapes: the outcome **id** for `special-solutions` and the
      canonical expression string for `rearrange`. Landed against the task as written in one
      detail: every earlier choice-answered display derives a *label* and maps it through
      `choiceIdFor`, because its choices are its values (`<`, `prime`, a sorted list). These
      choices are sentences, so deriving the label would couple the independent check to
      learner-facing copy. `recompute` compares ids directly and keeps `choiceIdFor`'s real
      guarantee explicitly — unique ids, and the derived outcome is one the problem offers.
- [x] 2.3 Add the `story` + `equation` branch to `recompute`, and add every new arm to
      `sourceMagnitude`'s equation branch — the one consumer the compiler does not force,
      whose fallback would otherwise measure the ladder against the answer itself.
- [x] 2.4 Add the `story` + `equation` case to `sourceMagnitude`'s **story** branch too. It
      resolves `percent ? : ratio ? : display.operands`, and an equation-carrying story has
      no `operands` — the same silent fallback as 2.3, one branch over.
- [x] 2.5 Assert that an equation carrying notation still has `text` equal to what its
      carried values rebuild, that the check fails and names the problem when it does not,
      and that the rendered notation's accessible name is that text.

## 3. `with-fractions` (14.7)

- [x] 3.1 Write the generator in `src/curriculum/unit-14-linear-equations.ts`: a stacked
      fraction over a drawn denominator, composed from a chosen whole-number solution, with
      the `clear-fraction` payload and a `math-notation` tree for the row.
- [x] 3.2 Predict multiplying one side only, and prove in
      `unit-14-linear-equations.test.ts` that it is whole and distinct from the answer at
      every difficulty.
- [x] 3.3 Test the solution is whole at every difficulty, the notation's accessible name
      equals the rebuilt text, and the difficulty ladder climbs.

## 4. `special-solutions` (14.8)

- [x] 4.1 Write the generator: all three cases drawn, choice input, three authored choices,
      and no `variable` on the display so the frame is omitted.
- [x] 4.2 Predict the wrong choice per case as a text-valued misconception matching the
      choice id, and test that each drawn case produces a surviving diagnosis.
- [x] 4.3 Test that all three cases appear across a sample, that no coefficient-only rule
      separates "no solution" from "infinitely many", and that verification derives the count
      from the carried terms.

## 5. `equation-words` (14.9)

- [x] 5.1 Add `src/curriculum/phrasing/equations.ts` with a fixed frame set and its story
      builder, following `phrasing/ratios.ts`; register it in `phrasing/frames.test.ts` so
      the bank is checked.
- [x] 5.2 Write the generator: a `story` display carrying the two-step equation payload,
      numeric keypad, composed from a chosen whole-number solution **and a constant that is a
      non-zero multiple of the coefficient**, which is what makes the wrong-order prediction
      whole. `two-step` composes its own constant the same way and for the same reason.
- [x] 5.3 Predict undoing in the wrong order; test it is whole at every difficulty, distinct
      from the answer, and that the sentence rebuilt from its frame and terms equals what is
      on screen. A fractional prediction here is finite, so nothing filters it — only a check
      on the predicted values themselves finds it.

## 6. `rearrange-formula` (14.10)

- [x] 6.1 Write the generator: `display.variable` is the subject letter, `expression.variable`
      is the other, and coefficients are composed so the subject's coefficient divides both
      the other term's coefficient and the constant. The subject coefficient is never 1.
- [x] 6.2 Predict moving a term without changing its sign, and dividing only one term — both
      text-valued, both written in the exact form the pad produces (no spaces, ASCII `-`).
- [x] 6.3 Test that every generated answer parses under the shipped expression grammar with
      whole coefficients, contains only the letter offered on the pad, and that both
      predictions survive filtering and differ from the answer at every difficulty.

## 7. Registration and coverage

- [x] 7.1 Append the four generators to `unit14` in the unit module, in curriculum order.
- [x] 7.2 Add `'choice-input'` to Stage E's `requires` in `src/curriculum/manifest/stage-e.ts`
      and extend its header comment. `identify-like-terms` has been a consumer since 13a
      without the stage declaring it, which is the same correction Stage B received in item 11.
      Nothing unlocks — the capability has been available since item 5.
- [x] 7.3 Update `coverage.test.ts`: Unit 14's implemented list becomes all ten with an empty
      planned list, the playable count moves 135 → 139 everywhere it appears, and the
      `leaves the other 66 skills out of the skill tree entirely` case becomes 62 — its title
      and its assertion both.
- [x] 7.4 Give notated equation rows their own width cap in `coverage.test.ts`, set from
      task 8.2's browser measurement, and keep the 21-character cap on text rows. Neither row
      is left ungated.
- [x] 7.5 Refresh the recorded-output snapshot and confirm every Unit 14a entry is
      byte-identical — the gate that proves the display extensions changed nothing shipped.
      This claim only holds once task 1.6 has landed.
- [x] 7.6 Mark 14.7–14.10 ✅ in `docs/curriculum.md`, which the manifest cross-check enforces.

## 8. Verification

- [x] 8.1 `npm test`, `npm run build` and `npm run lint` all green (three pre-existing
      `Settings.tsx` lint warnings are expected).
- [x] 8.2 Real-app browser validation per `docs/environment.md`: play all four skills at
      375px and confirm the notated `with-fractions` row does not wrap at its widest draw,
      `special-solutions` shows no variable frame, and `rearrange-formula` offers `x` on the
      pad beneath a `y =` frame. Screenshot the notated row and record the width it occupies;
      that number is what task 7.4's cap is set from.
- [x] 8.3 Update `docs/roadmap.md`: record 14b as shipped inside item 21 with what it left
      behind, update the status line to 139, and leave item 21's checkbox open for
      increment 15.
