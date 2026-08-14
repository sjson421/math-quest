## Context

See `proposal.md` — Why. The constraint that shapes everything below is a rendering fact:
`InlineView` in `src/components/ProblemView.tsx` appends `= [slot]` to its text, and every
skill built so far is answered by the value of what it shows, so that appended equality has
always been true. Unit 14 shows a statement that already contains a relation.

Four further facts from the repository shape the approach:

- `Display` is switched exhaustively in exactly two places — `ProblemView.tsx:39` and
  `recorded-output.ts:314` — both narrowing to `never` in their default arm. A new arm is a
  compile error in both until it is handled.
- **`generators.test.ts` is not a third such place, and this is the trap.** Its two payload
  switches narrow over `AlgebraData`, not over `Display`; the `Display` dispatch around them
  is a chain of `if (display.kind === …)`. `recompute()` is compile-forced only by accident,
  because its tail destructures `const { operands, operator } = display` (`:1171`) and an
  `equation` arm has neither. `sourceMagnitude()` has no such luck: it ends in a fallback to
  `answerValue(problem)` (`:1355`), so an unhandled `equation` display would silently take
  its difficulty magnitude **from the answer** and the build would stay green. That branch
  has to be written deliberately and narrowed explicitly; nothing will remind us.
- `coverage.test.ts` caps inline display text at 18 characters. That number was measured
  against a row that also carries `=` and the answer slot, both sized in `em`.
- `coverage.test.ts` also asserts the built-skill count `129` in four places (`:73`, `:297`,
  `:356`, `:393`). Six generators make it 135.

## Goals / Non-Goals

**Goals:**

- One display arm that states the equation case honestly, so the next equation-bearing skill
  inherits it rather than rediscovering the frame problem.
- Answers re-derivable from carried source data, per `problem-generation`'s standing rule.
- A `two-step` draw whose two wall predictions are whole numbers on **every** problem, not
  on most of them.

**Non-Goals:**

- Any change to `Answer`, `checkAnswer`, or the keypad. Every answer here is an integer that
  the pad has accepted since item 3.
- Any generalisation for `14b`. `with-fractions`, `special-solutions`,
  `equation-words` and `rearrange-formula` are named in the proposal's Non-goals and their
  input shapes are decided in the increment that owns them.

## Decisions

### A new `equation` arm on `Display`, not a branch inside `inline`

```
Display
  ├── inline      text + [slot]        answer IS the value shown
  ├── story       prose, no frame      answer is a REWRITING of it
  ├── math        notation + [slot]    ...with an authored accessible name
  ├── diagram     figure + [slot]
  └── equation    text                 answer is the value that MAKES IT TRUE   ← new
                  x = [slot]
```

**Alternative rejected — a frame branch inside `InlineView`.** There is precedent: it
already branches on `decimal.operation === 'read'` to change its own frame. But it inherits
the 18-character cap, and that cap means something different for a row that ends in
`= [slot]` than for one that does not.

`vars-both-sides` can draw `12x + 15 = 5x + 78` — exactly 18 characters. Under the inline
branch that passes the gate and then has the trailing equals sign and the answer slot
appended to it, both sized in `em`, which is the overflow item 12 found in the browser after
1055 green tests. Raising the cap to fit it would loosen it for every shipped skill that
does spend the trailing budget; lowering it would narrow an equation draw for space it never
uses. One number cannot be right for both rows, and the measurement is the only thing that
catches the failure.

**Alternative rejected — a payload on `math`.** `MathView` already renders "notation above,
labelled slot below" for `scale-missing` and `solve-proportion`, so the frame is nearly free.
But `math` exists to carry structured notation, and `3x + 5 = 20` has no fraction,
superscript or radical in it; wrapping a plain string in a single `{ kind: 'text' }` node
buys the frame at the cost of claiming a structure that is not there. When `14b`'s
`with-fractions` needs real stacked fractions inside an equation, that is the increment to
decide whether the equation arm grows a notation field or the two displays merge — with a
consumer in hand, which is item 18's rule.

### `EquationData`, a new union rather than more `AlgebraData`

