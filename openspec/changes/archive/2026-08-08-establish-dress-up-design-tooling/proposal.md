## Why

Pip already earns coins and is drawn as composable SVG geometry, but the project has no
contract for creating cosmetics without duplicating the mascot, drifting from the visual
language, or committing to an animation runtime by accident. The authoring rules and runtime
decision need to exist before the first outfit makes either expensive to change.

## What Changes

- Add a canonical mascot-design skill under `.agents/skills/mascot-design/`, with an
  equivalent Claude mirror, that defines Pip's coordinate system, layer order, attachment
  anchors, palette, geometry, motion, accessibility, licensing, and review conventions.
- Define a reusable authoring workflow in which each final cosmetic is one small SVG layer
  attached to a stable slot rather than a complete Pip variant or a set of animation frames.
- Run the same representative Pip interaction through hand-authored SVG with the existing
  Framer Motion dependency, Rive, and dotLottie; compare visual capability, composition,
  accessibility, offline behavior, bundle cost, testability, and source-review quality.
- Record the measured result and final runtime decision. Layered SVG remains the default
  unless the spike demonstrates a required capability that justifies another runtime and
  its authoring workflow.

This change is tooling-only. No curriculum stage, unit, or skill id is in scope, and no new
input, rendering, or learner capability is required.

### Non-goals

- Shipping outfits, inventory, a shop, a room, pricing, or coin-spending behavior.
- Changing Pip's current appearance, expressions, animation states, or application API.
- Adding a production Rive or dotLottie dependency before the spike decision.
- Creating final cosmetic or room artwork beyond the minimum disposable spike material.
- Changing progress storage or sync; item 16 owns cosmetic inventory and its round trip.

## Capabilities

### New Capabilities

None. This change is tooling-only and declares `skip_specs: true`.

### Modified Capabilities

None.

## Impact

Repository agent skills and their Claude mirror gain mascot-authoring guidance. Planning
artifacts gain a recorded animation-runtime decision, and disposable spike work may add
development-only files while it is evaluated. `src/components/Mascot.tsx`, the progress
record, application dependencies, and learner-facing behavior remain unchanged unless a
separately proposed follow-up implements the recorded decision.
