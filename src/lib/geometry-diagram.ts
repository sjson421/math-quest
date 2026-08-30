import type { MathNotation } from './types'

/** The only length units the first geometry increment puts on a figure. */
export const LENGTH_UNITS = ['cm', 'm', 'in', 'ft'] as const
export type LengthUnit = (typeof LENGTH_UNITS)[number]

export type GeometryDiagram =
  | {
      kind: 'geometry'
      operation: 'perimeter'
      length: number
      width: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'area-rectangle'
      length: number
      width: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'area-triangle'
      base: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'area-parallelogram'
      base: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'area-trapezoid'
      base1: number
      base2: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'circumference'
      radius: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'area-circle'
      diameter: number
      unit: LengthUnit
    }

export type GeometryMeasurementName =
  | 'length'
  | 'width'
  | 'base'
  | 'base1'
  | 'base2'
  | 'height'
  | 'radius'
  | 'diameter'

export type GeometryMeasurementLabel = {
  name: GeometryMeasurementName
  text: string
}

export type GeometryFormulaReference = {
  notation: MathNotation
  label: string
}

const OPERATIONS: readonly GeometryDiagram['operation'][] = [
  'perimeter',
  'area-rectangle',
  'area-triangle',
  'area-parallelogram',
  'area-trapezoid',
  'circumference',
  'area-circle',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isUnit = (value: unknown): value is LengthUnit =>
  typeof value === 'string' && LENGTH_UNITS.includes(value as LengthUnit)

const assertKeys = (diagram: Record<string, unknown>, keys: readonly string[]) => {
  const actual = Object.keys(diagram).sort()
  const expected = [...keys].sort()
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`geometry ${String(diagram.operation)}: fields must be ${expected.join(', ')}`)
  }
}

const assertMeasurement = (name: string, value: unknown) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`geometry ${name} must be a positive finite number`)
  }
}

/** Refuse geometry data before a renderer can draw a misleading figure. */
export function assertGeometryDiagram(diagram: unknown): asserts diagram is GeometryDiagram {
  const value = diagram
  if (!isRecord(value) || value.kind !== 'geometry') {
    throw new Error('geometry: kind must be geometry')
  }
  const operation = value.operation as GeometryDiagram['operation']
  if (!OPERATIONS.includes(operation)) {
    throw new Error('geometry: operation is not supported')
  }
  if (!isUnit(value.unit)) throw new Error('geometry: unit must be cm, m, in, or ft')

  switch (operation) {
    case 'perimeter':
    case 'area-rectangle':
      assertKeys(value, ['kind', 'operation', 'length', 'width', 'unit'])
      assertMeasurement('length', value.length)
      assertMeasurement('width', value.width)
      return
    case 'area-triangle':
    case 'area-parallelogram':
      assertKeys(value, ['kind', 'operation', 'base', 'height', 'unit'])
      assertMeasurement('base', value.base)
      assertMeasurement('height', value.height)
      return
    case 'area-trapezoid':
      assertKeys(value, ['kind', 'operation', 'base1', 'base2', 'height', 'unit'])
      assertMeasurement('base1', value.base1)
      assertMeasurement('base2', value.base2)
      assertMeasurement('height', value.height)
      return
    case 'circumference':
      assertKeys(value, ['kind', 'operation', 'radius', 'unit'])
      assertMeasurement('radius', value.radius)
      return
    case 'area-circle':
      assertKeys(value, ['kind', 'operation', 'diameter', 'unit'])
      assertMeasurement('diameter', value.diameter)
      return
    default: {
      const unhandled: never = operation
      throw new Error(`Unhandled geometry operation: ${unhandled}`)
    }
  }
}

const measurement = (name: GeometryMeasurementName, value: number, unit: LengthUnit): GeometryMeasurementLabel => ({
  name,
  text: `${value} ${unit}`,
})

