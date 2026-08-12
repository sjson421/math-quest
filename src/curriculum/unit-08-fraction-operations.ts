import { intAnswer } from '../lib/answer'
import { gcd, rational } from '../lib/rational'
import type { FractionData, MathNotation, Misconception } from '../lib/types'
import {
  band,
  defineSkill,
  fractionStoryProblem,
  pickFrame,
  type BuildContext,
  type ProblemSpec,
} from './engine'
import { FRACTION_FRAMES } from './phrasing/fractions'

/**
 * Unit 8 · Fractions: Operations.
 *
 * The first fraction arithmetic of the course: like and unlike operations,
 * mixed-number conversions and operations, fraction products and quotients,
 * and fixed-frame stories. Every answer stays recomputable from structured
 * source values — the arithmetic is never trusted from the generator, and wall
 * skills retain two diagnosable mistakes on every draw by construction.
 */

const text = (value: string): MathNotation => ({ kind: 'text', value })

const fraction = (numerator: string, denominator: string): MathNotation => ({
  kind: 'fraction',
  numerator: text(numerator),
  denominator: text(denominator),
})

const mixedNumber = (whole: number, numerator: number, denominator: number): MathNotation => ({
  kind: 'row',
  children: [text(String(whole)), fraction(String(numerator), String(denominator))],
})

/**
 * A numerator coprime to its denominator, from the pool [min, max].
 *
 * Every displayed fraction is in lowest terms — a reducible addend would
 * answer its own question, and for the LCD skill it would make the question
 * ill-posed: the least common denominator of the *values* 1/2 and 1/3 is 6,
 * not the 12 of their displayed denominators.
 */
const reducedNumerator = ({ rng }: BuildContext, denominator: number, min = 1, max = denominator - 1): number =>
  rng.pick(
    Array.from({ length: max - min + 1 }, (_, i) => i + min).filter((candidate) => gcd(candidate, denominator) === 1),
  )

const exactFraction = (numerator: number, denominator: number) => ({
  kind: 'exact' as const,
  ...rational(numerator, denominator),
  requireSimplified: true as const,
})

const exactMixed = (numerator: number, denominator: number) => ({
  kind: 'exact' as const,
  ...rational(numerator, denominator),
  requireMixed: true as const,
  requireSimplified: true as const,
})

/**
 * The two displayed fractions and the operator, as the display's semantic data.
 *
 * Recomputation reads both fractions and the operator and re-derives the
 * result over the least common denominator, so a wrong answer key cannot
 * agree with itself. One shape for like and unlike denominators — the
 * relationship is a draw property of the skill, not of the data arm.
 */
const operationData = (
  operation: 'add' | 'sub',
  leftNumerator: number,
  leftDenominator: number,
  rightNumerator: number,
  rightDenominator: number,
): Extract<FractionData, { operation: 'add' | 'sub' }> => ({
  operation,
  leftNumerator,
  leftDenominator,
  rightNumerator,
  rightDenominator,
})

const operationDisplay = (data: Extract<FractionData, { operation: 'add' | 'sub' }>): ProblemSpec['display'] => ({
  kind: 'math',
  notation: {
    kind: 'row',
    children: [
      fraction(String(data.leftNumerator), String(data.leftDenominator)),
      text(data.operation === 'add' ? '+' : '−'),
      fraction(String(data.rightNumerator), String(data.rightDenominator)),
    ],
  },
  label:
    `${data.leftNumerator} over ${data.leftDenominator}, ` +
    `${data.operation === 'add' ? 'plus' : 'minus'}, ` +
    `${data.rightNumerator} over ${data.rightDenominator}`,
  fraction: data,
})

const mixedOperationDisplay = (
  data: Extract<FractionData, { operation: 'add-mixed' }> | Extract<FractionData, { operation: 'sub-mixed' }>,
): ProblemSpec['display'] => ({
  kind: 'math',
  notation: {
    kind: 'row',
    children: [
      mixedNumber(data.leftWhole, data.leftNumerator, data.leftDenominator),
      text(data.operation === 'add-mixed' ? '+' : '−'),
      mixedNumber(data.rightWhole, data.rightNumerator, data.rightDenominator),
    ],
  },
  label:
    `${data.leftWhole} and ${data.leftNumerator} over ${data.leftDenominator}, ` +
    `${data.operation === 'add-mixed' ? 'plus' : 'minus'}, ` +
    `${data.rightWhole} and ${data.rightNumerator} over ${data.rightDenominator}`,
  fraction: data,
})

