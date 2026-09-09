import { intAnswer } from '../lib/answer'
import { geometryFormulaReferences, geometryFormulaSelection } from '../lib/geometry-diagram'
import { format, rational, toNumber } from '../lib/rational'
import { constrain, makeRng } from '../lib/rng'
import type { CalculatorCandidate, CalculatorKey, MathNotation, SkillGenerator } from '../lib/types'
import { band, defineSkill, drawn, type Ladder } from './engine'
import { unit00 } from './unit-00-numbers'
import { unit01 } from './unit-01-addition'
import { unit02 } from './unit-02-subtraction'
import { unit03 } from './unit-03-multiplication'
import { unit04 } from './unit-04-division'
import { unit05 } from './unit-05-order-of-operations'
import { unit06 } from './unit-06-negatives'
import { unit07 } from './unit-07-fractions-meaning'
import { unit08 } from './unit-08-fraction-operations'
import { unit09 } from './unit-09-decimals'
import { unit10 } from './unit-10-percents'
import { unit11 } from './unit-11-ratios-proportions'
import { unit12 } from './unit-12-exponents-roots'
import { unit13 } from './unit-13-expressions'
import { unit14 } from './unit-14-linear-equations'
import { unit15 } from './unit-15-inequalities'
import { unit16 } from './unit-16-coordinate-plane-lines'
import { unit17 } from './unit-17-systems-equations'
import { unit18 } from './unit-18-polynomials'
import { unit19 } from './unit-19-functions'
import { unit20 } from './unit-20-geometry-measurement'
import { unit21 } from './unit-21-data-probability'

// Import toward earlier units: the registry imports us, so reading it here cycles.
export const quantitativePool = [
  ...unit00, ...unit01, ...unit02, ...unit03, ...unit04, ...unit05,
  ...unit06, ...unit07, ...unit08, ...unit09, ...unit10, ...unit11, ...unit20, ...unit21,
]
export const algebraicPool = [
  ...unit12, ...unit13, ...unit14, ...unit15, ...unit16, ...unit17, ...unit18, ...unit19,
]

// TI-30XS MultiView guide, Negation, Order of operations, and Answer toggle:
// Texas Instruments, TI-30XS MultiView / TI-30XB MultiView guidebook,
// sections “Negation”, “Order of operations”, and “Answer toggle”.
// (-) is the negation key; it is distinct from binary subtraction.
const keyLabels = { negate: '(-)', subtract: '−', add: '+', multiply: '×', divide: '÷', '(': '(', ')': ')', enter: ' ENTER' }
const calculatorKeyText = (keys: readonly CalculatorKey[]): string =>
  keys.map((key) => typeof key === 'number' ? String(key) : keyLabels[key]).join('')

const OPERANDS: Ladder = { 1: [2, 9], 2: [5, 15], 3: [10, 30], 4: [20, 60], 5: [30, 99] }

