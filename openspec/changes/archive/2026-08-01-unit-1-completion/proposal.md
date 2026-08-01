## Why

Unit 1 is five-eighths built. `add-facts-small` (1.1), `add-tens` (1.3) and
`add-three-numbers` (1.7) are the three skills still `planned`, and until they land the
course has no complete unit — a learner reaching the end of what is playable does so in the
middle of Addition.

Two later items are blocked on this one specifically:

- **Lesson mechanics (roadmap item 4)** cannot be demonstrated. It shortens `quick` lessons
  to 5 correct answers; the manifest marks 19 skills `quick` and **not one of them is
  implemented**. `add-facts-small` is the first, so this change produces the course's first
  playable `quick` skill.
- **Multiplication (roadmap item 10)** expects to extend the column engine. `add-three-numbers`
  is the first consumer of a column trace over more than two operands — the piece the
  generator-engine change (roadmap item 0) deliberately deferred rather than guessing at.
  Meeting it here on addition, where the arithmetic is understood, is cheaper than meeting it
  first alongside partial products.

## What Changes

**Scope: Stage B · Unit 1 · Addition.** Skill ids, verbatim from `docs/curriculum.md`:
`add-facts-small` (1.1, `quick`), `add-tens` (1.3), `add-three-numbers` (1.7). None is
flagged a wall.

- **Engine: a column trace over a stack of operands.** `columnTrace(a, b, operator)` is
  strictly binary and its `ColumnPlace` speaks in `top`/`bottom`. A three-addend stack needs a
  trace whose columns hold a *list* of digits, and whose carry can be **2** rather than the
  0-or-1 the binary trace guarantees (ones of `9 + 8 + 7` come to 24). The existing binary
  trace is left untouched — the borrow skills' `reduced`/`borrowed` vocabulary has no
  meaningful N-operand generalisation, and its recorded output is a shipped gate.
- **Engine: drawing more than two operands.** `drawPair` returns `{ a, b }`. Drawing a stack
  needs the same reject-and-redraw loop over an arbitrary count, reporting the skill that ran
  out of attempts.
- **Engine: the carry-dropping misconception reaches a stack.** `forgotCarry` computes
  `result − carry × 10^(n+1)`, which is already right at any carry size — it multiplies rather
  than subtracting a fixed unit. What blocks it is its parameter type, which admits only the
  binary trace.
- **Three generators**, each with its predicted misconceptions:
  - `add-facts-small` — sums within 10, counting on. Predicts off-by-one either way and the
    difference (ran the wrong operation).
  - `add-tens` — whole tens added. Predicts dropping the place value (`20 + 30 → 5`), which is
    the error the skill exists to catch, and off-by-ten either way.
  - `add-three-numbers` — a stack of three two-digit addends that must carry out of the ones.
    Predicts dropping the carry, and adding only the first two addends.
- **Three stacked operands reach the screen for the first time.** `Display` already types
  `operands: number[]` and `ColumnView` already maps over them, but no problem has ever
  produced more than two, so that path is unexercised in the same way `problem.choices` is.
  Confirming it renders correctly is part of this change, not an assumption — and it did not:
  the third row pushed "Show me a hint" underneath the keypad on a phone, on the one skill
  whose hint explains the carry. `ColumnView` now sets a stack one type size down. Two-operand
  columns are untouched, so nothing already shipped changes size.
- **`docs/curriculum.md` gains three ✅ markers**, on rows 1.1, 1.3 and 1.7. The
  document/registry cross-check enforces this in the test suite, so it is not optional
  bookkeeping.
- **The derived unlock graph tightens, and the course gains a new root.** Nothing in the
  manifest moves, but three skills stop being seen through, so the edges the store gates on
  change: `add-facts` — the root today — falls behind `add-facts-small`, and
  `add-2digit-nocarry` moves from `add-facts` to `add-tens`. This is expected and is why
  roadmap item 1 shipped *never re-lock a practised skill* first: a learner mid-course keeps
  every skill they have touched. A learner who has not started keeps exactly one open card,
  and it is now the right one — the first skill of the course rather than its second.

### Non-goals

- **Honouring the `quick` flag.** `add-facts-small` is already marked `quick` in the manifest,
  and its lesson will still end at 10 correct answers. Shortening it to 5 is roadmap item 4 and a
  `MODIFIED` delta against `skill-progression`, whose baseline states the 10 deliberately.
  This change produces the skill that makes item 4 demonstrable; it does not do item 4.
