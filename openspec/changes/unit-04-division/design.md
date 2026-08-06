## Context

See proposal.md — Why. What shapes the approach is three existing mechanisms Unit 4 is the
first skill set to strain.

**Independent recomputation is the binding constraint, not the generators.**
`generators.test.ts` re-derives every answer from what is displayed. It has exactly two
paths: an inline or column display whose operands and operator it evaluates, and an inline
display carrying `wholeNumber: { values, operation }` whose answer it derives from the named
operation. Division breaks the first path in a way no earlier unit did — `47 ÷ 5` evaluates to
9.4 while the answer is 2 — and five Unit 4 skills need the second.

**The engine has no division working.** `columnTrace` and `stackTrace` model addition and
subtraction; `multiplicationTrace` and `partialProductTrace` model multiplication rows.
Long division is not another `ColumnOperator`: its step count is set by the dividend's width,
each step's input depends on the previous step's remainder, and it runs most-significant
digit first while multiplication runs ones first.

**The phrasing bank reserved a slot and left constraints unresolved.** `CHECK_QUANTITIES` is
deliberately `Partial<Record<Operator, …>>` with a comment saying a division frame arrives
with Unit 4 "and brings the quantities its own draw admits". `storyMisconceptions` currently
hard-codes the wrong-operation partner as "`−` if the frame is `+`, otherwise `+`", which for
division predicts a sum.

**Reject-and-redraw has a documented ceiling.** `sub-across-zero` exhausted `drawPair`'s 300
attempts in front of a learner when its filter wanted three independent properties at once.
Long division wants at least three (exact division, a fixed quotient width, a non-zero
intermediate remainder), so it composes.

## Goals / Non-Goals

**Goals**

- One shared long-division trace that hints, solution steps, and both walls' misconceptions
  all read, so none of them recomputes the division on its own terms.
- Widen the machine-readable display channel by the smallest amount that makes all 11 skills
  verifiable, keeping recomputation total over the operations it accepts.
- Compose long-division operands so no Unit 4 draw can exhaust its attempts.
- Answer the roadmap's multi-value question without building an input mode.

**Non-Goals** (beyond proposal.md — Non-goals)

- No generalisation of the division trace toward decimal quotients or divisors wider than two
  digits. Both arrive with the units that want them.
- No rename of the existing display-data field, discussed under Decisions.
- No new engine module for `factors`/`multiples`/`primes`. Number theory over values under a
  few hundred is a handful of local helpers in the unit file, not shared machinery; a second
  consumer can extract it.

## Decisions

### 1. Long division gets its own trace module, not a widened `ColumnOperator`

`src/curriculum/engine/division.ts` exports:

```
DivisionStep  { place, broughtDown, working, digit, product, remainder }
DivisionTrace { dividend, divisor, steps, quotient, remainder }
divisionTrace(dividend, divisor): DivisionTrace
divisionStep(trace, place): DivisionStep       // problem-specific failure, like multiplicationPlace
```

`steps` runs **highest place first**, matching the order the work is done — the same principle
as `multiplicationTrace`'s ones-first ordering, applied to an algorithm that runs the other
way. `working` is the previous remainder times ten plus `broughtDown`, which is the value the
learner actually divides at that step, and is why `broughtDown` alone is insufficient.

*Alternative rejected:* widening `ColumnOperator` to `÷` and reusing `columnTrace`. Column
traces pair a top and bottom digit per place and produce one written digit per column; long
division produces a quotient digit per *dividend* place from a value that spans two, and
subtracts a product rather than a digit. The `misalignedValue` comment already notes that
`applyOperator` is exhaustive over the union precisely so widening it fails to compile at
every site that would then be wrong — Unit 3 declined the same widening for the same reason.

### 2. The display-data channel gains division and number-property operations

`WholeNumberData` (`{ values, operation }` on an inline display) is read by nothing that
renders — only by `generators.test.ts` and the unit tests. It is the "carried values plus what
to do with them" channel. It gains five operations:

| operation | values | displayed text | answer derived as |
|---|---|---|---|
| `divide-remainder` | `[dividend, divisor]` | `a ÷ b` | `a % b` |
| `divide-quotient` | `[dividend, divisor]` | `a ÷ b` | `Math.floor(a / b)` |
| `factors` | `[n]` | `n` | choice labelled with every factor of `n`, ascending |
| `multiples` | `[n, count]` | `n` | choice labelled with the first `count` multiples of `n` |
| `classify-prime` | `[n]` | `n` | choice labelled `prime` or `composite` |

The existing text cross-check extends with the two `a ÷ b` cases; the three number-property
operations fall through to the existing `String(a)` expectation. The three choice operations
resolve through `choiceIdFor`, which already fails loudly on a missing or duplicated label and
on duplicate ids — so `factors`, `multiples` and `primes` inherit Unit 0's verification
without new machinery.

