## Why

Stage B has taught four operations one at a time and never once asked which to do first. Unit
5 is the three skills that close the stage, and the first place in the course where reading an
expression left to right gives the wrong answer.

It also forces a question every earlier unit was able to avoid. Independent verification
parses an inline display as exactly two operands and one operator, and `3 + 4 × 2` is neither.
That parser is the single check standing between the course and a wrong answer key, so the
unit cannot be written without widening it — and widening it is cheaper now, against three
skills whose answers are plain arithmetic, than later against Unit 12's exponents.

## What Changes

**Scope: Stage B · Unit 5 · Order of Operations.** Skill ids, verbatim from
`docs/curriculum.md`: `two-operations` (5.1, wall — the left-to-right instinct),
`with-parentheses` (5.2), and `pemdas` (5.3, full order of operations, no exponents).

- Add all three generators in curriculum order, with measurable difficulty ladders, answers
  computed from the operands each generator just chose, seeded reproducible output, and
  non-negative whole-number answers on the existing keypad.
- **Widen independent verification from a binary expression to a full one.** The
  recomputation of an inline display evaluates operator precedence and parentheses over a
  displayed expression of any length, instead of matching two operands around one operator.
  Every existing two-operand display stays verifiable through the same path.
- **Carry no new machine-readable display data.** Unit 4 added `wholeNumber` because `47 ÷ 5`
  displays a division whose answer is a *property* of it. A Unit 5 answer **is** the value of
  the expression displayed, so it is re-derived by evaluating what the learner sees. Carrying
  an expression tree and rendering it back would check the generator against itself.
- Build, render and evaluate expressions **inside the unit file**, not in `engine/`. Every
  consumer is a Unit 5 skill, and Unit 4's number theory sets the rule: a helper reaches the
  engine when a second unit needs it, or later units inherit shapes guessed at from this one.
- **Render parentheses only where precedence requires them**, derived from the expression
  rather than stored as a flag. That makes `with-parentheses` structurally honest: brackets
  appear exactly when removing them would change the answer, so the skill can never present a
  problem whose parentheses do nothing.
- **Compose operands so every intermediate and predicted value is a non-negative whole
  number.** A subtraction that would go negative or a division that would leave a fraction is
  built out of reach rather than drawn and rejected, which is what Unit 2 learned when a
  three-property filter exhausted its attempts in front of a learner.
- Predict, per skill: the other bracketing of the same expression (left-to-right where the
  higher-precedence operation sits second, right-to-left where it sits first), the
  higher-precedence step answered on its own, the expression evaluated as though its
  parentheses were absent, the bracketed value answered on its own, strict left-to-right
  across every operator, and PEMDAS misread as six ordered steps rather than three tiers —
  multiplication before division and addition before subtraction. The wall keeps two distinct
  diagnoses on **every** problem after the central collision filter, not on average.
- **Close Stage B, which makes it the second stage that can be completed.** Unit 5 is the last
  of its 44 skills, so the stage checkpoint built in roadmap item 9 becomes reachable there for
  the first time. Nothing about checkpoints changes — the rule already walks the manifest and
  fails on a planned skill — but one test asserts today that mastering everything playable in
  Stage B is *not* its boundary, and that premise stops being true here.
- **Re-derive the inline size ladder against a measured 375px row.** `ProblemView` sizes an
  inline display by character count in two steps today, and the step from 7 characters to 20
  is too coarse: measured as a whole row — expression, equals sign, and an answer slot that
  grows in `em` as the learner types — everything from 8 characters up overflows a phone.
  That is a **pre-existing defect**, and four shipped skills sit in it. Unit 5's expressions
  cannot be drawn short enough to avoid the range, so the ladder is re-derived for every
  length and the affected shipped displays move down a size, which is what stops them
  wrapping. `read-numbers` is left alone: 27 characters of words wants wrapping, not shrinking.
- Mark Unit 5 built in `docs/curriculum.md`, tick roadmap item 12, restate the roadmap's
  progress line, and keep the active-change note in `AGENTS.md` accurate until archive.

### Non-goals

- **No new capability.** `AVAILABLE_CAPABILITIES` is untouched and Stage B's `requires` is
  unchanged — Unit 5 answers entirely on the keypad already built. Number-line, expression,
  coordinate and chart input all remain later roadmap items.
- **No exponents.** `docs/curriculum.md` places them at 12.10, and the P and E of PEMDAS
  cannot both be taught here without a forward reference the content contract exists to stop.
- **No negative values anywhere** — not as an answer, not as an intermediate, and not as a
  predicted misconception. Negatives are Unit 6, one unit ahead.
- **No fractions or decimals.** A division inside an expression divides exactly, by
  construction. Decimals arrive in Unit 9.
- No word problems. Unit 5 declares none in the curriculum document, so no frame bank is
  added and `word-problem-phrasing` is untouched.
- No expression *input*. The learner reads an expression and types a number; typing an
  expression is roadmap item 20, gated on Unit 13.
- Existing Unit 0–4 output is not reworded or re-recorded. Every recorded snapshot stays
  byte-identical.
- The expression model covers what Unit 5 displays. It is not generalised toward variables,
  exponents or arbitrary depth on speculation.

## Capabilities

### New Capabilities

None. This is Stage B content on the input surface that already ships.

### Modified Capabilities

- `problem-generation`: require independent verification of a displayed expression with more
  than one operation, evaluated under operator precedence and parentheses rather than as a
  binary fold; require a displayed expression to show parentheses only where they change its
  value; require all three Stage B Unit 5 skills to resolve as playable generated content
  with every intermediate and predicted value a non-negative whole number.

## Impact

- `src/curriculum/unit-05-order-of-operations.ts` is new and holds the unit's three
  generators plus the expression building, rendering and evaluation they share;
  `src/curriculum/unit-05-order-of-operations.test.ts` and its snapshot are the wording gate.
- `src/curriculum/index.ts` registers the unit — one import and one spread.
- `src/curriculum/generators.test.ts` replaces its two-operand inline regex with an
  independently written precedence-and-parentheses evaluator, and keeps its habit of a
  synthetic case proving the checker names an offender rather than passing quietly.
- `src/components/ProblemView.tsx`'s inline size ladder is re-derived from a measured row;
  `ProblemView.test.tsx` pins each measured length to the size it was measured at, and
  `coverage.test.ts` re-runs the measurement over every built skill so a later unit that
  widens a display fails there rather than on a phone. Four shipped displays move down a size.
  No other component changes.
- Closing Stage B moves assertions that count what is playable. `src/lib/checkpoint.test.ts`
  loses the premise behind its Stage B case and must keep the property under test rather than
  drop it; `src/curriculum/coverage.test.ts` moves 49 to 52, 152 to 149, five built units to
  six, and re-records the unlock-graph snapshot; `src/lib/course.test.ts` pins `unit-5` as the
  last built unit. None of these is a behaviour change — they are the count catching up.
- `docs/curriculum.md` marks Unit 5 built, which the manifest cross-check enforces;
  `docs/roadmap.md` ticks item 12 and restates its progress line; `AGENTS.md` tracks the
  active change until archive.
- `src/curriculum/engine/`, `src/lib/types.ts`, the manifest, `AVAILABLE_CAPABILITIES`, the
  keypad, the progress record, the sync endpoint, and every other component stay unchanged.
