import { constrain } from '../lib/rng'
import { format as formatRational, gcd, rational, type Rational } from '../lib/rational'
import type { MathNotation, PolynomialCoefficients, PolynomialData, RootPairValue } from '../lib/types'
import { band, defineSkill, drawn, term, type BuildContext, type Ladder } from './engine'

/** Unit 18 · Polynomials & Quadratics. */

const VARIABLE = 'x'

const ARITHMETIC_BAND: Ladder = {
  1: [1, 4],
  2: [1, 6],
  3: [2, 9],
  4: [2, 13],
  5: [3, 18],
}

const OUTER_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 7],
  4: [3, 9],
  5: [4, 12],
}

const FACTOR_BAND: Ladder = {
  1: [2, 3],
  2: [2, 5],
  3: [3, 7],
  4: [4, 9],
  5: [5, 12],
}

type Coefficients = PolynomialCoefficients

const body = (coefficient: number, degree: 0 | 1 | 2): string => {
  const magnitude = Math.abs(coefficient)
  const variable = degree === 2 ? `${VARIABLE}²` : degree === 1 ? VARIABLE : ''
  if (degree === 0) return String(magnitude)
  return magnitude === 1 ? variable : `${magnitude}${variable}`
}

/** Write a polynomial with the sign and spacing appropriate to its surface. */
const polynomialText = (
  coefficients: Coefficients,
  minus: '−' | '-' = '−',
  spaced = true,
): string => {
  const entries: Array<{ coefficient: number; degree: 2 | 1 | 0 }> = [
    { coefficient: coefficients.quadratic, degree: 2 },
    { coefficient: coefficients.linear, degree: 1 },
    { coefficient: coefficients.constant, degree: 0 },
  ]
  const terms = entries.filter(({ coefficient }) => coefficient !== 0)
  if (terms.length === 0) return '0'

  return terms.reduce((text, { coefficient, degree }, index) => {
    const sign = coefficient < 0 ? minus : '+'
    const value = body(coefficient, degree)
    if (index === 0) return coefficient < 0 ? `${minus}${value}` : value
    return spaced ? `${text} ${sign} ${value}` : `${text}${sign}${value}`
  }, '')
}

const monomial = (coefficient: number, degree: 1 | 2): string => body(coefficient, degree)

const binomialText = (constant: number, spaced = true): string => {
  const sign = constant < 0 ? '-' : '+'
  const value = Math.abs(constant)
  return spaced ? `${VARIABLE} ${sign === '-' ? '−' : '+'} ${value}` : `${VARIABLE}${sign}${value}`
}

const factoredText = (pair: readonly [number, number], spaced = true): string =>
  `(${binomialText(pair[0], spaced)})(${binomialText(pair[1], spaced)})`

const drawCoefficients = (context: BuildContext): Coefficients => {
  const [min, max] = band(context.difficulty, ARITHMETIC_BAND)
  return {
    quadratic: context.rng.int(min, max),
    linear: context.rng.int(min, max),
    constant: context.rng.int(min, max),
  }
}

const addCoefficients = (left: Coefficients, right: Coefficients): Coefficients => ({
  quadratic: left.quadratic + right.quadratic,
  linear: left.linear + right.linear,
  constant: left.constant + right.constant,
})

const subtractCoefficients = (left: Coefficients, right: Coefficients): Coefficients => ({
  quadratic: left.quadratic - right.quadratic,
  linear: left.linear - right.linear,
  constant: left.constant - right.constant,
})