const calculatorSkills = defineSkill({
  id: 'calculator-skills',
  name: 'Calculator Skills',
  blurb: 'Operate the TI-30XS',
  teachingLine: 'Use the sign key, parentheses, and answer toggle to control calculations.',
  build({ rng, difficulty }) {
    const operation = rng.pick(['evaluate', 'choose-sequence', 'answer-form'] as const)
    const [low, high] = band(difficulty, OPERANDS)
    const a = rng.int(low, high)
    if (operation === 'answer-form') {
      const [numerator, denominator] = constrain(
        () => [rng.int(low, high), rng.pick([2, 4, 5, 8])] as const,
        ([n, d]) => n % d !== 0,
      )
      const keys: CalculatorKey[] = [numerator, 'divide', denominator, 'enter']
      const value = rational(numerator, denominator)
      const form = rng.pick(['fraction', 'decimal'] as const)
      return {
        prompt: `Use the answer toggle to give a ${form}.`,
        display: { kind: 'inline', text: calculatorKeyText(keys), calculator: { operation, keys, form } },
        answer: { kind: 'exact', ...value, ...(form === 'fraction' ? { requireFraction: true } : { requireDecimal: true }) },
        keypad: { allowFraction: true, allowDecimal: true },
        hint: 'The answer toggle switches between fraction and decimal forms.',
        solution: [
          { text: `${numerator} ÷ ${denominator} = ${format(value)}.` },
          { text: `${format(value)} equals ${toNumber(value)} in decimal form.` },
          { text: `Use the answer toggle to show the ${form}.` },
        ],
        misconceptions: [],
      }
    }
    const b = rng.int(low, high)
    const c = rng.int(2, 9)
    const negation = rng.bool()
    const keys: CalculatorKey[] = negation
      ? [a, 'multiply', 'negate', b, 'enter']
      : ['(', a, 'add', b, ')', 'multiply', c, 'enter']
    const alternative: CalculatorKey[] = negation
      ? [a, 'subtract', b, 'enter']
      : [a, 'add', b, 'multiply', c, 'enter']
    const result = negation ? -a * b : (a + b) * c
    const mistaken = negation ? a - b : a + b * c
    const tag = negation ? 'sign-as-subtraction' : 'ignored-parentheses'
    const nudge = negation
      ? 'The (-) key makes a number negative; − subtracts a number.'
      : 'Parentheses make the addition happen before multiplication.'
    const solution = negation
      ? [{ text: `(-) makes ${b} negative.` }, { text: `${a} × (−${b}) = ${drawn(result)}.` }]
      : [{ text: `Add inside parentheses: ${a} + ${b} = ${a + b}.` }, { text: `Multiply: ${a + b} × ${c} = ${drawn(result)}.` }]
    const common = { hint: nudge, solution }
    if (operation === 'choose-sequence') {
      // Exactly one sequence may reach the result; the ids carry that through the shuffle.
      if (result === mistaken) throw new Error('Calculator target must match one sequence')
      const candidates = rng.shuffle([
        { id: 'sequence-0', keys },
        { id: 'sequence-1', keys: alternative },
      ]) as [CalculatorCandidate, CalculatorCandidate]
      return {
        ...common,
        prompt: 'Which key sequence gives this result?',
        display: { kind: 'inline', text: drawn(result), calculator: { operation, target: rational(result, 1), candidates } },
        inputMode: 'choice',
        choices: candidates.map(({ id, keys: sequence }) => ({ id, label: calculatorKeyText(sequence) })),
        answer: { kind: 'choice', id: 'sequence-0' },
        misconceptions: [{ value: { kind: 'text', value: 'sequence-1' }, tag, nudge }],
      }
    }
    return {
      ...common,
      prompt: 'What result does this key sequence give?',
      display: { kind: 'inline', text: calculatorKeyText(keys), calculator: { operation, keys } },
      answer: intAnswer(result),
      keypad: { allowNegative: true },
      misconceptions: [{ value: mistaken, tag, nudge }],
    }
  },
})

export function formulaNodeCount(node: MathNotation): number {
  switch (node.kind) {
    case 'text': return 1
    case 'row': return 1 + node.children.reduce((sum, child) => sum + formulaNodeCount(child), 0)
    case 'fraction': return 1 + formulaNodeCount(node.numerator) + formulaNodeCount(node.denominator)
    case 'superscript': return 1 + formulaNodeCount(node.base) + formulaNodeCount(node.exponent)
    case 'root': return 1 + formulaNodeCount(node.radicand)
  }
}

const FORMULA_NODES: Ladder = { 1: [3, 3], 2: [3, 5], 3: [5, 8], 4: [8, 11], 5: [9, 11] }
const formulaSheet = defineSkill({
  id: 'formula-sheet',
  name: 'Formula Sheet',
  blurb: 'Navigate the provided sheet',
  teachingLine: 'Match the measurement you need to a formula on the sheet.',
  build({ rng, difficulty }) {
    const [low, high] = band(difficulty, FORMULA_NODES)
    const source = constrain(() => rng.pick(unit20).generate(rng, 1), ({ display }) => {
      if (display.kind !== 'diagram' || display.diagram.kind !== 'geometry') return false
      const diagram = display.diagram
      if (diagram.operation === 'similar-figures' || diagram.operation === 'area-composite') return false
      const { correctIndex } = geometryFormulaSelection(diagram)
      const count = formulaNodeCount(geometryFormulaReferences(diagram)[correctIndex].notation)
      return count >= low && count <= high
    })
    if (source.display.kind !== 'diagram' || source.display.diagram.kind !== 'geometry') throw new Error('Expected geometry source')
    const diagram = source.display.diagram
    const { measurement, correctIndex, distractor } = geometryFormulaSelection(diagram)
    const choices = geometryFormulaReferences(diagram).map(({ label }, index) => ({ id: `formula-${index}`, label }))
    return {
      prompt: `Which formula finds the ${measurement}?`,
      display: { kind: 'diagram', diagram, formulaSelection: true },
      inputMode: 'choice',
      choices,
      answer: { kind: 'choice', id: choices[correctIndex].id },
      hint: 'Match the requested measurement to the provided formulas.',
      solution: [{ text: `We need the ${measurement}.` }, { text: `Choose the formula for the ${measurement}.` }],
      misconceptions: [{ value: { kind: 'text', value: choices[1 - correctIndex].id }, tag: 'other-measurement', nudge: `That formula finds the ${distractor}.` }],
    }
  },
})

