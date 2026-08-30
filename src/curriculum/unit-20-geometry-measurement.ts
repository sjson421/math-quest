import { intAnswer } from '../lib/answer'
import {
  LENGTH_UNITS,
  type GeometryDiagram,
  type LengthUnit,
} from '../lib/geometry-diagram'
import { constrain } from '../lib/rng'
import { band, defineSkill, type BuildContext, type Ladder } from './engine'

/** Unit 20a · Geometry & Measurement. */

export const GED_PI = 3.14
export const ROUNDING_TOLERANCE = 0.05

export const roundToNearestTenth = (value: number): number => Math.round(value * 10) / 10

const RECTANGLE_LENGTH: Ladder = {
  1: [4, 8],
  2: [5, 12],
  3: [7, 16],
  4: [10, 24],
  5: [14, 32],
}

const RECTANGLE_WIDTH: Ladder = {
  1: [2, 5],
  2: [3, 7],
  3: [4, 10],
  4: [5, 14],
  5: [6, 18],
}

const POLYGON_MEASURE: Ladder = {
  1: [3, 8],
  2: [4, 11],
  3: [6, 16],
  4: [8, 23],
  5: [10, 32],
}

const CIRCLE_RADIUS: Ladder = {
  1: [3, 6],
  2: [4, 9],
  3: [6, 14],
  4: [8, 20],
  5: [10, 28],
}

const CIRCLE_DIAMETER: Ladder = {
  1: [6, 12],
  2: [8, 18],
  3: [12, 28],
  4: [16, 40],
  5: [20, 56],
}

const unit = (context: BuildContext): LengthUnit => context.rng.pick(LENGTH_UNITS)

const unitName = (value: LengthUnit): string => {
  switch (value) {
    case 'cm':
      return 'centimetres'
    case 'm':
      return 'metres'
    case 'in':
      return 'inches'
    case 'ft':
      return 'feet'
    default: {
      const unhandled: never = value
      throw new Error(`Unhandled length unit: ${unhandled}`)
    }
  }
}

const drawRectangle = (
  context: BuildContext,
  operation: 'perimeter' | 'area-rectangle',
): Extract<GeometryDiagram, { operation: 'perimeter' | 'area-rectangle' }> => {
  const lengthBand = band(context.difficulty, RECTANGLE_LENGTH)
  const widthBand = band(context.difficulty, RECTANGLE_WIDTH)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation,
      length: context.rng.int(...lengthBand),
      width: context.rng.int(...widthBand),
      unit: selectedUnit,
    }),
    (candidate) => candidate.length !== candidate.width,
  )
}

const drawTriangle = (context: BuildContext): Extract<GeometryDiagram, { operation: 'area-triangle' }> => {
  const [min, max] = band(context.difficulty, POLYGON_MEASURE)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'area-triangle' as const,
      base: context.rng.int(min, max),
      height: context.rng.int(min, max),
      unit: selectedUnit,
    }),
    (candidate) => {
      const answer = (candidate.base * candidate.height) / 2
      const omittedHalf = candidate.base * candidate.height
      const addedDimensions = candidate.base + candidate.height
      return Number.isInteger(answer) && new Set([answer, omittedHalf, addedDimensions]).size === 3
    },
  )
}

const drawParallelogram = (
  context: BuildContext,
): Extract<GeometryDiagram, { operation: 'area-parallelogram' }> => {
  const [min, max] = band(context.difficulty, POLYGON_MEASURE)
  return {
    kind: 'geometry',
    operation: 'area-parallelogram',
    base: context.rng.int(min, max),
    height: context.rng.int(min, max),
    unit: unit(context),
  }
}

const drawTrapezoid = (context: BuildContext): Extract<GeometryDiagram, { operation: 'area-trapezoid' }> => {
  const [min, max] = band(context.difficulty, POLYGON_MEASURE)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'area-trapezoid' as const,
      base1: context.rng.int(min, max),
      base2: context.rng.int(min, max),
      height: context.rng.int(min, max),
      unit: selectedUnit,
    }),
    (candidate) => candidate.base1 !== candidate.base2 && Number.isInteger(((candidate.base1 + candidate.base2) * candidate.height) / 2),
  )
}

