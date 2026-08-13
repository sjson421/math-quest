import { intAnswer } from '../lib/answer'
import { band, defineSkill, type BuildContext, type Ladder } from './engine'

/**
 * Unit 13a · Expressions.
 *
 * The six generators move from what a variable is through substitution,
 * translating a phrase, spotting like terms, and combining/distributing —
 * the first content to answer through `inputMode: 'expression'`. Every
 * expression answer declares a single variable, `x`, and compares under the
 * `expanded` form, so a re-ordered sum or an undistributed equivalent counts
 * as the same answer; only `factor-gcf` (13.8, a later increment) needs the
 * `exact` form that keeps a factored and expanded form apart.
 */

const VARIABLE = 'x'

const VALUE_BAND: Ladder = {
  1: [1, 4],
  2: [2, 6],
  3: [3, 8],
  4: [4, 9],
  5: [5, 9],
}

const COEFF_BAND: Ladder = {
  1: [1, 4],
  2: [2, 5],
  3: [2, 6],
  4: [3, 7],
  5: [3, 9],
}

const variableMeaning = defineSkill({
  id: 'variable-meaning',
  name: 'What a Variable Is',
  blurb: 'A letter standing for a number',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, COEFF_BAND)
    const [valueMin, valueMax] = band(context.difficulty, VALUE_BAND)
    const coeff = context.rng.int(coeffMin, coeffMax)
    const value = context.rng.int(valueMin, valueMax)
    const term = coeff === 1 ? VARIABLE : `${coeff}${VARIABLE}`
    const answer = coeff * value

    return {
      prompt: `If x = ${value}, what does this expression equal?`,
      display: {
        kind: 'inline',
        text: term,
        algebra: { operation: 'substitute-term', coefficient: coeff, value },
      },
      answer: intAnswer(answer),
      hint: 'Put the value in place of x, then multiply.',
      solution: [
        { text: 'Replace x with its value.', detail: `${coeff} × ${value}` },
        { text: 'Multiply to find the value.', detail: `= ${answer}` },
      ],
    }
  },
})

const CONSTANT_BAND: Ladder = {
  1: [1, 5],
  2: [2, 7],
  3: [3, 9],
  4: [4, 11],
  5: [5, 12],
}

const evaluateExpression = defineSkill({
  id: 'evaluate-expression',
  name: 'Evaluating Expressions',
  blurb: 'Substitute and compute',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, CONSTANT_BAND)
    const [valueMin, valueMax] = band(context.difficulty, VALUE_BAND)
    const coeff = context.rng.int(coeffMin, coeffMax)
    const constant = context.rng.int(constMin, constMax)
    const value = context.rng.int(valueMin, valueMax)
    const adds = context.rng.bool()
    const answer = adds ? coeff * value + constant : coeff * value - constant
    const term = `${coeff}${VARIABLE} ${adds ? '+' : '−'} ${constant}`

    return {
      prompt: `If x = ${value}, what is the value of this expression?`,
      display: {
        kind: 'inline',
        text: term,
        algebra: { operation: 'substitute-expression', coefficient: coeff, constant, adds, value },
      },
      answer: intAnswer(answer),
      hint: 'Substitute the value for x, then finish the arithmetic.',
      solution: [
        { text: 'Replace x with its value.', detail: `${coeff} × ${value} ${adds ? '+' : '−'} ${constant}` },
        { text: 'Finish the arithmetic.', detail: `= ${answer}` },
      ],
    }
  },
})

const PHRASE_BAND: Ladder = {
  1: [2, 6],
  2: [3, 8],
  3: [4, 10],
  4: [5, 11],
  5: [6, 12],
}

const wordsToExpression = defineSkill({
  id: 'words-to-expression',
  name: 'Words to Expressions',
  blurb: 'Translate a phrase',
  build(context: BuildContext) {
    const [min, max] = band(context.difficulty, PHRASE_BAND)
    const n = context.rng.int(min, max)
    const lessThan = context.rng.bool()
    const phrase = lessThan ? `${n} less than a number` : `a number subtracted from ${n}`
    const canonical = lessThan ? `x-${n}` : `${n}-x`
    const reversed = lessThan ? `${n}-x` : `x-${n}`
    const added = lessThan ? `x+${n}` : `${n}+x`

    return {
      prompt: `Write the expression for "${phrase}".`,
      display: { kind: 'inline', text: String(n), algebra: { operation: 'words-to-expression', n, lessThan } },
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'expanded' },
      inputMode: 'expression',
      expression: { variable: VARIABLE },
      misconceptions: [
        {
          value: { kind: 'text', value: reversed },
          tag: 'reversed-order',
          nudge: 'Subtraction order matters — write it in the order the phrase names it.',
        },
        {
          value: { kind: 'text', value: added },
          tag: 'used-addition',
          nudge: 'This phrase means subtraction, not addition.',
        },
      ],
      hint: 'Read the phrase in the order the subtraction happens.',
      solution: [{ text: 'Write what is subtracted from what, in order.', detail: canonical }],
    }
  },
})

