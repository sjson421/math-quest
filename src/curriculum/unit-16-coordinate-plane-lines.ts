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
import { defineSkill, drawn, padFor, term, type BuildContext } from './engine'

/**
 * Unit 16 · Coordinate Plane & Lines.
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
  teachingLine: 'In an ordered pair, the first coordinate moves left or right and the second moves up or down.',
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
  teachingLine: 'A quadrant is one of four regions named counterclockwise from the upper right.',
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
  teachingLine: 'Each table row gives one point to place on the graph.',
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
  teachingLine: 'Slope is vertical change divided by horizontal change between two points.',
  build(context) {
    return slopeProblem(context, 'slope-from-graph')
  },
})

const slopeFromPoints = defineSkill({
  id: 'slope-from-points',
  name: 'Slope from Two Points',
  blurb: 'Use the formula',
  teachingLine: 'Find slope by subtracting both pairs in the same point order.',
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
  teachingLine: 'The y-intercept is where a line crosses the vertical axis.',
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

type IntegerLineDraw = {
  slope: number
  intercept: number
  through: [Coordinate, Coordinate]
}

const integerLineCache = new Map<string, IntegerLineDraw[]>()

/** Finite integer-slope draws whose defining points and optional wrong line fit. */
const integerLineDraws = (
  reach: number,
  mode: 'general' | 'graph-choice',
): IntegerLineDraw[] => {
  const key = `${reach}:${mode}`
  const cached = integerLineCache.get(key)
  if (cached) return cached

  const draws: IntegerLineDraw[] = []
  const maxSlope = Math.min(5, Math.max(2, Math.floor(reach / 2)))
  for (let slope = -maxSlope; slope <= maxSlope; slope += 1) {
    if (slope === 0) continue
    for (let intercept = -reach; intercept <= reach; intercept += 1) {
      if (mode === 'general' && intercept === slope) continue
      // The equation-from-graph predictions include a sign reversal; a zero
      // intercept would make that prediction equal to the target expression.
      if (mode === 'general' && intercept === 0) continue
      // The graph-choice diagnosis reverses the intercept sign, so zero would
      // collapse the named mistake into the correct line.
      if (mode === 'graph-choice' && intercept === 0) continue
      if (Math.abs(intercept + slope) > reach) continue
      if (mode === 'graph-choice' && Math.abs(-intercept + slope) > reach) continue
      draws.push({
        slope,
        intercept,
        through: [
          { x: 0, y: intercept },
          { x: 1, y: intercept + slope },
        ],
      })
    }
  }

  if (draws.length === 0) throw new Error(`integer coordinate lines: no draws at reach ${reach}`)
  integerLineCache.set(key, draws)
  return draws
}

const linearExpression = (slope: number, intercept: number): string => {
  const variableTerm = term(slope, 'x')
  if (intercept === 0) return variableTerm
  return `${variableTerm}${intercept > 0 ? '+' : ''}${intercept}`
}

const shownLinearExpression = (slope: number, intercept: number): string =>
  linearExpression(slope, intercept).replaceAll('-', '−')

type RationalLineDraw = {
  first: Coordinate
  second: Coordinate
  rise: number
  run: number
}

const rationalLineCache = new Map<number, RationalLineDraw[]>()

/** Separate lattice draws preserve the negative-reciprocal relationship. */
const rationalLineDraws = (reach: number): RationalLineDraw[] => {
  const cached = rationalLineCache.get(reach)
  if (cached) return cached

  const draws: RationalLineDraw[] = []
  const maxChange = Math.min(8, reach)
  for (let run = 2; run <= maxChange; run += 1) {
    for (let rise = -maxChange; rise <= maxChange; rise += 1) {
      if (rise === 0 || Math.abs(rise) === run) continue
      if (rational(rise, run).d === 1) continue
      for (let x = -reach; x + run <= reach; x += 1) {
        const minY = Math.max(-reach, -reach - rise)
        const maxY = Math.min(reach, reach - rise)
        for (let y = minY; y <= maxY; y += 1) {
          draws.push({
            first: { x, y },
            second: { x: x + run, y: y + rise },
            rise,
            run,
          })
        }
      }
    }
  }

  if (draws.length === 0) throw new Error(`parallel-perpendicular: no draws at reach ${reach}`)
  rationalLineCache.set(reach, draws)
  return draws
}

