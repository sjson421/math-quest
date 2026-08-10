## Why

Fractions and later algebra cannot be presented accessibly or legibly as plain text. Roadmap
increment 17a measured the alternatives and selected a small structured React/CSS renderer;
17b now needs to make that renderer and its honest capability name part of the application.

## What Changes

- Add a typed math display whose text, rows, stacked fractions, superscripts, and radicals
  compose recursively through one production renderer.
- Give every math display one authored accessible name and every derived fraction echo one
  meaningful name while hiding visual structure from duplicate screen-reader output.
- Render fraction entries through the same notation owner so the answer slot echoes the form
  used by the problem without changing what is submitted or checked.
- Rename the manifest capability `katex` to `math-notation` in Stages D–G.
- Mark `math-notation` and the already-built `fraction-input` capability available, while
  proving that Stage D remains planned until diagram rendering ships.
- Update the README, curriculum capability notes, and roadmap to record the shipped 17b
  infrastructure and close item 17.

This is capability infrastructure for Stages D–G. No unit or skill id gains a generator, and
the playable set remains the existing 61 skills.

### Non-goals

- Adding any generator from Units 7–21 or marking any curriculum row built.
- Building the `diagram`, `expression-input`, `coordinate-plane`, or `chart` capabilities.
- Parsing TeX, adopting KaTeX, or becoming a general-purpose typesetter.
- Adding formula-specific markup or layout rules beyond the five measured recursive
  primitives.

## Capabilities

### New Capabilities

- `math-notation`: Structured, accessible markup for fractions, mixed expressions,
  superscripts, radicals, and their recursive combinations at phone width.

### Modified Capabilities

- `curriculum-manifest`: Replace the rejected library-specific capability name with
  `math-notation`, mark it and `fraction-input` available, and keep Stage D blocked by its
  remaining diagram requirement.

## Impact

The `Display` union and its exhaustive consumers gain a math arm; a new renderer component
and CSS primitives own notation markup; component, entry, manifest, and coverage tests gain
the corresponding gates. Manifest stage requirements and documentation replace legacy
KaTeX wording. No runtime dependency, stored progress shape, sync payload, generator, or
playable skill changes.
