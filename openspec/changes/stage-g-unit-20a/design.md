## Context

See `proposal.md` for motivation and scope. The current `diagram` display owns a closed
fraction-only `ShapeDiagram`, `ProblemView` stacks it above the existing entry frame, and all
exhaustive consumers derive its accessible text and answer from the same part counts. The
archived diagram design explicitly deferred Unit 20 labels, marks, and arbitrary geometry
until a real consumer defined them.

Stage G already has every required manifest capability. Structured math notation can draw the
provided formulas, and `approx` can compare a numeric entry within a tolerance, but no shipped
generator uses approximate answers. The new work therefore extends an existing presentation
owner and adds content; it does not add a manifest capability, input mode, answer type, or
stored state.

## Goals / Non-Goals

**Goals:**

- Preserve fraction-diagram data and recorded output exactly while adding the five figure
  families required by 20a.
- Make drawing, accessible naming, formula choices, and independent answer verification read
  one structured geometry declaration.
- Set π and rounded-answer behavior once for Unit 20 and make the first three geometry walls
  retain two useful diagnoses on every draw.
- Keep the figure, formulas, entry frame, and intro legible on the installed phone surface.

**Non-Goals:**

- A reusable arbitrary geometry scene graph or support for later composite, 3D, net,
  Pythagorean, or paired-figure requirements.
- A proportional drafting tool. Figures communicate named measurements and relationships; they
  do not claim scale.
- Unit entry, formula entry, a formula-sheet route, or any other new learner interaction.

## Decisions

### Add a closed geometry union beside the existing fraction record

A focused geometry-diagram module will define a union with top-level `kind: 'geometry'` and an
operation discriminator. Each operation carries only its required values:

- `perimeter` and `area-rectangle`: length, width, unit
- `area-triangle`: base, perpendicular height, unit
- `area-parallelogram`: base, perpendicular height, unit
- `area-trapezoid`: first base, second base, perpendicular height, unit
- `circumference`: radius, unit
- `area-circle`: diameter, unit

`Display` widens its existing `diagram` payload to the fraction or geometry union. Existing
fraction helpers continue to accept only `ShapeDiagram`; exhaustive diagram consumers first
narrow `diagram.kind` and retain their old branch unchanged. This avoids migrating fraction
fixtures, snapshots, or accessible names.

A second display kind was rejected because geometry has the same presentation ownership and
entry composition as a fraction diagram. Replacing `ShapeDiagram` with a generic scene graph
was rejected because it would encode later roadmap work without a current requirement and
would weaken operation-specific validation.

### Derive fixed SVG templates and formula choices from the operation

A geometry renderer will validate before reading measurements and select one fixed responsive
SVG template per operation family. Labels use only `cm`, `m`, `in`, and `ft`, while accessible
names expand the same values. Rectangles show a corner mark;
triangles, parallelograms, and trapezoids show a perpendicular height guide and right-angle
mark; circumference draws a radius segment; circle area draws a full diameter segment.

The renderer derives a two-formula reference set from the operation using existing
`MathNotation` primitives. Perimeter and rectangle area share their two rectangle formulas;
triangle area pairs `A = bh` with `A = bh/2`; parallelogram and trapezoid area share their two
formulas; and both circle skills show circumference and circle-area formulas. Neither reference
is visually marked as correct, so the learner chooses before applying it. Formula data is not
stored on each problem, so a generator cannot pair a figure with unrelated references. Figure
SVG owns one image name; each formula owns a separate math name. Visual children remain hidden
from the accessibility tree.

Authored SVG, freehand paths, and authored formula strings were rejected because they can
disagree with the measurements and operation used by verification. Canvas and a rendering
dependency were rejected because local semantic markup and node-side static rendering already
fit the architecture.

### Keep formula policy in Unit 20 and answer comparison in its existing owner

Unit 20 will hold shared constants and helpers for `GED_PI = 3.14`, nearest-tenth rounding,
and tolerance `0.05`. Polygon generators declare exact whole-number answers. Circumference and
circle area declare the rounded target through `approx`, enable the decimal key, and state both
π and rounding in the prompt.

