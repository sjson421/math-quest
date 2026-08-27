import type { Coordinate, CoordinateLine, CoordinatePlane } from '../lib/coordinate-plane'
import {
  eliminationScale,
  lineEquation,
  linearEquationLabel,
  passSalesEquations,
  solveLinearSystem,
} from '../lib/linear-system'
import type {
  Difficulty,
  LinearEquation,
  Misconception,
  PointValue,
  SkillGenerator,
} from '../lib/types'
import { defineSkill, drawn, type BuildContext } from './engine'

const REACH: Record<Difficulty, number> = { 1: 4, 2: 5, 3: 6, 4: 8, 5: 10 }

const plane = (reach: number, lines: CoordinateLine[] = []): CoordinatePlane => ({
  x: { min: -reach, max: reach, step: 1 },
  y: { min: -reach, max: reach, step: 1 },
  points: [],
  lines,
})

const pointValue = (point: Coordinate): PointValue => ({ kind: 'point', ...point })

const targetCache = new Map<string, Coordinate[]>()

const targetPoints = (reach: number, nonnegative = false): Coordinate[] => {
  const key = `${reach}:${nonnegative}`
  const cached = targetCache.get(key)
  if (cached) return cached
  const min = nonnegative ? 1 : -reach + 1
  const points: Coordinate[] = []
  for (let x = min; x <= reach - 1; x += 1) {
    for (let y = min; y <= reach - 1; y += 1) {
      if (x === y || (!nonnegative && y === 0)) continue
      points.push({ x, y })
    }
  }
  targetCache.set(key, points)
  return points
}

const pointMisconceptions = (target: Coordinate): Misconception[] => [
  {
    value: pointValue({ x: target.y, y: target.x }),
    tag: 'coordinate-order-reversed',
    nudge: 'Enter x first, then y, in the stated order.',
  },
  {
    value: pointValue({ x: target.x, y: -target.y }),
    tag: 'vertical-direction-reversed',
    nudge: 'Positive y moves up and negative y moves down.',
  },
]

const lineThrough = (target: Coordinate, slope: number, reach: number): CoordinateLine | undefined => {
  for (const direction of [1, -1]) {
    for (let run = 1; run <= reach * 2; run += 1) {
      const second = {
        x: target.x + direction * run,
        y: target.y + direction * run * slope,
      }
      if (second.x >= -reach && second.x <= reach && second.y >= -reach && second.y <= reach) {
        return { through: [target, second] }
      }
    }
  }
  return undefined
}

type GraphDraw = { target: Coordinate; lines: [CoordinateLine, CoordinateLine] }
const graphCache = new Map<number, GraphDraw[]>()

const graphDraws = (reach: number): GraphDraw[] => {
  const cached = graphCache.get(reach)
  if (cached) return cached
  const draws: GraphDraw[] = []
  const slopes = [-2, -1, 1, 2]

  for (const target of targetPoints(reach)) {
    for (const firstSlope of slopes) {
      const first = lineThrough(target, firstSlope, reach)
      if (!first) continue
      for (const secondSlope of slopes) {
        if (secondSlope === firstSlope) continue
        const second = lineThrough(target, secondSlope, reach)
        if (!second) continue
        draws.push({ target, lines: [first, second] })
      }
    }
  }

  if (draws.length === 0) throw new Error(`system-by-graphing: no draws at reach ${reach}`)
  graphCache.set(reach, draws)
  return draws
}

const equationDetail = (equation: LinearEquation): string => linearEquationLabel(equation).visible

