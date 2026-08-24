import { describe, expect, it } from 'vitest'
import { diagnose, generateProblem } from '../lib/generator'
import { isCoordinateTarget, type Coordinate } from '../lib/coordinate-plane'
import type { CoordinateData, Difficulty, EquationData, Problem } from '../lib/types'
import { sample, unrenderedKeys } from './recorded-output'
import { unit19 } from './unit-19-functions'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()

const problems = (id: string): Problem[] => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit19.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 19 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const drawn = (value: number): string => String(value).replace('-', '−')

const functionTerm = (coefficient: number): string =>
  coefficient === 1 ? 'x' : coefficient === -1 ? '−x' : `${drawn(coefficient)}x`

const functionRule = (coefficient: number, constant: number): string => {
  const term = functionTerm(coefficient)
  if (constant === 0) return `f(x) = ${term}`
  return `f(x) = ${term} ${constant > 0 ? '+' : '−'} ${drawn(Math.abs(constant))}`
}

const equationData = (problem: Problem): EquationData => {
  if (problem.display.kind !== 'equation' || !problem.display.equation) {
    throw new Error(`${problem.skillId}: expected equation data`)
  }
  return problem.display.equation
}

const coordinateData = <K extends CoordinateData['operation']>(problem: Problem, operation: K) => {
  if (problem.display.kind !== 'coordinate-plane' || !problem.display.coordinate) {
    throw new Error(`${problem.skillId}: expected coordinate data`)
  }
  const data = problem.display.coordinate
  if (data.operation !== operation) throw new Error(`${problem.skillId}: expected ${operation}`)
  return data as Extract<CoordinateData, { operation: K }>
}

const choiceAnswer = (problem: Problem): string => {
  if (problem.answer.kind !== 'choice') throw new Error(`${problem.skillId}: expected choice answer`)
  return problem.answer.id
}

const choicePosition = (problem: Problem): number => {
  const position = (problem.choices ?? []).findIndex((choice) => choice.id === choiceAnswer(problem))
  if (position < 0) throw new Error(`${problem.skillId}: answer choice is missing`)
  return position
}

const setLabel = (values: readonly number[]): string =>
  `{${[...new Set(values)].sort((left, right) => left - right).map(drawn).join(', ')}}`


const ruleFromRows = (rows: readonly Coordinate[]) => {
  const [first, second] = rows
  const run = second.x - first.x
  const rise = second.y - first.y
  if (run === 0) throw new Error('table rows need distinct x values')
  const interceptNumerator = first.y * run - rise * first.x
  if (interceptNumerator % run !== 0) throw new Error('table intercept should be integral')
  return { slope: rise / run, intercept: interceptNumerator / run }
}

const slopeFrom = (points: readonly [Coordinate, Coordinate]) => {
  const run = points[1].x - points[0].x
  const rise = points[1].y - points[0].y
  if (run === 0) throw new Error('line needs a nonzero run')
  return rise / run
}

const interceptFrom = (points: readonly [Coordinate, Coordinate]) => {
  const run = points[1].x - points[0].x
  const rise = points[1].y - points[0].y
  if (run === 0) throw new Error('line needs a nonzero run')
  return (points[0].y * run - rise * points[0].x) / run
}

const relationIsLinear = (points: readonly Coordinate[]) => {
  const ordered = [...points].sort((left, right) => left.x - right.x)
  const first = ordered[0]
  const second = ordered[1]
  const run = BigInt(second.x - first.x)
  const rise = BigInt(second.y - first.y)
  return ordered.slice(2).every((point) =>
    BigInt(point.y - first.y) * run === rise * BigInt(point.x - first.x),
  )
}

