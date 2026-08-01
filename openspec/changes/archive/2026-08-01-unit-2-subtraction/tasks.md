## 1. Move Unit 2 into its own module, changing nothing

Do this first and on its own. Every later task widens a helper that these two skills already
use, so a value change must not be able to hide inside a file rename.

- [x] 1.1 Rename `src/curriculum/unit-01-add-sub.ts` → `unit-01-addition.ts` and its test and
      snapshot to match. Rename `unit01` to `Addition`. No generator body changes.
- [x] 1.2 Create `src/curriculum/unit-02-subtraction.ts` exporting `unit02: Unit` (`unit-02`,
      "Subtraction", `mint`), moving `subFacts` and `sub2Borrow` across verbatim. Register
      `unit02` in `src/curriculum/index.ts`.
- [x] 1.3 Create `src/curriculum/unit-02-subtraction.test.ts`, the recorded-output gate over
      `unit02.skills`, following `unit-01`'s.
- [x] 1.4 Run `npm test` and confirm the two relocated snapshot entries are character-identical
      to what `unit-01-add-sub.test.ts.snap` holds at `HEAD`. Confirm `git diff -M` shows the
      unit-01 files as renames. Stop here if either differs.

## 2. Engine: name the borrow chain

- [x] 2.1 Add `borrowChain(trace, from)` to `engine/column.ts`, returning the columns the
      borrow travels through and the column that lends. Document `reduced` as meaningless
      where the column itself borrows, and export both from `engine/index.ts`.
- [x] 2.2 Extend `engine/column.test.ts`: a chain case pinning `borrowed` at 10/9/4 for
      `500 − 237`, the lender it names, the negative `reduced` as the trap the comment
      describes, and a single-borrow case where the chain is empty and the lender is adjacent.

## 3. Engine: widen two misconception factories

- [x] 3.1 Re-express `borrowedWithoutReducing` per column and position-free, so a chained
      borrow yields a number rather than `NaN`. Widen `misalignedColumns` to apply the trace's
      operator.
- [x] 3.2 Add `chainStoppedAtLender` for the wall's third prediction — the chain completed as
      far as the lending column, with the column it passed through left standing at ten.
- [x] 3.3 Extend `engine/misconceptions.test.ts` with the widened cases, each paired with a
      synthetic case proving the check names its offender, plus an assertion that the
      two-place values are unchanged. Confirm `npm test` leaves every existing snapshot green.

## 4. Generators

One per skill; each lands with its entry in `unit02.skills` in curriculum order. Every one
takes its `name` and `blurb` verbatim from `manifest/stage-b.ts` — see design.md, *The
manifest supplies each generator's name and blurb* — because `coverage.test.ts` fails a
mismatch and a blurb over 32 characters.

- [x] 4.1 `sub-facts-small` (2.1, `quick`) — differences within 10. Predicts off-by-one either
      way and the sum.
- [x] 4.2 `sub-tens` (2.3) — whole tens. Predicts the count of tens and off-by-ten either way.
- [x] 4.3 `sub-2digit-noborrow` (2.4) — no column runs short. Predicts the sum and misaligned
      columns; must not predict flipped columns.
- [x] 4.4 `sub-3digit-borrow` (2.6) — exactly one borrow, non-zero tens digit. Predicts flipped
      columns and borrowing without reducing.
- [x] 4.5 `sub-across-zero` (2.7, **major wall**) — the borrow travels past a zero. Predicts
      flipped columns, borrowing without reducing, and the chain stopped at its lender.
- [x] 4.6 `src/curriculum/phrasing/subtraction.ts` — at least eight authored frames, each
      mentioning three quantities and asking about two, in adult situations.
- [x] 4.7 `sub-words` (2.8) — draws over the new bank with `a > b`, `distractor < a`,
      `distractor ∉ {a, b}`.

## 5. Tests

- [x] 5.1 Make `CHECK_QUANTITIES` per-operator in `engine/phrasing.ts`, with subtraction sets
      satisfying `a > b`, `distractor < a`, `distractor ≠ b`.
- [x] 5.2 Update `phrasing/frames.test.ts`: both banks in `banks`, each carrying its unit id,
      and the expected answer derived from the bank's operator instead of `q.a + q.b`. Add a
      synthetic case proving a subtraction frame breaking the contract is named.
- [x] 5.3 Record the six new snapshots in `unit-02-subtraction.test.ts.snap` and read them.
      They are the only place the generated wording is reviewed as prose.
- [x] 5.4 Update `coverage.test.ts`: the built count 18 → 24 in both places, the planned count
      183 → 177, and the stale comment on *"report the unit the manifest puts them in, not the
      file they live in"*. Keep its assertions — the manifest stays the authority.
- [x] 5.5 Re-record `__snapshots__/coverage.test.ts.snap` and confirm the only edge changes are
      `sub-facts` from `add-words` to `sub-facts-small`, `sub-2digit-borrow` from `sub-facts`
      to `sub-2digit-noborrow`, and the four new skills' own entries.
- [x] 5.6 Re-point the four `src/store/progress.test.ts` assertions design.md names under
      *Existing tests this change moves*. Re-point, do not delete: each still asserts the same
      claim about a boundary that has moved.
- [x] 5.7 Run `npm test`, `npm run build`, `npm run lint`. Only the three documented
      `Settings.tsx` warnings may remain.

## 6. Documents

- [x] 6.1 `docs/curriculum.md` — ✅ on rows 2.1, 2.3, 2.4, 2.6, 2.7, 2.8, and nothing else.
- [x] 6.2 `docs/roadmap.md` — the status line's count 18 → 24 *and* its sentence "Stage A and
      Unit 1 are complete; Unit 2 has two", plus item 7 ticked with what it left behind.
- [x] 6.3 `AGENTS.md` — correct the sentence stating the active OpenSpec queue is empty.

## 7. Drive the real app

- [x] 7.1 Open the app in a browser via the preview tool — never `npm run dev` from bash while
      one exists. Confirm three unit sections render and that Unit 2's cards appear in
      curriculum order with the right lock states.
- [x] 7.2 Play `sub-across-zero` to a wrong answer and confirm the diagnosis names a borrowing
      error rather than falling back to a bare "not quite". Confirm no solution step, hint or
      nudge shows a negative intermediate.
- [x] 7.3 Play `sub-facts-small` and confirm the lesson ends at 5 correct, since it is the
      unit's `quick` skill. Play `sub-words` and confirm the story renders and the keypad
      offers digits only.
