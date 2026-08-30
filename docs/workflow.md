# OpenSpec workflow

OpenSpec is for work that benefits from an explicit contract and task record: roadmap items,
new capabilities, cross-cutting behavior, migrations, and changes whose scope needs design
decisions before implementation. Small bug fixes, narrow behavior changes, documentation,
tests, and repository maintenance can be handled directly with proportionate verification.
Do not create a plan or OpenSpec artifacts when they add more ceremony than clarity.
If a direct change alters an existing requirement, update its baseline spec with the code.

Repository-wide agent workflows live under `docs/agent-workflows/`; `.agents/skills/`,
`.claude/skills/`, and `.pi/skills/` provide Codex-, Claude-, and Pi-native entry points.
`.claude/commands/opsx/` retains Claude slash commands. When OpenSpec is warranted, use
`openspec-propose` → `openspec-apply-change` → `openspec-archive-change`. Task lists are
the running record — mark each item done as it lands, and note decisions inline rather than
only in chat.

The roadmap-to-main workflow runs across four separate skill sessions:
`prepare-roadmap` selects, explores, and proposes; `audit-roadmap` audits the proposal in
fresh context; `implement-roadmap` applies the audited change; and `review-roadmap`
simplifies, verifies, ships, and archives it. Ignored state under `.agent-state/roadmap/`
carries the exact baseline and gate status between sessions.

- `openspec/specs/` is the **baseline**: what the system does today, forty-five
  capabilities —
  `curriculum-manifest`, `skill-progression`, `skill-tree-navigation`, `stage-checkpoints`,
  `skill-content-contract`, `problem-generation`, `unit-00-numbers`, `unit-01-addition`,
  `unit-02-subtraction`, `unit-03-multiplication`, `unit-04-division`,
  `unit-05-order-of-operations`, `unit-06-negatives`, `unit-07-fractions-meaning`,
  `unit-08-fraction-operations`, `unit-09-decimals`, `unit-10-percents`,
  `unit-11-ratios-proportions`, `unit-12-exponents-roots`, `unit-13-expressions`,
  `unit-14-linear-equations`, `unit-15-inequalities`, `unit-16-coordinate-plane-lines`,
  `unit-17-systems-equations`, `unit-18-polynomials-quadratics`, `unit-19-functions`,
  `unit-20-geometry-measurement`,
  `word-problem-phrasing`, `choice-input`, `number-line-input`, `progress-sync`,
  `recovery-key`, `answer-entry`, `root-pair-input`, `cosmetic-wardrobe`, `decorated-room`,
  `math-notation`, `diagram-rendering`, `expression-input`, `coordinate-plane-display`,
  `coordinate-plane-input`, `streak-progression`. A change amending built behaviour writes `## MODIFIED
  Requirements` against one of these; `## ADDED` is for genuinely new surface.
  The count has been wrong before — `ls openspec/specs/` is the authority, not this line.
- `openspec/changes/` holds active work; use `openspec list --json` for current queue state.
  `openspec/changes/archive/YYYY-MM-DD-<name>/` holds shipped changes. Sixty-two changes have
  shipped — `ls openspec/changes/archive/` is the authority, and this line has run one behind
  before; the latest archive is `2026-08-30-stage-g-unit-20a`. It ships roadmap increment
  20a's first six Stage G geometry skills; later Stage G content remains planned.
- **`openspec archive` refuses a MODIFIED block that drops a scenario, and a *renamed*
  scenario looks exactly like a dropped one.** `add-decoratable-room` hit this: its delta
  rewrote "Each cosmetic states where the learner stands with it" as "Each item …", and the
  archive aborted without changing a file. The fix is to keep the original scenario verbatim
  and add a second one beside it rather than absorbing it — which is the better spec anyway,
  since the two kinds are checked separately. Rename a scenario only by leaving the old one
  in place. When the existing scenario has become *false* rather than merely reworded — Unit
  13's "Increment 13a leaves Unit 13 incomplete" asserted that 13b's two skills stay planned
  — keeping it verbatim would archive a lie, so retire the whole requirement under
  `## REMOVED Requirements` with its Reason and Migration and add its successor beside it.
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
  increments land. Do not split a compliant ordered increment to reduce agent context; use
  the workflow's session boundaries for that. Split further only when each part can ship
  independently without coordinating one shared model, renderer, or design. Capability work
  is its own change, never bundled with the content it unblocks. Create changes just-in-time,
  one or two ahead; early proposals rot.
- **Delegation is bounded.** Proposal audit always uses one fresh read-only reviewer over
  the complete artifact set. Exploration and simplification use one reviewer by default and
  may use two or three only for disjoint path domains without overlapping files. Reviewers
  get no conversation history: only repository root, baseline SHA, assigned paths, focused
  questions, and a concise `file:line` format. Each harness adapter owns model routing; the
  parent verifies every finding. Pi may fall back to inline review for exploration or
  simplification only when its subagent tool or launch infrastructure is unavailable; audit
  remains `ready-to-audit` until its independent reviewer can run.
