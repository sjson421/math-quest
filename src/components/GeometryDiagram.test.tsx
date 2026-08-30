import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { GeometryDiagram as GeometryDiagramSpec } from '../lib/geometry-diagram'
import { GeometryDiagram } from './GeometryDiagram'

const render = (diagram: GeometryDiagramSpec) =>
  renderToStaticMarkup(<GeometryDiagram diagram={diagram} />)

describe('GeometryDiagram', () => {
  it.each([
    ['rectangle', { kind: 'geometry', operation: 'area-rectangle', length: 8, width: 3, unit: 'm' }],
    ['triangle', { kind: 'geometry', operation: 'area-triangle', base: 6, height: 4, unit: 'ft' }],
    ['parallelogram', { kind: 'geometry', operation: 'area-parallelogram', base: 9, height: 5, unit: 'in' }],
    ['trapezoid', { kind: 'geometry', operation: 'area-trapezoid', base1: 5, base2: 9, height: 4, unit: 'cm' }],
  ] as const)('renders a labelled %s figure with its perpendicular mark', (_shape, diagram) => {
    const html = render(diagram)

    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${
      diagram.operation === 'area-rectangle'
        ? 'Rectangle with length 8 m and width 3 m'
        : diagram.operation === 'area-triangle'
          ? 'Triangle with base 6 ft and perpendicular height 4 ft'
          : diagram.operation === 'area-parallelogram'
            ? 'Parallelogram with base 9 in and perpendicular height 5 in'
            : 'Trapezoid with bases 5 cm and 9 cm, and perpendicular height 4 cm'
    }"`)
    expect(html).toContain(`data-geometry-shape="${_shape}"`)
    if (_shape !== 'rectangle') expect(html).toContain('data-height-guide')
    expect(html).toContain('data-right-angle')
    expect(html).toContain(`data-geometry-measure="${diagram.operation === 'area-rectangle' ? 'length' : diagram.operation === 'area-trapezoid' ? 'base1' : 'base'}"`)
    expect(html).toContain('data-geometry-formulas')
    expect(html.match(/role="math"/g)).toHaveLength(2)
  })

  it('renders the rectangle corner mark and both rectangle measures', () => {
    const html = render({ kind: 'geometry', operation: 'perimeter', length: 7, width: 4, unit: 'cm' })

    expect(html).toContain('data-right-angle')
    expect(html).toContain('data-geometry-measure="length"')
    expect(html).toContain('>7 cm<')
    expect(html).toContain('data-geometry-measure="width"')
    expect(html).toContain('>4 cm<')
    expect(html).toContain('P equals 2l plus 2w')
    expect(html).toContain('A equals l times w')
  })

  it.each([
    ['radius', { kind: 'geometry', operation: 'circumference', radius: 5, unit: 'cm' }],
    ['diameter', { kind: 'geometry', operation: 'area-circle', diameter: 10, unit: 'm' }],
  ] as const)('distinguishes a circle %s from the other measure', (measure, diagram) => {
    const html = render(diagram)

    expect(html).toContain('data-geometry-shape="circle"')
    expect(html).toContain(`data-${measure}`)
    expect(html).toContain(`data-geometry-measure="${measure}"`)
    expect(html).toContain(`Circle with ${measure} ${measure === 'radius' ? '5 cm' : '10 m'}`)
    expect(html).toContain('C equals pi times d')
    expect(html).toContain('A equals pi times r squared')
    expect(html).not.toContain(`data-${measure === 'radius' ? 'diameter' : 'radius'}`)
  })

  it('gives the figure one accessible name and hides its drawing children', () => {
    const html = render({ kind: 'geometry', operation: 'area-triangle', base: 6, height: 4, unit: 'ft' })

    expect(html.match(/role="img"/g)).toHaveLength(1)
    expect(html.match(/role="math"/g)).toHaveLength(2)
    expect(html).toMatch(/<g aria-hidden="true">[\s\S]*data-right-angle[\s\S]*<\/g>/)
    expect(html).toContain('max-w-full')
    expect(html).toContain('w-64')
    expect(html).toContain('flex-wrap')
    expect(html).not.toContain('<input')
    expect(html).not.toContain('Check')
  })
})
