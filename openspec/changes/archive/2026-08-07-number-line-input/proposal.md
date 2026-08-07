## Why

Two skills in the course ask the learner to place a value rather than type one —
`negatives-numberline` (6.1, Stage C · Unit 6) and `fractions-numberline` (7.4, Stage D ·
Unit 7) — and neither has an input mode that can express the question. `Problem.inputMode`
offers `keypad` and `choice`, and a number line is neither: the answer is a position, and
reading one off a line is the skill being taught rather than incidental to it.

Now, because Unit 6 is the next content item and 6.1 opens it. Capability work is its own
change, so this ships the input mode alone and leaves both generators to the content items
that own them.

## What Changes

- Add `number-line` as a third `Problem.inputMode`, and a per-problem declaration describing
  the line a problem wants: where it starts, how far apart its ticks sit, and how many there
  are.
- Render that line as the lesson's answer control, replacing the keypad, when a problem
  declares it. Keypad and choice problems are untouched.
- Tapping a tick **places** a value; a separate confirm submits it. A placed value is not yet
  an answer, so a mis-tap costs no attempt — the same principle the lesson already applies to
  an unfinished typed entry.
- Submit the placed value through the existing answer-checking, feedback, progress-recording
  and re-queue path, with no new `Answer` variant: a tick's value is an exact rational, which
  the checker already understands.
- Record `number-line` as an available stage capability, and declare it on Stages C and D,
  the two stages holding a named consumer.
- Correct the two repository documents this falsifies: the roadmap's statement that only
  `choice-input` is built, and the curriculum document's capability table row.

This is capability work. **It adds no generators and unlocks no skills.** Every skill in
Stage C and Stage D stays `planned`: Stage C's nine skills have no generators, and Stage D
is gated on KaTeX, fraction input and diagram rendering, none of which exist. The skill ids
`negatives-numberline` and `fractions-numberline` are unchanged and remain future consumers.

## Capabilities

### New Capabilities

- `number-line-input`: Present a problem's declared number line, let the learner place a
  value on it, and submit that value through the existing lesson answer flow.

### Modified Capabilities

- `curriculum-manifest`: Mark number-line input built, record it on the two stages with a
  named consumer, and state that marking a capability built unlocks nothing on its own when
  the skills needing it have no generator.

## Impact

- `src/lib/`: a pure number-line module — tick values, labels, and the submitted string —
  alongside `keypad.ts`, so what sits behind a tap is reachable from a Node test.
- `src/lib/types.ts`: the third `inputMode` and the per-problem line declaration.
- `src/components/`: the number-line answer control, the lesson's three-way input selection,
  and the entry slot's handling of a placed value.
- `src/curriculum/manifest/`: `AVAILABLE_CAPABILITIES`, and `requires` on Stages C and D.
- Tests: pure tick-derivation coverage, static-render component coverage in the existing Node
  environment, and lesson wiring coverage.
- Documentation: the curriculum capability table, the roadmap status line and item, and the
  active OpenSpec queue note.
- No progress-schema, sync, API, dependency, generator, or recorded-output change. No
  existing problem's behaviour changes, because omitting the declaration keeps every
  generator exactly as it is.

## Non-goals

- **No generator ships here.** `negatives-numberline` (6.1) belongs to Unit 6 and
  `fractions-numberline` (7.4) to Unit 7; neither becomes `implemented`.
- No authored number-line content, and no ranges or tick choices fixed on a skill's behalf.
- No drag, scrub, or continuous-position interaction — placement snaps to a declared tick.
- No generalisation of `Misconception.value` beyond a scalar, and no change to `diagnose()`.
  A placed fraction therefore reaches the checker correctly but is not diagnosed; that is the
  pre-existing scalar limit the roadmap's expression-input item owns.
- No KaTeX, fraction input, diagram, coordinate-plane, expression, chart, or timed capability
  changes, and no number line used as a *display* for a value the learner reads off.
- No change to keypad behaviour, choice behaviour, lesson targets, re-queueing, mastery,
  difficulty, or feedback copy.