const systemByGraphing = defineSkill({
  id: 'system-by-graphing',
  name: 'Systems by Graphing',
  blurb: 'Where two lines meet',
  teachingLine: 'The point where both lines meet solves both equations.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(graphDraws(reach))
    const first = lineEquation(draw.lines[0])
    const second = lineEquation(draw.lines[1])
    if (!first || !second) throw new Error('system-by-graphing: generated a non-integer line')

    return {
      prompt: 'Place the intersection of the two lines.',
      display: {
        kind: 'coordinate-plane' as const,
        plane: plane(reach, draw.lines),
        coordinate: { operation: 'system-by-graphing' as const, variables: ['x', 'y'] as ['x', 'y'] },
      },
      answer: pointValue(draw.target),
      inputMode: 'coordinate-plane' as const,
      misconceptions: pointMisconceptions(draw.target),
      hint: 'Find where both lines meet, then enter x first and y second.',
      solution: [
        { text: 'Read the first line equation.', detail: equationDetail(first) },
        { text: 'Read the second line equation.', detail: equationDetail(second) },
        { text: 'Find their shared point.', detail: `(${drawn(draw.target.x)}, ${drawn(draw.target.y)})` },
      ],
    }
  },
})

type SubstitutionDraw = {
  target: Coordinate
  equations: [Extract<LinearEquation, { form: 'isolated' }>, Extract<LinearEquation, { form: 'standard' }>]
}
const substitutionCache = new Map<number, SubstitutionDraw[]>()

const substitutionDraws = (reach: number): SubstitutionDraw[] => {
  const cached = substitutionCache.get(reach)
  if (cached) return cached
  const draws: SubstitutionDraw[] = []
  const coefficients = [-3, -2, -1, 1, 2, 3]

  for (const target of targetPoints(reach)) {
    for (const slope of coefficients) {
      const isolated = { form: 'isolated' as const, slope, intercept: target.y - slope * target.x }
      for (const a of coefficients) {
        for (const b of coefficients) {
          const standard = { form: 'standard' as const, a, b, c: a * target.x + b * target.y }
          const solution = solveLinearSystem([isolated, standard])
          if (!solution || solution.x !== target.x || solution.y !== target.y) continue
          draws.push({ target, equations: [isolated, standard] })
        }
      }
    }
  }

  if (draws.length === 0) throw new Error(`substitution: no draws at reach ${reach}`)
  substitutionCache.set(reach, draws)
  return draws
}

const substitution = defineSkill({
  id: 'substitution',
  name: 'Substitution',
  blurb: 'Replace one variable',
  teachingLine: 'Replace an isolated letter with its equal expression in the other equation.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(substitutionDraws(reach))
    const [isolated, standard] = draw.equations

    return {
      prompt: 'Solve this system by substitution.',
      display: {
        kind: 'coordinate-plane' as const,
        plane: plane(reach),
        coordinate: {
          operation: 'system-substitution' as const,
          variables: ['x', 'y'] as ['x', 'y'],
          equations: draw.equations,
        },
      },
      answer: pointValue(draw.target),
      inputMode: 'coordinate-plane' as const,
      misconceptions: pointMisconceptions(draw.target),
      hint: 'Substitute the isolated expression into the other equation.',
      solution: [
        { text: 'Start with the isolated equation.', detail: equationDetail(isolated) },
        { text: 'Substitute it into the other equation.', detail: equationDetail(standard) },
        { text: 'Solve for x, then use y.', detail: `(${drawn(draw.target.x)}, ${drawn(draw.target.y)})` },
      ],
    }
  },
})

type StandardEquation = Extract<LinearEquation, { form: 'standard' }>
type EliminationDraw = {
  target: Coordinate
  equations: [StandardEquation, StandardEquation]
  scaleEquation: 0 | 1
  scaleFactor: number
  eliminate: 'x' | 'y'
  predictions: [Coordinate, Coordinate]
}

const inBounds = (point: Coordinate, reach: number): boolean =>
  Number.isInteger(point.x) && Number.isInteger(point.y) &&
  Math.abs(point.x) <= reach && Math.abs(point.y) <= reach