const addPolynomials = defineSkill({
  id: 'add-polynomials',
  name: 'Adding Polynomials',
  blurb: 'Combine the like terms',
  build(context: BuildContext) {
    const left = drawCoefficients(context)
    const right = drawCoefficients(context)
    const answerCoefficients = addCoefficients(left, right)
    const data: PolynomialData = { operation: 'add', left, right }
    const canonical = polynomialText(answerCoefficients, '-', false)

    return {
      prompt: 'Add the polynomials.',
      display: {
        kind: 'story',
        text: `(${polynomialText(left)}) + (${polynomialText(right)})`,
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'expanded' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: {
            kind: 'text',
            value: polynomialText({
              quadratic: answerCoefficients.quadratic,
              linear: left.linear,
              constant: left.constant,
            }, '-', false),
          },
          tag: 'added-quadratic-only',
          nudge: 'Combine matching degrees in every term.',
        },
        {
          value: {
            kind: 'text',
            value: polynomialText({
              quadratic: left.quadratic,
              linear: left.linear,
              constant: answerCoefficients.constant,
            }, '-', false),
          },
          tag: 'added-constant-only',
          nudge: 'Add the constants, linear terms, and squares separately.',
        },
      ],
      hint: 'Add coefficients with the same degree.',
      solution: [
        {
          text: 'Add the square coefficients.',
          detail: `${left.quadratic} + ${right.quadratic} = ${answerCoefficients.quadratic}`,
        },
        {
          text: 'Add the linear coefficients.',
          detail: `${left.linear} + ${right.linear} = ${answerCoefficients.linear}`,
        },
        {
          text: 'Add the constant terms.',
          detail: `${left.constant} + ${right.constant} = ${answerCoefficients.constant}`,
        },
      ],
    }
  },
})

type OrderedPair = { low: number; high: number }

const drawOrderedPair = (context: BuildContext): OrderedPair => {
  const [min, max] = band(context.difficulty, ARITHMETIC_BAND)
  const low = context.rng.int(min, max - 1)
  return { low, high: context.rng.int(low + 1, max) }
}

const drawSubtractionSources = (context: BuildContext): { left: Coefficients; right: Coefficients } => {
  const quadratic = drawOrderedPair(context)
  const linear = drawOrderedPair(context)
  const constant = drawOrderedPair(context)
  const high: Coefficients = {
    quadratic: quadratic.high,
    linear: linear.high,
    constant: constant.high,
  }
  const low: Coefficients = {
    quadratic: quadratic.low,
    linear: linear.low,
    constant: constant.low,
  }
  return context.rng.bool() ? { left: high, right: low } : { left: low, right: high }
}

const subPolynomials = defineSkill({
  id: 'sub-polynomials',
  name: 'Subtracting Polynomials',
  blurb: 'Distribute the minus first',
  build(context: BuildContext) {
    const { left, right } = drawSubtractionSources(context)
    const answerCoefficients = subtractCoefficients(left, right)
    const data: PolynomialData = { operation: 'sub', left, right }
    const added = addCoefficients(left, right)
    const onlyFirst = {
      quadratic: answerCoefficients.quadratic,
      linear: left.linear + right.linear,
      constant: left.constant + right.constant,
    }
    const canonical = polynomialText(answerCoefficients, '-', false)

    return {
      prompt: 'Subtract the second polynomial from the first.',
      display: {
        kind: 'story',
        text: `(${polynomialText(left)}) − (${polynomialText(right)})`,
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'expanded' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: polynomialText(onlyFirst, '-', false) },
          tag: 'subtracted-first-term-only',
          nudge: 'The minus applies to every term in the second polynomial.',
        },
        {
          value: { kind: 'text', value: polynomialText(added, '-', false) },
          tag: 'added-polynomials',
          nudge: 'Subtract the second polynomial instead of adding it.',
        },
      ],
      hint: 'Change every sign in the second polynomial before combining.',
      solution: [
        { text: 'Distribute the minus to every term.', detail: polynomialText(right, '-', false) },
        {
          text: 'Subtract matching square terms.',
          detail: `${left.quadratic} − ${right.quadratic} = ${answerCoefficients.quadratic}`,
        },
        {
          text: 'Combine the linear and constant terms.',
          detail: `${answerCoefficients.linear}x + ${answerCoefficients.constant}`,
        },
      ],
    }
  },
})