const productDisplay = (
  data: Extract<FractionData, { operation: 'multiply' }> | Extract<FractionData, { operation: 'divide' }>,
): ProblemSpec['display'] => ({
  kind: 'math',
  notation: {
    kind: 'row',
    children: [
      fraction(String(data.leftNumerator), String(data.leftDenominator)),
      text(data.operation === 'multiply' ? '×' : '÷'),
      fraction(String(data.rightNumerator), String(data.rightDenominator)),
    ],
  },
  label:
    `${data.leftNumerator} over ${data.leftDenominator}, ` +
    `${data.operation === 'multiply' ? 'times' : 'divided by'}, ` +
    `${data.rightNumerator} over ${data.rightDenominator}`,
  fraction: data,
})

/**
 * Reduction step, shared by every operation skill.
 *
 * The answer requires lowest terms, so a reducible result has one more step
 * than a reduced one; the solution must show it for the worked solution to
 * actually reach the answer it claims.
 */
const reductionStep = (numerator: number, denominator: number) => {
  const factor = gcd(numerator, denominator)
  if (factor === 1) return []
  return [
    {
      text: 'Reduce to lowest terms.',
      detail: `${numerator}/${denominator} = ${numerator / factor}/${denominator / factor}`,
    },
  ]
}

/** Like fractions share a denominator; add or subtract the numerators. */
const likeOperation = (operation: 'add' | 'sub', context: BuildContext) => {
  const [min, max] = band(context.difficulty, {
    1: [5, 7],
    2: [5, 8],
    3: [5, 9],
    4: [6, 10],
    5: [7, 12],
  })
  const { rng } = context
  // A denominator whose reduced numerator pool cannot produce a valid pair is
  // redrawn: 6 has only {1, 5}, whose sum is the whole, and an addition skill
  // whose first problems answer 1 is not teaching addition. Every displayed
  // fraction is in lowest terms, so a reducible addend never answers its own
  // question.
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const denominator = rng.int(min, max)
    const numeratorPool = Array.from({ length: denominator - 1 }, (_, i) => i + 1).filter(
      (candidate) => gcd(candidate, denominator) === 1,
    )
    if (numeratorPool.length < 2) continue
    // Distinct numerators keep the wall predictions apart (n1 ≠ n2), and the
    // sum stays strictly proper (n1 + n2 < d). A subtraction's minuend must
    // not be the smallest coprime numerator, or no smaller subtrahend remains.
    const leftPool = operation === 'sub' ? numeratorPool.slice(1) : numeratorPool
    const leftNumerator = rng.pick(leftPool)
    const rightPool = numeratorPool.filter(
      (candidate) =>
        candidate !== leftNumerator &&
        (operation === 'add' ? leftNumerator + candidate < denominator : candidate < leftNumerator),
    )
    if (rightPool.length === 0) continue
    const rightNumerator = rng.pick(rightPool)
    const resultNumerator = operation === 'add' ? leftNumerator + rightNumerator : leftNumerator - rightNumerator

    return {
      data: operationData(operation, leftNumerator, denominator, rightNumerator, denominator),
      leftNumerator,
      rightNumerator,
      denominator,
      resultNumerator,
    }
  }
  throw new Error(`${operation === 'add' ? 'add' : 'sub'}-like: no reduced proper pair in 200 draws`)
}

const addFracSameDen = defineSkill({
  id: 'add-frac-same-den',
  name: 'Adding Like Fractions',
  blurb: '1/5 + 2/5',
  build(context) {
    const { data, leftNumerator, rightNumerator, denominator, resultNumerator } = likeOperation('add', context)
    const misconceptions: Misconception[] = [
      {
        // The named wall: adding the denominators too, so 1/5 + 2/5 is 3/10.
        value: (leftNumerator + rightNumerator) / (2 * denominator),
        tag: 'adds-denominators',
        nudge: 'The denominator names the size of the parts — it stays the same.',
      },
      {
        value: rightNumerator / denominator,
        tag: 'copies-addend',
        nudge: 'That is one of the addends. Add the numerators.',
      },
    ]

    return {
      prompt: 'What is the sum?',
      display: operationDisplay(data),
      answer: exactFraction(resultNumerator, denominator),
      keypad: { allowFraction: true },
      misconceptions,
      hint: 'Add the numerators, and the denominator stays the same.',
      solution: [
        {
          text: 'The denominators match, so add the numerators.',
          detail: `${leftNumerator} + ${rightNumerator} = ${resultNumerator}`,
        },
        {
          text: 'Keep the denominator.',
          detail: `${resultNumerator}/${denominator}`,
        },
        ...reductionStep(resultNumerator, denominator),
      ],
    }
  },
})

