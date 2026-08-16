/** Structured data and pure geometry for the Stage F coordinate-plane surface. */
export type Coordinate = { x: number; y: number }

export type AxisScale = {
  min: number
  max: number
  step: number
}

export type CoordinateLine = {
  through: [Coordinate, Coordinate]
}

export type CoordinatePlane = {
  x: AxisScale
  y: AxisScale
  points: Coordinate[]
  lines: CoordinateLine[]
}

function assertInteger(value: number, field: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`coordinate plane: ${field} must be a finite whole number`)
  }
}

function assertAxis(axis: AxisScale, name?: 'x' | 'y'): void {
  const field = (part: keyof AxisScale) => name ? `${name}.${part}` : `axis.${part}`
  const axisName = name ? `${name}-axis` : 'axis'
  assertInteger(axis.min, field('min'))
  assertInteger(axis.max, field('max'))
  assertInteger(axis.step, field('step'))

  if (axis.min >= 0 || axis.max <= 0) {
    throw new Error(`coordinate plane: ${axisName} must cross zero`)
  }
  if (axis.step <= 0) {
    throw new Error(`coordinate plane: ${field('step')} must be positive`)
  }

  const span = axis.max - axis.min
  if (span % axis.step !== 0) {
    throw new Error(`coordinate plane: ${field('step')} must divide the axis span`)
  }
  if (-axis.min % axis.step !== 0) {
    throw new Error(`coordinate plane: ${axisName} must place zero on a tick`)
  }

  const intervals = span / axis.step
  if (intervals < 2 || intervals > 20) {
    throw new Error(`coordinate plane: ${axisName} must have from 2 through 20 intervals`)
  }
}

function assertCoordinate(point: Coordinate, field: string): void {
  assertInteger(point.x, `${field}.x`)
  assertInteger(point.y, `${field}.y`)
}

