import {
  geometryDiagramLabel,
  geometryFormulaReferences,
  geometryMeasurementLabels,
  SURFACE_AREA_FACE_PAIRS,
  type GeometryDiagram as GeometryDiagramSpec,
  type GeometryMeasurementLabel,
} from '../lib/geometry-diagram'
import { MathNotation } from './MathNotation'

const VIEW_WIDTH = 240
const VIEW_HEIGHT = 180
const SHAPE_FILL = 'var(--color-lilac-soft)'
const SHAPE_STROKE = 'var(--color-ink-soft)'
const GUIDE_STROKE = 'var(--color-blossom-deep)'
const LABEL_FILL = 'var(--color-ink)'

/** One local SVG and two derived formula choices for a Unit 20 figure. */
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
    case 'area-composite':
      return <CompositeFigure measurements={measurements} />
    case 'volume-prism':
      return <PrismFigure measurements={measurements} />
    case 'volume-cylinder':
      return <CylinderFigure measurements={measurements} />
    case 'volume-cone':
      return <ConeFigure measurements={measurements} />
    case 'volume-pyramid':
      return <PyramidFigure measurements={measurements} />
    case 'volume-sphere':
      return <SphereFigure measurements={measurements} />
    case 'surface-area':
      return <SurfaceAreaNetFigure measurements={measurements} />
    case 'pythagorean':
      return <PythagoreanFigure diagram={diagram} measurements={measurements} />
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

function CompositeFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <path
        d="M 38 34 H 194 V 77 H 132 V 135 H 38 Z"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="composite"
      />
      <line
        x1="38"
        y1="77"
        x2="132"
        y2="77"
        stroke={GUIDE_STROKE}
        strokeWidth="2"
        strokeDasharray="5 4"
        data-composite-split
      />
      <text x="116" y="23" textAnchor="middle" {...textProps} data-geometry-measure="outerLength">
        {labelText(measurements, 'outerLength')}
      </text>
      <text x="203" y="58" textAnchor="start" {...textProps} data-geometry-measure="outerWidth">
        {labelText(measurements, 'outerWidth')}
      </text>
      <text x="163" y="70" textAnchor="middle" {...textProps} data-geometry-measure="cutoutLength">
        {labelText(measurements, 'cutoutLength')}
      </text>
      <text x="141" y="109" textAnchor="start" {...textProps} data-geometry-measure="cutoutWidth">
        {labelText(measurements, 'cutoutWidth')}
      </text>
      <title>Composite area figure split into two rectangles</title>
    </>
  )
}

function PrismFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <path
        d="M 47 61 L 84 39 H 194 V 111 L 157 133 H 47 Z"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="prism"
      />
      <path d="M 47 61 L 84 83 H 194" fill="none" stroke={SHAPE_STROKE} strokeWidth="3" />
      <path d="M 84 39 V 83 M 84 83 V 133 M 157 111 V 133" fill="none" stroke={SHAPE_STROKE} strokeWidth="3" />
      <line x1="84" y1="39" x2="194" y2="39" stroke={GUIDE_STROKE} strokeWidth="2" data-prism-length />
      <line x1="47" y1="61" x2="84" y2="39" stroke={GUIDE_STROKE} strokeWidth="2" data-prism-width />
      <line x1="42" y1="61" x2="42" y2="133" stroke={GUIDE_STROKE} strokeWidth="2" data-prism-height />
      <text x="139" y="29" textAnchor="middle" {...textProps} data-geometry-measure="length">
        {labelText(measurements, 'length')}
      </text>
      <text x="62" y="43" textAnchor="end" {...textProps} data-geometry-measure="width">
        {labelText(measurements, 'width')}
      </text>
      <text x="35" y="99" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
      <title>Rectangular prism volume figure</title>
    </>
  )
}

function CylinderFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <ellipse
        cx="120"
        cy="42"
        rx="68"
        ry="18"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        data-cylinder-top
      />
      <path
        d="M 52 42 V 122 M 188 42 V 122"
        fill="none"
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        data-geometry-shape="cylinder"
      />
      <path
        d="M 52 122 C 52 146 188 146 188 122"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
      />
      <line x1="120" y1="42" x2="176" y2="42" stroke={GUIDE_STROKE} strokeWidth="3" data-radius />
      <circle cx="120" cy="42" r="3" fill={GUIDE_STROKE} data-radius-center />
      <line x1="202" y1="42" x2="202" y2="122" stroke={GUIDE_STROKE} strokeWidth="2" data-cylinder-height />
      <text x="148" y="32" textAnchor="middle" {...textProps} data-geometry-measure="radius">
        {labelText(measurements, 'radius')}
      </text>
      <text x="207" y="87" textAnchor="start" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
      <title>Cylinder volume figure</title>
    </>
  )
}

function ConeFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <path
        d="M 120 29 L 52 117 C 52 141 188 141 188 117 Z"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="cone"
      />
      <ellipse cx="120" cy="117" rx="68" ry="17" fill="none" stroke={SHAPE_STROKE} strokeWidth="3" />
      <line x1="120" y1="117" x2="176" y2="117" stroke={GUIDE_STROKE} strokeWidth="3" data-radius />
      <circle cx="120" cy="117" r="3" fill={GUIDE_STROKE} data-radius-center />
      <line x1="120" y1="29" x2="120" y2="117" stroke={GUIDE_STROKE} strokeWidth="2" strokeDasharray="5 4" data-cone-height />
      <text x="148" y="107" textAnchor="middle" {...textProps} data-geometry-measure="radius">
        {labelText(measurements, 'radius')}
      </text>
      <text x="114" y="75" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
      <title>Cone volume figure</title>
    </>
  )
}

function PyramidFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <path
        d="M 48 116 L 122 135 L 194 112 L 120 94 Z"
        fill={SHAPE_FILL}
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-pyramid-base
      />
      <path
        d="M 120 31 L 48 116 M 120 31 L 194 112 M 120 31 L 122 135"
        fill="none"
        stroke={SHAPE_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
        data-geometry-shape="pyramid"
      />
      <line x1="120" y1="31" x2="120" y2="113" stroke={GUIDE_STROKE} strokeWidth="2" strokeDasharray="5 4" data-pyramid-height />
      <path d="M 120 113 H 134 V 99 H 120" fill="none" stroke={GUIDE_STROKE} strokeWidth="2" data-right-angle />
      <text x="120" y="151" textAnchor="middle" {...textProps} data-geometry-measure="baseLength">
        {labelText(measurements, 'baseLength')}
      </text>
      <text x="161" y="133" textAnchor="start" {...textProps} data-geometry-measure="baseWidth">
        {labelText(measurements, 'baseWidth')}
      </text>
      <text x="113" y="73" textAnchor="end" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
      <title>Rectangular pyramid volume figure</title>
    </>
  )
}

function SphereFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  return (
    <>
      <circle cx="120" cy="84" r="55" fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth="3" data-geometry-shape="sphere" />
      <path d="M 72 55 C 94 72 146 72 168 55 M 72 113 C 94 96 146 96 168 113" fill="none" stroke={GUIDE_STROKE} strokeWidth="2" opacity="0.8" />
      <line x1="120" y1="84" x2="175" y2="84" stroke={GUIDE_STROKE} strokeWidth="3" data-radius />
      <circle cx="120" cy="84" r="3" fill={GUIDE_STROKE} data-radius-center />
      <text x="148" y="75" textAnchor="middle" {...textProps} data-geometry-measure="radius">
        {labelText(measurements, 'radius')}
      </text>
      <title>Sphere volume figure</title>
    </>
  )
}

function SurfaceAreaNetFigure({ measurements }: { measurements: readonly GeometryMeasurementLabel[] }) {
  const facePositions = [
    { x: 18, y: 68, width: 50, height: 36 },
    { x: 68, y: 68, width: 50, height: 36 },
    { x: 118, y: 68, width: 50, height: 36 },
    { x: 168, y: 68, width: 50, height: 36 },
    { x: 68, y: 32, width: 50, height: 36 },
    { x: 68, y: 104, width: 50, height: 36 },
  ] as const
  const faces = facePositions.map((position, index) => ({
    ...position,
    pair: SURFACE_AREA_FACE_PAIRS[index],
  }))

  return (
    <>
      {faces.map((face, index) => (
        <rect
          key={face.pair + index}
          x={face.x}
          y={face.y}
          width={face.width}
          height={face.height}
          fill={index % 2 === 0 ? SHAPE_FILL : 'var(--color-cream)'}
          stroke={SHAPE_STROKE}
          strokeWidth="2"
          data-net-face={face.pair}
        />
      ))}
      <text x="93" y="24" textAnchor="middle" {...textProps} data-geometry-measure="length">
        {labelText(measurements, 'length')}
      </text>
      <text x="143" y="87" textAnchor="middle" {...textProps} data-geometry-measure="width">
        {labelText(measurements, 'width')}
      </text>
      <text x="43" y="87" textAnchor="middle" {...textProps} data-geometry-measure="height">
        {labelText(measurements, 'height')}
      </text>
      <title>Rectangular-prism surface-area net with six faces</title>
    </>
  )
}

function PythagoreanFigure({
  diagram,
  measurements,
}: {
  diagram: Extract<GeometryDiagramSpec, { operation: 'pythagorean' }>
  measurements: readonly GeometryMeasurementLabel[]
}) {
  const missingHypotenuse = diagram.missingSide === 'hypotenuse'

  return (
    <>
      <polygon points="48,132 48,43 192,132" fill={SHAPE_FILL} stroke={SHAPE_STROKE} strokeWidth="3" strokeLinejoin="round" data-geometry-shape="right-triangle" />
      <path d="M 48 132 H 63 V 117 H 48" fill="none" stroke={GUIDE_STROKE} strokeWidth="2" data-right-angle />
      <text x="39" y="87" textAnchor="end" {...textProps} data-geometry-side="leg">
        {missingHypotenuse ? labelText(measurements, 'leg1') : labelText(measurements, 'leg')}
      </text>
      <text x="120" y="151" textAnchor="middle" {...textProps} data-geometry-side="leg">
        {missingHypotenuse ? labelText(measurements, 'leg2') : '?'}
      </text>
      <text x="130" y="78" textAnchor="middle" {...textProps} data-geometry-side="hypotenuse">
        {missingHypotenuse ? '?' : labelText(measurements, 'hypotenuse')}
      </text>
      <text x="120" y="24" textAnchor="middle" {...textProps} data-missing-side>
        {missingHypotenuse ? 'Missing hypotenuse' : 'Missing leg'}
      </text>
      <title>Right triangle for Pythagorean theorem</title>
    </>
  )
}