const multMonomial = defineSkill({
  id: 'mult-monomial',
  name: 'Multiplying by a Monomial',
  blurb: 'Distribute a single term',
  build(context: BuildContext) {
    const [innerMin, innerMax] = band(context.difficulty, ARITHMETIC_BAND)
    const [outerMin, outerMax] = band(context.difficulty, OUTER_BAND)
    const outerCoefficient = context.rng.int(outerMin, outerMax)
    const innerLinear = context.rng.int(innerMin, innerMax)
    const innerConstant = context.rng.int(innerMin, innerMax)
    const quadratic = outerCoefficient * innerLinear
    const linear = outerCoefficient * innerConstant
    const data: PolynomialData = { operation: 'mult-monomial', outerCoefficient, innerLinear, innerConstant }
    const canonical = polynomialText({ quadratic, linear, constant: 0 }, '-', false)

    return {
      prompt: 'Expand the product.',
      display: {
        kind: 'story',
        text: `${monomial(outerCoefficient, 1)}(${polynomialText({ quadratic: innerLinear, linear: 0, constant: innerConstant })})`,
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'expanded' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: polynomialText({ quadratic, linear: 0, constant: innerConstant }, '-', false) },
          tag: 'distributed-first-term-only',
          nudge: 'Multiply the outside term by both terms inside.',
        },
        {
          value: { kind: 'text', value: polynomialText({ quadratic: 0, linear: quadratic, constant: linear }, '-', false) },
          tag: 'lost-variable-degree',
          nudge: 'The outside x joins the inside x to make x².',
        },
      ],
      hint: 'Multiply the outside monomial by each term inside.',
      solution: [
        { text: 'Multiply the x terms.', detail: `${outerCoefficient}x × ${innerLinear}x = ${quadratic}x²` },
        { text: 'Multiply the constant term.', detail: `${outerCoefficient}x × ${innerConstant} = ${linear}x` },
      ],
    }
  },
})

const FOIL_BAND: Ladder = {
  1: [2, 4],
  2: [2, 6],
  3: [3, 8],
  4: [4, 11],
  5: [5, 15],
}

const foil = defineSkill({
  id: 'foil',
  name: 'FOIL',
  blurb: 'Multiply two binomials',
  build(context: BuildContext) {
    const [min, max] = band(context.difficulty, FOIL_BAND)
    const leftMagnitude = context.rng.int(min, max - 1)
    const rightMagnitude = context.rng.int(leftMagnitude + 1, max)
    const leftConstant = context.rng.bool() ? leftMagnitude : -leftMagnitude
    const rightConstant = context.rng.bool() ? rightMagnitude : -rightMagnitude
    const linear = leftConstant + rightConstant
    const constant = leftConstant * rightConstant
    const data: PolynomialData = { operation: 'foil', leftConstant, rightConstant }
    const canonical = polynomialText({ quadratic: 1, linear, constant }, '-', false)
    const firstAndLast = polynomialText({ quadratic: 1, linear: 0, constant }, '-', false)
    const multipliedMiddle = polynomialText({ quadratic: 1, linear: constant, constant }, '-', false)

    return {
      prompt: 'Expand using FOIL.',
      display: {
        kind: 'story',
        text: `(${binomialText(leftConstant)})(${binomialText(rightConstant)})`,
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'expanded' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: firstAndLast },
          tag: 'omitted-middle-terms',
          nudge: 'The middle products combine into a linear term.',
        },
        {
          value: { kind: 'text', value: multipliedMiddle },
          tag: 'multiplied-middle-terms',
          nudge: 'Add the two middle products instead of multiplying them.',
        },
      ],
      hint: 'Multiply all four pairs, then combine the middle terms.',
      solution: [
        { text: 'Multiply the first terms.', detail: `${VARIABLE} × ${VARIABLE} = ${VARIABLE}²` },
        { text: 'Multiply the two middle pairs.', detail: `${leftConstant}x + ${rightConstant}x = ${linear}x` },
        { text: 'Multiply the last terms.', detail: `${leftConstant} × ${rightConstant} = ${drawn(constant)}` },
      ],
    }
  },
})

const GCF_INNER_BAND: Ladder = {
  1: [1, 5],
  2: [1, 7],
  3: [2, 9],
  4: [2, 12],
  5: [3, 16],
}

