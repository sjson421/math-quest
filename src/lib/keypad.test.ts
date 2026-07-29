import { describe, expect, it } from 'vitest'
import { applyKey } from './keypad'

const type = (keys: string, rules = {}) =>
  [...keys].reduce((acc, k) => applyKey(acc, k, rules), '')

describe('applyKey', () => {
  it('appends digits in order', () => {
    expect(type('427')).toBe('427')
  })

  it('is pure, so rapid taps cannot drop a digit', () => {
    // Two presses derived from the same starting value, applied in sequence —
    // this is what a functional state update does under fast tapping.
    const first = applyKey('', '1')
    const second = applyKey(first, '2')
    expect(second).toBe('12')
  })

  it('backspaces and clears', () => {
    expect(applyKey('123', 'back')).toBe('12')
    expect(applyKey('', 'back')).toBe('')
    expect(applyKey('123', 'clear')).toBe('')
  })

  it('treats minus as a sign toggle, not a character', () => {
    const rules = { allowNegative: true }
    expect(applyKey('5', '-', rules)).toBe('-5')
    expect(applyKey('-5', '-', rules)).toBe('5')
    expect(applyKey('-5', '-', rules)).not.toContain('--')
  })

  it('ignores keys the current unit has not unlocked', () => {
    expect(applyKey('5', '-')).toBe('5')
    expect(applyKey('5', '.')).toBe('5')
    expect(applyKey('5', '/')).toBe('5')
  })

  it('allows only one decimal point per number part', () => {
    const rules = { allowDecimal: true }
    expect(type('1.5', rules)).toBe('1.5')
    expect(applyKey('1.5', '.', rules)).toBe('1.5')
  })

  it('allows one slash, and never as the first character', () => {
    const rules = { allowFraction: true }
    expect(applyKey('', '/', rules)).toBe('')
    expect(applyKey('3', '/', rules)).toBe('3/')
    expect(applyKey('3/4', '/', rules)).toBe('3/4')
  })

  it('caps length without counting the sign', () => {
    const rules = { maxLength: 3, allowNegative: true }
    expect(type('12345', rules)).toBe('123')
    expect(applyKey('-123', '4', rules)).toBe('-123')
  })
})
