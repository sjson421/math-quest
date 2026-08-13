import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import type { MathNotation, PowerData } from '../lib/types'
import { band, defineSkill, type BuildContext, type Ladder } from './engine'

/**
 * Unit 12a · Exponents & Roots.
 *
 * The six generators move from what an exponent means through evaluating a power,
 * perfect squares in both directions, estimating a non-perfect-square root, and the
 * same-base multiply/divide rules. Every display carries its base, exponent(s), or
 * radicand as `PowerData` separately from its notation, so the global verifier can
 * rebuild both what the learner sees and the answer without trusting this file.
 */

const text = (value: string): MathNotation => ({ kind: 'text', value })

const superscript = (base: string, exponent: string): MathNotation => ({
  kind: 'superscript',
  base: text(base),
  exponent: text(exponent),
})

const root = (radicand: string): MathNotation => ({ kind: 'root', radicand: text(radicand) })

const BASE_BAND: Ladder = {
  1: [2, 6],
  2: [3, 7],
  3: [4, 8],
  4: [5, 9],
  5: [6, 10],
}

const EXPONENT_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 4],
  4: [3, 5],
  5: [3, 5],
}

const exponentMeaning = defineSkill({
  id: 'exponent-meaning',
  name: 'What an Exponent Is',
  blurb: 'Repeated multiplication',
  build(context) {
    const [baseMin, baseMax] = band(context.difficulty, BASE_BAND)
    const [expMin, expMax] = band(context.difficulty, EXPONENT_BAND)
    const base = context.rng.int(baseMin, baseMax)
    const exponent = context.rng.int(expMin, expMax)
    const factors = Array.from({ length: exponent }, () => String(base)).join(' × ')
    const data: PowerData = { operation: 'expand-power', base, exponent }

    return {
      prompt: 'How many times is the base multiplied by itself?',
      display: {
        kind: 'math',
        notation: { kind: 'row', children: [text(`${factors} = `), superscript(String(base), '?')] },
        label: `${factors} equals ${base} to the blank power`,
        power: data,
      },
      answer: intAnswer(exponent),
      hint: 'Count how many times the base appears as a factor.',
      solution: [
        { text: 'Count the repeated factors.', detail: factors },
        { text: 'That count is the exponent.', detail: `${base}^${exponent}` },
      ],
    }
  },
})

const evaluatePowers = defineSkill({
  id: 'evaluate-powers',
  name: 'Evaluating Powers',
  blurb: 'Work out a power',
  build(context) {
    const [baseMin, baseMax] = band(context.difficulty, BASE_BAND)
    const [expMin, expMax] = band(context.difficulty, EXPONENT_BAND)
    const { base, exponent } = constrain(
      () => ({
        base: context.rng.int(baseMin, baseMax),
        exponent: context.rng.int(expMin, expMax),
      }),
      ({ base: b, exponent: e }) => {
        if (b === e) return false
        const values = new Set([b ** e, b * e, e ** b])
        return values.size === 3
      },
    )
    const answer = base ** exponent
    const data: PowerData = { operation: 'evaluate-power', base, exponent }

    return {
      prompt: 'What is the value of this power?',
      display: {
        kind: 'math',
        notation: superscript(String(base), String(exponent)),
        label: `${base} to the ${exponent} power`,
        power: data,
      },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: base * exponent,
          tag: 'multiplied-base-by-exponent',
          nudge: `${base}${exponent === 2 ? '' : `^${exponent}`} means ${base} multiplied by itself ${exponent} times, not ${base} times ${exponent}.`,
        },
        {
          value: exponent ** base,
          tag: 'swapped-base-and-exponent',
          nudge: `The base is ${base} and the exponent is ${exponent} — keep them in that order.`,
        },
      ],
      hint: 'Multiply the base by itself as many times as the exponent says.',
      solution: [
        {
          text: 'Write out the repeated multiplication.',
          detail: Array.from({ length: exponent }, () => String(base)).join(' × '),
        },
        { text: 'Multiply to find the value.', detail: `= ${answer}` },
      ],
    }
  },
})

const SQUARE_BAND: Ladder = {
  1: [1, 4],
  2: [2, 6],
  3: [4, 8],
  4: [6, 10],
  5: [8, 12],
}

const perfectSquares = defineSkill({
  id: 'perfect-squares',
  name: 'Perfect Squares',
  blurb: 'Squares and roots to 144',
  build(context) {
    const [min, max] = band(context.difficulty, SQUARE_BAND)
    const n = context.rng.int(min, max)
    const direction = context.rng.bool() ? 'square' as const : 'square-root' as const

    if (direction === 'square') {
      const answer = n * n
      const data: PowerData = { operation: 'square', value: n }
      return {
        prompt: 'What is the square?',
        display: {
          kind: 'math',
          notation: superscript(String(n), '2'),
          label: `${n} squared`,
          power: data,
        },
        answer: intAnswer(answer),
        hint: 'Multiply the number by itself.',
        solution: [{ text: 'Multiply the number by itself.', detail: `${n} × ${n} = ${answer}` }],
      }
    }

    const value = n * n
    const data: PowerData = { operation: 'square-root', value }
    return {
      prompt: 'What is the square root?',
      display: {
        kind: 'math',
        notation: root(String(value)),
        label: `the square root of ${value}`,
        power: data,
      },
      answer: intAnswer(n),
      hint: 'Find the number that multiplies by itself to make this value.',
      solution: [{ text: 'Find the number that squares to this value.', detail: `${n} × ${n} = ${value}` }],
    }
  },
})

