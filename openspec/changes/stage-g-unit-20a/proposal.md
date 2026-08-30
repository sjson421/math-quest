## Why

Stage G has all declared capabilities but no playable content. Roadmap increment 20a opens its
first six Geometry and Measurement skills and supplies the labelled figures and fixed answer
policies those skills need.

## What Changes

- Add Stage G, Unit 20 generators for `perimeter`, `area-rectangle`, `area-triangle`,
  `area-parallelogram-trapezoid`, `circumference`, and `area-circle` in manifest order.
- Extend the existing diagram surface with validated rectangle, triangle, parallelogram,
  trapezoid, and circle figures. Figures derive dimension labels, units, right-angle marks,
  accessible names, and GED-provided structured formula reference sets from source data.
- Use exact numeric answers for polygon work. Circle work uses π = 3.14, rounds the target to
  the nearest tenth, and checks it through the existing `approx` answer with tolerance 0.05.
- Give the three wall skills two distinct, reachable predicted misconceptions per generated
  problem: omitting one-half or adding dimensions for triangle area; confusing radius with
  diameter or using area for circumference; and squaring diameter or using circumference for
  circle area.
- Add reviewed teaching lines and stable difficulty-1 worked examples for all six skills.
- Extend independent verification, recorded output, learner-text collection, static rendering,
  and real-app phone checks for the new figure data and first approximate content.
- Register the six generators, mark curriculum rows 20.1–20.6 complete, record increment 20a as
  shipped, and raise the playable count from 173 to 179. Roadmap item 26 remains unchecked.
- Add no new manifest capability, input mode, answer type, dependency, or stored data.

## Capabilities

### New Capabilities

- `unit-20-geometry-measurement`: Generated Unit 20a lessons for perimeter, polygon area,
  circumference, and circle area with provided formula choices and independently verifiable
  figures.

### Modified Capabilities

- `diagram-rendering`: Render validated, labelled geometry figures and their provided formula
  reference sets through the existing diagram display while preserving fraction diagrams.
- `problem-generation`: Carry and independently verify every visible geometry measurement,
  formula choice, exact result, rounded result, and predicted mistake.
- `curriculum-manifest`: Resolve the first six Stage G skills as implemented and keep registry,
  curriculum, roadmap, and playable counts aligned.
- `skill-intros`: Keep Stage G geometry examples complete and readable on the installed phone
  surface through the same figure, formulas, and approximate-answer renderers used in practice.

## Non-goals

- Unit 20b skills `composite-figures` through `pythagorean`, Unit 20c `similar-figures`, or any
  Unit 21 content.
- Composite outlines, three-dimensional figures, nets, paired figures, arbitrary scene graphs,
  or geometry beyond the five figure families required by 20a.
- A new diagram capability, display kind, input mode, answer type, formula-sheet screen, or
  runtime rendering dependency.
- Requiring learners to type units, π, or formulas; answers remain numeric on the existing
  keypad.
- Any progress, sync, mastery, review, skip-ahead, timed-mode, or persistence change.

## Impact

- Geometry model and rendering: a focused geometry-diagram library and SVG component, plus the
  existing diagram branch in problem display, learner-text, recorded-output, and verification
  owners.
- Curriculum: a Unit 20 generator module, independent tests and snapshots, registry and coverage
  assertions, `docs/curriculum.md`, and `docs/roadmap.md`.
- Intro and layout proof: static markup plus scripted Chromium at 375 by 812 pixels.
- No package, API, network, manifest capability, or stored-progress migration.
