# OpenSpec workflow

Work is planned as **OpenSpec changes**. `.agents/skills/` is the canonical Codex surface;
`.claude/skills/` mirrors its behavior and `.claude/commands/opsx/` retains Claude slash
commands. Use `openspec-propose` → `openspec-apply-change` →
`openspec-archive-change`. Task lists are the running record — mark each item done as it
lands, and note decisions inline rather than only in chat.

- `openspec/specs/` is the **baseline**: what the system does today, twenty-five capabilities —
  `curriculum-manifest`, `skill-progression`, `skill-tree-navigation`, `stage-checkpoints`,
  `skill-content-contract`, `problem-generation`, `unit-00-numbers`, `unit-01-addition`,
  `unit-02-subtraction`, `unit-03-multiplication`, `unit-04-division`,
  `unit-05-order-of-operations`, `unit-06-negatives`, `unit-07-fractions-meaning`,
  `unit-08-fraction-operations`,
  `word-problem-phrasing`, `choice-input`, `number-line-input`, `progress-sync`,
  `recovery-key`, `answer-entry`,
  `cosmetic-wardrobe`, `decorated-room`, `math-notation`, `diagram-rendering`. A change
  amending built behaviour writes `## MODIFIED Requirements` against one of these; `## ADDED`
  is for genuinely new surface.
  The count has been wrong before — `ls openspec/specs/` is the authority, not this line.
- `openspec/changes/` holds active work; use `openspec list --json` for current queue state.
  `openspec/changes/archive/YYYY-MM-DD-<name>/` holds shipped changes. Twenty-nine changes
  have shipped; the latest archive is `2026-08-12-add-stage-d-unit-8b`. It completes Unit 8
  with mixed-number conversion and arithmetic, fraction multiplication and division, and
  fixed-frame fraction stories. Unit 9 is next.
- **`openspec archive` refuses a MODIFIED block that drops a scenario, and a *renamed*
  scenario looks exactly like a dropped one.** `add-decoratable-room` hit this: its delta
  rewrote "Each cosmetic states where the learner stands with it" as "Each item …", and the
  archive aborted without changing a file. The fix is to keep the original scenario verbatim
  and add a second one beside it rather than absorbing it — which is the better spec anyway,
  since the two kinds are checked separately. Rename a scenario only by leaving the old one
  in place.
- **`openspec archive` reflows what it writes.** It strips the blank lines around `##` and
  `###` headings, appends a trailing newline, and titles a new capability
  `# <kebab-name> Specification` rather than the title case every other spec uses. Read the
  diff against the baseline after archiving and put the formatting back, or the next change
  inherits a spec that does not match its neighbours.
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
