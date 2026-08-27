import { intAnswer } from '../lib/answer'
import { gcd, rational, toNumber } from '../lib/rational'
import { constrain } from '../lib/rng'
import type { MathNotation, PowerData } from '../lib/types'
import {
  band,
  defineSkill,
  evaluateExpression,
  expressionNotation,
  op,
  power,
  type BuildContext,
  type Ladder,
  type NumericExpression,
} from './engine'

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
  teachingLine: 'An exponent tells how many times to use the base as a factor.',
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
  teachingLine: 'A power uses its base as a factor as many times as the exponent says.',
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
  teachingLine: 'Squaring a number multiplies it by itself; finding a square root reverses that.',
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
  teachingLine: 'Compare nearby whole-number squares to find which two the root lies between.',
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
  teachingLine: 'For matching bases multiplied together, add the exponents.',
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
  teachingLine: 'For matching bases divided, subtract the second exponent from the first.',
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

const POWER_OF_POWER_EXPONENT_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 5],
  4: [3, 5],
  5: [3, 6],
}

const powerOfPower = defineSkill({
  id: 'power-of-power',
  name: 'Power of a Power',
  blurb: 'Multiply the exponents',
  teachingLine: 'When a power is raised again, multiply the two exponents.',
  build(context) {
    const [baseMin, baseMax] = band(context.difficulty, MD_BASE_BAND)
    const [exponentMin, exponentMax] = band(context.difficulty, POWER_OF_POWER_EXPONENT_BAND)
    const { innerExponent, outerExponent } = constrain(
      () => ({
        innerExponent: context.rng.int(exponentMin, exponentMax),
        outerExponent: context.rng.int(exponentMin, exponentMax),
      }),
      ({ innerExponent: inner, outerExponent: outer }) => inner * outer !== inner + outer,
    )
    const base = context.rng.int(baseMin, baseMax)
    const answer = innerExponent * outerExponent
    const inner = superscript(String(base), String(innerExponent))
    const outer: MathNotation = {
      kind: 'superscript',
      base: { kind: 'row', children: [text('('), inner, text(')')] },
      exponent: text(String(outerExponent)),
    }
    const data: PowerData = { operation: 'power-of-power', base, innerExponent, outerExponent }

    return {
      prompt: 'What is the missing exponent?',
      display: {
        kind: 'math',
        notation: {
          kind: 'row',
          children: [outer, text(' = '), superscript(String(base), '?')],
        },
        label: (
          `${base} to the ${innerExponent} power, raised to the ${outerExponent} power, ` +
          `equals ${base} to the blank power`
        ),
        power: data,
      },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: innerExponent + outerExponent,
          tag: 'added-exponents',
          nudge: 'A power raised to a power multiplies the exponents.',
        },
        {
          value: innerExponent,
          tag: 'ignored-outer-exponent',
          nudge: `The outer ${outerExponent} acts on the whole inner power.`,
        },
      ],
      hint: 'Multiply the inner exponent by the outer exponent.',
      solution: [
        { text: 'Keep the base and multiply the exponents.', detail: `${innerExponent} × ${outerExponent} = ${answer}` },
        { text: 'Write the result as one power.', detail: `${base}^${answer}` },
      ],
    }
  },
})

const ZERO_NEG_BASE_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [3, 8],
  5: [4, 10],
}

const NEGATIVE_EXPONENT_BAND: Ladder = {
  1: [1, 2],
  2: [1, 2],
  3: [2, 3],
  4: [2, 3],
  5: [2, 4],
}

const zeroNegExponents = defineSkill({
  id: 'zero-neg-exponents',
  name: 'Zero & Negative Exponents',
  blurb: 'What they stand for',
  teachingLine: 'A zero exponent gives 1; a negative exponent gives one over the positive power.',
  build(context) {
    const [baseMin, baseMax] = band(context.difficulty, ZERO_NEG_BASE_BAND)
    const base = context.rng.int(baseMin, baseMax)

    if (context.rng.bool()) {
      const data: PowerData = { operation: 'zero-exponent', base }
      return {
        prompt: 'What is the value?',
        display: {
          kind: 'math',
          notation: superscript(String(base), '0'),
          label: `${base} to the zero power`,
          power: data,
        },
        answer: intAnswer(1),
        misconceptions: [
          { value: 0, tag: 'answered-zero', nudge: 'A nonzero base to the zero power equals one.' },
        ],
        hint: 'Any nonzero number to the zero power equals one.',
        solution: [{ text: 'Use the zero-exponent rule.', detail: `${base}^0 = 1` }],
      }
    }

    const [magnitudeMin, magnitudeMax] = band(context.difficulty, NEGATIVE_EXPONENT_BAND)
    const magnitude = context.rng.int(magnitudeMin, magnitudeMax)
    const denominator = base ** magnitude
    const data: PowerData = { operation: 'negative-exponent', base, magnitude }

    return {
      prompt: 'What is the value?',
      display: {
        kind: 'math',
        notation: superscript(String(base), `−${magnitude}`),
        label: `${base} to the negative ${magnitude} power`,
        power: data,
      },
      answer: { kind: 'exact', ...rational(1, denominator), requireFraction: true },
      keypad: { allowFraction: true, allowNegative: true },
      misconceptions: [
        {
          value: denominator,
          tag: 'kept-positive-exponent',
          nudge: 'A negative exponent makes the positive power its denominator.',
        },
        {
          value: -denominator,
          tag: 'negated-positive-power',
          nudge: 'The exponent makes a reciprocal, not a negative result.',
        },
      ],
      hint: 'Make the positive power the denominator of a fraction.',
      solution: [
        { text: 'Rewrite with a positive exponent.', detail: `1/${base}^${magnitude}` },
        { text: 'Evaluate the denominator.', detail: `1/${denominator}` },
      ],
    }
  },
})

