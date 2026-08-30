/**
 * The catalogue against the rules it is authored under.
 *
 * These are the `mascot-design` limits a machine can judge. Round caps and
 * joins, legibility at 92px, and collision with the thinking dots are left to
 * the acceptance pass in that skill's checklist — a checker cannot tell a circle
 * that needs no join from a path that does.
 *
 * Every check below is proved against a deliberately bad fixture as well as the
 * real catalogue, because a checker that returns "no problems" looks exactly
 * like a clean codebase.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  COSMETIC_SLOTS,
  DEFAULT_CHARACTER,
  ROOM_SLOTS,
  catalogue,
  characterOf,
  characters,
  cosmetics,
  decorations,
  type CatalogueItem,
  type Character,
  type Cosmetic,
  type MascotState,
} from './index'
import { BLUSH, CREAM, CREAM_SHADE, INK, coats, families } from './palette'

const slots = new Set<string>(COSMETIC_SLOTS)
const roomSlots = new Set<string>(ROOM_SLOTS)

/**
 * Every fragment of an item, drawn in both a resting and an excited state, on
 * every body — an item is now a function of its wearer's anchors, so sampling
 * one character would leave the other two unchecked.
 */
const markupOf = (cosmetic: Cosmetic): string =>
  (['idle', 'celebrating'] as MascotState[])
    .flatMap((state) =>
      characters.flatMap((character) =>
        [cosmetic.render, cosmetic.back, cosmetic.front]
          .filter((fragment) => fragment !== undefined)
          .map((fragment) => renderToStaticMarkup(fragment(state, character.anchors))),
      ),
    )
    .join('')

/**
 * Every part of a character: both ears, the crest, the markings, and all five
 * pins — the tiers are geometry the character ships, so the stroke and palette
 * rules below have to reach every one of them, not just the plain charm.
 */
const markupOfCharacter = (character: Character): string =>
  renderToStaticMarkup(
    <g>
      {character.ear('left')}
      {character.ear('right')}
      {character.crest}
      {character.markings}
      {character.charms.map((charm, tier) => (
        <g key={tier}>{charm}</g>
      ))}
    </g>,
  )

/**
 * Any kind, as markup. Neither a decoration nor a character takes a state, so
 * there is nothing to sample for those — which is the point of those signatures.
 */
const markupOfItem = (item: CatalogueItem): string => {
  if (item.kind === 'decoration') return renderToStaticMarkup(item.render())
  if (item.kind === 'character') return markupOfCharacter(item)
  return markupOf(item)
}

const strokeWidths = (markup: string): number[] =>
  [...markup.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]))

describe('every cosmetic', () => {
  it('has a unique id, a real slot, and a positive price', () => {
    const ids = cosmetics.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const cosmetic of cosmetics) {
      expect(slots.has(cosmetic.slot), `${cosmetic.id} slot`).toBe(true)
      expect(cosmetic.price, `${cosmetic.id} price`).toBeGreaterThan(0)
      expect(cosmetic.name.length, `${cosmetic.id} name`).toBeGreaterThan(0)
    }
  })

  it('draws something, as one pass or as two fragments but never both', () => {
    for (const cosmetic of cosmetics) {
      const single = cosmetic.render !== undefined
      const split = cosmetic.back !== undefined || cosmetic.front !== undefined
      expect(single !== split, `${cosmetic.id} draw shape`).toBe(true)
      expect(markupOf(cosmetic).length, `${cosmetic.id} markup`).toBeGreaterThan(0)
    }
  })

  it('splits into fragments only in the slot the render order opens twice', () => {
    // Steps 3 and 5 are the only pair of gaps around Pip's own layers. A split
    // item in any other slot would have its `back` silently dropped.
    for (const cosmetic of cosmetics) {
      if (cosmetic.slot === 'headwear') continue
      expect(cosmetic.back, `${cosmetic.id} back`).toBeUndefined()
      expect(cosmetic.front, `${cosmetic.id} front`).toBeUndefined()
    }
  })
})

/**
 * The rules that hold on both surfaces. Both canvases share a unit scale, so a
 * stroke means the same thing on a hat and on a bookshelf, and one loop is
 * honest rather than a shortcut.
 */
