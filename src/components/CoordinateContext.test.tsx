import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CoordinateContext } from './CoordinateContext'

describe('CoordinateContext', () => {
  it('draws a stated point with the course minus glyph', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext data={{ operation: 'plot-point', point: { x: -2, y: 3 } }} />,
    )

    expect(html).toContain('data-coordinate-point-context')
    expect(html).toContain('Point (−2, 3)')
  })

  it('renders every table row as cells and identifies exactly one target', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        data={{
          operation: 'table-to-graph',
          rows: [{ x: -2, y: -1 }, { x: 0, y: 1 }, { x: 2, y: 3 }],
          targetX: 2,
        }}
      />,
    )

    expect(html).toContain('<table')
    expect(html).toContain('<th')
    expect(html.match(/<tr/g)).toHaveLength(4)
    expect(html.match(/<td/g)).toHaveLength(6)
    expect(html.match(/data-coordinate-table-target="true"/g)).toHaveLength(1)
    expect(html).toContain('target row')
  })

  it('adds no context when the plane already carries every visible source', () => {
    expect(renderToStaticMarkup(<CoordinateContext data={{ operation: 'quadrant' }} />)).toBe('')
    expect(renderToStaticMarkup(<CoordinateContext />)).toBe('')
  })
})
