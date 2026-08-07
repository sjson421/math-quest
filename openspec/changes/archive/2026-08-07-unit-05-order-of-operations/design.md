## Context

See proposal.md — Why. The constraint that shapes everything below is that
`generators.test.ts` recomputes every answer from the display and currently matches an inline
display against `/^(-?\d+)\s*([+\-−×÷])\s*(-?\d+)$/`. `3 + 4 × 2` does not match it, so the
recomputation throws before it can disagree with anything.

Two further constraints come from what the course has already built. The wall rule in
`lib/content-rules.ts` requires two distinct misconception **tags on every problem**, not on
average, and `lib/generator.ts` drops any predicted value equal to the answer — so a wall whose
two predictions can collide silently ships with one. And a predicted value that is negative or
fractional can never be typed on a whole-digit keypad, so it is a diagnosis that never fires.

## Goals / Non-Goals

**Goals:**

- Verification that evaluates a displayed expression the way a reader does, and would fail a
  generator that folded left to right.
- Three generators whose predictions are all reachable on the existing keypad, by construction
  rather than by rejection.
- No new file under `src/curriculum/engine/` and no new field on `Display`.

**Non-Goals:**

- A general expression library. Depth, variables and exponents arrive with the units that need
  them, and guessing their shape here is how later units inherit someone else's assumptions.
- Changing how any Unit 0–4 problem is displayed, verified, or sized.

## Decisions

### Evaluate the display; do not carry a parallel copy of it

Unit 4 added `WholeNumberData` because `47 ÷ 5` shows a division whose answer is a *property*
of it — the remainder is neither 9.4 nor 9. That is not this case. A Unit 5 answer **is** the
value of the expression on screen, so the check evaluates the screen.

Considered and rejected: a `{ operation: 'evaluate', expression }` member on `WholeNumberData`,
matching Unit 4's shape. It would have required `displayedText()` to render the carried tree
back and compare it to `display.text` — which is the generator's own renderer checked against
the generator's own tree. The regex branch reads what the learner reads, and that is the
stronger check. This is the boundary between the two mechanisms, and it is worth stating: carry
data when the answer is *about* the display, evaluate the display when the answer *is* it.

### Three independent evaluators, deliberately not shared

`src/curriculum/unit-05-order-of-operations.ts` builds an expression as a small tree and
renders it to the string the learner sees. `src/curriculum/generators.test.ts` parses that
string back and evaluates it, written from scratch — a tokenizer over integers, `+ − × ÷` and
parentheses, then a precedence evaluator.

They must not share code. Unit 4 states the rule for its trial division and it applies here:
a helper used by both the generator and its check verifies nothing. The cost is one evaluator
written twice; the benefit is that a precedence bug has to be made identically in two places
by two different methods to survive.

A **third** evaluator lives in the unit's own test file, by shunting-yard, and it is not
redundant with the second: it is the only one that can evaluate a **bracket-stripped string**.
Deriving parentheses rather than storing them means there is no tree to ask "what would this
be without its brackets" — the question only exists on text. That is what the
brackets-that-bind assertion needs, and it is the only check that `render()`'s rule actually
holds over sampled output. A maintainer trimming an apparently duplicate evaluator would take
that with it.

### Parentheses are derived, never stored

`render()` parenthesises a child when its operator binds less tightly than its parent, or binds
equally and sits on the right. Nothing carries a "has brackets" flag.

The spec requires brackets only where they change the value, which is *almost* what that rule
gives: `a + (b + c)` would be bracketed by the rule and is worth the same as `a + b + c`. The
draws never build that node — every parenthesised group in this unit is a `+`/`−` pair under a
`×`/`÷` parent, where precedence strictly differs — and the unit test asserts the property
directly over sampled problems: the expression evaluated without its parentheses differs from
the answer. Deriving rather than storing is what makes that assertion meaningful; a stored flag
would let a generator claim brackets that the renderer never printed.

### Compose the operands; do not draw and filter

Every shape below states the inequalities that keep its answer, its intermediates and both its
predictions non-negative whole numbers. Where a bound is a range, the operand is drawn from
that range rather than drawn freely and rejected. Roadmap items 7 and 11 both record why:
`sub-across-zero` shipped a three-property filter that exhausted its 300 attempts in front of a
learner. Rejection is still used where a single forbidden value has to be skipped, which is
what `drawPair`'s retry is for.

### Expression helpers stay in the unit file

