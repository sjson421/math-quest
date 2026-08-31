import type { MathNotation } from './types'

/** The only length units Unit 20 puts on a figure. */
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
  | {
      kind: 'geometry'
      operation: 'area-composite'
      outerLength: number
      outerWidth: number
      cutoutLength: number
      cutoutWidth: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'volume-prism'
      length: number
      width: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'volume-cylinder'
      radius: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'volume-cone'
      radius: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'volume-pyramid'
      baseLength: number
      baseWidth: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'volume-sphere'
      radius: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'surface-area'
      length: number
      width: number
      height: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'pythagorean'
      missingSide: 'hypotenuse'
      leg1: number
      leg2: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'pythagorean'
      missingSide: 'leg'
      leg: number
      hypotenuse: number
      unit: LengthUnit
    }
  | {
      kind: 'geometry'
      operation: 'similar-figures'
      smallLength: number
      smallWidth: number
      largeKnownSide: number
      knownSide: 'length' | 'width'
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
  | 'outerLength'
  | 'outerWidth'
  | 'cutoutLength'
  | 'cutoutWidth'
  | 'baseLength'
  | 'baseWidth'
  | 'leg1'
  | 'leg2'
  | 'leg'
  | 'hypotenuse'
  | 'smallLength'
  | 'smallWidth'
  | 'largeKnownSide'

export type GeometryMeasurementLabel = {
  name: GeometryMeasurementName
  text: string
}

export type GeometryFormulaReference = {
  notation: MathNotation
  label: string
}

/** Fixed face order used by the rectangular-prism net and its recorded trace. */
export const SURFACE_AREA_FACE_PAIRS = [
  'length-height',
  'width-height',
  'length-height',
  'width-height',
  'length-width',
  'length-width',
] as const

const OPERATIONS: readonly GeometryDiagram['operation'][] = [
  'perimeter',
  'area-rectangle',
  'area-triangle',
  'area-parallelogram',
  'area-trapezoid',
  'circumference',
  'area-circle',
  'area-composite',
  'volume-prism',
  'volume-cylinder',
  'volume-cone',
  'volume-pyramid',
  'volume-sphere',
  'surface-area',
  'pythagorean',
  'similar-figures',
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

function assertMeasurement(name: string, value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`geometry ${name} must be a positive finite number`)
  }
}

