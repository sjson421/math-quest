## Context

See proposal.md — Why. The constraints that shape the approach, all verified in the tree:

- **`inputMode` is switched on, never exhausted.** Every site reads `=== 'choice' ? … : …`
  (`src/components/Lesson.tsx`, `src/components/ProblemView.tsx`). A third union member
  therefore compiles clean and silently falls through to the keypad. The type edit is the
  cheap part; finding and widening those branches is the work.
- **Component tests have no DOM.** `test.environment` stays `node` and coverage is
  `renderToStaticMarkup` — first paint only, no handlers attached (`docs/testing.md`). Any
  logic behind a tap is untestable inside a component, which is why `src/lib/keypad.ts` and
  `src/lib/submit.ts` exist. This dictates the file split, it is not a stylistic preference.
- **Exact rationals are already the currency.** `src/lib/rational.ts` reduces and compares
  exactly, `parseInput` accepts `"-3"` and `"3/4"`, and `Answer.kind: 'exact'` is a rational.
  Nothing about a number line needs a new answer shape.
- **`Problem.keypad` set the per-problem precedent** and is the working model for a second
  optional declaration: it is read by exactly one component, defaults to the old behaviour
  when omitted, and needed no change to the recorded-output gate because no generator sets it
  yet.

## Goals / Non-Goals

**Goals:**

- A number-line input mode that a generator can declare per problem, with the whole tick set
  derivable and exact.
- Placement and submission separated, so a mis-tap is recoverable and free.
- Every decision behind a tap reachable from a Node test.

**Non-Goals** (design-level; see proposal.md — Non-goals for scope):

- No shared abstraction over the three input modes. Two controls did not need one and three
  do not either; a premature `AnswerControl` interface would have to guess what the
  coordinate plane and expression pad want.
- No new geometry or measurement primitive. Positions are laid out by the existing flex/grid
  approach, not by computing pixel offsets from values.

## Decisions

### Ticks are `{ start, step, count }`, not `{ min, max, step }`

Tick *i* is `start + i × step`, computed in exact rational arithmetic. The alternative,
`{ min, max, step }`, has to divide `(max − min) / step` to learn how many ticks there are,
and a line divided into thirds then depends on that division landing on an integer. Under
`{ start, step, count }` the tick set is total by construction: any `count` is valid, every
tick is exact, and there is no arithmetic that can fail on a denominator.

Rejected also: an explicit `values: Rational[]`. It makes an unordered or unevenly spaced
line representable, which is not a number line, and it pushes the "is this really a line"
check into validation rather than out of existence.

### The submitted value is a `parseInput`-compatible string

A confirmed placement submits the tick's value formatted the way `rational.ts` already
formats one — `"-3"` for a whole number, `"3/4"` for a fraction — and that string goes into
the unchanged `checkAnswer`. This is the same discipline choice input uses when it submits a
stable id: one submission channel, one checker, one set of results for `submit.ts` to key on.

Rejected: submitting a `Rational` and widening `checkAnswer` to accept it. That splits the
checker into a typed path and a string path, and the string path is the one every existing
skill and the whole of `submit.ts` is built around.

Consequence, accepted deliberately: `diagnose()` reads the raw entry with `Number()`, so a
placed fraction produces `NaN` and matches no predicted misconception. Whole-number lines —
`negatives-numberline` (6.1), the near-term consumer — are unaffected. Generalising
`Misconception.value` past a scalar is the expression-input item's job, and pulling it
forward would mean redesigning misconception matching inside a capability change.

### Placement and submission are separate steps

A tap places; a confirm submits. Choice input can submit on tap because its controls are tall
and few. A line puts every tick in the same strip, so at phone width the targets are narrow
and adjacent, and tap-to-submit would convert an aiming slip into a recorded miss plus a
re-queue. The lesson already refuses to charge an attempt for something that is not yet an
answer — that is exactly what `unparseable` and `keepsEntry` mean in `src/lib/submit.ts` —
and an unconfirmed placement is the same situation reached by a different control.

The confirm is disabled until something is placed, mirroring the keypad's Check being
disabled on an empty entry, so "nothing placed" cannot become a submission at all rather than
becoming one the checker has to reject.

