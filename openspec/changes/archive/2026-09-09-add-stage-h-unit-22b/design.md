## Context

See `proposal.md` for the approved product contract and scope. The selected roadmap increment is 30b, the two remaining Stage H / Unit 22 ids. Preparation starts from clean `main` at `bfc571e6eb7d04a02c8dc13a21c7b4d4e55cba60`, matching fetched `origin/main`.

The existing architecture already owns most behavior:

- `src/curriculum/unit-22-test-preparation.ts:32–39` exports the quantitative and algebraic source pools. Its mixed-review wrappers preserve source problem identity; `defineSkill` would restamp it.
- `src/lib/lesson.ts` owns lazy lesson slots and has fixed-answer `CheckSession` transitions. `startCheckSession` is specifically restricted to the existing skip-check count and difficulty; standard sessions instead retry until their correct target is met.
- `src/components/Lesson.tsx` owns `PracticeMode`, intro entry, clock lifecycle, answer controls, feedback and completion. At line 316 it reads `slot.source.skill`, and ordinary attempt recording at line 376 credits that slot owner. A form that stores actual source skills in its slots must explicitly credit the selected form id instead.
- `src/lib/submit.ts` distinguishes scored misses (including wrong-form answers) from unparseable entries that record nothing. Its shared copy and worked-solution rules already explain each outcome.
- `src/components/ScoreEstimate.tsx` accepts earned and possible points, with all mapping, bands, caveat and offline presentation already implemented. `src/lib/score-estimation.ts` validates its supplied points.
- The manifest already holds both ids and the entire Stage H capability set. Registration makes the forms implemented; no graph or capability switch is needed.

## Goals / Non-Goals

**Goals:** Put form sampling in the curriculum layer, fixed-answer transitions in the existing session layer, and form routing/credit in the lesson consumer. Keep content, identity and progress ownership distinct. Make every handler-sensitive rule testable through pure transitions plus real-browser integration.

**Non-Goals:** No general assessment framework, configurable exam builder, new capability flag, source-content rewrite or storage schema. Do not make generators stateful to enforce a form-wide quota: they also serve isolated intro, review, skip and validation calls.

## Decisions

### 1. Keep stateless generators and session-wide sampling separate

Add the two `SkillGenerator` wrappers to `unit22` in manifest order. Each standalone call selects an area with probabilities 21/46 and 25/46, then uniformly draws one generator from the corresponding existing pool and delegates using the supplied RNG and difficulty. Preserve the entire source problem; do not use `defineSkill` to restamp it. The wrapper provides the form's own name, blurb and teaching line. Keep source selection independent of difficulty so paired seeded difficulty tests can compare the same source.

A small Unit 22 form helper owns the two recognized form ids, fixed counts and selection behavior. At a full-form launch it creates exactly 21 quantitative and 25 algebraic area slots, shuffles that list once with the session RNG and selects sources uniformly with replacement. Seeded problem generation then uses those source generators at difficulty 3 through the central `generateProblem` validation. The helper imports existing pools rather than the registry, preserving the current acyclic import direction. The lesson layer receives sources and does not import curriculum to decide which areas exist.

Use one stable seed stream per live session, distinct from the existing fixed intro seed. Source and area selection are settled once; problem materialization can remain lazy. Renders, intro reviews and answer feedback must not redraw a slot. A fresh launch draws a fresh seed; chance overlaps are allowed. These two ids are separate progression entries with the same sampling design, not guaranteed different papers.

A generator-local counter was rejected because calls outside a form would corrupt quotas and determinism. Pure 45%/55% random draws for all 46 live slots were rejected because they would not guarantee the approved 21/25 split. Duplicating source generators or maintaining a second membership list was rejected because the existing pools already express the required curriculum boundary.

### 2. Extend the fixed-answer mechanics at their existing owner

Generalize the small fixed-answer construction/materialization logic in `src/lib/lesson.ts` to honor each slot's supplied difficulty. Keep `startCheckSession` as the existing eight-question, fixed-check-difficulty adapter with its validation intact; introduce a form adapter supplied with its 46 difficulty-3 sources. A shared fixed-answer session/transition is appropriate because both consumers count answered questions, preserve unparseable entries and never requeue scored answers. Do not copy the standard lesson's pacing or recovery state into forms.

Keep current problem access and generation paths shared. Count exactly one correct point or zero per consumed slot. Reject invalid form source counts at the form boundary and attempts to advance an already empty session. The fixed-answer transition receives the existing `'correct' | 'incorrect' | 'none'` recording decision and makes no persistence calls.

Replacing standard `targetCorrect` with 46 was rejected: retries would inflate results and all-miss practice would never finish. Calling the existing skip-check initializer unchanged was rejected because it pins the wrong count and difficulty. A generic configurable testing service is unnecessary for these two consumers.

### 3. Route individual form practice explicitly

Extend `PracticeMode` with a form branch carrying the selected form skill. The individual-skill `Lesson` entry recognizes only the two owned form ids and chooses that branch; `ReviewLesson` and `SkipCheckLesson` keep their explicit existing branches. An isolated form-generator draw in either of those modes remains a single delegated problem at the caller's requested difficulty, never a nested form. No change to review selection or skip eligibility is needed.

