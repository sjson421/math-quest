## 1. Reachable review

- [x] 1.1 Extend `src/App.tsx` so course-tree renders derive the current bounded due-skill
  snapshot from manifest-ordered implemented ids, normalized progress, and the local day; add a
  review screen that captures that snapshot and the exact starting `TreeLevel`, lazily mounts the
  existing `ReviewLesson`, and returns to the captured level when active practice is left or the
  learner continues from its completion screen.
- [x] 1.2 Extend `src/components/Home.tsx` with one count-aware review callout below the daily
  goal that renders on all three tree levels only when the supplied snapshot is non-empty, and
  add focused server-rendered coverage for positive and zero counts without duplicating selection
  policy in the component.

## 2. Learning progress reports

- [x] 2.1 Extend `src/components/SkillList.tsx` to read each playable skill through
  `readReviewState()` and show a compact `Recall N/5` line separate from the unchanged mastery
  bar; extend `SkillList.test.tsx` for explicit, legacy, malformed, untouched, and mastery-
  distinct values without rewriting progress, while preserving the existing locked and unlocked
  startability assertions.
- [x] 2.2 Add focused server-rendered Settings coverage for the existing “Things to watch”
  insight: descending frequency, three-item limit, counts, readable known and fallback tag text,
  respectful non-scolding wording, and omission for an empty `mistakes` map. Change production
  Settings behavior only if a test proves the existing contract is not met.

## 3. Product documentation

- [x] 3.1 After behavior and focused tests pass, mark roadmap increment 27c and item 27 shipped
  on 2026-09-01, and update README status text so review and spaced repetition are no longer
  described as unbuilt. Do not change curriculum status, playable counts, skill ids, generators,
  or capabilities.

## 4. Verification

- [x] 4.1 Run focused review, Lesson, Home, SkillList, and Settings tests and fix every in-scope
  failure.
- [x] 4.2 Run `openspec validate show-review-progress --strict`, `npm test`, `npm run build`, and
  `npm run lint`; accept only explicitly documented pre-existing warnings.
- [x] 4.3 Follow `docs/environment.md` to drive the real app at 375 by 812 pixels. Seed
  `read-numbers` and `place-value-tens` as due on different dates, `compare-numbers` in the future,
  planned `calculator-skills` as due, and misconception progress through IndexedDB. Verify the
  callout reports two selected skills on stage, unit, and skill levels; review presents the two due
  skills oldest-first without admitting future or planned records; leaving active review returns
  to the exact tree level; completing a second run and continuing returns there again and hides
  the entry after rescheduling; recall and Settings text, tap targets, and horizontal overflow pass;
  capture and inspect one screenshot; remove temporary state; stop any server started for the check.
