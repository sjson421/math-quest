import { describe, expect, it } from 'vitest'
import { isCoordinateTarget, type Coordinate } from '../lib/coordinate-plane'
import { checkAnswer } from '../lib/answer'
import { generateProblem } from '../lib/generator'
import { gcd, rational } from '../lib/rational'
import type { CoordinateData, Difficulty, Problem } from '../lib/types'
import { sample } from './recorded-output'
import { unit16 } from './unit-16-coordinate-plane-lines'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()

/** Every draw of one skill: 100 seeds at each of the five difficulties. */
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit16.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 16 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const atDifficulty = (id: string, difficulty: Difficulty) =>
  problems(id).filter((problem) => problem.difficulty === difficulty)

const displayOf = (problem: Problem) => {
  if (problem.display.kind !== 'coordinate-plane') {
    throw new Error(`${problem.skillId}: expected a coordinate-plane display`)
  }
  return problem.display
}

const dataOf = <K extends CoordinateData['operation']>(problem: Problem, operation: K) => {
  const data = displayOf(problem).coordinate
  if (!data || data.operation !== operation) {
    throw new Error(`${problem.skillId}: expected ${operation}`)
  }
  return data as Extract<CoordinateData, { operation: K }>
}

const pointAnswerOf = (problem: Problem): Coordinate => {
  if (problem.answer.kind !== 'point') throw new Error(`${problem.skillId}: expected a point answer`)
  return { x: problem.answer.x, y: problem.answer.y }
}

const exactAnswerOf = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error(`${problem.skillId}: expected an exact answer`)
  return problem.answer
}

const pointPredictions = (problem: Problem): Coordinate[] =>
  (problem.misconceptions ?? [])
    .map((misconception) => misconception.value)
    .flatMap((value) =>
      typeof value !== 'number' && value.kind === 'point' ? [{ x: value.x, y: value.y }] : [],
    )

const numericPredictions = (problem: Problem): number[] =>
  (problem.misconceptions ?? [])
    .map((misconception) => misconception.value)
    .filter((value): value is number => typeof value === 'number')

const predictionTags = (problem: Problem): string[] =>
  (problem.misconceptions ?? []).map((misconception) => misconception.tag)

const reaches = [4, 5, 6, 8, 10]

const usesDifficultyReach = (id: string) => {
  for (const [index, difficulty] of difficulties.entries()) {
    for (const problem of atDifficulty(id, difficulty)) {
      const { plane } = displayOf(problem)
      expect(plane.x, `${id} at difficulty ${difficulty}`).toEqual({
        min: -reaches[index],
        max: reaches[index],
        step: 1,
      })
      expect(plane.y, `${id} at difficulty ${difficulty}`).toEqual(plane.x)
    }
  }
}

describe.each(unit16.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })

  it('draws negative solution values with the course minus glyph', () => {
    const details = problems(skill.id).flatMap((problem) =>
      problem.solution.flatMap((step) => step.detail ?? []),
    )
    expect(details.filter((detail) => /-\d/.test(detail))).toEqual([])
  })
})

describe('plot-points', () => {
  it('shows the exact point the learner must place', () => {
    for (const problem of problems('plot-points')) {
      const display = displayOf(problem)
      const target = dataOf(problem, 'plot-point').point
      expect(pointAnswerOf(problem)).toEqual(target)
      expect(isCoordinateTarget(display.plane, target)).toBe(true)
      expect(display.plane.points).toEqual([])
      expect(display.plane.lines).toEqual([])
    }
  })

  it('keeps both wall predictions distinct, wrong, and reachable', () => {
    for (const problem of problems('plot-points')) {
      const display = displayOf(problem)
      const target = dataOf(problem, 'plot-point').point
      const expected = [{ x: target.y, y: target.x }, { x: target.x, y: -target.y }]
      expect(predictionTags(problem)).toEqual([
        'coordinate-order-reversed',
        'vertical-direction-reversed',
      ])
      expect(pointPredictions(problem)).toEqual(expected)
      expect(new Set(expected.map((point) => `${point.x},${point.y}`)).size).toBe(2)
      for (const prediction of expected) {
        expect(prediction).not.toEqual(target)
        expect(isCoordinateTarget(display.plane, prediction)).toBe(true)
      }
    }
  })

  it('draws every quadrant and widens the plane', () => {
    const signs = new Set(problems('plot-points').map((problem) => {
      const { x, y } = pointAnswerOf(problem)
      return `${Math.sign(x)},${Math.sign(y)}`
    }))
    expect([...signs].sort()).toEqual(['-1,-1', '-1,1', '1,-1', '1,1'])
    usesDifficultyReach('plot-points')
  })
})

