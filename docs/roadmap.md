# Math Quest — Road to v1.0

What is left, in the order it should be done.

**Status: 7 of 201 skills are playable.** All seven are in Units 1–2. No capability beyond
the plain number keypad is built. This line is the only progress number in the repo's
documentation — the manifest and `npm test` are the authority, and everything below is
scope rather than status.

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
`src/curriculum/manifest/resolve.ts` is empty today. Adding a capability there is a one-line
edit that flips its stage on — which is why capability work is its own item, never bundled
with the content it unblocks.

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

- [ ] **2 · Unit 1, the remaining three** — S

      `add-facts-small`, `add-tens`, `add-three-numbers`. Completes the first unit, and
      produces the course's first `quick` skill, without which item 4 cannot be demonstrated.
      `add-three-numbers` is the first consumer of a three-operand column trace, which item 0
      deliberately deferred.

- [ ] **3 · Per-problem keypad rules** — S

      `Lesson.tsx` renders `<Keypad>` with no flags and calls `applyKey(prev, key)` with no
      rules, so `allowNegative`, `allowDecimal` and `allowFraction` are all unreachable —
      `src/lib/keypad.ts` implements and tests all three, and nothing passes them. Carry
      `KeypadRules` on the problem and plumb them through.

      This is one small change that unblocks three separate stages, rather than the three
      independent items the previous version implied. While here, surface the
      `'not-simplified'` result that `checkAnswer` already returns and `Lesson.tsx` currently
      collapses into a plain wrong answer — that is the teachable moment Unit 7 is built on.

- [ ] **4 · Lesson mechanics** — M *(was half of B1)*

      The commitments in [anti-discouragement mechanics](curriculum.md#anti-discouragement-mechanics)
      that live inside a single lesson:

      - **`quick` skills end at 5 correct.** The manifest marks 19; `Lesson.tsx` hardcodes
        `TARGET_CORRECT = 10` and `SkillGenerator` does not carry the flag at all, so it has to
        reach the lesson from the manifest entry.
      - **Warm-up problem** one difficulty band below current — a guaranteed early win.
      - **Silent recovery:** three wrong in a row drops difficulty for the rest of the lesson,
        never surfaced to the learner.

      All three fight the same piece of architecture: difficulty is computed once at mount and
      the entire queue of ten is generated up front. The real work is making the queue lazy.
      The `quick` half is a `MODIFIED` delta against `skill-progression`, whose baseline states
      the 10 deliberately.

- [ ] **5 · Choice input** — S

      Render `problem.choices`. `inputMode: 'choice'` and `Answer.kind === 'choice'` both exist
      and `checkAnswer` handles them, but **no component has ever rendered a choice** — it is a
      dead branch, which is why this was missing from the previous version's capability table
      entirely.

      First needed at `compare-numbers` (0.5), whose skill line is literally "Use <, >, =".
      Also `order-numbers` (0.6), `compare-negatives` (6.2), `name-parts` (7.3),
      `compare-decimals` (9.3). Not in the `Capability` union, so it needs adding there too.

- [ ] **6 · Stage A · Unit 0** — M — 8 skills

      Place value, comparing, ordering, rounding. Where a learner who needs the beginning
      starts. `round-to-100` is a wall (the midpoint rule). Needs item 5.

      The previous version placed this inside a milestone it described as needing "no
      infrastructure that does not exist". That was wrong, and it is the correction that most
      changes this document's shape.

- [ ] **7 · Unit 2, the remaining six** — M

      Includes `sub-across-zero`, a wall — already supported: `columnTrace` handles borrowing
      through a zero. `sub-words` needs a subtraction frame bank, which is now a known
      quantity rather than a design question.

- [ ] **8 · Skill-tree navigation** — L *(was B3)*

      `Home.tsx` renders a flat list of one unit's skills. Twenty-three units need stage → unit
      → skill navigation, per-unit progress, and locked/planned states that stay hidden rather
      than teasing. Worth doing once items 2, 6 and 7 have made three units real.

      Worth knowing before designing it: despite the name, the derived graph is a **path**, not
      a tree — one root, and every skill has exactly one successor. Unless item 9's branching
      question is answered otherwise, this is navigation over a line, which is a much smaller
      problem than a tree.

- [ ] **9 · Stage checkpoints** — S *(was part of B1)*

      A celebration at each stage boundary, not just per skill. Separated from item 4 because
      it cannot fire until a stage is completable: all seven built skills are in Stage B, which
      is 44 skills. After item 6, Stage A is complete and becomes the first checkpoint the app
      can actually reach.

      **The "max 2 unlocks at once" commitment is dropped here, and needs a decision.**
      `docs/curriculum.md` promises it, but the manifest's derived graph has a maximum
      out-degree of **1** across all 201 skills — one root, every skill with exactly one
      successor. It is a straight line, because every unit uses the default derivation and a
      single `dependsOn` edge, and the `prerequisites` override the type supports is used by
      zero skills. Under that graph the course can never open more than one skill at a time, so
      a cap at two can never bind.

      The old hand-written generator graph did fan out to two (`add-facts` opened both
      `sub-facts` and `add-2digit-nocarry`), so **item 1 removed the only branching the course
      had.** That branching was an accident of how six generators were wired, not a designed
      choice, so losing it cost nothing — but it does mean the commitment now has no path to
      being met without deliberate `prerequisites` overrides in the manifest. The override the
      `SkillEntry` type supports is still there, still used by zero skills, and is the hook a
      decision to branch would hang on.

      Either the curriculum wants real branching or the commitment comes out of
      `docs/curriculum.md`. It is a curriculum decision, and item 1 deliberately left the
      promise standing rather than quietly resolving it. Item 1 also made the decision cheaper
      to act on: never re-locking a practised skill is exactly what makes a later graph change
      safe to ship to a learner mid-course.

- [ ] **10 · Unit 3 · Multiplication** — L — 14 skills

      Deliberately the slowest unit in the course; three walls (`times-7-8`, `mult-2by1`,
      `mult-2by2`). Opens with engine work: `ColumnOperator` is `'+' | '−'`, and partial
      products are a genuinely different shape. Expect to *extend* the engine here, not merely
      consume it.

- [ ] **11 · Unit 4 · Division** — L — 11 skills

      Long division needs a trace the engine does not have — quotient digits, remainders,
      bring-down — and it carries two walls. `factors`, `multiples` and `primes` may want a
      multi-value answer; decide when authoring whether that is choice input or a new mode.

- [ ] **12 · Unit 5 · Order of Operations** — S — 3 skills

      Closes Stage B. `two-operations` is a wall.

- [ ] **13 · Number-line input** — S

      Tap to place a value. Needed by `negatives-numberline` (6.1) and again by
      `fractions-numberline` (7.4).

- [ ] **14 · Stage C · Unit 6 · Negatives** — M — 9 skills

      The gate to all algebra, and nothing in it is optional. `sub-negatives` (6.5) is the
      major wall — minus a minus. Stage C declares no stage-wide capability on purpose, so that
      the eight keypad-answerable skills are not held behind the number line.

      Item 3 is the real gate. Not every skill here needs negative *entry* — `add-neg-pos`
      (−3 + 5 = 2), `sub-negatives` (5 − (−3) = 8) and `absolute-value` all have positive
      answers — but `add-two-negs`, `mult-negatives`, `div-negatives` and `negatives-mixed` do,
      and without `allowNegative` plumbed through they cannot be answered at all.

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
