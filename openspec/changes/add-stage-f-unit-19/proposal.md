## Why

Stage F has one remaining unit, so learners can reach polynomial and quadratic work but cannot yet study function notation or compare functions across the representations used on the GED. Unit 19 completes the stage with five generators on the answer and coordinate-plane surfaces already available.

## What Changes

- Add the five Stage F, Unit 19 generators in manifest order: `function-notation`, `evaluate-function`, `domain-range`, `linear-vs-nonlinear`, and `compare-functions`.
- Teach function notation and evaluation from structured linear-function data, including two distinct diagnoses for the `function-notation` wall.
- Present finite relations and three-form comparisons through structured points, semantic tables, the existing coordinate plane, and generated equations.
- Extend independent verification and recorded output so every visible function representation and answer is recoverable from its carried source values.
- Register Unit 19, mark its curriculum rows shipped, close roadmap item 23, and update the playable count from 168 to 173.
- Add no runtime capability: Stage F keeps its existing requirements and `AVAILABLE_CAPABILITIES` remains unchanged.

## Capabilities

### New Capabilities

- `unit-19-functions`: Generated Unit 19 lessons for notation, evaluation, domain and range, linearity, and comparison across table, graph, and equation forms.

### Modified Capabilities

- `coordinate-plane-display`: Permit structured function tables and equations to accompany the existing graph in one accessible, phone-readable comparison composition.
- `problem-generation`: Require the new function equation and coordinate operations to reach independent answer verification, learner-text collection, difficulty evidence, and recorded output.
- `curriculum-manifest`: Resolve all five Unit 19 skills as implemented, complete Stage F, and keep the manifest, curriculum document, registry, and roadmap status aligned.

## Non-goals

- Chart rendering from roadmap item 24, including bar, line, and scatter charts.
- A new function-specific display kind, answer type, input mode, or manifest capability.
- Stage G content, review scheduling, skip-ahead, or other later roadmap work.
- Free-response set notation; domain and range use the existing choice surface.

## Impact

- Curriculum model and content: `src/lib/types.ts`, the Unit 19 generator module and tests, generator verification, recorded output, and `src/curriculum/index.ts`.
- Existing coordinate presentation: `CoordinateContext`, `ProblemView`, and focused component and phone-layout coverage.
- Authorities and status: `docs/curriculum.md`, `docs/roadmap.md`, manifest/coverage assertions, and their snapshots.
- Dependencies and persistence: no new package, service, network requirement, or stored-progress shape.
