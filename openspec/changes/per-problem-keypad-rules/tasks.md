## 1. Carry the rules on the problem

- [x] 1.1 Add `keypad?: KeypadRules` to `Problem` in `src/lib/types.ts`, importing the type
      from `src/lib/keypad.ts`. Comment why it sits on the problem rather than the generator.
- [x] 1.2 In `src/components/Keypad.tsx`, replace the three boolean props with
      `rules?: KeypadRules`, and have the pad call `applyKey` itself: `onKey` becomes
      `onEntry: (apply: (prev: string) => string) => void`, emitting a functional update so the
      stale-read protection its comment documents is preserved. Keep the whole-digits-only
      default and the stable layout — an unpermitted class still renders its
      `<span aria-hidden />` placeholder.

## 2. Decide once what each check result means

- [x] 2.1 Add `src/lib/submit.ts` exporting the policy as a `Record<CheckResult['status'], …>`:
      whether the correct count advances, whether an attempt is recorded and as what, whether
      the problem re-queues, whether the worked solution is shown, whether the entry clears.
      Keying on the union is the point — a missing branch must not compile.
- [x] 2.2 Add `src/lib/submit.test.ts` asserting each of the four statuses against the
      scenarios in `specs/answer-entry/spec.md`: `not-simplified` records an incorrect attempt
      with no tag, re-queues, and does not show the solution; `unparseable` records nothing,
      does not re-queue, and keeps the entry; `correct` and `incorrect` are unchanged from
      today's behaviour.

## 3. Cover the pad against its rules

- [x] 3.1 Add `src/**/*.test.tsx` to `test.include` in `vite.config.ts`, leaving
      `test.environment` as `node`.
- [x] 3.2 Add `src/components/Keypad.test.tsx` rendering the pad with `renderToStaticMarkup`
      and asserting: no rules yields digits only; each of `allowNegative`, `allowDecimal`,
      `allowFraction` yields exactly its own key and neither of the others; the fraction key
      wins over the decimal key when both are set; and the ten digit keys appear in the same
      source order in every case, since the pad is a source-ordered grid.

## 4. Wire the lesson

- [x] 4.1 In `src/components/Lesson.tsx`, render
      `<Keypad value={entry} onEntry={setEntry} onSubmit={submit} rules={problem.keypad} />`,
      dropping the local `applyKey` call and its now-unused import.
- [x] 4.2 Replace `submit`'s two-way branch with the policy from `src/lib/submit.ts`, so all
      four statuses are handled and none falls through to the wrong-answer path.
- [x] 4.3 Add the `not-simplified` response: the existing feedback panel, copy that
      acknowledges the value and asks for the required form, no worked solution, button still
      reading *Got it* because the problem re-queues rather than retrying immediately. Adult
      tone, no scolding, no alarm colour.
- [x] 4.4 Add the `unparseable` response: a short line above the pad saying the number is not
      finished, the entry left intact, the pad still up, cleared on the next key press.

## 5. Correct what this change falsifies

- [x] 5.1 `docs/roadmap.md` — the status line says "No capability beyond the plain number
      keypad is built." State it precisely rather than deleting it: the pad can now offer a
      sign, a decimal point and a fraction slash per problem, while `AVAILABLE_CAPABILITIES`
      is still empty, so no *stage* capability is built. The skill count stays 10 of 201.
- [x] 5.2 `docs/roadmap.md` — tick item 3 in the form items 0–2 already use,
      `- [x] **3 · Per-problem keypad rules** — S — **shipped 2026-08-01**`, with a short body
      saying what it left behind: rules on the problem, the pad as their single owner, and all
      four check results distinguishable. The whole item ships here, so leaving the box
      unchecked would point the next run of this workflow at an item that is already done.
- [x] 5.3 `docs/roadmap.md` — item 14 says "Item 3 is the real gate ... without `allowNegative`
      plumbed through they cannot be answered at all." That stops being true here. Rewrite it
      as what Unit 6 must now *do*: declare `keypad: { allowNegative: true }` on the problems
      whose answers are negative. Touch nothing else in item 14.
- [x] 5.4 `docs/curriculum.md` — two lines describe the flags as unwired: the Build order's
      Stage D entry says a fraction input mode is "already stubbed via `allowFraction`", and
      the capability table row reads "`allowFraction` flag already exists". Both become "wired,
      per problem". **Keep the parsed prefixes byte-identical** — `manifest/curriculum-doc.ts`
      reads this file with `?raw` and matches `^\d+\. ` in the Build order and the stage/skill
      table shapes. Re-run `npx vitest run src/curriculum/manifest/curriculum-doc.test.ts`
      immediately after this edit, before anything else.
- [x] 5.5 `AGENTS.md` — "**The active queue is empty** — five changes shipped, the latest being
      `unit-1-completion`, archived 2026-08-01" stops being true the moment this change is
      committed unarchived. Say that `per-problem-keypad-rules` is active. Archiving corrects
      it back in its own commit; that is the workflow, not a duplicated edit.

## 6. Verify

- [x] 6.1 Run `npm test`, `npm run build`, and `npm run lint` in that order and inspect each.
      Only the three documented `Settings.tsx` lint warnings may remain.
- [x] 6.2 Drive the real app in the browser preview: open a lesson on a built skill, confirm
      the pad is unchanged (digits, backspace, Check, no sign/decimal/fraction key), and that a
      correct answer, a wrong answer, and a diagnosed misconception all behave exactly as
      before. This is a regression check — no built skill declares rules or
      `requireSimplified`, so the two new responses cannot be reached from the UI.
- [x] 6.3 Re-run `openspec validate per-problem-keypad-rules --type change --strict` and
      confirm every task above is checked.
