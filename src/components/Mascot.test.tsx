/**
 * What Pip paints, and in what order.
 *
 * First paint only, per `docs/testing.md`. That is enough for the thing worth
 * pinning here: occlusion is decided entirely by document order, so asserting
 * where a fragment lands in the markup *is* asserting what it passes behind.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cosmetics, cosmeticById, type Cosmetic, type Equipped } from '../cosmetics'
import { Mascot } from './Mascot'

const render = (equipped?: Equipped) =>
  renderToStaticMarkup(<Mascot state="idle" equipped={equipped} />)

/** The signature star's first path command — unique to it. */
const STAR = 'M148 150'
/** The head circle, and the last of Pip's own layers a hat has to get behind. */
const HEAD = 'r="57"'
/** The party hat's crown and its band. */
const CROWN = 'M100 14'
const BAND = 'M74 62'
/** The cape's opening command. */
const CAPE = 'M78 118'

const wearing = (cosmetic: Cosmetic): Equipped => ({ [cosmetic.slot]: cosmetic.id })

describe('Pip alone', () => {
  it('wears his signature star when nothing is equipped', () => {
    expect(render()).toContain(STAR)
    expect(render({})).toContain(STAR)
  })

  it('is unchanged by an equipped record naming nothing it knows', () => {
    expect(render({ headwear: 'sombrero', face: 'monocle' })).toBe(render())
  })

  it('announces only his state, however much he is wearing', () => {
    const dressed = render(Object.assign({}, ...cosmetics.map(wearing)))

    expect(dressed.match(/aria-label/g)).toHaveLength(1)
    expect(dressed).toContain('aria-label="Pip is idle"')
  })
})

describe('each cosmetic', () => {
  it.each(cosmetics.map((c) => [c.id, c] as const))('draws when %s is equipped', (_id, cosmetic) => {
    const bare = render()
    const worn = render(wearing(cosmetic))

    expect(worn.length).toBeGreaterThan(bare.length)
  })

  it('goes away again when the slot is emptied', () => {
    const hat = cosmetics.find((c) => c.id === 'party-hat')!

    expect(render(wearing(hat))).toContain(CROWN)
    expect(render({})).not.toContain(CROWN)
  })
})

describe('render order', () => {
  // Every check here reads document order, and a missing fragment gives
  // `indexOf` −1, which sits before everything and passes silently. So each
  // one proves the fragment is present before asking where it landed.
  it('puts a hat crown behind the head and its band in front', () => {
    const html = render({ headwear: 'party-hat' })

    expect(html).toContain(CROWN)
    expect(html).toContain(BAND)
    expect(html.indexOf(CROWN)).toBeLessThan(html.indexOf(HEAD))
    expect(html.indexOf(BAND)).toBeGreaterThan(html.indexOf(HEAD))
  })

  it('paints a cape behind everything of Pip’s', () => {
    const html = render({ back: 'powder-cape' })

    expect(html).toContain(CAPE)
    expect(html.indexOf(CAPE)).toBeLessThan(html.indexOf(HEAD))
  })

  it('paints face and neck cosmetics over the head', () => {
    const html = render({ face: 'round-glasses', neck: 'mint-scarf' })

    expect(html).toContain('M91 110')
    expect(html).toContain('M68 156')
    expect(html.indexOf('M91 110')).toBeGreaterThan(html.indexOf(HEAD))
    expect(html.indexOf('M68 156')).toBeGreaterThan(html.indexOf(HEAD))
  })
})

describe('the pin slot', () => {
  /**
   * No shipped cosmetic takes this slot — replacing Pip's star is an identity
   * change the contract asks to be made deliberately, and this increment
   * declined to make it. The renderer still implements the slot, so it is
   * proved with a fixture registered into the catalogue for the test.
   */
  const badge: Cosmetic = {
    kind: 'cosmetic',
    id: 'test-badge',
    slot: 'pin',
    name: 'Test badge',
    price: 1,
    render: () => <circle cx="148" cy="162" r="9" data-badge="" />,
  }

  beforeEach(() => cosmeticById.set(badge.id, badge))
  afterEach(() => cosmeticById.delete(badge.id))

  it('replaces the signature star rather than stacking with it', () => {
    const html = render({ pin: badge.id })

    expect(html).toContain('data-badge')
    expect(html).not.toContain(STAR)
  })

  it('ships no cosmetic that would take the star’s place', () => {
    expect(cosmetics.some((c) => c.slot === 'pin')).toBe(false)
  })
})
