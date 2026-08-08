/**
 * The number line a problem declares, and everything derivable from it.
 *
 * Pure, and separate from the component that draws it, for the reason
 * `keypad.ts` is separate from `Keypad.tsx`: what the line *shows* and what it
 * *submits* have to come from one derivation. Two owners means a line can label
 * a tick with one value and submit another, which looks exactly like a broken
 * control and is invisible to a test that only reads the markup.
 *
 * It is also the only place a Node test can reach. Component coverage is
 * `renderToStaticMarkup` with no handlers attached, so a rule that lives behind
 * a tap — that a tap is not yet an answer — is untestable inside the component
 * and testable here.
 */

import { entryLabel } from './keypad'
import { format, rational, type Rational } from './rational'

/**
 * A line as its ticks, not as its endpoints.
 *
 * Tick `i` is `start + i × step`, so the tick set is total by construction: any
 * `count` is valid and every tick is exact. The obvious alternative — a `min`,
 * a `max` and a `step` — has to divide to learn how many ticks there are, and a
 * line divided into thirds then depends on that division landing whole.
 */
export type NumberLineSpec = {
  start: Rational
  /** Spacing between ticks. Must be positive; ticks ascend by construction. */
  step: Rational
  count: number
}

/** Every tick of the line, ascending, left to right as the learner reads them. */
export function ticks(spec: NumberLineSpec): Rational[] {
  const step = rational(spec.step.n, spec.step.d)
  // A descending line is not something the course wants, and allowing one would
  // mean every reader of this list has to remember which way it came.
  if (step.n <= 0) throw new Error('number line: step must be positive')
  if (!Number.isInteger(spec.count) || spec.count < 1) {
    throw new Error('number line: count must be a positive whole number')
  }

  const start = rational(spec.start.n, spec.start.d)

  return Array.from({ length: spec.count }, (_, i) =>
    rational(start.n * step.d + i * step.n * start.d, start.d * step.d),
  )
}

/** What placing on a tick submits: the value in the form `parseInput` reads. */
export const tickEntry = (tick: Rational): string => format(tick)

/**
 * What a tick reads as on screen.
 *
 * Typographic minus, matching the `−` the pad and every display already use.
 * That is exactly why this is not the same string as `tickEntry()` — the
 * checker parses ASCII, and the two diverged here rather than at the point one
 * of them was passed to the wrong place.
 *
 * Stated as `entryLabel` of the entry, which is what it always was: the pad
 * needs the same translation for a typed answer, and a second copy of the swap
 * would be two owners of one notation — the drift this function exists to stop,
 * one level up.
 */
export const tickLabel = (tick: Rational): string => entryLabel(tickEntry(tick))

export type Placement = {
  /** Which tick the entry sits on, or `-1` when nothing is placed. */
  index: number
  /** Whether confirming is available at all. */
  canConfirm: boolean
}

/**
 * Resolve the current entry against the line's ticks.
 *
 * The placed value is the lesson's ordinary entry — the same state a typed
 * answer lives in — so a placement is not a second kind of pending answer and
 * confirming is not a second submission channel. This reads that entry back to
 * find which tick to mark, which keeps one source of truth rather than a
 * highlighted index that can disagree with what would be submitted. What
 * confirming submits is `tickEntry()` of that tick, and stays that one function
 * rather than being copied onto the result.
 *
 * Takes the ticks rather than the spec, so a caller that is already drawing
 * them does not derive the same list twice.
 *
 * Matched on the submitted string rather than on value, because `tickEntry()`
 * is canonical: every tick formats one way, so equal strings and equal values
 * are the same question asked twice.
 */
export function placement(tickList: readonly Rational[], entry: string): Placement {
  const index = tickList.findIndex((tick) => tickEntry(tick) === entry)

  return { index, canConfirm: index !== -1 }
}

/**
 * How a placed value reads where the answer is echoed back, or empty.
 *
 * The entry is what the checker parses, so it carries an ASCII `-`; everything
 * the learner reads carries the typographic `−`. Echoing the entry verbatim put
 * both on screen at once — `−3` in the problem, `-3` in the slot beside it, and
 * `−3` on the tick below — which is the control disagreeing with itself about
 * what it just did. Round-tripping through the tick means the two forms meet
 * only here, where the difference is the point.
 */
export function placedLabel(spec: NumberLineSpec, entry: string): string {
  const tickList = ticks(spec)
  const { index } = placement(tickList, entry)

  return index === -1 ? '' : tickLabel(tickList[index])
}