`AlgebraData` is reachable only from `inline` and `story`, and both `generators.test.ts`
sites narrow on those kinds. Extending it would make equation operations type-check on
displays where they mean nothing. `types.ts` already writes this rule down for
`WholeNumberData`: a union exists so that writing operands "in the order they came to hand"
is a compile error rather than a silent pass, where verification would recompute the wrong
thing and agree with the generator it exists to check.

One arm per skill, carrying the equation's own operands and the family selector — and
**never the solution**. Carrying the solution and reading it back is the generator's stated
answer wearing a different hat, which is precisely what the baseline forbids: "re-derive the
correct answer independently, without consulting the answer the generator stated". Every arm
below carries what is on screen, and verification does the arithmetic:

| skill | carried | answer derived as |
| --- | --- | --- |
| `equation-balance` | `first`, `second`, `change`, `adds` | `first + second ± change` |
| `one-step-addsub` | `constant` b, `adds`, `rightHand` c | `c − b` / `c + b` |
| `one-step-multdiv` | `coefficient` a, `multiplies`, `rightHand` c | `c / a` / `c · a` |
| `two-step` | `coefficient` a, `constant` b, `adds`, `rightHand` c | `(c − b) / a` / `(c + b) / a` |
| `vars-both-sides` | both coefficients, both constants | `(d − c) / (a − b)` |
| `equation-parentheses` | `coefficient` a, `constant` b, `adds`, `rightHand` c | `c / a − b` / `c / a + b` |

Verification's second job is that the **displayed equation agrees with the carried values**:
the expected text is rebuilt from the operands and compared, rather than the displayed text
being parsed. That is the direction `factor-gcf` already verifies in, and it is what catches
a generator showing one equation while carrying another.

### The `two-step` draw composes; it does not filter

For `ax + b = c` the two predicted mistakes are `c/a − b` (wrong order) and `(c + b)/a`
(wrong sign). Both are whole only when `a | b` **and** `a | c`. Three simultaneous
divisibility properties from a filtered draw is the shape that exhausted `sub-across-zero`'s
`drawPair` in front of a learner within 15,000 generations, and item 7 wrote the lesson down:
compose, don't filter.

```
    pick  a ≥ 2        coefficient
    pick  x            the solution
    pick  k ≥ 1        the constant as a multiple of a

    b = a·k                     →  a | b   by construction
    c = a·x + b = a(x + k)      →  a | c   by construction

    correct       (c − b)/a  =  x
    wrong order    c/a − b   =  x + k − a·k
    wrong sign    (c + b)/a  =  x + 2k
```

`a ≥ 2` and `k ≥ 1` are not taste. At `a = 1` the wrong-order value collapses onto `x`; at
`k = 0` both predictions do. A wall must carry two distinct surviving diagnoses on every
problem, and `generateProblem` drops any prediction equal to the answer — so the bound is
what makes the skill meet its contract rather than mostly meet it.

The subtraction family `ax − b = c` uses the same composition with `c = a·x − b`; its
predictions are `c/a + b` and `(c − b)/a`, whole under the same two divisibilities.

### Every draw is composed from a chosen solution

`equation-balance` has no variable and needs none of this. Each of the other four composes
from a chosen `x` so the solution is whole — and for two of them the composition carries a
second obligation, because their predictions are divisions too:

- **`one-step-multdiv`'s division family picks `c` as a multiple of `a`**, then `x = c · a`,
  so the solution is `a² · m`. Composing from the solution instead — which the first draft
  did — leaves the repeated-division prediction `c / a` fractional on most draws. Squaring is
  why this family takes a smaller coefficient band than the multiplication one.

  **This is the failure mode worth carrying forward.** A fractional prediction here is
  finite, so `generateProblem` keeps it and `alwaysFiltered` counts it as surviving. It is
  not dropped — it is *dead*, a diagnosis sitting in the problem that a whole-number pad can
  never submit. Nothing already in the suite looks at predicted values for integrality, so
  the unit's own tests do, over all six skills rather than this one.
