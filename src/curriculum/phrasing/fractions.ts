import { format, rational } from '../../lib/rational'
import type { Frame } from '../engine'

/** Fixed adult-situation frames for reading a part as a fraction of its whole. */
const steps = (part: number, whole: number, closing: string) => [
  { text: 'Identify the named part and the whole.', detail: `${part} out of ${whole}` },
  {
    text: 'Write the part over the whole, then reduce.',
    detail: `${part}/${whole} = ${format(rational(part, whole))}`,
  },
  { text: closing },
]

const nudges = (partName: string, wholeName: string) => ({
  wrongOperation: () => `That multiplies the counts. A fraction compares ${partName} with ${wholeName}.`,
  distractorPair: ({ distractor }: { distractor: number }) =>
    `The ${distractor} belongs to a separate count, not this whole.`,
  answeredPart: ({ b }: { b: number }) => `That is the part count. Write it over the whole of ${b}.`,
})

const agreement = (count: number) => (count === 1 ? 'is' : 'are')

const counted = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`

export const FRACTION_FRAMES: Frame[] = [
  {
    id: 'project-tasks',
    operator: '÷',
    prompt: 'What fraction of the tasks are complete?',
    text: ({ a, b, distractor }) =>
      `A project has ${b} tasks, and ${a} ${agreement(a)} complete. Another project has ${distractor}. What fraction are complete?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'complete task')} over all ${b} tasks.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The other project's ${distractor} is separate.`),
    nudges: nudges('completed tasks', 'all project tasks'),
  },
  {
    id: 'overdue-invoices',
    operator: '÷',
    prompt: 'What fraction of the invoices are overdue?',
    text: ({ a, b, distractor }) =>
      `An office tracks ${b} invoices, and ${a} ${agreement(a)} overdue. Another team tracks ${distractor}. What fraction are overdue?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'overdue invoice')} over all ${b} invoices.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The other team's ${distractor} is separate.`),
    nudges: nudges('overdue invoices', 'all tracked invoices'),
  },
  {
    id: 'occupied-desks',
    operator: '÷',
    prompt: 'What fraction of the desks are occupied?',
    text: ({ a, b, distractor }) =>
      `A floor has ${b} desks, and ${a} ${agreement(a)} occupied. Another floor has ${distractor}. What fraction are occupied?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'occupied desk')} over all ${b} desks.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The other floor's ${distractor} is separate.`),
    nudges: nudges('occupied desks', 'all desks'),
  },
  {
    id: 'completed-modules',
    operator: '÷',
    prompt: 'What fraction of the modules are complete?',
    text: ({ a, b, distractor }) =>
      `A course has ${b} modules, and ${a} ${agreement(a)} complete. A later course has ${distractor}. What fraction are complete?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'completed module')} over all ${b} modules.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The later course's ${distractor} is separate.`),
    nudges: nudges('completed modules', 'all course modules'),
  },
  {
    id: 'restocked-shelves',
    operator: '÷',
    prompt: 'What fraction of the shelves are restocked?',
    text: ({ a, b, distractor }) =>
      `A stockroom has ${b} shelves, and ${a} ${agreement(a)} restocked. A second room has ${distractor}. What fraction are restocked?`,
    hint: ({ a, b }) =>
      `Write the ${counted(a, 'restocked shelf', 'restocked shelves')} over all ${b} shelves.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The second room's ${distractor} is separate.`),
    nudges: nudges('restocked shelves', 'all stockroom shelves'),
  },
  {
    id: 'approved-applications',
    operator: '÷',
    prompt: 'What fraction of the applications are approved?',
    text: ({ a, b, distractor }) =>
      `A team reviews ${b} applications, and ${a} ${agreement(a)} approved. Another team reviews ${distractor}. What fraction are approved?`,
    hint: ({ a, b }) =>
      `Write the ${counted(a, 'approved application')} over all ${b} applications.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The other team's ${distractor} is separate.`),
    nudges: nudges('approved applications', 'all reviewed applications'),
  },
  {
    id: 'inspected-tools',
    operator: '÷',
    prompt: 'What fraction of the tools are inspected?',
    text: ({ a, b, distractor }) =>
      `A workshop has ${b} tools, and ${a} ${agreement(a)} inspected. A nearby shop has ${distractor}. What fraction are inspected?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'inspected tool')} over all ${b} tools.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The nearby shop's ${distractor} is separate.`),
    nudges: nudges('inspected tools', 'all workshop tools'),
  },
  {
    id: 'planted-beds',
    operator: '÷',
    prompt: 'What fraction of the beds are planted?',
    text: ({ a, b, distractor }) =>
      `A garden has ${b} beds, and ${a} ${agreement(a)} planted. A greenhouse has ${distractor}. What fraction are planted?`,
    hint: ({ a, b }) => `Write the ${counted(a, 'planted bed')} over all ${b} garden beds.`,
    solution: ({ a, b, distractor }) => steps(a, b, `The greenhouse's ${distractor} is separate.`),
    nudges: nudges('planted beds', 'all garden beds'),
  },
]
