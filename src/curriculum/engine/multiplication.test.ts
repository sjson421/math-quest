import { describe, expect, it } from 'vitest'
import {
  carriedBeforeMultiplying,
  firstPartialOnly,
  forgotMultiplicationCarry,
  missingPlaceholder,
  multiplicationPlace,
  multiplicationTrace,
  partialProductRow,
  partialProductTrace,
} from './multiplication'

describe('multiplicationTrace', () => {
  it('keeps the raw product separate from the incoming carry', () => {
    const trace = multiplicationTrace(34, 6)
    const ones = multiplicationPlace(trace, 0)
    const tens = multiplicationPlace(trace, 1)

    expect(ones).toMatchObject({ digit: 4, raw: 24, incoming: 0, total: 24, written: 4, carry: 2 })
    expect(tens).toMatchObject({ digit: 3, raw: 18, incoming: 2, total: 20, written: 0, carry: 2 })
    expect(trace.result).toBe(204)
  })

  it('carries the full count of tens rather than a flag', () => {
    const trace = multiplicationTrace(89, 9)

    expect(multiplicationPlace(trace, 0).carry).toBe(8)
    expect(multiplicationPlace(trace, 1)).toMatchObject({ raw: 72, incoming: 8, total: 80, carry: 8 })
  })

  it('reconstructs the result from written digits and the leading carry', () => {
    for (let multiplicand = 10; multiplicand <= 99; multiplicand += 1) {
      for (let multiplier = 0; multiplier <= 9; multiplier += 1) {
        const trace = multiplicationTrace(multiplicand, multiplier)
        const fromDigits = trace.places.reduce(
          (sum, place) => sum + place.written * 10 ** place.place,
          0,
        )
        const leading = trace.places.at(-1)?.carry ?? 0

        expect(fromDigits + leading * 10 ** trace.places.length).toBe(
          multiplicand * multiplier,
        )
      }
    }
  })

  it('names the multiplication when a place is missing', () => {
    expect(() => multiplicationPlace(multiplicationTrace(7, 4), 1)).toThrow(
      '7 × 4 has 1 columns, no place 1',
    )
  })

  it('rejects an invalid one-digit row multiplier', () => {
    expect(() => multiplicationTrace(34, 12)).toThrow('multiplier must be one digit')
    expect(() => multiplicationTrace(-34, 6)).toThrow('multiplicand must be a non-negative')
  })
})

describe('partialProductTrace', () => {
  it('aligns the tens row one place to the left', () => {
    const trace = partialProductTrace(34, 26)

    expect(partialProductRow(trace, 0)).toMatchObject({
      place: 0,
      digit: 6,
      unshifted: 204,
      value: 204,
    })
    expect(partialProductRow(trace, 1)).toMatchObject({
      place: 1,
      digit: 2,
      unshifted: 68,
      value: 680,
    })
    expect(trace.result).toBe(884)
  })

  it('keeps a zero multiplier digit as a real zero row', () => {
    const trace = partialProductTrace(34, 20)

    expect(partialProductRow(trace, 0)).toMatchObject({ digit: 0, unshifted: 0, value: 0 })
    expect(partialProductRow(trace, 1)).toMatchObject({ digit: 2, unshifted: 68, value: 680 })
    expect(trace.result).toBe(680)
  })

  it('recombines aligned rows into the direct product', () => {
    for (let a = 10; a <= 99; a += 7) {
      for (let b = 10; b <= 99; b += 9) {
        const trace = partialProductTrace(a, b)
        expect(trace.rows.reduce((sum, row) => sum + row.value, 0)).toBe(a * b)
        expect(trace.result).toBe(a * b)
      }
    }
  })

  it('names the multiplication when a row is missing', () => {
    expect(() => partialProductRow(partialProductTrace(34, 6), 1)).toThrow(
      '34 × 6 has 1 rows, no row 1',
    )
  })
})

describe('multiplication misconceptions', () => {
  it('models dropping and misapplying the ones carry on opposite sides', () => {
    const trace = multiplicationTrace(34, 6)
    const forgot = forgotMultiplicationCarry(trace, 0, 'forgot')
    const early = carriedBeforeMultiplying(trace, 0, 'early')

    expect(forgot).toMatchObject({ value: 184, tag: 'forgot-multiplication-carry' })
    expect(early).toMatchObject({ value: 304, tag: 'carried-before-multiplying' })
    expect(new Set([trace.result, forgot.value, early.value]).size).toBe(3)
  })

  it('models a missing placeholder separately from an omitted row', () => {
    const trace = partialProductTrace(34, 26)
    const unshifted = missingPlaceholder(trace, 1, 'placeholder')
    const firstOnly = firstPartialOnly(trace, 'first')

    expect(unshifted).toMatchObject({ value: 272, tag: 'missing-placeholder' })
    expect(firstOnly).toMatchObject({ value: 204, tag: 'first-partial-only' })
    expect(new Set([trace.result, unshifted.value, firstOnly.value]).size).toBe(3)
  })

  it('refuses a carry diagnosis on a row that did not carry', () => {
    const trace = multiplicationTrace(22, 3)
    expect(() => forgotMultiplicationCarry(trace, 0, 'n')).toThrow(
      '22 × 3 has no carry out of place 0',
    )
    expect(() => carriedBeforeMultiplying(trace, 0, 'n')).toThrow(
      '22 × 3 cannot misapply a carry from place 0',
    )
  })

  it('refuses placeholder diagnoses where no shifted row exists', () => {
    const trace = partialProductTrace(34, 26)
    expect(() => missingPlaceholder(trace, 0, 'n')).toThrow(
      '34 × 26 has no shifted non-zero row at place 0',
    )
    expect(() => firstPartialOnly(partialProductTrace(34, 6), 'n')).toThrow(
      '34 × 6 has no higher partial product',
    )
  })
})