*Alternative rejected:* renaming the field to something operation-neutral. It is a genuine
misnomer for `divide-remainder`, but Unit 4 is entirely whole numbers, the rename touches 25
references across `unit-00-numbers.test.ts` for no behavioural gain, and mixing it into a
content change is exactly the kind of unrelated churn phase 6 exists to reject.

*Alternative rejected:* a fourth `Display` variant. It would duplicate `inline`'s text and
force every consumer to handle a case that renders identically.

### 3. `factors`, `multiples` and `primes` use `choice-input`

This is the roadmap's open question. Choices are complete authored lists, exactly as
`order-numbers` already presents comma-joined orderings — the precedent is one unit old and
already verified through the label. A new multi-value entry mode would be capability work,
which `openspec/config.yaml` and the roadmap both require to be its own change and never
bundled with the content it unblocks.

The three skills are also where a set answer is *pedagogically* right: recognising a complete
factor list is the skill, and typing eight numbers in an order the checker has to normalise
would test entry, not number theory.

`primes` classifies a displayed number as prime or composite — two options, faithful to the
curriculum's "Prime vs composite". Two options means exactly one wrong id and therefore one
predicted misconception, which is allowed: it is not a wall. Its nudge names the actual
divisor (`51 = 3 × 17`), which is a real diagnosis rather than a restatement.

Three constraints follow from the machinery and are not optional:

- **Choice ids must be numeric strings.** `generateProblem()` computes the correct value for
  a choice answer as `Number(problem.answer.id)`, and `diagnose()` compares `Number(raw)`
  against misconception values. An id like `'prime'` makes `correct` `NaN`, so no prediction
  is ever filtered and none can ever match — the skill silently loses diagnosis while every
  test stays green. `compare-numbers` and `order-numbers` already follow this; Unit 4 does too.
- **`factors` draws a value with at least six factors.** Its "omitted 1 and the number
  itself" distractor is the factor list with both ends removed, which for a prime is empty
  and for 4 is a single entry. Six factors keeps that distractor a plausible list, and there
  are plenty of such values under 100 (12, 18, 20, 24, 28, 30, …).
- **Stage B must record `choice-input`.** `stage-b.ts` currently declares no `requires` and
  says so in its header comment, because until now the stage was entirely keypad. The rule
  stated in `stage-e.ts` is that `requires` lists every capability a stage's own skills need,
  and `manifest.test.ts` asserts every stage with a named consumer records it. Nothing about
  skill state changes — `choice-input` is in `AVAILABLE_CAPABILITIES`, so `resolveSkillState`
  blocks nothing — but two tests pin the current absence and must move with the manifest:
  `manifest.test.ts`'s stage list, and `coverage.test.ts`'s `expect(stage?.requires)
  .toBeUndefined()`, which becomes an assertion that Stage B requires only built capabilities.

### 4. Long-division operands are composed, never filtered into shape

Draw the divisor and the **quotient**, then set `dividend = quotient × divisor`. Exact
division and quotient width are then structural rather than probabilistic. One cheap predicate
remains — at least one step must leave a non-zero remainder — which is taste, not structure,
and is what `drawPair`'s retry loop is documented as being for.

That predicate is load-bearing for `long-div-1digit`: without it every step divides cleanly,
the `ignored-step-remainder` prediction equals the quotient, the central filter drops it, and
the wall ships with one diagnosis on that problem. Composition makes it cheap to guarantee.

`long-div-remainder` composes the same way and then adds a remainder strictly between 1 and
`divisor − 1` to the dividend, so it never comes out exactly.

### 4a. Division is displayed inline, never as a column

Every division skill uses `{ kind: 'inline', text: '936 ÷ 4' }`, including the two long-division
walls. `ColumnView` right-aligns its operands on a shared digit width and puts the operator
beside the last row, so a column division renders the divisor's ones digit under the
dividend's ones digit — which is precisely the alignment long division does *not* use, on the
skill whose entire subject is the algorithm. Unit 3's `mult-2by1` uses `column` correctly
because column multiplication really is aligned that way.

Inline needs no component change, `InlineView` already steps its type size down past seven
characters, and the recomputation regex already accepts `÷`. The algorithm is taught in the
worked solution, which shows each step's working from the trace — which is where it belongs
anyway, since a static stack cannot show a bring-down.

*Alternative deferred:* a real long-division display with the quotient above a bracket. That
is a rendering capability, and rendering capabilities are their own change.

### 4b. Difficulty ladders scale the quotient, not the dividend