const LIKE_TERM_LETTERS = ['x', 'y', 'n', 'a'] as const

const identifyLikeTerms = defineSkill({
  id: 'identify-like-terms',
  name: 'Like Terms',
  blurb: 'Spot the terms that match',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, CONSTANT_BAND)
    const [targetLetter, otherLetter] = context.rng.shuffle([...LIKE_TERM_LETTERS]).slice(0, 2)
    const targetCoeff = context.rng.int(coeffMin, coeffMax)
    const matchCoeff = context.rng.intExcept(coeffMin, coeffMax, [targetCoeff])
    const otherCoeff = context.rng.int(coeffMin, coeffMax)
    const constant = context.rng.int(constMin, constMax)

    const target = `${targetCoeff}${targetLetter}`
    const match = `${matchCoeff}${targetLetter}`
    const otherTerm = `${otherCoeff}${otherLetter}`
    const constantTerm = `${constant}`

    return {
      prompt: `Which term is a like term to ${target}?`,
      display: {
        kind: 'inline',
        text: target,
        algebra: {
          operation: 'identify-like-terms',
          targetCoefficient: targetCoeff,
          targetLetter,
          matchCoefficient: matchCoeff,
        },
      },
      answer: { kind: 'choice', id: match },
      inputMode: 'choice',
      choices: context.rng.shuffle([
        { id: match, label: match },
        { id: otherTerm, label: otherTerm },
        { id: constantTerm, label: constantTerm },
      ]),
      hint: 'Like terms share the same variable.',
      solution: [{ text: 'Match the term with the same variable.', detail: `${target} and ${match}` }],
    }
  },
})

const combineLikeTerms = defineSkill({
  id: 'combine-like-terms',
  name: 'Combining Like Terms',
  blurb: 'Add and subtract terms',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, CONSTANT_BAND)
    const first = context.rng.int(coeffMin, coeffMax)
    const second = context.rng.int(coeffMin, coeffMax)
    const constant = context.rng.int(constMin, constMax)
    const combined = first + second
    const canonical = `${combined}${VARIABLE}+${constant}`
    const collapsedIntoTerm = `${combined + constant}${VARIABLE}`
    const droppedVariable = `${combined + constant}`

    return {
      prompt: 'Combine the like terms.',
      display: {
        kind: 'inline',
        text: `${first}${VARIABLE} + ${second}${VARIABLE} + ${constant}`,
        algebra: { operation: 'combine-like-terms', first, second, constant },
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'expanded' },
      inputMode: 'expression',
      expression: { variable: VARIABLE },
      misconceptions: [
        {
          value: { kind: 'text', value: collapsedIntoTerm },
          tag: 'combined-unlike-terms',
          nudge: 'The constant is not a like term for the x terms — keep it separate.',
        },
        {
          value: { kind: 'text', value: droppedVariable },
          tag: 'dropped-variable',
          nudge: 'The x terms stay attached to x; only add the matching terms.',
        },
      ],
      hint: 'Add the coefficients of the matching x terms and keep the constant separate.',
      solution: [
        { text: 'Add the two x terms.', detail: `${first}x + ${second}x = ${combined}x` },
        { text: 'Keep the constant separate.', detail: `${combined}x + ${constant}` },
      ],
    }
  },
})

const DISTRIBUTIVE_COEFF_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [3, 7],
  5: [4, 8],
}

const distributive = defineSkill({
  id: 'distributive',
  name: 'Distributing',
  blurb: 'Multiply across a bracket',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, DISTRIBUTIVE_COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, CONSTANT_BAND)
    const coeff = context.rng.int(coeffMin, coeffMax)
    const constant = context.rng.int(constMin, constMax)
    const product = coeff * constant
    const canonical = `${coeff}${VARIABLE}+${product}`
    const firstTermOnly = `${coeff}${VARIABLE}+${constant}`
    const secondTermOnly = `${VARIABLE}+${product}`

    return {
      prompt: 'Distribute to expand this expression.',
      display: {
        kind: 'inline',
        text: `${coeff}(${VARIABLE} + ${constant})`,
        algebra: { operation: 'distributive', coefficient: coeff, constant },
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'expanded' },
      inputMode: 'expression',
      expression: { variable: VARIABLE },
      misconceptions: [
        {
          value: { kind: 'text', value: firstTermOnly },
          tag: 'distributed-first-term-only',
          nudge: 'The number outside multiplies both terms inside, not just the first.',
        },
        {
          value: { kind: 'text', value: secondTermOnly },
          tag: 'distributed-second-term-only',
          nudge: 'The number outside multiplies both terms inside, not just the second.',
        },
      ],
      hint: 'Multiply the number outside by both terms inside.',
      solution: [
        { text: 'Multiply by the first term.', detail: `${coeff} × x = ${coeff}x` },
        { text: 'Multiply by the second term.', detail: `${coeff} × ${constant} = ${product}` },
      ],
    }
  },
})

export const unit13 = [
  variableMeaning,
  evaluateExpression,
  wordsToExpression,
  identifyLikeTerms,
  combineLikeTerms,
  distributive,
]