/** Labels displayed beside the fixed figure templates. */
export function geometryMeasurementLabels(diagram: GeometryDiagram): readonly GeometryMeasurementLabel[] {
  assertGeometryDiagram(diagram)

  switch (diagram.operation) {
    case 'perimeter':
    case 'area-rectangle':
      return [
        measurement('length', diagram.length, diagram.unit),
        measurement('width', diagram.width, diagram.unit),
      ]
    case 'area-triangle':
    case 'area-parallelogram':
      return [
        measurement('base', diagram.base, diagram.unit),
        measurement('height', diagram.height, diagram.unit),
      ]
    case 'area-trapezoid':
      return [
        measurement('base1', diagram.base1, diagram.unit),
        measurement('base2', diagram.base2, diagram.unit),
        measurement('height', diagram.height, diagram.unit),
      ]
    case 'circumference':
      return [measurement('radius', diagram.radius, diagram.unit)]
    case 'area-circle':
      return [measurement('diameter', diagram.diameter, diagram.unit)]
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry diagram: ${JSON.stringify(unhandled)}`)
    }
  }
}

/** The one accessible name shared by the figure and recorded learner text. */
export function geometryDiagramLabel(diagram: GeometryDiagram): string {
  assertGeometryDiagram(diagram)

  switch (diagram.operation) {
    case 'perimeter':
    case 'area-rectangle':
      return `Rectangle with length ${diagram.length} ${diagram.unit} and width ${diagram.width} ${diagram.unit}`
    case 'area-triangle':
      return `Triangle with base ${diagram.base} ${diagram.unit} and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'area-parallelogram':
      return `Parallelogram with base ${diagram.base} ${diagram.unit} and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'area-trapezoid':
      return `Trapezoid with bases ${diagram.base1} ${diagram.unit} and ${diagram.base2} ${diagram.unit}, and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'circumference':
      return `Circle with radius ${diagram.radius} ${diagram.unit}`
    case 'area-circle':
      return `Circle with diameter ${diagram.diameter} ${diagram.unit}`
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry diagram: ${JSON.stringify(unhandled)}`)
    }
  }
}

const text = (value: string): MathNotation => ({ kind: 'text', value })

const row = (...children: MathNotation[]): MathNotation => ({ kind: 'row', children })

const fraction = (numerator: MathNotation, denominator: MathNotation): MathNotation => ({
  kind: 'fraction',
  numerator,
  denominator,
})

const superscript = (base: string, exponent: string): MathNotation => ({
  kind: 'superscript',
  base: text(base),
  exponent: text(exponent),
})

const rectangleFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('P = '), text('2l + 2w')), label: 'P equals 2l plus 2w' },
  { notation: row(text('A = '), text('lw')), label: 'A equals l times w' },
]

const polygonAreaFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('A = '), text('bh')), label: 'A equals b times h' },
  {
    notation: row(text('A = '), fraction(text('bh'), text('2'))),
    label: 'A equals b times h divided by 2',
  },
]

const trapezoidFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('A = '), text('bh')), label: 'A equals b times h' },
  {
    notation: row(text('A = '), fraction(text('(b1 + b2)h'), text('2'))),
    label: 'A equals b1 plus b2 times h divided by 2',
  },
]

const circleFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('C = '), text('πd')), label: 'C equals pi times d' },
  { notation: row(text('A = '), row(text('π'), superscript('r', '2'))), label: 'A equals pi times r squared' },
]

/** Formula references are derived from the operation, never authored per problem. */
export function geometryFormulaReferences(diagram: GeometryDiagram): readonly GeometryFormulaReference[] {
  assertGeometryDiagram(diagram)

  switch (diagram.operation) {
    case 'perimeter':
    case 'area-rectangle':
      return rectangleFormulas()
    case 'area-triangle':
      return polygonAreaFormulas()
    case 'area-parallelogram':
    case 'area-trapezoid':
      return trapezoidFormulas()
    case 'circumference':
    case 'area-circle':
      return circleFormulas()
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry diagram: ${JSON.stringify(unhandled)}`)
    }
  }
}