const subFracSameDen = defineSkill({
  id: 'sub-frac-same-den',
  name: 'Subtracting Like Fractions',
  blurb: '4/5 − 2/5',
  build(context) {
    const { data, leftNumerator, rightNumerator, denominator, resultNumerator } = likeOperation('sub', context)
    const misconceptions: Misconception[] = [
      {
        // Reversing the order: 4/5 − 2/5 answered as −2/5. The value is
        // negative on every draw, which is why the sign key must be on the pad.
        value: (rightNumerator - leftNumerator) / denominator,
        tag: 'flipped-order',
        nudge: 'Subtract the second numerator from the first.',
      },
      {
        value: rightNumerator / denominator,
        tag: 'copies-subtrahend',
        nudge: 'That is the subtrahend. Subtract it from the first numerator.',
      },
    ]

    return {
      prompt: 'What is the difference?',
      display: operationDisplay(data),
      answer: exactFraction(resultNumerator, denominator),
      keypad: { allowFraction: true, allowNegative: true },
      misconceptions,
      hint: 'Subtract the numerators, and the denominator stays the same.',
      solution: [
        {
          text: 'The denominators match, so subtract the numerators.',
          detail: `${leftNumerator} − ${rightNumerator} = ${resultNumerator}`,
        },
        {
          text: 'Keep the denominator.',
          detail: `${resultNumerator}/${denominator}`,
        },
        ...reductionStep(resultNumerator, denominator),
      ],
    }
  },
})

/**
 * Two denominators for the LCD question, one of two relationships.
 *
 * Coprime pairs teach the product rule (the LCD is the product); pairs where
 * one divides the other teach divisibility (the LCD is the larger). The
 * product-not-lcm prediction therefore survives only on divisor pairs, and
 * the larger-denominator prediction only on coprime pairs — the central
 * filter keeps each off the draw where it equals the answer.
 */
const denominatorPair = ({ rng, difficulty }: BuildContext) => {
  const [min, max] = band(difficulty, {
    1: [2, 4],
    2: [2, 5],
    3: [3, 6],
    4: [4, 8],
    5: [5, 10],
  })
  if (rng.bool()) {
    // Coprime: the LCD is the product.
    const left = rng.int(min, max)
    const candidates = Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(
      (candidate) => gcd(candidate, left) === 1 && candidate !== left,
    )
    return { left, right: rng.pick(candidates) }
  }
  // Divisor pair: the LCD is the larger.
  const left = rng.int(min, Math.floor(max / 2))
  const right = left * rng.int(2, Math.floor(max / left))
  return { left, right }
}

const commonDenominator = defineSkill({
  id: 'common-denominator',
  name: 'Common Denominators',
  blurb: 'Find the LCD',
  build(context) {
    const { left, right } = denominatorPair(context)
    const leftNumerator = reducedNumerator(context, left)
    const rightNumerator = reducedNumerator(context, right)
    const lcm = (left * right) / gcd(left, right)
    const data: Extract<FractionData, { operation: 'common-denominator' }> = {
      operation: 'common-denominator',
      leftNumerator,
      leftDenominator: left,
      rightNumerator,
      rightDenominator: right,
    }
    const misconceptions: Misconception[] = [
      {
        value: left * right,
        tag: 'product-not-lcm',
        nudge: 'The product is a common denominator, but not the least one.',
      },
      {
        value: Math.max(left, right),
        tag: 'larger-denominator',
        nudge: 'Check that the smaller denominator divides evenly into it.',
      },
    ]

    return {
      prompt: 'What is the least common denominator?',
      display: {
        kind: 'math',
        notation: {
          kind: 'row',
          children: [
            fraction(String(leftNumerator), String(left)),
            text('and'),
            fraction(String(rightNumerator), String(right)),
          ],
        },
        label: `${leftNumerator} over ${left}, and, ${rightNumerator} over ${right}`,
        fraction: data,
      },
      answer: intAnswer(lcm),
      misconceptions,
      hint: 'Find the smallest number both denominators divide evenly into.',
      solution: [
        {
          text: 'The least common denominator is the smallest number both divide.',
          detail: `lcm(${left}, ${right}) = ${lcm}`,
        },
      ],
    }
  },
})