describe('quadrants', () => {
  const quadrantFor = ({ x, y }: Coordinate) =>
    x > 0 ? y > 0 ? 'quadrant-i' : 'quadrant-iv' : y > 0 ? 'quadrant-ii' : 'quadrant-iii'

  it('derives all four answer identities from the plotted point signs', () => {
    const seen = new Set<string>()
    for (const problem of problems('quadrants')) {
      const display = displayOf(problem)
      dataOf(problem, 'quadrant')
      expect(display.plane.points).toHaveLength(1)
      const [point] = display.plane.points
      expect(point.x).not.toBe(0)
      expect(point.y).not.toBe(0)
      if (problem.answer.kind !== 'choice') throw new Error('quadrants: expected a choice answer')
      expect(problem.answer.id).toBe(quadrantFor(point))
      seen.add(problem.answer.id)
      expect((problem.choices ?? []).map((choice) => choice.id).sort()).toEqual([
        'quadrant-i',
        'quadrant-ii',
        'quadrant-iii',
        'quadrant-iv',
      ])
    }
    expect([...seen].sort()).toEqual(['quadrant-i', 'quadrant-ii', 'quadrant-iii', 'quadrant-iv'])
  })

  it('shuffles deterministically and reaches every correct-answer position', () => {
    const skill = unit16.find((entry) => entry.id === 'quadrants')
    if (!skill) throw new Error('quadrants: missing generator')
    const positions = new Set<number>()
    for (let seed = 0; seed < 200; seed += 1) {
      const first = generateProblem(skill, seed, 3)
      const second = generateProblem(skill, seed, 3)
      expect(first.choices).toEqual(second.choices)
      if (first.answer.kind !== 'choice') throw new Error('quadrants: expected a choice answer')
      const answerId = first.answer.id
      positions.add((first.choices ?? []).findIndex((choice) => choice.id === answerId))
    }
    expect([...positions].sort()).toEqual([0, 1, 2, 3])
    usesDifficultyReach('quadrants')
  })
})

describe('table-to-graph', () => {
  it('shows one exact collinear table and pre-plots only its non-target rows', () => {
    const rowShapes = new Set<string>()
    for (const problem of problems('table-to-graph')) {
      const display = displayOf(problem)
      const { rows, targetX } = dataOf(problem, 'table-to-graph')
      expect(rows).toHaveLength(3)
      expect(new Set(rows.map((point) => point.x)).size).toBe(3)
      const [first, second, third] = rows
      expect(
        BigInt(second.y - first.y) * BigInt(third.x - first.x),
      ).toBe(BigInt(third.y - first.y) * BigInt(second.x - first.x))
      const targets = rows.filter((point) => point.x === targetX)
      expect(targets).toHaveLength(1)
      expect(pointAnswerOf(problem)).toEqual(targets[0])
      expect(display.plane.points).toEqual(rows.filter((point) => point.x !== targetX))
      rowShapes.add(rows.map((point) => `${point.x},${point.y}`).join(';'))
    }
    expect(rowShapes.size).toBeGreaterThan(20)
  })

  it('keeps its swapped-row prediction wrong and placeable', () => {
    for (const problem of problems('table-to-graph')) {
      const display = displayOf(problem)
      const target = pointAnswerOf(problem)
      expect(predictionTags(problem)).toEqual(['table-coordinate-order-reversed'])
      expect(pointPredictions(problem)).toEqual([{ x: target.y, y: target.x }])
      expect(isCoordinateTarget(display.plane, pointPredictions(problem)[0])).toBe(true)
    }
    usesDifficultyReach('table-to-graph')
  })
})

const verifySlope = (problem: Problem, joined: boolean) => {
  const display = displayOf(problem)
  expect(display.plane.points).toHaveLength(2)
  expect(display.plane.lines).toHaveLength(joined ? 1 : 0)
  const [first, second] = display.plane.points
  if (joined) expect(display.plane.lines[0].through).toEqual([first, second])
  const rise = second.y - first.y
  const run = second.x - first.x
  expect(rise).not.toBe(0)
  expect(run).not.toBe(0)
  expect(Math.abs(rise)).not.toBe(Math.abs(run))
  const expected = rational(rise, run)
  expect(exactAnswerOf(problem)).toEqual({ kind: 'exact', ...expected })
  expect(gcd(expected.n, expected.d)).toBe(1)
  expect(problem.keypad?.allowFraction ?? false).toBe(
    [expected.n / expected.d, ...numericPredictions(problem)].some((value) => !Number.isInteger(value)),
  )
  expect(problem.keypad?.allowNegative ?? false).toBe(
    [expected.n / expected.d, ...numericPredictions(problem)].some((value) => value < 0),
  )
  return { rise, run, expected }
}

