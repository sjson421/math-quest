## Context

See proposal.md — Why. What shapes the approach is three facts about the current code.

`applyKey(value, key, rules)` in `src/lib/keypad.ts` already implements every rule and is
already tested. `checkAnswer` in `src/lib/answer.ts` already returns all four statuses and is
already tested. Nothing is missing at the bottom of the stack; what is missing is the wiring,
and `Lesson.tsx` is the only place it is missing from.

`Keypad.tsx` takes `allowFraction`, `allowNegative`, `allowDecimal` as three separate optional
booleans, defaulted to `false` — a second copy of the same shape `KeypadRules` already
describes.

The repository has **no component tests and no DOM test environment**. `vite.config.ts` sets
`test.environment: 'node'` and `test.include: ['src/**/*.test.ts', 'api/**/*.test.ts']` —
`.tsx` is not even matched. Every existing test targets a pure function in `src/lib/`,
`src/curriculum/`, or `api/`. That is a deliberate shape, not an oversight, and this change
should not be the one that quietly reverses it.

## Goals / Non-Goals

**Goals:**

- Leave one owner of a problem's entry rules, so what the pad shows and what entry accepts
  cannot disagree without someone deliberately introducing a second copy.
- Keep the four `CheckResult` statuses distinguishable all the way to the learner, and make a
  fifth one impossible to forget.
- Add coverage without adding a DOM test environment or a test dependency.

**Non-Goals:**

- Generalising `Misconception.value: number`. `diagnose()` does `Number(raw)`, so a fraction or
  decimal entry silently yields no diagnosis. That is real, it is roadmap item 20's problem,
  and it does not bite yet: no skill declares fraction or decimal rules after this change.
- Any change to `maxLength`, to `checkAnswer`, or to `applyKey`. All three are correct and
  already covered; this change consumes them rather than touching them.
- Rendering `problem.choices`, which is roadmap item 5.

## Decisions

### `Problem` carries `keypad?: KeypadRules`, imported rather than restated

`src/lib/types.ts` gains `keypad?: KeypadRules` on `Problem`, importing the type from
`src/lib/keypad.ts`. Optional, so all ten built generators are untouched and nothing about
their behaviour changes.

*Alternative considered:* declaring the rules on `SkillGenerator` instead. Rejected — a skill
can want different entry per problem (a mixed-practice skill where only some answers are
negative), and more immediately, Unit 6 has skills whose answers are sometimes negative and
sometimes not. Per-problem is the strictly more capable placement at the same cost.

*Alternative considered:* deriving the rules from `problem.answer` (negative value ⇒ allow the
sign). Rejected — it leaks the answer into the pad. A problem whose answer happens to be
positive would hide the minus key, telling the learner the answer is positive before they have
worked it out.

*Direction of the import:* `types.ts` importing from `keypad.ts` rather than the reverse. The
alternative is moving `KeypadRules` into `types.ts`, which is where the other shared shapes
live. Rejected as churn: `keypad.ts` is where the rules are interpreted, `KeypadRules` is its
own vocabulary, and moving it would touch a tested file for no behavioural reason.

### `Keypad` takes one `rules` object and applies it itself

`Keypad`'s three boolean props collapse into `rules?: KeypadRules`, and `Keypad` — not
`Lesson.tsx` — makes the `applyKey` call:

```tsx
// Keypad
const press = (k: string) => { tap(); onEntry((prev) => applyKey(prev, k, rules)) }

// Lesson
<Keypad value={entry} onEntry={setEntry} onSubmit={submit} rules={problem.keypad} />
```

This is what makes the spec's *What the pad shows and what entry accepts are one rule* true by
construction rather than by discipline. The first draft of this design had `Lesson.tsx` hold
the rules and hand the same object to two consumers, which is better than three booleans but
still a convention someone has to keep: two call sites, one object, nothing stopping a later
edit from passing a different value to one of them. With the pad owning both uses there is one
consumer, and the seam shrinks to a single prop expression.

`Keypad` still emits a functional update rather than a string, so the property its existing
comment protects is untouched: two taps landing in the same React render each apply to the
value the previous one produced, instead of both reading the same stale state and dropping a
digit. `onKey: (key: string) => void` becomes `onEntry: (apply: (prev: string) => string) =>
void`, which `setEntry` satisfies directly.

A missing declaration already means whole digits only — `applyKey` defaults every flag to
`false` in its destructuring — so `undefined` needs no special handling anywhere.

*Alternative considered:* having `Keypad` emit the next string outright
(`onChange: (next: string) => void`). Rejected — that is exactly the stale-read bug the
component's comment documents.

### The response to each status is a table in `src/lib/`, not a branch in the component

A new `src/lib/submit.ts` exports the policy as a `Record<CheckResult['status'], …>`: for each
status, whether the correct count advances, whether an attempt is recorded and as what, whether
the problem re-queues, whether the worked solution is shown, and whether the entry is cleared.
`Lesson.tsx` reads that instead of holding a four-way branch.

