import type { Coordinate, CoordinateLine, CoordinatePlane } from '../lib/coordinate-plane'
import type { KeypadRules } from '../lib/keypad'
import { rational, toNumber, type Rational } from '../lib/rational'
import type {
  Answer,
  Choice,
  Difficulty,
  Misconception,
  PointValue,
  SkillGenerator,
} from '../lib/types'
import { defineSkill, drawn, padFor, type BuildContext } from './engine'

/**
 * Unit 16a · Coordinate Plane & Lines.
 *
 * The generic plane deliberately knows no content operation. Each problem adds
 * that meaning beside the plane, and the global verifier derives the answer
 * from the same structured points, rows, or line the learner receives.
 *
 * All structural draws come from finite candidate sets. Bounds, non-zero
 * changes, point distinctness, and misconception survival are simultaneous
 * requirements here; making a random draw satisfy them by retry is the exact
 * pattern that exhausted Unit 2 in front of a learner.
 */

const REACH: Record<Difficulty, number> = { 1: 4, 2: 5, 3: 6, 4: 8, 5: 10 }

const plane = (
  reach: number,
  points: Coordinate[] = [],
  lines: CoordinateLine[] = [],
): CoordinatePlane => ({
  x: { min: -reach, max: reach, step: 1 },
  y: { min: -reach, max: reach, step: 1 },
  points,
  lines,
})

const pointValue = (point: Coordinate): PointValue => ({ kind: 'point', ...point })

const exactAnswer = (value: Rational): Answer => ({ kind: 'exact', ...value })

const values = (reach: number): number[] =>
  Array.from({ length: reach * 2 + 1 }, (_, index) => index - reach)

const nonAxisPoints = (reach: number): Coordinate[] =>
  values(reach).flatMap((x) =>
    values(reach)
      .filter((y) => x !== 0 && y !== 0)
      .map((y) => ({ x, y })),
  )

const plotPoints = defineSkill({
  id: 'plot-points',
  name: 'Plotting Points',
  blurb: 'Place a point on the grid',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const target = rng.pick(nonAxisPoints(reach).filter((point) => point.x !== point.y))
    const misconceptions: Misconception[] = [
      {
        value: pointValue({ x: target.y, y: target.x }),
        tag: 'coordinate-order-reversed',
        nudge: 'The first coordinate moves horizontally; the second moves vertically.',
      },
      {
        value: pointValue({ x: target.x, y: -target.y }),
        tag: 'vertical-direction-reversed',
        nudge: 'Positive y moves up and negative y moves down.',
      },
    ]

    return {
      prompt: 'Place this point on the plane.',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach),
        coordinate: { operation: 'plot-point', point: target },
      },
      answer: pointValue(target),
      inputMode: 'coordinate-plane',
      misconceptions,
      hint: 'Read x first for horizontal movement, then y for vertical movement.',
      solution: [
        {
          text: 'Use the first coordinate for horizontal position.',
          detail: `x = ${drawn(target.x)}`,
        },
        {
          text: 'Use the second coordinate for vertical position.',
          detail: `y = ${drawn(target.y)}`,
        },
      ],
    }
  },
})

const QUADRANTS: readonly Choice[] = [
  { id: 'quadrant-i', label: 'Quadrant I' },
  { id: 'quadrant-ii', label: 'Quadrant II' },
  { id: 'quadrant-iii', label: 'Quadrant III' },
  { id: 'quadrant-iv', label: 'Quadrant IV' },
]

const quadrantId = ({ x, y }: Coordinate): string =>
  x > 0
    ? y > 0 ? 'quadrant-i' : 'quadrant-iv'
    : y > 0 ? 'quadrant-ii' : 'quadrant-iii'

const quadrants = defineSkill({
  id: 'quadrants',
  name: 'Quadrants',
  blurb: 'Name the four regions',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const point = rng.pick(nonAxisPoints(reach))
    const answer = quadrantId(point)
    const verticalReflection = { x: point.x, y: -point.y }

    return {
      prompt: 'Which quadrant contains this point?',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [point]),
        coordinate: { operation: 'quadrant' },
      },
      answer: { kind: 'choice', id: answer },
      inputMode: 'choice',
      choices: rng.shuffle([...QUADRANTS]),
      misconceptions: [
        {
          value: { kind: 'text', value: quadrantId(verticalReflection) },
          tag: 'vertical-sign-misread',
          nudge: 'Check whether the y-coordinate places the point above or below zero.',
        },
      ],
      hint: 'Use the signs of x and y to identify the region.',
      solution: [
        {
          text: 'Read the signs of x and y.',
          detail: `x is ${point.x > 0 ? 'positive' : 'negative'}; y is ${point.y > 0 ? 'positive' : 'negative'}`,
        },
        {
          text: 'Match that sign pair to its quadrant.',
          detail: QUADRANTS.find((choice) => choice.id === answer)?.label,
        },
      ],
    }
  },
})

