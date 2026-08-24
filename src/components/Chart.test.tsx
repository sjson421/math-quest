import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Chart } from '../lib/chart'
import { Chart as ChartDisplay } from './Chart'

const bar: Chart = {
  title: 'Monthly output',
  xLabel: 'Month',
  yLabel: 'Units',
  kind: 'bar',
  labels: ['Jan', 'Feb', 'Mar'],
  y: { min: -10, max: 20, step: 10 },
  series: [
    { label: 'North', values: [4, 12, -2] },
    { label: 'South', values: [7, 8, 5] },
  ],
}

const line: Chart = {
  title: 'Monthly trend',
  xLabel: 'Month',
  yLabel: 'Units',
  kind: 'line',
  labels: ['Jan', 'Feb', 'Mar'],
  y: { min: 0, max: 20, step: 5 },
  series: [{ label: 'North', values: [4, 12, 8] }],
}

const scatter: Chart = {
  title: 'Study results',
  xLabel: 'Hours',
  yLabel: 'Score',
  kind: 'scatter',
  x: { min: -10, max: 10, step: 5 },
  y: { min: -10, max: 10, step: 5 },
  series: [
    { label: 'Learners', points: [{ x: -8, y: -5 }, { x: 0, y: 1 }, { x: 8, y: 7 }], trendLine: true },
    { label: 'Tutors', points: [{ x: -7, y: 6 }, { x: 0, y: 2 }, { x: 7, y: -4 }] },
  ],
}

const render = (chart: Chart) => renderToStaticMarkup(<ChartDisplay chart={chart} />)

describe('Chart', () => {
  it('renders one accessible image and one complete table for each chart kind', () => {
    for (const chart of [bar, line, scatter]) {
      const html = render(chart)
      expect(html.match(/role="img"/g), chart.kind).toHaveLength(1)
      expect(html.match(/data-chart-table/g), chart.kind).toHaveLength(1)
      expect(html).toContain(`data-chart-kind="${chart.kind}"`)
      expect(html).toContain('data-chart-axes')
      expect(html).toContain('data-chart-legend')
      expect(html).toContain('data-chart-x-label')
      expect(html).toContain('data-chart-y-label')
      expect(html).toContain('aria-hidden="true"')
      expect(html).not.toContain('<canvas')
      expect(html).not.toContain('http')
    }
  })

  it('renders exact grouped bars and preserves the category/series table order', () => {
    const html = render(bar)

    expect(html.match(/data-chart-bar="true"/g)).toHaveLength(6)
    expect(html.match(/data-chart-category-label/g)).toHaveLength(3)
    expect(html.match(/data-chart-cell/g)).toHaveLength(9)
    expect(html).toContain('data-chart-series-style="pattern"')
    expect(html).toContain('data-chart-legend-style="pattern"')
    expect(html).toContain('>North<')
    expect(html).toContain('>South<')
    expect(html).toContain('<td data-chart-cell="true">Jan</td>')
    expect(html).toContain('<td data-chart-cell="true">−2</td>')
    expect(html).toContain('aria-label="Bar chart &quot;Monthly output&quot;')
  })

  it('renders connected line marks with a second non-color style when present', () => {
    const html = render({
      ...line,
      series: [
        ...line.series,
        { label: 'South', values: [8, 4, 16] },
      ],
    })

    expect(html.match(/data-chart-line="true"/g)).toHaveLength(2)
    expect(html.match(/data-chart-line-point="true"/g)).toHaveLength(6)
    expect(html).toContain('data-chart-series-style="dashed"')
    expect(html).toContain('stroke-dasharray="8 5"')
    expect(html).toContain('data-chart-marker="diamond"')
    expect(html).toContain('data-chart-legend-style="dashed"')
  })

  it('renders scatter points, a derived trend, and a rectangular painted-stroke clip', () => {
    const html = render(scatter)
    const clipId = html.match(/<clipPath id="([^"]+)" data-chart-plot-clip/)?.[1]

    expect(clipId).toBeDefined()
    expect(html.match(/data-chart-point="true"/g)).toHaveLength(6)
    expect(html.match(/data-chart-trend-line="true"/g)).toHaveLength(1)
    expect(html).toContain(`clip-path="url(#${clipId})"`)
    expect(html).toContain('<g data-chart-marks="true">')
    expect(html).toContain('data-chart-marker="diamond"')
    expect(html).toContain('data-chart-legend-marker="true"')
    expect(html.match(/<clipPath /g)).toHaveLength(1)
  })

  it('keeps trend lines aligned with each series stroke style', () => {
    const html = render({
      ...scatter,
      series: scatter.series.map((series) => ({ ...series, trendLine: true })),
    })

    expect(html.match(/data-chart-trend-line="true"/g)).toHaveLength(2)
    expect(html).toContain('data-chart-series-style="trend"')
    expect(html).toContain('data-chart-series-style="trend-dashed"')
    expect(html).toContain('stroke-dasharray="8 5"')
  })

  it('keeps the densest supported labels and ten-interval scales in the responsive view box', () => {
    const labels = ['January', 'February', 'March31', 'April31', 'May2026', 'June2026']
    const dense: Chart = {
      title: '12345678901234567890123456789012',
      xLabel: '1234567890123456',
      yLabel: '1234567890123456',
      kind: 'bar',
      labels,
      y: { min: -900, max: 900, step: 180 },
      series: [
        { label: 'SeriesOne12', values: [-900, -540, -180, 180, 540, 900] },
        { label: 'SeriesTwo12', values: [900, 540, 180, -180, -540, -900] },
      ],
    }
    const html = render(dense)

    expect(html).toContain('viewBox="0 0 360 280"')
    expect(html).toContain('max-w-[23.4375rem]')
    expect(html.match(/data-chart-bar="true"/g)).toHaveLength(12)
    expect(html.match(/data-chart-category-label/g)).toHaveLength(6)
    expect(html.match(/data-chart-y-tick/g)).toHaveLength(11)
    expect(html).toContain('lengthAdjust="spacingAndGlyphs"')
    expect(html).toContain('>January<')
    expect(html).toContain('>−900<')
    expect(html).toContain('>SeriesOne12<')
    expect(html).toContain('>SeriesTwo12<')
  })
})
