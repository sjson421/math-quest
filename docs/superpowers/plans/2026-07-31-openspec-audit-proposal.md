# OpenSpec Proposal Audit Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and behaviorally validate a project-local skill that explores the codebase, audits a completed OpenSpec proposal, corrects confirmed planning defects, and verifies implementation readiness.

**Architecture:** Keep the operational workflow in one `SKILL.md`, with generated UI metadata in `agents/openai.yaml`. Validate the process with a fresh-agent RED/GREEN scenario: first record baseline audit behavior without the skill, then repeat against the same raw fixture with the skill and close only demonstrated gaps.

**Tech Stack:** Markdown Agent Skill, OpenSpec CLI, Codex subagents, system `init_skill.py` and `quick_validate.py`, Git.

## Global Constraints

- Create the skill only under `.agents/skills/openspec-audit-proposal/`.
- Explore relevant implementation code with review-only subagents before auditing proposal claims.
- Treat subagent findings as unverified claims; verify evidence locally before editing.
- Correct only confirmed defects within the proposal's stated intent; stop for product decisions or scope expansion.
- Edit planning artifacts only; never implement the proposed change.
- Preserve the existing user-owned `ship-roadmap-item` modifications and deletions.
- Keep `SKILL.md` self-contained; add no scripts, assets, references, or auxiliary documentation.

---

### Task 1: Record the no-skill audit baseline

**Files:**
- Create temporarily: `/tmp/openspec-audit-proposal-fixture/`
- Record temporarily: `/tmp/openspec-audit-proposal-baseline.md`
- Read: `AGENTS.md`
- Read: `openspec/config.yaml`
- Read: `openspec/specs/`
- Read: `openspec/changes/archive/`

**Interfaces:**
- Consumes: Real repository authorities and a temporary proposal fixture containing realistic contradictions.
- Produces: A baseline report identifying which audit behaviors occur without specialized guidance and which defects are missed.

- [x] **Step 1: Build a disposable realistic fixture**

Create `/tmp/openspec-audit-proposal-fixture/` from one archived change's four artifact shapes. Seed a small set of independently verifiable defects without changing the repository: one false runtime/capability claim, one incorrect `ADDED` versus `MODIFIED` delta, one requirement with no delivering task, and one testing task that trusts a generated answer instead of recomputing it independently. Record the seeded defects outside the fixture so the baseline agent cannot read the answer key.

- [x] **Step 2: Dispatch the baseline agent without the new skill**

Use a fresh subagent with no inherited conversation and this task-local brief:

```text
Audit the OpenSpec proposal artifacts in /tmp/openspec-audit-proposal-fixture against the current Math Quest repository/worktree. Determine whether it is ready for implementation. You may read the repository and fixture, but do not edit files. Report evidence with file paths and line numbers.
```

Do not mention the intended skill, seeded defects, expected findings, or this plan.

- [x] **Step 3: Verify RED behavior**

Save the returned report to `/tmp/openspec-audit-proposal-baseline.md`. Compare it manually with the private defect list and record: defects missed, claims accepted without source evidence, repository areas not explored, and whether the agent proposed unsafe edits or implementation work. The baseline must exhibit at least one relevant gap; otherwise strengthen the fixture before authoring the skill.

### Task 2: Scaffold and author the minimal skill

**Files:**
- Create: `.agents/skills/openspec-audit-proposal/SKILL.md`
- Create: `.agents/skills/openspec-audit-proposal/agents/openai.yaml`
- Read: `docs/superpowers/specs/2026-07-31-openspec-audit-proposal-design.md`
- Read: `/tmp/openspec-audit-proposal-baseline.md`

**Interfaces:**
- Consumes: The approved design and demonstrated baseline failures.
- Produces: `$openspec-audit-proposal`, a self-contained audit-and-correct workflow with UI discovery metadata.

- [x] **Step 1: Initialize the skill with generated metadata**

Run:

```bash
python3 /home/jay-son/.codex/skills/.system/skill-creator/scripts/init_skill.py openspec-audit-proposal \
  --path .agents/skills \
  --interface 'display_name=Audit OpenSpec Proposal' \
  --interface 'short_description=Audit a proposal before implementation' \
  --interface 'default_prompt=Use $openspec-audit-proposal to audit and correct the selected OpenSpec proposal.'
```

Expected: the skill directory contains only `SKILL.md` and `agents/openai.yaml`.

- [x] **Step 2: Replace the generated template with the minimal workflow**

Use `apply_patch` to write frontmatter with only:

```yaml
---
name: openspec-audit-proposal
description: Use when an OpenSpec proposal has been created and needs review, audit, validation, or correction before implementation begins.
---
```

Write the body in imperative form and include these ordered sections:

1. Overview: audit planning artifacts against repository reality and correct only verified defects.
2. Select the change: named change, sole active change, or explicit selection when ambiguous; use `openspec status --change <name> --json` paths.
3. Establish context: read `AGENTS.md`, `openspec/config.yaml`, all existing artifacts, relevant baseline specs, authorities, and implementation files.
4. Explore before auditing: divide independent investigation areas, dispatch review-only subagents as needed, require path-and-line evidence, prohibit edits, and collect every result before editing.
5. Audit contract: exact identifiers/current behavior, scope and dependencies, delta direction, cross-artifact coherence, requirement-to-task coverage, repository invariants, and independent testing commitments.
6. Verify and correct: locally verify every finding, edit only existing selected-change artifacts, reject unsupported findings, and reread the complete set.
7. Stop conditions: unresolved product decision, unverifiable assumption, material scope expansion, or need for implementation code.
8. Validate and report: run `openspec validate` plus JSON status; report examined artifacts, delegated exploration, corrections, rejected/unresolved findings, clean categories, and readiness.

