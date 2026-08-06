import type { Frame } from '../engine'

/**
 * Division word problems, as fixed frames.
 *
 * The same rules as the other three banks: three quantities mentioned, two used,
 * adult situations, and prose fixed in source so every sentence a learner sees
 * has been read by a person first.
 *
 * Division carries a constraint the others do not. Its predicted wrong-pair
 * value is `a ÷ distractor`, so a sentence whose distractor does not divide the
 * total predicts a fraction — a diagnosis nothing typed on a whole-number pad can
 * ever match, and one that would sit in the bank looking like coverage. The draw
 * in `div-words` composes the total from both, and `CHECK_QUANTITIES` declares
 * sets with the same property.
 *
 * Every frame also names which quantity is the whole and which is the number of
 * groups, for the reason subtraction names its order: reversing them is not
 * merely wrong, it is a different question.
 */

/** Shared shape: name the total and the groups, divide, say what one group holds. */
const steps = (a: number, b: number, answer: number, closing: string) => [
  { text: 'Find the total and how many equal groups.', detail: `${a} split into ${b}` },
  { text: 'Divide the total by the groups.', detail: `${a} ÷ ${b} = ${answer}` },
  { text: closing },
]

export const DIVISION_FRAMES: Frame[] = [
  {
    id: 'shifts',
    operator: '÷',
    prompt: 'How many hours does each shift cover?',
    text: ({ a, b, distractor }) =>
      `A rota spreads ${a} hours evenly over ${b} shifts. A second site runs ${distractor} shifts. How many hours does each shift cover?`,
    hint: ({ a, b }) => `Divide the ${a} hours between the ${b} shifts.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The other site's ${distractor} shifts are not on this rota.`),
    nudges: {
      wrongOperation: () => 'That multiplies the two. The hours are being split, not repeated.',
      distractorPair: ({ distractor }) => `That divides by the second site's ${distractor} shifts.`,
      answeredPart: ({ a }) => `That is all ${a} hours, not what one shift covers.`,
    },
  },
  {
    id: 'vans',
    operator: '÷',
    prompt: 'How many parcels go in each van?',
    text: ({ a, b, distractor }) =>
      `A depot loads ${a} parcels equally into ${b} vans. Another ${distractor} vans are off the road. How many parcels go in each van?`,
    hint: ({ b }) => `Share the parcels equally between the ${b} loaded vans.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`The ${distractor} off-road vans carry nothing.`),
    nudges: {
      wrongOperation: () => 'That multiplies. One load is being shared out, not repeated.',
      distractorPair: ({ distractor }) => `The ${distractor} off-road vans are not carrying parcels.`,
      answeredPart: ({ a }) => `That is the whole load of ${a}, not one van's share.`,
    },
  },
  {
    id: 'seating',
    operator: '÷',
    prompt: 'How many chairs go at each table?',
    text: ({ a, b, distractor }) =>
      `A venue sets ${a} chairs evenly around ${b} tables. A store room holds ${distractor} more. How many chairs go at each table?`,
    hint: ({ b }) => `Split the chairs evenly across the ${b} tables.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`The ${distractor} in the store room stay there.`),
    nudges: {
      wrongOperation: () => 'That multiplies. The chairs are being spread out, not stacked up.',
      distractorPair: ({ distractor }) => `The ${distractor} in storage are not tables to set.`,
      answeredPart: ({ a }) => `That counts every chair. Each table takes a share of ${a}.`,
    },
  },
  {
    id: 'training',
    operator: '÷',
    prompt: 'How many people attend each session?',
    text: ({ a, b, distractor }) =>
      `A course places ${a} people evenly across ${b} sessions. Another ${distractor} sessions run next month. How many people attend each session?`,
    hint: ({ a, b }) => `Divide the ${a} people between this month's ${b} sessions.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`Next month's ${distractor} sessions are separate.`),
    nudges: {
      wrongOperation: () => 'That multiplies. One group of people is being divided up.',
      distractorPair: ({ distractor }) => `That uses next month's ${distractor} sessions instead.`,
      answeredPart: ({ a }) => `That is everyone enrolled, not one session's ${a} divided.`,
    },
  },
  {
    id: 'stock',
    operator: '÷',
    prompt: 'How many units sit on each shelf?',
    text: ({ a, b, distractor }) =>
      `A stockroom spreads ${a} units evenly over ${b} shelves. A pallet still holds ${distractor}. How many units sit on each shelf?`,
    hint: ({ b }) => `Share the shelved units across all ${b} shelves.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`The pallet's ${distractor} units are not shelved yet.`),
    nudges: {
      wrongOperation: () => 'That multiplies. The shelved stock is being divided, not repeated.',
      distractorPair: ({ distractor }) => `The pallet's ${distractor} units are not a shelf count.`,
      answeredPart: ({ a }) => `That is all ${a} shelved units, not one shelf's share.`,
    },
  },
  {
    id: 'mileage',
    operator: '÷',
    prompt: 'How many miles were driven each day?',
    text: ({ a, b, distractor }) =>
      `A driver covers ${a} miles evenly across ${b} days. They also had ${distractor} days off. How many miles were driven each day?`,
    hint: ({ b }) => `Divide the total distance by the ${b} driving days.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`No miles were driven on the ${distractor} days off.`),
    nudges: {
      wrongOperation: () => 'That multiplies. One total distance is being split by day.',
      distractorPair: ({ distractor }) => `The ${distractor} days off had no driving in them.`,
      answeredPart: ({ a }) => `That is the whole ${a} miles, not one day of it.`,
    },
  },
  {
    id: 'catering',
    operator: '÷',
    prompt: 'How many portions go on each tray?',
    text: ({ a, b, distractor }) =>
      `A kitchen divides ${a} portions equally between ${b} trays. A cold store keeps ${distractor} back. How many portions go on each tray?`,
    hint: ({ b }) => `Split the plated portions between the ${b} trays.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`The ${distractor} kept back were never plated.`),
    nudges: {
      wrongOperation: () => 'That multiplies. The portions are being shared between trays.',
      distractorPair: ({ distractor }) => `The ${distractor} held back are not a number of trays.`,
      answeredPart: ({ a }) => `That is every portion, not the ${a} divided between trays.`,
    },
  },
  {
    id: 'invoices',
    operator: '÷',
    prompt: 'How many invoices are in each batch?',
    text: ({ a, b, distractor }) =>
      `An office splits ${a} invoices evenly into ${b} batches. Another ${distractor} batches are archived. How many invoices are in each batch?`,
    hint: ({ a, b }) => `Divide the ${a} invoices into ${b} equal batches.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer,`The ${distractor} archived batches are not being split.`),
    nudges: {
      wrongOperation: () => 'That multiplies. One pile of invoices is being divided up.',
      distractorPair: ({ distractor }) => `That uses the ${distractor} archived batches instead.`,
      answeredPart: ({ a }) => `That is the full pile of ${a}, not one batch.`,
    },
  },
]
