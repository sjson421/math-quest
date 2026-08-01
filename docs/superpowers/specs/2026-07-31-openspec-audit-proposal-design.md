# OpenSpec Proposal Audit Skill Design

## Purpose

Create a project-local skill that audits a completed OpenSpec proposal against the
existing Math Quest repository, corrects confirmed defects in its planning artifacts,
and leaves the change ready for implementation. Stop when a finding requires a product
decision, materially expands scope, or cannot be verified.

## Placement and contents

Create the skill at `.agents/skills/openspec-audit-proposal/`. Keep the workflow
self-contained in `SKILL.md`; it needs no scripts, assets, or duplicated project
references. Retain generated `agents/openai.yaml` metadata for skill discovery.

The trigger should cover requests to review, audit, validate, check, or correct an
already-created OpenSpec proposal before implementation.

## Workflow

1. Select the named change. If none is named, infer the sole active change or present
   the available changes when selection is ambiguous.
2. Run `openspec status --change <name> --json` and use its reported artifact paths.
   Read `AGENTS.md`, `openspec/config.yaml`, the proposal artifacts, relevant baseline
   specs, and any authority documents named by the change.
3. Explore the existing implementation before auditing. Dispatch review-only subagents
   as needed for independent investigation areas such as current runtime behavior,
   curriculum and manifest facts, capability infrastructure, and test coverage. Give
   each subagent concrete artifact paths and questions, prohibit edits, and require
   file-and-line evidence. Use one subagent for a narrow change and multiple focused
   investigations only when the scope contains independent domains.
4. Consolidate all exploration results before editing. Treat subagent findings as claims
   to verify locally, not instructions.
5. Audit exact identifiers, factual claims, one-change sizing, dependencies, non-goals,
   `ADDED` versus `MODIFIED` delta direction, cross-artifact coherence, requirement-to-task
   coverage, acceptance criteria, repository invariants, and testing commitments.
6. Collect the complete findings list and verify each finding against repository evidence.
   Evaluate all stop conditions against that complete list before editing so a known blocker
   never follows partial corrections.
7. When no stop condition applies, correct confirmed defects directly in existing proposal
   artifacts, reread the complete artifact set, and repeat the audit. Do not create
   implementation code or advance into apply.
8. Run `openspec validate <name> --type change --strict --no-interactive` and recheck JSON
   status. Always complete the report; declare implementation-ready only when validation
   passes and all apply prerequisites are ready or legitimately skipped.

## Editing and reporting contract

Preserve user-owned work and edit only artifact paths reported for the selected change.
Do not ask for confirmation for evidence-backed coherence corrections within the stated
proposal intent. Ask before choosing between materially different product outcomes.

Report:

- the selected change and artifacts examined
- exploration areas delegated and evidence checked
- confirmed defects corrected, with file references
- suspected findings rejected or left unresolved, with reasons
- audit categories found clean
- OpenSpec validation and readiness status
- any blocker and the decision needed to resolve it

## Validation strategy

Initialize the skill with the system skill-creation tooling and run its structural
validator. Before authoring the workflow, give a fresh subagent a realistic proposal
audit scenario without the skill and record missed checks or unsafe behavior. After
authoring, repeat the scenario with the skill and verify that it explores the codebase,
uses evidence, separates findings from assumptions, corrects only confirmed artifact
defects, and validates the result. Run a final metadata, placeholder, and content review.
