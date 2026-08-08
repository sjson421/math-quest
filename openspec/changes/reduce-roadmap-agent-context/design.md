## Context

See `proposal.md` for motivation. The shipping skill is a 3,094-word monolith loaded before
all ten phases. It invokes migrated duplicates of normal OpenSpec skills, while Codex also
discovers identical or near-identical repository skills from `.agents` and `.codex`.
Simplification sends a complete diff to three perspective-based agents late in the run.

The repository must remain usable from current Codex and Claude hosts. `.agents/skills` is
the Codex source, while Claude retains `.claude/skills` and `.claude/commands/opsx`.

## Goals / Non-Goals

**Goals:**

- Reduce instruction and delegated-review context without weakening any shipping gate.
- Make every delegation bounded, filesystem-based, independently reviewable, and cheap by
  default.
- Keep future content diffs small enough that review cost grows with an increment rather
  than an entire large unit.

**Non-Goals:**

- Change runtime code or globally downgrade subagents.
- Make token totals a correctness gate; telemetry varies with the task and model runtime.

## Decisions

### Keep a small dispatcher and seven phase references

Keep the phase table, carried state, transition rule, and delegation contract in
`SKILL.md`, below 1,000 words. Move exact phase instructions into one-level references:
`select.md`, `explore.md`, `propose-audit.md`, `apply.md`, `simplify.md`, `review.md`, and
`finish.md`. Read exactly one reference on entering its phase group; never preload a later
reference. Mirror the same files under `.claude/skills/ship-roadmap-item`.

This preserves the current gates while keeping future-phase detail out of early agents.
Keeping the monolith was rejected because every late fork inherits irrelevant instructions.

### Delegate by path domain, never by perspective

Default to one reviewer. Use two or three only when the parent records disjoint path sets
with no shared file; each reviewer applies reuse, quality, and efficiency lenses to its own
set. Spawn with no inherited turns, `gpt-5.6-terra`, medium reasoning, and read-only scope.
The prompt contains only the repo root, baseline SHA, paths, focused questions, and the
required concise file-and-line result. Reviewers read diffs and context from the shared
filesystem. The parent verifies every finding.

Perspective fan-out was rejected because it makes several agents reread the same artifact.
Inline-only review was rejected because a bounded independent pass still catches useful
errors.

### Make normal OpenSpec skills canonical

Point the shipping skill at `openspec-propose`, `openspec-audit-proposal`,
`openspec-apply-change`, `simplify`, and `openspec-archive-change`. Remove the six migrated
command-wrapper repository skills and the tracked legacy Codex mirror. Preserve Claude slash
commands. Remove host-specific command examples from `.agents` instructions rather than
adding another mirror.

### Reuse dependency reads by content hash

During one proposal run, keep an in-memory map from every dependency artifact's resolved
path to its content hash and in-context summary. Before a later artifact uses that path,
recompute the hash; reuse the summary when it matches and reread the file before generation
when it differs. Discard the map when the proposal run ends. This retains protection against
user edits without unconditional repetition and applies to every dependency returned by
artifact instructions.

### Keep OpenSpec context specific to planning

Replace duplicated project exposition in `openspec/config.yaml` with pointers to
`AGENTS.md`, `docs/curriculum.md`, and the relevant task authority. Retain only planning
facts needed in every artifact instruction and the existing artifact rules.

### Bound content increments at six generators

Add the six-generator maximum to OpenSpec tasks rules, roadmap sizing, workflow docs, and
selection instructions. An increment names its exact skills and the roadmap checkbox stays
open until all increments ship. Replace the roadmap's stage-level change counts with ordered
unit/increment counts that make every six-or-fewer grouping explicit. Capability
infrastructure remains a separate change.

## Risks / Trade-offs

- **A no-history reviewer lacks an implicit decision** → Put every needed identifier and
  path in the handoff; unresolved cross-domain questions stay with the parent.
- **Removing `.codex` breaks an old host** → Current Codex uses `.agents`; keep Claude's
  own surfaces and document the compatibility boundary.
- **References drift between hosts** → Require byte-equivalent behavior and validate both
  skill directories before committing.
- **Six-skill increments create more commits** → Preserve ordered unit scope and keep the
  roadmap item open, trading bookkeeping for bounded reviews.

## Migration Plan

1. Add references and switch the dispatcher before removing redundant skills.
2. Update normal OpenSpec skills and documentation, then remove duplicate discovery paths.
3. Validate and ship the repository change; archive it with no spec sync.
4. Update the personal `$simplify` skill under explicit filesystem approval, leaving global
   config untouched.

Rollback is one repository revert plus restoring the previous personal `SKILL.md`; no data
or application migration exists.
