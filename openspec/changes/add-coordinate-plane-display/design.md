## Context

See `proposal.md` for motivation and scope. `Display` has seven arms and is narrowed
exhaustively by `ProblemView`, learner-text collection, recorded-output formatting, and
independent answer verification. Component tests render to static markup in Node, and the
roadmap requires the new graph surface to be measured as a complete lesson display at 375
pixels before any Stage F generator can use it.

Roadmap 22a needs bounded axes, plotted points, one plotted line for four Unit 16 consumers,
and two lines for `system-by-graphing`. Roadmap 22b separately owns tap placement, point
answers, non-scalar point misconceptions, and `coordinate-plane` capability availability.

## Goals / Non-Goals

**Goals:**

- Make every visible coordinate, axis scale, plotted point, clipped line, and accessible
  phrase derive from one validated graph declaration.
- Establish one reusable, dependency-free SVG surface for both one-line and two-line graphs.
- Preserve the existing lesson entry and verification tripwires while no content operation
  gives a graph answer semantics.
- Bound the model to the linear graphs and phone dimensions the roadmap names.

**Non-Goals:**

- Designing 22b's interactive state, hit targets, point answer comparison, or submission
  lifecycle.
- Encoding slope, intercept, equation, intersection, table, or skill identity in the generic
  graph data.
- Supporting curves, shaded regions, freehand paths, arbitrary annotations, or chart axes.

## Decisions

### Use a closed plane record with integer axis scales

Add a pure coordinate-plane module with records equivalent to:

```ts
type Coordinate = { x: number; y: number }
type AxisScale = { min: number; max: number; step: number }
type CoordinateLine = { through: [Coordinate, Coordinate] }
type CoordinatePlane = {
  x: AxisScale
  y: AxisScale
  points: Coordinate[]
  lines: CoordinateLine[]
}
```

Validation requires integer finite fields, `min < 0 < max`, a positive step that exactly
divides the span and places zero on a tick, and two through twenty intervals per axis. Points
are unique and inside the bounds. At most two lines are accepted; each has distinct defining
points, must intersect the viewport in a segment rather than at one corner or not at all, and
its two exact boundary intersections must remain distinct after direct rational-to-number
conversion. Two declared lines must describe mathematically distinct infinite lines.

Integer scales match every Stage F coordinate draw the curriculum names, make 22b's “one
square out” rule exact, and avoid decimal rounding in labels and hit positions. Twenty
intervals is the largest phone grid the requirement permits: within the selected responsive
plot width it keeps neighbouring lines at least 12 CSS pixels apart.

A generic scene graph was rejected because it admits shapes no selected skill needs. Fixed
−5…5 bounds were rejected because later difficulties may need a wider integer scale. A
floating scale was rejected because the course's graph targets are lattice points and exact
step membership would otherwise depend on tolerance. Coincident line declarations were
rejected because the selected Stage F system skills answer with an ordered pair throughout;
stacking styles cannot make the same geometry read honestly as two distinct lines, and
offsetting one would draw false mathematics.

### Define an infinite line by two points and derive its clipped segment

The model stores two distinct integer points on each mathematical line. A pure clipping
helper intersects that infinite line with the four axis bounds using exact rational inclusion,
deduplicates equal line parameters, and returns the two extreme visible intersections. Only
then does it round each coordinate directly from its exact numerator and denominator to a
JavaScript number, avoiding interpolation and cancellation. If two exact intersections
collapse to the same graph-space numeric coordinate, model validation fails closed.

The renderer then maps the validated segment into its fixed viewBox and independently rejects
a line whose two graph-space coordinates collapse to the same viewBox point. This second check
belongs to the renderer because only it owns the transform. A renderable line uses butt caps,
and a plot-area clip contains the painted mark so stroke width cannot extend beyond the bounds.

This representation handles vertical, horizontal, and ordinary lines with one shape. It also
preserves the two-point evidence later slope content needs without storing a slope, intercept,
or visible endpoints that could disagree. Storing `m` and `b` was rejected because it excludes
vertical lines and duplicates the points graph-reading skills reason from. Requiring generators
to author boundary endpoints was rejected because clipping would then be copied into content.
Round caps without a plot clip were rejected because their radius extends the painted stroke
past an otherwise correct boundary intersection. Butt caps alone were also rejected as the
containment mechanism because an oblique cap still projects beyond a rectangular boundary;
the local SVG clip path owns painted containment.

### Derive geometry and one accessible name from the same record

One pure owner derives axis values, the clipped segments, coordinate formatting with a
typographic minus, and an accessible name describing the x and y ranges followed by every
point and each line's defining points. The reusable component validates first, uses a fixed
view box with responsive width, and places gridlines, emphasized zero axes, integer labels,
point markers, and clipped line marks from those helpers.

