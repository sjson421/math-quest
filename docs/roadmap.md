# Math Quest — Road to v1.0

What is left, in the order it should be done.

**Status: 195 of 201 skills are playable.** Stages A through G have complete playable content;
Stage H alone is still planned. Stage E is
complete with Units 12, 13, 14 and 15; Stage F's Units 16, 17, 18
and 19 are complete.
Choice input,
number-line input, math notation, fraction input, diagrams, expression input,
coordinate-plane input, root-pair input and chart rendering are built,
so `AVAILABLE_CAPABILITIES` holds
`choice-input`, `number-line`, `math-notation`, `fraction-input`, `diagram`,
`expression-input`, `coordinate-plane`, `root-pair-input` and `chart`. Unit 12 is the first content to use `math-notation`'s superscript and
root kinds, for exponent and root display; it does not use `expression-input`, since that
capability's grammar excludes exponents, so power-rule skills ask for the resulting exponent
as a number rather than an expression. `zero-neg-exponents` settles Stage E's previously
deferred fraction-input declaration with exact reciprocal answers. `expression-input` now has
its first content: `words-to-expression`, `combine-like-terms` and `distributive` (item 21's
13a) answer through it, comparing under the `expanded` form so a re-ordered sum or an
undistributed equivalent counts as the same answer. The three content-bearing answer-control modes all have
content: `negatives-numberline` is the first skill anywhere to
declare a line, comparison, ordering, factors, multiples, primes and negative comparison use
choices, and everything else uses the keypad. The pad offers a sign, a decimal point or a
fraction slash when a problem asks for one, and a space key for mixed-number entry (with
`requireMixed` form checking). `requireDecimal` and `requireFraction` extend the same
right-value-wrong-form mechanism for Unit 9's decimal/fraction conversion pair. Unit 7 uses
all three answer controls: fraction
meaning, diagram reading and lowest terms use the pad; vocabulary, visual equivalence and both
comparisons use choices; and a fraction is placed on an exact rational line. Unit 8's
operation skills are complete, including mixed-number arithmetic, multiplication, division,
and fixed-frame fraction stories. Unit 9 is now complete: place value, reading, comparison,
rounding, addition, subtraction, multiplication, division, decimal/fraction conversion and a
money-applied word problem, all with exact base-ten data. Unit 10 is complete: meaning,
conversions, inverse percent relationships, percent change, discount/tax/tip and simple
interest with its supplied GED formula. Unit 11 covers writing and simplifying ratios,
best-value unit rates, proportions, scale drawings, and a fixed stated set of within-system
unit conversions, then closes with fixed-frame ratio stories distinguishing part-to-part from
part-to-whole. Expression input is built. Unit 12 is complete: meaning and evaluation,
squares and roots, same-base and nested-power rules, zero and negative exponents, scientific
notation, and the full order of operations. Unit 13 is complete: what a variable is,
evaluating and translating expressions, spotting like terms, combining, distributing across
a sign, and factoring a common factor back out. `factor-gcf` is the first skill anywhere to
answer under the `exact` comparison form, where the expanded expression on screen is a wrong
answer. Unit 14 is complete, and is the course's first content to display an **equation**,
which needed a new `equation` arm on `Display`: an inline row appends `= answer` to what it
shows, which is true of an open expression and false of a statement that already carries its
relation. Its last four skills use all three answer surfaces at once — `with-fractions` draws
a stacked fraction inside an equation on the keypad, `special-solutions` answers a solution
*count* through choices and drops the framed row entirely, `equation-words` states the same
two-step equation in prose, and `rearrange-formula` answers with an expression in the one
letter the pad offers while `y` stays in the frame. Stage E now declares `choice-input`, owed
since 13a. Unit 15 closes the stage and is the first content whose **answers are relations
rather than values** — `−3x > 12` solves to `x < −4`, and a keypad submits the `−4` and nothing
else, dropping the direction that is the whole content of `flip-the-sign`. So five of its six
skills answer through choice input over whole statements, and `compound-inequalities` takes the
pad because a count of what satisfies a range genuinely is a value. `graph-inequality`'s open
question is settled by naming the graph rather than drawing one: a choice renders text, so
picking among rendered lines was never the built option the roadmap took it for, and a drawn
inequality graph is declined rather than deferred. The unit needed no new capability, and its
six new `EquationData` arms sit on the existing `equation` display arm, which was always
"a statement that already contains its relation" and now says so.
This line is the only progress number in the repo's documentation — the
manifest and `npm test` are the authority, and everything below is scope rather than status.

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
`src/curriculum/manifest/resolve.ts` contains `choice-input`, `number-line`, `math-notation`,
`fraction-input`, `diagram`, `expression-input`, `coordinate-plane`, `root-pair-input` and
`chart` today. Adding a capability there is a one-line edit that flips its stage
on — which is why capability work is its own item, never bundled with the content it unblocks.
It flips nothing on its own, though: a skill still needs a generator and every other
capability its stage declares.

**What a capability item contains.** Items 5 and 13 shipped the same shape, and every
capability item below is written against it rather than restating it: the component and the
per-problem declaration it reads; the exhaustive switch extended, since `ProblemView` keys its
entry slot on a `Record` over `inputMode` and its layout on `Display['kind']`, so a mode
nobody handled is a compile error rather than a fallback; the name added to
`AVAILABLE_CAPABILITIES`; a coverage test pinning what unlocked, which is usually nothing; and
no generator, because the content is the next item. Two standing constraints: it must render
to **markup, not canvas** — `vite.config.ts` pins `environment: 'node'` and component tests
assert on `renderToStaticMarkup`, which is what ruled out both animation runtimes in item 15 —
and anything that widens what is on screen re-measures the inline size ladder that
`coverage.test.ts` executes, which is item 12's finding.

**All ten capability names exist today.** `Capability` in `manifest/types.ts` declares
`choice-input`, `number-line`, `math-notation`, `fraction-input`, `diagram`,
`expression-input`, `coordinate-plane`, `root-pair-input`, `chart` and `timed`, and every stage's `requires` is
already written against them. A capability item normally flips a name the manifest has held
from the start. Item 17 was the measured exception: 17a rejected the KaTeX library and 17b
replaced its library-specific `katex` flag with the implementation-honest `math-notation`.
`fraction-input` arrived by the other route: item 3 built the keypad rules, and item 17 made
the long-built capability available alongside notation.

**At most six generators per change.** Larger units, and the capability items carrying a
decision, ship in the ordered increments written below. Their roadmap checkbox remains open
until every increment lands.

**Sizing is relative.** S / M / L / XL against each other, not against a calendar.

**Exit criteria, every content item:** every skill in scope resolves as `implemented`;
`npm test` green including the content contract over ~1000 sampled problems per skill; the
document's ✅ markers updated to match, which the cross-check enforces. From item 25a
onward, each skill in scope also carries the teaching line and worked example that item
shows before a lesson's first problem.

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
      everyday contexts are checked with multiplication-safe quantities that exclude `2 × 2`,
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

