## Why

Math notation is the next rendering dependency in the roadmap, but adopting KaTeX would
precache its JavaScript and fonts for every offline learner. The repository needs a measured
decision against a hand-authored markup-and-CSS alternative before item 17b makes either
approach part of the learner-facing display contract.

## What Changes

- Build disposable KaTeX and structured React/CSS notation arms against the same examples
  drawn from the notation Stages D–G require.
- Measure each arm in the real Vite/PWA build, separating JavaScript, CSS, font assets, and
  total precache cost rather than comparing package metadata.
- Compare static-markup testability, accessible output, 375px layout, offline behavior, and
  how much notation-specific structure each approach needs for fractions, mixed numbers,
  superscripts, radicals, and later formulas.
- Record the measurements, rejected alternative, selected renderer, and the consequence for
  the existing `katex` capability name in the change design and roadmap.
- Remove every disposable arm and every experimental dependency after the decision.

This change is tooling-only. No curriculum stage, unit, or skill id is implemented or made
playable, and no new rendering capability is shipped.

### Non-goals

- Adding the math arm to `Display` or implementing its production renderer.
- Adding `katex` or `fraction-input` to `AVAILABLE_CAPABILITIES`.
- Adding any Stage D–G generator or changing manifest requirements.
- Building diagram rendering, expression input, coordinate-plane input, or chart rendering.
- Keeping any prototype code, fixture, or experimental dependency after the decision; even
  the selected production dependency waits for item 17b.

## Capabilities

### New Capabilities

None. This decision spike is tooling-only and declares `skip_specs: true`.

### Modified Capabilities

None.

## Impact

The active change design and `docs/roadmap.md` gain the measured renderer decision.
Disposable spike components may temporarily touch the application entry, styles,
dependencies, and lockfile while each real bundle is measured, but production source and
dependencies return to their baseline state before completion. Item 17b remains responsible
for the learner-facing renderer and capability flags.
