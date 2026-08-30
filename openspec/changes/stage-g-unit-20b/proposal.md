## Why

Roadmap increment 20b is next in order and adds the six remaining Unit 20 skills before
`similar-figures`. Existing geometry support stops at 20a, so it cannot yet represent
composite outlines, solids, a surface-area net, or a missing-side right triangle.

## What Changes

- Add Stage G, Unit 20 generators for `composite-figures`, `volume-prism`,
  `volume-cylinder`, `volume-cone-pyramid-sphere`, `surface-area`, and `pythagorean` in
  manifest order.
- Extend validated geometry diagrams and their local SVG renderer with an L-shaped composite
  figure, prism and round-solid views, cone/pyramid/sphere variants, a rectangular-prism net,
  and right triangles whose leg or hypotenuse is missing.
- Derive every dimension label, unit, accessible name, and GED formula reference from the
  same operation data used to verify the answer. Pythagorean references use existing radical
  notation.
- Use exact whole-number answers for composite figures, prisms, pyramids, surface area, and
  scaled Pythagorean triples. Reuse π = 3.14 and the existing nearest-tenth approximate-answer
  policy for cylinders, cones, and spheres.
- Give `pythagorean` two distinct, reachable predictions on every generated problem: placing
  the hypotenuse incorrectly and omitting the square root.
- Add reviewed teaching lines, stable difficulty-1 examples, independent answer checks,
  recorded output, static rendering, content coverage, and real-app phone validation for all
  six skills.
- Register the generators, mark curriculum rows 20.7–20.12 complete, record increment 20b as
  shipped, and raise the playable count from 179 to 185. Roadmap item 26 remains unchecked.
- Add no new manifest capability, display kind, input mode, answer type, dependency, or stored
  data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-20-geometry-measurement`: Add generated lessons and teaching contracts for the six
  selected Unit 20b skills.
- `diagram-rendering`: Extend the closed geometry surface with the concrete 2D, 3D, net, and
  right-triangle figures required by 20b while preserving existing diagrams.
- `problem-generation`: Independently recover, record, and check the new geometry figures,
  formulas, exact or rounded answers, and Pythagorean diagnoses.
- `curriculum-manifest`: Resolve Unit 20 through `pythagorean` as implemented without changing
  Stage G capabilities, membership, or prerequisite authority.
- `skill-intros`: Present complete, stable Unit 20b examples through the same geometry and
  answer renderers used in practice.

## Non-goals

- Unit 20c `similar-figures`, any Unit 21 content, or paired scale figures.
- An arbitrary geometry scene graph, proportional drafting, solid-only surface-area picture,
  formula-sheet route, or authored SVG and formula payloads.
- A new diagram capability, interaction surface, answer form, runtime dependency, or formula
  memorisation requirement.
- Requiring learners to type units, π, radicals, or formulas; answers remain numeric through
  the existing keypad.
- Any progress, sync, mastery, review, skip-ahead, timed-mode, or persistence change.

## Impact

- Geometry model and rendering: the existing geometry-diagram library, SVG component, static
  tests, recorded-output owner, learner-text collector, and independent generator verifier.
- Curriculum: the existing Unit 20 generator module and focused tests, registry coverage,
  snapshots, curriculum and roadmap authorities, and status text.
- Intro and layout proof: static markup plus scripted Chromium at 375 by 812 pixels.
- No package, API, network, manifest capability, or stored-progress migration.
