## Context

See `proposal.md` — *Why*. What shapes the approach is the state of the engine after roadmap
item 0, which extracted six generators onto shared helpers and deliberately stopped at what
those six needed:

- `columnTrace(a, b, operator)` is binary. `ColumnPlace` speaks in `top`/`bottom`, and its
  `carry` is documented as "1 when this column carries or borrows, else 0" — true for two
  digits, false for three.
- `drawPair()` returns `{ a, b }`.
- Every ladder in `bands.ts` is an operand range. `add-facts` ignores them and declares its
  own inline, with a comment saying why; that is the established idiom for a skill whose
  range was chosen for the skill.
- `Display` already types `operands: number[]`, `ColumnView` already maps over them, and
  `generators.test.ts` already folds the operator across all of them. The N-operand path
  exists end to end and has never carried a third operand — dead in the same way
  `problem.choices` is dead.

Two constraints bound everything below. `unit-01-add-sub.test.ts` records the exact output of
the seven shipped generators, and a diff there is a regression rather than a re-record. And
`coverage.test.ts` pins presentation order to manifest order, so the generators cannot simply
be appended to the end of the file.

## Goals / Non-Goals

**Goals:**

- Remove the binary-operand assumption from the engine at the smallest honest size: what
  `add-three-numbers` needs, and nothing speculatively shaped for multiplication.
- Keep the seven shipped generators byte-identical. Nothing below edits one.
- Land the unlock-graph shift deliberately, with the grandfathering behaviour asserted rather
  than assumed.

**Non-Goals:**

- Unifying `drawPair` and the new multi-operand draw. See *Decision 3*.
- Generalising the borrow helpers (`borrowedWithoutReducing`, `skippedUpperSubtraction`) to a
  stack. Nothing in the course subtracts three operands in a column.
- A hundreds place on `add-three-numbers`. Three two-digit addends can total three digits, and
  that falls out of the final carry exactly as it already does for `add-2digit-carry`.

## Decisions

### 1 · A second trace beside `columnTrace`, not a generalisation of it

`stackTrace(operands: number[])` goes in `engine/column.ts` next to `columnTrace`, addition
only, with columns holding a *list* of digits:

```ts
type StackPlace = {
  place: number
  digits: number[]   // one per operand, in operand order
  incoming: number   // carry arriving from below — a quantity, 0..n
  raw: number        // sum of digits, before the incoming carry
  total: number      // raw + incoming
  digit: number      // total % 10
  carry: number      // Math.floor(total / 10) — 2 is normal here
}
```

The field names deliberately match `ColumnPlace` where the meaning matches (`raw` before the
carry arrives, `total` after, `digit` written down), because `add-2digit-carry` and
`add-three-numbers` say almost the same sentences and should read the same in source.

**Why not generalise `columnTrace`.** Half of `ColumnPlace` is subtraction vocabulary —
`reduced` is "top after lending a ten upward", `borrowed` is "reduced plus the ten borrowed
from above". Neither has a meaning over a stack, and inventing one would put a field on the
type that no caller can trust. `top`/`bottom` have no N-operand form either. A generalisation
would therefore be `columnTrace` with four fields that are only valid at width 2, which is a
worse type than two honest ones.

**Why not a new file.** It is the same idea — right-to-left place arithmetic — and keeping
both in `column.ts` is what lets one comment explain why there are two.

**Cost, stated plainly:** the two-operand addition path is expressible as a stack of two, so
this is a real duplication of about fifteen lines. It is accepted because collapsing it means
either changing `columnTrace`'s output (gated by a snapshot of shipped content) or leaving
`columnTrace` as a wrapper whose subtraction branch cannot route through the stack anyway.
Multiplication (roadmap item 10) will touch this file again; if a third trace wants the same
skeleton, that is the point to extract one.

### 2 · Carry is a quantity, and the misconception helper already agrees

