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

  it('accepts a re-ordered sum inside the bracket, and the bracket on either side', () => {
    expect(canonicalForm('3(x + 4)', 'x', 'exact')).toBe(canonicalForm('3(4 + x)', 'x', 'exact'))
    expect(canonicalForm('3(x + 4)', 'x', 'exact')).toBe(canonicalForm('(x + 4)3', 'x', 'exact'))
    expect(canonicalForm('3(2x + 3)', 'x', 'exact')).toBe(canonicalForm('3(3 + 2x)', 'x', 'exact'))
  })

  it('distinguishes a regrouping that names the same numbers in the same order', () => {
    // Both sides read `3`, `4` and `x`, and both are products of a number with
    // something — only the grouping differs. Serializing children without
    // parentheses made these one answer, which is the whole distinction
    // `factor-gcf` rests on.
    expect(canonicalForm('3(x + 4)', 'x', 'exact')).not.toBe(canonicalForm('3(4) + x', 'x', 'exact'))
    expect(canonicalForm('3(2x + 3)', 'x', 'exact')).not.toBe(canonicalForm('2x + 3(3)', 'x', 'exact'))
  })

  it('distinguishes a written coefficient of one from an unwritten one', () => {
    // Structural comparison cannot see that `1x` and `x` are the same term, so
    // an answer authored with the explicit one would grade the natural entry
    // wrong. Unit 13 writes every coefficient through its `term()` helper for
    // this reason; the behaviour is pinned here so the reason survives.
    expect(canonicalForm('3(1x + 4)', 'x', 'exact')).not.toBe(canonicalForm('3(x + 4)', 'x', 'exact'))
  })

  it('still separates a factored form from its expanded value', () => {
    expect(canonicalForm('3(2x + 3)', 'x', 'exact')).not.toBe(canonicalForm('6x + 9', 'x', 'exact'))
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