const SCIENTIFIC_EXPONENT_BAND: Ladder = {
  1: [2, 2],
  2: [2, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
}

const scientificRational = (coefficient: number, coefficientScale: 0 | 1, exponent: number) =>
  exponent >= 0
    ? rational(coefficient * 10 ** exponent, 10 ** coefficientScale)
    : rational(coefficient, 10 ** (coefficientScale + Math.abs(exponent)))

const coefficientText = (coefficient: number, scale: 0 | 1) =>
  scale === 0 ? String(coefficient) : (coefficient / 10).toFixed(1)

const ordinaryNumberText = (coefficient: number, scale: 0 | 1, exponent: number) => {
  const digits = String(coefficient)
  const point = digits.length - (scale - exponent)
  if (point <= 0) return `0.${'0'.repeat(-point)}${digits}`
  if (point >= digits.length) return `${digits}${'0'.repeat(point - digits.length)}`
  return `${digits.slice(0, point)}.${digits.slice(point)}`
}

const exponentText = (exponent: number) => exponent < 0 ? `−${Math.abs(exponent)}` : String(exponent)
const exponentLabel = (exponent: number) => exponent < 0 ? `negative ${Math.abs(exponent)}` : String(exponent)

const scientificNotation = defineSkill({
  id: 'scientific-notation',
  name: 'Scientific Notation',
  blurb: 'Powers of ten as shorthand',
  teachingLine: 'A positive exponent moves the decimal right; a negative exponent moves it left.',
  build(context) {
    const [magnitudeMin, magnitudeMax] = band(context.difficulty, SCIENTIFIC_EXPONENT_BAND)
    const magnitude = context.rng.int(magnitudeMin, magnitudeMax)
    const exponent = context.rng.bool() ? magnitude : -magnitude
    const coefficientScale: 0 | 1 = context.difficulty === 1 || context.rng.bool() ? 0 : 1
    const coefficient = coefficientScale === 0
      ? context.rng.int(1, 9)
      : context.rng.intExcept(11, 99, [20, 30, 40, 50, 60, 70, 80, 90])
    const shownCoefficient = coefficientText(coefficient, coefficientScale)
    const answer = scientificRational(coefficient, coefficientScale, exponent)
    const onePlace = scientificRational(coefficient, coefficientScale, Math.sign(exponent))
    const reversed = scientificRational(coefficient, coefficientScale, -exponent)
    const data: PowerData = {
      operation: 'scientific-notation',
      coefficient,
      coefficientScale,
      exponent,
    }

    return {
      prompt: 'Write this as an ordinary number.',
      display: {
        kind: 'math',
        notation: {
          kind: 'row',
          children: [text(`${shownCoefficient} × `), superscript('10', exponentText(exponent))],
        },
        label: `${shownCoefficient} times 10 to the ${exponentLabel(exponent)} power`,
        power: data,
      },
      answer: {
        kind: 'exact',
        ...answer,
        requireDecimal: exponent < 0,
      },
      keypad: { allowDecimal: true },
      misconceptions: [
        {
          value: toNumber(onePlace),
          tag: 'moved-one-place',
          nudge: `The exponent moves the decimal ${magnitude} places, not one.`,
        },
        {
          value: toNumber(reversed),
          tag: 'reversed-exponent-direction',
          nudge: `A ${exponent < 0 ? 'negative' : 'positive'} exponent moves the decimal ${exponent < 0 ? 'left' : 'right'}.`,
        },
      ],
      hint: `Move the decimal ${magnitude} places ${exponent < 0 ? 'left' : 'right'}.`,
      solution: [
        { text: 'Use the exponent as the number of places.' },
        {
          text: `Move the decimal ${exponent < 0 ? 'left' : 'right'}.`,
          detail: ordinaryNumberText(coefficient, coefficientScale, exponent),
        },
      ],
    }
  },
})

const PEMDAS_TERM_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [4, 8],
  5: [5, 10],
}