- [x] **13 · Number-line input** — S — **shipped 2026-08-07**

      Tap to place a value. `NumberLineInput` draws a problem's declared line as one labelled
      button per tick, named by its value, so assistive technology gets a control per position
      and nothing depends on hit-testing a coordinate — which also keeps the whole interaction
      inside what a first-paint test can read.

      **A tap places; it does not answer.** Choice input can submit on tap because its controls
      are tall and few; a line packs every tick into one strip, so at 375px a tap landing one
      tick out is a slip rather than a wrong answer. Confirming is the separate step, and the
      placed value is the lesson's ordinary `entry` — so it costs no new state, and confirming
      runs the same `submit()` a Check press runs, with the same gate, recording and re-queue.

      Left behind: `src/lib/number-line.ts` owns the line as `{ start, step, count }` in exact
      rationals — tick *i* is `start + i × step`, so a line of thirds cannot round and there is
      no division to fail on. It also owns what a tick submits versus what it reads as: `−3` is
      drawn, `-3` is parsed, and the two diverge there rather than where one is passed to the
      wrong place. `ProblemView` now keys its entry slot on a `Record` over `inputMode`, so a
      fourth mode is a compile error instead of an inherited shape.

      `number-line` joins `AVAILABLE_CAPABILITIES`, and Stages C and D now declare it — Stage C
      had left it undeclared because naming an unbuilt capability would have held its other
      eight skills back, and that cost expired when the capability shipped. **Nothing unlocked.**
      Every Stage C and Stage D skill is still `planned`, which a coverage test now pins.
      `negatives-numberline` (6.1) and `fractions-numberline` (7.4) remain planned consumers.

- [x] **14 · Stage C · Unit 6 · Negatives** — M — **shipped 2026-08-07**

      The gate to all algebra, and nothing in it was optional. Nine skills, three of them
      walls, and `sub-negatives` (6.5) the major one — minus a minus. `negatives-numberline`
      (6.1) is the first skill anywhere to declare a line, which is the content item 13 was
      built for and went a whole change without.

      **The sign-key rule this item asked for did not survive contact with the walls.** It
      said to declare `keypad: { allowNegative: true }` on the problems whose answers are
      negative *and only those*, on the grounds that `add-neg-pos`, `sub-negatives` and
      `absolute-value` answer positively. But `docs/curriculum.md` names 6.3's wall as "added
      magnitudes, kept sign", and for −3 + 5 that mistake is −8; 6.5 has exactly one enterable
      wrong answer without a sign key, where a wall must carry two on every problem; and 6.8's
      only real mistake is keeping the sign. A pad that withholds the key does not merely fail
      to record those answers — it **tells the learner the answer is not negative**, at the
      three skills whose question is what sign it has.

      So the rule shipped as: a problem permits a sign when a negative value is *plausible*
      for it — the correct answer or a predicted mistake. It is derived in the generator from
      the answer and the predictions together, so the declaration cannot drift from what the
      problem holds. The consequence, stated rather than discovered later: every Unit 6
      problem answered on the pad offers the sign. The per-problem mechanism is still the
      mechanism, and Unit 8's fractions will use it to say something different.

      Left behind: `entryLabel` in `src/lib/keypad.ts` owns the minus glyph for everything the
      learner reads — `−` is drawn, `-` is submitted — and `tickLabel` is now stated in terms
      of it, so the line and the pad cannot disagree about the same value. The answer slot was
      echoing a typed `-8` under a display reading `−3 + −5` until this change; no unit before
      this one could produce a signed answer, so nothing had reached it. `WholeNumberData`
      gained a distance-from-zero variant, because `|−7|` is not an expression and a display
      of `−7` would evaluate to the answer 6.8 exists to call wrong. The recorded-output gate
      now renders `keypad` and `numberLine`, which no generator had ever set — without that,
      the per-problem sign declaration would have shipped outside the review surface.

- [x] **15 · Dress-up design tooling** — M *(was B4a)* — **shipped 2026-08-08**

      Settle how cosmetics are authored **before** any exist, because the answer determines
      what every later asset looks like. `mascot-design` for Pip's layer contract, palette and
      geometry conventions — `Mascot.tsx` is already layered SVG (ears/head, face, accessory)
      for exactly this reason. Plus a spike comparing an animation runtime (Rive, Lottie)
      against hand-authored SVG with the framer-motion already present. Record the decision
      either way.

      **The decision is hand-authored layered SVG with the installed `framer-motion`.** All
      three arms were built and measured against the real bundle rather than argued about:
      SVG added **1.13 kB gzip**, `@rive-app/react-canvas@4.31.0` added 57 kB of JS plus a
      758 kB gzipped WASM, and `@lottiefiles/dotlottie-react@0.19.13` added 31 kB plus a
      495 kB WASM. Rive's total is roughly 5.7× the entire app's gzipped weight and
      dotLottie's roughly 3.7× — and in a PWA that precaches for offline use, every learner
      downloads that whether or not they ever equip anything.

      **Size was the least interesting of the three findings.** Neither canvas runtime is
      testable here at all: `vite.config.ts` pins `environment: 'node'` and component tests
      assert on `renderToStaticMarkup`, so a cosmetic drawn into a `<canvas>` produces no
      markup to assert on and every item would ship untested. Both also break offline *by
      default* — `@rive-app/canvas` resolves its WASM from `unpkg.com` and
      `@lottiefiles/dotlottie-web` from `cdn.jsdelivr.net` with an `unpkg` fallback, which is
      a silent network dependency that only fails on the device of a learner with no
      connection. And neither composes the way the slot contract needs: Rive switches
      appearance through state-machine inputs inside one binary artboard, and a `.lottie` is a
      self-contained timeline with no runtime notion of inserting a layer into another file's
      paint order, which leaves the back/front occlusion case with no expression at all.

      Stated rather than glossed: the Rive arm measured the runtime, not a hand-authored
      artboard. A `.riv` needs the Rive editor behind an account and community assets are
      login-gated, so none was downloaded. That is itself part of the finding — an authoring
      path that cannot be driven from a shell and produces a binary no reviewer can read in a
      diff is a real cost for a single-maintainer repo, independent of how good the output
      looks. dotLottie had no such problem; a valid 1.6 kB Lottie was written by hand.

      **The canonical skill is `.agents/skills/mascot-design/`, not the `.claude/` path this
      item named** — `.claude/skills/mascot-design/` is its byte-identical mirror, matching
      how every other skill in the repo is laid out. Note that `.gitignore` excludes
      `.agents/`, so project-authored skills there are tracked with `git add -f`, as the
      sixteen existing files already were. The contract documents six named anchors, five
      slots, and a ten-step render order; three of those anchors are the exact
      `transformOrigin` values `Mascot.tsx` already uses, so they are load-bearing rather than
      descriptive. It changes no runtime code — item 16 owns the renderer that makes the slot
      list real.

