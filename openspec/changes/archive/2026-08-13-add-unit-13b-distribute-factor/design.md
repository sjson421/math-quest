## Context

See proposal.md — Why. Three facts from the current code shape the approach:

- `canonicalForm(raw, variable, 'exact')` exists and is tested, but no shipped skill calls
  it. `serializeExact` sorts each node's children and joins them with `+` or `*` **without
  parenthesizing**, so `3(x + 4)` and `3(4) + x` both serialize to `3*4+x`.
- `generateProblem` drops a misconception whose value equals the correct answer only for
  numeric answers. For an expression answer the correct value is `NaN` and text-valued
  predictions are merely deduplicated against each other, never against the answer. The
  comment saying no expression-answer skill exists yet went stale when 13a shipped.
- `diagnose` matches a text-valued misconception by exact string against the trimmed raw
  entry, and the expression pad cannot emit a space. Predicted strings are therefore
  spaceless ASCII, exactly as 13a writes them.

## Goals / Non-Goals

**Goals:**

- Make `exact` safe to depend on before the first skill depends on it.
- Ship both generators with source-operand payloads that make each answer derivable without
  reading learner-facing text.

**Non-Goals:**

- No change to `expanded`, to the grammar, to the pad, or to how an unparseable entry is
  reported.
- No normalization of associativity under `exact` (see Decisions).

## Decisions

### Capability fix: parenthesize compound children in `serializeExact`

Serialize a child that is itself an `add` or `mul` wrapped in parentheses. `3(x + 4)`
becomes `(4+x)*3` and `3(4) + x` becomes `(3*4)+x`, so the two structures no longer share a
canonical form. Sorting still happens on the already-wrapped strings — `(` sorts before a
digit, which is why the wrapped factor leads — so a re-ordered sum or product still compares
equal, which is the only equivalence `exact` is meant to grant.

*Alternative rejected:* an S-expression form (`(mul 3 (add 4 x))`). Unambiguous by
construction and arguably tidier, but wrapping reaches the same guarantee by adding two
characters to an existing serializer, and the canonical string is compared, never read.

*Consequence accepted:* grouping differences now compare unequal at every depth, so under
`exact` `3 + (4 + x)` is no longer the same answer as `3 + 4 + x` — today they collide only
through the same missing parentheses this fixes. Flattening nested same-kind nodes first
would restore associativity, but it contradicts what `exact` is for (structure is the
answer) and nothing in Unit 13 nests a sum inside a sum.

### `distribute-negative`: `expanded`, with the inner sign drawn

The skill answers under `expanded`, exactly as `distributive` does — un-distributing is not
what 13.7 teaches, and accepting `-3(x - 4)` back is harmless. Both inner signs are drawn:
`−a(x − b)` gives `-ax+ab` and `−a(x + b)` gives `-ax-ab`, so the second term's sign is not
predictable from the shape of the problem and the learner has to decide it every time. The
answer always leads with a unary minus, which the pad already allows in first position.

Predicted misconceptions, all spaceless and none equal to the answer for any drawn `a ≥ 2`:

| tag | for `−a(x − b)` | for `−a(x + b)` | the mistake |
| --- | --- | --- | --- |
| `sign-not-flipped` | `-ax-ab` | `-ax+ab` | took the second term's sign from inside the bracket |
| `distributed-first-term-only` | `-ax-b` | `-ax+b` | multiplied the variable term only |
| `dropped-outer-sign` | `ax-ab` | `ax+ab` | distributed `a`, ignoring the leading minus |

The first is the wall. `-ax-ab` and `-ax-b` differ whenever `a ≠ 1`, which the coefficient
band guarantees, so all three survive dedup.

### `factor-gcf`: `exact`, drawn so exactly one factoring is greatest

Draw `g ≥ 2`, an inner coefficient `m ≥ 1` and an inner constant `c ≥ 2` with
`gcd(m, c) = 1`. The display is `gm·x + gc`; the answer is `g(mx + c)`. The coprimality
draw is what makes `g` the *greatest* common factor and therefore makes the answer unique —
without it, `12x + 18` could be answered `2(6x + 9)` and `3(4x + 6)` with equal justice.

`m = 1` is drawn and is the most ordinary case (`3x + 12` → `3(x + 4)`), so every coefficient
this skill writes — in the answer and in every prediction — goes through the unit's existing
`term()` helper rather than being interpolated. Two reasons, and the second is the sharp one:
the unit sweeps its own output for a written `1x` and fails on it, and under `exact` an answer
authored as `3(1x + 4)` serializes to `1*x+4*3` while the learner's natural `3(x + 4)`
serializes to `(4+x)*3` — a correct entry graded wrong.

`exact` is what makes the skill possible at all: the displayed `6x + 9` is a wrong answer to
"factor this", and only `exact` can say so.

Predicted misconceptions:

| tag | value | the mistake |
| --- | --- | --- |
| `left-expanded` | `${g*m}x+${g*c}` | wrote back what was displayed |
| `not-greatest-factor` | `d(${g*m/d}x+${g*c/d})` for a divisor `d` of `g` with `1 < d < g` | factored, but not by the greatest common factor |
| `divided-first-term-only` | `${g}(term(m)+${g*c})` | divided the variable term, copied the constant |
| `divided-second-term-only` | `${g}(term(g*m)+${c})` | divided the constant, copied the variable term |

`not-greatest-factor` is only predicted when `g` has a divisor strictly between one and
itself — that is, when `g` is composite; the others are unconditional,
so every problem carries at least three. `factor-gcf` is not marked a wall, so the
two-misconception floor does not bind, but the skill is where the "same expression" decision
is visible and the diagnosis is worth having.

### Verification payload: two new `AlgebraData` arms

`{ operation: 'distribute-negative', coefficient, constant, adds }` and
`{ operation: 'factor-gcf', factor, coefficient, constant }`, following the six 13a
operations. The independent verifier rebuilds the canonical string from these operands; for
`factor-gcf` it also rebuilds the *displayed* sum from `factor × coefficient` and
`factor × constant`, since that product is itself derived data rather than a drawn one.

### Stale comment in `generator.ts`

The central filter's comment claims no expression-answer skill exists. Correct it to state
the rule the new generators rely on: a text-valued prediction is never compared against the
answer, so a generator authoring one must construct it so it cannot coincide.

## Risks / Trade-offs

- **Parenthesizing changes the canonical string every `exact` comparison produces.** →
  `canonicalForm` is imported only by `src/lib/answer.ts` and by `expression.test.ts`, which
  compares its outputs to each other rather than to literal strings, so no assertion depends
  on the old shape; the fix still lands first in the task list so a surprise is isolated from
  the generators.
- **`exact` now rejects an associative regrouping.** → Accepted and recorded above; no Unit
  13 answer nests a sum inside a sum, and no other skill uses `exact`.
- **A written `1x` breaks the unit's notation sweep and, under `exact`, mis-grades a correct
  entry.** → Every coefficient goes through `term()`, and the existing unit-wide "never
  writes a coefficient of one" test covers displays, solutions and predictions.
- **A drawn `factor-gcf` problem could admit a second correct factoring.** → Prevented at
  the draw by `gcd(m, c) = 1`, and asserted in the skill's focused test over sampled
  problems rather than left to inspection.
- **A predicted string could coincide with the canonical answer**, which nothing filters
  centrally. → Each table above is closed under the drawn bands, and the existing
  "declares no misconception that is always filtered away" sweep plus a focused
  answer-collision assertion cover it.
