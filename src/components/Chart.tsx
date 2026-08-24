import { useId } from 'react'
import {
  categoryX,
  chartAccessibleName,
  chartTable,
  chartX,
  chartY,
  chartTicks,
  chartValueLabel,
  CHART_PLOT,
  CHART_VIEWBOX,
  categoricalPoint,
  groupedBarBounds,
  scatterPoint,
  scatterTrendSegment,
  type Chart as ChartSpec,
  type ChartPoint,
} from '../lib/chart'

const AXIS = 'var(--color-ink-soft)'
const GRID = 'var(--color-cream-deep)'
const COLORS = ['var(--color-blossom-deep)', 'var(--color-lilac-deep)'] as const

type SeriesStyle = {
  color: string
  marker: 'circle' | 'diamond'
  dash?: string
}

function seriesStyle(index: number): SeriesStyle {
  return index === 0
    ? { color: COLORS[0], marker: 'circle' }
    : { color: COLORS[1], marker: 'diamond', dash: '8 5' }
}

/** One responsive SVG composition and one semantic table for every chart kind. */
export function Chart({ chart }: { chart: ChartSpec }) {
  const name = chartAccessibleName(chart)
  const table = chartTable(chart)
  const rawId = useId()
  const id = `chart-${rawId.replace(/[^a-zA-Z0-9_-]/g, '') || 'plot'}`
  const clipId = `${id}-plot`
  const patternId = `${id}-series-two`

  return (
    <figure
      className="flex w-full max-w-[23.4375rem] flex-col items-center"
      data-chart-kind={chart.kind}
    >
      <svg
        viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}
        className="block w-full max-w-[23.4375rem] h-auto"
        role="img"
        aria-label={name}
        data-chart-image
      >
        <g aria-hidden="true">
          <defs>
            <clipPath id={clipId} data-chart-plot-clip>
              <rect
                x={CHART_PLOT.left}
                y={CHART_PLOT.top}
                width={CHART_PLOT.width}
                height={CHART_PLOT.height}
              />
            </clipPath>
            <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="var(--color-lilac-soft)" />
              <path d="M -2 2 L 2 -2 M 0 8 L 8 0 M 6 10 L 10 6" stroke={COLORS[1]} strokeWidth="1.5" />
            </pattern>
          </defs>

          <text x={CHART_VIEWBOX.width / 2} y="16" textAnchor="middle" fontSize="12" fontWeight="700" data-chart-title>
            {chart.title}
          </text>
          <ChartAxes chart={chart} />
          <g data-chart-marks>
          <ChartMarks chart={chart} clipId={clipId} patternId={patternId} />
          </g>
          <ChartLegend chart={chart} patternId={patternId} />
        </g>
      </svg>

      <table className="sr-only" data-chart-table>
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            {table.headers.map((header, headerIndex) => (
              <th key={`${headerIndex}-${header}`} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} data-chart-cell>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

function ChartAxes({ chart }: { chart: ChartSpec }) {
  const yTicks = chartTicks(chart.y)
  const xTicks = chart.kind === 'scatter' ? chartTicks(chart.x) : []
  const categoryLabelWidth = chart.kind === 'scatter' || chart.labels.length < 4
    ? undefined
    : (CHART_PLOT.width / chart.labels.length) * 0.82

  return (
    <g data-chart-axes>
      <line
        x1={CHART_PLOT.left}
        y1={CHART_PLOT.top + CHART_PLOT.height}
        x2={CHART_PLOT.left + CHART_PLOT.width}
        y2={CHART_PLOT.top + CHART_PLOT.height}
        stroke={AXIS}
        strokeWidth="1.5"
        data-chart-axis="x"
      />
      <line
        x1={CHART_PLOT.left}
        y1={CHART_PLOT.top}
        x2={CHART_PLOT.left}
        y2={CHART_PLOT.top + CHART_PLOT.height}
        stroke={AXIS}
        strokeWidth="1.5"
        data-chart-axis="y"
      />

      {yTicks.map((tick) => {
        const y = chartY(tick, chart.y)
        return (
          <g key={`y-${tick}`} data-chart-tick="y">
            <line
              x1={CHART_PLOT.left}
              y1={y}
              x2={CHART_PLOT.left + CHART_PLOT.width}
              y2={y}
              stroke={GRID}
              strokeWidth="1"
              data-chart-gridline="y"
            />
            <text
              x={CHART_PLOT.left - 7}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="9"
              fill={AXIS}
              data-chart-y-tick
            >
              {chartValueLabel(tick)}
            </text>
          </g>
        )
      })}

      {chart.kind === 'scatter'
        ? xTicks.map((tick) => {
            const x = chartX(tick, chart.x)
            return (
              <g key={`x-${tick}`} data-chart-tick="x">
                <line
                  x1={x}
                  y1={CHART_PLOT.top}
                  x2={x}
                  y2={CHART_PLOT.top + CHART_PLOT.height}
                  stroke={GRID}
                  strokeWidth="1"
                  data-chart-gridline="x"
                />
                <text
                  x={x}
                  y={CHART_PLOT.top + CHART_PLOT.height + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill={AXIS}
                  data-chart-x-tick
                >
                  {chartValueLabel(tick)}
                </text>
              </g>
            )
          })
        : chart.labels.map((label, index) => (
            <text
              key={label}
              x={categoryX(index, chart.labels.length)}
              y={CHART_PLOT.top + CHART_PLOT.height + 15}
              textAnchor="middle"
              fontSize="9"
              fill={AXIS}
              textLength={categoryLabelWidth}
              lengthAdjust={categoryLabelWidth ? 'spacingAndGlyphs' : undefined}
              data-chart-category-label
            >
              {label}
            </text>
          ))}

      <text
        x={CHART_PLOT.left + CHART_PLOT.width / 2}
        y={CHART_VIEWBOX.height - 7}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={AXIS}
        data-chart-x-label
      >
        {chart.xLabel}
      </text>
      <text
        transform={`translate(14 ${CHART_PLOT.top + CHART_PLOT.height / 2}) rotate(-90)`}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={AXIS}
        data-chart-y-label
      >
        {chart.yLabel}
      </text>
    </g>
  )
}

function ChartMarks({ chart, clipId, patternId }: { chart: ChartSpec; clipId: string; patternId: string }) {
  switch (chart.kind) {
    case 'bar':
      return (
        <g data-chart-bars>
          {chart.labels.flatMap((_, categoryIndex) =>
            chart.series.map((_, seriesIndex) => {
              const bounds = groupedBarBounds(chart, categoryIndex, seriesIndex)
              const style = seriesStyle(seriesIndex)
              return (
                <rect
                  key={`${categoryIndex}-${seriesIndex}`}
                  x={bounds.x}
                  y={bounds.y}
                  width={bounds.width}
                  height={bounds.height}
                  fill={seriesIndex === 0 ? style.color : `url(#${patternId})`}
                  stroke={style.color}
                  strokeWidth="1"
                  data-chart-bar
                  data-chart-series={seriesIndex + 1}
                  data-chart-series-style={seriesIndex === 0 ? 'solid' : 'pattern'}
                />
              )
            }),
          )}
        </g>
      )
    case 'line':
      return (
        <g data-chart-lines>
          {chart.series.map((series, seriesIndex) => {
            const style = seriesStyle(seriesIndex)
            const points = chart.labels.map((_, categoryIndex) => categoricalPoint(chart, categoryIndex, seriesIndex))
            return (
              <g key={series.label} data-chart-series={seriesIndex + 1}>
                <polyline
                  points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke={style.color}
                  strokeWidth="3"
                  strokeDasharray={style.dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-chart-line
                  data-chart-series-style={seriesIndex === 0 ? 'solid' : 'dashed'}
                />
                {points.map((point, pointIndex) => (
                  <ChartMarker
                    key={pointIndex}
                    point={point}
                    style={style}
                    dataAttribute="data-chart-line-point"
                  />
                ))}
              </g>
            )
          })}
        </g>
      )
    case 'scatter':
      return (
        <g data-chart-scatter>
          {chart.series.map((series, seriesIndex) => {
            const style = seriesStyle(seriesIndex)
            const trend = scatterTrendSegment(chart, seriesIndex)
            return (
              <g key={series.label} data-chart-series={seriesIndex + 1}>
                {trend && (
                  <line
                    x1={trend[0].x}
                    y1={trend[0].y}
                    x2={trend[1].x}
                    y2={trend[1].y}
                    stroke={style.color}
                    strokeWidth="2"
                    strokeDasharray={style.dash}
                    clipPath={`url(#${clipId})`}
                    data-chart-trend-line
                    data-chart-series-style={seriesIndex === 0 ? 'trend' : 'trend-dashed'}
                  />
                )}
                {series.points.map((point, pointIndex) => (
                  <ChartMarker
                    key={pointIndex}
                    point={scatterPoint(chart, point)}
                    style={style}
                    dataAttribute="data-chart-point"
                  />
                ))}
              </g>
            )
          })}
        </g>
      )
    default: {
      const unhandled: never = chart
      throw new Error(`Unhandled chart: ${JSON.stringify(unhandled)}`)
    }
  }
}

function ChartMarker({
  point,
  style,
  dataAttribute,
}: {
  point: ChartPoint
  style: SeriesStyle
  dataAttribute: 'data-chart-line-point' | 'data-chart-point' | 'data-chart-legend-marker'
}) {
  if (style.marker === 'circle') {
    return (
      <circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill="var(--color-cream)"
        stroke={style.color}
        strokeWidth="2.5"
        {...{ [dataAttribute]: true }}
        data-chart-marker="circle"
      />
    )
  }

  const size = 5
  return (
    <path
      d={`M ${point.x} ${point.y - size} L ${point.x + size} ${point.y} L ${point.x} ${point.y + size} L ${point.x - size} ${point.y} Z`}
      fill="var(--color-cream)"
      stroke={style.color}
      strokeWidth="2.5"
      {...{ [dataAttribute]: true }}
      data-chart-marker="diamond"
    />
  )
}

function ChartLegend({ chart, patternId }: { chart: ChartSpec; patternId: string }) {
  return (
    <g data-chart-legend>
      {chart.series.map((series, seriesIndex) => {
        const style = seriesStyle(seriesIndex)
        const x = CHART_PLOT.left + seriesIndex * 145
        return (
          <g key={series.label} transform={`translate(${x} 34)`} data-chart-legend-item>
            {chart.kind === 'bar' ? (
              <rect
                x="0"
                y="-8"
                width="12"
                height="12"
                fill={seriesIndex === 0 ? style.color : `url(#${patternId})`}
                stroke={style.color}
                data-chart-legend-style={seriesIndex === 0 ? 'solid' : 'pattern'}
              />
            ) : (
              <>
                <line
                  x1="0"
                  y1="-2"
                  x2="20"
                  y2="-2"
                  stroke={style.color}
                  strokeWidth="2.5"
                  strokeDasharray={style.dash}
                  data-chart-legend-style={seriesIndex === 0 ? 'solid' : 'dashed'}
                />
                <ChartMarker point={{ x: 10, y: -2 }} style={style} dataAttribute="data-chart-legend-marker" />
              </>
            )}
            <text x={chart.kind === 'bar' ? 18 : 26} y="2" fontSize="9" fill={AXIS} data-chart-legend-label>
              {series.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
