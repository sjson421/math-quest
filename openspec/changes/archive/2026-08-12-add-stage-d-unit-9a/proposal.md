## Why

Stage D stops after fraction operations because Unit 9's first six manifest skills have no
generators. Shipping ordered increment 9a introduces decimal meaning, reading, comparison,
rounding, addition, and subtraction on top of the decimal keypad and choice controls already
available.

## What Changes

- Add generators for Stage D Unit 9 skills `decimal-place-value`, `read-decimals`,
  `compare-decimals`, `round-decimals`, `add-decimals`, and `sub-decimals` under their
  existing manifest ids.
- Represent every generated decimal as exact base-10 integer data, reconstruct the visible
  decimal from that data, and independently derive each answer without floating-point
  arithmetic.
- Make `compare-decimals` exercise the named longer-means-bigger wall and retain two distinct
  choice diagnoses on every problem.
- Use the existing decimal keypad for numeric answers and the existing choice control for
  comparison; no new rendering or input capability is required.
- Add focused tests, recorded output, registry coverage, and real-app browser validation;
  mark curriculum rows 9.1–9.6 playable, update the playable count from 82 to 88, and leave
  roadmap item 19 open because increment 9b and Units 10–11 remain.

### Non-goals

- Implementing Unit 9b skills `mult-decimals`–`money-problems`, including the required
  decimal/fraction output-form decision for skills 9.10 and 9.11.
- Adding a new input mode, rendering capability, answer status, or floating-point tolerance.
- Changing manifest membership, ids, prerequisites, stage requirements, progress, or sync.
- Teaching thousandths, arbitrary precision, currency notation, or fraction/decimal
  conversion in this increment.

## Capabilities

### New Capabilities

- `unit-09-decimals`: Generate and diagnose the first six Unit 9 decimal skills with exact
  base-10 semantics and the controls already available to Stage D.

### Modified Capabilities

- `problem-generation`: Independently reconstruct decimal displays and recompute their exact
  place-value, reading, comparison, rounding, addition, and subtraction answers.

## Impact

A new Unit 9 generator and test module, decimal semantic types, independent verification and
recorded-output helpers, decimal-aware inline/column rendering within `ProblemView`, registry
and coverage snapshots, and the curriculum/README/roadmap status text. No dependency,
persistence, sync, manifest graph, rendering capability, or answer-entry behavior changes are
required.
