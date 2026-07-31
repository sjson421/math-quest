## Context

See proposal.md — Why. What matters for the approach:

- `resolveUnlockPrerequisites()` already exists, is tested, and does the hard part (seeing
  through `planned` skills). Nothing new needs deriving; the graph is computed today and
  simply never consulted at runtime.
- `isUnlocked(skillId, progress)` is a pure function of a skill id and a progress record. Its
  only call site is `Home.tsx:76`, which passes the result to `SkillCard` as
  `disabled={!unlocked}`. Both properties are worth keeping.
- The backup endpoint (`api/progress.ts`) stores the progress blob opaquely and never
  validates, interprets, or migrates it. Anything that must hold for a stored record has to
  hold when that record is read, not when it is written.
- `reconcile()` merges stored skills over per-skill defaults, which is what lets
  `SkillProgress` gain fields without a sync change. This change adds no field.

This is a **capability-layer** change: no generator is written and no problem content moves.
The design rule about naming predicted misconceptions per generator does not apply — no
generator is authored here, and the seven existing ones keep their `build()` bodies
byte-for-byte. The only wall skill in scope, `sub-2digit-borrow`, keeps the digit-flip
misconception it already predicts.

## Goals / Non-Goals

**Goals:**

- One prerequisite graph in the codebase, and it is the manifest's.
- The edge changes land without any learner losing access to something they had.
- The rule that protects them survives an arbitrary future restore, not just this deploy.
- No stored-schema change, so the sync round trip is untouched.
- The order the learner reads the skills in matches the order they open in.

**Non-Goals:**

- Any change to `resolveUnlockPrerequisites()`, `resolvePrerequisites()`, or the manifest
  data. The resolver is correct; the runtime is what is wrong.
- Making the graph branch. See proposal.md — Non-goals.
- Surfacing *why* a skill is locked in the UI. `Home.tsx` keeps its current locked state.
- Splitting the displayed unit in two. Ordering only; item 8 owns navigation.

## Decisions

### 1. Derive the unlock graph once, at module load, in `src/curriculum/index.ts`

Export `unlockPrerequisites` next to the existing `skillStates`, from the same
`stages` + `generators` inputs.

That module is already the single join between the manifest and the registry, and already
derives `skillStates` this way with a comment explaining why derivation beats storage. The
unlock graph is the third derivation over the same pair of inputs and belongs beside them.

*Alternative — derive inside `progress.ts`:* rejected. `progress.ts` is the store; it would
have to import `stages` and re-derive on every render, and the join would then live in two
places. `progress.ts` already imports from `../curriculum`, so importing one more derived
value costs nothing — and the `generators` import it no longer needs goes away in trade.

*Alternative — pass the graph into `isUnlocked()` as an argument:* rejected as churn. It
would make the function more testable in isolation, but the resolver is already directly
injectable in tests, and every call site would have to thread it.

Naming: `unlockPrerequisites`, distinct from the manifest's `resolvePrerequisites` (raw
edges) and `resolveUnlockPrerequisites` (the function). `AGENTS.md` warns about the two
`skillById`s that already exist here; this is the same hazard and the name is chosen to
avoid it.

**Consequence:** `resolveUnlockPrerequisites()` throws on a prerequisite cycle, so a broken
manifest becomes an import-time crash rather than a test failure. Accepted — see Risks.

### 2. Grandfather at read time, not with a one-shot migration

`isUnlocked()` returns true when the skill has been practised, regardless of prerequisites.

The alternative is a migration inside `reconcile()` that walks stored skills once and records
which were already open. It is wrong here for three reasons:

- **The endpoint never migrates.** A record written by today's build can be pushed to the
  backup and restored onto a build from six months from now. A migration that ran at deploy
  time cannot help a record that arrives later.
- **It would need a new stored field** — a set of grandfathered ids, or a schema-version
  bump — which is exactly the sync-affecting change this can avoid. `attempts` already carries
  the information.
- **Idempotence is free.** A read-time rule gives the same answer however many times a record
  is restored, reconciled, or merged. A migration has to be careful not to run twice, and
  `reconcile()` runs on hydrate, on `replaceProgress`, and on `adoptRemote`.

The cost is that the rule is permanent rather than transitional: a skill practised once is
open forever. Given "progress is never taken away" is the through-line of `skill-progression`,
that is the intended behaviour and not a leak.

**On the roadmap's "reconciliation that never reduces an earned mastery":** that half is a
no-op here and deliberately so. No code path in this change writes to `mastery` — not
`isUnlocked()`, which is pure, and not `reconcile()`, which is untouched. The roadmap's own
next sentence is the part that needs building, and it is Decision 2 and Decision 3.

### 3. Practised means `attempts > 0 || mastery > 0`

`attempts` is the direct signal — `recordAttempt()` increments it on the first answer of the
first lesson, before any mastery is earned, which is precisely the learner the Unit 2
tightening would strand.

`mastery > 0` is included as the cheaper half of a belt-and-braces pair. Mastery without
attempts cannot happen through normal play, but it can arrive from a hand-edited or
Phase-1 backup file through `replaceProgress()`, and `docs/curriculum.md` already specifies
that skip-ahead (roadmap item 27) "sets every skill in the block to **mastery 3**, not 5",
with no attempts at all. Writing the disjunction now means skip-ahead does not have to
remember to come back here.

