import type { Frame } from '../engine'

/**
 * Subtraction word problems, as fixed frames.
 *
 * The addition bank's rules, on the other operation: every frame mentions three
 * quantities and asks about two, because picking up the wrong number is how word
 * problems are actually got wrong.
 *
 * Subtraction adds a constraint addition does not have — the two quantities have
 * an order, and reversing them is not merely wrong but nonsensical. So each frame
 * names which is the whole and which comes off it in the sentence itself, rather
 * than leaving the learner to infer it from which number is bigger.
 *
 * Familiar situations on purpose. The stories should feel useful and respectful, not
 * like they are talking down to the learner.
 */

/** Shared shape: name the two that matter, take one from the other, say what is left. */
const steps = (a: number, b: number, answer: number, closing: string) => [
  { text: 'Pick out the two numbers the question asks about.', detail: `${a} and ${b}` },
  { text: 'Take the second from the first.', detail: `${a} − ${b} = ${answer}` },
  { text: closing },
]

export const SUBTRACTION_FRAMES: Frame[] = [
  {
    id: 'shelving',
    operator: '−',
    prompt: 'How many are left to shelve?',
    text: ({ a, b, distractor }) =>
      `Mira has ${a} books to shelve and gets through ${b} before lunch. A colleague shelves ${distractor} elsewhere. How many of Mira's are left?`,
    hint: ({ a, b }) => `Take the ${b} done from the ${a} she started with.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The colleague's ${distractor} were not Mira's.`),
    nudges: {
      wrongOperation: () => 'That adds the two together. The books done came off the pile.',
      distractorPair: ({ distractor }) => `That takes off the ${distractor} someone else did.`,
      answeredPart: ({ b }) => `That is the whole pile. She has already done ${b}.`,
    },
  },
  {
    id: 'inbox',
    operator: '−',
    prompt: 'How many are still waiting?',
    text: ({ a, b, distractor }) =>
      `You start the day with ${a} emails and clear ${b} of them. Another ${distractor} arrive overnight. How many are still waiting?`,
    hint: ({ a, b }) => `Take the ${b} you cleared off the ${a} you started with.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} overnight arrive after the question.`),
    nudges: {
      wrongOperation: () => 'That adds them together. Clearing an email takes it off the pile.',
      distractorPair: ({ distractor }) => `The ${distractor} arrived later, and were not cleared.`,
      answeredPart: ({ b }) => `That is where you started. You cleared ${b} of them.`,
    },
  },
  {
    id: 'walk',
    operator: '−',
    prompt: 'How many steps are left?',
    text: ({ a, b, distractor }) =>
      `The walk to the station is ${a} steps and you have taken ${b}. A shortcut would have saved ${distractor}. How many steps are left?`,
    hint: ({ a, b }) => `Take the ${b} already walked off the ${a} in total.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The shortcut was not taken, so ${distractor} does not come off.`),
    nudges: {
      wrongOperation: () => 'That adds the walk to itself. Steps taken come off the total.',
      distractorPair: ({ distractor }) => `The ${distractor} is a shortcut nobody took.`,
      answeredPart: ({ b }) => `That is the whole walk. You have already done ${b}.`,
    },
  },
  {
    id: 'crates',
    operator: '−',
    prompt: 'How many crates are still on the van?',
    text: ({ a, b, distractor }) =>
      `A van sets out with ${a} crates and unloads ${b} at the depot. A second van carries ${distractor}. How many are still on the first van?`,
    hint: ({ a, b }) => `Take the ${b} unloaded off the ${a} it set out with.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The second van's ${distractor} are on a different van.`),
    nudges: {
      wrongOperation: () => 'That adds the loads together. Unloading takes crates off.',
      distractorPair: ({ distractor }) => `The ${distractor} belong to the second van.`,
      answeredPart: ({ b }) => `That is the full load. ${b} came off at the depot.`,
    },
  },
  {
    id: 'pages',
    operator: '−',
    prompt: 'How many pages are left?',
    text: ({ a, b, distractor }) =>
      `Sam's book runs to ${a} pages and he has read ${b}. A second book runs to ${distractor}. How many pages of the first are left?`,
    hint: ({ a, b }) => `Take the ${b} read off the ${a} in the book.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} belong to a book he has not opened.`),
    nudges: {
      wrongOperation: () => 'That adds the two numbers. Pages read come off the total.',
      distractorPair: ({ distractor }) => `The ${distractor} are the second book.`,
      answeredPart: ({ b }) => `That is the whole book. Sam has read ${b} of it.`,
    },
  },
  {
    id: 'tickets',
    operator: '−',
    prompt: 'How many seats are empty?',
    text: ({ a, b, distractor }) =>
      `A screen holds ${a} seats and ${b} tickets are sold. A larger screen holds ${distractor}. How many seats are empty?`,
    hint: ({ a, b }) => `Take the ${b} sold off the ${a} seats there are.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} describe a different screen.`),
    nudges: {
      wrongOperation: () => 'That adds seats to tickets. A ticket sold fills a seat.',
      distractorPair: ({ distractor }) => `The ${distractor} are the larger screen.`,
      answeredPart: ({ b }) => `That is every seat. ${b} of them were sold.`,
    },
  },
  {
    id: 'calls',
    operator: '−',
    prompt: 'How many minutes are left?',
    text: ({ a, b, distractor }) =>
      `A call is booked for ${a} minutes and has run ${b} so far. The meeting before it ran ${distractor}. How many minutes are left?`,
    hint: ({ a, b }) => `Take the ${b} used off the ${a} booked.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} minute meeting was not this call.`),
    nudges: {
      wrongOperation: () => 'That adds the two times. Minutes used come off the booking.',
      distractorPair: ({ distractor }) => `The ${distractor} minutes were the meeting.`,
      answeredPart: ({ b }) => `That is the whole booking. ${b} minutes have gone.`,
    },
  },
  {
    id: 'market',
    operator: '−',
    prompt: 'How many jars are left?',
    text: ({ a, b, distractor }) =>
      `A stall brings ${a} jars and sells ${b} of them. A neighbouring stall brings ${distractor}. How many of the first stall's jars are left?`,
    hint: ({ a, b }) => `Take the ${b} sold off the ${a} brought.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} are the neighbour's, not this stall's.`),
    nudges: {
      wrongOperation: () => 'That adds them together. A jar sold leaves the stall.',
      distractorPair: ({ distractor }) => `The ${distractor} belong to the next stall.`,
      answeredPart: ({ b }) => `That is everything brought. ${b} of them sold.`,
    },
  },
  {
    id: 'driving',
    operator: '−',
    prompt: 'How many miles are left?',
    text: ({ a, b, distractor }) =>
      `A route is ${a} miles and a driver has covered ${b}. A sign on the way read ${distractor} miles. How many miles are left?`,
    hint: ({ a, b }) => `Take the ${b} covered off the ${a} in the route.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The sign's ${distractor} is not what is left to drive.`),
    nudges: {
      wrongOperation: () => 'That adds the two distances. Miles driven come off the route.',
      distractorPair: ({ distractor }) => `The ${distractor} was a sign, not a distance left.`,
      answeredPart: ({ b }) => `That is the whole route. ${b} of it is behind them.`,
    },
  },
  {
    id: 'garden',
    operator: '−',
    prompt: 'How many plants still need water?',
    text: ({ a, b, distractor }) =>
      `A garden has ${a} plants and ${b} have been watered. Another ${distractor} are in the greenhouse. How many in the garden still need water?`,
    hint: ({ a, b }) => `Take the ${b} watered off the ${a} in the garden.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The greenhouse's ${distractor} are not in the garden.`),
    nudges: {
      wrongOperation: () => 'That adds them together. A plant watered comes off the list.',
      distractorPair: ({ distractor }) => `The ${distractor} are in the greenhouse.`,
      answeredPart: ({ b }) => `That is every plant. ${b} have been done.`,
    },
  },
]
