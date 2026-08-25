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
  ROOM_SLOTS,
  catalogue,
  cosmetics,
  decorations,
  type CatalogueItem,
  type Cosmetic,
  type MascotState,
} from './index'
import { BLUSH, CREAM, CREAM_SHADE, INK, families } from './palette'

const slots = new Set<string>(COSMETIC_SLOTS)
const roomSlots = new Set<string>(ROOM_SLOTS)

/** Every fragment of an item, drawn in both a resting and an excited state. */
const markupOf = (cosmetic: Cosmetic): string =>
  (['idle', 'celebrating'] as MascotState[])
    .flatMap((state) =>
      [cosmetic.render, cosmetic.back, cosmetic.front]
        .filter((fragment) => fragment !== undefined)
        .map((fragment) => renderToStaticMarkup(fragment(state))),
    )
    .join('')

/**
 * Either kind, as markup. A decoration takes no state, so there is nothing to
 * sample — which is the point of that signature.
 */
const markupOfItem = (item: CatalogueItem): string =>
  item.kind === 'decoration' ? renderToStaticMarkup(item.render()) : markupOf(item)

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

  it('strokes between 2.5 and 3 units — thinner vanishes at 92px, thicker fights the face', () => {
    for (const item of catalogue) {
      const widths = strokeWidths(markupOfItem(item))
      expect(widths.length, `${item.id} has strokes`).toBeGreaterThan(0)

      for (const width of widths) {
        expect(width, `${item.id} stroke width`).toBeGreaterThanOrEqual(2.5)
        expect(width, `${item.id} stroke width`).toBeLessThanOrEqual(3)
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
    for (const list of [cosmetics, decorations]) {
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
   * An app colour is written down once, in `src/index.css`. An item reaches it
   * by reference, so the only literals allowed in the catalogue are Pip's own
   * four — anything else is a pasted copy that nothing keeps in step.
   */
  const pipsOwn = new Set([CREAM, CREAM_SHADE, INK, BLUSH])
  const literals = (markup: string) => [...markup.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => m[0])

  it('uses no hex beyond Pip’s own constants', () => {
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
