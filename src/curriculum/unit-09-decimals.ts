import { intAnswer } from '../lib/answer'
import { decimalText } from '../lib/decimal'
import { rational } from '../lib/rational'
import { constrain } from '../lib/rng'
import type { DecimalArithmeticData, DecimalData, DecimalValue, MathNotation, Misconception } from '../lib/types'
import { applyOperator, band, defineSkill, pickFrame, storyProblem, type BuildContext, type ProblemSpec } from './engine'
import { numberWords } from './unit-00-numbers'
import { MONEY_FRAMES } from './phrasing/money'

const power = (scale: number) => 10 ** scale
const valueOf = (value: DecimalValue) => value.coefficient / power(value.scale)
const exactAnswer = (coefficient: number, scale: number) => ({
  kind: 'exact' as const,
  ...rational(coefficient, power(scale)),
})

const wholeBounds = (context: BuildContext) =>
  band(context.difficulty, {
    1: [0, 2],
    2: [0, 5],
    3: [1, 12],
    4: [2, 30],
    5: [5, 60],
  })

const drawDecimal = (context: BuildContext, scale: 1 | 2): DecimalValue => {
  const [minWhole, maxWhole] = wholeBounds(context)
  return {
    coefficient: context.rng.int(minWhole * power(scale) + 1, (maxWhole + 1) * power(scale) - 1),
    scale,
  }
}

const decimalWords = (value: DecimalValue): string => {
  const denominator = power(value.scale)
  const whole = Math.floor(value.coefficient / denominator)
  const fraction = value.coefficient % denominator
  const place = value.scale === 1 ? (fraction === 1 ? 'tenth' : 'tenths') : fraction === 1 ? 'hundredth' : 'hundredths'
  return `${numberWords(whole)} and ${numberWords(fraction)} ${place}`
}

const inlineDecimal = (text: string, decimal: DecimalData) => ({
  kind: 'inline' as const,
  text,
  decimal,
})

const decimalPlaceValue = defineSkill({
  id: 'decimal-place-value',
  name: 'Decimal Places',
  blurb: 'Tenths and hundredths',
  teachingLine: 'Count places to the right of the decimal point.',
  build(context) {
    const scale: 1 | 2 = context.difficulty === 1 ? 1 : context.rng.bool(0.65) ? 2 : 1
    const place = scale === 1 || context.rng.bool() ? 'tenths' : 'hundredths'
    const value = constrain(
      () => drawDecimal(context, scale),
      (candidate) => {
        const tenths = Math.floor(candidate.coefficient / power(candidate.scale - 1)) % 10
        const hundredths = candidate.scale === 2 ? candidate.coefficient % 10 : 0
        return tenths !== hundredths
      },
    )
    const tenths = Math.floor(value.coefficient / power(value.scale - 1)) % 10
    const hundredths = value.scale === 2 ? value.coefficient % 10 : 0
    const answer = place === 'tenths' ? tenths : hundredths
    const adjacent = place === 'tenths' ? hundredths : tenths

    return {
      prompt: `Which digit is in the ${place} place?`,
      display: inlineDecimal(decimalText(value), { operation: 'digit', value, place }),
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: adjacent,
          tag: 'adjacent-place',
          nudge: `That is the ${place === 'tenths' ? 'hundredths' : 'tenths'} digit; move one place.`,
        },
        {
          value: place === 'tenths' ? tenths * 10 : hundredths / 100,
          tag: 'place-value-not-digit',
          nudge: `Enter the digit itself, which is ${answer}.`,
        },
      ],
      hint: `The ${place} place is ${place === 'tenths' ? 'first' : 'second'} after the point.`,
      solution: [
        { text: 'Start at the decimal point.' },
        { text: `The ${place} digit is ${answer}.` },
      ],
    }
  },
})

