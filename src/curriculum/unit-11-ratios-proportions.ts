import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import { gcd, rational } from '../lib/rational'
import type { MathNotation, RatioData } from '../lib/types'
import { band, defineSkill, type BuildContext, type ProblemSpec } from './engine'
import { RATIO_FRAMES, ratioStoryProblem } from './phrasing/ratios'

/**
 * Unit 11 · Ratios & Proportions.
 *
 * The seven generators move from writing one directed comparison through equivalent
 * ratios, rates, scale drawings, measurement conversion, and ratio stories. Every prose or
 * notation display carries its source relation separately, so the global verifier
 * can rebuild both what the learner sees and the answer without trusting this file.
 */

const text = (value: string): MathNotation => ({ kind: 'text', value })

const fraction = (numerator: string, denominator: string): MathNotation => ({
  kind: 'fraction',
  numerator: text(numerator),
  denominator: text(denominator),
})

const exactRatio = (numerator: number, denominator: number, requireSimplified = false) => ({
  kind: 'exact' as const,
  ...rational(numerator, denominator),
  requireFraction: true as const,
  ...(requireSimplified ? { requireSimplified: true as const } : {}),
})

const countBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [2, 8],
    2: [3, 12],
    3: [5, 18],
    4: [8, 28],
    5: [12, 40],
  })

const drawRatioCounts = (context: BuildContext) => {
  const [min, max] = countBand(context)
  const first = context.rng.int(min, max)
  const second = constrain(
    () => context.rng.int(min, max),
    (candidate) => candidate !== first && first % candidate !== 0,
  )
  return { first, second }
}

const CATEGORY_PAIRS = [
  ['red tiles', 'blue tiles'],
  ['large boxes', 'small boxes'],
  ['morning buses', 'evening buses'],
  ['paper files', 'digital files'],
] as const

const writeRatios = defineSkill({
  id: 'write-ratios',
  name: 'Writing Ratios',
  blurb: 'Express a comparison',
  build(context) {
    const [firstLabel, secondLabel] = context.rng.pick(CATEGORY_PAIRS)
    const { first, second } = drawRatioCounts(context)
    const data: RatioData = {
      operation: 'write-ratio',
      firstLabel,
      secondLabel,
      first,
      second,
    }

    return {
      prompt: 'Write the requested ratio.',
      display: {
        kind: 'story',
        text: `${first} ${firstLabel} and ${second} ${secondLabel}; compare ${firstLabel} to ${secondLabel}.`,
        ratio: data,
      },
      answer: exactRatio(first, second),
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: second / first,
          tag: 'reversed-ratio-order',
          nudge: `Put ${firstLabel} first because that comparison was requested first.`,
        },
      ],
      hint: 'Write the first requested count over the second.',
      solution: [
        { text: 'Keep the requested order.', detail: `${firstLabel} to ${secondLabel}` },
        { text: 'Write the first count over the second.', detail: `${first}/${second}` },
      ],
    }
  },
})

const simplifyRatios = defineSkill({
  id: 'simplify-ratios',
  name: 'Simplifying Ratios',
  blurb: 'Reduce to lowest terms',
  build(context) {
    const [min, max] = band(context.difficulty, {
      1: [1, 5],
      2: [2, 7],
      3: [3, 9],
      4: [4, 12],
      5: [6, 16],
    })
    const firstBase = context.rng.int(min, max)
    const secondBase = constrain(
      () => context.rng.int(min + 1, max + 3),
      (candidate) => candidate !== firstBase && gcd(firstBase, candidate) === 1,
    )
    const factor = context.rng.int(2, context.difficulty + 3)
    const first = firstBase * factor
    const second = secondBase * factor
    const data: RatioData = { operation: 'simplify-ratio', first, second }

    return {
      prompt: 'Write this ratio in lowest terms.',
      display: {
        kind: 'math',
        notation: { kind: 'row', children: [text(String(first)), text(':'), text(String(second))] },
        label: `${first} to ${second}`,
        ratio: data,
      },
      answer: exactRatio(first, second, true),
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: firstBase / second,
          tag: 'divided-first-term-only',
          nudge: `Divide both terms by ${factor}, not only the first.`,
        },
        {
          value: first / secondBase,
          tag: 'divided-second-term-only',
          nudge: `Divide both terms by ${factor}, not only the second.`,
        },
      ],
      hint: 'Divide both terms by their greatest common factor.',
      solution: [
        { text: 'Find the greatest common factor.', detail: `GCF = ${factor}` },
        { text: 'Divide both terms by that factor.', detail: `${first}:${second} = ${firstBase}:${secondBase}` },
        { text: 'Enter the simplified ratio as a fraction.', detail: `${firstBase}/${secondBase}` },
      ],
    }
  },
})

