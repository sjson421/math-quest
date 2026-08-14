## 1. Types and shared shape

- [x] 1.1 Add a `Relation` type (`'<' | '>' | '≤' | '≥'`) to `src/lib/types.ts` beside
  `Operator`, and correct the `equation` display arm's doc comment to name the second kind of
  statement it holds — a relation, not only an equality — noting that `EquationData` therefore
  carries arms that are not equations and why that was preferred to a rename.
- [x] 1.2 Add the six `EquationData` arms from design.md — `inequality-meaning`,
  `inequality-graph`, `inequality-addsub`, `inequality-multdiv`, `inequality-two-step`,
  `inequality-compound` — each documented with what it carries and why, and each carrying only
  quantities the statement puts on screen. Record on the two identical-field arms why they are
  deliberately separate, and on `inequality-multdiv` why its signed coefficient serves two
  skills.
- [x] 1.3 Create `src/curriculum/unit-15-inequalities.ts` with the unit's shared helpers: the
  relation vocabulary (strictness, direction, reversal), the ASCII/typographic split between a
  statement's option id and its label, and the builder that takes four `(relation, boundary)`
  pairs — not one boundary, since 15.3 and 15.4 pair the correct relation with two different
  boundaries — and returns them in an order permuted from the problem's own rng. Register the
  unit in `src/curriculum/index.ts`.
- [x] 1.4 Create `src/curriculum/unit-15-inequalities.test.ts` covering those helpers directly:
  every relation reverses to exactly one other, an option id round-trips to its label, the four
  built options are distinct, and the drawn order puts the correct option at each of the four
  positions across seeds while staying reproducible from one seed.

## 2. Verification and gates, before any generator claims to work

- [x] 2.1 Extend `expectedEquation` in `src/curriculum/generators.test.ts` with all six arms.
  Each must return **both** the rebuilt statement text — which the caller compares against
  `display.text` and throws on, and which is what delivers the agreement requirement — and the
  answer derived from carried values alone: a reading, a graph description, a solved relation
  whose direction reverses exactly when a carried multiplier is negative, and a count over the
  carried range.
- [x] 2.2 Give every new arm `values` that widen with difficulty. `sourceMagnitude` already
  branches on the `equation` display kind and averages `expectedEquation(...).values`, so no
  branch is needed there and a missing arm is a compile error rather than 14a's silent pass —
  but an arm returning values that do not climb flattens the ladder check while type-checking,
  so each arm returns the quantities its difficulty bands actually widen.
- [x] 2.3 Extend `formatEquationData` in `src/curriculum/recorded-output.ts` with all six arms,
  so every new question shape reaches the snapshot instead of being unrendered.

## 3. Reading and graphing

- [x] 3.1 `inequality-symbols` (15.1) — display a relation between the variable and a whole
  number, answer its plain-English reading, four options over direction × strictness, "less
  than"/"more than" for strict and "at most"/"at least" for inclusive. Predict the reversed
  direction and the lost boundary. Nothing to build for `quick`: the manifest already declares
  it and `lessonTarget` reads it from there.
- [x] 3.2 Independent test for 15.1: the correct reading follows from the carried relation, all
  four readings are offered, both predictions are offered ids distinct from the answer, and the
  bound band widens with difficulty.
- [x] 3.3 `graph-inequality` (15.2) — display a relation, answer the graph it produces as
  circle type × shading direction, four options covering all four pairings, boundaries
  including negatives. Predict the wrong circle and the wrong direction.
- [x] 3.4 Independent test for 15.2: strictness determines the circle and direction determines
  the shading, negative boundaries occur across the difficulty range, and both predictions are
  offered ids distinct from the answer.

## 4. Solving

- [x] 4.1 `solve-one-step-ineq` (15.3) — display an inequality undone in one operation, in the
  add/subtract family or the multiply/divide family with a **positive** coefficient. Answer the
  solved relation in full; the relation never reverses here. Predict repeating the operation
  and reversing without cause.
- [x] 4.2 Independent test for 15.3: the solved boundary is an integer, no draw carries a
  negative coefficient, the relation is preserved, and both predicted identities are offered
  options that differ from the correct one.
- [x] 4.3 `solve-multi-step-ineq` (15.4) — display `ax ± b R c` with a positive coefficient
  above one and a non-zero constant. Draw the constant and the right-hand value as multiples of
  the coefficient, so that dividing before clearing the constant lands on an integer distinct
  from the answer — `3x + 6 ≤ 21` solves to `x ≤ 5` and mis-orders to `x ≤ 1`, where
  `3x + 4 ≤ 19` mis-orders to a fraction and offers nothing. Predict the wrong order and
  reversing without cause.