const readDecimals = defineSkill({
  id: 'read-decimals',
  name: 'Reading Decimals',
  blurb: 'Say a decimal out loud',
  teachingLine: 'The word "and" marks the decimal point when writing digits.',
  build(context) {
    const scale: 1 | 2 = context.difficulty === 1 ? 1 : context.rng.bool(0.7) ? 2 : 1
    const value = constrain(
      () => drawDecimal(context, scale),
      (candidate) => candidate.coefficient % power(candidate.scale) !== 0,
    )
    const whole = Math.floor(value.coefficient / power(scale))
    const fraction = value.coefficient % power(scale)
    const shifted = whole + fraction / 10

    return {
      prompt: 'Write this decimal in digits.',
      display: inlineDecimal(decimalWords(value), { operation: 'read', value }),
      answer: exactAnswer(value.coefficient, scale),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: shifted,
          tag: 'used-tenths-place',
          nudge: scale === 2 ? 'Hundredths use two places after the decimal point.' : 'Tenths use one place after the decimal point.',
        },
        {
          value: whole + fraction,
          tag: 'dropped-decimal-point',
          nudge: 'The word "and" marks where the decimal point belongs.',
        },
      ],
      hint: 'The word "and" marks the decimal point.',
      solution: [
        { text: 'Write the whole-number part first.' },
        { text: `Place ${fraction} in the ${scale === 1 ? 'tenths' : 'hundredths'} places.` },
        { text: `The decimal is ${decimalText(value)}.` },
      ],
    }
  },
})

const compareDecimals = defineSkill({
  id: 'compare-decimals',
  name: 'Comparing Decimals',
  blurb: 'Which decimal is larger',
  teachingLine: 'Add ending zeros, then compare matching places from left to right.',
  build(context) {
    const [minWhole, maxWhole] = wholeBounds(context)
    const whole = context.rng.int(minWhole, maxWhole)
    const tenths = context.rng.int(2, 9)
    const hundredthsTenth = context.rng.int(0, tenths - 1)
    const hundredths = context.rng.int(1, 9)
    const shorter: DecimalValue = { coefficient: whole * 10 + tenths, scale: 1 }
    const longer: DecimalValue = { coefficient: whole * 100 + hundredthsTenth * 10 + hundredths, scale: 2 }
    const shortFirst = context.rng.bool()
    const left = shortFirst ? shorter : longer
    const right = shortFirst ? longer : shorter
    const relation = shortFirst ? 1 : -1
    const choices = context.rng.shuffle([
      { id: '-1', label: '<' },
      { id: '0', label: '=' },
      { id: '1', label: '>' },
    ])

    return {
      prompt: 'Choose the symbol that makes this true.',
      display: inlineDecimal(`${decimalText(left)} ? ${decimalText(right)}`, {
        operation: 'compare',
        left,
        right,
      }),
      answer: { kind: 'choice', id: String(relation) },
      inputMode: 'choice',
      choices,
      misconceptions: [
        {
          value: -relation,
          tag: 'longer-means-bigger',
          nudge: 'More written digits do not make a decimal larger.',
        },
        {
          value: 0,
          tag: 'called-equal',
          nudge: 'Add a trailing zero, then compare equal places.',
        },
      ],
      hint: 'Add a trailing zero, then compare each place.',
      solution: [
        { text: 'Write both decimals with two places.' },
        { text: `${decimalText(left, 2)} ${relation > 0 ? '>' : '<'} ${decimalText(right, 2)}.` },
      ],
    }
  },
})

const roundDecimals = defineSkill({
  id: 'round-decimals',
  name: 'Rounding Decimals',
  blurb: 'Round to a given place',
  teachingLine: 'Check the next digit: 5 or more rounds up.',
  build(context) {
    const targetScale: 0 | 1 = context.difficulty <= 2 || context.rng.bool(0.4) ? 0 : 1
    const scale: 1 | 2 = targetScale === 0 ? 1 : 2
    const factor = power(scale - targetScale)
    const value = constrain(
      () => drawDecimal(context, scale),
      (candidate) => candidate.coefficient % factor !== 0,
    )
    const lower = Math.floor(value.coefficient / factor)
    const rounded = Math.floor((value.coefficient + factor / 2) / factor)
    const upper = lower + 1
    const wrongDirection = rounded === lower ? upper : lower

    return {
      prompt: `Round to the nearest ${targetScale === 0 ? 'whole number' : 'tenth'}.`,
      display: inlineDecimal(decimalText(value), { operation: 'round', value, targetScale }),
      answer: exactAnswer(rounded, targetScale),
      keypad: { allowDecimal: targetScale === 1 },
      misconceptions: [
        {
          value: wrongDirection / power(targetScale),
          tag: 'rounded-wrong-direction',
          nudge: 'Use the next digit to decide which neighbor is nearer.',
        },
        {
          value: valueOf(value),
          tag: 'not-rounded',
          nudge: `Finish at the ${targetScale === 0 ? 'ones' : 'tenths'} place.`,
        },
      ],
      hint: 'A next digit of 5 or more rounds up.',
      solution: [
        { text: `Check the ${targetScale === 0 ? 'tenths' : 'hundredths'} digit.` },
        { text: `${decimalText(value)} rounds to ${targetScale === 0 ? rounded : `${Math.floor(rounded / 10)}.${rounded % 10}`}.` },
      ],
    }
  },
})

