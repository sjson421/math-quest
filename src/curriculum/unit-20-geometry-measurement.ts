import { intAnswer } from '../lib/answer'
import {
  LENGTH_UNITS,
  type GeometryDiagram,
  type LengthUnit,
} from '../lib/geometry-diagram'
import { constrain } from '../lib/rng'
import { band, defineSkill, type BuildContext, type Ladder } from './engine'

/** Unit 20 · Geometry & Measurement. */

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

const COMPOSITE_LENGTH: Ladder = {
  1: [8, 10],
  2: [10, 14],
  3: [13, 19],
  4: [17, 25],
  5: [22, 32],
}

const COMPOSITE_WIDTH: Ladder = {
  1: [6, 9],
  2: [8, 12],
  3: [10, 16],
  4: [14, 21],
  5: [18, 28],
}

const SOLID_LENGTH: Ladder = {
  1: [4, 8],
  2: [6, 12],
  3: [8, 16],
  4: [10, 22],
  5: [14, 30],
}

const SOLID_WIDTH: Ladder = {
  1: [3, 6],
  2: [4, 9],
  3: [5, 12],
  4: [7, 16],
  5: [9, 22],
}

const SOLID_HEIGHT: Ladder = {
  1: [3, 7],
  2: [4, 10],
  3: [6, 14],
  4: [8, 18],
  5: [10, 24],
}

const SOLID_RADIUS: Ladder = {
  1: [2, 5],
  2: [3, 7],
  3: [4, 10],
  4: [6, 14],
  5: [8, 20],
}

const PYTHAGOREAN_MULTIPLIER: Ladder = {
  1: [1, 1],
  2: [1, 2],
  3: [2, 3],
  4: [3, 5],
  5: [4, 7],
}

const SIMILAR_SMALL_LENGTH = RECTANGLE_LENGTH
const SIMILAR_SMALL_WIDTH = RECTANGLE_WIDTH

const SIMILAR_SCALE: Ladder = {
  1: [2, 2],
  2: [2, 3],
  3: [2, 4],
  4: [3, 5],
  5: [3, 6],
}

const PYTHAGOREAN_TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
] as const

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

const drawComposite = (context: BuildContext): Extract<GeometryDiagram, { operation: 'area-composite' }> => {
  const [lengthMin, lengthMax] = band(context.difficulty, COMPOSITE_LENGTH)
  const [widthMin, widthMax] = band(context.difficulty, COMPOSITE_WIDTH)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'area-composite' as const,
      outerLength: context.rng.int(lengthMin, lengthMax),
      outerWidth: context.rng.int(widthMin, widthMax),
      cutoutLength: context.rng.int(2, Math.max(2, lengthMax - 2)),
      cutoutWidth: context.rng.int(2, Math.max(2, widthMax - 2)),
      unit: selectedUnit,
    }),
    (candidate) => {
      const answer = candidate.outerLength * candidate.outerWidth - candidate.cutoutLength * candidate.cutoutWidth
      const bottom = candidate.outerLength * (candidate.outerWidth - candidate.cutoutWidth)
      const top = (candidate.outerLength - candidate.cutoutLength) * candidate.cutoutWidth
      return (
        candidate.cutoutLength < candidate.outerLength &&
        candidate.cutoutWidth < candidate.outerWidth &&
        answer > 0 &&
        bottom > 0 &&
        top > 0 &&
        bottom + top === answer &&
        new Set([answer, bottom, top]).size === 3
      )
    },
  )
}

const drawPrism = (context: BuildContext, operation: 'volume-prism' | 'surface-area'): Extract<GeometryDiagram, { operation: 'volume-prism' | 'surface-area' }> => {
  const [lengthMin, lengthMax] = band(context.difficulty, SOLID_LENGTH)
  const [widthMin, widthMax] = band(context.difficulty, SOLID_WIDTH)
  const [heightMin, heightMax] = band(context.difficulty, SOLID_HEIGHT)
  const selectedUnit = unit(context)

  return {
    kind: 'geometry',
    operation,
    length: context.rng.int(lengthMin, lengthMax),
    width: context.rng.int(widthMin, widthMax),
    height: context.rng.int(heightMin, heightMax),
    unit: selectedUnit,
  }
}

const drawRoundSolid = (
  context: BuildContext,
  operation: 'volume-cylinder' | 'volume-cone',
): Extract<GeometryDiagram, { operation: 'volume-cylinder' | 'volume-cone' }> => {
  const [radiusMin, radiusMax] = band(context.difficulty, SOLID_RADIUS)
  const [heightMin, heightMax] = band(context.difficulty, SOLID_HEIGHT)
  return {
    kind: 'geometry',
    operation,
    radius: context.rng.int(radiusMin, radiusMax),
    height: context.rng.int(heightMin, heightMax),
    unit: unit(context),
  }
}

