import { intAnswer } from '../lib/answer'
import { decimalText } from '../lib/decimal'
import { gcd, rational } from '../lib/rational'
import { band, defineSkill, type BuildContext } from './engine'

/**
 * Unit 10 · Percents — increment 10a.
 *
 * The first four skills read a percent as N parts out of 100 and convert it to
 * and from the two other rational notations; `percent-of` applies it to a
 * quantity. Every answer is a plain whole number, an existing decimal `exact`
 * answer, or an existing fraction `exact` answer — no new capability or
 * `Answer` flag. Percent text ("N%", "N% of M") is not an arithmetic
 * expression the independent verifier can evaluate, so each display also
 * carries `wholeNumber`/`decimal` semantic data — the same mechanism Unit 0's
 * `absolute-value` and Unit 9's `display` operation use for the same reason.
 */

const exactAnswer = (coefficient: number, scale: number) => ({
  kind: 'exact' as const,
  ...rational(coefficient, 10 ** scale),
})

const exactFraction = (numerator: number, denominator: number) => ({
  kind: 'exact' as const,
  ...rational(numerator, denominator),
})

const percentBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [1, 20],
    2: [1, 40],
    3: [1, 60],
    4: [1, 80],
    5: [1, 99],
  })

const percentMeaning = defineSkill({
  id: 'percent-meaning',
  name: 'What a Percent Is',
  blurb: 'Out of 100',
  build(context) {
    const [min, max] = percentBand(context)
    const count = context.rng.int(min, max)
    const asPercent = context.rng.bool()

    return {
      prompt: asPercent ? 'Write this percent as parts out of 100.' : 'Write this as a percent.',
      display: {
        kind: 'inline',
        text: asPercent ? `${count}%` : `${count} out of 100`,
        wholeNumber: { operation: asPercent ? 'percent-of-hundred' : 'parts-of-hundred', value: count },
      },
      answer: intAnswer(count),
      misconceptions: [
        {
          value: count / 100,
          tag: 'wrote-decimal-form',
          nudge: `Write the count itself, ${count}, not a decimal.`,
        },
      ],
      hint: 'A percent is a count out of 100.',
      solution: [{ text: `${count}% means ${count} out of 100.` }],
    }
  },
})

const percentToDecimal = defineSkill({
  id: 'percent-to-decimal',
  name: 'Percent to Decimal',
  blurb: 'Move the point left',
  build(context) {
    const [min, max] = percentBand(context)
    const percent = context.rng.int(min, max)

    return {
      prompt: 'Write this percent as a decimal.',
      display: { kind: 'inline', text: `${percent}%`, wholeNumber: { operation: 'percent-rational', value: percent } },
      answer: exactAnswer(percent, 2),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: percent,
          tag: 'left-as-whole-number',
          nudge: 'Divide by 100 by moving the decimal point two places left.',
        },
      ],
      hint: 'Divide by 100: move the decimal point two places left.',
      solution: [
        { text: 'Move the decimal point two places left.', detail: `${percent}% → ${decimalText({ coefficient: percent, scale: 2 })}` },
      ],
    }
  },
})

const decimalToPercent = defineSkill({
  id: 'decimal-to-percent',
  name: 'Decimal to Percent',
  blurb: 'Move the point right',
  build(context) {
    const [min, max] = percentBand(context)
    const percent = context.rng.int(min, max)
    const value = { coefficient: percent, scale: 2 as const }

    return {
      prompt: 'Write this decimal as a percent.',
      display: { kind: 'inline', text: decimalText(value), decimal: { operation: 'to-percent', value } },
      answer: intAnswer(percent),
      misconceptions: [
        {
          value: percent / 100,
          tag: 'unmoved-point',
          nudge: 'Move the decimal point two places right before writing the percent.',
        },
        {
          value: percent / 10,
          tag: 'shifted-one-place',
          nudge: 'Move the decimal point two places right, not one.',
        },
      ],
      hint: 'Multiply by 100: move the decimal point two places right.',
      solution: [{ text: 'Move the decimal point two places right.', detail: `${decimalText(value)} → ${percent}%` }],
    }
  },
})

const percentToFraction = defineSkill({
  id: 'percent-to-fraction',
  name: 'Percent to Fraction',
  blurb: 'Over 100, then simplify',
  build(context) {
    const [min, max] = percentBand(context)
    const percent = context.rng.int(min, max)

    return {
      prompt: 'Write this percent as a fraction in lowest terms.',
      display: { kind: 'inline', text: `${percent}%`, wholeNumber: { operation: 'percent-rational', value: percent } },
      answer: { ...exactFraction(percent, 100), requireSimplified: true },
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: percent,
          tag: 'numerator-only',
          nudge: `Use 100 as the denominator, then simplify ${percent}/100.`,
        },
      ],
      hint: 'Write it over 100, then simplify.',
      solution: [
        { text: 'Write the percent over 100.', detail: `${percent}/100` },
        { text: 'Simplify to lowest terms.' },
      ],
    }
  },
})

/** Percents that divide 100 with a small denominator, so every draw's part is exact. */
const PERCENT_OF_FACTORS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90] as const

const multiplierBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [1, 4],
    2: [1, 6],
    3: [2, 10],
    4: [2, 16],
    5: [3, 20],
  })

const percentOf = defineSkill({
  id: 'percent-of',
  name: 'Percent Of',
  blurb: '15% of 80',
  build(context) {
    const percent = context.rng.pick(PERCENT_OF_FACTORS)
    const g = gcd(100, percent)
    const unit = 100 / g
    const multiplier = percent / g
    const [minK, maxK] = multiplierBand(context)
    const k = context.rng.int(minK, maxK)
    const quantity = unit * k
    const part = multiplier * k

    return {
      prompt: 'What is the result?',
      display: { kind: 'inline', text: `${percent}% of ${quantity}`, wholeNumber: { operation: 'percent-of', percent, quantity } },
      answer: intAnswer(part),
      misconceptions: [
        {
          value: quantity + percent,
          tag: 'added-instead-of-multiplied',
          nudge: `Multiply ${quantity} by ${percent}%; do not add them.`,
        },
      ],
      hint: 'Multiply the quantity by the percent, then divide by 100.',
      solution: [
        { text: 'Convert the percent to a decimal.', detail: `${percent}% → ${decimalText({ coefficient: percent, scale: 2 })}` },
        { text: 'Multiply by the quantity.', detail: `${decimalText({ coefficient: percent, scale: 2 })} × ${quantity} = ${part}` },
      ],
    }
  },
})

export const unit10 = [percentMeaning, percentToDecimal, decimalToPercent, percentToFraction, percentOf]
