/** Structured chart data and the pure geometry shared by every renderer. */

export type ChartScale = {
  min: number
  max: number
  step: number
}

export type CategoricalSeries = {
  label: string
  values: readonly number[]
}

export type ScatterPoint = {
  x: number
  y: number
}

export type ScatterSeries = {
  label: string
  points: readonly ScatterPoint[]
  trendLine?: boolean
}

type CategoricalChartBase = {
  title: string
  xLabel: string
  yLabel: string
  labels: readonly string[]
  y: ChartScale
  series: readonly CategoricalSeries[]
}

export type BarChart = CategoricalChartBase & { kind: 'bar' }
export type LineChart = CategoricalChartBase & { kind: 'line' }
export type CategoricalChart = BarChart | LineChart

export type ScatterChart = {
  title: string
  xLabel: string
  yLabel: string
  kind: 'scatter'
  x: ChartScale
  y: ChartScale
  series: readonly ScatterSeries[]
}

export type Chart = CategoricalChart | ScatterChart

export type ChartPlot = {
  left: number
  top: number
  width: number
  height: number
}

export type ChartPoint = {
  x: number
  y: number
}

export type ChartBarBounds = ChartPoint & {
  width: number
  height: number
}

export type ChartTable = {
  caption: string
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}

export const CHART_VIEWBOX = { width: 360, height: 280 } as const
export const CHART_PLOT: ChartPlot = { left: 56, top: 52, width: 288, height: 172 }

const MIN_VALUE = -999
const MAX_VALUE = 999
const MAX_TITLE_LENGTH = 32
const MAX_AXIS_LENGTH = 16
const MAX_CATEGORY_LENGTH = 8
const MAX_SERIES_LENGTH = 12

function assertChartNumber(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < MIN_VALUE || value > MAX_VALUE) {
    throw new Error(`chart: ${field} must be a safe integer from ${MIN_VALUE} through ${MAX_VALUE}`)
  }
}

function assertText(value: string, field: string, maxLength: number): void {
  if (typeof value !== 'string' || value.length === 0 || value.trim().length === 0) {
    throw new Error(`chart: ${field} must be a non-empty label`)
  }
  if (value !== value.trim()) {
    throw new Error(`chart: ${field} must be trimmed`)
  }
  if (value.length > maxLength) {
    throw new Error(`chart: ${field} must be at most ${maxLength} characters`)
  }
}

function assertDistinctLabels(labels: readonly string[], field: string): void {
  const seen = new Set<string>()
  labels.forEach((label, index) => {
    if (seen.has(label)) throw new Error(`chart: ${field} ${index + 1} duplicates an earlier label`)
    seen.add(label)
  })
}

function isList<T>(value: unknown): value is readonly T[] {
  if (!Array.isArray(value)) return false
  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) return false
  }
  return true
}

function assertScale(scale: ChartScale, field: string): void {
  if (!scale || typeof scale !== 'object') throw new Error(`chart: ${field} must be a scale`)
  assertChartNumber(scale.min, `${field}.min`)
  assertChartNumber(scale.max, `${field}.max`)
  assertChartNumber(scale.step, `${field}.step`)

  if (scale.min >= scale.max) throw new Error(`chart: ${field} must have ordered bounds`)
  if (scale.step <= 0) throw new Error(`chart: ${field}.step must be positive`)

  const span = scale.max - scale.min
  if (span % scale.step !== 0) {
    throw new Error(`chart: ${field}.step must divide the scale span`)
  }

  const intervals = span / scale.step
  if (intervals < 2 || intervals > 10) {
    throw new Error(`chart: ${field} must have from 2 through 10 intervals`)
  }
}

function assertInside(value: number, scale: ChartScale, field: string): void {
  assertChartNumber(value, field)
  if (value < scale.min || value > scale.max) {
    throw new Error(`chart: ${field} must lie inside its scale`)
  }
}

function assertSeriesLabels(series: readonly { label: string }[]): void {
  series.forEach((item, index) => assertText(item.label, `series ${index + 1}.label`, MAX_SERIES_LENGTH))
  assertDistinctLabels(series.map((item) => item.label), 'series')
}

