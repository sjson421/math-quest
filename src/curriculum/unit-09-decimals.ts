import { intAnswer } from '../lib/answer'
import { decimalText } from '../lib/decimal'
import { rational } from '../lib/rational'
import { constrain } from '../lib/rng'
import type { DecimalArithmeticData, DecimalData, DecimalValue, Misconception } from '../lib/types'
import { band, defineSkill, type BuildContext } from './engine'
import { numberWords } from './unit-00-numbers'

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
  build: (context) => arithmetic('add', context),
})

const subDecimals = defineSkill({
  id: 'sub-decimals',
  name: 'Subtracting Decimals',
  blurb: '4.5 − 1.28',
  build: (context) => arithmetic('sub', context),
})

export const unit09 = [
  decimalPlaceValue,
  readDecimals,
  compareDecimals,
  roundDecimals,
  addDecimals,
  subDecimals,
]
