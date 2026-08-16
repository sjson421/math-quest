import { useId, useRef, type KeyboardEvent } from 'react'
import {
  axisValues,
  clipCoordinateLine,
  coordinateEntry,
  coordinateLabel,
  coordinatePlaneLabel,
  coordinateTargets,
  coordinateValueLabel,
  moveCoordinate,
  type Coordinate,
  type CoordinateDirection,
  type CoordinatePlane as CoordinatePlaneSpec,
} from '../lib/coordinate-plane'

const VIEW_SIZE = 320
const PLOT_START = 36
const PLOT_SIZE = 256
const PLOT_END = PLOT_START + PLOT_SIZE
const GRID = 'var(--color-cream-deep)'
const AXIS = 'var(--color-ink-soft)'
const POINT = 'var(--color-blossom-deep)'
const LINES = ['var(--color-blossom-deep)', 'var(--color-lilac-deep)'] as const

type Placement = {
  point?: Coordinate
  onPlace: (point: Coordinate) => void
  disabled?: boolean
}

const toX = (plane: CoordinatePlaneSpec, value: number) =>
  PLOT_START + ((value - plane.x.min) / (plane.x.max - plane.x.min)) * PLOT_SIZE

const toY = (plane: CoordinatePlaneSpec, value: number) =>
  PLOT_START + ((plane.y.max - value) / (plane.y.max - plane.y.min)) * PLOT_SIZE

function labelsAt(values: number[]): Set<number> {
  const every = Math.ceil((values.length - 1) / 8)
  return new Set(values.filter((value, index) => value === 0 || index === 0 || index === values.length - 1 || index % every === 0))
}

const KEY_DIRECTION: Partial<Record<string, CoordinateDirection>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