const arithmetic = (operation: 'add' | 'sub', context: BuildContext) => {
  const leftScale: 1 | 2 = context.rng.bool() ? 1 : 2
  const rightScale: 1 | 2 = leftScale === 1 ? 2 : context.rng.bool(0.65) ? 1 : 2
  const scale: 1 | 2 = leftScale === 2 || rightScale === 2 ? 2 : 1
  const normalized = (value: DecimalValue) => value.coefficient * power(scale - value.scale)
  let left = drawDecimal(context, leftScale)
  let right =
    operation === 'sub'
      ? constrain(
          () => drawDecimal(context, rightScale),
          (candidate) => normalized(candidate) !== normalized(left),
        )
      : drawDecimal(context, rightScale)
  if (operation === 'sub' && normalized(left) < normalized(right)) [left, right] = [right, left]
  const leftValue = normalized(left)
  const rightValue = normalized(right)
  const result = operation === 'add' ? leftValue + rightValue : leftValue - rightValue
  const misaligned = (operation === 'add' ? left.coefficient + right.coefficient : Math.abs(left.coefficient - right.coefficient)) / power(scale)
  const misconceptions: Misconception[] = [
    {
      value: misaligned,
      tag: 'misaligned-places',
      nudge: 'Line up the decimal points before working by place.',
    },
    {
      value: valueOf(operation === 'add' ? left : right),
      tag: operation === 'add' ? 'copied-addend' : 'copied-subtrahend',
      nudge: operation === 'add' ? 'That is one addend; combine both values.' : 'That is the amount being subtracted; find the difference.',
    },
  ]
  const data: DecimalArithmeticData = { operation, left, right }

  return {
    prompt: operation === 'add' ? 'What is the sum?' : 'What is the difference?',
    display: { kind: 'decimal-column' as const, decimal: data },
    answer: exactAnswer(result, scale),
    keypad: { allowDecimal: true },
    misconceptions,
    hint: 'Line up the decimal points, then work by place.',
    solution: [
      { text: 'Line up the decimal points.' },
      { text: `${decimalText(left, scale)} ${operation === 'add' ? '+' : '−'} ${decimalText(right, scale)} = ${decimalText({ coefficient: result, scale })}.` },
    ],
  }
}

const addDecimals = defineSkill({
  id: 'add-decimals',
  name: 'Adding Decimals',
  blurb: 'Line up the points',
  teachingLine: 'Line up decimal points, then add matching places.',
  build: (context) => arithmetic('add', context),
})

const subDecimals = defineSkill({
  id: 'sub-decimals',
  name: 'Subtracting Decimals',
  blurb: '4.5 − 1.28',
  teachingLine: 'Line up decimal points, then subtract matching places.',
  build: (context) => arithmetic('sub', context),
})

const multDecimals = defineSkill({
  id: 'mult-decimals',
  name: 'Multiplying Decimals',
  blurb: 'Count the places',
  teachingLine: 'Multiply as whole numbers, then restore all decimal places.',
  build(context) {
    // Both operands stay at tenths, so the product's two decimal places stay
    // within the hundredths this unit covers rather than reaching thousandths.
    const left = drawDecimal(context, 1)
    const right = drawDecimal(context, 1)
    const scale = 2
    const result = left.coefficient * right.coefficient
    const data: DecimalData = { operation: 'mult', left, right }

    return {
      prompt: 'What is the product?',
      display: { kind: 'decimal-column' as const, decimal: data },
      answer: exactAnswer(result, scale),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: result / power(scale - 1),
          tag: 'misplaced-point-fewer-places',
          nudge: 'Count the total decimal places in both factors before placing the point.',
        },
        {
          value: result / power(scale + 1),
          tag: 'misplaced-point-extra-place',
          nudge: 'Count the total decimal places in both factors — that is one fewer than shown here.',
        },
      ],
      hint: 'Multiply as whole numbers, then count the total decimal places.',
      solution: [
        { text: 'Multiply as whole numbers.', detail: `${left.coefficient} × ${right.coefficient} = ${result}` },
        { text: 'Count the total decimal places in both factors.', detail: '1 place + 1 place = 2 places' },
        { text: `${decimalText(left)} × ${decimalText(right)} = ${decimalText({ coefficient: result, scale })}.` },
      ],
    }
  },
})

