## 1. Generator metadata and content rules

- [ ] 1.1 Add optional `teachingLine` metadata to `SkillGenerator` and `SkillConfig`, pass it through `defineSkill`, and keep generators without the field playable during increments 25a–25c (under 2 hours)
- [ ] 1.2 Add a direct teaching-line check to `content-rules.ts` for non-empty one-sentence text, later-unit vocabulary, and at most one curated current-unit term; add exactly `numeral`, `expanded form`, `ascending order`, and `rounding` as Unit 0 entries in the shared vocabulary authority (under 2 hours)
- [ ] 1.3 Add positive and named-failure tests for empty and multi-sentence teaching lines, forward references, and multiple new terms; pin Stage A's curriculum-order term counts to `[1, 0, 0, 1, 0, 1, 1, 0]`, then wire the authored-source check into the generator content sweep (under 2 hours)
- [ ] 1.4 Extend curriculum coverage to require teaching lines on exactly the eight Stage A generators while allowing Stages B–F to remain pending their ordered intro increments (under 2 hours)

## 2. Read-only worked-example data

- [ ] 2.1 Add one pure exhaustive helper that converts exact, approximate, choice, expression, point, and root-pair answers into learner-facing labels without exposing choice ids or compound-entry encodings (under 2 hours)
- [ ] 2.2 Add focused tests for every answer arm, exact-form requirements, missing or duplicate choice labels, typographic signs, ordered points, and unordered root pairs (under 2 hours)
- [ ] 2.3 Add an explicit read-only `ProblemView` policy that renders every existing display arm without an interactive or empty answer frame, preserving the current default for ordinary lessons (under 2 hours)
- [ ] 2.4 Add static-markup coverage proving every existing display arm — inline, column, decimal-column, story, math, diagram, coordinate-plane, chart, and equation — keeps its semantic markup while suppressing the answer slot (under 2 hours)

## 3. Compatible intro progress

- [ ] 3.1 Add optional `introSeen` to `SkillProgress`, seed new records false, read only literal true as seen, and add an idempotent `markIntroSeen` store action that spreads the complete skill object and persists only a real change (under 2 hours)
- [ ] 3.2 Test that marking an intro changes only `introSeen` and `updatedAt`, leaves every learning and reward field and the derived unlock state unchanged, and performs no second write when already true (under 2 hours)
- [ ] 3.3 Test records with absent or malformed intro state through initial read, file replacement, and remote adoption, including preservation of unknown skill fields and a true seen value across the opaque sync shape (under 2 hours)

## 4. Intro presentation and lesson ownership

- [ ] 4.1 Extract the numbered worked-solution markup from wrong-answer feedback into one reusable component, keeping existing feedback output unchanged, and add focused static-markup tests (under 2 hours)
- [ ] 4.2 Build the read-only `SkillIntro` screen from the teaching line, generated prompt and display, labelled correct answer, and shared solution steps, with clear Leave, Start practice, and Back to practice actions and no answer controls (under 2 hours)
- [ ] 4.3 Add static-markup tests for intro reading order, accessible names, hidden input controls, every existing display arm, and exact, approximate, choice, expression, point, and root-pair answers (under 2 hours)
- [ ] 4.4 Integrate automatic intro and review modes into `Lesson`: generate the intro through `generateProblem(skill, 1, 1)`, create no lesson session until Start practice, mark only the unseen intro, and expose Review intro for every skill carrying a teaching line only while the learner is answering a problem (under 2 hours)
- [ ] 4.5 Add focused first-paint lesson tests proving an unseen teaching skill generates only its fixed difficulty-1 example and a seen or metadata-free skill opens on the ordinary warm-up; leave Start and review interaction assertions to the real-browser gate because node-side component tests attach no handlers (under 2 hours)

## 5. Stage A teaching content

