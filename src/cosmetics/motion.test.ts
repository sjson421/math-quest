/**
 * The loop-timing rule, which is the one thing here a test can hold.
 *
 * This exists because of a bug that survived a long time and was invisible in
 * every automated check: `repeat: Infinity` on a scalar target does not hold
 * that value, it replays the approach to it and snaps back. Pip's ears carried
 * it in four of his six states, and so did every cosmetic that rides an ear.
 *
 * Nothing in this suite can see an animation run — vitest has no browser and no
 * compositor. What it can do is pin the decision that goes into one.
 */

import { describe, expect, it } from 'vitest'
import { earSwing, loopIf } from './motion'
import type { MascotState } from './types'

describe('loopIf', () => {
  it('repeats a keyframe array for ever — that is a loop', () => {
    const timing = loopIf([0, -4, 0], 3.2)

    expect(timing.repeat).toBe(Infinity)
    expect(timing.duration).toBe(3.2)
  })

  it('never repeats a single value — that is a pose, and repeating it sweeps', () => {
    const timing = loopIf(-24, 0.6)

    expect(timing.repeat).toBeUndefined()
  })

  it('settles a pose quickly rather than over the loop’s own duration', () => {
    // A tilt held for 4.5s of a sleeping cycle should not take 4.5s to reach.
    expect(loopIf(5, 4.5).duration).toBeLessThan(1)
  })

  it('treats a one-value array as a loop, since that is what it is', () => {
    // Not a case the catalogue uses, but the branch is on shape, not on length,
    // and a reader should not have to guess which.
    expect(loopIf([7], 1).repeat).toBe(Infinity)
  })
})

/**
 * The ear, which has now been wrong three separate ways: it swept in one
 * direction and snapped back, it flicked to one side of rest only, and it did
 * not move at all when Pip was calm. None of those were visible to a test until
 * the numbers moved out of the component, so they are asserted here as shapes
 * rather than as pictures.
 */
describe('earSwing', () => {
  const STATES: MascotState[] = [
    'idle',
    'thinking',
    'happy',
    'encouraging',
    'celebrating',
    'sleeping',
  ]
  const rest = (side: -1 | 1) => 24 * side

  it('always returns a loop, never a single value', () => {
    // A pose under an infinite repeat sweeps up to itself and snaps back. That
    // was the bug; a keyframe array in every state is what closes it.
    for (const state of STATES) {
      for (const side of [-1, 1] as const) {
        expect(Array.isArray(earSwing(state, side).rotate), state).toBe(true)
        expect(loopIf(earSwing(state, side).rotate, 1).repeat, state).toBe(Infinity)
      }
    }
  })

  it('begins and ends at rest, so the seam and a change of state never jump', () => {
    for (const state of STATES) {
      for (const side of [-1, 1] as const) {
        const { rotate } = earSwing(state, side)

        expect(rotate.at(0), `${state} start`).toBe(rest(side))
        expect(rotate.at(-1), `${state} end`).toBe(rest(side))
      }
    }
  })

  it('passes through rest to both sides, in every state', () => {
    for (const state of STATES) {
      const { rotate } = earSwing(state, -1)
      const offsets = rotate.map((deg) => deg - rest(-1))

      expect(Math.max(...offsets), `${state} one way`).toBeGreaterThan(0)
      expect(Math.min(...offsets), `${state} the other`).toBeLessThan(0)
    }
  })

  it('moves a little when Pip is calm and a lot when he is not', () => {
    const swing = (state: MascotState) =>
      Math.max(...earSwing(state, -1).rotate.map((deg) => Math.abs(deg - rest(-1))))

    expect(swing('idle')).toBeGreaterThan(0)
    expect(swing('idle')).toBeLessThanOrEqual(5)
    expect(swing('happy')).toBeGreaterThan(swing('idle') * 2)
  })

  it('drifts slower at rest than any of Pip’s body bobs, which top out at 4.5s', () => {
    // Matching a bob would pulse the ears and the body together, which reads as
    // one mechanism rather than one animal.
    expect(earSwing('idle', -1).duration).toBeGreaterThan(4.5)
    expect(earSwing('idle', -1).duration).toBe(4.8)
    expect(earSwing('happy', -1).duration).toBeLessThan(1)
  })

  it('mirrors the two ears exactly, so a layer pinned to one cannot drift', () => {
    for (const state of STATES) {
      const left = earSwing(state, -1)
      const right = earSwing(state, 1)

      expect(right.rotate, state).toEqual(left.rotate.map((deg) => -deg))
      expect(right.duration, state).toBe(left.duration)
    }
  })
})
