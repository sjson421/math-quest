## 1. Structured fraction verification

- [x] 1.1 Add the closed fraction-operation display data and optional exact rational choice
  metadata, and record both through the existing output gate.
- [x] 1.2 Extend independent answer recomputation and difficulty measurement for fraction math
  operations and value-bearing diagram choices, with synthetic pass, mismatch, missing-data,
  and duplicate-equivalent tests.

## 2. Meaning and diagram generators

- [x] 2.1 Implement `fraction-meaning` with structured notation, fraction keypad rules, bounded
  denominator draws, computed exact answers, hints, and solutions.
- [x] 2.2 Add independent `fraction-meaning` tests for notation/data agreement, allowed entry,
  numerator-over-equal-parts meaning, draw bounds, answer derivation, and difficulty scaling.
- [x] 2.3 Implement `fraction-of-shape` with seeded bar/circle/grid draws, computed visible
  fractions, fraction keypad rules, hints, and solutions.
- [x] 2.4 Add independent `fraction-of-shape` tests for diagram counts, shape coverage, answer
  derivation, non-degenerate draws, and difficulty scaling.

## 3. Vocabulary and number-line generators

- [x] 3.1 Implement `name-parts` with structured fraction notation, seeded numerator or
  denominator prompts, stable vocabulary choices, and concise teaching text.
- [x] 3.2 Add independent `name-parts` tests for notation/data agreement, both requested terms,
  choice id/label agreement, input mode, variation, and difficulty scaling.
- [x] 3.3 Implement `fractions-numberline` with structured target notation and exact rational
  lines whose ticks contain the computed answer.
- [x] 3.4 Add independent `fractions-numberline` tests for target/data agreement, line bounds,
  exact answer membership, fraction steps, control mode, and difficulty scaling.

## 4. Equivalence generators

- [x] 4.1 Implement `equivalent-visual` with reducible diagrams and shuffled prose choices
  derived together with distinct exact rational metadata.
- [x] 4.2 Add independent `equivalent-visual` tests for label/value agreement, exactly one
  equivalent choice, diagram reducibility, shape coverage, and difficulty scaling.
- [x] 4.3 Implement `equivalent-multiply` with structured missing-term equalities, seeded scale
  factors, both scale directions and missing sides, computed whole-number answers, hints,
  solutions, and predictions.
- [x] 4.4 Add independent `equivalent-multiply` tests for notation/data agreement, both
  directions and missing sides, equality, misconception formulas, non-degenerate factors, and
  difficulty scaling.

## 5. Registry, authorities, and verification

- [x] 5.1 Register Unit 7, add its recorded-output snapshots, and update coverage to pin the six
  implemented skills, the three planned skills, course order, input/display modes, and 67-skill
  playable total.
- [x] 5.2 Mark exactly curriculum rows 7.1–7.6 built and update the roadmap status while
  leaving roadmap item 19 unchecked.
- [x] 5.3 Run strict OpenSpec validation, focused Unit 7 and coverage tests, the full test suite,
  production build, and lint; retain only documented pre-existing warnings.
- [x] 5.4 Run the real app at 375 pixels using `docs/environment.md`, complete representative
  keypad, diagram, choice, and fraction-number-line problems, inspect notation and diagram
  layout, capture the required screenshot, stop temporary services, and confirm their ports are
  free.