All three consumers are Unit 5 skills. `unit-04-division.ts` states the rule for `factorsOf`
and it holds unchanged: a helper reaches `engine/` when a second **unit** needs it, so that
Unit 12's exponents and Unit 13's variables shape their own rather than inherit one guessed at
from order of operations. The promotion trigger is the first of those, not this change.

### Sizing is presentation, not capability

`ProblemView` sizes an inline display in two steps: over 20 characters at `text-3xl`, over 6 at
`text-5xl`. Measured across 1000 problems per built skill, the longest inline display below 20
characters is 13 (`121, 104, 178`) and the longest on the keypad is 12 (`100 + 10 + 5`). A
four-term `pemdas` expression reaches 16.

One intermediate band — over 13 characters at `text-4xl` — is added. Nothing already built
crosses 13, so no shipped skill changes size. This is not capability work under
`openspec/config.yaml`'s separation rule: no input mode and no rendering surface is introduced,
only a font-size step on a branch that already exists.

**Amended twice. The second time this section was wrong, not imprecise.**

First, during apply: the measured `pemdas` maximum came out at 18 characters rather than the 16
estimated here, so the upper threshold moved with it. The measurement is now executed in
`coverage.test.ts` rather than recorded in a comment, so a later unit that widens a display
fails there instead of wrapping on a phone for a person to notice.

Then phase 7 exercised it in a browser and `9 − 3 × 2` **wrapped**, orphaning the `2` on a
second line — nine characters, well inside the band this section called safe. The premise above
is what failed: it measured *character counts against each other* and never measured the row.
The equals sign and the answer slot are sized in `em`, so they grow with the font, and the slot
grows again as the learner types. A display that fits beside an empty slot can still wrap on
the second digit, which is exactly how the old ladder passed inspection and failed in use.

Re-measured in a real 375px viewport, as the whole row, with each skill's widest answer in the
slot — the largest size that stays on one line:

| chars | display | fits at | shipped at |
| --- | --- | --- | --- |
| 8 | `1482 ÷ 6` | `text-4xl` | `text-5xl` |
| 10 | `2800 ÷ 100` | `text-4xl` | `text-5xl` |
| 12 | `100 + 10 + 5` | `text-3xl` | `text-5xl` |
| 13 | `121, 104, 178` | `text-4xl` | `text-5xl` |
| 18 | `19 + 10 × (41 − 6)` | `text-2xl` | — |
| 27 | `three hundred seventy-three` | none | `text-3xl` |

**So "nothing already built moves" was not a constraint this change could honour — it was a
description of a bug.** Four shipped skills overflow a 375px phone today, and Unit 5's
expressions cannot be drawn short enough to sit outside the affected range. The ladder is
therefore re-derived for every length, and the shipped displays in that range move *down* a
size because they were overflowing. That is a fix to them, not a regression.

Left alone deliberately: `read-numbers` spells a number out across 27 characters and fits at no
size in this ladder. Words want wrapping rather than shrinking, which is a different mechanism
on a skill outside this change.

## Misconceptions, per generator

Every value below is a non-negative whole number under the stated bounds, and distinct from the
correct answer and from the other prediction — so the central collision filter removes nothing
and the wall keeps two diagnoses on every problem.

### `two-operations` (5.1, **wall** — the left-to-right instinct)

Three terms, two operators: one of `+`/`−` and one `×`, in either position. The
higher-precedence operation sits second on roughly two problems in three, so the named instinct
is what the skill mostly tests, while the remaining third stops "always do the last one first"
from replacing it as an equally wrong rule.

| Shape | Bounds | Answer | `left-to-right` / `right-to-left` | `first-step-only` |
|---|---|---|---|---|
| `a + b × c` | a ≥ 1, b ≥ 2, c ≥ 2 | a + bc | (a + b)c | bc |
| `a − b × c` | b ≥ 2, c ≥ 2, a > bc, a ≠ 2bc, a ≠ 2b | a − bc | (a − b)c | bc |
| `a × b + c` | a ≥ 2, b ≥ 2, c ≥ 1 | ab + c | a(b + c) | ab |
| `a × b − c` | a ≥ 2, b > c ≥ 1 | ab − c | a(b − c) | ab |

- **`left-to-right`** / **`right-to-left`** — the other bracketing of the same three terms. Two
  tags rather than one because they are different habits worth tracking apart across sessions,
  and exactly one of them is available on any given problem.
- **`first-step-only`** — the multiplication done correctly and then reported as the answer.
  A genuine incomplete-execution error, and distinct in kind from getting the order wrong.

