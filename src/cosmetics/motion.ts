/**
 * How a looping animation is timed, and the trap it exists to close.
 *
 * **`repeat: Infinity` on a scalar target does not hold that value.** It replays
 * the *approach* to it — from wherever the value started — over and over, with a
 * hard snap back at each iteration. Only a keyframe array oscillates.
 *
 * Pip's ears sat on the wrong side of that for as long as they have existed: the
 * excited states pass a keyframe array and waggle correctly, but the other four
 * pass a plain `-24`, and the same infinite repeat swept them from upright to
 * −24° and snapped them back, once every 0.6 seconds, in `idle`, `thinking`,
 * `encouraging` and `sleeping`. Every ear-riding cosmetic repeated it, and so
 * did Pip's body tilt in two states.
 *
 * The rule is one line: **repeat only what is actually a loop.** A fixed pose
 * gets a plain ease and then stays put.
 */

import type { MascotState } from './types'

type Timing = {
  duration: number
  ease: 'easeInOut' | 'easeOut'
  repeat?: number
}

/**
 * The transition for one animated property, chosen by what it was handed.
 *
 * Pass the same value you pass to `animate`. An array is an oscillation and gets
 * the infinite repeat; a number is a pose and gets a short settle instead.
 *
 * Per property, not per element: one element often animates a bob that loops and
 * a tilt that does not, and a single transition covering both has to be wrong
 * about one of them.
 */
export const loopIf = (value: number | number[], duration: number): Timing =>
  Array.isArray(value)
    ? { duration, ease: 'easeInOut', repeat: Infinity }
    : { duration: 0.4, ease: 'easeOut' }

/* ------------------------------------------------------------------------- *
 * The ears
 * ------------------------------------------------------------------------- */

/**
 * How one ear is tilted, and how long its loop takes.
 *
 * **These numbers live here rather than in `Mascot.tsx` for the reason the
 * palette does.** Every cosmetic that rides an ear has to repeat the ear's
 * motion exactly or it detaches from the part it is pinned to, so the catalogue
 * needs them — and the catalogue cannot import from the component that draws it
 * without a cycle. They were duplicated between the two until a third set was
 * about to be written.
 *
 * Two loops, both keyframe arrays, both beginning and ending at rest so the seam
 * is invisible and a change of state never jumps:
 *
 * - **At rest**, ±3° either side of ∓24°, over 4.8s. Small enough to read as
 *   breathing rather than as a signal, and slower than every one of Pip's body
 *   bobs — which are 0.6s to 4.5s — so the ears and the body drift in and out of
 *   phase instead of pulsing together, which is what reads as mechanical.
 * - **Excited**, in to ∓14° and back out to ∓34°, over 0.6s. Ten degrees either
 *   side, so it passes *through* rest in both directions; a one-sided flick at
 *   this speed reads as a twitch rather than a wiggle.
 *
 * The two ears are exact mirrors and move in step. On a symmetric character that
 * reads as one gesture; independent ears would read as two separate creatures.
 */
export function earSwing(
  state: MascotState,
  side: -1 | 1,
): { rotate: number[]; duration: number } {
  const rest = 24 * side

  if (state === 'happy' || state === 'celebrating') {
    return { rotate: [rest, 14 * side, rest, 34 * side, rest], duration: 0.6 }
  }

  const drift = 3 * side
  return { rotate: [rest, rest - drift, rest, rest + drift, rest], duration: 4.8 }
}
