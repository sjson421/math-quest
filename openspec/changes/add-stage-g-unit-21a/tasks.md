## 1. Statistics source and verification

- [x] 1.1 Add the closed statistics operation data for ordered value lists, weighted pairs,
  categorical chart selectors, and scatter trends; attach it to the existing story and chart
  displays without changing generic chart fail-closed behavior.
- [x] 1.2 Extend list formatting, learner-text collection, recorded output, unrendered-field
  checks, and source-based difficulty evidence for every statistics arm, with focused synthetic
  tests proving every source survives.
- [x] 1.3 Extend independent verification for mean, median, mode, range, and weighted mean to
  rebuild visible text, exact answers, answer kinds, and required integer constraints without
  importing generator arithmetic, with named invalid-data tests.
- [x] 1.4 Extend independent verification for categorical chart targets and exact-covariance
  scatter directions, including prompt/selector agreement, choice identity, trend-line
  requirements, and preserved missing-operation failure, with focused synthetic tests.

## 2. Unit 21a generators

- [x] 2.1 Implement the `mean` generator with ordered whole-number lists, exact divisible
  averages, growing difficulty, and its reviewed teaching content (under two hours).
- [x] 2.2 Add independent `mean` tests for visible-source recomputation, divisibility, keypad
  reachability, difficulty growth, teaching line, fixed intro, and snapshots (under two hours).
- [x] 2.3 Implement the `median` generator with odd and even unsorted lists, whole medians,
  collision-proof `used-unsorted-middle` and `used-mean-for-median` diagnoses, and reviewed
  teaching content (under two hours).
- [x] 2.4 Add independent `median` tests for sorting, two-middle averaging, both surviving wall
  diagnoses on every sample, keypad reachability, difficulty growth, fixed intro, and snapshots
  (under two hours).
- [x] 2.5 Implement the `mode-range` generator with one unique mode, alternating mode and range
  requests, exact keypad answers, growing difficulty, and reviewed teaching content (under two
  hours).
- [x] 2.6 Add independent `mode-range` tests for unique-mode and range derivation, both requested
  operations, answer and diagnosis distinction, difficulty growth, fixed intro, and snapshots
  (under two hours).
- [x] 2.7 Implement the `weighted-mean` generator with positive value-weight pairs, a whole exact
  target, a distinct whole `ignored-weights` diagnosis reachable through the same keypad,
  growing difficulty, and reviewed teaching content (under two hours).
- [x] 2.8 Add independent `weighted-mean` tests for every visible pair, weighted total and total
  weight, whole ignored-weight distinction and keypad reachability, difficulty growth, fixed
  intro, and snapshots (under two hours).
- [x] 2.9 Implement the `read-bar-line` generator with both categorical chart kinds, one- and
  two-series variants, unambiguous target selectors, exact keypad answers, bounded difficulty,
  and reviewed teaching content (under two hours).
- [x] 2.10 Add independent `read-bar-line` tests for category/series/value agreement, both chart
  kinds and series counts, semantic table data, keypad reachability, difficulty growth, fixed
  intro, and snapshots (under two hours).
- [x] 2.11 Implement the `read-scatterplot` generator with increasing, decreasing, and exactly
  flat integer point sets, one derived trend line, shuffled existing choice input, bounded
  difficulty, and reviewed teaching content (under two hours).
- [x] 2.12 Add independent `read-scatterplot` tests for exact covariance sign, all trend
  directions, visible derived segments, choice order and identity, semantic table data,
  difficulty growth, fixed intro, and snapshots (under two hours).

## 3. Shared Unit 21, registry, and authorities

- [x] 3.1 Add the shared Unit 21 recorded-output and intro static-markup coverage, pin all six
  exact teaching lines, and prove list and chart examples expose no interactive answer surface.
- [x] 3.2 Export the partial Unit 21 module in manifest order, register it after Unit 20, add
  already-available `choice-input` to Stage G's manifest requirements without changing
  capability availability, and update coverage, manifest, prerequisite, course-tree, and count
  assertions and snapshots to pin four Stage G requirements, nineteen implemented Stage G
  skills, three planned Unit 21 skills, and 192 total.
- [x] 3.3 Mark curriculum rows 21.1 through 21.6 complete, update its Stage G and playable/planned
  status prose, update README and roadmap status text to 192, and record 21a as shipped while
  leaving roadmap item 26 and 21b open.

## 4. Verification

- [x] 4.1 Run the focused Unit 21, generator-verification, recorded-output, content-rule,
  ProblemView, SkillIntro, chart, coverage, curriculum-document, and manifest test files; fix
  every in-scope failure.
- [x] 4.2 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`; accept
  only explicitly documented pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to exercise all six Unit 21a intros and representative
  lessons in the real app at 375 by 812 pixels; submit keypad and scatter-choice answers, assert
  semantic chart tables and no overflow, capture one passing screenshot, inspect list wrapping,
  chart axes, labels, marks, trend direction, answer framing, and worked-content spacing, then
  stop any temporary server.
