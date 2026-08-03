## 1. Stage Boundary Detection

- [x] 1.1 Add a pure helper that detects an incomplete-to-complete transition using full
  manifest stage membership, resolved implementation state, and the unlock threshold.
- [x] 1.2 Add synthetic and real-manifest tests for Stage A completion, below-threshold
  progress, planned skills, repeated lessons, and already-complete restored progress.

## 2. Lesson Completion Flow

- [x] 2.1 Extend lesson completion outcomes with the optional stage checkpoint computed from
  the exact progress transition being persisted.
- [x] 2.2 Add store tests proving the crossing returns the checkpoint, persists the same
  mastery transition it evaluated, and does not return the checkpoint on a later lesson.
- [x] 2.3 Add the distinct stage checkpoint celebration after the existing lesson-complete
  screen while preserving the captured unit exit destination and ordinary lesson flow.
- [x] 2.4 Put the checkpoint-versus-exit Continue decision in a pure `lib/` helper and add
  node tests for both paths plus render tests pinning boundary wording and its single action.

## 3. Curriculum and Roadmap

- [x] 3.1 Replace the obsolete “max 2 unlocks at once” curriculum row with a single-clear-path
  commitment and mark roadmap item 9 shipped with an implementation record matching delivery.

## 4. Verification

- [x] 4.1 Run the focused checkpoint, progress-store, lesson, navigation, and curriculum
  document tests and correct any failures.
- [x] 4.2 Run `npm test`, `npm run build`, `npm run lint`, and strict OpenSpec validation.
- [x] 4.3 Drive the real app in a controlled browser through the Stage A boundary, confirm the
  lesson celebration precedes a checkpoint naming Numbers, and confirm its sole Continue
  action returns to Unit 0.
