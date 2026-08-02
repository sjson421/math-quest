import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import type { SkillGenerator } from '../lib/types'
import { band, defineSkill } from './engine'

const SMALL = [
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
] as const

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
] as const

export function numberWords(value: number): string {
  if (value < 20) return SMALL[value]
  if (value < 100) {
    const ones = value % 10
    return `${TENS[Math.floor(value / 10)]}${ones ? `-${SMALL[ones]}` : ''}`
  }

  const rest = value % 100
  return `${SMALL[Math.floor(value / 100)]} hundred${rest ? ` ${numberWords(rest)}` : ''}`
}

const swapLastDigits = (value: number) =>
  Math.floor(value / 100) * 100 + (value % 10) * 10 + Math.floor((value % 100) / 10)

const readNumbers = defineSkill({
  id: 'read-numbers',
  name: 'Read Numerals',
  blurb: 'Read numerals to 999',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [10, 99],
      2: [20, 199],
      3: [50, 399],
      4: [100, 699],
      5: [100, 999],
    })
    const value = constrain(
      () => rng.int(min, max),
      (candidate) => candidate % 10 !== Math.floor((candidate % 100) / 10),
    )
    const dropped = value < 100 ? value % 10 : value % 100
    const words = numberWords(value)

    return {
      prompt: 'Write this number in digits.',
      display: {
        kind: 'inline',
        text: words,
        wholeNumber: { values: [value], operation: 'read' },
      },
      answer: intAnswer(value),
      misconceptions: [
        {
          value: swapLastDigits(value),
          tag: 'swapped-last-digits',
          nudge: 'The last two places traded positions; read them left to right.',
        },
        {
          value: dropped,
          tag: 'dropped-leading-place',
          nudge: 'The place at the front is part of the number too.',
        },
      ],
      hint: 'Read each place from left to right, then enter the digits.',
      solution: [
        { text: 'Start with the leftmost place.' },
        { text: `Read the whole number: ${words}.` },
        { text: `Write it as ${value}.` },
      ],
    }
  },
})

const placeValueTens = defineSkill({
  id: 'place-value-tens',
  name: 'Tens Digit',
  blurb: 'Name the tens digit',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [10, 99],
      2: [20, 199],
      3: [100, 499],
      4: [100, 799],
      5: [100, 999],
    })
    const value = constrain(
      () => rng.int(min, max),
      (candidate) => {
        const ones = candidate % 10
        const tens = Math.floor(candidate / 10) % 10
        const hundreds = Math.floor(candidate / 100)
        return ones !== tens && (tens !== 0 || hundreds !== ones)
      },
    )
    const ones = value % 10
    const tens = Math.floor(value / 10) % 10
    const hundreds = Math.floor(value / 100)

    return {
      prompt: 'Which digit is in the tens place?',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'tens-digit' },
      },
      answer: intAnswer(tens),
      misconceptions: [
        {
          value: ones,
          tag: 'ones-digit',
          nudge: 'That is the ones digit; move one place left for tens.',
        },
        tens === 0
          ? {
              value: hundreds,
              tag: 'hundreds-digit',
              nudge: 'That is the hundreds digit; the middle digit is zero.',
            }
          : {
              value: tens * 10,
              tag: 'whole-tens',
              nudge: `That is ${tens} ${tens === 1 ? 'ten' : 'tens'} as a value; enter the digit ${tens}.`,
            },
      ],
      hint: 'The tens digit is second from the right.',
      solution: [
        { text: 'Find the second digit from the right.' },
        { text: `That digit is ${tens}.` },
      ],
    }
  },
})

const placeValueHundreds = defineSkill({
  id: 'place-value-hundreds',
  name: 'Hundreds Digit',
  blurb: 'Name the hundreds digit',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [100, 299],
      2: [100, 499],
      3: [200, 699],
      4: [300, 899],
      5: [400, 999],
    })
    const value = constrain(
      () => rng.int(min, max),
      (candidate) => Math.floor(candidate / 100) !== Math.floor(candidate / 10) % 10,
    )
    const hundreds = Math.floor(value / 100)
    const tens = Math.floor(value / 10) % 10

    return {
      prompt: 'Which digit is in the hundreds place?',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'hundreds-digit' },
      },
      answer: intAnswer(hundreds),
      misconceptions: [
        {
          value: tens,
          tag: 'tens-digit',
          nudge: 'That is the tens digit; move one more place left.',
        },
        {
          value: hundreds * 100,
          tag: 'whole-hundreds',
          nudge: `That is ${hundreds} ${hundreds === 1 ? 'hundred' : 'hundreds'} as a value; enter the digit ${hundreds}.`,
        },
      ],
      hint: 'The hundreds digit is third from the right.',
      solution: [
        { text: 'Find the third digit from the right.' },
        { text: `That digit is ${hundreds}.` },
      ],
    }
  },
})

