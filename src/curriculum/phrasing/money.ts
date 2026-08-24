import type { Frame } from '../engine'

/**
 * Fixed everyday frames for a price-times-quantity purchase total.
 *
 * `a` is a price in exact integer cents rather than a decimal dollar amount, so
 * the shared engine's plain-number multiplication stays exact — no floating-point
 * drift, the same guarantee `DecimalValue` gives the rest of Unit 9. Frame prose
 * formats it as a dollar string; the carried operand stays cents.
 */
const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`

const steps = (a: number, b: number, answerCents: number, closing: string) => [
  { text: 'Pick out the price and the quantity.', detail: `${dollars(a)} and ${b}` },
  { text: 'Multiply the price by the quantity.', detail: `${dollars(a)} × ${b} = ${dollars(answerCents)}` },
  { text: closing },
]

export const MONEY_FRAMES: Frame[] = [
  {
    id: 'groceries',
    operator: '×',
    prompt: 'How much did the groceries cost?',
    text: ({ a, b, distractor }) =>
      `A bag of rice costs ${dollars(a)}, and you buy ${b} bags. A nearby shelf has ${distractor} bags. How much did the rice cost?`,
    hint: ({ a, b }) => `Multiply the price, ${dollars(a)}, by the quantity, ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The shelf's ${distractor} bags were not bought.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the shelf's ${distractor} bags, not the ${distractor === 1 ? 'one' : 'ones'} bought.`,
      answeredPart: () => 'That is the price of one bag. Multiply by the quantity bought.',
    },
  },
  {
    id: 'coffee',
    operator: '×',
    prompt: 'How much was spent on coffee?',
    text: ({ a, b, distractor }) =>
      `A coffee costs ${dollars(a)}, and you buy one every day for ${b} days. A coworker buys ${distractor}. How much did you spend on coffee?`,
    hint: ({ a, b }) => `Multiply the price, ${dollars(a)}, by the number of days, ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The coworker's ${distractor} coffees are not yours.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the day count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the coworker's ${distractor} coffees, not your days.`,
      answeredPart: () => 'That is the price for one day. Multiply by the number of days.',
    },
  },
  {
    id: 'tickets',
    operator: '×',
    prompt: 'How much did the tickets cost?',
    text: ({ a, b, distractor }) =>
      `A movie ticket costs ${dollars(a)}, and your group buys ${b} of them. The theater has ${distractor} seats free. How much did the tickets cost?`,
    hint: ({ a, b }) => `Multiply the ticket price, ${dollars(a)}, by ${b} tickets.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The theater's ${distractor} free seats were not bought.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the ticket count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the ${distractor} free seats, not the tickets bought.`,
      answeredPart: () => 'That is one ticket. Multiply by how many were bought.',
    },
  },
  {
    id: 'parking',
    operator: '×',
    prompt: 'How much was the parking?',
    text: ({ a, b, distractor }) =>
      `A garage charges ${dollars(a)} per day, and a car parks for ${b} days. A nearby lot charges for ${distractor} days. How much was the parking?`,
    hint: ({ a, b }) => `Multiply the daily rate, ${dollars(a)}, by ${b} days.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The nearby lot's ${distractor} days are a different car.`),
    nudges: {
      wrongOperation: () => 'That adds the rate to the day count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the other lot's ${distractor} days.`,
      answeredPart: () => 'That is the rate for one day. Multiply by the number of days.',
    },
  },
  {
    id: 'snacks',
    operator: '×',
    prompt: 'How much did the snacks cost?',
    text: ({ a, b, distractor }) =>
      `A vending machine snack costs ${dollars(a)}, and the office buys ${b} of them. The machine still holds ${distractor}. How much did the snacks cost?`,
    hint: ({ a, b }) => `Multiply the snack price, ${dollars(a)}, by ${b} snacks.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} still in the machine were not bought.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the snack count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the ${distractor} snacks left in the machine.`,
      answeredPart: () => 'That is one snack. Multiply by how many were bought.',
    },
  },
  {
    id: 'bus-fare',
    operator: '×',
    prompt: 'How much was spent on bus fare?',
    text: ({ a, b, distractor }) =>
      `A bus ride costs ${dollars(a)}, and you ride ${b} times this week. A friend rode ${distractor} times. How much did you spend on fares?`,
    hint: ({ a, b }) => `Multiply the fare, ${dollars(a)}, by ${b} rides.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `Your friend's ${distractor} rides are separate.`),
    nudges: {
      wrongOperation: () => 'That adds the fare to the ride count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses your friend's ${distractor} rides, not yours.`,
      answeredPart: () => 'That is one fare. Multiply by the number of rides.',
    },
  },
  {
    id: 'paper-reams',
    operator: '×',
    prompt: 'How much did the paper cost?',
    text: ({ a, b, distractor }) =>
      `A ream of paper costs ${dollars(a)}, and an office orders ${b} reams. The supply closet already has ${distractor}. How much did the order cost?`,
    hint: ({ a, b }) => `Multiply the price, ${dollars(a)}, by ${b} reams.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The closet's ${distractor} reams were not part of this order.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the ream count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses the closet's ${distractor} reams, not the order.`,
      answeredPart: () => 'That is one ream. Multiply by how many were ordered.',
    },
  },
  {
    id: 'gym-visits',
    operator: '×',
    prompt: 'How much was spent on gym visits?',
    text: ({ a, b, distractor }) =>
      `A drop-in gym visit costs ${dollars(a)}, and you go ${b} times this month. A friend went ${distractor} times. How much did you spend?`,
    hint: ({ a, b }) => `Multiply the visit price, ${dollars(a)}, by ${b} visits.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `Your friend's ${distractor} visits are separate.`),
    nudges: {
      wrongOperation: () => 'That adds the price to the visit count instead of multiplying them.',
      distractorPair: ({ distractor }) => `That uses your friend's ${distractor} visits, not yours.`,
      answeredPart: () => 'That is one visit. Multiply by the number of visits.',
    },
  },
]
