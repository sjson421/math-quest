## 1. Canonical skills and progressive loading

- [x] 1.1 Replace the roadmap shipping monolith with a sub-1,000-word ten-phase dispatcher
  and seven one-level phase references, mirrored with equivalent behavior for Claude.
- [x] 1.2 Point the dispatcher at the normal OpenSpec skills, remove all six migrated
  command-wrapper skills and the tracked legacy Codex mirror, and preserve Claude slash
  commands.
- [x] 1.3 Make `.agents` OpenSpec invocation wording host-neutral, mirror behavioral OpenSpec
  edits in the retained `.claude/skills`, and add run-local path/hash/summary reuse for all
  proposal dependencies.

## 2. Bounded delegation and sizing

- [x] 2.1 Add the no-history, path-based Terra/medium delegation contract to roadmap
  exploration and simplification, defaulting to one reviewer and allowing at most three
  only for disjoint path domains.
- [x] 2.2 Apply the same bounded contract to proposal audit while preserving parent-side
  verification of every finding.
- [x] 2.3 Compact `openspec/config.yaml` to planning-specific context and add the six-generator
  maximum to its task rules.
- [x] 2.4 Update workflow and roadmap documentation for canonical skill locations, bounded
  delegation, exact ordered six-generator-or-smaller groupings, and unchanged roadmap
  checkbox semantics.

## 3. Verification

- [x] 3.1 Validate both shipping skill directories; assert the dispatcher word limit,
  one-level just-in-time references, normal-skill names, behavioral mirror equivalence,
  bounded handoffs, unchanged ten phase gates, stop conditions, browser/visual review,
  cleanup, explicit staging/push, archive, and final-report obligations; validate proposal
  hash reuse for both unchanged and edited dependencies; and confirm no removed skill or
  legacy discovery-surface reference remains.
- [x] 3.2 Run strict OpenSpec change validation, `npm test`, `npm run build`, and `npm run lint`.
- [x] 3.3 Start the real app and run a compact browser smoke check proving the Home screen still
  loads, then stop the server and confirm the port is free.
