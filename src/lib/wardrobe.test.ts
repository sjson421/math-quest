/**
 * Buying and wearing, against the real catalogue rather than a fixture.
 *
 * Prices come from the catalogue because the point of a purchase test is that
 * the learner is charged what the shop showed them. Expected balances are worked
 * out here from the starting coins and that price — never read back out of what
 * the function returned, which would pass no matter what it subtracted.
 */

import { describe, expect, it } from 'vitest'
import { cosmeticById, cosmetics, decorations } from '../cosmetics'
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
    expect(standing(worn, glasses)).toBe('in-use')
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

/**
 * The room half. One purse and one inventory, so these check that a decoration
 * travels the same purchase path a cosmetic does — and that the two slot maps
 * stay strictly apart once it has.
 */
describe('decorations', () => {
  const rug = decorations.find((d) => d.id === 'blossom-rug')!
  const window = decorations.find((d) => d.id === 'round-window')!
  const bunting = decorations.find((d) => d.id === 'blossom-bunting')!

  it('spends the same coins into the same inventory', () => {
    const before = learner({ coins: 200 })

    const after = buy(before, rug.id)

    expect(after!.coins).toBe(200 - rug.price)
    expect(after!.inventory).toContain(rug.id)
  })

  it('stands in the room rather than on Pip', () => {
    const owned = learner({ inventory: [rug.id] })

    const after = equip(owned, rug.id)

    expect(after!.room).toEqual({ rug: rug.id })
    expect(after!.equipped).toEqual({})
  })

  it('never lands in the room when it is a cosmetic', () => {
    const owned = learner({ inventory: [glasses.id] })

    const after = equip(owned, glasses.id)

    expect(after!.equipped).toEqual({ face: glasses.id })
    expect(after!.room).toEqual({})
  })

  it('refuses to place what is not owned', () => {
    expect(equip(learner(), rug.id)).toBeNull()
  })

  it('replaces what shares its slot, keeping the old one owned', () => {
    const placed = learner({
      inventory: [window.id, bunting.id],
      room: { wall: window.id },
    })

    const after = equip(placed, bunting.id)

    expect(after!.room).toEqual({ wall: bunting.id })
    expect(owns(after!, window.id)).toBe(true)
  })

  it('puts one away without touching the wardrobe', () => {
    const both = learner({
      inventory: [rug.id, glasses.id],
      room: { rug: rug.id },
      equipped: { face: glasses.id },
    })

    const after = unequip(both, 'rug')

    expect(after!.room).toEqual({})
    expect(after!.equipped).toEqual({ face: glasses.id })
    expect(owns(after!, rug.id)).toBe(true)
  })

  it('refuses to clear an empty room slot, so no push is scheduled', () => {
    expect(unequip(learner(), 'rug')).toBeNull()
    expect(unequip(learner({ room: { wall: window.id } }), 'rug')).toBeNull()
  })

  it('reads its standing from the room, not from what Pip wears', () => {
    const placed = learner({ inventory: [rug.id], room: { rug: rug.id } })

    expect(standing(placed, rug)).toBe('in-use')
    expect(standing(learner({ inventory: [rug.id] }), rug)).toBe('owned')
    expect(standing(learner({ coins: 0 }), rug)).toBe('out-of-reach')
  })
})

describe('the room the shop is priced against', () => {
  it('is priced on the same measured rate as the wardrobe', () => {
    // 15 coins for a lesson that raises mastery; two or three lessons a sitting.
    const perLesson = 15
    const prices = decorations.map((d) => d.price).sort((a, b) => a - b)

    expect(Math.ceil(prices[0] / perLesson)).toBeLessThanOrEqual(4)
    expect(Math.ceil(prices.at(-1)! / perLesson)).toBeLessThanOrEqual(15)
  })

  it('fills all four room slots, with one of them twice over', () => {
    const slots = decorations.map((d) => d.slot)

    expect(new Set(slots)).toEqual(new Set(['rug', 'wall', 'left', 'right']))
    expect(slots.filter((slot) => slot === 'wall')).toHaveLength(2)
  })
})