const factorGcfPoly = defineSkill({
  id: 'factor-gcf-poly',
  name: 'Factoring a Polynomial',
  blurb: 'Take out the common factor',
  build(context: BuildContext) {
    const [factorMin, factorMax] = band(context.difficulty, FACTOR_BAND)
    const [innerMin, innerMax] = band(context.difficulty, GCF_INNER_BAND)
    const factor = context.rng.int(factorMin, factorMax)
    const innerConstant = context.rng.int(innerMin, innerMax)
    const innerOptions = Array.from({ length: 8 }, (_, i) => i + 1).filter(
      (coefficient) => gcd(coefficient, innerConstant) === 1,
    )
    const innerQuadratic = context.rng.pick(innerOptions)
    const quadratic = factor * innerQuadratic
    const linear = factor * innerConstant
    const data: PolynomialData = { operation: 'factor-gcf-poly', quadratic, linear }
    const inside = { quadratic: 0, linear: innerQuadratic, constant: innerConstant }
    const canonical = `${term(factor, VARIABLE)}(${polynomialText(inside, '-', false)})`
    const expanded = polynomialText({ quadratic, linear, constant: 0 }, '-', false)
    const numericOnly = `${factor}(${polynomialText({ quadratic: innerQuadratic, linear: innerConstant, constant: 0 }, '-', false)})`
    const firstOnly = `${term(factor, VARIABLE)}(${monomial(innerQuadratic, 1)}+${linear})`

    return {
      prompt: 'Factor out the greatest common monomial.',
      display: {
        kind: 'story',
        text: polynomialText({ quadratic, linear, constant: 0 }),
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'exact' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: expanded },
          tag: 'left-expanded',
          nudge: 'The shared monomial belongs outside the parentheses.',
        },
        {
          value: { kind: 'text', value: numericOnly },
          tag: 'left-variable-inside',
          nudge: 'Take out the shared x as well as the number.',
        },
        {
          value: { kind: 'text', value: firstOnly },
          tag: 'divided-second-term-only',
          nudge: 'Divide both terms by the common factor.',
        },
      ],
      hint: 'Find the greatest common monomial, then divide both terms by it.',
      solution: [
        { text: 'Find the numeric greatest common factor.', detail: `${quadratic} and ${linear} share ${factor}` },
        { text: 'Take out the shared x.', detail: `${term(factor, VARIABLE)}(...)` },
        { text: 'Divide both terms inside.', detail: canonical },
      ],
    }
  },
})

type FactorFrame = {
  difficulty: 1 | 2 | 3 | 4 | 5
  correct: readonly [number, number]
  product: readonly [number, number]
  sum: readonly [number, number]
  oppositeProduct: readonly [number, number]
  oppositeSum: readonly [number, number]
}

const FACTOR_FRAMES: readonly FactorFrame[] = [
  { difficulty: 1, correct: [2, 6], product: [3, 4], sum: [1, 7], oppositeProduct: [3, 4], oppositeSum: [1, 5] },
  { difficulty: 1, correct: [3, 7], product: [1, 21], sum: [2, 8], oppositeProduct: [1, 21], oppositeSum: [2, 6] },
  { difficulty: 2, correct: [3, 8], product: [4, 6], sum: [2, 9], oppositeProduct: [4, 6], oppositeSum: [2, 7] },
  { difficulty: 2, correct: [4, 9], product: [6, 6], sum: [3, 10], oppositeProduct: [6, 6], oppositeSum: [3, 7] },
  { difficulty: 3, correct: [4, 10], product: [5, 8], sum: [3, 11], oppositeProduct: [5, 8], oppositeSum: [2, 8] },
  { difficulty: 3, correct: [5, 11], product: [1, 55], sum: [4, 12], oppositeProduct: [1, 55], oppositeSum: [3, 9] },
  { difficulty: 4, correct: [5, 12], product: [6, 10], sum: [4, 13], oppositeProduct: [6, 10], oppositeSum: [4, 11] },
  { difficulty: 4, correct: [6, 13], product: [5, 13], sum: [5, 14], oppositeProduct: [5, 13], oppositeSum: [5, 11] },
  { difficulty: 5, correct: [6, 14], product: [7, 12], sum: [5, 15], oppositeProduct: [7, 12], oppositeSum: [4, 12] },
  { difficulty: 5, correct: [7, 15], product: [5, 21], sum: [6, 16], oppositeProduct: [5, 21], oppositeSum: [6, 10] },
]

type SignFamily = 'positive' | 'negative' | 'opposite'