The outer SVG owns one `role="img"` and the derived name. Its drawing subtree is hidden
from accessibility APIs. The first line is solid and the second is dashed as well as using a
second palette color, so the system graph is distinguishable without color alone.

An authored accessible name was rejected because it could disagree with the plotted values.
Canvas and graphing libraries were rejected because the static Node test contract needs
semantic markup and this closed linear surface does not justify a runtime or offline bundle
dependency.

### Add a display arm with answer framing owned by the input mode

`Display` gains `{ kind: 'coordinate-plane'; plane: CoordinatePlane }`. `ProblemView` stacks
the graph above input-mode-aware answer framing. Choice and number-line input render no entry
echo because the lesson's choices or number line already own the answer surface. Keypad and
expression input render the existing `EntrySlot` beneath a neutral `Answer` label. No path
asserts that the whole graph equals an answer such as a slope, equation, quadrant, or
intersection. The problem's existing `inputMode` continues to choose the answer control, and
no `Problem` side field or input-mode arm is added in 22a.

Optional side data was rejected because the plane is the primary presentation and another
display arm could silently win. Reusing diagram display's equals sign was rejected because a
generic graph model carries no operation-specific relationship that makes “graph = answer” a
truthful statement. Rendering a second answer control was rejected because 22a is a display
increment; 22b will decide how interaction and confirmation compose with the graph after point
answers exist.

### Extend each exhaustive gate with an explicit graph policy

Learner-text collection reads the derived graph description. Recorded output states both axis
scales, every point, and both line definitions. Independent verification validates a
coordinate-plane display and then throws a named “operation-specific data required” error;
there is no generic answer derivable from a graph without knowing whether a skill asks for
slope, equation, quadrant, or intersection. Synthetic tests pin that tripwire so the first
content change must add its own independently derived semantics rather than falling through to
the stated answer.

The difficulty-source helper derives magnitude from graph bounds and coordinates even though
no production generator reaches the branch yet, retaining its explicit new-display policy.
Treating a graph as empty text, unrecorded data, or the problem's answer was rejected because
each choice would let a future generator bypass an existing gate silently.

### Leave capability state and course status unchanged

`coordinate-plane` does not join `AVAILABLE_CAPABILITIES`, no generator is registered, no
curriculum row gains a built marker, and the playable count remains 145. The roadmap records
22a as shipped and keeps item 22 unchecked with 22b still pending.

Marking the capability available here was rejected because Stage F declares the input
capability, not merely a graph renderer. A display-only change must not claim the tap, answer,
and confirmation contract exists.

### Validate layout through a disposable real-app fixture

No production lesson can reach the new arm. Temporarily mount representative point, one-line,
two-line, vertical-line, and twenty-interval planes in the real app, then run the scripted
Chromium workflow at 375 pixels. Assert singular accessible ownership, expected SVG element
counts, no page or display overflow, at least 12 CSS pixels between adjacent gridlines, and
distinct solid/dashed line styling. Inspect the required screenshot for labels, clipping,
alignment, collisions, and truthful choice/typed answer framing, remove the fixture and wiring
exactly, then rerun verification.

A permanent preview route was rejected because it would add learner-reachable surface with no
curriculum owner. Static markup alone was rejected because it cannot expose label collisions,
layout overflow, or a clipped line ending off its axis.

## Risks / Trade-offs

- **Dense tick labels can collide before the SVG overflows** → Thin visible labels on dense
  axes while retaining every gridline and the complete derived accessible name; inspect
  the twenty-interval screenshot.
- **Floating SVG intersections can produce duplicate corner hits** → Deduplicate clipped
  intersections by exact rational line parameter and cover diagonal, corner, horizontal,
  vertical, cancellation-prone, near-corner, graph-space sub-ULP, and viewBox-transform collapse
  cases; derive numbers directly from exact fractions, then reject only when model or renderer
  coordinates collapse and could not produce a visible SVG line.
- **Two crossing lines can be indistinguishable in grayscale** → Derive solid and dashed styles
  by declaration order in addition to palette color.
- **The generic verifier cannot derive one answer from a graph** → Fail with the skill id after
  validating the graph, forcing each content operation to declare and independently verify its
  own meaning.
- **A future skill needs non-integer plotted coordinates** → Keep that expansion with the
  content that proves it necessary; widening now would weaken exact placement and labels for an
  unselected use case.

## Migration Plan

1. Add and test the validated graph model, label derivation, axis values, and line clipping.
2. Add and statically test the responsive SVG renderer.
3. Add the display arm and extend every exhaustive consumer with synthetic tripwire coverage.
4. Update roadmap increment 22a while leaving item 22 and capability availability open.
5. Run repository gates, temporarily mount and inspect the 375-pixel fixture, remove it, and
   rerun final verification.

Rollback removes the display arm, renderer, model, tests, and partial-roadmap note. There is no
stored progress, sync, dependency, manifest, or generator migration to reverse.