export function expandedForm(value: number): string {
  const parts = [
    Math.floor(value / 100) * 100,
    (Math.floor(value / 10) % 10) * 10,
    value % 10,
  ]
  return parts.filter((part) => part !== 0).join(' + ')
}

const expandedFormSkill = defineSkill({
  id: 'expanded-form',
  name: 'Expanded Form',
  blurb: '347 = 300 + 40 + 7',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [100, 299],
      2: [100, 499],
      3: [200, 699],
      4: [300, 899],
      5: [400, 999],
    })
    const value = rng.int(min, max)
    const hundreds = Math.floor(value / 100)
    const tens = Math.floor(value / 10) % 10
    const ones = value % 10
    const expression = expandedForm(value)

    return {
      prompt: 'Write this as one number.',
      display: {
        kind: 'inline',
        text: expression,
        wholeNumber: { values: [value], operation: 'expanded-form' },
      },
      answer: intAnswer(value),
      misconceptions: [
        {
          value: hundreds + tens + ones,
          tag: 'plain-digit-sum',
          nudge: 'Each digit has a place value, not just its face value.',
        },
        {
          value: tens === 0 ? ones : hundreds * 100 + ones,
          tag: 'omitted-place',
          nudge: 'One nonzero place value was left out of the total.',
        },
      ],
      hint: 'Add the hundreds, tens, and ones values shown.',
      solution: [
        { text: 'Combine the nonzero place values.' },
        { text: `${expression} equals ${value}.` },
      ],
    }
  },
})

const compareNumbers = defineSkill({
  id: 'compare-numbers',
  name: 'Compare Numbers',
  blurb: 'Use <, >, and =',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [0, 99],
      2: [10, 199],
      3: [50, 399],
      4: [100, 699],
      5: [100, 999],
    })
    const left = rng.int(min, max)
    const right = rng.bool(0.2) ? left : rng.intExcept(min, max, [left])
    const relation = left < right ? -1 : left > right ? 1 : 0
    const symbol = relation < 0 ? '<' : relation > 0 ? '>' : '='
    const choices = rng.shuffle([
      { id: '-1', label: '<' },
      { id: '0', label: '=' },
      { id: '1', label: '>' },
    ])

    return {
      prompt: 'Choose the symbol that makes this true.',
      display: {
        kind: 'inline',
        text: `${left} ? ${right}`,
        wholeNumber: { values: [left, right], operation: 'compare' },
      },
      answer: { kind: 'choice', id: String(relation) },
      inputMode: 'choice',
      choices,
      misconceptions:
        relation === 0
          ? [
              {
                value: -1,
                tag: 'called-less',
                nudge: 'Both sides show the same number, so neither is smaller.',
              },
              {
                value: 1,
                tag: 'called-greater',
                nudge: 'Both sides show the same number, so neither is larger.',
              },
            ]
          : [
              {
                value: -relation,
                tag: 'reversed-comparison',
                nudge: 'The open side points toward the larger number.',
              },
              {
                value: 0,
                tag: 'called-equal',
                nudge: 'The numbers differ, so the equal sign does not fit.',
              },
            ],
      hint: 'Compare the hundreds first, then tens, then ones.',
      solution: [
        { text: `Compare ${left} with ${right}.` },
        { text: `${left} ${symbol} ${right}.` },
      ],
    }
  },
})

