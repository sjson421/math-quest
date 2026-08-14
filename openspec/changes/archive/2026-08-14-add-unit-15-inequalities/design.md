## Context

See proposal.md — Why. The constraints that shape this design are already in the repository:

- `Choice` is `{ id, label: string, value?: Rational }` and `ChoiceInput` renders the label as
  text. A choice cannot draw a figure.
- `expression-input` parses integer coefficients, one variable letter, infix `+`/`-`, unary
  `-`, parentheses, and implicit multiplication by juxtaposition. It admits no relation
  symbol; any unrecognised character makes the whole entry unparseable.
- `NumberLineSpec` is a start, a step and a count, and placing on it submits one tick's
  value. It cannot express an open circle or a shaded ray.
- The `equation` display arm appends no `= answer` and makes its frame label optional, and
  `special-solutions` already answers one through choice input with the frame dropped. Its
  doc comment currently reads "a statement that already contains its relation, **answered by
  the value of `variable` that makes it true**" — the first clause covers an inequality and
  the second does not, which is the sentence this change corrects.
- `Misconception.value` may be `{ kind: 'text' }`, matched against the raw entry by exact
  string. A choice submits its `id`.
- `content-rules.ts` counts a wall's predictions by distinct **tag**. The filter that drops a
  prediction equal to the answer lives in `generateProblem` in `src/lib/generator.ts`, and it
  drops a *text* prediction only when it is empty or a duplicate — never for equalling the
  answer, since the answer it compares against is `Number(answer.id)`, which is `NaN` for
  every id this unit uses.

## Goals / Non-Goals

**Goals:**

- One input decision for the whole unit, derived from what an inequality's answer *is*,
  rather than six independent ones.
- Every answer independently recomputable from carried source values, including the ones that
  are not numbers.
- The wall's four options built from two orthogonal mistakes, so neither can be guessed from
  the other.

**Non-Goals:**

- Any rendering of an inequality graph. See proposal.md — Non-goals.
- Reversing the direction of a question so the graph is displayed and the relation chosen.
  That needs a display that draws a graph, which is the same declined capability.

## Decisions

### The unit answers relations through choice input, and 15.6 through the keypad

A solution to an inequality is a relation, not a value: `−3x > 12` solves to `x < −4`. The
keypad can submit `−4` and nothing else, which drops the direction — and the direction is the
entire content of `flip-the-sign`. Choice labels are plain strings and `x < −4` is a plain
string, so built choice input carries the whole answer with no capability work.

*Alternatives considered.* Widening the expression grammar to admit `<` — capability work,
and 14b already established that capability work does not travel with its content. Answering
the boundary on the keypad and treating the relation as given — this makes 15.5 unaskable.
Splitting each solving skill into a boundary question and a direction question — two skills
where the manifest has one, and the manifest is the authority.

`compound-inequalities` is the exception and takes the keypad, because "how many whole
numbers from 0 to 10 satisfy this" is genuinely a value. It also breaks what would otherwise
be five consecutive choice skills, which is the longest such run in the course.

### `graph-inequality` names its graph in words

The roadmap offered "picks among rendered lines (choice input, built)". Choice input is
built; a choice that renders a line is not. With that option gone, the fork was a described
graph or a new rendering capability whose only consumer in the whole course is this one
skill — item 22 delivers a plane, not a line with rays, so nothing downstream inherits it.

The described graph keeps the skill's actual content: the four options are the four pairings
of circle type with shading direction, so the learner must decode `≥` into *inclusive* and
*which way* independently. Boundaries include negatives so that "shaded right" is not
reliably "toward the bigger-looking number".

*Trade-off, stated plainly.* This is a weaker skill than reading a drawn graph would be. It is
the strongest version available without building a capability, and the roadmap should record
the decline rather than leave the fork open for the next reader to re-litigate.

### "Which symbol makes this true?" has no unique answer, so 15.1 asks the other way

The obvious first draft of `inequality-symbols` displays `7 __ 3` and offers `<`, `≤`, `>`,
`≥`. Both `>` and `≥` are true of it, and both `≤` and `≥` are true of any equal pair. There
is no draw over four offered symbols that has exactly one true answer, which is worth
recording because the shape looks correct until the options are written out.

So 15.1 displays the relation and asks what it *says*: `x ≤ 9` reads "x is at most 9". The
four options are the same 2×2 the unit runs on — direction × strictness — with "less
than"/"more than" for the strict relations and "at most"/"at least" for the inclusive ones,
which is the vocabulary the GED actually uses.

15.1 and 15.2 therefore share a structure over the same displayed statement. They are not the
same question: one asks what the relation says, the other what it draws, and meeting the same
2×2 in two representations is the point rather than a duplication.

### The choice id is the statement in ASCII; the label is the statement as drawn

