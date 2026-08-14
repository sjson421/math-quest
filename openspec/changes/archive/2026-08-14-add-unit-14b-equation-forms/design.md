# Design — Unit 14b, the equation forms

## Context

See `proposal.md` for motivation. The state this design starts from:

- `14a` shipped the `equation` display arm as `{ text, variable, equation }`: one plain
  string, an always-present frame label, and an `EquationData` payload with six arms. See
  `openspec/specs/unit-14-linear-equations/spec.md`.
- `expression-input` ships a **single-variable** grammar: one declared letter, integer
  coefficients, `+ − ( )`, implicit multiplication. **No division, no second letter, no
  exponent.** An entry outside it is `unparseable`, which costs no attempt.
- `Misconception.value` accepts `{ kind: 'text' }`, matched by exact string against the raw
  entry. Item 20a shipped it; Unit 13's expression skills are its only consumers so far.
- Choice diagnosis works through the same text form: the raw entry for a choice problem is
  the choice's id, so a text-valued prediction whose value is a choice id is diagnosed.
- Equation rows are width-capped at 21 characters of `display.text`, measured separately from
  the inline ladder's 18. Both numbers are measurements, not judgements.

## Goals / Non-Goals

**Goals** beyond the proposal's scope statement:

- Keep all four skills inside the answer machinery that already exists. No `Answer` arm, no
  `checkAnswer` branch, no grammar widening.
- Extend the `equation` display arm by the smallest amount its three new consumers force, and
  say what each extension is for at the point it is declared.
- Keep every new draw **composed**, never filtered — Unit 14a's stated rule, and Unit 7's
  before it.

**Non-Goals** at the design level:

- Generalising the equation arm for skills that do not exist yet. Unit 15's inequalities are
  a different relation and get their own decision when they have a consumer, which is item
  18's rule and the one `14a` followed to reach this change.
- Any second letter inside an expression *answer*. `rearrange-formula` is drawn to avoid it,
  not to permit it.

## Decisions

### 1 · `rearrange-formula` fits the shipped grammar, because only one letter is ever typed

The obvious reading of "solve for y" is that it needs a two-variable expression answer with
division — `2x + 3y = 12` gives `y = (12 − 2x)/3`, and the grammar admits neither. That
reading is wrong about where the second letter goes.

```
  screen                      pad          answer
  ────────────────────        ───          ──────────
  2y + 4x = 10                x  +  −      −2x + 5
  ─────────────               ( )  0-9
  y = ⟦        ⟧              ↑ one letter, the one in the answer
  ↑ 'y' is the frame label, never typed
```

`y` is the subject and lives in the frame; `x` is the only letter inside the answer, so
`problem.expression.variable` is `x` and `display.variable` is `y`. The grammar is untouched.

Division is avoided by composition rather than by rejection: draw the subject's coefficient
`a` first, then draw the other coefficient and the constant **as multiples of `a`**. Then
`ay + bx = c` rearranges to `y = −(b/a)x + c/a` with both coefficients whole by construction.
A draw that instead filtered for `a | b` and `a | c` is the three-independent-properties
shape that exhausted `sub-across-zero`'s draw in front of a learner.

Form is `expanded`, not `exact`: `5 − 2x` and `−2x + 5` are the same rearrangement, and
nothing here is about factored form. `factor-gcf` is the only `exact` caller and stays so.

**Predicted misconceptions**, both text-valued and both written without spaces, because
`applyExpressionKey` emits none and the match is exact string:

| mistake | on `2y + 4x = 10` | why it is predicted |
| --- | --- | --- |
| moved the term without changing its sign | `2x+5` | the term crosses the equals sign and the sign is what has to change |
| divided only one term by the subject coefficient | `-4x+5` | dividing "the answer" rather than both sides |

Neither can collide with the correct answer `-2x+5` while `a > 1`: the first differs in sign,
the second in the x coefficient. At `a = 1` dividing only one term does nothing and the second
collapses onto the answer, so **`a` is never 1** — the same bound, for the same reason,
that `two-step` and `equation-parentheses` already carry. The ladder grows `b` and `c`.

**Alternative rejected — choice input over rendered rearrangements.** It would sidestep the
grammar entirely, and it is what item 23's `graph-from-equation` may yet need. But item 20
built expression input for exactly this shape of answer, roadmap item 21 names this skill as
its consumer, and recognising a correct rearrangement is a materially easier skill than
producing one — Unit 16 needs the producing one.

**Alternative rejected — widening the grammar to two letters and division.** It is a change
to `expression-input`'s core contract, it would have to define what `x/2` compares equal to,
and it is capability work that the repository's own rule says never travels with the content
that would consume it.

### 2 · `special-solutions` is choice input, and the frame becomes conditional