- [x] **16 · Outfits, shop, and room** — L *(was B4b)* — **shipped 2026-08-09**

      Coins accumulate today with nothing to spend them on — they appear on the home screen and
      in settings and are read nowhere else. Cosmetic layers on Pip, a decoratable room, a shop
      priced against real earn rates, and inventory on the progress record, which must survive
      the sync round trip rather than only local storage.

      Too large for one change, so it shipped in order, in two increments on the same day.

      **16a · Cosmetics and shop — shipped 2026-08-09.** `inventory` and `equipped` on the
      progress record, the slot renderer in `Mascot.tsx`, five cosmetics, and a shop reached
      from the coin balance. The renderer walks the ten steps item 15's contract wrote down,
      so `references/layers.md` now describes code rather than intent.

      Neither `api/progress.ts` nor `src/lib/sync.ts` needed a line: the endpoint stores the
      blob opaquely and sync is a store subscriber, which is the design decision from
      `progress-sync` paying off — that spec already required a push after "a purchase",
      written before one could happen.

      **Pricing was checked against the running app, not argued.** Three lessons pay 45 coins,
      and the cheapest cosmetic is 40. The set totals 470 — about a week and a half at three
      lessons a day.

      Left behind: **`pin` ships no item.** The slot and its replacement path are built and
      tested with a fixture, but every catalogue item leaves Pip's signature star alone,
      because the contract calls displacing it an identity change rather than a free slot.
      Also worth knowing for 16b: a cosmetic hung *below* Pip's chin reads as a bib, not a
      cape — the head circle ends at y 169, so anything under it shows as a flat band. The
      cape only worked once its hem curved up behind the head, leaving the side flares as the
      visible part. Room décor will hit the same wall from the other direction.

      **16b · The room — shipped 2026-08-09.** Five decorations, a `room` slot map beside
      `equipped`, and `Room.tsx` — a `0 0 320 200` surface that *contains* Pip's own canvas at
      the same unit scale, placed with one translate at `(60, 0)`. One catalogue discriminated
      on `kind` carries both surfaces, so a decoration is bought with the same coins into the
      same `inventory` and a rug cannot be equipped onto a face. Left behind:
      `openspec/specs/decorated-room`, and `references/room.md` beside the layer contract.

      **Pip is painted as one opaque step, and that is the whole occlusion rule.** The room
      never opens a gap inside his ten, so the two paint orders this item worried about cannot
      disagree — which is why no decoration needs the back/front split a hat crown uses, and
      `Decoration` has no such fields to declare. A test pins it: a worn cape lands in front of
      every decoration and still behind Pip's own head.

      Placement is named slots — `rug`, `wall`, `left`, `right` — not coordinates. Dragging is
      behind a pointer, and component tests render first paint in node with no DOM, so a
      dragged position is a decision no test can reach; a coordinate map would also have needed
      the per-entry merge rule in `reconcile()` that AGENTS.md forbids for skills. The accepted
      cost is that an item is authored for its side and cannot move across. `api/progress.ts`
      and `src/lib/sync.ts` again needed nothing.

      **Two findings the browser check produced and nothing else could**, which is the second
      time running that check has paid for itself after item 12. **Tailwind emits a `@theme`
      variable only when some utility class references it**, and cosmetics reach the palette
      through `var()` rather than a class — so `--color-mint-soft` and `--color-powder-soft`
      did not exist at runtime, and a shape filled with a pruned variable renders *unfilled*
      rather than falling back. The wall was invisible. No shipped cosmetic had hit it purely
      by luck: the three `-soft` tints the wardrobe uses are the three some class keeps alive.
      `src/index.css` now declares `@theme static`. **Nothing in the suite can catch a
      regression** — vitest runs `css: false`, the same fact that made 16a abandon
      cross-checking the palette, so this is guarded by making it impossible rather than
      detectable. And the horizon started at `y 168`, where Pip's head circle ends: the line
      met his chin, the floor read as a windowsill he was leaning on, and 1296 tests, the build
      and the lint were all green. It sits at 150.

      Also here: the room totals 470 coins — the same as the wardrobe, which is the honest
      answer to what a room should cost when the wardrobe is the only comparison there is. Both
      sets together are 940, about three weeks at three lessons a day, so the shop does not
      empty. And worth knowing before a sixth decoration: **a narrow `wall` item centred on the
      anchor is almost entirely covered by the party hat's crown**, so check a new one against
      a hatted Pip rather than a bare one. The bunting is wide and reads with any hat on.

- [x] **17 · Math notation rendering (`math-notation`)** — M — **two increments** — **shipped 2026-08-09**

      Fractions cannot render as plain text. First needed across Unit 7; with item 18 it is what
      opens Stage D.

      **17a · Measure, then decide.** KaTeX is the assumed answer, not a settled one, and item 15
      is the precedent for settling it against the real bundle instead of in argument. Stage D
      wants stacked fractions and mixed numbers, Unit 12 superscripts and radicals, Stage F
      little more — so the arms are KaTeX against a hand-authored notation element in the CSS
      already present, both weighed against what Stages D–G actually ask for. Unlike item 15 both
      arms are testable here, because both produce markup; the decision turns on weight (KaTeX's
      JS and modern WOFF2 fonts, precached for every learner by a PWA that must work offline,
      plus the fallback font files Vite emits), and on whether hand-authored notation carries
      superscripts and roots without quietly becoming a typesetter. Record the decision either
      way — and if KaTeX loses, say so about the flag too: `katex` is named in `Capability` and
      in four stages' `requires`, so the name either outlives the library or the rename is part
      of 17b, not a later tidy-up.

      **17a decision — use structured React/CSS, and rename the flag to `math-notation` in
      17b.** Both arms rendered the same ten curriculum-derived expressions to testable
      markup with one authored accessible name, local-only assets and no overflow at 375px.
      The custom arm covered stacked and mixed fractions, positive and negative superscripts,
      radicals, the nested quadratic formula and geometry formulas with five recursive
      primitives and no formula-specific CSS. It added **1.34 kB gzip** of JS/CSS and
      **4.27 KiB** to the Workbox precache.

      `katex@0.18.3` was more typographically polished, especially for stretchable radicals,
      but added **84.86 kB gzip** of JS/CSS plus **256.17 kB across 19 precached WOFF2 files**.
      The real PWA precache grew from **552.97 KiB to 1088.27 KiB (+96.8%)**, before the
      learner reaches fractions, and Vite also emitted 816.78 kB of non-precached legacy font
      fallbacks. That is not proportionate to a notation surface the small structured arm
      covered without becoming a general typesetter. That left item 17 open for 17b's
      production renderer, accessible-label contract, `katex` → `math-notation` manifest
      rename, and the `math-notation` plus `fraction-input` availability flags.

      **17b · The renderer and the two flags — shipped 2026-08-09.** `Display` gained a typed
      math arm and one recursive markup owner for text, rows, fractions, superscripts and
      roots. Every authored expression has one accessible name, fraction entries echo through
      the same owner, and the existing column view speaks a nested answer through its enclosing
      math label rather than exposing two. `katex` became `math-notation` in `Capability` and
      all four consuming stages; `math-notation` and the long-built `fraction-input` both
      joined `AVAILABLE_CAPABILITIES`. The playable set stayed at 61 because Stage D still
      requires `diagram` and has no generator.

- [x] **18 · Diagram rendering** — M — **shipped 2026-08-10**

      Shaded shapes for fraction meaning, first at `fraction-of-shape` (7.2) and again at
      `equivalent-visual` (7.5). Unit 20's geometry reuses the model.

      **Scoped to those two skills deliberately.** Unit 20 wants labelled dimensions, composite
      outlines and right-angle marks; guessing at them here would repeat the mistake item 12
      avoided by keeping Unit 5's expression model out of `engine/` — build for the consumers
      that exist. Unit 20's figures extend this model under item 26, not here.

      In order:

      1. **The shape spec** — bar, circle, grid, each as parts and shaded parts, carried in the
         problem's data rather than in markup, so the answer stays derivable without trusting
         the generator. That is Unit 4's rule: carry data when the answer is *about* the display.
      2. **The renderer** — SVG, one accessible name per figure ("circle in 4 parts, 3 shaded"),
         and nothing sized so small it is unreadable at 375px.
      3. **The declaration and the flag** — a `diagram` display arm, and `diagram` added to
         `AVAILABLE_CAPABILITIES`, which together with item 17 is what finally opens Stage D.

      Shipped as a validated `bar` / `circle` / `grid` shape record carrying total and shaded
      parts, a responsive local SVG with one derived accessible image name, and an exhaustive
      `diagram` display branch above the existing answer slot. Static and real-browser fixtures
      cover empty, whole, dense and prime-count figures at 375px. The capability flag changes no
      playable skill on its own, so the status remains 61 until Unit 7 gains generators.

