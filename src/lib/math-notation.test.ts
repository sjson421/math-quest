import { describe, expect, it } from 'vitest'
import { entrySpokenLabel, fractionEntryNotation } from './math-notation'

describe('fractionEntryNotation', () => {
  it('builds a stacked fraction and derived name without changing the source string', () => {
    const entry = '3/4'

    expect(fractionEntryNotation(entry)).toEqual({
      notation: {
        kind: 'fraction',
        numerator: { kind: 'text', value: '3' },
        denominator: { kind: 'text', value: '4' },
      },
      label: '3 over 4',
    })
    expect(entry).toBe('3/4')
  })

  it('keeps an unfinished denominator as a named blank', () => {
    expect(fractionEntryNotation('3/')).toEqual({
      notation: {
        kind: 'fraction',
        numerator: { kind: 'text', value: '3' },
        denominator: { kind: 'text', value: '' },
      },
      label: '3 over blank',
    })
  })

  it('speaks a typographic sign without changing the visible numerator', () => {
    expect(fractionEntryNotation('−3/4')?.label).toBe('negative 3 over 4')
    expect(fractionEntryNotation('−3/4')?.notation.numerator).toEqual({
      kind: 'text',
      value: '−3',
    })
  })

  it('leaves ordinary and malformed entries on the text path', () => {
    expect(fractionEntryNotation('427')).toBeUndefined()
    expect(fractionEntryNotation('1/2/3')).toBeUndefined()
    expect(entrySpokenLabel('')).toBe('blank')
    expect(entrySpokenLabel('427')).toBe('427')
  })
})
