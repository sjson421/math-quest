## 1. Pure score model

- [x] 1.1 Add one `src/lib/` owner for validated earned and possible practice points, the
  readonly 0%/100, 43%/150, 78%/170, and 100%/200 anchor table, the current four score-band
  table, piecewise-linear interpolation, one final whole-score rounding step, and closed band
  classification. Reject unsafe, fractional, negative, zero-total, and over-total inputs with a
  named score-estimation error.
- [x] 1.2 Add focused pure tests for every exact anchor, equivalent ratios with different point
  totals, interpolation and half-point rounding, the 100 and 200 endpoints, monotonic estimates
  across a representative full point range, every 144/145/164/165/174/175 band edge, and every
  invalid input class.

## 2. Honest result card

- [x] 2.1 Add one reusable `src/components/` estimate card that accepts earned and possible
  points and derives its own result. Render the raw practice points, `Estimated GED Math score`,
  `About <score>`, estimated band, and an always-visible caveat naming scored points,
  form-specific equating, and the official score report. Add an expandable `How this estimate
  works` section whose semantic table derives from the calculation anchors and whose local
  explanation names and links the official Technical Manual and current score guidance. Keep the
  card stateless, action-free, text-complete offline, and independent of lesson, clock, progress,
  sync, and manifest code.
- [x] 2.2 Add static server-rendered component tests for one anchor and one interpolated result,
  independently recomputing the expected score and band from the visible earned and possible
  points rather than importing a result from the estimator. Cover all four estimated band labels,
  raw-point evidence, caveat wording that names form-specific equating, scored points, and the
  official score report, absence of learner-pass or credential-award claims, one labelled result
  section, one semantic mapping table with exact headers and four ordered rows, interpolation
  text, and both official source links. Prove rendering leaves progress-store state and version
  unchanged and makes no runtime network request.

## 3. Pre-documentation proof

- [x] 3.1 Run the focused score-model and result-card tests plus `npm run build` before claiming
  the capability is built. Fix every in-scope failure without adding permanent App navigation or
  widening the eight-problem skip-check session.

## 4. Real-app browser validation

- [x] 4.1 Follow `docs/environment.md` with a temporary real-App fixture and the existing shared
  Chromium at 375 by 812 pixels. Render the longest College Ready + Credit result, prove the raw
  points, approximate score, estimated band, and caveat appear before opening details; open the
  mapping and prove its four rows, interpolation note, source names, and links remain complete
  after the page goes offline; check labelled-region and table semantics, horizontal page and
  component overflow, reachable unclipped content, and readable table cells. Capture and inspect
  one passing screenshot, remove the fixture and wiring exactly, rerun the focused tests and
  production build, stop any temporary server, and confirm its port is free.

## 5. Capability status

- [x] 5.1 Update `README.md` to say timer and score-estimation infrastructure are built while all
  Stage H content remains planned. Update both Stage H remaining-work notes in
  `docs/curriculum.md`, add the score estimator to its Stage H capability inventory with its
  approximate and non-official boundary, and preserve every curriculum skill table and id.
- [x] 5.2 Mark roadmap item 29 and increment 29b shipped while leaving item 30 open. Run the
  curriculum-document and course coverage tests to prove all six Stage H skills remain planned,
  Stage H stays absent from navigation, and exactly 195 of 201 skills remain playable.

## 6. Repository gates

- [x] 6.1 Run `npx openspec validate add-score-estimator --strict`, the focused score and
  curriculum tests, `npm test`, `npm run build`, `npm run lint`, and `git diff --check`. Accept
  only explicitly documented pre-existing warnings and fix every in-scope failure.
