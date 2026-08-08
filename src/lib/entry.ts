/**
 * What the answer slot shows, which is never what the checker gets.
 *
 * Three input modes, three translations: a choice submits a stable id and reads
 * as its label, a placement and a typed number both submit ASCII and read with
 * the typographic minus the rest of the screen uses. Each translation already
 * lived somewhere sensible — `entryLabel` beside the pad rule that produced the
 * string, `placedLabel` beside the line — and what did not was the dispatch
 * between them.
 *
 * A `Record` over `inputMode` rather than a chain of `if`s, for the reason
 * `Lesson.tsx` gives for `answerControl` and `ProblemView.tsx` gives for
 * `SLOT`: the union widened silently once already when number-line input was
 * added, and nothing failed to compile — the new mode simply drew a keypad. A
 * fourth mode is a compile error here instead of inheriting the pad's minus
 * swap.
 *
 * Pure and outside the component so a node test can reach it. The lesson's
 * first paint always has an empty entry, so every branch below is unreachable
 * from a static render — which is how the previous chain went uncovered.
 */

import { entryLabel } from './keypad'
import { placedLabel } from './number-line'
import type { Problem } from './types'

const SHOW: Record<Problem['inputMode'], (problem: Problem, entry: string) => string> = {
  keypad: (_problem, entry) => entryLabel(entry),
  choice: (problem, entry) =>
    problem.choices?.find((choice) => choice.id === entry)?.label ?? '',
  // A problem declaring this mode without a line renders no control at all, so
  // there is nothing for an entry to have come from and nothing to echo.
  'number-line': (problem, entry) =>
    problem.numberLine ? placedLabel(problem.numberLine, entry) : '',
}

export const visibleEntry = (problem: Problem, entry: string): string =>
  SHOW[problem.inputMode](problem, entry)
