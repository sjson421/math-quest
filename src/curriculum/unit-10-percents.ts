import { intAnswer } from '../lib/answer'
import { decimalText } from '../lib/decimal'
import { gcd, rational } from '../lib/rational'
import { band, defineSkill, type BuildContext } from './engine'

/**
 * Unit 10 · Percents.
 *
 * The first four skills read a percent as N parts out of 100 and convert it to
 * and from the two other rational notations; `percent-of` applies it to a
 * quantity. The remaining five reverse those relationships and apply them to
 * percent change, money, and simple interest. Every answer is a plain whole
 * number, an existing decimal `exact` answer, or an existing fraction `exact`
 * answer — no new capability or `Answer` flag. Percent text is not an arithmetic
 * expression the independent verifier can evaluate, so each display also
 * carries structured semantic data — the same mechanism Unit 0's
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
  teachingLine: 'A percent tells how many parts out of 100.',
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
  teachingLine: 'Divide a percent by 100, moving the decimal point two places left.',
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
  teachingLine: 'Multiply a decimal by 100 to write its percent.',
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
  teachingLine: 'Write the percent over 100, then reduce the fraction.',
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
  teachingLine: 'Multiply the quantity by the percent written as a decimal.',
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

/** Rates whose inverse predictions are distinct, finite keypad decimals. */
const INVERSE_PERCENT_BAND = {
  1: [20, 25, 50],
  2: [20, 25, 40, 50],
  3: [5, 20, 25, 40, 50],
  4: [5, 20, 25, 40, 50, 80],
  5: [5, 20, 25, 40, 50, 80],
} satisfies Record<BuildContext['difficulty'], readonly number[]>

const relationScaleBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [2, 6],
    2: [3, 10],
    3: [5, 15],
    4: [8, 22],
    5: [12, 32],
  })

const scalePercent = (context: BuildContext, percent: number) => {
  const g = gcd(100, percent)
  const [minScale, maxScale] = relationScaleBand(context)
  const scale = context.rng.int(minScale, maxScale)

  return {
    whole: (100 / g) * scale,
    part: (percent / g) * scale,
  }
}

const drawPercentRelation = (context: BuildContext) => {
  const percent = context.rng.pick(INVERSE_PERCENT_BAND[context.difficulty])

  return {
    percent,
    ...scalePercent(context, percent),
  }
}

const findThePercent = defineSkill({
  id: 'find-the-percent',
  name: 'Finding the Percent',
  blurb: '12 is what percent of 60',
  teachingLine: 'Divide the part by the whole, then multiply by 100.',
  build(context) {
    const { percent, whole, part } = drawPercentRelation(context)
    const ratio = part / whole

    return {
      prompt: 'Find the percent.',
      display: {
        kind: 'story',
        text: `${part} is what percent of ${whole}?`,
        percent: { operation: 'find-percent', part, whole },
      },
      answer: intAnswer(percent),
      // Both wall predictions can be decimal, so the pad has to make the
      // diagnosed entries possible even though the correct answer is whole.
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: ratio,
          tag: 'left-as-ratio',
          nudge: 'That is the decimal form; multiply it by 100 for the percent.',
        },
        {
          value: whole / part,
          tag: 'divided-whole-by-part',
          nudge: 'Divide the part by the whole, in that order.',
        },
      ],
      hint: 'Divide the part by the whole, then multiply by 100.',
      solution: [
        { text: 'Divide the part by the whole.', detail: `${part} ÷ ${whole} = ${decimalText({ coefficient: percent, scale: 2 })}` },
        { text: 'Multiply the decimal by 100.', detail: `${decimalText({ coefficient: percent, scale: 2 })} × 100 = ${percent}%` },
      ],
    }
  },
})

const findTheWhole = defineSkill({
  id: 'find-the-whole',
  name: 'Finding the Whole',
  blurb: '20% is 15 — find the total',
  teachingLine: 'Divide the part by the percent written as a decimal.',
  build(context) {
    const { percent, whole, part } = drawPercentRelation(context)

    return {
      prompt: 'Find the whole.',
      display: {
        kind: 'story',
        text: `${part} is ${percent}% of what number?`,
        percent: { operation: 'find-whole', percent, part },
      },
      answer: intAnswer(whole),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: (part * percent) / 100,
          tag: 'applied-percent-again',
          nudge: 'That takes the percent of the part; reverse the operation instead.',
        },
        {
          value: part / percent,
          tag: 'used-whole-percent',
          nudge: 'Write the percent as a decimal before dividing the part.',
        },
      ],
      hint: 'Divide the part by the percent written as a decimal.',
      solution: [
        { text: 'Write the percent as a decimal.', detail: `${percent}% → ${decimalText({ coefficient: percent, scale: 2 })}` },
        { text: 'Divide the part by that decimal.', detail: `${part} ÷ ${decimalText({ coefficient: percent, scale: 2 })} = ${whole}` },
      ],
    }
  },
})

