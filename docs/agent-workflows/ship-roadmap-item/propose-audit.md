# Phases 3–4: Propose and audit

## Phase 3

Use `openspec-propose`. Pass the complete selected roadmap text, exact increment and skill
ids, change name, and exploration summary or skip reason. Let the skill create every
artifact required for apply. Inspect paths from
`openspec status --change "<name>" --json` and confirm each required artifact exists or is
legitimately skipped. Do not audit an incomplete proposal.

## Phase 4

Use `openspec-audit-proposal` with the selected name. Follow its evidence, correction,
strict-validation, and readiness contract. Proceed only when it declares the change
implementation-ready. Re-enter phase 2 when a finding needs investigation before it can be
fixed or rejected, then return here. Stop on a blocked or not-ready result.
