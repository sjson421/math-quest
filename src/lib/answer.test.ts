import { describe, expect, it } from 'vitest'
import { checkAnswer, parseInput } from './answer'
import type { Answer } from './types'

const exact = (n: number, d = 1, requireSimplified = false): Answer => ({
  kind: 'exact',
  n,
  d,
  requireSimplified,
})

/** Exact answer with the mixed-form requirement, for the 8a tests. */
const mixed = (n: number, d: number): Answer => ({
  kind: 'exact',
  n,
  d,
  requireMixed: true,
})

describe('parseInput', () => {
  it('parses integers and negatives', () => {
    expect(parseInput('12')).toMatchObject({ value: { n: 12, d: 1 } })
    expect(parseInput('-3')).toMatchObject({ value: { n: -3, d: 1 } })
  })

  it('parses decimals exactly, without float drift', () => {
    expect(parseInput('0.75')).toMatchObject({ value: { n: 3, d: 4 } })
    expect(parseInput('.5')).toMatchObject({ value: { n: 1, d: 2 } })
    expect(parseInput('2.10')).toMatchObject({ value: { n: 21, d: 10 } })
  })

  it('parses fractions and mixed numbers', () => {
    expect(parseInput('3/4')).toMatchObject({ value: { n: 3, d: 4 } })
    expect(parseInput('-3/4')).toMatchObject({ value: { n: -3, d: 4 } })
    expect(parseInput('1 1/2')).toMatchObject({ value: { n: 3, d: 2 } })
  })

  it('reports a mixed entry as mixed, with its written whole part', () => {
    expect(parseInput('1 1/2')).toMatchObject({
      wasFraction: true,
      wasMixed: true,
      mixedWhole: 1,
      rawNum: 3,
      rawDen: 2,
    })
    expect(parseInput('3/2')).toMatchObject({ wasFraction: true })
    const simple = parseInput('3/2')
    if (simple.kind !== 'rational') throw new Error('expected a rational parse')
    expect(simple.wasMixed).toBeUndefined()
    expect(parseInput('1.5')).toMatchObject({ wasFraction: false })
    const decimal = parseInput('1.5')
    if (decimal.kind !== 'rational') throw new Error('expected a rational parse')
    expect(decimal.wasMixed).toBeUndefined()
  })

  it('rejects junk and division by zero', () => {
    for (const bad of ['', '-', 'abc', '1/0', '1//2', '.', '1.2.3']) {
      expect(parseInput(bad).kind, bad).toBe('invalid')
    }
  })
})

