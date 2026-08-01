## Context

See [proposal.md](proposal.md) — Why. What shapes the approach:

- **`columnTrace` already computes `sub-across-zero` correctly.** Traced right to left,
  `columnTrace(500, 237, '−')` gives `result` 263 with digits 3, 6, 2 and `borrowed` 10, 9, 4
  — the standing digits a learner writes. Nothing is broken about the arithmetic. What is
  broken is one *field*: at the zero column `reduced` is **−1**, because it means "after
  lending, before receiving" and a chain receives first. So this is a naming and documentation
  problem sitting in the middle of the unit's wall skill, not a rewrite.
- **`borrowedWithoutReducing` does not merely mispredict on a chain — it returns `NaN`.**
  Confirmed by running it over that trace: its non-place-0 branch computes `top − bottom`,
  which is `0 − 3` in the tens, and the concatenation of `[3, −3, 3]` parses as `NaN`. The
  widening in this change is a correctness fix, not a refinement.
- **Two shipped generators move file, and their recorded output is a gate.** `sub-facts` and
  `sub-2digit-borrow` have snapshots recorded before the engine existed. Any helper widened
  for a new skill must produce the same values for them.
- **The frame machinery is operator-generic; its *check* is not.** `Frame` carries an
  `operator` and `storyProblem` applies it, but `CHECK_QUANTITIES` is one shared list whose
  first entry is `{ a: 2, b: 3 }`, `frames.test.ts` hardcodes `unit-1` as the location, and it
  asserts against `q.a + q.b`.
- **`AVAILABLE_CAPABILITIES` is untouched.** Stage B declares no capability, so no generator
  here is gated on infrastructure.

## Goals / Non-Goals

**Goals:**

- Six generators whose learner-facing text describes working a learner actually does.
- A borrow chain the engine can *name*, so the wall's phrasing is derived rather than
  special-cased inside one generator.
- Helper widening that leaves shipped output byte-identical, provable from the snapshot diff.
- A frame check that is honest for two operators, and would be honest for a third.

**Non-Goals:**

- Generalising the borrow chain past what `sub-across-zero` needs. It borrows through one
  zero column; a two-zero chain (`5000 − 237`) is not in the curriculum and inventing it now
  would be guessing.
- Redefining `reduced`. Its current meaning is right wherever a column does not itself borrow,
  which is every place any shipped generator reads it.
- A general subtraction analogue of every addition misconception. Two widen because two skills
  here need them.

## Decisions

### The engine names the chain rather than gaining a field

`borrowed` is already, in every case, the digit standing above a column once every borrow has
passed through it — `reduced + 10 × carry`, which is `top − incoming + 10 × carry`. So the
value the wall needs exists; adding a second field holding it would be a synonym.

What does not exist is *which column finally lent*. `sub-across-zero`'s hint has to say "the
tens is 0, so go to the hundreds", and its solution has to reduce the hundreds and stand the
tens at nine. Deriving that inside the generator means walking `trace.places` upward from the
borrowing column, which is engine work whichever file it lives in.

So: `borrowChain(trace, from)` returns the columns a borrow starting at `from` travels
through, and the column that lends. `reduced` gains a comment stating it is meaningless where
the column itself borrows, and `column.test.ts` gains a chain case pinning `borrowed`, the
lender, and the negative `reduced` as the trap it is — a checker that returns "no problems"
looks exactly like a clean codebase.

*Alternative considered:* redefine `reduced` to the standing digit. Rejected — it would then
be a synonym for `borrowed` at borrowing columns and mean something different elsewhere, which
is a worse field than one with a stated limit. *Also considered:* let the generator walk the
places itself. Rejected — `sub-3digit-borrow` wants the same "which column lent" answer for
its own phrasing, so it is shared by the time it is written twice.

### `misalignedColumns` respects the trace's operator

`add-2digit-nocarry` predicts a learner who did not line the columns up. `sub-2digit-noborrow`
is the same skill on the other operation and wants the same prediction, and the helper's
comment already says a wider version belongs with the skill that wants one.

The value becomes `a` op the digit-swapped `b` rather than `a +` it. For `+` the expression is
unchanged, so both shipped consumers keep their recorded output.

`sub-2digit-noborrow` **cannot** use `flippedColumns`: with no column running short, taking the
smaller digit from the larger is the correct answer on every problem, so the prediction is
filtered every time. That is exactly the state `add-2digit-nocarry` shipped in, and
`alwaysFiltered` in `generators.test.ts` now fails it — so the draw must additionally reject a
`b` whose digits are equal, or the misaligned prediction collides with the answer too.

