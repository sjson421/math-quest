## Context

See `proposal.md` for motivation and `specs/stage-checkpoints/spec.md` for observable
behavior. Lesson completion currently performs one synchronous zustand mutation, returns the
reward outcome to `Lesson`, and then renders the existing lesson-complete screen. Navigation
progress intentionally counts only playable skills, while checkpoint eligibility must inspect
the full manifest so an unfinished stage cannot appear complete.

## Goals / Non-Goals

**Goals:**

- Keep checkpoint detection pure and independently testable in the node test environment.
- Make the stage crossing part of the same lesson-completion outcome that changed mastery.
- Preserve the existing lesson result and navigation destination while inserting one screen.
- Derive eligibility from current manifest and implementation state without a second course
  list or stored acknowledgement field.

**Non-Goals:**

- Persist a “seen checkpoint” collection or migrate the progress schema.
- Reinterpret the navigation progress bar, maximum mastery, or unlock graph.
- Add content generators or misconception predictions; no generator is changed here.

## Decisions

### Detect a transition, not a completed snapshot

A pure checkpoint helper will compare progress immediately before and after one lesson
completion. It returns the containing stage only when the before state is incomplete and the
after state is complete. `completeLesson` will construct its next progress object once, ask
the helper for the crossing, persist that object, and return the optional checkpoint beside
the existing rewards.

This makes the transition intrinsically one-time: later lessons start from an already
complete stage, and a restored completed record has no before/after lesson crossing. It is
one celebration per incomplete-to-complete crossing, not a permanent seen flag; a future
feature that deliberately resets mastery can create a later genuine crossing. The
alternative was a stored list of acknowledged stage ids, but that would add reconciliation,
sync, reset, and interruption semantics for information already encoded by the mastery
transition.

### Read full manifest membership and resolved implementation state

The helper will locate the lesson skill through the manifest index, inspect every skill in
that manifest stage, and require each to resolve as implemented and hold mastery at least
`UNLOCK_THRESHOLD`. It will not read the derived playable course tree or `stageProgress`,
because both deliberately omit planned skills and can report full progress for a partly built
stage.

The helper will accept the threshold and minimal mastery-shaped records it needs so the store
can call it without creating a module cycle. Synthetic tests will prove the planned-skill and
transition cases, while a real-manifest case pins Stage A as eligible and Stage B as ineligible.

### Keep the checkpoint inside the lesson completion flow

`LessonComplete` will retain its current first paint. When its outcome carries a checkpoint,
its Continue action will advance to a dedicated `StageCheckpoint` view and fire the existing
celebration haptic again; otherwise it will call the existing exit callback. The checkpoint's
Continue action calls that same callback, preserving the unit captured when the lesson began.

A pure completion-flow helper under `lib/` will decide whether Continue advances to the
checkpoint or exits. The component delegates the behind-a-tap branch to that helper so node
tests can pin both paths without a DOM, as required by the repository's component-test model.

A separate presentational component makes the checkpoint markup testable through
`renderToStaticMarkup`, consistent with the repository's node-only component tests. Moving the
checkpoint into `App` was rejected because it would require new global screen and pending
state for an event already owned by the lesson that caused it.

### Remove the unlock cap commitment instead of adding dormant machinery

The “max 2 unlocks at once” row will be replaced by a single-clear-path commitment. The
manifest graph has maximum out-degree one and no explicit prerequisite overrides, so the
learner already sees one obvious next step and an enforcement mechanism could never bind.
The existing manifest override remains technically available, but using it to create real
branching would require a new curriculum decision that explicitly revisits this commitment.

Checkpoint copy will say the learner reached the stage boundary, not that the stage is fully
mastered: mastery 2 opens what follows, while the navigation progress bar continues toward
mastery 5. The screen will offer one Continue action and no new path choice.

## Risks / Trade-offs

- **Closing the app between recording completion and viewing the checkpoint loses that view**
  → The checkpoint is presented immediately in the active lesson flow; avoiding this narrow
  interruption case keeps progress free of presentation-only state and avoids replaying old
  checkpoints after restore.
- **A future graph threshold could diverge from the exported constant** → The helper receives
  `UNLOCK_THRESHOLD` from the store call, keeping one runtime authority.
- **A future stage may become fully implemented for a learner carrying old mastery** → Only a
  lesson transition can trigger, as specified; loading old progress does not manufacture a
  celebration for work completed before the boundary existed.

## Migration Plan

No data migration is required. Deployment adds transition detection and presentation only;
rollback removes both without changing stored progress. Documentation changes ship with the
implementation so the curriculum commitments and roadmap describe the running app.