`forgotCarry` computes `trace.result − column.carry × 10^(n+1)`. That is already correct for a
carry of 2 — it multiplies rather than subtracting a fixed unit. The only thing standing
between it and a stack is its parameter type.

So it widens structurally rather than gaining a variant:

```ts
type CarryingTrace = { result: number; places: readonly { carry: number }[] }
```

`ColumnTrace` and `StackTrace` both satisfy it, no call site changes, and the recorded output
of `add-2digit-carry` and `add-3digit` cannot move because the arithmetic is untouched.

`columnTrace`'s own doc comment ("1 when this column carries or borrows, else 0") stays true
of *that* trace and gains a pointer to the stack, where it is not.

### 3 · A separate multi-operand draw

`drawOperands({ label, rng, band, count, where })` returns `number[]`, over the same
reject-and-retry loop and the same "name the skill that ran out of attempts" error.

**Why not reimplement `drawPair` on top of it.** `drawPair` carries `second(a, rng)` — draw the
second operand *from the first* — which is what the subtraction skills use to keep `b` below
`a`. That has no N-operand meaning without inventing one. More importantly, the draw order is
part of what a seed means: `drawPair`'s comment says reordering its calls would repoint every
recorded problem in the course. Rewriting it under a stack is a byte-identical-output risk
taken for no gain here. The two are ~10 lines each; if `second` ever generalises, they merge
then. Re-checked in phase 5 rather than assumed away.

### 4 · Per-skill inline ladders, and the numbers behind them

`bands.ts` is not touched. `SINGLE_DIGIT` bounds each operand at 9, which is not the same
constraint as *sums to 10*; `add-facts` already sets the precedent of an inline ladder with a
comment saying why. `add-three-numbers` uses the shared `TWO_DIGIT`.

The ladders below were chosen by enumerating the whole problem space rather than by eye,
because `add-facts-small` has a genuinely small one and two of the suite's gates
(`magnitude(5) > magnitude(1)`, and more than 20 distinct displays) are easy to miss by
guessing.

**How the figures below were obtained, and what they are worth.** They come from modelling the
draw against a faithful copy of `makeRng`, `constrain` and `drawPair` at the suite's own
sampling — 200 seeds × 5 difficulties — *before* any generator exists. They are therefore
predictions, not measurements of shipped code, and they are recorded here so that the ladders
are reviewable rather than arbitrary. Task 2.6 is what confirms them against the real
generators; a figure that lands materially differently is a signal to revisit the ladder, not
a number to quietly re-record.

**`add-facts-small`** — operands `[2, 8]`, `a + b ≤ 10`. Excluding an operand of 1 matches
`add-facts` ("adding 0 or 1 teaches nothing at this stage") and the *degenerate problems*
requirement, at the cost of shrinking the space from 45 ordered pairs to 28.

| difficulty | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| band | `[2,4]` | `[2,5]` | `[2,6]` | `[2,8]` | `[3,8]` |
| distinct pairs | 9 | 16 | 22 | 28 | 15 |
| mean sum | 6.0 | 7.0 | 7.5 | 8.0 | 8.7 |

Mean sum rises at every step and the union covers all 28 pairs.

The trade-off, stated rather than hidden: enumerating every monotone ladder over this space
that also has a strictly increasing mean sum, the one maximising the *smallest* per-difficulty
count is `[2,5] [2,6] [2,7] [2,8] [3,8]`, which never drops below 15 pairs — but it opens at a
mean sum of 7.0 and spans only 7.0 → 8.7. The ladder above is chosen instead because starting
genuinely easy matters more on the first skill of the course than variety at difficulty 1,
where a learner is at mastery 0 and has seen nothing. It costs 9 distinct problems at that
level. That floor is a property of "sums to 10 with no operand of 1" — only 9 such pairs total
8 or less — not of the ladder, and it is part of why 1.1 is marked `quick`.

