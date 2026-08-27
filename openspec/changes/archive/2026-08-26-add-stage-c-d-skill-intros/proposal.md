## Why

Stages C and D contain 59 playable skills that still open directly on a problem even though
the curriculum promises one teaching line and one worked example before first practice.
Increments 25a and 25b built and proved the shared intro mechanism, so increment 25c can now
supply the missing teaching content through Unit 11, including the first diagram-based intros.

## What Changes

- Add one authored teaching line to every Stage C and D generator in Units 6–11:
  - Unit 6: `negatives-numberline`, `compare-negatives`, `add-neg-pos`, `add-two-negs`,
    `sub-negatives`, `mult-negatives`, `div-negatives`, `absolute-value`, and
    `negatives-mixed`.
  - Unit 7: `fraction-meaning`, `fraction-of-shape`, `name-parts`,
    `fractions-numberline`, `equivalent-visual`, `equivalent-multiply`,
    `simplify-fractions`, `compare-same-den`, and `compare-diff-den`.
  - Unit 8: `add-frac-same-den`, `sub-frac-same-den`, `common-denominator`,
    `add-frac-diff-den`, `sub-frac-diff-den`, `improper-to-mixed`,
    `mixed-to-improper`, `add-mixed`, `sub-mixed`, `mult-fractions`, `div-fractions`,
    and `fraction-words`.
  - Unit 9: `decimal-place-value`, `read-decimals`, `compare-decimals`,
    `round-decimals`, `add-decimals`, `sub-decimals`, `mult-decimals`,
    `div-decimal-by-whole`, `div-by-decimal`, `fraction-to-decimal`,
    `decimal-to-fraction`, and `money-problems`.
  - Unit 10: `percent-meaning`, `percent-to-decimal`, `decimal-to-percent`,
    `percent-to-fraction`, `percent-of`, `find-the-percent`, `find-the-whole`,
    `percent-change`, `discount-tax-tip`, and `simple-interest`.
  - Unit 11: `write-ratios`, `simplify-ratios`, `unit-rate`, `solve-proportions`,
    `scale-drawings`, `unit-conversion`, and `ratio-words`.
- Reuse the existing fixed difficulty-1 generated example, display renderer, worked steps,
  intro state, and Review intro flow without changing generated problems or lesson progress.
- Pin every reviewed line at its generator owner, validate it through the shared content
  rules, and independently verify every fixed example answer from visible semantic data.
- Extend staged curriculum coverage to require teaching lines on exactly Stages A–D and pin
  the tracked current-unit vocabulary used by the 59 new lines.
- Verify all 59 Stage C and D intros remain complete and readable at 375 by 812 pixels,
  including diagram, notation, number-line, choice, decimal-column, and story examples.
- Correct roadmap increment 25c from 57 skills to the manifest-authoritative 59 skills and
  update learner-facing project documentation while leaving roadmap item 25 open for 25d.
- Add no new manifest capability, input mode, renderer, runtime dependency, data-model field,
  migration, or API change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skill-intros`: Extends the installed-phone layout guarantee to all 59 Stage C and D
  intros, including the first generated diagram examples.
- `unit-06-negatives`: Assigns and requires the nine reviewed Unit 6 teaching lines.
- `unit-07-fractions-meaning`: Assigns and requires the nine reviewed Unit 7 teaching lines.
- `unit-08-fraction-operations`: Assigns and requires the 12 reviewed Unit 8 teaching lines.
- `unit-09-decimals`: Assigns and requires the 12 reviewed Unit 9 teaching lines.
- `unit-10-percents`: Assigns and requires the ten reviewed Unit 10 teaching lines.
- `unit-11-ratios-proportions`: Assigns and requires the seven reviewed Unit 11 teaching
  lines.

## Non-goals

- Teaching lines for Stages E and F; roadmap increment 25d owns them.
- Intros for planned Stages G and H; those stages carry intros with their generators.
- Making `teachingLine` required before all playable skills carry it in increment 25d.
- Changing intro UI, persistence, sync, lesson length, warm-up generation, recovery, rewards,
  unlocking, answer controls, generated prompts, hints, solutions, or misconceptions.
- Authored example operands, new artwork, a second problem renderer, or a separate intro
  content registry.

## Impact

- Teaching metadata in `src/curriculum/unit-06-negatives.ts` through
  `src/curriculum/unit-11-ratios-proportions.ts`.
- Exact-line and fixed-example checks in the six matching unit test files, plus staged
  presence and vocabulary coverage in `src/curriculum/coverage.test.ts`.
- Baseline behavior for skill intros and Units 6–11, with README, curriculum summary,
  roadmap, focused tests, full gates, and real-browser validation updated to match.
