import { describe, expect, it } from 'vitest'
import { applyExpressionKey, applyKey, entryLabel } from './keypad'
import { tickEntry, tickLabel } from './number-line'
import { rational } from './rational'

const type = (keys: string, rules = {}) => [...keys].reduce((acc, k) => applyKey(acc, k, rules), '')

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

  describe('the mixed-number space', () => {
    const rules = { allowMixed: true }

    it('builds a whole part, a space, and a fraction', () => {
      expect(type('1 1/2', rules)).toBe('1 1/2')
    })

    it('refuses a space outside mixed grammar', () => {
      expect(applyKey('', ' ', rules)).toBe('')
      expect(applyKey('-1', ' ', rules)).toBe('-1')
      expect(applyKey('1/2', ' ', rules)).toBe('1/2')
      expect(applyKey('1 2', ' ', rules)).toBe('1 2')
    })

    it('is refused entirely when the problem does not declare it', () => {
      expect(applyKey('3', ' ')).toBe('3')
    })

    it('implies the fraction slash, like the pad display', () => {
      expect(type('1 1/2', rules)).toBe('1 1/2')
      expect(applyKey('1 ', '/', rules)).toBe('1 ')
      expect(applyKey('1 1', '/', rules)).toBe('1 1/')
    })

    it('excludes only the new space from the existing maxLength behavior', () => {
      const tight = { allowMixed: true, maxLength: 4 }
      // Three digits and the slash fit; the new separator costs no character.
      expect(type('1 1/2', tight)).toBe('1 1/2')
      // A fifth pre-existing character is still refused where the limit ends.
      expect(type('12 3/4', tight)).toBe('12 3/')
    })
  })

  it('keeps fraction and decimal punctuation inside the existing maxLength cap', () => {
    expect(type('12/34', { allowFraction: true, maxLength: 4 })).toBe('12/3')
    expect(type('12.34', { allowDecimal: true, maxLength: 4 })).toBe('12.3')
  })

  it('caps length without counting the sign', () => {
    const rules = { maxLength: 3, allowNegative: true }
    expect(type('12345', rules)).toBe('123')
    expect(applyKey('-123', '4', rules)).toBe('-123')
  })
})

describe('entryLabel', () => {
  // Covered here rather than through the lesson for the reason `placedLabel` is:
  // a static render attaches no handlers and starts with an empty entry, so a
  // typed sign is unreachable from the component and reachable from the rule.
  it('reads a typed sign the way the problem above it is drawn', () => {
    const rules = { allowNegative: true }

    expect(entryLabel(type('8', rules))).toBe('8')
    expect(entryLabel(applyKey(type('8', rules), '-', rules))).toBe('−8')
  })

  it('leaves an unsigned entry exactly as it was typed', () => {
    expect(entryLabel('')).toBe('')
    expect(entryLabel('427')).toBe('427')
    expect(entryLabel('3/4')).toBe('3/4')
    expect(entryLabel('1.5')).toBe('1.5')
  })

  it('reads every sign in an expression entry, not just the leading one', () => {
    // A numeric entry carries one sign at most, so the first-occurrence version
    // of this rule looked right until `distribute-negative`, whose answers are
    // routinely `-4x-20`: converting the lead alone drew the same minus two
    // ways in one entry.
    const typed = [...'-4x-20'].reduce((entry, key) => applyExpressionKey(entry, key, 'x'), '')

    expect(typed).toBe('-4x-20')
    expect(entryLabel(typed)).toBe('−4x−20')
  })

  it('shows a sign with nothing after it, which is unfinished rather than wrong', () => {
    // `applyKey` reaches this state on the first tap of the sign key, and
    // `answer.ts` reads it as unparseable — so it must still be visible while
    // the learner finishes the number.
    expect(entryLabel(applyKey('', '-', { allowNegative: true }))).toBe('−')
  })

  it('agrees with the number line about the same value', () => {
    // The point of one owner: a tick and a typed answer are the same value on
    // the same screen, and a second copy of the swap is how they stop matching.
    const tick = rational(-3, 1)

    expect(tickEntry(tick)).toBe('-3')
    expect(tickLabel(tick)).toBe(entryLabel('-3'))
    expect(tickLabel(tick)).toBe('−3')
  })
})

describe('applyExpressionKey', () => {
  const type = (keys: string[]) => keys.reduce((acc, k) => applyExpressionKey(acc, k, 'x'), '')

  it('composes digits, the variable, and parens by juxtaposition', () => {
    expect(type(['2', '(', 'x', '+', '1', ')'])).toBe('2(x+1)')
  })

  it('allows a leading unary minus and one right after an open paren', () => {
    expect(type(['-', 'x'])).toBe('-x')
    expect(type(['2', '(', '-', 'x', '+', '1', ')'])).toBe('2(-x+1)')
  })

  it('refuses a second dash in a row', () => {
    expect(applyExpressionKey('2-', '-', 'x')).toBe('2-')
  })

  it('refuses a leading or doubled plus', () => {
    expect(applyExpressionKey('', '+', 'x')).toBe('')
    expect(applyExpressionKey('2+', '+', 'x')).toBe('2+')
    expect(applyExpressionKey('(', '+', 'x')).toBe('(')
  })

  it('refuses an unmatched close paren', () => {
    expect(applyExpressionKey('2', ')', 'x')).toBe('2')
    expect(applyExpressionKey('2(x+1)', ')', 'x')).toBe('2(x+1)')
    expect(applyExpressionKey('2(x+1', ')', 'x')).toBe('2(x+1)')
  })

  it('refuses a close paren with nothing since the open one', () => {
    expect(applyExpressionKey('2(', ')', 'x')).toBe('2(')
  })

  it('ignores a key outside the expression grammar', () => {
    expect(applyExpressionKey('2', 'y', 'x')).toBe('2')
    expect(applyExpressionKey('2', '.', 'x')).toBe('2')
    expect(applyExpressionKey('2', '/', 'x')).toBe('2')
  })

  it('backspaces and clears', () => {
    expect(applyExpressionKey('2(x', 'back', 'x')).toBe('2(')
    expect(applyExpressionKey('2(x', 'clear', 'x')).toBe('')
  })

  it('is pure, so rapid taps cannot drop a key', () => {
    const first = applyExpressionKey('', '2', 'x')
    const second = applyExpressionKey(first, 'x', 'x')
    expect(second).toBe('2x')
  })
})
