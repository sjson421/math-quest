## Context

See `proposal.md` for motivation and scope. Increment 20a established one passive `diagram`
display carrying a closed `GeometryDiagram` union. Its model validates operation-specific
measurements, derives labels and two structured formula references, and feeds one fixed local
SVG renderer. Recorded output, learner-text collection, and the global generator verifier all
narrow the same geometry declaration exhaustively.

That ownership fits 20b. Stage G already has `diagram` and `math-notation`; exact and
approximate numeric answers already share the keypad. The missing work is concrete geometry
data, rendering, and content, not another capability or answer surface.

## Goals / Non-Goals

**Goals:**

- Extend the closed geometry model only with the figure families 20b requires.
- Keep figures, labels, formulas, answers, accessible names, and independent verification on
  one operation-specific source declaration.
- Reuse Unit 20's π and nearest-tenth policy while keeping non-π work exact.
- Make the Pythagorean wall diagnose hypotenuse placement on both missing-side variants.
- Preserve fraction diagrams and every Unit 20a output while fitting the larger figures and
  formulas on the installed phone surface.

**Non-Goals:**

- A generic scene graph, authored paths, proportional drafting, or infrastructure for 20c.
- Perspective-correct solids. Fixed templates communicate family and labelled relationships;
  measurements remain authoritative.
- New answer comparison, unit entry, formula entry, or radical entry.

## Decisions

### Extend the closed operation union at its existing owner

`GeometryDiagram` will gain concrete arms for:

- composite area: outer length and width plus one corner cut-out length and width
- rectangular-prism volume: length, width, and height
- cylinder and cone volume: radius and perpendicular height
- rectangular-pyramid volume: base length, base width, and perpendicular height
- sphere volume: radius
- rectangular-prism surface area: length, width, and height
- Pythagorean work: either two known legs with the hypotenuse missing, or one known leg and
  the hypotenuse with the other leg missing

Cone, pyramid, and sphere remain separate operation arms even though one generator selects
among them. Their fields, formulas, answer policies, and drawings differ, so one broad
`solid` record with optional fields would weaken validation and exhaustive checking.

The existing `diagram` display remains unchanged. A new display kind was rejected because
20b figures have the same ownership and composition as 20a figures: passive visual evidence
above one existing keypad. A generic shape/face/path graph was rejected because it would move
mathematical meaning into loosely related authored nodes and guess at 20c.

### Add fixed templates, with a net as the surface-area source

The geometry component will select one responsive local SVG template per operation. The
composite template is an L-shaped outline with a visible rectangular split. Rectangular
prisms, cylinders, cones, pyramids, and spheres use fixed non-proportional solid templates
with only the required measurements. The surface-area template is a cross-shaped rectangular-
prism net containing all six faces; it does not reuse a prism solid. Right triangles show a
right-angle mark, known side labels, and `?` on the missing side.

All visual children stay behind one derived image name. Measurement labels continue to come
from the operation model, including square or cubic meaning where a label represents base
area rather than a length. Formula references remain separate accessible math nodes. Existing
Unit 20a templates are not redrawn.

A separate 3D renderer was rejected because it would duplicate the same validation, label,
formula, accessibility, and layout shell. Canvas, image assets, and a drawing dependency were
rejected because static local SVG already satisfies offline and node-rendered tests.

### Derive two neutral formula references per operation

The geometry model continues to derive formulas rather than accept them from generators:

- composite figures: rectangle area beside rectangle perimeter
- prism and pyramid: `V = Bh` beside `V = Bh/3`
- cylinder and cone: `V = πr²h` beside `V = πr²h/3`
- sphere: `V = 4πr³/3` beside `SA = 4πr²`
- surface area: `SA = 2lw + 2lh + 2wh` beside `V = lwh`
- Pythagorean work: `c = √(a² + b²)` beside `a = √(c² − b²)`

Existing `MathNotation` text, row, fraction, superscript, and radical nodes express every
formula. Neither formula is highlighted. This keeps the curriculum contract focused on
choosing and applying a provided formula while preventing authored formula strings from
drifting from the figure operation.

Showing only the matching formula was rejected because it removes the choice the unit teaches.
Adding a formula-selection input was rejected because formulas are reference material, not a
second answer surface.

### Keep π policy shared and all other selected targets exact

Composite area, rectangular-prism volume, rectangular-pyramid volume, rectangular-prism
surface area, and Pythagorean triples use exact whole-number answers. Pyramid draws constrain
base area times height to a multiple of three. Pythagorean frames choose a primitive triple
and a positive difficulty-scaled multiplier, then hide either the hypotenuse or one leg.

