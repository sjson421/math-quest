import { describe, expect, it } from 'vitest'
import { allSkills, manifestIndex } from './index'
import { checkContent, formatViolations } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { checkAnswer, intAnswer } from '../lib/answer'
import { assertCoordinatePlane, coordinateEntry } from '../lib/coordinate-plane'
import { makeRng } from '../lib/rng'
import { equals, format as formatRational, gcd, toNumber, rational } from '../lib/rational'
import { shapeDiagramFraction } from '../lib/shape-diagram'
import { ratioWordText } from './phrasing/ratios'
import type {
  AlgebraData,
  DecimalData,
  DecimalValue,
  Difficulty,
  EquationData,
  FractionData,
  MathNotation,
  PercentData,
  Problem,
  PowerData,
  RatioData,
  Relation,
  SkillGenerator,
  WholeNumberData,
} from '../lib/types'

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]
const ITERATIONS = 200 // per skill per difficulty → 1000 problems per skill

const seedFor = (i: number, difficulty: Difficulty) => i * 7919 + difficulty * 104729

/**
 * Misconception tags a skill declares that never once reach the learner.
 *
 * `generateProblem()` drops any prediction whose value equals the answer, which
 * is deliberate — the forgot-carry value *is* the sum when nothing carries. But
 * a prediction that collapses on **every** problem is an authoring bug wearing
 * the filter as a disguise: the skill looks like it diagnoses mistakes and never
 * does. `add-2digit-nocarry` shipped that way, predicting a digit-concatenation
 * that a no-carry sum makes identical to the answer by construction.
 *
 * Compares what the generator authored against what survived, so it needs both.
 */
function alwaysFiltered(skill: SkillGenerator): string[] {
  const declared = new Set<string>()
  const surviving = new Set<string>()

  for (const difficulty of DIFFICULTIES) {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const seed = seedFor(i, difficulty)
      for (const m of skill.generate(makeRng(seed), difficulty).misconceptions ?? []) declared.add(m.tag)
      for (const m of generateProblem(skill, seed, difficulty).misconceptions ?? []) surviving.add(m.tag)
    }
  }

  return [...declared].filter((tag) => !surviving.has(tag))
}

/**
 * Recompute the answer independently from what is displayed to the learner.
 *
 * This is the test that matters most: it does not trust the generator's own
 * arithmetic, it re-derives the result from the operands actually shown on
 * screen. A generator that displays one problem and stores another answer —
 * the single worst bug this app could ship — fails here.
 */
function numberWords(value: number): string {
  const ones = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  if (value < 20) return ones[value]
  if (value < 100) {
    const rest = value % 10
    return `${tens[Math.floor(value / 10)]}${rest ? `-${ones[rest]}` : ''}`
  }

  const rest = value % 100
  return `${ones[Math.floor(value / 100)]} hundred${rest ? ` ${numberWords(rest)}` : ''}`
}

const expandedText = (value: number) =>
  [Math.floor(value / 100) * 100, Math.floor((value % 100) / 10) * 10, value % 10]
    .filter((part) => part > 0)
    .join(' + ')

/**
 * Number theory, written out independently.
 *
 * Trial division rather than anything the unit file shares, for the same reason
 * the arithmetic above is recomputed rather than imported: a helper used by both
 * the generator and its check verifies nothing about the generator.
 */
const factorsOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)

const multiplesOf = (n: number, count: number) => Array.from({ length: count }, (_, i) => n * (i + 1))

function choiceIdFor(problem: Problem, label: string): string {
  const choices = problem.choices ?? []
  const ids = choices.map((choice) => choice.id)
  if (new Set(ids).size !== ids.length) throw new Error(`${problem.skillId}: choice ids are not unique`)

  const matching = choices.filter((choice) => choice.label === label)
  if (matching.length !== 1) throw new Error(`${problem.skillId}: expected exactly one choice labelled "${label}"`)
  return matching[0].id
}

/**
 * A value as the course draws it, with the typographic minus every display uses.
 *
 * Written here rather than imported from the unit that draws it, for the same
 * reason the number theory above is written twice: a helper shared with the
 * generator agrees with it by construction. A positive value passes through
 * untouched, so every display that shipped before Unit 6 is unaffected.
 */
const drawn = (value: number): string => String(value).replace('-', '−')

/**
 * Unit 15's relation vocabulary, spelled out again here.
 *
 * Same rule as `drawn` above and the number theory further up: a helper shared
 * with the generator agrees with it by construction, and these four tables are
 * exactly what the unit could get wrong.
 */
const REVERSED_RELATION: Record<Relation, Relation> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }

const RELATION_ID: Record<Relation, string> = { '<': '<', '≤': '<=', '>': '>', '≥': '>=' }

/**
 * The letter Unit 15 writes, asserted rather than carried.
 *
 * `special-solutions` carries its own letter because its display omits the frame
 * label, and every Unit 15 display omits it too — but the conclusion is the
 * opposite one here, and deliberately. A carried letter lets the generator pick
 * any letter and this rebuild follows it; a fixed one makes the whole unit
 * answer in the letter the pad and the course already use, and a generator that
 * drew `n ≥ 3` fails the text comparison rather than being quietly agreed with.
 * That is the stronger check, and it costs six payload fields less.
 */
const RELATION_VARIABLE = 'x'

const statement = (relation: Relation, bound: number): string =>
  `${RELATION_VARIABLE} ${relation} ${drawn(bound)}`

/** A solved statement's choice id: plain characters, matching what the pad-free options submit. */
const solved = (relation: Relation, bound: number): string =>
  `${RELATION_VARIABLE}${RELATION_ID[relation]}${bound}`

const reversedWhen = (reverse: boolean, relation: Relation): Relation =>
  reverse ? REVERSED_RELATION[relation] : relation

const satisfies = (relation: Relation, value: number, bound: number): boolean =>
  relation === '<'
    ? value < bound
    : relation === '≤'
      ? value <= bound
      : relation === '>'
        ? value > bound
        : value >= bound

const decimalPower = (scale: number) => 10 ** scale

function checkedDecimal(value: DecimalValue): string {
  if (!Number.isSafeInteger(value.coefficient) || value.coefficient < 0) {
    throw new Error('decimal coefficient must be a nonnegative safe integer')
  }
  if (value.scale !== 1 && value.scale !== 2) throw new Error('decimal scale must be 1 or 2')
  const denominator = decimalPower(value.scale)
  return `${Math.floor(value.coefficient / denominator)}.${String(value.coefficient % denominator).padStart(value.scale, '0')}`
}

function decimalWords(value: DecimalValue): string {
  const denominator = decimalPower(value.scale)
  const whole = Math.floor(value.coefficient / denominator)
  const fraction = value.coefficient % denominator
  const place = value.scale === 1 ? (fraction === 1 ? 'tenth' : 'tenths') : fraction === 1 ? 'hundredth' : 'hundredths'
  return `${numberWords(whole)} and ${numberWords(fraction)} ${place}`
}

const decimalNumber = (value: DecimalValue) => value.coefficient / decimalPower(value.scale)

