## Why

Stage H has two planned full-length forms, but the existing ordinary lessons finish after ten correct answers and cannot produce a meaningful first-answer score. Roadmap increment 30b completes Unit 22 and the playable course using the elapsed clock and score estimator already shipped in item 29.

## What Changes

- Register exactly `timed-practice-1` and `timed-practice-2` in Stage H, Unit 22, with authored teaching lines and stable delegated intro examples.
- Give both forms the approved contract: 46 one-point questions, with 21 quantitative and 25 algebraic source draws, sampled uniformly with replacement within the existing review pools. Shuffle the area schedule once per session, draw fresh problems on each launch, and use difficulty 3 throughout live practice.
- Consume each question on its first scored answer, without hints, retries, warm-up or adaptive difficulty. Preserve unfinished-entry correction and existing post-answer feedback, including wrong-form feedback.
- Start the existing elapsed clock when practice begins, without expiry. Award ordinary per-attempt and completion credit only to the selected form skill. Show the existing approximate GED score result from earned points out of 46 after completion.
- Preserve ordinary lessons, spaced review, skip checks, source progress, manifest prerequisites and all existing capabilities. A form generator sampled by a different session remains one delegated problem; it does not start a nested timed form.
- Mark both curriculum rows complete and close roadmap item 30 only after implementation and verification, bringing the course to 201 of 201 playable skills.

## Capabilities

### New Capabilities

None. No new input, rendering, timing, estimation, storage or network infrastructure is required. The fixed-length form is the bounded consumer integration explicitly assigned to 30b.

### Modified Capabilities

- `unit-22-test-preparation`: Add both full-length forms, their sampling, answer, timing, scoring and progress contract; retire the requirement that they remain planned.
- `curriculum-manifest`: Replace the four-skill Stage H completion boundary with the complete course while retaining completed Stage G content.
- `skill-progression`: Scope ordinary warm-up, adaptation and correct-target completion rules so full-length forms follow their explicit fixed-answer contract.
- `skill-intros`: Extend Stage H teaching examples to the two forms and specify their start behavior without an ordinary warm-up.

## Non-goals

No official GED form, calibrated item bank, official pass claim, hard time limit, countdown, 115-minute target, calculator emulator or calculator-restricted section. No answer navigation, skipping, deferred grading, partial credit, saved forms, resume, score history, score-based rewards or mastery thresholds. No changes to the source generators, review scheduling, skip eligibility, manifest graph, sync schema, or item 31. The two skills share one form contract and draw fresh samples; they are not two fixed published papers.

## Impact

Extend Unit 22 delegation and its tests, fixed-answer session mechanics in `src/lib/lesson.ts`, and the individual-skill flow in `src/components/Lesson.tsx`. Reuse existing input/display, feedback, intro, elapsed-clock, completion and score-estimate components. Update generator-contract exclusions only where delegated sampling needs the same evidence-backed treatment as the two existing mixed reviews; retain independent source answer tests. Update coverage and curriculum/status documentation. No dependency, API or persisted-data migration is needed.
