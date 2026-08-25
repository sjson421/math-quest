/**
 * What the mascot paints, and in what order.
 *
 * First paint only, per `docs/testing.md`. That is enough for the thing worth
 * pinning here: occlusion is decided entirely by document order, so asserting
 * where a fragment lands in the markup *is* asserting what it passes behind.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  characters,
  cosmetics,
  cosmeticById,
  type Cosmetic,
  type Equipped,
} from '../cosmetics'
import { coats } from '../cosmetics/palette'
import { Mascot } from './Mascot'

const render = (equipped?: Equipped, character?: string) =>
  renderToStaticMarkup(<Mascot state="idle" character={character} equipped={equipped} />)

/** Each character's charm, by a command unique to it. */
const STAR = 'M148 150'
const FISH_TAIL = 'M161 166'
const LILY_PAD = 'M152 162'
/** Pip's head circle, and the last of his own layers a hat has to get behind. */
const HEAD = 'r="57"'
/**
 * The party hat's two fragments and the cape, by the colour each is filled with
 * rather than by an opening coordinate.
 *
 * Those coordinates are no longer constants: every cosmetic is now computed from
 * the wearer's anchors, so a hat band starts at `x 74.08` on Pip and somewhere
 * else on a cat, and a test pinned to either number is a test that fails the
 * next time a body is added. These tests are about **paint order**, and a fill
 * is the part of an item that order cannot change.
 */
const CROWN = 'fill:var(--color-lilac)'
const BAND = 'fill:var(--color-lilac-soft)'
const CAPE = 'fill:var(--color-powder)'
/** The open delighted smile used by the happy expression. */
const HAPPY_SMILE = 'M88 133'

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

  it('can show the happy face without changing his movement state', () => {
    const html = renderToStaticMarkup(<Mascot state="idle" expression="happy" />)

    expect(html).toContain(HAPPY_SMILE)
    expect(html).toContain('fill="#ffb3c9"')
    expect(html).toContain('aria-label="Pip is happy"')
  })
})

describe('each character', () => {
  it.each(characters.map((c) => [c.id, c] as const))('draws %s in their own coat', (_id, character) => {
    const html = render(undefined, character.id)

    expect(html).toContain(`aria-label="${character.name} is idle"`)
    // The body silhouette, whatever shape this character drew it as. Its fill is
    // the coat, so this is the check that the coat reached the body rather than
    // only the ears.
    expect(html).toContain(`fill="${character.coat.base}"`)
  })

  it('is somebody rather than nobody when the id is one the catalogue retired', () => {
    expect(render(undefined, 'a-character-that-was-retired')).toBe(render())
  })

  it('gives each of them a charm of their own in the pin slot', () => {
    expect(render(undefined, 'pip')).toContain(STAR)
    expect(render(undefined, 'mochi')).toContain(FISH_TAIL)
    expect(render(undefined, 'taro')).toContain(LILY_PAD)

    expect(render(undefined, 'mochi')).not.toContain(STAR)
    expect(render(undefined, 'taro')).not.toContain(STAR)
  })

  /**
   * The promise a character makes to the wardrobe, and the reason a character is
   * a coat and five fragments rather than a second drawing: every accessory is
   * authored against anchors all three share, so buying one can never cost the
   * learner something they already own.
   */
  it.each(characters.map((c) => [c.id, c] as const))('wears everything, on %s', (_id, character) => {
    const bare = render(undefined, character.id)

    for (const cosmetic of cosmetics) {
      const worn = render(wearing(cosmetic), character.id)

      expect(worn.length, `${cosmetic.id} on ${character.id}`).toBeGreaterThan(bare.length)
    }
  })

  it('paints markings over the cheeks and under the mouth', () => {
    // Mochi's nose sits between the two, so a muzzle is something the mouth is
    // drawn on and never something drawn over an expression.
    const html = render(undefined, 'mochi')
    const cheek = 'cx="66" cy="126"'
    const nose = 'M93 124'
    const mouth = 'M92 138'

    expect(html).toContain(nose)
    expect(html.indexOf(cheek)).toBeLessThan(html.indexOf(nose))
    expect(html.indexOf(nose)).toBeLessThan(html.indexOf(mouth))
  })

  // Both open mouths, not just `happy`. Covering one of them is how
  // `celebrating` came to fill its interior with INK while `happy` stayed pink:
  // they are one expression at two sizes, so they pass or fail together.
  it.each(['happy', 'celebrating'] as const)(
    'fills the %s mouth with the character’s own blush, not Pip’s',
    (state) => {
      const html = renderToStaticMarkup(<Mascot state={state} character="mochi" />)

      expect(html).toContain(`fill="${coats.mochi.blush}"`)
      expect(html).not.toContain(coats.pip.blush)
    },
  )
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

    // The scarf by its fill, for the reason the hat fragments are: it is drawn
    // from `chin` now, so its opening command belongs to whoever is wearing it.
    const SCARF = 'fill:var(--color-mint)'

    expect(html).toContain('M91 110')
    expect(html).toContain(SCARF)
    expect(html.indexOf('M91 110')).toBeGreaterThan(html.indexOf(HEAD))
    expect(html.indexOf(SCARF)).toBeGreaterThan(html.indexOf(HEAD))
  })
})

describe('the pin slot', () => {
  /**
   * No shipped cosmetic takes this slot — replacing Pip's star is an identity
   * change the contract asks to be made deliberately, and the catalogue declines
   * to make it. A comet pin did briefly claim it and was withdrawn: at the sizes
   * Pip is actually drawn it read as a smudge, and taking the star off left the
   * lower-right of his face emptier than the star had. The renderer still
   * implements the slot, so it is proved with a fixture registered into the
   * catalogue for the test.
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

  it('replaces whichever charm the character brought', () => {
    for (const [id, charm] of [
      ['pip', STAR],
      ['mochi', FISH_TAIL],
      ['taro', LILY_PAD],
    ] as const) {
      const html = render({ pin: badge.id }, id)

      expect(html, id).toContain('data-badge')
      expect(html, id).not.toContain(charm)
    }
  })

  it('ships no cosmetic that would take the star’s place', () => {
    expect(cosmetics.some((c) => c.slot === 'pin')).toBe(false)
  })
})