- **`vars-both-sides` picks `c` as a multiple of `(a − b)`**, then `d = (a − b)x + c`. Its
  "constant left unmoved" prediction is `d / (a − b) = x + c/(a − b)`, whole only under that
  choice; its "coefficients the wrong way" prediction is `(d − c)/(b − a) = −x`, whole
  always, and negative — which is the case that makes the sign key load-bearing here.
- **`equation-parentheses` picks `b` as a multiple of `a`**, then `c = a(x ± b)`. Its sole
  prediction is `(c − b)/a = x + b − b/a`, whole only under that choice. It has one
  prediction rather than two because it is not a wall — but `generators.test.ts`'s
  `alwaysFiltered` gate fails a skill whose prediction never survives, so "usually whole" is
  not good enough for a single-prediction skill either.

### Predicted misconceptions

Named here because the content contract counts what survives, not what the source lists.

- `equation-balance` — leaving one side unchanged, giving the original total
  `first + second`; applying the change twice, giving `first + second ± 2·change`.
- `one-step-addsub` — repeating the displayed operation instead of undoing it (`c + b` where
  the equation adds, `c − b` where it subtracts).
- `one-step-multdiv` — repeating the displayed operation: `c · a` where it multiplies, `c / a`
  where it divides, the second whole only under the composition above.
- `two-step` — undoing in the wrong order and undoing with the wrong sign, both whole by
  construction. This is the wall, and these are its two required surviving diagnoses.
- `vars-both-sides` — subtracting the coefficients the wrong way, giving `−x`; leaving the
  constant unmoved, giving `d / (a − b)`.
- `equation-parentheses` — distributing to the first term only, giving `(c − b) / a`, which
  is Unit 13's `distributive` misconception one step further on.

### The width gate gets its own band

`coverage.test.ts` grows a second measurement over `equation` displays. The equation row
carries no trailing `= [slot]`, so its budget is the row width alone; the `x = [slot]` frame
sits on its own line beneath and is measured separately. The threshold is set from the
widest equation the six draws can actually produce, not chosen in advance — the same way the
inline ladder was re-derived in item 12.

### `equation-balance` asks the axiom, not the inverse

Exploration recommended that 14.1 ask "what do you apply to both sides to isolate `x`" — for
`x + 7 = 12`, the answer 7. Writing the spec changed the answer, and it is worth recording
why rather than quietly shipping the other one.

That version has two problems. Its answer is a number already printed on screen, so it is
passable by copying. And it is a piece of 14.2 rather than a skill: the same equation asked
twice, once for the operation and once for the solution. The curriculum's note is "Both
sides stay equal", which is the axiom the whole unit rests on and is not what naming an
inverse teaches.

So 14.1 displays a true numeric equality, states one operation applied to both sides, and
asks what each side becomes — `7 + 8 = 15`, add 6, answer 21. No variable, no isolating,
and the two predictions are the two ways the axiom fails: leaving one side unchanged, and
applying the change twice. It earns `quick` as the unit's ramp.

## Risks / Trade-offs

- **A new display kind is four files of surface for six skills.** → Two of the four are
  compile-forced; the alternative costs a silently wrong width budget on shipped skills,
  which is worse. But see Context: `sourceMagnitude()` is the one site that will **not**
  fail the build if it is forgotten, and forgetting it means the difficulty ladder is
  measured from the answer rather than from the operands. Task 2.3 exists for that single
  branch and narrows it explicitly.
- **`14b` may want notation inside an equation, making this arm look premature.** → It will
  be a widening of one arm with a real consumer in hand, not a rewrite. Guessing at it now
  is what item 18 declined to do for Unit 20's figures.
- **Composition narrows the operand space, so problems may feel repetitive.** → The
  difficulty ladder scales `a`, `x` and `k` independently, and `generators.test.ts`'s
  measurable-difficulty check reads the carried operands rather than the rendered text, so a
  ladder that has stopped climbing fails there.
- **The `x = [slot]` frame is new on screen and no test renders a DOM.** → Component tests
  assert on `renderToStaticMarkup`, which covers the markup and the accessible name; the
  width and wrapping question is what the scripted browser check in `docs/environment.md`
  exists for, and it is the last task rather than an optional one. That check found the only
  two presentation defects this repo has shipped (items 12 and 16b).