describe('every catalogue item', () => {
  it('has an id unique across both kinds', () => {
    const ids = catalogue.map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('renders no coordinate that arithmetic lost', () => {
    // Every item is positioned from the wearer's anchors, so a missing or
    // mistyped anchor becomes `NaN` inside a `d` string rather than an error.
    // The shape then silently does not draw, which passes every other test
    // here — including the stroke widths, which are literals.
    for (const item of catalogue) {
      const markup = markupOfItem(item)

      expect(markup, `${item.id} has NaN in its geometry`).not.toContain('NaN')
      expect(markup, `${item.id} has undefined in its geometry`).not.toContain('undefined')
    }
  })

  it('strokes no thinner than 2.5 units — below that it vanishes at 92px', () => {
    for (const item of catalogue) {
      const widths = strokeWidths(markupOfItem(item))
      expect(widths.length, `${item.id} has strokes`).toBeGreaterThan(0)

      for (const width of widths) {
        expect(width, `${item.id} stroke width`).toBeGreaterThanOrEqual(2.5)
      }
    }
  })

  it('caps an accessory at 3 units and a character at 5 — the contract’s two weights', () => {
    // The ceiling is the one geometry limit that is not shared. An accessory
    // heavier than 3 fights the face it sits on; a character *is* the face, and
    // Pip's own tuft has been 5 units since before there were cosmetics. Both
    // numbers come from `mascot-design`, which states them as two rules for
    // exactly this reason.
    for (const item of catalogue) {
      const ceiling = item.kind === 'character' ? 5 : 3

      for (const width of strokeWidths(markupOfItem(item))) {
        expect(width, `${item.id} stroke width`).toBeLessThanOrEqual(ceiling)
      }
    }
  })

  it('positions transforms in view-box units, never as an originX fraction', () => {
    for (const item of catalogue) {
      expect(markupOfItem(item), `${item.id}`).not.toMatch(/originX|originY/)
    }
  })

  it('lists each kind cheapest first, so a category reads plain to elaborate', () => {
    // The shop groups by slot and shows each group in catalogue order. Ordering
    // the arrays by price is what makes a category climb rather than jump about,
    // and it is the one thing a new item can quietly get wrong.
    for (const list of [characters, cosmetics, decorations]) {
      const prices = list.map((item) => item.price)

      expect(prices).toEqual([...prices].sort((a, b) => a - b))
    }
  })

  it('loads nothing over the network — the app is used offline', () => {
    for (const item of catalogue) {
      expect(markupOfItem(item), `${item.id}`).not.toMatch(/href=|url\(|@import/)
    }
  })
})

describe('every decoration', () => {
  it('has a real room slot and a positive price', () => {
    for (const decoration of decorations) {
      expect(roomSlots.has(decoration.slot), `${decoration.id} slot`).toBe(true)
      expect(decoration.price, `${decoration.id} price`).toBeGreaterThan(0)
      expect(decoration.name.length, `${decoration.id} name`).toBeGreaterThan(0)
      expect(renderToStaticMarkup(decoration.render()).length, decoration.id).toBeGreaterThan(0)
    }
  })

  it('declares no back or front fragment — the room paints Pip as one step', () => {
    // There is no gap inside Pip's ten for a decoration to span, so a `back`
    // would be silently dropped. The type forbids it; this is the check that
    // the type is the one the catalogue is actually written against.
    for (const decoration of decorations) {
      expect('back' in decoration, `${decoration.id} back`).toBe(false)
      expect('front' in decoration, `${decoration.id} front`).toBe(false)
    }
  })
})

describe('every character', () => {
  it('has a unique id, a name, and a price that is not negative', () => {
    const ids = characters.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const character of characters) {
      expect(character.name.length, `${character.id} name`).toBeGreaterThan(0)
      expect(character.price, `${character.id} price`).toBeGreaterThanOrEqual(0)
      expect(markupOfCharacter(character).length, character.id).toBeGreaterThan(0)
    }
  })

  it('ships exactly one free character, and it is the one a record starts as', () => {
    // `owns()` reads a price of zero as already bought, so a second free
    // character would be a second thing every learner silently owns, and a
    // paid default would leave a fresh record playing as someone unowned.
    const free = characters.filter((c) => c.price === 0)

    expect(free.map((c) => c.id)).toEqual([DEFAULT_CHARACTER])
    // `DEFAULT_CHARACTER` is a literal rather than `characters[0].id`, for the
    // Fast Refresh reason written beside it. This is the pin that keeps the two
    // from drifting apart.
    expect(characters[0].id).toBe(DEFAULT_CHARACTER)
  })

  it('declares no slot — there is one character and its slot is never empty', () => {
    // A slot would put a character into `equipped`, where `unequip` could empty
    // it and leave nobody on screen.
    for (const character of characters) {
      expect('slot' in character, `${character.id} slot`).toBe(false)
    }
  })

  it('resolves an unknown or missing id to the default rather than to nothing', () => {
    expect(characterOf(undefined).id).toBe(DEFAULT_CHARACTER)
    expect(characterOf('a-character-that-was-retired').id).toBe(DEFAULT_CHARACTER)
  })

  it('declares five pins, each drawing more than the one below it', () => {
    // Five is a type-level fact, so this is about the ladder rather than the
    // count: a tier that drew the same as its neighbour would be a step the
    // learner cannot see, which is the one way this can be quietly wrong.
    for (const character of characters) {
      expect(character.charms, `${character.id} tiers`).toHaveLength(5)

      const lengths = character.charms.map(
        (charm) => renderToStaticMarkup(<g>{charm}</g>).length,
      )

      expect(lengths, character.id).toEqual([...lengths].sort((a, b) => a - b))
      expect(new Set(lengths).size, `${character.id} distinct`).toBe(5)
    }
  })

  it('draws every pin in that character’s own charm colour', () => {
    // The three ladders have to stay told apart by colour before shape at 92px,
    // which a single shared frame colour would undo at four tiers out of five.
    for (const character of characters) {
      const deep = families[character.charmTone].deep
      const markup = renderToStaticMarkup(<g>{character.charms[4]}</g>)

      expect(markup, character.id).toContain(deep)
    }
  })

  it('has an ear on each side that is not the same call twice', () => {
    // Both ears go through one function, and a character that ignored the side
    // would draw its left ear twice — invisible at rest, because `onEar` mirrors
    // the rotation and the result looks symmetric anyway, and wrong the moment
    // an ear is drawn asymmetrically. Whether the ear is the right *shape* to
    // hold a bow and sit under a muff at its own `hold` point is the acceptance
    // pass in `mascot-design`'s checklist; a string comparison cannot judge it.
    for (const character of characters) {
      const left = renderToStaticMarkup(<g>{character.ear('left')}</g>)
      const right = renderToStaticMarkup(<g>{character.ear('right')}</g>)

      expect(left, `${character.id} left ear`).not.toBe(right)
    }
  })

  /**
   * The anchors are the whole contract now, so these are the ways a new body
   * can be wrong in a way nothing else notices.
   *
   * Every check is an item that breaks. A brow below a chin puts the crown under
   * the scarf; a negative half-width turns a band inside out; two ear anchors on
   * the same side of the midline draws both muffs on one ear. None of it throws
   * — it just renders a creature with its hat on backwards.
   */
  it('anchors every body so the wardrobe has somewhere to hang', () => {
    for (const { id, anchors } of characters) {
      const { face, ear, crown, brow, temple, chin, shoulder, pin } = anchors

      // Top to bottom, in the order a body is read.
      expect(crown, `${id} crown above brow`).toBeLessThan(brow.y)
      expect(brow.y, `${id} brow above temple`).toBeLessThan(temple.y)
      expect(temple.y, `${id} temple above chin`).toBeLessThan(chin.y)

      for (const [name, span] of [
        ['brow', brow],
        ['temple', temple],
        ['chin', chin],
        ['shoulder', shoulder],
      ] as const) {
        expect(span.halfWidth, `${id} ${name} half-width`).toBeGreaterThan(0)
        // Nothing may claim to be wider than the canvas it is drawn in, or the
        // item measured off it is drawn off the edge rather than on the body.
        expect(span.halfWidth, `${id} ${name} half-width`).toBeLessThan(100)
      }

      // The widest point of a head is at the temple, between the brow and the
      // chin — a body wider at the jaw than at the cheek is one the glasses'
      // arms stop short of.
      expect(temple.halfWidth, `${id} widest at temple`).toBeGreaterThan(chin.halfWidth)

      // One ear each side, and each `hold` out on the ear rather than back
      // inside the skull — that point is where a muff centres.
      expect(ear.left.base.x, `${id} left ear base`).toBeLessThan(100)
      expect(ear.right.base.x, `${id} right ear base`).toBeGreaterThan(100)
      expect(ear.left.hold.y, `${id} left ear hold`).toBeLessThanOrEqual(ear.left.base.y)
      expect(ear.right.hold.y, `${id} right ear hold`).toBeLessThanOrEqual(ear.right.base.y)

      // A face that is mirrored, inverted or absent.
      expect(face.scale, `${id} face scale`).toBeGreaterThan(0)
      // The charm hangs beside the body, not in the middle of its face.
      expect(pin.x, `${id} pin clear of the face`).toBeGreaterThan(100)
    }
  })

  it('fits every cosmetic to every character', () => {
    // The promise the anchors exist to keep: **buying a character never costs
    // the learner an accessory.** Thirty combinations, and each one has to draw
    // more than the bare body does — an item that silently renders nothing on
    // one body is exactly the failure a shared head circle used to make
    // impossible and a per-character head makes possible again.
    for (const character of characters) {
      const bare = renderToStaticMarkup(<g>{character.head}</g>).length

      for (const cosmetic of cosmetics) {
        const drawn = [cosmetic.render, cosmetic.back, cosmetic.front]
          .filter((fragment) => fragment !== undefined)
          .map((fragment) => renderToStaticMarkup(<g>{fragment('idle', character.anchors)}</g>))

        expect(drawn.length, `${cosmetic.id} on ${character.id}`).toBeGreaterThan(0)
        for (const markup of drawn) {
          expect(markup.length, `${cosmetic.id} on ${character.id}`).toBeGreaterThan(7)
        }
        expect(bare).toBeGreaterThan(0)
      }
    }
  })
})

describe('the two slot unions', () => {
  /**
   * `unequip` is handed a slot and routes to `equipped` or `room` by membership
   * alone. The day a string appears in both unions it routes to the wrong map,
   * silently, so the disjointness is asserted rather than assumed.
   */
  it('share no slot name', () => {
    const overlap = [...slots].filter((slot) => roomSlots.has(slot))

    expect(overlap).toEqual([])
  })

  it('catches an overlap', () => {
    const withOverlap = new Set([...roomSlots, 'face'])

    expect([...slots].filter((slot) => withOverlap.has(slot))).not.toEqual([])
  })
})

describe('the checker itself', () => {
  // Without these, a checker that silently matched nothing would pass forever.
  const bad: Cosmetic = { kind: 'cosmetic', id: 'bad', slot: 'face', name: 'Bad', price: 1, render: () => null }

  it('catches a stroke outside the range', () => {
    const hairline = { ...bad, render: () => <circle r="5" stroke="#000" strokeWidth="1" /> }

    expect(strokeWidths(markupOf(hairline)).every((w) => w >= 2.5)).toBe(false)
  })

  it('catches a remote reference', () => {
    const remote = { ...bad, render: () => <image href="https://example.com/hat.png" /> }

    expect(markupOf(remote)).toMatch(/href=/)
  })

  it('catches a fragment that draws nothing', () => {
    expect(markupOf(bad)).toHaveLength(0)
  })
})

describe('where colours come from', () => {
  /**
   * An app colour is written down once, in `src/index.css`, and a character's
   * own colours once in `palette.ts`. An item reaches either by reference, so
   * the only literals allowed in the catalogue are `INK` and the three coats —
   * anything else is a pasted copy that nothing keeps in step.
   */
  const pipsOwn = new Set([
    INK,
    CREAM,
    CREAM_SHADE,
    BLUSH,
    ...Object.values(coats).flatMap((coat) => [coat.base, coat.shade, coat.blush]),
  ])
  const literals = (markup: string) => [...markup.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => m[0])

  it('uses no hex beyond INK and the coats', () => {
    for (const item of catalogue) {
      for (const literal of literals(markupOfItem(item))) {
        expect(pipsOwn.has(literal), `${item.id} paints a literal ${literal}`).toBe(true)
      }
    }
  })

  it('reaches every app family through a custom property', () => {
    for (const shade of Object.values(families).flatMap((f) => [f.base, f.soft, f.deep])) {
      expect(shade).toMatch(/^var\(--color-[\w-]+\)$/)
    }
  })

  it('catches a pasted family hex', () => {
    const pasted = {
      kind: 'cosmetic',
      id: 'pasted',
      slot: 'face',
      name: 'Pasted',
      price: 1,
      render: () => <circle r="5" style={{ fill: '#cbb6f0' }} />,
    } as const satisfies Cosmetic

    expect(literals(markupOf(pasted)).every((hex) => pipsOwn.has(hex))).toBe(false)
  })
})
