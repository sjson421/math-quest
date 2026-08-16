## Context

See `proposal.md` for motivation. The passive `coordinate-plane` display already owns axis
validation, exact line clipping, accessible graph naming, and the fixed 320-unit SVG transform.
The lesson owns one string entry and one submission path across keypad, choice, number-line,
and expression controls. Number-line input establishes the relevant interaction rule: a dense
tap surface changes the pending entry, while a separate confirmation invokes the shared lesson
submission gate.

Component tests render first paint to static markup with no DOM event runtime. Interaction
policy therefore needs a pure library owner, while the component tests can prove which labelled
controls are offered. The supported plane is capped at 20 intervals per axis, so its maximum
lattice has 441 positions.

## Goals / Non-Goals

**Goals:**

- Preserve one coordinate-plane declaration and one lesson entry while adding exact point
  placement.
- Make point answers and point misconceptions structured and exhaustively handled.
- Keep passive graph-reading compositions unchanged for every existing input mode.
- Make the most crowded valid surface measurable in static markup and real Chromium, with an
  equivalent large-target touch path for precise placement.

**Non-Goals:**

- General pointer-coordinate hit testing, drag gestures, fractional placement, multi-point
  line authoring, or Stage F generator design.
- A stored point-attempt payload. Progress continues to record only correctness and an optional
  misconception tag.

## Decisions

### Reuse the display plane instead of adding input data

`coordinate-plane` joins `Problem['inputMode']`, but `Problem` gains no second plane field. A
matching `{ kind: 'coordinate-plane' }` display is the input declaration the control reads.
`Lesson` substitutes the interactive surface for `ProblemView` only for that exact mode/display
pair; all other coordinate-plane compositions continue through the passive display path.

This keeps axes, gridlines, labels, and target values under one owner. A separate
`coordinatePlane` input property was rejected because two structurally valid graphs could
disagree about what the learner sees and what a tap submits.

### Keep one string entry, backed by a point codec

A shared point value has the discriminant and coordinates `{ kind: 'point', x, y }`. The new
answer arm and point-valued misconception arm use that same shape. Pure coordinate-plane
helpers serialize a placed point to one canonical internal string, parse it back, derive the
ordered lattice targets from both axis tick lists, and resolve whether the current entry is a
confirmable target. Problem generation rejects a point answer that is not one of those targets
and drops point misconceptions that cannot be placed on the same surface.

The internal entry string remains implementation data: learner-facing labels continue through
the existing ordered-pair formatter with typographic minus signs. Replacing the lesson entry
with a union was rejected because it would broaden every existing control and submission
boundary for no observable benefit.

### Extend the existing SVG surface with placement buttons and large nudge controls

The passive `CoordinatePlane` renderer gains an optional placement configuration. When present,
it overlays one HTML button at each declared tick intersection using the renderer's existing
fixed-view coordinates. Each button owns the full surrounding lattice cell, an ordered-pair
accessible name, and selected state; the selected point is drawn above the graph. The target at
the current placement, or the origin before any placement, is the surface's one tab stop. Arrow
keys move that roving focus and placement by one declared tick, while pointer activation places
the target directly. An arrow aimed past an axis boundary leaves focus and placement on the
boundary target and does not submit. With no placement configuration, the renderer emits the
same single passive image and no controls.

`CoordinatePlaneInput` composes that surface with Check, derives selection and confirmability
from the pure entry helpers, and emits canonical entries through `onPlace`. Check is disabled
until the entry resolves to a target and calls the lesson's existing `submit` only when
activated.

The densest valid plane places adjacent lattice targets 12.8 CSS pixels apart, so direct point
buttons alone are not a sufficiently precise touch path. `CoordinatePlaneInput` also presents
a five-control nudge strip below the graph: x−, y−, origin, y+, and x+. Every control is at
least 48 CSS pixels high and more than 48 pixels wide at the 320-pixel component width. Before
placement, a directional control starts from the origin and places the adjacent tick, while
the center control places the origin. After placement, the four directions move one declared
tick and the center returns to the origin; a direction disables at its axis boundary. These
controls call the same `onPlace` path as direct targets and keyboard arrows, so they replace
the pending point without submitting it.