Keying the record on the status union is the substantive part, not the indirection. The defect
this change exists to fix is a *missing branch* — `Lesson.tsx` handles `correct` and treats the
other three as one — and a `Record` over the union makes the next missing branch a compile
error rather than a silent collapse. A `switch` inside the component would not, and neither
would a lookup written as a plain object literal.

It also puts the policy where a node test can reach it, which is how the rest of the repository
is built: decisions live in `src/lib/`, components stay thin. The spec's scenarios for the two
new statuses map one-to-one onto assertions about that record.

*Alternative considered:* adding jsdom and `@testing-library/react` and testing `Lesson.tsx`
directly. Rejected. Two new dev dependencies and a test-environment split, to cover a change
whose logic is a handful of lines, in a repository that has deliberately kept every test on
pure functions in a node environment. `AnimatePresence` is also poorly suited to a synthetic
DOM: AGENTS.md already records that without a live `requestAnimationFrame` loop an exit
animation never completes and screens never swap, and a synthetic DOM has the same gap the
hidden preview pane does.

### `Keypad` is covered by static rendering, in the node environment, with no new dependency

`react-dom/server`'s `renderToStaticMarkup` runs in node against the `react-dom` already in
`dependencies`. `Keypad` is presentational — props in, markup out, no store, no effects — so
rendering it to a string and asserting which keys are present, and in what order, is a direct
test of the spec's *The pad offers exactly the keys the problem permits*, including that the
digit keys keep their positions. The pad is a source-ordered grid, so order in the markup is
position on screen.

This costs one line in `vite.config.ts`: `test.include` gains `src/**/*.test.tsx`. It does not
change `test.environment`, does not add a dependency, and does not open the door to rendering
stateful components — a component with hooks and a store will simply not render this way, which
is a useful boundary rather than a limitation.

**Verified during the audit rather than assumed.** A throwaway probe rendered the current
`Keypad` through `renderToStaticMarkup` under `environment: 'node'` with `@vitejs/plugin-react`
and passed four assertions, including the negative ones — no sign key without `allowNegative`,
no decimal key when `allowFraction` also set. `npm run build` was clean with that `.test.tsx`
present inside `src`, so importing `react-dom/server` there does not breach the browser-types-only
invariant in AGENTS.md. The probe was deleted; nothing from it remains in the tree.

### `not-simplified` is a wrong answer that is answered differently, not a new lesson state

The bottom panel already exists for a wrong answer: warm butter background, a heading, a line
of text, the numbered solution, a dismiss button. The right-value-wrong-form response is the
same panel with the solution list omitted and a heading that acknowledges the value first — the
learner did the arithmetic.

Everything below the presentation stays identical to a miss: the attempt is recorded as
incorrect, the count does not advance, the problem re-queues about three places back, and the
button still reads *Got it*. That is deliberate. `skill-progression`'s baseline says an
incorrect answer re-queues so a lesson cannot complete without eventually answering every
problem correctly; treating this as a fourth lesson state with an immediate retry would amend
that requirement, and this change claims to amend nothing. An earlier draft of this design had
the button read *Try again*, which implied an immediate retry the re-queue does not give — a
smaller version of the same mistake, corrected here.

Omitting the solution is the substantive part, and it is a requirement rather than a styling
choice: showing the working hands back an answer the learner already reached and removes the
step they still have to take.

### `unparseable` does not take over the screen

A half-typed entry is not an event; it is the learner not having finished. The pad stays up,
the entry stays as typed, and a short line appears above the pad saying the number is not
finished. It clears on the next key press. No attempt is recorded, nothing re-queues, no
animation plays.

*Alternative considered:* disabling the Check button until the entry parses. Rejected — the
button is already disabled on an empty entry, and extending that to "does not parse" means the
button goes dead mid-typing with no explanation, which is the more confusing failure. A message
that names the problem is kinder than a control that stops responding.

## Risks / Trade-offs

**One seam has no automated test: whether `Lesson.tsx` passes `problem.keypad` to the pad at
all** → Shrunk rather than eliminated. With the pad owning both uses of the rules, the untested
surface is a single prop expression instead of two call sites that have to agree; TypeScript
catches the wrong *type* there, and the browser check in the task list catches the pad rendering
wrongly. Stated here rather than papered over, because the alternative — a DOM environment to
cover one expression — costs more than it buys.

**Widening `test.include` to `.tsx` invites future component tests the environment cannot
support** → The environment stays `node`, so a test that needs a DOM fails immediately and
loudly rather than passing by accident. The constraint enforces itself.

**The new behaviour has no consumer in the course yet** → Accepted and stated in the proposal.
Every generator built so far answers with whole digits and none sets `requireSimplified`, so
the learner sees no difference today. The tests are the proof; the browser check confirms the
absence of a regression, not the presence of a feature. Trying to manufacture a demonstration
would mean adding content, which belongs to the units that need it.

**`diagnose()` cannot read a non-scalar entry** → Out of scope, named above, and not reachable
until a skill declares fraction or decimal rules. Recorded here so the first change that does
declare them finds this written down rather than discovering it.
