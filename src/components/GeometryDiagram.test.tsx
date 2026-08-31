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

  it.each([
    ['composite', { kind: 'geometry', operation: 'area-composite', outerLength: 9, outerWidth: 7, cutoutLength: 4, cutoutWidth: 3, unit: 'cm' }],
    ['prism', { kind: 'geometry', operation: 'volume-prism', length: 6, width: 4, height: 5, unit: 'cm' }],
    ['cylinder', { kind: 'geometry', operation: 'volume-cylinder', radius: 3, height: 5, unit: 'm' }],
    ['cone', { kind: 'geometry', operation: 'volume-cone', radius: 3, height: 5, unit: 'm' }],
    ['pyramid', { kind: 'geometry', operation: 'volume-pyramid', baseLength: 6, baseWidth: 4, height: 9, unit: 'cm' }],
    ['sphere', { kind: 'geometry', operation: 'volume-sphere', radius: 3, unit: 'ft' }],
  ] as const)('renders a %s figure from its measurements', (_shape, diagram) => {
    const html = render(diagram)

    expect(html).toContain(`data-geometry-operation="${diagram.operation}"`)
    expect(html).toContain('role="img"')
    expect(html).toContain('data-geometry-formulas')
    expect(html).toContain('data-geometry-measure=')
    expect(html).toMatch(/<g aria-hidden="true">[\s\S]*<title>/)
  })

  it('renders all six faces in a surface-area net', () => {
    const html = render({ kind: 'geometry', operation: 'surface-area', length: 5, width: 3, height: 2, unit: 'cm' })

    expect(html.match(/data-net-face=/g)).toHaveLength(6)
    expect(html).toContain('data-net-face="length-width"')
    expect(html).toContain('data-net-face="length-height"')
    expect(html).toContain('data-net-face="width-height"')
    expect(html).toContain('fill="var(--color-cream)"')
    expect(html).toContain('Rectangular-prism net with length 5 cm, width 3 cm, and height 2 cm')
    expect(html).not.toContain('data-geometry-shape="prism"')
  })

  it.each([
    [{ kind: 'geometry', operation: 'pythagorean', missingSide: 'hypotenuse', leg1: 3, leg2: 4, unit: 'ft' }],
    [{ kind: 'geometry', operation: 'pythagorean', missingSide: 'leg', leg: 5, hypotenuse: 13, unit: 'in' }],
  ] as const)('renders a marked right triangle for either missing side', (diagram) => {
    const html = render(diagram)

    expect(html).toContain('data-geometry-shape="right-triangle"')
    expect(html).toContain('data-right-angle')
    expect(html).toContain('data-missing-side')
    expect(html).toContain('c equals the square root of a squared plus b squared')
    expect(html).toContain('a equals the square root of c squared minus b squared')
  })

  it.each([
    [{ kind: 'geometry', operation: 'similar-figures', smallLength: 4, smallWidth: 3, largeKnownSide: 8, knownSide: 'length', unit: 'cm' }],
    [{ kind: 'geometry', operation: 'similar-figures', smallLength: 5, smallWidth: 2, largeKnownSide: 6, knownSide: 'width', unit: 'ft' }],
  ] as const)('renders both corresponding rectangles and one missing side', (diagram) => {
    const html = render(diagram)

    expect(html).toContain('data-geometry-operation="similar-figures"')
    expect(html.match(/data-geometry-shape="similar-(?:small|large)-rectangle"/g)).toHaveLength(2)
    expect(html.match(/data-geometry-measure=/g)).toHaveLength(3)
    expect(html).toContain('a = ')
    expect(html).toContain('b = ')
    expect(html).toContain(diagram.knownSide === 'length' ? 'A = ' : 'B = ')
    expect(html).toContain(diagram.knownSide === 'length' ? 'B = ?' : 'A = ?')
    if (diagram.knownSide === 'length') {
      expect(html).toMatch(/<text x="178" y="26"[^>]*data-geometry-measure="largeKnownSide">A = 8 cm<\/text>/)
      expect(html).toMatch(/<text x="234" y="73"[^>]*data-missing-side="true">B = \?<\/text>/)
    } else {
      expect(html).toMatch(/<text x="234" y="73"[^>]*data-geometry-measure="largeKnownSide">B = 6 ft<\/text>/)
      expect(html).toMatch(/<text x="178" y="26"[^>]*data-missing-side="true">A = \?<\/text>/)
    }
    expect(html).toContain('mq-math-fraction')
    expect(html).toContain('a over A equals b over B')
    expect(html).toContain('a over b equals A over B')
    expect(html).toContain('class="block w-64 max-w-full h-auto"')
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*>\s*<g aria-hidden="true">[\s\S]*data-similar-pair/)
    expect(html.match(/role="img"/g)).toHaveLength(1)
    expect(html.match(/role="math"/g)).toHaveLength(2)
  })
})