describe.each(unit19.map((skill) => [skill.id, skill] as const))('Unit 19 recorded output: %s', (_id, skill) => {
  it('matches the authored sample output', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

describe('Unit 19 shared contracts', () => {
  it('records every generated field', () => {
    expect(unrenderedKeys(unit19)).toEqual([])
  })

  it('uses every difficulty and grows displayed source magnitude', () => {
    for (const skill of unit19) {
      const means = difficulties.map((difficulty) => {
        const values = Array.from({ length: 100 }, (_, seed) => {
          const problem = generateProblem(skill, seed * 7919 + difficulty, difficulty)
          if (problem.display.kind === 'equation' && problem.display.equation) {
            const data = problem.display.equation
            if (data.operation === 'function-notation') {
              return (Math.abs(data.input) + Math.abs(data.output)) / 2
            }
            if (data.operation === 'evaluate-function') {
              return (Math.abs(data.coefficient) + Math.abs(data.constant) + Math.abs(data.input)) / 3
            }
            throw new Error(`${skill.id}: unexpected equation operation ${data.operation}`)
          }
          if (problem.display.kind === 'coordinate-plane') {
            const sourceValues = [
              problem.display.plane.x.max,
              problem.display.plane.y.max,
              ...problem.display.plane.points.flatMap((point) => [point.x, point.y]),
              ...problem.display.plane.lines.flatMap((line) => line.through.flatMap((point) => [point.x, point.y])),
            ]
            return sourceValues.reduce((sum, value) => sum + Math.abs(value), 0) / sourceValues.length
          }
          throw new Error(`${skill.id}: unexpected display`)
        })
        return values.reduce((sum, value) => sum + value, 0) / values.length
      })
      expect(means[4], skill.id).toBeGreaterThan(means[0])
    }
  })
})

describe('function-notation', () => {
  it('rebuilds the visible mapping and keeps both wall diagnoses', () => {
    const positions = new Set<number>()
    for (const problem of problems('function-notation')) {
      const data = equationData(problem)
      if (data.operation !== 'function-notation') throw new Error('expected notation data')
      expect(problem.display).toMatchObject({ text: `f(${drawn(data.input)}) = ${drawn(data.output)}` })
      expect(choiceAnswer(problem)).toBe('input-to-output')
      expect((problem.misconceptions ?? []).map((entry) => entry.tag).sort()).toEqual([
        'function-as-multiplication',
        'input-output-reversed',
      ])
      for (const misconception of problem.misconceptions ?? []) {
        if (typeof misconception.value === 'object' && misconception.value.kind === 'text') {
          expect(diagnose(problem, misconception.value.value)?.tag).toBe(misconception.tag)
        }
      }
      expect(new Set((problem.choices ?? []).map((choice) => choice.id)).size).toBe(3)
      positions.add(choicePosition(problem))
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})

describe('evaluate-function', () => {
  it('evaluates the carried rule at the carried input', () => {
    const signs = new Set<number>()
    for (const problem of problems('evaluate-function')) {
      const data = equationData(problem)
      if (data.operation !== 'evaluate-function') throw new Error('expected evaluation data')
      const output = data.coefficient * data.input + data.constant
      expect(problem.display).toMatchObject({
        text: functionRule(data.coefficient, data.constant),
        variable: `f(${drawn(data.input)})`,
      })
      expect(problem.answer).toEqual({ kind: 'exact', n: output, d: 1 })
      signs.add(Math.sign(data.coefficient))
      expect(problem.keypad?.allowNegative).toBe(output < 0)
    }
    expect(signs).toEqual(new Set([-1, 1]))
  })
})

describe('domain-range', () => {
  it('derives canonical sets from distinct plotted inputs', () => {
    const asks = new Set<string>()
    for (const problem of problems('domain-range')) {
      const data = coordinateData(problem, 'domain-range')
      if (problem.display.kind !== 'coordinate-plane') throw new Error('expected plane')
      const points = problem.display.plane.points
      const domain = [...new Set(points.map((point) => point.x))]
      const range = [...new Set(points.map((point) => point.y))]
      expect(new Set(points.map((point) => point.x)).size).toBe(points.length)
      expect(setLabel(data.asks === 'domain' ? domain : range)).toBe(
        (problem.choices ?? []).find((choice) => choice.id === choiceAnswer(problem))?.label,
      )
      expect(setLabel(domain)).not.toBe(setLabel(range))
      expect((problem.choices ?? []).map((choice) => choice.label)).toContain(setLabel(data.asks === 'domain' ? range : domain))
      const swapped = (problem.misconceptions ?? []).find((entry) => entry.tag === 'domain-range-swapped')
      if (!swapped || typeof swapped.value !== 'object' || swapped.value.kind !== 'text') {
        throw new Error('expected domain-range swapped diagnosis')
      }
      expect(diagnose(problem, swapped.value.value)?.tag).toBe('domain-range-swapped')
      asks.add(data.asks)
    }
    expect(asks).toEqual(new Set(['domain', 'range']))
  })
})

describe('linear-vs-nonlinear', () => {
  it('classifies exact consecutive rates without drawing a line', () => {
    const answers = new Set<string>()
    for (const problem of problems('linear-vs-nonlinear')) {
      const data = coordinateData(problem, 'linear-vs-nonlinear')
      if (problem.display.kind !== 'coordinate-plane') throw new Error('expected plane')
      expect(problem.display.plane.lines).toEqual([])
      const linear = relationIsLinear(problem.display.plane.points)
      expect(choiceAnswer(problem)).toBe(linear ? 'linear' : 'nonlinear')
      expect(data.operation).toBe('linear-vs-nonlinear')
      answers.add(choiceAnswer(problem))
    }
    expect(answers).toEqual(new Set(['linear', 'nonlinear']))
  })
})

describe('compare-functions', () => {
  it('rebuilds table, graph, equation, and the unique requested winner', () => {
    const winners = new Set<string>()
    const positions = new Set<number>()
    const asks = new Set<string>()
    for (const problem of problems('compare-functions')) {
      const data = coordinateData(problem, 'compare-functions')
      if (problem.display.kind !== 'coordinate-plane' || problem.display.plane.lines.length !== 1) {
        throw new Error('expected one graph line')
      }
      const table = ruleFromRows(data.tableRows)
      const line = problem.display.plane.lines[0].through
      const graph = { slope: slopeFrom(line), intercept: interceptFrom(line) }
      const equation = { slope: data.equationSlope, intercept: data.equationIntercept }
      const values = [table, graph, equation].map((rule) => rule[data.asks])
      expect(new Set(values).size).toBe(3)
      const winner = ['table', 'graph', 'equation'][values.indexOf(Math.max(...values))]
      expect(choiceAnswer(problem)).toBe(winner)
      if (data.asks === 'intercept') {
        expect(graph.intercept).toBeGreaterThanOrEqual(problem.display.plane.y.min)
        expect(graph.intercept).toBeLessThanOrEqual(problem.display.plane.y.max)
        expect(data.tableRows.some((point) => point.x === 0)).toBe(true)
        expect(isCoordinateTarget(problem.display.plane, { x: 0, y: graph.intercept })).toBe(true)
      }
      winners.add(choiceAnswer(problem))
      positions.add(choicePosition(problem))
      asks.add(data.asks)
    }
    expect(winners).toEqual(new Set(['table', 'graph', 'equation']))
    expect(positions.size).toBeGreaterThan(1)
    expect(asks).toEqual(new Set(['slope', 'intercept']))
  })
})
