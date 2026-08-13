## 1. Type and matching logic

- [x] 1.1 Widen `Misconception.value` in `src/lib/types.ts` from `number` to
      `number | { kind: 'text'; value: string }`; update its doc comment to describe both
      forms.
- [x] 1.2 In `src/lib/generator.ts`'s `generateProblem()`, branch the misconception
      filter/dedup on `typeof m.value`: keep the existing `Number.isFinite` + numeric `Set`
      dedup + correct-answer exclusion for `number`; add a parallel path for the text form
      that drops blank/whitespace-only values and dedups via a separate `Set<string>`.
- [x] 1.3 In `src/lib/generator.ts`'s `diagnose()`, add a comparison branch: when a
      misconception's `value` is the text form, match it against `raw.trim()` by exact
      string equality, alongside the existing numeric comparison.

## 2. Tests

- [x] 2.1 In `src/lib/generator.test.ts`, add a synthetic problem/misconception fixture
      exercising: a text-valued misconception reaching the learner unfiltered, a blank
      text-valued misconception being dropped, two identical text-valued misconceptions
      deduping to one, and `diagnose()` matching a text-valued misconception against a
      trimmed raw entry.
- [x] 2.2 Add a test confirming a numeric and a text misconception with visually similar
      values (e.g. `5` and `'5'`) do not collide during dedup or correct-answer exclusion.
- [x] 2.3 Run `npm test` and confirm every existing test touching `Misconception` or
      `diagnose()` (curriculum unit tests, `generator.test.ts`, `coverage.test.ts`,
      `content-rules.ts`-driven tests) still passes unchanged — no existing literal needed
      edits per the design's compatibility goal.

## 3. Validation

- [x] 3.1 Run `npm run build` and `npm run lint` and confirm both pass.
- [x] 3.2 Real-app browser validation per `docs/environment.md`: drive an existing wall
      skill that has predicted misconceptions (e.g. a Unit 6 or Unit 9 wall) end to end,
      submit a wrong answer matching a predicted misconception, and confirm the hint/nudge
      still displays exactly as before this change — proving the widened type introduced no
      regression to the numeric path. Take the closing 375px screenshot per the script's
      convention and report what it showed.
