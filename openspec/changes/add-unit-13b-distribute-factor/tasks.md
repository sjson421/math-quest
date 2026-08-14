## 1. Make `exact` unambiguous before anything depends on it

- [x] 1.1 Add failing cases to `src/lib/expression.test.ts`: under `exact`, `3(x+4)` and
      `3(4)+x` must not share a canonical form, `3(1x+4)` and `3(x+4)` must not either, while
      `3(4+x)`, `(x+4)3` and `3(x+4)` must, and every existing `exact` and `expanded`
      assertion must still hold.
- [x] 1.2 Parenthesize compound children in `serializeExact` (`src/lib/expression.ts`) per
      design.md, and run `npx vitest run src/lib/expression.test.ts src/lib/answer.test.ts`.
- [x] 1.3 Correct the stale comment in `src/lib/generator.ts` about no expression-answer
      skill existing, stating instead that a text-valued prediction is never compared
      against the answer — the delta spec this change makes to `problem-generation` says the
      same thing normatively.

## 2. `distribute-negative` (13.7)

- [x] 2.1 Add the `distribute-negative` arm to `AlgebraData` in `src/lib/types.ts`
      (`coefficient`, `constant`, `adds`) and its arm to `formatAlgebraData` in
      `src/curriculum/recorded-output.ts`, whose switch ends in a `never` guard.
- [x] 2.2 Write the generator in `src/curriculum/unit-13-expressions.ts`: draw the
      coefficient on a ladder with a floor of two (a coefficient of one collapses two
      predictions into one), the constant on a ladder, and the inner sign; display
      `−a(x ± b)`; answer as an `expanded` expression; three predicted misconceptions per
      design.md's table; hint and solution steps within the content contract.
- [x] 2.3 Register it and add its `recompute` and `sourceValues` arms in
      `src/curriculum/generators.test.ts`.
- [x] 2.4 Add focused tests in `src/curriculum/unit-13-expressions.test.ts`: the answer is
      rebuilt from the carried operands for both inner signs, no predicted string equals the
      canonical answer, every predicted string is typable on the expression pad, and the
      ladder grows.

## 3. `factor-gcf` (13.8)

- [x] 3.1 Add the `factor-gcf` arm to `AlgebraData` (`factor`, `coefficient`, `constant`)
      and its arm to `formatAlgebraData`.
- [x] 3.2 Write the generator: draw `g ≥ 2`, `m ≥ 1`, `c ≥ 2` with `gcd(m, c) = 1`; display
      `gm·x + gc`; answer `g(mx + c)` as an `exact` expression, writing every coefficient
      through the unit's `term()` helper so no `1x` is ever emitted; predicted misconceptions
      per design.md's table, with `not-greatest-factor` drawn only from a divisor strictly
      between one and `g`.
- [x] 3.3 Register it and add its `recompute` and `sourceValues` arms, rebuilding both the
      canonical answer and the displayed sum from the carried operands.
- [x] 3.4 Add focused tests: the displayed coefficients' GCF equals the carried factor over
      sampled problems (so exactly one factoring is greatest), `m = 1` is drawn and produces
      `g(x + c)`, the displayed expanded sum is rejected by the real answer checker, a
      re-ordered factored form is accepted, and no predicted string equals the canonical
      answer.

## 4. Record the increment

- [x] 4.1 Update `src/curriculum/coverage.test.ts` at every count and membership site: the
      documented-as-built length (line 73), both `implementedSkillIds` lengths (lines 297,
      355), the left-out count and `offered` length (lines 390, 392), Unit 13's implemented
      list and its now-empty planned list, and the test name and comment at lines 316–322
      that still say "Unit 13a implemented while 13b waits".
- [x] 4.2 Refresh the recorded-output snapshots and confirm both new skills appear.
- [x] 4.3 Update the module docstring in `src/curriculum/unit-13-expressions.ts`, which
      currently says "Unit 13a", "six generators", and that `factor-gcf` is a later
      increment.
- [x] 4.4 Mark rows 13.7 and 13.8 playable in `docs/curriculum.md`.
- [x] 4.5 Update `docs/roadmap.md`: the status paragraph (129, Unit 13 complete, 14a next)
      and item 21's 13b bullet marked shipped with the `exact`-form decision recorded;
      leave item 21's checkbox unchecked.
- [x] 4.6 Update the README status paragraph, which states Unit 13 opened with its first six
      skills.

## 5. Verify

- [x] 5.1 `openspec validate add-unit-13b-distribute-factor --strict`, then `npm test`,
      `npm run build`, and `npm run lint` all clean (the three known `Settings.tsx` lint
      warnings excepted).
- [x] 5.2 Real-app browser validation per `docs/environment.md`: play both skills, type a
      parenthesized answer on the expression pad, confirm `factor-gcf` rejects the expanded
      form it displayed and accepts the factored one, and confirm a predicted misconception
      produces its nudge rather than a bare "incorrect".
- [x] 5.3 Fix the two sign-notation defects that validation surfaced: `distribute-negative`'s
      worked steps wrote a raw `-8` beside a typographic `−4`, and `entryLabel` converted
      only the first sign, so an entry of `-4x-20` drew the same minus two ways. Route the
      steps through Unit 6's `drawn()` and make `entryLabel` convert every sign.
