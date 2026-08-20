# Phase 7: Review and verify

Review the complete diff from the phase 1 baseline. Trace every delta requirement and task
to implementation and tests. Check correctness, edge cases, failures, scope,
maintainability, and invariants. Fix verified defects and repeat affected review. A design
defect sets the handoff to `needs-preparation` and stops this session; a new
`prepare-roadmap` session owns the return through phases 2 and 4.

Launch the required independent read-only diff reviewer under the shared handoff contract.
Verify every returned claim locally. Fix confirmed defects and repeat the affected review,
including a fresh independent pass after the fix.

Run and inspect, in order:

```bash
npm test
npm run build
npm run lint
```

Run targeted tests as needed. Only the three documented `Settings.tsx` warnings may remain.
After any review fix, rerun all three gates.

For a user-visible change, drive the real app with a shell-run Playwright script following
`docs/environment.md`. Reuse installed Chromium; use its conditional setup only if absent.
Keep scripts and dependencies in scratch space outside the repo and print compact results.
Do not ask the user to run the app or browser.

On a passing run, capture and inspect at least one 375px screenshot. Shoot each changed
visual state and any existing screen touched. Check internal representation consistency,
alignment/spacing/collisions/truncation, and consistency with the app's cute adult visual
identity. Fix confirmed bugs, rerun gates, and reshoot; report design choices instead of
guessing. The final report names screens and concrete observations, not merely screenshots.

Finally rerun strict OpenSpec validation, confirm all tasks remain checked, and ensure the
verified diff has no unexplained or unrelated changes.
