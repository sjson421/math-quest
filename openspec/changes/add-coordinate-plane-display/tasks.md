## 1. Coordinate-plane model

- [x] 1.1 Add the closed axis, point, line, and plane records with validation and focused
  invalid-data tests for finite integer values, zero-crossing and zero-aligned divisible
  scales, two-through-twenty intervals, unique in-bounds points, at most two nondegenerate
  visible and mutually non-coincident lines, and named errors. Prove coincidence rejection for
  identical endpoints, reversed endpoints, and different collinear integer point pairs. Reject
  exact boundary segments whose direct rational-to-number graph coordinates collapse to one
  point.
- [x] 1.2 Add pure helpers and focused tests for axis values, typographic coordinate labels,
  singular derived accessible graph names, and line clipping across diagonal, corner,
  horizontal, vertical, non-intersecting, near-corner, graph-space sub-ULP collapsed, and the
  cancellation-prone `(±10000000000000000, ±1)` rational-conversion cases.

## 2. Static graph renderer

- [x] 2.1 Build the dependency-free responsive SVG renderer with integer gridlines and labels,
  emphasized zero axes, plotted points, clipped line segments, solid/dashed two-line styling,
  butt-capped line strokes contained by a rectangular plot-area clip path, one derived image
  name, transform-collapse rejection, and a hidden drawing subtree.
- [x] 2.2 Add static component tests covering representative point, one-line, two-line,
  vertical-line, and twenty-interval planes, including exact element counts, singular
  accessibility ownership, boundary centerline coordinates, plot-clip ownership, derived
  styles, the `(6, −4)` to `(1125899906842631, 1125899906842620)` viewBox-collapse fixture,
  and absence of canvas or external assets.

## 3. Display integration and tripwires

- [x] 3.1 Add the exhaustive `coordinate-plane` `Display` arm and `ProblemView` branch. Let
  choices and number lines own their answer surface without a repeated echo, and frame keypad
  and expression entries beneath a neutral `Answer` label without graph-equals-answer
  semantics; add first-paint component coverage for both categories and a synthetic lesson
  case proving a graph-reading choice problem still presents the graph and choice control
  together without a duplicate display-owned answer surface.
- [x] 3.2 Extend learner-text collection, recorded-output formatting, independent verification,
  and difficulty-source measurement with explicit graph policies. Add synthetic tests proving
  the graph is named and recorded completely, invalid data names its owner, and answer
  recomputation fails closed until content supplies operation-specific semantics.
- [x] 3.3 Update roadmap increment 22a with the shipped display decisions while leaving item 22
  unchecked, 22b deferred, `coordinate-plane` unavailable, every Stage F skill planned, and
  the playable count unchanged at 145. Correct 22b's stale `Answer`-arm inventory to include
  the already-built expression arm without changing its deferred point-answer scope.

## 4. Verification

- [x] 4.1 Run focused coordinate-plane, `ProblemView`, content-rule, recorded-output, generator,
  and coverage tests, including a synthetic assertion that Stage F remains planned and the
  capability set is unchanged.
- [x] 4.2 Run strict OpenSpec validation, the full test suite, production build, and lint;
  retain only documented pre-existing warnings.
- [x] 4.3 Temporarily mount representative point, one-line, two-line, vertical-line, and
  twenty-interval fixtures in the real app; run scripted Chromium from `docs/environment.md`
  at 375px with role/name, SVG-count, no-overflow, 12 CSS-pixel grid-spacing, and solid/dashed
  style and plot-clip assertions; inspect the passing screenshot for labels, clipping, alignment,
  collisions, and truthful choice/typed answer framing; remove the fixture and wiring, rerun
  focused tests and the production build, stop any temporary server, and confirm its port is
  free.
