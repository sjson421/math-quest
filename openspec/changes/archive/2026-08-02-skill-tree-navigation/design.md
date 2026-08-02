## Context

See `proposal.md` — Why. The state that shapes the approach:

- `units` in `src/curriculum/index.ts` is `[unit00, unit01, unit02]`, a hand-appended array.
  Each unit module ends with a `Unit` literal carrying `id`, `name`, `color` and `skills`.
- **Those literals already disagree with the manifest.** They declare `unit-00`, `unit-01`,
  `unit-02`; the manifest declares `unit-0`, `unit-1`, `unit-2`. Nothing reads the hand-written
  id, so nothing has failed — which is precisely why it drifted. `name` is duplicated between
  the two and happens to agree today.
- `unitBySkillId` is exported from `src/curriculum/index.ts` and read by nothing.
- `manifestIndex` already answers "which unit and stage is this skill in", and
  `coverage.test.ts` pins skill→unit membership to the manifest rather than to the file a
  generator lives in.
- Component tests render to a string in the node environment with no DOM and no handlers
  (`AGENTS.md` — Test map). A test can assert what a level *offers*; it cannot tap it.
- `App.tsx` holds a `Screen` union and animates between screens with `AnimatePresence
  mode="wait"`, keyed on `screen.name`.
- Skill state is derived at load and never stored (`resolveSkillStates`), and the whole
  manifest is ~6 KB gzipped in the bundle.

This is **capability work, not content work**: no generator is written, no misconception is
predicted, no skill id changes, and `AVAILABLE_CAPABILITIES` is untouched. The design rule
about naming a generator's misconceptions has nothing to bite on here.

## Goals / Non-Goals

**Goals:**

- One authority for course structure — the manifest — reachable by the UI without a second
  hand-maintained list.
- A hierarchy that is legible at 201 skills and no slower than today at 24.
- Every navigation decision testable in the node environment, so the browser check confirms
  rather than carries the coverage.

