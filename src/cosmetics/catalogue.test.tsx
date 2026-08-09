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
import { cosmetics, type Cosmetic, type MascotState } from './index'
import { BLUSH, CREAM, CREAM_SHADE, INK, families } from './palette'

const slots = new Set(['back', 'headwear', 'face', 'neck', 'pin'])

/** Every fragment of an item, drawn in both a resting and an excited state. */
const markupOf = (cosmetic: Cosmetic): string =>
  (['idle', 'celebrating'] as MascotState[])
    .flatMap((state) =>
      [cosmetic.render, cosmetic.back, cosmetic.front]
        .filter((fragment) => fragment !== undefined)
        .map((fragment) => renderToStaticMarkup(fragment(state))),
    )
    .join('')

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

  it('strokes between 2.5 and 3 units — thinner vanishes at 92px, thicker fights the face', () => {
    for (const cosmetic of cosmetics) {
      const widths = strokeWidths(markupOf(cosmetic))
      expect(widths.length, `${cosmetic.id} has strokes`).toBeGreaterThan(0)

      for (const width of widths) {
        expect(width, `${cosmetic.id} stroke width`).toBeGreaterThanOrEqual(2.5)
        expect(width, `${cosmetic.id} stroke width`).toBeLessThanOrEqual(3)
      }
    }
  })

  it('positions transforms in view-box units, never as an originX fraction', () => {
    for (const cosmetic of cosmetics) {
      expect(markupOf(cosmetic), `${cosmetic.id}`).not.toMatch(/originX|originY/)
    }
  })

  it('loads nothing over the network — the app is used offline', () => {
    for (const cosmetic of cosmetics) {
      expect(markupOf(cosmetic), `${cosmetic.id}`).not.toMatch(/href=|url\(|@import/)
    }
  })
})

describe('the checker itself', () => {
  // Without these, a checker that silently matched nothing would pass forever.
  const bad: Cosmetic = { id: 'bad', slot: 'face', name: 'Bad', price: 1, render: () => null }

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
   * An app colour is written down once, in `src/index.css`. A cosmetic reaches
   * it by reference, so the only literals allowed in the catalogue are Pip's own
   * four — anything else is a pasted copy that nothing keeps in step.
   */
  const pipsOwn = new Set([CREAM, CREAM_SHADE, INK, BLUSH])
  const literals = (markup: string) => [...markup.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => m[0])

  it('uses no hex beyond Pip’s own constants', () => {
    for (const cosmetic of cosmetics) {
      for (const literal of literals(markupOf(cosmetic))) {
        expect(pipsOwn.has(literal), `${cosmetic.id} paints a literal ${literal}`).toBe(true)
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
      id: 'pasted',
      slot: 'face',
      name: 'Pasted',
      price: 1,
      render: () => <circle r="5" style={{ fill: '#cbb6f0' }} />,
    } as const satisfies Cosmetic

    expect(literals(markupOf(pasted)).every((hex) => pipsOwn.has(hex))).toBe(false)
  })
})
