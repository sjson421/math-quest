## Why

Math Quest asks a learner to solve a new skill before it has shown how the skill works. The curriculum has always promised one teaching line and one worked example, and the existing display renderers can now present an example for every built kind of problem.

## What Changes

- Add a pre-lesson skill intro that shows one authored teaching line and one generated difficulty-1 worked example before the first problem.
- Persist whether each skill intro has been seen, default older and restored records to unseen at read time, and keep this flag separate from attempts, mastery, review, and future skip-ahead evidence.
- Keep the intro available from the lesson after its automatic first showing without changing or regenerating the active lesson session.
- Add teaching lines for Stage A, Unit 0: `read-numbers`, `place-value-tens`, `place-value-hundreds`, `expanded-form`, `compare-numbers`, `order-numbers`, `round-to-10`, and `round-to-100`.
- Enforce the teaching-line sentence and vocabulary limits in the existing content-rule system and verify the complete intro at the installed 375-pixel width.
- Add no new manifest capability, input mode, renderer, runtime dependency, or server migration.

## Capabilities

### New Capabilities

- `skill-intros`: Covers automatic first presentation, the generated worked example, persisted seen state, progression neutrality, later review, accessibility, and phone layout.

### Modified Capabilities

- `skill-content-contract`: Makes teaching-line limits directly enforceable at their authored source and keeps the staged rollout honest.
- `unit-00-numbers`: Gives all eight Stage A generators their required teaching line and intro coverage.

## Non-goals

- Teaching lines for Stages B–F; roadmap increments 25b–25d own them.
- Intros for planned Stages G–H; those stages carry intros when their generators ship.
- New worked-example artwork, a second problem renderer, or authored example operands.
- Review, spaced repetition, skip-ahead, timed mode, or any inference that seeing an intro proves understanding.
- Changing lesson length, warm-up difficulty, recovery pacing, unlocking, rewards, or generated problem content.

## Impact

- Lesson presentation and reusable worked-solution markup under `src/components/`.
- Generator metadata and Stage A content under `src/lib/types.ts`, `src/curriculum/engine/`, and `src/curriculum/unit-00-numbers.ts`.
- Per-skill local progress and reconciliation under `src/store/progress.ts`; opaque sync carries the added field without an API change.
- Authored content checks and focused generator, component, store, coverage, and browser validation.