**Non-Goals** (beyond the proposal's):

- No change to how a lesson runs, how unlocking is computed, or what a skill card looks like.
- No persistence of navigation state. Where the learner was is session state; on relaunch the
  tree opens at the current unit by rule, not by memory.
- No new stored field. `SkillProgress` is read, never extended.

## Decisions

### Derive the course tree in `resolve.ts`, over manifest entries

`resolveCourseTree(stages, states)` returns the playable structure:

```ts
export type CourseUnit = { unit: UnitEntry; skills: readonly SkillEntry[] }
export type CourseStage = { stage: StageEntry; units: readonly CourseUnit[] }
```

It keeps `SkillEntry`, not `SkillGenerator`. That is what lets it live in `resolve.ts`
alongside `resolveSkillStates` and `resolveUnlockPrerequisites` — a pure function of the
manifest and a state map, with no app types and no registry import, testable against the
synthetic stages `resolve.test.ts` already builds. The entry also carries `quick` and `wall`,
which a generator does not.

`curriculum/index.ts` then exposes `course = resolveCourseTree(stages, skillStates)`, the
fourth derivation over the same two inputs as the existing three, for the same reason.

*Alternative rejected:* have the tree carry `SkillGenerator`s. It would drag the registry
into `resolve.ts`, invert the dependency the module was built with, and gain nothing — the UI
needs a generator only at the moment it starts a lesson, where `getSkill(id)` already serves.

### Delete the hand-maintained `units` array and the `Unit` type

Unit modules end with `export const unit00: SkillGenerator[] = [...]` instead of a `Unit`
literal. `Unit` leaves `src/lib/types.ts`, and `unitBySkillId` — read by nothing — goes with
it. `allSkills` becomes the concatenation of those arrays; the registry is unchanged.

This is the point of the change rather than a side effect: the id drift above cannot recur
once there is nothing to drift from, and a generator can no longer be filed under the wrong
unit by being written in the wrong file. `coverage.test.ts`'s "offers them in curriculum
order" assertion becomes structurally true rather than hand-kept — see *Testing* below for
what replaces it, because a test that cannot fail is worse than no test.

*Alternative rejected:* keep `Unit` and reconcile it against the manifest in a test. That is
a third list plus a checker, where the manifest already holds everything but the colour.

### Unit colour is a cycle over manifest position

Colour is the only thing on `Unit` the manifest does not have, and it is presentation. A
tone cycle indexed by the unit's position in the manifest replaces it:

```ts
const TONE_CYCLE = ['powder', 'blossom', 'mint', 'butter', 'lilac'] as const
```

Units 0, 1 and 2 therefore keep powder, blossom and mint — the exact colours they have today,
so the redesign does not silently recolour the app. Manifest order is fixed at 23 units, so a
unit's colour is stable forever, and adjacent units always differ.

*Alternative rejected:* a hand-written `unit-id → tone` table. Twenty-three more lines to
maintain, and a missing entry is a runtime hole, to buy an arbitrariness nobody will exercise.

### The app opens at the skill level of the current unit

Opening at the stage level would make the daily path three taps instead of one. The hierarchy
exists so 201 skills stay navigable, and it must not tax the one skill the learner actually
came for.

Current unit = the unit of the first playable skill, in curriculum order, that is unlocked and
below `UNLOCK_THRESHOLD`; failing that, the last playable unit. On a fresh install that is
Unit 0, because `read-numbers` is the course's only root — 22 of the manifest's 23 units
declare `dependsOn`, and `unit-0` is the one that does not.

The threshold is `UNLOCK_THRESHOLD`, not `MAX_MASTERY`, and the difference is not cosmetic.
A skill opens the next at mastery 2 and caps at 5, so a learner who keeps moving leaves a
trail of skills at 2, 3 and 4 behind them. "First unlocked skill below `MAX_MASTERY`" would
therefore name `read-numbers` forever and open the app at Unit 0 for a learner halfway
through Unit 2. Below `UNLOCK_THRESHOLD` names the frontier instead: the first skill not yet
taken far enough to move the course forward, which is also the first skill that could be
holding up what follows.

Implemented as a render-time fallback rather than an effect: App holds `screen: Screen | null`
and renders `screen ?? { name: 'skills', unitId: currentUnitId(...) }`. `null` means "wherever
the learner is now", and the first navigation — including starting a lesson — pins it. No
extra frame, and no hydration race, because the fallback is only ever evaluated after
`loaded`.

### Navigation state stays in App's `Screen` union

```ts
type TreeScreen =
  | { name: 'stages' }
  | { name: 'units'; stageId: string }
  | { name: 'skills'; unitId: string }

type Screen =
  | TreeScreen
  | { name: 'lesson'; skill: SkillGenerator; unitId: string }
  | { name: 'settings'; back: TreeScreen }
```

`lesson` carries the `unitId` it was started from, which is what lets exit return there rather
than to a current unit that the just-finished lesson may have moved. `settings` carries the
level it was opened from for the same reason — it is reachable from all three now, and the
old `{ name: 'settings' }` had only one place to close back to. One union, one owner, and the
back edges are total: every screen names where back goes.

`AnimatePresence` is keyed on the level *and* its id, so stage→stage and unit→unit moves
animate like every other transition instead of swapping silently.

### Progress is a mastery share, computed in `src/lib/course.ts`

A unit reports `earned / possible` — mastery summed across its playable skills over
`MAX_MASTERY × count`. A stage reports the same over every playable skill in its units.

Counting only playable skills keeps the figure finishable: a unit with four of fourteen
generators reports against four, so the learner is never shown a fraction they cannot close
and cannot read the unwritten remainder off the bar. The accepted cost is that a full bar
drops when the fifth generator lands — there is genuinely more of that unit to learn than
there was, and the alternative is a unit that reads 29 % while the learner has done
everything in it.

Counting *completed* skills instead was rejected — a learner holding mastery 4 across a whole
unit would read 0 %, which is both wrong and exactly the discouragement the design
commitments exist to avoid.

These live in `src/lib/course.ts` as pure functions of the tree and a `Progress`, for the
reason `lib/submit.ts` exists: anything behind a tap or inside a component is unreachable from
a node test. `lib/course.ts` imports `isUnlocked` and `MAX_MASTERY` from `store/progress.ts`,
which does not import back — no cycle.

### One shell, three props-only levels

`Home.tsx` stays the shell: the stats header, the mascot, the daily-goal bar, and a back
control at any level that has one. Beneath it sits one of `StageList`, `UnitList`, `SkillList`
— each taking already-computed props and no store, so a first-paint test can render one
against a synthetic `Progress` without touching IndexedDB. `SkillCard` moves into `SkillList`
unchanged.

Keeping the mascot and goal bar on every level is deliberate: the skill level is where the app
opens, so anything dropped there is dropped from the common case.

## Risks / Trade-offs

- **Node tests cannot tap anything, so no test proves a level actually navigates** → each
  level's handler is a prop, so the wiring is one line reviewed by eye; the transitions
  themselves are exercised in a real browser in phase 6, with the preview kept visible so
  `AnimatePresence mode="wait"` can complete its exit.
- **The ordering test stops being able to fail once order is derived** → replaced with a
  derivation test over synthetic stages that asserts the tree *reorders* generators registered
  out of manifest order, plus the existing "covers exactly `implementedSkillIds`" check. The
  habit `AGENTS.md` names — every checker paired with a case proving it names the offender —
  applies directly.
- **Three taps to reach an unrelated unit, where today it is a scroll** → accepted. That path
  is browsing, not practice, and the practice path gets shorter, not longer.
- **A fully locked Unit 1 and Unit 2 greet a new learner on the unit level** → intended and
  specified: they are built course, not vapour, and hiding them would hide the shape of what
  is coming. Only unbuilt units disappear.
- **An empty course would have no unit to open at** → cannot occur with 24 skills implemented,
  but the derivations return an empty tree and `currentUnitId` returns `undefined` rather than
  throwing; the shell then renders the stage level with nothing in it.
- **Colour becomes positional, so a unit inserted into the manifest would shift later
  colours** → the manifest is fixed at 23 units by `curriculum-manifest`'s own count
  requirement; an insertion is already a course-wide change.

## Migration Plan

None. No stored data is written, read differently, or migrated: `Progress` and every
`SkillProgress` are read exactly as today, and the sync round trip is untouched. Rollback is
reverting the commit.
