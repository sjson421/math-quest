## Why

Roadmap item 22a made coordinate planes readable but left Stage F without the point-placement
input that its first skill requires. Increment 22b completes that capability now so later
Stage F content can ask for an ordered pair without encoding the point as a scalar or charging
an attempt for an imprecise tap.

## What Changes

- Add a coordinate-plane input mode that exposes every declared lattice intersection as a
  labelled placement target, keeps the latest placement visible, and requires a separate
  confirmation before submission.
- Add a structured point answer and a canonical internal point entry so confirmed placements
  use the existing answer-checking, feedback, progress, and requeue flow.
- Add structured point-valued misconceptions with answer-collision filtering, per-kind
  deduplication, and exact point diagnosis.
- Mark `coordinate-plane` available while proving that availability alone leaves all 28
  generator-less Stage F skills planned and the playable total at 145.
- Close roadmap item 22 and update capability-status prose now that both display and input
  increments are built.

This is capability infrastructure for Stage F, Unit 16. No curriculum skill id gains a
generator in this change; `plot-points` is the first deferred consumer.

## Capabilities

### New Capabilities

- `coordinate-plane-input`: Lattice-point placement, correction before confirmation,
  accessible point targets, and submission through the ordinary lesson flow.

### Modified Capabilities

- `answer-entry`: Add an exact structured point answer and coordinate-plane input routing.
- `coordinate-plane-display`: Preserve passive graph-reading compositions while allowing the
  new coordinate-plane input mode to turn the same declared graph into its answer surface.
- `problem-generation`: Filter, deduplicate, preserve, and diagnose structured point
  misconceptions.
- `curriculum-manifest`: Record the completed coordinate-plane capability as available without
  making generator-less Stage F content playable.

## Impact

- Extends the `Answer`, `Misconception`, and `Problem['inputMode']` unions and every exhaustive
  consumer of those types.
- Extends the existing local SVG coordinate-plane surface with markup-based point controls; no
  runtime service, canvas, external asset, or new dependency is introduced.
- Updates lesson routing, answer checking, central misconception handling, recorded-output
  formatting, coverage assertions, component tests, pure geometry/input tests, roadmap status,
  and curriculum capability documentation.
- Leaves progress storage and sync unchanged because a confirmed point still records the same
  correct/incorrect attempt result and optional misconception tag.

## Non-goals

- No Stage F generator is added, including `plot-points`, `quadrants`, `table-to-graph`,
  `slope-from-graph`, `slope-from-points`, `y-intercept`, `slope-intercept`,
  `graph-from-equation`, `equation-from-graph`, or `parallel-perpendicular`.
- No two-point line-authoring answer, free-drag interaction, fractional-coordinate placement,
  chart input, or graph animation is added.
- No curriculum manifest membership, prerequisite, pacing, or progress-sync shape changes.
