## 1. Coordinate content contract

- [x] 1.1 Add the closed coordinate-operation data union to the coordinate-plane display while
  preserving generic plane fixtures and the missing-operation tripwire.
- [x] 1.2 Render structured plot targets and semantic x/y tables in passive and interactive
  coordinate-plane compositions, with focused static component coverage.
- [x] 1.3 Extend independent answer derivation, learner-text collection, recorded output, and
  their synthetic tests for every coordinate operation arm and invalid visible shape.

## 2. Unit 16a generators

- [x] 2.1 Implement `plot-points` with reachable swapped-order and vertical-direction point
  misconceptions, exact coordinate input, and a widening finite candidate draw.
- [x] 2.2 Add independent `plot-points` tests for visible source agreement, point reachability,
  both surviving wall diagnoses, sign/quadrant variety, and difficulty scaling.
- [x] 2.3 Implement `quadrants` with one non-axis plotted point, four shuffled choices, and
  stable sign-derived quadrant identities.
- [x] 2.4 Add independent `quadrants` tests for all four sign combinations, offered choices,
  display/answer agreement, deterministic option order, and difficulty scaling.
- [x] 2.5 Implement `table-to-graph` with structured linear rows, one identified target row,
  pre-plotted non-target rows, coordinate input, and a reachable swapped-row prediction.
- [x] 2.6 Add independent `table-to-graph` tests for table/plane agreement, unique target
  selection, exact row collinearity, pre-plotted rows, reachable prediction, row variety, and
  difficulty scaling.
- [x] 2.7 Implement `slope-from-graph` with one line, two marked lattice points, exact reduced
  non-zero slope, enterable rational keypad rules, and a run-over-rise diagnosis.
- [x] 2.8 Add independent `slope-from-graph` tests for line/point agreement, exact rise-over-run,
  rejection of horizontal and vertical draws, reduced answers, reachable predictions,
  signed/fractional keypad rules, and difficulty scaling.
- [x] 2.9 Implement `slope-from-points` with two unjoined lattice points and two distinct wall
  diagnoses for inconsistent subtraction order and run-over-rise inversion.
- [x] 2.10 Add independent `slope-from-points` tests for finite non-unit slopes, exact reduction,
  both surviving wall diagnoses, enterable keypad rules, and difficulty scaling.
- [x] 2.11 Implement `y-intercept` with a composed in-bounds integer intercept, non-zero integer
  slope, signed keypad rules, and a distinct slope-as-intercept diagnosis.
- [x] 2.12 Add independent `y-intercept` tests for exact line-derived intercepts, in-bounds
  crossings, reachable diagnoses, sign variety, and difficulty scaling.

## 3. Course integration and records

- [x] 3.1 Register Unit 16a in curriculum order, declare Stage F's existing choice capability,
  update coverage counts and snapshots to 151 playable skills, and prove Unit 16's final four
  skills remain planned.
- [x] 3.2 Add the Unit 16 recorded-output snapshot and update `docs/curriculum.md` with six ✅
  markers plus `docs/roadmap.md` with status 151 and a shipped 16a increment while item 23 stays
  unchecked.

## 4. Verification

- [x] 4.1 Run the focused Unit 16, coordinate-plane, content-rule, recorded-output, generator,
  manifest, and coverage tests; fix every scoped failure.
- [x] 4.2 Run `npm test`, `npm run build`, and `npm run lint`; accept only the documented
  pre-existing Settings warnings and record any other failure before fixing it.
- [x] 4.3 Run real-app scripted Chromium validation at 375px for plot placement, table-row
  placement, and passive fractional slope entry; confirm behavior and overflow assertions,
  capture screenshots, visually inspect at least one, then stop any server started for the run.
