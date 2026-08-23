import { describe, expect, it } from 'vitest'
import { canonicalForm } from './expression'

describe('canonicalForm — expanded', () => {
  it('treats a re-ordered sum as the same answer', () => {
    expect(canonicalForm('2x + 3', 'x', 'expanded')).toBe('2x+3')
    expect(canonicalForm('3 + 2x', 'x', 'expanded')).toBe('2x+3')
  })

  it('treats a distributed and undistributed form as the same answer', () => {
    expect(canonicalForm('2(x + 1)', 'x', 'expanded')).toBe('2x+2')
    expect(canonicalForm('2x + 2', 'x', 'expanded')).toBe('2x+2')
  })

  it('combines like terms', () => {
    expect(canonicalForm('3x + 4x - 2', 'x', 'expanded')).toBe('7x-2')
  })

  it('distributes a negative coefficient', () => {
    expect(canonicalForm('-3(x - 4)', 'x', 'expanded')).toBe('-3x+12')
  })

  it('handles unary minus on a bare variable', () => {
    expect(canonicalForm('-x', 'x', 'expanded')).toBe('-x')
    expect(canonicalForm('-1x', 'x', 'expanded')).toBe('-x')
  })

  it('handles nested parentheses', () => {
    expect(canonicalForm('2(3 + (x - 1))', 'x', 'expanded')).toBe('2x+4')
  })

  it('distinguishes a genuinely different value', () => {
    expect(canonicalForm('2x + 3', 'x', 'expanded')).not.toBe(canonicalForm('2x + 4', 'x', 'expanded'))
  })
})

describe('canonicalForm — degree two expanded', () => {
  it('serializes a factored quadratic to a concrete descending-degree form', () => {
    expect(canonicalForm('(x + 2)(x + 3)', 'x', 'expanded', 2)).toBe('x²+5x+6')
  })

  it.each([
    ['quadratic, linear, and constant terms', '2x² - x + 4', '2x²-x+4'],
    ['a leading negative coefficient', '-x² + 2x - 3', '-x²+2x-3'],
    ['zero coefficients', 'x² - x² + 3', '3'],
    ['a zero polynomial', 'x² - x² + x - x', '0'],
  ])('%s serialize with fixed coefficient and sign rules', (_label, raw, expected) => {
    expect(canonicalForm(raw, 'x', 'expanded', 2)).toBe(expected)
  })

  it('distributes and combines quadratic like terms', () => {
    expect(canonicalForm('2x(x + 3) - x² + 4', 'x', 'expanded', 2)).toBe('x²+6x+4')
  })

  it('accepts equivalent expanded and factored forms', () => {
    expect(canonicalForm('(x + 2)(x + 3)', 'x', 'expanded', 2)).toBe(
      canonicalForm('6 + 5x + x²', 'x', 'expanded', 2),
    )
  })

  it('keeps degree one as the default', () => {
    for (const raw of ['x²', 'x(x + 1)', '(x + 1)(x + 2)']) {
      expect(canonicalForm(raw, 'x', 'expanded'), raw).toBeNull()
    }
    expect(canonicalForm('2(x + 1)', 'x', 'expanded')).toBe('2x+2')
  })

  it('rejects repeated-variable notation and higher-degree intermediates', () => {
    for (const raw of ['xx', '2xx + 1', 'x²x', 'x²x - x²x']) {
      expect(canonicalForm(raw, 'x', 'expanded', 2), raw).toBeNull()
    }
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

describe('canonicalForm — degree two exact', () => {
  it('normalizes reversed binomial factors to one concrete structure', () => {
    const expected = '(2+x)*(3+x)'
    expect(canonicalForm('(x + 2)(x + 3)', 'x', 'exact', 2)).toBe(expected)
    expect(canonicalForm('(3 + x)(2 + x)', 'x', 'exact', 2)).toBe(expected)
  })

  it('preserves nested grouping', () => {
    expect(canonicalForm('2(x(x + 1) + 3)', 'x', 'exact', 2)).toBe('(((1+x)*x)+3)*2')
    expect(canonicalForm('2(x(x + 1) + 3)', 'x', 'exact', 2)).not.toBe(
      canonicalForm('2x(x + 1) + 6', 'x', 'exact', 2),
    )
  })

  it('gives the square node its own stable structure', () => {
    expect(canonicalForm('x² + 1', 'x', 'exact', 2)).toBe('1+x²')
  })

  it('keeps a factorization distinct from its expansion', () => {
    expect(canonicalForm('(x + 2)(x + 3)', 'x', 'exact', 2)).not.toBe(
      canonicalForm('x² + 5x + 6', 'x', 'exact', 2),
    )
  })

  it('fails closed on malformed and out-of-bound work', () => {
    for (const raw of ['x^2', 'xx', '(x + 1', 'x²x', 'x²x - x²x']) {
      expect(canonicalForm(raw, 'x', 'exact', 2), raw).toBeNull()
    }
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
