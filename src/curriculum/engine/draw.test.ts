import { describe, expect, it } from 'vitest'
import { makeRng } from '../../lib/rng'
import { drawOperands, drawPair } from './draw'

describe('drawPair', () => {
  it('draws both operands from the band', () => {
    const rng = makeRng(1)
    for (let i = 0; i < 50; i += 1) {
      const { a, b } = drawPair({ label: 'test', rng, band: [10, 40] })
      expect(a).toBeGreaterThanOrEqual(10)
      expect(a).toBeLessThanOrEqual(40)
      expect(b).toBeGreaterThanOrEqual(10)
      expect(b).toBeLessThanOrEqual(40)
    }
  })

  it('draws `a` before `b`, which is what a seed means', () => {
    // Two operands from one stream: drawing them in the other order would give
    // a different pair for the same seed, silently repointing every recorded
    // problem in the course.
    const expected = makeRng(99)
    const a = expected.int(10, 40)
    const b = expected.int(10, 40)

    expect(drawPair({ label: 'test', rng: makeRng(99), band: [10, 40] })).toEqual({ a, b })
  })

  it('derives the second operand when told to', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 50; i += 1) {
      const { a, b } = drawPair({
        label: 'test',
        rng,
        band: [20, 99],
        second: (drawn, r) => r.int(1, drawn - 1),
      })
      expect(b).toBeLessThan(a)
    }
  })

  it('rejects pairs the skill does not want', () => {
    const rng = makeRng(3)
    for (let i = 0; i < 50; i += 1) {
      const { a, b } = drawPair({
        label: 'test',
        rng,
        band: [1, 9],
        where: ({ a: x, b: y }) => x !== y,
      })
      expect(a).not.toBe(b)
    }
  })

  it('names the skill when a predicate can never be satisfied', () => {
    expect(() =>
      drawPair({
        label: 'add-2digit-carry',
        rng: makeRng(1),
        band: [10, 40],
        where: () => false,
        attempts: 5,
      }),
    ).toThrow('add-2digit-carry: no operand pair passed its constraints in 5 draws from [10, 40]')
  })
})

describe('drawOperands', () => {
  it('draws the requested count, all from the band', () => {
    const rng = makeRng(1)
    for (let i = 0; i < 50; i += 1) {
      const operands = drawOperands({ label: 'test', rng, band: [10, 40], count: 3 })
      expect(operands).toHaveLength(3)
      for (const operand of operands) {
        expect(operand).toBeGreaterThanOrEqual(10)
        expect(operand).toBeLessThanOrEqual(40)
      }
    }
  })

  it('draws left to right, which is what a seed means', () => {
    const expected = makeRng(99)
    const stack = [expected.int(10, 40), expected.int(10, 40), expected.int(10, 40)]

    expect(
      drawOperands({ label: 'test', rng: makeRng(99), band: [10, 40], count: 3 }),
    ).toEqual(stack)
  })

  it('rejects stacks the skill does not want', () => {
    const rng = makeRng(3)
    for (let i = 0; i < 50; i += 1) {
      const operands = drawOperands({
        label: 'test',
        rng,
        band: [1, 9],
        count: 3,
        where: (drawn) => new Set(drawn).size === drawn.length,
      })
      expect(new Set(operands).size).toBe(3)
    }
  })

  it('names the skill when a predicate can never be satisfied', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase:
    // without this, an impossible constraint surfaces as `constrain`'s anonymous
    // message and no skill is named.
    expect(() =>
      drawOperands({
        label: 'add-three-numbers',
        rng: makeRng(1),
        band: [10, 40],
        count: 3,
        where: () => false,
        attempts: 5,
      }),
    ).toThrow('add-three-numbers: no stack of 3 passed its constraints in 5 draws from [10, 40]')
  })
})
