## Why

`src/lib/keypad.ts` implements and tests `allowNegative`, `allowDecimal` and `allowFraction`,
and nothing reaches them. `Lesson.tsx` renders `<Keypad>` with no flags and calls
`applyKey(prev, key)` with no rules, so all three are dead code. Three separate stages are
blocked behind that one omission: Stage C cannot answer `add-two-negs`, `mult-negatives`,
`div-negatives` or `negatives-mixed` at all without a minus key, Unit 8 needs the fraction
slash, and Unit 9 needs the decimal point.

The same submit path also collapses two of `checkAnswer`'s four results into one. A
numerically-right but unreduced entry returns `'not-simplified'` and is shown as a plain wrong
answer with the full worked solution — but partial simplification is the named wall at
`simplify-fractions` (7.7), so that is the teachable moment Unit 7 is built on, thrown away.
And `'unparseable'` becomes newly reachable the moment `-` and `/` are on the pad: a learner
who has typed `5/` and taps Check has not made a mistake, they have not finished typing, and
the current code answers that with "Not quite — let's look together".

## What Changes

- A problem carries `keypad?: KeypadRules`. Omitting it means whole digits only, which is what
  every one of the ten built generators wants, so no existing generator changes.
- `Lesson.tsx` passes those rules to both `applyKey` and `<Keypad>`, so the pad shows a key
  only when the problem's rules permit it and entry enforces the same rules.
- `Lesson.tsx` stops collapsing `checkAnswer`'s results. `'not-simplified'` becomes its own
  response — the value is acknowledged as right, the learner is asked to reduce it, and the
  worked solution is not spoiled. `'unparseable'` returns the learner to the pad without
  costing an attempt or counting as a wrong answer.
- **Scope note, stated rather than implied:** no skill in the course declares keypad rules
  after this change and none declares `requireSimplified`. This is capability work with no
  content consumer yet, so the proof is component-level and unit-level tests; driving the real
  app checks that today's whole-number lessons are unchanged, not that the new keys appear.

## Capabilities

### New Capabilities

- `answer-entry`: how a learner enters an answer and what the lesson does with each result of
  checking it — which keys a problem permits, that entry and display enforce the same rules
  from one source, and that a right-but-unreduced answer and an unfinished entry are each
  answered on their own terms rather than as a plain miss.

### Modified Capabilities

None. `problem-generation` states the contract a generator meets when it computes a problem;
what the learner may type to answer it has never been specified anywhere, so this is new
surface rather than an amendment. `skill-progression`'s *Lessons end on correct answers, never
on failure* stays true unchanged: an unreduced answer still does not advance the count and
still re-queues, and an unparseable entry is not an answer at all.

## Impact

**In scope — capability work, no curriculum stage or unit, no skill ids.** The consumers this
unblocks, named for traceability and deliberately not built here: `negatives-numberline` (6.1)
through `negatives-mixed` (6.9) in Stage C, `simplify-fractions` (7.7) in Unit 7, Unit 8's
fraction arithmetic, and `compare-decimals` (9.3) in Unit 9.

**Code**

- `src/lib/types.ts` — `Problem` gains an optional `keypad` field. `KeypadRules` is imported
  from `src/lib/keypad.ts`, which is where it already lives; it is not redefined.
- `src/components/Keypad.tsx` — its three boolean props become one `rules` object, and the pad
  applies that object itself rather than emitting bare key names for the lesson to interpret.
  Same keys, same behaviour; one owner instead of two.
- `src/components/Lesson.tsx` — hand the problem's rules to the pad; replace `submit`'s
  two-way branch so all four check results are handled, and add the two new responses.
- `src/lib/submit.ts` — new. What the lesson does with each check result, stated once, keyed on
  the status union so a missing branch is a compile error.
- Tests: `src/lib/keypad.test.ts` and `src/lib/answer.test.ts` already cover the rules and the
  statuses at their source, and neither changes. What is new is coverage of the pad against a
  set of rules (static rendering, node environment, no new dependency) and of the response
  policy against each status. `Lesson.tsx` itself stays untested — the repository has no DOM
  test environment and this change does not add one; see design.md for why, and for the one
  seam that leaves uncovered.

**No new capability in the `Capability` union and no change to `AVAILABLE_CAPABILITIES`.** The
keypad rules ride on the problem, not on a stage gate, which is what lets Stage C ship its
eight keypad-answerable skills without waiting on the number line.

**Sync:** none. `KeypadRules` lives on `Problem`, which is generated at runtime and never
stored, so `SkillProgress` and the sync blob are untouched.

## Non-goals

- **No generator declares rules here.** Adding `keypad: { allowNegative: true }` to a skill is
  part of that skill's own change (roadmap items 14, 19), not this one.
- **No choice input.** `problem.choices` is still never rendered; that is roadmap item 5.
- **No `requireSimplified` on any answer.** The `not-simplified` response is built and tested
  here; the first skill to trigger it is `simplify-fractions` in Unit 7.
- **No change to `maxLength`.** `applyKey` defaults it to 10 and nothing needs otherwise yet.
- **No KaTeX.** A fraction entered as `3/4` stays plain text on the pad and in the entry line.
  Rendering fractions properly is roadmap item 17.
- **No quick-lesson length, warm-up, or silent recovery.** Those are roadmap item 4.
