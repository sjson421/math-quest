## Why

Stage F cannot present the graphs its first two units ask learners to read because `Display`
has no coordinate-plane arm. Roadmap increment 22a must establish a typed, accessible,
phone-sized graph surface before either coordinate-plane input or Stage F content can land.

## What Changes

- Add a structured coordinate-plane model for bounded integer axes, plotted points, and one
  or two mathematically distinct lines, with validation, exact-boundary line clipping, and an
  accessible name that describes the same graph data.
- Add a local responsive SVG renderer and a `coordinate-plane` display arm that leaves choice
  and number-line input as their own answer surfaces and gives keypad and expression input a
  neutral answer frame without claiming the graph equals the entered value.
- Extend every exhaustive display consumer so graph data is rendered, collected as learner
  text, recorded, validated, and left behind a deliberate independent-verification tripwire
  until a content change supplies operation-specific meaning.
- Measure representative one-line, two-line, and plotted-point graphs in the real app at a
  375-pixel viewport, including the display's full answer-row composition.
- Record roadmap increment 22a as shipped while leaving item 22 open for 22b.

This is capability infrastructure for Stage F. It prepares the display surface required by
Unit 16 skills `table-to-graph`, `slope-from-graph`, `graph-from-equation`, and
`equation-from-graph`, plus Unit 17 skill `system-by-graphing`; none gains a generator or
becomes playable in this change.

### Non-goals

- Implementing `plot-points` or any other Stage F generator, or marking a curriculum skill
  built.
- Adding coordinate-plane input, tap placement, confirmation, a point answer arm, or
  non-scalar point misconceptions; roadmap increment 22b owns them.
- Adding `coordinate-plane` to `AVAILABLE_CAPABILITIES`; 22b owns capability activation.
- Building chart rendering, a general-purpose scene graph, authored SVG, canvas rendering,
  or a runtime rendering dependency.
- Encoding content-specific answer derivations such as slope, intercept, equation, or system
  intersection in the generic graph model.

## Capabilities

### New Capabilities

- `coordinate-plane-display`: Typed, accessible SVG coordinate planes with bounded axes,
  plotted points, and up to two clipped lines on the offline lesson surface.

### Modified Capabilities

None.

## Impact

The shared problem `Display` union and its exhaustive render, learner-text, recorded-output,
independent-verification, and difficulty-source consumers gain a coordinate-plane branch. A
new pure graph module and SVG component own validation, geometry, naming, and focused tests.
The roadmap records the partial increment, but the manifest capability set, generator
registry, progress/sync data, runtime dependencies, and playable-skill count stay unchanged.
