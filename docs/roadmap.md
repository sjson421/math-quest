# Math Quest — Road to v1.0

What is left, in the order it should be done.

**Status: 52 of 201 skills are playable.** Stages A and B are both complete — all five of
Stage B's units, through order of operations — which makes Stage B the first stage to close
since checkpoints were built, and the first place the checkpoint fires outside Stage A. The
keypad can now offer a sign, a decimal point or a fraction slash when a problem asks for one.
Choice input is also built, so `AVAILABLE_CAPABILITIES` contains only `choice-input`;
comparison, ordering, factors, multiples and primes use choices, while the other playable
skills use the keypad. This line is the only progress number in the repo's documentation —
the manifest and `npm test` are the authority, and everything below is scope rather than
status.

To re-derive it rather than trusting this file:

```ts
import { skillState } from './src/curriculum/index'
import { stages } from './src/curriculum/manifest/index'
// count skillState(id) === 'implemented' across stages
```

---

## How to read this

**One list, in order.** An earlier version of this document ran two parallel tracks, which
implied a freedom of ordering that does not survive contact with the dependencies. Content
needs input modes; input modes are pointless before the content that uses them; and several
items are only *testable* once something else exists. Old identifiers are kept in
parentheses so references elsewhere in the repo still resolve.

**A skill ships by gaining a generator**, never by being added to the manifest. All 201 are
already declared in `src/curriculum/manifest/`; each resolves as `planned` until a generator
is registered for its id *and* every capability its stage needs is built. Only `implemented`
skills reach the learner, and planned ones are transparent to unlocking, so nobody is held
behind our build order.

**Capabilities gate whole stages.** `AVAILABLE_CAPABILITIES` in
`src/curriculum/manifest/resolve.ts` contains `choice-input` today. Adding a capability there
is a one-line edit that flips its stage on — which is why capability work is its own item,
never bundled with the content it unblocks.

**One unit per change.** A 50-skill stage would be roughly a hundred tasks. Where an item
below covers several units, it is several changes.

**Sizing is relative.** S / M / L / XL against each other, not against a calendar.

**Exit criteria, every content item:** every skill in scope resolves as `implemented`;
`npm test` green including the content contract over ~1000 sampled problems per skill; the
document's ✅ markers updated to match, which the cross-check enforces.

---

## The sequence

- [x] **0 · Generator engine and phrasing bank** — L *(was B0)* — **shipped 2026-07-31**

      `src/curriculum/engine/` and a templated phrasing bank, with `add-words` (1.8) on it as
      proof. The six existing generators moved across with output held byte-identical. Left
      behind the `problem-generation` and `word-problem-phrasing` capabilities.

- [x] **1 · Manifest-driven unlock** — S *(was B2)* — **shipped 2026-07-31**

      `isUnlocked()` reads `unlockPrerequisites` (the manifest's edges, planned skills seen
      through) instead of the generators' hand-written `prerequisites`, which is gone from
      `SkillGenerator` entirely. Left behind: **never re-lock a skill already practised**,
      enforced at read time off `attempts`/`mastery` rather than as a migration, so a record
      restored from the endpoint years from now still gets it.

      Of the seven built skills, five already agreed. Two moved, and **both ended up later**,
      which this item originally got half wrong: `sub-facts` **tightens** from `add-facts` to
      `add-words`, because Unit 2 depends on Unit 1 and inherits its tail. `sub-2digit-borrow`
      drops its cross-edge to `add-2digit-carry` — a loosening at the level of one edge, but it
      inherits `sub-facts`, so its transitive gate grew from four skills to six. **No skill
      unlocks earlier than it used to; Unit 2 is now fully behind Unit 1.** Both can therefore
      strand a learner, not just `sub-facts`.

      Also corrected here: `Home.tsx` rendered the cards in the order the generators were
      written, which put `sub-facts` second while it now opens sixth. The array is in
      curriculum order and a test pins it there.

