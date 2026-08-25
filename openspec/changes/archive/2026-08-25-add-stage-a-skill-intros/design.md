## Context

See `proposal.md` for the learner problem. `Lesson` currently creates its opening problem during first render, owns all session state, and renders worked steps only inside incorrect-answer feedback. `ProblemView` already exhaustively renders every `Display` arm, while `generateProblem()` is the validated seeded entry point. `reconcile()` merges stored skill objects over default objects whole, and the sync endpoint stores those objects opaquely.

The content contract already names a teaching line and worked example, but only hints, generated steps, walls, and forward references are enforced today. Roadmap increment 25a must add the mechanism and Stage A content without forcing teaching lines onto the other 165 playable generators before increments 25b–25d.

## Goals / Non-Goals

**Goals:**

- Keep intro presentation, lesson practice, and stored learning evidence separate.
- Reuse the generator, display renderer, answer semantics, and solution steps already owned by the problem system.
- Make old, synced, and rolled-back progress safe without a schema-version migration.
- Give the eight Stage A teaching lines direct source coverage and a complete phone-layout gate.

**Non-Goals:**

- A second lesson route, problem type, input mode, display renderer, or example-content store.
- Any change to problem draws, answers, hints, solution steps, or misconceptions. The `round-to-100` wall keeps `rounded-down`, `rounded-up`, and `rounded-only-to-tens` predictions.
- Requiring teaching lines outside Stage A in this increment.

## Decisions

### Carry staged teaching metadata on the generator

`SkillGenerator` and the engine's `SkillConfig` gain an optional `teachingLine`, and `defineSkill` copies it to the generator. Stage A supplies the eight reviewed strings from the Unit 0 delta. Coverage asserts that exactly Stage A has the field after 25a.

Optionality is temporary but honest: making the field required now would demand unrelated edits to 165 generators, while a second intro-content registry would duplicate skill ids and drift from the generator it describes. Increment 25d can make the field required once every playable skill carries it.

### Generate one stable example outside the lesson queue

The intro calls `generateProblem(skill, 1, 1)`. Seed 1 is already part of the recorded-output sample, difficulty 1 is fixed by the roadmap, and using the public generation entry point preserves answer-shape validation and misconception filtering. The intro seed never increments the lesson's mount-time seed counter.

For an unseen intro, `Lesson` holds no session until the learner selects Start practice. This keeps the existing lazy-generation invariant: the warm-up is not created behind a screen where it is not yet needed. Reviewing an intro holds the existing session in place and does not call the problem factory.

A fresh random intro and reuse of the lesson seed were rejected. The former turns reviewed teaching content into a moving target; the latter changes the problems a learner receives merely because an intro was shown.

### Reuse display and solution ownership while rendering a read-only answer

A focused `SkillIntro` component receives the teaching line and generated problem. `ProblemView` gains an explicit read-only policy that suppresses its interactive answer frame, so the intro can reuse every existing display arm without drawing an empty slot. A pure exhaustive answer-label helper converts every `Answer` arm to learner-facing text, resolving choice ids to labels and keeping point and root-pair encodings private.

The numbered solution-step markup is extracted into one component shared by incorrect feedback and the intro. This avoids a second renderer for either displays or worked steps. Reusing feedback as the intro was rejected because feedback carries error state, input state, and dismissal policy that a teaching screen does not have.

### Keep intro navigation inside Lesson

`Lesson` owns a small presentation mode: automatic intro, practice, or intro review. The automatic screen has Leave and Start practice. There is no separate Skip button; Leave keeps the flag unseen, while Start practice records presentation and follows the one lesson path.

Once a teaching line is seen, the lesson header exposes Review intro while the learner is answering a problem. Returning from review restores the same current problem, entry, hint visibility, and correct count because the review mode does not call any answer, session, or progress transition. The control stays out of the short feedback transition, whose timer must remain the exclusive owner until the next problem is ready. A new `App` route was rejected because it would move lesson-owned transient state across a routing boundary. A second control nested in the skill-card button was rejected because it complicates card semantics and accessibility.

### Store one optional, progression-neutral flag

`SkillProgress` gains optional `introSeen`. New defaults set it to false, but all reads use `record?.introSeen === true`; an older object that overrides the whole default therefore remains safely unseen. `markIntroSeen(skillId)` spreads the complete stored skill object, sets only the flag, and persists through the existing mutation boundary. It is a no-op when already true.

No schema version changes. The server is opaque, and an older client preserves the unknown field because reconciliation retains each complete skill object. Rolling back may stop showing intros, but it neither removes the flag nor corrupts practice; upgrading again restores the prior seen state.

The flag is deliberately not an attempt, mastery, practice source, review strength, or skip-ahead result. Those systems must continue to read their own evidence.

### Extend the existing content-rule owner

`content-rules.ts` gains a direct teaching-line check for non-empty single-sentence text, forward references, and the one-new-term budget. The curated vocabulary map gains exactly four Stage A technical entries, all introduced in Unit 0: `numeral`, `expanded form`, `ascending order`, and `rounding`. In curriculum order, the eight lines must contain `[1, 0, 0, 1, 0, 1, 1, 0]` current-unit terms. This makes the new-word assertion positive on four skills rather than a vacuous pass, while words the existing map deliberately treats as everyday teaching language remain uncounted.

A vocabulary term mapped to a later unit is a forward reference; more than one mapped to the current unit is too much new vocabulary. The expected counts are pinned with the exact lines, so a later wording edit cannot weaken the gate by silently removing the tracked term.

The generator sweep runs this authored-source check once per generator, while Stage A coverage pins which generators are required in 25a. Generated-problem sampling stays unchanged. A separate intro checker was rejected because it would split one content contract across two owners.

### Verify composition at the installed size

Static component tests cover semantic markup, every answer arm, absent input controls, the automatic/bypassed first paint, and the shared solution list. Store tests cover old-record defaulting, isolated mutation, no-op review, file restore, and remote adoption. The real-app gate exercises all eight Stage A intros at 375 by 812 pixels, starts practice, re-enters without an automatic intro, reviews the intro during a lesson, resumes the exact problem, captures the required passing screenshot, and visually inspects it.

## Risks / Trade-offs

- **[Risk] The intro plus up to four steps exceeds the phone height** → Use a compact intro composition, test every Stage A example at 375 by 812 pixels, and treat hidden actions or page overflow as a failure.
- **[Risk] Read-only answers leak internal choice or compound-answer encodings** → Use one exhaustive answer-label helper with focused tests for every `Answer` arm.
- **[Risk] Marking the intro seen accidentally affects unlocking or later review** → Give it one isolated store mutation and assert every learning field remains unchanged.
- **[Risk] Old or remote progress silently bypasses the intro** → Read only literal `true` as seen and test records with the field missing or malformed.
- **[Trade-off] Existing learners see Stage A intros once** → This is the harmless migration direction selected by the roadmap; hiding content they never received is worse.

## Migration Plan

1. Ship the optional generator metadata, intro UI, read-time default, and Stage A lines together so no empty intro can appear.
2. Do not bump the progress schema or change the sync API; persist the field through the existing whole-object path.
3. Existing records show each Stage A intro once. New records explicitly start false. Records already true on another device stay true after adoption.
4. On rollback, the older client ignores but preserves the field. Reinstalling the new client resumes from the preserved value.
