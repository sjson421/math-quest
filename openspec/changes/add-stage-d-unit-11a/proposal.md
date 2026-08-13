## Why

Stage D is complete through Unit 10, leaving Unit 11 as the next curriculum block. Its
first six skills establish ratios, unit rates, proportions, scale drawings, and unit
conversion before the later `ratio-words` wall can apply those ideas in varied prose.

## What Changes

- Add Stage D Unit 11 generators for `write-ratios`, `simplify-ratios`, `unit-rate`,
  `solve-proportions`, `scale-drawings`, and `unit-conversion`.
- Use the existing fraction keypad, choice input, math notation, and story display; no new
  rendering or answer-entry capability is required.
- Carry ratio/proportion source values as typed semantic display data so tests can
  reconstruct learner-facing text and answers independently from generator arithmetic.
- Teach unit conversion from a fixed within-system customary and metric set, with the
  applicable conversion relation stated in every problem.
- Register and record the six generators, mark curriculum rows 11.1–11.6 playable, and
  advance the documented playable total while leaving roadmap item 19 open for 11b.

## Non-goals

- Do not implement `ratio-words` or add its phrasing-bank frames; that is increment 11b.
- Do not extend the fraction-only diagram model with labelled dimensions. Scale-drawing
  questions use the existing story surface and explicit scale statements.
- Do not add cross-system conversion or require memorisation of conversion factors.
- Do not change the manifest graph, stage capability flags, progress model, or sync format.

## Capabilities

### New Capabilities

- `unit-11-ratios-proportions`: Playable Unit 11a ratio, rate, proportion, scale-drawing,
  and within-system unit-conversion content under the six manifest ids.

### Modified Capabilities

- `problem-generation`: require ratio/proportion prose and notation to carry structured
  source data whose visible output and exact or choice answer are independently rebuilt.

## Impact

- New Unit 11 generator and focused test modules under `src/curriculum/`.
- Ratio/proportion semantic data and exhaustive verification/recording branches in
  `src/lib/types.ts`, `src/curriculum/generators.test.ts`, and
  `src/curriculum/recorded-output.ts`.
- The stale Stage D manifest comment that attributes diagram capability to
  `scale-drawings` is corrected without changing the manifest graph or capability flags.
- Registry, coverage snapshots/assertions, curriculum status markers, README summary, and
  roadmap progress text updated from 104 to 110 playable skills.
- No new package, network dependency, runtime service, migration, or public API.