const ROOT_ESTIMATE_BAND: Ladder = {
  1: [2, 4],
  2: [3, 6],
  3: [5, 8],
  4: [7, 10],
  5: [9, 13],
}

const estimateRoots = defineSkill({
  id: 'estimate-roots',
  name: 'Estimating Roots',
  blurb: 'Between which whole numbers',
  build(context) {
    const [min, max] = band(context.difficulty, ROOT_ESTIMATE_BAND)
    const n = context.rng.int(min, max)
    const offset = context.rng.int(1, 2 * n)
    const value = n * n + offset
    const data: PowerData = { operation: 'estimate-root', value }

    return {
      prompt: 'Between which two whole numbers does this root fall? Enter the smaller one.',
      display: {
        kind: 'math',
        notation: root(String(value)),
        label: `the square root of ${value}`,
        power: data,
      },
      answer: intAnswer(n),
      hint: 'Find the perfect squares just below and above this value.',
      solution: [
        {
          text: 'Find the nearest perfect squares.',
          detail: `${n}² = ${n * n} and ${n + 1}² = ${(n + 1) * (n + 1)}`,
        },
        { text: 'The root falls between them.', detail: `${n} and ${n + 1}` },
      ],
    }
  },
})

const MD_BASE_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [3, 7],
  5: [4, 8],
}

const MD_EXPONENT_BAND: Ladder = {
  1: [1, 2],
  2: [1, 3],
  3: [2, 3],
  4: [2, 4],
  5: [3, 4],
}

const buildPowerCombine = (
  context: BuildContext,
  operation: 'power-multiply' | 'power-divide',
) => {
  const [baseMin, baseMax] = band(context.difficulty, MD_BASE_BAND)
  const [expMin, expMax] = band(context.difficulty, MD_EXPONENT_BAND)
  const base = context.rng.int(baseMin, baseMax)
  const rightExponent = context.rng.int(expMin, expMax)
  const leftExponent = operation === 'power-multiply'
    ? constrain(
        () => context.rng.int(expMin, expMax),
        // Excludes the case where "multiply the exponents" coincides with the
        // correct "add the exponents" answer (e.g. 2 × 2 = 2 + 2).
        (candidate) => candidate * rightExponent !== candidate + rightExponent,
      )
    : rightExponent + context.rng.int(1, context.difficulty + 1)
  const answer = operation === 'power-multiply'
    ? leftExponent + rightExponent
    : leftExponent - rightExponent
  const data: PowerData = { operation, base, leftExponent, rightExponent }
  const operatorSymbol = operation === 'power-multiply' ? '×' : '÷'

  return {
    base,
    leftExponent,
    rightExponent,
    answer,
    data,
    notation: {
      kind: 'row' as const,
      children: [
        superscript(String(base), String(leftExponent)),
        text(` ${operatorSymbol} `),
        superscript(String(base), String(rightExponent)),
        text(' = '),
        superscript(String(base), '?'),
      ],
    },
    label: (
      `${base} to the ${leftExponent} ${operation === 'power-multiply' ? 'times' : 'divided by'} ` +
      `${base} to the ${rightExponent} equals ${base} to the blank power`
    ),
  }
}

const exponentMultiply = defineSkill({
  id: 'exponent-multiply',
  name: 'Multiplying Powers',
  blurb: 'Add the exponents',
  build(context) {
    const { base, leftExponent, rightExponent, answer, data, notation, label } =
      buildPowerCombine(context, 'power-multiply')

    return {
      prompt: 'What is the missing exponent?',
      display: { kind: 'math', notation, label, power: data },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: leftExponent * rightExponent,
          tag: 'multiplied-exponents',
          nudge: 'Same-base multiplication adds the exponents, not multiplies them.',
        },
      ],
      hint: 'When multiplying same-base powers, add the exponents.',
      solution: [
        { text: 'Keep the base and add the exponents.', detail: `${leftExponent} + ${rightExponent} = ${answer}` },
        { text: 'Write the result as a single power.', detail: `${base}^${answer}` },
      ],
    }
  },
})

const exponentDivide = defineSkill({
  id: 'exponent-divide',
  name: 'Dividing Powers',
  blurb: 'Subtract the exponents',
  build(context) {
    const { base, leftExponent, rightExponent, answer, data, notation, label } =
      buildPowerCombine(context, 'power-divide')

    return {
      prompt: 'What is the missing exponent?',
      display: { kind: 'math', notation, label, power: data },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: leftExponent + rightExponent,
          tag: 'added-exponents',
          nudge: 'Same-base division subtracts the exponents, not adds them.',
        },
      ],
      hint: 'When dividing same-base powers, subtract the exponents.',
      solution: [
        { text: 'Keep the base and subtract the exponents.', detail: `${leftExponent} − ${rightExponent} = ${answer}` },
        { text: 'Write the result as a single power.', detail: `${base}^${answer}` },
      ],
    }
  },
})

export const unit12 = [
  exponentMeaning,
  evaluatePowers,
  perfectSquares,
  estimateRoots,
  exponentMultiply,
  exponentDivide,
]