const divDecimalByWhole = defineSkill({
  id: 'div-decimal-by-whole',
  name: 'Dividing a Decimal',
  blurb: 'Divide by a whole number',
  teachingLine: 'Divide as whole numbers and bring the decimal point straight up.',
  build(context) {
    const [, maxWhole] = wholeBounds(context)
    const divisor = context.rng.int(2, Math.max(3, maxWhole))
    const quotient = drawDecimal(context, context.rng.bool() ? 1 : 2)
    const dividend: DecimalValue = { coefficient: quotient.coefficient * divisor, scale: quotient.scale }
    const data: DecimalData = { operation: 'div-whole', dividend, divisor }

    return {
      prompt: 'What is the quotient?',
      display: inlineDecimal(`${decimalText(dividend)} ÷ ${divisor}`, data),
      answer: exactAnswer(quotient.coefficient, quotient.scale),
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: valueOf(quotient) * 10,
          tag: 'misplaced-point',
          nudge: 'Keep the decimal point in the quotient directly above the point in the dividend.',
        },
      ],
      hint: 'Divide as if there were no decimal point, then place it directly above.',
      solution: [
        { text: 'Divide as with whole numbers.', detail: `${dividend.coefficient} ÷ ${divisor} = ${quotient.coefficient}` },
        { text: `Place the point directly above: ${decimalText(quotient)}.` },
      ],
    }
  },
})

const divByDecimal = defineSkill({
  id: 'div-by-decimal',
  name: 'Dividing by a Decimal',
  blurb: 'Shift both numbers',
  teachingLine: 'Shift both decimal points equally until the divisor is whole.',
  build(context) {
    const [minWhole, maxWhole] = wholeBounds(context)
    const quotient = context.rng.int(Math.max(2, minWhole), Math.max(3, maxWhole))
    const divisor = drawDecimal(context, context.rng.bool() ? 1 : 2)
    const dividend: DecimalValue = { coefficient: quotient * divisor.coefficient, scale: divisor.scale }
    const data: DecimalData = { operation: 'div-decimal', dividend, divisor }
    const shift = power(divisor.scale)

    return {
      prompt: 'What is the quotient?',
      display: inlineDecimal(`${decimalText(dividend)} ÷ ${decimalText(divisor)}`, data),
      answer: intAnswer(quotient),
      misconceptions: [
        {
          value: quotient / shift,
          tag: 'shifted-divisor-only',
          nudge: 'Shift the dividend the same number of places you shifted the divisor.',
        },
        {
          value: quotient * shift,
          tag: 'shifted-dividend-only',
          nudge: 'Shift the divisor the same number of places you shifted the dividend.',
        },
      ],
      hint: 'Shift the decimal point the same number of places in both numbers.',
      solution: [
        { text: 'Shift both points to make the divisor whole.', detail: `${decimalText(divisor)} → ${divisor.coefficient}` },
        { text: 'Shift the dividend the same number of places.', detail: `${decimalText(dividend)} → ${dividend.coefficient}` },
        { text: `${dividend.coefficient} ÷ ${divisor.coefficient} = ${quotient}.` },
      ],
    }
  },
})

const TERMINATING_DENOMINATOR_BAND = {
  1: [2, 4, 5, 10] as const,
  2: [2, 4, 5, 10] as const,
  3: [10, 20, 25] as const,
  4: [20, 25, 50] as const,
  5: [25, 50, 100] as const,
} satisfies Record<BuildContext['difficulty'], readonly number[]>

const fractionNotation = (numerator: number, denominator: number): MathNotation => ({
  kind: 'fraction',
  numerator: { kind: 'text', value: String(numerator) },
  denominator: { kind: 'text', value: String(denominator) },
})

const fractionDisplay = (numerator: number, denominator: number): ProblemSpec['display'] => ({
  kind: 'math',
  notation: fractionNotation(numerator, denominator),
  label: `${numerator} over ${denominator}`,
  fraction: { operation: 'simplify', numerator, denominator },
})