type PercentChangePair = {
  percent: number
  increase: boolean
}

/**
 * Each pair makes change ÷ current terminate, so the wrong-base diagnosis can
 * be entered exactly through the keypad. Higher bands widen the rate set while
 * `relationScaleBand` grows the displayed values.
 */
const PERCENT_CHANGE_BAND = {
  1: [{ percent: 25, increase: true }, { percent: 20, increase: false }],
  2: [
    { percent: 25, increase: true },
    { percent: 28, increase: true },
    { percent: 20, increase: false },
    { percent: 36, increase: false },
  ],
  3: [
    { percent: 25, increase: true },
    { percent: 28, increase: true },
    { percent: 60, increase: true },
    { percent: 20, increase: false },
    { percent: 36, increase: false },
    { percent: 50, increase: false },
  ],
  4: [
    { percent: 25, increase: true },
    { percent: 28, increase: true },
    { percent: 60, increase: true },
    { percent: 20, increase: false },
    { percent: 36, increase: false },
    { percent: 50, increase: false },
  ],
  5: [
    { percent: 25, increase: true },
    { percent: 28, increase: true },
    { percent: 60, increase: true },
    { percent: 20, increase: false },
    { percent: 36, increase: false },
    { percent: 50, increase: false },
  ],
} satisfies Record<BuildContext['difficulty'], readonly PercentChangePair[]>

const drawPercentChange = (context: BuildContext) => {
  const { percent, increase } = context.rng.pick(PERCENT_CHANGE_BAND[context.difficulty])
  const { whole: original, part: change } = scalePercent(context, percent)

  return {
    percent,
    original,
    change,
    current: increase ? original + change : original - change,
  }
}

const percentChange = defineSkill({
  id: 'percent-change',
  name: 'Percent Change',
  blurb: 'Increase and decrease',
  teachingLine: 'Divide the change by the original amount, then multiply by 100.',
  build(context) {
    const { percent, original, change, current } = drawPercentChange(context)

    return {
      prompt: 'Find the percent change.',
      display: {
        kind: 'story',
        text: `A value changes from ${original} to ${current}.`,
        percent: { operation: 'percent-change', original, current },
      },
      answer: intAnswer(percent),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: (change * 100) / current,
          tag: 'used-new-value-as-base',
          nudge: 'Use the original value as the base, not the new value.',
        },
      ],
      hint: 'Divide the change by the original value, then multiply by 100.',
      solution: [
        { text: 'Find the positive amount of change.', detail: `|${current} − ${original}| = ${change}` },
        { text: 'Divide by the original value.', detail: `${change} ÷ ${original} = ${decimalText({ coefficient: percent, scale: 2 })}` },
        { text: 'Multiply the decimal by 100.', detail: `${decimalText({ coefficient: percent, scale: 2 })} × 100 = ${percent}%` },
      ],
    }
  },
})

const APPLIED_PERCENT_BAND = {
  1: [10, 20],
  2: [10, 15, 20],
  3: [5, 10, 15, 20, 25],
  4: [5, 10, 15, 20, 25, 30],
  5: [5, 10, 15, 20, 25, 30, 40],
} satisfies Record<BuildContext['difficulty'], readonly number[]>

const moneyBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [10, 40],
    2: [20, 80],
    3: [30, 150],
    4: [50, 300],
    5: [100, 600],
  })

const dollars = (cents: number) =>
  `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`