// defineSkill restamps skillId. Delegation must preserve the source problem identity.
const reviewQuantitative: SkillGenerator = {
  id: 'review-quantitative', name: 'Quantitative Review', blurb: 'Mixed — about 45% of the test',
  teachingLine: 'Review numbers, arithmetic, geometry, and data from across the course.',
  generate(rng, difficulty) { return rng.pick(quantitativePool).generate(rng, difficulty) },
}
const reviewAlgebraic: SkillGenerator = {
  id: 'review-algebraic', name: 'Algebraic Review', blurb: 'Mixed — about 55% of the test',
  teachingLine: 'Review exponents, expressions, equations, graphs, and functions from across the course.',
  generate(rng, difficulty) { return rng.pick(algebraicPool).generate(rng, difficulty) },
}

export const FORM_QUESTION_COUNT = 46
export const FORM_QUANTITATIVE_COUNT = 21
export const FORM_ALGEBRAIC_COUNT = FORM_QUESTION_COUNT - FORM_QUANTITATIVE_COUNT

export const TIMED_FORM_IDS = ['timed-practice-1', 'timed-practice-2'] as const
export type TimedFormId = (typeof TIMED_FORM_IDS)[number]

export const isTimedFormId = (id: string): id is TimedFormId =>
  TIMED_FORM_IDS.includes(id as TimedFormId)

type FormArea = 'quantitative' | 'algebraic'

const formPool = (area: FormArea): readonly SkillGenerator[] =>
  area === 'quantitative' ? quantitativePool : algebraicPool

const formAreas = (rng: ReturnType<typeof makeRng>): FormArea[] =>
  rng.shuffle([
    ...Array.from({ length: FORM_QUANTITATIVE_COUNT }, () => 'quantitative' as const),
    ...Array.from({ length: FORM_ALGEBRAIC_COUNT }, () => 'algebraic' as const),
  ])

/** Build one fixed area order and choose each source independently with replacement. */
export function timedFormSources(formId: string, seed: number): SkillGenerator[] {
  if (!isTimedFormId(formId)) throw new Error(`Unknown timed form: ${formId}`)

  const rng = makeRng(seed)
  return formAreas(rng).map((area) => rng.pick(formPool(area)))
}

const timedForm = (
  id: TimedFormId,
  name: string,
  blurb: string,
  teachingLine: string,
): SkillGenerator => ({
  id,
  name,
  blurb,
  teachingLine,
  generate(rng, difficulty) {
    const area = rng.int(1, FORM_QUESTION_COUNT) <= FORM_QUANTITATIVE_COUNT
      ? 'quantitative'
      : 'algebraic'
    return rng.pick(formPool(area)).generate(rng, difficulty)
  },
})

const timedPractice1 = timedForm(
  'timed-practice-1',
  'Timed Practice 1',
  'A full-length practice test',
  'Work through a full mixed practice form one answer at a time.',
)
const timedPractice2 = timedForm(
  'timed-practice-2',
  'Timed Practice 2',
  'A second full-length test',
  'Build stamina with a second full mixed practice form.',
)

export const unit22: SkillGenerator[] = [
  calculatorSkills,
  formulaSheet,
  reviewQuantitative,
  reviewAlgebraic,
  timedPractice1,
  timedPractice2,
]
