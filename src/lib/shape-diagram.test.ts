import { describe, expect, it } from 'vitest'
import {
  assertShapeDiagram,
  gridDimensions,
  shapeDiagramFraction,
  shapeDiagramLabel,
  type ShapeDiagram,
} from './shape-diagram'

const diagram = (
  kind: ShapeDiagram['kind'],
  parts: number,
  shadedParts: number,
): ShapeDiagram => ({ kind, parts, shadedParts })

describe('shape diagram data', () => {
  it.each(['bar', 'circle', 'grid'] as const)(
    'derives the same fraction from a %s',
    (kind) => {
      expect(shapeDiagramFraction(diagram(kind, 4, 3))).toEqual({ n: 3, d: 4 })
      expect(shapeDiagramFraction(diagram(kind, 4, 2))).toEqual({ n: 1, d: 2 })
    },
  )

  it('derives the accessible name from the same values', () => {
    expect(shapeDiagramLabel(diagram('circle', 4, 3))).toBe('circle in 4 parts, 3 shaded')
    expect(shapeDiagramLabel(diagram('bar', 1, 1))).toBe('bar in 1 part, 1 shaded')
  })

  it('rejects a shape outside the closed figure set', () => {
    const invalid = { kind: 'triangle', parts: 3, shadedParts: 1 } as unknown as ShapeDiagram

    expect(() => assertShapeDiagram(invalid)).toThrow(/kind must be bar, circle, or grid/)
  })

  it.each([
    diagram('bar', 0, 0),
    diagram('bar', -2, 0),
    diagram('bar', 2.5, 1),
  ])('rejects an invalid total: %j', (invalid) => {
    expect(() => assertShapeDiagram(invalid)).toThrow(/parts must be a positive whole number/)
  })

  it.each([
    diagram('circle', 4, -1),
    diagram('circle', 4, 2.5),
    diagram('circle', 4, 5),
  ])('rejects an invalid shaded count: %j', (invalid) => {
    expect(() => assertShapeDiagram(invalid)).toThrow(/shadedParts must be a whole number/)
  })
})

describe('grid dimensions', () => {
  it('uses the closest factor pair for a rectangular count', () => {
    expect(gridDimensions(diagram('grid', 12, 7))).toEqual({ rows: 3, columns: 4 })
    expect(gridDimensions(diagram('grid', 6, 2))).toEqual({ rows: 2, columns: 3 })
  })

  it('uses one row for a prime count', () => {
    expect(gridDimensions(diagram('grid', 11, 5))).toEqual({ rows: 1, columns: 11 })
  })

  it('does not invent dimensions for another shape', () => {
    expect(() => gridDimensions(diagram('bar', 4, 2))).toThrow(/only a grid/)
  })
})