function assertWholeMeasurement(name: string, value: unknown): asserts value is number {
  assertMeasurement(name, value)
  if (!Number.isInteger(value)) {
    throw new Error(`geometry ${name} must be a positive finite whole number`)
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
    case 'area-composite':
      assertKeys(value, ['kind', 'operation', 'outerLength', 'outerWidth', 'cutoutLength', 'cutoutWidth', 'unit'])
      const outerLength = value.outerLength
      const outerWidth = value.outerWidth
      const cutoutLength = value.cutoutLength
      const cutoutWidth = value.cutoutWidth
      assertMeasurement('outerLength', outerLength)
      assertMeasurement('outerWidth', outerWidth)
      assertMeasurement('cutoutLength', cutoutLength)
      assertMeasurement('cutoutWidth', cutoutWidth)
      if (cutoutLength >= outerLength || cutoutWidth >= outerWidth) {
        throw new Error('geometry composite cut-out must stay inside its outer rectangle')
      }
      return
    case 'volume-prism':
    case 'surface-area':
      assertKeys(value, ['kind', 'operation', 'length', 'width', 'height', 'unit'])
      assertMeasurement('length', value.length)
      assertMeasurement('width', value.width)
      assertMeasurement('height', value.height)
      return
    case 'volume-cylinder':
    case 'volume-cone':
      assertKeys(value, ['kind', 'operation', 'radius', 'height', 'unit'])
      assertMeasurement('radius', value.radius)
      assertMeasurement('height', value.height)
      return
    case 'volume-pyramid':
      assertKeys(value, ['kind', 'operation', 'baseLength', 'baseWidth', 'height', 'unit'])
      assertMeasurement('baseLength', value.baseLength)
      assertMeasurement('baseWidth', value.baseWidth)
      assertMeasurement('height', value.height)
      return
    case 'volume-sphere':
      assertKeys(value, ['kind', 'operation', 'radius', 'unit'])
      assertMeasurement('radius', value.radius)
      return
    case 'pythagorean':
      if (value.missingSide === 'hypotenuse') {
        assertKeys(value, ['kind', 'operation', 'missingSide', 'leg1', 'leg2', 'unit'])
        assertMeasurement('leg1', value.leg1)
        assertMeasurement('leg2', value.leg2)
        return
      }
      if (value.missingSide === 'leg') {
        assertKeys(value, ['kind', 'operation', 'missingSide', 'leg', 'hypotenuse', 'unit'])
        const leg = value.leg
        const hypotenuse = value.hypotenuse
        assertMeasurement('leg', leg)
        assertMeasurement('hypotenuse', hypotenuse)
        if (hypotenuse <= leg) {
          throw new Error('geometry hypotenuse must be longer than the known leg')
        }
        return
      }
      throw new Error('geometry pythagorean missingSide must be leg or hypotenuse')
    case 'similar-figures': {
      assertKeys(value, ['kind', 'operation', 'smallLength', 'smallWidth', 'largeKnownSide', 'knownSide', 'unit'])
      assertWholeMeasurement('smallLength', value.smallLength)
      assertWholeMeasurement('smallWidth', value.smallWidth)
      assertWholeMeasurement('largeKnownSide', value.largeKnownSide)
      if (value.knownSide !== 'length' && value.knownSide !== 'width') {
        throw new Error('geometry similar figures knownSide must be length or width')
      }
      if (value.smallLength === value.smallWidth) {
        throw new Error('geometry similar figures small sides must differ')
      }
      const correspondingSmallSide = value.knownSide === 'length' ? value.smallLength : value.smallWidth
      const scale = value.largeKnownSide / correspondingSmallSide
      if (!Number.isInteger(scale) || scale <= 1) {
        throw new Error('geometry similar figures known side must establish a whole-number scale greater than one')
      }
      return
    }
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
    case 'area-composite':
      return [
        measurement('outerLength', diagram.outerLength, diagram.unit),
        measurement('outerWidth', diagram.outerWidth, diagram.unit),
        measurement('cutoutLength', diagram.cutoutLength, diagram.unit),
        measurement('cutoutWidth', diagram.cutoutWidth, diagram.unit),
      ]
    case 'volume-prism':
    case 'surface-area':
      return [
        measurement('length', diagram.length, diagram.unit),
        measurement('width', diagram.width, diagram.unit),
        measurement('height', diagram.height, diagram.unit),
      ]
    case 'volume-cylinder':
    case 'volume-cone':
      return [
        measurement('radius', diagram.radius, diagram.unit),
        measurement('height', diagram.height, diagram.unit),
      ]
    case 'volume-pyramid':
      return [
        measurement('baseLength', diagram.baseLength, diagram.unit),
        measurement('baseWidth', diagram.baseWidth, diagram.unit),
        measurement('height', diagram.height, diagram.unit),
      ]
    case 'volume-sphere':
      return [measurement('radius', diagram.radius, diagram.unit)]
    case 'pythagorean':
      return diagram.missingSide === 'hypotenuse'
        ? [
            measurement('leg1', diagram.leg1, diagram.unit),
            measurement('leg2', diagram.leg2, diagram.unit),
          ]
        : [
            measurement('leg', diagram.leg, diagram.unit),
            measurement('hypotenuse', diagram.hypotenuse, diagram.unit),
          ]
    case 'similar-figures':
      return [
        measurement('smallLength', diagram.smallLength, diagram.unit),
        measurement('smallWidth', diagram.smallWidth, diagram.unit),
        measurement('largeKnownSide', diagram.largeKnownSide, diagram.unit),
      ]
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
    case 'area-composite':
      return `L-shaped composite figure with outer length ${diagram.outerLength} ${diagram.unit}, outer width ${diagram.outerWidth} ${diagram.unit}, and corner cut-out ${diagram.cutoutLength} by ${diagram.cutoutWidth} ${diagram.unit}`
    case 'volume-prism':
      return `Rectangular prism with length ${diagram.length} ${diagram.unit}, width ${diagram.width} ${diagram.unit}, and height ${diagram.height} ${diagram.unit}`
    case 'volume-cylinder':
      return `Cylinder with radius ${diagram.radius} ${diagram.unit} and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'volume-cone':
      return `Cone with radius ${diagram.radius} ${diagram.unit} and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'volume-pyramid':
      return `Rectangular pyramid with base length ${diagram.baseLength} ${diagram.unit}, base width ${diagram.baseWidth} ${diagram.unit}, and perpendicular height ${diagram.height} ${diagram.unit}`
    case 'volume-sphere':
      return `Sphere with radius ${diagram.radius} ${diagram.unit}`
    case 'surface-area':
      return `Rectangular-prism net with length ${diagram.length} ${diagram.unit}, width ${diagram.width} ${diagram.unit}, and height ${diagram.height} ${diagram.unit}`
    case 'pythagorean':
      return diagram.missingSide === 'hypotenuse'
        ? `Right triangle with legs ${diagram.leg1} ${diagram.unit} and ${diagram.leg2} ${diagram.unit}, and a missing hypotenuse`
        : `Right triangle with known leg ${diagram.leg} ${diagram.unit}, hypotenuse ${diagram.hypotenuse} ${diagram.unit}, and a missing leg`
    case 'similar-figures': {
      const knownLargeSide = diagram.knownSide === 'length' ? 'A' : 'B'
      const missingLargeSide = diagram.knownSide === 'length' ? 'B' : 'A'
      const missingRole = diagram.knownSide === 'length' ? 'width' : 'length'
      return (
        `Similar rectangles: small rectangle has lowercase sides a = ${diagram.smallLength} ${diagram.unit} ` +
        `and b = ${diagram.smallWidth} ${diagram.unit}; large rectangle has uppercase side ${knownLargeSide} = ` +
        `${diagram.largeKnownSide} ${diagram.unit} and missing uppercase side ${missingLargeSide} (${missingRole})`
      )
    }
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

const prismFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('V = '), text('Bh')), label: 'V equals B times h' },
  { notation: row(text('V = '), fraction(text('Bh'), text('3'))), label: 'V equals B times h divided by 3' },
]