- [x] **19 · Stage D · Units 7–11** — XL — 50 skills, ten changes — **shipped 2026-08-13**

      The biggest block in the course. Unit 7 builds meaning before operations, with
      simplification as its closing bridge. Unit 8 needs the fraction keypad from item 3,
      Unit 9 the decimal point.
      `fraction-words` (8.12), `money-problems` (9.12) and `ratio-words` (11.7) draw on the
      phrasing bank; Unit 10 closes on `simple-interest` instead, so it needs no frames.

      **Nothing here starts before items 17 and 18 have both landed.** The stage declares
      `math-notation`, `fraction-input` and `diagram`, and it stays `planned` while any one is
      missing.

      Ordered increments, each with what it waits on beyond that:

      - **7a** `fraction-meaning`–`equivalent-multiply` — the two diagram skills (7.2, 7.5), and
        `fractions-numberline` (7.4), whose line of thirds is the case item 13's exact rationals
        were built for. `name-parts` (7.3) is choice input and the course's first new vocabulary.
      - **7b** `simplify-fractions`–`compare-diff-den` — 7.7 is the first consumer of
        `requireSimplified` and of the `not-simplified` status item 3 left behind; 7.9's wall is
        comparing numerators only.
      - **8a** `add-frac-same-den`–`improper-to-mixed` — `add-frac-diff-den` (8.4) is a major
        wall. **Settle mixed-number entry before this ships:** `parseInput` accepts `1 1/2`, but
        the pad has no space key and its bottom row holds one shared slot carrying either the
        slash or the point, so `improper-to-mixed` (8.6) has no way to be answered today.
        Whichever way it resolves — a key, a second slot, or accepting improper answers — it
        changes the pad, so it is capability work under item 3's mechanism rather than content
        work smuggled into a unit.
      - **8b** `mixed-to-improper`–`fraction-words` — `sub-mixed` (8.9) borrows from the whole and
        `div-fractions` (8.11) flips the wrong fraction; both are walls owing two surviving
        predictions each. `add-mixed` and `sub-mixed` are the mixed-entry consumers 8a decided for.
      - **9a** `decimal-place-value`–`sub-decimals` — the decimal point (item 3, built);
        `compare-decimals` (9.3) is choice input and has been a named Stage D consumer since item 5.
      - **9b** `mult-decimals`–`money-problems` — **`fraction-to-decimal` and `decimal-to-fraction`
        (9.10, 9.11) need a required *form*, which no answer type expresses.** `checkAnswer`
        compares exact rationals, so `3/4` and `0.75` are the same answer to it, and each skill is
        currently passable in precisely the notation it is teaching away from. `requireSimplified`
        is the nearest thing and constrains fractions only. Decide it as an answer-type change,
        with the same care item 3 took over the four `checkAnswer` results.
      - **10a** `percent-meaning`–`percent-of` · **10b** `find-the-percent`–`simple-interest` —
        `find-the-whole` (10.7) is a major wall; no new capability, and 10.9–10.10 lean on the
        money intuition the curriculum asks for.
      - **11a** `write-ratios`–`unit-conversion` · **11b** `ratio-words` — `unit-conversion` (11.6)
        needs a stated conversion set, or a generator drawing arbitrary units teaches lookup
        rather than proportion. `ratio-words` (11.7) is a wall on part-to-part vs part-to-whole
        and is the last phrasing-bank consumer in the stage.

- [x] **20 · Expression input** — M — **two increments**

      Variables on the keypad. First needed at Unit 13.

      **20a · Answers that are not scalars.** `Misconception.value: number` and a `diagnose()`
      that does `Number(raw)` mean any non-scalar answer silently loses diagnosis — and
      `generateProblem` filters predictions with `Number.isFinite`, so they do not merely miss,
      they are dropped before the learner sees the problem. Stage E carries eight walls and four
      of them — `words-to-expression`, `combine-like-terms`, `distributive` and
      `distribute-negative`, all Unit 13 — answer with an expression. The content contract wants
      two distinct surviving predictions on every wall, so this is a gate on Unit 13 rather than
      a nicety, and item 22 needs the same generalisation for a point. Ship it on its own: it
      touches the diagnosis path every built skill already uses, and that is not something to
      change in the same breath as a new input mode.

      **20b · The mode.** Variable keys on the pad, an expression parser, and the decision this
      increment exists to make: **what counts as the same expression.** `2x + 3` and `3 + 2x` are
      one answer; `2(x + 1)` and `2x + 2` are one answer at 13.6 and two different ones at 13.8,
      where un-distributing *is* the skill. Canonical form is the mechanism; which skills demand
      which form is the content decision, and it belongs to the answer type, not to a checker
      each generator writes for itself.

