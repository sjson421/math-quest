import {
  geometryDiagramLabel,
  geometryFormulaReferences,
  geometryMeasurementLabels,
  type GeometryDiagram as GeometryDiagramSpec,
  type GeometryMeasurementLabel,
} from '../lib/geometry-diagram'
import { MathNotation } from './MathNotation'

const VIEW_WIDTH = 240
const VIEW_HEIGHT = 170
const SHAPE_FILL = 'var(--color-lilac-soft)'
const SHAPE_STROKE = 'var(--color-ink-soft)'
const GUIDE_STROKE = 'var(--color-blossom-deep)'
const LABEL_FILL = 'var(--color-ink)'

/** One local SVG and two derived formula choices for a Unit 20a figure. */
export function GeometryDiagram({ diagram }: { diagram: GeometryDiagramSpec }) {
  // These helpers validate before the renderer reads any measurement. The same
  // data then supplies the image name, labels, and formula choices.
  const label = geometryDiagramLabel(diagram)
  const measurements = geometryMeasurementLabels(diagram)
  const formulas = geometryFormulaReferences(diagram)

  return (
    <div className="flex max-w-full flex-col items-center gap-2" data-geometry-diagram>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="block w-64 max-w-full h-auto"
        role="img"
        aria-label={label}
        data-diagram-kind="geometry"
        data-geometry-operation={diagram.operation}
      >
        <g aria-hidden>{figureFor(diagram, measurements)}</g>
      </svg>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-3" data-geometry-formulas>
        {formulas.map((formula, index) => (
          <MathNotation
            key={index}
            notation={formula.notation}
            label={formula.label}
          />
        ))}
      </div>
    </div>
  )
}

function figureFor(
  diagram: GeometryDiagramSpec,
  measurements: readonly GeometryMeasurementLabel[],
) {
  switch (diagram.operation) {
    case 'perimeter':
    case 'area-rectangle':
      return <RectangleFigure diagram={diagram} measurements={measurements} />
    case 'area-triangle':
      return <TriangleFigure measurements={measurements} />
    case 'area-parallelogram':
      return <ParallelogramFigure measurements={measurements} />
    case 'area-trapezoid':
      return <TrapezoidFigure measurements={measurements} />
    case 'circumference':
      return <CircleFigure diagram={diagram} measurements={measurements} />
    case 'area-circle':
      return <CircleFigure diagram={diagram} measurements={measurements} />
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry diagram: ${JSON.stringify(unhandled)}`)
    }
  }
}

function labelText(measurements: readonly GeometryMeasurementLabel[], name: GeometryMeasurementLabel['name']): string {
  const found = measurements.find((measurement) => measurement.name === name)
  if (!found) throw new Error(`Missing geometry measurement label: ${name}`)
  return found.text
}

const textProps = {
  fill: LABEL_FILL,
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'var(--font-round)',
}

function RectangleFigure({
  diagram,
  measurements,
}: {
  diagram: Extract<GeometryDiagramSpec, { operation: 'perimeter' | 'area-rectangle' }>
  measurements: readonly GeometryMeasurementLabel[]
}) {
  return (
    <>
      <rect
        x="42"
        y="42"
        width="156"
        height="82"
        rx="5"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        data-geometry-shape="rectangle"
      />
      <text x="120" y="28" textAnchor="middle" {...textProps} data-geometry-measure="length">
        {labelText(measurements, 'length')}
      </text>
      <text x="207" y="87" textAnchor="start" {...textProps} data-geometry-measure="width">
        {labelText(measurements, 'width')}
      </text>
      <path
        d="M 42 42 H 56 V 56 H 42"
        fill="none"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        data-right-angle
      />
      <title>{diagram.operation === 'perimeter' ? 'Rectangle perimeter figure' : 'Rectangle area figure'}</title>
    </>
  )
}

function TriangleFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <polygon
        points="42,124 198,124 120,38"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="triangle"
      />
      <line
        x1="120"
        y1="38"
        x2="120"
        y2="124"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        strokeDasharray="5 4"
        data-height-guide
      />
      <path
        d="M 120 124 H 134 V 110 H 120"
        fill="none"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        data-right-angle
      />
      <text x="120" y="153" textAnchor="middle" {...textProps} data-geometry-measure="base">
        {labelText(measurements, 'base')}
      </text>
      <text x="112" y="82" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
    </>
  )
}

function ParallelogramFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <polygon
        points="56,42 207,42 180,124 29,124"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="parallelogram"
      />
      <line
        x1="56"
        y1="42"
        x2="56"
        y2="124"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        strokeDasharray="5 4"
        data-height-guide
      />
      <path
        d="M 56 124 H 70 V 110 H 56"
        fill="none"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        data-right-angle
      />
      <text x="118" y="153" textAnchor="middle" {...textProps} data-geometry-measure="base">
        {labelText(measurements, 'base')}
      </text>
      <text x="49" y="84" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
    </>
  )
}

function TrapezoidFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <polygon
        points="68,48 172,48 211,124 29,124"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="trapezoid"
      />
      <line
        x1="68"
        y1="48"
        x2="68"
        y2="124"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        strokeDasharray="5 4"
        data-height-guide
      />
      <path
        d="M 68 124 H 82 V 110 H 68"
        fill="none"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        data-right-angle
      />
      <text x="120" y="35" textAnchor="middle" {...textProps} data-geometry-measure="base1">
        {labelText(measurements, 'base1')}
      </text>
      <text x="120" y="153" textAnchor="middle" {...textProps} data-geometry-measure="base2">
        {labelText(measurements, 'base2')}
      </text>
      <text x="61" y="87" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
    </>
  )
}

function CircleFigure({
  diagram,
  measurements,
}: {
  diagram: Extract<GeometryDiagramSpec, { operation: 'circumference' | 'area-circle' }>
  measurements: readonly GeometryMeasurementLabel[]
}) {
  const radius = diagram.operation === 'circumference'

  return (
    <>
      <circle
        cx="120"
        cy="84"
        r="52"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        data-geometry-shape="circle"
      />
      {radius ? (
        <>
          <line
            x1="120"
            y1="84"
            x2="172"
            y2="84"
            stroke={GUIDE_STROKE}
            strokeWidth="3"
            data-radius
          />
          <circle cx="120" cy="84" r="3" fill={GUIDE_STROKE} data-radius-center />
          <text x="146" y="75" textAnchor="middle" {...textProps} data-geometry-measure="radius">
            {labelText(measurements, 'radius')}
          </text>
        </>
      ) : (
        <>
          <line
            x1="68"
            y1="84"
            x2="172"
            y2="84"
            stroke={GUIDE_STROKE}
            strokeWidth="3"
            data-diameter
          />
          <text x="120" y="153" textAnchor="middle" {...textProps} data-geometry-measure="diameter">
            {labelText(measurements, 'diameter')}
          </text>
        </>
      )}
    </>
  )
}
