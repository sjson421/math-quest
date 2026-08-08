## Why

`problem-generation` has accumulated unit-specific contracts alongside its generator-wide
rules, making every future content proposal load unrelated history. The behavior is already
stable, so its requirements can be redistributed now without changing the application.

## What Changes

- Keep the seven original generator-wide contracts plus signed-value and wording-gate
  contracts in `problem-generation`.
- Move all other existing requirements, byte-for-byte, into seven unit-owned capabilities
  covering Units 0 through 6.
- Update the documented baseline inventory from 12 to 19 capabilities when archive sync
  creates the new baseline files.

No curriculum stage, unit, skill id, runtime API, TypeScript type, generator behavior,
learner content, or test expectation changes.

### Non-goals

- Rewriting or clarifying normative requirement text or scenarios.
- Changing archived historical changes.
- Adding a generator, capability implementation, input mode, or rendering surface.

## Capabilities

### New Capabilities

- `unit-00-numbers`: Whole-number independent verification and Unit 0 playability.
- `unit-01-addition`: Stacked column arithmetic and carries greater than one.
- `unit-02-subtraction`: Borrow travel, borrow-chain misconceptions, and Unit 2 playability.
- `unit-03-multiplication`: Multiplication-row working, partial-product alignment, and Unit 3 playability.
- `unit-04-division`: Long-division working, quotient/remainder property answers, and Unit 4 playability.
- `unit-05-order-of-operations`: Precedence, meaningful parentheses, and Unit 5 playability.
- `unit-06-negatives`: Distance from zero and Unit 6 playability.

### Modified Capabilities

- `problem-generation`: Remove the 18 unit-owned requirements while retaining its nine
  generator-wide requirements unchanged.

## Impact

Only `openspec/specs/` ownership and `docs/workflow.md` baseline inventory change after
archive sync. Application code, tests, dependencies, and deployment output are unaffected.