**`add-tens`** — draw the *tens count* in `[1, 9]` and multiply by 10, rather than drawing in
`[10, 90]` and rejecting the 90% that are not whole tens. Bands `[1,4] [1,5] [2,7] [2,8]
[3,9]`; mean answer 50.3 → 116.8. Sums pass 100 at the top, which is the point at which whole
tens stop being a memorised fact.

**`add-three-numbers`** — three operands from `TWO_DIGIT`, constrained to carry out of the
ones. Mean answer 77.3 → 172.6, 996 distinct displays across the 1000 sampled, and a carry of
2 in roughly 15% of them — frequent enough that the carry-as-quantity path is exercised by the
sampling suite rather than only by a unit test.

### 5 · Misconceptions, per generator

None of these three is a wall, so the two-prediction minimum does not bind. They are still
authored to two or three, because a bare "incorrect" is the response this app exists to avoid.
Every value below was checked across the 1000-problem sample: none equals the correct answer,
and none collides with another (verified before authoring — see *Risks*).

**`add-facts-small`** — the counting-on skill, so the errors are counting errors:

- `off-by-one-low` / `off-by-one-high` — `sum ∓ 1`, via the existing `offByOne`.
- `subtracted` — `|a − b|`, via `wrongOperation`. Cannot equal the sum unless an operand is 0,
  which the draw excludes.

**`add-tens`** — one error dominates, and it is the reason the skill exists:

- `dropped-place-value` — `20 + 30 → 5`. The learner added the tens digits and wrote the
  answer without them. Value `a + b` against a correct answer of `10(a + b)`; the two can
  never coincide.
- `off-by-ten-low` / `off-by-ten-high` — `sum ∓ 10`, one ten miscounted. Needs the off-by
  shape at a step of 10, which `offByOne` hardcodes at 1 — see *Decision 6*.

**`add-three-numbers`** — the stack's two characteristic errors:

- `forgot-carry` — added the columns and never carried out of the ones. `result − 10 × carry`,
  which is short by 20 when the carry is 2. This is the prediction that would be quietly wrong
  under a boolean carry, and it is why *Decision 2* exists.
- `added-two-of-three` — `a + b`, the third addend never picked up. A stack invites this in a
  way a pair cannot.

These two collide when the third addend is exactly `10 × carry` — that is, 10 with a carry of
1, or 20 with a carry of 2. `generateProblem()` would dedup one away and the learner would get
one prediction instead of two, silently. The draw rejects that case, which is the sanctioned
mechanism (*reject and draw again rather than contorting the selection logic*) and costs
around 1% of candidate stacks.

### 6 · `offByOne` generalises to `offBy`, preserving its tags exactly

`add-tens` wants the same two-sided shape at a step of 10. `offBy(correct, step, { tag, low,
high })` produces `${tag}-low` / `${tag}-high`, and `offByOne` becomes a one-line wrapper at
`step: 1, tag: 'off-by-one'`.

The tags `off-by-one-low` and `off-by-one-high` appear in the committed output of `add-facts`
and `sub-facts`, so preserving them exactly is the whole constraint — the wrapper exists to
make that impossible to get wrong. The alternative, writing two misconception literals inline
in `add-tens`, duplicates a shape the engine already owns for the sake of avoiding a four-line
change.

### 7 · The unlock graph shift is asserted, not absorbed

Nothing in the manifest moves, but three skills stop being seen through, so the derived unlock
edges change:

| skill | prerequisite today | after |
|---|---|---|
| `add-facts-small` | — (planned) | — · **the new root** |
| `add-facts` | — (root) | `add-facts-small` |
| `add-tens` | — (planned) | `add-facts` |
| `add-2digit-nocarry` | `add-facts` | `add-tens` |
| `add-three-numbers` | — (planned) | `add-3digit` |
| `add-words` | `add-3digit` | `add-three-numbers` |

Every other edge is unchanged; `sub-facts` still sits behind `add-words`, and
`sub-2digit-borrow` behind `sub-facts`.

