## 1. Chart model

- [x] 1.1 Add the closed categorical and scatter chart records with 32-character title,
  16-character axis, eight-character category, 12-character series, two-through-six category,
  one-or-two series, and three-through-twelve point bounds; safe-integer −999-through-999 data,
  exact integer scale validation, category/value alignment, bar zero-baseline enforcement, and
  named invalid-data tests.
- [x] 1.2 Add pure helpers and focused tests for tick values, typographic numeric labels,
  categorical and numeric transforms, grouped bar bounds, complete accessible names and table
  rows, and least-squares scatter trend segments clipped to all four plot edges across rising,
  falling, horizontal, edge-only, and invalid no-x-variation cases.

## 2. Static chart renderer

- [x] 2.1 Build the dependency-free responsive chart composition with shared SVG axes, titles,
  ticks, labels and legend; grouped bars, connected line points, scatter points and derived trend
  lines inside a rectangular plot clip; pattern/dash/marker series distinctions; one derived
  image name; a hidden visual subtree; and one semantic source-value table.
- [x] 2.2 Add static component tests for one- and two-series bar, line, and scatter charts,
  including exact mark and table structure, singular image ownership, series order and non-color
  styles, rectangular trend clipping and painted-stroke containment, maximum-length labels,
  densest supported declarations, and absence of canvas or external assets.

## 3. Display integration and tripwires

- [x] 3.1 Add the exhaustive `chart` `Display` arm and `ProblemView` branch. Frame keypad and
  expression entries beneath neutral `Answer` text, let choice and other self-owned controls
  avoid a duplicate echo, and add first-paint plus synthetic lesson coverage for both answer
  compositions.
- [x] 3.2 Extend learner-text collection, recorded-output formatting, independent verification,
  and difficulty-source measurement with explicit chart policies. Add synthetic tests proving
  labels and values are collected and recorded completely, invalid declarations name their
  owner, magnitude comes from chart sources, and answer recomputation fails closed until Unit
  21 supplies operation-specific data.

## 4. Capability and documentation

- [x] 4.1 Add `chart` to `AVAILABLE_CAPABILITIES` and extend coverage tests to prove Stage G has
  no unavailable requirement while all 22 Stage G skills, all six Stage H skills, the course
  tree, the generator registry, and the 173-skill implemented set remain unchanged.
- [x] 4.2 Update `AGENTS.md` with `chart` available and 28 skills planned; make the README's
  remaining-infrastructure statement name only timed mode; mark chart rendering built, remove
  Stage G's stale chart dependency prose, and correct 36 planned to 28 in `docs/curriculum.md`;
  then close roadmap item 24 with the implemented data, accessibility, rendering, verification,
  and availability decisions, correcting its claim that already-available `math-notation` and
  `diagram` still block Stage G.

## 5. Verification

- [x] 5.1 Run focused chart, `ProblemView`, lesson, content-rule, recorded-output, generator, and
  coverage tests, including the synthetic unchanged-skill-state assertions.
- [x] 5.2 Run strict OpenSpec validation, the full test suite, production build, and lint; retain
  only documented pre-existing warnings.
- [x] 5.3 Temporarily mount representative one- and two-series bar, line, and scatter fixtures in
  the real app, including maximum-length labels and four-character ticks in the densest
  supported declarations, a trend line, and keypad and choice answer surfaces. Run scripted
  Chromium from `docs/environment.md` at 375 pixels with
  image/table ownership, exact mark, no-overflow, label/legend collision, and non-color-style
  assertions; inspect the passing screenshot for axes, alignment, legibility, series identity,
  trend placement, and truthful answer framing; remove the fixture and wiring exactly, rerun
  focused tests and the production build, stop any temporary server, and confirm its port is
  free.
