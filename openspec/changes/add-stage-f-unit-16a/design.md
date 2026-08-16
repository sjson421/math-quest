## Context

See `proposal.md` for motivation and scope. Item 22 deliberately left coordinate-plane
independent verification fail-closed until content could say whether a graph was being read
for a point, quadrant, slope, intercept, or another property. The generic plane already owns
validated axes, points, lines, clipping, accessible naming, point placement, and confirmation;
none of those needs a second model.

Two selected skills need context the plane alone does not contain. `plot-points` must state the
ordered pair to place, and `table-to-graph` must show actual x/y rows rather than relabel a
prose pair as a table. The lesson's ordinary prompt sits beside the mascot in a narrow text
column, while the coordinate input path bypasses `ProblemView`, so this context has to compose
with both passive and interactive graph rendering.

## Goals / Non-Goals

**Goals:**

- Give each coordinate-plane problem one closed operation record from which its answer and
  visible operation context can be verified independently.
- Keep axes, plotted points, lines, point targets, and coordinate labels under the existing
  coordinate-plane owners.
- Compose draws so all exact answers and wall misconceptions remain reachable and distinct at
  every difficulty without a retry loop that can exhaust.
- Make the table and target point structured, accessible, and phone-readable without creating
  chart infrastructure.

**Non-Goals:**

- General annotation, arbitrary tables, line authoring, multi-point answers, or changes to the
  coordinate-plane geometry contract.
- Sharing answer-derivation helpers with the independent verifier. The verifier must not agree
  with a generator by importing the same arithmetic.
- Any stored-data or sync migration, any new capability, or any manifest or prerequisite
  change beyond adding the already-available `choice-input` capability to Stage F.

## Decisions

### Add one optional closed coordinate operation record to the display arm

The coordinate-plane display gains an optional field equivalent to:

```ts
type CoordinateData =
  | { operation: 'plot-point'; point: Coordinate }
  | { operation: 'quadrant' }
  | { operation: 'table-to-graph'; rows: Coordinate[]; targetX: number }
  | { operation: 'slope-from-graph' }
  | { operation: 'slope-from-points' }
  | { operation: 'y-intercept' }
```

It is optional so the capability's existing synthetic fixtures can continue to exercise a
generic plane and the explicit missing-operation tripwire. Every new production generator sets
it. The plane remains the source for visible points and lines; the record carries only the
discriminant and source data that is not already on the plane. `plot-point` carries the point
that is stated but not yet plotted. `table-to-graph` carries rows that are rendered as a table.
The other four operations derive entirely from the plane.

Putting the operation on `Problem` beside the display was rejected because the same two pieces
could disagree without either being structurally invalid. Adding six display arms was rejected
because they share one graph renderer and answer framing. Encoding the operation into the
generic `CoordinatePlane` was rejected because slope, quadrant, and table meaning are content,
not geometry.

### Validate each operation's visible shape before deriving its answer

The global verifier replaces the coordinate tripwire only when recognized operation data is
present. It validates the plane, then enforces these shapes:

- `plot-point`: no pre-plotted points or lines; answer is the stated target.
- `quadrant`: exactly one non-axis point and no lines; answer is the quadrant derived from its
  signs and must name one offered choice.
- `table-to-graph`: at least three unique-x, exactly collinear rows; `targetX` selects exactly
  one; plane points equal the non-target rows and no line is drawn; answer is the target row.
  Collinearity is checked by equal integer cross-products from the first row rather than by a
  floating slope.
- `slope-from-graph`: exactly one non-horizontal, non-vertical line whose two defining lattice
  points are also the two marked points; answer is reduced change in y over change in x.
- `slope-from-points`: exactly two points, no line; answer is the same exact ratio.
- `y-intercept`: exactly one non-vertical line; answer is its exact value at x zero and must be
  an integer for this increment.

Missing data and a shape/data disagreement still throw with the skill id. Recorded output names
the operation and its source fields. Learner-text collection includes the target label or table
rows that the UI adds.

Trusting the answer, parsing the prompt, or deriving a generic property from whichever plane
fields happen to exist were rejected. A graph has many valid properties, and item 22's tripwire
exists specifically to prevent that ambiguity from passing.

### Render a small operation context outside the SVG

A focused coordinate-context renderer handles the only two operations with extra visible
source data. `plot-point` draws a labelled ordered pair above the plane.
`table-to-graph` draws a native table with `x` and `y` column headers, one row per structured
coordinate, and a visual/accessibility marker on the row selected by `targetX`.

`ProblemView` places that context above passive planes. `CoordinatePlaneInput` accepts the same
optional record and places the same context above its existing graph, nudge strip, and Check
button. `Lesson` passes the display's operation record into the interactive path. The SVG keeps
its one derived image name, and the table keeps separate table semantics.