const scaledWithoutRightSide = (
  equations: [StandardEquation, StandardEquation],
  scaleEquation: 0 | 1,
  scaleFactor: number,
): Coordinate | undefined => {
  const altered = equations.map((equation, index) => {
    if (index !== scaleEquation) return equation
    return {
      form: 'standard' as const,
      a: equation.a * scaleFactor,
      b: equation.b * scaleFactor,
      c: equation.c,
    }
  }) as [StandardEquation, StandardEquation]
  return solveLinearSystem(altered)
}

const eliminatedBeforeScaling = (
  equations: [StandardEquation, StandardEquation],
  scaleEquation: 0 | 1,
  eliminate: 'x' | 'y',
): Coordinate | undefined => {
  const selected = equations[scaleEquation]
  const other = equations[scaleEquation === 0 ? 1 : 0]
  const numerator = selected.c - other.c
  const denominator = eliminate === 'x' ? selected.b - other.b : selected.a - other.a
  if (denominator === 0 || numerator % denominator !== 0) return undefined
  const remaining = numerator / denominator
  const raw = eliminate === 'x'
    ? { y: remaining, x: (selected.c - selected.b * remaining) / selected.a }
    : { x: remaining, y: (selected.c - selected.a * remaining) / selected.b }
  const point = {
    x: raw.x === 0 ? 0 : raw.x,
    y: raw.y === 0 ? 0 : raw.y,
  }
  return Number.isInteger(point.x) && Number.isInteger(point.y) ? point : undefined
}

const eliminationCache = new Map<number, EliminationDraw[]>()

const eliminationDraws = (reach: number): EliminationDraw[] => {
  const cached = eliminationCache.get(reach)
  if (cached) return cached
  const draws: EliminationDraw[] = []
  const baseValues = [-3, -2, -1, 1, 2, 3]
  const otherValues = [-3, -2, -1, 1, 2, 3]

  for (const target of targetPoints(reach)) {
    for (const eliminate of ['x', 'y'] as const) {
      for (const scaleEquation of [0, 1] as const) {
        for (const base of baseValues) {
          for (const factor of [2, 3]) {
            for (const selectedOther of otherValues) {
              for (const otherOther of otherValues) {
                const selected: StandardEquation = eliminate === 'x'
                  ? { form: 'standard', a: base, b: selectedOther, c: base * target.x + selectedOther * target.y }
                  : { form: 'standard', a: selectedOther, b: base, c: selectedOther * target.x + base * target.y }
                const other: StandardEquation = eliminate === 'x'
                  ? { form: 'standard', a: base * factor, b: otherOther, c: base * factor * target.x + otherOther * target.y }
                  : { form: 'standard', a: otherOther, b: base * factor, c: otherOther * target.x + base * factor * target.y }
                const equations = scaleEquation === 0
                  ? [selected, other] as [StandardEquation, StandardEquation]
                  : [other, selected] as [StandardEquation, StandardEquation]
                const otherVariable = eliminate === 'x' ? 'y' : 'x'
                const firstOther = otherVariable === 'x' ? equations[0].a : equations[0].b
                const secondOther = otherVariable === 'x' ? equations[1].a : equations[1].b
                if (Math.abs(firstOther) === Math.abs(secondOther)) continue
                const scale = eliminationScale(equations)
                if (!scale || scale.equation !== scaleEquation || scale.factor !== factor || scale.variable !== eliminate) continue
                const truePoint = solveLinearSystem(equations)
                if (!truePoint || truePoint.x !== target.x || truePoint.y !== target.y) continue
                const first = scaledWithoutRightSide(equations, scaleEquation, factor)
                const second = eliminatedBeforeScaling(equations, scaleEquation, eliminate)
                if (!first || !second || !inBounds(first, reach) || !inBounds(second, reach)) continue
                if (
                  (first.x === target.x && first.y === target.y) ||
                  (second.x === target.x && second.y === target.y) ||
                  (first.x === second.x && first.y === second.y)
                ) continue
                draws.push({
                  target,
                  equations,
                  scaleEquation,
                  scaleFactor: factor,
                  eliminate,
                  predictions: [first, second],
                })
              }
            }
          }
        }
      }
    }
  }

  if (draws.length === 0) throw new Error(`elimination: no draws at reach ${reach}`)
  eliminationCache.set(reach, draws)
  return draws
}

