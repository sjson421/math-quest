## Why

Stage B's 44 playable skills still open directly on a problem even though the curriculum
promises one teaching line and one worked example before first practice. Increment 25a built
the shared intro mechanism; increment 25b now supplies the missing Stage B teaching content.

## What Changes

- Add one authored teaching line to every Stage B generator in Units 1–5:
  - Unit 1: `add-facts-small`, `add-facts`, `add-tens`, `add-2digit-nocarry`,
    `add-2digit-carry`, `add-3digit`, `add-three-numbers`, and `add-words`.
  - Unit 2: `sub-facts-small`, `sub-facts`, `sub-tens`, `sub-2digit-noborrow`,
    `sub-2digit-borrow`, `sub-3digit-borrow`, `sub-across-zero`, and `sub-words`.
  - Unit 3: `mult-meaning`, `times-2`, `times-10`, `times-5`, `times-3`,
    `times-4`, `times-6`, `times-9`, `times-7-8`, `times-mixed`,
    `mult-by-10-100`, `mult-2by1`, `mult-2by2`, and `mult-words`.
  - Unit 4: `div-meaning`, `div-facts`, `div-remainder`, `div-by-10-100`,
    `long-div-1digit`, `long-div-remainder`, `long-div-2digit`, `factors`,
    `multiples`, `primes`, and `div-words`.
  - Unit 5: `two-operations`, `with-parentheses`, and `pemdas`.
- Reuse the existing fixed difficulty-1 generated example, display renderer, worked steps,
  intro state, and Review intro flow without changing generated problems or lesson progress.
- Require teaching-line source checks and independent fixed-example answer checks for every
  Stage B skill, and update curriculum coverage to recognize Stages A and B as completed
  intro increments.
- Verify all 44 Stage B intros remain complete and readable at 375 by 812 pixels.
- Update learner-facing project documentation and roadmap increment 25b while leaving roadmap
  item 25 open for increments 25c and 25d.
- Add no new manifest capability, input mode, renderer, runtime dependency, data-model field,
  migration, or API change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skill-intros`: Extends the installed-phone layout guarantee to all 44 Stage B intros.
- `unit-01-addition`: Assigns and requires the eight reviewed Unit 1 teaching lines.
- `unit-02-subtraction`: Assigns and requires the eight reviewed Unit 2 teaching lines.
- `unit-03-multiplication`: Assigns and requires the 14 reviewed Unit 3 teaching lines.
- `unit-04-division`: Assigns and requires the 11 reviewed Unit 4 teaching lines.
- `unit-05-order-of-operations`: Assigns and requires the three reviewed Unit 5 teaching
  lines.

## Non-goals

- Teaching lines for Stages C–F; roadmap increments 25c and 25d own them.
- Intros for planned Stages G–H; those stages carry intros with their generators.
- Making `teachingLine` required before every playable skill carries it in increment 25d.
- Changing intro UI, persistence, sync, lesson length, warm-up generation, recovery, rewards,
  unlocking, answer controls, generated prompts, hints, solutions, or misconceptions.
- Authored example operands, new artwork, a second problem renderer, or a separate intro
  content registry.

## Impact

- Teaching metadata in `src/curriculum/unit-01-addition.ts` through
  `src/curriculum/unit-05-order-of-operations.ts`, including the existing Unit 3 table-skill
  helper.
- Exact-line and fixed-example checks in the five matching unit test files, plus staged
  presence and vocabulary coverage in `src/curriculum/coverage.test.ts`.
- Baseline behavior for skill intros and Units 1–5, with README, curriculum summary, roadmap,
  focused tests, full gates, and real-browser validation updated to match.