describe('slope-from-graph', () => {
  it('derives a finite non-unit slope from one line and two marked points', () => {
    for (const problem of problems('slope-from-graph')) {
      dataOf(problem, 'slope-from-graph')
      const { rise, run } = verifySlope(problem, true)
      expect(predictionTags(problem)).toEqual(['run-over-rise'])
      expect(numericPredictions(problem)).toEqual([run / rise])
    }
    usesDifficultyReach('slope-from-graph')
  })
})

describe('slope-from-points', () => {
  it('derives the slope from two unjoined points and preserves both wall diagnoses', () => {
    for (const problem of problems('slope-from-points')) {
      dataOf(problem, 'slope-from-points')
      const { rise, run, expected } = verifySlope(problem, false)
      expect(predictionTags(problem)).toEqual([
        'inconsistent-subtraction-order',
        'run-over-rise',
      ])
      expect(numericPredictions(problem)).toEqual([-rise / run, run / rise])
      expect(new Set(numericPredictions(problem)).size).toBe(2)
      expect(numericPredictions(problem)).not.toContain(expected.n / expected.d)
    }
    usesDifficultyReach('slope-from-points')
  })
})

describe('y-intercept', () => {
  it('derives an in-bounds integer intercept from the displayed line', () => {
    const signs = new Set<number>()
    for (const problem of problems('y-intercept')) {
      dataOf(problem, 'y-intercept')
      const display = displayOf(problem)
      expect(display.plane.lines).toHaveLength(1)
      expect(display.plane.points).toEqual([])
      const [first, second] = display.plane.lines[0].through
      const slope = (second.y - first.y) / (second.x - first.x)
      const intercept = first.y - slope * first.x
      expect(Number.isInteger(slope)).toBe(true)
      expect(slope).not.toBe(0)
      expect(Number.isInteger(intercept)).toBe(true)
      expect(exactAnswerOf(problem)).toEqual({ kind: 'exact', n: intercept, d: 1 })
      expect(isCoordinateTarget(display.plane, { x: 0, y: intercept })).toBe(true)
      expect(predictionTags(problem)).toEqual(['slope-as-intercept'])
      expect(numericPredictions(problem)).toEqual([slope])
      signs.add(Math.sign(intercept))
    }
    expect([...signs].sort()).toEqual([-1, 1])
    usesDifficultyReach('y-intercept')
  })
})

const integerLineValues = (problem: Problem) => {
  const display = displayOf(problem)
  expect(display.plane.lines).toHaveLength(1)
  expect(display.plane.points).toEqual([])
  const [first, second] = display.plane.lines[0].through
  const run = second.x - first.x
  const rise = second.y - first.y
  expect(run).not.toBe(0)
  expect(rise).not.toBe(0)
  const slope = rational(rise, run)
  const intercept = rational(first.y * run - rise * first.x, run)
  expect(slope.d).toBe(1)
  expect(intercept.d).toBe(1)
  return { slope: slope.n, intercept: intercept.n }
}

describe('slope-intercept', () => {
  it('matches either requested coefficient to the plotted equation', () => {
    const asks = new Set<string>()
    for (const problem of problems('slope-intercept')) {
      const data = dataOf(problem, 'slope-intercept')
      const { slope, intercept } = integerLineValues(problem)
      expect(data.slope).toBe(slope)
      expect(data.intercept).toBe(intercept)
      expect(data.intercept).not.toBe(data.slope)
      expect(exactAnswerOf(problem).n).toBe(
        data.asks === 'slope' ? slope : intercept,
      )
      expect(predictionTags(problem)).toEqual([
        data.asks === 'slope' ? 'intercept-as-slope' : 'slope-as-intercept',
      ])
      expect(numericPredictions(problem)).toEqual([data.asks === 'slope' ? intercept : slope])
      expect(problem.keypad?.allowNegative ?? false).toBe(
        [data.asks === 'slope' ? slope : intercept, data.asks === 'slope' ? intercept : slope].some((value) => value < 0),
      )
      asks.add(data.asks)
    }
    expect([...asks].sort()).toEqual(['intercept', 'slope'])
    usesDifficultyReach('slope-intercept')
  })
})

