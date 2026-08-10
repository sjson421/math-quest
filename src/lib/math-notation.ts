import type { MathNotation } from './types'

export type FractionEntryNotation = {
  notation: Extract<MathNotation, { kind: 'fraction' }>
  label: string
}

const spokenPart = (value: string) => {
  if (value === '') return 'blank'
  if (value.startsWith('−') || value.startsWith('-')) return `negative ${value.slice(1)}`
  return value
}

/**
 * Translate the pad's editable string into the notation it echoes.
 *
 * The raw string remains lesson state and still reaches the checker unchanged.
 * This helper owns only the visible tree and its derived accessible name, just
 * as `entryLabel()` owns the visible minus without changing the submitted one.
 */
export function fractionEntryNotation(value: string): FractionEntryNotation | undefined {
  const slash = value.indexOf('/')
  if (slash < 0 || value.indexOf('/', slash + 1) >= 0) return undefined

  const numerator = value.slice(0, slash)
  const denominator = value.slice(slash + 1)

  return {
    notation: {
      kind: 'fraction',
      numerator: { kind: 'text', value: numerator },
      denominator: { kind: 'text', value: denominator },
    },
    label: `${spokenPart(numerator)} over ${spokenPart(denominator)}`,
  }
}

/** The answer phrase used when a larger expression owns accessibility. */
export const entrySpokenLabel = (value: string): string =>
  fractionEntryNotation(value)?.label ?? (value || 'blank')