- [x] **2 · Unit 1, the remaining three** — S — **shipped 2026-07-31**

      `add-facts-small`, `add-tens`, `add-three-numbers`. Completes the first unit, and
      produces the course's first `quick` skill, without which item 4 cannot be demonstrated.
      `add-three-numbers` is the first consumer of a three-operand column trace, which item 0
      deliberately deferred.

      Left behind: `stackTrace` and `drawOperands` in the engine, a **carry that is a count
      rather than a flag** (three digits reach 24, so two tens move up), and `forgotCarry`
      widened to accept either trace. Item 10 extends this file again for partial products.

      Also here: completing the unit moved the course's **root** from `add-facts` to
      `add-facts-small`, and `add-2digit-nocarry` from `add-facts` to `add-tens`. Nothing in
      the manifest changed — three skills simply stopped being seen through. Item 1's
      never-re-lock rule kept every existing record whole, and this is the first change that
      actually needed it.

- [x] **3 · Per-problem keypad rules** — S — **shipped 2026-08-01**

      `Problem` carries `keypad?: KeypadRules`; omitted still means whole digits only, so no
      existing generator changed and the learner sees no difference yet. A skill that needs a
      sign, a point or a slash declares it per problem — not per skill and not per stage,
      because Unit 6 asks for both −3 + 5 and −3 + −5 under one id and only one of those
      answers is negative.

      Left behind: **the pad is the single owner of those rules.** `Keypad` takes one `rules`
      object and makes the `applyKey` call itself, so what it displays and what it accepts
      cannot drift apart — the earlier shape, three booleans on one side and a rules object on
      the other, was a convention someone had to keep rather than a property. It still emits a
      functional update, so the stale-read protection under fast tapping is unchanged.

      Also left behind: **all four `checkAnswer` results are now distinguishable.**
      `src/lib/submit.ts` states what the lesson does with each, keyed on the status union so
      the next one added cannot be silently collapsed — which is exactly what had happened.
      A right value in the wrong form (`not-simplified`) is a miss below the surface but keeps
      the worked solution hidden: the arithmetic was already done. An unfinished entry
      (`unparseable`, newly reachable once `-` or `/` is on the pad) costs no attempt at all.

      No stage capability was built and `AVAILABLE_CAPABILITIES` is untouched. The first
      consumers are Unit 6 (item 14) and `simplify-fractions` (7.7).

