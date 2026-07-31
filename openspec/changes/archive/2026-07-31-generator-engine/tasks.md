## 1. Behaviour-preservation gate

Nothing else in this change may start until this exists. See design decision 4.

- [x] 1.1 `src/curriculum/unit-01-add-sub.test.ts` — sample the six generators at 5 seeds × 5 difficulties and snapshot whole `Problem` objects to `src/curriculum/__snapshots__/` — **150 problems, 1892 snapshot lines.** Rendered as a readable block per problem rather than JSON, so a reworded hint is a one-line diff. Two paired self-tests prove the formatter notices a reworded hint and a changed nudge, and a coverage test fails if `Problem` gains a field the formatter does not render
- [x] 1.2 Confirm the snapshot is stable across two runs, and commit it as its own step so every later diff is reviewable against a clean baseline — stable; `never` guards on the `Display` and `Answer` switches mean a new variant is a compile error rather than a silent gap

> **The snapshot is frozen for the duration of this change.** A diff in groups 2–5 is a
> regression, not a prompt to re-record. Only task 7.2 is permitted to extend it, and only
> by adding `add-words`.

## 2. Engine — the column trace and difficulty ladders

- [x] 2.1 `src/curriculum/engine/column.ts` — `columnTrace(a, b, op)` returning per-place digits, sums or differences, carries, borrows, and reduced/borrowed values — **`raw` and `total` are kept separate per place.** `add-2digit-carry` hints on the raw column sum exceeding 9 while `add-3digit` needs the sum with the carry folded in; one field could not serve both
- [x] 2.2 Tests: traces for a no-carry pair, a single carry, a cascading carry (`199 + 1`), a borrow, and a borrow across a zero; each assertion names the place that is wrong — plus a round-trip check that the digits written reconstruct the result, and `place()` naming the trace when a skill asks for a column it does not have
- [x] 2.3 `src/curriculum/engine/bands.ts` — `band()` plus named ladders for the ranges new skills will want — `SINGLE_DIGIT`, `TWO_DIGIT`, `THREE_DIGIT`; the latter two are the exact ranges `add-2digit-nocarry` and `add-3digit` already use, so those two adopt a named ladder with no behaviour change
- [x] 2.4 Tests: a ladder is monotonic, and a flat ladder is reported as flat — `ladderProblems()` also catches a ladder narrowing partway up, a dropping min, and an inverted band, each with a synthetic case proving it names the offender

## 3. Engine — draw, misconceptions, and the problem builder

- [x] 3.1 `src/curriculum/engine/draw.ts` — constrained operand draw over a band, wrapping `constrain` including the dependent-`b` form `sub-facts` and `sub-2digit-borrow` need
- [x] 3.2 Tests: a predicate that can never be satisfied fails with the skill named, not a bare throw — plus a test pinning that `a` is drawn before `b`, since the draw order is part of what a seed means and reversing it would repoint every recorded problem
- [x] 3.3 `src/curriculum/engine/misconceptions.ts` — `offByOne`, `wrongOperation`, `forgotCarry`, `flippedColumns`, `digitConcat`, each computed by place value from a trace — **corrected mid-task: not all of them are place value.** Carry and borrow errors are arithmetic and are computed as such; `digit-concat`, `wrote-full-ones` and `flipped-column` are *literally* concatenation errors — the learner writes each column's result side by side — so modelling them as arithmetic would have been wrong. The design's objection was to concatenation standing in for place value, which is a different thing
- [x] 3.4 Tests: `forgotCarry` at three digits reproduces `add-3digit`'s current `forgot-carry-ones` and `forgot-carry-tens` values, which is the case the string idiom could not express — **every factory is checked against the expression it replaces over an exhaustive sweep**, not just this one: all 2-digit pairs each skill's constraint admits, and 1000+ three-digit pairs. Also pins that 31 − 16 still collides two borrowing predictions into one, which is why the third exists
- [x] 3.5 `src/curriculum/engine/problem.ts` — the builder defaulting `skillId`, `inputMode` and `difficulty` — landed as `defineSkill()` wrapping the whole generator rather than a builder called inside it, which removes the three repeated fields outright instead of shortening them
- [x] 3.6 `src/curriculum/engine/index.ts` — the barrel a unit file imports

## 4. Move the six generators onto the engine

One at a time. Run the snapshot after each — a green snapshot is the definition of done.

- [x] 4.1 `add-facts` onto the engine, snapshot unchanged — keeps its own ladder rather than `SINGLE_DIGIT`; its ranges were chosen for counting-on and `sub-facts` next door needs different ones
- [x] 4.2 `sub-facts` onto the engine, snapshot unchanged — first user of `drawPair`'s `second` form
- [x] 4.3 `add-2digit-nocarry` onto the engine, snapshot unchanged — adopts the named `TWO_DIGIT` ladder, whose ranges are exactly the ones it already had
- [x] 4.4 `add-2digit-carry` onto the engine, snapshot unchanged — wall skill, `forgot-carry` and `wrote-full-ones` must both still survive central dedup
- [x] 4.5 `sub-2digit-borrow` onto the engine, snapshot unchanged — wall skill, all three of `flipped-column`, `forgot-to-reduce-tens` and `skipped-tens-subtraction` must survive; the third exists because the first two collide when the ones digits are five apart
- [x] 4.6 `add-3digit` onto the engine, snapshot unchanged — adopts `THREE_DIGIT`; note its carry predicate reads `place(t, 1).raw`, not `.total`, matching the original's pre-carry tens sum
- [x] 4.7 Confirm the six no longer contain a hand-rolled carry trace, band literal, or return-object skeleton, and that `digitAt` is gone from the unit file — **zero occurrences of `digitAt`, `constrain`, or the `` Number(`…`) `` idiom.** 230 lines removed, 196 added; the four `where` predicates now read as the skill's definition (`place(trace, 0).carry === 1`) rather than as digit arithmetic. Full suite 267 passing, up from 222

