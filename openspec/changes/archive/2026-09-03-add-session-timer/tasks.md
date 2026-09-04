## 1. Pure session clock

- [x] 1.1 Add one session-clock library owner for the optional monotonic start record,
  non-negative elapsed whole-second calculation, and `m:ss` or `h:mm:ss` formatting without a
  runtime dependency.
- [x] 1.2 Add focused pure tests for zero, minute, and hour formatting boundaries; fractional
  seconds; delayed updates derived from the fixed origin; and a current instant before the start
  clamping to zero.

## 2. Lesson-session ownership

- [x] 2.1 Thread the optional timing record through `LessonSession`, `CheckSession`, and their
  construction paths while keeping every existing constructor call untimed by default and
  avoiding any progress, generator, or problem-model field.
- [x] 2.2 Extend `src/lib/lesson.test.ts` to prove standard, mixed-review, and skip-check defaults
  remain untimed; explicit timing retains the exact same origin through correct answers, misses,
  recovery, lazy materialization, and exact retries; and queue and completion behavior is
  unchanged.

## 3. Timed lesson surface

- [x] 3.1 Add an explicit timed-session opt-in to the shared lesson surface. Start its monotonic
  origin only when practice starts, preserve it through manual intro review, render one compact
  tabular elapsed clock in the existing header, recompute from the origin once per second, and
  clear updates on completion or unmount without changing submission or completion paths.
- [x] 3.2 Extend first-paint component coverage for an untimed lesson with no clock, an automatic
  intro with no running clock, and an active timed lesson with one accessible `0:00` clock, no
  live region, and unchanged progress, intro-review, prompt, and answer controls.

## 4. Pre-activation validation

- [x] 4.1 Run the focused session-clock, lesson, and Lesson component test files and the production
  build needed to exercise the clock before capability activation. Fix every in-scope failure.
- [x] 4.2 Follow `docs/environment.md` with a temporary real-app timed fixture at 375 by 812
  pixels. Prove no clock appears before practice or in an untimed session; a timed clock starts at
  `0:00`, catches up from its fixed origin after a delayed update, and continues without reset or
  pause through intro review; its accessible name tracks the visible value without a live region;
  waiting does not submit an answer, record an attempt, or change the problem; completion and
  leaving clear clock updates; and a new session starts at `0:00`. Exercise the densest header at
  the specified `1:00:05` value and confirm the leave, progress, count, clock, and intro-review
  controls stay visible and legible with no horizontal overflow. Confirm answer flow remains
  unchanged, capture and inspect one passing screenshot, remove the fixture exactly, rerun the
  affected tests and production build, stop any temporary server, and confirm its port is free.

## 5. Capability and documentation

- [x] 5.1 Add `timed` to `AVAILABLE_CAPABILITIES` only after section 4 passes, then extend
  manifest/course coverage to prove Stage H still declares it, all six Stage H skills still lack
  generators and remain planned, Stage H stays absent from the course tree, and exactly 195 of 201
  skills remain implemented.
- [x] 5.2 Update `AGENTS.md`, `README.md`, `docs/curriculum.md`, and `docs/roadmap.md` so capability
  and remaining-work claims record timed mode as built without marking a Stage H skill playable.
  Record roadmap increment 29a as shipped while leaving item 29 and 29b open.

## 6. Final verification

- [x] 6.1 Run the focused session-clock, lesson, Lesson component, manifest, curriculum-document,
  and coverage test files after capability and documentation changes. Fix every in-scope failure.
- [x] 6.2 Run `npx openspec validate add-session-timer --strict`, `npm test`, `npm run build`, and
  `npm run lint`; accept only explicitly documented pre-existing warnings.