const fractionToDecimal = defineSkill({
  id: 'fraction-to-decimal',
  name: 'Fraction to Decimal',
  blurb: 'Convert by dividing',
  teachingLine: 'Divide the top number by the bottom number to write a decimal.',
  build(context) {
    const denominator = context.rng.pick(TERMINATING_DENOMINATOR_BAND[context.difficulty])
    const numerator = context.rng.int(1, denominator - 1)
    const coefficient = (numerator * 100) / denominator
    const value: DecimalValue = { coefficient, scale: 2 }

    return {
      prompt: 'Write this fraction as a decimal.',
      display: fractionDisplay(numerator, denominator),
      answer: { ...exactAnswer(coefficient, 2), requireDecimal: true },
      // The fraction itself must stay typable, or requireDecimal never has
      // anything to reject — the pad and the checker read one declaration.
      keypad: { allowDecimal: true, allowFraction: true },
      misconceptions: [
        {
          value: numerator + denominator,
          tag: 'added-instead-of-divided',
          nudge: `Divide ${numerator} by ${denominator}; do not add them.`,
        },
      ],
      hint: `Divide ${numerator} by ${denominator}.`,
      solution: [
        { text: 'Divide the numerator by the denominator.', detail: `${numerator} ÷ ${denominator}` },
        { text: `The decimal is ${decimalText(value)}.` },
      ],
    }
  },
})

const decimalToFraction = defineSkill({
  id: 'decimal-to-fraction',
  name: 'Decimal to Fraction',
  blurb: 'Convert by place value',
  teachingLine: "Write a decimal's digits over their place value, then reduce.",
  build(context) {
    const scale: 1 | 2 = context.difficulty === 1 ? 1 : context.rng.bool(0.6) ? 2 : 1
    const value = constrain(
      () => drawDecimal(context, scale),
      (candidate) => candidate.coefficient % power(candidate.scale) !== 0,
    )
    const denominator = power(scale)

    return {
      prompt: 'Write this decimal as a fraction.',
      display: inlineDecimal(decimalText(value), { operation: 'display', value }),
      answer: { ...exactAnswer(value.coefficient, scale), requireFraction: true },
      // Symmetric with fraction-to-decimal: the decimal form must stay typable
      // or requireFraction never has anything to reject.
      keypad: { allowFraction: true, allowDecimal: true },
      misconceptions: [
        {
          value: value.coefficient,
          tag: 'numerator-only',
          nudge: `Use ${denominator} as the denominator, matching the place value.`,
        },
      ],
      hint: `The denominator matches the place value: ${denominator}.`,
      solution: [
        {
          text: 'Use the place value as the denominator.',
          detail: `${scale === 1 ? 'tenths' : 'hundredths'} → ${denominator}`,
        },
        { text: `${decimalText(value)} = ${value.coefficient}/${denominator}.` },
      ],
    }
  },
})

const moneyProblems = defineSkill({
  id: 'money-problems',
  name: 'Money',
  blurb: 'Decimals applied to money',
  teachingLine: 'Multiply the price by the needed quantity, then write the total in dollars.',
  build(context) {
    const [minWhole, maxWhole] = wholeBounds(context)
    const priceCents = context.rng.int(Math.max(50, minWhole * 100), Math.max(150, maxWhole * 100 + 99))
    const quantity = context.rng.int(2, 12)
    const distractor = context.rng.intExcept(2, 12, [quantity])
    const q = { a: priceCents, b: quantity, distractor }
    const frame = pickFrame(context.rng, MONEY_FRAMES)
    const totalCents = applyOperator(q.a, q.b, '×')

    return {
      ...storyProblem(frame, q),
      answer: exactAnswer(totalCents, 2),
      keypad: { allowDecimal: true },
      // Rescaled to dollars, not the generic engine's raw cents-and-count
      // values: the learner types a dollar amount, so a prediction has to be
      // one too, reusing the frame's authored nudge text for each.
      misconceptions: [
        {
          value: q.a / 100,
          tag: 'answered-part',
          nudge: frame.nudges.answeredPart(q),
        },
        {
          value: (q.a * q.distractor) / 100,
          tag: 'distractor-pair',
          nudge: frame.nudges.distractorPair(q),
        },
      ],
    }
  },
})

export const unit09 = [
  decimalPlaceValue,
  readDecimals,
  compareDecimals,
  roundDecimals,
  addDecimals,
  subDecimals,
  multDecimals,
  divDecimalByWhole,
  divByDecimal,
  fractionToDecimal,
  decimalToFraction,
  moneyProblems,
]
