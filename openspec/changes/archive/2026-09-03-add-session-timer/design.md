## Context

See `proposal.md` for motivation and the two delta specs for behavior.

`src/lib/lesson.ts` owns two transient session records. `LessonSession` carries its target,
correct count, recovery state, and lazy queue; `CheckSession` carries its fixed result counts and
lazy queue. Their transitions return object spreads, so one session-level timing value can remain
stable without entering each problem or answer path.

`src/components/Lesson.tsx` renders standard, review, and check wrappers through one internal
practice loop. A first-time standard lesson does not create its practice session until the learner
leaves the automatic intro. Once active, one header owns the leave action, progress bar, count,
and optional intro-review action. This is the responsible surface for a session clock.

Component tests render first paint to static markup in Node and do not run effects. Clock
calculation and formatting must therefore be pure and testable without React, while interval
cleanup, live progression, and the 375-pixel composition require scripted Chromium. The
manifest already declares `timed`; only its available-capability set and coverage need to change.

## Goals / Non-Goals

**Goals:**

- Give either shared session record one optional, immutable timing origin.
- Keep timing absent unless the session caller explicitly opts in.
- Derive a stable elapsed display without drift or per-tick session mutations.
- Reuse the shared lesson header and preserve all lesson transitions.
- Activate the existing manifest capability only after the complete clock path is proved.

**Non-Goals:**

- Building a generic scheduling, stopwatch, or persisted-session service.
- Defining Stage H test length, expiration, scoring, or unfinished-answer policy.
- Adding timing metadata to a problem, generator, manifest skill, or learner setting.
- Refactoring the shared practice loop beyond the ownership needed for the clock.

## Decisions

### 1. Carry one optional timing origin on the transient session

Add a small session-timing record containing a monotonic start instant and make it optional on
both `LessonSession` and `CheckSession`. Session construction accepts that record; existing
constructors and wrappers omit it. The lesson wrapper gains an explicit timed-session opt-in that
creates the origin when practice begins. A later Stage H session can use the same path without
adding a global preference or changing generators.

The automatic intro already delays session construction, so its clock does not exist until
`startPractice`. Opening the manual intro later temporarily replaces the practice markup but
retains the same session and origin. Existing transition spreads keep the origin through answers,
feedback, lazy generation, recovery, and retries. Completion and exit unmount the clock and the
transient session is not persisted.

Adding the optional field to both session kinds keeps the shared component honest and leaves a
fixed-result Stage H flow free to use either existing queue policy later. It does not make current
skip checks timed because their constructor call still omits timing.

Alternative considered: put a timed flag on each `Problem` or `SkillGenerator`. Rejected because
time belongs to the whole session and either location would duplicate or reset policy at problem
boundaries. Alternative considered: derive timing from Stage H membership in the component.
Rejected because the first four Stage H modules are not themselves timed practice, and the
manifest is not a UI-settings table.

### 2. Derive elapsed seconds from monotonic time instead of counting ticks

Place session-clock math and formatting in one pure library owner. Elapsed seconds are the floor
of the non-negative difference between a supplied monotonic current instant and the fixed origin.
Formatting returns `m:ss` below one hour and `h:mm:ss` from one hour onward. Pure tests can cover
boundaries, a delayed update, and defensive clamping with exact inputs.

The component reads the browser's monotonic clock, refreshes on a one-second interval, and stores
only the derived displayed second in React state. Each refresh recomputes from the fixed origin,
so background throttling may delay a repaint but cannot slow the measured session. The effect
clears its interval on unmount. No elapsed value is copied into the lesson session on each tick,
which avoids rebuilding the queue-bearing state every second.

Alternative considered: increment a React counter on every callback. Rejected because throttled
tabs miss callbacks and report less time than elapsed. `Date.now()` was also rejected for duration
math because wall-clock corrections can move backward. A countdown and deadline callback were
rejected because the repository defines neither a time limit nor what an unfinished test does at
expiry; those decisions belong with Stage H content.

### 3. Render one quiet clock in the existing lesson header

Add a small presentational clock beside the existing progress count. It uses tabular numerals,
does not wrap, and has an accessible elapsed-time name containing the formatted value. It is not
an `aria-live` region, because announcing every second would compete with the problem and answer
feedback. Untimed sessions render no clock markup.

Keep the existing progress and intro-review controls rather than replacing either with the
clock. Static markup tests pin the opt-in boundary, accessible name, initial value, and absence of
a live region. A temporary real-app timed fixture exercises ticking and the densest header with
the intro-review action at 375 by 812 pixels, checks horizontal overflow and visible controls,
captures one screenshot, and is then removed.

Alternative considered: a second screen or floating overlay. Rejected because the session header
already owns progress state and an overlay risks covering diverse problem displays. Announcing
each tick was rejected as disruptive rather than useful accessibility.

### 4. Keep timing observational

The clock does not enter submission, attempt recording, queue advancement, completion, rewards,
or progress persistence. It measures the existing active session and nothing else. Reaching any
elapsed value has no behavior beyond changing the displayed text. A new session creates a new
origin and starts from zero.

This boundary lets 29a ship a complete clock without guessing at 29b's score estimator or item
30's full-length test rules. It also means rollback has no learner-data compatibility problem.

Alternative considered: store final or in-progress elapsed values on `Progress`. Rejected because
the roadmap calls for session ownership, interrupted-session recovery is not built, and storage
would add reconcile and sync obligations without a current consumer.

### 5. Activate `timed` without content

After pure policy, markup, cleanup, and browser checks pass, add the already-declared `timed`
name to `AVAILABLE_CAPABILITIES`. Coverage pins Stage H's unchanged requirement and six planned
skills, the absent Stage H course node, and the unchanged 195 implemented skills. Documentation
records the capability as built and closes only increment 29a; item 29 remains open for 29b.

Adding a placeholder Stage H generator was rejected because capability and content changes are
separate. Deferring the availability flag was rejected because increment 29a explicitly owns the
complete capability.

## Risks / Trade-offs

- **A background tab delays visible ticks:** Derive every refresh from the monotonic origin so the
  next repaint catches up immediately.
- **Session transitions accidentally reset timing:** Store the origin on the session object and
  test that answers, misses, lazy advancement, and retries retain the same record.
- **Static rendering cannot prove an effect:** Put all math in pure helpers, use static tests for
  first paint, and use scripted Chromium for live progression and cleanup evidence.
- **The extra header value can crowd phone layouts:** Validate the specified `1:00:05` display with
  progress and intro review at 375 pixels and inspect the required screenshot.
- **An elapsed clock does not enforce official test duration:** This is deliberate; no duration or
  expiry behavior is yet authoritative, and adding one now would bind Stage H content to a guess.

## Migration Plan

1. Add the pure timing record, elapsed calculation, formatting, and deterministic tests.
2. Thread optional timing through both session records while proving every current constructor
   remains untimed and every queue transition preserves timing.
3. Add the timed lesson opt-in and quiet header clock with static component coverage.
4. Run focused tests, a production build, and temporary-fixture browser validation at 375 by 812
   pixels; remove the fixture and rerun affected gates.
5. Activate `timed`, update documentation, and prove the playable course is unchanged.
6. Run focused tests, strict OpenSpec validation, full tests, build, and lint after activation.

Rollback removes the optional session timing, header clock, availability entry, and documentation
claims, then reopens increment 29a. No stored record, sync payload, generator, or server migration
needs reversal.