const drawPyramid = (context: BuildContext): Extract<GeometryDiagram, { operation: 'volume-pyramid' }> => {
  const [lengthMin, lengthMax] = band(context.difficulty, SOLID_LENGTH)
  const [widthMin, widthMax] = band(context.difficulty, SOLID_WIDTH)
  const [heightMin, heightMax] = band(context.difficulty, SOLID_HEIGHT)
  const selectedUnit = unit(context)

  return constrain(
    () => ({
      kind: 'geometry' as const,
      operation: 'volume-pyramid' as const,
      baseLength: context.rng.int(lengthMin, lengthMax),
      baseWidth: context.rng.int(widthMin, widthMax),
      height: context.rng.int(heightMin, heightMax),
      unit: selectedUnit,
    }),
    (candidate) => Number.isInteger((candidate.baseLength * candidate.baseWidth * candidate.height) / 3),
  )
}

const drawSphere = (context: BuildContext): Extract<GeometryDiagram, { operation: 'volume-sphere' }> => {
  const [min, max] = band(context.difficulty, SOLID_RADIUS)
  return {
    kind: 'geometry',
    operation: 'volume-sphere',
    radius: context.rng.int(min, max),
    unit: unit(context),
  }
}

const drawPythagorean = (context: BuildContext): Extract<GeometryDiagram, { operation: 'pythagorean' }> => {
  const [multiplierMin, multiplierMax] = band(context.difficulty, PYTHAGOREAN_MULTIPLIER)
  const multiplier = context.rng.int(multiplierMin, multiplierMax)
  const [leg1, leg2, hypotenuse] = context.rng.pick(PYTHAGOREAN_TRIPLES)
  const selectedUnit = unit(context)

  return context.rng.bool()
    ? {
        kind: 'geometry',
        operation: 'pythagorean',
        missingSide: 'hypotenuse',
        leg1: leg1 * multiplier,
        leg2: leg2 * multiplier,
        unit: selectedUnit,
      }
    : {
        kind: 'geometry',
        operation: 'pythagorean',
        missingSide: 'leg',
        leg: leg1 * multiplier,
        hypotenuse: hypotenuse * multiplier,
        unit: selectedUnit,
      }
}