const slopeRelationship = (value: Rational, relationship: 'parallel' | 'perpendicular'): Rational =>
  relationship === 'parallel' ? value : rational(-value.d, value.n)

const slopeRelationshipMisconceptions = (
  value: Rational,
  relationship: 'parallel' | 'perpendicular',
): Misconception[] => {
  const reciprocal = rational(value.d, value.n)
  return relationship === 'parallel'
    ? [{
        value: toNumber(rational(-value.d, value.n)),
        tag: 'negative-reciprocal-for-parallel',
        nudge: 'Parallel lines keep the same slope; use the negative reciprocal for perpendicular lines.',
      }]
    : [
        {
          value: toNumber(reciprocal),
          tag: 'unsigned-reciprocal',
          nudge: 'A perpendicular slope is the negative reciprocal, so keep the sign change.',
        },
        {
          value: toNumber(value),
          tag: 'original-slope-kept',
          nudge: 'Perpendicular lines change to the negative reciprocal of the original slope.',
        },
      ]
}

const slopeIntercept = defineSkill({
  id: 'slope-intercept',
  name: 'Slope-Intercept Form',
  blurb: 'y = mx + b',
  teachingLine: 'In y = mx + b, m gives rise over run and b gives the vertical crossing.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(integerLineDraws(reach, 'general'))
    const asks = rng.bool() ? 'slope' as const : 'intercept' as const
    const answerValue = asks === 'slope' ? draw.slope : draw.intercept
    const predictionValue = asks === 'slope' ? draw.intercept : draw.slope
    const misconceptions: Misconception[] = [{
      value: predictionValue,
      tag: asks === 'slope' ? 'intercept-as-slope' : 'slope-as-intercept',
      nudge: asks === 'slope'
        ? 'The slope is the x coefficient; the constant is the y-intercept.'
        : 'The y-intercept is the constant; the x coefficient is the slope.',
    }]

    return {
      prompt: asks === 'slope' ? 'What is the slope?' : 'What is the y-intercept?',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], [{ through: draw.through }]),
        coordinate: { operation: 'slope-intercept', slope: draw.slope, intercept: draw.intercept, asks },
      },
      answer: exactAnswer(rational(answerValue, 1)),
      keypad: padFor(answerValue, misconceptions),
      misconceptions,
      hint: asks === 'slope'
        ? 'Read the coefficient of x in y = mx + b.'
        : 'Read the constant term in y = mx + b.',
      solution: asks === 'slope'
        ? [
            { text: 'Find the coefficient attached to x.', detail: `m = ${drawn(draw.slope)}` },
            { text: 'The coefficient is the slope.', detail: `slope = ${drawn(answerValue)}` },
          ]
        : [
            { text: 'Find the constant term.', detail: `b = ${drawn(draw.intercept)}` },
            { text: 'The constant is the y-intercept.', detail: `y-intercept = ${drawn(answerValue)}` },
          ],
    }
  },
})

const GRAPH_CHOICES: readonly Choice[] = [
  { id: 'line-1', label: 'Line 1 (solid)' },
  { id: 'line-2', label: 'Line 2 (dashed)' },
]

const graphFromEquation = defineSkill({
  id: 'graph-from-equation',
  name: 'Graphing an Equation',
  blurb: 'Choose the matching line',
  teachingLine: 'Use b for the vertical crossing, then m for rise over run.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(integerLineDraws(reach, 'graph-choice'))
    const wrongThrough: [Coordinate, Coordinate] = [
      { x: 0, y: -draw.intercept },
      { x: 1, y: draw.slope - draw.intercept },
    ]
    const matchingFirst = rng.bool()
    const lines = matchingFirst
      ? [{ through: draw.through }, { through: wrongThrough }]
      : [{ through: wrongThrough }, { through: draw.through }]
    const answerId = matchingFirst ? 'line-1' : 'line-2'
    const wrongId = matchingFirst ? 'line-2' : 'line-1'
    const misconceptions: Misconception[] = [{
      value: { kind: 'text', value: wrongId },
      tag: 'intercept-sign-reversed',
      nudge: 'Check the sign of the y-intercept before choosing a line.',
    }]

    return {
      prompt: 'Which line matches the equation?',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], lines),
        coordinate: { operation: 'graph-from-equation', slope: draw.slope, intercept: draw.intercept },
      },
      answer: { kind: 'choice', id: answerId },
      inputMode: 'choice',
      choices: rng.shuffle([...GRAPH_CHOICES]),
      misconceptions,
      hint: 'Match the slope and y-intercept, then identify its line style.',
      solution: [
        { text: 'Find the y-intercept at x equals zero.', detail: `b = ${drawn(draw.intercept)}` },
        { text: 'Check the rise for each run.', detail: `m = ${drawn(draw.slope)}` },
        { text: `Choose ${answerId === 'line-1' ? 'Line 1, solid' : 'Line 2, dashed'}.` },
      ],
    }
  },
})

