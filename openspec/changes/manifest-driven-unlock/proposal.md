## Why

Both authoritative documents already say the manifest owns prerequisites. The
`curriculum-manifest` spec: "The manifest SHALL be the authority for skill ids, unit
membership, stage membership, and prerequisite relationships." `docs/curriculum.md`:
"Prerequisites are the previous skill in the unit, plus the last skill of any unit this one
depends on… The manifest derives these rather than storing them."

The runtime does not honour either. `isUnlocked()` in `src/store/progress.ts` reads
`SkillGenerator.prerequisites`, a second graph hand-written into each generator, and no test
compares the two. They already disagree on two of the seven built skills, and `add-words`
carries a comment admitting its edge was hand-copied from what the manifest *would* derive.
`AGENTS.md` records the gap as deliberate and points here.

Now, because every skill built after this is another stored progress record the
reconciliation has to reason about. Doing it at seven skills is a change; doing it at fifty
is a migration. This is roadmap item 1, and roadmap item 9's branching decision is
deliberately made cheaper by landing this first.

## What Changes

- `isUnlocked()` reads the manifest's derived unlock graph instead of
  `SkillGenerator.prerequisites`. The mastery-2 threshold is unchanged.
- **BREAKING (learner-visible):** two of the seven built skills change their unlock edges.
  Verified by running the resolver against the live registry, not taken from the roadmap:

  | skill | local edges today | local edges after | transitive gate |
  | --- | --- | --- | --- |
  | `add-facts` | — | — | 0 → 0 |
  | `add-2digit-nocarry` | `add-facts` | `add-facts` | 1 → 1 |
  | `add-2digit-carry` | `add-2digit-nocarry` | `add-2digit-nocarry` | 2 → 2 |
  | `add-3digit` | `add-2digit-carry` | `add-2digit-carry` | 3 → 3 |
  | `add-words` | `add-3digit` | `add-3digit` | 4 → 4 |
  | `sub-facts` | `add-facts` | `add-words` | **1 → 5** |
  | `sub-2digit-borrow` | `sub-facts`, `add-2digit-carry` | `sub-facts` | **4 → 6** |

  The roadmap describes `sub-2digit-borrow` as "loosening", and at the level of a single edge
  it does — the cross-edge to `add-2digit-carry` was never in the curriculum document. **That
  is not the learner-visible effect.** Because `sub-facts` now sits behind all of Unit 1,
  `sub-2digit-borrow` inherits that and ends up behind *more* skills than before, not fewer.

  **No skill unlocks earlier than it does today. Two unlock later, and both are in Unit 2.**
  Unit 2 becomes fully gated behind Unit 1, which is what the curriculum document intends
  (`unit-2 dependsOn unit-1`) and what the hand-written registry never implemented.
- **A practised skill is never re-locked.** `isUnlocked()` gates *starting* a lesson —
  `SkillCard` is `disabled={!unlocked}` — so a learner keeps mastery they can no longer
  practise or raise. Both `sub-facts` and `sub-2digit-borrow` can strand a learner this way.
  `SkillProgress.attempts` already records that a skill was practised, so the rule is enforced
  at read time rather than as a one-shot migration: a record can arrive from the sync endpoint
  at any time, and that endpoint stores it opaquely and never migrates.
- **BREAKING (internal):** `prerequisites` is removed from `SkillGenerator`, `SkillConfig`,
  and all seven generator declarations. A field read by nothing is drift waiting to happen,
  and the manifest tests already cover acyclicity, dangling ids, and roots across all 201
  skills — the three registry-graph tests in `generators.test.ts` are strictly weaker
  duplicates over seven.
- **Home's card order is corrected to curriculum order.** Found in audit, not in the roadmap:
  `Home.tsx` renders `unit01.skills` in registry order, which puts `sub-facts` second. After
  this change that card is locked until the learner has finished five other skills, so the
  list would read as a wall of padlocks with two open cards scattered through it. The array is
  reordered to match the manifest and a test pins it there. Ordering only — the proper
  split into Unit 1 and Unit 2 belongs to roadmap item 8.
- `AGENTS.md`'s note that `isUnlocked()` still reads the registry is replaced, since this
  change is the one it defers to.

## Capabilities

### New Capabilities

None. No new input mode, rendering capability, or entry in `AVAILABLE_CAPABILITIES` — this
change adds no `Capability` and unblocks no stage.

### Modified Capabilities

- `skill-progression`: the unlock requirement changes its source of prerequisites from the
  generator registry to the manifest's derived unlock graph, and gains a requirement that a
  skill the learner has already practised is never re-locked by a graph change.

`curriculum-manifest` is deliberately **not** modified. It already states the manifest is the
authority for prerequisite relationships; this change makes the runtime honour a commitment
the spec had already made.

## Scope

Stage B, Units 1–2. The seven skill ids with generators today: `add-facts`, `sub-facts`,
`add-2digit-nocarry`, `add-2digit-carry`, `sub-2digit-borrow`, `add-3digit`, `add-words`.
No generator's `build()` body changes and no problem content moves; only which skills are
open when, and the order the cards appear in.

## Non-goals

- **No branching decision.** Today's registry graph fans out to two (`add-facts` opens both
  `sub-facts` and `add-2digit-nocarry`); the manifest is a straight line, so this change
  removes the only branching the course has. `docs/curriculum.md:57` promises "Max 2 unlocks
  at once", which the derived graph can never satisfy — its maximum out-degree is 1. That is
  roadmap item 9's decision, and the reconciliation built here is exactly what makes a later
  graph change safe. The promise stays in the document unamended until item 9 resolves it.
- **No new generators.** Roadmap item 2 finishes Unit 1.
- **No skill-tree navigation and no unit split.** `Home.tsx` keeps rendering one flat
  heading; only the order within it changes. Item 8 owns the rest.
- **No `quick` lesson length, warm-ups, or silent recovery.** Item 4.
- **No change to the mastery-2 threshold, to `difficultyFor()`, or to how mastery is earned.**
  Nothing in this change writes to `mastery` at all.
- **No sync schema change.** `attempts` already exists on `SkillProgress` and already
  survives the round trip; nothing new is stored.

## Impact

- `src/store/progress.ts` — `isUnlocked()` rewritten; a `hasPractised` helper; the
  `generators` import drops.
- `src/curriculum/index.ts` — export the resolved unlock graph alongside `skillStates`.
- `src/lib/types.ts`, `src/curriculum/engine/problem.ts` — `prerequisites` removed from
  `SkillGenerator` and `SkillConfig`.
- `src/curriculum/unit-01-add-sub.ts` — seven `prerequisites` declarations removed; the
  `skills` array reordered to curriculum order.
- `src/curriculum/generators.test.ts` — three `skill graph` tests removed as duplicated by
  the manifest tests; the now-unused `generators` import drops with them.
- `src/curriculum/coverage.test.ts` — gains the unlock-graph and display-order assertions.
- `src/store/progress.test.ts` — new file; `isUnlocked()` has no test today.
- `src/components/Home.tsx` — call site unchanged; behaviour verified in the browser.
- `AGENTS.md`, `docs/roadmap.md` — the notes that describe today's behaviour.
- No API, dependency, or storage-schema change.