const discountTaxTip = defineSkill({
  id: 'discount-tax-tip',
  name: 'Discount, Tax & Tip',
  blurb: 'Percents applied to a bill',
  teachingLine: 'Find the percent amount, then add or subtract it from the price.',
  build(context) {
    const operation = context.rng.pick(['discount', 'tax', 'tip'] as const)
    const percent = context.rng.pick(APPLIED_PERCENT_BAND[context.difficulty])
    const [minDollars, maxDollars] = moneyBand(context)
    const baseCents = context.rng.int(minDollars, maxDollars) * 100
    const adjustmentCents = (baseCents * percent) / 100
    const subtract = operation === 'discount'
    const finalCents = subtract ? baseCents - adjustmentCents : baseCents + adjustmentCents
    const oppositeCents = subtract ? baseCents + adjustmentCents : baseCents - adjustmentCents
    const text =
      operation === 'discount'
        ? `An item costs ${dollars(baseCents)} with a ${percent}% discount.`
        : operation === 'tax'
          ? `A ${dollars(baseCents)} purchase has ${percent}% sales tax.`
          : `A ${dollars(baseCents)} bill has a ${percent}% tip.`

    return {
      prompt: operation === 'discount' ? 'What is the final price?' : 'What is the final total?',
      display: { kind: 'story', text, percent: { operation, baseCents, percent } },
      answer: exactAnswer(finalCents, 2),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: adjustmentCents / 100,
          tag: 'answered-adjustment-only',
          nudge: `That is the ${operation === 'discount' ? 'discount' : operation}; apply it to the original amount.`,
        },
        {
          value: oppositeCents / 100,
          tag: 'used-opposite-direction',
          nudge:
            operation === 'discount'
              ? 'Subtract the percent amount from the original amount.'
              : 'Add the percent amount to the original amount.',
        },
      ],
      hint: `${operation === 'discount' ? 'Subtract' : 'Add'} the percent amount ${operation === 'discount' ? 'from' : 'to'} the original amount.`,
      solution: [
        { text: `Find the ${operation === 'discount' ? 'discount' : operation} amount.`, detail: `${dollars(baseCents)} × ${percent}% = ${dollars(adjustmentCents)}` },
        { text: `${operation === 'discount' ? 'Subtract it from' : 'Add it to'} the original amount.`, detail: `${dollars(baseCents)} ${subtract ? '−' : '+'} ${dollars(adjustmentCents)} = ${dollars(finalCents)}` },
      ],
    }
  },
})

const principalBand = (context: BuildContext) =>
  band(context.difficulty, {
    1: [100, 500],
    2: [200, 1000],
    3: [500, 2500],
    4: [1000, 5000],
    5: [2500, 10000],
  })

const INTEREST_RATE_BAND = {
  1: [2, 5],
  2: [2, 4, 5],
  3: [3, 4, 5, 6],
  4: [3, 4, 5, 6, 8],
  5: [4, 5, 6, 8, 10],
} satisfies Record<BuildContext['difficulty'], readonly number[]>

const simpleInterest = defineSkill({
  id: 'simple-interest',
  name: 'Simple Interest',
  blurb: 'I = Prt',
  teachingLine: 'Use I = Prt, writing the percent rate as a decimal.',
  build(context) {
    const [minPrincipal, maxPrincipal] = principalBand(context)
    const principalCents = context.rng.int(minPrincipal, maxPrincipal) * 100
    const percent = context.rng.pick(INTEREST_RATE_BAND[context.difficulty])
    const years = context.rng.int(1, context.difficulty + 1)
    const interestCents = (principalCents * percent * years) / 100

    return {
      prompt: 'How much simple interest is earned?',
      display: {
        kind: 'story',
        text:
          `I = Prt. P = ${dollars(principalCents)}, r = ${percent}%, ` +
          `t = ${years} ${years === 1 ? 'year' : 'years'}.`,
        percent: { operation: 'simple-interest', principalCents, percent, years },
      },
      answer: exactAnswer(interestCents, 2),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: interestCents,
          tag: 'used-whole-percent-rate',
          nudge: 'Write the percent rate as a decimal before multiplying.',
        },
        {
          value: (principalCents + interestCents) / 100,
          tag: 'answered-final-balance',
          nudge: 'That includes the principal; the question asks for interest only.',
        },
      ],
      hint: 'Use I = Prt with the rate written as a decimal.',
      solution: [
        { text: 'Use the given formula.', detail: 'I = Prt' },
        { text: 'Write the rate as a decimal.', detail: `${percent}% → ${decimalText({ coefficient: percent, scale: 2 })}` },
        { text: 'Multiply principal, rate, and time.', detail: `${dollars(principalCents)} × ${decimalText({ coefficient: percent, scale: 2 })} × ${years} = ${dollars(interestCents)}` },
      ],
    }
  },
})

export const unit10 = [
  percentMeaning,
  percentToDecimal,
  decimalToPercent,
  percentToFraction,
  percentOf,
  findThePercent,
  findTheWhole,
  percentChange,
  discountTaxTip,
  simpleInterest,
]
