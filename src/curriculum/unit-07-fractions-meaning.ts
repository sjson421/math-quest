import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import { gcd, rational } from '../lib/rational'
import type { ShapeDiagram } from '../lib/shape-diagram'
import type { Choice, FractionData, MathNotation, SkillGenerator } from '../lib/types'
import { band, defineSkill, type BuildContext, type ProblemSpec } from './engine'

/**
 * Unit 7 · Fractions: Meaning, increment 7a.
 *
 * These six skills deliberately stop before fraction arithmetic. Every draw
 * asks what a fraction means, what its parts are called, where it sits, or how
 * two names can describe one amount. The integer source values travel beside
 * the notation so the global verifier can read the question without turning
 * the renderer into an algebra engine.
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
  data: Extract<FractionData, { operation: 'place' | 'name-part' }>,
): ProblemSpec['display'] => ({
  kind: 'math',
  notation: fraction(String(data.numerator), String(data.denominator)),
  label: `${data.numerator} over ${data.denominator}`,
  fraction: data,
})

const fractionMeaning = defineSkill({
  id: 'fraction-meaning',
  name: 'What a Fraction Is',
  blurb: 'Parts of a whole',
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

export const unit07: SkillGenerator[] = [
  fractionMeaning,
  fractionOfShape,
  nameParts,
  fractionsNumberline,
  equivalentVisual,
  equivalentMultiply,
]
