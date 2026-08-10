## 1. Shape model and renderer

- [x] 1.1 Add the closed bar/circle/grid shape record, validation, derived accessible naming,
  deterministic grid factorization, and focused pure tests for valid and invalid part counts.
- [x] 1.2 Build the responsive SVG renderer and static component fixtures covering each shape,
  exact partition and shading counts, whole and empty cases, singular accessible ownership,
  and dense prime-count geometry.

## 2. Lesson and verification integration

- [x] 2.1 Add the exhaustive diagram `Display` arm and `ProblemView` branch, preserving the
  existing answer slot and input mode, with first-paint component coverage.
- [x] 2.2 Extend learner-text collection, recorded-output formatting, and independent-answer
  recomputation so diagram data is recorded, named, validated, and verified rather than
  bypassing an existing gate; add synthetic valid-rational, mismatched-answer, and invalid-count
  cases because no production generator can exercise the new branch yet.

## 3. Capability manifest and documentation

- [x] 3.1 Add `diagram` to `AVAILABLE_CAPABILITIES` and update resolver and coverage tests to
  pin all Stage D requirements available, every generator-less Stage D skill planned, and the
  unchanged 61-skill playable set.
- [x] 3.2 Update README and curriculum capability wording, refresh the roadmap capability
  status, and mark item 18 shipped without marking a skill row built or changing the progress
  count.

## 4. Verification

- [x] 4.1 Run strict OpenSpec validation, focused diagram and manifest tests, the full test
  suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 4.2 Temporarily mount 12-part bar, circle, and grid figures plus an 11-part prime grid in
  the real app, run the scripted Chromium workflow from `docs/environment.md` at 375px with
  role/name, exact partition, no-overflow, and 12 CSS-pixel minimum partition-dimension
  assertions, visually inspect the screenshot, remove the fixture and its wiring, rerun the
  build, stop any temporary server, and confirm its port is free.