A record may hold no entry for a skill id at all — `initialProgress()` seeds only the seven
registry skills, and `reconcile()` merges over that. The helper reads through a missing
record as not-practised rather than throwing.

### 4. Rule precedence: planned beats practised beats prerequisites

The `planned` check runs first. Without an explicit order, a practised skill whose stage
later gains an unbuilt capability requirement — or whose generator is removed — would report
unlocked with nothing to generate, and `Lesson.tsx` would be handed an id `getSkill()`
throws on. Not reachable with today's seven skills, all in a Stage B that requires nothing,
but the ordering is free to state and the spec now states it.

### 5. Gate on `skillState(id) === 'implemented'`, not `generators.has(id)`

`isUnlocked()` currently returns false for an unknown id by looking the generator up. Reading
the derived state instead is the same answer for every skill today and the correct answer
later: a skill with a finished generator whose stage requires an unbuilt capability is
`planned`, and must not be offered. This is what makes Decision 4's first rule cheap.

### 6. Remove `prerequisites` from `SkillGenerator` and `SkillConfig` outright

*Alternative — keep the field and add a test asserting it matches the manifest:* rejected
twice over. It fails today on two of seven skills, so the change would have to hand-edit the
registry into agreement — restoring exactly the duplication being removed, and committing to
hand-maintaining 201 edges that the manifest derives from ~23 `dependsOn` declarations. And a
field that must equal a derived value is not a source of truth; it is a cache with a test for
a cache-invalidation bug.

The three `skill graph` tests in `generators.test.ts` (references-exist, acyclic,
has-a-root) go with it. They are strictly weaker duplicates of the manifest tests, which
already assert all three over 201 skills plus reachability and dangling-id reporting.

The `add-words` comment explaining its hand-copied edge is deleted with the declaration it
explains — it documents a workaround that no longer exists.

### 7. Fix the card order in the same change, by sorting, not by hand

Found in audit. `Home.tsx` renders `unit01.skills` in registry order, which is the order the
generators were written: `add-facts, sub-facts, add-2digit-nocarry, add-2digit-carry,
sub-2digit-borrow, add-3digit, add-words`. Under the registry graph that read acceptably,
because `sub-facts` opened second. Under the manifest graph it opens *sixth*, so a learner on
day one would see one open card, then a padlock, then two more open cards. The list stops
communicating sequence.

This is a consequence of the change and it is fixed in the change, not deferred: leaving it
would make the app worse than before in a way item 8 might not reach for months.

The array is reordered to manifest order and `coverage.test.ts` gains an assertion pinning
the displayed order to `implementedSkillIds`, so a future generator dropped at the end of the
file fails the suite instead of landing in the wrong place. Pinning by test rather than by
sorting at runtime keeps the file readable as the curriculum sequence it now is.

Deliberately *not* done: splitting the display into Unit 1 and Unit 2 headings. The manifest
puts these seven skills in two different units and `Home.tsx` renders one heading per
registry `Unit`. Making that right is skill-tree navigation, which is item 8's whole job.

## Risks / Trade-offs

**The Unit 2 tightening reaches a real learner mid-course** → Both `sub-facts` and
`sub-2digit-borrow` end up behind more skills than they are today, so both can strand. The
grandfather rule covers the case that hurts: already practised, now behind an unmet gate. A
learner who has *not* touched them loses nothing they were using, and the new gate is the
curriculum's actual intent — Unit 2 builds on Unit 1. Tests cover both skills, not just the
one the roadmap names.

**A manifest cycle becomes a white screen instead of a red test** → The resolver throws on a
cycle, and this change makes that throw reachable at app import. Mitigated by the manifest
tests, which assert acyclicity across all 201 skills, so a cycle cannot reach a build without
CI failing first. Failing loudly is also the better of the two bad outcomes: the alternative
is an app that silently unlocks nothing.

**The course becomes a strict line** → After this, `add-facts` opens only
`add-2digit-nocarry`, and Unit 2 waits on all of Unit 1. That is a real reduction in learner
freedom and it contradicts `docs/curriculum.md:57`. It is deliberate and deferred to roadmap
item 9; the document is left unamended so the contradiction stays visible rather than being
quietly resolved in the wrong direction.

**Grandfathering makes locked-state harder to reason about** → Two skills with identical
prerequisites can differ, because one was practised. Contained by keeping the rule in exactly
one function, and by naming it in the spec rather than leaving it as an implementation
detail.

**Removing a typed field breaks the build in several files at once** → Intended: `npm run
build` runs `tsc -b` and will name every site that still reads `prerequisites`. Two imports
go unused as a side effect (`generators` in `progress.ts` and in `generators.test.ts`) and
`oxlint` catches those. This is the cheap kind of breakage — total and immediate.

## Migration Plan

No data migration. Nothing stored changes shape, no schema version moves, and no field is
added or removed from `Progress` or `SkillProgress`. A record written before this change and
one written after are byte-compatible in both directions.

Rollback is a plain revert. A record touched under the new build is fully readable by the old
build — it will simply apply the old registry edges, which for the two moved skills means
they re-open earlier. No data is lost either way.
