## Context

See `proposal.md` for motivation. The repository currently tracks complete
`ship-roadmap-item` copies under `.agents/skills` and `.claude/skills`; Pi discovers the
Codex copy through `.agents`. Their shared phase references are byte-identical today, but
the dispatchers already differ in their model instructions. Codex, Claude, and Pi expose
different planning, skill-invocation, delegation, and progress mechanisms.

The worktree also contains user-owned portability edits to the Codex dispatcher and
`docs/workflow.md`, an unrelated audit-skill edit, and pre-existing `.pi-subagents/`
artifacts. The implementation must absorb the overlapping portability intent without
staging or rewriting unrelated work.

## Goals / Non-Goals

**Goals:**

- Keep one authoritative ten-phase workflow with progressive phase loading.
- Give every harness a small adapter that uses its native plan and review mechanisms.
- Make skill drift detectable by the normal test gate.
- Keep Pi review output and progress state outside the repository.

**Non-Goals:**

- Make the three adapters textually identical.
- Duplicate nested OpenSpec skills for Pi.
- Introduce a cross-harness extension or global configuration dependency.

## Decisions

### Put shared workflow material under documentation

Move the common dispatcher contract and seven phase references to
`docs/agent-workflows/ship-roadmap-item/`. Each adapter links directly to the core and to
every phase reference, preserving one-level discoverability from `SKILL.md`.

Keeping canonical behavior inside the Codex skill was rejected because Claude and Pi would
remain dependent on a provider-owned surface. Three complete copies were rejected because
the current model-pin drift demonstrates that behavioral-mirror prose is insufficient.

### Keep adapters native and narrowly scoped

The Codex adapter owns `update_plan`, `$simplify`, and `spawn_agent` arguments. The Claude
adapter owns task tools and a project `roadmap-reviewer` agent with inherited model and
medium effort. The Pi adapter creates a per-run directory with
`mktemp -d '/tmp/math-quest-ship.XXXXXX'`, verifies the resolved path is outside the
repository, owns only that directory, and stores its `ship-state.json` state machine there.
It removes that exact directory after success and retains and reports it when blocked. Its
reviewer definition uses fresh context and medium thinking.

The shared core states outcomes such as fresh, read-only review without naming a harness
tool or provider model. No adapter pins a concrete model.

### Treat Pi fallback as explicit degraded assurance

Pi first attempts its project reviewer with fresh context, foreground execution, and
artifact and mission recording disabled. An absent tool or infrastructure/authentication
launch failure switches the run to `inline-fallback`; the parent performs the same checks
and reports the fallback. A substantive finding or unresolved product issue never falls
back and remains governed by the normal stop conditions.

### Enforce topology and native contracts in `npm test`

Add a deterministic Node validator with no new dependency. It checks shared-resource
links, phase gates, frontmatter parity, adapter-specific mechanisms, reviewer definitions,
absence of concrete model pins, and removal of the duplicated reference directories.
Expose it as `test:skills` and run it before Vitest in `npm test`.

### Keep durable workflow documentation truthful

Replace the volatile claim that the active OpenSpec queue is empty with the authoritative
`openspec list --json` command while retaining the latest archived-change bookkeeping. End
verification with the repository-required real-app browser smoke; visual-state screenshots
remain inapplicable because no application surface changes.

## Risks / Trade-offs

- **A shared path makes a skill less portable outside this repository** → These are
  repository-specific shipping skills; validate every linked path and test in fresh local
  harness sessions.
- **Pi inline fallback is not independent review** → Record the exact reason and review
  mode in state and the final report; never present it as independent review.
- **Harness syntax changes over time** → Keep syntax in thin adapters and make the
  deterministic validator fail on accidental removal of required controls.
- **Moving tracked files can obscure user edits** → Compare from the recorded baseline,
  preserve the current no-model-pin behavior in the shared core, and stage explicit paths
  only.

## Migration Plan

1. Add the shared core and references, then switch all three adapters to them.
2. Add reviewer definitions and deterministic validation before deleting old references.
3. Validate in all three installed harnesses, run repository gates, and complete the
   real-app browser smoke.
4. Archive the tooling-only change. Existing sessions reload or restart to discover the
   new entry points; no application or data migration is required.