function inside(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

type Intersection = Coordinate & {
  parameterNumerator: bigint
  parameterDenominator: bigint
}

function normalizeFractionSign(numerator: bigint, denominator: bigint): [bigint, bigint] {
  return denominator < 0n ? [-numerator, -denominator] : [numerator, denominator]
}

function fractionWithin(
  numerator: bigint,
  denominator: bigint,
  min: number,
  max: number,
): boolean {
  const [value, divisor] = normalizeFractionSign(numerator, denominator)
  return BigInt(min) * divisor <= value && value <= BigInt(max) * divisor
}

function roundedScaledRatio(numerator: bigint, denominator: bigint, shift: number): bigint {
  const scaledNumerator = shift >= 0 ? numerator << BigInt(shift) : numerator
  const scaledDenominator = shift < 0 ? denominator << BigInt(-shift) : denominator
  let quotient = scaledNumerator / scaledDenominator
  const remainder = scaledNumerator % scaledDenominator
  const doubled = remainder * 2n

  if (doubled > scaledDenominator || (doubled === scaledDenominator && quotient % 2n === 1n)) {
    quotient += 1n
  }
  return quotient
}

/** Round one exact fraction directly to the nearest JavaScript number. */
function fractionToNumber(numerator: bigint, denominator: bigint): number {
  const [signedNumerator, signedDenominator] = normalizeFractionSign(numerator, denominator)
  if (signedNumerator === 0n) return 0

  const negative = signedNumerator < 0n
  const value = negative ? -signedNumerator : signedNumerator
  const numeratorBits = value.toString(2).length
  const denominatorBits = signedDenominator.toString(2).length
  let exponent = numeratorBits - denominatorBits
  const belowPower = exponent >= 0
    ? value < (signedDenominator << BigInt(exponent))
    : (value << BigInt(-exponent)) < signedDenominator
  if (belowPower) exponent -= 1

  let rounded: number
  if (exponent < -1022) {
    rounded = Number(roundedScaledRatio(value, signedDenominator, 1074)) * Number.MIN_VALUE
  } else {
    let significand = roundedScaledRatio(value, signedDenominator, 52 - exponent)
    if (significand === 2n ** 53n) {
      significand >>= 1n
      exponent += 1
    }
    rounded = Number(significand) * 2 ** (exponent - 52)
  }

  return negative ? -rounded : rounded
}

function lineEquation(line: CoordinateLine): [bigint, bigint, bigint] {
  const [first, second] = line.through
  const x1 = BigInt(first.x)
  const y1 = BigInt(first.y)
  const x2 = BigInt(second.x)
  const y2 = BigInt(second.y)
  return [y1 - y2, x2 - x1, x1 * y2 - x2 * y1]
}

function linesCoincide(first: CoordinateLine, second: CoordinateLine): boolean {
  const [a1, b1, c1] = lineEquation(first)
  const [a2, b2, c2] = lineEquation(second)
  return a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1
}

function intersections(plane: CoordinatePlane, line: CoordinateLine): Intersection[] {
  const [first, second] = line.through
  const x1 = BigInt(first.x)
  const y1 = BigInt(first.y)
  const exactDx = BigInt(second.x) - x1
  const exactDy = BigInt(second.y) - y1
  const candidates: Intersection[] = []

  const add = (
    x: number,
    y: number,
    parameterNumerator: bigint,
    parameterDenominator: bigint,
  ) => {
    const [value, divisor] = normalizeFractionSign(parameterNumerator, parameterDenominator)
    if (
      candidates.some(
        (point) => point.parameterNumerator * divisor === value * point.parameterDenominator,
      )
    ) return
    candidates.push({
      x,
      y,
      parameterNumerator: value,
      parameterDenominator: divisor,
    })
  }

  if (exactDx !== 0n) {
    for (const x of [plane.x.min, plane.x.max]) {
      const numerator = BigInt(x) - x1
      const otherNumerator = y1 * exactDx + numerator * exactDy
      if (!fractionWithin(otherNumerator, exactDx, plane.y.min, plane.y.max)) continue
      const y = fractionToNumber(otherNumerator, exactDx)
      add(x, y, numerator, exactDx)
    }
  }

  if (exactDy !== 0n) {
    for (const y of [plane.y.min, plane.y.max]) {
      const numerator = BigInt(y) - y1
      const otherNumerator = x1 * exactDy + numerator * exactDx
      if (!fractionWithin(otherNumerator, exactDy, plane.x.min, plane.x.max)) continue
      const x = fractionToNumber(otherNumerator, exactDy)
      add(x, y, numerator, exactDy)
    }
  }

  return candidates.sort((left, right) => {
    const leftScaled = left.parameterNumerator * right.parameterDenominator
    const rightScaled = right.parameterNumerator * left.parameterDenominator
    return leftScaled < rightScaled ? -1 : leftScaled > rightScaled ? 1 : 0
  })
}

function validatedLineSegment(plane: CoordinatePlane, line: CoordinateLine, index: number): [Coordinate, Coordinate] {
  if (!Array.isArray(line.through) || line.through.length !== 2) {
    throw new Error(`coordinate plane: line ${index + 1} needs two defining points`)
  }

  const [first, second] = line.through
  assertCoordinate(first, `line ${index + 1}.through[0]`)
  assertCoordinate(second, `line ${index + 1}.through[1]`)
  if (first.x === second.x && first.y === second.y) {
    throw new Error(`coordinate plane: line ${index + 1} needs distinct defining points`)
  }

  const visible = intersections(plane, line)
  if (visible.length < 2) {
    throw new Error(`coordinate plane: line ${index + 1} has no visible segment`)
  }

  const firstVisible = visible[0]
  const lastVisible = visible.at(-1) as Intersection
  if (firstVisible.x === lastVisible.x && firstVisible.y === lastVisible.y) {
    throw new Error(`coordinate plane: line ${index + 1} collapses to one numeric point`)
  }
  return [
    { x: firstVisible.x, y: firstVisible.y },
    { x: lastVisible.x, y: lastVisible.y },
  ]
}

/** Refuse graph data that would draw a different mathematical figure. */
export function assertCoordinatePlane(plane: CoordinatePlane): void {
  assertAxis(plane.x, 'x')
  assertAxis(plane.y, 'y')

  if (!Array.isArray(plane.points)) throw new Error('coordinate plane: points must be a list')
  if (!Array.isArray(plane.lines)) throw new Error('coordinate plane: lines must be a list')
  if (plane.lines.length > 2) throw new Error('coordinate plane: at most two lines may be drawn')

  const seen = new Set<string>()
  plane.points.forEach((point, index) => {
    assertCoordinate(point, `point ${index + 1}`)
    if (!inside(point.x, plane.x.min, plane.x.max) || !inside(point.y, plane.y.min, plane.y.max)) {
      throw new Error(`coordinate plane: point ${index + 1} must lie inside the axis bounds`)
    }

    const key = `${point.x},${point.y}`
    if (seen.has(key)) throw new Error(`coordinate plane: point ${index + 1} duplicates an earlier point`)
    seen.add(key)
  })

  plane.lines.forEach((line, index) => validatedLineSegment(plane, line, index))
  if (plane.lines.length === 2 && linesCoincide(plane.lines[0], plane.lines[1])) {
    throw new Error('coordinate plane: line 2 must not coincide with line 1')
  }
}

/** Every tick on an axis, including zero, in drawing order. */
export function axisValues(axis: AxisScale): number[] {
  assertAxis(axis)
  const count = (axis.max - axis.min) / axis.step
  return Array.from({ length: count + 1 }, (_, index) => axis.min + index * axis.step)
}

/** The visible segment of one declared infinite line. */
export function clipCoordinateLine(plane: CoordinatePlane, line: CoordinateLine): [Coordinate, Coordinate] {
  assertAxis(plane.x, 'x')
  assertAxis(plane.y, 'y')
  const index = plane.lines.indexOf(line)
  return validatedLineSegment(plane, line, index === -1 ? 0 : index)
}

export function coordinateValueLabel(value: number): string {
  return String(value).replace('-', '−')
}

export function coordinateLabel(point: Coordinate): string {
  assertCoordinate(point, 'coordinate')
  return `(${coordinateValueLabel(point.x)}, ${coordinateValueLabel(point.y)})`
}

function joined(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

/** The one accessible name shared by learner text and the rendered graph. */
export function coordinatePlaneLabel(plane: CoordinatePlane): string {
  assertCoordinatePlane(plane)

  const parts = [
    `Coordinate plane, x-axis ${coordinateValueLabel(plane.x.min)} to ${coordinateValueLabel(plane.x.max)} by ${plane.x.step}`,
    `y-axis ${coordinateValueLabel(plane.y.min)} to ${coordinateValueLabel(plane.y.max)} by ${plane.y.step}`,
  ]

  if (plane.points.length > 0) {
    parts.push(`points ${joined(plane.points.map(coordinateLabel))}`)
  }

  plane.lines.forEach((line, index) => {
    parts.push(`line ${index + 1} through ${coordinateLabel(line.through[0])} and ${coordinateLabel(line.through[1])}`)
  })

  return parts.join('; ')
}