const drawCircleRadius = (context: BuildContext): Extract<GeometryDiagram, { operation: 'circumference' }> => {
  const [min, max] = band(context.difficulty, CIRCLE_RADIUS)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'circumference' as const,
      radius: context.rng.int(min, max),
      unit: selectedUnit,
    }),
    (candidate) => {
      const answer = roundToNearestTenth(2 * GED_PI * candidate.radius)
      const radiusAsDiameter = roundToNearestTenth(GED_PI * candidate.radius)
      const areaFormula = roundToNearestTenth(GED_PI * candidate.radius ** 2)
      return new Set([answer, radiusAsDiameter, areaFormula]).size === 3
    },
  )
}

const drawCircleDiameter = (context: BuildContext): Extract<GeometryDiagram, { operation: 'area-circle' }> => {
  const [min, max] = band(context.difficulty, CIRCLE_DIAMETER)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'area-circle' as const,
      diameter: 2 * context.rng.int(Math.ceil(min / 2), Math.floor(max / 2)),
      unit: selectedUnit,
    }),
    (candidate) => {
      const radius = candidate.diameter / 2
      const answer = roundToNearestTenth(GED_PI * radius ** 2)
      const diameterSquared = roundToNearestTenth(GED_PI * candidate.diameter ** 2)
      const circumference = roundToNearestTenth(GED_PI * candidate.diameter)
      return new Set([answer, diameterSquared, circumference]).size === 3
    },
  )
}

const exactAreaPrompt = (shape: string, selectedUnit: LengthUnit): string =>
  `Find the area of this ${shape} in square ${unitName(selectedUnit)}.`

const perimeter = defineSkill({
  id: 'perimeter',
  name: 'Perimeter',
  blurb: 'Distance around a shape',
  teachingLine: 'Perimeter adds the lengths of every outer side.',
  build(context) {
    const data = drawRectangle(context, 'perimeter')
    const answer = 2 * data.length + 2 * data.width

    return {
      prompt: 'Find the perimeter of this rectangle.',
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Add both lengths and both widths.',
      solution: [
        { text: 'Add the two lengths.', detail: `${data.length} + ${data.length} = ${2 * data.length}` },
        { text: 'Add the two widths.', detail: `${data.width} + ${data.width} = ${2 * data.width}` },
        { text: 'Combine both totals.', detail: `${2 * data.length} + ${2 * data.width} = ${answer}` },
      ],
    }
  },
})

const areaRectangle = defineSkill({
  id: 'area-rectangle',
  name: 'Area of a Rectangle',
  blurb: 'Length times width',
  teachingLine: 'Area counts inside a rectangle by multiplying length and width.',
  build(context) {
    const data = drawRectangle(context, 'area-rectangle')
    const answer = data.length * data.width

    return {
      prompt: exactAreaPrompt('rectangle', data.unit),
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Multiply the length by the width.',
      solution: [
        { text: 'Multiply the length and width.', detail: `${data.length} × ${data.width} = ${answer}` },
        { text: `Write the area in square ${unitName(data.unit)}.`, detail: `${answer} square ${unitName(data.unit)}` },
      ],
    }
  },
})

const areaTriangle = defineSkill({
  id: 'area-triangle',
  name: 'Area of a Triangle',
  blurb: 'Half the base times the height',
  teachingLine: 'Triangle area is half its base times its perpendicular height.',
  build(context) {
    const data = drawTriangle(context)
    const answer = (data.base * data.height) / 2

    return {
      prompt: exactAreaPrompt('triangle', data.unit),
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: data.base * data.height,
          tag: 'omitted-triangle-half',
          nudge: 'Remember the one-half in the triangle area formula.',
        },
        {
          value: data.base + data.height,
          tag: 'added-triangle-dimensions',
          nudge: 'Multiply the dimensions instead of adding them.',
        },
      ],
      hint: 'Multiply base by height, then take half.',
      solution: [
        { text: 'Multiply base by height.', detail: `${data.base} × ${data.height} = ${data.base * data.height}` },
        { text: 'Take half the product.', detail: `${data.base * data.height} ÷ 2 = ${answer}` },
        { text: `Use square ${unitName(data.unit)} for area.`, detail: `${answer} square ${unitName(data.unit)}` },
      ],
    }
  },
})