### `with-parentheses` (5.2)

A `+`/`−` group under a `×`, on either side.

| Shape | Bounds | Answer | `ignored-parentheses` | `bracket-only` |
|---|---|---|---|---|
| `(a + b) × c` | a ≥ 1, b ≥ 1, c ≥ 2 | (a + b)c | a + bc | a + b |
| `(a − b) × c` | c ≥ 2, a > bc, b ≥ 1 | (a − b)c | a − bc | a − b |
| `c × (a + b)` | a ≥ 1, b ≥ 1, c ≥ 2 | c(a + b) | ca + b | a + b |
| `c × (a − b)` | c ≥ 2, a > b ≥ 1 | c(a − b) | ca − b | a − b |

`ignored-parentheses` is the reason the brackets must always bind against precedence: given a
redundant pair its value is the answer, the filter drops it every problem, and the skill ships
predicting nothing while looking like it predicts two things.

### `pemdas` (5.3)

Two families, drawn per problem. Both are needed: the letter myth has nowhere to appear without
a same-precedence pair, and parentheses have nothing to change without mixed tiers.

**Family P — parentheses across both tiers**, `d + c × (a − b)`, with a ≥ 2, b ≥ 1, c ≥ 2,
d ≥ 1, a > b.

- Answer `d + c(a − b)`
- **`ignored-parentheses`** — `d + ca − b`
- **`left-to-right`** — `(d + c)a − b`, every operator folded in written order

**Family T — the letter myth**, `a ÷ b × c` or `a − b + c`.

- `a ÷ b × c` composes as `a = q·b·c` for drawn `q`, `b`, `c ≥ 2`, so the answer is `qc²` and
  the myth's value is `q` — both whole, without a filter.
- `a − b + c` needs a > b + c so the myth's value stays non-negative.
- **`pemdas-letter-order`** — `a ÷ (b × c)` or `a − (b + c)`. PEMDAS read as six ordered steps
  rather than three tiers: multiplication before division, addition before subtraction. The
  best-documented misconception this skill exists to catch.
- **`first-step-only`** — `a ÷ b` or `a − b`. `left-to-right` is *correct* on this family, which
  is exactly the point of it, so the second prediction has to come from elsewhere.

### Stage B's completion is data, and the test that assumed otherwise has to move

`lib/checkpoint.ts` walks the **manifest's** membership and fails on a planned skill, so
nothing about the checkpoint rule changes when the last Stage B generator lands — it starts
firing because the data finally satisfies it. That is the design working.

What has to change is `checkpoint.test.ts`'s Stage B case, which masters every implemented
Stage B skill and asserts no checkpoint fires. Its premise is that the stage is partly built,
and this change is what ends that. Deleting it would quietly retire real coverage of the rule
roadmap item 9 exists for. It moves instead — to a stage still partly built, or to a synthetic
stage, which is the pattern `resolve.test.ts` already uses for derivation rules and the one
that stops the case expiring again at Unit 6.

## Risks / Trade-offs

- **The test's evaluator is new code that everything else depends on.** A bug in it would
  weaken the check protecting every skill in the course, not just Unit 5. → It gets its own
  synthetic cases in the `recompute` block, in the file's existing habit: precedence applied,
  parentheses honoured, equal precedence run left to right, an unparseable display named, and a
  left-to-right answer caught. A checker returning "no problems" looks exactly like a clean
  codebase.

- **Widening the inline branch could silently stop verifying an existing skill.** An evaluator
  more permissive than the regex might accept something the regex rejected. → Every existing
  display still routes through the same branch and the full suite is the gate; the two-operand
  cases are unchanged in meaning, only in how they are parsed.

- **`pemdas` carries most of the unit's complexity** in an item the roadmap sizes S. → Its two
  families are each simpler than one combined shape, and both compose their operands rather
  than filtering. If a family proves unworkable during apply, that is a design defect and
  returns to audit rather than being patched in place.

- **A 16-character expression at `text-4xl` beside the `=` and the answer slot is untested on a
  375px phone.** → Phase 7 exercises `pemdas` in the browser at phone width. If it still
  overflows, the band moves; nothing about the generators depends on the number.

- **Predicting an incomplete answer (`first-step-only`, `bracket-only`) diagnoses a slip rather
  than a misconception.** It is a weaker teaching signal than an ordering error. → It is real,
  it is specific, and it is what makes two distinct tags available on every problem without
  inventing a mistake nobody makes. The nudge names the step still owed rather than scolding.