### `borrowedWithoutReducing` is expressed per column, not per position

Today it special-cases place 0 (`borrowed − bottom`) and treats every other place as
`top − bottom`. On a chain that yields `0 − 3 = −3` in the tens, which concatenates into a
`NaN` — the helper does not merely mispredict, it produces a non-number.

The honest generalisation is per column and position-free: a learner who borrows without
reducing takes ten into any column that runs short, judged against the column's *original*
digit, and never decrements the column above. For two digits that is arithmetically identical
to today's expression, so `sub-2digit-borrow`'s snapshot is the proof it did not change.

### `skippedUpperSubtraction` stays two-place

It is `sub-2digit-borrow`'s third prediction and nothing else uses it. Widening it would be
guessing at a skill that does not exist; the wall here gets a prediction written for the error
it actually invites (below).

### Check quantities become per-operator

`CHECK_QUANTITIES` becomes a lookup from `Operator` to the quantity sets valid for it, and
`frames.test.ts` takes each bank's unit id and expected answer from the bank rather than
hardcoding `unit-1` and `q.a + q.b`. Subtraction's sets satisfy `a > b`, `distractor < a`, and
`distractor ≠ b` — the same constraints `sub-words`' draw enforces, so the check exercises
sentences the generator can actually produce.

*Alternative considered:* one shared list widened until it works for both. Rejected — the
constraints genuinely differ (addition has none), and a list that satisfies both would be a
list neither operation motivated.

### Unit 2 becomes its own `Unit`, and unit 1's module is renamed

`Home.tsx` already renders one section per `Unit`, and `coverage.test.ts` pins presentation
order to manifest order. Leaving `sub-facts` and `sub-2digit-borrow` in `unit01` while the
other six land in a new section would interleave the units and fail that test, so the move is
forced rather than chosen.

Once it happens `unit-01-add-sub.ts` contains no subtraction, so it and its test are renamed
to `unit-01-addition.ts`. The snapshot file follows its test. **The one claim the diff must
support is that the eight surviving entries and the two relocated ones are character-identical
to what is committed today.**

*Alternative considered:* keep the `add-sub` filenames to avoid moving the snapshot. Rejected —
the snapshot's value is its contents, which `git diff -M` shows unchanged, and a module named
for content it no longer has is the drift `AGENTS.md` warns about.

### `unit02` takes the `mint` tone

`powder` is Unit 0 and `blossom` is Unit 1. `mint` is unused and already in `TONE`.

### The manifest supplies each generator's name and blurb

`coverage.test.ts` fails any generator whose `name` or `blurb` differs from its manifest
entry, and any blurb over 32 characters. The six are therefore fixed before authoring begins,
and are to be copied from `manifest/stage-b.ts` rather than invented:

| id | name | blurb |
|---|---|---|
| `sub-facts-small` | Small Differences | Subtracting within 10 |
| `sub-tens` | Subtracting Tens | `50 − 20` |
| `sub-2digit-noborrow` | Two-Digit Subtraction | Column subtraction, no borrowing |
| `sub-3digit-borrow` | Three-Digit Borrowing | Borrowing across three digits |
| `sub-across-zero` | Borrowing Across Zero | `500 − 237` |
| `sub-words` | Subtraction Word Problems | Spot the subtraction |

The minus signs are U+2212, as everywhere else in the course. `Column subtraction, no
borrowing` is exactly 32 characters — at the limit, not over it.

## Generators and the misconceptions each must predict

Difficulty ladders are per skill and inline, following `add-facts` — `bands.ts` is not
extended. Every skill answers `intAnswer` on the plain keypad and every draw guarantees
`a ≥ b`, so no difference is negative.

| Skill | Draw constraint | Predicted misconceptions |
|---|---|---|
| `sub-facts-small` | `a ≤ 10`, `b > 1`, `a − b > 0` | off-by-one low/high; the **sum** (ran the wrong operation) |
| `sub-tens` | whole tens, count of tens drawn then multiplied | the **count of tens** (`50 − 20 → 3`) — the error the skill exists to catch; off-by-ten low/high |
| `sub-2digit-noborrow` | no column runs short; both `b` digits non-zero and unequal | the **sum**; **misaligned columns** |
| `sub-3digit-borrow` | exactly one column borrows, tens digit of `a` non-zero | **flipped columns**; **borrowed without reducing** |
| `sub-across-zero` | three digits, tens digit of `a` is 0, ones column borrows — so the borrow must travel | **flipped columns**; **borrowed without reducing**; **chain stopped at the lender** |
| `sub-words` | `a > b`, `distractor < a`, `distractor ∉ {a, b}` | the three the frame supplies: wrong operation, wrong pair, answered a part |