/** Refuse chart data that could render a different or unreadable chart. */
export function assertChart(chart: Chart): void {
  if (!chart || typeof chart !== 'object') throw new Error('chart: declaration is required')
  assertText(chart.title, 'title', MAX_TITLE_LENGTH)
  assertText(chart.xLabel, 'xLabel', MAX_AXIS_LENGTH)
  assertText(chart.yLabel, 'yLabel', MAX_AXIS_LENGTH)
  const kind = (chart as { kind: unknown }).kind
  if (kind !== 'bar' && kind !== 'line' && kind !== 'scatter') {
    throw new Error(`chart: unsupported kind ${String(kind)}`)
  }

  if (chart.kind !== 'scatter') {
    if (!isList<string>(chart.labels) || chart.labels.length < 2 || chart.labels.length > 6) {
      throw new Error('chart: categorical chart needs from 2 through 6 labels')
    }
    chart.labels.forEach((label, index) => assertText(label, `label ${index + 1}`, MAX_CATEGORY_LENGTH))
    assertDistinctLabels(chart.labels, 'category')

    if (!isList<CategoricalSeries>(chart.series) || chart.series.length < 1 || chart.series.length > 2) {
      throw new Error('chart: chart needs one or two series')
    }
    assertSeriesLabels(chart.series)
    assertScale(chart.y, 'y-scale')
    if (chart.kind === 'bar' && (chart.y.min > 0 || chart.y.max < 0)) {
      throw new Error('chart: bar y-scale must include zero')
    }

    chart.series.forEach((series, seriesIndex) => {
      if (!isList<number>(series.values) || series.values.length !== chart.labels.length) {
        throw new Error(`chart: series ${seriesIndex + 1} must have one value per label`)
      }
      series.values.forEach((value, valueIndex) =>
        assertInside(value, chart.y, `series ${seriesIndex + 1}.values[${valueIndex}]`),
      )
    })
    return
  }

  if (!isList<ScatterSeries>(chart.series) || chart.series.length < 1 || chart.series.length > 2) {
    throw new Error('chart: chart needs one or two series')
  }
  assertSeriesLabels(chart.series)
  assertScale(chart.x, 'x-scale')
  assertScale(chart.y, 'y-scale')

  chart.series.forEach((series, seriesIndex) => {
    if (!isList<ScatterPoint>(series.points) || series.points.length < 3 || series.points.length > 12) {
      throw new Error(`chart: scatter series ${seriesIndex + 1} needs from 3 through 12 points`)
    }
    series.points.forEach((point, pointIndex) => {
      assertInside(point.x, chart.x, `series ${seriesIndex + 1}.points[${pointIndex}].x`)
      assertInside(point.y, chart.y, `series ${seriesIndex + 1}.points[${pointIndex}].y`)
    })
    if (series.trendLine !== undefined && typeof series.trendLine !== 'boolean') {
      throw new Error(`chart: series ${seriesIndex + 1}.trendLine must be boolean`)
    }
    if (series.trendLine && new Set(series.points.map((point) => point.x)).size < 2) {
      throw new Error(`chart: series ${seriesIndex + 1} trend line needs distinct x values`)
    }
  })
}

/** Every exact tick in declaration order. */
export function chartTicks(scale: ChartScale): number[] {
  assertScale(scale, 'scale')
  const count = (scale.max - scale.min) / scale.step
  return Array.from({ length: count + 1 }, (_, index) => scale.min + index * scale.step)
}

/** Numeric labels use the same typographic minus as the rest of the course. */
export function chartValueLabel(value: number): string {
  return String(Object.is(value, -0) ? 0 : value).replace('-', '−')
}

function kindLabel(kind: Chart['kind']): string {
  switch (kind) {
    case 'bar':
      return 'Bar'
    case 'line':
      return 'Line'
    case 'scatter':
      return 'Scatter'
    default: {
      const unhandled: never = kind
      throw new Error(`Unhandled chart kind: ${unhandled}`)
    }
  }
}

