import { describe, expect, it } from 'vitest'
import { checkAnswer, parseInput } from './answer'
import type { Answer } from './types'

const exact = (n: number, d = 1, requireSimplified = false): Answer => ({
  kind: 'exact',
  n,
  d,
  requireSimplified,
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

  it('rejects junk and division by zero', () => {
    for (const bad of ['', '-', 'abc', '1/0', '1//2', '.', '1.2.3']) {
      expect(parseInput(bad).kind, bad).toBe('invalid')
    }
  })
})

describe('checkAnswer', () => {
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

  it('honours tolerance for approximate answers', () => {
    const approx: Answer = { kind: 'approx', value: 1.414, tolerance: 0.01 }
    expect(checkAnswer(approx, '1.41').status).toBe('correct')
    expect(checkAnswer(approx, '1.5').status).toBe('incorrect')
  })

  it('reports unparseable input separately from a wrong answer', () => {
    expect(checkAnswer(exact(4), 'banana').status).toBe('unparseable')
  })
})