const applySigns = (pair: readonly [number, number], family: SignFamily): [number, number] => {
  if (family === 'positive') return [pair[0], pair[1]]
  if (family === 'negative') return [-pair[0], -pair[1]]
  return [-pair[0], pair[1]]
}

const factorTrinomial = defineSkill({
  id: 'factor-trinomial',
  name: 'Factoring Trinomials',
  blurb: 'Find the pair that works',
  build(context: BuildContext) {
    const frames = FACTOR_FRAMES.filter((frame) => frame.difficulty === context.difficulty)
    const frame = context.rng.pick(frames)
    const family = context.rng.pick<SignFamily>(['positive', 'negative', 'opposite'])
    const correct = applySigns(frame.correct, family)
    const productOnly = applySigns(
      family === 'opposite' ? frame.oppositeProduct : frame.product,
      family,
    )
    const sumOnly = applySigns(
      family === 'opposite' ? frame.oppositeSum : frame.sum,
      family,
    )
    const linear = correct[0] + correct[1]
    const constant = correct[0] * correct[1]
    const data: PolynomialData = { operation: 'factor-trinomial', linear, constant }
    const canonical = factoredText(correct, false)

    return {
      prompt: 'Factor the monic trinomial.',
      display: {
        kind: 'story',
        text: polynomialText({ quadratic: 1, linear, constant }),
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'exact' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: factoredText(productOnly, false) },
          tag: 'matched-product-only',
          nudge: 'The pair must match the product and the sum.',
        },
        {
          value: { kind: 'text', value: factoredText(sumOnly, false) },
          tag: 'matched-sum-only',
          nudge: 'Check the product as well as the sum.',
        },
      ],
      hint: 'Find two integers with this product and this sum.',
      solution: [
        { text: 'Find a pair with the constant product.', detail: `${correct[0]} × ${correct[1]} = ${drawn(constant)}` },
        { text: 'Check that their sum matches.', detail: `${drawn(correct[0])} + ${drawn(correct[1])} = ${drawn(linear)}` },
        { text: 'Write the two binomial factors.', detail: canonical },
      ],
    }
  },
})

const SQUARE_ROOT_BAND: Ladder = {
  1: [2, 6],
  2: [4, 9],
  3: [7, 13],
  4: [10, 18],
  5: [14, 25],
}

const differenceOfSquares = defineSkill({
  id: 'difference-of-squares',
  name: 'Difference of Squares',
  blurb: 'A pattern worth recognising',
  build(context: BuildContext) {
    const [min, max] = band(context.difficulty, SQUARE_ROOT_BAND)
    const squareRoot = context.rng.int(min, max)
    const square = squareRoot * squareRoot
    const data: PolynomialData = { operation: 'difference-of-squares', squareRoot }
    const canonical = factoredText([-squareRoot, squareRoot], false)

    return {
      prompt: 'Factor the difference of squares.',
      display: {
        kind: 'story',
        text: polynomialText({ quadratic: 1, linear: 0, constant: -square }),
        polynomial: data,
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, maxDegree: 2, form: 'exact' },
      inputMode: 'expression',
      misconceptions: [
        {
          value: { kind: 'text', value: factoredText([-squareRoot, -squareRoot], false) },
          tag: 'used-same-sign',
          nudge: 'Conjugate factors use opposite signs.',
        },
        {
          value: { kind: 'text', value: factoredText([-square, square], false) },
          tag: 'used-square-not-root',
          nudge: 'Use the square root of the constant in each factor.',
        },
      ],
      hint: 'Find each square root, then use opposite signs.',
      solution: [
        { text: 'Recognise both terms as perfect squares.', detail: `x² and ${squareRoot}²` },
        { text: 'Use one minus and one plus factor.', detail: canonical },
      ],
    }
  },
})

const FACTORED_ZERO_BAND: Ladder = {
  1: [2, 5],
  2: [3, 6],
  3: [3, 7],
  4: [4, 8],
  5: [5, 9],
}

const signedFactorConstant = (magnitude: number, negative: boolean) =>
  negative ? -magnitude : magnitude

