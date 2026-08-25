import { describe, expect, it } from 'vitest'
import { answerLabel } from './answer-label'
import { rational } from './rational'

describe('answerLabel', () => {
  it('labels exact answers in reduced learner notation', () => {
    expect(answerLabel({ kind: 'exact', n: -6, d: 8, requireSimplified: true })).toBe('−3/4')
    expect(answerLabel({ kind: 'exact', n: 5, d: 1, requireFraction: true })).toBe('5')
  })

  it('respects decimal and mixed-form requirements', () => {
    expect(answerLabel({ kind: 'exact', n: 3, d: 4, requireDecimal: true })).toBe('0.75')
    expect(answerLabel({ kind: 'exact', n: 7, d: 4, requireMixed: true })).toBe('1 3/4')
  })

  it('labels approximate answers and expressions without internal flags', () => {
    expect(answerLabel({ kind: 'approx', value: -2.5, tolerance: 0.1 })).toBe('−2.5')
    expect(answerLabel({
      kind: 'expression',
      canonical: '-2x+5',
      variable: 'x',
      form: 'exact',
    })).toBe('−2x+5')
  })

  it('resolves a choice id to its visible label', () => {
    expect(answerLabel(
      { kind: 'choice', id: 'greater' },
      [{ id: 'greater', label: 'Greater than' }],
    )).toBe('Greater than')
  })

  it('fails closed for missing or duplicate choice labels', () => {
    expect(() => answerLabel({ kind: 'choice', id: 'missing' }, [])).toThrow(
      'choice answer needs exactly one visible label',
    )
    expect(() => answerLabel(
      { kind: 'choice', id: 'same' },
      [{ id: 'same', label: 'One' }, { id: 'same', label: 'Two' }],
    )).toThrow('choice answer needs exactly one visible label')
  })

  it('keeps ordered points and typographic signs', () => {
    expect(answerLabel({ kind: 'point', x: -3, y: 2 })).toBe('(−3, 2)')
  })

  it('labels both roots while keeping their unordered input private', () => {
    expect(answerLabel({
      kind: 'root-pair',
      roots: [rational(-3, 4), rational(2, 1)],
    })).toBe('Root 1: −3/4, Root 2: 2')
  })
})