- [x] **4 · Lesson mechanics** — M *(was half of B1)* — **shipped 2026-08-01**

      The commitments in [anti-discouragement mechanics](curriculum.md#anti-discouragement-mechanics)
      that live inside a single lesson:

      - **`quick` skills end at 5 correct.** The manifest marks 19 and is the runtime authority;
        `SkillGenerator` still does not duplicate the flag. Standard lessons stay at 10.
      - **Warm-up problem** one difficulty band below current — a guaranteed early win.
      - **Silent recovery:** three wrong in a row drops difficulty for the rest of the lesson,
        never surfaced to the learner.

      Left behind: `src/lib/lesson.ts` owns a pure lesson session. Each remaining correct answer
      is a lazy queue slot, so only the current unseen problem is generated and a missed problem
      can keep its identity while returning up to three positions later. The queue clamps that
      distance near the end, so 5/10 correct still means every presented problem was answered.

      Also here: warm-up and recovery are explicit exceptions to the mastery-derived base
      difficulty, both clamped at 1. Three **recorded** misses trigger recovery; an unfinished
      entry changes nothing, a correct answer resets a pre-recovery streak, and recovery stays
      on for the rest of the lesson without learner-facing text.

- [x] **5 · Choice input** — S — **shipped 2026-08-01**

      `ChoiceInput` renders `problem.choices` in declaration order as labelled native buttons.
      A tap submits the choice's stable id through the same correct/incorrect, progress and
      re-queue path as keypad answers; only its label reaches learner-facing markup.

      `inputMode` is the single switch between choices and the keypad, so keypad problems
      ignore stray choice data and keep their existing surface. `choice-input` is now in the
      `Capability` union and `AVAILABLE_CAPABILITIES`; Stages A, C and D record it because they
      contain its five named consumers.

      No generator landed here. Unit 0 now consumes it in `compare-numbers` (0.5) and
      `order-numbers` (0.6); `compare-negatives` (6.2), `name-parts` (7.3), and
      `compare-decimals` (9.3) remain planned consumers.

- [x] **6 · Stage A · Unit 0** — M — 8 skills — **shipped 2026-08-01**

      Place value, comparing, ordering, rounding. Where a learner who needs the beginning
      starts. `round-to-100` is a wall (the midpoint rule). Choice input landed in item 5.

      The previous version placed this inside a milestone it described as needing "no
      infrastructure that does not exist". That was wrong, and it is the correction that most
      changes this document's shape.

- [x] **7 · Unit 2, the remaining six** — M — **shipped 2026-08-01**

      `sub-facts-small`, `sub-tens`, `sub-2digit-noborrow`, `sub-3digit-borrow`,
      `sub-across-zero` and `sub-words`. Completes the second unit of Stage B, and gives the
      course its first `quick` subtraction skill.

      `columnTrace` did handle borrowing through a zero, as this item predicted — but only its
      *result*. Its `reduced` field reads −1 on the column the borrow passes through, because
      it means "after lending, before receiving" and a chain receives first. That is not a
      digit anyone writes, and the wall's entire lesson is the working. Left behind:
      **`borrowChain()`**, which names the column that actually pays, and `reduced` documented
      as meaningless wherever a column itself borrows. `borrowed` was already the standing
      digit at any chain length and needed nothing.

      Also left behind: `borrowedWithoutReducing` re-expressed per column, which is a
      correctness fix rather than a widening — across a zero the old form computed `0 − 3` in
      the tens and concatenated to **`NaN`**, so the wall would have predicted a non-number.
      `misalignedColumns` now applies the trace's operator, giving `sub-2digit-noborrow` the
      prediction `add-2digit-nocarry` has; it cannot use `flippedColumns`, because with nothing
      to borrow, taking the smaller digit from the larger is the answer.

      The frame bank check became per-operator. It had one shared quantity list opening at
      `2 − 3` and asserted against `a + b`, both addition assumptions in a check about to cover
      two operations — a subtraction bank would have been checked against sentences describing
      a negative difference while the ones a learner sees went unchecked. It also now fails if
      a bank exists in `phrasing/` and is not registered for checking.

      **Reject-and-redraw hit its limit here, and that is the transferable lesson.**
      `sub-across-zero` first shipped a draw that filtered for a zero tens digit *and* a
      borrow *and* an ordering — one candidate in 27 — and `drawPair` genuinely exhausted its
      300 attempts and threw at a learner, reproducibly, within 15,000 generations. The fix
      was to compose the subtrahend digit by digit under the minuend rather than draw and
      filter, which is exactly what `add-tens` already documents one file over. Any unit whose
      draw wants three independent properties at once should compose, not filter; `drawPair`'s
      retry loop is for taste, not for structure.

      Also here: **Unit 2 became its own module and its own card section.** `sub-facts` and
      `sub-2digit-borrow` moved out of `unit-01-add-sub.ts`, which is now `unit-01-addition.ts`,
      with their recorded output relocated character-identical. Both now open *later* — their
      unit's earlier skills stopped being seen through — which is the second time item 1's
      never-re-lock rule has been load-bearing rather than defensive.

- [x] **8 · Skill-tree navigation** — L *(was B3)* — **shipped 2026-08-02**

      Stage → unit → skill, with per-unit and per-stage progress. A stage or unit holding no
      playable skill is **absent**, not greyed: six of eight stages and twenty of
      twenty-three units simply are not there, so nothing on screen counts the unwritten
      remainder. A *locked* unit stays visible — on a fresh install that is the whole of
      Units 1 and 2, which is honest about what is coming rather than pretending it is open.

      **The hand-written unit list is gone, and that turned out to be the substance of this
      item.** `units: Unit[]` in `curriculum/index.ts` was a second authority for course
      structure, and it had already drifted: its literals declared `unit-00` while the
      manifest declared `unit-0`, and nothing failed because nothing read the hand-written id.
      Left behind: **`resolveCourseTree()`**, the fourth derivation over the same two inputs
      as `skillStates` — the stages and units holding a playable skill, in manifest order at
      all three levels. The unit modules now export `SkillGenerator[]`, the `Unit` type is
      gone from `lib/types.ts`, and the unread `unitBySkillId` went with it. A generator can
      no longer be filed under the wrong unit by being written in the wrong file.

      The cost of deriving order is that `coverage.test.ts`'s ordering assertion became
      structurally true — a test that cannot fail. It is still there, but the rules behind it
      are now tested against synthetic stages in `resolve.test.ts`, including the case that
      proves order comes from walking the manifest rather than from the state map handed in.

      **The app opens at the skill level of the current unit, not at the stage list.** Three
      levels would otherwise turn a one-tap daily path into three, and the hierarchy exists to
      make 201 skills navigable, not to tax the one skill the learner came for. The current
      unit holds the **frontier**: the first unlocked skill still below `UNLOCK_THRESHOLD`.
      Not below `MAX_MASTERY` — a skill opens the next at 2 and caps at 5, so a learner who
      keeps moving leaves a trail of skills at 2, 3 and 4 behind them, and that rule would
      have opened Unit 0 forever. `lib/course.ts` owns it, and a test pins the case the
      rejected rule gets wrong.

      Also here: unit colour is derived from manifest position through a five-tone cycle
      rather than a `color` field, opening powder/blossom/mint so the three built units keep
      the colours they had. Progress is a mastery *share* over playable skills only — a
      partly-built unit reports against what can be played, and the accepted cost is that a
      full bar drops when a new generator lands, because there is genuinely more to learn.

      The observation that survived: despite the name, the derived graph is a **path**, not a
      tree — one root, every skill with exactly one successor. This is navigation over a line,
      and item 9's branching question is still open and still unanswered here.

- [x] **9 · Stage checkpoints** — S *(was part of B1)* — **shipped 2026-08-03**

      The checkpoint fires on the exact lesson that carries a learner across a stage boundary:
      every manifest skill in that stage must be implemented, and every one must have reached
      `UNLOCK_THRESHOLD`. That makes Stage A the first real checkpoint and prevents the sixteen
      playable skills in the 44-skill Stage B from impersonating a completed stage.

      The existing lesson result stays first. Its Continue action opens a distinct checkpoint
      naming the stage, and the checkpoint's sole Continue action returns to the unit the
      lesson started from. The copy says **boundary reached**, not mastered: progression opens
      at mastery 2 while the stage's progress bar still has useful practice through mastery 5.

      Left behind: **`lib/checkpoint.ts`**, a pure comparison of the progress immediately
      before and after `completeLesson()`. The store evaluates the same object it persists and
      returns the optional checkpoint beside the lesson rewards. A completed restore and every
      later lesson start on the completed side of that comparison, so neither replays it; no
      stored presentation flag and no progress migration were needed.

      Also here: the old **"max 2 unlocks at once"** commitment is replaced by **one clear
      path**. The manifest graph has maximum out-degree one, so a cap at two could never bind;
      keeping the course sequential preserves its actual purpose, which is one obvious next
      step without competing routes. The explicit `prerequisites` override still exists
      technically, but using it to introduce real branching now requires a curriculum decision
      that revisits this commitment rather than happening accidentally.

- [x] **10 · Unit 3 · Multiplication** — L — 14 skills — **shipped 2026-08-03**

      Deliberately the slowest unit in the course; three walls (`times-7-8`, `mult-2by1`,
      `mult-2by2`). It extends the engine with a multiplication trace whose carry is applied
      after multiplying each digit, plus a separate partial-product trace that preserves row
      alignment. The wall misconceptions are derived from those traces: using ten groups,
      applying the carry before multiplying, dropping the placeholder zero, or stopping after
      the first partial product can no longer drift away from the arithmetic they diagnose.

      **The table sequence teaches a usable route, not fourteen versions of recall.** Twos
      double, tens expose the zero pattern, fives halve ten groups, fours double twice, sixes
      build from five groups, and nines use ten groups minus one with a concrete digit-sum
      check. Sevens and eights deliberately have no claimed shortcut; their recovery path
      breaks a fact into five groups plus the remainder. `mult-meaning` stays text-described
      rows and repeated addition until the course has a diagram capability.

      Left behind: **a multiplication frame bank and operator-specific source checks**. Eight
      adult contexts are checked with multiplication-safe quantities that exclude `2 × 2`,
      where adding the operands equals their product. Two-by-two lessons show both
      aligned partial products before combining them, and every Unit 3 problem remains a
      whole-number problem on the digit keypad. The manifest's first three skills keep their
      existing quick flag and finish after five correct answers.

- [x] **11 · Unit 4 · Division** — L — 11 skills — **shipped 2026-08-06**

      Long division got the trace this item predicted — per quotient digit: the digit brought
      down, the working value it joins, the digit written, the amount subtracted, and the
      remainder carried on. `working` is the field that earns its place: it is the previous
      remainder times ten plus the digit, and a trace recording only the digit could not tell
      the algorithm apart from the error of dividing each digit on its own.

      **The multi-value question resolved to choice input, not a new mode.** `factors`,
      `multiples` and `primes` offer complete authored lists — the shape `order-numbers`
      already uses — so the unit stayed content work rather than pulling capability work in
      with it. Recognising a complete factor list is also the skill; typing eight numbers in
      an order a checker has to normalise would have tested entry instead.

      That decision had a consequence worth naming: **Stage B now declares `choice-input`**,
      the first stage outside A, C and D to do so. Nothing waits on it — the capability has
      shipped since item 5 — but `requires` lists what a stage's own skills need, and two
      tests pinned Stage B's emptiness.

      Left behind: **a displayed expression may now be asked for a property of its result.**
      `47 ÷ 5` evaluates to 9.4 while `div-remainder` wants 2 and `long-div-remainder` wants
      9, so those two carry their operands and the property requested, and verification
      derives the answer rather than evaluating the screen. Every earlier skill could be
      checked by evaluating what it displayed; division is the first that cannot.

      Also here: **the wrong-operation prediction became operation-specific.** It was "`−` if
      the frame is `+`, otherwise `+`", which for a division story predicts a sum — an error
      the wording does not invite. Division's partner is multiplication. Its check quantities
      divide exactly by the distractor as well as the divisor, because `total ÷ distractor` is
      a predicted value and a fractional one is a diagnosis no whole-number pad can ever
      match. `div-words` composes its total from both for the same reason, and excludes a
      distractor equal to the answer — which shipped once, printing the answer in the sentence
      as a quantity meaning something else.

      The long-division draws **compose from a quotient and divisor** rather than filtering a
      dividend, which is item 7's lesson applied before it could bite: exact division, quotient
      width and a non-zero intermediate remainder are three independent properties, and that is
      exactly the shape that exhausted `sub-across-zero`'s draw in front of a learner.

- [x] **12 · Unit 5 · Order of Operations** — S — 3 skills — **shipped 2026-08-07**

      Closes Stage B, and with it the first stage boundary the learner reaches that is not
      Stage A. The checkpoint needed nothing: it already walked the manifest and failed on a
      planned skill, so it started firing because the data finally satisfied it.

      **The verification contract was the real work, not the generators.** Every skill through
      Unit 4 displayed two operands around one operator, and `generators.test.ts` recomputed
      the answer by matching exactly that. `3 + 4 × 2` does not match it, so the check threw
      before it could disagree with anything. It now parses the display and evaluates it under
      precedence and parentheses — and that had to be a real evaluator rather than a fold,
      because **folding the operators in written order is the mistake this unit teaches
      against**, and a check that folded would have agreed with a generator that made it.

      Deliberately **no new carried display data**, which is the boundary worth naming against
      item 11. Unit 4 added `wholeNumber` because `47 ÷ 5` shows a division whose answer is a
      *property* of it. Here the answer **is** the value of what is on screen, so the check
      evaluates the screen. Carry data when the answer is *about* the display; evaluate the
      display when the answer *is* it.

      Left behind: **an expression model local to the unit** — build, render, evaluate — plus
      the two wrong-rule evaluations the diagnoses read off the same tree the display renders.
      Not in `engine/`: all three consumers are Unit 5 skills, which is the rule Unit 4's
      number theory states, and Unit 12's exponents should shape their own rather than inherit
      one guessed at here. **Parentheses are derived, never stored** — a child is bracketed
      when it binds less tightly than its parent, or equally and on the right. That makes
      `with-parentheses` structurally honest: brackets appear only where removing them changes
      the value, which is exactly what keeps its `ignored-parentheses` diagnosis from being
      filtered away as a collision on every problem.

      `two-operations` draws the multiplication **second on two problems in three, and first on
      the other third**. The first half is the wall the curriculum names; the second half is
      why the skill is not passable by "always do the last one first", which is a different
      wrong rule rather than the one being unlearned. Its second diagnosis is the higher-
      precedence step answered on its own — getting the order right and stopping is a different
      error from getting it wrong, and a wall needs two distinct tags on **every** problem.

      Also here: **a stage completing is now a thing tests have to survive.** Four assertions
      encoded "Stage B is part-built" as a fact — the checkpoint case, the unit list, the stage
      count, and stage progress. Each moved onto a synthetic part-built stage, the pattern
      `resolve.test.ts` already uses, so none of them expires again when Unit 6 lands. A case
      whose premise the course outgrows stops testing anything, and it does so silently.

      One presentation change, and it turned out not to be about Unit 5. The inline size ladder
      stepped straight from 7 characters to 20, and **everything between overflowed a 375px
      phone** — `1482 ÷ 6`, `2800 ÷ 100`, `100 + 10 + 5` and `121, 104, 178` are all shipped
      skills that were wrapping. Nobody had measured the *row*: the equals sign and the answer
      slot are sized in `em`, so they grow with the font, and the slot grows again as the
      learner types. A display that fits beside an empty slot can wrap on the second digit,
      which is how it passed inspection and failed in use. Unit 5's expressions cannot be drawn
      short enough to sit outside that range, so the ladder is re-derived for every length and
      those four move down a size. `read-numbers` still fits at no size — 27 characters of
      words wants wrapping rather than shrinking, and that is left for whoever needs it.

      Worth naming because it is the transferable part: **the browser check found this, and
      nothing else could have.** 1055 tests, the build and the lint were all green with a
      wrapped expression on screen. The measurement is now executed in `coverage.test.ts`
      rather than recorded in a comment, so the next unit to widen a display fails there.

- [ ] **13 · Number-line input** — S

      Tap to place a value. Needed by `negatives-numberline` (6.1) and again by
      `fractions-numberline` (7.4).

- [ ] **14 · Stage C · Unit 6 · Negatives** — M — 9 skills

      The gate to all algebra, and nothing in it is optional. `sub-negatives` (6.5) is the
      major wall — minus a minus. Stage C declares the built `choice-input` capability, but not
      number-line input: making that unavailable mode stage-wide would hold the other eight
      skills behind it.

      Item 3 removed the gate this used to name, and left a job in its place: these generators
      must **declare `keypad: { allowNegative: true }` on the problems whose answers are
      negative**, and only those. Not every skill here needs negative *entry* — `add-neg-pos`
      (−3 + 5 = 2), `sub-negatives` (5 − (−3) = 8) and `absolute-value` all have positive
      answers — but `add-two-negs`, `mult-negatives`, `div-negatives` and `negatives-mixed` do.
      The declaration is per problem, so a skill that sometimes lands negative and sometimes
      does not can say so problem by problem rather than showing the sign key throughout.

- [ ] **15 · Dress-up design tooling** — M *(was B4a)*

      Settle how cosmetics are authored **before** any exist, because the answer determines
      what every later asset looks like. `.claude/skills/mascot-design/` for Pip's layer
      contract, palette and geometry conventions — `Mascot.tsx` is already layered SVG
      (ears/head, face, accessory) for exactly this reason. Plus a spike comparing an animation
      runtime (Rive, Lottie) against hand-authored SVG with the framer-motion already present.
      Record the decision either way.

- [ ] **16 · Outfits, shop, and room** — L *(was B4b)*

      Coins accumulate today with nothing to spend them on — they appear on the home screen and
      in settings and are read nowhere else. Cosmetic layers on Pip, a decoratable room, a shop
      priced against real earn rates, and inventory on the progress record, which must survive
      the sync round trip rather than only local storage.

- [ ] **17 · KaTeX rendering** — M

      Fractions cannot render as plain text. First needed across Unit 7.

- [ ] **18 · Diagram rendering** — M

      Shaded shapes for fraction meaning, first at `fraction-of-shape` (7.2); reused heavily by
      Unit 20's geometry.

- [ ] **19 · Stage D · Units 7–11** — XL — 50 skills, five changes

      The biggest block in the course. Unit 7 is conceptual only — not one problem asks for a
      calculation. Unit 8 needs the fraction keypad from item 3, Unit 9 the decimal point.
      `fraction-words` (8.12), `money-problems` (9.12) and `ratio-words` (11.7) draw on the
      phrasing bank; Unit 10 closes on `simple-interest` instead, so it needs no frames.

- [ ] **20 · Expression input** — M

      Variables on the keypad. First needed at Unit 13.

      Also the point at which `Misconception.value: number` stops being enough: `diagnose()`
      does `Number(raw)`, so any non-scalar answer silently loses misconception diagnosis.
      Stage E carries eight walls, and four of them — `words-to-expression`,
      `combine-like-terms`, `distributive` and `distribute-negative`, all in Unit 13 — answer
      with an expression rather than a number. The content contract requires two distinct
      surviving predictions on every wall, so this is a gate on Unit 13, not a nicety.

- [ ] **21 · Stage E · Units 12–15** — L — 34 skills, four changes

      `distribute-negative` (13.7) is a major wall.

- [ ] **22 · Coordinate-plane input** — L

      Tap to plot a point. First needed at `plot-points` (16.1) — the only skill in the course
      marked both `quick` and a wall. Needs the misconception generalisation from item 20, since
      a point is not a scalar.

- [ ] **23 · Stage F · Units 16–19** — L — 28 skills, four changes

- [ ] **24 · Chart rendering** — M

      Bar, line, scatter. First needed at `read-bar-line` (21.5).

- [ ] **25 · Stage G · Units 20–21** — M — 22 skills, two changes

      Geometry teaches *choosing and applying* the formula the GED provides, never memorising
      it.

- [ ] **26 · Review and spaced repetition** — L *(was B6)*

      Review lessons, per-skill strength, and the stats surface. Ordered before skip-ahead
      because it is what makes skip-ahead safe.

- [ ] **27 · Skip-ahead** — L *(was B5)*

      The full flow from [skipping ahead](curriculum.md#skipping-ahead): check-first (8 problems
      sampled at difficulty 3, ≥7 correct) and just-skip, both optional. Sets every skill in the
      block to mastery 3, records `source: 'tested-out' | 'self-assessed'` on `SkillProgress`,
      stays reversible, and carries the accuracy safety net that quietly offers to reopen a
      unit. Entering spaced repetition at low strength needs item 26.

- [ ] **28 · Timed mode and score estimator** — M

      Includes the GED score model. The only place time pressure appears anywhere in the app.

- [ ] **29 · Stage H · Unit 22** — S — 6 skills

      Closes the course.

- [ ] **30 · Streak reminders** — S *(was B7)*

      Worth an honest caveat: iOS PWA notification support is narrow and may not reach an
      installed home-screen app reliably. May reduce to in-app nudges, which is an acceptable
      outcome. Last because it is the only item nothing else depends on.

---

## Done, for v1.0

- 201 of 201 skills `implemented`, every capability built.
- The lesson loop honours every commitment in `docs/curriculum.md`, the tree navigates 23
  units, dress-up spends coins, skips are safe, review works.
- The content contract passes across every generator, and the manifest, the document, and
  the registry still agree.

## Out of scope here

Launch work is deliberately excluded and needs its own plan: deploy pipeline, iPhone install
validation on a real device, performance and bundle budget, an accessibility pass, and a
beta with an actual learner. Listed so its absence reads as a decision.

Sync has also never been verified on real hardware — see the note closing
`openspec/changes/archive/2026-07-30-progress-sync/tasks.md`.

## Working conventions

- Each item becomes an OpenSpec change (`/openspec-propose`), and ships through
  `/openspec-apply-change`. Items covering several units are several changes.
- Create changes just in time, one or two ahead. Proposals written months early against
  unbuilt infrastructure rot.
- `docs/curriculum.md` stays the content authority; `src/curriculum/manifest/` is its
  machine-readable twin, and the two cross-check in the test suite.
- `src/lib/content-rules.ts` gates every new generator — at most 4 solution steps, 12 words
  each, one-sentence hints, and two distinct predicted misconceptions on any wall skill.
