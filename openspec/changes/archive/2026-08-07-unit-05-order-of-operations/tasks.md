## 1. Widen independent verification

- [x] 1.1 Replace the two-operand inline regex in `src/curriculum/generators.test.ts` with an
      independently written tokenizer and precedence evaluator over integers, `+ − × ÷` and
      parentheses. It must throw and name the skill on an unbalanced or unreadable display.
      Written from scratch — it shares no code with the unit file, for the same reason
      `factorsOf` is written twice.
- [x] 1.2 Add synthetic cases to the `recompute` describe block proving the evaluator earns its
      keep: precedence applied over written order, a parenthesised group evaluated first, equal
      precedence run left to right, an answer computed left-to-right caught, and an unparseable
      display named rather than passed.
- [x] 1.3 Run the full suite and confirm every existing skill still verifies through the new
      branch with no recorded output changed.

## 2. Expression model, local to the unit

- [x] 2.1 Create `src/curriculum/unit-05-order-of-operations.ts` with the expression node type,
      its builder, `render()` — parenthesising a child only where it binds less tightly than
      its parent, or equally and on the right — and `evaluate()` under precedence.
- [x] 2.2 Add the wrong-rule evaluations the misconceptions read: fold in written order,
      evaluate as though parentheses were absent, and apply an equal-precedence pair in PEMDAS
      letter order. Each derives from the same tree the display renders, so a prediction cannot
      drift from the arithmetic it diagnoses.

## 3. Generators

Each generator takes its `name` and `blurb` **verbatim from the manifest entry** —
`coverage.test.ts` pins the pair equal and rejects a blurb over 32 characters. They are
`two-operations` / 'Two Operations' / '3 + 4 × 2', `with-parentheses` / 'Parentheses First' /
'Brackets change the order', and `pemdas` / 'Full Order of Operations' /
'PEMDAS, without exponents yet'.

Each carries a five-band difficulty ladder whose answers measurably grow, which
`generators.test.ts` checks as a mean over 200 samples per difficulty. `pemdas` draws two
families with different magnitudes, so its ladder has to grow in both or the mean can sit flat.

- [x] 3.1 `two-operations` (5.1, wall) — the four shapes and bounds in design.md, with the
      higher-precedence operation second on roughly two problems in three. Predicts
      `left-to-right` or `right-to-left` and `first-step-only`.
- [x] 3.2 `with-parentheses` (5.2) — a `+`/`−` group under a `×` on either side. Predicts
      `ignored-parentheses` and `bracket-only`.
- [x] 3.3 `pemdas` (5.3) — family P (`d + c × (a − b)`) and family T (`a ÷ b × c`,
      `a − b + c`), composing the division from a quotient so it comes out exactly. Predicts
      `ignored-parentheses` and `left-to-right` on P, `pemdas-letter-order` and
      `first-step-only` on T.
- [x] 3.4 Register the unit in `src/curriculum/index.ts` — one import, one spread — and confirm
      all three skills resolve as `implemented` with `AVAILABLE_CAPABILITIES` and Stage B's
      `requires` untouched.

## 4. Tests for the unit

- [x] 4.1 Create `src/curriculum/unit-05-order-of-operations.test.ts` with the recorded-output
      snapshot for all three skills and the `unrenderedKeys` gate.
- [x] 4.2 Assert what the unit guarantees about every problem it makes: answer, every
      intermediate the solution names, and every predicted value is a non-negative integer;
      every problem is `inputMode: 'keypad'` with no `keypad` rules; no expression contains an
      exponent.
- [x] 4.3 Assert that every displayed expression's parentheses change its value — evaluating
      without them differs from the answer — and that no expression displays a group precedence
      would have taken first anyway.
- [x] 4.4 Assert the wall directly against the draw: every `two-operations` problem keeps
      exactly two distinct tags after filtering, and both shapes of the ordering error occur
      across a sample.
- [x] 4.5 Assert `pemdas` divides exactly on every family-T division, and that the letter-myth
      value differs from both the answer and the left-to-right value.
- [x] 4.6 Add unit tests for `render()` and `evaluate()` directly, including the cases where
      parentheses are and are not printed.

## 5. What completing Stage B moves elsewhere

Unit 5 is the last of Stage B's 44 skills, so this is the change that makes the stage complete
rather than partly built. Several assertions elsewhere count what is playable, and one of them
rests on Stage B being unfinished.

- [x] 5.1 `src/lib/checkpoint.test.ts` — "does not mistake the playable end of Stage B for its
      boundary" masters every *implemented* Stage B skill and asserts no checkpoint fires. Once
      all 44 are implemented that premise is gone and the checkpoint correctly fires. Keep the
      property under test rather than deleting the case: re-point it at a stage that is still
      partly built, or assert it against a synthetic stage the way `resolve.test.ts` already
      tests derivation rules. Do not weaken it into a case that cannot fail.
- [x] 5.2 `src/curriculum/coverage.test.ts` — `documentedAsBuilt` length and `offered` length
      move from 49 to 52; the "other 152 skills" title becomes 149; "the five built units"
      becomes six and its list gains `unit-5`. Re-record the unlock-graph snapshot and read the
      diff: it is the review surface for a re-lock, so three added entries and nothing else is
      what it must show.
- [x] 5.3 `src/lib/course.test.ts` — the last built unit is now `unit-5`, so the fallback case
      pinning `unit-4` moves with it.

## 6. Presentation

- [x] 6.1 Re-derive the inline size ladder in `src/components/ProblemView.tsx` against a
      measured 375px row — expression plus equals sign plus an answer slot holding the widest
      answer the skill produces. Phase 7 found the first attempt here was wrong: it compared
      character counts to each other rather than measuring the row, and `9 − 3 × 2` wrapped in
      a real browser. Four shipped displays move down a size because they were overflowing.
- [x] 6.2 Pin each measured length to its measured size in
      `src/components/ProblemView.test.tsx`, and add the measurement itself to
      `coverage.test.ts` so a later unit widening a display fails there, not on a phone.

## 7. Documents

- [x] 7.1 Mark 5.1, 5.2 and 5.3 built in `docs/curriculum.md`, which the manifest cross-check
      enforces.
- [x] 7.2 Tick roadmap item 12 in `docs/roadmap.md`, restate its progress line as 52 of 201,
      note that Stage B is closed, and write the item's "what this left behind" note in the
      voice of items 10 and 11.
- [x] 7.3 Update the active-change note in `AGENTS.md` to name this change until it archives.

## 8. Verify

- [x] 8.1 Run `npm test`, `npm run build`, and `npm run lint` and inspect all three. The three
      documented `Settings.tsx` lint warnings may remain; nothing else may.
- [x] 8.2 Drive the real app in a browser: open a Unit 5 lesson, answer a `two-operations`
      problem with the left-to-right value and confirm the nudge names that mistake, then
      answer correctly. Check a `pemdas` expression at 375px width for overflow.
