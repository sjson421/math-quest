## 1. Baseline and shared rubric

- [x] 1.1 Build the clean selected SHA
  `f6789a931e1f7dd5ad254fb3463475300d7bc048` and record its emitted JavaScript, CSS,
  WOFF2, and Workbox precache inventories in `design.md`.
- [x] 1.2 Add a disposable notation-spike surface and node-rendered fixture check covering
  every expression and spoken label in the design rubric.

## 2. Structured React/CSS arm

- [x] 2.1 Implement the disposable structured notation tree and general CSS primitives
  needed by the shared fixture set, without formula-specific selectors or a TeX parser.
- [x] 2.2 Verify its static markup and singular labels, then use scripted Chromium at 375px
  to query every fixture by its accessible `math` role and name, assert that neither the page
  nor a fixture overflows, inspect the passing screenshot, and record source complexity and
  browser observations.
- [x] 2.3 Build the real PWA with the structured arm reachable and record JavaScript, CSS,
  WOFF2, and precache deltas from baseline.

## 3. KaTeX arm

- [x] 3.1 Install the exact current KaTeX package for the spike and replace the structured
  arm with a direct KaTeX-plus-packaged-CSS implementation of the shared fixtures.
- [x] 3.2 Verify its static markup and fully local assets, then use scripted Chromium at
  375px to query every fixture by its accessible `math` role and name, assert that neither
  the page nor a fixture overflows, inspect the passing screenshot, and record source
  complexity and browser observations.
- [x] 3.3 Build the real PWA with the KaTeX arm reachable and record JavaScript, CSS, every
  emitted WOFF2 font, and precache deltas from baseline.

## 4. Decision and cleanup

- [x] 4.1 Apply the design's pre-registered selection rule and replace the `Spike Results`
  placeholder with exact measurements, rubric results, limitations, and the final renderer
  and capability-name decisions.
- [x] 4.2 Update roadmap increment 17a with the measured decision while leaving item 17
  unchecked and 17b deferred.
- [x] 4.3 Remove all disposable components, fixtures, tests, styles, and dependencies;
  confirm production source, `package.json`, and the lockfile match the selected baseline.

## 5. Verification and handoff

- [x] 5.1 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`.
- [x] 5.2 Start the real app and run the scripted Chromium workflow from
  `docs/environment.md` at 375px with role/name and no-overflow assertions, visually inspect
  the passing screenshot, stop any server started for the check, and confirm its port is
  free.
