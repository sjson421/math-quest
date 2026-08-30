## 1. Geometry diagram support

- [x] 1.1 Extend the closed geometry declaration with every Unit 20b operation, strict field
  validation, measurement labels, accessible names, and derived structured formula pairs; add
  focused pure tests for every valid arm and invalid-data class.
- [x] 1.2 Add fixed responsive SVG templates for the L-shaped composite figure, prism,
  cylinder, cone, pyramid, sphere, rectangular-prism net, and both missing-side right
  triangles; add static-markup tests for labels, six net faces, right-angle and radius marks,
  formula notation, responsive classes, and single-image accessibility.
- [x] 1.3 Extend learner-text collection, recorded output, unrendered-field checks, and global
  independent geometry verification for every new arm; add focused tests proving complete
  recording and unchanged Unit 20a and fraction-diagram output.

## 2. Unit 20b generators

- [x] 2.1 Implement `composite-figures` in under two hours with bounded L-shaped frames, exact
  area, rectangle formula references, difficulty bands, and concise teaching content.
- [x] 2.2 Add independent `composite-figures` tests in under two hours for visible-source
  recomputation, valid cut-outs, exact answers, units, formula agreement, difficulty growth,
  teaching line, fixed intro, and recorded snapshot.
- [x] 2.3 Implement `volume-prism` in under two hours with rectangular-prism dimensions,
  derived base area, exact cubic volume, neutral formula references, difficulty bands, and
  concise teaching content.
- [x] 2.4 Add independent `volume-prism` tests in under two hours for all three visible
  dimensions, exact recomputation, cubic-unit wording, formula agreement, difficulty growth,
  teaching line, fixed intro, and recorded snapshot.
- [x] 2.5 Implement `volume-cylinder` in under two hours with radius and height, shared
  π = 3.14 and nearest-tenth policy, approximate keypad answers, difficulty bands, and concise
  teaching content.
- [x] 2.6 Add independent `volume-cylinder` tests in under two hours for radius-squared volume,
  formula agreement, rounded targets, tolerance 0.05, decimal-key reachability, difficulty
  growth, teaching line, fixed intro, and recorded snapshot.
- [x] 2.7 Add bounded cone, pyramid, and sphere frame builders in under two hours with their
  operation-specific measurements, formula pairs, exact or rounded policies, and seeded
  difficulty bands.
- [x] 2.8 Implement `volume-cone-pyramid-sphere` in under two hours by selecting the three
  frame families, computing each answer from source values, and adding concise teaching
  content.
- [x] 2.9 Add independent grouped-volume arithmetic tests in under two hours for all three
  families, one-third and four-thirds factors, exact pyramid targets, π-based nearest-tenth
  targets, formula agreement, keypad reachability, and difficulty growth.
- [x] 2.10 Add grouped-volume teaching and presentation tests in under two hours for the
  reviewed line, fixed intro, family-specific accessible output, and recorded snapshots.
- [x] 2.11 Implement `surface-area` in under two hours with generated prism dimensions, a
  six-face net, exact paired-face sum, neutral surface-area and volume references, difficulty
  bands, and concise teaching content.
- [x] 2.12 Add independent `surface-area` tests in under two hours for all six visible faces,
  exact recomputation, square-unit wording, net-only rendering, formula agreement, difficulty
  growth, teaching line, fixed intro, and recorded snapshot.
- [x] 2.13 Implement `pythagorean` in under two hours with scaled triples, both missing-side
  roles, radical references, exact whole answers, decimal-reachable placement and unrooted
  predictions, and concise teaching content.
- [x] 2.14 Add independent `pythagorean` tests in under two hours for leg and hypotenuse
  variants, exact source recomputation, radical markup, right-angle geometry, difficulty
  growth, both surviving wall diagnoses, keypad reachability, teaching line, fixed intro, and
  recorded snapshot.

## 3. Registry and authorities

- [x] 3.1 Append the six Unit 20b generators after Unit 20a, then update coverage and manifest
  assertions to pin twelve implemented Stage G ids, ten remaining planned ids, unchanged
  capability and prerequisite data, manifest order, and total 185.
- [x] 3.2 Mark curriculum rows 20.7–20.12 complete, update repository status text and playable
  counts, and record increment 20b as shipped while leaving roadmap item 26 and increment 20c
  open.
- [x] 3.3 Extend Unit 20 intro static coverage to all twelve examples, including solid-family
  formulas, the six-face net, radicals, exact or rounded answer labels, reviewed teaching
  lines, and no interactive answer surface.

## 4. Verification

- [x] 4.1 Run focused geometry model, renderer, ProblemView, answer, Unit 20,
  recorded-output, generator-verification, content-rule, coverage, and manifest tests; fix
  every in-scope failure.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; accept only explicitly
  documented pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to exercise every Unit 20b intro and lesson in the real
  app at 375 by 812 pixels, submit representative exact and approximate answers, assert no
  overflow or hidden content, capture one passing screenshot, and inspect labels, solids, all
  six net faces, formula alignment, right-angle marks, radical layout, and answer spacing.
