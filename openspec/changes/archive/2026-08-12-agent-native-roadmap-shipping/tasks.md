## 1. Shared workflow contract

- [x] 1.1 Move the ten-phase dispatcher contract and seven progressive phase references to
      `docs/agent-workflows/ship-roadmap-item/`, preserving every gate and stop condition.
- [x] 1.2 Replace the Codex entry point with a thin native adapter that uses `update_plan`,
      `$simplify`, and fresh medium-reasoning reviewers without a model override.

## 2. Claude and Pi adapters

- [x] 2.1 Replace the Claude entry point with a thin native adapter and add the read-only
      `roadmap-reviewer` agent using inherited model selection and medium effort.
- [x] 2.2 Add the Pi entry point, per-run `mktemp` state directory and `ship-state.json`
      contract, fresh read-only reviewer, clean reviewer-call flags, explicit inline
      fallback behavior, and success/block cleanup lifecycle.
- [x] 2.3 Remove the duplicated Codex and Claude phase-reference directories after all three
      adapters point directly to the shared references.

## 3. Documentation and deterministic validation

- [x] 3.1 Update workflow documentation for the shared contract, three native entry points,
      model portability, Pi's disclosed fallback, and command-derived active queue state.
- [x] 3.2 Add the roadmap-skill validator and `test:skills`, and run it from `npm test`.

## 4. Verification

- [x] 4.1 Run bounded simplification review, apply only verified behavior-preserving fixes,
      and confirm unrelated user-owned work remains untouched and unstaged.
- [x] 4.2 Validate all three skill frontmatters and run fresh read-only Codex, Claude, and Pi
      discovery smokes, including Pi precedence and unavailable-reviewer fallback.
- [x] 4.3 Run OpenSpec strict validity, repository tests, build, lint, and the required
      real-app browser smoke; confirm screenshot review is not applicable.
