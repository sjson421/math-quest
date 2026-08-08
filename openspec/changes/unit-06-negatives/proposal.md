## Why

Every number the course has produced so far has been at or above zero, and the four
arithmetic units were each drawn so it stayed that way. Unit 6 is where that ends: it is the
gate to all algebra, nothing in it is optional, and `sub-negatives` is the major wall of the
whole stage.

Going below zero is not only new content. It is the first time a *value* carries a sign
rather than an operator, and three pieces of already-shipped machinery turn out to have been
built for a course that never did that — the recorded-output gate does not render the two
fields a signed problem sets, the answer slot echoes a typed sign in a different glyph from
the one the problem above it uses, and `absolute-value` has no display the independent
verifier can read at all. Each is cheap to fix here against nine skills whose arithmetic is
plain, and expensive to fix later against Unit 8's fractions.

## What Changes

**Scope: Stage C · Unit 6 · Negative Numbers.** All nine skill ids, verbatim from
`docs/curriculum.md`: `negatives-numberline` (6.1, `quick`), `compare-negatives` (6.2, wall —
"bigger digit means bigger number"), `add-neg-pos` (6.3, wall — "added the magnitudes, kept
the sign"), `add-two-negs` (6.4), `sub-negatives` (6.5, **major wall** — minus a minus),
`mult-negatives` (6.6), `div-negatives` (6.7), `absolute-value` (6.8), and `negatives-mixed`
(6.9, interleaved review).

- Add all nine generators in curriculum order, with measurable difficulty ladders, answers
  computed from the operands each generator just chose, and seeded reproducible output.
- **Use the two input modes Stage C already declares, and add none.** `negatives-numberline`
  is the first skill anywhere to declare a number line — the capability shipped in roadmap
  item 13 unlocking nothing, and this is the content it was built for. `compare-negatives`
  answers on the choice control. The other seven answer on the keypad.
- **Offer the sign key on a problem whenever a negative value is a plausible answer to it** —
  the correct answer or a predicted mistake — rather than only when the correct answer is
  negative. `docs/roadmap.md` item 14 asks for the narrower rule, and the narrower rule
  cannot be reconciled with the content contract: `docs/curriculum.md` names 6.3's wall as
  "added magnitudes, kept sign", which for `−3 + 5` is `−8`; the major wall at 6.5 has
  exactly one enterable wrong answer without a sign key while a wall must carry two distinct
  surviving diagnoses on **every** problem; and `absolute-value`'s only real mistake is
  keeping the sign. A pad that withholds the key does not merely fail to record those
  answers — it tells the learner the answer is not negative, at the three skills where that
  is the question. Stated plainly: every Unit 6 problem answered on the pad ends up offering
  the sign. The declaration stays per problem, as `answer-entry` requires, and item 14's
  wording is corrected in this change so the two documents stop disagreeing.
- **Echo a typed answer the way the problem above it reads.** The pad's sign key is labelled
  `−` and emits `-`, and the answer slot shows the raw entry — so a learner typing minus
  eight under a display reading `−3 + −5` sees `-8`. That is the control disagreeing with
  itself about what it just did, which is the exact defect `placedLabel` was written to
  prevent for the number line. The same round trip is applied to the pad's entry.
- **Give a distance-from-zero problem a display the verifier can read.** `|−7|` is not
  arithmetic and the independent evaluator throws on it; a bare `−7` display would recompute
  to −7 against an answer of 7. `absolute-value` therefore carries its value and the
  requested operation in machine-readable form, exactly as `divide-remainder` does, and
  verification takes the magnitude rather than evaluating the display.
- **Render the two fields a signed problem sets.** The per-unit wording gate records ten
  problem fields and fails on an eleventh, and neither `keypad` nor `numberLine` is among
  them — no shipped generator has ever set either. Unit 6 sets both, so both are recorded.
  Without this the snapshot would not protect the per-problem sign declaration, which is this
  unit's central job.
- Build the unit's shared shapes — signed rendering, the arithmetic, and the mistakes each
  operation invites — **inside the unit file**, not in `engine/`. Every consumer is a Unit 6
  skill. Unit 4's number theory and Unit 5's expressions both set this rule: a helper reaches
  the engine when a *second unit* needs it, or Unit 13's variables inherit a shape guessed at
  from negatives.
- **Compose operands so nothing collapses.** A predicted mistake whose value equals the
  answer is filtered centrally and silently, so a wall can ship diagnosing nothing. Every
  draw here excludes the operand pairs where a prediction would land on the answer or on
  another prediction, rather than relying on it being unlikely.
- Predict, per skill: counting the right distance on the wrong side of zero and counting the
  zero itself; the comparison reversed and the values called equal; the magnitudes added with
  the first sign kept, and the right magnitude with the wrong sign; the signs dropped
  entirely and the magnitudes subtracted instead of added; two minus signs read as one and
  the whole answer negated; the sign rule inverted and the wrong operation run; and the sign
  kept where distance was asked for.
- **Open Stage C, which makes it the third stage that can be completed.** Unit 6 is its only
  unit and its nine skills are all of it, so a checkpoint fires at 6.9. Nothing about
  checkpoints changes — the rule already walks the manifest — but the test that asserts
  today that the number line unlocked *nothing* has Stage C as half its premise, and that
  half stops being true here.
- Mark Unit 6 built in `docs/curriculum.md`, tick roadmap item 14 and correct its sign-key
  wording, and restate the roadmap's progress line.

### Non-goals

- **No new capability.** `AVAILABLE_CAPABILITIES` is untouched and Stage C's `requires` is
  unchanged — `choice-input` and `number-line` are both already built and already declared.
  KaTeX, diagrams, expression input, the coordinate plane and charts all remain later
  roadmap items.
- **No fractions or decimals.** Every Unit 6 value is a whole number, positive or negative.
  A negative line of thirds is expressible in `NumberLineSpec` and is Unit 7's business.
- **No negative operands in Units 0–5.** Their draws stay as they are, and every recorded
  snapshot outside Unit 6 stays byte-identical.
- **No Stage D content**, and no generator for any skill that declares a capability Stage D
  needs.
- **No promotion into `engine/`.** Unit 6's helpers stay unit-private until a second unit
  asks for them.
- **No word problems.** Unit 6 declares none in the curriculum document, so no frame bank is
  added and `word-problem-phrasing` is untouched.
- **No change to the manifest.** Stage C's nine entries, their `quick` and `wall` flags, and
  their prerequisite edges are already correct; a skill ships by gaining a generator.
- **No re-lock and no unlock-rule change.** The unlock graph gains edges because Stage C
  becomes playable, which is the existing derivation catching up, not a new rule.
- **No `parseInput` change.** The checker already reads `-8`; only what is *shown* changes.

## Capabilities

### New Capabilities

None. This is Stage C content on input surfaces that already ship.

### Modified Capabilities

- `problem-generation`: require a displayed value to be answerable for its distance from zero
  through carried display data rather than by evaluating the display; require a problem whose
  displayed values or predicted mistakes carry a sign to remain independently verifiable and
  to render that sign the way the rest of the screen does; require the per-unit wording gate
  to record every field a generator sets, including the answer-entry declaration and the
  declared number line; require all nine Stage C Unit 6 skills to resolve as playable
  generated content.
- `answer-entry`: change when a problem declares that a sign may be entered — from "its
  answer is negative" to "a negative value is a plausible answer to it, correct or
  predicted"; add that the answer slot echoes a typed entry in the notation the problem uses,
  so the sign the learner reads back is the sign they see in the problem.

## Impact

- `src/curriculum/unit-06-negatives.ts` is new and holds the nine generators plus the signed
  rendering, arithmetic and mistake shapes they share;
  `src/curriculum/unit-06-negatives.test.ts` and its snapshot are the wording gate, with an
  independently written reader for the unit's displays.
- `src/curriculum/index.ts` registers the unit — one import and one spread.
- `src/lib/types.ts` gains one `WholeNumberData` variant for distance from zero. No other
  type changes; `Problem.keypad` and `Problem.numberLine` already exist and are used as
  declared.
- `src/curriculum/recorded-output.ts` renders `keypad` and `numberLine` and adds both to the
  keys the gate requires — which is what makes the per-problem sign declaration reviewable.
- `src/curriculum/generators.test.ts` gains a distance-from-zero branch in its independent
  recomputation and its expected-display derivation, and derives a compared display's minus
  sign itself rather than sharing the generator's. Its expression evaluator is already
  written for signed literals and is unchanged.
- `src/lib/keypad.ts` gains the label for a typed entry, beside the rule that produced it;
  `src/components/Lesson.tsx` uses it in the keypad branch of the entry it shows. The pad,
  the checker, and what is submitted are all unchanged.
- Opening Stage C moves assertions that count what is playable.
  `src/curriculum/coverage.test.ts` moves 52 to 61 and 149 to 140, six built units to seven,
  two built stages to three, narrows its "the number line unlocked nothing" case to Stage D,
  and re-records the unlock-graph snapshot. `src/lib/course.test.ts` moves the last built
  unit from `unit-5` to `unit-6`. None is a behaviour change — they are the counts catching
  up. `src/lib/checkpoint.test.ts` *gains* a Stage C case rather than correcting one: its
  Stage B case is still true and its part-built case is synthetic.
- `docs/curriculum.md` marks Unit 6 built, which the manifest cross-check enforces;
  `docs/roadmap.md` ticks item 14, corrects its sign-key wording, and rewrites a status
  paragraph that currently states three things this change falsifies; `docs/workflow.md`
  names the active change until it archives.
- `src/curriculum/engine/`, `src/curriculum/manifest/`, `AVAILABLE_CAPABILITIES`,
  `src/components/Keypad.tsx`, `src/components/NumberLineInput.tsx`, `src/lib/answer.ts`,
  `src/lib/number-line.ts`, the progress record and the sync endpoint all stay unchanged.