The answer is a property of the equation, so `Answer['choice']` carries it and no new answer
kind is needed. Three choices for three real cases, and all three are drawn:

```
  4x + 3 = 4x + 9   variable terms match, constants differ   → no solution
  4x + 3 = 4x + 3   both match                               → infinitely many
  5x + 3 = 2x + 12  variable terms differ                    → exactly one
```

Two choices would make the skill a coin flip the moment a learner notices the variable
appears twice; the third case is also the honest one, since it is what every earlier skill in
the unit has been.

The frame is the real design question. `EquationView` renders `variable = ⟦slot⟧`
unconditionally, and `SLOT['choice']` is the prose slot, so today this skill would draw:

```
      4x + 3 = 4x + 9
      x =  ⟦ No solution ⟧      ← asserts a solution exists, and names it "No solution"
```

So `variable` becomes optional on the arm, and its absence means "no framed row at all". That
`variable` is already a **row label** rather than a letter is what makes this the existing
concept completed rather than a special case: `equation-balance` passes `'each side'`, and
`expectedEquation`'s `balance` arm ignores the parameter entirely.

**Dropping only the label was the first attempt, and the browser check rejected it.** The
reasoning was that the slot should stay so the learner still sees the choice they made. Two
things are wrong with it, and only one is visible in markup:

- an unlabelled slot is a blinking entry cursor on a screen that offers no keypad;
- what the slot echoes is `entry`, which for a choice problem is the **id**. Every earlier
  choice skill names its options by their own text — `3x`, `prime`, `<` — so the slot reads
  correctly there by coincidence. These options are sentences with slug ids, so it would have
  drawn `none`.

The whole row goes. The choices are the answer surface, and the response names the mistake.

**Alternative rejected — branching on `entryMode === 'choice'`.** It gets the same pixels
today and is wrong in principle: the frame is a claim about what the answer *is*, not about
how it is entered. A future choice-input equation whose answer is a value of the variable
would lose a frame it should have.

Because `expectedEquation` builds text from the `variable` parameter for five of the six
existing arms, the three new arms build their text from letters carried in the arm itself.
That keeps the optional label from reaching a text builder that needs a letter.

**Predicted misconceptions**, text-valued at the wrong choice's id:

| drawn case | predicted wrong choice | why |
| --- | --- | --- |
| no solution | infinitely many | the variable vanished, read as "anything works" |
| infinitely many | no solution | the variable vanished, read as "nothing works" |
| exactly one | no solution | the variable appears twice, read as cancelling |

### 3 · `with-fractions` is where the equation arm grows notation

`14a` recorded this decision as belonging to the increment with a consumer in hand. The
consumer is here, and the three candidates it named resolve like this:

| option | verdict |
| --- | --- |
| plain text `x/3 + 2 = 7` | **rejected** — item 17 exists because fractions do not render as text, and this is the unit that finally asks the equation arm for one |
| `equation` gains `notation?: MathNotation` | **chosen** |
| merge `equation` into `math` | **rejected** — `14a` rejected it and nothing has changed: five of six shipped Unit 14 equations have no structure to carry |

`text` is retained and keeps all three of its existing jobs: it is the accessible name the
notation exposes, it is what `expectedEquation` rebuilds and compares, and it is what the
plain-text row renders when no notation is present. So one string still ties the rendered
equation, the announced equation and the verified equation together — the property the
`14a` verification rule was written to hold.

`x ÷ 3 + 2 = 7` was considered and rejected on content grounds rather than technical ones:
`one-step-multdiv` already draws `x ÷ 3 = 12`, so a `÷` form of 14.7 is 14.4 with an extra
step and teaches nothing about clearing a denominator.

**Consequence to carry, not to discover later.** The 21-character equation cap measures
`display.text.length`, and a stacked fraction is *narrower and taller* than the characters
naming it. Applied to a notated row the cap measures the wrong thing in the wrong direction.

The measurement is therefore **split, not dropped**: text rows keep the 21-character cap, and
notated rows get their own cap over their own text, set from what the browser check at 375px
shows the widest notated draw actually occupies. Exempting notated rows outright was
considered and rejected — it would leave `with-fractions` the only equation in the course with
no regression gate, so a later widening of the numerator would ship green, which is precisely
the failure item 12 turned from a comment into an executed measurement. The browser check
sets the number; the test keeps it honest afterwards.

**Predicted misconception:** multiplying through on one side only — clearing the denominator
on the left while leaving the right alone. Whole by construction, since the numerator is
composed from the solution and the denominator.

### 4 · `equation-words` stays on the keypad, and `story` grows an equation payload

Roadmap item 21 names only two skills as breaking the pad. This is not one of them: the
learner builds the equation as *work* and answers with the value, exactly as `two-step` does
under the blurb "Undo in the right order".

