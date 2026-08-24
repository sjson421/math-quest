## Why

Roadmap increment 18b needs `solve-by-factoring` and `quadratic-formula` to accept two roots, but every current answer and input surface represents one value, one expression, one choice, or one geometric point. Root-pair entry must land first as shared infrastructure so the later content change does not hide a new input capability inside its generators.

## What Changes

- Add a structured answer for an unordered pair of exact rational roots. Either entry order is correct, while malformed or incomplete pairs remain unparseable.
- Add a `root-pair` lesson input mode with two labelled numeric slots, one reused numeric keypad, explicit slot selection, and one Check action enabled only after both entries are complete.
- Keep the lesson's existing string entry boundary through a pure internal root-pair codec; learner-facing slots never expose that encoding.
- Extend central misconception filtering and diagnosis to compare, exclude, and deduplicate structured root pairs exactly.
- Add `root-pair-input` to the curriculum capability model, Stage F requirements, and available capabilities after its infrastructure is complete. No skill becomes playable from the capability alone.
- Update roadmap, curriculum, and governing-agent capability prose to record the prerequisite before content increment 18b, and retire the obsolete Stage F all-planned baseline scenario instead of archiving it as current behavior.

This change is tooling-only. It adds no curriculum generator and has no skill id in scope.

## Capabilities

### New Capabilities

- `root-pair-input`: Presents and submits two exact numeric roots through a dedicated, accessible two-slot input surface.

### Modified Capabilities

- `answer-entry`: Adds an unordered exact root-pair answer, canonical internal entry, and unfinished-entry behavior for two numeric slots.
- `problem-generation`: Adds structured root-pair misconception filtering, deduplication, answer exclusion, and diagnosis.
- `curriculum-manifest`: Declares `root-pair-input` as built infrastructure required by Stage F without changing any skill membership or prerequisite, replacing a capability requirement whose Stage F scenario still freezes the historical 145-skill state.

## Non-goals

- No generator or playable-state change for `difference-of-squares`, `solve-by-factoring`, `quadratic-formula`, or any other skill.
- No irrational or radical answer entry, approximate root pair, complex root, repeated-root lesson design, or general-purpose list input.
- No change to expression grammar, coordinate-plane point semantics, choice input, progress records, sync payloads, or stored migrations.

## Impact

The change affects answer and misconception types, exact parsing and checking, lesson input routing, visible-entry policy, recorded output, capability resolution, and focused component and library tests. It reuses the existing numeric keypad, exact rational parser, and offline React/CSS surface, adds no dependency, and leaves persisted progress unchanged because generated problems and pending entries are session-local.
