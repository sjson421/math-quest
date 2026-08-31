## Why

Roadmap increment 20c is the next ordered content change and leaves Unit 20 one skill short of completion. The existing geometry surface can show one figure, but `similar-figures` must show two corresponding figures whose visible measurements determine one missing side.

## What Changes

- Add the Stage G, Unit 20 generator for `similar-figures` after `pythagorean` in manifest order.
- Present a small and large similar rectangle together, with three numeric side labels and one missing large side. Derive an exact whole-number answer from the visible corresponding sides without carrying the answer in the figure data.
- Extend the validated geometry model and local SVG renderer with the paired figure, matching side letters, a missing marker, one derived accessible name, and two equivalent structured proportion references.
- Add a reviewed teaching line, stable difficulty-1 intro, growing difficulty bands, independent answer reconstruction, complete recorded output, static rendering coverage, and real-app phone validation.
- Mark curriculum row 20.13 and roadmap increment 20c complete, raise the playable total from 185 to 186, and leave roadmap item 26 open for Unit 21.
- Add no new capability, display kind, input mode, answer type, prerequisite, dependency, or stored data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-20-geometry-measurement`: Add the generated `similar-figures` lesson and its teaching contract.
- `diagram-rendering`: Extend the closed geometry surface with one accessible paired-rectangle view and derived proportion references.
- `problem-generation`: Independently recover, record, and check the visible scale relationship and exact missing side.
- `curriculum-manifest`: Resolve all thirteen Unit 20 skills as implemented without changing manifest or capability authority.
- `skill-intros`: Present the stable paired-figure example through the same renderer used in practice.

## Non-goals

- Any Unit 21 generator, Stage H work, or completion of roadmap item 26.
- Multiple similar-shape families, fractional scale factors, missing sides on the smaller figure, or proportional drafting from numeric dimensions.
- A generic geometry scene graph, new diagram capability, formula-sheet route, answer control, runtime dependency, or authored SVG payload.
- Requiring learners to enter units, proportions, side letters, or formulas; the answer remains numeric through the existing keypad.
- Any progress, sync, mastery, review, skip-ahead, timed-mode, or persistence change.

## Impact

- Geometry model and rendering: the existing geometry-diagram library, SVG component, static tests, learner-text collection, recorded output, and independent generator verifier.
- Curriculum: the existing Unit 20 generator module and focused tests, registry coverage, snapshots, curriculum and roadmap authorities, README status text, and playable counts.
- Presentation proof: the Unit 20 intro path plus scripted Chromium validation at 375 by 812 pixels.
- No package, API, network, manifest capability, or stored-progress migration.
