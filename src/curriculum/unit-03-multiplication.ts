import { intAnswer } from '../lib/answer'
import type { Rng } from '../lib/rng'
import type { Misconception, SkillGenerator, SolutionStep } from '../lib/types'
import {
  band,
  carriedBeforeMultiplying,
  countOf,
  defineSkill,
  drawPair,
  firstPartialOnly,
  forgotMultiplicationCarry,
  missingPlaceholder,
  multiplicationPlace,
  multiplicationTrace,
  offBy,
  partialProductRow,
  partialProductTrace,
  pickFrame,
  storyProblem,
  type Ladder,
} from './engine'
import { MULTIPLICATION_FRAMES } from './phrasing/multiplication'

const TABLE_PARTNERS: Ladder = {
  1: [2, 4],
  2: [2, 6],
  3: [2, 8],
  4: [2, 10],
  5: [2, 12],
}

const ordered = (a: number, b: number, rng: Rng): [number, number] =>
  rng.bool() ? [a, b] : [b, a]

const sumDigits = (value: number) =>
  [...String(value)].reduce((sum, digit) => sum + Number(digit), 0)

const groupErrors = (
  product: number,
  groupSize: number,
  noun = 'group',
): Misconception[] =>
  offBy(product, groupSize, {
    tag: 'one-group',
    low: `That is one equal ${noun} too few. Add another ${groupSize}.`,
    high: `That is one equal ${noun} too many. Take away ${groupSize}.`,
  })

type TableSkillConfig = {
  id: string
  name: string
  blurb: string
  table: number
  hint(partner: number, product: number): string
  solution(partner: number, product: number): SolutionStep[]
  misconceptions?(partner: number, product: number): Misconception[]
}

