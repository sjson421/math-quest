## Context

See `proposal.md` for motivation and scope. `Display` currently has eight arms and is narrowed
exhaustively by `ProblemView`, learner-text collection, recorded-output formatting, and
independent answer verification. The generator suite also derives a difficulty magnitude from
display sources. No production generator can emit a chart yet, so the capability needs
synthetic tripwires and a disposable real-app fixture before Unit 21 depends on it.

The selected roadmap item fixes three visual kinds, shared axes and labels, structured source
data, a non-visual text path, local SVG markup, and a 375-pixel target. The curriculum note for
`read-scatterplot` adds trend lines. Existing coordinate planes solve a different problem:
their axes are numeric integer lattices around zero and their accessible contract is one image
description, while charts also need categorical axes and complete values as navigable text.

## Goals / Non-Goals

**Goals:**

- Make chart marks, labels, legends, trend geometry, accessible naming, and textual values
  derive from one validated declaration.
- Share scale and layout logic without blurring the distinct bar, line, and scatter data
  contracts.
- Preserve existing lesson answer controls and exhaustive verification tripwires.
- Bound the supported domain to what remains readable in a complete lesson at 375 pixels.

**Non-Goals:**

- Assigning an answer meaning to a chart before the two Unit 21 generators exist.
- Supporting pie charts, histograms, stacked bars, areas, curves, annotations, secondary axes,
  arbitrary tick formats, chart editing, or interaction.
- Generalizing `CoordinatePlane`, importing a chart package, or introducing persisted chart
  state.

## Decisions

### Use a closed chart union with categorical and numeric branches

Add a pure chart module with records equivalent to:

```ts
type ChartScale = { min: number; max: number; step: number }
type CategoricalSeries = { label: string; values: readonly number[] }
type ScatterSeries = {
  label: string
  points: readonly { x: number; y: number }[]
  trendLine?: boolean
}
type Chart = {
  title: string
  xLabel: string
  yLabel: string
} & (
  | {
      kind: 'bar' | 'line'
      labels: readonly string[]
      y: ChartScale
      series: readonly CategoricalSeries[]
    }
  | {
      kind: 'scatter'
      x: ChartScale
      y: ChartScale
      series: readonly ScatterSeries[]
    }
)
```

Validation enforces a 32-character title, 16-character axis labels, eight-character category
labels, 12-character unique series labels, two through six categories, one or two series,
exact category/value alignment, and three through twelve scatter points per series. Every
scale field, series value, and point coordinate is a safe integer from −999 through 999; a
positive integer step makes two through ten exact intervals, and every value lies inside its
scale. Bar scales contain zero. A requested trend line requires at least two distinct x values.
These text, digit, and count limits make the valid domain the domain measured in the browser
rather than accepting declarations the renderer can only make illegible.

One untagged record was rejected because categorical labels and numeric x scales admit invalid
combinations. Three unrelated component props were rejected because their shared title,
vertical scale, series identity, validation, and accessibility policies would drift. Reusing
the coordinate-plane scale was rejected because it requires integer ticks around zero, which a
categorical chart does not have and a data chart need not require.

### Derive scales, positions, and scatter trends in one pure owner

The chart module validates before geometry reads any value. It derives tick values from the
declared scales, categorical centers, grouped bar bounds, line/scatter points in viewBox space,
and a least-squares scatter trend from each requesting series. The trend is clipped to all four
edges of the rectangular plot, and a local SVG clip path also contains the painted stroke.
Only its visible segment is passed to the renderer. All numeric output uses the course minus
glyph and one stable formatting helper.

Storing SVG positions was rejected because they duplicate mathematical data and become false
when the viewBox changes. Storing a hand-picked trend segment was rejected because it could
disagree with the points. Importing regression or chart geometry code was rejected because the
closed linear calculation is small, deterministic, and testable without a runtime dependency.

### Use one responsive SVG component with shared axes

A `Chart` component owns a fixed viewBox, plot margins, horizontal and vertical axes, numeric
ticks, axis titles, title, and a compact legend. A kind switch renders grouped bars, connected
line points, or scatter points plus optional trend segments. The visual subtree is hidden from
accessibility APIs beneath one SVG image role.

The first series uses a solid fill or circular marker. The second uses a reusable local SVG
pattern for bars and a dashed stroke plus a distinct marker shape for line and scatter data.
The legend repeats those shapes and styles. Color remains useful but never carries series
identity alone.

Separate SVG components were rejected because they would duplicate axes and phone layout.
Canvas, authored SVG strings, and external chart libraries were rejected because component
tests render static markup in Node, the app works offline, and three bounded chart kinds do not
justify a dependency or opaque accessibility tree.

### Pair one image name with one semantic data table

A figure-level composition derives a concise image name from chart title, kind, axis labels and
ranges, and series names. It renders every data value again in an `sr-only` semantic table from
the same declaration. Categorical tables use category rows and one value column per series.
Scatter tables use series, point number, x, and y columns. Captions name the chart and headers
preserve how values relate.

