import { describe, expect, it } from 'vitest'
import type { CheckResult } from './answer'
import { responseTo } from './submit'

describe('responseTo', () => {
  it('covers every status checkAnswer can return', () => {
    // Named literally rather than derived from the table, so a status that
    // stops being handled fails here instead of quietly agreeing with itself.
    const statuses: CheckResult['status'][] = [
      'correct',
      'incorrect',
      'not-simplified',
      'unparseable',
    ]
    expect(Object.keys(responseTo).sort()).toEqual([...statuses].sort())
  })

  it('completes the problem only on a correct answer', () => {
    expect(responseTo.correct.advances).toBe(true)
    expect(responseTo.incorrect.advances).toBe(false)
    expect(responseTo['not-simplified'].advances).toBe(false)
    expect(responseTo.unparseable.advances).toBe(false)
  })

  it('shows the working for a wrong answer and nothing else', () => {
    expect(responseTo.incorrect.showsSolution).toBe(true)
    expect(responseTo.correct.showsSolution).toBe(false)
    expect(responseTo['not-simplified'].showsSolution).toBe(false)
    expect(responseTo.unparseable.showsSolution).toBe(false)
  })

  describe('a right value in the wrong form', () => {
    const response = responseTo['not-simplified']

    it('is a miss below the surface: recorded, re-queued, not advanced', () => {
      expect(response.record).toBe('incorrect')
      expect(response.requeues).toBe(true)
      expect(response.advances).toBe(false)
    })

    it('withholds the worked solution, which a plain wrong answer shows', () => {
      expect(response.showsSolution).toBe(false)
      expect(responseTo.incorrect.showsSolution).toBe(true)
    })
  })

  describe('an entry that is not a number yet', () => {
    const response = responseTo.unparseable

    it('costs nothing — no attempt, no re-queue', () => {
      expect(response.record).toBe('none')
      expect(response.requeues).toBe(false)
    })

    it('is the only response that leaves the entry to be finished', () => {
      expect(response.keepsEntry).toBe(true)
      expect(responseTo.correct.keepsEntry).toBe(false)
      expect(responseTo.incorrect.keepsEntry).toBe(false)
      expect(responseTo['not-simplified'].keepsEntry).toBe(false)
    })

    it('does not show the working for a problem that was never attempted', () => {
      expect(response.showsSolution).toBe(false)
    })
  })

  it('records an attempt for every answer except an unfinished one', () => {
    expect(responseTo.correct.record).toBe('correct')
    expect(responseTo.incorrect.record).toBe('incorrect')
    expect(responseTo['not-simplified'].record).toBe('incorrect')
    expect(responseTo.unparseable.record).toBe('none')
  })
})
