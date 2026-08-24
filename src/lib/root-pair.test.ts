import { describe, expect, it } from 'vitest'
import { rational } from './rational'
import {
  decodeRootPairEntry,
  encodeRootPairEntry,
  normalizeRootPair,
  rootPairKey,
  rootPairsEqual,
  updateRootPairEntry,
} from './root-pair'
import type { RootPairValue } from './types'

const pair = (first: [number, number], second: [number, number]): RootPairValue => ({
  kind: 'root-pair',
  roots: [rational(...first), rational(...second)],
})

describe('root-pair entry codec', () => {
  it('decodes the untouched lesson entry as two empty slots', () => {
    expect(decodeRootPairEntry('')).toEqual(['', ''])
  })

  it('round-trips both unfinished raw slots exactly', () => {
    const slots = ['-3/4', '1 1/2'] as const
    expect(decodeRootPairEntry(encodeRootPairEntry(slots))).toEqual(slots)
  })

  it('preserves signs, slashes, decimals, spaces, and blank partners', () => {
    for (const slots of [
      ['-', ''],
      ['5/', '-0.25'],
      [' 1  1/2 ', '.75'],
    ] as const) {
      expect(decodeRootPairEntry(encodeRootPairEntry(slots))).toEqual(slots)
    }
  })

  it('rejects malformed or non-canonical internal tuples', () => {
    for (const entry of ['not-json', '["1"]', '[1,"2"]', '["1", "2"]']) {
      expect(decodeRootPairEntry(entry), entry).toBeNull()
    }
  })

  it('updates only the selected slot through a functional edit', () => {
    const start = encodeRootPairEntry(['-3', '4'])
    expect(decodeRootPairEntry(updateRootPairEntry(start, 0, (value) => `${value}/2`))).toEqual([
      '-3/2',
      '4',
    ])
    expect(decodeRootPairEntry(updateRootPairEntry(start, 1, () => '5'))).toEqual(['-3', '5'])
  })
})

describe('exact root-pair values', () => {
  it('normalizes rational components', () => {
    const authored: RootPairValue = {
      kind: 'root-pair',
      roots: [{ n: 2, d: 4 }, { n: -6, d: -8 }],
    }
    expect(normalizeRootPair(authored)).toEqual(pair([1, 2], [3, 4]))
    expect(rootPairKey(authored)).toBe('1/2|3/4')
  })

  it('compares roots without imposing an order', () => {
    expect(rootPairsEqual(pair([-3, 1], [4, 1]), pair([4, 1], [-3, 1]))).toBe(true)
  })

  it('preserves repeated-root multiplicity', () => {
    expect(rootPairsEqual(pair([-3, 1], [-3, 1]), pair([-3, 1], [4, 1]))).toBe(false)
    expect(rootPairKey(pair([-3, 1], [-3, 1]))).toBe('-3/1|-3/1')
  })
})