Putting every value into one long SVG `aria-label` was rejected because it is hard to navigate
or compare. Exposing individual SVG marks was rejected because screen readers would receive
presentation order rather than table relationships. An authored summary or table was rejected
because it could drift from the marks. The visual table stays hidden because the selected
lesson asks the learner to read a chart; it is a complete equivalent path for someone who
cannot use the graphic, not a second visible answer aid.

### Add a display arm with neutral input-aware answer framing

`Display` gains `{ kind: 'chart'; chart: Chart }`. `ProblemView` stacks the chart above the
existing entry only when the input mode needs a display-owned slot. Keypad and expression use
the existing `EntrySlot` beneath `Answer`; choice, number-line, coordinate-plane, and root-pair
render no display echo because their controls own their answer surface. The chart never uses an
equals sign.

Putting chart data beside `Problem.display` was rejected because the chart is the primary
presentation and another display arm could silently win. A chart input mode was rejected
because the selected skills read charts through existing keypad or choice answers. Reusing the
diagram equals frame was rejected because a chart is not equal to a selected trend description
or one value read from it.

### Extend every display gate before content can reach the branch

Learner-text collection includes title, axis labels, category labels, and series names through
the derived chart text. Recorded output states scales, labels, every series value or point, and
trend requests. Independent verification validates the declaration and then throws a named
operation-specific-data error. The difficulty-source helper derives a magnitude from chart
bounds and values without reading the stated answer. Synthetic cases pin each policy and keep
exhaustive `never` branches intact.

The generic verifier cannot know whether a later problem asks for one bar value, a change
between line points, correlation direction, or a trend estimate. Trusting `Problem.answer` was
rejected because it would bypass the course's strongest correctness gate. Guessing the two
future operation records here was rejected because roadmap item 25 owns their content
semantics.

### Activate the existing capability without content

After the model, renderer, integrations, and tests exist, add `chart` to
`AVAILABLE_CAPABILITIES`. Coverage asserts that Stage G then has no unavailable capability but
all 22 skills remain planned, Stage H's six skills remain planned behind timed mode, the
implemented set remains 173, and the course tree does not change. Documentation updates the
capability list and 28-skill planned count in `AGENTS.md`; makes the README's remaining-
infrastructure statement name only timed mode; marks chart rendering built, removes Stage G's
stale chart dependency prose, and corrects 36 planned to 28 in `docs/curriculum.md`; and closes
roadmap item 24 while correcting the stale claim that already-built Stage G capabilities still
block it.

Adding a placeholder generator was rejected because capability and content changes are
separate. Deferring the flag to Unit 21 was rejected because item 24 is its explicit owner.

### Validate the complete composition with disposable fixtures

No production lesson reaches the chart arm. Temporarily mount representative one- and
two-series bar, line, and scatter fixtures, including both densest supported shapes, keypad and
choice answer surfaces, and a scatter trend line. Run the scripted Chromium workflow from
`docs/environment.md` at 375 pixels. Assert one image and one table per chart, expected SVG
marks and style distinctions, no page or composition overflow, and no label or legend overlap.
Inspect the required screenshot for axes, labels, alignment, series distinction, point/line
placement, and truthful answer framing. Remove the fixture and wiring exactly, then rerun
focused tests and the production build.

A permanent preview route was rejected because it would add learner-reachable surface with no
curriculum owner. Static markup alone was rejected because it cannot expose collisions,
overflow, or visually indistinguishable series.

## Risks / Trade-offs

- **Long labels can collide before the SVG overflows** → Reject text beyond the measured title,
  axis, category, and series limits, keep every category label visible, and inspect maximum-
  length text with four-character tick labels in the densest valid fixture.
- **Two series can look identical in grayscale** → Pair palette differences with bar patterns,
  stroke dashes, marker shapes, and a matching legend.
- **Least-squares math can yield a non-visible or degenerate segment** → Reject absent horizontal
  variation, clip against all four plot edges, contain the painted stroke with an SVG clip path,
  and cover horizontal, rising, falling, and edge-only cases in pure tests.
- **The hidden table can duplicate or omit source values** → Generate it from the validated chart
  union and assert exact row, header, and cell counts in static markup.
- **A future Unit 21 draw exceeds the closed limits** → Widen the capability with that content's
  concrete phone fixture rather than accepting an unmeasured domain now.
- **Capability availability can be mistaken for shipped content** → Pin the unchanged generator
  registry, course tree, implemented set, and documented playable total.

## Migration Plan

1. Add and test the closed chart model, validation, ticks, transforms, labels, table rows, and
   regression/clipping helpers.
2. Add and statically test the responsive SVG and semantic table composition.
3. Add the chart display arm and explicit policies in every exhaustive display consumer.
4. Activate `chart`, update capability documentation and roadmap item 24, and prove no skill
   state changes.
5. Run focused and repository gates, temporarily mount and inspect the 375-pixel fixtures,
   remove them exactly, then rerun final verification.

Rollback removes the chart display arm, model, renderer, tests, and availability flag and
reopens roadmap item 24. There is no stored progress, sync, dependency, generator, or answer
migration to reverse.
