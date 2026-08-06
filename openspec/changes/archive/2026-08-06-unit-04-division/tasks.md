## 1. Division engine

- [x] 1.1 Add `divisionTrace` and `divisionStep` in `src/curriculum/engine/division.ts` with
      the `DivisionStep`/`DivisionTrace` shapes from `design.md` — highest place first, each
      step carrying its brought-down digit, working value, quotient digit, product and
      remainder — and re-export both from `engine/index.ts`.
- [x] 1.2 Add trace tests covering an exact division, one leaving a remainder, a quotient
      containing an interior zero digit, a two-digit divisor, and a dividend whose leading
      digit is smaller than the divisor; assert every case reconstructs the dividend from
      quotient, divisor and remainder, and that `divisionStep` names the problem on a bad place.
- [x] 1.3 Add the `forgotBringDown` and `ignoredStepRemainder` misconception factories derived
      from the trace, with tests proving their values, that each throws rather than silently
      returning the quotient when its precondition is absent, and that the pair is distinct.

## 2. Verification channel

- [x] 2.1 Widen the machine-readable display data in `src/lib/types.ts` with the five
      operations from `design.md` decision 2 (`divide-remainder`, `divide-quotient`, `factors`,
      `multiples`, `classify-prime`).
- [x] 2.2 Extend `recompute()` in `src/curriculum/generators.test.ts` to derive each new
      operation independently — the two division properties numerically, the three number
      properties through `choiceIdFor` — and extend its visible-text cross-check to the
      `a ÷ b` cases.
- [x] 2.3 Add synthetic cases to the existing `describe('recompute')` block proving the new
      branches actually fail: a remainder answer that disagrees with its carried operands, a
      division whose displayed text does not match them, and a factor list mapped to the
      wrong choice id.

## 3. Meaning, facts and place-value generators

- [x] 3.1 Implement `div-meaning` (`quick`) as sharing and grouping with text-described equal
      groups, a measurable ladder, and one-group-too-many/too-few diagnoses.
- [x] 3.2 Implement `div-facts` as the inverse of the tables, composing the dividend from a
      divisor and quotient, diagnosing multiplication-instead-of-division and a group miscount.
- [x] 3.3 Implement `div-remainder` on the `divide-remainder` operation, asking what is left
      over, diagnosing the quotient given for the remainder and a remainder taken from the
      wrong end.
- [x] 3.4 Implement `div-by-10-100` with shifted-place working, diagnosing one zero too few
      removed and a shift in the wrong direction.

## 4. Long division

- [x] 4.1 Implement wall skill `long-div-1digit` from `divisionTrace`, displayed inline per
      `design.md` decision 4a, composing the dividend from a drawn quotient and one-digit
      divisor and requiring at least one non-zero intermediate remainder, so
      `forgot-bring-down` and `ignored-step-remainder` both survive the central filter on
      every problem at every difficulty.
- [x] 4.2 Implement `long-div-remainder` on the `divide-quotient` operation, composing a
      dividend that never divides exactly, showing the remainder in the worked solution while
      the stated answer is the whole quotient, and diagnosing the remainder given for the
      quotient and a quotient rounded up.
- [x] 4.3 Implement wall skill `long-div-2digit` with a two-digit divisor, displayed inline,
      using `offBy` on the leading quotient place for the `estimate-low`/`estimate-high` pair,
      and solution steps that show each digit as an estimate checked against the working value.
- [x] 4.4 Confirm every division ladder scales the **quotient** per `design.md` decision 4b,
      since `sourceMagnitude` measures an inline display by its answer — a ladder that grows
      only the dividend fails the scaling test.

## 5. Number-property generators

- [x] 5.1 Add the local factor, multiple and primality helpers the unit needs, with tests
      covering 1, a prime, a perfect square, and a highly composite value.
- [x] 5.2 Implement `factors` through `choice-input` with complete authored factor lists as
      labels, drawing only values with at least six factors so the omitted-ends distractor is
      still a list, and diagnosing an omitted 1-and-itself pair and an included non-factor.
- [x] 5.3 Implement `multiples` through `choice-input` with authored lists, diagnosing factors
      listed instead of multiples and a list started at zero.
- [x] 5.4 Implement `primes` through `choice-input` as prime-versus-composite classification,
      nudging with the actual divisor pair rather than restating the classification.
- [x] 5.5 Give all three skills numeric-string choice ids per `design.md` decision 3, and
      assert in the unit test that each declared misconception value matches a declared choice
      id — a non-numeric id disables filtering and diagnosis without failing anything else.

## 6. Division stories

- [x] 6.1 Replace the wrong-operation ternary in `engine/phrasing.ts` with the explicit partner
      map from `design.md` decision 5, keeping `+`, `−` and `×` results identical, and add a
      test pinning `÷ → ×`.
- [x] 6.2 Add at least eight adult-situation division frames in
      `src/curriculum/phrasing/division.ts` with fixed prose, machine-readable quantities, and
      frame-specific nudges.
- [x] 6.3 Add `÷` source-check quantities that divide exactly by both the second quantity and
      the distractor, register the division bank under `div-words`/`unit-4` in
      `phrasing/frames.test.ts`, add the `÷` assertion block mirroring the existing `×` one,
      and add a synthetic broken division frame proving the check names it.
- [x] 6.4 Implement `div-words` over the registered bank, composing a dividend divisible by
      both the divisor and the distractor, with the distractor never one and never the divisor.

## 7. Unit integration and tests

- [x] 7.1 Register `unit04` in `src/curriculum/index.ts` and update coverage counts, unit
      grouping assertions, and the committed unlock snapshot for the 11-skill path.
- [x] 7.2 Add `requires: ['choice-input']` to `stage-b.ts`, correct its header comment claiming
      no capability requirements, add Stage B to `manifest.test.ts`'s named-consumer
      assertion, and change `coverage.test.ts`'s Stage B case from `requires` being undefined
      to requiring only built capabilities. Confirm no skill's resolved state moves.
- [x] 7.3 Add `src/curriculum/unit-04-division.test.ts` with focused assertions that the trace
      agrees with each hint, solution detail and misconception value, that every choice skill's
      correct option is present exactly once, and a recorded-output snapshot over all 11 skills.
- [x] 7.4 Run the targeted engine, phrasing, Unit 4, generator, manifest, coverage and content
      tests; fix every draw exhaustion, content-contract, recomputation and graph failure.
- [x] 7.5 Confirm the Unit 0–3 recorded-output snapshots are byte-identical, proving the shared
      phrasing and engine edits changed nothing already shipped.

## 8. Documentation and repository gates

- [x] 8.1 Mark all 11 Unit 4 rows built in `docs/curriculum.md`, tick roadmap item 11 with the
      decisions this change actually settled, restate the roadmap's progress line, and correct
      the active-queue sentence in `AGENTS.md`.
- [x] 8.2 Run `npm test`, `npm run build` and `npm run lint`; resolve every failure and every
      warning other than the three documented pre-existing `Settings.tsx` warnings.
- [x] 8.3 Drive the real app in a browser: open a Unit 4 lesson, answer correctly and
      incorrectly to see a diagnosis rather than a bare rejection, exercise a choice-input
      skill and a long-division skill, and confirm the unit appears in the tree after Unit 3.