const orderNumbers = defineSkill({
  id: 'order-numbers',
  name: 'Order Numbers',
  blurb: 'Order three numbers',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [0, 99],
      2: [10, 199],
      3: [50, 399],
      4: [100, 699],
      5: [100, 999],
    })
    const first = rng.int(min, max)
    const second = rng.intExcept(min, max, [first])
    const third = rng.intExcept(min, max, [first, second])
    const values = [first, second, third]
    const ascending = [...values].sort((a, b) => a - b)
    const descending = [...ascending].reverse()
    const swapped = [ascending[0], ascending[2], ascending[1]]
    const label = (items: number[]) => items.join(', ')
    const choices = rng.shuffle([
      { id: '0', label: label(ascending) },
      { id: '1', label: label(descending) },
      { id: '2', label: label(swapped) },
    ])

    return {
      prompt: 'Choose the numbers in ascending order.',
      display: {
        kind: 'inline',
        text: label(values),
        wholeNumber: { values, operation: 'order-ascending' },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices,
      misconceptions: [
        {
          value: 1,
          tag: 'descending-order',
          nudge: 'That order runs largest to smallest; ascending starts smallest.',
        },
        {
          value: 2,
          tag: 'last-two-swapped',
          nudge: 'The last two values need to trade places.',
        },
      ],
      hint: 'Find the smallest value first, then compare the other two.',
      solution: [
        { text: `The smallest value is ${ascending[0]}.` },
        { text: `Next comes ${ascending[1]}, then ${ascending[2]}.` },
      ],
    }
  },
})

const roundTo10 = defineSkill({
  id: 'round-to-10',
  name: 'Round to Ten',
  blurb: 'Round to the nearest ten',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [11, 99],
      2: [21, 199],
      3: [51, 399],
      4: [101, 699],
      5: [101, 999],
    })
    const value = constrain(
      () => rng.int(min, max),
      (candidate) => candidate % 10 !== 0,
    )
    const lower = Math.floor(value / 10) * 10
    const upper = lower + 10
    const rounded = Math.round(value / 10) * 10
    const remainder = value % 10

    return {
      prompt: 'Round to the nearest ten.',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'round-to-10' },
      },
      answer: intAnswer(rounded),
      misconceptions: [
        {
          value: lower,
          tag: 'rounded-down',
          nudge:
            remainder === 5
              ? 'A final 5 is the midpoint, so round up.'
              : 'The ones digit is above 5, so the nearest ten is higher.',
        },
        {
          value: upper,
          tag: 'rounded-up',
          nudge: 'The ones digit is below 5, so the nearest ten is lower.',
        },
        {
          value,
          tag: 'not-rounded',
          nudge: 'Replace the ones digit after choosing the nearest ten.',
        },
      ],
      hint: 'Use the ones digit: 5 or more rounds up.',
      solution: [
        { text: `The ones digit is ${remainder}.` },
        { text: `${value} rounds to ${rounded}.` },
      ],
    }
  },
})

const roundTo100 = defineSkill({
  id: 'round-to-100',
  name: 'Round to Hundred',
  blurb: 'Round to the nearest hundred',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [105, 299],
      2: [105, 499],
      3: [205, 699],
      4: [305, 899],
      5: [405, 999],
    })
    const value = constrain(
      () => rng.int(min, max),
      (candidate) => {
        const lower = Math.floor(candidate / 100) * 100
        const nearestTen = Math.round(candidate / 10) * 10
        return nearestTen !== lower && nearestTen !== lower + 100
      },
    )
    const lower = Math.floor(value / 100) * 100
    const upper = lower + 100
    const nearestTen = Math.round(value / 10) * 10
    const rounded = Math.round(value / 100) * 100
    const remainder = value % 100

    return {
      prompt: 'Round to the nearest hundred.',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'round-to-100' },
      },
      answer: intAnswer(rounded),
      misconceptions: [
        {
          value: lower,
          tag: 'rounded-down',
          nudge:
            remainder === 50
              ? 'The final two digits are 50, so this midpoint rounds up.'
              : 'The final two digits exceed 50, so the higher hundred is nearer.',
        },
        {
          value: upper,
          tag: 'rounded-up',
          nudge: 'The final two digits are below 50, so round down.',
        },
        {
          value: nearestTen,
          tag: 'rounded-only-to-tens',
          nudge: 'That reaches the nearest ten; round once more to hundreds.',
        },
      ],
      hint: 'Use the final two digits: 50 or more rounds up.',
      solution: [
        { text: `The final two digits are ${remainder}.` },
        { text: `${value} rounds to ${rounded}.` },
      ],
    }
  },
})

/**
 * Curriculum order, which is the order the cards render and therefore the order
 * they open in. The unit's id, name and colour are not repeated here: the
 * manifest declares the first two and `course` derives the tree from it.
 */
export const unit00: SkillGenerator[] = [
  readNumbers,
  placeValueTens,
  placeValueHundreds,
  expandedFormSkill,
  compareNumbers,
  orderNumbers,
  roundTo10,
  roundTo100,
]
