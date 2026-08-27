import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import { gcd, rational, toNumber } from '../lib/rational'
import type { ShapeDiagram } from '../lib/shape-diagram'
import type { Choice, FractionData, MathNotation, SkillGenerator } from '../lib/types'
import { band, defineSkill, type BuildContext, type ProblemSpec } from './engine'

/**
 * Unit 7 · Fractions: Meaning.
 *
 * These nine skills deliberately stop before fraction arithmetic. Every draw
 * asks what a fraction means, what its parts are called, where it sits, how two
 * names describe one amount, or how represented amounts compare. The integer
 * source values travel beside the notation so the global verifier can read the
 * question without turning the renderer into an algebra engine.
 */

const denominatorBand = (difficulty: BuildContext['difficulty']) =>
  band(difficulty, {
    1: [2, 3],
    2: [2, 4],
    3: [3, 6],
    4: [4, 8],
    5: [5, 10],
  })

const properFraction = ({ rng, difficulty }: BuildContext) => {
  const [min, max] = denominatorBand(difficulty)
  const denominator = rng.int(min, max)
  const numerator = rng.int(1, denominator - 1)
  return { numerator, denominator }
}

const exactFraction = (numerator: number, denominator: number) => ({
  kind: 'exact' as const,
  ...rational(numerator, denominator),
})

const text = (value: string): MathNotation => ({ kind: 'text', value })

const fraction = (numerator: string, denominator: string): MathNotation => ({
  kind: 'fraction',
  numerator: text(numerator),
  denominator: text(denominator),
})

const readDisplay = (numerator: number, denominator: number): ProblemSpec['display'] => ({
  kind: 'math',
  notation: fraction(`${numerator} selected`, `${denominator} equal parts`),
  label: `${numerator} selected parts out of ${denominator} equal parts`,
  fraction: { operation: 'read', numerator, denominator },
})

const simpleFractionDisplay = (
  data: Extract<FractionData, { operation: 'place' | 'name-part' | 'simplify' }>,
): ProblemSpec['display'] => ({
  kind: 'math',
  notation: fraction(String(data.numerator), String(data.denominator)),
  label: `${data.numerator} over ${data.denominator}`,
  fraction: data,
})

type Relation = -1 | 0 | 1

const compareFractions = (
  leftNumerator: number,
  leftDenominator: number,
  rightNumerator: number,
  rightDenominator: number,
): Relation => {
  const difference = leftNumerator * rightDenominator - rightNumerator * leftDenominator
  return difference < 0 ? -1 : difference > 0 ? 1 : 0
}

const relationSymbol = (relation: Relation) => relation < 0 ? '<' : relation > 0 ? '>' : '='

const relationChoices = (context: BuildContext): Choice[] => context.rng.shuffle([
  { id: '-1', label: '<' },
  { id: '0', label: '=' },
  { id: '1', label: '>' },
])

const comparisonDisplay = (
  data: Extract<FractionData, { operation: 'compare' }>,
): ProblemSpec['display'] => ({
  kind: 'math',
  notation: {
    kind: 'row',
    children: [
      fraction(String(data.leftNumerator), String(data.leftDenominator)),
      text('?'),
      fraction(String(data.rightNumerator), String(data.rightDenominator)),
    ],
  },
  label: (
    `${data.leftNumerator} over ${data.leftDenominator}, blank, ` +
    `${data.rightNumerator} over ${data.rightDenominator}`
  ),
  fraction: data,
})

const fractionMeaning = defineSkill({
  id: 'fraction-meaning',
  name: 'What a Fraction Is',
  blurb: 'Parts of a whole',
  teachingLine: 'A fraction writes selected equal parts over all equal parts.',
  build(context) {
    const { numerator, denominator } = properFraction(context)

    return {
      prompt: 'Write the fraction these quantities name.',
      display: readDisplay(numerator, denominator),
      answer: exactFraction(numerator, denominator),
      keypad: { allowFraction: true },
      hint: 'Put selected parts over all equal parts.',
      solution: [
        {
          text: 'Write selected parts over all equal parts.',
          detail: `${numerator}/${denominator}`,
        },
      ],
    }
  },
})