A separate zoomed graph was rejected because it would duplicate the axes and marks that the
single-declaration decision protects. Enlarging or overlapping all 441 direct hit regions was
also rejected because adjacent controls would become ambiguous. The nudge strip supplies an
equivalent large-target route to every point while the direct labelled lattice markup remains
available for sighted pointer placement and assistive technology.

A single full-plane pointer listener was rejected because its hit testing and keyboard access
would live only behind DOM events that the node-side test environment cannot execute. Authored
SVG or canvas targets were rejected by the offline markup contract.

### Route confirmation through the existing lesson machinery

The interactive coordinate surface occupies the same animated problem slot as the passive
graph, so the graph and selected point remain visible while feedback appears. `Lesson` passes
its existing entry setter and guarded submit callback into `CoordinatePlaneInput`; the answer
control switch handles the new mode explicitly without rendering a second control below. The
render expression chooses `CoordinatePlaneInput` for the exact coordinate-mode/display pair and
`ProblemView` otherwise, so the interactive graph replaces rather than accompanies the passive
one.

Consequently rapid confirmation is covered by the existing synchronous submission gate, and
correctness, diagnosis, attempt recording, requeue, hints, and completion need no parallel
point-specific path.

### Compare and filter points structurally

`checkAnswer` parses point entries before the numeric parser and compares both integer
coordinates in order. The recorded-output formatter states the point arm explicitly.

Central misconception handling grows a point branch beside its numeric and text branches. It
drops non-finite or non-integer points, excludes a point equal to the point answer, deduplicates
by ordered coordinate key, and diagnoses only an exact parsed point. Separate seen sets keep
`3`, text `"3"`, and point `(3, 0)` independent. Treating a point as text was rejected because
the central correct-answer exclusion and structural deduplication would remain blind to it.

No Stage F operation data lands in this change, so the curriculum's independent answer verifier
cannot derive which visible or instructed point is correct. Its coordinate-plane branch remains
fail-closed for point answers, with a synthetic test pinning that tripwire; the later content
change must add operation-specific source data before a point generator can pass verification.

### Availability closes infrastructure but unlocks no content

After the input surface, exhaustive type consumers, and tests land, `coordinate-plane` is added
to `AVAILABLE_CAPABILITIES`. The Stage F coverage assertion changes from “display half exists,
capability unavailable” to “complete infrastructure is available, but no generator exists.”
The item 22 checkbox and capability prose are updated in the roadmap; no curriculum table row
or manifest edge changes.

## Risks / Trade-offs

- **441 buttons increase first-paint markup on the densest plane** → The existing 20-interval
  validation cap bounds the cost, only one target participates in sequential keyboard focus,
  and static plus browser validation checks the exact maximum at 375px.
- **Dense lattice cells are smaller than ordinary touch targets** → Direct buttons still own
  their full grid cells, while the five large nudge controls provide an equivalent precise
  touch route from the origin to every declared point. Both paths remain free to revise until
  the separate Check action.
- **Static component tests cannot activate handlers** → Pure tests own target derivation,
  canonical entry, replacement, and confirmability; static tests inspect labels and states;
  scripted Chromium validates actual taps, correction, confirmation, feedback, and overflow.
- **Widening discriminated unions creates a broad compile-time ripple** → Every switch and
  `Record` remains exhaustive, the recorded-output and independent-verification tripwires gain
  explicit point behavior, and the repository build is a required gate.
- **The input requires a coordinate-plane display at runtime but TypeScript does not encode
  cross-field coupling** → Lesson renders no alternative answer control for a mismatched
  declaration, and tests pin that it fails closed rather than falling through to a keypad.

## Migration Plan

No persisted state or sync payload changes. Ship the point value types, pure helpers, component,
lesson routing, exhaustive consumers, and capability flag in one commit so no intermediate
build can expose an unavailable half-capability. Rollback removes that commit and returns Stage
F to unavailable without migrating learner data.