- [ ] 5.1 Add `read-numbers` teaching line: “A numeral uses digits to show a number.” (under 2 hours)
- [ ] 5.2 Independently assert the exact `read-numbers` line and content-rule result, then recompute its fixed difficulty-1 intro answer from visible whole-number data rather than trusting the generated answer (under 2 hours)
- [ ] 5.3 Add `place-value-tens` teaching line: “The tens digit is second from the right.” (under 2 hours)
- [ ] 5.4 Independently assert the exact `place-value-tens` line and content-rule result, then recompute its fixed difficulty-1 intro answer from visible whole-number data rather than trusting the generated answer (under 2 hours)
- [ ] 5.5 Add `place-value-hundreds` teaching line: “The hundreds digit is third from the right.” (under 2 hours)
- [ ] 5.6 Independently assert the exact `place-value-hundreds` line and content-rule result, then recompute its fixed difficulty-1 intro answer from visible whole-number data rather than trusting the generated answer (under 2 hours)
- [ ] 5.7 Add `expanded-form` teaching line: “Expanded form shows a number as a sum of its place values.” (under 2 hours)
- [ ] 5.8 Independently assert the exact `expanded-form` line and content-rule result, then recompute its fixed difficulty-1 intro answer from visible whole-number data rather than trusting the generated answer (under 2 hours)
- [ ] 5.9 Add `compare-numbers` teaching line: “Compare digit counts, then matching places from the left; all matches mean equal.” (under 2 hours)
- [ ] 5.10 Independently assert the exact `compare-numbers` line and content-rule result across different digit counts, a first differing place, and equality; recompute its fixed difficulty-1 intro choice from visible numbers and resolve the visible label rather than trusting the generated id (under 2 hours)
- [ ] 5.11 Add `order-numbers` teaching line: “Ascending order lists numbers from smallest to largest.” (under 2 hours)
- [ ] 5.12 Independently assert the exact `order-numbers` line and content-rule result, then sort the fixed difficulty-1 intro's visible numbers and resolve the matching choice label rather than trusting the generated id (under 2 hours)
- [ ] 5.13 Add `round-to-10` teaching line: “Rounding uses the ones digit: below 5 goes down, 5 or more goes up.” (under 2 hours)
- [ ] 5.14 Independently assert the exact `round-to-10` line and content-rule result, then recompute the fixed difficulty-1 intro answer from its visible value and retain midpoint-up coverage (under 2 hours)
- [ ] 5.15 Add `round-to-100` teaching line: “Use the final two digits: below 50 goes down, 50 or more goes up.” while retaining all three authored wall predictions (under 2 hours)
- [ ] 5.16 Independently assert the exact `round-to-100` line and content-rule result, recompute the fixed difficulty-1 intro answer from its visible value, and retain at least two surviving diagnoses for every sampled problem (under 2 hours)

## 6. Documentation and automated gates

- [ ] 6.1 Update `README.md`, `docs/curriculum.md`'s enforced-content summary, and roadmap increment 25a with the shipped Stage A intro behavior and decisions while leaving roadmap item 25 unchecked for increments 25b–25d (under 2 hours)
- [ ] 6.2 Run the focused intro, lesson, display, content-rule, Unit 0, curriculum coverage, and progress-store suites; fix every scoped failure (under 2 hours)
- [ ] 6.3 Run `npm test`, `npm run build`, and `npm run lint`; fix every scoped failure and confirm only the three documented pre-existing `Settings.tsx` lint warnings remain (under 2 hours)

## 7. Real-app validation

- [ ] 7.1 Follow `docs/environment.md` with a shell-driven Chromium run at 375 by 812 pixels: exercise all eight Stage A intros and assert each complete teaching line, example, answer, worked steps, and action set has no horizontal or page overflow; leave one unseen intro and confirm it reappears; start practice and confirm the unchanged zero-count warm-up; leave and re-enter to confirm the automatic intro stays dismissed; record the visible problem, entry, hint, count, and persisted progress version, open Review intro, return and prove all five are unchanged; submit an answer and prove Review intro stays absent throughout feedback then returns with the next answer surface; capture and visually inspect the required passing screenshot; clear test IndexedDB state, stop any server started for the check, and confirm its port is free (under 2 hours)
