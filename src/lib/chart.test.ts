import { describe, expect, it } from 'vitest'
import {
  assertChart,
  categoryX,
  chartAccessibleName,
  chartLearnerText,
  chartSourceValues,
  chartTable,
  chartTicks,
  chartValueLabel,
  groupedBarBounds,
  scatterTrendSegment,
  type Chart,
} from './chart'

const categorical = (): Extract<Chart, { kind: 'bar' }> => ({
  title: 'Quarterly totals',
  xLabel: 'Quarter',
  yLabel: 'Units',
  kind: 'bar',
  labels: ['Q1', 'Q2', 'Q3'],
  y: { min: -10, max: 20, step: 10 },
  series: [
    { label: 'North', values: [4, 12, -2] },
    { label: 'South', values: [7, 8, 5] },
  ],
})

const lineCategorical = (): Extract<Chart, { kind: 'line' }> => ({ ...categorical(), kind: 'line' })

const scatter = (overrides: Partial<Extract<Chart, { kind: 'scatter' }>> = {}): Extract<Chart, { kind: 'scatter' }> => ({
  title: 'Study hours',
  xLabel: 'Hours',
  yLabel: 'Score',
  kind: 'scatter',
  x: { min: -10, max: 10, step: 5 },
  y: { min: -10, max: 10, step: 5 },
  series: [{
    label: 'Learners',
    points: [{ x: -10, y: -8 }, { x: 0, y: 0 }, { x: 10, y: 8 }],
    trendLine: true,
  }],
  ...overrides,
})

