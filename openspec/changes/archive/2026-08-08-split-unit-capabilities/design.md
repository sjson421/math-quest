## Context

See `proposal.md` for motivation. `problem-generation` currently owns 27 requirements and
87 scenarios. Nine requirements are generator-wide; the other 18 describe the shipped
behavior of Units 0–6. This change moves ownership only, so normative bytes are the migration
boundary.

## Goals / Non-Goals

**Goals:**

- Leave each of the 27 requirement names and 87 scenarios present exactly once.
- Preserve every moved requirement block byte-for-byte in its new capability.
- Keep the original seven generator-wide requirements plus signed-value and wording-gate
  requirements in `problem-generation`.

**Non-Goals:**

- Modify application code, tests, generated content, or archived changes.
- Improve wording, formatting, or requirement organization within a moved block.

## Decisions

### Move complete requirement blocks through deltas

Declare all 18 unit-owned names as `REMOVED` from `problem-generation` and copy their full
blocks under `ADDED` in the new capability delta. Archive sync then creates seven baseline
files and removes the old owners. Editing the baseline directly was rejected because it
would bypass the normal auditable delta lifecycle.

### Organize by the unit that supplies the behavior

Each unit capability owns its working representation, unit-specific verification, wall
diagnoses, and playability contract. Unit 1 has no separate playability requirement today,
so it owns only the two addition-working contracts. Inventing a new contract was rejected
because this change preserves behavior.

### Verify normative identity structurally

Before sync, inventory the original `problem-generation` requirement names, scenario counts,
and SHA-256 hash of every complete requirement block. Validate that every ADDED block matches
its original hash and every original name appears exactly once across retained and added
requirements. Repeat the same inventory across the 19 synced baseline capabilities; require
27 requirements, 87 scenarios, unique names, and identical hashes.

## Risks / Trade-offs

- **Archive merge changes whitespace** → Compare full block hashes after sync and correct
  formatting before committing.
- **A requirement is copied twice or omitted** → Enforce unique names and the exact 27/87
  inventory both before and after sync.
- **Historical context appears inconsistent** → Leave archived changes untouched; they record
  ownership at the time they shipped.

## Migration Plan

1. Validate the delta inventory and strict change schema.
2. Commit and push the active spec-only change after repository gates pass.
3. Archive with sync, verify all hashes and counts in the new 19-capability baseline, update
   `docs/workflow.md`, then commit and push the archive separately.

Rollback is a revert of the archive commit; no runtime or stored-data migration exists.