Putting the table into the SVG was rejected because it would turn cells into drawing marks and
fold unrelated content into the graph's image name. Putting it into the mascot prompt was
rejected because that column is limited to prose width and cannot preserve table semantics.
Introducing a generic chart or table capability was rejected because ordinary HTML table markup
already expresses the selected content and roadmap item 24 is for chart rendering.

### Use symmetric integer planes and finite candidate composition

The six generators share a difficulty ladder of symmetric integer bounds that widens from the
easiest to hardest level while staying within the plane's twenty-interval limit. Every point
draw uses finite candidates enumerated inside the current bounds and selected by the seeded
RNG. Structural conditions are applied while forming that candidate set, so no learner-facing
generation path depends on probabilistic retry.

`table-to-graph` composes three or more rows from an integer linear rule, selects one target row,
and passes the other rows directly to the plane. Slope problems compose a first point with a
non-zero integer run and rise that keeps the second point inside the bounds. The points skill
chooses non-axis points with distinct coordinates. `y-intercept` composes a small non-zero
integer slope and integer intercept, then supplies two in-bounds defining points.

Drawing arbitrary pairs and filtering was rejected because several operations need simultaneous
non-zero, in-bounds, distinctness, and ratio constraints. This is the same shape the repository
already records as having exhausted a retry loop in front of a learner.

### Carry exact slopes and derive keypad rules from answers and predictions

Both slope skills reduce rise/run with exact rational arithmetic. Their numeric misconceptions
are derived from separately reduced ratios and converted to numbers only at the existing
misconception boundary. The keypad permits `/` when either the answer or a carried prediction
has a non-unit denominator, and permits a sign when either can be negative.

Both slope draws exclude zero rise/run and equal absolute rise/run, so a run-over-rise
prediction is always finite and distinct. `slope-from-points` additionally predicts
inconsistent subtraction order as the negated slope; the same bounds prevent its two
predictions from colliding with the answer or each other. `plot-points` uses reversed
coordinates and vertically reversed direction, with symmetric axes and non-zero, distinct
coordinates making both reachable and distinct.

Using approximate slope answers was rejected because all selected source points are integers
and exact rational entry already exists. Requiring decimal form was rejected because repeating
decimals would make an exact skill depend on rounding policy it does not teach.

### Keep progress and course structure derived

The new module exports six `SkillGenerator[]` entries and the registry imports them after Unit
15. No generator restates prerequisites or quick state. Coverage expects 151 implemented skills,
the first six Unit 16 ids in manifest order, and the last four still planned. Curriculum rows
gain ✅ markers; roadmap status and increment prose move, but item 23 remains unchecked.

Adding a second unit list or flipping `AVAILABLE_CAPABILITIES` was rejected because course
structure and availability are already derived correctly. Stage F does add the existing
`choice-input` declaration: the coverage gate requires every stage to name the input modes its
generators actually use, and `quadrants` is the stage's first choice consumer.

## Risks / Trade-offs

- **The table plus 320-pixel graph may make the interactive lesson too tall on a phone** → Keep
  the table compact, validate a representative problem in real Chromium at 375 pixels, inspect
  the required screenshot, and verify the controls remain reachable without horizontal
  overflow.
- **A line can be valid while its marked points disagree with its defining points** → The
  operation-specific verifier compares the two ordered point sets before deriving slope.
- **Numeric misconception values can obscure their rational source** → Unit tests retain the
  source rise/run and assert each submitted fraction maps to the intended exact mistake; keypad
  rules are derived before conversion.
- **Fixed candidate sets can flatten difficulty despite widening axes** → Unit tests sample
  every difficulty and the global magnitude gate measures the graph bounds and coordinates.
- **Choice labels can drift from quadrant ids** → Derive the correct id from coordinate signs,
  offer all four stable ids, and independently verify that the derived id is offered.

## Migration Plan

1. Add coordinate operation types, context rendering, exhaustive gates, and their focused tests.
2. Add and independently test each of the six generators, marking each matching task complete.
3. Register the module, update coverage snapshots and curriculum/roadmap authorities, and run
   focused plus full repository gates.
4. Seed prerequisite progress in a disposable browser session, exercise one target-point, one
   table placement, and one passive slope problem at 375 pixels, inspect screenshots, then clear
   the disposable state and stop any server started for validation.

Rollback removes the six generators and operation context together, restoring the verifier's
generic coordinate tripwire. There is no persisted state or sync migration to reverse; existing
progress for a practised skill would remain harmless under the never-re-lock rule if this were
ever rolled back after exposure.
