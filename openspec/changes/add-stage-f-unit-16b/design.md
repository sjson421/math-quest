## Context

See `proposal.md` for motivation and scope. The passive coordinate plane already validates,
clips, draws, and accessibly names up to two mathematically distinct infinite lines. Their
declaration order is visible as solid then dashed and announced as line 1 then line 2. A
coordinate-plane display already composes with ordinary text choice, keypad, and expression
input, and item 22a measured representative choice and typed-answer layouts at phone width.

Choice input deliberately renders text labels only. The existing expression grammar represents
expanded single-variable linear expressions with integer coefficients, addition, subtraction,
multiplication, and parentheses; it does not accept division or a complete equation.

## Goals / Non-Goals

**Goals:**

- Build all four skills entirely from existing answer and rendering capabilities.
- Make each equation and line relationship independently derivable from structured data.
- Construct finite valid draw sets whose answers and named predictions survive every gate.
- Preserve one full-sized accessible plane and phone-readable answer controls.

**Non-Goals:**

- Line authoring, graphical choice buttons, new answer shapes, arbitrary annotations, or a
  change to coordinate-plane geometry.
- Extending expression grammar or sharing derivation functions with the independent verifier.

## Decisions

### Choose between two styled lines on the existing plane

`graph-from-equation` presents one passive plane with two candidate lines. The choices keep the
existing `{ id, label }` shape and identify `Line 1 (solid)` and `Line 2 (dashed)`. The plane's
existing accessible name states both lines in the same declaration order, so the stable ids
`line-1` and `line-2` map without a second legend or hidden visual-only convention.

The generator randomly assigns the matching line to either declaration position, then may
shuffle the two choice buttons independently; tests require both correct identities and both
button positions. The one wrong line is derived from a named equation-reading error, such as
reversing rise and run or reversing the intercept sign, and its choice id becomes the text-
valued misconception. Draw construction guarantees that it is distinct, visible, and not the
correct choice before central text deduplication.

Two-point line authoring was rejected because it adds a new answer arm and extends
coordinate-plane input, which is capability work and cannot share this content change. Graphs
embedded inside choice buttons were rejected because they would widen `Choice` and
`ChoiceInput`, shrink several planes below the existing legibility contract, and duplicate the
full graph already capable of presenting two candidates.

### Add four closed coordinate operations

Extend `CoordinateData` with records equivalent to:

```ts
| { operation: 'slope-intercept'; slope: number; intercept: number; asks: 'slope' | 'intercept' }
| { operation: 'graph-from-equation'; slope: number; intercept: number }
| { operation: 'equation-from-graph' }
| { operation: 'parallel-perpendicular'; relationship: 'parallel' | 'perpendicular' }
```

The first two records render their `y = mx + b` context through `CoordinateContext` from the
structured coefficients. `slope-intercept` draws the one matching line. For
`graph-from-equation`, the target coefficients select exactly one of the plane's two lines;
the other operations derive entirely from their one displayed line.

Independent verification validates the plane and each operation's required shape, rebuilds
the equation context, and derives exact slope and intercept with integer arithmetic. It maps a
matching candidate line back to `line-1` or `line-2`, canonicalizes the right-side expression,
or applies the requested rational slope relationship. Recorded output and learner-text
collection handle all four operations exhaustively.

### Use separate finite draw sets for integer equations and rational relationships

The first three skills use a cached candidate set built from the difficulty reach, a non-zero
integer slope, an integer intercept, and at least two in-bounds lattice points. Candidate lists
are sampled directly, so no retry loop can exhaust. Higher difficulty widens reach and the
slope/intercept magnitudes.

`parallel-perpendicular` uses a separate cached rational-slope set built from two in-bounds
lattice points whose reduced rise and run are both non-zero. It excludes unit slopes when they
would collapse a prediction and retains pairs whose negative reciprocal can be entered exactly.
This path is deliberately separate: forcing it through the integer-equation candidates would
never produce the `2/3` to `−3/2` relationship the skill must teach.

- `slope-intercept` alternates asking for `m` and `b` through the keypad. Its prediction is the
  other coefficient (`intercept-as-slope` or `slope-as-intercept`), with draws excluding a
  collision.
- `graph-from-equation` answers through choice input. Its wrong line and prediction use
  `rise-run-reversed` or `intercept-sign-reversed`, selected only when the mistaken line is
  valid and distinct.
- `equation-from-graph` answers with the right-side expression in `x`, form `expanded`. Integer
  slopes keep every target inside the established expression grammar; the equation label is
  not part of the entry.
- `parallel-perpendicular` asks both relationships. Parallel problems predict applying the
  negative reciprocal; perpendicular problems predict an unsigned reciprocal and, where
  distinct, keeping the original slope. The keypad is derived from answer and predictions so
  sign and slash keys are always available when needed.

None of the four skills is a manifest wall, so the two-distinct-prediction minimum does not
apply. Every declared prediction must nevertheless remain enterable, distinct, and wrong.

## Risks / Trade-offs

- **Two lines can become visually crowded** → Use the existing two-line maximum and solid/
  dashed distinction, exclude nearly coincident candidates, and inspect the 375-pixel result.
- **Line numbering could drift from choices** → Derive ids from declaration index and pin the
  line order, styles, accessible name, choice labels, and answer in focused tests.
- **Text predictions are not centrally excluded against choice answers** → Construct the wrong
  line id from the non-answer index and assert the mismatch over every sampled problem.
- **Integer-only equation answers narrow the generated domain** → This matches expression
  input honestly; fractional linear expressions remain deferred.

## Migration Plan

No persisted state, capability, or sync payload changes. Ship the four content generators and
their structured verification together. Rollback removes those generators and operation arms;
practised records remain harmless under the never-re-lock rule.