/**
 * Unlike denominators for an operation, coprime so the wall predictions stay
 * apart (proved in the change's design: the equalities would force a zero or
 * a repeated denominator).
 */
const coprimeDenominator = ({ rng, difficulty }: BuildContext) => {
  const [min, max] = band(difficulty, {
    1: [2, 4],
    2: [2, 5],
    3: [3, 6],
    4: [4, 8],
    5: [5, 10],
  })
  const left = rng.int(min, max)
  const candidates = Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(
    (candidate) => gcd(candidate, left) === 1 && candidate !== left,
  )
  return { left, right: rng.pick(candidates) }
}

const addFracDiffDen = defineSkill({
  id: 'add-frac-diff-den',
  name: 'Adding Unlike Fractions',
  blurb: '1/2 + 1/3',
  build(context) {
    const { left, right } = coprimeDenominator(context)
    // Low difficulties keep the sum proper; higher ones may exceed one, and
    // the answer is then an improper fraction — mixed form is 8.6's lesson.
    const leftPool =
      context.difficulty <= 2
        ? Array.from({ length: left - 1 }, (_, i) => i + 1).filter(
            (candidate) => gcd(candidate, left) === 1 && Math.floor((right * (left - candidate)) / left) >= 1,
          )
        : Array.from({ length: left - 1 }, (_, i) => i + 1).filter((candidate) => gcd(candidate, left) === 1)
    const leftNumerator = context.rng.pick(leftPool)
    const rightMax = context.difficulty <= 2 ? Math.floor((right * (left - leftNumerator)) / left) : right - 1
    const rightNumerator = reducedNumerator(context, right, 1, rightMax)
    const common = left * right
    const resultNumerator = leftNumerator * right + rightNumerator * left
    const data = operationData('add', leftNumerator, left, rightNumerator, right)
    const misconceptions: Misconception[] = [
      {
        // The major wall: one procedure collapses, adding denominators too.
        value: (leftNumerator + rightNumerator) / (left + right),
        tag: 'adds-across',
        nudge: 'The denominators name different sizes — they are not added directly.',
      },
      {
        value: (leftNumerator + rightNumerator) / common,
        tag: 'unscaled-numerators',
        nudge: 'Each numerator must be scaled to the common denominator first.',
      },
    ]

    return {
      prompt: 'What is the sum?',
      display: operationDisplay(data),
      answer: exactFraction(resultNumerator, common),
      keypad: { allowFraction: true },
      misconceptions,
      hint: 'Rewrite both fractions over the same denominator, then add.',
      solution: [
        {
          text: 'Rewrite each fraction over the common denominator.',
          detail:
            `${leftNumerator}/${left} → ${leftNumerator * right}/${common} and ` +
            `${rightNumerator}/${right} → ${rightNumerator * left}/${common}`,
        },
        {
          text: 'Add the scaled numerators.',
          detail: `${leftNumerator * right} + ${rightNumerator * left} = ${resultNumerator}`,
        },
        {
          text: 'Put the sum over the common denominator.',
          detail: `${resultNumerator}/${common}`,
        },
        ...reductionStep(resultNumerator, common),
      ],
    }
  },
})

