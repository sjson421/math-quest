/**
 * What the mascot paints, and in what order.
 *
 * First paint only, per `docs/testing.md`. That is enough for the thing worth
 * pinning here: occlusion is decided entirely by document order, so asserting
 * where a fragment lands in the markup *is* asserting what it passes behind.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  characters,
  cosmetics,
  type Cosmetic,
  type Equipped,
} from '../cosmetics'
import { coats } from '../cosmetics/palette'
import type { PinTier } from '../lib/pin'
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

  it('keeps the rainbow wings colourful when reduced motion freezes their cycle', () => {
    const html = render({ back: 'rainbow-wings' })
    const hues = [...html.matchAll(/filter:hue-rotate\((\d+)deg\)/g)].map((match) => Number(match[1]))

    expect(hues).toEqual([0, 90, 180, 270])
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

describe('the pin', () => {
  /**
   * Five tiers per character, earned rather than worn — so this is driven by a
   * prop, not by `equipped`, and nothing in the catalogue can reach it.
   *
   * The frame is identified by the rim's stroke rather than by a coordinate, for
   * the reason the hat fragments are: every part of it is computed from the
   * wearer's own `pin`, so no number in it means the same thing on all three
   * bodies. Each character's rim is its own charm's colour, which is also the
   * check that the three ladders did not collapse into one.
   */
  const rimOf = (tone: string) => `fill:none;stroke:var(--color-${tone}-deep)`
  /** The rim once it fills, from tier 3 up. Tier 2's is the unfilled `rimOf`. */
  const plateOf = (tone: string) =>
    `fill:var(--color-${tone}-soft);stroke:var(--color-${tone}-deep)`

  const TONE = { pip: 'butter', mochi: 'powder', taro: 'mint' } as const

  const at = (tier: PinTier, character?: string) =>
    renderToStaticMarkup(<Mascot state="idle" character={character} tier={tier} />)

  it('draws the plain charm at tier 1, exactly as it always did', () => {
    expect(at(1)).toContain(STAR)
    expect(at(1), 'no frame yet').not.toContain(rimOf(TONE.pip))
    expect(at(1), 'no plate yet').not.toContain(plateOf(TONE.pip))
  })

  it('defaults to tier 1 when no tier is given', () => {
    expect(render()).toBe(at(1))
  })

  it('keeps the character’s own charm at every tier', () => {
    for (const [id, charm] of [
      ['pip', STAR],
      ['mochi', FISH_TAIL],
      ['taro', LILY_PAD],
    ] as const)
      for (const tier of [1, 2, 3, 4, 5] as const)
        expect(at(tier, id), `${id} tier ${tier}`).toContain(charm)
  })

  it('adds to the frame at every step up', () => {
    // Length is a coarse measure and the right one here: the promise is that a
    // tier adds and never replaces, so each must draw strictly more than the
    // one below it on every body.
    for (const id of ['pip', 'mochi', 'taro'] as const) {
      const lengths = ([1, 2, 3, 4, 5] as const).map((tier) => at(tier, id).length)

      expect(lengths, id).toEqual([...lengths].sort((a, b) => a - b))
      expect(new Set(lengths).size, `${id} distinct tiers`).toBe(5)
    }
  })

  it('fills the rim from tier 3 up, which is the step that reads at 92px', () => {
    // Tier 2 outlines, tier 3 fills. A fill is the one addition that costs no
    // radius, which is why it carries the middle of the ladder — see charm.tsx.
    expect(at(2)).toContain(rimOf(TONE.pip))
    expect(at(2), 'not filled yet').not.toContain(plateOf(TONE.pip))
    expect(at(3)).toContain(plateOf(TONE.pip))
  })

  it('draws each character’s frame in its own charm’s colour', () => {
    // The three charms are told apart by colour before shape at 92px, and a
    // shared frame colour would undo that at four of the five tiers.
    for (const [id, tone] of Object.entries(TONE))
      expect(at(5, id), id).toContain(plateOf(tone))

    expect(at(5, 'mochi'), 'not Pip’s butter').not.toContain(plateOf(TONE.pip))
  })

  /**
   * The sway and the celebration spin belong to the slot rather than to any one
   * tier: a tier that chose its own motion would make the reward for progress a
   * different celebration rather than a better pin. The wrapper carries them,
   * and its transform origin is the character's own `pin`.
   */
  it('gives every tier the motion the charm has', () => {
    const origin = 'transform-origin:148px 162px'

    for (const tier of [1, 3, 5] as const) expect(at(tier), `tier ${tier}`).toContain(origin)
  })

  it('cannot be reached through the wardrobe', () => {
    // `pin` left `CosmeticSlot`, so an old record naming one is an unknown key
    // that changes nothing — the same contract any retired id is under.
    const stale = { pin: 'blossom-rosette' } as unknown as Equipped

    expect(render(stale)).toBe(render())
  })
})