For every skill whose answer is a relation, an option's `id` is its statement in the
characters the checker reads (`x<-4`) and its `label` is the statement as the learner reads it
(`x < −4`, typographic minus). This is the split `number-line.ts` already keeps between
`tickEntry` and `tickLabel`, for the same reason: the two forms should meet in exactly one
place, and that place should be the one where the difference is the point.

It also makes a predicted mistake read as itself —
`{ value: { kind: 'text', value: 'x>-4' }, tag: 'did-not-flip' }` — rather than as a slug
whose meaning lives somewhere else. `special-solutions` used slug ids because its options are
sentences; these are statements, so they can be their own identity.

Nothing echoes an id back to the learner here: every *choice-answered* display omits
`variable`, so its frame row is dropped, and the one skill that keeps a frame has no choices to
echo. That is the same mechanism 14b needed, and the reason it is
safe to use content-derived ids without checking how they render.

`graph-inequality`'s options are descriptions rather than statements, so its ids stay
structural slugs (`open-left`, `closed-right`).

### The option order is drawn, because content ordering leaks the answer here

The first draft sorted the four options by their own content — relation, then boundary —
reasoning that a fixed structural order is what `special-solutions` does and is more legible
than a shuffle. That reasoning does not transfer, and working it out on paper is how it was
caught.

`special-solutions` draws its *answer* from a fixed option list, so the correct index is
uniform over the three. Here the options are derived *from* the answer — reverse its relation,
swap its strictness, substitute a wrong boundary — so any ordering that reads only their
content stays correlated with which is right. Under `<`, `≤`, `>`, `≥`, walking
`solve-one-step-ineq` through the four displayed relations puts the correct option at position
1, 2, 2 and 3. Position 4 is never correct, and a learner who noticed that would be right
three times in four on the remaining three.

`flip-the-sign` is worse and in a second way. Its solved boundary is `c / −a`; with both drawn
positive it is always negative, so the correct option reaches only two positions *and* is
always the one carrying the minus sign. Picking the negative option would be right every time
without reversing anything, on the skill whose entire subject is the reversal. So the draw
also takes the right-hand value with either sign.

The order is therefore a permutation drawn from the problem's own generator: deterministic per
seed, reproducible in the recorded-output gate, and uncorrelated with correctness.

### Six new `EquationData` arms, and a `Relation` type beside `Operator`

`Relation` is `'<' | '>' | '≤' | '≥'`, next to the existing `Operator`, so a relation is one
named thing rather than a string literal each generator spells for itself.

| Arm | Skill | Carries |
| --- | --- | --- |
| `inequality-meaning` | 15.1 | relation, bound |
| `inequality-graph` | 15.2 | relation, bound |
| `inequality-addsub` | 15.3 | relation, constant, adds, right-hand |
| `inequality-multdiv` | 15.3, 15.5 | relation, **signed** coefficient, multiplies, right-hand |
| `inequality-two-step` | 15.4 | relation, coefficient, constant, adds, right-hand |
| `inequality-compound` | 15.6 | connective, both bounds and their relations, range maximum |

**`inequality-meaning` and `inequality-graph` carry identical fields and are deliberately two
arms.** They derive different things from the same two values — a reading and a drawing — and
one arm serving both would let a generator claim either answer from either question. That is
exactly why `vars-both-sides` and `special-solutions` are separate despite carrying the same
four numbers.

**`inequality-multdiv` is deliberately one arm across two skills.** The coefficient is signed,
so verification reverses the relation exactly when it is negative — one rule rather than two,
and the sign is a value the display puts on screen, so nothing can be swapped. What separates
15.3 from 15.5 is the *draw*: 15.3 never draws a negative coefficient and 15.5 always does,
and a draw constraint belongs in the unit's own test rather than in the type.

*Alternative considered.* Separate `inequality-multdiv` and `inequality-flip` arms, mirroring
14a's `one-step-multdiv`. Rejected: those two arms differ in shape (`ax = c` versus
`x / a = c`), whereas these would differ only in the sign of a carried number, and duplicating
the derivation is how the two copies drift.

### The `equation` display arm is reused, with its documentation corrected

An inequality is a statement that already carries its relation, so `inline` is wrong for it —
appending `= answer` would draw `x ≥ −2 = closed`. That is precisely the reasoning the
`equation` arm was added for, and the arm already supports everything Unit 15 needs: a plain
text row, an optional frame, and a choice answer.

**The frame row follows the input, not the unit.** The first draft dropped `variable` on all
six, reasoning that no answer in the unit is a value of x. Five of those are right; the sixth
was a keypad screen with no slot, where pressing a digit changed nothing on screen. Only the
browser check caught it — every assertion passed, because a missing row is not something an
element query thinks to ask about.

It is 14b's finding read backwards. That increment dropped the frame because an unlabelled slot
on a screen with no keypad is a blinking cursor inviting entry; this one restored it because a
keypad with no slot is entry with no feedback. The rule under both is that the frame is a
*claim* — the answer is a value of the thing named — false of a graph or a solved relation,
true of a count. `compound-inequalities` frames `how many`, which is a label rather than a
variable name, exactly as `equation-balance` frames `each side`.