**`sub-across-zero` is the unit's major wall**, so it carries three predictions for the same
reason `sub-2digit-borrow` does: the contract requires two *surviving* after the central filter
drops collisions, and the count in the source is not the count that survives.

- **Flipped columns** — `500 − 237 → 337`. Cannot equal the answer: the ones column runs short
  by construction, so its flipped digit differs from the true one.
- **Borrowed without reducing** — took the ten everywhere it was needed, decremented nothing:
  `500 − 237 → 373`. Exceeds the answer by at least one hundred.
- **Chain stopped at the lender** — reduced the hundreds and stood the tens at ten, then forgot
  the tens had itself lent a ten onward: `500 − 237 → 273`. Exactly ten above the answer, and
  the error the zero column specifically invites.

The three differ by construction — one is short in the hundreds, one is exactly ten high, one
is a concatenation of column complements — but the draw predicate must still assert it rather
than assume it, and `generators.test.ts` checks it over ~1000 samples per skill either way.
That two predictions can collide is not hypothetical: on `52 − 37` the shipped
`flippedColumns` and `borrowedWithoutReducing` both give 25, which is why `sub-2digit-borrow`
already carries three.

## Existing tests this change moves

Named here because each is a decision about what the change means, not bookkeeping to discover
during apply.

- `coverage.test.ts` — the built count 18 becomes 24 in two places, the planned count 183
  becomes 177, and the comment on *"report the unit the manifest puts them in, not the file
  they live in"* stops being true the moment `unit-02-subtraction.ts` exists. The assertions
  themselves still hold and should stay: the manifest remains the authority for unit
  membership even once the files agree with it.
- `progress.test.ts` — four assertions encode today's graph and must be re-pointed, not
  deleted:
  - *opens Unit 2 once Unit 1 is finished* asserts `sub-facts` opens off `throughUnit1()`. It
    now opens `sub-facts-small` instead, which is the same claim about the same boundary.
  - *no longer asks sub-2digit-borrow for add-2digit-carry* reaches `sub-2digit-borrow`
    through `sub-facts` alone. Its route is now `sub-2digit-noborrow`; the assertion under
    test is that `add-2digit-carry` stays at zero, so only the route changes.
  - *locks a skill that has no generator* and *still refuses a practised skill that can no
    longer be generated* both use `sub-facts-small` and `sub-tens` as examples of `planned`
    skills. They need ids that are still planned after this change — Unit 3's, which is the
    next unit either way.
- The never-re-lock cases keep their meaning and gain force: `sub-facts` and
  `sub-2digit-borrow` both open strictly later after this change, so a learner mid-lesson in
  either is exactly the record those tests exist to protect.

## Risks / Trade-offs

- **A widened helper silently changes shipped output.** → `sub-facts` and `sub-2digit-borrow`
  move file in the same change, so their snapshots move too, and a value change hides inside a
  file rename. Mitigation: relocate the snapshot entries as a distinct step and confirm
  `git diff -M` reports pure rename before authoring anything new against those helpers.
- **The three wall predictions collide on some seed and the wall drops below two.** →
  `generators.test.ts` samples ~1000 problems per skill and `content-rules.ts` enforces the
  two-surviving rule, so this fails loudly. Mitigation is in the draw predicate, not in adding
  a fourth prediction.
- **A subtraction frame's distractor makes `a − distractor` negative or equal to the answer.**
  → The draw constrains `distractor < a` and `distractor ≠ b`; `frames.test.ts` checks every
  frame at its source under the same constraints.
- **The renamed module breaks an import nothing else in the change touches.** → `npm run
  build` runs `tsc -b` across all three configs and is a phase gate; `npx tsc --noEmit` is not
  sufficient and is not what will be run.
- **Six new cards make `Home.tsx` a long scroll.** → Accepted. Skill-tree navigation is
  roadmap item 8 and is explicitly not pulled forward; three headed sections is what the flat
  list was designed to degrade into.
