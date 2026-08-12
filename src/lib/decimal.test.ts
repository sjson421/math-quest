import { describe, expect, it } from 'vitest'
import { decimalColumnText, decimalText } from './decimal'

describe('decimalText', () => {
  it('retains written precision and pads one-place values for alignment', () => {
    expect(decimalText({ coefficient: 120, scale: 2 })).toBe('1.20')
    expect(decimalText({ coefficient: 12, scale: 1 }, 2)).toBe('1.20')
  })

  it('pads without multiplying a safe coefficient past the exact integer range', () => {
    expect(decimalText({ coefficient: Number.MAX_SAFE_INTEGER, scale: 1 }, 2)).toBe(
      '900719925474099.10',
    )
  })

  it('aligns both column operands at the larger declared scale', () => {
    expect(
      decimalColumnText({
        operation: 'add',
        left: { coefficient: 12, scale: 1 },
        right: { coefficient: 35, scale: 2 },
      }),
    ).toEqual(['1.20', '0.35'])
  })
})
