import { describe, expect, it } from 'vitest'
import { isCoordinateTarget, type Coordinate, type CoordinateLine } from '../lib/coordinate-plane'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import type { CoordinateData, Difficulty, LinearEquation, Problem } from '../lib/types'
import { manifestIndex } from './index'
import { sample } from './recorded-output'
import { unit17 } from './unit-17-systems-equations'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()

const problems = (id: string): Problem[] => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit17.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 17 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const displayOf = (problem: Problem) => {
  if (problem.display.kind !== 'coordinate-plane') throw new Error(`${problem.skillId}: expected a plane`)
  return problem.display
}

const dataOf = <K extends CoordinateData['operation']>(problem: Problem, operation: K) => {
  const data = displayOf(problem).coordinate
  if (!data || data.operation !== operation) throw new Error(`${problem.skillId}: expected ${operation}`)
  return data as Extract<CoordinateData, { operation: K }>
}

const answerOf = (problem: Problem): Coordinate => {
  if (problem.answer.kind !== 'point') throw new Error(`${problem.skillId}: expected a point answer`)
  return { x: problem.answer.x, y: problem.answer.y }
}

type StandardEquation = { a: number; b: number; c: number }

const standardEquation = (equation: LinearEquation): StandardEquation => equation.form === 'standard'
  ? equation
  : { a: -equation.slope, b: 1, c: equation.intercept }

const solve = (equations: readonly [LinearEquation, LinearEquation]): Coordinate | undefined => {
  const [first, second] = equations.map(standardEquation)
  const determinant = first.a * second.b - second.a * first.b
  if (determinant === 0) return undefined
  const xNumerator = first.c * second.b - second.c * first.b
  const yNumerator = first.a * second.c - second.a * first.c
  if (xNumerator % determinant !== 0 || yNumerator % determinant !== 0) return undefined
  const x = xNumerator / determinant
  const y = yNumerator / determinant
  return { x: x === 0 ? 0 : x, y: y === 0 ? 0 : y }
}

const equationFromLine = (line: CoordinateLine): LinearEquation | undefined => {
  const [first, second] = line.through
  const run = second.x - first.x
  const rise = second.y - first.y
  if (run === 0 || rise % run !== 0) return undefined
  const slope = rise / run
  return { form: 'isolated', slope, intercept: first.y - slope * first.x }
}

const scaleFor = (
  equations: Extract<CoordinateData, { operation: 'system-elimination' }>['equations'],
) => {
  for (const variable of ['x', 'y'] as const) {
    const first = variable === 'x' ? equations[0].a : equations[0].b
    const second = variable === 'x' ? equations[1].a : equations[1].b
    if (first === 0 || second === 0) continue
    if (second % first === 0 && Math.abs(second / first) > 1) {
      return { equation: 0, factor: second / first, variable }
    }
    if (first % second === 0 && Math.abs(first / second) > 1) {
      return { equation: 1, factor: first / second, variable }
    }
  }
  return undefined
}

const predictionsOf = (problem: Problem): Coordinate[] =>
  (problem.misconceptions ?? []).flatMap((misconception) => {
    const value = misconception.value
    return typeof value === 'object' && value.kind === 'point'
      ? [{ x: value.x, y: value.y }]
      : []
  })

const usesDifficultyReach = (id: string) => {
  for (const [index, difficulty] of difficulties.entries()) {
    for (const problem of problems(id).filter((candidate) => candidate.difficulty === difficulty)) {
      const reach = [4, 5, 6, 8, 10][index]
      expect(displayOf(problem).plane.x).toEqual({ min: -reach, max: reach, step: 1 })
      expect(displayOf(problem).plane.y).toEqual(displayOf(problem).plane.x)
    }
  }
}

const teachingLines = [
  ['system-by-graphing', 'The point where both lines meet solves both equations.'],
  ['substitution', 'Replace an isolated letter with its equal expression in the other equation.'],
  ['elimination', 'Scale every term in one equation, then add or subtract to cancel one letter.'],
  ['system-words', 'Translate total count and total value into two equations, then solve them together.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit17.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 17 skill: ${id}`)
  return found
}

describe('Stage F Unit 17 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    const generator = teachingSkill(id)
    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage F Unit 17 intro examples', () => {
  it('recomputes every fixed intersection from structured equations or story quantities', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)
      const data = dataOf(problem, id === 'system-by-graphing'
        ? 'system-by-graphing'
        : id === 'substitution'
          ? 'system-substitution'
          : id === 'elimination'
            ? 'system-elimination'
            : 'system-words')

      if (id === 'system-by-graphing') {
        const lines = displayOf(problem).plane.lines.map(equationFromLine)
        if (!lines[0] || !lines[1]) throw new Error(`${id}: expected two line equations`)
        expect(solve([lines[0], lines[1]])).toEqual(answerOf(problem))
      } else if (id === 'system-words') {
        if (data.operation !== 'system-words') throw new Error(`${id}: wrong payload`)
        const x = (data.totalRevenue - data.secondPrice * data.totalCount) /
          (data.firstPrice - data.secondPrice)
        expect(x).toBe(Number(x))
        expect(solve([{ form: 'standard', a: 1, b: 1, c: data.totalCount }, {
          form: 'standard',
          a: data.firstPrice,
          b: data.secondPrice,
          c: data.totalRevenue,
        }])).toEqual(answerOf(problem))
      } else {
        if (data.operation !== 'system-substitution' && data.operation !== 'system-elimination') {
          throw new Error(`${id}: wrong payload`)
        }
        expect(solve(data.equations)).toEqual(answerOf(problem))
      }
    }
  })
})