## 5. The story display

- [x] 5.1 `src/lib/types.ts` — `Display` gains `{ kind: 'story'; text; operands; operator }`, matching `column`'s operand fields — extracted the shared `Operator` union while here
- [x] 5.2 `src/components/ProblemView.tsx` — exhaustive switch over `Display`, with a story renderer; fix the fall-through that currently assumes `column` — **the design was wrong about why this matters.** It predicted adding a variant would be a compile error; it is not. Because `story` carries the same `operands` and `operator` names as `column`, TypeScript narrows the two together and the old `if (inline)` guard would have rendered a word problem as a stack of digits, silently. The `never` guard in the snapshot formatter was the only thing that caught the new variant at all
- [x] 5.3 `src/curriculum/generators.test.ts` — `recompute()` handles `story` through the same branch as `column`, and still throws on a display it cannot verify
- [x] 5.4 `src/lib/content-rules.ts` — `learnerText()` reaches story prose, so forward-reference checking covers it — this is the longest learner-facing string in the course and the likeliest to reach for a later unit's word, so omitting it would have exempted exactly the text the rule exists for
- [x] 5.5 Tests: a story problem whose stated answer disagrees with its carried operands is rejected by `recompute()` — three synthetic cases, including one where a distractor quantity in the prose would mislead any reader that parsed the sentence instead of the operands

## 6. The phrasing bank

- [x] 6.1 `src/curriculum/engine/phrasing.ts` — frame type carrying its sentence template and a function producing its misconceptions from the substituted quantities — values are computed centrally so every frame predicts the same three errors; only the nudges are per frame, since the wording is the one thing the sentence knows and the engine does not
- [x] 6.2 Seeded frame selection drawing from the generator's own `rng`, so a story is as reproducible as an operand pair — `pickFrame()` over `rng.pick`, which was already in the seeded stream and had no callers until now
- [x] 6.3 `src/curriculum/phrasing/addition.ts` — 8–12 addition frames, each predicting `wrong-operation`, `distractor-pair` and `answered-part` — **ten frames**, adult situations (shelving, inbox, crates, tickets, calls, market, driving, garden, pages, walking). Open question from design resolved at ten: eight is the floor for a ten-problem lesson not to repeat, and that floor is now asserted
- [x] 6.4 Static frame check: walk every frame in every bank, instantiate with fixed representative quantity sets, run `checkContent`, and name the offending frame and rule on failure — `storyProblem()` is shared with the generator rather than reimplemented, so the check verifies what a learner actually sees
- [x] 6.5 Tests: a deliberately over-long frame is caught by the static check even though no sampled problem drew it — the case sampling alone misses — four self-tests: over-long step, two-sentence hint, an empty hint hidden among nine good frames, and a forward reference in the story prose itself

## 7. `add-words`

- [x] 7.1 `src/curriculum/unit-01-add-sub.ts` — the `add-words` generator on the bank, `prerequisites: ['add-3digit']` (see design decision 9), registered in `unit01.skills` — **the generator is 20 lines**, of which 12 are comment. Draws on `TWO_DIGIT` deliberately: reading the situation is the work, so the arithmetic stays inside what Unit 1 already built
- [x] 7.2 Tests: `add-words` joins `generators.test.ts` by existing; extend the golden snapshot to include it — passed all nine contract assertions on the first run, including independent recomputation through the new story branch and the >20 distinct displays variety floor
- [x] 7.3 `docs/curriculum.md` — ✅ on row 1.8, which `curriculum-doc.test.ts` cross-checks
- [x] 7.4 `src/curriculum/coverage.test.ts` — the two hardcoded counts, 6 → 7 — also the test *name* "leaves the other 195 skills out", now 194; it was the only prose count in the suite
- [x] 7.5 `docs/roadmap.md` — the status line, 6 → 7, and its "all six are in Units 1–2" clause

## 8. Verify

- [x] 8.1 `npm test` green, including the golden snapshot and the static frame check — **289 passing, up from 222.** The six pre-existing generators' snapshots never moved across the whole extraction
- [x] 8.2 `npm run build` succeeds — `tsc -b` across all three configs, not `tsc --noEmit`
- [x] 8.3 `npm run lint` shows no new warnings beyond the three pre-existing in `Settings.tsx`
- [x] 8.4 Drive the real app in a browser: play a lesson of `add-2digit-carry` and confirm the wording is identical to before the refactor, then play `add-words` end to end — story renders, keypad answers it, a wrong answer that combines the wrong two quantities is diagnosed by name rather than marked incorrect

> **Run on the real app, all seven skills offered on the home screen.**
>
> - `add-2digit-carry` on `28 + 74`: column layout, prompt and all four solution steps
>   render as before the refactor. Answering `92` fired `forgot-carry` by name — "The ones
>   came to 12, so a 1 carries over into the tens" — which is now computed by
>   `forgotCarry(trace, 0, …)` rather than by hand.
> - `add-words` renders its story at reading size with the distractor present. Answering
>   `38 + 45 = 83` on the market frame fired `distractor-pair`: "The 45 are still in
>   storage." A correct answer advanced the counter to 1/10.
> - Successive problems drew different frames (market, walk, calls), so a lesson does not
>   read as one sentence repeated.
> - An unpredicted wrong answer fell through to the generic "Here is how this one works
>   out" nudge rather than to a bare "incorrect". Reached by a mis-click, but worth
>   recording as covered.
> - No console errors. The IndexedDB record seeded to unlock the cards was deleted
>   afterwards; the store is empty.