Reuse the same answer surfaces and post-answer feedback. Forms hide pre-answer hints. Correct feedback advances through the existing short transition; miss feedback advances on dismissal. Wrong-form statuses are scored misses, preserving form-specific copy and suppression of irrelevant worked solutions. Unparseable entries stay editable without recording or advancing.

Use the existing submission gate for the complete feedback transition. Track and cancel form advance callbacks on leave/unmount, and guard the final completion transition so rapid taps cannot duplicate credit or update a departed session. Where check/form behavior is identical, share that small path; keep progress and completion callbacks explicit per mode. A second full practice component would duplicate all supported input controls and accessibility behavior.

### 4. Separate form credit from source identity and score

Live form slots may contain actual source generators; `problem.skillId` must still name the source for display and diagnostics. The form mode's selected skill id is the owner passed to `recordAttempt` and `completeLesson`. Never infer this owner from a delegated problem or its slot. Maintain existing global misconception-tag accounting without writing sampled skills.

Invoke ordinary completion once after all 46 answers complete their feedback. This intentionally awards the usual mastery increment (capped at 5), XP, coins, streak, review schedule and milestone flow even for 0/46. It is practice completion, not an official pass. There is no score threshold for rewards or access to the second form; the unchanged manifest and practised-skill rules govern access.

Compose `ScoreEstimate` into the existing completion surface with this session's `correctCount` and possible points 46, keeping normal completion actions and milestones. Do not derive points from stored skill totals, and do not write estimate fields to progress. Leaving early retains already recorded attempts under the ordinary contract but awards no completion and shows no complete-form estimate. No partial-session resume is added.

### 5. Reuse teaching intros and the elapsed clock

Both wrappers carry their own concise teaching lines about full-length mixed practice. Their example is their own fixed-seed, difficulty-1 delegated draw, rendered by `SkillIntro` with source identity and worked steps. Live form difficulty remains 3; the example is not one of its 46 slots.

Extend the existing automatic/review intro handling to form mode. Start both the live session and existing clock only when automatic intro practice starts; if already seen, start on direct entry. The form's visible instructions explain 46 questions, one scored answer per question and an elapsed clock without a cutoff. Intro review remains available outside feedback, preserves entry/question/count/points and never pauses or resets the clock. Do not show timer ticks as live announcements.

No countdown or nominal 115-minute goal is introduced. `timed-mode` and `ged-score-estimation` requirements already match this consumer; no deltas to their mechanics are needed.

### 6. Preserve delegated content checks and retire obsolete boundaries

Neither form is a curriculum wall. Misconceptions come unchanged from source generators, including such existing patterns as carrying/borrowing errors, omitted denominator work, percent-rate confusion, sign errors, swapped coordinates and use of the wrong geometry formula. Do not author generic test-taking misconceptions or remove source wall checks: the source-specific independent sweeps remain authoritative for answers and surviving misconception counts.

Extend the narrow delegated-wrapper exclusions already used by the two mixed reviews in `src/curriculum/generators.test.ts` only to the two new ids where the same sparse-sampling rationale applies. Pin the exact exclusion sets and prove no source generator is excluded. Add paired same-seed source/difficulty checks and independent answer recomputation for sampled wrapper output. Test full-form composition and fixed live difficulty separately from the generator's caller-supplied difficulty behavior.

The delta retires obsolete four-skill Stage H and 199-skill Stage G boundary requirements rather than preserving scenarios that would archive false claims. Modified progression and intro requirements retain their existing scenarios, explicitly scope ordinary warm-up behavior, and add form scenarios. After implementation, update the Unit 22 baseline Purpose to include full-length practice during final spec sync, as delta Purpose sections do not update existing capabilities.

## Risks / Trade-offs

- **Uneven real-test coverage:** Uniform selection across the broad approved review pools includes foundational material. Fixed difficulty 3 and the 21/25 split define this practice product, not calibrated GED equivalence. Reuse the visible approximate-score caveat and make no official-paper claim.
- **Accidental source credit:** Existing ordinary attempt code uses slot ownership. Explicitly test form-id recording and unchanged source progress across correct, wrong-value, wrong-form and completion paths.
- **Mode regressions:** Fixed-answer reuse touches skip-check mechanics and intro handling. Pin existing check count/difficulty, standard warm-up/requeues and untimed review behavior alongside form tests.
- **Long mobile result:** The normal completion surface plus score explanation can exceed one screen. Allow vertical access to the complete result and mapping; verify no horizontal overflow or clipped actions at 375 by 812 pixels.
- **Callback races:** Answer transitions can outlive navigation. Test rapid submit/dismiss, final-answer completion and leaving during feedback in the browser; cancel pending callbacks.
- **No resume:** A reload discards the current paper and clock but keeps recorded attempts. State this in the form's entry/leave context without adding a new persistence path.

## Migration Plan

No migration is required: both skill ids already exist, and this work adds no stored fields. Existing per-skill records and opaque reconciliation remain untouched. Registration, coverage checks and curriculum completion markers land together. Reverting the implementation removes playable form registration while retaining any already stored form progress under the existing unknown/planned-skill rules. Archive only after the later implementation/review workflow completes; preparation writes no application code or baseline specs.
