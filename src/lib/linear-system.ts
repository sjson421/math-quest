import {
  coordinateEquationLabel,
  coordinateValueLabel,
  type Coordinate,
  type CoordinateLine,
} from './coordinate-plane'
import type { LinearEquation } from './types'

type StandardEquation = Extract<LinearEquation, { form: 'standard' }>

/** The two labels a system context needs: one for sight, one for speech. */
export type LinearEquationLabels = {
  visible: string
  spoken: string
}

const integer = (value: number): boolean => Number.isSafeInteger(value)
const normalizedZero = (value: number): number => value === 0 ? 0 : value

const coefficientTerm = (coefficient: number, variable: string): string => {
  if (coefficient === 1) return variable
  if (coefficient === -1) return `−${variable}`
  return `${coefficient < 0 ? '−' : ''}${Math.abs(coefficient)}${variable}`
}

/** Convert either supported presentation form into `ax + by = c`. */
export function standardCoefficients(equation: LinearEquation): StandardEquation | undefined {
  if (equation.form === 'standard') {
    if (!integer(equation.a) || !integer(equation.b) || !integer(equation.c)) return undefined
    if (equation.a === 0 && equation.b === 0) return undefined
    return equation
  }

  if (!integer(equation.slope) || !integer(equation.intercept)) return undefined
  return { form: 'standard', a: -equation.slope, b: 1, c: equation.intercept }
}

/** Format one closed equation without showing `1x`, `1y`, or ASCII minus signs. */
export function linearEquationLabel(equation: LinearEquation): LinearEquationLabels {
  const standard = standardCoefficients(equation)
  if (!standard) throw new Error('linear equation: coefficients must be safe integers')

  let visible: string
  if (equation.form === 'isolated') {
    visible = equation.slope === 0
      ? `y = ${coordinateValueLabel(equation.intercept)}`
      : coordinateEquationLabel(equation.slope, equation.intercept)
  } else {
    const terms: string[] = []
    if (standard.a !== 0) terms.push(coefficientTerm(standard.a, 'x'))
    if (standard.b !== 0) {
      const term = coefficientTerm(Math.abs(standard.b), 'y')
      if (terms.length === 0) terms.push(standard.b < 0 ? `−${term}` : term)
      else terms.push(`${standard.b < 0 ? '−' : '+'} ${term}`)
    }
    if (terms.length === 0) throw new Error('linear equation: both coefficients cannot be zero')
    visible = `${terms.join(' ')} = ${standard.c < 0 ? '−' : ''}${Math.abs(standard.c)}`
  }

  return {
    visible,
    spoken: visible
      .replace(' = ', ' equals ')
      .replaceAll(' + ', ' plus ')
      .replaceAll(' − ', ' minus ')
      .replace(/^−/, 'minus '),
  }
}

/** Short alias used by context/recording consumers. */
export const formatLinearEquation = linearEquationLabel

/** Solve a pair by exact Cramer's-rule arithmetic, returning only integer points. */
export function solveLinearSystem(
  equations: readonly [LinearEquation, LinearEquation],
): Coordinate | undefined {
  const first = standardCoefficients(equations[0])
  const second = standardCoefficients(equations[1])
  if (!first || !second) return undefined

  const determinant = first.a * second.b - second.a * first.b
  if (determinant === 0) return undefined

  const xNumerator = first.c * second.b - second.c * first.b
  const yNumerator = first.a * second.c - second.a * first.c
  if (xNumerator % determinant !== 0 || yNumerator % determinant !== 0) return undefined

  const point = {
    x: normalizedZero(xNumerator / determinant),
    y: normalizedZero(yNumerator / determinant),
  }
  return integer(point.x) && integer(point.y) ? point : undefined
}

/** Rebuild the slope-intercept equation behind a displayed non-vertical line. */
export function lineEquation(line: CoordinateLine): LinearEquation | undefined {
  const [first, second] = line.through
  const run = second.x - first.x
  const rise = second.y - first.y
  if (run === 0 || rise % run !== 0) return undefined
  const slope = rise / run
  const intercept = normalizedZero(first.y - slope * first.x)
  return integer(slope) && integer(intercept)
    ? { form: 'isolated', slope, intercept }
    : undefined
}

/** Find the factor and equation index needed to cancel one variable. */
export function eliminationScale(
  equations: readonly [StandardEquation, StandardEquation],
): { equation: 0 | 1; factor: number; variable: 'x' | 'y' } | undefined {
  const [first, second] = equations
  const candidates: { equation: 0 | 1; factor: number; variable: 'x' | 'y' }[] = []
  for (const variable of ['x', 'y'] as const) {
    const firstCoefficient = variable === 'x' ? first.a : first.b
    const secondCoefficient = variable === 'x' ? second.a : second.b
    if (firstCoefficient !== 0 && secondCoefficient !== 0) {
      if (secondCoefficient % firstCoefficient === 0 && Math.abs(secondCoefficient / firstCoefficient) > 1) {
        candidates.push({ equation: 0, factor: secondCoefficient / firstCoefficient, variable })
      }
      if (firstCoefficient % secondCoefficient === 0 && Math.abs(firstCoefficient / secondCoefficient) > 1) {
        candidates.push({ equation: 1, factor: firstCoefficient / secondCoefficient, variable })
      }
    }
  }
  return candidates[0]
}

export function passSalesEquations(data: {
  firstPrice: number
  secondPrice: number
  totalCount: number
  totalRevenue: number
}): [StandardEquation, StandardEquation] {
  return [
    { form: 'standard', a: 1, b: 1, c: data.totalCount },
    { form: 'standard', a: data.firstPrice, b: data.secondPrice, c: data.totalRevenue },
  ]
}

export function passSalesStory(data: {
  firstPrice: number
  secondPrice: number
  totalCount: number
  totalRevenue: number
}): string {
  return (
    `A community event sold ${data.totalCount} passes. ` +
    `Standard passes cost $${data.firstPrice}, and premium passes cost $${data.secondPrice}. ` +
    `Total sales were $${data.totalRevenue}. ` +
    `Let x be standard passes and y be premium passes.`
  )
}
