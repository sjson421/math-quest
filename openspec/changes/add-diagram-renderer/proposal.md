## Why

Stage D is blocked on a diagram surface that can show fraction meaning as accessible,
phone-readable shapes. The roadmap fixes that surface before Unit 7 content so its first
generators can carry verifiable shape data instead of inventing markup.

## What Changes

- Add a typed shaded-shape model for bars, circles, and grids, carrying total parts and
  shaded parts as answer-recomputable data.
- Add a local SVG renderer with one derived accessible name per figure and responsive sizing
  for the 375-pixel lesson surface.
- Add a `diagram` display arm and integrate it with the lesson's answer slot and every
  exhaustive display consumer.
- Mark the existing manifest capability `diagram` available while proving that availability
  alone adds no playable skills.
- Update the README, curriculum capability notes, and roadmap to record the shipped
  infrastructure and close roadmap item 18 without changing the playable-skill count.

This is capability infrastructure for Stage D, Unit 7. The deliberately scoped future
consumers are exactly `fraction-of-shape` (7.2) and `equivalent-visual` (7.5); neither gains a
generator in this change.

### Non-goals

- Adding any Unit 7 generator or marking any curriculum skill row built.
- Adding labelled dimensions, composite outlines, right-angle marks, or other Unit 20
  geometry features.
- Building chart rendering, coordinate-plane input, or a general-purpose scene graph.
- Rendering through canvas, external assets, or a runtime service.

## Capabilities

### New Capabilities

- `diagram-rendering`: Typed, accessible SVG bars, circles, and grids for fraction meaning.

### Modified Capabilities

- `curriculum-manifest`: Mark the existing `diagram` requirement available while preserving
  generator-gated skill state and the 61-skill playable set.

## Impact

The `Display` union and its exhaustive render, text, recording, and verification consumers
gain a diagram arm. A new renderer component and focused tests own SVG geometry,
accessibility, and phone sizing. Manifest coverage and documentation gain the capability
flag. No runtime dependency, generator registry, stored progress shape, sync payload, or
playable skill changes.
