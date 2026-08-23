## 1. Polynomial data and responsive presentation

- [x] 1.1 Add the closed `PolynomialData` source union, attach it to the unframed rewrite display, and give expression-mode rewrite slots a bounded phone-sized presentation with focused type and first-paint component tests (under 2 hours)
- [x] 1.2 Handle every polynomial operation exhaustively in independent answer recomputation, visible-source agreement, source-magnitude evidence, learner-text collection, and recorded output, with synthetic tests that fail on missing or mismatched data (under 2 hours)

## 2. Polynomial addition and subtraction

- [x] 2.1 Implement the `add-polynomials` generator with degree-two expanded answers, conventional formatting, structured sources, difficulty bands, solutions, and reachable diagnoses (under 2 hours)
- [x] 2.2 Add independent `add-polynomials` tests that recompute all coefficients from the two visible polynomials and pin answer form, notation, difficulty growth, variety, predictions, and recorded output (under 2 hours)
- [x] 2.3 Implement the `sub-polynomials` wall generator with degree-two expanded answers and distinct `subtracted-first-term-only` and `added-polynomials` diagnoses that stay typable and wrong (under 2 hours)
- [x] 2.4 Add independent `sub-polynomials` tests that distribute the visible minus across all degrees and pin both wall diagnoses, negative-result coverage, difficulty growth, notation, and recorded output (under 2 hours)

## 3. Polynomial multiplication

- [x] 3.1 Implement the `mult-monomial` generator for `kx(ax + b)` with a degree-two expanded answer, structured visible factors, difficulty bands, solutions, and distribution diagnoses (under 2 hours)
- [x] 3.2 Add independent `mult-monomial` tests that multiply the visible factors and pin degree, both resulting terms, difficulty growth, prediction reachability, notation, and recorded output (under 2 hours)
- [x] 3.3 Implement the `foil` generator for signed monic binomial families with a degree-two expanded answer, structured factors, difficulty bands, solutions, and omitted-or-miscombined-middle-term diagnoses (under 2 hours)
- [x] 3.4 Add independent `foil` tests that expand both visible binomials and pin positive, both-negative, and opposite-sign families, coefficient agreement, difficulty growth, predictions, notation, and recorded output (under 2 hours)

## 4. Polynomial factoring

- [x] 4.1 Implement the `factor-gcf-poly` generator with coprime inner coefficients, an exact `gx(mx + n)` answer, conventional coefficient-one notation, structured expanded sources, and common-factor diagnoses (under 2 hours)
- [x] 4.2 Add independent `factor-gcf-poly` tests that derive the numeric and variable greatest common factors from the visible coefficients and pin exact-form grading, unique greatest factoring, predictions, difficulty growth, notation, and recorded output (under 2 hours)
- [x] 4.3 Implement the `factor-trinomial` wall generator from validated signed operand frames, with an exact monic-binomial answer and distinct product-only and sum-only diagnoses on every problem (under 2 hours)
- [x] 4.4 Add independent `factor-trinomial` tests that search factor pairs from the visible trinomial and pin unique factorization, reversed-factor acceptance, sign-family and difficulty coverage, both wall diagnoses, notation, and recorded output (under 2 hours)

## 5. Curriculum integration and documentation

- [x] 5.1 Register the six Unit 18a generators after Unit 17 and update curriculum coverage for 165 implemented skills, eight remaining planned Stage F skills, the first six implemented Unit 18 ids, and the learner-visible unit list through Unit 18; refresh expected snapshots (under 2 hours)
- [x] 5.2 Mark only rows 18.1–18.6 playable in `docs/curriculum.md`; update the roadmap playable count, Stage F completion summary, the statement that currently leaves all Units 18–19 planned, and the 18a shipped note while leaving item 23 unchecked (under 2 hours)

## 6. Verification

- [x] 6.1 Run the focused Unit 18, generator-verification, recorded-output, expression, answer-entry, component, manifest, and curriculum-document suites; then run `openspec validate --strict`, `npm test`, `npm run build`, and `npm run lint`, retaining only documented pre-existing warnings (under 2 hours)
- [x] 6.2 Following `docs/environment.md`, run the real app in scripted Chromium at 375 pixels through the widest addition and subtraction sources and both exact factoring forms; enter full quadratic answers, confirm predicted mistakes are diagnosed, verify no horizontal overflow, inspect the required passing screenshot, remove any temporary fixture, rerun the build, stop the server, and confirm its port is free (under 2 hours)
