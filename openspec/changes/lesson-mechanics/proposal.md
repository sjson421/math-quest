## Why

The lesson loop currently fixes difficulty and generates ten problems at mount, so it cannot
honour the curriculum's anti-discouragement commitments. With `add-facts-small` now providing
an implemented `quick` skill, quick length, a lower-band warm-up, and silent recovery can be
built and verified together.

## What Changes

- Generate lesson problems only as they are needed instead of prebuilding the full queue.
- Read the selected skill's manifest entry so `quick` lessons end after 5 correct answers;
  standard lessons continue to end after 10.
- Generate the opening problem one difficulty band below the mastery-derived lesson
  difficulty, clamped at difficulty 1.
- After three consecutive recorded misses, lower generation difficulty by one band for the
  rest of that lesson without announcing the adjustment to the learner.
- Preserve same-session re-queueing, answer diagnosis, rewards, and progress semantics.
- Mark roadmap item 4 complete and update repository descriptions that become stale when the
  mechanics ship.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skill-progression`: Define quick and standard completion targets, warm-up difficulty,
  lazy problem generation, and silent recovery after three consecutive misses.

## Impact

- Lesson state and problem scheduling in `src/components/Lesson.tsx`, with pure policy logic
  extracted under `src/lib/` where it can be tested without a browser DOM.
- Component and policy tests covering manifest-driven targets, warm-up clamping, consecutive
  miss tracking, recovery persistence, and re-queued problems.
- `docs/roadmap.md`, `README.md`, `AGENTS.md`, and `openspec/config.yaml` text made stale by
  the completed mechanics.
- No dependency, progress-record, sync-schema, generator, or manifest-shape changes.

## Curriculum Scope

This is lesson infrastructure for every stage and unit rather than content for a particular
unit. No skill generator is added or changed. The implemented `add-facts-small` skill is the
verbatim curriculum id used to demonstrate a `quick` lesson; an implemented non-quick skill
such as `add-facts` demonstrates the unchanged standard target. No new capability such as
KaTeX, fraction input, diagrams, or coordinate-plane input is required.

## Non-goals

- Stage checkpoints, skip-ahead, review, spaced repetition, timed mode, or the unresolved
  maximum-two-unlocks curriculum decision.
- New skill generators, changes to generated mathematics, or new answer-entry modes.
- Learner-visible difficulty labels or recovery messaging.
- Changes to mastery, attempts, rewards, persistence, or sync behavior.
