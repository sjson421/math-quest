import { intAnswer } from '../lib/answer'
import { entryLabel } from '../lib/keypad'
import { gcd } from '../lib/rational'
import { band, defineSkill, type BuildContext, type Ladder } from './engine'
import { factorsOf } from './unit-04-division'

/**
 * Unit 13 · Expressions.
 *
 * The eight generators move from what a variable is through substitution,
 * translating a phrase, spotting like terms, distributing (twice, the second
 * time across a sign), and factoring back out — the first content to answer
 * through `inputMode: 'expression'`. Every expression answer declares a single
 * variable, `x`.
 *
 * Seven of them compare under the `expanded` form, so a re-ordered sum or an
 * undistributed equivalent counts as the same answer. `factor-gcf` (13.8) is
 * the exception and the reason the `exact` form exists: its answer is a
 * factored form, and the expanded expression on screen is exactly the wrong
 * answer. `exact` compares structure rather than value, which is why every
 * coefficient that can come out as one goes through `term()` — under it, `1x`
 * and `x` are two different answers, and authoring the first would mark the
 * natural entry wrong.
 */

const VARIABLE = 'x'

/**
 * A signed number as the learner reads it, not as it is stored.
 *
 * Unit 6's helper, repeated here for the same reason it exists there: worked
 * steps are display text and use the typographic minus, while an answer and a
 * predicted mistake are matched against pad entry and stay ASCII.
 */
const drawn = (value: number): string => entryLabel(String(value))

/**
 * A term as it is written, not as it is stored.
 *
 * A coefficient of one is not shown — `x`, never `1x`. Shared rather than
 * inlined per generator because this is the unit that teaches the notation:
 * one skill writing `1x` while the next writes `x` teaches that they are
 * different terms, which is exactly the confusion 13.4 and 13.5 are for.
 */
const term = (coefficient: number, letter: string = VARIABLE): string =>
  coefficient === 1 ? letter : `${coefficient}${letter}`

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
    const answer = coeff * value

    return {
      prompt: `If x = ${value}, what does this expression equal?`,
      display: {
        kind: 'inline',
        text: term(coeff),
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
    const value = context.rng.int(valueMin, valueMax)
    const adds = context.rng.bool()
    const substituted = coeff * value
    // A subtraction has to land at or above zero. The keypad this answers on
    // shows no sign key unless the problem declares `allowNegative`, so a
    // negative answer here is one the learner cannot type at all — and 13.2 is
    // about substituting, not about signs. Negative results are 13.7's subject.
    // Drawn against the substituted value rather than clamped after the fact,
    // so the constant stays uniform over whatever range is left.
    const constant = adds
      ? context.rng.int(constMin, constMax)
      : context.rng.int(Math.min(constMin, substituted), Math.min(constMax, substituted))
    const answer = adds ? substituted + constant : substituted - constant

    return {
      prompt: `If x = ${value}, what is the value of this expression?`,
      display: {
        kind: 'inline',
        text: `${term(coeff)} ${adds ? '+' : '−'} ${constant}`,
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
      // The phrase is the problem, so it goes in the display, and the prompt
      // says what to do with it. A `story` rather than an `inline`: inline
      // frames its text as `text = answer`, which would put `6 = x-6` on
      // screen — false as an equation, and it leads with the operand this
      // skill's whole difficulty is about not leading with.
      prompt: 'Write the expression.',
      display: { kind: 'story', text: phrase, algebra: { operation: 'words-to-expression', n, lessThan } },
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

    const target = term(targetCoeff, targetLetter)
    const match = term(matchCoeff, targetLetter)
    const otherTerm = term(otherCoeff, otherLetter)
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
        text: `${term(first)} + ${term(second)} + ${constant}`,
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
        { text: 'Add the two x terms.', detail: `${term(first)} + ${term(second)} = ${term(combined)}` },
        { text: 'Keep the constant separate.', detail: `${term(combined)} + ${constant}` },
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
        { text: 'Multiply by the first term.', detail: `${coeff} × x = ${term(coeff)}` },
        { text: 'Multiply by the second term.', detail: `${coeff} × ${constant} = ${product}` },
      ],
    }
  },
})

/**
 * The coefficient outside the bracket, never one.
 *
 * At one, "multiplied the variable term only" and "took the second term's sign
 * from inside the bracket" produce the same string, and the wall would predict
 * two mistakes while diagnosing one.
 */
const NEGATIVE_COEFF_BAND: Ladder = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [3, 7],
  5: [4, 8],
}

