import type { Misconception } from '../../lib/types'
import { digitAt, digitWidth, requirePlace } from './column'

/** One visible multiplicand digit multiplied from right to left. */
export type MultiplicationPlace = {
  /** 0 = ones, 1 = tens, 2 = hundreds. */
  place: number
  /** The multiplicand digit in this place. */
  digit: number
  /** The one-digit value multiplying every place. */
  multiplier: number
  /** Carry arriving from the place below. */
  incoming: number
  /** This digit times the multiplier, before the incoming carry. */
  raw: number
  /** The raw product plus the incoming carry. */
  total: number
  /** The digit written in this place. */
  written: number
  /** The full count of tens carried into the next place. */
  carry: number
}

export type MultiplicationTrace = {
  multiplicand: number
  multiplier: number
  /** Ones first, matching the order the work is done. */
  places: MultiplicationPlace[]
  result: number
}

function requireWhole(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer, got ${value}`)
  }
}

/** Trace a whole number multiplied by one digit. */
export function multiplicationTrace(
  multiplicand: number,
  multiplier: number,
): MultiplicationTrace {
  requireWhole('multiplicand', multiplicand)
  requireWhole('multiplier', multiplier)
  if (multiplier > 9) {
    throw new Error(`multiplier must be one digit, got ${multiplier}`)
  }

  const places: MultiplicationPlace[] = []
  let incoming = 0

  for (let place = 0; place < digitWidth(multiplicand); place += 1) {
    const digit = digitAt(multiplicand, place)
    const raw = digit * multiplier
    const total = raw + incoming
    const carry = Math.floor(total / 10)
    places.push({
      place,
      digit,
      multiplier,
      incoming,
      raw,
      total,
      written: total % 10,
      carry,
    })
    incoming = carry
  }

  return { multiplicand, multiplier, places, result: multiplicand * multiplier }
}

/** The place-`n` multiplication column, with a problem-specific failure. */
export function multiplicationPlace(
  trace: MultiplicationTrace,
  n: number,
): MultiplicationPlace {
  return requirePlace(
    trace.places,
    n,
    () => `${trace.multiplicand} × ${trace.multiplier}`,
  )
}

export type PartialProductRow = {
  /** Multiplier digit place: 0 = ones row, 1 = tens row. */
  place: number
  digit: number
  trace: MultiplicationTrace
  /** The digit product before shifting into its multiplier place. */
  unshifted: number
  /** The partial product aligned to its multiplier place. */
  value: number
}

export type PartialProductTrace = {
  multiplicand: number
  multiplier: number
  /** Multiplier rows from ones upward. */
  rows: PartialProductRow[]
  result: number
}

/** Trace one multiplication row per digit of the multiplier. */
export function partialProductTrace(
  multiplicand: number,
  multiplier: number,
): PartialProductTrace {
  requireWhole('multiplicand', multiplicand)
  requireWhole('multiplier', multiplier)

  const rows = Array.from({ length: digitWidth(multiplier) }, (_, place) => {
    const digit = digitAt(multiplier, place)
    const trace = multiplicationTrace(multiplicand, digit)
    return {
      place,
      digit,
      trace,
      unshifted: trace.result,
      value: trace.result * 10 ** place,
    }
  })

  return {
    multiplicand,
    multiplier,
    rows,
    result: rows.reduce((sum, row) => sum + row.value, 0),
  }
}

/** The multiplier row for place `n`, with a problem-specific failure. */
export function partialProductRow(
  trace: PartialProductTrace,
  n: number,
): PartialProductRow {
  const row = trace.rows[n]
  if (!row) {
    throw new Error(
      `${trace.multiplicand} × ${trace.multiplier} has ${trace.rows.length} rows, no row ${n}`,
    )
  }
  return row
}

/** Dropped the carry sent out of one multiplication place. */
export function forgotMultiplicationCarry(
  trace: MultiplicationTrace,
  n: number,
  nudge: string,
): Misconception {
  const place = multiplicationPlace(trace, n)
  if (place.carry === 0) {
    throw new Error(`${trace.multiplicand} × ${trace.multiplier} has no carry out of place ${n}`)
  }

  return {
    value: trace.result - place.carry * 10 ** (n + 1),
    tag: 'forgot-multiplication-carry',
    nudge,
  }
}

/** Added the carry to the next digit before multiplying that digit. */
export function carriedBeforeMultiplying(
  trace: MultiplicationTrace,
  from: number,
  nudge: string,
): Misconception {
  const place = multiplicationPlace(trace, from)
  if (place.carry === 0 || trace.multiplier <= 1) {
    throw new Error(
      `${trace.multiplicand} × ${trace.multiplier} cannot misapply a carry from place ${from}`,
    )
  }

  return {
    value:
      trace.result + place.carry * (trace.multiplier - 1) * 10 ** (from + 1),
    tag: 'carried-before-multiplying',
    nudge,
  }
}

/** Used the tens digit's product without shifting it into the tens place. */
export function missingPlaceholder(
  trace: PartialProductTrace,
  rowNumber: number,
  nudge: string,
): Misconception {
  const row = partialProductRow(trace, rowNumber)
  if (row.place === 0 || row.digit === 0) {
    throw new Error(
      `${trace.multiplicand} × ${trace.multiplier} has no shifted non-zero row at place ${rowNumber}`,
    )
  }

  return {
    value: trace.result - row.value + row.unshifted,
    tag: 'missing-placeholder',
    nudge,
  }
}

/** Stopped after the multiplier's ones digit and omitted every higher row. */
export function firstPartialOnly(
  trace: PartialProductTrace,
  nudge: string,
): Misconception {
  if (!trace.rows.some((row) => row.place > 0 && row.digit !== 0)) {
    throw new Error(`${trace.multiplicand} × ${trace.multiplier} has no higher partial product`)
  }

  return {
    value: partialProductRow(trace, 0).value,
    tag: 'first-partial-only',
    nudge,
  }
}
