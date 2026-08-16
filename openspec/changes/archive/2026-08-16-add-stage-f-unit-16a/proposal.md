## Why

Stage F's coordinate-plane infrastructure is complete but has no content, so all 28 skills
remain planned. Roadmap item 23's first ordered increment now needs the six Unit 16 generators
that teach point placement, quadrants, table plotting, slope, and y-intercepts while closing the
independent-verification tripwire deliberately left by item 22.

## What Changes

- Add exactly six Stage F, Unit 16 generators in curriculum order:
  - `plot-points` — place one stated ordered pair on the existing coordinate-plane input; as
    both `quick` and a wall, diagnose swapped coordinates and a vertical-direction error.
  - `quadrants` — read one plotted non-axis point and choose its quadrant.
  - `table-to-graph` — read a small semantic x/y table and place its identified row on a plane
    where the other rows are already plotted.
  - `slope-from-graph` — read the exact rise over run from a line with two marked lattice
    points.
  - `slope-from-points` — compute slope from two plotted points with no line; as a wall,
    diagnose inconsistent subtraction order and run-over-rise inversion.
  - `y-intercept` — read the signed integer where a plotted line crosses the y-axis.
- Add operation-specific coordinate source data beside the generic plane declaration so every
  answer is independently derivable from what the problem carries, without trusting the
  generator's stated answer.
- Render the point named by `plot-points` and the x/y rows used by `table-to-graph` as semantic
  local markup adjacent to the existing interactive plane. A table is ordinary structured
  content here, not item 24's chart-rendering capability.
- Add per-skill independent tests, recorded-output snapshots, coverage updates, curriculum ✅
  markers, and real-app 375-pixel validation for both interactive and passive graph problems.
- Update roadmap status to 151 playable skills and record increment 16a as shipped while
  leaving item 23 unchecked for its five remaining increments.

No new capability is required. Stage F gains the already-available `choice-input` declaration
used by `quadrants`, beside its existing `math-notation`, `expression-input`, and
`coordinate-plane` declarations.

### Non-goals

- Implementing Unit 16 increment 16b (`slope-intercept` through
  `parallel-perpendicular`) or deciding `graph-from-equation`'s line-authoring answer shape.
- Implementing Units 17–19, chart rendering, multi-point line input, fractional lattice
  placement, or a general table/chart component.
- Changing Stage F's manifest entries, prerequisites, or `AVAILABLE_CAPABILITIES` beyond adding
  the existing `choice-input` capability to the stage declaration.
- Changing stored progress, sync payloads, lesson adaptation, point submission, or the generic
  coordinate-plane geometry and clipping model.

## Capabilities

### New Capabilities

- `unit-16-coordinate-plane-lines`: The first six Unit 16 skills, their generated operands,
  input modes, structured coordinate context, exact answers, difficulty ladders, and predicted
  misconceptions.

### Modified Capabilities

- `problem-generation`: Coordinate-plane displays may carry operation-specific source data,
  and the global verifier derives point, quadrant, slope, and intercept answers from that data
  and the validated visible plane.
- `coordinate-plane-display`: A coordinate-plane lesson may place a stated target point or a
  semantic x/y table beside the graph while preserving the plane's single derived accessible
  image name and phone-bounded layout.

## Impact

- `src/curriculum/unit-16-coordinate-plane-lines.ts` and its focused test and snapshot are new;
  `src/curriculum/index.ts`, coverage expectations, and global generator verification register
  and verify the increment.
- `src/curriculum/manifest/stage-f.ts` declares the already-built choice input used by
  `quadrants`; no capability availability switch changes.
- `src/lib/types.ts` gains a closed coordinate-operation data union on the coordinate-plane
  display. Content-text and recorded-output consumers handle it exhaustively.
- Coordinate-plane lesson components render the target/table context for passive and
  interactive compositions without adding another answer surface.
- `docs/curriculum.md` and `docs/roadmap.md` record the six newly playable skills. The manifest,
  capability set, runtime dependencies, persisted data, and sync contract are unchanged.
