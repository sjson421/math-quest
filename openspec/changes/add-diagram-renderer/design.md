## Context

See `proposal.md` for motivation and scope. `Display` currently has inline, column, story,
and math arms. `ProblemView`, learner-text collection, recorded-output formatting, and
independent answer verification narrow that union exhaustively. Widening it therefore requires
each consumer to make an explicit choice before the first Unit 7 generator lands.

The roadmap fixes the new surface to equal-part bars, circles, and grids represented as data,
rendered as accessible SVG, and measured at 375 pixels. It explicitly defers Unit 20's
labelled dimensions, composite outlines, and right-angle marks. No current generator emits a
diagram, so capability availability must remain separate from generator-backed skill state.

## Goals / Non-Goals

**Goals:**

- Make a figure's mathematical value, visible partitions, and accessible name derive from one
  small data object.
- Give all three shapes one reusable rendering and validation owner.
- Preserve the existing answer-entry and independent-verification contracts.
- Leave exhaustive tripwires for later content rather than allowing a diagram to bypass a
  gate silently.
- Keep the renderer local, dependency-free, static-renderable, and legible on the target
  phone width.

**Non-Goals:**

- Encoding arbitrary geometry, labels, marks, freehand paths, or per-cell artwork.
- Choosing operands, wording, hints, solutions, or misconceptions for either Unit 7 skill.
- Adding a diagram-specific answer control or stored lesson state.

## Decisions

### Use one closed shaded-shape record

Define a `ShapeDiagram` record with `kind: 'bar' | 'circle' | 'grid'`, `parts`, and
`shadedParts`, and add `{ kind: 'diagram', diagram: ShapeDiagram }` to `Display`. A shared
validator enforces positive integer parts and an integer shaded count between zero and the
total before geometry or answer recomputation uses the values.

The renderer shades the first contiguous parts in a stable order: left to right for bars and
grids, clockwise from the top for circles. Which particular equal pieces are shaded does not
change the represented fraction, so a per-part boolean mask would be redundant authored state.
Separate records for each shape were rejected because their mathematical payload and validity
rules are identical. A generic scene graph was rejected because it adds Unit 20 concepts the
roadmap deliberately defers.

### Derive each SVG from the record

A reusable `ShapeDiagram` component owns validation, a fixed view box, geometry, palette, and
accessibility. Bars split a rectangle into equal vertical pieces. Circles use equal sector
paths, with explicit whole-circle handling so a one-part or fully shaded circle has valid SVG.
Grids choose the closest factor pair around the square root of `parts`; prime counts
deterministically become a single row. This keeps every cell equal and avoids storing rows and
columns that could disagree with the declared total.

Each SVG is responsive within a bounded lesson-sized wrapper. The SVG itself owns
`role="img"` and a derived name such as “circle in 4 parts, 3 shaded”; its visual subtree is
hidden from accessibility APIs. An authored label was rejected because it could drift from
the same values used to draw and verify the figure. Canvas and external rendering libraries
were rejected because static node rendering, offline availability, and semantic markup are
requirements.

### Keep the diagram display separate from input

`ProblemView` adds a diagram branch that stacks the bounded figure above the ordinary equals
sign and `EntrySlot`. The display does not widen `inputMode`, lesson state, or answer checking;
a later generator can request the already-built fraction keypad through its normal keypad
rules. Vertical composition is chosen over placing the figure and a fraction entry in one row
because the widest grid and answer must remain legible together at 375 pixels.

Putting diagram data beside `Problem.display` was rejected: the figure is the problem's
primary presentation, so making it optional side data would allow a generator to declare it
while another display arm silently wins.

### Extend every display gate explicitly

Learner-text collection reads the derived accessible name. Recorded-output formatting records
the shape and both counts. Independent answer verification validates the diagram and derives
the exact shaded-over-total value from it rather than trusting `Problem.answer`.
`ProblemView` and each pure consumer retain exhaustive `never` branches, so any future display
kind still fails closed until every owner chooses behavior.

Treating a diagram as empty text was rejected because its accessible name is learner-facing
content. Treating it as unverifiable was rejected because the roadmap specifically carries
part counts to make the answer independently derivable.

### Mark the manifest capability available without content

Add `diagram` to `AVAILABLE_CAPABILITIES` only after the model, renderer, integrations, and
tests exist. Coverage asserts that every Stage D capability is then available while all Stage
D skills remain planned and the playable total remains 61, because no generator enters this
change. Documentation records the infrastructure and closes item 18 without marking a skill
built.

Waiting for Unit 7 generators to add the flag was rejected because item 18 is the roadmap's
explicit capability owner. Adding a placeholder generator was rejected because capability
work and content work are separate changes.

### Validate layout through a disposable real-app fixture

No production lesson can reach a diagram yet. Temporarily mount 12-part bar, circle, and grid
displays plus an 11-part prime grid in the real app, then run the scripted Chromium workflow at
375 pixels. Assert role/name ownership, exact partition counts, no overflow, and a 12 CSS-pixel
minimum shortest dimension from each partition's rendered bounding box. Inspect the required
screenshot for alignment and legibility that dimensions cannot establish, remove the fixture
and its wiring, and rerun the build so validation surface cannot ship.

A permanent preview route was rejected because it would add learner-reachable surface with no
curriculum owner. Static markup alone was rejected because it cannot expose collapsed pieces,
misaligned sectors, or overflow.

## Risks / Trade-offs

- **Many circle sectors can expose hairline seams** → Use one shared center and exact endpoint
  calculations, then inspect dense representative circles in Chromium.
- **Prime grid counts become wide single rows** → Bound the responsive SVG, prove an 11-part
  fixture keeps every cell at least 12 CSS pixels wide at 375 pixels, and let future content
  constrain its draws if pedagogy demands a different shape.
- **Validation adds a runtime failure path** → Throw a named error before producing misleading
  geometry, and cover every invalid count class with pure tests.
- **The first shaded pieces are visually predictable** → Accept the stable arrangement because
  this capability teaches amount, not spatial invariance; a later content change can extend the
  model if a named skill needs randomized placement.
- **Capability availability can look like content shipped** → Pin the unchanged generator-backed
  playable set in coverage and keep all Unit 7 document rows unmarked.

## Migration Plan

1. Add the validated shape model, derived geometry and accessible SVG renderer with static
   tests.
2. Add the diagram display branch and extend every exhaustive display consumer.
3. Mark `diagram` available and prove skill state and the playable count remain unchanged.
4. Update capability documentation and close roadmap item 18.
5. Temporarily mount representative fixtures, run and inspect the 375-pixel browser gate,
   remove the fixture exactly, then rerun verification.

Rollback removes the display arm and renderer, removes the `diagram` availability flag, and
reopens roadmap item 18. There is no stored progress or sync migration to reverse.
