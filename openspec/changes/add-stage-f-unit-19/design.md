## Context

See `proposal.md` for motivation and scope. Stage F already has every runtime capability Unit 19 needs. `Display` can show a structured equation or a coordinate plane, `EquationData` and `CoordinateData` give those displays operation-specific meaning, and `CoordinateContext` already places semantic tables and generated linear equations beside one graph. Generator-wide tests reject answers that cannot be rebuilt independently from those structured display values.

The remaining design problem is representation, not input infrastructure: two skills need compact function notation, two need finite plotted relations, and `compare-functions` must show a table, graph, and equation together on the installed 375-pixel surface.

## Goals / Non-Goals

**Goals:**

- Keep each visible function and answer derivable from operation-specific source values.
- Reuse equation display, coordinate-plane display, semantic table markup, and ordinary keypad or choice entry.
- Make every comparison representation capable of being correct rather than leaking the answer through order or layout.
- Preserve readable phone composition and the existing exhaustive type and verification gates.

**Non-Goals:**

- General-purpose function objects, nonlinear curve rendering, or authored graph markup.
- Set-notation entry or another answer checker.
- A chart or function capability flag.
- Changes to progress, sync, unlocking, or lesson adaptation.

## Decisions

### 1. Extend operation payloads instead of adding a display kind

Add `function-notation` and `evaluate-function` arms to the existing equation source-data union carried by equation displays. `function-notation` omits the answer frame because its choices own the answer surface. `evaluate-function` labels the separate keypad row with the requested `f(input)`, so the visible rule is never rendered as though it equals its output for every x.

Add `domain-range`, `linear-vs-nonlinear`, and `compare-functions` arms to the existing coordinate source-data union carried by coordinate-plane displays. The equation arms carry exactly the displayed input/output or linear coefficient, constant, and substituted input. The coordinate plane remains the authority for plotted points and the graph line. Its Unit 19 payload carries only meaning not recoverable from geometry: whether domain or range is requested, and for comparison the table rows, equation coefficients, and requested property.

This keeps the existing exhaustive `Display` switch, entry routing, and capability model intact. Inline display was rejected for the function rule because keypad entry would append a second equality and falsely draw `f(x) = mx + b = answer`. A new function display was rejected because it would duplicate the equation and plane renderers, semantic table, answer framing, recorded-output arm, and phone sizing for no new learner behavior.

### 2. Give each skill one bounded problem shape

- `function-notation`: show `f(input) = output`; offer shuffled readings with stable identities. The correct reading maps input to output. The required wall predictions are `function-as-multiplication` and `input-output-reversed`, both text-valued choice identities that cannot collide with the answer.
- `evaluate-function`: show `f(x) = mx + b`, ask for `f(input)`, and take one exact integer through the keypad. Draw bands widen signed coefficients, constants, and inputs while keeping the result enterable.
- `domain-range`: plot three to five finite-relation points with unique x-values; ask for domain or range; offer canonical set labels through ordinary choices. Draws keep the requested set distinct from the opposite-axis set so the swap remains reachable.
- `linear-vs-nonlinear`: plot three to five points with unique x-values and no line. Linear draws have one exact slope across x-ordered pairs; nonlinear draws alter at least one consecutive slope. Choices are `Linear` and `Nonlinear`.
- `compare-functions`: generate three integer linear rules. Render one as rows including `x = 0`, one as the plane's single line, and one as `f(x) = mx + b`. Ask for the uniquely greatest rate of change or initial value. Every initial-value draw keeps the graph's y-intercept on a visible y-axis tick. Shuffle both the rule-to-representation assignment and choice order so `Table`, `Graph`, and `Equation` all become correct across samples.

Nonlinear curves were rejected because the coordinate-plane contract draws points and straight lines only. A finite plotted relation teaches the classification without pretending a connected curve exists.

### 3. Keep three-form comparison inside coordinate context

Extend `CoordinateContext` with the Unit 19 operations. Domain/range and linearity need no context beyond their plotted points. Comparison renders a semantic two-column table and one generated, accessibly named equation before the existing plane.

`CoordinatePlaneView` identifies the comparison operation and uses the existing compact graph width with a responsive context layout. At phone width, the table and equation may share a compact row while the graph stacks below; wider layouts may place them beside the graph. The ordinary choice buttons remain the only answer surface, so no selected-choice echo is added.

Embedding table or equation text into the SVG was rejected: it would erase table semantics, inflate the graph's accessible name, and create a second presentation convention beside `CoordinateContext`.

### 4. Verify source data independently at every existing gate

The generator-wide verifier rebuilds:

- function notation, function rules, requested-input labels, and evaluated outputs from equation operands;
- canonical domain/range sets and linearity from plane points;
- table and equation relationships from their structured values;
- graph slope and intercept from the line's defining points;
- the uniquely greatest requested comparison property and stable choice id.

It also rejects duplicate x-values, ambiguous requested sets, falsely classified point sets, representation ties, mismatched visible text, and missing operation data. Recorded output serializes each new operation and every value needed to reproduce the visible problem. Learner-text collection includes every rendered function value, and difficulty evidence comes from displayed coefficients, inputs, points, table rows, and graph bounds rather than the stated answer.

A dedicated Unit 19 suite samples every skill at every difficulty, asserts the wall diagnoses survive, pins representation and choice-order variation, and snapshots representative generated problems. Focused component coverage checks semantic table/equation/graph markup and compact choice composition. The final browser check exercises all five skills at 375 pixels.

### 5. Complete the authorities as one clean cutover

Register the new Unit 19 module after Unit 18 in the generator registry. Update the curriculum rows, playable count, roadmap increment, coverage assertions, and snapshots in the same change. Stage F's manifest membership, prerequisites, required capabilities, and `AVAILABLE_CAPABILITIES` do not change.

## Risks / Trade-offs

- [Three representations plus choices may exceed lesson height on a phone] → Use the proven compact graph width, keep the table to a small bounded row count, and browser-check the real 375-pixel lesson surface.
- [Domain and range choices can collapse when x- and y-sets match] → Filter draws until the two canonical sets differ and all offered labels are unique.
- [A nonlinear draw can accidentally remain collinear] → Derive classification from exact cross-products and reject any nonlinear draw whose consecutive slopes still agree.
- [A comparison can tie, hide its initial value, or leave the plane] → Generate from bounded candidate rules, require a unique requested maximum, keep initial-value graph intercepts on visible y-axis ticks, and pass every plane through existing geometry validation.
- [Shared formatting could let generator and verifier agree on the same bug] → Rebuild expected text and answers independently in the exhaustive test gate rather than importing generator formatting helpers.

## Migration Plan

No stored data changes. Add the operation arms, presentation and verification support before registering Unit 19, then add all five generators and status updates together. Rollback removes the unregistered module and its now-unused operation arms without transforming learner progress.
