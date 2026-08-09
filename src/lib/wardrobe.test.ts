/**
 * Buying and wearing, against the real catalogue rather than a fixture.
 *
 * Prices come from the catalogue because the point of a purchase test is that
 * the learner is charged what the shop showed them. Expected balances are worked
 * out here from the starting coins and that price — never read back out of what
 * the function returned, which would pass no matter what it subtracted.
 */

import { describe, expect, it } from 'vitest'
import { cosmeticById, cosmetics } from '../cosmetics'
import { initialProgress, type Progress } from '../store/progress'
import { buy, equip, owns, standing, unequip } from './wardrobe'

const glasses = cosmetics.find((c) => c.id === 'round-glasses')!
const bows = cosmetics.find((c) => c.id === 'ear-bows')!
const hat = cosmetics.find((c) => c.id === 'party-hat')!

const learner = (overrides: Partial<Progress> = {}): Progress => ({
  ...initialProgress(),
  coins: 500,
  ...overrides,
})

describe('buying', () => {
  it('deducts exactly the price and records the purchase', () => {
    const before = learner({ coins: 100 })

    const after = buy(before, glasses.id)

    expect(after).not.toBeNull()
    expect(after!.coins).toBe(100 - glasses.price)
    expect(owns(after!, glasses.id)).toBe(true)
  })

  it('refuses what the learner cannot afford, and takes nothing', () => {
    const before = learner({ coins: glasses.price - 1 })

    expect(buy(before, glasses.id)).toBeNull()
    expect(before.coins).toBe(glasses.price - 1)
    expect(owns(before, glasses.id)).toBe(false)
  })

  it('refuses a second copy of something already owned', () => {
    const owned = buy(learner(), glasses.id)!

    expect(buy(owned, glasses.id)).toBeNull()
  })

  it('refuses an id the catalogue does not know', () => {
    expect(buy(learner(), 'sombrero')).toBeNull()
  })

  it('changes coins and the wardrobe and nothing else', () => {
    const before = learner({ xp: 340, streakCount: 6, todayXp: 40 })

    const after = buy(before, glasses.id)!

    expect(after.xp).toBe(before.xp)
    expect(after.streakCount).toBe(before.streakCount)
    expect(after.todayXp).toBe(before.todayXp)
    expect(after.skills).toEqual(before.skills)
    expect(after.equipped).toEqual(before.equipped)
  })

  it('does not put the purchase on, so choosing to own and to wear stay separate', () => {
    const after = buy(learner(), glasses.id)!

    expect(after.equipped).toEqual({})
  })
})

describe('wearing', () => {
  const withBoth = (): Progress => buy(buy(learner(), bows.id)!, hat.id)!

  it('refuses a cosmetic the learner does not own', () => {
    expect(equip(learner(), glasses.id)).toBeNull()
  })

  it('puts an owned cosmetic in its slot', () => {
    const after = equip(buy(learner(), glasses.id)!, glasses.id)!

    expect(after.equipped).toEqual({ face: glasses.id })
  })

  it('replaces what is in a slot rather than stacking, keeping both owned', () => {
    const wearingBows = equip(withBoth(), bows.id)!

    const wearingHat = equip(wearingBows, hat.id)!

    expect(wearingHat.equipped.headwear).toBe(hat.id)
    expect(owns(wearingHat, bows.id)).toBe(true)
    expect(Object.values(wearingHat.equipped)).toHaveLength(1)
  })

  it('leaves other slots alone', () => {
    const dressed = equip(equip(buy(withBoth(), glasses.id)!, hat.id)!, glasses.id)!

    expect(dressed.equipped).toEqual({ headwear: hat.id, face: glasses.id })
  })

  it('refuses to re-equip what is already worn, so nothing is written for nothing', () => {
    const worn = equip(buy(learner(), glasses.id)!, glasses.id)!

    expect(equip(worn, glasses.id)).toBeNull()
  })
})

describe('taking off', () => {
  it('empties the slot but keeps the cosmetic owned', () => {
    const worn = equip(buy(learner(), glasses.id)!, glasses.id)!

    const bare = unequip(worn, 'face')!

    expect(bare.equipped).toEqual({})
    expect(owns(bare, glasses.id)).toBe(true)
    expect(bare.coins).toBe(worn.coins)
  })

  it('refuses when the slot is already empty', () => {
    expect(unequip(learner(), 'face')).toBeNull()
  })
})

describe('standing', () => {
  it('names where the learner is with each cosmetic', () => {
    const broke = learner({ coins: 0 })
    const owned = buy(learner(), glasses.id)!
    const worn = equip(owned, glasses.id)!

    expect(standing(learner(), glasses)).toBe('affordable')
    expect(standing(broke, glasses)).toBe('out-of-reach')
    expect(standing(owned, glasses)).toBe('owned')
    expect(standing(worn, glasses)).toBe('worn')
  })

  it('calls a cosmetic affordable at exactly its price', () => {
    expect(standing(learner({ coins: glasses.price }), glasses)).toBe('affordable')
  })
})

describe('the catalogue the shop is priced against', () => {
  it('reaches the cheapest item in a few lessons and the dearest in about five days', () => {
    // 15 coins for a lesson that raises mastery; two or three lessons a sitting.
    const perLesson = 15
    const prices = cosmetics.map((c) => c.price).sort((a, b) => a - b)

    expect(Math.ceil(prices[0] / perLesson)).toBeLessThanOrEqual(3)
    expect(Math.ceil(prices.at(-1)! / perLesson)).toBeLessThanOrEqual(15)
  })

  it('covers four slots, leaving Pip’s signature star alone', () => {
    const slots = new Set(cosmetics.map((c) => c.slot))

    expect(slots).toEqual(new Set(['face', 'headwear', 'neck', 'back']))
    expect(cosmeticById.get('party-hat')?.back).toBeDefined()
    expect(cosmeticById.get('party-hat')?.front).toBeDefined()
  })
})