const dollars = (cents: number) => `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`

const unitRate = defineSkill({
  id: 'unit-rate',
  name: 'Unit Rate',
  blurb: 'Which is the better value',
  build(context) {
    const [minRate, maxRate] = band(context.difficulty, {
      1: [2, 5],
      2: [3, 8],
      3: [5, 12],
      4: [8, 18],
      5: [12, 25],
    })
    const firstRate = context.rng.int(minRate, maxRate)
    const secondRate = constrain(
      () => context.rng.int(minRate, maxRate),
      (candidate) => candidate !== firstRate,
    )
    const firstCount = context.rng.int(2, context.difficulty + 4)
    const secondCount = constrain(
      () => context.rng.int(2, context.difficulty + 5),
      (candidate) => candidate !== firstCount,
    )
    const firstCents = firstRate * firstCount * 100
    const secondCents = secondRate * secondCount * 100
    const answer = firstRate < secondRate ? 'offer-a' : 'offer-b'
    const data: RatioData = {
      operation: 'unit-rate',
      firstCount,
      firstCents,
      secondCount,
      secondCents,
    }

    return {
      prompt: 'Which offer is the better value?',
      display: {
        kind: 'story',
        text: (
          `Offer A: ${firstCount} items for ${dollars(firstCents)}. ` +
          `Offer B: ${secondCount} items for ${dollars(secondCents)}.`
        ),
        ratio: data,
      },
      answer: { kind: 'choice', id: answer },
      inputMode: 'choice',
      choices: context.rng.shuffle([
        { id: 'offer-a', label: 'Offer A' },
        { id: 'offer-b', label: 'Offer B' },
      ]),
      hint: 'Divide each price by its item count.',
      solution: [
        { text: 'Find each price per item.', detail: `A: $${firstRate}; B: $${secondRate}` },
        { text: 'Choose the lower price per item.', detail: firstRate < secondRate ? 'Offer A' : 'Offer B' },
      ],
    }
  },
})

const proportionDisplay = (
  data: Extract<RatioData, { operation: 'solve-proportion' }>,
): ProblemSpec['display'] => {
  const shown = (key: typeof data.missing) => data.missing === key ? '?' : String(data[key])
  const leftNumerator = shown('leftNumerator')
  const leftDenominator = shown('leftDenominator')
  const rightNumerator = shown('rightNumerator')
  const rightDenominator = shown('rightDenominator')

  return {
    kind: 'math',
    notation: {
      kind: 'row',
      children: [
        fraction(leftNumerator, leftDenominator),
        text('='),
        fraction(rightNumerator, rightDenominator),
      ],
    },
    label: (
      `${leftNumerator} over ${leftDenominator} equals ` +
      `${rightNumerator} over ${rightDenominator}`
    ).replace('?', 'blank'),
    ratio: data,
  }
}

