## 1. Geometry diagram support

- [x] 1.1 Add the closed, validated Unit 20a geometry declaration with derived labels for `cm`,
  `m`, `in`, and `ft`, accessible figure names, and structured two-formula reference sets; add
  focused pure tests for every operation, supported unit, and invalid-data class.
- [x] 1.2 Build the responsive local SVG geometry renderer for rectangles, triangles,
  parallelograms, trapezoids, and circles; add static-markup tests for dimensions, units,
  right-angle marks, radius/diameter distinction, formula-choice markup, and accessible ownership.
- [x] 1.3 Extend the existing diagram display branch, learner-text collection, recorded output,
  and independent generator verifier to narrow fraction and geometry data exhaustively; add
  focused tests proving complete geometry recording and unchanged fraction output.

## 2. Unit 20a generators

- [x] 2.1 Implement `perimeter` with generated rectangle measurements, neutral provided formula
  choices, exact keypad answers, difficulty bands, and concise teaching content.
- [x] 2.2 Add independent `perimeter` tests covering visible-source recomputation, exact answers,
  units, neutral formula choices, difficulty growth, keypad rules, teaching line, fixed intro, and
  recorded snapshots.
- [x] 2.3 Implement `area-rectangle` with generated rectangle measurements, a right-angle mark,
  neutral provided formula choices, exact keypad answers, difficulty bands, and concise teaching content.
- [x] 2.4 Add independent `area-rectangle` tests covering visible-source recomputation, exact
  answers, square-unit wording, formula-choice agreement, difficulty growth, teaching line, fixed
  intro, and recorded snapshots.
- [x] 2.5 Implement `area-triangle` with generated base and perpendicular height, whole-number
  exact areas, neutral provided formula choices, and distinct omitted-half and added-dimensions predictions.
- [x] 2.6 Add independent `area-triangle` tests covering figure and formula agreement, exact
  recomputation, right-angle geometry, every difficulty, both surviving wall diagnoses,
  teaching line, fixed intro, and recorded snapshots.
- [x] 2.7 Implement `area-parallelogram-trapezoid` with seeded figure-family selection,
  perpendicular heights, neutral matching formula choices, exact whole-number areas, difficulty
  bands, and concise teaching content.
- [x] 2.8 Add independent `area-parallelogram-trapezoid` tests covering both figure families,
  complete measurements, formula selection, exact recomputation, right-angle geometry, every
  difficulty, teaching line, fixed intro, and recorded snapshots.
- [x] 2.9 Implement `circumference` with shown radius, neutral `C = πd` and `A = πr²` choices,
  shared π = 3.14 and nearest-tenth policy, approximate keypad answers, and distinct
  radius-as-diameter and area-formula predictions.
- [x] 2.10 Add independent `circumference` tests covering radius-to-diameter conversion,
  both neutral formula choices, nearest-tenth targets, tolerance 0.05, decimal-key reachability,
  every difficulty, both surviving wall diagnoses, teaching line, fixed intro, and recorded
  snapshots.
- [x] 2.11 Implement `area-circle` with shown even diameter, neutral `C = πd` and `A = πr²`
  choices, shared π = 3.14 and nearest-tenth policy, approximate keypad answers, and distinct
  diameter-squared and circumference predictions.
- [x] 2.12 Add independent `area-circle` tests covering diameter-to-radius conversion,
  both neutral formula choices, nearest-tenth targets, tolerance 0.05, decimal-key reachability,
  every difficulty, both surviving wall diagnoses, teaching line, fixed intro, and recorded
  snapshots.

## 3. Registry and authorities

- [x] 3.1 Export and register Unit 20a after Unit 19, then update coverage and manifest assertions
  to pin the six implemented Stage G ids, 16 remaining planned ids, unchanged capability set,
  manifest order, and total 179.
- [x] 3.2 Mark curriculum rows 20.1–20.6 complete, update the roadmap status count, and record
  increment 20a as shipped while leaving roadmap item 26 unchecked and later increments
  unchanged.
- [x] 3.3 Add Stage G intro static coverage for all six fixed examples, including formula choices and
  figure reuse, separate exact or approximate answer labels, no interactive answer surface,
  and complete recorded teaching lines.

## 4. Verification

- [x] 4.1 Run the focused geometry model, renderer, ProblemView, answer, Unit 20, recorded-output,
  generator-verification, content-rule, coverage, and manifest tests; fix every in-scope
  failure.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; accept only explicitly documented
  pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to exercise every Unit 20a intro and lesson in the real app
  at 375 by 812 pixels, submit representative exact and approximate answers, assert no overflow
  or hidden content, capture one passing screenshot, and inspect figure labels, formula
  alignment, right-angle marks, circle measures, and answer-frame spacing.
