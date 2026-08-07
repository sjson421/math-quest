# Environment notes

How to drive the app, reach its state, and what to distrust. [AGENTS.md](../AGENTS.md)
holds the commands; this holds the machinery around them.

## Browser validation: a Playwright script run from the shell

Drive the app with a short Node script, not an interactive browser-control tool: the
script prints a compact pass/fail summary and per-step page state never enters the
conversation, which is why this approach costs a fraction of an interactive tool's
per-step page snapshots. Keep the script and its `playwright-core` dependency in a scratch
directory outside the repo (matching the version that installed the browser) and launch
the shared Chromium at `~/.cache/ms-playwright`. The executable is
`~/.cache/ms-playwright/chromium-<build>/chrome-linux64/chrome` — the `64` is easy to
guess wrong, and the launch failure names a path that looks plausible either way, so
resolve it with `find ~/.cache/ms-playwright -name chrome` rather than assuming. Before
installing anything, check whether a completed Chromium installation is already there and
reuse it; do not run `npx playwright install chromium` when it is. If Chromium is missing,
install it once with `npx playwright install chromium`, adding `--with-deps` only if
system libraries are missing. `playwright-core` downloads no browser of its own and the
scratch directory touches no repo file, so the script can never leak into a commit. On
failure the script writes a screenshot and an accessibility-tree dump to the scratch
directory; read those selectively rather than pulling whole pages into context.

**A passing run still captures one screenshot, and you still look at it.** Assertions
check behaviour; they cannot check that the thing looks right. A control can pass every
query it is given — right number of elements, right names, right measured width and
height, no overflow — while its parts sit misaligned, its labels collide, or its marker
lands off the line it belongs to. That is not a gap in how the assertions were written;
no assertion phrased in element queries reaches it. This app commits to a visual identity,
so shipping a screen nobody has seen is shipping half-checked. Take one shot at 375px at
the end of a green run, read it, and say what it looked like.

A script-driven real Chromium runs `requestAnimationFrame`, so `AnimatePresence
mode="wait"` transitions complete. A hidden in-app preview pane does not — with no
`requestAnimationFrame` the exit animation never finishes and **screens will not swap**.
That is why host preview tools are not the default; reserve them, and any installed
Playwright MCP, for exploratory debugging when the flow is not known well enough to
script, keeping the controlled page displayed while interacting.

The script needs a running server. An open localhost tab is not evidence one is running:
check the route first. If it is unavailable, start `npm run dev` in a long-lived
background shell session, wait for the route to respond, run the script, and stop the
session cleanly afterwards if you started it.

## State and runtime facts

- Progress lives in IndexedDB under `math-quest-progress`. Writing a record there directly
  is the fastest way to test migration or unlock behaviour — delete it afterwards.
- The manifest ships in the bundle (~6 KB gzipped) because state is derived at load.
  Validation is test-time and costs nothing at runtime.
- **Sync has never been verified on real hardware.** The iPhone round trip, airplane-mode
  queue, client-adopts-on-409, and failure visibility rest on `lib/sync.test.ts`,
  `api/progress.test.ts`, and a hand-run against production covering the server half only.
  Treat a sync bug report as plausible rather than surprising; see the note at the end of
  `openspec/changes/archive/2026-07-30-progress-sync/tasks.md`.