const subFracDiffDen = defineSkill({
  id: 'sub-frac-diff-den',
  name: 'Subtracting Unlike Fractions',
  blurb: '3/4 − 1/3',
  build(context) {
    const { left, right } = coprimeDenominator(context)
    // Draw the subtrahend first, then a minuend strictly larger than it, so
    // the difference is positive on every draw and the flipped prediction is
    // its negative mirror. Both are drawn in lowest terms.
    const rightMax = Math.ceil((right * (left - 1)) / left) - 1
    const rightNumerator = reducedNumerator(context, right, 1, rightMax)
    const leftMin = Math.floor((rightNumerator * left) / right) + 1
    const leftNumerator = reducedNumerator(context, left, leftMin, left - 1)
    const common = left * right
    const resultNumerator = leftNumerator * right - rightNumerator * left
    const data = operationData('sub', leftNumerator, left, rightNumerator, right)
    const misconceptions: Misconception[] = [
      {
        value: (rightNumerator * left - leftNumerator * right) / common,
        tag: 'flipped-order',
        nudge: 'Subtract the second fraction from the first, not the other way round.',
      },
      {
        value: (leftNumerator * right + rightNumerator * left) / common,
        tag: 'added-instead',
        nudge: 'The problem asks for a difference — subtract the numerators.',
      },
    ]

    return {
      prompt: 'What is the difference?',
      display: operationDisplay(data),
      answer: exactFraction(resultNumerator, common),
      keypad: { allowFraction: true, allowNegative: true },
      misconceptions,
      hint: 'Rewrite both fractions over the same denominator, then subtract.',
      solution: [
        {
          text: 'Rewrite each fraction over the common denominator.',
          detail:
            `${leftNumerator}/${left} → ${leftNumerator * right}/${common} and ` +
            `${rightNumerator}/${right} → ${rightNumerator * left}/${common}`,
        },
        {
          text: 'Subtract the scaled numerators.',
          detail: `${leftNumerator * right} − ${rightNumerator * left} = ${resultNumerator}`,
        },
        {
          text: 'Put the difference over the common denominator.',
          detail: `${resultNumerator}/${common}`,
        },
        ...reductionStep(resultNumerator, common),
      ],
    }
  },
})

const improperToMixed = defineSkill({
  id: 'improper-to-mixed',
  name: 'Improper to Mixed',
  blurb: '7/4 becomes 1 and 3/4',
  build(context) {
    const { rng } = context
    const [denMin, denMax] = band(context.difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [3, 6],
      4: [4, 8],
      5: [5, 10],
    })
    const [wholeMin, wholeMax] = band(context.difficulty, {
      1: [1, 2],
      2: [1, 2],
      3: [1, 3],
      4: [2, 4],
      5: [2, 5],
    })
    const denominator = rng.int(denMin, denMax)
    const whole = rng.int(wholeMin, wholeMax)
    const remainder = rng.int(1, denominator - 1)
    const numerator = whole * denominator + remainder
    const data: Extract<FractionData, { operation: 'improper-to-mixed' }> = {
      operation: 'improper-to-mixed',
      numerator,
      denominator,
    }
    const misconceptions: Misconception[] = [
      {
        // Whole part from the remainder, fraction numerator from the quotient.
        // Authored as one division, exactly how diagnosis re-derives the value
        // from a typed entry — a sum would differ by an ulp and miss.
        value: (remainder * denominator + whole) / denominator,
        tag: 'quotient-remainder-swapped',
        nudge: 'The quotient is the whole part; the remainder is the fraction numerator.',
      },
      {
        // The quotient with the original improper fraction left as its part.
        value: (whole * denominator + numerator) / denominator,
        tag: 'whole-with-original-fraction',
        nudge: 'Only the remainder becomes the fraction part.',
      },
    ]

    return {
      prompt: 'Write this as a mixed number.',
      display: {
        kind: 'math',
        notation: fraction(String(numerator), String(denominator)),
        label: `${numerator} over ${denominator}`,
        fraction: data,
      },
      answer: {
        kind: 'exact',
        n: numerator,
        d: denominator,
        requireMixed: true,
        requireSimplified: true,
      },
      keypad: { allowMixed: true },
      misconceptions,
      hint: 'Divide the numerator by the denominator — the quotient is the whole part.',
      solution: [
        {
          text: 'Divide the numerator by the denominator.',
          detail: `${numerator} ÷ ${denominator} = ${whole} remainder ${remainder}`,
        },
        {
          text: 'The quotient is the whole part.',
          detail: `${whole}`,
        },
        {
          text: 'The remainder becomes the fraction numerator.',
          detail: `${remainder}/${denominator}`,
        },
        ...reductionStep(remainder, denominator),
      ],
    }
  },
})

