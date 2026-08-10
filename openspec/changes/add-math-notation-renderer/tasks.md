## 1. Structured notation surface

- [x] 1.1 Add the recursive five-primitive notation type, required labelled math `Display`
  arm, single accessible renderer owner, and general phone-sized CSS primitives.
- [x] 1.2 Add static renderer fixtures for fractions, mixed rows, positive and negative
  superscripts, radicals, the nested quadratic formula, geometry formulas, and singular
  accessible names.

## 2. Lesson integration and gates

- [x] 2.1 Add the exhaustive `ProblemView` math branch and route complete and partial fraction
  entries through the notation owner without changing their submitted strings.
- [x] 2.2 Add component and pure-entry coverage for math layout, stacked fraction echoes,
  derived accessible labels, ordinary entries, incomplete entries, and the enclosing
  `ColumnView` label that owns a visually nested fraction answer.
- [x] 2.3 Extend learner-text collection, recorded-output formatting, and independent-answer
  verification so a math display is handled explicitly and cannot bypass existing gates.

## 3. Capability manifest

- [x] 3.1 Rename `katex` to `math-notation` across the capability union and Stages D–G, then
  add `math-notation` and `fraction-input` to `AVAILABLE_CAPABILITIES`.
- [x] 3.2 Update manifest, resolver, and coverage tests to pin the renamed requirements, both
  available flags, Stage D's remaining `diagram` block, and the unchanged 61-skill playable
  set.

## 4. Documentation

- [x] 4.1 Update README and curriculum capability wording, refresh the roadmap's capability
  status, and mark item 17 shipped without changing any curriculum built marker or skill
  count.

## 5. Verification

- [x] 5.1 Run strict OpenSpec validation, focused notation and manifest tests, the full test
  suite, production build, and lint; retain only the documented pre-existing lint warnings.
- [x] 5.2 Temporarily mount the ten representative notation fixtures in the real app, run the
  scripted Chromium workflow from `docs/environment.md` at 375px with role/name and
  no-overflow assertions, visually inspect the screenshot, remove the fixture and its entry
  wiring, rerun the build, stop the temporary server, and confirm its port is free.