/** One local SVG and one accessible name for a bounded linear graph. */
export function CoordinatePlane({
  plane,
  placement,
}: {
  plane: CoordinatePlaneSpec
  placement?: Placement
}) {
  const plotClipId = useId()
  const targetRefs = useRef(new Map<string, HTMLButtonElement>())
  const label = coordinatePlaneLabel(plane)
  const xValues = axisValues(plane.x)
  const yValues = axisValues(plane.y)
  const xLabels = labelsAt(xValues)
  const yLabels = labelsAt(yValues)
  const renderedLines = plane.lines.map((line, index) => {
    const [start, end] = clipCoordinateLine(plane, line)
    const segment = {
      x1: toX(plane, start.x),
      y1: toY(plane, start.y),
      x2: toX(plane, end.x),
      y2: toY(plane, end.y),
    }
    if (segment.x1 === segment.x2 && segment.y1 === segment.y2) {
      throw new Error(`coordinate plane: line ${index + 1} collapses in the SVG viewBox`)
    }
    return segment
  })

  const svg = (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      className="block w-80 max-w-full h-auto"
      role="img"
      aria-label={label}
      data-coordinate-plane
    >
      <g aria-hidden>
        <defs>
          <clipPath id={plotClipId} data-coordinate-plot-clip>
            <rect
              x={PLOT_START}
              y={PLOT_START}
              width={PLOT_SIZE}
              height={PLOT_SIZE}
            />
          </clipPath>
        </defs>
        <rect
          x={PLOT_START}
          y={PLOT_START}
          width={PLOT_SIZE}
          height={PLOT_SIZE}
          rx="8"
          fill="rgba(255, 255, 255, 0.72)"
          stroke={AXIS}
          strokeWidth="1.5"
        />

        {xValues.map((value) => (
          <line
            key={`x-grid-${value}`}
            x1={toX(plane, value)}
            x2={toX(plane, value)}
            y1={PLOT_START}
            y2={PLOT_END}
            stroke={GRID}
            strokeWidth="1"
            data-grid-axis="x"
            data-grid-value={value}
          />
        ))}
        {yValues.map((value) => (
          <line
            key={`y-grid-${value}`}
            x1={PLOT_START}
            x2={PLOT_END}
            y1={toY(plane, value)}
            y2={toY(plane, value)}
            stroke={GRID}
            strokeWidth="1"
            data-grid-axis="y"
            data-grid-value={value}
          />
        ))}

        <line
          x1={toX(plane, 0)}
          x2={toX(plane, 0)}
          y1={PLOT_START}
          y2={PLOT_END}
          stroke={AXIS}
          strokeWidth="2.5"
          data-zero-axis="y"
        />
        <line
          x1={PLOT_START}
          x2={PLOT_END}
          y1={toY(plane, 0)}
          y2={toY(plane, 0)}
          stroke={AXIS}
          strokeWidth="2.5"
          data-zero-axis="x"
        />

        {xValues.filter((value) => xLabels.has(value)).map((value) => (
          <text
            key={`x-label-${value}`}
            x={toX(plane, value)}
            y={310}
            textAnchor="middle"
            fill={AXIS}
            fontSize="11"
            fontWeight="700"
            data-tick-axis="x"
          >
            {coordinateValueLabel(value)}
          </text>
        ))}
        {yValues.filter((value) => yLabels.has(value)).map((value) => (
          <text
            key={`y-label-${value}`}
            x={29}
            y={toY(plane, value) + 4}
            textAnchor="end"
            fill={AXIS}
            fontSize="11"
            fontWeight="700"
            data-tick-axis="y"
          >
            {coordinateValueLabel(value)}
          </text>
        ))}

        <text x={PLOT_END - 3} y={toY(plane, 0) - 7} textAnchor="end" fill={AXIS} fontSize="12" fontWeight="700">
          x
        </text>
        <text x={toX(plane, 0) + 7} y={PLOT_START + 12} fill={AXIS} fontSize="12" fontWeight="700">
          y
        </text>

        <g data-coordinate-lines clipPath={`url(#${plotClipId})`}>
          {renderedLines.map((line, index) => {
            return (
              <line
                key={`line-${index}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={LINES[index]}
                strokeWidth="4"
                strokeLinecap="butt"
                strokeDasharray={index === 1 ? '10 7' : undefined}
                data-coordinate-line={index + 1}
                data-line-style={index === 1 ? 'dashed' : 'solid'}
              />
            )
          })}
        </g>

        {plane.points.map((point) => (
          <Point key={`${point.x},${point.y}`} plane={plane} point={point} />
        ))}
      </g>
    </svg>
  )

  if (!placement) return svg

  const targets = coordinateTargets(plane)
  const focusPoint = placement.point ?? { x: 0, y: 0 }
  const xTargetSize = Math.min(
    PLOT_SIZE / (xValues.length - 1),
    PLOT_START * 2,
  )
  const yTargetSize = Math.min(
    PLOT_SIZE / (yValues.length - 1),
    PLOT_START * 2,
  )

  const handleKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    point: Coordinate,
  ) => {
    const direction = KEY_DIRECTION[event.key]
    if (!direction || placement.disabled) return
    event.preventDefault()
    const next = moveCoordinate(plane, point, direction)
    placement.onPlace(next)
    targetRefs.current.get(coordinateEntry(next))?.focus()
  }

  return (
    <div className="relative w-80 max-w-full" data-coordinate-placement-surface>
      {svg}
      <div
        className="absolute inset-0"
        role="group"
        aria-label="Coordinate plane point placement"
      >
        {targets.map((point) => {
          const key = coordinateEntry(point)
          const selected = placement.point?.x === point.x && placement.point.y === point.y
          const inTabOrder = focusPoint.x === point.x && focusPoint.y === point.y

          return (
            <button
              key={key}
              ref={(node) => {
                if (node) targetRefs.current.set(key, node)
                else targetRefs.current.delete(key)
              }}
              type="button"
              aria-label={coordinateLabel(point)}
              aria-pressed={selected}
              tabIndex={inTabOrder ? 0 : -1}
              disabled={placement.disabled}
              data-coordinate-target
              data-x={point.x}
              data-y={point.y}
              className="absolute flex items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-lilac-deep focus-visible:outline-offset-1"
              style={{
                left: `${(toX(plane, point.x) / VIEW_SIZE) * 100}%`,
                top: `${(toY(plane, point.y) / VIEW_SIZE) * 100}%`,
                width: `${(xTargetSize / VIEW_SIZE) * 100}%`,
                height: `${(yTargetSize / VIEW_SIZE) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => placement.onPlace(point)}
              onKeyDown={(event) => handleKey(event, point)}
            >
              {selected && (
                <span
                  className="w-3.5 h-3.5 rounded-full bg-blossom-deep border-2 border-white shadow-sm"
                  aria-hidden
                  data-coordinate-selection
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Point({ plane, point }: { plane: CoordinatePlaneSpec; point: Coordinate }) {
  return (
    <circle
      cx={toX(plane, point.x)}
      cy={toY(plane, point.y)}
      r="5.5"
      fill={POINT}
      stroke="white"
      strokeWidth="2.5"
      data-coordinate-point
      data-x={point.x}
      data-y={point.y}
    />
  )
}
