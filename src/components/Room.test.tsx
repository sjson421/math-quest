/**
 * What the room draws, and in what order.
 *
 * First paint only, in node, so this checks composition rather than
 * interaction — the placement decisions themselves are pure functions in
 * `lib/wardrobe.ts` and are tested there.
 *
 * Assertions match on geometry the catalogue actually contains rather than on
 * markers added for the test, so an item redrawn without updating these fails
 * here instead of passing against a `data-` attribute nothing renders.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { decorations, type Placed } from '../cosmetics'
import { Room } from './Room'

const render = (placed?: Placed, message?: string) =>
  renderToStaticMarkup(<Room placed={placed} message={message} />)

/**
 * Pip's head circle. Its radius identifies it uniquely, where `cx="100"` also
 * matches his ground shadow and the party hat's pompom.
 *
 * Still written in *his* coordinates, not the room's: his canvas is nested, so
 * everything inside it keeps the numbers `Mascot.tsx` draws with.
 */
const PIP_HEAD = 'r="57"'
/** The horizon, drawn once by the surface itself. */
const HORIZON = 'M0 150 h320'

const RUG = 'rx="70"'
const WINDOW = 'M134 30 h52'
const SHELF = 'M249 100 h56'

describe('the surface', () => {
  it('draws a wall, a floor and Pip with nothing placed', () => {
    const html = render()

    expect(html).toContain(HORIZON)
    expect(html).toContain(PIP_HEAD)
    expect(html).toContain('viewBox="0 0 320 200"')
  })

  it('draws no decoration when the room is empty', () => {
    const html = render()

    for (const decoration of decorations) {
      expect(html, decoration.id).not.toContain(decoration.name)
    }
    expect(html).not.toContain(RUG)
  })

  it('loads nothing over the network — the app is used offline', () => {
    // The catalogue check covers the items; the surface itself is drawn here and
    // is the one part of the room no catalogue test can see.
    const html = render({ rug: 'blossom-rug', wall: 'round-window' })

    expect(html).not.toMatch(/href=|url\(|@import/)
  })

  it('nests Pip’s own canvas rather than scaling it', () => {
    // The whole occlusion contract rests on Pip's canvas being placed, not
    // resized: his geometry has to mean the same thing in both view boxes.
    const html = render()

    expect(html).toContain('translate(60 0)')
    expect(html).toContain('viewBox="0 0 200 200"')
  })

  it('draws Pip’s message on the right without moving Pip from the center', () => {
    const html = render(undefined, 'Keep going!')

    expect(html).toContain('role="status"')
    expect(html).toContain('Keep going!')
    expect(html).toContain('fill="#ffffff"')
    expect(html).toContain('M88 133')
    expect(html).toContain('aria-label="Pip is happy"')
    expect(html).toContain('<rect x="172" y="7" width="140"')
    expect(html).toContain('translate(60 0)')
    expect(html.indexOf('role="status"')).toBeGreaterThan(html.indexOf('<svg'))
    expect(html.indexOf('role="status"')).toBeLessThan(html.indexOf(PIP_HEAD))
  })
})

describe('placement', () => {
  it('draws what stands in each slot', () => {
    const html = render({ rug: 'blossom-rug', wall: 'round-window', right: 'lilac-bookshelf' })

    expect(html).toContain(RUG)
    expect(html).toContain(WINDOW)
    expect(html).toContain(SHELF)
  })

  it('paints every decoration behind Pip', () => {
    // The room's order is the only occlusion rule there is: Pip is one step,
    // painted last, so nothing placed can cross his face.
    const html = render({ rug: 'blossom-rug', wall: 'round-window', right: 'lilac-bookshelf' })

    for (const geometry of [RUG, WINDOW, SHELF]) {
      expect(html.indexOf(geometry), geometry).toBeLessThan(html.indexOf(PIP_HEAD))
    }
  })

  it('draws one slot without drawing the others', () => {
    const html = render({ rug: 'blossom-rug' })

    expect(html).toContain(RUG)
    expect(html).not.toContain(WINDOW)
    expect(html).not.toContain(SHELF)
  })

  it('draws nothing for an id the catalogue no longer knows', () => {
    // Not defensive: the record is stored opaquely on the server and never
    // migrated, so a copy naming a removed item can arrive from sync at any
    // time. The rest of the room has to survive it.
    const html = render({ rug: 'chandelier', wall: 'round-window' })

    expect(html).not.toContain('chandelier')
    expect(html).not.toContain(RUG)
    expect(html).toContain(WINDOW)
    expect(html).toContain(PIP_HEAD)
  })

  it('draws nothing for a cosmetic id placed in a room slot', () => {
    // A stored blob can pair any slot with any id. A cosmetic resolved here
    // would be drawn in Pip's coordinates inside the room's box.
    const html = render({ wall: 'party-hat' })

    expect(html).toBe(render())
  })
})

describe('the room against the wardrobe', () => {
  /**
   * The one place the two paint orders could disagree, and the reason Pip is a
   * single step: the cape is the *first* thing drawn inside his canvas, so if
   * the room had interleaved its slots with his it would land behind the rug.
   */
  // By fill, not by an opening coordinate: the cape is computed from the
  // wearer's `shoulder` anchor now, so its first command moves with the body.
  const CAPE = 'fill:var(--color-powder)'

  it('draws a worn cosmetic in front of every decoration', () => {
    const html = renderToStaticMarkup(
      <Room equipped={{ back: 'powder-cape' }} placed={{ rug: 'blossom-rug', wall: 'round-window' }} />,
    )

    expect(html).toContain(CAPE)
    for (const geometry of [RUG, WINDOW]) {
      expect(html.indexOf(geometry), geometry).toBeLessThan(html.indexOf(CAPE))
    }
  })

  it('still paints the cape behind Pip’s own head', () => {
    // Pip's internal order is untouched by being in a room: the cape is behind
    // his head there exactly as it is when he is drawn alone.
    const html = renderToStaticMarkup(<Room equipped={{ back: 'powder-cape' }} />)

    expect(html.indexOf(CAPE)).toBeLessThan(html.indexOf(PIP_HEAD))
  })
})

describe('what a screen reader hears', () => {
  it('announces Pip once and never the furniture', () => {
    const html = render({ rug: 'blossom-rug', wall: 'round-window', right: 'lilac-bookshelf' })

    expect(html.match(/aria-label=/g)).toHaveLength(1)
    expect(html).toContain('Pip is idle')
    for (const decoration of decorations) {
      expect(html, decoration.id).not.toContain(decoration.name)
    }
  })
})
