## Why

Stages E and F contain the final 62 playable skills that still open directly on a problem
even though the curriculum promises one teaching line and one worked example before first
practice. Increments 25a–25c proved the shared intro mechanism through Stage D, so increment
25d can complete the playable course and make teaching content a required part of every
generator from now on.

## What Changes

- Add one authored teaching line to every Stage E and F generator:
  - Unit 12: `exponent-meaning`, `evaluate-powers`, `perfect-squares`, `estimate-roots`,
    `exponent-multiply`, `exponent-divide`, `power-of-power`, `zero-neg-exponents`,
    `scientific-notation`, and `pemdas-exponents`.
  - Unit 13: `variable-meaning`, `evaluate-expression`, `words-to-expression`,
    `identify-like-terms`, `combine-like-terms`, `distributive`, `distribute-negative`, and
    `factor-gcf`.
  - Unit 14: `equation-balance`, `one-step-addsub`, `one-step-multdiv`, `two-step`,
    `vars-both-sides`, `equation-parentheses`, `with-fractions`, `special-solutions`,
    `equation-words`, and `rearrange-formula`.
  - Unit 15: `inequality-symbols`, `graph-inequality`, `solve-one-step-ineq`,
    `solve-multi-step-ineq`, `flip-the-sign`, and `compound-inequalities`.
  - Unit 16: `plot-points`, `quadrants`, `table-to-graph`, `slope-from-graph`,
    `slope-from-points`, `y-intercept`, `slope-intercept`, `graph-from-equation`,
    `equation-from-graph`, and `parallel-perpendicular`.
  - Unit 17: `system-by-graphing`, `substitution`, `elimination`, and `system-words`.
  - Unit 18: `add-polynomials`, `sub-polynomials`, `mult-monomial`, `foil`,
    `factor-gcf-poly`, `factor-trinomial`, `difference-of-squares`, `solve-by-factoring`, and
    `quadratic-formula`.
  - Unit 19: `function-notation`, `evaluate-function`, `domain-range`,
    `linear-vs-nonlinear`, and `compare-functions`.
- Reuse the existing fixed difficulty-1 generated example, display renderer, worked steps,
  intro state, and Review intro flow without changing generated problems or lesson progress.
- Pin every reviewed line at its generator owner, validate it through the shared content
  rules, and independently verify every fixed example answer from visible or semantic data.
- Extend manifest-derived coverage to all 173 playable generators and pin the tracked
  current-unit vocabulary used by the 62 new lines.
- Make `teachingLine` required on `SkillConfig` and `SkillGenerator` now that every playable
  generator carries one, so future Stage G and H generators cannot ship without intros.
- Verify all 62 Stage E and F intros remain complete and readable at 375 by 812 pixels,
  including notation, equations, coordinate planes, expression answers, and root-pair
  answers.
- Mark roadmap item 25 complete and update learner-facing project documentation.
- Add no new manifest capability, input mode, renderer, runtime dependency, data-model
  field, migration, or API change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skill-content-contract`: Requires one checked teaching line on every playable generator
  after the staged rollout ends.
- `skill-intros`: Extends the installed-phone layout guarantee through all Stage E and F
  intros and their advanced problem representations.
- `unit-12-exponents-roots`: Assigns and requires the ten reviewed Unit 12 teaching lines.
- `unit-13-expressions`: Assigns and requires the eight reviewed Unit 13 teaching lines.
- `unit-14-linear-equations`: Assigns and requires the ten reviewed Unit 14 teaching lines.
- `unit-15-inequalities`: Assigns and requires the six reviewed Unit 15 teaching lines.
- `unit-16-coordinate-plane-lines`: Assigns and requires the ten reviewed Unit 16 teaching
  lines.
- `unit-17-systems-equations`: Assigns and requires the four reviewed Unit 17 teaching lines.
- `unit-18-polynomials-quadratics`: Assigns and requires the nine reviewed Unit 18 teaching
  lines.
- `unit-19-functions`: Assigns and requires the five reviewed Unit 19 teaching lines.

## Non-goals

- New intro UI, persistence, sync, lesson, reward, unlock, or answer-control behavior.
- Intros for planned Stages G and H; those stages carry teaching lines with their generators.
- Authored example operands, new artwork, a second problem renderer, or a separate intro
  content registry.
- Changes to generated prompts, displays, answers, hints, solutions, choices, story frames,
  or misconceptions.
- New vocabulary terms or changes to the curated vocabulary authority.

## Impact

- Teaching metadata in `src/curriculum/unit-12-exponents-roots.ts` through
  `src/curriculum/unit-19-functions.ts`.
- Required generator typing in `src/lib/types.ts` and `src/curriculum/engine/problem.ts`.
- Exact-line and fixed-example checks in the eight matching unit test files, plus complete
  presence and vocabulary coverage in `src/curriculum/coverage.test.ts`.
- Baseline behavior for the content contract, skill intros, and Units 12–19, with README,
  curriculum summary, roadmap, focused tests, full gates, and real-browser validation updated
  to match.
- No external API, stored-data, dependency, or capability change.
