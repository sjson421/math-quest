# Phase 4: Audit

Use `openspec-audit-proposal` with the selected name and phase-1 baseline SHA. Give its one
fresh read-only reviewer the complete artifact path set and the focused audit questions. Do
not add reviewers or split the artifacts into domains. Follow the skill's evidence,
correction, strict-validation, and readiness contract.

Proceed only when it declares the change implementation-ready. A finding that needs new
investigation or proposal work is corrected here, not returned: amend the change in place
under the handoff contract's forward amendment steps, then finish the audit over the revised
artifacts. On any other blocked or not-ready result, leave the handoff `ready-to-audit`,
return Audit to pending, and stop.
