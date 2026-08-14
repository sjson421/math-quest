## Why

Roadmap item 21's `14b` increment closes Unit 14 with `with-fractions` (14.7),
`special-solutions` (14.8), `equation-words` (14.9) and `rearrange-formula` (14.10). Item 21
names two of them as breaking the keypad, and `rearrange-formula` is the gate on Unit 16 —
a line cannot be graphed until it has been rearranged into `y = mx + b`.

Three of the four ask the equation display something it cannot currently say. `14a` shipped
an `equation` arm whose row is a plain string and whose slot is always framed `variable =`,
and recorded that the increment with a real consumer in hand would decide whether that arm
grows notation. This is that increment.

## What Changes

- **Four generators**, completing Unit 14 and leaving only increment `15` of roadmap item 21.
  - `with-fractions` — an equation carrying a real stacked fraction, cleared by multiplying
    through by the denominator. Whole-number solution on the numeric keypad.
  - `special-solutions` — choice input over three genuine cases: no solution, infinitely
    many, and exactly one. The answer is a property of the equation, not a value.
  - `equation-words` — a word problem the learner turns into an equation and solves.
    Numeric keypad, with a new fixed frame bank.
  - `rearrange-formula` — expression input. Two letters are on screen, `y` and `x`; only
    `x` appears in the answer, so it fits `expression-input`'s single-variable grammar
    unchanged.
- **The `equation` display arm gains an optional structured notation**, rendered in place of
  the plain text row when present, with the text retained as the accessible name and as the
  value independent verification compares against. This settles the question `14a` deferred.
- **The `equation` display arm's `variable` frame becomes optional.** Absent means the slot
  renders unlabelled beneath the equation. `special-solutions` is the consumer: its answer is
  not a value of the variable, and today's unconditional frame would put `x = No solution` on
  screen, in the one skill whose subject is that a solution may not exist.
- **The `story` display arm gains an `equation` payload**, so a word problem whose structure
  is an equation carries its source terms for independent verification. Its existing
  `operands`/`operator` arm cannot express a two-step setup.
- **Three new `EquationData` arms**, each carrying only quantities the equation puts on
  screen and never the solution.
- **The equation row's width measurement is re-derived** for a row that may now render
  notation rather than characters.

**No new capability.** `math-notation`, `fraction-input` and `expression-input` are all in
`AVAILABLE_CAPABILITIES` and all three are already declared by Stage E, so
`AVAILABLE_CAPABILITIES` is untouched. No change to `Answer`, `checkAnswer`, the numeric
keypad, or the expression grammar.

## Capabilities

### New Capabilities

None. Every behaviour here extends a capability that already exists.

### Modified Capabilities

- `unit-14-linear-equations`: the unit's remaining four skills — what each displays, what it
  answers with, and how each draw is composed so its predicted mistakes survive.
- `problem-generation`: equation displays gain three source-data arms; a story display may
  carry equation source data; an equation display carrying notation is verified against its
  text.
- `answer-entry`: the equation frame becomes conditional on the answer being a value of the
  variable, and an equation may frame an expression answer.
- `math-notation`: an equation row may be structured notation rather than plain text, with
  one accessible name.

## Impact

- `src/curriculum/unit-14-linear-equations.ts` — four generators appended to the existing six.
- `src/curriculum/unit-14-linear-equations.test.ts` — per-skill independent tests.
- `src/curriculum/phrasing/equations.ts` (new) and `phrasing/frames.test.ts` — the word
  problem's fixed frames, registered so the bank is checked.
- `src/lib/types.ts` — `EquationData` gains three arms; the `equation` display arm gains
  optional `notation` and optional `variable`; the `story` arm gains an `equation` payload.
- `src/components/ProblemView.tsx` — `EquationView` renders notation when present and drops
  the frame when unlabelled.
- `src/curriculum/recorded-output.ts` — the wording gate learns the optional frame label, the
  notation tree, and a story carrying equation terms. Without it none of the three reaches
  the snapshot, since the gate's key check guards a problem's fields, not its display's.
- `src/curriculum/manifest/stage-e.ts` — Stage E declares `choice-input`, which it has needed
  since `identify-like-terms` and never stated. Nothing unlocks; the capability has shipped
  since item 5.
- `src/curriculum/generators.test.ts` — `expectedEquation` gains three arms and a wider return
  type; `recompute` and `sourceMagnitude` handle a choice-valued and an expression-valued
  equation answer, and a story carrying equation terms.
- `src/curriculum/coverage.test.ts` — Unit 14's implemented/planned split, the playable
  count in every case that states it, and a second equation width cap for notated rows.
- `docs/curriculum.md` and `docs/roadmap.md` — the four ✅ markers and the status line, which
  the cross-check enforces.

## Non-goals

- **Increment `15`** (`inequality-symbols`–`compound-inequalities`). It is the last of
  roadmap item 21 and keeps that item's checkbox open after this change.
- **`graph-inequality`'s input mode** (15.2). Item 21 requires that decision before increment
  `15` is proposed, and it is capability work with its own item if the number line has to
  grow.
- **Any Unit 16 work.** `rearrange-formula` exists because Unit 16 needs it; the coordinate
  plane is roadmap item 22.
- **Any change to `Answer`, `checkAnswer`, the expression grammar, or the numeric keypad.**
  `rearrange-formula` is drawn to fit the grammar `expression-input` already ships rather
  than widening it; division and a second answer letter stay outside it.
- **Merging the `equation` and `math` display arms.** `14a` rejected that and this change
  keeps the arms separate; the notation field is the narrower answer to the same question.