const pemdasDisplay = (tree: NumericExpression, data: PowerData, label: string) => ({
  kind: 'math' as const,
  notation: expressionNotation(tree),
  label,
  power: data,
})

const pemdasExponents = defineSkill({
  id: 'pemdas-exponents',
  name: 'Order of Operations with Exponents',
  blurb: 'The full rule',
  teachingLine: 'Evaluate parentheses first, then powers, multiplication or division, and addition or subtraction.',
  build(context) {
    const [termMin, termMax] = band(context.difficulty, PEMDAS_TERM_BAND)
    const exponent = context.rng.int(2, context.difficulty >= 4 ? 3 : 2)

    if (context.rng.bool()) {
      const base = context.rng.intExcept(termMin, termMax, exponent === 2 ? [2] : [])
      const factor = context.rng.int(2, Math.min(6, termMax))
      const addend = context.rng.int(termMin, termMax)
      const tree = op(addend, '+', op(power(base, exponent), '×', factor))
      const answer = evaluateExpression(tree)
      const multipliedPower = op(addend, '+', op(op(base, '×', exponent), '×', factor))
      const addedFirst = op(power(op(addend, '+', base), exponent), '×', factor)
      const data: PowerData = {
        operation: 'pemdas-power-first',
        addend,
        base,
        exponent,
        factor,
      }

      return {
        prompt: 'What is the value?',
        display: pemdasDisplay(
          tree,
          data,
          `${addend} plus ${base} to the ${exponent} power times ${factor}`,
        ),
        answer: intAnswer(answer),
        misconceptions: [
          {
            value: evaluateExpression(multipliedPower),
            tag: 'multiplied-base-by-exponent',
            nudge: 'Evaluate the power as repeated multiplication before continuing.',
          },
          {
            value: evaluateExpression(addedFirst),
            tag: 'added-before-exponent',
            nudge: 'The exponent belongs to its base before the addition.',
          },
        ],
        hint: 'Evaluate the exponent, then multiply, then add.',
        solution: [
          { text: 'Evaluate the exponent first.', detail: `${base}^${exponent} = ${base ** exponent}` },
          { text: 'Then multiply.', detail: `${base ** exponent} × ${factor} = ${base ** exponent * factor}` },
          { text: 'Then add.', detail: `${addend} + ${base ** exponent * factor} = ${answer}` },
        ],
      }
    }

    const { left, right, divisor } = constrain(
      () => {
        const candidateLeft = context.rng.int(termMin, termMax)
        const candidateRight = context.rng.int(termMin, termMax)
        return {
          left: candidateLeft,
          right: candidateRight,
          divisor: gcd(candidateLeft, candidateRight),
        }
      },
      ({ left: candidateLeft, right: candidateRight, divisor: candidateDivisor }) => {
        if (candidateDivisor === 1) return false
        const multipliedPower = (candidateLeft + candidateRight) * exponent / candidateDivisor
        const ignoredGrouping = candidateLeft + candidateRight ** exponent / candidateDivisor
        return multipliedPower !== ignoredGrouping
      },
    )
    const group = left + right
    const tree = op(power(op(left, '+', right), exponent), '÷', divisor)
    const answer = evaluateExpression(tree)
    const multipliedPower = op(op(op(left, '+', right), '×', exponent), '÷', divisor)
    const ignoredGrouping = op(left, '+', op(power(right, exponent), '÷', divisor))
    const data: PowerData = {
      operation: 'pemdas-group-power',
      left,
      right,
      exponent,
      divisor,
    }

    return {
      prompt: 'What is the value?',
      display: pemdasDisplay(
        tree,
        data,
        `${left} plus ${right} in parentheses, to the ${exponent} power, divided by ${divisor}`,
      ),
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: evaluateExpression(multipliedPower),
          tag: 'multiplied-base-by-exponent',
          nudge: 'After the parentheses, evaluate the power by repeated multiplication.',
        },
        {
          value: evaluateExpression(ignoredGrouping),
          tag: 'ignored-parentheses',
          nudge: 'Keep the sum grouped; add before applying the exponent.',
        },
      ],
      hint: 'Take the parentheses, then the exponent, then divide.',
      solution: [
        { text: 'Work inside the parentheses.', detail: `${left} + ${right} = ${group}` },
        { text: 'Evaluate the exponent.', detail: `${group}^${exponent} = ${group ** exponent}` },
        { text: 'Then divide.', detail: `${group ** exponent} ÷ ${divisor} = ${answer}` },
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
  powerOfPower,
  zeroNegExponents,
  scientificNotation,
  pemdasExponents,
]
