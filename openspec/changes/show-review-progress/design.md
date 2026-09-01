## Context

See `proposal.md` for motivation and the three delta specs for behavior.

The scheduler already normalizes optional review fields and selects at most ten implemented due
skills as an oldest-first, curriculum-ordered snapshot. `ReviewLesson` already accepts that
snapshot and owns mixed-skill practice, answer persistence, retries, rewards, and completion, but
`App` has no review screen and the common Home shell has no way to enter it.

`SkillList` currently reads mastery directly and shows one mastery bar. Settings already sorts the
global `mistakes` map, shows its top three entries under “Things to watch,” and converts internal
tags to readable text. That Settings behavior predates this roadmap item and is documented in the
README, so the implementation should preserve and cover it rather than build another insight.

Component tests run through server-rendered first paint without handlers. Route transitions and
responsive layout therefore need final scripted Chromium validation, while due selection and
normalization remain covered by pure tests.

## Goals / Non-Goals

**Goals:**

- Connect the shipped due selector and review lesson through one reachable screen path.
- Preserve the selected review list and the learner's return location for the whole session.
- Report normalized recall without changing or visually conflating mastery.
- Bring the existing recurring-mistake insight under an explicit contract and regression test.
- Keep every new presentation decision derivable from current progress.

**Non-Goals:**

- Introducing a second review policy, queue, lesson component, or progress mutation.
- Adding stored view state, a review-session resume lifecycle, or a timer that refreshes at
  midnight while the app sits untouched.
- Refactoring Settings reporting unless focused coverage exposes a verified need.
- Making global misconception counts per-skill or using them to alter review selection.

## Decisions

### 1. App owns the due snapshot and review return route

While a course-tree screen is active, `App` will build ordered review candidates from
`implementedSkillIds`, resolve their registered generators, pair them with current skill
progress, and call the shipped `selectReviewSkills()` with `todayKey()`. This keeps the manifest-
derived implemented order at the caller, as the selector's existing contract requires.

Add a `review` arm to the existing `Screen` union. It carries the selected generators and the
exact `TreeLevel` that opened it. Activating Home's entry captures both values; the screen lazily
mounts the existing `ReviewLesson`. Leaving active practice or continuing from its existing
completion screen restores the captured tree level. Returning to the tree naturally derives a
fresh due list from the persisted answer results.

The Home shell receives only the selected count and a start callback. It renders one full-width
review callout below the daily-goal area when the count is positive, so the control is present on
the stage, unit, and skill levels that already share this shell. Visible copy names review and its
skill count; no disabled or empty control is rendered when the count is zero.

Alternative considered: let `ReviewLesson` or Home select its own skills. Rejected because App
already owns navigation state, and selection inside the lesson would hide the immutable session
snapshot behind mounting. Home remains presentation rather than gaining curriculum lookup policy.

Alternative considered: recompute the list after every answer. Rejected because the shipped
review requirement fixes selection for the session even while individual answers reschedule
skills.

### 2. Use the existing normalized review reader on each skill card

`SkillList` will pass each playable skill's normalized `readReviewState(...).strength` into its
card. The card will add one compact visible line, `Recall N/5`, while retaining the existing
mastery bar and its `Level N of 5` accessible label unchanged. Showing the line on every playable
card, including locked or untouched cards at zero, makes the metric consistent and avoids a
missing label that could mean either no evidence or a rendering bug.

The read is pure. It does not write default fields into legacy progress, and it handles explicit,
absent, and malformed optional review values exactly as scheduling does.

The `skill-tree-navigation` delta carries the original hierarchy and lesson-entry scenarios
forward while replacing its obsolete blanket statement that the skill card cannot change. Its
narrower invariant preserves locked and unlocked start behavior and mastery semantics while the
new reporting capability adds recall text.

Alternative considered: read `strength` directly with a local fallback. Rejected because it
would duplicate legacy and malformed-field rules and could disagree with due selection.

Alternative considered: add a second segmented bar. Rejected because two unlabeled progress bars
would make recall look like a second mastery value. A labelled text line is smaller and clearer.

### 3. Preserve Settings as the one recurring-mistake surface

Keep Settings' current top-three ranking, counts, readable known-tag labels, hyphenated-tag
fallback, neutral wording, and empty-state omission. Add server-rendered component coverage for
descending rank, three-item limit, readable non-scolding text, counts, and absence when the map is
empty. No new helper or stored summary is needed unless that focused test reveals code that
cannot be reached safely.

Alternative considered: add the insight to Home beside review. Rejected because Settings already
owns progress statistics and another surface would duplicate the same global map without adding
evidence.

Alternative considered: infer which skill produced each mistake. Rejected because the stored map
contains global tag counts only; inventing attribution would require a data-model change outside
the roadmap increment.

### 4. Verify decisions at their existing owners

Extend `SkillList` first-paint tests for recall display, mastery separation, and unchanged locked
and unlocked startability. Add focused Home first-paint coverage for positive and zero review
counts, and Settings first-paint coverage for the existing insight. Keep selector policy, legacy
normalization, and mixed-session behavior in their current pure and component suites.

Scripted Chromium at 375 by 812 pixels will seed `read-numbers` and `place-value-tens` as due on
different dates, `compare-numbers` in the future, and planned `calculator-skills` as due. It will
verify the selected count and callout on all three tree levels, confirm that review follows the
two due skills in oldest-first order without admitting future or planned records, leave one run
and return to the same level, complete another and continue from its completion screen to that
same level, confirm persisted rescheduling hides the entry, inspect skill recall and Settings
insight text, check horizontal overflow, and capture one passing screenshot for visual inspection.

Alternative considered: add a DOM test environment for route clicks. Rejected because the repo's
node-only component-test contract deliberately assigns handler behavior to pure policy and real-
browser validation.

## Risks / Trade-offs

- **A legacy learner can have a large due backlog.** The shipped selector still caps one snapshot
  at ten and returns the next oldest work after completion.
- **Home recomputes candidates during ordinary renders.** The fixed course has only 195 playable
  generators; keep the direct derivation unless measurement shows a real render cost.
- **Two learning measures can confuse learners.** Use the word “Recall” beside a numeric value and
  leave the visibly separate mastery bar and level semantics unchanged.
- **An app left untouched across midnight will not refresh solely because the date changed.** The
  next render, navigation, progress update, or reopen reads the current local day; no background
  timer is added for this increment.
- **The review callout can lengthen the common mobile Home surface.** Validate all tree levels at
  375 pixels and inspect the captured screenshot rather than relying on overflow assertions alone.

## Migration Plan

1. Add the route and common Home entry around the already-shipped selector and `ReviewLesson`.
2. Add normalized recall reporting and focused first-paint coverage.
3. Pin the existing Settings insight with its delta spec and regression coverage.
4. Update roadmap increment 27c and item 27 only after all focused and full gates pass.
5. Run strict OpenSpec validation, focused tests, full tests, build, lint, and scripted browser
   validation.

No data migration, schema bump, endpoint rollout, or dependency ordering is required. Rolling
back removes only the new route and presentation; review fields and any answers already recorded
remain valid under the shipped scheduler and opaque-sync contract.