describe('chart data', () => {
  it('accepts complete categorical and scatter declarations', () => {
    expect(() => assertChart(categorical())).not.toThrow()
    expect(() => assertChart(lineCategorical())).not.toThrow()
    expect(() => assertChart(scatter())).not.toThrow()
  })

  it('rejects labels, counts, alignment, and scales that cannot render truthfully', () => {
    const cases: readonly [string, Chart, RegExp][] = [
      ['empty title', { ...categorical(), title: '   ' }, /title must be a non-empty label/],
      ['long title', { ...categorical(), title: '123456789012345678901234567890123' }, /title must be at most 32/],
      ['duplicate categories', { ...categorical(), labels: ['Q1', 'Q1', 'Q3'] }, /category 2 duplicates/],
      ['duplicate series', { ...categorical(), series: [{ label: 'Same', values: [1, 2, 3] }, { label: 'Same', values: [2, 3, 4] }] }, /series 2 duplicates/],
      ['mismatched values', { ...categorical(), series: [{ label: 'North', values: [1, 2] }] }, /series 1 must have one value/],
      ['invalid interval count', { ...categorical(), y: { min: 0, max: 1, step: 1 } }, /from 2 through 10 intervals/],
      ['bar without zero', { ...categorical(), y: { min: 1, max: 21, step: 5 } } as Chart, /bar y-scale must include zero/],
      ['out-of-range value', { ...categorical(), series: [{ label: 'North', values: [4, 12, 21] }] }, /values\[2\] must lie inside/],
      ['too few scatter points', { ...scatter(), series: [{ label: 'Learners', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] }, /from 3 through 12 points/],
      ['trend without x variation', { ...scatter(), series: [{ label: 'Learners', points: [{ x: 0, y: -2 }, { x: 0, y: 0 }, { x: 0, y: 2 }], trendLine: true }] }, /trend line needs distinct x values/],
    ]

    for (const [name, chart, message] of cases) {
      expect(() => assertChart(chart), name).toThrow(message)
    }
  })

  it('rejects sparse source arrays and malformed trend flags', () => {
    const labels = new Array<string>(3)
    labels[0] = 'Q1'
    labels[2] = 'Q3'
    expect(() => assertChart({ ...categorical(), labels })).toThrow('categorical chart needs')

    const values = new Array<number>(3)
    values[0] = 1
    values[2] = 3
    expect(() => assertChart({
      ...categorical(),
      series: [{ label: 'North', values }],
    })).toThrow('series 1 must have one value')

    const points = new Array<{ x: number; y: number }>(3)
    points[0] = { x: -1, y: -1 }
    points[2] = { x: 1, y: 1 }
    expect(() => assertChart({
      ...scatter(),
      series: [{ label: 'Learners', points }],
    })).toThrow('scatter series 1 needs')

    const malformedTrend = {
      ...scatter(),
      series: [{ ...scatter().series[0], trendLine: 'yes' }],
    } as unknown as Chart
    expect(() => assertChart(malformedTrend)).toThrow('trendLine must be boolean')
  })

  it('derives exact ticks, typographic labels, transforms, and grouped bar bounds', () => {
    expect(chartTicks({ min: -6, max: 6, step: 2 })).toEqual([-6, -4, -2, 0, 2, 4, 6])
    expect(chartValueLabel(-12)).toBe('−12')
    expect(categoryX(0, 3)).toBeCloseTo(104)

    const first = groupedBarBounds(categorical(), 0, 0)
    const second = groupedBarBounds(categorical(), 0, 1)
    expect(first.x).toBeLessThan(second.x)
    expect(first.height).toBeGreaterThan(0)
    expect(groupedBarBounds(categorical(), 2, 0).y).toBeGreaterThan(groupedBarBounds(categorical(), 1, 0).y)
  })

  it('derives a single complete accessible name and table from source data', () => {
    const chart = lineCategorical()
    expect(chartAccessibleName(chart)).toContain('Line chart "Quarterly totals"')
    expect(chartAccessibleName(chart)).toContain('x-axis Quarter')
    expect(chartAccessibleName(chart)).toContain('series North and South')
    expect(chartLearnerText(chart)).toEqual([
      'Quarterly totals', 'Quarter', 'Units', 'Q1', 'Q2', 'Q3', 'North', 'South',
      '4', '12', '−2', '7', '8', '5',
    ])
    expect(chartTable(chart)).toEqual({
      caption: 'Data for Quarterly totals',
      headers: ['Category', 'North', 'South'],
      rows: [['Q1', '4', '7'], ['Q2', '12', '8'], ['Q3', '−2', '5']],
    })
    expect(chartSourceValues(chart)).toEqual([-10, 20, 10, 4, 12, -2, 7, 8, 5])
  })
})

describe('scatter trend geometry', () => {
  it.each([
    ['rising', [{ x: -10, y: -8 }, { x: 0, y: 0 }, { x: 10, y: 8 }], 'horizontal edges'],
    ['falling', [{ x: -10, y: 8 }, { x: 0, y: 0 }, { x: 10, y: -8 }], 'horizontal edges'],
    ['horizontal', [{ x: -10, y: 3 }, { x: 0, y: 3 }, { x: 10, y: 3 }], 'horizontal edges'],
    ['edge-only', [{ x: -10, y: -10 }, { x: 0, y: -10 }, { x: 10, y: -10 }], 'horizontal edges'],
  ] as const)('fits a %s trend to the plot bounds', (_name, points, _edges) => {
    const segment = scatter({ series: [{ label: 'Learners', points, trendLine: true }] })
    const derived = scatterTrendSegment(segment, 0)

    expect(derived).toBeDefined()
    if (!derived) throw new Error('expected a trend segment')
    const [first, second] = derived
    expect(first.x).toBeCloseTo(56)
    expect(second.x).toBeCloseTo(344)
    expect(first.y).toBeGreaterThanOrEqual(52)
    expect(first.y).toBeLessThanOrEqual(224)
    expect(second.y).toBeGreaterThanOrEqual(52)
    expect(second.y).toBeLessThanOrEqual(224)
  })

  it('clips a steep trend against the top and bottom edges', () => {
    const chart = scatter({
      series: [{
        label: 'Learners',
        points: [{ x: -1, y: -10 }, { x: 0, y: 10 }, { x: 1, y: 10 }],
        trendLine: true,
      }],
    })
    const derived = scatterTrendSegment(chart, 0)

    expect(derived).toBeDefined()
    if (!derived) throw new Error('expected a trend segment')
    const [first, second] = derived
    expect(first.y).toBeCloseTo(224)
    expect(second.y).toBeCloseTo(52)
    expect(first.x).toBeGreaterThanOrEqual(56)
    expect(second.x).toBeLessThanOrEqual(344)
  })
})