For a learner with no history this is strictly right: one card is open and it is now the first
skill of the course instead of its second. For a learner mid-course, `add-facts` has gained a
prerequisite they may never have met — exactly the strand *never re-lock a practised skill*
was shipped to prevent, and the first time that rule has been load-bearing rather than
defensive. It is asserted directly rather than trusted: a record holding attempts on
`add-facts` and nothing else keeps `add-facts` open.

The committed unlock-graph snapshot is updated in the same task as the change that moves it,
so the diff is reviewed as a graph rather than accepted as a test fixup.

### 8 · Curriculum order in `unit01.skills`

The three generators are inserted at their curriculum positions rather than appended:

`add-facts-small · add-facts · add-tens · add-2digit-nocarry · add-2digit-carry · add-3digit ·
add-three-numbers · add-words · sub-facts · sub-2digit-borrow`

The two subtraction skills stay last — the manifest puts them in Unit 2, behind all of Unit 1.
`coverage.test.ts` compares this array to `implementedSkillIds` unsorted, so an append fails
rather than landing in the wrong place on screen.

## Risks / Trade-offs

**A misconception value collides with the answer or with another, on some seed the sample
misses** → Every predicted value was checked across the modelled 1000-problem sample before
authoring, and the collision that does occur
(`add-three-numbers`, third addend `= 10 × carry`) is excluded by the draw rather than left to
central dedup.

Worth stating precisely, because it is easy to over-claim: `generators.test.ts` asserts these
two properties over the output of `generateProblem()`, which has *already* dropped any
prediction equal to the answer and deduped by value. Those assertions therefore describe what
reaches the learner and cannot fail on what a generator authored — the guarantee is structural,
made by the central filter, not by that test. Which is exactly why a collision must be designed
out rather than left to be swallowed: a deduped prediction is invisible, and the skill silently
ships one diagnosis instead of two.

**The stack trace duplicates the binary one, and they drift** → Accepted, with the reason
recorded in *Decision 1*. Both are covered by `column.test.ts`, and both feed generators whose
output is snapshot-pinned, so a drift shows up as a wording or arithmetic diff rather than
silently.

**A three-operand column renders wrong** → `ColumnView` has never had a third row. It is
generic over `operands`, so the expectation is that it works, but "expected to work" is exactly
what the browser check is for; this is the change's user-visible surface and it is exercised in
the real app, not only in tests.

> **This risk fired, and the browser check is what caught it.** The digits stacked correctly,
> but the extra row is ~75px tall and pushed "Show me a hint" underneath the keypad at 375×812
> — unreachable, on the single skill whose hint explains the carry. Nothing in the test suite
> could see it: the suite reads generated data, never a laid-out screen.
>
> Fixed in `ColumnView` by dropping a stack of three or more one type size (`text-6xl` →
> `text-5xl`, with the operator and rule spacing following). Scoped to the new case on purpose:
> the alternative — making the lesson's content area scroll — would have changed how all ten
> skills behave on a phone to accommodate one, and a lesson that scrolls is worse than digits a
> size smaller. Two-operand columns emit byte-identical class strings, verified in the DOM.

**Widening `forgotCarry`'s parameter type weakens it for the binary case** → The structural
type asks only for `result` and `places[n].carry`, both of which the callers already pass. The
narrowing it gives up is a type-level guarantee that the argument is a `ColumnTrace`, which no
caller depended on.

**A learner mid-course is re-locked out of `add-facts`** → The grandfathering rule prevents it,
and this change asserts it rather than assuming it. Worth naming as a risk anyway: this is the
first change to move an edge under a rule that has only ever been tested on hypotheticals.

## Migration Plan

None. No stored field is added or changed, so no progress record needs migrating and the sync
endpoint is untouched. The unlock-graph shift is a read-time derivation and applies the moment
the bundle loads, in both directions — rolling back restores the old edges with no record
rewritten either way.