const cylinderFormulas = (): GeometryFormulaReference[] => [
  {
    notation: row(text('V = '), row(text('π'), superscript('r', '2'), text('h'))),
    label: 'V equals pi times r squared times h',
  },
  {
    notation: row(text('V = '), fraction(row(text('π'), superscript('r', '2'), text('h')), text('3'))),
    label: 'V equals pi times r squared times h divided by 3',
  },
]

const sphereFormulas = (): GeometryFormulaReference[] => [
  {
    notation: row(text('V = '), fraction(row(text('4π'), superscript('r', '3')), text('3'))),
    label: 'V equals four pi r cubed divided by 3',
  },
  {
    notation: row(text('SA = '), row(text('4π'), superscript('r', '2'))),
    label: 'SA equals four pi r squared',
  },
]

const surfaceAreaFormulas = (): GeometryFormulaReference[] => [
  { notation: row(text('SA = '), text('2lw + 2lh + 2wh')), label: 'SA equals 2lw plus 2lh plus 2wh' },
  { notation: row(text('V = '), text('lwh')), label: 'V equals l times w times h' },
]

const pythagoreanFormulas = (): GeometryFormulaReference[] => [
  {
    notation: row(text('c = '), { kind: 'root', radicand: row(superscript('a', '2'), text(' + '), superscript('b', '2')) }),
    label: 'c equals the square root of a squared plus b squared',
  },
  {
    notation: row(text('a = '), { kind: 'root', radicand: row(superscript('c', '2'), text(' − '), superscript('b', '2')) }),
    label: 'a equals the square root of c squared minus b squared',
  },
]

const similarFigureFormulas = (): GeometryFormulaReference[] => [
  {
    notation: row(fraction(text('a'), text('A')), text(' = '), fraction(text('b'), text('B'))),
    label: 'a over A equals b over B',
  },
  {
    notation: row(fraction(text('a'), text('b')), text(' = '), fraction(text('A'), text('B'))),
    label: 'a over b equals A over B',
  },
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
    case 'area-composite':
      return rectangleFormulas()
    case 'volume-prism':
    case 'volume-pyramid':
      return prismFormulas()
    case 'volume-cylinder':
    case 'volume-cone':
      return cylinderFormulas()
    case 'volume-sphere':
      return sphereFormulas()
    case 'surface-area':
      return surfaceAreaFormulas()
    case 'pythagorean':
      return pythagoreanFormulas()
    case 'similar-figures':
      return similarFigureFormulas()
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry diagram: ${JSON.stringify(unhandled)}`)
    }
  }
}
