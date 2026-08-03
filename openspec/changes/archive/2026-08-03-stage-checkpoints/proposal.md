## Why

Math Quest celebrates individual lessons but gives no recognition when a learner crosses a
whole stage boundary. Stage A is now fully playable, so the first genuine stage checkpoint
can be reached and the commitment can be implemented against real course data.

## What Changes

- Detect the transition from an unfinished stage to a completed stage when a lesson raises
  the final required mastery to the unlock threshold.
- Show a distinct, adult-toned checkpoint celebration after the lesson celebration and
  before returning to the skill tree.
- Celebrate only stages whose complete manifest membership is playable, so Stage A can fire
  while the partly built Stage B cannot be mistaken for complete.
- Replace the obsolete “max 2 unlocks at once” commitment in `docs/curriculum.md` with the
  clearer commitment the course already keeps: progression follows one path, so the learner
  always has one obvious next step rather than competing routes.
- Mark roadmap item 9 complete once implementation and browser validation land.

## Capabilities

### New Capabilities

- `stage-checkpoints`: Defines when a stage boundary is crossed and how its celebration fits
  into the lesson exit flow without implying that every mastery level is finished.

### Modified Capabilities

None. Mastery, unlocking, navigation, and sync behavior remain unchanged.

## Impact

- Curriculum scope: Stage A (`stage-a`), Unit 0 (`unit-0`), and its skills
  `read-numbers`, `place-value-tens`, `place-value-hundreds`, `expanded-form`,
  `compare-numbers`, `order-numbers`, `round-to-10`, and `round-to-100` are the first
  reachable checkpoint. The capability is derived generically for later complete stages.
- Expected code impact: pure stage-completion logic near course progress, lesson completion
  outcome plumbing, a checkpoint celebration component, and focused node-render tests.
- Documentation impact: `docs/curriculum.md` and `docs/roadmap.md`.
- No dependency, API, generator, manifest membership, prerequisite, or stored progress schema
  change is expected.

## Non-goals

- Branching the prerequisite graph, presenting competing next steps, or adding an
  unlock-count cap.
- Celebrating a partly implemented stage based only on its currently playable skills.
- Changing mastery thresholds, lesson rewards, lesson length, or the existing per-lesson
  completion celebration.
- Adding generators for Stage B or any new rendering or input capability.
