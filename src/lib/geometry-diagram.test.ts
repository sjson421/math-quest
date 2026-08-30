import { describe, expect, it } from 'vitest'
import {
  assertGeometryDiagram,
  geometryDiagramLabel,
  geometryFormulaReferences,
  geometryMeasurementLabels,
  type GeometryDiagram,
} from './geometry-diagram'

const diagrams: GeometryDiagram[] = [
  { kind: 'geometry', operation: 'perimeter', length: 7, width: 4, unit: 'cm' },
  { kind: 'geometry', operation: 'area-rectangle', length: 8, width: 3, unit: 'm' },
  { kind: 'geometry', operation: 'area-triangle', base: 6, height: 4, unit: 'ft' },
  { kind: 'geometry', operation: 'area-parallelogram', base: 9, height: 5, unit: 'in' },
  { kind: 'geometry', operation: 'area-trapezoid', base1: 5, base2: 9, height: 4, unit: 'cm' },
  { kind: 'geometry', operation: 'circumference', radius: 5, unit: 'cm' },
  { kind: 'geometry', operation: 'area-circle', diameter: 10, unit: 'm' },
  { kind: 'geometry', operation: 'area-composite', outerLength: 9, outerWidth: 7, cutoutLength: 4, cutoutWidth: 3, unit: 'ft' },
  { kind: 'geometry', operation: 'volume-prism', length: 6, width: 4, height: 5, unit: 'cm' },
  { kind: 'geometry', operation: 'volume-cylinder', radius: 3, height: 5, unit: 'm' },
  { kind: 'geometry', operation: 'volume-cone', radius: 3, height: 5, unit: 'in' },
  { kind: 'geometry', operation: 'volume-pyramid', baseLength: 6, baseWidth: 4, height: 9, unit: 'cm' },
  { kind: 'geometry', operation: 'volume-sphere', radius: 3, unit: 'ft' },
  { kind: 'geometry', operation: 'surface-area', length: 5, width: 3, height: 2, unit: 'cm' },
  { kind: 'geometry', operation: 'pythagorean', missingSide: 'hypotenuse', leg1: 3, leg2: 4, unit: 'ft' },
  { kind: 'geometry', operation: 'pythagorean', missingSide: 'leg', leg: 5, hypotenuse: 13, unit: 'in' },
]

