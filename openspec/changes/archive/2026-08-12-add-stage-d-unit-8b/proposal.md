## Why

Stage D Unit 8 stops halfway through fraction operations because its final six manifest
skills have no generators. Shipping ordered increment 8b completes mixed-number conversion
and arithmetic, fraction multiplication and division, and the unit's fixed-frame applied
practice on top of the mixed-entry and notation capabilities delivered by 8a.

## What Changes

- Add generators for Stage D Unit 8 skills `mixed-to-improper`, `add-mixed`, `sub-mixed`,
  `mult-fractions`, `div-fractions`, and `fraction-words` under their existing manifest ids.
- Require mixed form and lowest terms for mixed-number arithmetic answers, using the existing
  `allowMixed`, `requireMixed`, and `requireSimplified` answer-entry behavior from increment
  8a; keep every generated answer and predicted mistake positive and enterable.
- Make every `sub-mixed` problem exercise borrowing from the whole and retain two distinct
  diagnoses; make every `div-fractions` problem retain diagnoses for flipping the wrong
  fraction and multiplying without flipping.
- Extend structured fraction semantics and independent verification to mixed-number displays,
  fraction multiplication, and fraction division.
- Add an authored adult-situation frame bank for `fraction-words`. Each story asks for a
  proper part-over-whole fraction, carries the relevant quantities for independent answer
  verification, and receives source-level content checks even when a frame is not sampled.
- Add focused tests, recorded output, registry coverage, and real-app browser validation;
  mark curriculum rows 8.7–8.12 playable, update the playable count from 76 to 82, and leave
  roadmap item 19 open because Units 9–11 remain.

### Non-goals

- Implementing any Unit 9–11 generator or resolving Unit 9's required decimal/fraction output
  form decision.
- Adding a new input mode, negative mixed-number entry, or any capability beyond the existing
  fraction keypad, mixed entry, and math notation.
- Changing manifest membership, ids, prerequisites, stage requirements, progress, or sync.
- General expression evaluation for structured notation or free-composed story prose.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-08-fraction-operations`: Complete the unit with its final six generators, including
  both required wall diagnoses and fixed-frame fraction stories.
- `problem-generation`: Independently recompute mixed-number conversion and arithmetic,
  fraction multiplication and division, and exact fraction story answers from displayed data.
- `word-problem-phrasing`: Extend authored, seeded, source-checked story frames to proper
  fraction answers while preserving their three-quantity comprehension diagnoses.

## Impact

The Unit 8 generator and test module, fraction semantic types, independent verification and
recorded-output helpers, phrasing engine and frame tests, a new fraction frame bank, coverage
snapshots, and the curriculum/README/roadmap status text. No dependency, persistence, sync,
manifest graph, rendering component, or answer-entry behavior changes are required.
