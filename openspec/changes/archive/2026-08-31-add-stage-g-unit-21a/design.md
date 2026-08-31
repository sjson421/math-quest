## Context

See `proposal.md` for motivation and scope. Unit 21 has manifest entries but no generator
module. The existing story display already renders wrapped text above a keypad without making
an equality claim. The chart display already validates and renders bar, line, and scatter data,
derives trend geometry, exposes a semantic table, and gives keypad and choice controls the
correct answer framing. Independent verification deliberately rejects every chart today because
no content operation tells it which chart relationship determines the answer.

The change must add six generators, the repository maximum for one content change. It must
preserve manifest-owned membership and prerequisites, record Stage G's use of the existing
choice-input capability, keep all numeric targets reachable through whole-number entry, and
make every answer recoverable from visible typed sources.

## Goals / Non-Goals

**Goals:**

- Give list and chart statistics one closed operation model that every exhaustive content gate
  can read.
- Reuse existing story, chart, keypad, choice, intro, and lesson surfaces.
- Make median's required wall diagnoses arithmetic consequences of each generated list.
- Keep chart targets and trend meanings independent of authored answer labels.
- Bound every generated representation to the existing 375-pixel chart and lesson contracts.

**Non-Goals:**

- A general statistics library, data-table display, chart query language, or reusable dataset
  service.
- New chart geometry, chart interaction, answer types, input modes, capabilities, or persisted
  state.
- Fractional statistics answers or probability content from increment 21b.

## Decisions

### 1. Add one closed statistics source union beside the display it explains

Add a `StatisticsData` union equivalent to:

```ts
type StatisticsData =
  | { operation: 'mean' | 'median' | 'mode' | 'range'; values: readonly number[] }
  | { operation: 'weighted-mean'; entries: readonly { value: number; weight: number }[] }
  | { operation: 'read-chart-value'; categoryIndex: number; seriesIndex: number }
  | { operation: 'scatter-trend' }
```

Story displays may carry the list operations, and chart displays may carry the chart
operations. Each arm stores visible mathematical sources or a selector into visible chart
sources, never a copied answer. The union remains optional on a generic chart so existing
synthetic infrastructure fixtures still reach the named fail-closed path.

Putting statistics data on `Problem` was rejected because the display owns the values and a
different display could silently disagree. Extending `WholeNumberData` was rejected because a
dataset property is not a property of one whole number. Separate list and chart unions were
rejected because the same six-skill unit would need duplicate exhaustive routing and future
21b can still add its own probability-specific model when its actual answer contract arrives.

### 2. Reuse story layout for lists and chart layout for plotted data

The four list generators format their source data as short text carried by the story display:
a comma-separated ordered list for mean, median, mode, and range, and labelled value-weight
pairs for weighted mean. The story layout already wraps at reading size, places the keypad on
a separate row, and suppresses that row in read-only intros.

Inline display was rejected because it appends `= entry`; a data list is not equal to its mean,
median, mode, or range. A new data-list display was rejected because it would duplicate story
wrapping, entry routing, read-only behavior, learner-text collection, recorded output, and
phone sizing without adding learner behavior.

The two plotted generators use the existing chart declaration unchanged. `read-chart-value`
indexes a category and series from a bar or line chart, letting prompt text and verification
resolve names from the same declaration. `scatter-trend` carries no direction: both the choice
answer and derived line come from plotted points. A chart-specific input mode or second answer
frame was rejected because the chart surface already composes keypad and choice input
correctly.

### 3. Keep every numeric target exact and every grouped skill balanced

- `mean` constructs four through six values around a selected whole-number center so the sum
  divides by the count.
- `median` produces odd and even unsorted lists. It requires a whole sorted median, a whole
  unsorted-position prediction, and a whole arithmetic mean, then rejects any draw where those
  three values collide. Its predictions are `used-unsorted-middle` and
  `used-mean-for-median`.
- `mode-range` alternates its requested operation and constructs one unique repeated mode. The
  opposite property remains a useful non-wall diagnosis and is kept distinct.
- `weighted-mean` uses positive integer weights and constructs both a whole weighted result and
  a distinct whole ordinary mean. `ignored-weights` diagnoses averaging the distinct values once
  each and remains reachable through the same whole-number keypad.
- `read-bar-line` alternates bar and line kinds, grows category and series counts within the
  chart bounds, and asks for one selected integer. Nearby category or wrong-series values may
  be diagnosed only when distinct.
- `read-scatterplot` generates increasing, decreasing, and exactly flat integer point sets with
  one derived trend line and three stable prose choices.