*Alternative considered.* A fourth `Display` arm for inequalities. Rejected on 14a's own
test: it split `equation` out of `inline` because the two rows measure differently — an inline
row spends part of its width on a trailing equals sign and a slot, an equation row spends
none. An inequality row measures identically to an equation row, renders identically, and
announces identically. A separate arm would duplicate `EquationView` and its size ladder for
no measured difference.

What this leaves is a naming imprecision: `EquationData` will carry arms that are not
equations. The alternative is a rename of the arm and its payload type across `types.ts`,
`ProblemView`, `recorded-output.ts`, `generators.test.ts` and Unit 14, which is refactoring
with no behavioural content, in a change that already adds six generators.

The arm's doc comment reads "a statement that already contains its relation, answered by the
value of `variable` that makes it true". The first clause is exactly right for an inequality;
the second is what stops being true, and it is also why the frame label was made optional in
14b without the sentence above it being revisited. This change corrects the second clause and
records that the payload type's name is now narrower than what it holds.

### Predicted misconceptions

Every skill predicts at least two; the wall predicts three. Each is reachable by an actual
learner and distinct from the answer by construction.

| Skill | Predictions |
| --- | --- |
| `inequality-symbols` | reading the direction backwards; losing or gaining the boundary itself |
| `graph-inequality` | wrong circle for the strictness; shading the wrong way |
| `solve-one-step-ineq` | repeating the displayed operation instead of undoing it; reversing the relation where no negative appears |
| `solve-multi-step-ineq` | undoing in the wrong order; reversing without a negative |
| `flip-the-sign` ⚠️ | not reversing; losing the boundary's sign; both at once |
| `compound-inequalities` | treating a strict bound as inclusive; counting what the statement excludes |

`flip-the-sign`'s three are the non-empty combinations of two independent errors, which is
what makes its four options exhaustive rather than authored: reverse or not, keep the sign or
not. For `−3x > 12` the answer is `x < −4` and the other three are `x > −4`, `x < 4` and
`x > 4`.

## Risks / Trade-offs

- **A keypad skill on the `equation` arm can lose its answer slot** → The arm ties the slot to
  the frame label, so dropping the label to avoid a false claim drops the entry feedback with
  it. Unit 15 is the first place those two came apart, and the unit test now keys the frame to
  `inputMode` rather than asserting its absence unit-wide.
- **A described graph is weaker than a drawn one** → Stated in the roadmap when this ships, as
  a decline with its reason, so it is a decision on the record rather than an omission.
- **Five consecutive choice skills would make the unit feel like a quiz** → `compound-inequalities`
  takes the keypad on its own merits, and the five choice skills differ in what they ask
  (a reading, a drawing, and three solved relations) rather than only in their numbers.
- **A predicted mistake that no input can submit is dead, not dropped** → 14a's finding, and it
  applies here twice over. Every relation prediction must be one of the four offered ids, and
  every count prediction in 15.6 must be a non-negative whole number the pad can enter.
- **A text prediction equal to the answer is not filtered out** → and this is the sharper
  version of the same trap. `generateProblem` drops a *numeric* prediction equal to the
  answer; for a choice answer it compares against `Number(answer.id)`, which is `NaN` for
  `x<-4`, so a text prediction that repeats the correct option survives every central gate.
  Five of this unit's six skills predict text, so each one's own test asserts that no
  predicted identity equals the answer's.
- **`sourceMagnitude()` in `generators.test.ts` falls back to the problem's own answer** →
  14a's finding, but it is guarded one level up from where it first looks. `sourceMagnitude`
  branches on the display *kind*, and `equation` is already a branch, delegating to
  `expectedEquation(...).values`; a missing `EquationData` arm is a compile error in that
  exhaustive switch rather than a silent pass. What is *not* forced is that each new arm
  return values that actually climb — an arm returning a constant list would pass the type
  check and flatten the ladder — so every arm's `values` are chosen to be the quantities the
  difficulty bands widen.
- **The wrong-order option in 15.4 could coincide with the correct one, or not exist at all** →
  Two separate hazards from one draw. Correct minus wrong-order is `b(a−1)/a`, so they agree
  exactly when the coefficient is 1 or the constant is 0, and the draw excludes both. Distinct
  is not enough, though: the wrong order divides the right-hand value *alone*, so `3x + 4 ≤ 19`
  mis-orders to `19/3 − 4`, which the keypad-free option list cannot state and no learner
  lands on. Both the constant and the right-hand value are therefore drawn as multiples of the
  coefficient — `3x + 6 ≤ 21` solves to 5 and mis-orders to 1 — and the unit test asserts the
  wrong-order value is an integer differing from the answer on every draw.
- **A compound statement could be satisfied by everything or nothing** → The draw composes the
  bounds inside the stated range rather than drawing and filtering, and the unit test asserts
  the count is neither 0 nor the whole range.
