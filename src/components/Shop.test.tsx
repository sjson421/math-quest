/**
 * What the shop offers, against a synthetic record.
 *
 * First paint only. Nothing behind a tap is reachable from here, which is why
 * the decisions themselves live in `lib/wardrobe.ts` and are tested there — this
 * checks what the learner is *shown*, which is the half that file cannot cover.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { cosmetics } from '../cosmetics'
import { initialProgress, type Progress } from '../store/progress'
import { Shop } from './Shop'

const render = (progress: Partial<Progress>) =>
  renderToStaticMarkup(
    <Shop
      progress={{ ...initialProgress(), ...progress }}
      onBuy={() => {}}
      onEquip={() => {}}
      onUnequip={() => {}}
      onClose={() => {}}
    />,
  )

const glasses = cosmetics.find((c) => c.id === 'round-glasses')!

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

    expect(withRetired.match(/rounded-blob/g)).toHaveLength(cosmetics.length)
    expect(withRetired).not.toContain('sombrero')
    expect(withRetired).toBe(known)
  })

  it('says plainly that nothing here changes the maths', () => {
    expect(render({})).toContain('nothing here changes the maths')
  })
})
