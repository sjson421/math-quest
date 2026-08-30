/**
 * What the shop offers, against a synthetic record.
 *
 * First paint only. Nothing behind a tap is reachable from here, which is why
 * the decisions themselves live in `lib/wardrobe.ts` and are tested there — this
 * checks what the learner is *shown*, which is the half that file cannot cover.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  COSMETIC_SLOTS,
  DEFAULT_CHARACTER,
  ROOM_SLOTS,
  catalogue,
  characters,
  cosmetics,
  decorations,
} from '../cosmetics'
import { MAX_STREAK_FREEZES, STREAK_FREEZE_PRICE } from '../lib/streak'
import { initialProgress, type Progress } from '../store/progress'
import { Shop } from './Shop'

const render = (progress: Partial<Progress>) =>
  renderToStaticMarkup(
    <Shop
      progress={{ ...initialProgress(), ...progress }}
      onBuy={() => {}}
      onBuyFreeze={() => {}}
      onEquip={() => {}}
      onUnequip={() => {}}
      onClose={() => {}}
    />,
  )

const glasses = cosmetics.find((c) => c.id === 'round-glasses')!
const mochi = characters.find((c) => c.id === 'mochi')!

describe('the shop', () => {
  it('shows the balance and every cosmetic with its price', () => {
    const html = render({ coins: 500 })

    expect(html).toContain('>500<')
    for (const cosmetic of cosmetics) {
      expect(html, cosmetic.id).toContain(cosmetic.name)
      expect(html, cosmetic.id).toContain(`${cosmetic.price} coins`)
    }
  })

  it('offers to sell what the learner can afford', () => {
    const html = render({ coins: glasses.price })

    expect(html).toContain(`Buy · ${glasses.price}`)
  })

  it('shows what is out of reach rather than hiding it', () => {
    const html = render({ coins: 0 })

    expect(html).toContain('Not enough coins')
    expect(html).toContain(glasses.name)
    expect(html).not.toContain('Buy · ')
  })

  it('offers to wear something already owned, not to buy it again', () => {
    const html = render({ coins: 500, inventory: [glasses.id] })

    expect(html).toContain('Wear')
    expect(html).toContain('Owned')
    expect(html).not.toContain(`Buy · ${glasses.price}`)
  })

  it('says what is being worn, and offers to take it off', () => {
    const html = render({ inventory: [glasses.id], equipped: { face: glasses.id } })

    expect(html).toContain('Worn')
    expect(html).toContain('Take off')
  })

  it('lists nothing extra for an owned id the catalogue no longer knows', () => {
    const known = render({ coins: 500 })
    const withRetired = render({ coins: 500, inventory: ['sombrero'] })

    // `shadow-soft` is the card container and nothing else. `rounded-blob` is
    // no longer specific enough — the room preview carries it too.
    //
    // One card per catalogue item, plus the streak freeze. That is the only
    // card on this screen with nothing in the catalogue behind it, which is
    // the whole reason a consumable could not be expressed as one.
    expect(withRetired.match(/shadow-soft/g)).toHaveLength(catalogue.length + 1)
    expect(withRetired).not.toContain('sombrero')
    expect(withRetired).toBe(known)
  })

  it('says plainly that nothing here changes the maths', () => {
    expect(render({})).toContain('nothing here changes the maths')
  })
})

describe('the two sections', () => {
  const rug = decorations.find((d) => d.id === 'blossom-rug')!

  it('offers both kinds under headings of their own', () => {
    const html = render({ coins: 500 })

    expect(html).toContain('Wardrobe')
    expect(html).toContain('Room')
    for (const decoration of decorations) {
      expect(html, decoration.id).toContain(decoration.name)
      expect(html, decoration.id).toContain(`${decoration.price} coins`)
    }
  })

  it('previews a decoration in the room and a cosmetic on Pip', () => {
    const html = render({ coins: 500 })

    // The room's box appears once per decoration; Pip's alone once per cosmetic.
    expect(html.match(/viewBox="0 0 320 200"/g)).toHaveLength(decorations.length)
    expect(html.match(/viewBox="0 0 200 200"/g)).toHaveLength(catalogue.length)
  })

  it('says place and put away for a decoration, never wear and take off', () => {
    const owned = render({ inventory: [rug.id] })
    const placed = render({ inventory: [rug.id], room: { rug: rug.id } })

    expect(owned).toContain('Place')
    expect(placed).toContain('In the room')
    expect(placed).toContain('Put away')
    expect(placed).not.toContain('Take off')
  })

  it('heads every category that has something in it, and no other', () => {
    const html = render({ coins: 500 })

    // Both lists cover every slot today. The assertion is written against what
    // each slot actually holds rather than against that fact, so the day a slot
    // empties the shop is expected to drop its heading, not keep an empty one.
    for (const [slots, items, label] of [
      [COSMETIC_SLOTS, cosmetics, { back: 'Back', headwear: 'Headwear', face: 'Face', neck: 'Neck', pin: 'Badge' }],
      [ROOM_SLOTS, decorations, { rug: 'Floor', wall: 'Wall', left: 'Left corner', right: 'Right corner' }],
    ] as const) {
      for (const slot of slots) {
        const heading = `>${(label as Record<string, string>)[slot]}<`
        const occupied = (items as readonly { slot: string }[]).some((item) => item.slot === slot)

        expect(html.includes(heading), `${slot} heading`).toBe(occupied)
      }
    }
  })

  it('draws a decoration at a size that clears the mascot’s floor', () => {
    // A two-column card would put the room at 84px and Pip inside it at 84,
    // below the 92px the contract says an item must survive. The room section
    // is full width for exactly this reason.
    const html = render({})

    expect(html).toContain('height="194"')
  })
})

describe('the characters section', () => {
  it('offers every character, priced, above the wardrobe', () => {
    const html = render({ coins: 1000 })

    for (const character of characters) {
      expect(html, character.id).toContain(character.name)
    }
    expect(html).toContain(`Buy · ${mochi.price}`)
    expect(html.indexOf('Characters')).toBeLessThan(html.indexOf('Wardrobe'))
  })

  it('shows the free one as chosen rather than as something to buy', () => {
    const html = render({ coins: 0 })

    expect(html).toContain('Playing as')
    expect(html).toContain('Chosen')
    // The disabled in-use button. There is no taking a character off, so the
    // word is a statement and not an offer.
    expect(html).not.toContain('Buy · 0')
  })

  it('names the shop after whoever is being played as', () => {
    expect(render({ character: DEFAULT_CHARACTER })).toContain('Pip&#x27;s shop')
    expect(render({ character: mochi.id })).toContain('Mochi&#x27;s shop')
  })

  it('offers to play as one already bought', () => {
    const html = render({ coins: 0, inventory: [mochi.id] })

    expect(html).toContain('Play as')
    expect(html).not.toContain(`Buy · ${mochi.price}`)
  })
})

describe('the streak section', () => {
  /**
   * Just the streak section. Scoped rather than asserted over the whole page
   * because a price is a substring of a longer price — `Buy · 30` is inside the
   * picture wall's `Buy · 300`, which made a global assertion quietly wrong.
   */
  const section = (html: string) =>
    html.slice(html.indexOf('>Streak<'), html.indexOf('>Characters<'))

  it('offers a freeze at its price when the coins are there', () => {
    const html = section(render({ coins: STREAK_FREEZE_PRICE }))

    expect(html).toContain('Streak freeze')
    expect(html).toContain(`Buy · ${STREAK_FREEZE_PRICE}`)
  })

  it('says what is missing rather than offering a purchase that would be refused', () => {
    const html = section(render({ coins: STREAK_FREEZE_PRICE - 1 }))

    expect(html).toContain('Not enough coins')
    expect(html).not.toContain(`Buy · ${STREAK_FREEZE_PRICE}`)
  })

  it('says the cap is reached rather than offering another, however rich the learner', () => {
    const html = section(render({ coins: 100_000, streakFreezes: MAX_STREAK_FREEZES }))

    expect(html).toContain(`Holding ${MAX_STREAK_FREEZES} of ${MAX_STREAK_FREEZES}`)
    expect(html).not.toContain(`Buy · ${STREAK_FREEZE_PRICE}`)
  })

  it('marks the multiplier the current streak is actually earning', () => {
    // `aria-current` is the only part of the ladder that changes with the
    // streak, so it is what pins the lookup rather than the rendered numbers.
    const starting = section(render({ streakCount: 0 }))
    const doubled = section(render({ streakCount: 30 }))

    expect(starting).toContain('aria-current="true"')
    expect(starting.indexOf('aria-current'), 'the first rung is lit at day zero')
      .toBeLessThan(starting.indexOf('1.25'))
    expect(doubled.indexOf('aria-current'), 'the last rung is lit at day thirty')
      .toBeGreaterThan(doubled.indexOf('1.5'))
  })
})
