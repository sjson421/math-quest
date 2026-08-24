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

  it('renders slope-intercept equations with conventional signs and unit coefficients', () => {
    const positive = renderToStaticMarkup(
      <CoordinateContext data={{ operation: 'slope-intercept', slope: 2, intercept: -3, asks: 'slope' }} />,
    )
    const negativeUnit = renderToStaticMarkup(
      <CoordinateContext data={{ operation: 'graph-from-equation', slope: -1, intercept: 2 }} />,
    )

    expect(positive).toContain('data-coordinate-equation')
    expect(positive).toContain('y = 2x − 3')
    expect(positive).toContain('aria-label="y equals 2x minus 3"')
    expect(negativeUnit).toContain('y = −x + 2')
    expect(negativeUnit).not.toContain('−1x')
  })
  it('renders a semantic function table and one accessible function equation', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        data={{
          operation: 'compare-functions',
          tableRows: [{ x: -1, y: -5 }, { x: 0, y: -3 }, { x: 1, y: -1 }],
          equationSlope: 2,
          equationIntercept: -3,
          asks: 'slope',
        }}
      />,
    )

    expect(html).toContain('data-coordinate-comparison')
    expect(html).toContain('data-coordinate-function-table')
    expect(html).toContain('<th')
    expect(html.match(/<tr/g)).toHaveLength(4)
    expect(html).toContain('data-coordinate-function-equation')
    expect(html).toContain('f(x) = 2x − 3')
    expect(html).toContain('aria-label="f of x equals 2x minus 3"')
  })

  it('renders two accessible equations and the ordered-pair legend', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        data={{
          operation: 'system-substitution',
          variables: ['x', 'y'],
          equations: [
            { form: 'isolated', slope: -1, intercept: 3 },
            { form: 'standard', a: 2, b: 1, c: 7 },
          ],
        }}
      />,
    )

    expect(html).toContain('data-coordinate-system-context')
    expect(html).toContain('Answer order: (x, y)')
    expect(html).toContain('y = −x + 3')
    expect(html).toContain('2x + y = 7')
    expect(html).toContain('aria-label="y equals −x plus 3"')
    expect(html).toContain('aria-label="2x plus y equals 7"')
    expect(html.match(/data-coordinate-system-equation=/g)).toHaveLength(2)
  })

  it('writes an isolated horizontal equation without a zero x term', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        data={{
          operation: 'system-substitution',
          variables: ['x', 'y'],
          equations: [
            { form: 'isolated', slope: 0, intercept: -3 },
            { form: 'standard', a: 1, b: 1, c: 2 },
          ],
        }}
      />,
    )

    expect(html).toContain('y = −3')
    expect(html).not.toContain('0x')
  })

  it('derives graphing equations from the same two visible lines', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        plane={{
          x: { min: -5, max: 5, step: 1 },
          y: { min: -5, max: 5, step: 1 },
          points: [],
          lines: [
            { through: [{ x: 0, y: 2 }, { x: 1, y: 4 }] },
            { through: [{ x: 0, y: -1 }, { x: 1, y: 1 }] },
          ],
        }}
        data={{ operation: 'system-by-graphing', variables: ['x', 'y'] }}
      />,
    )

    expect(html).toContain('y = 2x + 2')
    expect(html).toContain('y = 2x − 1')
  })

  it('renders the fixed pass-sales story with matching equations', () => {
    const html = renderToStaticMarkup(
      <CoordinateContext
        data={{
          operation: 'system-words',
          variables: ['x', 'y'],
          frameId: 'pass-sales',
          firstPrice: 12,
          secondPrice: 20,
          totalCount: 7,
          totalRevenue: 104,
        }}
      />,
    )

    expect(html).toContain('data-coordinate-system-story')
    expect(html).toContain('7 passes')
    expect(html).toContain('$12')
    expect(html).toContain('$20')
    expect(html).toContain('x + y = 7')
    expect(html).toContain('12x + 20y = 104')
  })
})
