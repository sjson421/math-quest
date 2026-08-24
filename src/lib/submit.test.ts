import { describe, expect, it } from 'vitest'
import { checkAnswer } from './answer'
import { rational } from './rational'
import { encodeRootPairEntry } from './root-pair'
import type { CheckResult } from './answer'
import { feedbackText, responseTo } from './submit'

describe('responseTo', () => {
  it('keeps an unfinished root pair editable without recording an attempt', () => {
    const result = checkAnswer(
      { kind: 'root-pair', roots: [rational(-3, 1), rational(4, 1)] },
      encodeRootPairEntry(['-3', '5/']),
    )

    expect(responseTo[result.status]).toMatchObject({
      record: 'none',
      requeues: false,
      showsSolution: false,
      keepsEntry: true,
    })
  })

  it('covers every status checkAnswer can return', () => {
    // Named literally rather than derived from the table, so a status that
    // stops being handled fails here instead of quietly agreeing with itself.
    const statuses: CheckResult['status'][] = [
      'correct',
      'incorrect',
      'not-simplified',
      'not-mixed',
      'not-decimal',
      'not-fraction',
      'unparseable',
    ]
    expect(Object.keys(responseTo).sort()).toEqual([...statuses].sort())
  })

  it('completes the problem only on a correct answer', () => {
    expect(responseTo.correct.advances).toBe(true)
    expect(responseTo.incorrect.advances).toBe(false)
    expect(responseTo['not-simplified'].advances).toBe(false)
    expect(responseTo['not-mixed'].advances).toBe(false)
    expect(responseTo.unparseable.advances).toBe(false)
  })

  it('shows the working for a wrong answer and nothing else', () => {
    expect(responseTo.incorrect.showsSolution).toBe(true)
    expect(responseTo.correct.showsSolution).toBe(false)
    expect(responseTo['not-simplified'].showsSolution).toBe(false)
    expect(responseTo['not-mixed'].showsSolution).toBe(false)
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

  it('gives mixed form the full wrong-form policy and specific lesson copy', () => {
    expect(responseTo['not-mixed']).toEqual(responseTo['not-simplified'])
    expect(feedbackText('not-mixed')).toEqual({
      title: 'Right value — now write it as a mixed number',
      body: 'That is the correct amount. Write it as a whole number and a fraction.',
    })
  })

  it('gives decimal/fraction conversion the full wrong-form policy and specific lesson copy', () => {
    expect(responseTo['not-decimal']).toEqual(responseTo['not-simplified'])
    expect(responseTo['not-fraction']).toEqual(responseTo['not-simplified'])
    expect(feedbackText('not-decimal')).toEqual({
      title: 'Right value — now write it as a decimal',
      body: 'That is the correct amount. Write it using a decimal point.',
    })
    expect(feedbackText('not-fraction')).toEqual({
      title: 'Right value — now write it as a fraction',
      body: 'That is the correct amount. Write it as a fraction.',
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