describe('checkAnswer', () => {
  it('accepts the stable id of the expected choice', () => {
    const answer: Answer = { kind: 'choice', id: 'less-than' }

    expect(checkAnswer(answer, 'less-than').status).toBe('correct')
  })

  it('rejects a different choice id', () => {
    const answer: Answer = { kind: 'choice', id: 'less-than' }

    expect(checkAnswer(answer, 'greater-than').status).toBe('incorrect')
  })

  it('treats equivalent forms of the same number as equal', () => {
    for (const form of ['1/2', '2/4', '0.5', '.5', '4/8', '50/100']) {
      expect(checkAnswer(exact(1, 2), form).status, form).toBe('correct')
    }
  })

  it('accepts integers written as decimals or fractions', () => {
    for (const form of ['4', '4.0', '8/2', '12/3']) {
      expect(checkAnswer(exact(4), form).status, form).toBe('correct')
    }
  })

  it('tolerates surrounding whitespace', () => {
    expect(checkAnswer(exact(7), '  7 ').status).toBe('correct')
  })

  it('rejects wrong values', () => {
    expect(checkAnswer(exact(4), '5').status).toBe('incorrect')
    expect(checkAnswer(exact(1, 2), '1/3').status).toBe('incorrect')
  })

  it('distinguishes unsimplified from incorrect when the skill demands it', () => {
    expect(checkAnswer(exact(1, 2, true), '2/4').status).toBe('not-simplified')
    expect(checkAnswer(exact(1, 2, true), '1/2').status).toBe('correct')
    // A decimal is not an unsimplified fraction — it is simply right.
    expect(checkAnswer(exact(1, 2, true), '0.5').status).toBe('correct')
  })

  describe('a mixed-form requirement', () => {
    it('completes only on a genuine mixed decomposition', () => {
      expect(checkAnswer(mixed(7, 4), '1 3/4').status).toBe('correct')
      expect(checkAnswer(mixed(7, 4), '7/4').status).toBe('not-mixed')
      expect(checkAnswer(mixed(7, 4), '1.75').status).toBe('not-mixed')
      // "0 7/4" evaluates to 7/4 but is not a mixed number: no whole part.
      expect(checkAnswer(mixed(7, 4), '0 7/4').status).toBe('not-mixed')
      // "1 8/8" equals 2 but has an improper fraction part, so it is not mixed.
      expect(checkAnswer(mixed(16, 8), '1 8/8').status).toBe('not-mixed')
    })

    it('checks mixed form before lowest terms, so an unreduced mixed entry is not-mixed-free', () => {
      // 1 6/8 is genuinely mixed and has the right value; the remaining issue
      // is reduction, answered by the existing form response.
      const both = {
        kind: 'exact' as const,
        n: 7,
        d: 4,
        requireMixed: true,
        requireSimplified: true,
      }
      expect(checkAnswer(both, '1 6/8').status).toBe('not-simplified')
      expect(checkAnswer(both, '1 3/4').status).toBe('correct')
      expect(checkAnswer(both, '7/4').status).toBe('not-mixed')
    })

    it('leaves a wrong value a plain incorrect, whichever way it is written', () => {
      expect(checkAnswer(mixed(7, 4), '3/4').status).toBe('incorrect')
      expect(checkAnswer(mixed(7, 4), '1 1/4').status).toBe('incorrect')
    })

    it('does not constrain an answer that does not declare the requirement', () => {
      expect(checkAnswer(exact(3, 2), '3/2').status).toBe('correct')
    })
  })

  describe('a required-notation requirement', () => {
    const requireDecimal: Answer = { kind: 'exact', n: 3, d: 4, requireDecimal: true }
    const requireFraction: Answer = { kind: 'exact', n: 3, d: 4, requireFraction: true }

    it('rejects a fraction entry when decimal form is required', () => {
      expect(checkAnswer(requireDecimal, '3/4').status).toBe('not-decimal')
      expect(checkAnswer(requireDecimal, '0.75').status).toBe('correct')
    })

    it('rejects a decimal entry when fraction form is required', () => {
      expect(checkAnswer(requireFraction, '0.75').status).toBe('not-fraction')
      expect(checkAnswer(requireFraction, '3/4').status).toBe('correct')
    })

    it('leaves a wrong value a plain incorrect, whichever way it is written', () => {
      expect(checkAnswer(requireDecimal, '1/2').status).toBe('incorrect')
      expect(checkAnswer(requireFraction, '0.5').status).toBe('incorrect')
    })

    it('does not constrain an answer that does not declare the requirement', () => {
      expect(checkAnswer(exact(3, 4), '3/4').status).toBe('correct')
      expect(checkAnswer(exact(3, 4), '0.75').status).toBe('correct')
    })

    it('is independent of requireSimplified and requireMixed', () => {
      const decimalAndSimplified: Answer = {
        kind: 'exact',
        n: 1,
        d: 2,
        requireDecimal: true,
        requireSimplified: true,
      }
      // An unsimplified fraction entry fails the decimal check first.
      expect(checkAnswer(decimalAndSimplified, '2/4').status).toBe('not-decimal')
      expect(checkAnswer(decimalAndSimplified, '0.5').status).toBe('correct')
    })
  })

  it('honours tolerance for approximate answers', () => {
    const approx: Answer = { kind: 'approx', value: 1.414, tolerance: 0.01 }
    expect(checkAnswer(approx, '1.41').status).toBe('correct')
    expect(checkAnswer(approx, '1.5').status).toBe('incorrect')
  })

  it('reports unparseable input separately from a wrong answer', () => {
    expect(checkAnswer(exact(4), 'banana').status).toBe('unparseable')
  })

  describe('an expression answer', () => {
    const expanded: Answer = { kind: 'expression', canonical: '2x + 2', variable: 'x', form: 'expanded' }
    const exactForm: Answer = { kind: 'expression', canonical: '2(x + 1)', variable: 'x', form: 'exact' }

    it('accepts an undistributed equivalent under expanded form', () => {
      expect(checkAnswer(expanded, '2(x + 1)').status).toBe('correct')
      expect(checkAnswer(expanded, '2 + 2x').status).toBe('correct')
    })

    it('rejects a differently-structured equivalent under exact form', () => {
      expect(checkAnswer(exactForm, '2x + 2').status).toBe('incorrect')
      expect(checkAnswer(exactForm, '2(x + 1)').status).toBe('correct')
      expect(checkAnswer(exactForm, '(x + 1)2').status).toBe('correct')
    })

    it('rejects a wrong value under either form', () => {
      expect(checkAnswer(expanded, '2x + 3').status).toBe('incorrect')
      expect(checkAnswer(exactForm, '3(x + 1)').status).toBe('incorrect')
    })

    it('reports an unparseable entry distinctly from a wrong answer', () => {
      expect(checkAnswer(expanded, '2x +').status).toBe('unparseable')
      expect(checkAnswer(expanded, 'x^2').status).toBe('unparseable')
      expect(checkAnswer(expanded, '2y + 2').status).toBe('unparseable')
    })
  })
})