- [x] **21 · Stage E · Units 12–15** — L — 34 skills, seven changes — **shipped 2026-08-14**

      `distribute-negative` (13.7) is a major wall.

      Ordered increments:

      - **12a** `exponent-meaning`–`exponent-divide` — needs item 17's notation for superscripts
        and the radical; `evaluate-powers` (12.2) is a wall on reading 3⁴ as 3 × 4, which is the
        misconception the notation itself invites. **Shipped 2026-08-13.** `exponent-multiply`
        and `exponent-divide` ask for the resulting exponent as a number rather than an
        expression, since `expression-input`'s grammar excludes exponents; a `PowerData` payload
        on the `math` display (alongside the existing `FractionData`/`RatioData`) carries the
        base, exponent(s), or radicand for independent verification.
      - **12b** `power-of-power`–`pemdas-exponents` — `scientific-notation` (12.9) is the first
        skill wanting ×10ⁿ, and `pemdas-exponents` (12.10) completes 5.3. Item 12 deliberately
        kept Unit 5's expression model local to Unit 5 and said this unit should shape its own;
        whether to extend it or write a second one is the decision to record here. **Shipped
        2026-08-13.** The second consumer moved Unit 5's numeric expression tree into the engine
        and added a structural power node, with Unit 5's output unchanged. Scientific notation
        reads exact ordinary numbers from ×10ⁿ, and negative exponents answer as exact fractions,
        making `fraction-input` an explicit Stage E requirement.
      - **13a** `variable-meaning`–`distributive` — the first content on item 20, and it needs
        both increments of it: three of these six are walls answering with an expression.
        **Shipped 2026-08-13.** `variable-meaning` and `evaluate-expression` stay numeric via
        the keypad; `identify-like-terms` uses choice input; `words-to-expression`,
        `combine-like-terms` and `distributive` are `expression-input`'s first callers, all
        under `form: 'expanded'`. A new `AlgebraData` payload on the `inline` display (beside
        `wholeNumber`/`decimal`) carries the source operands for independent verification,
        following the `PowerData` precedent from item 21's Unit 12 work.
      - **13b** `distribute-negative`–`factor-gcf` — 13.7 is the major wall (sign on the second
        term); `factor-gcf` (13.8) is where 20b's "same expression" decision is load-bearing,
        since the answer is a factored form and the expanded one is exactly wrong. **Shipped
        2026-08-13.** `distribute-negative` stays on `expanded` like 13.6 and draws both
        bracket signs, so the second term's sign cannot be guessed from the shape. `factor-gcf`
        is `exact`'s first caller, and making it load-bearing exposed that the structural
        serializer did not parenthesize its children — `3(x + 4)` and `3(4) + x` shared a
        canonical form — so `exact` now separates grouping at every depth. Its draw keeps the
        two remaining coefficients coprime, which is what makes the greatest common factor the
        only correct answer.
      - **14a** `equation-balance`–`equation-parentheses` — answers are numbers, so the keypad
        carries it, with the sign key declared per problem as Unit 6 established. **Shipped
        2026-08-14.** Left behind: **an `equation` arm on `Display`**, carrying the text, the
        variable and an `EquationData` payload, rendered as the equation on one row and
        `x = ⟦slot⟧` beneath. It is not an `inline` with a flag, and the reason is the
        measurement rather than taste — an inline row spends part of its width on the
        trailing `=` and the answer slot, which is what item 12's 18-character cap was
        measured against, and an equation row spends none of it. One cap cannot be right for
        both, so `coverage.test.ts` now measures the two separately.
        `equation-balance` teaches the axiom rather than naming an inverse: an earlier draft
        asked what to apply to both sides of `x + 7 = 12`, whose answer is a number already
        printed on screen and is anyway 14.2's question one step early.

        Two findings worth carrying into 14b. **A fractional predicted misconception is dead,
        not dropped** — filtering removes predictions equal to the answer, duplicates, and
        non-finite values, and `8 ÷ 6` is finite, so it survives every existing gate as a
        diagnosis the whole-number pad can never submit. `one-step-multdiv` shipped one until
        the unit's own test checked predicted values for integrality. That is also why every
        draw here composes from the value its predictions divide by rather than drawing and
        filtering. And **`sourceMagnitude()` in `generators.test.ts` is the one consumer of a
        new `Display` arm the compiler does not force**: it ends in a fallback to the
        problem's own answer, so an unhandled arm measures the difficulty ladder against the
        answer and stays green.
      - **14b** `with-fractions`–`rearrange-formula` — two skills break the pad: `rearrange-formula`
        (14.10) answers with an expression, and `special-solutions` (14.8) answers "no solution"
        or "infinitely many", which is not a value at all and wants choice input. Name both in the
        proposal; neither is a generator detail. **Shipped 2026-08-14**, completing Unit 14.

        **`rearrange-formula` needed no new grammar, and that is the finding.** "Solve for y"
        reads like a two-variable answer with division in it, and `expression-input` admits
        neither — but `y` is the *frame label* and is never typed, so the answer holds only
        `x`. Composing the draw so the subject's coefficient divides both other terms keeps
        division out of the answer entirely. The alternatives were widening the grammar
        (capability work, which never travels with its content) or choice input over rendered
        rearrangements — rejected because Unit 16 needs the producing skill, not the
        recognising one.

        Left behind: **the `equation` arm's two optional fields**, each with one consumer.
        `notation` settles the question 14a deferred — `with-fractions` needs a real stacked
        fraction, so the arm grew a notation field rather than merging with `math`, and `text`
        keeps all three of its jobs (the plain row, the accessible name, the form verification
        rebuilds). An optional `variable` drops the framed row where the answer is not a value
        of anything. `story` also gained an `equation` payload, since a pair of operands and
        one operator states one operation and an equation word problem states two.

        **The frame row had to go entirely, and only the browser check said so.** Dropping the
        label alone passed every test: the slot still rendered, so the chosen answer was still
        echoed. On screen it is a blinking entry cursor above no keypad — and what it echoes is
        `entry`, which for a choice problem is the **id**. Every earlier choice skill names its
        options by their own text (`3x`, `prime`, `<`), so the slot reads correctly there by
        coincidence; these options are sentences with slug ids, so it drew `none`. Third time
        the browser check has paid for itself after items 12 and 16.

        Two more the gates caught rather than a reviewer. The recorded-output gate exposed
        `rearrange-formula` predicting **`1x+2`** — a mistake no learner can make, because the
        pad emits `x+2`. That is the dead-not-dropped trap 14a documented for numbers, reached
        through notation instead of arithmetic, and it also had `y = -1x + 2` in a solution
        step. And `npm test` was green with a type error in a new coverage case: `generators`
        is a `Map`, so iterating it yields entries. `npm run build` is the check that reads
        types, exactly as AGENTS.md says.

        Also here: **Stage E now declares `choice-input`**, owed since 13a when
        `identify-like-terms` began answering through it. Nothing unlocked — the capability has
        shipped since item 5 — but a stage's `requires` states what its own skills need, which
        is the correction Stage B took in item 11. A coverage case now derives the used input
        modes per stage, so the next omission fails at the unit that causes it rather than one
        unit later.
      - **15** `inequality-symbols`–`compound-inequalities` — `flip-the-sign` (15.5) is a major
        wall and has its own skill on purpose. **`graph-inequality` (15.2) has no input mode
        today:** item 13's line submits one tick's value and cannot express an open circle or a
        shaded ray. Either the skill picks among rendered lines (choice input, built) or the line
        component grows — and growing it is capability work with its own item, decided before this
        increment is proposed rather than inside it. **Shipped 2026-08-14**, completing Unit 15,
        Stage E and this item.

        **The fork above was wrong, and that is the finding.** "Picks among rendered lines
        (choice input, built)" assumes a choice can draw a figure. `Choice` is
        `{ id, label: string }` and `ChoiceInput` renders the label as text, so a choice that
        draws a line is the same capability work as growing `NumberLineInput` — not the built
        alternative to it. With that gone the real fork was a described graph or a new rendering
        capability whose only consumer in the whole course is this one skill; item 22 delivers a
        plane, not a line with rays, so nothing downstream inherits it. **A drawn inequality graph
        is therefore declined rather than deferred.** If it is ever wanted it is its own item, and
        the reason to want it is pedagogy — reading a graph is a stronger skill than naming one —
        not a second consumer.

        That decision generalised to the unit and is the reason it needed no capability at all.
        **A solution to an inequality is a relation, not a value:** `−3x > 12` solves to `x < −4`,
        and the pad submits the `−4` and nothing else, which drops the direction that is the whole
        content of 15.5. Choice labels are plain strings and `x < −4` is a plain string, so five
        skills answer through choice input and only `compound-inequalities` takes the pad, where a
        count genuinely is a value — which also stops the unit being five multiple-choice screens
        in a row. Stage E already declared `choice-input` since 14b, so `requires` and
        `AVAILABLE_CAPABILITIES` are both untouched.

        Left behind: **six `EquationData` arms and a `Relation` type**, on the existing `equation`
        display arm rather than a new one. An inequality is a statement already carrying its
        relation, which is what that arm was built for; the row measures, renders and announces
        identically, so a fourth arm would have duplicated `EquationView` and its size ladder for
        no measured difference — 14a's own test, applied the other way. The arm's doc no longer claims
        such a statement is "answered by the value of `variable` that makes it true", which is what
        the frame row asserts and what the five choice-answered skills therefore drop. One arm covers
        15.3 and 15.5 with a **signed** coefficient, so the reversal is one rule keyed on a number
        the display shows, rather than two arms that could drift.

        Three findings the tests would not have given for free. **Sorting the options leaks the
        answer** — the three distractors are derived *from* it, so under `< ≤ > ≥` the correct
        option lands at position 1, 2, 2 and 3 as the relation runs through the four symbols and
        position 4 is never right. `special-solutions` sorts safely only because it draws its
        *answer* from a fixed list, which is the opposite direction; here the order is drawn from
        the problem's own rng. The same skill leaked twice over: with the right-hand side always
        positive, `c ÷ −a` is negative every time and "pick the option with the minus sign" is
        right without reversing anything, so 15.5 draws that side signed. And **the central filter
        does not protect a text prediction**: `generateProblem` compares against
        `Number(answer.id)`, which is `NaN` for `x<-4`, so a prediction equal to the answer would
        survive where on a keypad skill it could not. Five of the six skills predict text, and the
        unit asserts it itself.

        **The browser check paid for itself a fourth time, after items 12, 16 and 14b.** All six
        displays began with the frame row dropped, on the reasoning that no answer in the unit is
        a value of x. True of the five answered by choices; false of `compound-inequalities`,
        which has a keypad, so what shipped was entry with no feedback — the learner pressed a
        digit and nothing on screen moved. Every assertion passed, because a missing row is not
        something an element query thinks to ask about. It is 14b's finding read backwards: that
        increment dropped a slot that had no keypad, this one restored a slot that had one. The
        rule under both is that the frame is a **claim** — the answer is a value of the thing
        named — false of a graph or a solved relation, true of a count, so it frames `how many`,
        a label rather than a variable name in the way `equation-balance` frames `each side`.

        Two composition traps, both of the shape 14a named. `3x + 4 ≤ 19` mis-orders to `19/3 − 4`,
        a fraction no option can state and no learner reaches, so 15.4 draws its constant and
        right-hand value as multiples of the coefficient — the mistake has to be *offerable*, not
        merely distinct. And 15.6's two diagnoses can collide with each other rather than with the
        answer: the complement landed on the loosened count, `generateProblem` deduped it away, and
        the skill quietly predicted one mistake where its contract promises two. Its upper bound is
        drawn from the values that leave both standing.

