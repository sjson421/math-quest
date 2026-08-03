## 1. Multiplication engine

- [x] 1.1 Add `multiplicationTrace` and `partialProductTrace` in
      `src/curriculum/engine/multiplication.ts`, including place-aligned rows and exports.
- [x] 1.2 Add trace tests for multi-ten carries, leading carries, zero multiplier digits,
      aligned tens rows, and independently recombined results.
- [x] 1.3 Add the four multiplication misconception factories from `design.md` and tests
      proving their values, collision guarantees, and named failures on invalid places.

## 2. Meaning and table generators

- [x] 2.1 Implement `mult-meaning` with repeated-addition and text-described array working,
      seeded operand order, measurable difficulty, and equal-group misconceptions.
- [x] 2.2 Implement `times-2` with doubling language and a five-band partner ladder.
- [x] 2.3 Implement `times-10` with zero-pattern language and a dropped-zero diagnosis.
- [x] 2.4 Implement `times-5` with half-of-ten language and distinct group-count diagnoses.
- [x] 2.5 Implement `times-3` with three-group language and distinct group-count diagnoses.
- [x] 2.6 Implement `times-4` with double-twice language and distinct group-count diagnoses.
- [x] 2.7 Implement `times-6` with six-group language and distinct group-count diagnoses.
- [x] 2.8 Implement `times-9` with the curriculum's digit-sum pattern, using ten groups minus
      one as its arithmetic check, and derived diagnoses.
- [x] 2.9 Implement wall skill `times-7-8`, drawing both tables and guaranteeing one-group-low
      and one-group-high diagnoses survive.
- [x] 2.10 Implement `times-mixed` across the learned 2–12 table range with measurable
      difficulty and varied, seeded operand order.

## 3. Place-value and column generators

- [x] 3.1 Implement `mult-by-10-100` with shifted-place working and distinct missing-zero
      diagnoses for both multipliers.
- [x] 3.2 Implement wall skill `mult-2by1` from `multiplicationTrace`, requiring a real carry
      and using the low/high carry-error pair from `design.md`.
- [x] 3.3 Implement wall skill `mult-2by2` from `partialProductTrace`, requiring meaningful
      non-zero rows and diagnosing a missing placeholder and an omitted tens row.

## 4. Multiplication stories

- [x] 4.1 Add at least eight adult-situation multiplication frames with fixed prose,
      machine-readable quantities, and frame-specific nudges.
- [x] 4.2 Add valid `×` source-check quantities, including rejection of addition/product
      collisions, and register the multiplication bank under `mult-words`/`unit-3`, with a
      synthetic failure that names a bad frame.
- [x] 4.3 Implement `mult-words` over the registered bank with constrained group, size, and
      distractor draws.

## 5. Unit integration and tests

- [x] 5.1 Register `unit03` in `src/curriculum/index.ts` and update coverage counts, unit
      grouping assertions, and the committed unlock snapshot for the 14-skill path.
- [x] 5.2 Add `src/curriculum/unit-03-multiplication.test.ts` with focused assertions that
      traces agree with hints, solution details, and misconception values, plus a
      recorded-output snapshot over all 14 skills.
- [x] 5.3 Run targeted engine, phrasing, Unit 3, generator, manifest, coverage, and progress
      tests; fix draw exhaustion, content-contract, recomputation, and graph failures.

## 6. Documentation and repository gates

- [x] 6.1 Mark all 14 Unit 3 rows built in `docs/curriculum.md`, update roadmap status and
      item 10 with shipped decisions, and correct the active-queue sentence in `AGENTS.md`.
- [x] 6.2 Run `npm test`, `npm run build`, and `npm run lint`; resolve every failure and every
      warning except the three documented `Settings.tsx` warnings.

## 7. Drive the real app

- [x] 7.1 In a controlled browser, confirm Unit 3 appears after Unit 2 in curriculum order;
      play all three multiplication walls through diagnosed wrong answers, verify
      partial-product working and the digit-only keypad, and confirm a quick Unit 3 lesson
      ends at 5 correct.
