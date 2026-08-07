# OpenSpec workflow

Work is planned as **OpenSpec changes**. Skills live in `.agents/skills/`,
`.claude/skills/`, and `.codex/skills/` — `/openspec-propose` → `/openspec-apply-change` →
`/openspec-archive-change`. The copies differ only in host command syntax; mirror any edit
across all three. Task lists are the running record — mark each item done as it lands, and
note decisions inline rather than only in chat.

- `openspec/specs/` is the **baseline**: what the system does today, twelve capabilities —
  `curriculum-manifest`, `skill-progression`, `skill-tree-navigation`, `stage-checkpoints`,
  `skill-content-contract`, `problem-generation`, `word-problem-phrasing`, `choice-input`,
  `number-line-input`, `progress-sync`, `recovery-key`, `answer-entry`. A change amending
  built behaviour writes `## MODIFIED Requirements` against one of these; `## ADDED` is for
  genuinely new surface. The count has been wrong before — `ls openspec/specs/` is the
  authority, not this line.
- `openspec/changes/` holds active work; `openspec/changes/archive/YYYY-MM-DD-<name>/`
  holds shipped changes. **The active queue is empty** — sixteen changes have shipped, the
  latest being `number-line-input`, archived 2026-08-07.
- Archive as soon as a change completes, and sync its deltas into the baseline first.
  A completed change left active means the next one has nothing accurate to amend.
- **A delta spec must describe what the change actually built.** `curriculum-foundation`
  proposed quick lessons ending at 5; that was never implemented, so the requirement was
  corrected to the shipped 10 before syncing. Do not archive an aspiration as fact.
- **Sizing**, from the `tasks` rules in `openspec/config.yaml` (one task per generator plus
  its tests, under 2 hours each): a content change is **one unit**, not one stage — a
  50-skill stage would be ~100 tasks. Capability work is its own change, never bundled with
  the content it unblocks. Create changes just-in-time, one or two ahead of the work;
  proposals written months early against unbuilt infrastructure rot.