const solveByFactoring = defineSkill({
  id: 'solve-by-factoring',
  name: 'Solving by Factoring',
  blurb: 'The zero product rule',
  build(context: BuildContext) {
    const [min, max] = band(context.difficulty, FACTORED_ZERO_BAND)
    const firstMagnitude = context.rng.int(min, max)
    const secondMagnitude = context.rng.intExcept(min, max, [firstMagnitude])
    const family = context.difficulty <= 2
      ? 'positive'
      : context.difficulty === 3
        ? 'mixed'
        : context.rng.pick(['positive', 'mixed', 'negative'] as const)
    const firstConstant = signedFactorConstant(firstMagnitude, family !== 'positive')
    const secondConstant = signedFactorConstant(secondMagnitude, family === 'negative')
    const data: PolynomialData = { operation: 'factored-zero', firstConstant, secondConstant }
    const firstRoot = rational(-firstConstant, 1)
    const secondRoot = rational(-secondConstant, 1)

    return {
      prompt: 'Find both roots.',
      display: {
        kind: 'equation',
        text: `${factoredText([firstConstant, secondConstant])} = 0`,
        polynomial: data,
      },
      answer: { kind: 'root-pair', roots: [firstRoot, secondRoot] },
      inputMode: 'root-pair',
      keypad: { allowNegative: true },
      misconceptions: [
        {
          value: {
            kind: 'root-pair',
            roots: [rational(firstConstant, 1), rational(secondConstant, 1)],
          },
          tag: 'copied-factor-signs',
          nudge: 'Set each factor equal to zero before solving.',
        },
        {
          value: { kind: 'root-pair', roots: [firstRoot, firstRoot] },
          tag: 'repeated-first-root',
          nudge: 'The second factor gives a different root.',
        },
      ],
      hint: 'Set each factor equal to zero and solve both equations.',
      solution: [
        { text: 'Set the first factor equal to zero.', detail: `${binomialText(firstConstant)} = 0` },
        { text: 'Solve for the first root.', detail: `x = ${drawn(-firstConstant)}` },
        { text: 'Repeat with the second factor.', detail: `x = ${drawn(-secondConstant)}` },
      ],
    }
  },
})

const QUADRATIC_NUMERATOR_BAND: Ladder = {
  1: [1, 4],
  2: [2, 7],
  3: [3, 9],
  4: [5, 12],
  5: [8, 18],
}

const quadraticFormulaNotation = (): MathNotation => ({
  kind: 'row',
  children: [
    { kind: 'text', value: 'x' },
    { kind: 'text', value: '=' },
    {
      kind: 'fraction',
      numerator: {
        kind: 'row',
        children: [
          { kind: 'text', value: '−b' },
          { kind: 'text', value: '±' },
          {
            kind: 'root',
            radicand: {
              kind: 'row',
              children: [
                {
                  kind: 'superscript',
                  base: { kind: 'text', value: 'b' },
                  exponent: { kind: 'text', value: '2' },
                },
                { kind: 'text', value: '−' },
                { kind: 'text', value: '4ac' },
              ],
            },
          },
        ],
      },
      denominator: { kind: 'text', value: '2a' },
    },
  ],
})

const QUADRATIC_FORMULA_LABEL =
  'x equals negative b plus or minus the square root of b squared minus four a c, all over two a'

type QuadraticFrame = {
  a: number
  b: number
  c: number
  discriminantRoot: number
  roots: readonly [Rational, Rational]
}

const sameRational = (left: Rational, right: Rational) =>
  left.n === right.n && left.d === right.d

const quadraticRoots = (
  a: number,
  b: number,
  discriminantRoot: number,
  numeratorUsesPositiveB = false,
  denominatorFactor = 2,
): readonly [Rational, Rational] => {
  const middle = numeratorUsesPositiveB ? b : -b
  const denominator = denominatorFactor * a
  return [
    rational(middle - discriminantRoot, denominator),
    rational(middle + discriminantRoot, denominator),
  ]
}

