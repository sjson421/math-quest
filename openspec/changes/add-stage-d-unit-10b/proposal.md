## Why

Stage D Unit 10 stops after finding a percent of a known quantity. Increment 10b completes
the unit with the inverse percent relationships and the applied percent work that follows
them, so the learner can progress from Unit 9 through all ten percent skills.

## What Changes

- Add generators for Stage D Unit 10 skills `find-the-percent`, `find-the-whole`,
  `percent-change`, `discount-tax-tip`, and `simple-interest` under their existing manifest
  ids.
- Give fixed percent prose structured source data so every answer is independently
  recomputed from the quantities shown without parsing prose or trusting generator math.
- Exercise both named walls: division order in `find-the-percent`, and reversing
  percent-of to recover the whole in `find-the-whole`, with two surviving predictions per
  problem.
- Add focused tests, recorded output, registry coverage, and real-app browser validation for
  all five generators.
- Mark curriculum rows 10.6–10.10 playable, repair the roadmap's stale 94-skill status while
  advancing the runtime-confirmed playable count from 99 to 104, and leave roadmap item 19
  open for Unit 11.

### Non-goals

- Any Unit 11 skill or later curriculum content.
- A new input mode, rendering capability, answer type, or runtime dependency.
- A word-problem phrasing bank: Unit 10 uses fixed operand-derived percent statements and
  the roadmap explicitly reserves phrasing-bank work for named story skills.
- Changes to manifest membership, ids, prerequisites, stage requirements, progress, or sync.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-10-percents`: complete Unit 10 with the five increment 10b generators and their
  percent relationships, applied totals, and simple-interest behavior.
- `problem-generation`: allow an existing prose display to carry percent-specific source
  data whose visible text and answer are independently reconstructed.

## Impact

The existing `src/curriculum/unit-10-percents.ts` module and its tests expand by five
generators. Percent display data and the exhaustive verification/snapshot switches gain the
new operations; coverage, curriculum documentation, README, and roadmap status advance to
104 playable skills. There is no dependency, persistence, sync, prerequisite, or UI
capability change.
