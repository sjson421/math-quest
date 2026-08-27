import type { Coordinate, CoordinateLine, CoordinatePlane } from '../lib/coordinate-plane'
import { constrain } from '../lib/rng'
import type { Choice, CoordinateData, Difficulty, EquationData, Misconception, SkillGenerator } from '../lib/types'
import { defineSkill, drawn, type BuildContext } from './engine'

/** Unit 19 · Functions. */

const REACH: Record<Difficulty, number> = { 1: 4, 2: 5, 3: 6, 4: 8, 5: 10 }

const values = (reach: number): number[] =>
  Array.from({ length: reach * 2 + 1 }, (_, index) => index - reach)

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

const exact = (value: number) => ({ kind: 'exact' as const, n: value, d: 1 })

const functionTerm = (coefficient: number): string =>
  coefficient === 1 ? 'x' : coefficient === -1 ? '−x' : `${drawn(coefficient)}x`

const linearExpression = (coefficient: number, constant: number): string => {
  const term = functionTerm(coefficient)
  if (constant === 0) return term
  return `${term} ${constant > 0 ? '+' : '−'} ${drawn(Math.abs(constant))}`
}

const functionRule = (coefficient: number, constant: number): string =>
  `f(x) = ${linearExpression(coefficient, constant)}`

const inputLabel = (input: number): string => `f(${drawn(input)})`

const setValues = (points: readonly Coordinate[], axis: 'x' | 'y'): number[] =>
  [...new Set(points.map((point) => point[axis]))].sort((left, right) => left - right)

const setLabel = (valuesToShow: readonly number[]): string =>
  `{${valuesToShow.map(drawn).join(', ')}}`

const setId = (valuesToShow: readonly number[]): string =>
  `set-${valuesToShow.join('-')}`

const functionNotation = defineSkill({
  id: 'function-notation',
  name: 'Function Notation',
  blurb: 'f(x) is not multiplication',
  teachingLine: 'Function notation shows an input inside parentheses and its output after the equals sign.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const { input, output } = constrain(
      () => ({ input: rng.int(-reach, reach), output: rng.int(-reach, reach) }),
      (draw) => draw.input !== draw.output,
    )
    const correct = `The input ${drawn(input)} gives output ${drawn(output)}.`
    const multiplication = `Multiply f by ${drawn(input)} to get ${drawn(output)}.`
    const reversed = `Input ${drawn(output)} gives output ${drawn(input)}.`
    const multiplicationId = 'function-as-multiplication'
    const reversedId = 'input-output-reversed'
    const misconceptions: Misconception[] = [
      {
        value: { kind: 'text', value: multiplicationId },
        tag: multiplicationId,
        nudge: 'The notation names an input and output; it does not multiply f by the input.',
      },
      {
        value: { kind: 'text', value: reversedId },
        tag: reversedId,
        nudge: 'The number inside the parentheses is the input, and the other value is the output.',
      },
    ]
    const choices: Choice[] = [
      { id: 'input-to-output', label: correct },
      { id: multiplicationId, label: multiplication },
      { id: reversedId, label: reversed },
    ]

    return {
      prompt: 'What does this function notation say?',
      display: {
        kind: 'equation',
        text: `${inputLabel(input)} = ${drawn(output)}`,
        equation: { operation: 'function-notation', input, output } satisfies EquationData,
      },
      answer: { kind: 'choice', id: 'input-to-output' },
      inputMode: 'choice',
      choices: rng.shuffle(choices),
      misconceptions,
      hint: 'Read the input inside the parentheses and the output after the equals sign.',
      solution: [
        { text: `Find the input inside f( ).`, detail: `input = ${drawn(input)}` },
        { text: 'Read the value on the right as the output.', detail: `output = ${drawn(output)}` },
        { text: 'State the mapping in words.', detail: correct },
      ],
    }
  },
})

const evaluateFunction = defineSkill({
  id: 'evaluate-function',
  name: 'Evaluating a Function',
  blurb: 'Substitute into f(x)',
  teachingLine: 'Replace x with the given input, then calculate the output.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const draw = constrain(
      () => ({
        coefficient: rng.intExcept(-reach, reach, [0]),
        constant: rng.int(-reach, reach),
        input: rng.int(-reach, reach),
      }),
      ({ coefficient, constant, input }) => coefficient * input + constant !== 0 || difficulty === 1,
    )
    const output = draw.coefficient * draw.input + draw.constant
    const data: EquationData = {
      operation: 'evaluate-function',
      coefficient: draw.coefficient,
      constant: draw.constant,
      input: draw.input,
      inputLabel: inputLabel(draw.input),
    }

    return {
      prompt: `Evaluate the function at x = ${drawn(draw.input)}.`,
      display: {
        kind: 'equation',
        text: functionRule(draw.coefficient, draw.constant),
        variable: data.inputLabel,
        equation: data,
      },
      answer: exact(output),
      inputMode: 'keypad',
      keypad: {
        allowNegative: output < 0,
        maxLength: Math.max(2, String(Math.abs(output)).length),
      },
      hint: 'Substitute the named input for x, then simplify the rule.',
      solution: [
        { text: `Replace x with ${drawn(draw.input)}.`, detail: `${functionTerm(draw.coefficient)} → ${drawn(draw.coefficient)}(${drawn(draw.input)})` },
        { text: 'Multiply the coefficient and input.', detail: `${drawn(draw.coefficient * draw.input)}` },
        { text: `Add the constant ${drawn(draw.constant)}.`, detail: `${drawn(output)}` },
      ],
    }
  },
})

