import {
  gridDimensions,
  shapeDiagramLabel,
  type ShapeDiagram as ShapeDiagramSpec,
} from '../lib/shape-diagram'

const VIEW_WIDTH = 180
const VIEW_HEIGHT = 120
const SHAPE_FILL = 'var(--color-blossom)'
const EMPTY_FILL = 'rgba(255, 255, 255, 0.82)'
const OUTLINE = 'var(--color-ink-soft)'

/** One local SVG and one accessible name for an equal-part fraction figure. */
export function ShapeDiagram({ diagram }: { diagram: ShapeDiagramSpec }) {
  // Deriving the name validates before any geometry reads the counts.
  const label = shapeDiagramLabel(diagram)

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="block w-48 max-w-full h-auto"
      role="img"
      aria-label={label}
      data-diagram-kind={diagram.kind}
    >
      <g aria-hidden>{partsFor(diagram)}</g>
    </svg>
  )
}

function partsFor(diagram: ShapeDiagramSpec) {
  switch (diagram.kind) {
    case 'bar':
      return <BarParts diagram={diagram} />
    case 'circle':
      return <CircleParts diagram={diagram} />
    case 'grid':
      return <GridParts diagram={diagram} />
    default: {
      const unhandled: never = diagram.kind
      throw new Error(`Unhandled diagram: ${unhandled}`)
    }
  }
}

function partProps(index: number, shadedParts: number) {
  const shaded = index < shadedParts
  return {
    fill: shaded ? SHAPE_FILL : EMPTY_FILL,
    stroke: OUTLINE,
    strokeWidth: 2,
    'data-diagram-part': index + 1,
    'data-shaded': shaded,
  }
}

function BarParts({ diagram }: { diagram: ShapeDiagramSpec }) {
  const x = 6
  const y = 24
  const width = 168 / diagram.parts
  const height = 72

  return Array.from({ length: diagram.parts }, (_, index) => (
    <rect
      key={index}
      x={x + index * width}
      y={y}
      width={width}
      height={height}
      rx={diagram.parts === 1 ? 8 : 0}
      {...partProps(index, diagram.shadedParts)}
    />
  ))
}

function CircleParts({ diagram }: { diagram: ShapeDiagramSpec }) {
  const cx = 90
  const cy = 60
  const radius = 52

  if (diagram.parts === 1) {
    return <circle cx={cx} cy={cy} r={radius} {...partProps(0, diagram.shadedParts)} />
  }

  const sweep = (Math.PI * 2) / diagram.parts
  return Array.from({ length: diagram.parts }, (_, index) => {
    const start = -Math.PI / 2 + index * sweep
    const end = start + sweep
    const from = polarPoint(cx, cy, radius, start)
    const to = polarPoint(cx, cy, radius, end)
    const path = [
      `M ${cx} ${cy}`,
      `L ${from.x} ${from.y}`,
      `A ${radius} ${radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${to.x} ${to.y}`,
      'Z',
    ].join(' ')

    return <path key={index} d={path} {...partProps(index, diagram.shadedParts)} />
  })
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function GridParts({ diagram }: { diagram: ShapeDiagramSpec }) {
  const { rows, columns } = gridDimensions(diagram)
  const x = 6
  const y = 8
  const width = 168 / columns
  const height = 104 / rows

  return Array.from({ length: diagram.parts }, (_, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns

    return (
      <rect
        key={index}
        x={x + column * width}
        y={y + row * height}
        width={width}
        height={height}
        {...partProps(index, diagram.shadedParts)}
      />
    )
  })
}