function expectedDecimal(data: DecimalData): { text?: string; answer: number | string } {
  switch (data.operation) {
    case 'digit': {
      const digits = String(data.value.coefficient % decimalPower(data.value.scale)).padStart(data.value.scale, '0')
      const at = data.place === 'tenths' ? 0 : 1
      return { text: checkedDecimal(data.value), answer: Number(digits[at] ?? '0') }
    }
    case 'read':
      return { text: decimalWords(data.value), answer: decimalNumber(data.value) }
    case 'compare': {
      const left = data.left.coefficient * decimalPower(data.right.scale)
      const right = data.right.coefficient * decimalPower(data.left.scale)
      const symbol = left < right ? '<' : left > right ? '>' : '='
      return {
        text: `${checkedDecimal(data.left)} ? ${checkedDecimal(data.right)}`,
        answer: symbol,
      }
    }
    case 'round': {
      const factor = decimalPower(data.value.scale - data.targetScale)
      const rounded = Math.floor((data.value.coefficient + factor / 2) / factor)
      return { text: checkedDecimal(data.value), answer: rounded / decimalPower(data.targetScale) }
    }
    case 'add':
    case 'sub': {
      const scale = Math.max(data.left.scale, data.right.scale)
      const left = data.left.coefficient * decimalPower(scale - data.left.scale)
      const right = data.right.coefficient * decimalPower(scale - data.right.scale)
      const coefficient = data.operation === 'add' ? left + right : left - right
      return { answer: coefficient / decimalPower(scale) }
    }
    case 'mult': {
      const coefficient = data.left.coefficient * data.right.coefficient
      return { answer: coefficient / decimalPower(data.left.scale + data.right.scale) }
    }
    case 'div-whole':
      // A single division, not `decimalNumber(dividend) / divisor` — chaining
      // two roundings can disagree with how the exact rational answer parses.
      return {
        text: `${checkedDecimal(data.dividend)} ÷ ${data.divisor}`,
        answer: data.dividend.coefficient / (data.divisor * decimalPower(data.dividend.scale)),
      }
    case 'div-decimal':
      return {
        text: `${checkedDecimal(data.dividend)} ÷ ${checkedDecimal(data.divisor)}`,
        answer:
          (data.dividend.coefficient * decimalPower(data.divisor.scale)) /
          (data.divisor.coefficient * decimalPower(data.dividend.scale)),
      }
    case 'display':
      return { text: checkedDecimal(data.value), answer: decimalNumber(data.value) }
    case 'to-percent':
      // Exact integer scaling rather than `decimalNumber(...) * 100`, which
      // reintroduces float error (`0.07 * 100 === 7.000000000000001`).
      return { text: checkedDecimal(data.value), answer: data.value.coefficient * decimalPower(2 - data.value.scale) }
    default: {
      const unhandled: never = data
      throw new Error(`Unknown decimal operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

const dollars = (cents: number) =>
  `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`

function expectedPercent(data: PercentData): { text: string; answer: number; values: number[] } {
  switch (data.operation) {
    case 'find-percent':
      return {
        text: `${data.part} is what percent of ${data.whole}?`,
        answer: (data.part * 100) / data.whole,
        values: [data.part, data.whole],
      }
    case 'find-whole':
      return {
        text: `${data.part} is ${data.percent}% of what number?`,
        answer: (data.part * 100) / data.percent,
        values: [data.part, data.percent],
      }
    case 'percent-change':
      return {
        text: `A value changes from ${data.original} to ${data.current}.`,
        answer: (Math.abs(data.current - data.original) * 100) / data.original,
        values: [data.original, data.current],
      }
    case 'discount':
      return {
        text: `An item costs ${dollars(data.baseCents)} with a ${data.percent}% discount.`,
        answer: (data.baseCents * (100 - data.percent)) / 10000,
        values: [data.baseCents, data.percent],
      }
    case 'tax':
      return {
        text: `A ${dollars(data.baseCents)} purchase has ${data.percent}% sales tax.`,
        answer: (data.baseCents * (100 + data.percent)) / 10000,
        values: [data.baseCents, data.percent],
      }
    case 'tip':
      return {
        text: `A ${dollars(data.baseCents)} bill has a ${data.percent}% tip.`,
        answer: (data.baseCents * (100 + data.percent)) / 10000,
        values: [data.baseCents, data.percent],
      }
    case 'simple-interest':
      return {
        text:
          `I = Prt. P = ${dollars(data.principalCents)}, r = ${data.percent}%, ` +
          `t = ${data.years} ${data.years === 1 ? 'year' : 'years'}.`,
        answer: (data.principalCents * data.percent * data.years) / 10000,
        values: [data.principalCents, data.percent, data.years],
      }
    default: {
      const unhandled: never = data
      throw new Error(`Unknown percent operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * What the learner must be looking at for the carried data to describe it.
 *
 * Checked before anything is derived, so a problem that displays one number and
 * carries another is named rather than silently verified against itself.
 */
function displayedText(data: WholeNumberData): string {
  switch (data.operation) {
    case 'read':
      return numberWords(data.value)
    case 'expanded-form':
      return expandedText(data.value)
    case 'compare':
      return `${drawn(data.left)} ? ${drawn(data.right)}`
    // Bars, not a numeral: distance from zero is a question about the value, and
    // a display that dropped the sign to look like arithmetic would stop asking it.
    case 'absolute-value':
      return `|${drawn(data.value)}|`
    case 'order-ascending':
      return data.values.join(', ')
    case 'divide-remainder':
    case 'divide-quotient':
      return `${data.dividend} ÷ ${data.divisor}`
    case 'tens-digit':
    case 'hundreds-digit':
    case 'round-to-10':
    case 'round-to-100':
    case 'factors':
    case 'classify-prime':
      return String(data.value)
    case 'multiples':
      return String(data.value)
    case 'percent-of-hundred':
    case 'percent-rational':
      return `${data.value}%`
    case 'parts-of-hundred':
      return `${data.value} out of 100`
    case 'percent-of':
      return `${data.percent}% of ${data.quantity}`
    default: {
      const unhandled: never = data
      throw new Error(`Unknown whole-number operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * Evaluate a displayed expression the way a reader does.
 *
 * The branch this replaced matched two operands around one operator, which every
 * skill through Unit 4 satisfied. Unit 5 displays `3 + 4 × 2`, where the answer
 * depends on which operation runs first — and folding the operators in written
 * order is precisely the mistake that unit teaches against, so a check that
 * folded would agree with a generator that made it.
 *
 * Recursive descent, written from scratch rather than shared with the unit that
 * builds these expressions, for the same reason the number theory above is
 * written twice: a helper used by both the generator and its check verifies
 * nothing. A precedence bug now has to be made identically by two different
 * methods to survive.
 *
 * The grammar is the conventional one, and its shape *is* the precedence rule:
 *
 *     expression := term (('+' | '−') term)*
 *     term       := factor (('×' | '÷') factor)*
 *     factor     := '-'? number | '(' expression ')'
 *
 * Both loops consume left to right, which is what makes `20 − 8 + 3` fifteen
 * rather than nine — the same-precedence case `pemdas` exists to teach.
 */
function tokenize(text: string): (string | number)[] {
  // The third alternative is the point: anything that is neither a number nor an
  // operator is captured and thrown on, rather than skipped. A tokenizer that
  // ignored what it did not recognise would read `3 + 4 ? 2` as `3 + 4 2` and
  // report a parse failure a character too late.
  return [...text.matchAll(/(\d+)|([-+−×÷()])|(\S)/g)].map(([, digits, symbol, unknown]) => {
    if (unknown) throw new Error(`unexpected "${unknown}"`)
    return digits ? Number(digits) : symbol
  })
}

function evaluateExpression(text: string): number {
  const tokens = tokenize(text)
  let at = 0

  const peek = () => tokens[at]

  function factor(): number {
    const token = peek()

    if (token === '(') {
      at += 1
      const value = expression()
      if (peek() !== ')') throw new Error('unbalanced parentheses')
      at += 1
      return value
    }

    // A signed literal, which the two-operand branch also accepted. No generator
    // produces one today; Unit 6 will, and narrowing here would drop that
    // silently rather than loudly.
    if (token === '-' || token === '−') {
      at += 1
      return -factor()
    }

    if (typeof token !== 'number') {
      throw new Error(`expected a number, found "${token ?? 'end of expression'}"`)
    }
    at += 1
    return token
  }

  function term(): number {
    let value = factor()
    for (;;) {
      const token = peek()
      if (token === '×') {
        at += 1
        value *= factor()
      } else if (token === '÷') {
        at += 1
        value /= factor()
      } else {
        return value
      }
    }
  }

  function expression(): number {
    let value = term()
    for (;;) {
      const token = peek()
      if (token === '+') {
        at += 1
        value += term()
      } else if (token === '-' || token === '−') {
        at += 1
        value -= term()
      } else {
        return value
      }
    }
  }

  const value = expression()
  if (at !== tokens.length) throw new Error(`unexpected "${tokens[at]}"`)
  return value
}

const notationText = (value: string): MathNotation => ({ kind: 'text', value })

const notationFraction = (numerator: string, denominator: string): MathNotation => ({
  kind: 'fraction',
  numerator: notationText(numerator),
  denominator: notationText(denominator),
})

const notationMixed = (whole: number, numerator: number, denominator: number): MathNotation => ({
  kind: 'row',
  children: [notationText(String(whole)), notationFraction(String(numerator), String(denominator))],
})

const notationSuperscript = (base: string, exponent: string): MathNotation => ({
  kind: 'superscript',
  base: notationText(base),
  exponent: notationText(exponent),
})

const notationRoot = (radicand: string): MathNotation => ({
  kind: 'root',
  radicand: notationText(radicand),
})

/**
 * The exact notation and spoken label a fraction operation claims to show.
 *
 * Kept in the verifier rather than exported by Unit 7: sharing the generator's
 * builder would make a wrong tree agree with itself and defeat this check.
 */
function expectedFractionDisplay(data: FractionData): {
  notation: MathNotation
  label: string
  answer: number | string
} {
  if (data.operation === 'compare') {
    const left = rational(data.leftNumerator, data.leftDenominator)
    const right = rational(data.rightNumerator, data.rightDenominator)
    const relation = left.n * right.d < right.n * left.d ? '<' : left.n * right.d > right.n * left.d ? '>' : '='

    return {
      notation: {
        kind: 'row',
        children: [
          notationFraction(String(data.leftNumerator), String(data.leftDenominator)),
          notationText('?'),
          notationFraction(String(data.rightNumerator), String(data.rightDenominator)),
        ],
      },
      label:
        `${data.leftNumerator} over ${data.leftDenominator}, blank, ` +
        `${data.rightNumerator} over ${data.rightDenominator}`,
      answer: relation,
    }
  }

  if (data.operation === 'add' || data.operation === 'sub') {
    // Re-derive the result over the least common denominator from the two
    // displayed fractions alone — never from the generator's stated answer.
    const left = rational(data.leftNumerator, data.leftDenominator)
    const right = rational(data.rightNumerator, data.rightDenominator)
    const lcm = (left.d * right.d) / gcd(left.d, right.d)
    const sum = (left.n * (lcm / left.d) + (data.operation === 'add' ? 1 : -1) * right.n * (lcm / right.d)) / lcm

    return {
      notation: {
        kind: 'row',
        children: [
          notationFraction(String(data.leftNumerator), String(data.leftDenominator)),
          notationText(data.operation === 'add' ? '+' : '−'),
          notationFraction(String(data.rightNumerator), String(data.rightDenominator)),
        ],
      },
      label:
        `${data.leftNumerator} over ${data.leftDenominator}, ` +
        `${data.operation === 'add' ? 'plus' : 'minus'}, ` +
        `${data.rightNumerator} over ${data.rightDenominator}`,
      answer: sum,
    }
  }

  if (data.operation === 'common-denominator') {
    const left = rational(data.leftNumerator, data.leftDenominator)
    const right = rational(data.rightNumerator, data.rightDenominator)
    const lcm = (left.d * right.d) / gcd(left.d, right.d)

    return {
      notation: {
        kind: 'row',
        children: [
          notationFraction(String(data.leftNumerator), String(data.leftDenominator)),
          notationText('and'),
          notationFraction(String(data.rightNumerator), String(data.rightDenominator)),
        ],
      },
      label:
        `${data.leftNumerator} over ${data.leftDenominator}, and, ` +
        `${data.rightNumerator} over ${data.rightDenominator}`,
      answer: lcm,
    }
  }

  if (data.operation === 'improper-to-mixed') {
    // The question displays the source improper fraction; the mixed form is
    // the answer, derived from it here and enforced by `requireMixed` in the
    // answer checker. The displayed notation must be the source fraction.
    return {
      notation: notationFraction(String(data.numerator), String(data.denominator)),
      label: `${data.numerator} over ${data.denominator}`,
      answer: toNumber(rational(data.numerator, data.denominator)),
    }
  }

  if (data.operation === 'mixed-to-improper') {
    return {
      notation: notationMixed(data.whole, data.numerator, data.denominator),
      label: `${data.whole} and ${data.numerator} over ${data.denominator}`,
      answer: (data.whole * data.denominator + data.numerator) / data.denominator,
    }
  }

  if (data.operation === 'add-mixed' || data.operation === 'sub-mixed') {
    const leftNumerator = data.leftWhole * data.leftDenominator + data.leftNumerator
    const rightNumerator = data.rightWhole * data.rightDenominator + data.rightNumerator
    const result = rational(
      leftNumerator * data.rightDenominator +
        (data.operation === 'add-mixed' ? 1 : -1) * rightNumerator * data.leftDenominator,
      data.leftDenominator * data.rightDenominator,
    )

    return {
      notation: {
        kind: 'row',
        children: [
          notationMixed(data.leftWhole, data.leftNumerator, data.leftDenominator),
          notationText(data.operation === 'add-mixed' ? '+' : '−'),
          notationMixed(data.rightWhole, data.rightNumerator, data.rightDenominator),
        ],
      },
      label:
        `${data.leftWhole} and ${data.leftNumerator} over ${data.leftDenominator}, ` +
        `${data.operation === 'add-mixed' ? 'plus' : 'minus'}, ` +
        `${data.rightWhole} and ${data.rightNumerator} over ${data.rightDenominator}`,
      answer: toNumber(result),
    }
  }

  if (data.operation === 'multiply' || data.operation === 'divide') {
    const left = rational(data.leftNumerator, data.leftDenominator)
    const right = rational(data.rightNumerator, data.rightDenominator)
    const answer = toNumber(
      data.operation === 'multiply'
        ? rational(left.n * right.n, left.d * right.d)
        : rational(left.n * right.d, left.d * right.n),
    )

    return {
      notation: {
        kind: 'row',
        children: [
          notationFraction(String(data.leftNumerator), String(data.leftDenominator)),
          notationText(data.operation === 'multiply' ? '×' : '÷'),
          notationFraction(String(data.rightNumerator), String(data.rightDenominator)),
        ],
      },
      label:
        `${data.leftNumerator} over ${data.leftDenominator}, ` +
        `${data.operation === 'multiply' ? 'times' : 'divided by'}, ` +
        `${data.rightNumerator} over ${data.rightDenominator}`,
      answer,
    }
  }

  const { numerator, denominator } = data
  const visible = rational(numerator, denominator)

  if (data.operation === 'read') {
    return {
      notation: notationFraction(`${numerator} selected`, `${denominator} equal parts`),
      label: `${numerator} selected parts out of ${denominator} equal parts`,
      answer: numerator / denominator,
    }
  }

  if (data.operation === 'place' || data.operation === 'simplify') {
    return {
      notation: notationFraction(String(numerator), String(denominator)),
      label: `${numerator} over ${denominator}`,
      answer: data.operation === 'simplify' ? toNumber(visible) : numerator / denominator,
    }
  }

  if (data.operation === 'name-part') {
    return {
      notation: notationFraction(String(numerator), String(denominator)),
      label: `${numerator} over ${denominator}`,
      answer: data.requestedPart === 'numerator' ? 'Numerator' : 'Denominator',
    }
  }

  const scaledNumerator = numerator * data.factor
  const scaledDenominator = denominator * data.factor
  const missingValue =
    data.direction === 'up'
      ? data.missing === 'numerator'
        ? scaledNumerator
        : scaledDenominator
      : data.missing === 'numerator'
        ? numerator
        : denominator
  const baseNumerator = data.direction === 'down' && data.missing === 'numerator' ? '?' : String(numerator)
  const baseDenominator = data.direction === 'down' && data.missing === 'denominator' ? '?' : String(denominator)
  const largeNumerator = data.direction === 'up' && data.missing === 'numerator' ? '?' : String(scaledNumerator)
  const largeDenominator = data.direction === 'up' && data.missing === 'denominator' ? '?' : String(scaledDenominator)
  const left =
    data.direction === 'up'
      ? notationFraction(baseNumerator, baseDenominator)
      : notationFraction(String(scaledNumerator), String(scaledDenominator))
  const right =
    data.direction === 'up'
      ? notationFraction(largeNumerator, largeDenominator)
      : notationFraction(baseNumerator, baseDenominator)
  const leftLabel =
    data.direction === 'up'
      ? `${baseNumerator} over ${baseDenominator}`
      : `${scaledNumerator} over ${scaledDenominator}`
  const rightLabel =
    data.direction === 'up' ? `${largeNumerator} over ${largeDenominator}` : `${baseNumerator} over ${baseDenominator}`

  return {
    notation: { kind: 'row', children: [left, notationText('='), right] },
    label: `${leftLabel} equals ${rightLabel}`.replace('?', 'blank'),
    answer: missingValue,
  }
}

function expectedRatioDisplay(data: RatioData): {
  text?: string
  notation?: MathNotation
  label?: string
  answer: number | string
  values: number[]
} {
  switch (data.operation) {
    case 'write-ratio':
      return {
        text:
          `${data.first} ${data.firstLabel} and ${data.second} ${data.secondLabel}; ` +
          `compare ${data.firstLabel} to ${data.secondLabel}.`,
        answer: data.first / data.second,
        values: [data.first, data.second],
      }
    case 'simplify-ratio':
      return {
        notation: {
          kind: 'row',
          children: [notationText(String(data.first)), notationText(':'), notationText(String(data.second))],
        },
        label: `${data.first} to ${data.second}`,
        answer: data.first / data.second,
        values: [data.first, data.second],
      }
    case 'unit-rate': {
      const firstRate = data.firstCents / data.firstCount
      const secondRate = data.secondCents / data.secondCount
      return {
        text:
          `Offer A: ${data.firstCount} items for ${dollars(data.firstCents)}. ` +
          `Offer B: ${data.secondCount} items for ${dollars(data.secondCents)}.`,
        answer: firstRate < secondRate ? 'Offer A' : 'Offer B',
        values: [data.firstCount, data.firstCents, data.secondCount, data.secondCents],
      }
    }
    case 'solve-proportion': {
      const answer = (() => {
        switch (data.missing) {
          case 'leftNumerator':
            return data.rightNumerator * data.leftDenominator / data.rightDenominator
          case 'leftDenominator':
            return data.leftNumerator * data.rightDenominator / data.rightNumerator
          case 'rightNumerator':
            return data.leftNumerator * data.rightDenominator / data.leftDenominator
          case 'rightDenominator':
            return data.rightNumerator * data.leftDenominator / data.leftNumerator
          default: {
            const unhandled: never = data.missing
            throw new Error(`Unknown missing proportion term: ${JSON.stringify(unhandled)}`)
          }
        }
      })()
      if (!Number.isInteger(answer) || answer <= 0) {
        throw new Error(`proportion does not derive a positive whole-number answer: ${answer}`)
      }
      const shown = (field: RatioData & { operation: 'solve-proportion' }, key: typeof data.missing) =>
        field.missing === key ? '?' : String(field[key])
      const leftNumerator = shown(data, 'leftNumerator')
      const leftDenominator = shown(data, 'leftDenominator')
      const rightNumerator = shown(data, 'rightNumerator')
      const rightDenominator = shown(data, 'rightDenominator')
      return {
        notation: {
          kind: 'row',
          children: [
            notationFraction(leftNumerator, leftDenominator),
            notationText('='),
            notationFraction(rightNumerator, rightDenominator),
          ],
        },
        label: (
          `${leftNumerator} over ${leftDenominator} equals ` +
          `${rightNumerator} over ${rightDenominator}`
        ).replace('?', 'blank'),
        answer,
        values: [data.leftNumerator, data.leftDenominator, data.rightNumerator, data.rightDenominator],
      }
    }
    case 'scale-drawing': {
      const drawing = data.direction === 'drawing-to-actual' ? data.given : data.given / data.scale
      const actual = data.direction === 'drawing-to-actual' ? data.given * data.scale : data.given
      return {
        text:
          `Scale: 1 cm on the drawing represents ${data.scale} m. ` +
          `${data.direction === 'drawing-to-actual' ? `The drawing length is ${drawing} cm.` : `The actual length is ${actual} m.`}`,
        answer: data.direction === 'drawing-to-actual' ? actual : drawing,
        values: [data.scale, data.given],
      }
    }
    case 'unit-conversion': {
      const large = data.direction === 'large-to-small' ? data.given : data.given / data.factor
      const small = data.direction === 'large-to-small' ? data.given * data.factor : data.given
      const relation = `1 ${data.largeSingular} equals ${data.factor} ${data.smallPlural}.`
      const amount = data.direction === 'large-to-small'
        ? `${large} ${large === 1 ? data.largeSingular : data.largePlural}`
        : `${small} ${small === 1 ? data.smallSingular : data.smallPlural}`
      return {
        text: `${relation} Convert ${amount}.`,
        answer: data.direction === 'large-to-small' ? small : large,
        values: [data.factor, data.given],
      }
    }
    case 'ratio-word': {
      const denominator = data.comparison === 'part-to-part' ? data.second : data.first + data.second
      return {
        text: ratioWordText(data),
        answer: data.first / denominator,
        values: [data.first, data.second],
      }
    }
    default: {
      const unhandled: never = data
      throw new Error(`Unknown ratio operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

function expectedPowerDisplay(data: PowerData): {
  notation: MathNotation
  label: string
  answer: number
  values: number[]
} {
  switch (data.operation) {
    case 'expand-power': {
      const factors = Array.from({ length: data.exponent }, () => String(data.base)).join(' × ')
      return {
        notation: {
          kind: 'row',
          children: [notationText(`${factors} = `), notationSuperscript(String(data.base), '?')],
        },
        label: `${factors} equals ${data.base} to the blank power`,
        answer: data.exponent,
        values: [data.base, data.exponent],
      }
    }
    case 'evaluate-power':
      return {
        notation: notationSuperscript(String(data.base), String(data.exponent)),
        label: `${data.base} to the ${data.exponent} power`,
        answer: data.base ** data.exponent,
        values: [data.base, data.exponent],
      }
    case 'square':
      return {
        notation: notationSuperscript(String(data.value), '2'),
        label: `${data.value} squared`,
        answer: data.value * data.value,
        values: [data.value],
      }
    case 'square-root': {
      const answer = Math.sqrt(data.value)
      if (!Number.isInteger(answer)) throw new Error(`square-root value ${data.value} is not a perfect square`)
      return {
        notation: notationRoot(String(data.value)),
        label: `the square root of ${data.value}`,
        answer,
        values: [data.value],
      }
    }
    case 'estimate-root':
      return {
        notation: notationRoot(String(data.value)),
        label: `the square root of ${data.value}`,
        answer: Math.floor(Math.sqrt(data.value)),
        values: [data.value],
      }
    case 'power-multiply':
    case 'power-divide': {
      const base = String(data.base)
      const operatorText = data.operation === 'power-multiply' ? ' × ' : ' ÷ '
      const answer = data.operation === 'power-multiply'
        ? data.leftExponent + data.rightExponent
        : data.leftExponent - data.rightExponent
      return {
        notation: {
          kind: 'row',
          children: [
            notationSuperscript(base, String(data.leftExponent)),
            notationText(operatorText),
            notationSuperscript(base, String(data.rightExponent)),
            notationText(' = '),
            notationSuperscript(base, '?'),
          ],
        },
        label: (
          `${base} to the ${data.leftExponent} ${data.operation === 'power-multiply' ? 'times' : 'divided by'} ` +
          `${base} to the ${data.rightExponent} equals ${base} to the blank power`
        ),
        answer,
        values: [data.leftExponent, data.rightExponent],
      }
    }
    case 'power-of-power': {
      const base = String(data.base)
      const inner = notationSuperscript(base, String(data.innerExponent))
      return {
        notation: {
          kind: 'row',
          children: [
            {
              kind: 'superscript',
              base: { kind: 'row', children: [notationText('('), inner, notationText(')')] },
              exponent: notationText(String(data.outerExponent)),
            },
            notationText(' = '),
            notationSuperscript(base, '?'),
          ],
        },
        label: (
          `${base} to the ${data.innerExponent} power, raised to the ${data.outerExponent} power, ` +
          `equals ${base} to the blank power`
        ),
        answer: data.innerExponent * data.outerExponent,
        values: [data.base, data.innerExponent, data.outerExponent],
      }
    }
    case 'zero-exponent':
      return {
        notation: notationSuperscript(String(data.base), '0'),
        label: `${data.base} to the zero power`,
        answer: 1,
        values: [data.base, 0],
      }
    case 'negative-exponent':
      return {
        notation: notationSuperscript(String(data.base), `−${data.magnitude}`),
        label: `${data.base} to the negative ${data.magnitude} power`,
        answer: 1 / data.base ** data.magnitude,
        values: [data.base, data.magnitude],
      }
    case 'scientific-notation': {
      const coefficientText = data.coefficientScale === 0
        ? String(data.coefficient)
        : (data.coefficient / 10).toFixed(1)
      const exponentText = data.exponent < 0 ? `−${Math.abs(data.exponent)}` : String(data.exponent)
      const exponentLabel = data.exponent < 0 ? `negative ${Math.abs(data.exponent)}` : String(data.exponent)
      const answer = data.exponent >= 0
        ? data.coefficient * 10 ** data.exponent / 10 ** data.coefficientScale
        : data.coefficient / 10 ** (data.coefficientScale + Math.abs(data.exponent))
      return {
        notation: {
          kind: 'row',
          children: [
            notationText(`${coefficientText} × `),
            notationSuperscript('10', exponentText),
          ],
        },
        label: `${coefficientText} times 10 to the ${exponentLabel} power`,
        answer,
        values: [data.coefficient / 10 ** data.coefficientScale, Math.abs(data.exponent)],
      }
    }
    case 'pemdas-power-first': {
      const powerValue = data.base ** data.exponent
      return {
        notation: {
          kind: 'row',
          children: [
            notationText(String(data.addend)),
            notationText(' + '),
            {
              kind: 'row',
              children: [
                notationSuperscript(String(data.base), String(data.exponent)),
                notationText(' × '),
                notationText(String(data.factor)),
              ],
            },
          ],
        },
        label: (
          `${data.addend} plus ${data.base} to the ${data.exponent} power times ${data.factor}`
        ),
        answer: data.addend + powerValue * data.factor,
        values: [data.addend, data.base, data.exponent, data.factor],
      }
    }
    case 'pemdas-group-power': {
      const group = data.left + data.right
      return {
        notation: {
          kind: 'row',
          children: [
            {
              kind: 'superscript',
              base: {
                kind: 'row',
                children: [
                  notationText('('),
                  {
                    kind: 'row',
                    children: [
                      notationText(String(data.left)),
                      notationText(' + '),
                      notationText(String(data.right)),
                    ],
                  },
                  notationText(')'),
                ],
              },
              exponent: notationText(String(data.exponent)),
            },
            notationText(' ÷ '),
            notationText(String(data.divisor)),
          ],
        },
        label: (
          `${data.left} plus ${data.right} in parentheses, to the ${data.exponent} power, ` +
          `divided by ${data.divisor}`
        ),
        answer: group ** data.exponent / data.divisor,
        values: [data.left, data.right, data.exponent, data.divisor],
      }
    }
    default: {
      const unhandled: never = data
      throw new Error(`Unknown power operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * Unit 14's equation rebuilt from its operands: the text, the solution, and the
 * values the difficulty ladder is measured over.
 *
 * One owner for all three so `recompute` and `sourceMagnitude` cannot drift.
 * `sourceMagnitude` matters here more than usual: it is the one consumer of a
 * new `Display` arm that the compiler does *not* force, because it ends in a
 * fallback to the problem's own answer. An equation left out of it would take
 * its magnitude from the answer and the ladder check would pass by tautology.
 *
 * Nothing carried is the solution. Every arm below does the arithmetic the
 * learner does, which is what makes this an independent check rather than a
 * restatement of the generator.
 */
function expectedEquation(
  data: EquationData,
  variable: string | undefined,
): { text: string; answer: number | string; values: number[] } {
  const sign = (adds: boolean): string => (adds ? '+' : '−')
  // The five arms below that write the variable into their text all belong to
  // skills that frame their slot with a letter, so it is always there for them.
  // The three arms added in 14b do not depend on it: `special-solutions` is
  // unframed and carries its own letters implicitly, and `rearrange` carries
  // both of its letters in the payload.
  const framed = (): string => {
    if (variable === undefined) throw new Error(`${data.operation}: needs a frame label to rebuild its text`)
    return variable
  }

  switch (data.operation) {
    case 'balance': {
      const total = data.first + data.second
      return {
        text: `${data.first} + ${data.second} = ${total}`,
        answer: data.adds ? total + data.change : total - data.change,
        values: [data.first, data.second, data.change],
      }
    }
    case 'one-step-addsub':
      return {
        text: `${framed()} ${sign(data.adds)} ${data.constant} = ${drawn(data.rightHand)}`,
        answer: data.adds ? data.rightHand - data.constant : data.rightHand + data.constant,
        values: [data.constant, data.rightHand],
      }
    case 'one-step-multdiv':
      return {
        text: data.multiplies
          ? `${data.coefficient}${framed()} = ${drawn(data.rightHand)}`
          : `${framed()} ÷ ${data.coefficient} = ${drawn(data.rightHand)}`,
        answer: data.multiplies ? data.rightHand / data.coefficient : data.rightHand * data.coefficient,
        values: [data.coefficient, data.rightHand],
      }
    case 'two-step':
      return {
        text: `${data.coefficient}${framed()} ${sign(data.adds)} ${data.constant} = ${drawn(data.rightHand)}`,
        answer: data.adds
          ? (data.rightHand - data.constant) / data.coefficient
          : (data.rightHand + data.constant) / data.coefficient,
        values: [data.coefficient, data.constant, data.rightHand],
      }
    case 'vars-both-sides':
      return {
        text:
          `${data.leftCoefficient}${framed()} + ${data.leftConstant} = ` +
          `${data.rightCoefficient}${framed()} + ${data.rightConstant}`,
        answer:
          (data.rightConstant - data.leftConstant) / (data.leftCoefficient - data.rightCoefficient),
        values: [data.leftCoefficient, data.leftConstant, data.rightCoefficient, data.rightConstant],
      }
    case 'parentheses':
      return {
        text: `${data.coefficient}(${framed()} ${sign(data.adds)} ${data.constant}) = ${drawn(data.rightHand)}`,
        answer: data.adds
          ? data.rightHand / data.coefficient - data.constant
          : data.rightHand / data.coefficient + data.constant,
        values: [data.coefficient, data.constant, data.rightHand],
      }
    case 'clear-fraction':
      return {
        // The row is notated, so the text is the equation's name rather than
        // its drawing. It is still what the display must carry and announce.
        text: `${framed()}/${data.denominator} ${sign(data.adds)} ${data.constant} = ${drawn(data.rightHand)}`,
        answer: data.adds
          ? (data.rightHand - data.constant) * data.denominator
          : (data.rightHand + data.constant) * data.denominator,
        values: [data.denominator, data.constant, data.rightHand],
      }
    case 'special-solutions': {
      // Derived by comparing the two sides, not by solving. Solving is what
      // `vars-both-sides` does, and on the equal-coefficient draws that is a
      // division by zero — which is exactly why this is its own arm.
      const sameCoefficient = data.leftCoefficient === data.rightCoefficient
      const sameConstant = data.leftConstant === data.rightConstant
      return {
        text:
          `${data.leftCoefficient}${data.letter} + ${data.leftConstant} = ` +
          `${data.rightCoefficient}${data.letter} + ${data.rightConstant}`,
        answer: sameCoefficient ? (sameConstant ? 'infinite' : 'none') : 'one',
        values: [data.leftCoefficient, data.leftConstant, data.rightCoefficient, data.rightConstant],
      }
    }
    case 'rearrange': {
      // `a·subject + b·term = c` → `subject = −(b/a)·term + c/a`. Both divisions
      // are exact by the generator's composition, and this check asserts that
      // rather than assuming it: a non-integer here means the draw stopped
      // composing and the answer left the expression grammar.
      const coefficient = -data.termCoefficient / data.subjectCoefficient
      const constant = data.constant / data.subjectCoefficient
      if (!Number.isInteger(coefficient) || !Number.isInteger(constant)) {
        throw new Error(
          `rearrange: ${data.subjectCoefficient} does not divide both ` +
            `${data.termCoefficient} and ${data.constant}`,
        )
      }
      // A coefficient of one is written as the bare letter, because that is what
      // the pad produces — `x`, never `1x`. Re-derived here rather than shared
      // with the generator: a helper both sides imported would agree with itself
      // whichever way it was wrong.
      const term = (value: number): string =>
        value === 1 ? data.term : value === -1 ? `-${data.term}` : `${value}${data.term}`
      return {
        text:
          `${data.subjectCoefficient}${data.subject} + ` +
          `${data.termCoefficient}${data.term} = ${drawn(data.constant)}`,
        answer: `${term(coefficient)}${constant < 0 ? '' : '+'}${constant}`,
        values: [data.subjectCoefficient, data.termCoefficient, data.constant],
      }
    }
    // Unit 15's six. Each rebuilds the *displayed* statement and then solves it,
    // so a generator that shows one inequality and carries another is caught
    // before its answer is ever looked at.
    case 'inequality-meaning':
      return {
        text: statement(data.relation, data.bound),
        // The reading is identified by the relation it reads, in the plain
        // characters a choice id uses. Not by its wording: a check pinned to
        // "x is at most 9" would fail the day the copy is reworded, which is
        // the lesson `special-solutions` already recorded.
        answer: RELATION_ID[data.relation],
        values: [data.bound],
      }
    case 'inequality-graph':
      return {
        text: statement(data.relation, data.bound),
        // Both halves derived separately, because the skill's whole claim is
        // that neither can be read off the other: strictness opens or closes the
        // circle, direction decides the shading.
        answer:
          `${data.relation === '<' || data.relation === '>' ? 'open' : 'closed'}-` +
          `${data.relation === '>' || data.relation === '≥' ? 'right' : 'left'}`,
        values: [data.bound],
      }
    case 'inequality-addsub':
      return {
        text:
          `${RELATION_VARIABLE} ${sign(data.adds)} ${data.constant} ` +
          `${data.relation} ${drawn(data.rightHand)}`,
        // Nothing multiplies the variable, so the relation cannot reverse here.
        answer: solved(data.relation, data.adds ? data.rightHand - data.constant : data.rightHand + data.constant),
        values: [data.constant, data.rightHand],
      }
    case 'inequality-multdiv': {
      const boundary = data.multiplies ? data.rightHand / data.coefficient : data.rightHand * data.coefficient
      if (!Number.isInteger(boundary)) {
        throw new Error(`inequality-multdiv: ${data.coefficient} does not divide ${data.rightHand}`)
      }
      return {
        text: data.multiplies
          ? `${drawn(data.coefficient)}${RELATION_VARIABLE} ${data.relation} ${drawn(data.rightHand)}`
          : `${RELATION_VARIABLE} ÷ ${drawn(data.coefficient)} ${data.relation} ${drawn(data.rightHand)}`,
        // The one rule that serves both `solve-one-step-ineq` and
        // `flip-the-sign`, and the reason they share an arm: the relation
        // reverses exactly when the carried coefficient is negative, which is a
        // property of a number the display puts on screen.
        answer: solved(reversedWhen(data.coefficient < 0, data.relation), boundary),
        values: [data.coefficient, data.rightHand],
      }
    }
    case 'inequality-two-step': {
      const cleared = data.adds ? data.rightHand - data.constant : data.rightHand + data.constant
      const boundary = cleared / data.coefficient
      if (!Number.isInteger(boundary)) {
        throw new Error(`inequality-two-step: ${data.coefficient} does not divide ${cleared}`)
      }
      return {
        text:
          `${data.coefficient}${RELATION_VARIABLE} ${sign(data.adds)} ${data.constant} ` +
          `${data.relation} ${drawn(data.rightHand)}`,
        answer: solved(reversedWhen(data.coefficient < 0, data.relation), boundary),
        values: [data.coefficient, data.constant, data.rightHand],
      }
    }
    case 'inequality-compound': {
      const first = `${RELATION_VARIABLE} ${data.firstRelation} ${drawn(data.firstBound)}`
      const second = `${RELATION_VARIABLE} ${data.secondRelation} ${drawn(data.secondBound)}`
      // Counted by testing every candidate, never by arithmetic on the bounds.
      // The arithmetic is where the off-by-one lives, and it is the mistake this
      // skill exists to diagnose — a count that made it would agree with a
      // generator that made it too.
      let count = 0
      for (let value = 0; value <= data.rangeMax; value += 1) {
        const inFirst = satisfies(data.firstRelation, value, data.firstBound)
        const inSecond = satisfies(data.secondRelation, value, data.secondBound)
        if (data.form === 'or' ? inFirst || inSecond : inFirst && inSecond) count += 1
      }
      return {
        text:
          data.form === 'between'
            ? // Chained, so the first bound moves to the left of the variable and
              // its relation turns round with it. Both are carried as they apply
              // to the variable, which is what stops a generator drawing
              // `6 < x ≤ 2` from a payload that means the opposite.
              `${drawn(data.firstBound)} ${REVERSED_RELATION[data.firstRelation]} ` +
              `${RELATION_VARIABLE} ${data.secondRelation} ${drawn(data.secondBound)}`
            : `${first} ${data.form} ${second}`,
        answer: count,
        values: [Math.abs(data.firstBound), Math.abs(data.secondBound), data.rangeMax],
      }
    }
    default: {
      const unhandled: never = data
      throw new Error(`Unknown equation operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * The letter passed when rebuilding an equation that is never displayed.
 *
 * A story shows prose, so its rebuilt equation text is discarded and only the
 * answer is taken. Named rather than written twice so the two sites that do this
 * cannot drift into disagreeing about a value neither of them reads.
 */
const STORY_REBUILD_LETTER = 'x'

function recompute(problem: Problem): number | string {
  const { display } = problem

  if (display.kind === 'inline' && display.decimal) {
    const expected = expectedDecimal(display.decimal)
    if (display.text !== expected.text) {
      throw new Error(`${problem.skillId}: visible decimal text disagrees with its data`)
    }
    return typeof expected.answer === 'string' ? choiceIdFor(problem, expected.answer) : expected.answer
  }

  if (display.kind === 'inline' && display.wholeNumber) {
    const data = display.wholeNumber
    const expectedText = displayedText(data)

    if (display.text !== expectedText)
      throw new Error(`${problem.skillId}: visible text "${display.text}" does not match "${expectedText}"`)

    switch (data.operation) {
      case 'read':
      case 'expanded-form':
        return data.value
      case 'tens-digit':
        return Math.floor(data.value / 10) % 10
      case 'hundreds-digit':
        return Math.floor(data.value / 100) % 10
      case 'compare':
        return choiceIdFor(problem, data.left < data.right ? '<' : data.left > data.right ? '>' : '=')
      case 'order-ascending':
        return choiceIdFor(problem, [...data.values].sort((x, y) => x - y).join(', '))
      case 'round-to-10':
        return Math.round(data.value / 10) * 10
      case 'round-to-100':
        return Math.round(data.value / 100) * 100
      // The third case the arithmetic branch would get wrong, after the two
      // divisions below: `|−7|` is not an expression, and the sign is the
      // question rather than something to evaluate past.
      case 'absolute-value':
        return Math.abs(data.value)
      // The two cases the arithmetic branch below would get wrong: `47 ÷ 5`
      // evaluates to 9.4, and neither answer is that.
      case 'divide-remainder':
        return data.dividend % data.divisor
      case 'divide-quotient':
        return Math.floor(data.dividend / data.divisor)
      case 'factors':
        return choiceIdFor(problem, factorsOf(data.value).join(', '))
      case 'multiples':
        return choiceIdFor(problem, multiplesOf(data.value, data.count).join(', '))
      case 'classify-prime':
        return choiceIdFor(problem, factorsOf(data.value).length === 2 ? 'prime' : 'composite')
      case 'percent-of-hundred':
      case 'parts-of-hundred':
        return data.value
      case 'percent-rational':
        return data.value / 100
      case 'percent-of':
        return (data.percent * data.quantity) / 100
      default: {
        const unhandled: never = data
        throw new Error(`Unknown whole-number operation: ${JSON.stringify(unhandled)}`)
      }
    }
  }

  if ((display.kind === 'inline' || display.kind === 'story') && display.algebra) {
    const data: AlgebraData = display.algebra
    switch (data.operation) {
      case 'substitute-term':
        return data.coefficient * data.value
      case 'substitute-expression':
        return data.adds ? data.coefficient * data.value + data.constant : data.coefficient * data.value - data.constant
      case 'words-to-expression':
        return data.lessThan ? `x-${data.n}` : `${data.n}-x`
      case 'identify-like-terms':
        // A coefficient of one is not written, so the matching choice is `y`,
        // not `1y`. Rebuilt here rather than imported, so the verifier still
        // derives the id from the source operands rather than trusting the
        // generator's own formatting.
        return choiceIdFor(
          problem,
          data.matchCoefficient === 1 ? data.targetLetter : `${data.matchCoefficient}${data.targetLetter}`,
        )
      case 'combine-like-terms':
        return `${data.first + data.second}x+${data.constant}`
      case 'distributive':
        return `${data.coefficient}x+${data.coefficient * data.constant}`
      case 'distribute-negative': {
        // The displayed coefficient is the negation of the carried one, so both
        // terms of the result are negative products — and the second one is
        // positive exactly when the bracket subtracts.
        const second = data.adds ? -(data.coefficient * data.constant) : data.coefficient * data.constant
        return `-${data.coefficient}x${second < 0 ? '' : '+'}${second}`
      }
      case 'factor-gcf':
        // A coefficient of one is not written; under `exact` comparison `1x` and
        // `x` are different answers, so this rebuild has to make the same choice
        // the generator made.
        return `${data.factor}(${data.coefficient === 1 ? 'x' : `${data.coefficient}x`}+${data.constant})`
      default: {
        const unhandled: never = data
        throw new Error(`Unknown algebra operation: ${JSON.stringify(unhandled)}`)
      }
    }
  }

  if (display.kind === 'inline') {
    try {
      return evaluateExpression(display.text)
    } catch (error) {
      throw new Error(`${problem.skillId}: cannot evaluate "${display.text}" — ${(error as Error).message}`)
    }
  }

  if (display.kind === 'math') {
    if (display.ratio) {
      const expected = expectedRatioDisplay(display.ratio)
      if (JSON.stringify(display.notation) !== JSON.stringify(expected.notation) || display.label !== expected.label) {
        throw new Error(`${problem.skillId}: visible ratio notation disagrees with its data`)
      }
      return typeof expected.answer === 'string' ? choiceIdFor(problem, expected.answer) : expected.answer
    }

    if (display.power) {
      const expected = expectedPowerDisplay(display.power)
      if (JSON.stringify(display.notation) !== JSON.stringify(expected.notation) || display.label !== expected.label) {
        throw new Error(`${problem.skillId}: visible power notation disagrees with its data`)
      }
      return expected.answer
    }

    if (!display.fraction) {
      throw new Error(`${problem.skillId}: a math display needs operation-specific data for independent verification`)
    }

    const expected = expectedFractionDisplay(display.fraction)
    if (JSON.stringify(display.notation) !== JSON.stringify(expected.notation) || display.label !== expected.label) {
      throw new Error(`${problem.skillId}: visible fraction notation disagrees with its data`)
    }

    return typeof expected.answer === 'string' ? choiceIdFor(problem, expected.answer) : expected.answer
  }

  if (display.kind === 'diagram') {
    const visible = shapeDiagramFraction(display.diagram)
    if (problem.answer.kind !== 'choice') return toNumber(visible)

    const matches = (problem.choices ?? []).filter((choice) => {
      if (!choice.value) return false
      return equals(rational(choice.value.n, choice.value.d), visible)
    })
    if (matches.length !== 1) {
      throw new Error(`${problem.skillId}: expected one choice matching the diagram, found ${matches.length}`)
    }
    return matches[0].id
  }

  if (display.kind === 'coordinate-plane') {
    assertCoordinatePlane(display.plane)
    throw new Error(`${problem.skillId}: coordinate plane needs operation-specific data for independent verification`)
  }

  if (display.kind === 'decimal-column') {
    return expectedDecimal(display.decimal).answer
  }

  if (display.kind === 'story' && display.percent) {
    const expected = expectedPercent(display.percent)
    if (display.text !== expected.text) {
      throw new Error(`${problem.skillId}: visible percent text disagrees with its data`)
    }
    return expected.answer
  }

  if (display.kind === 'story' && display.ratio) {
    const expected = expectedRatioDisplay(display.ratio)
    if (display.text !== expected.text) {
      throw new Error(`${problem.skillId}: visible ratio text disagrees with its data`)
    }
    return typeof expected.answer === 'string' ? choiceIdFor(problem, expected.answer) : expected.answer
  }

  if (display.kind === 'equation') {
    const expected = expectedEquation(display.equation, display.variable)
    // The equation is rebuilt from the operands and compared, never parsed.
    // This is the direction that catches a generator showing one equation while
    // carrying another — the answer below is derived from the same values, so
    // without this check the two would agree with each other and be wrong
    // together.
    if (display.text !== expected.text) {
      throw new Error(
        `${problem.skillId}: visible equation "${display.text}" disagrees with its data ("${expected.text}")`,
      )
    }
    // A choice-answered equation derives the outcome's stable id, not its
    // label, and that is the one place this differs from every earlier
    // choice-answered display. Those name a label because their choices *are*
    // their values — `<`, `prime`, a sorted list. These are sentences, and a
    // check that hardcoded "Infinitely many solutions" would fail the day the
    // copy is reworded, which is not a defect in the arithmetic.
    //
    // The guarantee `choiceIdFor` gives is kept explicitly: the derived outcome
    // has to be one the problem actually offers, or a generator could ask for an
    // answer that is not on screen.
    if (typeof expected.answer === 'string' && problem.answer.kind === 'choice') {
      const ids = (problem.choices ?? []).map((choice) => choice.id)
      if (new Set(ids).size !== ids.length) throw new Error(`${problem.skillId}: choice ids are not unique`)
      if (!ids.includes(expected.answer)) {
        throw new Error(`${problem.skillId}: derived outcome "${expected.answer}" is not among the offered choices`)
      }
    }
    return expected.answer
  }

  // A story whose structure is an equation. The prose states two operations in
  // sequence and mentions quantities the answer does not use, so the terms are
  // carried and the sentence is never read.
  //
  // Only the answer is taken. No equation is on screen to compare a rebuild
  // against — the sentence is what is displayed, and the unit's own test checks
  // that against its frame and these same terms. The letter passed here names a
  // rebuild that is discarded.
  if (display.kind === 'story' && display.equation) {
    return expectedEquation(display.equation, STORY_REBUILD_LETTER).answer
  }

  // A story carries its quantities precisely so this stays possible. Reading
  // them out of the prose would not work: a word problem mentions numbers the
  // answer does not use, which is most of what makes it a word problem.
  //
  // The ASCII hyphen this switch used to accept is gone with the regex that
  // produced it. A column or story declares `Operator`, which spells subtraction
  // `−`, so the extra case was unreachable — and now that `operator` is no longer
  // widened to `string` on its way here, the compiler says so.
  const { operands, operator } = display

  const raw = (() => {
    switch (operator) {
      case '+':
        return operands.reduce((a, b) => a + b)
      case '−':
        return operands.reduce((a, b) => a - b)
      case '×':
        return operands.reduce((a, b) => a * b)
      case '÷':
        return operands.reduce((a, b) => a / b)
      default: {
        const unhandled: never = operator
        throw new Error(`Unknown operator: ${unhandled}`)
      }
    }
  })()

  // Money is the one story whose carried operands (exact cents) are not the
  // unit of its stated answer (dollars) — see the `word-problem-phrasing`
  // spec's carve-out for this skill.
  return problem.skillId === 'money-problems' ? raw / 100 : raw
}

const answerValue = (problem: Problem): number | string => {
  if (problem.answer.kind === 'exact') {
    return toNumber(rational(problem.answer.n, problem.answer.d))
  }
  if (problem.answer.kind === 'approx') return problem.answer.value
  if (problem.answer.kind === 'expression') return problem.answer.canonical
  if (problem.answer.kind === 'point') return coordinateEntry(problem.answer)
  return problem.answer.id
}

function answerMismatch(problem: Problem): string | undefined {
  const stated = answerValue(problem)
  const derived = recompute(problem)
  return stated === derived
    ? undefined
    : `${problem.skillId}: stated ${stated}, derived ${derived} from ${JSON.stringify(problem.display)}`
}

/**
 * The numbers a difficulty ladder is meant to be growing, per operation.
 *
 * `multiples` deliberately reports only its value: `count` is fixed at four, so
 * averaging it in would drag the mean toward a constant and make a real ladder
 * look flatter than it is.
 */
function sourceValues(data: WholeNumberData): number[] {
  switch (data.operation) {
    case 'compare':
      return [data.left, data.right]
    case 'order-ascending':
      return data.values
    case 'divide-remainder':
    case 'divide-quotient':
      return [data.dividend, data.divisor]
    case 'percent-of':
      return [data.percent, data.quantity]
    default:
      return [data.value]
  }
}

function sourceMagnitude(problem: Problem): number {
  if (problem.display.kind === 'inline' && problem.display.decimal) {
    const data = problem.display.decimal
    const values =
      data.operation === 'compare' || data.operation === 'add' || data.operation === 'sub'
        ? [decimalNumber(data.left), decimalNumber(data.right)]
        : data.operation === 'div-whole'
          ? [decimalNumber(data.dividend), data.divisor]
          : data.operation === 'div-decimal'
            ? [decimalNumber(data.dividend), decimalNumber(data.divisor)]
            : data.operation === 'mult'
              ? [decimalNumber(data.left), decimalNumber(data.right)]
              : [decimalNumber(data.value)]
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'decimal-column') {
    return (
      (decimalNumber(problem.display.decimal.left) + decimalNumber(problem.display.decimal.right)) / 2
    )
  }

  if (problem.display.kind === 'inline' && problem.display.wholeNumber) {
    const values = sourceValues(problem.display.wholeNumber)
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'math' && problem.display.fraction) {
    const data = problem.display.fraction
    let values: number[]
    switch (data.operation) {
      case 'compare':
      case 'add':
      case 'sub':
      case 'common-denominator':
      case 'multiply':
      case 'divide':
        values = [data.leftNumerator, data.leftDenominator, data.rightNumerator, data.rightDenominator]
        break
      case 'add-mixed':
      case 'sub-mixed':
        values = [
          data.leftWhole,
          data.leftNumerator,
          data.leftDenominator,
          data.rightWhole,
          data.rightNumerator,
          data.rightDenominator,
        ]
        break
      case 'mixed-to-improper':
        values = [data.whole, data.numerator, data.denominator]
        break
      case 'scale-missing':
        values = [data.numerator, data.denominator, data.factor]
        break
      case 'read':
      case 'place':
      case 'simplify':
      case 'name-part':
      case 'improper-to-mixed':
        values = [data.numerator, data.denominator]
        break
      default: {
        const unhandled: never = data
        throw new Error(`Unknown fraction operation: ${JSON.stringify(unhandled)}`)
      }
    }
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'math' && problem.display.ratio) {
    const values = expectedRatioDisplay(problem.display.ratio).values
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'math' && problem.display.power) {
    const values = expectedPowerDisplay(problem.display.power).values
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if ((problem.display.kind === 'inline' || problem.display.kind === 'story') && problem.display.algebra) {
    const data: AlgebraData = problem.display.algebra
    const values: number[] = (() => {
      switch (data.operation) {
        case 'substitute-term':
          return [data.coefficient, data.value]
        case 'substitute-expression':
          return [data.coefficient, data.constant, data.value]
        case 'words-to-expression':
          return [data.n]
        case 'identify-like-terms':
          return [data.targetCoefficient, data.matchCoefficient]
        case 'combine-like-terms':
          return [data.first, data.second, data.constant]
        case 'distributive':
        case 'distribute-negative':
          return [data.coefficient, data.constant]
        case 'factor-gcf':
          // The inner coefficient is drawn from a fixed small set rather than a
          // ladder — it exists to keep the two terms coprime — so averaging it
          // in would flatten a ladder that the factor and constant do grow.
          return [data.factor, data.constant]
        default: {
          const unhandled: never = data
          throw new Error(`Unknown algebra operation: ${JSON.stringify(unhandled)}`)
        }
      }
    })()
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'diagram') return problem.display.diagram.parts

  if (problem.display.kind === 'coordinate-plane') {
    const { plane } = problem.display
    assertCoordinatePlane(plane)
    const values = [
      plane.x.min,
      plane.x.max,
      plane.y.min,
      plane.y.max,
      ...plane.points.flatMap((point) => [point.x, point.y]),
      ...plane.lines.flatMap((line) => line.through.flatMap((point) => [point.x, point.y])),
    ]
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  if (problem.display.kind === 'story') {
    // The equation case is named for the same reason the equation branch below
    // is: this chain ends at `operands`, which an equation-carrying story does
    // not have, so leaving it out measures the ladder against `undefined`
    // rather than failing.
    const values = problem.display.percent
      ? expectedPercent(problem.display.percent).values
      : problem.display.ratio
        ? expectedRatioDisplay(problem.display.ratio).values
        : problem.display.equation
          ? expectedEquation(problem.display.equation, STORY_REBUILD_LETTER).values
          : problem.display.operands
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  // Deliberate, not incidental. The fallback below reads the problem's own
  // answer, so a display arm missing from this function does not fail to
  // compile — it makes the ladder check measure the answer against itself and
  // pass on a ladder that has stopped climbing. Every new `Display` kind needs
  // a branch here even though nothing will ask for one.
  if (problem.display.kind === 'equation') {
    const { values } = expectedEquation(problem.display.equation, problem.display.variable)
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  const value = answerValue(problem)
  if (typeof value !== 'number') {
    throw new Error(`${problem.skillId}: choice answer has no source values`)
  }
  return Math.abs(value)
}

function scalingProblems(skill: SkillGenerator): string[] {
  const magnitude = (difficulty: Difficulty) => {
    const problems = Array.from({ length: ITERATIONS }, (_, i) =>
      generateProblem(skill, seedFor(i, difficulty), difficulty),
    )
    return problems.reduce((sum, problem) => sum + sourceMagnitude(problem), 0) / problems.length
  }

  const low = magnitude(1)
  const high = magnitude(5)
  return high > low ? [] : [`${skill.id}: difficulty 5 magnitude ${high} is not above difficulty 1 magnitude ${low}`]
}

describe('decimal answer verification', () => {
  const addition = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-decimal-add',
    prompt: 'What is the sum?',
    display: {
      kind: 'decimal-column',
      decimal: {
        operation: 'add',
        left: { coefficient: 1, scale: 1 },
        right: { coefficient: 2, scale: 1 },
      },
    },
    answer: { kind: 'exact', n: 3, d: 10 },
    inputMode: 'keypad',
    keypad: { allowDecimal: true },
    hint: 'Line up the decimal points before adding.',
    solution: [{ text: 'Add equal places.' }],
    difficulty: 1,
    ...overrides,
  })

  it('recomputes 0.1 + 0.2 exactly from integer source digits', () => {
    expect(answerMismatch(addition())).toBeUndefined()
  })

  it('names a decimal answer that disagrees with the source digits', () => {
    expect(answerMismatch(addition({ answer: { kind: 'exact', n: 4, d: 10 } }))).toContain(
      'synthetic-decimal-add: stated 0.4, derived 0.3',
    )
  })

  it('rejects inline text that drops a retained decimal place', () => {
    const problem: Problem = {
      ...addition(),
      skillId: 'synthetic-decimal-read',
      display: {
        kind: 'inline',
        text: 'three and four tenths',
        decimal: { operation: 'read', value: { coefficient: 304, scale: 2 } },
      },
      answer: { kind: 'exact', n: 76, d: 25 },
    }

    expect(() => answerMismatch(problem)).toThrow('visible decimal text disagrees with its data')
  })
})

describe('percent story answer verification', () => {
  const findPercent = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-find-percent',
    prompt: 'Find the percent.',
    display: {
      kind: 'story',
      text: '12 is what percent of 60?',
      percent: { operation: 'find-percent', part: 12, whole: 60 },
    },
    answer: intAnswer(20),
    inputMode: 'keypad',
    keypad: { allowDecimal: true },
    hint: 'Divide the part by the whole, then multiply by 100.',
    solution: [{ text: 'Divide the part by the whole.' }],
    difficulty: 1,
    ...overrides,
  })

  it('recomputes a percent answer from named source quantities', () => {
    expect(answerMismatch(findPercent())).toBeUndefined()
  })

  it('names a percent answer that disagrees with its source quantities', () => {
    expect(answerMismatch(findPercent({ answer: intAnswer(25) }))).toContain(
      'synthetic-find-percent: stated 25, derived 20',
    )
  })

  it('rejects percent prose that disagrees with its source quantities', () => {
    const problem = findPercent()
    if (problem.display.kind !== 'story') throw new Error('expected story display')
    problem.display.text = '15 is what percent of 60?'

    expect(() => answerMismatch(problem)).toThrow('visible percent text disagrees with its data')
  })

  it('keeps existing one-operator arithmetic stories independently verifiable', () => {
    const problem: Problem = {
      ...findPercent(),
      skillId: 'synthetic-arithmetic-story',
      display: { kind: 'story', text: 'Twelve items split among three groups.', operands: [12, 3], operator: '÷' },
      answer: intAnswer(4),
    }

    expect(answerMismatch(problem)).toBeUndefined()
  })
})

describe('ratio and proportion answer verification', () => {
  const writeRatio = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-write-ratio',
    prompt: 'Write the ratio.',
    display: {
      kind: 'story',
      text: '3 red tiles and 5 blue tiles; compare red tiles to blue tiles.',
      ratio: {
        operation: 'write-ratio',
        firstLabel: 'red tiles',
        secondLabel: 'blue tiles',
        first: 3,
        second: 5,
      },
    },
    answer: { kind: 'exact', n: 3, d: 5, requireFraction: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Keep the requested comparison order.',
    solution: [{ text: 'Write the first count over the second.' }],
    difficulty: 1,
    ...overrides,
  })

  const proportion = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-proportion',
    prompt: 'Find the missing value.',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [notationFraction('3', '4'), notationText('='), notationFraction('?', '20')],
      },
      label: '3 over 4 equals blank over 20',
      ratio: {
        operation: 'solve-proportion',
        leftNumerator: 3,
        leftDenominator: 4,
        rightNumerator: 15,
        rightDenominator: 20,
        missing: 'rightNumerator',
      },
    },
    answer: intAnswer(15),
    inputMode: 'keypad',
    hint: 'Cross-multiply, then divide.',
    solution: [{ text: 'Cross-multiply the known diagonal.' }],
    difficulty: 1,
    ...overrides,
  })

  const ratioWord = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-ratio-word',
    prompt: 'Write the requested project ratio.',
    display: {
      kind: 'story',
      text: 'A project has 3 completed tasks and 2 open tasks, 5 tasks in all. Write completed to all tasks.',
      ratio: {
        operation: 'ratio-word',
        frameId: 'project-status',
        first: 3,
        second: 2,
        comparison: 'part-to-whole',
      },
    },
    answer: { kind: 'exact', n: 3, d: 5, requireFraction: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Put completed tasks over all tasks.',
    solution: [{ text: 'Write the first quantity over the second.' }],
    difficulty: 1,
    ...overrides,
  })

  it('recomputes prose and notation answers from structured ratio data', () => {
    expect(answerMismatch(writeRatio())).toBeUndefined()
    expect(answerMismatch(proportion())).toBeUndefined()
    expect(answerMismatch(ratioWord())).toBeUndefined()
  })

  it('rejects ratio prose and notation that disagree with their data', () => {
    const prose = writeRatio()
    if (prose.display.kind !== 'story') throw new Error('expected story display')
    prose.display.text = '5 red tiles and 3 blue tiles; compare red tiles to blue tiles.'

    const notation = proportion()
    if (notation.display.kind !== 'math') throw new Error('expected math display')
    notation.display.notation = {
      kind: 'row',
      children: [notationFraction('3', '4'), notationText('='), notationFraction('?', '16')],
    }

    expect(() => answerMismatch(prose)).toThrow('visible ratio text disagrees with its data')
    expect(() => answerMismatch(notation)).toThrow('visible ratio notation disagrees with its data')

    const word = ratioWord()
    if (word.display.kind !== 'story') throw new Error('expected story display')
    word.display.text = 'A project has 3 completed tasks and 2 open tasks, 5 tasks in all. Write completed to open.'
    expect(() => answerMismatch(word)).toThrow('visible ratio text disagrees with its data')
  })

  it('names a stated ratio answer that disagrees with the displayed sources', () => {
    expect(answerMismatch(writeRatio({ answer: { kind: 'exact', n: 5, d: 3 } }))).toContain(
      'synthetic-write-ratio: stated 1.6666666666666667, derived 0.6',
    )
    expect(answerMismatch(proportion({ answer: intAnswer(12) }))).toContain(
      'synthetic-proportion: stated 12, derived 15',
    )
    expect(answerMismatch(ratioWord({ answer: { kind: 'exact', n: 3, d: 2 } }))).toContain(
      'synthetic-ratio-word: stated 1.5, derived 0.6',
    )
  })

  it('does not trust a hidden proportion term that agrees with a wrong stated answer', () => {
    const problem = proportion({ answer: intAnswer(12) })
    if (problem.display.kind !== 'math' || problem.display.ratio?.operation !== 'solve-proportion') {
      throw new Error('expected proportion display')
    }
    problem.display.ratio.rightNumerator = 12

    expect(answerMismatch(problem)).toContain('synthetic-proportion: stated 12, derived 15')
  })
})

describe('equation answer verification', () => {
  const notated = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-clear-fraction',
    prompt: 'Solve for x.',
    display: {
      kind: 'equation',
      text: 'x/3 + 2 = 7',
      variable: 'x',
      equation: { operation: 'clear-fraction', denominator: 3, constant: 2, adds: true, rightHand: 7 },
      notation: {
        kind: 'row',
        children: [notationFraction('x', '3'), notationText(' + 2 = 7')],
      },
    },
    answer: intAnswer(15),
    inputMode: 'keypad',
    hint: 'Multiply both sides by the denominator.',
    solution: [{ text: 'Clear the denominator.' }],
    difficulty: 1,
    ...overrides,
  })

  const counted = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-special-solutions',
    prompt: 'How many solutions does this equation have?',
    display: {
      kind: 'equation',
      text: '4x + 3 = 4x + 9',
      equation: {
        operation: 'special-solutions',
        letter: 'x',
        leftCoefficient: 4,
        leftConstant: 3,
        rightCoefficient: 4,
        rightConstant: 9,
      },
    },
    answer: { kind: 'choice', id: 'none' },
    inputMode: 'choice',
    choices: [
      { id: 'none', label: 'No solution' },
      { id: 'infinite', label: 'Infinitely many solutions' },
      { id: 'one', label: 'Exactly one solution' },
    ],
    hint: 'Gather the x terms and see what is left.',
    solution: [{ text: 'The x terms cancel.' }],
    difficulty: 1,
    ...overrides,
  })

  const rearranged = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-rearrange',
    prompt: 'Solve for y.',
    display: {
      kind: 'equation',
      text: '2y + 4x = 10',
      variable: 'y',
      equation: {
        operation: 'rearrange',
        subject: 'y',
        term: 'x',
        subjectCoefficient: 2,
        termCoefficient: 4,
        constant: 10,
      },
    },
    answer: { kind: 'expression', canonical: '-2x+5', variable: 'x', form: 'expanded' },
    inputMode: 'expression',
    expression: { variable: 'x' },
    hint: 'Get the y term alone, then divide both sides.',
    solution: [{ text: 'Subtract the x term.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives each new equation answer from its carried terms alone', () => {
    expect(answerMismatch(notated())).toBeUndefined()
    expect(answerMismatch(counted())).toBeUndefined()
    expect(answerMismatch(rearranged())).toBeUndefined()
  })

  it('names a stated equation answer that disagrees with the carried terms', () => {
    expect(answerMismatch(notated({ answer: intAnswer(9) }))).toContain(
      'synthetic-clear-fraction: stated 9, derived 15',
    )
    expect(answerMismatch(counted({ answer: { kind: 'choice', id: 'infinite' } }))).toContain(
      'synthetic-special-solutions: stated infinite, derived none',
    )
    expect(
      answerMismatch(rearranged({ answer: { kind: 'expression', canonical: '2x+5', variable: 'x', form: 'expanded' } })),
    ).toContain('synthetic-rearrange: stated 2x+5, derived -2x+5')
  })

  it('rejects a notated equation whose text disagrees with its data', () => {
    // The notation is what the learner sees, but `text` is what names it to
    // assistive technology and what the carried values are checked against. A
    // text that has drifted from the data is the same defect as a plain row
    // that has, and the check has to reach it through the notated arm too.
    const problem = notated()
    if (problem.display.kind !== 'equation') throw new Error('expected equation display')
    problem.display.text = 'x/4 + 2 = 7'

    expect(() => answerMismatch(problem)).toThrow('visible equation "x/4 + 2 = 7" disagrees with its data')
  })

  it('reads the solution count from the constants, not only the coefficients', () => {
    // The whole diagnostic content of the skill. `4x + 3 = 4x + 9` and
    // `4x + 3 = 4x + 3` share every coefficient and differ only in a constant,
    // so a check that stopped at the coefficients would call them the same.
    const infinite = counted({
      display: {
        kind: 'equation',
        text: '4x + 3 = 4x + 3',
        equation: {
          operation: 'special-solutions',
          letter: 'x',
          leftCoefficient: 4,
          leftConstant: 3,
          rightCoefficient: 4,
          rightConstant: 3,
        },
      },
      answer: { kind: 'choice', id: 'infinite' },
    })

    expect(answerMismatch(infinite)).toBeUndefined()
  })

  it('fails a rearrangement whose coefficients do not divide exactly', () => {
    // The composition rule made executable. A draw that stopped composing
    // produces an answer with a fractional coefficient, which is outside the
    // expression grammar and unenterable on the pad — so the check refuses to
    // derive one rather than deriving something the learner cannot type.
    const problem = rearranged()
    if (problem.display.kind !== 'equation' || problem.display.equation.operation !== 'rearrange') {
      throw new Error('expected rearrange display')
    }
    problem.display.equation.termCoefficient = 5

    expect(() => answerMismatch(problem)).toThrow('rearrange: 2 does not divide both 5 and 10')
  })
})

describe('diagram answer verification', () => {
  const problem = (parts: number, shadedParts: number, answer = { n: 3, d: 4 }): Problem => ({
    skillId: 'synthetic-diagram',
    prompt: 'What fraction is shaded?',
    display: { kind: 'diagram', diagram: { kind: 'bar', parts, shadedParts } },
    answer: { kind: 'exact', ...answer },
    inputMode: 'keypad',
    hint: 'Count all parts, then shaded parts.',
    solution: [{ text: 'Read shaded parts over all parts.' }],
    difficulty: 1,
  })

  it('accepts a rational answer derived from the visible part counts', () => {
    expect(answerMismatch(problem(4, 3))).toBeUndefined()
  })

  it('names a stated answer that disagrees with the visible part counts', () => {
    expect(answerMismatch(problem(4, 3, { n: 1, d: 1 }))).toContain('synthetic-diagram: stated 1, derived 0.75')
  })

  it('rejects invalid visible counts instead of trusting the stated answer', () => {
    expect(() => answerMismatch(problem(0, 0, { n: 0, d: 1 }))).toThrow(/parts must be a positive whole number/)
  })
})

describe('coordinate-plane answer verification', () => {
  const problem = (xMax = 5, xStep = 1): Problem => ({
    skillId: 'synthetic-coordinate-plane',
    prompt: 'What is the slope?',
    display: {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: xMax, step: xStep },
        y: { min: -5, max: 5, step: 1 },
        points: [{ x: -2, y: 1 }],
        lines: [{ through: [{ x: 0, y: 1 }, { x: 2, y: 3 }] }],
      },
    },
    answer: { kind: 'exact', n: 1, d: 1 },
    inputMode: 'keypad',
    hint: 'Compare rise with run.',
    solution: [{ text: 'Read two points on the line.' }],
    difficulty: 1,
  })

  it('fails closed until content declares what answer the graph asks for', () => {
    expect(() => answerMismatch(problem())).toThrow(
      'synthetic-coordinate-plane: coordinate plane needs operation-specific data',
    )
  })

  it('validates the graph before reaching the operation-specific tripwire', () => {
    expect(() => answerMismatch(problem(6, 2))).toThrow('x.step must divide the axis span')
  })

  it('fails closed for a point answer until content carries its operation', () => {
    const pointProblem: Problem = {
      ...problem(),
      prompt: 'Plot the point.',
      answer: { kind: 'point', x: -2, y: 1 },
      inputMode: 'coordinate-plane',
    }

    expect(() => answerMismatch(pointProblem)).toThrow(
      'synthetic-coordinate-plane: coordinate plane needs operation-specific data',
    )
  })

  it('derives difficulty magnitude from graph source values rather than its stated answer', () => {
    expect(sourceMagnitude(problem())).toBeGreaterThan(1)
  })
})

describe('fraction math answer verification', () => {
  const readProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction',
    prompt: 'Write the fraction.',
    display: {
      kind: 'math',
      notation: notationFraction('3 selected', '5 equal parts'),
      label: '3 selected parts out of 5 equal parts',
      fraction: { operation: 'read', numerator: 3, denominator: 5 },
    },
    answer: { kind: 'exact', n: 3, d: 5 },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Put selected parts over all equal parts.',
    solution: [{ text: 'Write selected parts over all equal parts.' }],
    difficulty: 1,
    ...overrides,
  })

  it('accepts a fraction answer derived from operation data and visible notation', () => {
    expect(answerMismatch(readProblem())).toBeUndefined()
  })

  it('rejects notation that disagrees with its operation data', () => {
    const problem = readProblem()
    if (problem.display.kind !== 'math') throw new Error('expected math display')
    problem.display.notation = notationFraction('2 selected', '5 equal parts')

    expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
  })

  it('rejects a math problem without operation-specific data', () => {
    const problem = readProblem()
    if (problem.display.kind !== 'math') throw new Error('expected math display')
    delete problem.display.fraction

    expect(() => answerMismatch(problem)).toThrow('needs operation-specific data')
  })

  const simplifyProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-simplify',
    prompt: 'Write this fraction in lowest terms.',
    display: {
      kind: 'math',
      notation: notationFraction('6', '8'),
      label: '6 over 8',
      fraction: { operation: 'simplify', numerator: 6, denominator: 8 },
    },
    answer: { kind: 'exact', n: 3, d: 4, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Divide both parts by their greatest common factor.',
    solution: [{ text: 'Divide both parts by 2.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives a lowest-terms answer from the visible reducible fraction', () => {
    expect(answerMismatch(simplifyProblem())).toBeUndefined()
  })

  it('names a simplification answer that disagrees with the visible fraction', () => {
    expect(
      answerMismatch({
        ...simplifyProblem(),
        answer: { kind: 'exact', n: 2, d: 3, requireSimplified: true },
      }),
    ).toContain('stated 0.6666666666666666, derived 0.75')
  })

  const compareProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction-compare',
    prompt: 'Choose the relation.',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [notationFraction('2', '3'), notationText('?'), notationFraction('3', '5')],
      },
      label: '2 over 3, blank, 3 over 5',
      fraction: {
        operation: 'compare',
        leftNumerator: 2,
        leftDenominator: 3,
        rightNumerator: 3,
        rightDenominator: 5,
      },
    },
    answer: { kind: 'choice', id: '1' },
    inputMode: 'choice',
    choices: [
      { id: '-1', label: '<' },
      { id: '0', label: '=' },
      { id: '1', label: '>' },
    ],
    hint: 'Compare the fractions as equal-sized amounts.',
    solution: [{ text: 'Two thirds is greater than three fifths.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives a comparison choice from both exact fraction values', () => {
    expect(answerMismatch(compareProblem())).toBeUndefined()
  })

  it('rejects comparison notation that disagrees with its operation data', () => {
    const problem = compareProblem()
    if (problem.display.kind !== 'math') throw new Error('expected math display')
    problem.display.notation = {
      kind: 'row',
      children: [notationFraction('1', '3'), notationText('?'), notationFraction('3', '5')],
    }

    expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
  })

  it('names a comparison answer that disagrees with the exact values', () => {
    expect(
      answerMismatch({
        ...compareProblem(),
        answer: { kind: 'choice', id: '-1' },
      }),
    ).toContain('stated -1, derived 1')
  })

  it('rejects malformed fraction semantic data', () => {
    const problem = compareProblem()
    if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'compare') {
      throw new Error('expected comparison data')
    }
    problem.display.fraction.leftDenominator = 0

    expect(() => answerMismatch(problem)).toThrow('zero denominator')
  })
})