type TableDraw = { rows: [Coordinate, Coordinate, Coordinate]; targetIndex: number }

const tableCache = new Map<number, TableDraw[]>()

const tableDraws = (reach: number): TableDraw[] => {
  const cached = tableCache.get(reach)
  if (cached) return cached
  const draws: TableDraw[] = []

  for (const slope of [-2, -1, 1, 2]) {
    for (let intercept = -reach; intercept <= reach; intercept += 1) {
      for (let gap = 1; gap <= Math.max(1, Math.floor(reach / 3)); gap += 1) {
        for (let center = -reach + gap; center <= reach - gap; center += 1) {
          const rows = [center - gap, center, center + gap]
            .map((x) => ({ x, y: slope * x + intercept })) as [Coordinate, Coordinate, Coordinate]
          if (rows.some((point) => Math.abs(point.y) > reach)) continue
          for (let targetIndex = 0; targetIndex < rows.length; targetIndex += 1) {
            const target = rows[targetIndex]
            if (target.x === target.y) continue
            draws.push({ rows, targetIndex })
          }
        }
      }
    }
  }

  if (draws.length === 0) throw new Error(`table-to-graph: no draws at reach ${reach}`)
  tableCache.set(reach, draws)
  return draws
}

const tableToGraph = defineSkill({
  id: 'table-to-graph',
  name: 'Table to Graph',
  blurb: 'Plot a table of values',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const { rows, targetIndex } = rng.pick(tableDraws(reach))
    const target = rows[targetIndex]
    const plotted = rows.filter((_, index) => index !== targetIndex)

    return {
      prompt: 'Plot the highlighted table row.',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, plotted),
        coordinate: { operation: 'table-to-graph', rows, targetX: target.x },
      },
      answer: pointValue(target),
      inputMode: 'coordinate-plane',
      misconceptions: [
        {
          value: pointValue({ x: target.y, y: target.x }),
          tag: 'table-coordinate-order-reversed',
          nudge: 'The x column gives horizontal position and the y column gives vertical position.',
        },
      ],
      hint: 'Read both values across the highlighted row before plotting.',
      solution: [
        { text: 'Find the highlighted x-value.', detail: `x = ${drawn(target.x)}` },
        { text: 'Pair it with y from the same row.', detail: `y = ${drawn(target.y)}` },
        { text: 'Plot x across, then y vertically.', detail: drawnPoint(target) },
      ],
    }
  },
})

type LineDraw = { first: Coordinate; second: Coordinate; rise: number; run: number }

const lineCache = new Map<number, LineDraw[]>()

const lineDraws = (reach: number): LineDraw[] => {
  const cached = lineCache.get(reach)
  if (cached) return cached
  const draws: LineDraw[] = []
  const maxChange = Math.min(6, reach * 2)

  for (let run = 2; run <= maxChange; run += 1) {
    for (let rise = -maxChange; rise <= maxChange; rise += 1) {
      if (rise === 0 || Math.abs(rise) === run) continue
      for (let x = -reach; x + run <= reach; x += 1) {
        for (let y = -reach; y <= reach; y += 1) {
          if (Math.abs(y + rise) > reach) continue
          draws.push({ first: { x, y }, second: { x: x + run, y: y + rise }, rise, run })
        }
      }
    }
  }

  if (draws.length === 0) throw new Error(`coordinate slope: no draws at reach ${reach}`)
  lineCache.set(reach, draws)
  return draws
}

const slopeKeypad = (ratios: readonly Rational[]): KeypadRules | undefined => {
  const allowFraction = ratios.some((value) => value.d !== 1)
  const allowNegative = ratios.some((value) => value.n < 0)
  return allowFraction || allowNegative ? { allowFraction, allowNegative } : undefined
}