- [x] **22 · Coordinate-plane input** — L — **two increments** — **shipped 2026-08-16**

      First needed at `plot-points` (16.1) — the only skill in the course marked both `quick` and
      a wall.

      **22a · The plane draws — shipped 2026-08-16.** Much of Unit 16 *reads* a graph rather than making one:
      `table-to-graph` (16.3), `slope-from-graph` (16.4), `graph-from-equation` (16.8) and
      `equation-from-graph` (16.9) all need axes, gridlines and a plotted line on screen before
      any tap is involved, and `system-by-graphing` (17.1) needs two. That is a display arm,
      subject to item 12's size-ladder measurement, with an accessible name per graph.

      The shipped arm carries zero-aligned integer axis scales, plotted lattice points, and up
      to two mathematically distinct infinite lines defined by two points. One pure owner
      validates the graph, clips lines with exact rational boundary math, rejects coincident or
      unrenderably collapsed segments, and derives the complete accessible name. A responsive
      local SVG draws thinned tick labels, emphasized axes, points, and solid/dashed line styles
      clipped to the plot frame so a system does not rely on color alone or paint past its
      bounds. The densest 20-interval plane and representative choice and typed answer
      compositions were measured at 375px. Every exhaustive `Display` consumer records or
      names the graph explicitly, while independent answer verification fails closed until a
      content change declares whether the graph is being read for slope, equation, quadrant,
      or intersection. `coordinate-plane` remains unavailable: drawing is only the first half
      of the stage's input capability, so item 22 stays open for 22b.

      **22b · The plane accepts — shipped 2026-08-16.** Tap to place, then confirm — item 13's rule, and for the same
      reason: a plane packs far more targets into 375px than a line does, so a tap one square out
      is a slip rather than a wrong answer. Needs an `Answer` arm for a point (the union is exact,
      approx, choice and expression today) and item 20a's non-scalar misconceptions, since
      (3, 2) plotted as (2, 3) is *the* predicted mistake of 16.1 and unrepresentable as a number.
      `coordinate-plane` joins `AVAILABLE_CAPABILITIES` here.

      The shipped surface reuses the graph's declared integer ticks as the only reachable
      targets. Each target is real button markup, with one roving tab stop and one-tick arrow
      movement. Large x−, y−, origin, y+, and x+ controls provide a precise touch route across
      even the densest plane, while Check stays disabled until a point is placed. A second
      placement corrects the first before submission. Points are structured ordered-pair answers and misconceptions;
      central validation rejects off-plane answers and drops off-plane, duplicate, or
      answer-colliding predictions. Recorded output names points, while independent answer
      verification remains fail-closed until a content generator supplies operation-specific
      source data. Unit 16's ten skills and Unit 17's four systems skills now use the shared
      plane; the first six Unit 18 polynomial skills are playable, so eight Stage F skills are
      still ahead.

- [x] **23 · Stage F · Units 16–19** — L — 28 skills, eight changes — **shipped 2026-08-24**

      Ordered increments:

      - **16a — shipped 2026-08-16.** `plot-points`–`y-intercept` use item 22's shared plane
        for point placement, quadrant reading, a semantic x/y table, slope, and intercept work.
        Structured operation data keeps every answer independently derivable from what is visible.
        `plot-points` predicts swapped coordinates and reversed vertical direction as reachable
        points; the `slope-from-points` wall preserves distinct inconsistent-order and reciprocal
        diagnoses. Exact rational slope answers expose fraction and sign keys only when needed.
      - **16b — shipped 2026-08-17.** `slope-intercept`–`parallel-perpendicular` read and
        write linear equations, choose between two solid/dashed candidate lines, and derive
        exact parallel or perpendicular slopes through the existing answer surfaces. The
        graph-choice design uses one full plane and ordinary text choices, with the matching
        line randomized across declaration order and button position.
      - **17 — shipped 2026-08-19.** `system-by-graphing`–`system-words` answer ordered pairs
        throughout as the second consumer of 22b's point answer. Graphing keeps two visible
        lines; substitution and elimination show structured equation pairs; the fixed pass-sales
        frame exposes both equations. `elimination` (17.3) is a wall on forgetting to scale both
        sides, with two reachable point diagnoses that survive filtering.
      - **18a prerequisite — shipped 2026-08-23.** Expression answers keep degree one as
        the default and may opt into degree two. The answer now owns the variable and degree
        used by the keypad, parser, checker, and recorded output. A bounded polynomial
        canonicalizer accepts conventional `x²` and quadratic products, while the four-column
        keypad exposes one square key only when declared. This tooling change adds no generators,
        so the remaining Unit 18 skills remain planned until their content increments land.
      - **18a — shipped 2026-08-23.** `add-polynomials`–`factor-trinomial` — expression answers
        throughout (item 20); `factor-trinomial` (18.6) is a major wall, and `sub-polynomials`
        (18.2) is Unit 6's minus-a-minus mistake one abstraction up. The six generators derive
        answers from structured polynomial sources and keep the long rewrite surface readable
        at the installed phone width.
      - **18b prerequisite — shipped 2026-08-24.** Root-pair answers carry two exact rational
        values and accept either order through two labelled slots sharing one numeric keypad.
        Central checking, misconception diagnosis, recorded output, lesson routing, and Stage F
        capability resolution all name the new shape. This tooling change adds no generators,
        so all three Unit 18b skills remain planned.
      - **18b — shipped 2026-08-24.** `difference-of-squares`–`quadratic-formula` use exact
        expression and unordered root-pair answers over operation-specific polynomial sources.
        Difference-of-squares requires conjugate factors; factored equations expose both
        zero-product roots; and the quadratic formula is supplied through structured notation
        beside its generated equation and coefficient mapping. Formula frames keep a positive
        perfect-square discriminant and introduce non-monic rational roots at higher difficulty.
      - **19 — shipped 2026-08-24.** `function-notation`–`compare-functions` complete Stage F's
        final five generators. Function notation keeps multiplication and input-output reversal
        diagnoses distinct; evaluation substitutes into generated linear rules; domain and range
        use finite plotted functions; linearity compares exact consecutive rates; and
        `compare-functions` presents a semantic table, graph, and equation through the existing
        plane without a chart capability.

- [x] **24 · Chart rendering** — M — shipped 2026-08-24

      Chart data now lives on `Problem` displays and supports bar, line, and scatter forms.
      A shared responsive SVG provides labelled axes, ticks, legends, grouped bars, line
      markers, scatter points, and clipped trend lines at the 375px target. Each chart also
      exposes one derived image name and a semantic values table, while the existing keypad
      and choice answer frames remain neutral and truthful. Recorded output, content-rule
      collection, and difficulty verification fail closed until chart-specific data is
      supported. `chart` is now available to the manifest, completing Stage G's infrastructure
      without making any Stage G skill playable before its generators land. Math notation and
      diagram rendering were already available and remain part of Stage G's requirements.