- [x] 4.4 Independent test for 15.4: the wrong-order value is an integer and differs from the
  correct boundary on every draw, the coefficient never equals one, the constant is never zero,
  and both predicted identities are offered options that differ from the correct one.
- [x] 4.5 `flip-the-sign` (15.5, wall) — display an inequality multiplying or dividing the
  variable by a negative whole number. Answer the reversed relation over a non-zero integer
  boundary; offer the four combinations of reversed-or-not by sign-kept-or-not. Draw the
  right-hand value with either sign, so the correct option is not always the negative one —
  otherwise picking the minus sign is right every time without reversing anything. Predict all
  three wrong combinations under distinct tags.
- [x] 4.6 Independent test for 15.5: the answer always carries the reversed relation, the
  boundary is never zero so all four options are distinct, both the multiply and divide forms
  occur, the correct boundary is negative on some seeds and positive on others, and the wall
  carries at least two distinct prediction tags on every draw, none matching the answer.

## 5. Compound statements

- [x] 5.1 `compound-inequalities` (15.6) — display a statement joined by `and`, joined by `or`,
  or written as a chained range, and ask how many whole numbers in a stated range satisfy it.
  Numeric keypad. State the range in the problem's own words. Compose the bounds inside the
  range rather than drawing and filtering. Predict treating a strict bound as inclusive and
  counting the excluded numbers.
- [x] 5.2 Independent test for 15.6: the count is recomputed by testing every whole number in
  the stated range, it is never zero and never the whole range, all three statement forms
  occur, and every predicted value is a non-negative whole number the pad can submit and
  differs from the answer.

## 6. Unit-wide gates

- [x] 6.1 Record the unit's output gate in `unit-15-inequalities.test.ts` over the shared seeds
  and difficulties, and review the snapshot line by line for wording, sign notation, and any
  option whose label disagrees with its id.
- [x] 6.2 Assert unit-wide invariants in the same file: the frame label is declared exactly
  where the answer is a value the learner types — absent on the five choice skills, `how many`
  on `compound-inequalities` — every choice skill offers exactly four distinct options with
  exactly one correct, no predicted identity anywhere in the unit equals its problem's correct
  identity (the central filter cannot catch that for a text prediction against a choice
  answer), and every content rule passes across the sampled draws.

  *Written as "no Unit 15 display declares a frame label", which task 8.1 disproved.*
- [x] 6.3 Update `src/curriculum/coverage.test.ts` — Unit 15's implemented list, Stage E
  complete with nothing left `planned`, and the playable count in every case that states one.
  Confirm the derived-input-mode case still passes with no edit to `stage-e.ts`, and review the
  six new entries in the committed unlock-graph snapshot
  (`src/curriculum/__snapshots__/coverage.test.ts.snap`) rather than accepting them blind —
  that snapshot is the review surface for a re-lock.
- [x] 6.4 Confirm every Unit 15 equation row stays inside `coverage.test.ts`'s `CAPS.text` of
  21 characters. 15.6's compound statements are the unit's longest rows and the one place this
  can bite; shorten a form rather than raising the cap, which was measured in the browser.
- [x] 6.5 Run `npm test` and `npm run build`. The build is the check that reads types; a green
  `npm test` with a type error in a new test case is 14b's finding.

## 7. Documentation and roadmap

- [x] 7.1 Mark the six skills ✅ in `docs/curriculum.md`'s Unit 15 table, which the manifest
  cross-check enforces.
- [x] 7.2 Update `docs/roadmap.md`: close item 21's checkbox, mark increment `15` shipped with
  what it found — that the roadmap's "picks among rendered lines (choice input, built)" premise
  was false, that a rendered inequality graph is deliberately declined and why, and the
  `EquationData` arm decisions — and move the status paragraph to Stage E complete.

## 8. Real-app validation

- [x] 8.1 Run the app per `docs/environment.md` and play all six skills in the browser.
  Confirm each statement renders as one row with no trailing equals sign, that option labels
  draw the typographic minus and the `≤`/`≥` symbols, that the four options fit at phone width
  without truncating, and that a wrong choice draws its predicted diagnosis rather than a bare
  "incorrect". The browser check has caught what the suite could not at items 12, 16 and 14b.

  *And did so a fourth time.* This task was written expecting **no** frame beneath any
  statement, which held for the five choice skills and failed for `compound-inequalities`: it
  answers on the keypad, and dropping the frame took the entry slot with it, so pressing a digit
  changed nothing on screen. Every assertion passed — a missing row is not something an element
  query asks about. Fixed by framing `how many`, and the spec, design, proposal and roadmap were
  corrected before this task was checked.
