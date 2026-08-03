import type { Frame } from '../engine'

/** Fixed adult-situation frames for equal-group multiplication stories. */
const steps = (a: number, b: number, answer: number, closing: string) => [
  { text: 'Pick out the number of groups and the amount in each.', detail: `${a} groups of ${b}` },
  { text: 'Multiply the two numbers.', detail: `${a} × ${b} = ${answer}` },
  { text: closing },
]

export const MULTIPLICATION_FRAMES: Frame[] = [
  {
    id: 'shelving',
    operator: '×',
    prompt: 'How many books did Mira shelve?',
    text: ({ a, b, distractor }) =>
      `Mira fills ${a} shelves with ${b} books on each. Another cart holds ${distractor} books. How many books did Mira shelve?`,
    hint: ({ a, b }) => `Multiply ${a} shelves by ${b} books on each.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The cart's ${distractor} books are separate.`),
    nudges: {
      wrongOperation: () => 'That adds one shelf count to one shelf size; every shelf is filled.',
      distractorPair: ({ distractor }) => `That uses the cart's ${distractor} books, not each shelf.`,
      answeredPart: ({ b }) => `That counts shelves only. Each shelf holds ${b} books.`,
    },
  },
  {
    id: 'invoices',
    operator: '×',
    prompt: 'How many invoices were checked?',
    text: ({ a, b, distractor }) =>
      `A team checks ${a} batches of ${b} invoices. Another ${distractor} need approval. How many invoices were checked?`,
    hint: ({ a, b }) => `Multiply ${a} batches by ${b} invoices per batch.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} awaiting approval were not checked.`),
    nudges: {
      wrongOperation: () => 'That adds a batch count to its size; every batch has invoices.',
      distractorPair: ({ distractor }) => `The ${distractor} awaiting approval are not in each batch.`,
      answeredPart: ({ b }) => `That is the batch count only. Each batch has ${b} invoices.`,
    },
  },
  {
    id: 'commute',
    operator: '×',
    prompt: 'How many trips were made?',
    text: ({ a, b, distractor }) =>
      `A commuter makes ${b} train trips each week for ${a} weeks. They work remotely ${distractor} days. How many train trips were made?`,
    hint: ({ a, b }) => `Multiply ${a} weeks by ${b} trips each week.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} remote days add no train trips.`),
    nudges: {
      wrongOperation: () => 'That combines weeks and trips once; the trips repeat every week.',
      distractorPair: ({ distractor }) => `Remote days, ${distractor}, do not replace the weekly trip count.`,
      answeredPart: ({ b }) => `That is the number of weeks. Each has ${b} trips.`,
    },
  },
  {
    id: 'warehouse',
    operator: '×',
    prompt: 'How many crates were loaded?',
    text: ({ a, b, distractor }) =>
      `A warehouse loads ${a} pallets with ${b} crates on each. Another ${distractor} crates stay behind. How many crates were loaded?`,
    hint: ({ a, b }) => `Multiply ${a} pallets by ${b} crates on each.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} left behind were not loaded.`),
    nudges: {
      wrongOperation: () => 'That adds pallets to crates; each pallet carries a full group.',
      distractorPair: ({ distractor }) => `The ${distractor} stayed behind, not on every pallet.`,
      answeredPart: ({ b }) => `That counts pallets only. Each one has ${b} crates.`,
    },
  },
  {
    id: 'reading',
    operator: '×',
    prompt: 'How many pages did Sam read?',
    text: ({ a, b, distractor }) =>
      `Sam reads ${b} pages each evening for ${a} evenings. Another book has ${distractor} pages marked. How many pages did Sam read?`,
    hint: ({ a, b }) => `Multiply ${a} evenings by ${b} pages each evening.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The other book's ${distractor} marked pages are separate.`),
    nudges: {
      wrongOperation: () => 'That adds evenings to pages once; the reading repeats each evening.',
      distractorPair: ({ distractor }) => `The ${distractor} marked pages are in another book.`,
      answeredPart: ({ b }) => `That counts evenings only. Each evening adds ${b} pages.`,
    },
  },
  {
    id: 'cinema',
    operator: '×',
    prompt: 'How many tickets were sold?',
    text: ({ a, b, distractor }) =>
      `A cinema fills ${a} rows with ${b} ticket holders in each. Another screen sells ${distractor} tickets. How many tickets filled these rows?`,
    hint: ({ a, b }) => `Multiply ${a} rows by ${b} ticket holders in each.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The other screen's ${distractor} tickets are separate.`),
    nudges: {
      wrongOperation: () => 'That adds rows to one row size; every row is filled.',
      distractorPair: ({ distractor }) => `The other screen sold the ${distractor} tickets.`,
      answeredPart: ({ b }) => `That counts rows only. Each row has ${b} people.`,
    },
  },
  {
    id: 'calls',
    operator: '×',
    prompt: 'How many calls were completed?',
    text: ({ a, b, distractor }) =>
      `A support worker completes ${b} calls daily for ${a} days. Another ${distractor} calls are missed. How many calls were completed?`,
    hint: ({ a, b }) => `Multiply ${a} days by ${b} completed calls each day.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The ${distractor} missed calls were not completed.`),
    nudges: {
      wrongOperation: () => 'That adds days to calls once; the calls repeat each day.',
      distractorPair: ({ distractor }) => `The ${distractor} calls were missed, not completed daily.`,
      answeredPart: ({ b }) => `That counts days only. Each day has ${b} completed calls.`,
    },
  },
  {
    id: 'garden',
    operator: '×',
    prompt: 'How many plants are in the beds?',
    text: ({ a, b, distractor }) =>
      `A garden has ${a} beds with ${b} plants in each. The greenhouse holds ${distractor} plants. How many plants are in the beds?`,
    hint: ({ a, b }) => `Multiply ${a} beds by ${b} plants in each.`,
    solution: ({ a, b, distractor }, answer) =>
      steps(a, b, answer, `The greenhouse's ${distractor} plants are elsewhere.`),
    nudges: {
      wrongOperation: () => 'That adds beds to one bed size; every bed has plants.',
      distractorPair: ({ distractor }) => `The ${distractor} plants are in the greenhouse.`,
      answeredPart: ({ b }) => `That counts beds only. Each bed holds ${b} plants.`,
    },
  },
]
