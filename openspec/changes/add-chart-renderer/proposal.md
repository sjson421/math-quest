## Why

Stage G cannot ship its two chart-reading skills until problems can carry and render truthful,
accessible chart data on the 375-pixel offline lesson surface. Roadmap item 24 isolates that
infrastructure now so Unit 21 content can later derive answers from the same values the learner
sees.

## What Changes

- Add a validated structured model for labelled bar, line, and scatter charts, including an
  optional scatter trend line derived from plotted points rather than authored separately.
- Add shared, local SVG axes and renderers that remain legible at 375 pixels and distinguish
  multiple series without relying on color alone.
- Give every chart one derived accessible image name and expose all charted values through a
  semantic non-visual table.
- Add a `chart` display arm and explicit policies in every exhaustive display consumer, while
  retaining the problem's existing answer control and failing independent answer verification
  closed until Unit 21 supplies operation-specific semantics.
- Mark the existing manifest capability `chart` available and prove that all 28 Stage G and H
  skills remain planned because none has a generator.
- Update `AGENTS.md`, the README, curriculum capability and planned-count notes, and roadmap
  item 24. Correct their stale explanations: `math-notation`, `diagram`, and coordinate-plane
  input are already available, 28 skills are planned, and generator absence—not another Stage
  G capability—keeps Stage G unplayable after this change.

This is capability infrastructure for Stage G, Unit 21. Its deliberately scoped future
consumers are exactly `read-bar-line` (21.5) and `read-scatterplot` (21.6); neither gains a
generator in this change.

### Non-goals

- Adding any Stage G generator, marking a curriculum skill built, or changing the playable
  skill count.
- Choosing Unit 21 operands, prompts, answers, hints, solutions, difficulty ladders, or
  misconceptions.
- Adding chart interaction, animation, zooming, tooltips, canvas, a runtime service, an
  external chart library, or a generic scene graph.
- Extending the existing coordinate-plane display or using it as a categorical chart.
- Building geometry figures for Unit 20 or timed mode for Stage H.

## Capabilities

### New Capabilities

- `chart-rendering`: Typed, accessible SVG bar, line, and scatter charts with a textual data
  path on the offline phone lesson surface.

### Modified Capabilities

- `curriculum-manifest`: Mark the existing `chart` requirement available while preserving
  generator-gated skill state and the 173-skill playable set.

## Impact

The shared `Display` union and its exhaustive render, learner-text, recorded-output,
independent-verification, and difficulty-source consumers gain a chart branch. A pure chart
module and SVG component own validation, geometry, naming, semantic tabular data, and focused
tests. Manifest coverage and capability documentation gain the availability flag. No runtime
dependency, generator registry, stored progress shape, sync payload, answer type, input mode,
or playable skill changes.