const slopeProblem = (
  context: BuildContext,
  operation: 'slope-from-graph' | 'slope-from-points',
) => {
  const reach = REACH[context.difficulty]
  const draw = context.rng.pick(lineDraws(reach))
  const points: [Coordinate, Coordinate] = [draw.first, draw.second]
  const answer = rational(draw.rise, draw.run)
  const reciprocal = rational(draw.run, draw.rise)
  const misconceptions: Misconception[] = [
    {
      value: toNumber(reciprocal),
      tag: 'run-over-rise',
      nudge: 'Slope is vertical change over horizontal change: rise over run.',
    },
  ]
  const ratios = [answer, reciprocal]

  if (operation === 'slope-from-points') {
    const inconsistentOrder = rational(-draw.rise, draw.run)
    misconceptions.unshift({
      value: toNumber(inconsistentOrder),
      tag: 'inconsistent-subtraction-order',
      nudge: 'Subtract both coordinate pairs in the same point order.',
    })
    ratios.push(inconsistentOrder)
  }

  return {
    prompt: operation === 'slope-from-graph'
      ? 'What is the slope of this line?'
      : 'Find the slope between these points.',
    display: {
      kind: 'coordinate-plane' as const,
      plane: plane(
        reach,
        points,
        operation === 'slope-from-graph' ? [{ through: points }] : [],
      ),
      coordinate: { operation },
    },
    answer: exactAnswer(answer),
    keypad: slopeKeypad(ratios),
    misconceptions,
    hint: 'Keep the point order consistent and divide rise by run.',
    solution: [
      {
        text: 'Subtract y-values in one point order.',
        detail: `${drawn(draw.second.y)} − ${drawn(draw.first.y)} = ${drawn(draw.rise)}`,
      },
      {
        text: 'Subtract x-values in that order too.',
        detail: `${drawn(draw.second.x)} − ${drawn(draw.first.x)} = ${drawn(draw.run)}`,
      },
      {
        text: 'Divide rise by run and reduce.',
        detail: `${drawn(draw.rise)}/${drawn(draw.run)} = ${fractionText(answer)}`,
      },
    ],
  }
}

const slopeFromGraph = defineSkill({
  id: 'slope-from-graph',
  name: 'Slope from a Graph',
  blurb: 'Rise over run',
  build(context) {
    return slopeProblem(context, 'slope-from-graph')
  },
})

const slopeFromPoints = defineSkill({
  id: 'slope-from-points',
  name: 'Slope from Two Points',
  blurb: 'Use the formula',
  build(context) {
    return slopeProblem(context, 'slope-from-points')
  },
})

type InterceptDraw = { slope: number; intercept: number; through: [Coordinate, Coordinate] }

const interceptCache = new Map<number, InterceptDraw[]>()

const interceptDraws = (reach: number): InterceptDraw[] => {
  const cached = interceptCache.get(reach)
  if (cached) return cached
  const draws: InterceptDraw[] = []

  for (const slope of [-2, -1, 1, 2]) {
    for (let intercept = -reach; intercept <= reach; intercept += 1) {
      if (intercept === 0 || intercept === slope) continue
      if (Math.abs(intercept + slope) > reach) continue
      draws.push({
        slope,
        intercept,
        through: [{ x: 0, y: intercept }, { x: 1, y: intercept + slope }],
      })
    }
  }

  if (draws.length === 0) throw new Error(`y-intercept: no draws at reach ${reach}`)
  interceptCache.set(reach, draws)
  return draws
}

const yIntercept = defineSkill({
  id: 'y-intercept',
  name: 'Y-Intercept',
  blurb: 'Where the line crosses',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(interceptDraws(reach))
    const misconceptions: Misconception[] = [
      {
        value: draw.slope,
        tag: 'slope-as-intercept',
        nudge: 'The y-intercept is where the line crosses the vertical axis.',
      },
    ]

    return {
      prompt: "What is this line's y-intercept?",
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], [{ through: draw.through }]),
        coordinate: { operation: 'y-intercept' },
      },
      answer: exactAnswer(rational(draw.intercept, 1)),
      keypad: padFor(draw.intercept, misconceptions),
      misconceptions,
      hint: 'Look where the line crosses the vertical axis at x equals zero.',
      solution: [
        { text: 'Find where the line meets the y-axis.' },
        { text: 'At that point, x is zero.' },
        { text: 'Read the y-value there.', detail: `y = ${drawn(draw.intercept)}` },
      ],
    }
  },
})

const drawnPoint = (point: Coordinate): string => `(${drawn(point.x)}, ${drawn(point.y)})`

const fractionText = (value: Rational): string =>
  value.d === 1 ? drawn(value.n) : `${drawn(value.n)}/${value.d}`

export const unit16: SkillGenerator[] = [
  plotPoints,
  quadrants,
  tableToGraph,
  slopeFromGraph,
  slopeFromPoints,
  yIntercept,
]