const fractionOfShape = defineSkill({
  id: 'fraction-of-shape',
  name: 'Fractions in Pictures',
  blurb: 'Read a fraction from a diagram',
  teachingLine: 'Count shaded equal parts over all equal parts in the shape.',
  build(context) {
    const { rng } = context
    const { numerator, denominator } = properFraction(context)
    const diagram: ShapeDiagram = {
      kind: rng.pick(['bar', 'circle', 'grid'] as const),
      parts: denominator,
      shadedParts: numerator,
    }

    return {
      prompt: 'What fraction of the shape is shaded?',
      display: { kind: 'diagram', diagram },
      answer: exactFraction(numerator, denominator),
      keypad: { allowFraction: true },
      hint: 'Put shaded parts over all equal parts.',
      solution: [
        {
          text: 'Count shaded parts, then count all equal parts.',
          detail: `${numerator}/${denominator}`,
        },
      ],
    }
  },
})

const nameParts = defineSkill({
  id: 'name-parts',
  name: 'Numerator & Denominator',
  blurb: 'Name the parts of a fraction',
  teachingLine: "A fraction's top number counts selected parts; its bottom counts all equal parts.",
  build(context) {
    const { rng } = context
    const { numerator, denominator } = properFraction(context)
    const requestedPart = rng.bool() ? 'numerator' : 'denominator'
    const position = requestedPart === 'numerator' ? 'top' : 'bottom'

    return {
      prompt: `What is the ${position} number called?`,
      display: simpleFractionDisplay({
        operation: 'name-part',
        numerator,
        denominator,
        requestedPart,
      }),
      answer: { kind: 'choice', id: requestedPart },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: 'numerator', label: 'Numerator' },
        { id: 'denominator', label: 'Denominator' },
      ]),
      hint: 'The numerator is above the denominator.',
      solution: [
        { text: `The ${position} number is the ${requestedPart}.` },
      ],
    }
  },
})

const fractionsNumberline = defineSkill({
  id: 'fractions-numberline',
  name: 'Fractions on a Line',
  blurb: 'Place it on a number line',
  teachingLine: 'Split the space from zero to one into equal parts, then count right.',
  build(context) {
    const { numerator, denominator } = properFraction(context)

    return {
      prompt: 'Place this fraction on the number line.',
      display: simpleFractionDisplay({
        operation: 'place',
        numerator,
        denominator,
      }),
      answer: exactFraction(numerator, denominator),
      inputMode: 'number-line',
      numberLine: {
        start: rational(0, 1),
        step: rational(1, denominator),
        count: denominator + 1,
      },
      hint: 'Count equal spaces to the right from zero.',
      solution: [
        {
          text: `Move ${numerator} equal ${numerator === 1 ? 'space' : 'spaces'} from zero.`,
          detail: `${numerator} × 1/${denominator} = ${numerator}/${denominator}`,
        },
      ],
    }
  },
})

const proseChoice = (id: string, numerator: number, denominator: number): Choice => ({
  id,
  label: `${numerator} shaded ${numerator === 1 ? 'part' : 'parts'} in every ${denominator} equal parts`,
  value: rational(numerator, denominator),
})

const equivalentCase = ({ rng, difficulty }: BuildContext) => {
  const [min, max] = band(difficulty, {
    1: [2, 2],
    2: [2, 3],
    3: [3, 4],
    4: [4, 5],
    5: [5, 6],
  })
  const denominator = rng.int(min, max)
  const numerator = constrain(
    () => rng.int(1, denominator - 1),
    (candidate) => gcd(candidate, denominator) === 1,
  )
  const factor = 2
  return { numerator, denominator, factor }
}

