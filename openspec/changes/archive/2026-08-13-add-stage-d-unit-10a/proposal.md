## Why

Stage D's Unit 10 (Percents) has no generators yet, so all ten of its skills remain
`planned`. Increment 10a starts the unit: the meaning of a percent, both conversions to and
from decimal, conversion to a fraction, and finding a percent of a quantity — the four
foundational skills every later Unit 10 skill (finding the percent, finding the whole,
percent change, discount/tax/tip, simple interest) builds on.

## What Changes

- Add generators for Stage D Unit 10 skills `percent-meaning`, `percent-to-decimal`,
  `decimal-to-percent`, `percent-to-fraction`, and `percent-of`, under their existing
  manifest ids in `src/curriculum/manifest/stage-d.ts`.
- Exercise the named wall: `decimal-to-percent` on shifting the decimal point the wrong
  direction (confusable with `percent-to-decimal`'s opposite shift).
- Add focused tests, recorded output, and registry coverage for the five generators.
- Mark curriculum rows 10.1–10.5 playable, update the playable count from 94 to 99, and
  leave roadmap item 19 open — increment 10b and Unit 11 remain.
- Real-app browser validation per `docs/environment.md`.

### Non-goals

- Unit 10 skills `find-the-percent`, `find-the-whole`, `percent-change`,
  `discount-tax-tip`, `simple-interest` (increment 10b).
- Any Unit 11 skill.
- Any new answer-entry capability (`requireDecimal`/`requireFraction`, added for Unit 9's
  conversion pair) — a percent value (e.g. `45`) and its decimal form (e.g. `0.45`) are
  numerically distinct, so the existing exact-value `checkAnswer` already disambiguates
  them without a required-form flag.
- Currency, tax, or interest formulas — those are `discount-tax-tip` and
  `simple-interest` in 10b.
- Changing manifest membership, ids, prerequisites, stage requirements, progress, or sync.

## Capabilities

### New Capabilities

- `unit-10-percents`: generate and diagnose Unit 10's first five skills — percent meaning,
  the two percent/decimal conversions, percent-to-fraction, and percent-of-a-quantity.

### Modified Capabilities

None.

## Impact

A new `src/curriculum/unit-10-percents.ts` module (5 generators) and its tests; manifest
registration; curriculum doc, README, and roadmap status text. No dependency, persistence,
sync, manifest graph, or rendering-capability change is required — the decimal keypad and
exact-rational `checkAnswer` already exist.