describe('fraction operation answer verification', () => {
  const addProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction-add',
    prompt: 'What is the sum?',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [notationFraction('1', '5'), notationText('+'), notationFraction('2', '5')],
      },
      label: '1 over 5, plus, 2 over 5',
      fraction: {
        operation: 'add',
        leftNumerator: 1,
        leftDenominator: 5,
        rightNumerator: 2,
        rightDenominator: 5,
      },
    },
    answer: { kind: 'exact', n: 3, d: 5, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Add the numerators; the denominator stays.',
    solution: [{ text: 'Add the numerators over the same denominator.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives an addition answer from both displayed fractions', () => {
    expect(answerMismatch(addProblem())).toBeUndefined()
    // Unlike denominators re-derive over the LCM, not the generator's words.
    const unlike = addProblem({
      display: {
        kind: 'math',
        notation: {
          kind: 'row',
          children: [notationFraction('1', '2'), notationText('+'), notationFraction('1', '3')],
        },
        label: '1 over 2, plus, 1 over 3',
        fraction: {
          operation: 'add',
          leftNumerator: 1,
          leftDenominator: 2,
          rightNumerator: 1,
          rightDenominator: 3,
        },
      },
      answer: { kind: 'exact', n: 5, d: 6, requireSimplified: true },
    })
    expect(answerMismatch(unlike)).toBeUndefined()
  })

  it('names an addition answer that disagrees with the displayed fractions', () => {
    expect(
      answerMismatch({
        ...addProblem(),
        answer: { kind: 'exact', n: 3, d: 10 },
      }),
    ).toContain('stated 0.3, derived 0.6')
  })

  it('rejects addition notation that disagrees with its operation data', () => {
    const problem = addProblem()
    if (problem.display.kind !== 'math') throw new Error('expected math display')
    problem.display.notation = {
      kind: 'row',
      children: [notationFraction('1', '4'), notationText('+'), notationFraction('2', '5')],
    }

    expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
  })

  it('rejects malformed addition semantic data', () => {
    const problem = addProblem()
    if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'add') {
      throw new Error('expected addition data')
    }
    problem.display.fraction.rightDenominator = 0

    expect(() => answerMismatch(problem)).toThrow('zero denominator')
  })

  const subProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction-sub',
    prompt: 'What is the difference?',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [notationFraction('3', '4'), notationText('−'), notationFraction('1', '3')],
      },
      label: '3 over 4, minus, 1 over 3',
      fraction: {
        operation: 'sub',
        leftNumerator: 3,
        leftDenominator: 4,
        rightNumerator: 1,
        rightDenominator: 3,
      },
    },
    answer: { kind: 'exact', n: 5, d: 12, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true, allowNegative: true },
    hint: 'Subtract over a common denominator.',
    solution: [{ text: 'Rewrite both over twelfths, then subtract.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives a subtraction answer from both displayed fractions', () => {
    expect(answerMismatch(subProblem())).toBeUndefined()
  })

  it('names a subtraction answer that disagrees with the displayed fractions', () => {
    expect(
      answerMismatch({
        ...subProblem(),
        answer: { kind: 'exact', n: 1, d: 3 },
      }),
    ).toContain('stated 0.3333333333333333, derived 0.4166666666666667')
  })

  const lcdProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction-lcd',
    prompt: 'What is the least common denominator?',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [notationFraction('1', '2'), notationText('and'), notationFraction('1', '3')],
      },
      label: '1 over 2, and, 1 over 3',
      fraction: {
        operation: 'common-denominator',
        leftNumerator: 1,
        leftDenominator: 2,
        rightNumerator: 1,
        rightDenominator: 3,
      },
    },
    answer: intAnswer(6),
    inputMode: 'keypad',
    hint: 'Find the smallest number both denominators divide.',
    solution: [{ text: '6 is divisible by 2 and by 3.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives the least common denominator from both displayed fractions', () => {
    expect(answerMismatch(lcdProblem())).toBeUndefined()
  })

  it('names a common-denominator answer that disagrees with the display', () => {
    expect(answerMismatch({ ...lcdProblem(), answer: intAnswer(12) })).toContain('stated 12, derived 6')
  })

  const mixedProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-fraction-mixed',
    prompt: 'Write this as a mixed number.',
    display: {
      kind: 'math',
      notation: notationFraction('7', '4'),
      label: '7 over 4',
      fraction: {
        operation: 'improper-to-mixed',
        numerator: 7,
        denominator: 4,
      },
    },
    answer: {
      kind: 'exact',
      n: 7,
      d: 4,
      requireMixed: true,
      requireSimplified: true,
    },
    inputMode: 'keypad',
    keypad: { allowMixed: true },
    hint: 'Divide the numerator by the denominator.',
    solution: [{ text: '7 divided by 4 is 1 with 3 left over.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives the source value from the carried improper fraction', () => {
    expect(answerMismatch(mixedProblem())).toBeUndefined()
  })

  it('rejects a mixed-form display, which would show the answer instead of the question', () => {
    const problem = mixedProblem()
    if (problem.display.kind !== 'math') throw new Error('expected math display')
    problem.display.notation = {
      kind: 'row',
      children: [notationText('1'), notationFraction('3', '4')],
    }

    expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
  })

  it('names a mixed answer that disagrees with the source fraction', () => {
    expect(
      answerMismatch({
        ...mixedProblem(),
        answer: {
          kind: 'exact',
          n: 5,
          d: 4,
          requireMixed: true,
          requireSimplified: true,
        },
      }),
    ).toContain('stated 1.25, derived 1.75')
  })

  const mixedToImproperProblem = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-mixed-to-improper',
    prompt: 'Write this as an improper fraction.',
    display: {
      kind: 'math',
      notation: notationMixed(2, 3, 4),
      label: '2 and 3 over 4',
      fraction: { operation: 'mixed-to-improper', whole: 2, numerator: 3, denominator: 4 },
    },
    answer: { kind: 'exact', n: 11, d: 4, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Multiply the whole by the denominator, then add the numerator.',
    solution: [{ text: 'Multiply, then add the numerator.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives an improper fraction from every displayed mixed-number part', () => {
    expect(answerMismatch(mixedToImproperProblem())).toBeUndefined()
    expect(
      answerMismatch({
        ...mixedToImproperProblem(),
        answer: { kind: 'exact', n: 10, d: 4, requireSimplified: true },
      }),
    ).toContain('stated 2.5, derived 2.75')
  })

  it('rejects mixed-to-improper label and operand disagreement', () => {
    const mutations = [
      (problem: Problem) => {
        if (problem.display.kind !== 'math') throw new Error('expected math display')
        problem.display.label = '2 and 1 over 4'
      },
      (problem: Problem) => {
        if (
          problem.display.kind !== 'math' ||
          problem.display.fraction?.operation !== 'mixed-to-improper'
        ) {
          throw new Error('expected mixed-to-improper data')
        }
        problem.display.fraction.numerator = 1
      },
    ]

    for (const mutate of mutations) {
      const problem = structuredClone(mixedToImproperProblem())
      mutate(problem)
      expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
    }
  })

  const mixedOperationProblem = (
    operation: 'add-mixed' | 'sub-mixed',
    overrides: Partial<Problem> = {},
  ): Problem => ({
    skillId: `synthetic-${operation}`,
    prompt: operation === 'add-mixed' ? 'What is the sum?' : 'What is the difference?',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [
          notationMixed(3, 1, 2),
          notationText(operation === 'add-mixed' ? '+' : '−'),
          notationMixed(2, 1, 4),
        ],
      },
      label: `3 and 1 over 2, ${operation === 'add-mixed' ? 'plus' : 'minus'}, 2 and 1 over 4`,
      fraction: {
        operation,
        leftWhole: 3,
        leftNumerator: 1,
        leftDenominator: 2,
        rightWhole: 2,
        rightNumerator: 1,
        rightDenominator: 4,
      },
    },
    answer:
      operation === 'add-mixed'
        ? { kind: 'exact', n: 23, d: 4, requireMixed: true, requireSimplified: true }
        : { kind: 'exact', n: 5, d: 4, requireMixed: true, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowMixed: true },
    hint: 'Add the whole and fractional parts.',
    solution: [{ text: 'Add both mixed numbers exactly.' }],
    difficulty: 1,
    ...overrides,
  })

  it.each(['add-mixed', 'sub-mixed'] as const)(
    'derives %s from both displayed mixed numbers',
    (operation) => {
      expect(answerMismatch(mixedOperationProblem(operation))).toBeUndefined()
    },
  )

  it('rejects mixed-operation notation, label, operator, operand, and answer disagreement', () => {
    const mutations = [
      (problem: Problem) => {
        if (problem.display.kind !== 'math') throw new Error('expected math display')
        problem.display.notation = {
          kind: 'row',
          children: [notationMixed(3, 1, 3), notationText('+'), notationMixed(2, 1, 4)],
        }
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math') throw new Error('expected math display')
        problem.display.label = '3 and 1 over 2, plus, 2 and 3 over 4'
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'add-mixed') {
          throw new Error('expected mixed addition data')
        }
        problem.display.fraction = { ...problem.display.fraction, operation: 'sub-mixed' }
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'add-mixed') {
          throw new Error('expected mixed addition data')
        }
        problem.display.fraction.rightNumerator = 3
      },
    ]

    for (const mutate of mutations) {
      const problem = structuredClone(mixedOperationProblem('add-mixed'))
      mutate(problem)
      expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
    }

    expect(
      answerMismatch({
        ...mixedOperationProblem('sub-mixed'),
        answer: { kind: 'exact', n: 3, d: 4, requireMixed: true, requireSimplified: true },
      }),
    ).toContain('stated 0.75, derived 1.25')
  })

  const multiplyProblem = (operation: 'multiply' | 'divide', overrides: Partial<Problem> = {}): Problem => ({
    skillId: `synthetic-fraction-${operation}`,
    prompt: operation === 'multiply' ? 'What is the product?' : 'What is the quotient?',
    display: {
      kind: 'math',
      notation: {
        kind: 'row',
        children: [
          notationFraction('2', '3'),
          notationText(operation === 'multiply' ? '×' : '÷'),
          notationFraction('4', '5'),
        ],
      },
      label: `2 over 3, ${operation === 'multiply' ? 'times' : 'divided by'}, 4 over 5`,
      fraction: {
        operation,
        leftNumerator: 2,
        leftDenominator: 3,
        rightNumerator: 4,
        rightDenominator: 5,
      } as Extract<FractionData, { operation: 'multiply' }> | Extract<FractionData, { operation: 'divide' }>,
    },
    answer:
      operation === 'multiply'
        ? { kind: 'exact', n: 8, d: 15, requireSimplified: true }
        : { kind: 'exact', n: 5, d: 6, requireSimplified: true },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Use the displayed operation.',
    solution: [{ text: 'Compute from both displayed fractions.' }],
    difficulty: 1,
    ...overrides,
  })

  it('derives fraction multiplication and division from operand order', () => {
    expect(answerMismatch(multiplyProblem('multiply'))).toBeUndefined()
    expect(answerMismatch(multiplyProblem('divide'))).toBeUndefined()
    expect(
      answerMismatch({
        ...multiplyProblem('divide'),
        answer: { kind: 'exact', n: 8, d: 15, requireSimplified: true },
      }),
    ).toContain('stated 0.5333333333333333, derived 0.8333333333333334')
  })

  it('rejects product-operation notation, label, operator, and operand disagreement', () => {
    const mutations = [
      (problem: Problem) => {
        if (problem.display.kind !== 'math') throw new Error('expected math display')
        problem.display.notation = {
          kind: 'row',
          children: [notationFraction('2', '3'), notationText('÷'), notationFraction('4', '5')],
        }
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math') throw new Error('expected math display')
        problem.display.label = '2 over 3, divided by, 4 over 5'
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'multiply') {
          throw new Error('expected multiplication data')
        }
        problem.display.fraction = { ...problem.display.fraction, operation: 'divide' }
      },
      (problem: Problem) => {
        if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'multiply') {
          throw new Error('expected multiplication data')
        }
        problem.display.fraction.rightNumerator = 3
      },
    ]

    for (const mutate of mutations) {
      const problem = structuredClone(multiplyProblem('multiply'))
      mutate(problem)
      expect(() => answerMismatch(problem)).toThrow('visible fraction notation disagrees')
    }
  })

  it('rejects malformed new fraction-operation data', () => {
    const problem = multiplyProblem('divide')
    if (problem.display.kind !== 'math' || problem.display.fraction?.operation !== 'divide') {
      throw new Error('expected division data')
    }
    problem.display.fraction.rightNumerator = 0

    expect(() => answerMismatch(problem)).toThrow('zero denominator')
  })
})