Tolerance spans half one tenth around the displayed target. This deliberately accepts a more
precise value inside the same rounding interval: these skills teach choosing and applying the
provided geometry formula, not decimal-place form. Adding a new `requireRounded` answer arm was
rejected because the existing approximate comparison expresses the required behavior.

π and tolerance do not travel as per-problem configuration. They are fixed curriculum policy,
and repeating them in generated data would create values that could drift. Independent tests
recompute them from the published literals rather than import the generator's answer helper.

### Make the shown circle measure differ from the formula measure

`circumference` shows a radius while providing `C = πd`; the learner doubles radius first.
`area-circle` shows an even diameter while providing `A = πr²`; the learner halves diameter
first. This follows the manifest's wall notes and makes radius-versus-diameter understanding
observable instead of showing the exact variable the formula requests.

Circle draws exclude collision cases. Circumference predicts the rounded result from treating
radius as diameter and the rounded area result. Circle area predicts the rounded result from
squaring diameter and the rounded circumference result. Triangle area predicts base times
height and base plus height. Each generator constrains source values until the correct target
and both predictions are pairwise distinct after rounding where applicable.

For `area-parallelogram-trapezoid`, seeded selection covers both families. Trapezoid draws keep
their two bases distinct and choose values with a whole-number half-product. All measurement
bands grow with difficulty without making a label exceed the bounded SVG surface.

### Extend every existing gate at the diagram owner

Recorded output will serialize the operation, all measurements, unit, derived figure name,
and formula references before the existing answer, keypad, and misconception fields. Learner-text
collection will include both derived accessible names. The global verifier will narrow
fraction versus geometry data; its geometry branch will rebuild visible labels, formulas,
exact polygon answers, circle conversions, nearest-tenth targets, and tolerance without using
the generator's formatter or answer helper.

Focused pure tests own data validation and derived labels. Static component tests own SVG
marks, formula markup, accessible ownership, and read-only behavior. The Unit 20 suite owns
each generator's arithmetic, difficulty coverage, figure variation, keypad reachability,
wall diagnoses, reviewed teaching lines, stable intro examples, and recorded snapshots.

### Ship documentation as one partial roadmap increment

The generator registry gains one Unit 20 module after Unit 19. Coverage pins the six
implemented Stage G ids, 16 remaining planned ids, and total 179. Curriculum rows 20.1–20.6
gain completion markers. Roadmap increment 20a gains its shipped note and the header count
changes, but parent item 26 stays unchecked because four ordered increments remain.

## Risks / Trade-offs

- **Geometry labels can collide at phone width**: use fixed templates with bounded label
  positions, assert no horizontal overflow in Chromium, and inspect the required screenshot.
- **A nested diagram union can weaken exhaustive checks**: narrow on the unique geometry kind
  in every existing diagram consumer and keep `never` branches inside the operation switch.
- **Approximate answers can hide a wrong formula if predictions fall inside tolerance**: round
  predictions to the learner's form, constrain pairwise separation, and test checking plus
  diagnosis over every sampled problem.
- **Fixed templates are not proportional to generated dimensions**: accessible and visible
  labels state the authoritative measurements; no figure claims to be drawn to scale.
- **Later Unit 20 work needs more figure families**: extend the closed union only when 20b or
  20c supplies concrete data and verification requirements.

## Migration Plan

1. Add and test the geometry declaration, derived formula references and labels, and SVG renderer while
   leaving the registry unchanged.
2. Extend exhaustive diagram consumers and prove existing fraction output is unchanged.
3. Add each generator with independent tests, then register the six together and update
   coverage and authorities.
4. Run focused and full gates, then validate every lesson and intro at 375 by 812 pixels in
   scripted Chromium and inspect the passing screenshot.

Rollback removes the six registered generators and Unit 20 files, removes the geometry union
branch and renderer, restores coverage and documentation counts, and leaves the original
fraction diagram behavior intact. No stored or synced data needs migration or rollback.