const equivalentVisual = defineSkill({
  id: 'equivalent-visual',
  name: 'Same Amount, Different Names',
  blurb: '1/2 = 2/4, seen in a picture',
  teachingLine: 'Equivalent fractions name the same amount with different equal pieces.',
  build(context) {
    const { rng } = context
    const { numerator, denominator, factor } = equivalentCase(context)
    const shadedParts = numerator * factor
    const parts = denominator * factor
    const diagram: ShapeDiagram = {
      kind: rng.pick(['bar', 'circle', 'grid'] as const),
      parts,
      shadedParts,
    }
    const choices = rng.shuffle([
      proseChoice('equivalent', numerator, denominator),
      proseChoice('scaled-top-only', shadedParts, denominator),
      proseChoice('scaled-bottom-only', numerator, parts),
    ])

    return {
      prompt: 'Which description names the same shaded amount?',
      display: { kind: 'diagram', diagram },
      answer: { kind: 'choice', id: 'equivalent' },
      inputMode: 'choice',
      choices,
      hint: 'Group the small parts into equal larger parts.',
      solution: [
        {
          text: `Group every ${factor} small parts into one larger part.`,
          detail: `${shadedParts}/${parts} = ${numerator}/${denominator}`,
        },
      ],
    }
  },
})

const scaleNotation = (data: Extract<FractionData, { operation: 'scale-missing' }>) => {
  const scaledNumerator = data.numerator * data.factor
  const scaledDenominator = data.denominator * data.factor
  const baseNumerator =
    data.direction === 'down' && data.missing === 'numerator' ? '?' : String(data.numerator)
  const baseDenominator =
    data.direction === 'down' && data.missing === 'denominator' ? '?' : String(data.denominator)
  const largeNumerator =
    data.direction === 'up' && data.missing === 'numerator' ? '?' : String(scaledNumerator)
  const largeDenominator =
    data.direction === 'up' && data.missing === 'denominator' ? '?' : String(scaledDenominator)
  const left =
    data.direction === 'up'
      ? fraction(baseNumerator, baseDenominator)
      : fraction(String(scaledNumerator), String(scaledDenominator))
  const right =
    data.direction === 'up'
      ? fraction(largeNumerator, largeDenominator)
      : fraction(baseNumerator, baseDenominator)
  const leftLabel =
    data.direction === 'up'
      ? `${baseNumerator} over ${baseDenominator}`
      : `${scaledNumerator} over ${scaledDenominator}`
  const rightLabel =
    data.direction === 'up'
      ? `${largeNumerator} over ${largeDenominator}`
      : `${baseNumerator} over ${baseDenominator}`

  return {
    notation: { kind: 'row' as const, children: [left, text('='), right] },
    label: `${leftLabel} equals ${rightLabel}`.replace('?', 'blank'),
  }
}

const scaleCase = (context: BuildContext) => {
  const { rng, difficulty } = context
  const [min, max] = denominatorBand(difficulty)

  return constrain(
    () => {
      const denominator = rng.int(min, max)
      const numerator = rng.int(1, denominator - 1)
      const factor = rng.int(2, difficulty < 3 ? 3 : difficulty < 5 ? 4 : 5)
      const direction = rng.bool() ? 'up' as const : 'down' as const
      const missing = rng.bool() ? 'numerator' as const : 'denominator' as const
      const base = missing === 'numerator' ? numerator : denominator
      const scaled = base * factor
      const answer = direction === 'up' ? scaled : base
      const changedByOffset = direction === 'up' ? base + factor : scaled - factor
      return {
        data: {
          operation: 'scale-missing' as const,
          numerator,
          denominator,
          factor,
          direction,
          missing,
        },
        answer,
        unchanged: direction === 'up' ? base : scaled,
        changedByOffset,
      }
    },
    ({ answer, unchanged, changedByOffset }) =>
      answer !== unchanged && answer !== changedByOffset && unchanged !== changedByOffset,
  )
}