const equationFromGraph = defineSkill({
  id: 'equation-from-graph',
  name: 'Equation from a Graph',
  blurb: 'Read off the slope and intercept',
  teachingLine: "Read the vertical crossing and rise over run to write the line's rule.",
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(integerLineDraws(reach, 'general'))
    const canonical = linearExpression(draw.slope, draw.intercept)
    const swapped = linearExpression(draw.intercept, draw.slope)
    const reversedIntercept = linearExpression(draw.slope, -draw.intercept)
    const misconceptions: Misconception[] = [
      {
        value: { kind: 'text', value: swapped },
        tag: 'slope-intercept-swapped',
        nudge: 'The x coefficient is the slope; the constant is the y-intercept.',
      },
      {
        value: { kind: 'text', value: reversedIntercept },
        tag: 'intercept-sign-reversed',
        nudge: 'Read the y-intercept sign where the line crosses the vertical axis.',
      },
    ]

    return {
      prompt: 'Write the right side of y = from this graph.',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], [{ through: draw.through }]),
        coordinate: { operation: 'equation-from-graph' },
      },
      answer: { kind: 'expression', canonical, variable: 'x', form: 'expanded' },
      inputMode: 'expression',
      misconceptions,
      hint: 'Read the slope and y-intercept, then write mx + b.',
      solution: [
        { text: 'Read the slope from the line.', detail: `m = ${drawn(draw.slope)}` },
        { text: 'Read where the line crosses y.', detail: `b = ${drawn(draw.intercept)}` },
        { text: 'Combine them as mx + b.', detail: `y = ${shownLinearExpression(draw.slope, draw.intercept)}` },
      ],
    }
  },
})

const parallelPerpendicular = defineSkill({
  id: 'parallel-perpendicular',
  name: 'Parallel & Perpendicular',
  blurb: 'Negative reciprocal slopes',
  teachingLine: 'Parallel lines keep the same slope; perpendicular lines use its negative reciprocal.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = rng.pick(rationalLineDraws(reach))
    const relationship = rng.bool() ? 'parallel' as const : 'perpendicular' as const
    const reference = rational(draw.rise, draw.run)
    const answer = slopeRelationship(reference, relationship)
    const misconceptions = slopeRelationshipMisconceptions(reference, relationship)
    const ratios = relationship === 'parallel'
      ? [answer, rational(-reference.d, reference.n)]
      : [answer, rational(reference.d, reference.n), reference]

    return {
      prompt: `What is the slope of a ${relationship} line?`,
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], [{ through: [draw.first, draw.second] }]),
        coordinate: { operation: 'parallel-perpendicular', relationship },
      },
      answer: exactAnswer(answer),
      keypad: slopeKeypad(ratios),
      misconceptions,
      hint: relationship === 'parallel'
        ? 'Parallel lines have equal slopes.'
        : 'Perpendicular slopes are negative reciprocals.',
      solution: relationship === 'parallel'
        ? [
            { text: 'Read the reference slope.', detail: `m = ${fractionText(reference)}` },
            { text: 'Parallel lines keep that slope.', detail: `parallel slope = ${fractionText(answer)}` },
          ]
        : [
            { text: 'Read the reference slope.', detail: `m = ${fractionText(reference)}` },
            { text: 'Swap numerator and denominator.', detail: `${fractionText(reference)} → ${drawn(reference.d)}/${Math.abs(reference.n)}` },
            { text: 'Change the sign for a negative reciprocal.', detail: `perpendicular slope = ${fractionText(answer)}` },
          ],
    }
  },
})

export const unit16: SkillGenerator[] = [
  plotPoints,
  quadrants,
  tableToGraph,
  slopeFromGraph,
  slopeFromPoints,
  yIntercept,
  slopeIntercept,
  graphFromEquation,
  equationFromGraph,
  parallelPerpendicular,
]