Cylinders, cones, and spheres reuse `GED_PI = 3.14`, nearest-tenth rounding, approximate
tolerance `0.05`, and the decimal key. These constants remain Unit 20 curriculum policy, not
per-problem fields. The global verifier independently applies the published literals instead
of importing the generator's answer helper.

New answer kinds or `requireRounded` rules were rejected because the existing approximate
interval already defines accepted nearest-tenth results. Irrational Pythagorean answers were
rejected because they would add another rounding policy to a skill whose stated wall is side
placement.

### Compose bounded frames and constrain collisions before return

Each generator draws from difficulty bands that grow source measurements while keeping fixed
SVG labels short. Composite cut-outs remain strictly smaller than the outer rectangle.
Rectangular-pyramid frames keep the one-third result integral. The grouped solid generator
uses seeded selection and focused sampling tests to cover cone, pyramid, and sphere.

`pythagorean` samples both missing roles. For a missing hypotenuse, the hypotenuse-placement
prediction subtracts the known leg squares and rounds that radical to the nearest tenth; the
second prediction returns the unrooted sum. For a missing leg, the placement prediction adds
the known squares and rounds that radical; the second returns the unrooted difference. Its
keypad enables decimals so both predictions are reachable even though the correct triple side
is a whole number. Frame constraints keep answer and predictions finite, positive, pairwise
distinct, and outside exact-answer equality before central filtering.

Alternative generic predictions such as adding the two visible lengths were rejected because
they would satisfy the wall count without diagnosing the named hypotenuse-placement error.

### Extend every existing geometry gate exhaustively

The operation switch in geometry validation, labels, formula derivation, SVG selection,
recorded output, and global answer verification will gain every new arm with `never` fallbacks
retained. Focused model tests own valid and invalid data. Component tests own figure marks,
net faces, formula markup, responsive classes, and accessible ownership. Unit 20 tests own
generated arithmetic, all solid families, difficulty growth, exact/approx keypad rules,
Pythagorean diagnoses, teaching lines, intros, and snapshots.

Independent verification duplicates the visible formulas from source fields rather than
calling generator answer helpers. Recorded output includes every operation field before the
answer and misconceptions, so adding a field without teaching the review surface about it
fails `unrenderedKeys`.

### Ship as the second partial Unit 20 increment

The existing Unit 20 module appends the six generators after `area-circle`; no registry or
manifest graph structure changes. Coverage advances Stage G from six to twelve implemented
skills and the repository count from 179 to 185. Curriculum rows 20.7–20.12 and roadmap
increment 20b become complete, while the parent item and 20c remain open.

## Risks / Trade-offs

- **Many new geometry arms enlarge exhaustive switches** → Keep one closed union and require
  model, renderer, recorder, learner-text, and verifier switches to fail on an unhandled arm.
- **Solid labels can collide in the fixed phone viewport** → Bound label positions and source
  magnitudes, assert no overflow at 375 pixels, and inspect the required screenshot.
- **A net can look like decoration instead of six faces** → Draw explicit face boundaries,
  pair equal faces consistently, and name all six faces in static and browser checks.
- **Approximate solid predictions can fall inside answer tolerance** → Round generated targets
  and predictions to learner form, constrain distinct values, and check both diagnosis and
  answer rejection across sampled problems.
- **Fixed solids are not drawn to scale** → Treat visible labels and accessible names as the
  mathematical source and avoid any proportional-scale claim.
- **Grouped solid sampling can miss one family** → Pin all three families across deterministic
  seeds and every difficulty in focused tests.

## Migration Plan

1. Extend and test the geometry declaration, derived labels and formulas, and SVG templates
   while leaving the generator registry unchanged.
2. Extend recorded output, learner text, and independent verification; prove all Unit 20a and
   fraction-diagram outputs remain unchanged.
3. Add each Unit 20b generator with its independent tests, then register all six in manifest
   order and update coverage and authorities.
4. Run focused and full gates, then exercise all twelve Unit 20 intros and the six new lessons
   at 375 by 812 pixels and inspect the passing screenshot.
5. When the deltas sync during archive, update the Unit 20 baseline purpose so it describes
   implemented Unit 20 geometry skills without freezing the first six-skill boundary. An
   existing capability delta does not replace authoritative baseline-purpose prose.

Rollback removes only the six new registered generators and new geometry arms, restores
coverage and documentation counts, and leaves Unit 20a and fraction diagrams intact. No
stored or synced data needs migration or rollback.
