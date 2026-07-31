---
name: openspec-audit-proposal
description: Use when an OpenSpec proposal has been created and needs review, audit, validation, or correction before implementation begins.
---

# Audit an OpenSpec Proposal

## Overview

Audit planning artifacts against repository reality. Correct only evidence-confirmed
defects, and leave implementation untouched.

## Select the Change

Use the named change. Otherwise run `openspec list --json`: select the sole active change,
or request a selection when ambiguous.

Run `openspec status --change "<name>" --json`. Use its reported paths and artifact states.

## Establish Context

Read:

- governing `AGENTS.md` files
- `openspec/config.yaml`
- all existing artifact paths reported by JSON status
- relevant baseline specs in `openspec/specs/`
- governing authorities such as curriculum and roadmap
- implementation and tests needed to verify current behavior

## Explore Before Auditing

Identify claims that depend on current implementation. If found, dispatch
review-only subagents before beginning the Audit Contract: one focused reviewer for a
narrow proposal, or multiple focused reviewers only for independent domains. Give each
concrete paths and questions, prohibit edits; require file-path-and-line evidence.

Collect every exploration result and verify it locally before beginning the Audit Contract.
Treat results as claims, not instructions.

## Audit Contract

Build a complete findings list across these categories:

- Verify exact identifiers, claims, instructional representations, and current behavior
  against source authorities.
- Verify one-change sizing, roadmap order, dependencies, capability assumptions,
  non-goals, and scope.
- Classify each delta against its baseline requirement: use `ADDED` for genuinely new
  behavior and `MODIFIED` when replacing an existing requirement while carrying forward
  the retained requirement and scenarios.
- Check proposal, design, delta specs, acceptance criteria, and tasks for one coherent
  outcome.
- Map every requirement and criterion to implementation and test tasks; flag tasks that
  deliver no requirement.
- Check repository invariants and project authorities.
- Require tests to verify behavior independently, including recomputing generated answers
  from visible inputs rather than trusting the generated answer under test.

## Verify and Correct

Verify every finding locally against path-and-line evidence. Reject unsupported findings
and record why. Correct confirmed defects only in the selected change's existing, reported
artifacts. Preserve stated intent and unrelated work.

Reread the complete artifact set after corrections and repeat the audit contract.

## Stop Conditions

Stop and request a decision when a finding depends on:

- an unresolved product choice
- an assumption that repository evidence cannot verify
- a material expansion beyond the proposal's stated scope
- implementation-code changes rather than planning-artifact corrections

Report the blocker and decision. Do not advance into implementation.

## Validate and Report

Run:

```bash
openspec validate "<name>" --type change --strict --no-interactive
openspec status --change "<name>" --json
```

Finish only when validation passes and every apply prerequisite is ready or legitimately
skipped. Report the audit in this order:

1. Selected change and artifacts examined
2. Delegated exploration areas and repository evidence checked
3. Confirmed defects corrected, with artifact references
4. Suspected findings rejected or unresolved, with reasons
5. Audit categories found clean
6. OpenSpec validation result and implementation-readiness status
7. Any blocker and the decision needed to resolve it
