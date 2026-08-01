import { describe, expect, it } from 'vitest'
import { createSubmissionGate } from './submission-gate'

describe('submission gate', () => {
  it('rejects a repeat until the active submission releases it', () => {
    const gate = createSubmissionGate()

    expect(gate.tryAcquire()).toBe(true)
    expect(gate.tryAcquire()).toBe(false)

    gate.release()

    expect(gate.tryAcquire()).toBe(true)
  })
})