describe('graph-from-equation', () => {
  it('maps exactly one matching line to its styled text choice', () => {
    const linePositions = new Set<number>()
    const buttonPositions = new Set<number>()
    for (const problem of problems('graph-from-equation')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'graph-from-equation')
      expect(display.plane.points).toEqual([])
      expect(display.plane.lines).toHaveLength(2)
      const matches = display.plane.lines.filter((line) => {
        const [first, second] = line.through
        return second.y - first.y === data.slope * (second.x - first.x) && first.y === data.intercept + data.slope * first.x
      })
      expect(matches).toHaveLength(1)
      const lineIndex = display.plane.lines.indexOf(matches[0])
      linePositions.add(lineIndex)
      const answer = problem.answer
      if (answer.kind !== 'choice') throw new Error('graph-from-equation: expected choice answer')
      expect(answer.id).toBe(`line-${lineIndex + 1}`)
      const choices = problem.choices ?? []
      expect(choices.find((choice) => choice.id === 'line-1')?.label).toBe('Line 1 (solid)')
      expect(choices.find((choice) => choice.id === 'line-2')?.label).toBe('Line 2 (dashed)')
      buttonPositions.add(choices.findIndex((choice) => choice.id === answer.id))
      expect(predictionTags(problem)).toEqual(['intercept-sign-reversed'])
      const prediction = problem.misconceptions?.[0]?.value
      expect(prediction).toEqual({ kind: 'text', value: answer.id === 'line-1' ? 'line-2' : 'line-1' })
    }
    expect([...linePositions].sort()).toEqual([0, 1])
    expect(buttonPositions.size).toBe(2)
    usesDifficultyReach('graph-from-equation')
  })
})

describe('equation-from-graph', () => {
  it('derives an expanded expression and accepts an equivalent term order', () => {
    const shapes = new Set<string>()
    for (const problem of problems('equation-from-graph')) {
      const { slope, intercept } = integerLineValues(problem)
      const answer = problem.answer
      if (answer.kind !== 'expression') throw new Error('equation-from-graph: expected expression answer')
      expect(answer.variable).toBe('x')
      expect(answer.form).toBe('expanded')
      const coefficient = slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope}x`
      const canonical = intercept === 0 ? coefficient : `${coefficient}${intercept > 0 ? '+' : ''}${intercept}`
      expect(answer.canonical).toBe(canonical)
      expect(checkAnswer(answer, `${intercept}+${coefficient}`)).toEqual({ status: 'correct' })
      expect(problem.expression).toEqual({ variable: 'x' })
      expect(predictionTags(problem)).toEqual(['slope-intercept-swapped', 'intercept-sign-reversed'])
      shapes.add(canonical)
    }
    expect(shapes.size).toBeGreaterThan(20)
    usesDifficultyReach('equation-from-graph')
  })
})

describe('parallel-perpendicular', () => {
  it('uses exact rational slopes and reachable relationship predictions', () => {
    const relationships = new Set<string>()
    const sourceSlopes = new Set<string>()
    for (const problem of problems('parallel-perpendicular')) {
      const display = displayOf(problem)
      const data = dataOf(problem, 'parallel-perpendicular')
      expect(display.plane.lines).toHaveLength(1)
      expect(display.plane.points).toEqual([])
      const [first, second] = display.plane.lines[0].through
      const reference = rational(second.y - first.y, second.x - first.x)
      expect(reference.n).not.toBe(0)
      expect(reference.d).not.toBe(1)
      const expected = data.relationship === 'parallel' ? reference : rational(-reference.d, reference.n)
      expect(exactAnswerOf(problem)).toEqual({ kind: 'exact', ...expected })
      expect(problem.keypad?.allowFraction).toBe(true)
      expect(problem.keypad?.allowNegative).toBe(
        [expected.n / expected.d, ...numericPredictions(problem)].some((value) => value < 0),
      )
      if (data.relationship === 'parallel') {
        expect(predictionTags(problem)).toEqual(['negative-reciprocal-for-parallel'])
      } else {
        expect(predictionTags(problem)).toEqual(['unsigned-reciprocal', 'original-slope-kept'])
      }
      expect(numericPredictions(problem)).not.toContain(expected.n / expected.d)
      relationships.add(data.relationship)
      sourceSlopes.add(`${reference.n}/${reference.d}`)
    }
    expect([...relationships].sort()).toEqual(['parallel', 'perpendicular'])
    expect(sourceSlopes.size).toBeGreaterThan(8)
    expect([...sourceSlopes].some((slope) => slope.startsWith('-'))).toBe(true)
    expect([...sourceSlopes].some((slope) => !slope.startsWith('-'))).toBe(true)
    usesDifficultyReach('parallel-perpendicular')
  })
})