Use positive output contracts for the report shape. Add counters only for baseline rationalizations actually observed in Task 1.

- [x] **Step 3: Inspect generated metadata**

Run:

```bash
sed -n '1,120p' .agents/skills/openspec-audit-proposal/agents/openai.yaml
```

Expected: quoted interface values, a 25–64 character short description, and a default prompt explicitly naming `$openspec-audit-proposal`.

- [x] **Step 4: Commit the initial skill**

Run:

```bash
git add -f -- .agents/skills/openspec-audit-proposal
git diff --cached --check
git commit -m "Add initial OpenSpec proposal audit skill"
```

Expected: one commit containing only the initial skill and generated metadata.

### Task 3: Verify GREEN behavior and refine

**Files:**
- Modify if needed: `.agents/skills/openspec-audit-proposal/SKILL.md`
- Read: `/tmp/openspec-audit-proposal-fixture/`
- Read: `/tmp/openspec-audit-proposal-baseline.md`

**Interfaces:**
- Consumes: The authored skill and the unchanged baseline fixture.
- Produces: Evidence that the skill closes baseline gaps without unsafe artifact or implementation changes.

- [x] **Step 1: Dispatch a fresh agent with the skill**

Use a fresh subagent with no inherited conversation:

```text
Use $openspec-audit-proposal at .agents/skills/openspec-audit-proposal to audit the proposal fixture at /tmp/openspec-audit-proposal-fixture against the current Math Quest repository/worktree. The fixture is disposable. Follow the skill and report the result.
```

Do not provide the defect list or baseline conclusions.

- [x] **Step 2: Verify GREEN behavior**

Confirm the agent explored implementation evidence before auditing, delegated independent investigation areas when warranted, found every seeded defect with evidence, separated suspicions from confirmed defects, avoided implementation code, and produced the required report shape. Inspect any fixture edits and confirm they affect only confirmed proposal defects.

- [x] **Step 3: Refactor demonstrated gaps only**

If the agent misses a seeded defect or finds a new loophole, update `SKILL.md` with the smallest positive recipe, required structural slot, or observable conditional that addresses that failure. Repeat Step 1 with a clean copy of the fixture until the behavior is consistent.

- [x] **Step 4: Commit verified refinements when needed**

If GREEN verification changes `SKILL.md`, stage the tracked skill file, inspect the
staged diff, and commit with:

```bash
git add -- .agents/skills/openspec-audit-proposal/SKILL.md
git diff --cached --check
git commit -m "Refine OpenSpec proposal audit workflow"
```

If verification passes without a skill change, record that no Task 3 commit was needed.

### Task 4: Validate the completed skill

**Files:**
- Verify: `.agents/skills/openspec-audit-proposal/SKILL.md`
- Verify: `.agents/skills/openspec-audit-proposal/agents/openai.yaml`
- Verify: `docs/superpowers/plans/2026-07-31-openspec-audit-proposal.md`

**Interfaces:**
- Consumes: Behaviorally verified, committed skill files.
- Produces: Structural validation evidence with no test contamination or unrelated staged changes.

- [x] **Step 1: Run the structural validator**

Run the provided validator with a Python environment containing PyYAML:

```bash
python3 /home/jay-son/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/openspec-audit-proposal
```

If `yaml` is unavailable, install PyYAML only into a disposable `/tmp` target and set `PYTHONPATH` for this command; do not add a project dependency.

Expected: `Skill is valid!`

- [x] **Step 2: Run content checks**

Run:

```bash
grep -En 'TODO|TBD|PLACEHOLDER|XXX' .agents/skills/openspec-audit-proposal/SKILL.md || true
wc -w .agents/skills/openspec-audit-proposal/SKILL.md
git diff --check -- .agents/skills/openspec-audit-proposal docs/superpowers/plans/2026-07-31-openspec-audit-proposal.md
```

Expected: no placeholders, no whitespace errors, and a concise skill body near the 500-word target.

- [x] **Step 3: Remove disposable test artifacts**

Delete only `/tmp/openspec-audit-proposal-fixture/`, `/tmp/openspec-audit-proposal-baseline.md`, and any disposable validator dependency directory created for this task. Confirm no fixture exists under `openspec/changes/`.

- [x] **Step 4: Review the final repository state**

Run:

```bash
git status --short
git diff -- .agents/skills/openspec-audit-proposal
git log --oneline -- .agents/skills/openspec-audit-proposal
```

Expected: the worktree is clean, the new skill is committed, and no disposable fixture
exists. The implementation plan is already committed as the execution checkpoint.

- [x] **Step 5: Commit validation-driven fixes only when needed**

If structural validation required a file change, stage only that tracked skill file,
inspect it, and commit with:

```bash
git add -- .agents/skills/openspec-audit-proposal
git diff --cached --check
git commit -m "Fix OpenSpec proposal audit validation"
```

If validation required no change, record that no Task 4 commit was needed.