const solveProportions = defineSkill({
  id: 'solve-proportions',
  name: 'Solving Proportions',
  blurb: 'Cross-multiply',
  build(context) {
    const [min, max] = band(context.difficulty, {
      1: [2, 5],
      2: [3, 7],
      3: [4, 9],
      4: [6, 12],
      5: [8, 16],
    })
    const leftNumerator = context.rng.int(min, max)
    const leftDenominator = constrain(
      () => context.rng.int(min + 1, max + 3),
      (candidate) => candidate !== leftNumerator && gcd(leftNumerator, candidate) === 1,
    )
    const factor = context.rng.int(2, context.difficulty + 4)
    const rightNumerator = leftNumerator * factor
    const rightDenominator = leftDenominator * factor
    const missing = context.rng.bool() ? 'rightNumerator' as const : 'rightDenominator' as const
    const answer = missing === 'rightNumerator' ? rightNumerator : rightDenominator
    const data: Extract<RatioData, { operation: 'solve-proportion' }> = {
      operation: 'solve-proportion',
      leftNumerator,
      leftDenominator,
      rightNumerator,
      rightDenominator,
      missing,
    }

    return {
      prompt: 'Find the missing value.',
      display: proportionDisplay(data),
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: (missing === 'rightNumerator' ? leftNumerator : leftDenominator) + factor,
          tag: 'added-scale-factor',
          nudge: `The ratio scales by multiplication, not by adding ${factor}.`,
        },
      ],
      hint: 'Cross-multiply, then divide by the remaining number.',
      solution: [
        {
          text: 'Multiply across the known diagonal.',
          detail: missing === 'rightNumerator'
            ? `${leftNumerator} × ${rightDenominator} = ${leftNumerator * rightDenominator}`
            : `${leftDenominator} × ${rightNumerator} = ${leftDenominator * rightNumerator}`,
        },
        {
          text: 'Divide by the number beside the blank.',
          detail: missing === 'rightNumerator'
            ? `${leftNumerator * rightDenominator} ÷ ${leftDenominator} = ${answer}`
            : `${leftDenominator * rightNumerator} ÷ ${leftNumerator} = ${answer}`,
        },
      ],
    }
  },
})

const scaleDrawings = defineSkill({
  id: 'scale-drawings',
  name: 'Scale Drawings',
  blurb: 'Read a scaled measurement',
  build(context) {
    const scale = context.rng.int(2, context.difficulty * 3 + 3)
    const multiplier = context.rng.int(context.difficulty + 1, context.difficulty * 5 + 5)
    const direction = context.rng.bool() ? 'drawing-to-actual' as const : 'actual-to-drawing' as const
    const given = multiplier * scale
    const answer = direction === 'drawing-to-actual' ? given * scale : multiplier
    const wrong = direction === 'drawing-to-actual' ? multiplier : given * scale
    const data: RatioData = { operation: 'scale-drawing', scale, given, direction }

    return {
      prompt: direction === 'drawing-to-actual' ? 'Find the actual length in meters.' : 'Find the drawing length in centimeters.',
      display: {
        kind: 'story',
        text: (
          `Scale: 1 cm on the drawing represents ${scale} m. ` +
          `${direction === 'drawing-to-actual' ? `The drawing length is ${given} cm.` : `The actual length is ${given} m.`}`
        ),
        ratio: data,
      },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: wrong,
          tag: 'used-opposite-scale-direction',
          nudge: direction === 'drawing-to-actual' ? 'Actual length is larger, so multiply.' : 'Drawing length is smaller, so divide.',
        },
      ],
      hint: direction === 'drawing-to-actual' ? 'Multiply by the scale factor.' : 'Divide by the scale factor.',
      solution: [
        {
          text: direction === 'drawing-to-actual' ? 'Multiply by the scale factor.' : 'Divide by the scale factor.',
          detail: direction === 'drawing-to-actual'
            ? `${given} × ${scale} = ${answer}`
            : `${given} ÷ ${scale} = ${answer}`,
        },
      ],
    }
  },
})

type Conversion = {
  factor: number
  largeSingular: string
  largePlural: string
  smallSingular: string
  smallPlural: string
}