const distributeNegative = defineSkill({
  id: 'distribute-negative',
  name: 'Distributing a Negative',
  blurb: '−3(x − 4)',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, NEGATIVE_COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, CONSTANT_BAND)
    const coeff = context.rng.int(coeffMin, coeffMax)
    const constant = context.rng.int(constMin, constMax)
    // Both bracket signs are drawn. If the bracket always subtracted, the
    // answer's second term would always be positive and the sign decision this
    // skill exists for could be skipped by pattern.
    const adds = context.rng.bool()
    const product = coeff * constant
    const second = adds ? -product : product

    const canonical = `-${coeff}${VARIABLE}${second < 0 ? '' : '+'}${second}`

    return {
      prompt: 'Distribute to expand this expression.',
      display: {
        kind: 'inline',
        text: `−${coeff}(${VARIABLE} ${adds ? '+' : '−'} ${constant})`,
        algebra: { operation: 'distribute-negative', coefficient: coeff, constant, adds },
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'expanded' },
      inputMode: 'expression',
      expression: { variable: VARIABLE },
      misconceptions: [
        {
          // The wall: the second term's sign copied from inside the bracket
          // rather than worked out from the multiplication.
          value: { kind: 'text', value: `-${coeff}${VARIABLE}${adds ? '+' : '-'}${product}` },
          tag: 'sign-not-flipped',
          nudge: 'The negative outside multiplies the second term too, so its sign changes.',
        },
        {
          value: { kind: 'text', value: `-${coeff}${VARIABLE}${adds ? '+' : '-'}${constant}` },
          tag: 'distributed-first-term-only',
          nudge: 'The number outside multiplies both terms inside, not just the first.',
        },
        {
          value: { kind: 'text', value: `${coeff}${VARIABLE}${adds ? '+' : '-'}${product}` },
          tag: 'dropped-outer-sign',
          nudge: 'The coefficient outside is negative — both terms carry that with them.',
        },
      ],
      hint: 'Multiply both terms inside by the negative number outside.',
      solution: [
        { text: 'Multiply by the first term.', detail: `−${coeff} × x = −${coeff}${VARIABLE}` },
        {
          text: 'Multiply by the second term.',
          // `drawn`, not the raw number: a step reading `−4 × 2 = -8` writes the
          // same sign two ways in one line, in the unit whose subject is signs.
          detail: `−${coeff} × ${adds ? '' : '−'}${constant} = ${drawn(second)}`,
        },
      ],
    }
  },
})

const FACTOR_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 6],
  4: [3, 8],
  5: [3, 9],
}

const INNER_CONSTANT_BAND: Ladder = {
  1: [2, 5],
  2: [2, 7],
  3: [3, 9],
  4: [3, 11],
  5: [4, 12],
}

const factorGcf = defineSkill({
  id: 'factor-gcf',
  name: 'Factoring Out',
  blurb: 'The reverse of distributing',
  build(context: BuildContext) {
    const [factorMin, factorMax] = band(context.difficulty, FACTOR_BAND)
    const [innerMin, innerMax] = band(context.difficulty, INNER_CONSTANT_BAND)
    const factor = context.rng.int(factorMin, factorMax)
    const inner = context.rng.int(innerMin, innerMax)
    // The two coefficients left inside must share nothing, or the factor drawn
    // is merely *a* common factor and a smaller factoring would be just as
    // correct. Drawn against the constant rather than filtered afterwards, so
    // every difficulty keeps its full constant range.
    const coefficients = [1, 2, 3, 4, 5].filter((c) => gcd(c, inner) === 1)
    const coeff = context.rng.pick(coefficients)

    const shownCoeff = factor * coeff
    const shownConstant = factor * inner
    const canonical = `${factor}(${term(coeff)}+${inner})`

    return {
      prompt: 'Factor out the greatest common factor.',
      display: {
        kind: 'inline',
        text: `${shownCoeff}${VARIABLE} + ${shownConstant}`,
        algebra: { operation: 'factor-gcf', factor, coefficient: coeff, constant: inner },
      },
      // `exact`, not `expanded`: the expression on screen is algebraically the
      // answer, and accepting it back would accept doing nothing at all.
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'exact' },
      inputMode: 'expression',
      expression: { variable: VARIABLE },
      misconceptions: [
        {
          value: { kind: 'text', value: `${shownCoeff}${VARIABLE}+${shownConstant}` },
          tag: 'left-expanded',
          nudge: 'That is the expression you were given — take the shared factor outside it.',
        },
        // Every divisor strictly between one and the factor: each is a common
        // factor, and none of them is the greatest.
        ...factorsOf(factor)
          .slice(1, -1)
          .map((d) => ({
            value: { kind: 'text' as const, value: `${d}(${term(shownCoeff / d)}+${shownConstant / d})` },
            tag: 'not-greatest-factor',
            nudge: 'That is a common factor, but a larger one divides both terms.',
          })),
        {
          value: { kind: 'text', value: `${factor}(${term(coeff)}+${shownConstant})` },
          tag: 'divided-first-term-only',
          nudge: 'Both terms inside the brackets are divided by the factor, not just the first.',
        },
        {
          value: { kind: 'text', value: `${factor}(${term(shownCoeff)}+${inner})` },
          tag: 'divided-second-term-only',
          nudge: 'Both terms inside the brackets are divided by the factor, not just the second.',
        },
      ],
      hint: 'Find the largest number that divides both terms, then write what is left inside.',
      solution: [
        { text: 'Find the greatest common factor.', detail: `${shownCoeff} and ${shownConstant} share ${factor}` },
        { text: 'Divide both terms by it.', detail: `${shownCoeff} ÷ ${factor} = ${coeff}, ${shownConstant} ÷ ${factor} = ${inner}` },
        { text: 'Write the factor outside the brackets.', detail: canonical },
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
  distributeNegative,
  factorGcf,
]