`sourceMagnitude` in `generators.test.ts` measures an inline-or-column problem by its **answer**,
falling back to display values only when `wholeNumber` data is carried. So a division ladder
that grows the dividend while the divisor grows alongside it can hold the quotient flat and
fail the scaling test, even though the problems visibly got bigger. Every division ladder is
therefore written as a quotient band; `div-remainder` and `long-div-remainder` are the two
exceptions, measured on their carried `[dividend, divisor]` values.

### 5. The wrong-operation partner becomes operation-specific

`storyMisconceptions` replaces its `operator === '+' ? '−' : '+'` ternary with an explicit
partner map: `+ ↔ −`, `× ↔ +` (unchanged — Unit 3's recorded output pins it), `÷ → ×`.
Predicting a sum for a division story names an error the wording does not invite, while
multiplying the two quantities is precisely what a learner who has not identified the
operation does. `CHECK_QUANTITIES` gains a `÷` list whose entries divide exactly by both `b`
and the distractor, and `frames.test.ts` gains a `÷` block asserting that — the mirror of the
existing `×` block that rejects `2 × 2`.

### 6. Misconceptions each generator must predict

Non-wall skills need at least one prediction that survives the central filter on some
problem; the two walls need **two distinct surviving tags on every problem**, which is what
drives the draw constraints above.

| skill | predictions |
|---|---|
| `div-meaning` | one equal group too many / too few (`offBy(quotient, 1)`) |
| `div-facts` | multiplied instead of divided (`a × b`); one group too many / too few |
| `div-remainder` | gave the quotient instead of the remainder; took the remainder from the wrong end (`divisor − remainder`) |
| `div-by-10-100` | removed one zero too few (`answer × 10`); shifted the wrong way (`dividend × divisor`) |
| **`long-div-1digit`** (wall) | **`forgot-bring-down`** — stopped before the final step, giving the quotient without its last digit; **`ignored-step-remainder`** — divided each brought-down digit alone instead of the remainder it joins |
| `long-div-remainder` | gave the remainder where the quotient was asked; rounded the quotient up rather than discarding the remainder |
| **`long-div-2digit`** (wall) | **`estimate-high` / `estimate-low`** — the leading quotient digit guessed one too high or too low, i.e. `quotient ± 10^place`, via the existing `offBy` |
| `factors` | omitted 1 and the number itself; included a number that does not divide it |
| `multiples` | listed the factors instead of the multiples; started the list at zero |
| `primes` | the single opposite classification, nudged with the actual divisor pair |
| `div-words` | the three comprehension errors `storyMisconceptions` supplies, with `÷ → ×` from decision 5 |

Both wall pairs derive from the trace, so a change to the algorithm's working cannot leave a
diagnosis describing arithmetic the lesson no longer shows.

### 7. Vocabulary is already cleared

`VOCABULARY` in `content-rules.ts` maps `factor`, `multiple`, `prime`, `composite` and
`remainder` to unit 4. Unit 4 may use all five; no earlier unit may. No change is needed, and
the forward-reference rule will catch a Unit 4 word that leaks backwards into a shared helper.

## Risks / Trade-offs

- **A wall's second diagnosis collapses on some problems and the content contract fails only
  at one difficulty.** → Both wall pairs are guaranteed by construction (decision 4), and
  `generators.test.ts` samples all five difficulties. The failure surfaces in the suite, not
  in front of a learner.
- **Engine additions perturb an existing recorded snapshot.** → Nothing shared is modified
  except `storyMisconceptions`' partner map, whose `+`, `−` and `×` results are unchanged by
  construction. The Unit 1–3 snapshots are the check, and they must stay byte-identical.
- **`div-by-10-100`'s `shifted-the-wrong-way` value is large** (`4200 × 100`). → It is a real
  error and a typable number; being implausible to type only means it rarely fires, which is
  what an unlikely misconception should do. The `removed-one-zero-too-few` prediction carries
  the common case.
- **Choice lists for `factors` make long labels.** → Labels reach `learnerText()` and are
  checked by the content rules like any other string; the difficulty ladder caps the values
  where the factor list stays readable rather than letting it grow to a highly composite
  number with a dozen entries.
- **Two-digit divisors with three-digit dividends make arithmetic the learner cannot yet do
  mentally.** → That is the skill. The trace's per-step working is what the solution shows,
  and the estimating wall's whole subject is that each digit is a guess to check.

## Migration Plan

None. No stored data and no schema change. `AVAILABLE_CAPABILITIES` is untouched, so Stage B
recording `choice-input` leaves every skill's resolved state exactly as it was. Unit 4 skills
move from `planned` to `implemented` purely by gaining generators, and the never-re-lock rule
from roadmap item 1 protects any existing record as Unit 3's tail stops being seen through.
