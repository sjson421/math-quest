---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Use the shared contract with Pi-native scratch tracking, skills, and subagents.

## Shared resources

Read [the shared contract](../../../docs/agent-workflows/ship-roadmap-item/core.md)
immediately. Read these directly linked references only when their phase group begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phases 3–4: [propose and audit](../../../docs/agent-workflows/ship-roadmap-item/propose-audit.md)
- Phase 5: [apply](../../../docs/agent-workflows/ship-roadmap-item/apply.md)
- Phase 6: [simplify](../../../docs/agent-workflows/ship-roadmap-item/simplify.md)
- Phase 7: [review](../../../docs/agent-workflows/ship-roadmap-item/review.md)
- Phases 8–10: [finish](../../../docs/agent-workflows/ship-roadmap-item/finish.md)

## Pi state tracker

Before phase 1, create a private run directory with:

```bash
repo_root=$(git rev-parse --show-toplevel)
roadmap_ship_dir=$(mktemp -d '/tmp/math-quest-ship.XXXXXX')
```

Resolve both paths before writing. If `$roadmap_ship_dir` is contained by `$repo_root`,
remove the still-empty run directory and stop; never place tracker state in a checkout.

Write `$roadmap_ship_dir/ship-state.json` and keep exactly one phase `in_progress`:

```json
{
  "currentPhase": 1,
  "phases": [
    { "id": 1, "name": "Select", "status": "in_progress" }
  ],
  "selectedRoadmapText": null,
  "selectedIncrement": null,
  "initial": {
    "branch": null,
    "head": null,
    "status": null,
    "diffPath": null,
    "diffSha256": null
  },
  "userOwnedPaths": [],
  "exploration": { "status": "pending", "summary": null },
  "change": { "name": null, "artifactPaths": [] },
  "review": { "mode": "subagent", "fallbackReasons": [] }
}
```

Populate `phases` with all ten shared phases before continuing. Store the baseline diff in
the same run directory and record its path and SHA-256. Update the state after every gate.
Never write tracker files inside the repository. Remove only `$roadmap_ship_dir` after full
success; when blocked, retain it and report its exact path for resumption.

## Pi skills and review

Load the named OpenSpec skills from Pi's discovered catalog when each phase begins. Pi's
`.pi/skills` entry takes precedence for this skill; nested OpenSpec skills continue to come
from `.agents/skills`.

For every independent review, call the `subagent` tool with exactly these controls and no
model field:

```text
agent: "roadmap-reviewer"
context: "fresh"
async: false
artifacts: false
mission: false
```

Pass only the task fields allowed by the shared contract. In phase 6, use this reviewer for
reuse, quality, and efficiency findings; the parent verifies and applies accepted cleanup.

If the `subagent` tool is absent, or launch fails because the extension, provider, or
authentication is unavailable, set `review.mode` to `inline-fallback`, append the exact
reason, perform the same review inline, and disclose degraded assurance in the final report.
Do not use fallback for substantive findings, task failures, or unresolved decisions; those
remain governed by the shared stop conditions.
