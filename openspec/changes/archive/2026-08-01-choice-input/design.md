## Context

See proposal.md — Why. The data model and checker already understand a choice answer: a
problem names `inputMode: 'choice'`, carries ordered `{ id, label }` options, and expects one
stable id. `Lesson.tsx` nevertheless renders `Keypad` unconditionally and keeps the typed
entry as its only submission value.

Presentational component tests render to static markup in the Node environment. They can pin
what first paint offers, but cannot attach handlers. Interaction policy therefore stays in
the already-tested answer and lesson functions, with the real-browser task covering their
wiring.

## Goals / Non-Goals

**Goals:**

- Make the problem's input mode the single decision that selects either choices or the keypad.
- Keep choice ids internal while labels are the only learner-facing option text.
- Reuse the existing submission and feedback path, so choice answers cannot acquire different
  lesson semantics.
- Mark the capability built and record every named consumer stage without shipping content.

**Non-Goals:**

- Validating or authoring a future generator's distractors and misconceptions. No generator
  ships here, so there are no generator misconceptions to name.
- Creating a second lesson state machine or a choice-specific progress representation.
- Supporting multi-select, ordering, free-form labels, or keyboard input.

## Decisions

### Render choices in a dedicated presentational component

Add a small choice control that receives the ordered choices and an `onChoose(id)` callback.
It renders one native button per choice and calls back with the id while showing only the
label. Keeping it presentational makes its complete first paint testable with the repository's
existing server-render pattern.

*Alternative considered:* inline the option map inside `Lesson.tsx`. Rejected because the
input surface would have no focused contract or direct coverage, and choice styling would be
entangled with the lesson state machine.

### A choice submits on selection

One tap selects and submits a choice. `Lesson` passes the selected id directly into the same
submission function used by the keypad's Check button; it does not wait for React state to
settle. The id is also stored as the current entry so the feedback render can map it back to
its label instead of displaying an opaque id.

*Alternative considered:* select first and require a separate Check tap. Rejected because a
choice already expresses a complete answer, and the extra confirmation adds a second action
without preventing a meaningful error.

### Branch only at the input surface

The problem display, hint, feedback panels, progress recording, re-queueing, and completion
logic stay shared. Only the bottom answer control branches on `inputMode`: choice problems get
the choice control, keypad problems get `Keypad`. During feedback, the displayed entry for a
choice is derived from its label rather than its internal id.

*Alternative considered:* create a separate choice lesson flow. Rejected because it would
duplicate the behavior already keyed exhaustively on answer-check results and invite the two
paths to drift.

### Choice feedback uses a compact label slot

`ProblemView` receives the problem's input mode so its answer slot can distinguish a numeric
entry from a choice label. Numeric entries retain their digit-sized calculated width. A choice
label uses readable text sizing, a bounded width, and wrapping, so feedback cannot clip the
problem row on a phone.

*Alternative considered:* infer the presentation from entry length or characters. Rejected
because valid keypad entries include signs, decimal points, and fraction slashes, while future
choice labels may be short symbols; the declared input mode is the authoritative distinction.

### Submission is synchronously single-flight

The submission path uses a small synchronous gate held for the lifetime of the lesson
instance. It acquires before checking or recording an answer, so two activations in one event
batch cannot both observe stale rendered state and enter. It releases when the next interaction
is intentionally available: after a correct answer advances, when recorded feedback is
dismissed, or immediately for an unrecorded unfinished entry that keeps the pad live. The
existing feedback guard remains defense-in-depth, not the concurrency boundary.

The gate is a pure helper under `src/lib/` so a Node test can prove acquire, reject, release,
and reacquire behavior without a DOM. The real-browser task remains the check that `Lesson`
uses it at the component seam.

*Alternative considered:* disable the selected button through React state. Rejected because
the second activation can arrive in the same batch before disabled state renders—the exact
race observed by the browser exercise.

### Treat choice input as built stage infrastructure

Add `choice-input` to the manifest capability vocabulary and built-capability set, then make
Stages A, C, and D require it. Those stages contain every consumer named by the roadmap:
`compare-numbers`, `order-numbers`, `compare-negatives`, `name-parts`, and
`compare-decimals`. Stage C continues to omit only its unavailable number-line requirement;
recording a capability that is already built does not hold its other skills back. The
capability has no persisted state. Because Stage A currently has no generators, the
availability switch does not expose content early; it allows the following Unit 0 content
change to resolve generators as implemented when they land.

*Alternative considered:* render choices without recording a manifest capability. Rejected
because the roadmap explicitly identifies the missing gate, and a future Stage A generator
could otherwise resolve as implemented if this UI wiring were removed or incomplete.

## Risks / Trade-offs

**A malformed choice problem has no usable options** → Keep the component faithful to the
declared list rather than falling back to a keyboard that cannot answer a choice id. Future
generator work must supply its options and will add sampled content checks with the generator.

**Static rendering cannot prove a click forwards the id** → Keep the callback seam to one
expression, add explicit correct/wrong stable-id cases to the answer checker tests, and
exercise the remaining component seam and progress recording in a real browser through a
temporary development-only route or equivalent controlled harness that is removed before
review.

**A gate can remain closed after a non-terminal response** → Release it at the three explicit
points where interaction resumes, cover the gate's release/reacquire contract in Node, and
exercise correct, incorrect, unfinished, and rapid-repeat paths in focused tests or the real
browser as applicable.

**A selected label can outgrow a digit-sized answer slot** → Give choice feedback a bounded,
wrapping label presentation and exercise the post-selection state at phone width.

**Consumer stages are gated as a whole although only some skills need choices** → Accepted.
The manifest intentionally records capabilities at stage granularity, and choice input is
built in the same change that adds each requirement, so it holds no generator back.

## Migration Plan

No stored data or API changes. Deploy the UI and manifest capability together. Rollback is the
inverse code change; every currently implemented problem remains keypad input throughout.