const mixedToImproper = defineSkill({
  id: 'mixed-to-improper',
  name: 'Mixed to Improper',
  blurb: '1 and 3/4 becomes 7/4',
  build(context) {
    const [denMin, denMax] = band(context.difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [3, 6],
      4: [4, 8],
      5: [5, 10],
    })
    const [wholeMin, wholeMax] = band(context.difficulty, {
      1: [1, 2],
      2: [1, 3],
      3: [2, 4],
      4: [2, 5],
      5: [3, 7],
    })
    const denominator = context.rng.int(denMin, denMax)
    const numerator = reducedNumerator(context, denominator)
    const whole = context.rng.int(wholeMin, wholeMax)
    const improperNumerator = whole * denominator + numerator
    const data: Extract<FractionData, { operation: 'mixed-to-improper' }> = {
      operation: 'mixed-to-improper',
      whole,
      numerator,
      denominator,
    }

    return {
      prompt: 'Write this as an improper fraction.',
      display: {
        kind: 'math',
        notation: mixedNumber(whole, numerator, denominator),
        label: `${whole} and ${numerator} over ${denominator}`,
        fraction: data,
      },
      answer: exactFraction(improperNumerator, denominator),
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: whole,
          tag: 'dropped-numerator',
          nudge: 'The fraction part still contributes to the new numerator.',
        },
        {
          value: (whole * numerator) / denominator,
          tag: 'multiplied-by-numerator',
          nudge: 'Multiply the whole by the denominator, not the numerator.',
        },
      ],
      hint: 'Multiply the whole by the denominator, then add the numerator.',
      solution: [
        {
          text: 'Multiply the whole by the denominator.',
          detail: `${whole} × ${denominator} = ${whole * denominator}`,
        },
        {
          text: 'Add the numerator.',
          detail: `${whole * denominator} + ${numerator} = ${improperNumerator}`,
        },
        {
          text: 'Keep the denominator.',
          detail: `${improperNumerator}/${denominator}`,
        },
      ],
    }
  },
})

const mixedPair = (
  context: BuildContext,
  accepts: (left: number, right: number, denominator: number) => boolean,
  failure: string,
) => {
  const [min, max] = band(context.difficulty, {
    1: [3, 5],
    2: [4, 6],
    3: [5, 8],
    4: [6, 10],
    5: [8, 12],
  })
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const denominator = context.rng.int(min, max)
    const numerators = Array.from({ length: denominator - 1 }, (_, i) => i + 1).filter(
      (candidate) => gcd(candidate, denominator) === 1,
    )
    const pairs = numerators.flatMap((left) =>
      numerators
        .filter((right) => accepts(left, right, denominator))
        .map((right) => [left, right] as const),
    )
    if (pairs.length > 0) {
      const [leftNumerator, rightNumerator] = context.rng.pick(pairs)
      return { denominator, leftNumerator, rightNumerator }
    }
  }
  throw new Error(failure)
}

const addMixed = defineSkill({
  id: 'add-mixed',
  name: 'Adding Mixed Numbers',
  blurb: '1 1/2 + 2 1/4',
  build(context) {
    const carry = context.difficulty >= 4 || (context.difficulty === 3 && context.rng.bool())
    const { denominator, leftNumerator, rightNumerator } = mixedPair(
      context,
      (left, right, divisor) => {
        const sum = left + right
        return (carry ? sum > divisor : sum < divisor) && gcd(sum % divisor, divisor) === 1
      },
      `add-mixed: no ${carry ? 'carry' : 'non-carry'} pair in 200 draws`,
    )
    const [wholeMin, wholeMax] = band(context.difficulty, {
      1: [1, 2],
      2: [1, 3],
      3: [2, 4],
      4: [2, 6],
      5: [3, 8],
    })
    const leftWhole = context.rng.int(wholeMin, wholeMax)
    const rightWhole = context.rng.int(wholeMin, wholeMax)
    const fractionalSum = leftNumerator + rightNumerator
    const resultNumerator = (leftWhole + rightWhole) * denominator + fractionalSum
    const resultWhole = Math.floor(resultNumerator / denominator)
    const resultRemainder = resultNumerator % denominator
    const data: Extract<FractionData, { operation: 'add-mixed' }> = {
      operation: 'add-mixed',
      leftWhole,
      leftNumerator,
      leftDenominator: denominator,
      rightWhole,
      rightNumerator,
      rightDenominator: denominator,
    }

    return {
      prompt: 'What is the sum?',
      display: mixedOperationDisplay(data),
      answer: exactMixed(resultNumerator, denominator),
      keypad: { allowMixed: true },
      misconceptions: [
        {
          value: leftWhole + rightWhole,
          tag: 'added-wholes-only',
          nudge: 'The whole parts are only part of the sum; add the fractions too.',
        },
        {
          value: fractionalSum / denominator,
          tag: 'added-fractions-only',
          nudge: 'The fraction parts are only part of the sum; add the wholes too.',
        },
      ],
      hint: 'Add the whole parts and fraction parts, then regroup if needed.',
      solution: [
        {
          text: 'Add the whole parts.',
          detail: `${leftWhole} + ${rightWhole} = ${leftWhole + rightWhole}`,
        },
        {
          text: 'Add the fraction parts.',
          detail: `${leftNumerator}/${denominator} + ${rightNumerator}/${denominator} = ${fractionalSum}/${denominator}`,
        },
        ...(carry
          ? [
              {
                text: 'Regroup the improper fraction as one whole.',
                detail: `${fractionalSum}/${denominator} = 1 ${resultRemainder}/${denominator}`,
              },
            ]
          : []),
        {
          text: 'Combine the whole and fraction parts.',
          detail: `${resultWhole} ${resultRemainder}/${denominator}`,
        },
      ],
    }
  },
})