const equivalentMultiply = defineSkill({
  id: 'equivalent-multiply',
  name: 'Scaling Fractions',
  blurb: 'Scale up and down',
  teachingLine: 'Multiply or divide both fraction parts by the same number.',
  build(context) {
    const { data, answer, unchanged, changedByOffset } = scaleCase(context)
    const display = scaleNotation(data)
    const directionWord = data.direction === 'up' ? 'multiply' : 'divide'
    const directionDoing = data.direction === 'up' ? 'multiplying' : 'dividing'
    const shortcutWord = data.direction === 'up' ? 'adding' : 'subtracting'
    const base = data.missing === 'numerator' ? data.numerator : data.denominator
    const scaled = base * data.factor
    const arithmetic = data.direction === 'up'
      ? `${base} × ${data.factor} = ${answer}`
      : `${scaled} ÷ ${data.factor} = ${answer}`

    return {
      prompt: 'Which whole number completes the equality?',
      display: { kind: 'math', ...display, fraction: data },
      answer: intAnswer(answer),
      misconceptions: [
        {
          value: unchanged,
          tag: 'left-term-unchanged',
          nudge: 'Both parts must change by the same factor.',
        },
        {
          value: changedByOffset,
          tag: 'offset-by-scale-factor',
          nudge: `${shortcutWord[0].toUpperCase()}${shortcutWord.slice(1)} changes the fraction; scale by ${directionDoing}.`,
        },
      ],
      hint: `${directionWord[0].toUpperCase()}${directionWord.slice(1)} both parts by the same factor.`,
      solution: [
        {
          text: `${directionWord[0].toUpperCase()}${directionWord.slice(1)} the matching part by ${data.factor}.`,
          detail: arithmetic,
        },
      ],
    }
  },
})

const compositeFactors = {
  1: [4],
  2: [4, 6],
  3: [6, 8],
  4: [8, 9],
  5: [9, 10, 12],
} satisfies Record<BuildContext['difficulty'], readonly number[]>

const simplifyFractions = defineSkill({
  id: 'simplify-fractions',
  name: 'Lowest Terms',
  blurb: 'Simplify a fraction',
  teachingLine: 'Lowest terms use no shared factor except 1.',
  build(context) {
    const { rng, difficulty } = context
    const base = constrain(
      () => properFraction(context),
      ({ numerator, denominator }) => gcd(numerator, denominator) === 1,
    )
    const factor = rng.pick(compositeFactors[difficulty])
    const numerator = base.numerator * factor
    const denominator = base.denominator * factor
    const data = { operation: 'simplify' as const, numerator, denominator }

    return {
      prompt: 'Write this fraction in lowest terms.',
      display: simpleFractionDisplay(data),
      answer: {
        ...exactFraction(base.numerator, base.denominator),
        requireSimplified: true,
      },
      keypad: { allowFraction: true },
      misconceptions: [
        {
          value: toNumber(rational(base.numerator, denominator)),
          tag: 'reduced-numerator-only',
          nudge: `The denominator stayed unchanged; divide it by ${factor} too.`,
        },
        {
          value: toNumber(rational(numerator, base.denominator)),
          tag: 'reduced-denominator-only',
          nudge: `The numerator stayed unchanged; divide it by ${factor} too.`,
        },
      ],
      hint: 'Divide both parts by their greatest common factor.',
      solution: [
        {
          text: `The greatest common factor is ${factor}.`,
          detail: `gcf(${numerator}, ${denominator}) = ${factor}`,
        },
        {
          text: `Divide both parts by ${factor}.`,
          detail: `${numerator}/${denominator} = ${base.numerator}/${base.denominator}`,
        },
      ],
    }
  },
})

const comparisonDenominatorBand = (difficulty: BuildContext['difficulty']) =>
  band(difficulty, {
    1: [3, 5],
    2: [4, 7],
    3: [5, 9],
    4: [6, 12],
    5: [8, 16],
  })

const compareSameDen = defineSkill({
  id: 'compare-same-den',
  name: 'Comparing Like Fractions',
  blurb: '3/8 or 5/8 — which is more',
  teachingLine: 'With matching denominators, the larger top number makes the larger fraction.',
  build(context) {
    const { rng, difficulty } = context
    const [min, max] = comparisonDenominatorBand(difficulty)
    const denominator = rng.int(min, max)
    const leftNumerator = rng.int(1, denominator - 1)
    const rightNumerator = rng.intExcept(1, denominator - 1, [leftNumerator])
    const relation = compareFractions(
      leftNumerator,
      denominator,
      rightNumerator,
      denominator,
    )
    const data = {
      operation: 'compare' as const,
      leftNumerator,
      leftDenominator: denominator,
      rightNumerator,
      rightDenominator: denominator,
    }

    return {
      prompt: 'Choose the symbol that makes this true.',
      display: comparisonDisplay(data),
      answer: { kind: 'choice' as const, id: String(relation) },
      inputMode: 'choice' as const,
      choices: relationChoices(context),
      misconceptions: [
        {
          value: -relation,
          tag: 'reversed-comparison',
          nudge: 'The open side points toward the larger fraction.',
        },
        {
          value: 0,
          tag: 'called-equal',
          nudge: 'The numerators differ, so the fractions are not equal.',
        },
      ],
      hint: 'With equal denominators, compare the numerators.',
      solution: [
        {
          text: 'Equal denominators make the numerators decide.',
          detail: `${leftNumerator} ${relationSymbol(relation)} ${rightNumerator}`,
        },
      ],
    }
  },
})

