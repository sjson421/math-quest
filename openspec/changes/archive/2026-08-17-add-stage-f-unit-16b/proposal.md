## Why

Unit 16's final four skills are still planned after increment 16a. Roadmap item 23 now calls
for slope-intercept form, selecting and reading a line, and parallel/perpendicular slopes,
including a settled answer shape for the skill that asks which graph matches an equation.

## What Changes

- Add exactly four Stage F, Unit 16 generators in curriculum order:
  - `slope-intercept` — read either the slope or y-intercept from a generated
    `y = mx + b` equation and answer with an exact number.
  - `graph-from-equation` — choose which of two candidate lines on one rendered coordinate
    plane matches a generated equation. Existing solid/dashed line styles and text choice
    identities distinguish the candidates without new input or rendering infrastructure.
  - `equation-from-graph` — read a plotted line and enter the right side of `y =` through
    existing single-variable expression input.
  - `parallel-perpendicular` — derive an exact parallel or perpendicular slope, including
    negative reciprocals, through the numeric keypad.
- Extend operation-specific coordinate data and independent verification so each scoped
  equation, graph choice, expression, and slope answer is derived from visible structured
  values rather than trusted from the generator.
- Render generated `y = mx + b` context beside the existing passive graph from structured
  coefficients, with no second graph, answer entry, canvas, or runtime dependency.
- Add per-skill independent tests, recorded-output snapshots, coverage updates, curriculum
  completion markers, and real-app validation at 375 pixels.
- Update roadmap status to 155 playable skills and record increment 16b as shipped while
  leaving item 23 unchecked for Units 17–19.

No new capability or capability extension is required. The change composes the existing
coordinate-plane display, choice input, expression input, and keypad answer surfaces.

### Non-goals

- Implementing Units 17–19, chart rendering, systems, polynomials, quadratics, or functions.
- Adding line authoring, a line-valued answer, graphical choice cards, another input mode,
  drag gestures, fractional lattice placement, or more than two displayed lines.
- Expanding expression input to fractions, division, exponents, multiple variables, or a
  complete equation grammar; scoped expression answers use integer linear forms in `x`.
- Changing Stage F manifest entries, prerequisites, `AVAILABLE_CAPABILITIES`, stored progress,
  sync payloads, lesson adaptation, or generic coordinate-plane geometry and clipping.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-16-coordinate-plane-lines`: Add the final four Unit 16 skills, their generated
  operands, input modes, structured coordinate operations, exact answers, difficulty ladders,
  and misconceptions.
- `coordinate-plane-display`: Render structured linear-equation context beside one or two
  existing passive lines while preserving its accessibility and phone-layout contracts.
- `problem-generation`: Independently derive all four new Unit 16 answers from their declared
  equation, graph, and relationship data.

## Impact

- `src/lib/types.ts` and exhaustive coordinate-operation consumers gain four content records;
  no `Answer`, `Choice`, `Display`, or input-mode union changes.
- `CoordinateContext` renders equation context from structured coefficients. The existing
  coordinate-plane renderer and choice component are reused unchanged.
- `src/curriculum/unit-16-coordinate-plane-lines.ts`, its focused tests and snapshots, global
  verification, content collection, and coverage expectations gain four generators.
- `docs/curriculum.md` and `docs/roadmap.md` record the completed unit and new playable total.
  Dependencies, capability availability, persisted data, and sync behavior remain unchanged.