Difficulty grows visible work through list length and magnitude, weights, chart categories,
series count, scale range, scatter point count, and controlled noise. Construction establishes
the core arithmetic relationships first; rejection only removes label collisions, duplicate
answers, or invalid chart declarations. This avoids relying on a low-probability search to
find valid data.

Fraction or approximate answers were rejected because all six concepts can be exercised with
exact whole targets. Free-response scatter slope was rejected because the selected skill is
reading a trend line, not calculating regression, and choice input keeps direction language
part of the answer.

### 4. Derive scatter direction from exact covariance sign

Independent verification classifies a scatter trend from the sign of
`nΣxy − ΣxΣy`, which has the same sign as the least-squares slope while remaining exact for
integer points. A zero value is flat. Positive and negative draws require enough vertical
change for the rendered line to be visually distinct from flat. The existing chart helper
continues to derive and clip the painted least-squares segment from the same points.

Comparing a floating slope with an arbitrary epsilon was rejected because a threshold could
classify the answer differently from the line being drawn. Carrying `increasing`,
`decreasing`, or `flat` was rejected because that would duplicate the answer instead of
verifying it.

### 5. Extend every existing authored-content gate before registration

The global verifier gains exhaustive statistics handling. For list operations it rebuilds the
visible text and exact answer; for categorical charts it resolves the selected labels and
value; for scatter charts it validates the one-series trend contract and derives the choice
identity. It rejects invalid operation/display pairings, missing data, selector errors,
ambiguous results, mismatched prompts or displays, wrong answer kinds, and stated-answer
disagreement.

Recorded output serializes each operation, ordered value, value-weight pair, selector, chart
source, and trend request. Learner-text collection includes visible list and weighted-pair text
alongside existing chart text. Difficulty measurement reads source counts and magnitudes.
Unit-specific tests independently repeat the arithmetic, pin exact teaching lines, exercise
all grouped variants, confirm keypad reachability and surviving diagnoses, and snapshot stable
samples.

Trusting chart answers was rejected because it would remove the fail-closed invariant item 24
created for these consumers. Importing generator formatting or arithmetic into the independent
test gate was rejected because both sides could then share one defect.

### 6. Advance Stage G through one registry and authority update

Create a partial Unit 21 module containing the six generators in manifest order and register it
after Unit 20. Later 21b work appends its three generators to that module. Add the already-built
`choice-input` capability to Stage G's manifest requirements because `read-scatterplot` consumes
it. Do not edit `AVAILABLE_CAPABILITIES`.

Coverage pins Stage G's four complete capability requirements, nineteen implemented Stage G
ids, three planned Unit 21 ids, unchanged raw and runtime prerequisites, and 192 total playable
skills. Curriculum rows 21.1 through 21.6 and its Stage G and playable/planned status prose,
README status prose, roadmap count, and increment 21a move together; item 26 and 21b remain
open.

### 7. Verify list and chart lessons on the installed phone surface

Focused tests cover the statistics model, six generators, chart integration, intro rendering,
recorded output, global verification, content rules, coverage, curriculum document, and
manifest status. Repository gates then run the full test suite, production build, and lint.

Scripted Chromium at 375 by 812 pixels exercises every intro and a representative lesson for
each skill. It submits keypad and trend-choice answers, asserts semantic chart tables and no
overflow, captures one passing screenshot, and inspects list wrapping, chart axes, labels,
marks, trend direction, answer framing, and worked-content spacing.

Static snapshots alone were rejected because they cannot show chart-label collisions, vertical
lesson overflow, or a trend line that is mathematically correct but visually unclear.

## Risks / Trade-offs

- [Median predictions can collapse after sorting] → Construct whole-valued candidates and
  reject any draw where median, unsorted middle, or mean are equal.
- [A flat regression can be sensitive to floating arithmetic] → Classify with exact covariance
  sign and construct flat point sets whose covariance numerator is exactly zero.
- [Two chart series can make the target unclear] → Derive prompt labels from selected category
  and series and retain the existing semantic table and non-color series distinction.
- [Long lists or charts can crowd a phone intro] → Keep lists and labels bounded, reuse measured
  chart limits, and inspect all six real intros at 375 by 812 pixels.
- [A partial Unit 21 can look complete in status prose] → Pin the last three ids as planned and
  keep both roadmap item 26 and increment 21b open.

## Migration Plan

No stored-data migration exists. Add the statistics source union and all exhaustive consumers
before registering the new module. Then add and test the six generators, register them, record
Stage G's existing choice-input dependency, update authorities, and run focused, repository,
and browser gates.

Rollback removes the Unit 21 registration and module, statistics source arms, tests, and status
updates, and removes `choice-input` from Stage G's requirement list. Manifest entries,
capability availability, stored progress, and sync data remain unchanged.