type RelationDraw = { points: Coordinate[]; linear: boolean }

const sameSlope = (points: readonly Coordinate[]): boolean => {
  const ordered = [...points].sort((left, right) => left.x - right.x)
  const first = ordered[0]
  const second = ordered[1]
  const run = BigInt(second.x - first.x)
  const rise = BigInt(second.y - first.y)
  return ordered.slice(2).every((point) =>
    BigInt(point.y - first.y) * run === rise * BigInt(point.x - first.x),
  )
}

const relationDraw = (rng: BuildContext['rng'], reach: number, count: number, wanted: boolean): RelationDraw => {
  if (wanted) {
    return constrain(
      () => {
        const xs = rng.shuffle(values(reach)).slice(0, count).sort((left, right) => left - right)
        const slope = rng.intExcept(-Math.max(1, Math.floor(reach / 3)), Math.max(1, Math.floor(reach / 3)), [0])
        const intercept = rng.int(-reach, reach)
        const points = xs.map((x) => ({ x, y: slope * x + intercept }))
        return { points, linear: true }
      },
      (draw) => draw.points.every((point) => Math.abs(point.y) <= reach),
    )
  }

  return constrain(
    () => {
      const xs = rng.shuffle(values(reach)).slice(0, count).sort((left, right) => left - right)
      const points = xs.map((x) => ({ x, y: rng.int(-reach, reach) }))
      return { points, linear: sameSlope(points) }
    },
    (draw) => !draw.linear,
  )
}

const domainRange = defineSkill({
  id: 'domain-range',
  name: 'Domain & Range',
  blurb: 'Inputs and outputs',
  teachingLine: 'The domain contains every input; the range contains every distinct output.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const count = difficulty <= 2 ? 3 : difficulty <= 4 ? 4 : 5
    const points = constrain(
      () => {
        const xs = rng.shuffle(values(reach)).slice(0, count)
        return xs.map((x) => ({ x, y: rng.int(-reach, reach) }))
      },
      (candidate) => setId(setValues(candidate, 'x')) !== setId(setValues(candidate, 'y')),
    )
    const asks: 'domain' | 'range' = rng.bool() ? 'domain' : 'range'
    const domain = setValues(points, 'x')
    const range = setValues(points, 'y')
    const correctValues = asks === 'domain' ? domain : range
    const oppositeValues = asks === 'domain' ? range : domain
    const correctLabel = setLabel(correctValues)
    const oppositeLabel = setLabel(oppositeValues)
    const correctId = setId(correctValues)
    const oppositeId = setId(oppositeValues)
    const choices: Choice[] = [
      { id: correctId, label: correctLabel },
      { id: oppositeId, label: oppositeLabel },
    ]

    return {
      prompt: `What is the ${asks} of this function?`,
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, points),
        coordinate: { operation: 'domain-range', asks } satisfies CoordinateData,
      },
      answer: { kind: 'choice', id: correctId },
      inputMode: 'choice',
      choices: rng.shuffle(choices),
      misconceptions: [
        {
          value: { kind: 'text', value: oppositeId },
          tag: 'domain-range-swapped',
          nudge: `Use the ${asks === 'domain' ? 'x' : 'y'}-coordinates for the ${asks}.`,
        },
      ],
      hint: `List each distinct ${asks === 'domain' ? 'x' : 'y'}-coordinate from the plotted points.`,
      solution: [
        { text: 'Read every plotted point.', detail: points.map((point) => `(${drawn(point.x)}, ${drawn(point.y)})`).join(', ') },
        { text: `Keep the distinct ${asks === 'domain' ? 'x' : 'y'}-values.`, detail: correctLabel },
      ],
    }
  },
})