function joined(labels: readonly string[]): string {
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`
}

function scaleLabel(label: string, scale: ChartScale): string {
  return `${label} from ${chartValueLabel(scale.min)} to ${chartValueLabel(scale.max)} by ${chartValueLabel(scale.step)}`
}

/** The one image name shared by the visual and non-visual chart paths. */
export function chartAccessibleName(chart: Chart): string {
  assertChart(chart)
  const x = chart.kind === 'scatter'
    ? `x-axis ${scaleLabel(chart.xLabel, chart.x)}`
    : `x-axis ${chart.xLabel}`
  const y = `y-axis ${scaleLabel(chart.yLabel, chart.y)}`
  return `${kindLabel(chart.kind)} chart "${chart.title}", ${x}, ${y}, series ${joined(chart.series.map((series) => series.label))}`
}

/** Learner-facing chart strings used by the generated-content gate. */
export function chartLearnerText(chart: Chart): string[] {
  assertChart(chart)
  const labels = chart.kind === 'scatter' ? [] : [...chart.labels]
  const values = chart.kind === 'scatter'
    ? chart.series.flatMap((series) => series.points.flatMap((point) => [chartValueLabel(point.x), chartValueLabel(point.y)]))
    : chart.series.flatMap((series) => series.values.map(chartValueLabel))
  return [chart.title, chart.xLabel, chart.yLabel, ...labels, ...chart.series.map((series) => series.label), ...values]
}

/** A complete semantic table generated from the same values as the marks. */
export function chartTable(chart: Chart): ChartTable {
  assertChart(chart)
  if (chart.kind === 'bar' || chart.kind === 'line') {
    return {
      caption: `Data for ${chart.title}`,
      headers: ['Category', ...chart.series.map((series) => series.label)],
      rows: chart.labels.map((label, index) => [
        label,
        ...chart.series.map((series) => chartValueLabel(series.values[index])),
      ]),
    }
  }

  return {
    caption: `Data for ${chart.title}`,
    headers: ['Series', 'Point', 'x', 'y'],
    rows: chart.series.flatMap((series) =>
      series.points.map((point, index) => [
        series.label,
        String(index + 1),
        chartValueLabel(point.x),
        chartValueLabel(point.y),
      ]),
    ),
  }
}

/** Numeric source fields used to measure a future generator's difficulty. */
export function chartSourceValues(chart: Chart): number[] {
  assertChart(chart)
  if (chart.kind === 'bar' || chart.kind === 'line') {
    return [
      chart.y.min,
      chart.y.max,
      chart.y.step,
      ...chart.series.flatMap((series) => series.values),
    ]
  }

  return [
    chart.x.min,
    chart.x.max,
    chart.x.step,
    chart.y.min,
    chart.y.max,
    chart.y.step,
    ...chart.series.flatMap((series) => series.points.flatMap((point) => [point.x, point.y])),
  ]
}

export function chartX(value: number, scale: ChartScale, plot: ChartPlot = CHART_PLOT): number {
  return plot.left + ((value - scale.min) / (scale.max - scale.min)) * plot.width
}

export function chartY(value: number, scale: ChartScale, plot: ChartPlot = CHART_PLOT): number {
  return plot.top + ((scale.max - value) / (scale.max - scale.min)) * plot.height
}

export function categoryX(index: number, count: number, plot: ChartPlot = CHART_PLOT): number {
  return plot.left + ((index + 0.5) / count) * plot.width
}

export function groupedBarBounds(
  chart: Extract<Chart, { kind: 'bar' }>,
  categoryIndex: number,
  seriesIndex: number,
  plot: ChartPlot = CHART_PLOT,
): ChartBarBounds {
  assertChart(chart)
  const categoryWidth = plot.width / chart.labels.length
  const groupWidth = categoryWidth * 0.8
  const barWidth = (groupWidth / chart.series.length) * 0.82
  const gap = (groupWidth - barWidth * chart.series.length) / (chart.series.length + 1)
  const x = plot.left + categoryIndex * categoryWidth + (categoryWidth - groupWidth) / 2 + gap + seriesIndex * (barWidth + gap)
  const baseline = chartY(0, chart.y, plot)
  const value = chart.series[seriesIndex].values[categoryIndex]
  const valueY = chartY(value, chart.y, plot)
  return {
    x,
    y: Math.min(baseline, valueY),
    width: barWidth,
    height: Math.abs(valueY - baseline),
  }
}

export function categoricalPoint(
  chart: Extract<Chart, { kind: 'line' }>,
  categoryIndex: number,
  seriesIndex: number,
  plot: ChartPlot = CHART_PLOT,
): ChartPoint {
  assertChart(chart)
  return {
    x: categoryX(categoryIndex, chart.labels.length, plot),
    y: chartY(chart.series[seriesIndex].values[categoryIndex], chart.y, plot),
  }
}

export function scatterPoint(
  chart: Extract<Chart, { kind: 'scatter' }>,
  point: ScatterPoint,
  plot: ChartPlot = CHART_PLOT,
): ChartPoint {
  assertChart(chart)
  return { x: chartX(point.x, chart.x, plot), y: chartY(point.y, chart.y, plot) }
}

type DataBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function addClippedPoint(points: ChartPoint[], point: ChartPoint, bounds: DataBounds): void {
  const epsilon = 1e-9
  if (
    point.x < bounds.minX - epsilon || point.x > bounds.maxX + epsilon ||
    point.y < bounds.minY - epsilon || point.y > bounds.maxY + epsilon
  ) return

  const clamped = {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, point.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, point.y)),
  }
  if (!points.some((candidate) => Math.abs(candidate.x - clamped.x) < epsilon && Math.abs(candidate.y - clamped.y) < epsilon)) {
    points.push(clamped)
  }
}

function clippedTrendData(
  slope: number,
  intercept: number,
  xScale: ChartScale,
  yScale: ChartScale,
): [ChartPoint, ChartPoint] {
  const bounds: DataBounds = {
    minX: xScale.min,
    maxX: xScale.max,
    minY: yScale.min,
    maxY: yScale.max,
  }
  const intersections: ChartPoint[] = []
  addClippedPoint(intersections, { x: bounds.minX, y: slope * bounds.minX + intercept }, bounds)
  addClippedPoint(intersections, { x: bounds.maxX, y: slope * bounds.maxX + intercept }, bounds)

  if (slope !== 0) {
    addClippedPoint(intersections, { x: (bounds.minY - intercept) / slope, y: bounds.minY }, bounds)
    addClippedPoint(intersections, { x: (bounds.maxY - intercept) / slope, y: bounds.maxY }, bounds)
  } else {
    addClippedPoint(intersections, { x: bounds.minX, y: intercept }, bounds)
    addClippedPoint(intersections, { x: bounds.maxX, y: intercept }, bounds)
  }

  intersections.sort((left, right) => left.x - right.x || left.y - right.y)
  if (intersections.length < 2) throw new Error('chart: trend line has no visible segment')
  return [intersections[0], intersections.at(-1) as ChartPoint]
}

/** Least-squares trend geometry, clipped to all four declared plot edges. */
export function scatterTrendSegment(
  chart: Extract<Chart, { kind: 'scatter' }>,
  seriesIndex: number,
  plot: ChartPlot = CHART_PLOT,
): [ChartPoint, ChartPoint] | undefined {
  assertChart(chart)
  const series = chart.series[seriesIndex]
  if (!series.trendLine) return undefined

  const meanX = series.points.reduce((sum, point) => sum + point.x, 0) / series.points.length
  const meanY = series.points.reduce((sum, point) => sum + point.y, 0) / series.points.length
  const denominator = series.points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  if (denominator === 0) throw new Error(`chart: series ${seriesIndex + 1} trend line needs distinct x values`)

  const slope = series.points.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  ) / denominator
  const intercept = meanY - slope * meanX
  const [first, second] = clippedTrendData(slope, intercept, chart.x, chart.y)
  return [
    { x: chartX(first.x, chart.x, plot), y: chartY(first.y, chart.y, plot) },
    { x: chartX(second.x, chart.x, plot), y: chartY(second.y, chart.y, plot) },
  ]
}