const quadraticFrame = (context: BuildContext): QuadraticFrame => {
  const [min, max] = band(context.difficulty, QUADRATIC_NUMERATOR_BAND)
  const denominators = context.difficulty <= 2
    ? [1]
    : context.difficulty === 3
      ? [1, 2]
      : context.difficulty === 4
        ? [2, 3]
        : [2, 3, 4]

  return constrain(
    () => {
      const first = rational(
        signedFactorConstant(context.rng.int(min, max), context.rng.bool()),
        context.rng.pick(denominators),
      )
      const second = rational(
        signedFactorConstant(context.rng.int(min, max), context.rng.bool()),
        context.rng.pick(denominators),
      )
      const rawA = first.d * second.d
      const rawB = -(first.n * second.d + second.n * first.d)
      const rawC = first.n * second.n
      const common = gcd(gcd(Math.abs(rawA), Math.abs(rawB)), Math.abs(rawC))
      const a = rawA / common
      const b = rawB / common
      const c = rawC / common
      const discriminantRoot = Math.sqrt(b * b - 4 * a * c)
      return {
        a,
        b,
        c,
        discriminantRoot,
        roots: quadraticRoots(a, b, discriminantRoot),
      }
    },
    (frame) => {
      if (![frame.a, frame.b, frame.c, frame.discriminantRoot].every(Number.isSafeInteger)) return false
      if (frame.b === 0 || frame.c === 0 || frame.discriminantRoot <= 0) return false
      if (sameRational(frame.roots[0], frame.roots[1])) return false
      if (context.difficulty <= 2) return frame.a === 1 && frame.roots.every((root) => root.d === 1)
      return frame.a > 1 && frame.roots.some((root) => root.d > 1)
    },
  )
}

const needsNegativeKey = (pairs: readonly RootPairValue[]) =>
  pairs.some((pair) => pair.roots.some((root) => root.n < 0))

const needsFractionKey = (pairs: readonly RootPairValue[]) =>
  pairs.some((pair) => pair.roots.some((root) => root.d > 1))

const quadraticFormula = defineSkill({
  id: 'quadratic-formula',
  name: 'The Quadratic Formula',
  blurb: 'Substitute into the formula',
  build(context: BuildContext) {
    const frame = quadraticFrame(context)
    const { a, b, c, discriminantRoot, roots } = frame
    const data: PolynomialData = { operation: 'quadratic-formula', a, b, c }
    const answer: RootPairValue = { kind: 'root-pair', roots }
    const positiveB: RootPairValue = {
      kind: 'root-pair',
      roots: quadraticRoots(a, b, discriminantRoot, true),
    }
    const dividedByA: RootPairValue = {
      kind: 'root-pair',
      roots: quadraticRoots(a, b, discriminantRoot, false, 1),
    }
    const pairs = [answer, positiveB, dividedByA]
    const equation = `${polynomialText({ quadratic: a, linear: b, constant: c })} = 0`

    return {
      prompt: `Solve ${equation} using a = ${a}, b = ${drawn(b)}, c = ${drawn(c)}.`,
      display: {
        kind: 'math',
        notation: quadraticFormulaNotation(),
        label: QUADRATIC_FORMULA_LABEL,
        polynomial: data,
      },
      answer,
      inputMode: 'root-pair',
      keypad: {
        allowNegative: needsNegativeKey(pairs),
        allowFraction: needsFractionKey(pairs),
      },
      misconceptions: [
        {
          value: positiveB,
          tag: 'used-positive-b',
          nudge: 'The numerator starts with negative b.',
        },
        {
          value: dividedByA,
          tag: 'divided-by-a',
          nudge: 'The denominator is two times a.',
        },
      ],
      hint: 'Substitute the coefficients, then use both signs before dividing.',
      solution: [
        { text: 'Substitute a, b, and c.', detail: `a = ${a}, b = ${drawn(b)}, c = ${drawn(c)}` },
        { text: 'Evaluate the discriminant.', detail: `b² − 4ac = ${discriminantRoot * discriminantRoot}` },
        { text: 'Use both signs in the numerator.', detail: `−b ± ${discriminantRoot}` },
        { text: 'Divide each result by two a.', detail: roots.map(formatRational).join(', ') },
      ],
    }
  },
})

export const unit18 = [
  addPolynomials,
  subPolynomials,
  multMonomial,
  foil,
  factorGcfPoly,
  factorTrinomial,
  differenceOfSquares,
  solveByFactoring,
  quadraticFormula,
]
