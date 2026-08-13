import { describe, expect, it } from 'vitest'
import { canonicalForm } from './expression'

describe('canonicalForm — expanded', () => {
  it('treats a re-ordered sum as the same answer', () => {
    expect(canonicalForm('2x + 3', 'x', 'expanded')).toBe(canonicalForm('3 + 2x', 'x', 'expanded'))
  })

  it('treats a distributed and undistributed form as the same answer', () => {
    expect(canonicalForm('2(x + 1)', 'x', 'expanded')).toBe(canonicalForm('2x + 2', 'x', 'expanded'))
  })

  it('combines like terms', () => {
    expect(canonicalForm('3x + 4x - 2', 'x', 'expanded')).toBe(canonicalForm('7x - 2', 'x', 'expanded'))
  })

  it('distributes a negative coefficient', () => {
    expect(canonicalForm('-3(x - 4)', 'x', 'expanded')).toBe(canonicalForm('-3x + 12', 'x', 'expanded'))
  })

  it('handles unary minus on a bare variable', () => {
    expect(canonicalForm('-x', 'x', 'expanded')).toBe(canonicalForm('-1x', 'x', 'expanded'))
  })

  it('handles nested parentheses', () => {
    expect(canonicalForm('2(3 + (x - 1))', 'x', 'expanded')).toBe(canonicalForm('2x + 4', 'x', 'expanded'))
  })

  it('distinguishes a genuinely different value', () => {
    expect(canonicalForm('2x + 3', 'x', 'expanded')).not.toBe(canonicalForm('2x + 4', 'x', 'expanded'))
  })
})

describe('canonicalForm — exact', () => {
  it('accepts the same structure differently ordered', () => {
    expect(canonicalForm('2x + 2', 'x', 'exact')).toBe(canonicalForm('2 + 2x', 'x', 'exact'))
  })

  it('rejects a differently-structured equivalent', () => {
    expect(canonicalForm('2(x + 1)', 'x', 'exact')).not.toBe(canonicalForm('2x + 2', 'x', 'exact'))
  })

  it('is stable for the canonical answer itself', () => {
    expect(canonicalForm('2(x + 1)', 'x', 'exact')).toBe(canonicalForm('2(x + 1)', 'x', 'exact'))
  })
})

describe('canonicalForm — malformed input', () => {
  it.each([
    ['unbalanced open paren', '2(x + 1'],
    ['unbalanced close paren', '2x + 1)'],
    ['dangling operator', '2x +'],
    ['wrong variable letter', '2y + 1'],
    ['a second variable', 'x + y'],
    ['an exponent caret', 'x^2'],
    ['implicit squaring', 'xx'],
    ['a decimal point', '2.5x'],
    ['empty input', ''],
    ['a lone sign', '-'],
  ])('%s is unparseable', (_label, raw) => {
    expect(canonicalForm(raw, 'x', 'expanded')).toBeNull()
    expect(canonicalForm(raw, 'x', 'exact')).toBeNull()
  })
})
