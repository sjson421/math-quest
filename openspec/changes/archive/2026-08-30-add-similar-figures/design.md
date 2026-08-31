## Context

See `proposal.md` for motivation and scope. Unit 20 already uses one closed `GeometryDiagram` union as the source for strict validation, measurement labels, accessible names, structured formula references, recorded output, learner-text collection, independent answer verification, and one local SVG renderer. `similar-figures` is the first operation that needs two shapes in that single display.

The existing `diagram` display, exact numeric answer, keypad, Stage G capabilities, and intro path already fit the lesson. Unit 11 has also introduced scale factors, so this skill can focus on matching corresponding sides rather than introduce another ratio model or answer surface.

## Goals / Non-Goals

**Goals:**

- Keep one operation-specific source declaration responsible for both rectangles, labels, proportions, accessible text, and the missing-side answer.
- Make the answer independently recoverable from only the three numeric sides visible to the learner.
- Extend every exhaustive geometry consumer so an unsupported field or operation fails closed.
- Preserve all existing fraction and geometry diagram output while fitting the new pair on the installed phone surface.

**Non-Goals:**

- A reusable scene graph, arbitrary shape pairing, authored drawing primitives, or numeric proportional drafting.
- General proportion infrastructure or a second copy of Unit 11's ratio data.
- Missing values on the small rectangle, shrinking figures, or fractional scale factors.

## Decisions

### Extend the closed geometry operation instead of adding a display kind

Add one `similar-figures` arm to the existing geometry declaration. It carries:

- `smallLength` and `smallWidth`
- `largeKnownSide`
- `knownSide: 'length' | 'width'`
- one existing `LengthUnit`

The matching small side is selected by `knownSide`. Dividing `largeKnownSide` by it yields the scale factor; multiplying the other small side yields the answer. The data does not carry the scale factor, missing side, answer, labels, formulas, or SVG paths.

This keeps the visible-source rule honest and makes the operation join the existing validation, rendering, recording, and verification paths. A new `Display` arm would duplicate diagram behavior and answer-slot integration. Reusing a story with `RatioData` would omit the paired figure required by the roadmap.

The arm rejects non-integers, equal small sides, a known large side that is not an exact multiple, and any factor no greater than one. Equal small sides are excluded because a square makes the two side roles visually weaker and makes copied-side predictions collide.

### Render one fixed pair rather than general geometry

One responsive SVG contains a smaller rectangle on the left and a larger rectangle on the right. Both templates use the same fixed aspect ratio, so they communicate similarity without claiming that their screen dimensions are proportional to generated measurements. Lowercase `a` and `b` name the small sides; uppercase `A` and `B` name the corresponding large sides. Three labels include the letter, value, and unit; the other large label contains a question mark.

The existing SVG remains one accessible image. Its derived name describes both figure roles, all known measurements, the missing side role, and the unit while drawing children stay hidden. This is smaller and more reviewable than a scene graph, multiple figure families, or authored path data.

### Derive two valid proportion references from the operation

The formula helper adds two structured references:

- `a/A = b/B`, comparing each small side with its large counterpart
- `a/b = A/B`, comparing the same shape ratio in both figures

Both are true for every generated pair and neither is highlighted as the answer. Accessible labels state the lowercase/uppercase mapping. Showing a false distractor formula was rejected because the current geometry surface provides references, not claims that wrong formulas belong on a formula sheet.

### Generate integer growth and two collision-proof diagnoses

Difficulty ladders choose unequal small sides and a whole scale factor greater than one. The generator stores only their product for the known large side, randomizes whether length or width is known, and returns the other product as an exact whole-number answer through the ordinary keypad.

The two predicted misconceptions are:

- `copied-known-large-side`: use `largeKnownSide` as the missing side
- `used-additive-side-change`: add the known side's increase to the other small side

If corresponding small side is `x`, other small side is `y`, and scale is `f`, these values are `xf` and `y + x(f - 1)` while the answer is `yf`. With `x != y` and `f > 1`, all three values differ, so central filtering cannot erase or merge either diagnosis.

The teaching line is `Corresponding sides in similar figures use the same scale factor.` The hint and worked steps first derive the scale from the known pair, then apply it to the other side. This builds on Unit 11 without restating its drawing-versus-actual context.

### Advance the implemented boundary without changing manifest authority

Append the generator to Unit 20 after `pythagorean`; do not edit the Stage G manifest entry or capability list. Coverage derives all thirteen Unit 20 skills as implemented and leaves all nine Unit 21 skills planned, producing 186 playable skills.

Update the curriculum row, roadmap status and 20c increment, README status prose, snapshots, and current-count assertions together. The parent roadmap checkbox stays open because Unit 21 remains.

## Risks / Trade-offs

- **Paired labels or formulas crowd a phone**: Keep both shapes inside the current responsive SVG, use the existing wrapping formula row, assert static markup, and inspect a 375-by-812 Chromium screenshot.
- **Side letters drift from numeric roles**: Derive letters, measurement labels, accessible text, formulas, and answer from `knownSide`; independently verify both known-side variants.
- **A fixed drawing looks numerically proportional when it is not**: Give both rectangles the same fixed aspect ratio but make no claim that rendered lengths match generated values.
- **A new arm disappears from a review gate**: Extend exhaustive switches in validation, formulas, learner text, recording, difficulty evidence, and independent verification; keep the unrendered-field gate empty.
- **Predictions collide after filtering**: Enforce unequal small sides and scale greater than one, then sample both prediction tags across every difficulty.

## Migration Plan

1. Extend and test the geometry declaration, labels, proportion references, and paired SVG while leaving the generator registry unchanged.
2. Extend recorded output, learner-text collection, difficulty evidence, and independent verification; prove existing diagram output remains unchanged.
3. Add the generator and focused tests, then append it in manifest order and update counts, snapshots, and documentation authorities.
4. Run focused and full gates, then exercise the intro and lesson at 375 by 812 pixels and inspect the passing screenshot.

Rollback removes the one registered generator and one geometry arm, restores counts and documentation, and leaves all earlier Unit 20 and fraction diagrams intact. No stored or synced data needs migration or rollback.
