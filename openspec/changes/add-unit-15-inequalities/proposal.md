## Why

Roadmap item 21's `15` increment is its last, and closing it closes the item: Unit 15's six
skills are the whole of what stands between Stage E and Stage F. The increment could not be
proposed before now because item 21 held one decision open — `graph-inequality` (15.2) had
no input mode, and the roadmap required that settled outside the increment rather than
inside it.

It is settled, and the roadmap's own framing of the fork was wrong. It offered "picks among
rendered lines (choice input, built)" as the cheap option, which assumes a choice can render
a figure. `Choice` is `{ id, label: string, value?: Rational }` and `ChoiceInput` renders
`{choice.label}` as text — no notation, no SVG, no line. A choice that draws a graph is the
same class of capability work as growing the number line, not the built alternative it was
taken for.

So the real fork was narrower: describe the graph in words through built choice input, or
build a rendering capability whose only consumer in the entire course is this one skill.
Item 22 delivers a coordinate *plane*, not a line with rays, so nothing downstream inherits
it. This change takes the first, and the reasoning generalises to the unit — a solution to
an inequality is a *relation*, not a value, and the keypad can only submit a value.

## What Changes

- **Six generators**, completing Unit 15, Stage E, and roadmap item 21.
  - `inequality-symbols` — a displayed inequality answered by what it says in plain English
    ("at most 9", "at least 9", "less than 9", "more than 9"). `quick`, choice input.
  - `graph-inequality` — a displayed inequality answered by the graph it produces, named as
    its two features: an open or closed circle, and which way the shading runs. Choice input.
  - `solve-one-step-ineq` — one operation undone, answered by the whole resulting relation.
    Choice input.
  - `solve-multi-step-ineq` — two operations undone in the right order. Choice input.
  - `flip-the-sign` — the major wall. Multiplying or dividing by a negative reverses the
    relation, so the answer must carry the direction. Choice input.
  - `compound-inequalities` — how many whole numbers in a stated range satisfy an `and`, an
    `or`, or a `between` statement. Numeric keypad; the answer here genuinely is a value.
- **A `Relation` type** (`<`, `>`, `≤`, `≥`) beside the existing `Operator`, so a relation is
  one named thing rather than a string each generator spells for itself.
- **Six new `EquationData` arms**, one per question shape, each carrying only quantities the
  statement puts on screen and never the answer — the rule that union already states.
- **The `equation` display arm's documentation is corrected**, not its shape. It already
  makes `variable` optional for an answer that is not a value of anything, and
  `special-solutions` already answers one through choice input. What its doc still claims —
  that such a statement is "answered by the value of `variable` that makes it true" — stops
  being true here. Unit 15 is the second kind of statement the arm holds. Its five
  choice-answered skills omit `variable` and draw no frame; `compound-inequalities` declares
  one, because its answer *is* a value of what the label names and a keypad with no slot echoes
  nothing the learner types.

**No new capability.** Stage E already declares `choice-input` — the correction 14b made —
so `AVAILABLE_CAPABILITIES` and `stage-e.ts`'s `requires` are both untouched, and the
derived-input-mode gate in `coverage.test.ts` stays green without an edit. No change to
`Answer`, `checkAnswer`, the keypad, the expression grammar, or `NumberLineSpec`.

## Capabilities

### New Capabilities

- `unit-15-inequalities`: the unit's six skills — what each displays, what it answers with,
  and how each draw is composed so its predicted mistakes are reachable and distinct.

### Modified Capabilities

- `problem-generation`: an equation display may state an inequality rather than an equality,
  carrying inequality source data for independent verification, and its derived answer may be
  a solved relation, a description of its graph, or a count of what satisfies it.

## Impact

- `src/curriculum/unit-15-inequalities.ts` (new) — six generators.
- `src/curriculum/unit-15-inequalities.test.ts` (new) — per-skill independent tests and the
  unit's recorded-output gate.
- `src/curriculum/index.ts` — the unit registered in the generator registry.
- `src/lib/types.ts` — a `Relation` type; six `EquationData` arms; the `equation` display
  arm's doc corrected to name the second kind of statement it holds.
- `src/curriculum/recorded-output.ts` — `formatEquationData` gains the six arms, so every
  new question shape reaches the snapshot rather than being silently unrendered.
- `src/curriculum/generators.test.ts` — `expectedEquation` gains the six arms, rebuilding each
  statement's text and deriving each answer from carried values alone. `sourceMagnitude`
  already branches on the `equation` display kind and delegates there, so the new arms need no
  branch of their own — but each must return values that actually widen with difficulty, which
  the type check cannot force.
- `src/curriculum/coverage.test.ts` — Unit 15's implemented list, the playable count in every
  case that states it, Stage E complete, and the committed unlock-graph snapshot in
  `src/curriculum/__snapshots__/coverage.test.ts.snap`, which is keyed on built skills and
  gains six entries.
- `docs/curriculum.md` — six ✅ markers, which the manifest cross-check enforces.
- `docs/roadmap.md` — item 21's checkbox closes, increment `15` records what it found, and
  the status paragraph moves to Stage E complete.

No change to the manifest: all six skills and their blurbs are already transcribed in
`stage-e.ts`, and a skill ships by gaining a generator.

## Non-goals

- **A rendered inequality graph on a number line.** Deliberately declined, not forgotten: it
  is capability work with exactly one consumer in the whole course, and item 22's plane does
  not subsume it. If it is ever wanted it is its own roadmap item, and the roadmap should
  record the decline rather than leave the fork open.
- **Any change to `AVAILABLE_CAPABILITIES` or Stage E's `requires`.** Everything this unit
  needs has shipped, and Stage E already declares it.
- **Widening the expression grammar to admit relations.** `expression-input` parses integer
  coefficients, one variable, infix `+`/`-`, unary `-` and parentheses. Adding `<` to it is
  capability work, and 14b already refused to let capability work travel with its content.
- **Keypad answers for 15.3–15.5.** A boundary value alone hides the direction, and the
  direction is the entire content of the unit's wall.
- **Any Stage F work.** The coordinate plane is item 22 and Unit 16 is item 23.
