import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ShapeDiagram as ShapeDiagramSpec } from '../lib/shape-diagram'
import { ShapeDiagram } from './ShapeDiagram'

const render = (diagram: ShapeDiagramSpec) => renderToStaticMarkup(<ShapeDiagram {...{ diagram }} />)
const parts = (html: string) => html.match(/data-diagram-part=/g) ?? []
const shaded = (html: string) => html.match(/data-shaded="true"/g) ?? []

describe('ShapeDiagram', () => {
  it.each(['bar', 'circle', 'grid'] as const)(
    'renders every declared %s part and only the shaded subset',
    (kind) => {
      const html = render({ kind, parts: 6, shadedParts: 4 })

      expect(parts(html)).toHaveLength(6)
      expect(shaded(html)).toHaveLength(4)
      expect(html).toContain(`data-diagram-kind="${kind}"`)
    },
  )

  it('owns one accessible image name and hides its drawing subtree', () => {
    const html = render({ kind: 'circle', parts: 4, shadedParts: 3 })

    expect(html.match(/role="img"/g)).toHaveLength(1)
    expect(html).toContain('aria-label="circle in 4 parts, 3 shaded"')
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(1)
    expect(html).not.toContain('<canvas')
  })

  it('renders one valid whole-circle part', () => {
    const html = render({ kind: 'circle', parts: 1, shadedParts: 1 })

    expect(parts(html)).toHaveLength(1)
    expect(shaded(html)).toHaveLength(1)
    expect(html).toContain('<circle')
    expect(html).not.toContain('<path')
  })

  it('renders an empty bar without marking a part shaded', () => {
    const html = render({ kind: 'bar', parts: 4, shadedParts: 0 })

    expect(parts(html)).toHaveLength(4)
    expect(shaded(html)).toHaveLength(0)
  })

  it('keeps a dense prime grid as eleven equal declared cells', () => {
    const html = render({ kind: 'grid', parts: 11, shadedParts: 5 })
    const widths = [...html.matchAll(/<rect[^>]*width="([^"]+)"/g)].map((match) =>
      Number(match[1]),
    )

    expect(parts(html)).toHaveLength(11)
    expect(shaded(html)).toHaveLength(5)
    expect(html).toContain('viewBox="0 0 180 120"')
    expect(widths).toHaveLength(11)
    expect(new Set(widths).size).toBe(1)
    expect(widths[0]).toBeGreaterThan(0)
  })
})