describe('value-bearing diagram choice verification', () => {
  const problem = (secondValue = rational(1, 3)): Problem => ({
    skillId: 'synthetic-equivalent-visual',
    prompt: 'Which description names the same amount?',
    display: {
      kind: 'diagram',
      diagram: { kind: 'bar', parts: 4, shadedParts: 2 },
    },
    answer: { kind: 'choice', id: 'half' },
    inputMode: 'choice',
    choices: [
      {
        id: 'half',
        label: '1 shaded part in every 2 equal parts',
        value: rational(1, 2),
      },
      {
        id: 'other',
        label: '1 shaded part in every 3 equal parts',
        value: secondValue,
      },
    ],
    hint: 'Compare each description with the shaded amount.',
    solution: [{ text: 'Two fourths names the same amount as one half.' }],
    difficulty: 1,
  })

  it('derives the correct choice from exact rational metadata', () => {
    expect(answerMismatch(problem())).toBeUndefined()
  })

  it('names a stated choice that disagrees with the diagram value', () => {
    expect(answerMismatch({ ...problem(), answer: { kind: 'choice', id: 'other' } })).toContain(
      'stated other, derived half',
    )
  })

  it('rejects duplicate equivalent choices', () => {
    expect(() => answerMismatch(problem(rational(2, 4)))).toThrow('expected one choice matching the diagram, found 2')
  })
})

