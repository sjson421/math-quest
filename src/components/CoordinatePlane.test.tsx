import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CoordinatePlane as CoordinatePlaneSpec } from '../lib/coordinate-plane'
import { CoordinatePlane } from './CoordinatePlane'

const scale = { min: -5, max: 5, step: 1 }
const plane = (overrides: Partial<CoordinatePlaneSpec> = {}): CoordinatePlaneSpec => ({
  x: scale,
  y: scale,
  points: [],
  lines: [],
  ...overrides,
})
const render = (graph: CoordinatePlaneSpec) => renderToStaticMarkup(<CoordinatePlane plane={graph} />)

describe('CoordinatePlane', () => {
  it('renders axes, every gridline, thinned labels, and plotted points', () => {
    const html = render(plane({ points: [{ x: -2, y: 1 }, { x: 2, y: 3 }] }))

    expect(html.match(/data-grid-axis="x"/g)).toHaveLength(11)
    expect(html.match(/data-grid-axis="y"/g)).toHaveLength(11)
    expect(html.match(/data-zero-axis=/g)).toHaveLength(2)
    expect(html.match(/data-coordinate-point=/g)).toHaveLength(2)
    expect(html).toContain('data-x="-2" data-y="1"')
    expect(html).toContain('>−5<')
    expect(html).toContain('>0<')
    expect(html).toContain('>5<')
  })

  it('clips one line and distinguishes a second without color alone', () => {
    const html = render(plane({
      lines: [
        { through: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
        { through: [{ x: 2, y: 0 }, { x: 2, y: 1 }] },
      ],
    }))

    expect(html.match(/data-coordinate-line=/g)).toHaveLength(2)
    expect(html).toContain('data-line-style="solid"')
    expect(html).toContain('data-line-style="dashed"')
    expect(html).toContain('stroke-dasharray="10 7"')
    expect(html).toContain('stroke-linecap="butt"')
    expect(html).toContain('data-coordinate-plot-clip')
    const clipId = html.match(/<clipPath id="([^"]+)"/)?.[1]
    expect(clipId).toBeDefined()
    expect(html).toContain(`data-coordinate-lines="true" clip-path="url(#${clipId})"`)
    expect(html).toContain('<line x1="215.2" y1="292" x2="215.2" y2="36"')
  })

  it('gives every graph a unique matching plot clip', () => {
    const graph = plane({ lines: [{ through: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] })
    const html = renderToStaticMarkup(
      <>
        <CoordinatePlane plane={graph} />
        <CoordinatePlane plane={graph} />
      </>,
    )
    const clipIds = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((match) => match[1])

    expect(clipIds).toHaveLength(2)
    expect(new Set(clipIds)).toHaveLength(2)
    for (const clipId of clipIds) expect(html).toContain(`clip-path="url(#${clipId})"`)
  })

  it('rejects a graph-space segment that collapses in the fixed view box', () => {
    const collapsed = plane({
      lines: [{
        through: [
          { x: 6, y: -4 },
          { x: 1_125_899_906_842_631, y: 1_125_899_906_842_620 },
        ],
      }],
    })

    expect(() => render(collapsed)).toThrow('collapses in the SVG viewBox')
  })

  it('owns one accessible image name and hides the drawing subtree', () => {
    const html = render(plane({ lines: [{ through: [{ x: 0, y: 1 }, { x: 2, y: 3 }] }] }))

    expect(html.match(/role="img"/g)).toHaveLength(1)
    expect(html).toContain(
      'aria-label="Coordinate plane, x-axis −5 to 5 by 1; y-axis −5 to 5 by 1; ' +
        'line 1 through (0, 1) and (2, 3)"',
    )
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(1)
    expect(html).not.toContain('<canvas')
    expect(html).not.toContain('http')
  })

  it('renders the densest valid plane inside its fixed responsive view box', () => {
    const dense = plane({
      x: { min: -10, max: 10, step: 1 },
      y: { min: -10, max: 10, step: 1 },
      points: [{ x: -7, y: 4 }, { x: 8, y: -5 }],
      lines: [
        { through: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
        { through: [{ x: -2, y: 0 }, { x: -2, y: 1 }] },
      ],
    })
    const html = render(dense)

    expect(html).toContain('viewBox="0 0 320 320"')
    expect(html).toContain('class="block w-80 max-w-full h-auto"')
    expect(html.match(/data-grid-axis="x"/g)).toHaveLength(21)
    expect(html.match(/data-grid-axis="y"/g)).toHaveLength(21)
    expect(html.match(/data-coordinate-point=/g)).toHaveLength(2)
    expect(html.match(/data-coordinate-line=/g)).toHaveLength(2)
  })
})
