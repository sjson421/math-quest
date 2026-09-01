## Why

A learner who already knows arithmetic has no way past it, and grinding through known
material is one of the fastest ways to abandon the app. Roadmap increment 28a establishes the
durable half of skipping ahead — a recorded reason for every mastery level and a reversible
block mutation — so the check-first flow (28b) and the safety net (28c) have one mechanism to
build on rather than each growing its own.

## What Changes

- Record how each skill reached its mastery: practised, tested out of, or self-assessed, and —
  on the skills a skip raised — the mastery they held immediately before it. Records that
  predate either field read as practised, from mastery zero, without being rewritten.
- Add a pure block mutation that raises every playable skill in a stage or unit to mastery 3 —
  clear of the unlock threshold, short of the maximum — so a skipped skill reads as "not
  needed yet" rather than finished.
- Never lower an existing mastery level when a block is marked known, and leave the recorded
  reason of any skill the learner had already earned untouched.
- Add the reversal: taking a block back restores only the skills the skip itself granted, each
  to the mastery it held before the mark, so "actually, let me practice this" returns the
  learner exactly where they stood and cannot destroy earned practice.
- Clear the recorded reason back to practised, and the recorded prior mastery with it, when a
  lesson for that skill completes, because a skipped skill the learner has since played is no
  longer an untested claim and has no granted level left to restore.
- Expose both as store actions that persist through the existing local write path, so a skip
  advances the progress version and background sync carries it with no endpoint change.

`docs/curriculum.md` describes a skip as setting every skill in the block to mastery 3,
recording the source on each of them, and resetting the block to 0, and its appendix names the
two stored fields as `source` and the existing mastery set to 3. This change raises rather than
sets, records the source only on the skills it raised, and returns exactly those skills to the
mastery they held before the mark, so that nothing here reduces mastery the learner earned — and
the second stored field is the mastery a mark found, not the mastery itself. Those three
sentences and that bullet are corrected with it.

This is course-wide progression infrastructure. No curriculum stage, unit, generator, or skill
id changes are in scope; exact skill ids: none. No rendering or input capability is required,
and `AVAILABLE_CAPABILITIES` is unchanged.

## Capabilities

### New Capabilities

- `skip-ahead`: How a block of the course is marked already known and taken back — the
  recorded source of a mastery level, what a block mutation writes, what it must never lower,
  and what a reversal restores.

### Modified Capabilities

- `skill-progression`: the rule that mastery is never reduced gains its one explicit
  exception — a learner reversing a skip that granted the mastery in the first place, and then
  only back to the level that skip found — so the mastery invariant keeps a single authority
  instead of being contradicted from a second spec.

## Non-goals

- The check-first flow: eight sampled problems at difficulty 3, the ≥7 threshold, and the
  stage and unit entry points that offer a skip (28b).
- The safety net: entering review at low strength on a skip, the below-60% warm-up offer, and
  pointing a failing downstream skill back at a skipped prerequisite (28c). `docs/curriculum.md`
  lists low-strength review entry among what a skip does; the roadmap defers it to 28c, and
  this change writes no review fields. A record saved before those fields existed derives its
  strength from its mastery, so a skip moves that derived value; what a skip *should* do to
  review scheduling is 28c's decision to make deliberately.
- Any screen or affordance. This increment ships mechanism only, as 27a did.
- Changing unlocking, lesson length, difficulty, rewards, checkpoints, pin tiers, XP, coins,
  streaks, the misconception map, or the progress endpoint.

## Impact

- Affected areas: a new pure helper under `src/lib/`, `SkillProgress` and lesson completion in
  `src/store/progress.ts`, and their focused tests. `docs/roadmap.md`, and three sentences plus
  one appendix bullet of `docs/curriculum.md`, are corrected too; no table, heading, or skill id
  the build parses moves.
- Stored progress gains two optional per-skill fields, written and cleared together. Existing
  and restored legacy blobs stay valid, keep unknown fields, and need no migration —
  `reconcile()` merges per skill object.
- A skip is a local mutation like any other: it advances `updatedAt` and the sync subscriber
  pushes it. `progress-sync` already names a skip among the changes worth pushing.
- No new runtime dependency, public API, curriculum capability, or application screen.