const subMixed = defineSkill({
  id: 'sub-mixed',
  name: 'Subtracting Mixed Numbers',
  blurb: 'Borrow from the whole',
  build(context) {
    const { denominator, leftNumerator, rightNumerator } = mixedPair(
      context,
      (left, right, divisor) =>
        left < right && gcd(divisor + left - right, divisor) === 1,
      'sub-mixed: no borrow pair in 200 draws',
    )
    const [rightMin, rightMax] = band(context.difficulty, {
      1: [1, 2],
      2: [1, 3],
      3: [2, 4],
      4: [2, 5],
      5: [3, 7],
    })
    const [gapMin, gapMax] = band(context.difficulty, {
      1: [2, 3],
      2: [2, 4],
      3: [2, 5],
      4: [3, 6],
      5: [3, 7],
    })
    const rightWhole = context.rng.int(rightMin, rightMax)
    const wholeGap = context.rng.int(gapMin, gapMax)
    const leftWhole = rightWhole + wholeGap
    const resultNumerator = wholeGap * denominator + leftNumerator - rightNumerator
    const resultWhole = wholeGap - 1
    const resultRemainder = denominator + leftNumerator - rightNumerator
    const data: Extract<FractionData, { operation: 'sub-mixed' }> = {
      operation: 'sub-mixed',
      leftWhole,
      leftNumerator,
      leftDenominator: denominator,
      rightWhole,
      rightNumerator,
      rightDenominator: denominator,
    }

    return {
      prompt: 'What is the difference?',
      display: mixedOperationDisplay(data),
      answer: exactMixed(resultNumerator, denominator),
      keypad: { allowMixed: true },
      misconceptions: [
        {
          value: (wholeGap * denominator + rightNumerator - leftNumerator) / denominator,
          tag: 'reversed-fraction-without-borrowing',
          nudge: 'The smaller fraction part means one whole must be borrowed first.',
        },
        {
          value: ((wholeGap - 1) * denominator + leftNumerator + 1 - rightNumerator) / denominator,
          tag: 'borrowed-one-piece',
          nudge: `One borrowed whole adds ${denominator} fraction pieces, not one.`,
        },
      ],
      hint: 'Borrow one whole, then subtract the whole and fraction parts.',
      solution: [
        {
          text: `Borrow one whole as ${denominator} fraction pieces.`,
          detail: `${leftWhole} ${leftNumerator}/${denominator} = ${leftWhole - 1} ${leftNumerator + denominator}/${denominator}`,
        },
        {
          text: 'Subtract the whole and fraction parts.',
          detail:
            `${leftWhole - 1} ${leftNumerator + denominator}/${denominator} − ` +
            `${rightWhole} ${rightNumerator}/${denominator} = ${resultWhole} ${resultRemainder}/${denominator}`,
        },
      ],
    }
  },
})

const fractionOperands = (context: BuildContext, unequal = false) => {
  const [min, max] = band(context.difficulty, {
    1: [2, 4],
    2: [2, 5],
    3: [3, 7],
    4: [4, 9],
    5: [6, 12],
  })
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const leftDenominator = context.rng.int(min, max)
    const rightDenominator = context.rng.int(min, max)
    const leftNumerator = reducedNumerator(context, leftDenominator)
    const rightNumerator = reducedNumerator(context, rightDenominator)
    if (
      unequal &&
      leftNumerator * rightDenominator === rightNumerator * leftDenominator
    ) {
      continue
    }
    return { leftNumerator, leftDenominator, rightNumerator, rightDenominator }
  }
  throw new Error('fraction operation: no unequal pair in 200 draws')
}

