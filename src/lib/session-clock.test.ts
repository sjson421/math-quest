import { describe, expect, it } from 'vitest'
import { createSessionTiming, elapsedSeconds, formatElapsed } from './session-clock'

describe('session clock', () => {
  it('formats minute and hour boundaries without changing the clock shape', () => {
    expect(formatElapsed(0)).toBe('0:00')
    expect(formatElapsed(65)).toBe('1:05')
    expect(formatElapsed(3_605)).toBe('1:00:05')
  })

  it('floors fractional elapsed time from one fixed origin', () => {
    const timing = createSessionTiming(1_000)

    expect(elapsedSeconds(timing, 66_999.99)).toBe(65)
    expect(formatElapsed(elapsedSeconds(timing, 66_999.99))).toBe('1:05')
    expect(elapsedSeconds(timing, 131_000)).toBe(130)
  })

  it('clamps a current instant before the origin to zero', () => {
    const timing = createSessionTiming(1_000)

    expect(elapsedSeconds(timing, 999)).toBe(0)
    expect(formatElapsed(elapsedSeconds(timing, 999))).toBe('0:00')
  })
})