function tableSkill(config: TableSkillConfig): SkillGenerator {
  return defineSkill({
    id: config.id,
    name: config.name,
    blurb: config.blurb,
    build({ rng, difficulty }) {
      const [min, max] = band(difficulty, TABLE_PARTNERS)
      const partner = rng.int(min, max)
      const product = config.table * partner
      const [left, right] = ordered(config.table, partner, rng)

      return {
        prompt: 'What is the product?',
        display: { kind: 'inline', text: `${left} × ${right}` },
        answer: intAnswer(product),
        misconceptions:
          config.misconceptions?.(partner, product) ??
          groupErrors(product, partner),
        hint: config.hint(partner, product),
        solution: config.solution(partner, product),
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Meaning: repeated addition and arrays
// ---------------------------------------------------------------------------

const multMeaning = defineSkill({
  id: 'mult-meaning',
  name: 'What Multiplication Is',
  blurb: 'Repeated addition and arrays',
  build({ rng, difficulty }) {
    const { a: groups, b: size } = drawPair({
      label: 'mult-meaning',
      rng,
      band: band(difficulty, {
        1: [2, 4],
        2: [2, 5],
        3: [2, 6],
        4: [2, 8],
        5: [2, 10],
      }),
    })
    const product = groups * size
    const [left, right] = ordered(groups, size, rng)

    return {
      prompt: `An array has ${groups} rows of ${size}. How many entries?`,
      display: { kind: 'inline', text: `${left} × ${right}` },
      answer: intAnswer(product),
      misconceptions: groupErrors(product, size),
      hint: `${groups} rows of ${size} means ${groups} equal groups.`,
      solution: [
        { text: `Read this as ${groups} groups of ${size}.` },
        {
          text: 'Add the equal groups.',
          detail: `${Array.from({ length: groups }, () => size).join(' + ')} = ${product}`,
        },
        { text: `So ${left} × ${right} = ${product}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Tables, easiest first
// ---------------------------------------------------------------------------

const times2 = tableSkill({
  id: 'times-2',
  name: 'Twos',
  blurb: 'Doubling',
  table: 2,
  hint: (partner) => `Double ${partner}: add it to itself.`,
  solution: (partner, product) => [
    { text: `Double ${partner}.`, detail: `${partner} + ${partner} = ${product}` },
    { text: `So 2 × ${partner} = ${product}.` },
  ],
})

const times10 = tableSkill({
  id: 'times-10',
  name: 'Tens',
  blurb: 'The pattern of zeros',
  table: 10,
  hint: (partner) => `Ten groups of ${partner} puts one zero after ${partner}.`,
  solution: (partner, product) => [
    { text: `Start with ${partner}.` },
    { text: 'Shift every digit one place left.', detail: `${partner} → ${product}` },
    { text: `So 10 × ${partner} = ${product}.` },
  ],
  misconceptions: (partner, product) => [
    {
      value: partner,
      tag: 'dropped-zero',
      nudge: `The ${partner} still needs one zero after it for ten groups.`,
    },
    {
      value: product + 10,
      tag: 'one-group-high',
      nudge: 'That has one group of ten too many. Take one ten away.',
    },
  ],
})

const times5 = tableSkill({
  id: 'times-5',
  name: 'Fives',
  blurb: 'Half of ten',
  table: 5,
  hint: (partner) => `Find ten groups of ${partner}, then take half.`,
  solution: (partner, product) => {
    const tenGroups = partner * 10
    return [
      { text: 'Find ten groups first.', detail: `${partner} × 10 = ${tenGroups}` },
      { text: 'Five groups are half of that.', detail: `${tenGroups} split in half = ${product}` },
      { text: `So 5 × ${partner} = ${product}.` },
    ]
  },
})

const times3 = tableSkill({
  id: 'times-3',
  name: 'Threes',
  blurb: 'The three times table',
  table: 3,
  hint: (partner) => `Add three equal groups of ${partner}.`,
  solution: (partner, product) => [
    { text: 'Write three equal groups.', detail: `${partner} + ${partner} + ${partner}` },
    { text: 'Add them.', detail: `${partner} + ${partner} + ${partner} = ${product}` },
    { text: `So 3 × ${partner} = ${product}.` },
  ],
})

const times4 = tableSkill({
  id: 'times-4',
  name: 'Fours',
  blurb: 'Double twice',
  table: 4,
  hint: (partner) => `Double ${partner}, then double that result.`,
  solution: (partner, product) => {
    const doubled = partner * 2
    return [
      { text: `Double ${partner}.`, detail: `${partner} + ${partner} = ${doubled}` },
      { text: 'Double that result.', detail: `${doubled} + ${doubled} = ${product}` },
      { text: `So 4 × ${partner} = ${product}.` },
    ]
  },
})

const times6 = tableSkill({
  id: 'times-6',
  name: 'Sixes',
  blurb: 'The six times table',
  table: 6,
  hint: (partner) => `Use five groups of ${partner}, then add one more.`,
  solution: (partner, product) => {
    const fiveGroups = partner * 5
    return [
      { text: 'Find five groups.', detail: `5 × ${partner} = ${fiveGroups}` },
      { text: 'Add one more group.', detail: `${fiveGroups} + ${partner} = ${product}` },
      { text: `So 6 × ${partner} = ${product}.` },
    ]
  },
})

const times9 = tableSkill({
  id: 'times-9',
  name: 'Nines',
  blurb: 'The digit-sum pattern',
  table: 9,
  hint: (_partner, product) => {
    const digitSum = sumDigits(product)
    return `Use ten groups minus one; the digits in ${product} add to ${digitSum}.`
  },
  solution: (partner, product) => {
    const tenGroups = partner * 10
    const digitSum = sumDigits(product)
    return [
      { text: 'Start with ten groups.', detail: `10 × ${partner} = ${tenGroups}` },
      { text: 'Take one group away.', detail: `${tenGroups} − ${partner} = ${product}` },
      { text: `Check the digits in ${product}: they add to ${digitSum}.` },
    ]
  },
  misconceptions: (partner, product) => [
    {
      value: product + partner,
      tag: 'used-ten-groups',
      nudge: `That is ten groups. Take one group of ${partner} away.`,
    },
    {
      value: product - partner,
      tag: 'removed-two-groups',
      nudge: `That takes away two groups of ${partner}; only one comes off ten groups.`,
    },
  ],
})

const times78 = defineSkill({
  id: 'times-7-8',
  name: 'Sevens & Eights',
  blurb: 'The facts with no shortcut',
  build({ rng, difficulty }) {
    const table = rng.pick([7, 8])
    const [min, max] = band(difficulty, TABLE_PARTNERS)
    const partner = rng.int(min, max)
    const product = table * partner
    const [left, right] = ordered(table, partner, rng)
    const fiveGroups = partner * 5
    const remainder = table - 5

    return {
      prompt: 'What is the product?',
      display: { kind: 'inline', text: `${left} × ${right}` },
      answer: intAnswer(product),
      misconceptions: groupErrors(product, partner),
      hint: `Start with five groups of ${partner}, then add ${remainder} more.`,
      solution: [
        { text: 'Find five groups.', detail: `5 × ${partner} = ${fiveGroups}` },
        {
          text: `Add the remaining ${remainder} groups.`,
          detail: `${fiveGroups} + ${remainder * partner} = ${product}`,
        },
        { text: `So ${left} × ${right} = ${product}.` },
      ],
    }
  },
})

const timesMixed = defineSkill({
  id: 'times-mixed',
  name: 'Mixed Tables',
  blurb: 'Full table review',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'times-mixed',
      rng,
      band: band(difficulty, TABLE_PARTNERS),
    })
    const product = a * b
    const [left, right] = ordered(a, b, rng)

    return {
      prompt: 'What is the product?',
      display: { kind: 'inline', text: `${left} × ${right}` },
      answer: intAnswer(product),
      misconceptions: groupErrors(product, a),
      hint: `Treat this as ${b} equal groups of ${a}.`,
      solution: [
        { text: `Use the ${a} times table for ${b} groups.` },
        { text: 'Multiply the two numbers.', detail: `${a} × ${b} = ${product}` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Multiplying by powers of ten
// ---------------------------------------------------------------------------

const multBy10100 = defineSkill({
  id: 'mult-by-10-100',
  name: 'Times 10 and 100',
  blurb: 'Shifting places',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 12],
      2: [5, 25],
      3: [10, 45],
      4: [20, 70],
      5: [30, 99],
    })
    const value = rng.int(min, max)
    const multiplier = rng.pick(difficulty <= 2 ? [10] : [10, 100])
    const product = value * multiplier
    const zeros = multiplier === 10 ? 1 : 2
    const zeroLabel = countOf(zeros, 'zero')
    const [left, right] = ordered(value, multiplier, rng)

    return {
      prompt: 'What is the product?',
      display: { kind: 'inline', text: `${left} × ${right}` },
      answer: intAnswer(product),
      misconceptions: [
        {
          value: product / 10,
          tag: 'shifted-too-few',
          nudge: `That shifts one place too few. Times ${multiplier} needs ${zeroLabel}.`,
        },
        {
          value: product * 10,
          tag: 'shifted-too-many',
          nudge: `That shifts one place too many. Times ${multiplier} needs ${zeroLabel}.`,
        },
      ],
      hint: `Shift every digit ${zeros} place${zeros === 1 ? '' : 's'} left.`,
      solution: [
        { text: `Start with ${value}.` },
        {
          text: `Shift its digits ${zeros} place${zeros === 1 ? '' : 's'} left.`,
          detail: `${value} → ${product}`,
        },
        { text: `So ${left} × ${right} = ${product}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two digits by one, with a real carry
// ---------------------------------------------------------------------------

const mult2by1 = defineSkill({
  id: 'mult-2by1',
  name: 'Two Digits by One',
  blurb: '34 × 6',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'mult-2by1',
      rng,
      band: band(difficulty, {
        1: [12, 35],
        2: [15, 49],
        3: [20, 65],
        4: [25, 85],
        5: [35, 99],
      }),
      second: (_a, r) => r.int(2, 9),
      where: ({ a, b }) => (a % 10) * b >= 10,
    })
    const trace = multiplicationTrace(a, b)
    const ones = multiplicationPlace(trace, 0)
    const tens = multiplicationPlace(trace, 1)

    return {
      prompt: 'Multiply the columns.',
      display: { kind: 'column', operands: [a, b], operator: '×' },
      answer: intAnswer(trace.result),
      misconceptions: [
        forgotMultiplicationCarry(
          trace,
          0,
          `The ones carry ${ones.carry}; add it after multiplying the tens digit.`,
        ),
        carriedBeforeMultiplying(
          trace,
          0,
          `Multiply the tens digit first, then add the carried ${ones.carry}.`,
        ),
      ],
      hint: `Multiply the ones first; write ${ones.written} and carry ${ones.carry}.`,
      solution: [
        {
          text: `Multiply the ones digit by ${b}.`,
          detail: `${ones.digit} × ${b} = ${ones.raw}`,
        },
        { text: `Write ${ones.written} and carry ${ones.carry}.` },
        {
          text: 'Multiply the tens, then add the carry.',
          detail: `${tens.digit} × ${b} + ${tens.incoming} = ${tens.total}`,
        },
        { text: `So ${a} × ${b} = ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two digits by two, with aligned partial products
// ---------------------------------------------------------------------------

const mult2by2 = defineSkill({
  id: 'mult-2by2',
  name: 'Two Digits by Two',
  blurb: '34 × 26',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'mult-2by2',
      rng,
      band: band(difficulty, {
        1: [12, 39],
        2: [15, 49],
        3: [20, 69],
        4: [25, 89],
        5: [35, 99],
      }),
      where: ({ b }) => b % 10 !== 0 && Math.floor(b / 10) % 10 !== 0,
    })
    const trace = partialProductTrace(a, b)
    const ones = partialProductRow(trace, 0)
    const tens = partialProductRow(trace, 1)
    const tensCount = countOf(tens.digit, 'ten')

    return {
      prompt: 'Multiply using two rows.',
      display: { kind: 'column', operands: [a, b], operator: '×' },
      answer: intAnswer(trace.result),
      misconceptions: [
        missingPlaceholder(
          trace,
          1,
          `The ${tens.digit} is in the tens place, so its row needs a zero after ${tens.unshifted}.`,
        ),
        firstPartialOnly(
          trace,
          `That is the first row. Add the row for ${tensCount} as well.`,
        ),
      ],
      hint: `The second row uses ${tensCount}, so put a zero after ${tens.unshifted}.`,
      solution: [
        {
          text: `Multiply by the ones digit, ${ones.digit}.`,
          detail: `${a} × ${ones.digit} = ${ones.value}`,
        },
        {
          text: `Multiply by ${tensCount} and add a zero.`,
          detail: `${a} × ${tens.digit} × 10 = ${tens.value}`,
        },
        {
          text: 'Add the aligned rows.',
          detail: `${ones.value} + ${tens.value} = ${trace.result}`,
        },
        { text: `So ${a} × ${b} = ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Multiplication word problems
// ---------------------------------------------------------------------------

const multWords = defineSkill({
  id: 'mult-words',
  name: 'Multiplication Word Problems',
  blurb: 'Spot the multiplication',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'mult-words',
      rng,
      band: band(difficulty, {
        1: [3, 5],
        2: [3, 7],
        3: [4, 9],
        4: [5, 12],
        5: [7, 15],
      }),
    })
    // Different from `b` so the wrong-pair prediction cannot be the answer.
    // The group counts and sizes start at 3, excluding the 2 × 2 collision.
    const distractor = rng.intExcept(2, Math.max(12, b + 3), [b])
    const frame = pickFrame(rng, MULTIPLICATION_FRAMES)

    return storyProblem(frame, { a, b, distractor })
  },
})

export const unit03: SkillGenerator[] = [
  multMeaning,
  times2,
  times10,
  times5,
  times3,
  times4,
  times6,
  times9,
  times78,
  timesMixed,
  multBy10100,
  mult2by1,
  mult2by2,
  multWords,
]