describe('Unit 17 recorded output', () => {
  describe.each(unit17)('$id', (skill) => {
    it('keeps the wording snapshot complete', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  })
})

describe('system-by-graphing', () => {
  it('shows two distinct lines with an exact in-bounds intersection', () => {
    const shapes = new Set<string>()
    for (const problem of problems('system-by-graphing')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'system-by-graphing')
      expect(data.variables).toEqual(['x', 'y'])
      expect(display.plane.points).toEqual([])
      expect(display.plane.lines).toHaveLength(2)
      const equations = display.plane.lines.map(equationFromLine)
      if (!equations[0] || !equations[1]) throw new Error('expected integer line equations')
      expect(solve([equations[0], equations[1]])).toEqual(answerOf(problem))
      expect(isCoordinateTarget(display.plane, answerOf(problem))).toBe(true)
      expect(new Set(predictionsOf(problem).map((point) => `${point.x},${point.y}`)).size).toBe(2)
      for (const point of predictionsOf(problem)) {
        expect(point).not.toEqual(answerOf(problem))
        expect(isCoordinateTarget(display.plane, point)).toBe(true)
      }
      shapes.add(display.plane.lines.map((line) => JSON.stringify(line.through)).join('|'))
    }
    expect(shapes.size).toBeGreaterThan(20)
    usesDifficultyReach('system-by-graphing')
  })
})

describe('substitution', () => {
  it('keeps one isolated equation and one standard equation', () => {
    const signs = new Set<string>()
    for (const problem of problems('substitution')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'system-substitution')
      expect(display.plane.points).toEqual([])
      expect(display.plane.lines).toEqual([])
      expect(data.equations.filter((equation) => equation.form === 'isolated')).toHaveLength(1)
      expect(solve(data.equations)).toEqual(answerOf(problem))
      expect(isCoordinateTarget(display.plane, answerOf(problem))).toBe(true)
      signs.add(data.equations.map((equation) => JSON.stringify(equation)).join('|'))
    }
    expect(signs.size).toBeGreaterThan(20)
    usesDifficultyReach('substitution')
  })
})

describe('elimination', () => {
  it('scales one complete equation and preserves two reachable wall predictions', () => {
    const sources = new Set<string>()
    for (const problem of problems('elimination')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'system-elimination')
      expect(display.plane.points).toEqual([])
      expect(display.plane.lines).toEqual([])
      expect(data.equations.every((equation) => equation.form === 'standard')).toBe(true)
      expect(data.scaleFactor).toBeGreaterThan(1)
      expect(scaleFor(data.equations)).toEqual({
        equation: data.scaleEquation,
        factor: data.scaleFactor,
        variable: data.eliminate,
      })
      const other = data.eliminate === 'x' ? 'b' : 'a'
      expect(Math.abs(data.equations[0][other])).not.toBe(Math.abs(data.equations[1][other]))
      expect(solve(data.equations)).toEqual(answerOf(problem))
      const predictions = predictionsOf(problem)
      expect(predictions).toHaveLength(2)
      expect(new Set(predictions.map((point) => `${point.x},${point.y}`)).size).toBe(2)
      predictions.forEach((point) => {
        expect(point).not.toEqual(answerOf(problem))
        expect(isCoordinateTarget(display.plane, point)).toBe(true)
      })
      expect(problem.misconceptions?.map((misconception) => misconception.tag)).toEqual([
        'right-side-not-scaled',
        'eliminate-before-scaling',
      ])
      sources.add(JSON.stringify(data.equations))
    }
    expect(sources.size).toBeGreaterThan(20)
    usesDifficultyReach('elimination')
  })
})

describe('system-words', () => {
  it('derives the fixed pass-sales story and equations from quantities', () => {
    const frames = new Set<string>()
    for (const problem of problems('system-words')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'system-words')
      expect(data.frameId).toBe('pass-sales')
      expect(data.firstPrice).not.toBe(data.secondPrice)
      const equations: [LinearEquation, LinearEquation] = [
        { form: 'standard', a: 1, b: 1, c: data.totalCount },
        { form: 'standard', a: data.firstPrice, b: data.secondPrice, c: data.totalRevenue },
      ]
      expect(solve(equations)).toEqual(answerOf(problem))
      expect(answerOf(problem).x).toBeGreaterThanOrEqual(0)
      expect(answerOf(problem).y).toBeGreaterThanOrEqual(0)
      expect(isCoordinateTarget(display.plane, answerOf(problem))).toBe(true)
      frames.add(`${data.firstPrice}:${data.secondPrice}`)
    }
    expect(frames.size).toBeGreaterThan(2)
    usesDifficultyReach('system-words')
  })
})
