## 1. Ratio display contract

- [x] 1.1 Add typed ratio/proportion semantic branches to story and math displays, with
  exhaustive visible-output reconstruction, answer recomputation, difficulty-source
  extraction, and recorded-output formatting (under two hours).
- [x] 1.2 Add focused synthetic tests proving ratio prose/notation/data disagreement and
  wrong answers are rejected while existing arithmetic, percent, and fraction branches
  remain unchanged (under two hours).

## 2. Writing ratios

- [x] 2.1 Implement `write-ratios` with directed category comparisons, required fraction
  form, a reversed-order diagnosis, concise guidance, and constructive difficulty bands
  (under two hours).
- [x] 2.2 Add independent `write-ratios` tests for exact order, required form, diagnosis,
  bounds, variety, and difficulty growth (under two hours).

## 3. Simplifying ratios

- [x] 3.1 Implement `simplify-ratios` from coprime base terms and a common factor, requiring
  lowest-terms fraction form with divide-one-term diagnoses and concise guidance (under two
  hours).
- [x] 3.2 Add independent `simplify-ratios` tests for exact reduction, wrong-form handling,
  both diagnosis values, bounds, variety, and difficulty growth (under two hours).

## 4. Unit rate

- [x] 4.1 Implement `unit-rate` as a choice between two constructively exact offers with one
  unique lower per-item price and concise worked comparison (under two hours).
- [x] 4.2 Add independent `unit-rate` tests for exact unit-price comparison, unique choice,
  offer-order coverage, bounds, variety, and difficulty growth (under two hours).

## 5. Solving proportions

- [x] 5.1 Implement `solve-proportions` from a reduced base ratio and integer scale factor,
  covering missing numerators and denominators with cross-multiplication guidance (under two
  hours).
- [x] 5.2 Add independent `solve-proportions` tests for notation/data agreement, exact
  equality, both missing positions, bounds, variety, and difficulty growth (under two
  hours).

## 6. Scale drawings

- [x] 6.1 Implement `scale-drawings` on the story surface with explicit scale statements,
  both conversion directions, whole-number answers, opposite-direction diagnosis, and
  concise guidance (under two hours).
- [x] 6.2 Add independent `scale-drawings` tests for exact scale application, both
  directions, diagnosis, bounds, variety, and difficulty growth (under two hours).

## 7. Unit conversion

- [x] 7.1 Implement `unit-conversion` from the fixed customary/metric table, stating every
  relationship and constructing exact whole-number problems in both directions with
  opposite-direction diagnosis (under two hours).
- [x] 7.2 Add independent `unit-conversion` tests for the complete conversion set,
  within-system scope, both directions, exact answers, diagnosis, bounds, variety, and
  difficulty growth (under two hours).

## 8. Registry, authorities, and recorded output

- [x] 8.1 Register the six Unit 11a generators in manifest order, add per-skill recorded
  snapshots, and update coverage for the six implemented skills, unlock order, and
  110-skill playable total.
- [x] 8.2 Correct the stale Stage D manifest comment to name Unit 7's actual diagram
  consumers while retaining the existing capability requirement and graph.
- [x] 8.3 Mark curriculum rows 11.1–11.6 playable, update README and roadmap status text,
  and leave roadmap item 19 unchecked for `ratio-words` in increment 11b.

## 9. Verification

- [x] 9.1 Run strict OpenSpec validation, focused Unit 11/coverage/content tests, the full
  test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 9.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  problems from all six skills, exercise a diagnosed typed answer and the best-value choice,
  capture and inspect a screenshot, stop temporary services, and confirm their ports are
  free.