- [x] **25 · Skill intros** — L — **four increments** — **shipped 2026-08-27**

      `docs/curriculum.md`'s content style contract has promised a **teaching line** and **one
      worked example**, "shown once, before the first problem", since before item 0 — and
      nothing has ever drawn them. A lesson opens straight onto its warm-up, so a learner
      meeting a new skill is asked a question about something the app never showed them. This
      item pays that promise back. It sits here rather than earlier because the intro draws its
      example with the same renderers the problem does, and the last of those landed in item 24.

      **The worked example is generated, not written.** A generator already produces a concrete
      problem with its `display`, its `answer` and up to four `solution` steps computed from the
      operands it just chose — which is exactly "concrete numbers, never symbols" with the
      working shown. So an intro is that generator called at difficulty 1 with the solution
      revealed instead of hidden, and every visual in the course comes along for free: the
      example renders through `ProblemView`'s existing `Display` arms, so a fraction arrives as
      notation, Unit 7 as a diagram, Unit 16 as a plane and Unit 21 as a chart, with no second
      renderer and no per-skill artwork. Prose that a human writes is then one sentence per
      skill, which is the whole of what `SkillGenerator` gains.

      Three things to settle in 25a's proposal rather than in a generator:

      - **What "once" means.** Shown once per skill needs a seen-flag on `SkillProgress`, and
        `reconcile()` merges a stored skill per object, so every record saved before the field
        existed carries nothing — read-time defaulting, the shape items 1 and 27a both use.
        Defaulting to *unseen* re-shows the intro to existing learners once, which is the
        harmless direction; defaulting to seen hides it from exactly the people who never got
        one. Either way it stays reachable after the first time, since a learner who returns to
        a skill months later wants the reminder, not a lesson that assumes it.
      - **Whether it can be skipped, and what that costs.** A tap past it must not count as
        seen-and-understood in any way review or skip-ahead later reads.
      - **What gates the new prose.** `content-rules.ts` is the one place a generator's text is
        checked, so the teaching line's one-sentence limit and the vocabulary budget belong
        there beside `MAX_SOLUTION_STEPS`, not in a new checker. Its `VOCABULARY` map already
        holds the "max 1 new word per skill" rule the teaching line is most likely to break.

      A standing constraint: the intro is another screen the size ladder in `coverage.test.ts`
      measures, and a worked example is a display *plus* its solution steps, which is more on
      screen at 375px than any problem has had to fit. That is item 12's finding arriving in a
      new place, and it is why 25a ships a stage's worth of content rather than one pilot skill.

      Ordered increments:

      - **25a** The screen, its data, and Stage A's 8 skills — shipped 2026-08-25. Unit 0 now
        opens with one authored teaching line and one fixed difficulty-1 generated example,
        rendered through `ProblemView` with shared worked steps and a learner-facing answer
        label. `introSeen` is optional presentation state: old and synced records read as unseen,
        Start practice marks only that flag, and **Review intro** returns to the same active
        problem only while the learner is answering. No attempt, mastery, reward, unlock, or
        lesson seed changes on the intro path.
      - **25b** Stage B — 44 skills across Units 1–5 — **shipped 2026-08-26**. Every Stage B
        generator now carries its reviewed one-sentence teaching line, including the existing
        multiplication-table helper's seven declarations. The fixed difficulty-1 intro examples
        remain generated through each skill, with independent visible-data answer checks and
        unchanged recorded output, wall diagnoses, lesson behavior, and progress state. Coverage
        derives Stage B from the manifest, checks all 52 Stage A/B lines, and pins Unit 4's four
        current vocabulary terms. The 375-by-812 browser gate covers all 44 intros; no new
        capability, renderer, dependency, or progress field was needed.
      - **25c** Stages C and D — 59 skills — **shipped 2026-08-26**. The manifest-authoritative
        nine Stage C and 50 Stage D skills now carry reviewed one-sentence teaching lines beside
        their generators. Their fixed difficulty-1 examples remain generated through the shared
        renderer, including Unit 7's diagrams, with independent visible-data answer checks and
        unchanged prompts, answers, solutions, wall diagnoses, lesson behavior, and progress
        state. Coverage derives the 59 ids from the manifest, checks all 111 Stage A–D lines,
        and pins the six current-unit vocabulary sequences. The focused suites, full test,
        build, lint, and 375-by-812 browser gate cover the complete increment; no new capability,
        renderer, dependency, or progress field was needed.
      - **25d** Stages E and F — 62 skills, the notation- and plane-heavy end of what is built —
        **shipped 2026-08-27**. Every playable generator now carries its reviewed one-sentence
        teaching line, and `teachingLine` is required on both `SkillConfig` and `SkillGenerator`
        with `defineSkill` remaining the sole copy boundary. Fixed difficulty-1 examples still
        come from each generator through the shared renderer, including math notation,
        expression answers, coordinate planes, and root pairs. Independent unit checks recover
        answers from visible or semantic data, while coverage derives all 62 ids from the
        manifest and pins the current-unit vocabulary sequences. Recorded output, lesson
        behavior, progress state, wall diagnoses, and existing answer surfaces remain unchanged.
        The complete 375-by-812 browser gate covers all 62 intros; no new capability, renderer,
        dependency, or progress field was needed.

      **Stages G and H carry their own**, rather than waiting for a fifth increment here: from
      25a onward a teaching line and a worked example are part of what shipping a skill means,
      which is the exit-criteria line above and the reason items 26 and 30 need no clause of
      their own.

- [x] **26 · Stage G · Units 20–21** *(was 25)* — M — 22 skills, five changes

      Geometry teaches *choosing and applying* the formula the GED provides, never memorising
      it.

      Ordered increments:

      - [x] **20a** `perimeter`–`area-circle` — **shipped 2026-08-29**. The geometry figures land here,
        as the extension
        item 18 deliberately did not guess at: labelled dimensions, units, and a right-angle mark.
        Two policies to set once for the whole unit rather than per skill: π (the GED sheet's
        3.14) and how a rounded answer is checked, which is what the `approx` answer arm with its
        tolerance had been waiting for since before anything used it. Six generated skills now
        provide exact polygon answers, rounded circle answers, accessible local figures, formula
        choices, wall diagnoses, and reviewed intros; 20c is shipped, while Unit 21 remains open.
      - [x] **20b** `composite-figures`–`pythagorean` — **shipped 2026-08-30**. Composite figures,
        rectangular prisms, cylinders, cones, pyramids, spheres, a six-face surface-area net,
        and right triangles now provide derived dimensions, neutral formula choices, exact or
        rounded answers, reviewed intros, and wall diagnoses. `surface-area` (20.11) is the heaviest drawing
        in the course and wants a net rather than a solid; `pythagorean` (20.12) is a wall on
        hypotenuse placement and uses item 17's radical. 20c is shipped, while Unit 21 remains open.
      - [x] **20c** `similar-figures` — **shipped 2026-08-30**. Paired rectangles show three
        visible corresponding measurements, two equivalent proportions, and one exact missing
        side through the existing numeric keypad and diagram surface.
      - [x] **21a** `mean`–`read-scatterplot` — **shipped 2026-08-31**. 21.1–21.4 use typed
        value lists; 21.5 and 21.6 consume item 24's chart surface. `median` (21.2) is a wall
        on forgetting to sort, with a prediction the generator computes exactly. All six skills
        carry exact source data, independent answer checks, reviewed intros, and phone-sized
        list or chart examples.
      - [x] **21b** `basic-probability`–`counting-outcomes` — **shipped 2026-08-31**. The
        required-form question item 9b settled applies again here: a probability answers as a
        fraction through the existing `requireFraction` check and the pad's fraction slash, the
        same shape `write-ratios` already ships, with no reduction required. `basic-probability`
        and `compound-probability` carry typed favourable-and-total counts beside the story so
        verification rebuilds every display and answer without trusting the stated one;
        `compound-probability` is the wall, multiplying for `and` and adding for `or`, with two
        collision-proof diagnoses — swapping the cue's operation, and adding numerators and
        denominators across events. `counting-outcomes` answers as a whole number through the
        fundamental counting principle, predicting the classic add-instead-of-multiply miss.
        Stage G declares the already-available `fraction-input` capability with its first
        consumer, and all twenty-two Stage G skills are now playable, closing this item.

