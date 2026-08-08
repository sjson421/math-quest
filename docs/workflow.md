# OpenSpec workflow

Work is planned as **OpenSpec changes**. `.agents/skills/` is the canonical Codex surface;
`.claude/skills/` mirrors its behavior and `.claude/commands/opsx/` retains Claude slash
commands. Use `openspec-propose` → `openspec-apply-change` →
`openspec-archive-change`. Task lists are the running record — mark each item done as it
lands, and note decisions inline rather than only in chat.

- `openspec/specs/` is the **baseline**: what the system does today, twelve capabilities —
  `curriculum-manifest`, `skill-progression`, `skill-tree-navigation`, `stage-checkpoints`,
  `skill-content-contract`, `problem-generation`, `word-problem-phrasing`, `choice-input`,
  `number-line-input`, `progress-sync`, `recovery-key`, `answer-entry`. A change amending
  built behaviour writes `## MODIFIED Requirements` against one of these; `## ADDED` is for
  genuinely new surface. The count has been wrong before — `ls openspec/specs/` is the
  authority, not this line.
- `openspec/changes/` holds active work; `openspec/changes/archive/YYYY-MM-DD-<name>/`
  holds shipped changes. **The active queue contains `split-unit-capabilities`** — eighteen
  changes have shipped, the latest being `reduce-roadmap-agent-context`, archived 2026-08-08.
- Archive as soon as a change completes, and sync its deltas into the baseline first.
  A completed change left active means the next one has nothing accurate to amend.
- **A delta spec must describe what the change actually built.** `curriculum-foundation`
  proposed quick lessons ending at 5; that was never implemented, so the requirement was
  corrected to the shipped 10 before syncing. Do not archive an aspiration as fact.
- **Sizing**, from the `tasks` rules in `openspec/config.yaml`: a content change adds at most
  six generators, with explicit generator and independent-test tasks under two hours each.
  Larger units ship as ordered increments and their roadmap item stays unchecked until all
  increments land. Capability work is its own change, never bundled with the content it
  unblocks. Create changes just-in-time, one or two ahead; early proposals rot.
- **Delegation is bounded.** Exploration, proposal audit, and simplification use one
  read-only reviewer by default. Two or three are allowed only for disjoint path domains
  without overlapping files. Reviewers get no conversation history: only repository root,
  baseline SHA, assigned paths, focused questions, and a concise `file:line` format. They run
  on `gpt-5.6-terra` at medium reasoning; the parent verifies every finding.
