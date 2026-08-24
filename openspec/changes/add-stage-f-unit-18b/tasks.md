## 1. Verified Unit 18b Data and Displays

- [x] 1.1 Extend Unit 18 operation data for difference-of-squares, factored-zero, and quadratic-formula sources; allow those sources on the existing story, equation, and math display branches; and update exhaustive recorded-output, source-value, and independent-recomputation consumers while preserving the no-data root-pair failure tripwire. Keep this task under two hours.
- [x] 1.2 Add focused type, recorded-output, and static display tests that rebuild the factored equation, formula prompt, notation tree, accessible label, semantic roots, and representative phone-width rows from operation data. Keep this task under two hours.

## 2. Unit 18b Generators

- [x] 2.1 Implement the `difference-of-squares` generator with bounded square-root bands, exact degree-two conjugate factorization, and distinct same-sign and unsquared-constant predictions. Keep this generator task under two hours.
- [x] 2.2 Add independent `difference-of-squares` tests that derive the visible polynomial and conjugate factors from source data, check factor reversal and exact-form rejection, replay both predictions through expression entry, and prove difficulty and seeded variety. Keep this test task under two hours.
- [x] 2.3 Implement the `solve-by-factoring` generator with distinct nonzero factor constants whose sum is nonzero, a factored zero equation, exact unordered root-pair entry, sign-aware keys, and sign-copy and repeated-root predictions that both survive exact order-insensitive normalization. Keep this generator task under two hours.
- [x] 2.4 Add independent `solve-by-factoring` tests that recover both roots from the visible factors, require distinct nonzero constants with a nonzero sum, check either entry order, prove both predicted pairs survive filtering and replay through the declared keypad and diagnosis path, and prove difficulty and seeded sign-family variety. Keep this test task under two hours.
- [x] 2.5 Implement the `quadratic-formula` generator by expanding two distinct nonzero reduced rational roots into normalized nonzero `a`, `b`, and `c`; display the supplied structured formula and coefficient mapping; enable sign and fraction keys whenever correct or predicted roots need them; and constrain distinct wrong-sign and wrong-denominator pairs to survive exact order-insensitive normalization. Keep this generator task under two hours.
- [x] 2.6 Add independent `quadratic-formula` tests that recompute the discriminant and exact roots from visible `a`, `b`, and `c`; require all three coefficients and both roots to be nonzero, the roots to be distinct, and the discriminant to be positive and square; verify monic-to-rational difficulty growth and declared sign/fraction keys; prove both predicted pairs survive filtering and replay through diagnosis; and check formula notation and prompt agreement. Keep this test task under two hours.

## 3. Registration and Governing Status

- [x] 3.1 Register the three generators after `factor-trinomial`; update Stage F coverage to prove all nine Unit 18 skills implemented, all five Unit 19 skills planned, 168 total playable skills, and no capability or prerequisite change.
- [x] 3.2 Mark curriculum rows 18.7–18.9 playable and update the roadmap header, 18b increment, and current governing counts together. Keep roadmap item 23 unchecked for Unit 19 and leave unrelated historical prose unchanged.

## 4. Verification

- [x] 4.1 Run the focused Unit 18, global generator, recorded-output, content-rule, component, coverage, manifest, and curriculum-document tests changed by this implementation; fix every new failure.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; require green tests and build, with only the three documented pre-existing `Settings.tsx` lint warnings.
- [x] 4.3 Follow `docs/environment.md` with a shell-driven real Chromium session at 375 pixels: unlock and open the registered `quadratic-formula` skill through local IndexedDB state, verify the supplied nested formula and coefficient mapping, enter and revise both signed or fractional roots, confirm once and observe feedback, assert no horizontal or page overflow, capture one passing screenshot, and inspect it visually. Remove test state, stop any server started for the check, confirm its port is free, and leave no scratch artifact in the repository.