const multFractions = defineSkill({
  id: 'mult-fractions',
  name: 'Multiplying Fractions',
  blurb: 'Straight across',
  build(context) {
    const operands = fractionOperands(context)
    const { leftNumerator, leftDenominator, rightNumerator, rightDenominator } = operands
    const data: Extract<FractionData, { operation: 'multiply' }> = { operation: 'multiply', ...operands }
    const resultNumerator = leftNumerator * rightNumerator
    const resultDenominator = leftDenominator * rightDenominator

    return {
      prompt: 'What is the product?',
      display: productDisplay(data),
      answer: exactFraction(resultNumerator, resultDenominator),
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: (leftNumerator + rightNumerator) / (leftDenominator + rightDenominator),
          tag: 'added-instead',
          nudge: 'Multiplication works straight across; multiply both tops and both bottoms.',
        },
        {
          value: resultNumerator / leftDenominator,
          tag: 'kept-one-denominator',
          nudge: 'Multiply the denominators too, then reduce the result.',
        },
      ],
      hint: 'Multiply the numerators, multiply the denominators, then reduce.',
      solution: [
        {
          text: 'Multiply the numerators.',
          detail: `${leftNumerator} × ${rightNumerator} = ${resultNumerator}`,
        },
        {
          text: 'Multiply the denominators.',
          detail: `${leftDenominator} × ${rightDenominator} = ${resultDenominator}`,
        },
        ...reductionStep(resultNumerator, resultDenominator),
      ],
    }
  },
})

const divFractions = defineSkill({
  id: 'div-fractions',
  name: 'Dividing Fractions',
  blurb: 'Keep, change, flip',
  build(context) {
    const operands = fractionOperands(context, true)
    const { leftNumerator, leftDenominator, rightNumerator, rightDenominator } = operands
    const data: Extract<FractionData, { operation: 'divide' }> = { operation: 'divide', ...operands }
    const resultNumerator = leftNumerator * rightDenominator
    const resultDenominator = leftDenominator * rightNumerator

    return {
      prompt: 'What is the quotient?',
      display: productDisplay(data),
      answer: exactFraction(resultNumerator, resultDenominator),
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: (leftDenominator * rightNumerator) / (leftNumerator * rightDenominator),
          tag: 'flipped-first',
          nudge: 'Keep the first fraction and flip only the second one.',
        },
        {
          value: (leftNumerator * rightNumerator) / (leftDenominator * rightDenominator),
          tag: 'multiplied-without-flip',
          nudge: 'Change division to multiplication after flipping the second fraction.',
        },
      ],
      hint: 'Keep the first fraction, change to multiplication, then flip the second.',
      solution: [
        {
          text: 'Keep the first fraction and flip the second.',
          detail: `${leftNumerator}/${leftDenominator} × ${rightDenominator}/${rightNumerator}`,
        },
        {
          text: 'Multiply straight across.',
          detail: `${resultNumerator}/${resultDenominator}`,
        },
        ...reductionStep(resultNumerator, resultDenominator),
      ],
    }
  },
})

const fractionWords = defineSkill({
  id: 'fraction-words',
  name: 'Fraction Word Problems',
  blurb: 'Spot the fraction',
  build({ rng, difficulty }) {
    const [wholeMin, wholeMax] = band(difficulty, {
      1: [4, 8],
      2: [6, 12],
      3: [10, 18],
      4: [16, 26],
      5: [24, 40],
    })
    const whole = rng.int(wholeMin, wholeMax)
    const part = rng.int(1, whole - 1)
    const distractors = Array.from({ length: wholeMax - 1 }, (_, i) => i + 2).filter(
      (candidate) => candidate !== whole,
    )
    const distractor = rng.pick(distractors)
    const frame = pickFrame(rng, FRACTION_FRAMES)

    return {
      ...fractionStoryProblem(frame, { a: part, b: whole, distractor }),
      keypad: { allowFraction: true },
    }
  },
})

export const unit08 = [
  addFracSameDen,
  subFracSameDen,
  commonDenominator,
  addFracDiffDen,
  subFracDiffDen,
  improperToMixed,
  mixedToImproper,
  addMixed,
  subMixed,
  multFractions,
  divFractions,
  fractionWords,
]
