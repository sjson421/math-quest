## 1. Shared numeric expression model

- [x] 1.1 Extract Unit 5's numeric expression tree into `curriculum/engine/`, add a
  structurally rendered power node, and keep the existing Unit 5 generator output
  byte-identical (under two hours).
- [x] 1.2 Add direct shared-model tests for arithmetic precedence, power precedence,
  parenthesis derivation, inline rendering, structured math rendering, and evaluation;
  rerun Unit 5 snapshots as the regression gate (under two hours).

## 2. Power verification data

- [x] 2.1 Extend `PowerData` and recorded-output formatting with operation-specific arms
  for power-of-power, zero/negative exponents, scientific notation, and the two PEMDAS
  expression families (under two hours).
- [x] 2.2 Extend the global independent verifier to rebuild every new Unit 12 display and
  answer from primitive power data, including exact scientific-notation values and source
  magnitudes (under two hours).
- [x] 2.3 Add built `fraction-input` to Stage E's manifest requirements and extend manifest
  and coverage tests to prove the consuming stage declares it without changing capability
  availability (under two hours).

## 3. Unit 12b generators and independent tests

- [x] 3.1 Implement `power-of-power` with bounded ladders and two guaranteed-distinct
  wall misconceptions: adding exponents and ignoring the outer exponent (under two hours).
- [x] 3.2 Add independent `power-of-power` tests for nested notation, exact exponent
  multiplication, both diagnoses surviving, variety, bounds, and difficulty growth (under
  two hours).
- [x] 3.3 Implement `zero-neg-exponents` with seeded zero/negative families, exact
  reciprocal answers, per-problem fraction and sign entry, and specific diagnoses (under
  two hours).
- [x] 3.4 Add independent `zero-neg-exponents` tests for both families, exact answers,
  keypad rules, notation, entering and diagnosing the predicted negative value, variety,
  bounds, and difficulty growth (under two hours).
- [x] 3.5 Implement `scientific-notation` with normalized integer or one-decimal
  coefficients, positive and negative powers of ten, exact answers, and bounded display
  width (under two hours).
- [x] 3.6 Add independent `scientific-notation` tests for normalization, both exponent
  signs, exact decimal placement, keypad rules, the independently recomputed
  `moved-one-place` and `reversed-exponent-direction` diagnoses, variety, bounds, and
  difficulty growth (under two hours).
- [x] 3.7 Implement `pemdas-exponents` with the power-before-arithmetic and
  parentheses-before-power families, exact whole-number answers, and wrong-rule diagnoses
  derived from the shared tree (under two hours).
- [x] 3.8 Add independent `pemdas-exponents` tests for both expression families,
  structured notation, exact answers, whole-number intermediate work, diagnoses, variety,
  bounds, and difficulty growth (under two hours).

## 4. Registry, authorities, and recorded output

- [x] 4.1 Register the four generators in manifest order, update their recorded
  snapshots, and update coverage for the ten-skill completed unit, unlock order, and the
  121-skill playable total (under two hours).
- [x] 4.2 Mark curriculum rows 12.7–12.10 playable, update README and roadmap status text,
  mark increment 12b shipped, and leave roadmap item 21 unchecked with 13a next (under two
  hours).

## 5. Verification

- [x] 5.1 Run strict OpenSpec validation, focused shared-expression/Unit 5/Unit 12/coverage
  and content tests, the full test suite, production build, and lint; retain only documented
  pre-existing warnings.
- [x] 5.2 Run the real app at 375 pixels using `docs/environment.md`; complete
  representative problems from all four skills, exercise a diagnosed wrong answer on
  `power-of-power`, capture and inspect a screenshot of nested powers, scientific notation,
  and PEMDAS notation, stop temporary services, and confirm their ports are free.
