## Why

Unit 2 is two-eighths built. `sub-facts` (2.2) and `sub-2digit-borrow` (2.5) ship; the other
six are `planned`, so a learner who finishes Unit 1 reaches two isolated subtraction cards and
then the end of the course. Unit 1 completed on 2026-07-31 and Unit 0 on 2026-08-01, which
makes Unit 2 the only thing standing between a learner and a second complete unit of Stage B.

It is also the last unit that can be built on the engine as it stands. Unit 3 opens with
partial products, which `ColumnOperator` cannot express; Unit 4 needs a long-division trace
that does not exist. Unit 2 is where the borrow half of the column engine gets finished while
the arithmetic is still understood — and `sub-across-zero` is the one skill in the course that
exercises a borrow travelling across more than one column.

## What Changes

**Scope: Stage B · Unit 2 · Subtraction.** Skill ids, verbatim from `docs/curriculum.md`:
`sub-facts-small` (2.1, `quick`), `sub-tens` (2.3), `sub-2digit-noborrow` (2.4),
`sub-3digit-borrow` (2.6), `sub-across-zero` (2.7, **major wall** — double borrow),
`sub-words` (2.8). `sub-facts` (2.2) and `sub-2digit-borrow` (2.5) already ship and gain no
content change here.

- **Six generators**, each with its predicted misconceptions:
  - `sub-facts-small` — differences within 10, counting back. Predicts off-by-one either way
    and the sum (ran the wrong operation).
  - `sub-tens` — whole tens subtracted. Predicts dropping the place value (`50 − 20 → 3`),
    which is the error the skill exists to catch, and off-by-ten either way.
  - `sub-2digit-noborrow` — column subtraction where no column runs short. Predicts adding
    instead of subtracting, and subtracting the columns out of line. Notably it cannot
    predict flipping the columns: with no borrow anywhere, taking the smaller digit from the
    larger *is* the correct answer, so that prediction would be filtered on every problem —
    the exact state `add-2digit-nocarry` shipped in and `alwaysFiltered` now catches.
  - `sub-3digit-borrow` — three-digit column subtraction with a single borrow. Predicts
    flipping the borrowing column, and borrowing without reducing the place above.
  - `sub-across-zero` — the wall. A borrow that cannot be taken from the zero above it and
    must travel a second column. Predicts flipping every column, and completing the chain's
    first leg but not its second.
  - `sub-words` — subtraction word problems over a new frame bank.
- **The borrow chain becomes nameable.** `columnTrace` already produces the correct *result*
  across a zero, and its `borrowed` field is already the digit standing above each column once
  the borrow has passed through. What it cannot say is *which* column finally lent — the
  answer the wall's hint and solution are entirely about — and its `reduced` field goes
  negative in the zero column (`0 − 1`), which is not a digit any learner writes down. The
  engine gains a way to ask for the chain, and `reduced` gains a stated limit, so no generator
  can show working nobody does.
- **Three misconception factories widen, each where its own comment says to.**
  `borrowedWithoutReducing` is documented as two-place only, with a comment naming
  `sub-across-zero` as the skill that should widen it rather than have it guessed at now —
  this is that skill. `misalignedColumns` says the same about a subtraction version, and
  `sub-2digit-noborrow` is the skill that wants one. Both must keep their current output
  byte-identical on the problems that already use them.
- **A subtraction frame bank**, `src/curriculum/phrasing/subtraction.ts`, alongside the
  addition one. The frame machinery is already operator-generic; what is not is the *check*
  over it. `CHECK_QUANTITIES` is a single shared list whose first entry has `a < b`, and
  `frames.test.ts` asserts that no predicted value equals `a + b`. Both are addition
  assumptions written into a check that is about to cover two operators, and a subtraction
  bank instantiated at `2 − 3` would be checked against text describing a negative difference
  that its draw can never produce.
- **Unit 2 becomes its own presentation unit.** `unit01` currently carries the two built
  subtraction skills under the heading "Adding & Subtracting", because two cards did not
  justify a section. Eight do, and a test pins presentation order to manifest order — so
  leaving them in `unit01` while six more land in a Unit 2 section would interleave the two
  units and fail that test. `src/curriculum/unit-02-subtraction.ts` takes all eight;
  `unit-01-add-sub.ts` is renamed to match what is left in it.
- **`docs/curriculum.md` gains six ✅ markers**, on rows 2.1, 2.3, 2.4, 2.6, 2.7 and 2.8. The
  document/registry cross-check enforces this in the test suite, so it is not optional
  bookkeeping.
- **The derived unlock graph tightens within Unit 2 and nowhere else.** Nothing in the
  manifest moves; six skills stop being seen through. `sub-facts` falls behind
  `sub-facts-small` rather than opening straight off `add-words`, and `sub-2digit-borrow`
  moves from `sub-facts` to `sub-2digit-noborrow`. Both existing skills therefore open
  *later* than they do today, which is exactly the case roadmap item 1's never-re-lock rule
  exists for: a learner who has already practised either keeps it.

### Non-goals

- **`sub-facts` and `sub-2digit-borrow` content.** They move file, and their recorded output
  must relocate byte-identical. A reworded hint on either is a regression here, not a
  refactor.
