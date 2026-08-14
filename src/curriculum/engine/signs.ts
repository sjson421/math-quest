import { entryLabel, type KeypadRules } from '../../lib/keypad'
import type { Misconception } from '../../lib/types'

/**
 * Signed values: how one is drawn, and when the pad offers the key to type it.
 *
 * Both of these were written in Unit 6, copied verbatim into Unit 13, and
 * copied again into Unit 14 — the point at which the engine's own rule applies:
 * a helper moves here when a second skill needs it, so that a later unit
 * inherits the decision rather than re-deriving it. Neither is speculative and
 * neither is parameterised beyond what its three callers already use.
 */

/**
 * A value as the learner reads it: typographic minus, matching every other
 * display in the course and the label on the pad's own sign key.
 *
 * The answer checker parses the ASCII hyphen, and that difference is deliberate
 * and lives in `lib/keypad.ts`. What matters is that nothing interpolates a raw
 * negative number into learner-facing text — `${-3}` is `-3`, one glyph away
 * from everything around it, and the difference is small enough on screen to
 * survive review and obvious enough to look broken. Unit 14 shipped
 * `x − 15 = -10` in a first draft and it took a width measurement to notice.
 */
export const drawn = (value: number): string => entryLabel(String(value))

/**
 * What the pad must offer for this problem.
 *
 * Derived from the answer *and* the predictions, not from the answer alone. A
 * pad that withholds the sign key does not merely fail to record a negative
 * answer: it tells the learner the answer is not negative, at exactly the
 * skills whose question is what sign it has. `add-neg-pos`'s documented
 * misconception is `−8` where the answer is `2`, and a learner who makes it
 * would find they could not type it.
 *
 * Taking both means the declaration cannot drift from what the problem holds —
 * a prediction added later brings the key with it.
 */
export const padFor = (
  answer: number,
  misconceptions: readonly Misconception[],
): KeypadRules | undefined =>
  answer < 0 || misconceptions.some((m) => typeof m.value === 'number' && m.value < 0)
    ? { allowNegative: true }
    : undefined
