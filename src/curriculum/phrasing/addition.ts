import type { Frame } from '../engine'

/**
 * Addition word problems, as fixed frames.
 *
 * Every one mentions three quantities and asks about two. The third is not
 * padding — picking up the wrong number is how word problems are actually got
 * wrong, and a story with nothing to pick up wrongly is an arithmetic problem
 * wearing a sentence.
 *
 * Adult situations on purpose. The learner is an adult restarting, and counting
 * sweets would tell them what we think of them.
 */

/** Shared shape: name the two that matter, add them, say the total. */
const steps = (a: number, b: number, answer: number, closing: string) => [
  { text: 'Pick out the two numbers the question asks about.', detail: `${a} and ${b}` },
  { text: 'Add them together.', detail: `${a} + ${b} = ${answer}` },
  { text: closing },
]

export const ADDITION_FRAMES: Frame[] = [
  {
    id: 'shelving',
    operator: '+',
    prompt: 'How many did Mira shelve?',
    text: ({ a, b, distractor }) =>
      `Mira shelves ${a} books before lunch and ${b} after. Another worker shelves ${distractor}. How many did Mira shelve?`,
    hint: ({ a, b }) => `Only Mira's two numbers count: ${a} and ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The other worker's ${distractor} is not Mira's.`),
    nudges: {
      wrongOperation: () => 'That takes one shift away from the other. Both shifts count.',
      distractorPair: ({ distractor }) => `That uses the ${distractor} someone else shelved.`,
      answeredPart: ({ b }) => `That is only before lunch. There are ${b} more after.`,
    },
  },
  {
    id: 'inbox',
    operator: '+',
    prompt: 'How many did you clear?',
    text: ({ a, b, distractor }) =>
      `You clear ${a} emails in the morning and ${b} in the afternoon. Overnight, ${distractor} more arrive. How many did you clear today?`,
    hint: ({ a, b }) => `Add the ${a} you cleared to the ${b} you cleared.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} that arrived were not cleared.`),
    nudges: {
      wrongOperation: () => 'That is the gap between morning and afternoon, not the total.',
      distractorPair: ({ distractor }) => `The ${distractor} arrived — you did not clear them.`,
      answeredPart: ({ b }) => `That is the morning only. Add the ${b} from the afternoon.`,
    },
  },
  {
    id: 'walk',
    operator: '+',
    prompt: 'How many steps for both walks?',
    text: ({ a, b, distractor }) =>
      `The walk to the station is ${a} steps. The walk back is ${b}. A shortcut would have saved ${distractor}. How many steps for both walks?`,
    hint: ({ a, b }) => `Add the walk there, ${a}, to the walk back, ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The shortcut was not taken, so ${distractor} does not come off.`),
    nudges: {
      wrongOperation: () => 'That is how much longer one walk was. Both walks happened.',
      distractorPair: ({ distractor }) => `The ${distractor} is a shortcut nobody took.`,
      answeredPart: ({ b }) => `That is the walk there. The walk back is ${b} more.`,
    },
  },
  {
    id: 'crates',
    operator: '+',
    prompt: 'How many crates were loaded?',
    text: ({ a, b, distractor }) =>
      `A van loads ${a} crates at the first stop and ${b} at the second. At the depot it unloads ${distractor}. How many crates were loaded?`,
    hint: ({ a, b }) => `Add the two loads, ${a} and ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `Unloading ${distractor} came later and is not asked about.`),
    nudges: {
      wrongOperation: () => 'That compares the two stops. The question wants both together.',
      distractorPair: ({ distractor }) => `The ${distractor} were unloaded, not loaded.`,
      answeredPart: ({ b }) => `That is the first stop only. The second added ${b}.`,
    },
  },
  {
    id: 'pages',
    operator: '+',
    prompt: 'How many pages has Sam read?',
    text: ({ a, b, distractor }) =>
      `Sam reads ${a} pages on Monday and ${b} on Tuesday. There are ${distractor} pages still to go. How many pages has Sam read?`,
    hint: ({ a, b }) => `Add Monday's ${a} to Tuesday's ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} left to go are not read yet.`),
    nudges: {
      wrongOperation: () => 'That is the difference between two days, not the reading done.',
      distractorPair: ({ distractor }) => `The ${distractor} are still ahead of Sam.`,
      answeredPart: ({ b }) => `That is Monday alone. Tuesday added ${b} more.`,
    },
  },
  {
    id: 'tickets',
    operator: '+',
    prompt: 'How many tickets were sold?',
    text: ({ a, b, distractor }) =>
      `A cinema sells ${a} tickets for the early show and ${b} for the late one. ${distractor} seats stay empty. How many tickets were sold?`,
    hint: ({ a, b }) => `Add the early show's ${a} to the late show's ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `Empty seats, ${distractor}, are not tickets.`),
    nudges: {
      wrongOperation: () => 'That is how many more one show sold. Both shows sold tickets.',
      distractorPair: ({ distractor }) => `The ${distractor} are empty seats, not sales.`,
      answeredPart: ({ b }) => `That is the early show. The late one sold ${b}.`,
    },
  },
  {
    id: 'calls',
    operator: '+',
    prompt: 'How long were the calls?',
    text: ({ a, b, distractor }) =>
      `One call lasts ${a} minutes and a second lasts ${b}. A meeting that day ran ${distractor} minutes. How long were the calls?`,
    hint: ({ a, b }) => `Add the two calls, ${a} minutes and ${b} minutes.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} minute meeting was not a call.`),
    nudges: {
      wrongOperation: () => 'That is how much longer one call ran. Both calls count.',
      distractorPair: ({ distractor }) => `The ${distractor} minutes were a meeting.`,
      answeredPart: ({ b }) => `That is the first call. The second ran ${b} minutes.`,
    },
  },
  {
    id: 'market',
    operator: '+',
    prompt: 'How many jars were sold?',
    text: ({ a, b, distractor }) =>
      `A stall sells ${a} jars on Saturday and ${b} on Sunday. ${distractor} jars stay in storage. How many jars were sold?`,
    hint: ({ a, b }) => `Add Saturday's ${a} to Sunday's ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} in storage were never sold.`),
    nudges: {
      wrongOperation: () => 'That is the gap between two days, not the jars sold.',
      distractorPair: ({ distractor }) => `The ${distractor} are still in storage.`,
      answeredPart: ({ b }) => `That is Saturday only. Sunday sold ${b} more.`,
    },
  },
  {
    id: 'driving',
    operator: '+',
    prompt: 'How many miles were driven?',
    text: ({ a, b, distractor }) =>
      `A driver covers ${a} miles before a break and ${b} after. A sign on the route read ${distractor} miles. How many miles were driven?`,
    hint: ({ a, b }) => `Add the ${a} before the break to the ${b} after.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The sign's ${distractor} is not what was driven.`),
    nudges: {
      wrongOperation: () => 'That is the gap between the two stretches, not the whole drive.',
      distractorPair: ({ distractor }) => `The ${distractor} was a sign, not a distance driven.`,
      answeredPart: ({ b }) => `That is before the break. Another ${b} came after.`,
    },
  },
  {
    id: 'garden',
    operator: '+',
    prompt: 'How many plants were watered?',
    text: ({ a, b, distractor }) =>
      `A gardener waters ${a} plants at the front and ${b} at the back. Another ${distractor} need repotting. How many plants were watered?`,
    hint: ({ a, b }) => `Add the front's ${a} to the back's ${b}.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} needing repotting were not watered.`),
    nudges: {
      wrongOperation: () => 'That compares front and back. Both were watered.',
      distractorPair: ({ distractor }) => `The ${distractor} need repotting, not watering.`,
      answeredPart: ({ b }) => `That is the front only. The back had ${b} more.`,
    },
  },
]
