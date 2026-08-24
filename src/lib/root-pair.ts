import { rational, type Rational } from './rational'
import type { RootPairValue } from './types'

export type RootPairSlots = readonly [string, string]
export type RootPairSlot = 0 | 1

/** Preserve both raw slots behind the lesson's existing string boundary. */
export const encodeRootPairEntry = ([first, second]: RootPairSlots): string =>
  JSON.stringify([first, second])

/** Empty is the lesson's untouched entry; every non-empty form is canonical. */
export function decodeRootPairEntry(entry: string): RootPairSlots | null {
  if (entry === '') return ['', '']

  try {
    const parsed: unknown = JSON.parse(entry)
    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      typeof parsed[0] !== 'string' ||
      typeof parsed[1] !== 'string'
    ) return null

    const slots: RootPairSlots = [parsed[0], parsed[1]]
    return encodeRootPairEntry(slots) === entry ? slots : null
  } catch {
    return null
  }
}

export function updateRootPairEntry(
  entry: string,
  slot: RootPairSlot,
  apply: (previous: string) => string,
): string {
  const current = decodeRootPairEntry(entry) ?? ['', '']
  const next: RootPairSlots = slot === 0
    ? [apply(current[0]), current[1]]
    : [current[0], apply(current[1])]
  return encodeRootPairEntry(next)
}

function normalized(value: Rational): Rational | null {
  if (!Number.isSafeInteger(value.n) || !Number.isSafeInteger(value.d) || value.d === 0) {
    return null
  }

  try {
    return rational(value.n, value.d)
  } catch {
    return null
  }
}

export function normalizeRootPair(value: RootPairValue): RootPairValue | null {
  if (!Array.isArray(value.roots) || value.roots.length !== 2) return null
  const first = normalized(value.roots[0])
  const second = normalized(value.roots[1])
  return first && second ? { kind: 'root-pair', roots: [first, second] } : null
}

const rationalKey = (value: Rational) => `${value.n}/${value.d}`

/** Stable across root order and equivalent authored fractions. */
export function rootPairKey(value: RootPairValue): string | null {
  const pair = normalizeRootPair(value)
  if (!pair) return null
  return pair.roots.map(rationalKey).sort().join('|')
}

export const rootPairsEqual = (left: RootPairValue, right: RootPairValue): boolean => {
  const leftKey = rootPairKey(left)
  return leftKey !== null && leftKey === rootPairKey(right)
}
