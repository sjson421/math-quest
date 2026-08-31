## 1. Probability source and verification

- [x] 1.1 Add the closed probability operation data to the statistics union — a single event's
  favourable and total counts, a compound pair's two events with the cue combining them, and an
  ordered list of independent stage counts — and attach it to the existing story display without
  changing any existing arm's behaviour.
- [x] 1.2 Extend learner-text collection, recorded output including the required fraction form,
  unrendered-field checks, and source-based difficulty evidence for every probability arm, with
  focused synthetic tests proving each carried count survives to every gate.
- [x] 1.3 Add the independent verification branch for single-event and compound probability:
  rebuild the visible counts and prompt, derive the exact fraction by multiplying for `and` and
  adding for `or`, assert the declared fraction form and keypad, and reject a favourable count
  outside its total, a probability reaching 0 or 1, a cue disagreeing with the visible wording,
  and a stated answer disagreeing with the derivation — with named invalid-data tests.
- [x] 1.4 Add the independent verification branch for counting outcomes: derive the product of
  every carried stage count, keep the existing whole-number answer assertion, reject a missing or
  non-positive stage count, and preserve the existing missing-operation failure — with named
  invalid-data tests.

## 2. Unit 21b generators

- [x] 2.1 Implement the `basic-probability` generator with equally likely outcome sets, a
  favourable count strictly inside its total, an exact fraction answer required through the
  fraction keypad, the collision-proof favourable-over-remaining diagnosis, growing difficulty,
  and its reviewed teaching content (under two hours).
- [x] 2.2 Add independent `basic-probability` tests for visible-count recomputation, the strict
  0-to-1 bound, fraction-form rejection of a decimal entry, acceptance of an unreduced entry,
  the surviving diagnosis, a declared keypad allowing fraction entry and no decimal entry,
  difficulty growth, teaching line, fixed intro, and snapshots (under two hours).
- [x] 2.3 Implement the `compound-probability` generator with both cues occurring across samples,
  independent events for `and` and mutually exclusive events over one outcome set for `or`, an
  exact fraction answer strictly between 0 and 1, and reviewed teaching content; reject any draw
  where the answer, the other-operation diagnosis, and the added-numerators-and-denominators
  diagnosis are not three distinct values (under two hours).
- [x] 2.4 Add independent `compound-probability` tests for both cues, multiply-and-add derivation,
  both wall diagnoses surviving central filtering on every sample, the strict 0-to-1 bound
  including the `or` sum, fraction-form checks, every prediction reachable on a keypad that
  allows fraction entry and no decimal entry, difficulty growth, fixed intro, and snapshots
  (under two hours).
- [x] 2.5 Implement the `counting-outcomes` generator with two or more independent stages, an
  exact whole-number product through the existing keypad with no fraction form, the
  added-stage-counts diagnosis distinct from the product on every draw, growing stage count and
  size, and reviewed teaching content (under two hours).
- [x] 2.6 Add independent `counting-outcomes` tests for product derivation from every visible
  stage count, whole-number answer form, the surviving diagnosis, keypad reachability, difficulty
  growth, teaching line, fixed intro, and snapshots (under two hours).

## 3. Shared Unit 21, registry, and authorities

- [x] 3.1 Extend the shared Unit 21 recorded-output and intro static-markup coverage to the three
  new skills, pin their exact teaching lines, prove a probability intro shows its correct answer
  as a fraction, and prove each example exposes no interactive answer surface.
- [x] 3.2 Register the three generators after `read-scatterplot` in manifest order, add the
  already-available `fraction-input` to Stage G's manifest requirements without changing
  capability availability, and update coverage, manifest, prerequisite, course-tree, and count
  assertions and snapshots to pin five Stage G requirements, twenty-two implemented Stage G
  skills, six remaining planned Stage H skills, and 195 total.
- [x] 3.3 Mark curriculum rows 21.7 through 21.9 complete, update its Stage G and
  playable/planned status prose, update README and roadmap status text to 195, record 21b as
  shipped, and check roadmap item 26 now that all five of its increments have landed.

## 4. Verification

- [x] 4.1 Run the focused Unit 21, generator-verification, recorded-output, content-rule, answer,
  submit, ProblemView, SkillIntro, coverage, curriculum-document, and manifest test files; fix
  every in-scope failure.
- [x] 4.2 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`; accept
  only explicitly documented pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to exercise all three Unit 21b intros and representative
  lessons in the real app at 375 by 812 pixels; submit a correct fraction and an unreduced
  fraction to confirm both are accepted, and confirm the pad offers the slash and no decimal
  point, so the decimal form miss is provable in tests rather than here; assert no overflow,
  capture one passing screenshot, inspect story wrapping, the fraction slash on the pad, answer
  framing, and worked-content spacing, then stop any temporary server.