const elimination = defineSkill({
  id: 'elimination',
  name: 'Elimination',
  blurb: 'Cancel a variable out',
  teachingLine: 'Scale every term in one equation, then add or subtract to cancel one letter.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(eliminationDraws(reach))
    return {
      prompt: 'Solve this system by elimination.',
      display: {
        kind: 'coordinate-plane' as const,
        plane: plane(reach),
        coordinate: {
          operation: 'system-elimination' as const,
          variables: ['x', 'y'] as ['x', 'y'],
          equations: draw.equations,
          scaleEquation: draw.scaleEquation,
          scaleFactor: draw.scaleFactor,
          eliminate: draw.eliminate,
        },
      },
      answer: pointValue(draw.target),
      inputMode: 'coordinate-plane' as const,
      misconceptions: [
        {
          value: pointValue(draw.predictions[0]),
          tag: 'right-side-not-scaled',
          nudge: 'When you scale an equation, multiply its right side too.',
        },
        {
          value: pointValue(draw.predictions[1]),
          tag: 'eliminate-before-scaling',
          nudge: 'Scale first so the chosen variable really cancels.',
        },
      ],
      hint: `Scale equation ${draw.scaleEquation + 1}, then cancel ${draw.eliminate}.`,
      solution: [
        { text: `Scale equation ${draw.scaleEquation + 1} by ${draw.scaleFactor}.` },
        { text: `Cancel ${draw.eliminate} by subtracting the equations.` },
        { text: 'Solve for the remaining variable.' },
        { text: 'Substitute back for the ordered pair.', detail: `(${drawn(draw.target.x)}, ${drawn(draw.target.y)})` },
      ],
    }
  },
})

const PASS_PRICES = [12, 15, 18, 20, 24, 25, 30]

const systemWords = defineSkill({
  id: 'system-words',
  name: 'System Word Problems',
  blurb: 'Build two equations',
  teachingLine: 'Translate total count and total value into two equations, then solve them together.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const target = rng.pick(targetPoints(reach, true))
    const firstPrice = rng.pick(PASS_PRICES)
    const secondPrice = rng.pick(PASS_PRICES.filter((price) => price !== firstPrice))
    const source = {
      firstPrice,
      secondPrice,
      totalCount: target.x + target.y,
      totalRevenue: firstPrice * target.x + secondPrice * target.y,
    }
    const equations = passSalesEquations(source)

    return {
      prompt: 'Use the story to find both pass counts.',
      display: {
        kind: 'coordinate-plane' as const,
        plane: plane(reach),
        coordinate: {
          operation: 'system-words' as const,
          variables: ['x', 'y'] as ['x', 'y'],
          frameId: 'pass-sales' as const,
          ...source,
        },
      },
      answer: pointValue(target),
      inputMode: 'coordinate-plane' as const,
      misconceptions: pointMisconceptions(target),
      hint: 'Use the total count and total revenue as two equations.',
      solution: [
        { text: 'Let x count standard and y count premium passes.' },
        { text: 'Write the total-count equation.', detail: equationDetail(equations[0]) },
        { text: 'Write the revenue equation.', detail: equationDetail(equations[1]) },
        { text: 'Enter standard passes first, then premium.', detail: `(${drawn(target.x)}, ${drawn(target.y)})` },
      ],
    }
  },
})

export const unit17: SkillGenerator[] = [systemByGraphing, substitution, elimination, systemWords]

export {
  eliminatedBeforeScaling,
  eliminationDraws,
  graphDraws,
  scaledWithoutRightSide,
  substitutionDraws,
}
