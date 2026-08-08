## 1. Specify the ownership split

- [x] 1.1 Verify all 18 unit-owned requirements are removed once from `problem-generation`
  and added once, with byte-identical normative blocks, to the seven named unit capabilities.
- [x] 1.2 Verify the retained and moved inventory contains all 27 original requirement names
  and 87 scenarios exactly once, with unchanged complete-block hashes.
- [x] 1.3 Update only the active-queue bookkeeping in `docs/workflow.md`; leave the baseline
  inventory at 12 capabilities until archive sync creates the seven new files.
- [x] 1.4 Verify the archive runbook requires sync before the inventory update, then checks
  19 capabilities, the unique 27-requirement/87-scenario unchanged-hash inventory, strict
  baseline validation, and a separate archive commit and push.

## 2. Validate the spec-only change

- [x] 2.1 Run strict OpenSpec change validation and confirm no archived historical change or
  runtime/application file is modified.
- [x] 2.2 Run `npm test`, `npm run build`, and `npm run lint`; only the documented Settings
  warnings may remain.
- [x] 2.3 Drive the real app in a compact browser smoke check following `docs/environment.md`,
  inspect the passing 375px Home screenshot, stop the server, and clear scratch artifacts.