describe('geometry diagram data', () => {
  it.each(diagrams)('validates every operation and derives its fields for $operation', (diagram) => {
    expect(() => assertGeometryDiagram(diagram)).not.toThrow()
    expect(geometryDiagramLabel(diagram)).toContain(`${diagram.unit}`)
    expect(geometryMeasurementLabels(diagram).every(({ text }) => text.endsWith(` ${diagram.unit}`))).toBe(true)
    expect(geometryFormulaReferences(diagram)).toHaveLength(2)
    expect(geometryFormulaReferences(diagram).every(({ notation, label }) => notation && label)).toBe(true)
  })

  it.each([
    ['cm', diagrams[0]],
    ['m', diagrams[1]],
    ['in', diagrams[3]],
    ['ft', diagrams[2]],
  ] as const)('accepts the supported %s unit', (_unit, diagram) => {
    expect(() => assertGeometryDiagram(diagram)).not.toThrow()
  })

  it('derives every measurement label from the operation source', () => {
    expect(geometryMeasurementLabels(diagrams[0])).toEqual([
      { name: 'length', text: '7 cm' },
      { name: 'width', text: '4 cm' },
    ])
    expect(geometryMeasurementLabels(diagrams[2])).toEqual([
      { name: 'base', text: '6 ft' },
      { name: 'height', text: '4 ft' },
    ])
    expect(geometryMeasurementLabels(diagrams[4])).toEqual([
      { name: 'base1', text: '5 cm' },
      { name: 'base2', text: '9 cm' },
      { name: 'height', text: '4 cm' },
    ])
    expect(geometryMeasurementLabels(diagrams[5])).toEqual([{ name: 'radius', text: '5 cm' }])
    expect(geometryMeasurementLabels(diagrams[6])).toEqual([{ name: 'diameter', text: '10 m' }])
  })

  it('derives accessible names that preserve radius and diameter meaning', () => {
    expect(geometryDiagramLabel(diagrams[5])).toBe('Circle with radius 5 cm')
    expect(geometryDiagramLabel(diagrams[6])).toBe('Circle with diameter 10 m')
    expect(geometryDiagramLabel(diagrams[2])).toBe(
      'Triangle with base 6 ft and perpendicular height 4 ft',
    )
  })

  it('uses the formula set required by each operation', () => {
    expect(geometryFormulaReferences(diagrams[0]).map(({ label }) => label)).toEqual([
      'P equals 2l plus 2w',
      'A equals l times w',
    ])
    expect(geometryFormulaReferences(diagrams[2]).map(({ label }) => label)).toEqual([
      'A equals b times h',
      'A equals b times h divided by 2',
    ])
    expect(geometryFormulaReferences(diagrams[4]).map(({ label }) => label)).toEqual([
      'A equals b times h',
      'A equals b1 plus b2 times h divided by 2',
    ])
    expect(geometryFormulaReferences(diagrams[5]).map(({ label }) => label)).toEqual([
      'C equals pi times d',
      'A equals pi times r squared',
    ])
    expect(geometryFormulaReferences(diagrams[7]).map(({ label }) => label)).toEqual([
      'P equals 2l plus 2w',
      'A equals l times w',
    ])
    expect(geometryFormulaReferences(diagrams[8]).map(({ label }) => label)).toEqual([
      'V equals B times h',
      'V equals B times h divided by 3',
    ])
    expect(geometryFormulaReferences(diagrams[9]).map(({ label }) => label)).toEqual([
      'V equals pi times r squared times h',
      'V equals pi times r squared times h divided by 3',
    ])
    expect(geometryFormulaReferences(diagrams[12]).map(({ label }) => label)).toEqual([
      'V equals four pi r cubed divided by 3',
      'SA equals four pi r squared',
    ])
    expect(geometryFormulaReferences(diagrams[13]).map(({ label }) => label)).toEqual([
      'SA equals 2lw plus 2lh plus 2wh',
      'V equals l times w times h',
    ])
    expect(geometryFormulaReferences(diagrams[14]).map(({ label }) => label)).toEqual([
      'c equals the square root of a squared plus b squared',
      'a equals the square root of c squared minus b squared',
    ])
  })

  it('derives complete Unit 20b measurement labels and accessible names', () => {
    expect(geometryMeasurementLabels(diagrams[7])).toEqual([
      { name: 'outerLength', text: '9 ft' },
      { name: 'outerWidth', text: '7 ft' },
      { name: 'cutoutLength', text: '4 ft' },
      { name: 'cutoutWidth', text: '3 ft' },
    ])
    expect(geometryMeasurementLabels(diagrams[11])).toEqual([
      { name: 'baseLength', text: '6 cm' },
      { name: 'baseWidth', text: '4 cm' },
      { name: 'height', text: '9 cm' },
    ])
    expect(geometryDiagramLabel(diagrams[7])).toContain('corner cut-out 4 by 3 ft')
    expect(geometryDiagramLabel(diagrams[13])).toContain('Rectangular-prism net')
    expect(geometryDiagramLabel(diagrams[14])).toContain('missing hypotenuse')
    expect(geometryDiagramLabel(diagrams[15])).toContain('hypotenuse 13 in')
  })

  it.each([
    ['wrong kind', { kind: 'fraction', operation: 'perimeter' }],
    ['wrong operation', { kind: 'geometry', operation: 'volume', length: 2, width: 3, unit: 'cm' }],
    ['wrong unit', { kind: 'geometry', operation: 'perimeter', length: 2, width: 3, unit: 'yd' }],
    ['zero measurement', { kind: 'geometry', operation: 'perimeter', length: 0, width: 3, unit: 'cm' }],
    ['negative measurement', { kind: 'geometry', operation: 'perimeter', length: -2, width: 3, unit: 'cm' }],
    ['non-finite measurement', { kind: 'geometry', operation: 'perimeter', length: Number.NaN, width: 3, unit: 'cm' }],
    ['infinite measurement', { kind: 'geometry', operation: 'perimeter', length: Number.POSITIVE_INFINITY, width: 3, unit: 'cm' }],
    ['missing measurement', { kind: 'geometry', operation: 'area-triangle', base: 4, unit: 'cm' }],
    ['unrelated measurement', { kind: 'geometry', operation: 'circumference', radius: 4, diameter: 8, unit: 'cm' }],
    ['extra measurement', { kind: 'geometry', operation: 'area-circle', diameter: 10, radius: 5, unit: 'm' }],
    ['missing unit', { kind: 'geometry', operation: 'area-circle', diameter: 10 }],
    ['composite cutout length outside', { kind: 'geometry', operation: 'area-composite', outerLength: 9, outerWidth: 7, cutoutLength: 9, cutoutWidth: 3, unit: 'cm' }],
    ['composite cutout width outside', { kind: 'geometry', operation: 'area-composite', outerLength: 9, outerWidth: 7, cutoutLength: 4, cutoutWidth: 7, unit: 'cm' }],
    ['pyramid missing base', { kind: 'geometry', operation: 'volume-pyramid', baseLength: 6, height: 9, unit: 'cm' }],
    ['pythagorean invalid hypotenuse', { kind: 'geometry', operation: 'pythagorean', missingSide: 'leg', leg: 13, hypotenuse: 5, unit: 'in' }],
    ['pythagorean invalid missing side', { kind: 'geometry', operation: 'pythagorean', missingSide: 'base', leg: 3, hypotenuse: 5, unit: 'in' }],
  ])('rejects %s data', (_name, diagram) => {
    expect(() => assertGeometryDiagram(diagram)).toThrow()
  })
})
