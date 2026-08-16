import { describe, expect, it } from 'vitest'
import {
  assertCoordinatePlane,
  axisValues,
  clipCoordinateLine,
  coordinateLabel,
  coordinatePlaneLabel,
  type CoordinateLine,
  type CoordinatePlane,
} from './coordinate-plane'

const scale = { min: -5, max: 5, step: 1 }
const plane = (overrides: Partial<CoordinatePlane> = {}): CoordinatePlane => ({
  x: scale,
  y: scale,
  points: [],
  lines: [],
  ...overrides,
})
const line = (x1: number, y1: number, x2: number, y2: number): CoordinateLine => ({
  through: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
})

describe('coordinate-plane data', () => {
  it('derives every zero-aligned tick in order', () => {
    expect(axisValues({ min: -6, max: 6, step: 2 })).toEqual([-6, -4, -2, 0, 2, 4, 6])
  })

  it('names a standalone invalid scale without inventing an axis', () => {
    expect(() => axisValues({ min: -5, max: 5, step: 0 })).toThrow(
      /axis.step must be positive/,
    )
  })

  it('derives one accessible name with typographic coordinate signs', () => {
    const graph = plane({
      points: [{ x: -2, y: 1 }, { x: 2, y: 3 }],
      lines: [line(0, 2, 2, 3), line(-1, 4, 2, -2)],
    })

    expect(coordinateLabel({ x: -2, y: 3 })).toBe('(−2, 3)')
    expect(coordinatePlaneLabel(graph)).toBe(
      'Coordinate plane, x-axis −5 to 5 by 1; y-axis −5 to 5 by 1; ' +
        'points (−2, 1) and (2, 3); line 1 through (0, 2) and (2, 3); ' +
        'line 2 through (−1, 4) and (2, −2)',
    )
  })

  it.each([
    [
      'cross zero',
      plane({ x: { min: 0, max: 5, step: 1 } }),
      /x-axis must cross zero/,
    ],
    [
      'positive step',
      plane({ x: { min: -5, max: 5, step: 0 } }),
      /x.step must be positive/,
    ],
    [
      'divide the span',
      plane({ x: { min: -5, max: 6, step: 2 } }),
      /x.step must divide the axis span/,
    ],
    [
      'put zero on a tick',
      plane({ x: { min: -5, max: 7, step: 2 } }),
      /x-axis must place zero on a tick/,
    ],
    [
      'cap interval density',
      plane({ x: { min: -11, max: 10, step: 1 } }),
      /x-axis must have from 2 through 20 intervals/,
    ],
    [
      'keep plotted points integral',
      plane({ points: [{ x: 0.5, y: 1 }] }),
      /point 1.x must be a finite whole number/,
    ],
    [
      'keep plotted points in bounds',
      plane({ points: [{ x: 6, y: 1 }] }),
      /point 1 must lie inside the axis bounds/,
    ],
    [
      'reject duplicate plotted points',
      plane({ points: [{ x: 1, y: 2 }, { x: 1, y: 2 }] }),
      /point 2 duplicates an earlier point/,
    ],
    [
      'limit line count',
      plane({ lines: [line(0, 0, 1, 1), line(0, 1, 1, 0), line(0, 2, 1, 2)] }),
      /at most two lines/,
    ],
    [
      'keep defining points distinct',
      plane({ lines: [line(1, 1, 1, 1)] }),
      /line 1 needs distinct defining points/,
    ],
    [
      'require a visible segment',
      plane({ lines: [line(0, 10, 1, 9)] }),
      /line 1 has no visible segment/,
    ],
  ] as const)('requires axes and marks to %s', (_name, graph, error) => {
    expect(() => assertCoordinatePlane(graph)).toThrow(error)
  })

  it.each([
    ['identical endpoints', line(0, 0, 1, 1), line(0, 0, 1, 1)],
    ['reversed endpoints', line(0, 0, 1, 1), line(1, 1, 0, 0)],
    ['different collinear points', line(-2, -2, 2, 2), line(-1, -1, 3, 3)],
    [
      'distant collinear points',
      line(-4, -4, -3, -54),
      line(999_999_999_996, -50_000_000_000_004, 999_999_999_997, -50_000_000_000_054),
    ],
  ] as const)('rejects coincident lines with %s', (_name, first, second) => {
    expect(() => assertCoordinatePlane(plane({ lines: [first, second] }))).toThrow(
      'line 2 must not coincide with line 1',
    )
  })

  it('keeps distinct nearly parallel lines separate', () => {
    const first = line(0, 0, 2_000_000_000, 1)
    const second = line(1, 0, 2_000_000_001, 1)

    expect(() => assertCoordinatePlane(plane({ lines: [first, second] }))).not.toThrow()
  })
})

describe('coordinate-line clipping', () => {
  it.each([
    ['diagonal', line(0, 0, 1, 1), [{ x: -5, y: -5 }, { x: 5, y: 5 }]],
    ['opposite corners', line(-1, 1, 1, -1), [{ x: -5, y: 5 }, { x: 5, y: -5 }]],
    ['horizontal', line(0, 2, 1, 2), [{ x: -5, y: 2 }, { x: 5, y: 2 }]],
    ['vertical', line(2, 0, 2, 1), [{ x: 2, y: -5 }, { x: 2, y: 5 }]],
  ] as const)('clips a %s line to the graph bounds', (_name, declared, expected) => {
    expect(clipCoordinateLine(plane({ lines: [declared] }), declared)).toEqual(expected)
  })

  it('rejects a line that only touches one corner', () => {
    const tangent = line(0, 10, 1, 9)
    expect(() => clipCoordinateLine(plane({ lines: [tangent] }), tangent)).toThrow(/no visible segment/)
  })

  it('keeps a nonzero segment whose intersections are very close to one corner', () => {
    const nearCorner = line(6, 4, 2_000_000_007, -1_999_999_996)
    const [first, second] = clipCoordinateLine(plane({ lines: [nearCorner] }), nearCorner)

    expect(first).not.toEqual(second)
    expect(first.x).toBeLessThan(5)
    expect(first.y).toBe(5)
    expect(second.x).toBe(5)
    expect(second.y).toBeLessThan(5)
  })

  it('rounds cancellation-prone boundary fractions directly', () => {
    const shallow = line(
      10_000_000_000_000_000,
      1,
      -10_000_000_000_000_000,
      -1,
    )

    expect(clipCoordinateLine(plane({ lines: [shallow] }), shallow)).toEqual([
      { x: 5, y: 5e-16 },
      { x: -5, y: -5e-16 },
    ])
  })

  it('rejects an exact segment that collapses in numeric graph coordinates', () => {
    const collapsed = line(6, 4, 5_000_000_000_000_007, -4_999_999_999_999_996)

    expect(() => clipCoordinateLine(plane({ lines: [collapsed] }), collapsed)).toThrow(
      'collapses to one numeric point',
    )
  })
})