const areaParallelogramTrapezoid = defineSkill({
  id: 'area-parallelogram-trapezoid',
  name: 'Parallelograms & Trapezoids',
  blurb: 'Two more area formulas',
  teachingLine: 'Parallelograms use base times height; trapezoids halve the sum of their bases times height.',
  build(context) {
    const data = context.rng.bool() ? drawParallelogram(context) : drawTrapezoid(context)
    if (data.operation === 'area-parallelogram') {
      const answer = data.base * data.height
      return {
        prompt: exactAreaPrompt('parallelogram', data.unit),
        display: { kind: 'diagram', diagram: data },
        answer: intAnswer(answer),
        hint: 'Use the formula matching the figure.',
        solution: [
          { text: 'Multiply base by perpendicular height.', detail: `${data.base} × ${data.height} = ${answer}` },
          { text: `Write square ${unitName(data.unit)} for area.`, detail: `${answer} square ${unitName(data.unit)}` },
        ],
      }
    }

    const answer = ((data.base1 + data.base2) * data.height) / 2
    return {
      prompt: exactAreaPrompt('trapezoid', data.unit),
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Use the formula matching the figure.',
      solution: [
        { text: 'Add the two bases.', detail: `${data.base1} + ${data.base2} = ${data.base1 + data.base2}` },
        { text: 'Multiply the sum by height.', detail: `${data.base1 + data.base2} × ${data.height} = ${(data.base1 + data.base2) * data.height}` },
        { text: 'Take half the product.', detail: `${(data.base1 + data.base2) * data.height} ÷ 2 = ${answer}` },
      ],
    }
  },
})

const circumference = defineSkill({
  id: 'circumference',
  name: 'Circumference',
  blurb: 'Distance around a circle',
  teachingLine: 'Circumference measures around a circle using its full width.',
  build(context) {
    const data = drawCircleRadius(context)
    const diameter = 2 * data.radius
    const answer = roundToNearestTenth(GED_PI * diameter)

    return {
      prompt: 'Find the circumference. Use π = 3.14 and round to the nearest tenth.',
      display: { kind: 'diagram', diagram: data },
      answer: { kind: 'approx', value: answer, tolerance: ROUNDING_TOLERANCE },
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: roundToNearestTenth(GED_PI * data.radius),
          tag: 'radius-as-diameter',
          nudge: 'The formula needs diameter, which is twice the radius.',
        },
        {
          value: roundToNearestTenth(GED_PI * data.radius ** 2),
          tag: 'area-for-circumference',
          nudge: 'Circumference is not the circle area.',
        },
      ],
      hint: 'Double the radius, then use circumference formula.',
      solution: [
        { text: 'Double the shown radius.', detail: `2 × ${data.radius} = ${diameter}` },
        { text: 'Multiply diameter by 3.14.', detail: `3.14 × ${diameter} = ${GED_PI * diameter}` },
        { text: 'Round to the nearest tenth.', detail: `${answer}` },
      ],
    }
  },
})

const areaCircle = defineSkill({
  id: 'area-circle',
  name: 'Area of a Circle',
  blurb: 'Space inside a circle',
  teachingLine: 'Square half the circle\'s width, then multiply by pi.',
  build(context) {
    const data = drawCircleDiameter(context)
    const radius = data.diameter / 2
    const answer = roundToNearestTenth(GED_PI * radius ** 2)

    return {
      prompt: 'Find the circle\'s area. Use π = 3.14 and round to the nearest tenth.',
      display: { kind: 'diagram', diagram: data },
      answer: { kind: 'approx', value: answer, tolerance: ROUNDING_TOLERANCE },
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: roundToNearestTenth(GED_PI * data.diameter ** 2),
          tag: 'squared-diameter',
          nudge: 'Square the radius, not the whole diameter.',
        },
        {
          value: roundToNearestTenth(GED_PI * data.diameter),
          tag: 'circumference-for-area',
          nudge: 'Area and circumference use different formulas.',
        },
      ],
      hint: 'Halve the diameter to get radius, then square it.',
      solution: [
        { text: 'Halve the shown diameter.', detail: `${data.diameter} ÷ 2 = ${radius}` },
        { text: 'Square the radius.', detail: `${radius} × ${radius} = ${radius ** 2}` },
        { text: 'Multiply by 3.14.', detail: `3.14 × ${radius ** 2} = ${GED_PI * radius ** 2}` },
        { text: 'Round to the nearest tenth.', detail: `${answer}` },
      ],
    }
  },
})

export const unit20: [typeof perimeter, typeof areaRectangle, typeof areaTriangle, typeof areaParallelogramTrapezoid, typeof circumference, typeof areaCircle] = [
  perimeter,
  areaRectangle,
  areaTriangle,
  areaParallelogramTrapezoid,
  circumference,
  areaCircle,
]