describe.each(allSkills.map((s) => [s.id, s] as const))('generator: %s', (_id, skill) => {
  const sample = (difficulty: Difficulty) =>
    Array.from({ length: ITERATIONS }, (_, i) => generateProblem(skill, seedFor(i, difficulty), difficulty))

  const all = DIFFICULTIES.flatMap(sample)

  it('states an answer that matches the problem it displays', () => {
    for (const problem of all) {
      expect(answerMismatch(problem), JSON.stringify(problem.display)).toBeUndefined()
    }
  })

  it('accepts its own answer through the real answer checker', () => {
    for (const problem of all) {
      const typed =
        problem.answer.kind === 'exact'
          ? problem.answer.requireMixed
            ? // The mixed-form requirement makes the improper fraction a
              // `not-mixed` response, and reducible sources need the reduced
              // fraction part, so the acceptable form is what is typed.
              (() => {
                const whole = Math.floor(problem.answer.n / problem.answer.d)
                const factor = gcd(problem.answer.n, problem.answer.d)
                return `${whole} ${(problem.answer.n % problem.answer.d) / factor}/` + `${problem.answer.d / factor}`
              })()
            : // `requireDecimal` makes a fraction-formatted entry a `not-decimal`
              // response, so the acceptable form is a decimal string.
              problem.answer.requireDecimal
              ? String(toNumber(rational(problem.answer.n, problem.answer.d)))
              : formatRational(rational(problem.answer.n, problem.answer.d))
          : String(answerValue(problem))
      expect(checkAnswer(problem.answer, typed).status).toBe('correct')
    }
  })

  it('declares no misconception that is always filtered away', () => {
    // What this file used to assert here — no prediction equal to the answer,
    // no duplicate values — described `generateProblem()`'s own output, which it
    // had already cleaned. Neither could fail whatever a generator authored.
    // That guarantee is real and is checked where it is made, in
    // `lib/generator.test.ts`, against skills that deliberately author the bad
    // cases. What belongs here is the property those assertions looked like they
    // were making: that the skill's predictions actually survive to a learner.
    const never = alwaysFiltered(skill)

    expect(never, `${skill.id} predicts these and they never reach anyone`).toEqual([])
  })

  it('satisfies the content style contract on every sampled problem', () => {
    // Sampled rather than static: the text is generated, so the only way to
    // check it is to generate a lot of it. One failure lists every violation
    // across all five difficulties so an authoring pass can fix them together.
    const at = manifestIndex.get(skill.id)
    expect(at, `${skill.id} is not in the manifest`).toBeDefined()

    const violations = all.flatMap((problem) => checkContent(problem, at!))
    const distinct = [...new Set(formatViolations(violations))]

    expect(distinct).toEqual([])
  })

  it('always ships a hint and worked solution', () => {
    for (const problem of all) {
      expect(problem.hint.length).toBeGreaterThan(0)
      expect(problem.solution.length).toBeGreaterThan(0)
      for (const step of problem.solution) {
        expect(step.text.length).toBeGreaterThan(0)
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const a = generateProblem(skill, 12345, 3)
    const b = generateProblem(skill, 12345, 3)
    expect(a).toEqual(b)
  })

  it('scales operand size with difficulty', () => {
    expect(scalingProblems(skill)).toEqual([])
  })

  it('produces varied problems rather than repeating one', () => {
    const shown = new Set(all.map((p) => JSON.stringify(p.display)))
    expect(shown.size).toBeGreaterThan(20)
  })
})

describe('alwaysFiltered', () => {
  // A checker that returns "no problems" looks exactly like a clean codebase —
  // which is precisely how the assertions this replaced went unnoticed. These
  // are the synthetic skills proving it names the offender.
  const skillPredicting = (build: (sum: number) => { value: number; tag: string }[]): SkillGenerator => ({
    id: 'synthetic',
    name: 'Synthetic',
    blurb: 'For testing the checker',
    generate(rng, difficulty) {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      return {
        skillId: 'synthetic',
        prompt: 'What is the sum?',
        display: { kind: 'inline', text: `${a} + ${b}` },
        answer: { kind: 'exact', n: a + b, d: 1 },
        inputMode: 'keypad',
        misconceptions: build(a + b).map((m) => ({ ...m, nudge: 'n' })),
        hint: 'Add them.',
        solution: [{ text: `Add ${a} and ${b}.` }],
        difficulty,
      }
    },
  })

  it('names a tag whose value is always the answer', () => {
    // `add-2digit-nocarry`'s actual failure, in miniature.
    const skill = skillPredicting((sum) => [
      { value: sum, tag: 'always-the-answer' },
      { value: sum - 1, tag: 'off-by-one' },
    ])

    expect(alwaysFiltered(skill)).toEqual(['always-the-answer'])
  })

  it('passes a tag that collapses only sometimes', () => {
    // `add-3digit` is this case: its forgot-carry predictions equal the answer
    // whenever that column does not carry, and are real diagnoses otherwise.
    // Collapsing sometimes is the design, not a defect.
    const skill = skillPredicting((sum) => [{ value: sum % 2 === 0 ? sum : sum - 1, tag: 'sometimes' }])

    expect(alwaysFiltered(skill)).toEqual([])
  })

  it('names a tag always shadowed by an earlier duplicate', () => {
    // The other way a prediction can never reach anyone: a second tag that
    // always carries a value the first already claimed, so dedup drops it every
    // time and the skill silently offers one diagnosis instead of two.
    const skill = skillPredicting((sum) => [
      { value: sum - 1, tag: 'first' },
      { value: sum - 1, tag: 'always-shadowed' },
    ])

    expect(alwaysFiltered(skill)).toEqual(['always-shadowed'])
  })

  it('is quiet on a skill whose predictions all survive', () => {
    const skill = skillPredicting((sum) => [
      { value: sum - 1, tag: 'low' },
      { value: sum + 1, tag: 'high' },
    ])

    expect(alwaysFiltered(skill)).toEqual([])
  })
})

describe('recompute', () => {
  // A checker that returns "no problems" looks exactly like a clean codebase.
  // These are the synthetic cases proving the story branch actually verifies.
  const story = (operands: number[], stated: number): Problem => ({
    skillId: 'synthetic',
    prompt: 'How many in total?',
    display: {
      kind: 'story',
      // Mentions a quantity the answer does not use, which is the whole reason
      // the operands are carried separately from the prose.
      text: `Pip has 4 stickers and 3 more in a box. Jun has 9. How many does Pip have?`,
      operands,
      operator: '+',
    },
    answer: { kind: 'exact', n: stated, d: 1 },
    inputMode: 'keypad',
    hint: 'Add what Pip has.',
    solution: [{ text: 'Add 4 and 3.' }],
    difficulty: 1,
  })

  const whole = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-whole',
    prompt: 'Which digit is in the tens place?',
    display: {
      kind: 'inline',
      text: '347',
      wholeNumber: { operation: 'tens-digit', value: 347 },
    },
    answer: { kind: 'exact', n: 4, d: 1 },
    inputMode: 'keypad',
    hint: 'Read the middle digit.',
    solution: [{ text: 'The tens digit is 4.' }],
    difficulty: 1,
    ...overrides,
  })

  it('verifies a story from its carried operands, not its prose', () => {
    const problem = story([4, 3], 7)
    expect(recompute(problem)).toBe(7)
    expect(answerValue(problem)).toBe(recompute(problem))
  })

  it('rejects a math display until its generator adds independently verifiable data', () => {
    const candidate = whole({
      skillId: 'synthetic-math',
      display: {
        kind: 'math',
        notation: {
          kind: 'fraction',
          numerator: { kind: 'text', value: '3' },
          denominator: { kind: 'text', value: '4' },
        },
        label: 'three fourths',
      },
    })

    expect(() => recompute(candidate)).toThrow('synthetic-math: a math display needs operation-specific data')
  })

  it('catches a story whose stated answer disagrees with its operands', () => {
    // The failure this branch exists to prevent: prose and answer look
    // plausible together, and the answer key is still wrong.
    const problem = story([4, 3], 13)
    expect(recompute(problem)).toBe(7)
    expect(answerValue(problem)).not.toBe(recompute(problem))
  })

  it('is not fooled by a distractor quantity in the sentence', () => {
    // 9 appears in the text; reading numbers out of the prose would find it.
    const problem = story([4, 3], 7)
    expect(recompute(problem)).not.toBe(16)
  })

  it('recomputes a whole-number keypad answer from carried values', () => {
    expect(recompute(whole())).toBe(4)
  })

  it('names visible text that disagrees with carried values', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '346',
        wholeNumber: { operation: 'tens-digit', value: 347 },
      },
    })

    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('catches a whole-number numeric answer that disagrees with its values', () => {
    const wrong = whole({ answer: { kind: 'exact', n: 7, d: 1 } })

    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('resolves a choice id through the independently derived label', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '1', label: '>' },
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
      ],
    })

    expect(recompute(comparison)).toBe('-1')
    expect(answerValue(comparison)).toBe(recompute(comparison))
  })

  it('catches a correct label mapped to the wrong answer id', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(answerValue(comparison)).not.toBe(recompute(comparison))
  })

  it.each([
    [
      'missing',
      [
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    ],
    [
      'duplicated',
      [
        { id: '-1', label: '<' },
        { id: '2', label: '<' },
        { id: '1', label: '>' },
      ],
    ],
  ])('names an expected label that is %s', (_case, choices) => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices,
    })

    expect(() => recompute(comparison)).toThrow('synthetic-whole: expected exactly one choice labelled "<"')
  })

  it('derives a remainder rather than evaluating the division shown', () => {
    // The case the arithmetic branch gets wrong. Evaluating "47 ÷ 5" gives 9.4;
    // this problem asks what is left over, and the answer is 2.
    const remainder = whole({
      prompt: 'What is left over?',
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: {
          operation: 'divide-remainder',
          dividend: 47,
          divisor: 5,
        },
      },
      answer: { kind: 'exact', n: 2, d: 1 },
    })

    expect(recompute(remainder)).toBe(2)
    expect(answerValue(remainder)).toBe(recompute(remainder))
  })

  it('catches a remainder answer that disagrees with its carried operands', () => {
    const wrong = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: {
          operation: 'divide-remainder',
          dividend: 47,
          divisor: 5,
        },
      },
      // 9 is the quotient, which is exactly the confusion the skill diagnoses —
      // and an answer key that made it would be shipped without this branch.
      answer: { kind: 'exact', n: 9, d: 1 },
    })

    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('discards the remainder when the whole quotient is asked for', () => {
    const quotient = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: { operation: 'divide-quotient', dividend: 47, divisor: 5 },
      },
      answer: { kind: 'exact', n: 9, d: 1 },
    })

    expect(recompute(quotient)).toBe(9)
    expect(answerValue(quotient)).toBe(recompute(quotient))
  })

  it('names a division whose displayed text does not match its operands', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 6',
        wholeNumber: {
          operation: 'divide-remainder',
          dividend: 47,
          divisor: 5,
        },
      },
    })

    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('derives a magnitude rather than evaluating the value shown', () => {
    // `|−7|` is not arithmetic, so the expression branch cannot read it at all;
    // and a display of `−7` alone would evaluate to −7, which is the answer this
    // problem exists to say is wrong.
    const distance = whole({
      prompt: 'How far is this from zero?',
      display: {
        kind: 'inline',
        text: '|−7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      answer: { kind: 'exact', n: 7, d: 1 },
    })

    expect(recompute(distance)).toBe(7)
    expect(answerValue(distance)).toBe(recompute(distance))
  })

  it('catches a distance answer that kept the sign', () => {
    const wrong = whole({
      display: {
        kind: 'inline',
        text: '|−7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      // The mistake the skill diagnoses, shipped as the answer key — which is
      // exactly what this branch exists to catch.
      answer: { kind: 'exact', n: -7, d: 1 },
    })

    expect(recompute(wrong)).toBe(7)
    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('names a distance display that does not match its carried value', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '|7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      answer: { kind: 'exact', n: 7, d: 1 },
    })

    // Both display the same answer, which is what makes this worth pinning: the
    // problem asked a different question from the one it carries.
    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('expects a compared display to draw its signs the way the course does', () => {
    const negatives = whole({
      display: {
        kind: 'inline',
        text: '−7 ? −3',
        wholeNumber: { operation: 'compare', left: -7, right: -3 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })
    const hyphenated = whole({
      ...negatives,
      display: {
        kind: 'inline',
        text: '-7 ? -3',
        wholeNumber: { operation: 'compare', left: -7, right: -3 },
      },
    })

    expect(recompute(negatives)).toBe('-1')
    // The pair the number line already separates: `−` is drawn, `-` is entered.
    // A display carrying the entry form is named rather than quietly accepted.
    expect(() => recompute(hyphenated)).toThrow('synthetic-whole: visible text')
  })

  it('leaves a comparison of positive values exactly as it was', () => {
    const positives = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(recompute(positives)).toBe('-1')
  })

  it('resolves a factor list through its visible label', () => {
    const factors = whole({
      prompt: 'Which list holds every factor?',
      display: {
        kind: 'inline',
        text: '12',
        wholeNumber: { operation: 'factors', value: 12 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '1', label: '2, 3, 4, 6' },
        { id: '0', label: '1, 2, 3, 4, 6, 12' },
        { id: '2', label: '1, 2, 3, 4, 5, 6, 12' },
      ],
    })

    expect(recompute(factors)).toBe('0')
    expect(answerValue(factors)).toBe(recompute(factors))
  })

  it('catches a correct factor list mapped to the wrong choice id', () => {
    const factors = whole({
      display: {
        kind: 'inline',
        text: '12',
        wholeNumber: { operation: 'factors', value: 12 },
      },
      // Points at the list with 1 and 12 stripped out — the distractor.
      answer: { kind: 'choice', id: '1' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: '1, 2, 3, 4, 6, 12' },
        { id: '1', label: '2, 3, 4, 6' },
      ],
    })

    expect(answerValue(factors)).not.toBe(recompute(factors))
  })

  it('resolves multiples and a primality classification through their labels', () => {
    const multiples = whole({
      display: {
        kind: 'inline',
        text: '6',
        wholeNumber: { operation: 'multiples', value: 6, count: 4 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: '6, 12, 18, 24' },
        { id: '1', label: '0, 6, 12, 18' },
      ],
    })
    const classify = whole({
      display: {
        kind: 'inline',
        text: '51',
        wholeNumber: { operation: 'classify-prime', value: 51 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: 'composite' },
        { id: '1', label: 'prime' },
      ],
    })

    expect(recompute(multiples)).toBe('0')
    // 51 looks prime and is 3 × 17, which is the whole point of the skill.
    expect(recompute(classify)).toBe('0')
  })

  // The expression evaluator is the branch every keypad arithmetic skill routes
  // through, so a bug in it weakens the check protecting the whole course rather
  // than one unit. These are the cases proving it does the reading.
  // `stated` defaults, because most cases below assert on `recompute` alone and
  // never read the answer. Spelling out a value there invited reading it as the
  // assertion when the `.toBe()` beside it is.
  const expression = (text: string, stated = 0): Problem => ({
    skillId: 'synthetic-expression',
    prompt: 'What is the value?',
    display: { kind: 'inline', text },
    answer: { kind: 'exact', n: stated, d: 1 },
    inputMode: 'keypad',
    hint: 'Work out which operation comes first.',
    solution: [{ text: 'Multiply before adding.' }],
    difficulty: 1,
  })

  it('applies precedence rather than the order the operators are written in', () => {
    const problem = expression('3 + 4 × 2', 11)

    expect(recompute(problem)).toBe(11)
    expect(answerValue(problem)).toBe(recompute(problem))
  })

  it('catches an answer folded left to right', () => {
    // The `two-operations` wall in miniature, and the reason this branch cannot
    // stay a fold: 14 is the mistake the skill exists to diagnose, and a checker
    // that folded would have called it correct.
    const problem = expression('3 + 4 × 2', 14)

    expect(recompute(problem)).toBe(11)
    expect(answerValue(problem)).not.toBe(recompute(problem))
  })

  it('evaluates a parenthesised group first', () => {
    expect(recompute(expression('(3 + 4) × 2'))).toBe(14)
    expect(recompute(expression('7 + 3 × (9 − 4)'))).toBe(22)
  })

  it('runs equal precedence left to right, not in PEMDAS letter order', () => {
    // The `pemdas` misconception, checked on the checker. Reading A before S
    // gives 9 and M before D gives 3; both are wrong and both are values a
    // learner reaches.
    expect(recompute(expression('20 − 8 + 3'))).toBe(15)
    expect(recompute(expression('24 ÷ 4 × 2'))).toBe(12)
  })

  it('keeps evaluating the two-operand displays that already ship', () => {
    expect(recompute(expression('40 + 40'))).toBe(80)
    expect(recompute(expression('1482 ÷ 6'))).toBe(247)
    expect(recompute(expression('30 − 10'))).toBe(20)
  })

  it.each([
    ['unbalanced parentheses', '(3 + 4 × 2'],
    ['a stray operator', '3 + × 2'],
    ['a character that is not arithmetic', '3 + 4 ? 2'],
    ['nothing to evaluate', ''],
  ])('names a display it cannot read: %s', (_case, text) => {
    // Loud beats silent: an unreadable display that returned NaN would compare
    // unequal to every answer and look like a generator bug in the wrong place.
    expect(() => recompute(expression(text))).toThrow('synthetic-expression: cannot evaluate')
  })

  it('names duplicate choice ids even when the expected label is unique', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '-1', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(() => recompute(comparison)).toThrow('synthetic-whole: choice ids are not unique')
  })
})

describe('difficulty reporting', () => {
  const synthetic = (wholeNumber: boolean, flat: boolean): SkillGenerator => ({
    id: flat ? 'flat-whole' : wholeNumber ? 'growing-whole' : 'growing-arithmetic',
    name: 'Synthetic',
    blurb: 'For testing difficulty',
    generate(_rng, difficulty) {
      const value = flat ? 40 : difficulty * 40
      return wholeNumber
        ? {
            skillId: flat ? 'flat-whole' : 'growing-whole',
            prompt: 'Round this value.',
            display: {
              kind: 'inline',
              text: String(value),
              wholeNumber: { operation: 'round-to-10', value },
            },
            answer: { kind: 'exact', n: value, d: 1 },
            inputMode: 'keypad',
            hint: 'Use the ones digit.',
            solution: [{ text: `This rounds to ${value}.` }],
            difficulty,
          }
        : {
            skillId: 'growing-arithmetic',
            prompt: 'What is the sum?',
            display: { kind: 'inline', text: `${value} + ${value}` },
            answer: { kind: 'exact', n: value * 2, d: 1 },
            inputMode: 'keypad',
            hint: 'Add the values.',
            solution: [{ text: `Add ${value} and ${value}.` }],
            difficulty,
          }
    },
  })

  it('names a flat whole-number ladder', () => {
    expect(scalingProblems(synthetic(true, true))).toEqual([
      'flat-whole: difficulty 5 magnitude 40 is not above difficulty 1 magnitude 40',
    ])
  })

  it('accepts growing whole-number source values', () => {
    expect(scalingProblems(synthetic(true, false))).toEqual([])
  })

  it('keeps measuring existing arithmetic by its numeric answer', () => {
    expect(scalingProblems(synthetic(false, false))).toEqual([])
  })
})

// The prerequisite graph is asserted in `manifest/manifest.test.ts` — acyclic,
// no dangling ids, every skill reachable from the single root — across all 201
// skills rather than the seven with generators. Generators do not declare edges.