const drawSimilarFigures = (context: BuildContext): Extract<GeometryDiagram, { operation: 'similar-figures' }> => {
  const [lengthMin, lengthMax] = band(context.difficulty, SIMILAR_SMALL_LENGTH)
  const [widthMin, widthMax] = band(context.difficulty, SIMILAR_SMALL_WIDTH)
  const [scaleMin, scaleMax] = band(context.difficulty, SIMILAR_SCALE)
  const scale = context.rng.int(scaleMin, scaleMax)
  const knownSide = context.rng.bool() ? 'length' as const : 'width' as const
  const selectedUnit = unit(context)

  return constrain(
    () => {
      const smallLength = context.rng.int(lengthMin, lengthMax)
      const smallWidth = context.rng.int(widthMin, widthMax)
      const correspondingSmallSide = knownSide === 'length' ? smallLength : smallWidth
      const largeKnownSide = correspondingSmallSide * scale

      return {
        kind: 'geometry' as const,
        operation: 'similar-figures' as const,
        smallLength,
        smallWidth,
        largeKnownSide,
        knownSide,
        unit: selectedUnit,
      }
    },
    (candidate) => {
      const correspondingSmallSide = knownSide === 'length' ? candidate.smallLength : candidate.smallWidth
      const otherSmallSide = knownSide === 'length' ? candidate.smallWidth : candidate.smallLength
      const answer = otherSmallSide * scale
      const additiveSideChange = otherSmallSide + correspondingSmallSide * (scale - 1)
      return (
        candidate.smallLength !== candidate.smallWidth &&
        new Set([answer, candidate.largeKnownSide, additiveSideChange]).size === 3
      )
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

const compositeFigures = defineSkill({
  id: 'composite-figures',
  name: 'Composite Figures',
  blurb: 'Split the shape into pieces',
  teachingLine: 'Split a complex shape, then add each piece.',
  build(context) {
    const data = drawComposite(context)
    const outerArea = data.outerLength * data.outerWidth
    const cutoutArea = data.cutoutLength * data.cutoutWidth
    const bottomArea = data.outerLength * (data.outerWidth - data.cutoutWidth)
    const topArea = (data.outerLength - data.cutoutLength) * data.cutoutWidth
    const answer = outerArea - cutoutArea

    return {
      prompt: `Find the area of this composite figure in square ${unitName(data.unit)}.`,
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Split the L-shape into two rectangles, then add their areas.',
      solution: [
        { text: 'Find the bottom rectangle area.', detail: `${data.outerLength} × ${data.outerWidth - data.cutoutWidth} = ${bottomArea}` },
        { text: 'Find the top rectangle area.', detail: `${data.outerLength - data.cutoutLength} × ${data.cutoutWidth} = ${topArea}` },
        { text: 'Add both rectangle areas.', detail: `${bottomArea} + ${topArea} = ${answer}` },
        { text: `Use square ${unitName(data.unit)} for area.`, detail: `${answer} square ${unitName(data.unit)}` },
      ],
    }
  },
})

const volumePrism = defineSkill({
  id: 'volume-prism',
  name: 'Volume of a Prism',
  blurb: 'Base area times height',
  teachingLine: 'A prism\'s volume is its base size times its height.',
  build(context) {
    const data = drawPrism(context, 'volume-prism')
    const baseArea = data.length * data.width
    const answer = baseArea * data.height

    return {
      prompt: `Find the volume of this prism in cubic ${unitName(data.unit)}.`,
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Find the base area, then multiply by prism height.',
      solution: [
        { text: 'Find the rectangular base area.', detail: `${data.length} × ${data.width} = ${baseArea}` },
        { text: 'Multiply base area by height.', detail: `${baseArea} × ${data.height} = ${answer}` },
        { text: `Use cubic ${unitName(data.unit)} for volume.`, detail: `${answer} cubic ${unitName(data.unit)}` },
      ],
    }
  },
})

const volumeCylinder = defineSkill({
  id: 'volume-cylinder',
  name: 'Volume of a Cylinder',
  blurb: 'A round base, the same idea',
  teachingLine: 'A cylinder uses its circular base and height to find volume.',
  build(context) {
    const data = drawRoundSolid(context, 'volume-cylinder')
    const baseArea = GED_PI * data.radius ** 2
    const unrounded = baseArea * data.height
    const answer = roundToNearestTenth(unrounded)

    return {
      prompt: `Find the cylinder's volume in cubic ${unitName(data.unit)}. Use π = 3.14 and round to the nearest tenth.`,
      display: { kind: 'diagram', diagram: data },
      answer: { kind: 'approx', value: answer, tolerance: ROUNDING_TOLERANCE },
      keypad: { allowDecimal: true },
      hint: 'Square the radius, then multiply by height and 3.14.',
      solution: [
        { text: 'Square the radius.', detail: `${data.radius} × ${data.radius} = ${data.radius ** 2}` },
        { text: 'Multiply by height and 3.14.', detail: `3.14 × ${data.radius ** 2} × ${data.height} = ${unrounded}` },
        { text: 'Round to the nearest tenth.', detail: `${answer}` },
      ],
    }
  },
})

const volumeConePyramidSphere = defineSkill({
  id: 'volume-cone-pyramid-sphere',
  name: 'Cones, Pyramids & Spheres',
  blurb: 'The fractional volume formulas',
  teachingLine: 'Cones and pyramids use one-third; spheres use four-thirds.',
  build(context) {
    const operation = context.rng.pick(['volume-cone', 'volume-pyramid', 'volume-sphere'] as const)
    if (operation === 'volume-cone') {
      const data = drawRoundSolid(context, operation)
      const unrounded = (GED_PI * data.radius ** 2 * data.height) / 3
      const answer = roundToNearestTenth(unrounded)
      return {
        prompt: `Find the cone's volume in cubic ${unitName(data.unit)}. Use π = 3.14 and round to the nearest tenth.`,
        display: { kind: 'diagram', diagram: data },
        answer: { kind: 'approx', value: answer, tolerance: ROUNDING_TOLERANCE },
        keypad: { allowDecimal: true },
        hint: 'Find the circular base, multiply by height, then take one-third.',
        solution: [
          { text: 'Square the radius.', detail: `${data.radius} × ${data.radius} = ${data.radius ** 2}` },
          { text: 'Multiply by 3.14 and height.', detail: `3.14 × ${data.radius ** 2} × ${data.height} = ${GED_PI * data.radius ** 2 * data.height}` },
          { text: 'Take one-third and round.', detail: `${unrounded} ≈ ${answer}` },
        ],
      }
    }

    if (operation === 'volume-pyramid') {
      const data = drawPyramid(context)
      const baseArea = data.baseLength * data.baseWidth
      const product = baseArea * data.height
      const answer = product / 3
      return {
        prompt: `Find the pyramid's volume in cubic ${unitName(data.unit)}.`,
        display: { kind: 'diagram', diagram: data },
        answer: intAnswer(answer),
        hint: 'Find the rectangular base, multiply by height, then take one-third.',
        solution: [
          { text: 'Find the rectangular base area.', detail: `${data.baseLength} × ${data.baseWidth} = ${baseArea}` },
          { text: 'Multiply base area by height.', detail: `${baseArea} × ${data.height} = ${product}` },
          { text: 'Take one-third of the product.', detail: `${product} ÷ 3 = ${answer}` },
          { text: `Use cubic ${unitName(data.unit)} for volume.`, detail: `${answer} cubic ${unitName(data.unit)}` },
        ],
      }
    }

    const data = drawSphere(context)
    const unrounded = (4 * GED_PI * data.radius ** 3) / 3
    const answer = roundToNearestTenth(unrounded)
    return {
      prompt: `Find the sphere's volume in cubic ${unitName(data.unit)}. Use π = 3.14 and round to the nearest tenth.`,
      display: { kind: 'diagram', diagram: data },
      answer: { kind: 'approx', value: answer, tolerance: ROUNDING_TOLERANCE },
      keypad: { allowDecimal: true },
      hint: 'Cube the radius, multiply by 3.14, then use four-thirds.',
      solution: [
        { text: 'Cube the radius.', detail: `${data.radius} × ${data.radius} × ${data.radius} = ${data.radius ** 3}` },
        { text: 'Multiply by 4 and 3.14.', detail: `4 × 3.14 × ${data.radius ** 3} = ${4 * GED_PI * data.radius ** 3}` },
        { text: 'Divide by 3 and round.', detail: `${unrounded} ≈ ${answer}` },
      ],
    }
  },
})

const surfaceArea = defineSkill({
  id: 'surface-area',
  name: 'Surface Area',
  blurb: 'Add up every face',
  teachingLine: 'A net shows every face that must be added.',
  build(context) {
    const data = drawPrism(context, 'surface-area')
    const lengthWidth = data.length * data.width
    const lengthHeight = data.length * data.height
    const widthHeight = data.width * data.height
    const answer = 2 * lengthWidth + 2 * lengthHeight + 2 * widthHeight

    return {
      prompt: `Find the surface area of this prism in square ${unitName(data.unit)}.`,
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      hint: 'Add the areas of all six faces in the net.',
      solution: [
        { text: 'Find each pair of face areas.', detail: `${lengthWidth}, ${lengthHeight}, and ${widthHeight}` },
        { text: 'Double each pair for both faces.', detail: `2(${lengthWidth}) + 2(${lengthHeight}) + 2(${widthHeight})` },
        { text: 'Add all six face areas.', detail: `${2 * lengthWidth} + ${2 * lengthHeight} + ${2 * widthHeight} = ${answer}` },
        { text: `Use square ${unitName(data.unit)} for area.`, detail: `${answer} square ${unitName(data.unit)}` },
      ],
    }
  },
})

const pythagorean = defineSkill({
  id: 'pythagorean',
  name: 'Pythagorean Theorem',
  blurb: 'Find a missing side',
  teachingLine: 'The hypotenuse is longest and sits opposite the right angle.',
  build(context) {
    const data = drawPythagorean(context)
    if (data.missingSide === 'hypotenuse') {
      const sumOfSquares = data.leg1 ** 2 + data.leg2 ** 2
      const answer = Math.sqrt(sumOfSquares)
      const wrongPlacement = roundToNearestTenth(Math.sqrt(Math.abs(data.leg1 ** 2 - data.leg2 ** 2)))
      const unrooted = sumOfSquares
      return {
        prompt: `Find the missing side of this right triangle in ${unitName(data.unit)}.`,
        display: { kind: 'diagram', diagram: data },
        answer: intAnswer(answer),
        keypad: { allowDecimal: true },
        misconceptions: [
          {
            value: wrongPlacement,
            tag: 'wrong-hypotenuse-placement',
            nudge: 'Keep the hypotenuse alone; add the two leg squares.',
          },
          {
            value: unrooted,
            tag: 'stopped-before-square-root',
            nudge: 'Take the square root after adding the leg squares.',
          },
        ],
        hint: 'Add the leg squares, then take the square root.',
        solution: [
          { text: 'Square both known legs.', detail: `${data.leg1}² + ${data.leg2}² = ${sumOfSquares}` },
          { text: 'Take the square root.', detail: `√${sumOfSquares} = ${answer}` },
          { text: `Use ${unitName(data.unit)} for the missing side.`, detail: `${answer} ${unitName(data.unit)}` },
        ],
      }
    }

    const hypotenuseSquare = data.hypotenuse ** 2
    const knownLegSquare = data.leg ** 2
    const differenceOfSquares = hypotenuseSquare - knownLegSquare
    const answer = Math.sqrt(differenceOfSquares)
    const wrongPlacement = roundToNearestTenth(Math.sqrt(hypotenuseSquare + knownLegSquare))
    const unrooted = differenceOfSquares
    return {
      prompt: `Find the missing side of this right triangle in ${unitName(data.unit)}.`,
      display: { kind: 'diagram', diagram: data },
      answer: intAnswer(answer),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: wrongPlacement,
          tag: 'wrong-hypotenuse-placement',
          nudge: 'Keep the hypotenuse squared alone; subtract the known leg square.',
        },
        {
          value: unrooted,
          tag: 'stopped-before-square-root',
          nudge: 'Take the square root after subtracting the leg square.',
        },
      ],
      hint: 'Subtract the known leg square from the hypotenuse square, then root.',
      solution: [
        { text: 'Square the hypotenuse and known leg.', detail: `${data.hypotenuse}² − ${data.leg}² = ${differenceOfSquares}` },
        { text: 'Take the square root.', detail: `√${differenceOfSquares} = ${answer}` },
        { text: `Use ${unitName(data.unit)} for the missing side.`, detail: `${answer} ${unitName(data.unit)}` },
      ],
    }
  },
})

const similarFigures = defineSkill({
  id: 'similar-figures',
  name: 'Similar Figures',
  blurb: 'Same shape, scaled',
  teachingLine: 'Corresponding sides in similar figures use the same scale factor.',
  build(context) {
    const drawn = drawSimilarFigures(context)
    const correspondingSmallSide = drawn.knownSide === 'length' ? drawn.smallLength : drawn.smallWidth
    const otherSmallSide = drawn.knownSide === 'length' ? drawn.smallWidth : drawn.smallLength
    const scale = drawn.largeKnownSide / correspondingSmallSide
    const answer = otherSmallSide * scale
    const additiveSideChange = otherSmallSide + correspondingSmallSide * (scale - 1)

    return {
      prompt: `Find the missing side of the larger rectangle in ${unitName(drawn.unit)}.`,
      display: {
        kind: 'diagram',
        diagram: {
          kind: drawn.kind,
          operation: drawn.operation,
          smallLength: drawn.smallLength,
          smallWidth: drawn.smallWidth,
          largeKnownSide: drawn.largeKnownSide,
          knownSide: drawn.knownSide,
          unit: drawn.unit,
        },
      },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: drawn.largeKnownSide,
          tag: 'copied-known-large-side',
          nudge: 'Use the known pair to find the scale factor first.',
        },
        {
          value: additiveSideChange,
          tag: 'used-additive-side-change',
          nudge: 'Scale the matching side instead of adding a fixed difference.',
        },
      ],
      hint: 'Find the scale factor, then use it on the other small side.',
      solution: [
        {
          text: 'Divide the known large side by its matching small side.',
          detail: `${drawn.largeKnownSide} ÷ ${correspondingSmallSide} = ${scale}`,
        },
        {
          text: 'Use that scale factor on the other small side.',
          detail: `${otherSmallSide} × ${scale} = ${answer}`,
        },
        {
          text: `Write the missing side in ${unitName(drawn.unit)}.`,
          detail: `${answer} ${unitName(drawn.unit)}`,
        },
      ],
    }
  },
})

export const unit20: [
  typeof perimeter,
  typeof areaRectangle,
  typeof areaTriangle,
  typeof areaParallelogramTrapezoid,
  typeof circumference,
  typeof areaCircle,
  typeof compositeFigures,
  typeof volumePrism,
  typeof volumeCylinder,
  typeof volumeConePyramidSphere,
  typeof surfaceArea,
  typeof pythagorean,
  typeof similarFigures,
] = [
  perimeter,
  areaRectangle,
  areaTriangle,
  areaParallelogramTrapezoid,
  circumference,
  areaCircle,
  compositeFigures,
  volumePrism,
  volumeCylinder,
  volumeConePyramidSphere,
  surfaceArea,
  pythagorean,
  similarFigures,
]
