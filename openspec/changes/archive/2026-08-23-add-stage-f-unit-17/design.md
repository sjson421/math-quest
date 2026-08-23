## Context

See `proposal.md` for motivation and scope. Point answers are intentionally accepted only when
`inputMode` and `Display` are both `coordinate-plane`; Unit 16 already established one compact
interactive plane, structured point misconceptions, two-line rendering, operation-specific
coordinate data, and fail-closed verification. Unit 17 must compose with those contracts rather
than create a second pair-entry path.

The generic plane stores geometry but no mathematical meaning. `CoordinateData` supplies that
meaning, `CoordinateContext` renders any material beside the graph, and recorded output,
learner-text collection, difficulty measurement, and the global generator verifier narrow the
union exhaustively.

## Goals / Non-Goals

**Goals:**

- Make all four solutions independently derivable from visible structured data.
- Keep every answer and predicted mistake as a reachable integer point.
- Reuse one phone-sized point-entry surface without drawing an algebraic answer in advance.
- Make the elimination wall's two required mistakes constructive properties of every draw.

**Non-Goals:**

- General symbolic equation parsing, fractional intersections, special-solution systems, or a
  reusable multi-equation display outside the coordinate context.
- A new input mode, display arm, manifest capability, graph primitive, or runtime dependency.

## Decisions

### Keep point input as the common composition

Every generator returns a point answer and declares coordinate-plane input. Graphing draws the
two source lines; substitution, elimination, and stories draw neither lines nor points because
the compact plane is their answer control, not evidence. `CoordinateContext` puts the two
equations, variable meanings, or story above that one plane.

A comma-separated keypad entry was rejected because it would be a new input capability and
duplicate point parsing, feedback, and accessibility. Choice answers were rejected because
they disclose candidate solutions. A new systems display arm was rejected because point input
already requires the coordinate-plane arm and nesting one display inside another would create
two owners of the lesson frame.

### Represent linear equations as closed structured records

Add a small shared equation record with a presentation form and integer coefficients. Standard
form represents `ax + by = c`; isolated form represents `y = mx + b`. Pure formatting produces
typographic signs, omits unit coefficients, and returns both visible and spoken labels. A pure
exact solver converts either form to standard coefficients, rejects a zero determinant, and
returns an integer point only when both coordinates divide exactly.

`CoordinateData` gains distinct `system-by-graphing`, `system-substitution`,
`system-elimination`, and `system-words` arms. The graphing arm derives equations and an
intersection from the plane's two lines. Substitution and elimination each carry their equation
pair directly but stay separate because they impose different generation and teaching
constraints. The word arm carries one frame id plus its quantities; rendering and verification
derive both story text and equations from those quantities so no authored sentence can drift.

Raw equation strings were rejected because a verifier that parses generator-authored prose is
not independent and would make formatting changes alter mathematics. One generic `system` arm
was rejected because swapping method data would then type-check and could silently weaken the
method-specific checks.

### Construct each method backward from an integer solution

Each difficulty chooses a plane reach from the existing Unit 16 ladder and starts with an
integer target inside it.

- Graphing chooses two distinct integer slopes and derives each intercept from the target; the
  existing line validator clips their integer defining points and guarantees distinct lines.
- Substitution creates one isolated equation `y = mx + b`, then a standard equation containing
  the same target. Draw constraints exclude coincident equations and degenerate arithmetic.
- Elimination chooses standard-form equations where multiplying one by a non-unit factor makes
  one variable coefficient match the other. It derives both constants from the target.
- The word frame chooses two nonnegative integer counts inside the current plane reach and
  distinct pass prices, then derives the total count and revenue. The variable legend fixes
  `(x, y)` order before the equations and answer.

Forward random equation generation was rejected because most draws have fractional or
out-of-bounds intersections and rejection would dominate at higher difficulty. Carrying the
target in operation data was rejected because it would merely restate the answer; only the
generator's `answer` carries it, while every verifier solves from visible evidence.

### Build elimination predictions from two altered derivations

The wall uses point-valued predictions named `right-side-not-scaled` and
`eliminate-before-scaling`. The first solves the altered system produced by scaling the chosen
equation's coefficients but leaving its right-hand constant unchanged. The second subtracts
the unscaled equations as though the selected coefficient had already canceled, obtains the
remaining coordinate, and substitutes it into the original equation for the other coordinate.

Generation uses bounded rejection to keep both altered results integral, inside the same plane,
distinct from the true point, and distinct from each other. Tests assert those conditions after
`generateProblem`, not merely on the source list, because central filtering removes collisions,
duplicates, and unreachable point predictions. A generic swapped-coordinate diagnosis was
rejected as one of the two wall predictions because it tests entry order rather than the
elimination method the curriculum marks as difficult.

### Extend every coordinate-data gate together

The new union arms are handled in the context renderer, content-text collector, recorded-output
formatter, difficulty-source measurement, and global independent verifier. Focused Unit 17
tests separately rebuild the math from displayed records across 100 seeds at each difficulty,
pin point reachability and method constraints, prove wording snapshots, and test the wall's
post-filter predictions. Registry coverage pins exactly four newly implemented ids.

This follows Unit 16's fail-closed pattern. A verifier fallback to the stated point was rejected
because a wrong answer key is the highest-risk content failure in the application.

## Risks / Trade-offs

- [An empty plane beneath algebra may feel visually detached from the equations] → Label it as
  the ordered-pair answer surface, render the live selection, and inspect the complete lesson at
  375px before shipping.
- [Rejection constraints for two elimination misconceptions can exhaust a seed] → Draw from a
  finite coefficient catalogue with proven valid combinations, keep the existing bounded
  constraint helper, and sample every difficulty broadly in focused tests.
- [Two equations plus a compact plane can push hints below fixed controls] → Keep context rows
  concise, use the existing compact coordinate-plane size, measure overflow and visibility in
  real Chromium, and inspect the required screenshot.
- [Equation formatting can disagree with solving data] → Centralize visible/spoken formatting
  and exact solving over the same structured equation record, then have independent tests rebuild
  both.

## Migration Plan

Add the exhaustive data handling and tests with the four generators, then register Unit 17 and
update documentation in the same commit. No persisted data changes. Rolling back the commit
removes the registry entries and returns the four skills to planned without touching learner
progress or sync payloads.