const CONVERSIONS: readonly Conversion[] = [
  { factor: 2, largeSingular: 'pint', largePlural: 'pints', smallSingular: 'cup', smallPlural: 'cups' },
  { factor: 3, largeSingular: 'yard', largePlural: 'yards', smallSingular: 'foot', smallPlural: 'feet' },
  { factor: 4, largeSingular: 'gallon', largePlural: 'gallons', smallSingular: 'quart', smallPlural: 'quarts' },
  { factor: 12, largeSingular: 'foot', largePlural: 'feet', smallSingular: 'inch', smallPlural: 'inches' },
  { factor: 16, largeSingular: 'pound', largePlural: 'pounds', smallSingular: 'ounce', smallPlural: 'ounces' },
  { factor: 100, largeSingular: 'meter', largePlural: 'meters', smallSingular: 'centimeter', smallPlural: 'centimeters' },
  { factor: 1000, largeSingular: 'kilometer', largePlural: 'kilometers', smallSingular: 'meter', smallPlural: 'meters' },
  { factor: 1000, largeSingular: 'liter', largePlural: 'liters', smallSingular: 'milliliter', smallPlural: 'milliliters' },
  { factor: 1000, largeSingular: 'kilogram', largePlural: 'kilograms', smallSingular: 'gram', smallPlural: 'grams' },
  { factor: 2, largeSingular: 'quart', largePlural: 'quarts', smallSingular: 'pint', smallPlural: 'pints' },
] as const

const unitConversion = defineSkill({
  id: 'unit-conversion',
  name: 'Unit Conversion',
  blurb: 'Convert between units',
  build(context) {
    const available = CONVERSIONS.slice(0, context.difficulty * 2)
    const conversion = context.rng.pick(available)
    const multiplier = context.rng.int(context.difficulty + 1, context.difficulty * 6 + 6)
    const direction = context.rng.bool() ? 'large-to-small' as const : 'small-to-large' as const
    const given = multiplier * conversion.factor
    const answer = direction === 'large-to-small' ? given * conversion.factor : multiplier
    const wrong = direction === 'large-to-small' ? multiplier : given * conversion.factor
    const sourceUnit = direction === 'large-to-small'
      ? given === 1 ? conversion.largeSingular : conversion.largePlural
      : given === 1 ? conversion.smallSingular : conversion.smallPlural
    const targetUnit = direction === 'large-to-small' ? conversion.smallPlural : conversion.largePlural
    const data: RatioData = { operation: 'unit-conversion', ...conversion, given, direction }

    return {
      prompt: `How many ${targetUnit} is that?`,
      display: {
        kind: 'story',
        text: `1 ${conversion.largeSingular} equals ${conversion.factor} ${conversion.smallPlural}. Convert ${given} ${sourceUnit}.`,
        ratio: data,
      },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: wrong,
          tag: 'used-opposite-conversion-direction',
          nudge: direction === 'large-to-small' ? 'Smaller units need a larger count, so multiply.' : 'Larger units need a smaller count, so divide.',
        },
      ],
      hint: direction === 'large-to-small' ? 'Multiply by the stated conversion factor.' : 'Divide by the stated conversion factor.',
      solution: [
        {
          text: direction === 'large-to-small' ? 'Multiply by the conversion factor.' : 'Divide by the conversion factor.',
          detail: direction === 'large-to-small'
            ? `${given} × ${conversion.factor} = ${answer}`
            : `${given} ÷ ${conversion.factor} = ${answer}`,
        },
      ],
    }
  },
})

const ratioWords = defineSkill({
  id: 'ratio-words',
  name: 'Ratio Word Problems',
  blurb: 'Spot the ratio',
  build(context) {
    const { first, second } = drawRatioCounts(context)
    const frame = context.rng.pick(RATIO_FRAMES)
    const comparison = context.rng.bool() ? 'part-to-part' as const : 'part-to-whole' as const

    return ratioStoryProblem(frame, { first, second }, comparison)
  },
})

export const unit11 = [
  writeRatios,
  simplifyRatios,
  unitRate,
  solveProportions,
  scaleDrawings,
  unitConversion,
  ratioWords,
]