const compareDiffDen = defineSkill({
  id: 'compare-diff-den',
  name: 'Comparing Unlike Fractions',
  blurb: '2/3 or 3/5 — which is more',
  teachingLine: 'Rename both fractions with one shared denominator, then compare their top numbers.',
  build(context) {
    const { rng, difficulty } = context
    const [min, max] = comparisonDenominatorBand(difficulty)
    const comparison = constrain(
      () => {
        const leftDenominator = rng.int(min, max)
        const rightDenominator = rng.intExcept(min, max, [leftDenominator])
        const leftNumerator = rng.int(1, leftDenominator - 1)
        const rightNumerator = rng.int(1, rightDenominator - 1)
        const relation = compareFractions(
          leftNumerator,
          leftDenominator,
          rightNumerator,
          rightDenominator,
        )
        const numeratorRelation =
          leftNumerator < rightNumerator ? -1 : leftNumerator > rightNumerator ? 1 : 0

        return {
          leftNumerator,
          leftDenominator,
          rightNumerator,
          rightDenominator,
          relation,
          numeratorRelation,
        }
      },
      ({ relation, numeratorRelation }) => relation !== 0 && numeratorRelation === -relation,
    )
    const data = {
      operation: 'compare' as const,
      leftNumerator: comparison.leftNumerator,
      leftDenominator: comparison.leftDenominator,
      rightNumerator: comparison.rightNumerator,
      rightDenominator: comparison.rightDenominator,
    }
    const commonDenominator =
      comparison.leftDenominator * comparison.rightDenominator /
      gcd(comparison.leftDenominator, comparison.rightDenominator)
    const leftScaled =
      comparison.leftNumerator * (commonDenominator / comparison.leftDenominator)
    const rightScaled =
      comparison.rightNumerator * (commonDenominator / comparison.rightDenominator)

    return {
      prompt: 'Choose the symbol that makes this true.',
      display: comparisonDisplay(data),
      answer: { kind: 'choice' as const, id: String(comparison.relation) },
      inputMode: 'choice' as const,
      choices: relationChoices(context),
      misconceptions: [
        {
          value: comparison.numeratorRelation,
          tag: 'compared-numerators-only',
          nudge: 'Different denominators mean the pieces have different sizes.',
        },
        {
          value: 0,
          tag: 'called-equal',
          nudge: 'These fractions name different amounts with equal-sized pieces.',
        },
      ],
      hint: 'Rewrite both fractions with equal denominators, then compare.',
      solution: [
        {
          text: `Rename both fractions with ${commonDenominator} equal-sized pieces.`,
          detail: (
            `${comparison.leftNumerator}/${comparison.leftDenominator} = ` +
            `${leftScaled}/${commonDenominator}; ` +
            `${comparison.rightNumerator}/${comparison.rightDenominator} = ` +
            `${rightScaled}/${commonDenominator}`
          ),
        },
        {
          text: 'Compare the rewritten numerators.',
          detail: `${leftScaled} ${relationSymbol(comparison.relation)} ${rightScaled}`,
        },
      ],
    }
  },
})

export const unit07: SkillGenerator[] = [
  fractionMeaning,
  fractionOfShape,
  nameParts,
  fractionsNumberline,
  equivalentVisual,
  equivalentMultiply,
  simplifyFractions,
  compareSameDen,
  compareDiffDen,
]