- **Unit 2's six remaining skills** (roadmap item 7), including the `sub-across-zero` wall.
- **Subtraction over a stack.** The new trace is addition-only. A borrow chain through three
  operands is not a thing the course teaches, and inventing it now would be guessing.
- **Extending `ColumnOperator` beyond `'+' | '−'`,** or anything else multiplication needs.
  Item 10 extends the engine; this change only removes the binary-operand assumption in its
  way.
- **Skill-tree navigation.** `Home.tsx` keeps rendering one flat list; it simply grows from
  seven cards to ten. Stage → unit hierarchy is roadmap item 8.
- **Any keypad rule.** All three skills answer with a plain non-negative integer, so nothing
  here needs `allowNegative`, `allowDecimal` or `allowFraction` (roadmap item 3).

## Capabilities

### New Capabilities

None. This is content plus the engine work that content requires.

### Modified Capabilities

- `problem-generation`: **ADDED** — column arithmetic over a stack of more than two operands.
  `ADDED` rather than `MODIFIED` deliberately. The baseline's requirements are worded
  generally — "the displayed operands and operator" — so a stack does not contradict any of
  them and none needs replacing. What is missing is that nothing states a stack is permitted,
  or what follows once a carry can exceed one, and no problem has ever produced either. That
  is new surface, and stating it is what stops the next generator inventing a second answer.

**No new stage capability is required.** Stage B declares none, `AVAILABLE_CAPABILITIES` in
`manifest/resolve.ts` stays empty, and nothing here needs KaTeX, fraction input, diagrams, the
coordinate plane, or the `Capability` union to grow. A stack of addends is not stage-gating
infrastructure — it is arithmetic the plain number keypad already answers.

## Impact

**Code**

- `src/curriculum/engine/column.ts` — new stack trace alongside `columnTrace`.
- `src/curriculum/engine/draw.ts` — drawing an arbitrary count of operands.
- `src/curriculum/engine/misconceptions.ts` — `forgotCarry` widened to accept a stack, and an
  off-by-a-step prediction the tens skill needs at a step of 10.
- `src/curriculum/engine/index.ts` — re-exports for the above.
- `src/curriculum/unit-01-add-sub.ts` — three generators, and `unit01.skills` reordered so the
  array stays in curriculum order (a test pins presentation order to the manifest).
- `src/components/ProblemView.tsx` — `ColumnView` drops one type size for a stack of three or
  more, so the taller display still leaves the hint reachable above the keypad. Two operands
  render exactly as before.

**Documents**

- `docs/curriculum.md` — ✅ on rows 1.1, 1.3, 1.7. Nothing else; it is imported with `?raw`.
- `docs/roadmap.md` — the status line (7 of 201 playable → 10), and item 2 ticked. The whole
  item ships here, so leaving its box unchecked would point the next run of this workflow at
  work already done.
- `AGENTS.md` — one sentence. It states the active OpenSpec queue is empty, which stops being
  true while this change sits unarchived.

**Tests**

- `src/curriculum/engine/column.test.ts`, `draw.test.ts`, `misconceptions.test.ts` — the new
  engine pieces, each with a synthetic case proving the check names its offender. `bands.ts`
  and its test are untouched: the two new ladders are per-skill and inline, following
  `add-facts`.
- `src/curriculum/generators.test.ts` — picks the three up automatically from `allSkills`;
  ~1000 sampled problems each, answers recomputed from the display.
- `src/curriculum/__snapshots__/unit-01-add-sub.test.ts.snap` — three new recorded-output
  snapshots. The test file itself does not change; it is a `describe.each` over
  `unit01.skills` and picks the three up on its own. Existing snapshots MUST NOT change, and
  the diff must therefore be a pure insertion: the seven shipped generators are untouched.
- `src/curriculum/coverage.test.ts` — the counts 7 and 194 become 10 and 191, and the ✅ set
  is re-derived from the document.
- `src/curriculum/__snapshots__/coverage.test.ts.snap` — the committed unlock graph. It is
  committed precisely so a change that moves an edge has to look at it; this change moves
  several, including the root.
- `src/store/progress.test.ts` — its fixtures assume today's graph. `throughUnit1()` omits
  three skills that are about to become playable, the root assertion names `add-facts`, and
  two cases use `add-facts-small` and `add-tens` as examples of `planned` skills.

**No impact on** the progress record, the sync endpoint, or `SkillProgress`. No stored field
is added, so nothing has to survive a round trip that does not already.