- **Skill-tree navigation** (roadmap item 8). `Home.tsx` keeps rendering a flat list of unit
  sections; it grows from two sections to three. Stage → unit hierarchy stays out.
- **Stage checkpoints** (roadmap item 9). Unit 2 does not close a stage — Units 3, 4 and 5
  are still ahead of Stage B's boundary.
- **Anything multiplication needs.** `ColumnOperator` stays `'+' | '−'`; partial products are
  roadmap item 10 and will extend the engine on their own terms.
- **Subtraction over a stack.** `stackTrace` stays addition-only. A borrow chain through
  three operands is not a thing the course teaches.
- **Any keypad rule.** Every skill here answers with a plain non-negative integer, so nothing
  needs `allowNegative`, `allowDecimal` or `allowFraction`. Negative differences arrive in
  Unit 6 (roadmap item 14).
- **A general N-column borrow-chain misconception library.** The two factories widen exactly
  as far as `sub-across-zero` needs and no further, following the rule that a helper arrives
  when a second skill needs it.

## Capabilities

### New Capabilities

None. This is content, plus the engine and phrasing work that content requires.

### Modified Capabilities

- `problem-generation`: **ADDED** — a borrow that crosses more than one column, and Unit 2 as
  playable generated content. The baseline states the stack case and the Unit 0 case as their
  own requirements for the same reason: nothing in the general wording says a borrow may
  travel, or what a learner is shown while it does, and the intermediate value the existing
  trace produces there is not a digit. That is new surface, and stating it is what stops the
  next borrowing generator inventing a second answer.
- `word-problem-phrasing`: **MODIFIED** — *Frames are checked at their source, not only when
  sampled*. The requirement is right and stays; what it does not say is that a bank's check
  must be instantiated with quantities its own operator can actually produce, and verified
  against that operator's answer. Today's check is addition-shaped in both respects, so a
  second bank would be checked against arithmetic it never performs.

**No new stage capability is required.** Stage B declares none, `AVAILABLE_CAPABILITIES` in
`manifest/resolve.ts` keeps `choice-input` alone, and nothing here needs KaTeX, fraction
input, diagrams, the coordinate plane, or the `Capability` union to grow. Every Unit 2 skill
answers on the plain number keypad.

## Impact

**Code**

- `src/curriculum/unit-02-subtraction.ts` — new. All eight Unit 2 generators: six authored
  here, two moved unchanged.
- `src/curriculum/unit-01-add-sub.ts` → `src/curriculum/unit-01-addition.ts` — loses its two
  subtraction generators; `unit01` renamed to what it now contains.
- `src/curriculum/index.ts` — `units` gains `unit02`.
- `src/curriculum/engine/column.ts` — the borrow chain named, and `reduced` given its stated
  limit, so a multi-column borrow can be described in the terms a learner writes.
- `src/curriculum/engine/misconceptions.ts` — `borrowedWithoutReducing` widened past two
  places, `misalignedColumns` widened to subtraction, and a prediction for a borrow chain
  completed only as far as its first lender.
- `src/curriculum/engine/phrasing.ts` — check quantities become per-operator.
- `src/curriculum/engine/index.ts` — re-exports for the above.
- `src/curriculum/phrasing/subtraction.ts` — new frame bank, at least eight frames.

**Documents**

- `docs/curriculum.md` — ✅ on rows 2.1, 2.3, 2.4, 2.6, 2.7, 2.8. Nothing else; it is imported
  with `?raw` and its tables are load-bearing.
- `docs/roadmap.md` — the status line (18 of 201 playable → 24), and item 7 ticked. The whole
  item ships here, so leaving its box unchecked would point the next run of this workflow at
  work already done.
- `AGENTS.md` — one sentence. It states the active OpenSpec queue is empty, which stops being
  true while this change sits unarchived.

**Tests**

- `src/curriculum/engine/column.test.ts`, `misconceptions.test.ts`, `phrasing` coverage — the
  new engine pieces, each with a synthetic case proving the check names its offender.
- `src/curriculum/phrasing/frames.test.ts` — a second bank in `banks`, with the addition
  assumptions in `checkBank` and the answer assertion replaced by operator-aware ones.
- `src/curriculum/generators.test.ts` — picks the six up automatically from `allSkills`;
  ~1000 sampled problems each, answers recomputed from the display.
- `src/curriculum/unit-02-subtraction.test.ts` — new recorded-output gate over `unit02.skills`,
  following `unit-01`'s. The two moved skills' recorded output MUST match what
  `unit-01-add-sub.test.ts.snap` holds today, character for character.
- `src/curriculum/__snapshots__/` — the unit-01 snapshot file is renamed with its test and
  loses two entries; a unit-02 snapshot file is added. The relocated entries are the diff's
  one reviewable claim.
- `src/curriculum/coverage.test.ts` — the count 18 becomes 24, and the ✅ set is re-derived
  from the document.
- `src/curriculum/__snapshots__/coverage.test.ts.snap` — the committed unlock graph. It is
  committed precisely so a change that moves an edge has to look at it; this change moves two.
- `src/store/progress.test.ts` — its fixtures assume today's graph, and use Unit 2 ids as
  examples of `planned` skills.

**No impact on** the progress record, the sync endpoint, or `SkillProgress`. No stored field
is added, so nothing has to survive a round trip that does not already.