- [x] **27 · Review and spaced repetition** — L *(was B6, then 26)* — **three increments**

      Review lessons, per-skill strength, and the stats surface. Ordered before skip-ahead
      because it is what makes skip-ahead safe.

      **27a · Strength and the schedule — shipped 2026-09-01.** New fields on `SkillProgress` — strength, when a skill
      is next due, how many review attempts it has taken — and a pure scheduler beside them, in
      `lib/` rather than the store, the way `checkpoint.ts` and `lesson.ts` already are. Two
      things to know before writing them: `reconcile()` merges a stored skill **per object**, so
      a record saved before the field existed carries nothing and `emptySkill()` never runs over
      it — the default has to be applied at read time, which is the shape item 1's never-re-lock
      rule already uses and for the same reason. The endpoint stores the blob opaquely, so the
      round trip needs no change; what needs a test is today's stored record surviving the new
      fields.

      **27b · The review lesson — shipped 2026-09-01.** `lesson.ts` now carries each queue
      slot's generator and base difficulty, so standard lessons and mixed review lessons share
      one lazy practice loop. Review selection is bounded and oldest-first; each recorded slot
      answer updates its skill's aggregate and recall state in one local write, and completion
      pays the repeat-lesson reward once. **This is the increment two later items wait on.**
      Item 28's check-first sampling and Stage H's mixed reviews are this mechanism with
      different selection, so neither should grow its own.

      **27c · Where it is seen — shipped 2026-09-01.** A review entry point that appears only when something is due,
      per-skill strength on the skill tree, and the "you keep doing X" insight that the store's
      `mistakes` map has been accumulating tags for since before there was anywhere to show them.

- [x] **28 · Skip-ahead** — L *(was B5, then 27)* — **three increments**

      The full flow from [skipping ahead](curriculum.md#skipping-ahead). Every route is optional
      to the learner and reversible at any time.

      **28a · Marking a block known, and taking it back — shipped 2026-09-01.** `source:
      'practiced' | 'tested-out' | 'self-assessed'` on `SkillProgress`, and a block mutation in
      `lib/skip.ts` **raising** every playable skill in a stage or unit to mastery 3 — clear of
      `UNLOCK_THRESHOLD`, short of `MAX_MASTERY`, so a skipped skill reads as "not needed yet"
      rather than finished. It raises rather than sets because no rule may reduce an earned
      mastery level, and it records the source only on the skills it actually raised, which is
      what makes "actually, let me practice this" safe: the reversal returns **only the skills
      the skip granted** and leaves practised ones alone. A second field, `priorMastery`, records
      the level each raised skill came from, because a skill practised to 1 or 2 is still raised
      — below `UNLOCK_THRESHOLD` the course would stay shut — and `source` alone cannot say how
      much of the level was granted; the reversal restores that level rather than resetting to 0,
      so it is 0 for a skill the skip found untouched and the earned level for one it found
      part-practised. Completing a lesson converts a skipped skill back to practised and clears
      the granted level with it. Same read-time defaulting as 27a, since an existing record has
      neither field; `hasPractised()` already reads mastery for exactly this case, which item 1
      wrote down before anything could produce it.

      **28b · Check first — shipped 2026-09-01.** Eight problems sampled across the block at
      difficulty 3, ≥7 correct to skip, and a failing run offers the first unmastered unit with no
      penalty framing.
      Sampling many skills into one session is 27b's, which is why this waits rather than
      duplicating it. Both entry points land here: per stage on first launch, and the "I already
      know this" affordance on a locked or unstarted unit — the second matters most, because it
      lets the decision wait until the learner knows what the app is like.

      **28c · The safety net — shipped 2026-09-02.** A skipped skill enters review at low strength so it resurfaces
      sooner than a practised one; below 60% accuracy across 5+ review attempts the app quietly
      offers to warm its unit up; and a downstream skill failing repeatedly points back at the
      skipped prerequisite, which is the actual cause and the one thing the learner cannot see.
      All three read counters that 27a and 27b maintain, which is the whole reason review is
      ordered first.

- [ ] **29 · Timed mode and score estimator** *(was 28)* — M — **two increments**

      **29a · The timer.** A clock on the session and `timed` into `AVAILABLE_CAPABILITIES`,
      which is what makes Stage H playable at all. It stays a property of the session rather than
      a setting: "no time pressure until Stage H" is a curriculum commitment, and a global switch
      would erode it by accident.

      **29b · The score estimator.** Raw score to a GED scaled estimate, with the mapping written
      where a reader can check it and the result presented as an estimate. This is the only place
      the app says anything about an official test, so the caveat is part of the feature rather
      than a disclaimer bolted to it.

- [ ] **30 · Stage H · Unit 22** *(was 29)* — S — 6 skills — **two increments**

      Closes the course, and the only unit whose skills are not all ordinary lessons.

      **30a · `calculator-skills`–`review-algebraic`.** 22.1 teaches TI-30XS operation, and the
      open question is what the learner operates: the GED supplies the calculator and this app
      does not, so either the skill teaches key sequences as text and choices, or something
      calculator-shaped gets built. Decide that in the proposal, not in the generator. 22.2
      renders the provided formula sheet in item 17's notation. 22.3 and 22.4 are mixed reviews
      across the whole course, sampling other skills' generators — that is 27b's session, so they
      cannot ship before it.

      **30b · `timed-practice-1`, `timed-practice-2`.** Full-length forms on item 29's clock,
      sampled the way 22.3 and 22.4 sample. Two skills, but each is a test form rather than a
      ten-problem lesson, which is why they are not a tail on 30a.

- [ ] **31 · Streak reminders** — S *(was B7, then 30)* — **two increments**

      Last because it is the only item nothing else depends on.

      **Note, off-roadmap work landed here.** The streak-stakes branch shipped the streak
      model (`src/lib/streak.ts`), freezes, milestones, a coin multiplier, streak-locked
      cosmetics, and a home-screen card that **already warns when a live streak has no lesson
      yet today**. That warning is 31a's nudge. What is left of 31a is whatever the proposal
      wants beyond it — a nudge somewhere other than the home screen, or on returning to the
      app — and 31b is untouched. Re-scope this item against `openspec/specs/streak-progression`
      before proposing it rather than building the card a second time.

      **31a · The in-app nudge.** Works on every platform and asks for no permission, and the
      state is already there: `streakCount` and `lastActiveDay` are on the record and the store
      breaks a stale streak on load, so this reads existing values rather than adding any.

      **31b · System notifications where they actually work.** Permission asked at a moment the
      learner has earned something, never on first launch. Worth an honest caveat: iOS PWA
      notification support is narrow and may not reach an installed home-screen app reliably. If
      it does not, 31a is the shipped answer and that is an acceptable outcome — which is why it
      ships first. Verifying on real hardware is launch work and out of scope below.

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

- Each item uses `openspec-propose` and ships through `openspec-apply-change`. A content
  change adds no more than six generators; larger units use their ordered increments and
  remain unchecked until all of them ship.
- Create changes just in time, one or two ahead. Proposals written months early against
  unbuilt infrastructure rot.
- `docs/curriculum.md` stays the content authority; `src/curriculum/manifest/` is its
  machine-readable twin, and the two cross-check in the test suite.
- `src/lib/content-rules.ts` gates every new generator — at most 4 solution steps, 12 words
  each, one-sentence hints, and two distinct predicted misconceptions on any wall skill.