Rejected: submit-on-tap with an undo affordance. It inverts the cost — the learner pays the
attempt first and appeals afterwards — and it would need a way to retract a recorded attempt,
which nothing in the progress model supports.

### A tick is a button; the line is their arrangement

The control renders one labelled button per tick, laid out in a row and styled as a line.
This reuses the interaction model choice input already proved, gives assistive technology a
real control per position with the value as its label, and needs no pointer-coordinate maths
or hit-testing — which matters directly, because coordinate maths is precisely the kind of
logic a `renderToStaticMarkup` test cannot reach.

Each button's tappable area is the full height of the line strip, so the target is narrow but
tall rather than narrow and short. Labels are drawn on a subset when drawing all of them
would collide; the button and its accessible name stay on every tick regardless, so
"unlabelled" is a visual state and never a reachability one.

Rejected: an SVG line with a pointer handler mapping x to the nearest tick. Better looking,
worse in every other dimension — untestable in this suite, invisible to assistive technology
without rebuilding the semantics by hand, and it invites the drag interaction the proposal
rules out.

### Layout split: `src/lib/number-line.ts` + `src/components/NumberLineInput.tsx`

The pure module owns the tick set, the labels, and the submitted string. The component owns
markup and taps. This is the `keypad.ts` / `Keypad.tsx` arrangement, and for the same stated
reason: what is displayed and what is submitted must come from one derivation, or a line can
label a tick with one value and submit another — a divergence that looks exactly like a
broken control.

### The placed value is the lesson's existing entry

The control is stateless, like `Keypad`. A tap reports the placed tick upward and the lesson
holds it in the `entry` state it already keeps for a typed answer; confirming submits that
entry through the path a Check press already takes.

This is what makes "placed but not submitted" cost nothing to introduce: it is not a new
state at all, it is the state the lesson has always had between the first digit and Check.
The alternative — the control owning its placement — would put the value out of reach of the
entry slot, force a second submission channel, and make the confirm-enabled rule a private
detail of a component the test suite cannot execute.

### The entry slot shows a placed value as a number

`ProblemView`'s entry slot special-cases `choice` because a choice label is prose and needs
wrapping. A placed value is a number and wants the existing numeric slot, so number-line mode
takes that path — which falls out of the decision above, since the slot is already fed by
`entry`. This is a decision rather than a fall-through: the slot's `mode` check is rewritten
to name the modes that want the wide prose treatment, so a fourth mode has to choose rather
than inherit.

### `step` is positive; ticks ascend by construction

The spec requires positions to read left to right in ascending order. Rather than sorting
ticks or accepting a descending line and reversing it for display, the derivation rejects a
non-positive `step`. A descending number line is not a thing the course wants, and allowing
one would mean every consumer of the tick list has to remember which direction it came in.

## Risks / Trade-offs

- **Wide lines get cramped at 375px.** A 21-tick line leaves roughly 17px per tick, under the
  usual touch-target guidance. → Full-height tappable columns, label thinning, and a browser
  check at 375px as a task. The tick count is a generator's choice, so the capability's job
  is to stay honest about the constraint rather than to cap it; the near-term consumer is a
  `quick` skill whose lines can be short.
- **A third mode multiplies the branches a fourth must touch.** → Every branch this change
  widens is written to name its modes explicitly rather than falling through to a default, so
  the coordinate-plane item gets compile errors where it needs to make a decision.
- **A placement could look like a second submission channel.** → It is not: the placed value
  is the lesson's existing `entry`, and confirming runs the same `submit()` that a Check press
  runs, so the submission gate, the attempt recording and the re-queue policy all apply
  without a second copy. Nothing in `lesson.ts`, `submit.ts` or the progress record gains a
  state to reconcile.
- **A fraction placement is checked but not diagnosed.** Accepted above; it degrades a wrong
  answer to the generic wrong-answer path rather than breaking it, and it cannot be hit until
  Unit 7 ships a generator.
- **The capability unlocks nothing, so the test suite is the only proof it works.** → Hence
  the browser task: a control no skill declares can be verified end to end only by driving a
  problem that declares it.