const linearVsNonlinear = defineSkill({
  id: 'linear-vs-nonlinear',
  name: 'Linear or Not',
  blurb: 'Tell the two apart',
  teachingLine: 'A relationship is linear when its rate of change stays constant.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const count = difficulty <= 2 ? 3 : difficulty <= 4 ? 4 : 5
    const wanted = rng.bool()
    const draw = relationDraw(rng, reach, count, wanted)
    const answerId = wanted ? 'linear' : 'nonlinear'
    const answerLabel = wanted ? 'Linear' : 'Nonlinear'

    return {
      prompt: 'Is this relation linear or nonlinear?',
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, draw.points),
        coordinate: { operation: 'linear-vs-nonlinear' } satisfies CoordinateData,
      },
      answer: { kind: 'choice', id: answerId },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: 'linear', label: 'Linear' },
        { id: 'nonlinear', label: 'Nonlinear' },
      ]),
      hint: 'Compare the exact rate of change between consecutive points.',
      solution: [
        { text: 'Order the points by x-value.', detail: draw.points.map((point) => `(${drawn(point.x)}, ${drawn(point.y)})`).join(', ') },
        { text: 'Compare each consecutive slope.', detail: wanted ? 'Every slope matches.' : 'At least one slope changes.' },
        { text: 'Choose the matching classification.', detail: answerLabel },
      ],
    }
  },
})

type Rule = { slope: number; intercept: number }

const ruleRows = (rule: Rule): Coordinate[] => [-1, 0, 1].map((x) => ({ x, y: rule.slope * x + rule.intercept }))

const ruleValue = (rule: Rule, asks: 'slope' | 'intercept'): number =>
  asks === 'slope' ? rule.slope : rule.intercept

const compareFunctions = defineSkill({
  id: 'compare-functions',
  name: 'Comparing Functions',
  blurb: 'Table, graph, or equation',
  teachingLine: 'Compare matching rates of change or starting values across all three forms.',
  build({ rng, difficulty }: BuildContext) {
    const reach = REACH[difficulty]
    const asks: 'slope' | 'intercept' = rng.bool() ? 'slope' : 'intercept'
    const rules = constrain(
      () => {
        const slopes = rng.shuffle(values(reach).filter((value) => value !== 0)).slice(0, 3)
        const intercepts = rng.shuffle(values(Math.max(2, reach - 1))).slice(0, 3)
        return slopes.map((slope, index) => ({ slope, intercept: intercepts[index] }))
      },
      (candidate) => {
        const valuesToCompare = candidate.map((rule) => ruleValue(rule, asks))
        return new Set(valuesToCompare).size === 3
      },
    )
    const representations = rng.shuffle([
      { id: 'table', rule: rules[0] },
      { id: 'graph', rule: rules[1] },
      { id: 'equation', rule: rules[2] },
    ])
    const tableRule = representations.find((representation) => representation.id === 'table')!.rule
    const graphRule = representations.find((representation) => representation.id === 'graph')!.rule
    const equationRule = representations.find((representation) => representation.id === 'equation')!.rule
    const winner = representations.reduce((best, representation) =>
      ruleValue(representation.rule, asks) > ruleValue(best.rule, asks) ? representation : best,
    )
    const graphLine: CoordinateLine = {
      through: [
        { x: 0, y: graphRule.intercept },
        { x: 1, y: graphRule.slope + graphRule.intercept },
      ],
    }
    const data: CoordinateData = {
      operation: 'compare-functions',
      tableRows: ruleRows(tableRule),
      equationSlope: equationRule.slope,
      equationIntercept: equationRule.intercept,
      asks,
    }

    return {
      prompt: `Which representation has the greatest ${asks === 'slope' ? 'rate of change' : 'initial value'}?`,
      display: {
        kind: 'coordinate-plane',
        plane: plane(reach, [], [graphLine]),
        coordinate: data,
      },
      answer: { kind: 'choice', id: winner.id },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: 'table', label: 'Table' },
        { id: 'graph', label: 'Graph' },
        { id: 'equation', label: 'Equation' },
      ]),
      hint: `Compare each representation's ${asks === 'slope' ? 'slope' : 'value when x = 0'}.`,
      solution: [
        { text: 'Read the table rule from its rows.', detail: `m = ${drawn(tableRule.slope)}, b = ${drawn(tableRule.intercept)}` },
        {
          text: 'Read the graph or equation rule.',
          detail: asks === 'slope'
            ? `graph m = ${drawn(graphRule.slope)}, equation m = ${drawn(equationRule.slope)}`
            : `graph b = ${drawn(graphRule.intercept)}, equation b = ${drawn(equationRule.intercept)}`,
        },
        { text: 'Choose the greatest requested value.', detail: winner.id },
      ],
    }
  },
})

export const unit19: SkillGenerator[] = [
  functionNotation,
  evaluateFunction,
  domainRange,
  linearVsNonlinear,
  compareFunctions,
]
