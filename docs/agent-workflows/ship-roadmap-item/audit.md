# Phase 4: Audit

Use `openspec-audit-proposal` with the selected name and phase-1 baseline SHA. Give its one
fresh read-only reviewer the complete artifact path set and the focused audit questions. Do
not add reviewers or split the artifacts into domains. Follow the skill's evidence,
correction, strict-validation, and readiness contract.

Proceed only when it declares the change implementation-ready. If a finding needs new
investigation or proposal work before it can be fixed or rejected, record the exact reason
in `exploration.reentries`, reopen the affected preparation gates and Audit under the
handoff contract, set the workflow status to `needs-preparation`, and stop. A new
`prepare-roadmap` session owns that return; do not load exploration into the audit session.
On any other blocked or not-ready result, leave the handoff `ready-to-audit`, return Audit to
pending, and stop.