The display is `story` — prose, no appended frame — but its payload union offers
`operands + operator`, `percent`, `ratio` and `algebra`, and none can state `ax + b = c`. A
pair of operands with one operator is a single operation by construction. So `story` gains
`equation: EquationData`, alongside `algebra`, and `recompute` gets the branch that derives
the answer from it.

Frames live in `phrasing/equations.ts` and are registered in `frames.test.ts`, which fails if
a bank exists unregistered — the check Unit 2 left behind.

**Predicted misconception:** undoing in the wrong order, dividing before subtracting. It is
`two-step`'s wall arriving in prose, and prose invites it harder, because a sentence states
the steps in the order they are *applied*. The value is `result / coefficient − constant`,
which is whole only when the coefficient divides the constant — so this skill composes its
constant as a multiple of the coefficient exactly as `two-step` does. Without that, a
sentence reading "multiplied by 4, then 7 added, giving 35" predicts 1.75: finite, unfiltered,
and unenterable on a whole-number pad. That is the dead-not-dropped trap Unit 14a's header
documents, and it is reachable here through prose that reads perfectly well.

### 5 · Three new `EquationData` arms, none carrying a solution

```
clear-fraction     { denominator, constant, adds, rightHand }
special-solutions  { leftCoefficient, leftConstant, rightCoefficient, rightConstant }
rearrange          { subject, term, subjectCoefficient, termCoefficient, constant }
```

`special-solutions`'s arm is shaped exactly like `vars-both-sides`'s and is deliberately not
merged with it: the two derive different things from the same four numbers — one a solution,
one a solution *count* — and one arm serving both would let a generator claim either.

`rearrange` carries both letters because `expectedEquation` receives only `display.variable`,
and this equation's text needs the second letter too.

`expectedEquation`'s return type widens from `number` to `number | string`: `special-solutions`
derives a solution *count* and `rearrange` derives an expression. Neither resolves a choice id
itself — `expectedEquation` has no problem to look one up in — so it returns the label and
`recompute` maps it through `choiceIdFor`, which is the path every existing choice-answered
display already takes.

### 6 · The recorded-output gate has to learn all three shapes

`RENDERED_KEYS` guards a problem's own fields, not the interior of its display, so an
unrendered display field passes the gate silently. All three extensions here are display
fields:

- an omitted `variable` prints as `solve undefined` in the equation line;
- `notation` is not printed at all, so a change to a fraction's structure would not move the
  snapshot;
- a `story` whose payload is `equation` falls through to `display.operands.join(...)`, which
  that arm does not have.

So `formatDisplay` gains all three, and only then does task 7.3's byte-identical claim over
Unit 14a mean what it says. Unit 6 left this exact lesson behind: the gate started rendering
`keypad` and `numberLine` because a per-problem declaration would otherwise have shipped
outside the review surface.

## Risks / Trade-offs

- **A notated equation row escapes the character cap** → the cap keeps governing text rows,
  and notated rows get their own cap, set from a real browser measurement at 375px before the
  change ships. Both are named as tasks; neither row ends up ungated.
- **`sourceMagnitude`'s story branch is the same silent-fallback trap as its equation branch**
  → a story carrying an equation payload reads `display.operands`, which that arm does not
  have. Named as a task alongside the equation arms rather than left to the compiler, which
  does not force either.
- **A text-valued misconception matches by exact string, so a learner's spacing defeats it**
  → the expression pad emits no spaces and the numeric entry is digits, so the only reachable
  entries are the exact forms. This is the existing contract from Unit 13, unchanged.
- **`rearrange-formula`'s pad shows `x` while the frame shows `y`** → this is the skill: the
  learner is writing what `y` equals in terms of `x`. The frame states it explicitly, and a
  learner who types `y` gets `unparseable`, which costs no attempt.
- **Three display-shape extensions in one change** → all three are optional fields on shipped
  arms with a named consumer each, and none changes what an existing generator produces. The
  recorded-output gate pins that: every Unit 14a snapshot must come out byte-identical.
- **`special-solutions` could be passed by pattern-matching the coefficients without reading
  the constants** → the "no solution" and "infinitely many" cases share their coefficients and
  differ only in their constants, so no coefficient-only rule separates them.

## Migration Plan

None. No stored data changes, so `reconcile()` and the opaque sync contract are untouched.
Four skills move from `planned` to `implemented`, which is a derivation at load, and item 1's
never-re-lock rule already covers a learner mid-course.

## Open Questions

None. The remaining unknowns are measurements — the widest notated equation row at 375px, and
the exact frame wording — and both are resolved by tasks in this change rather than by a
decision that would move a spec.
