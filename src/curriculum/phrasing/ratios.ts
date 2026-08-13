import { rational } from '../../lib/rational'
import type { Misconception, RatioData, SolutionStep } from '../../lib/types'
import type { ProblemSpec } from '../engine'

export type RatioWordData = Extract<RatioData, { operation: 'ratio-word' }>
export type RatioComparison = RatioWordData['comparison']
export type RatioQuantities = Pick<RatioWordData, 'first' | 'second'>

type RatioLabels = {
  first: string
  second: string
  whole: string
}

export type RatioFrame = {
  id: string
  prompt: string
  labels: RatioLabels
  partToPartText(q: RatioQuantities): string
  partToWholeText(q: RatioQuantities): string
}

const total = ({ first, second }: RatioQuantities) => first + second

export const ratioText = (
  frame: RatioFrame,
  q: RatioQuantities,
  comparison: RatioComparison,
) => comparison === 'part-to-part' ? frame.partToPartText(q) : frame.partToWholeText(q)

export const ratioFrame = (frameId: string): RatioFrame => {
  const frame = RATIO_FRAMES.find(({ id }) => id === frameId)
  if (!frame) throw new Error(`unknown ratio frame ${frameId}`)
  return frame
}

export const ratioWordText = (data: RatioWordData): string =>
  ratioText(ratioFrame(data.frameId), data, data.comparison)

type RatioRelationship = {
  denominator: number
  otherDenominator: number
  reversedNumerator: number
  comparedWith: string
}

const relationshipFor = (
  frame: RatioFrame,
  q: RatioQuantities,
  comparison: RatioComparison,
): RatioRelationship => {
  const whole = total(q)
  const partToPart = comparison === 'part-to-part'
  return {
    denominator: partToPart ? q.second : whole,
    otherDenominator: partToPart ? whole : q.second,
    reversedNumerator: partToPart ? q.second : whole,
    comparedWith: partToPart ? frame.labels.second : frame.labels.whole,
  }
}

const ratioMisconceptions = (
  frame: RatioFrame,
  q: RatioQuantities,
  comparison: RatioComparison,
  relationship: RatioRelationship,
): Misconception[] => {
  return [
    {
      value: q.first / relationship.otherDenominator,
      tag: 'confused-part-and-whole',
      nudge: comparison === 'part-to-part'
        ? `Compare ${frame.labels.first} with ${frame.labels.second}, not ${frame.labels.whole}.`
        : `Compare ${frame.labels.first} with ${frame.labels.whole}, not only ${frame.labels.second}.`,
    },
    {
      value: relationship.reversedNumerator / q.first,
      tag: 'reversed-ratio-order',
      nudge: `Keep ${frame.labels.first} first because the question names it first.`,
    },
  ]
}

const solution = (
  frame: RatioFrame,
  q: RatioQuantities,
  relationship: RatioRelationship,
): SolutionStep[] => {
  return [
    {
      text: 'Identify the two quantities being compared.',
      detail: `${frame.labels.first} to ${relationship.comparedWith}`,
    },
    {
      text: 'Write the first quantity over the second.',
      detail: `${q.first}/${relationship.denominator}`,
    },
  ]
}

export function ratioStoryProblem(
  frame: RatioFrame,
  q: RatioQuantities,
  comparison: RatioComparison,
): ProblemSpec {
  const relationship = relationshipFor(frame, q, comparison)
  const data: RatioWordData = { operation: 'ratio-word', frameId: frame.id, ...q, comparison }

  return {
    prompt: frame.prompt,
    display: { kind: 'story', text: ratioText(frame, q, comparison), ratio: data },
    answer: { kind: 'exact', ...rational(q.first, relationship.denominator), requireFraction: true },
    keypad: { allowFraction: true },
    misconceptions: ratioMisconceptions(frame, q, comparison, relationship),
    hint: `Put ${frame.labels.first} over ${relationship.comparedWith}.`,
    solution: solution(frame, q, relationship),
  }
}

export const RATIO_FRAMES: RatioFrame[] = [
  {
    id: 'project-status',
    prompt: 'Write the requested project ratio.',
    labels: { first: 'completed tasks', second: 'open tasks', whole: 'all tasks' },
    partToPartText: ({ first, second }) =>
      `A project has ${first} completed tasks and ${second} open tasks, ${first + second} tasks in all. Write completed to open.`,
    partToWholeText: ({ first, second }) =>
      `A project has ${first} completed tasks and ${second} open tasks, ${first + second} tasks in all. Write completed to all tasks.`,
  },
  {
    id: 'invoice-status',
    prompt: 'Write the requested invoice ratio.',
    labels: { first: 'paid invoices', second: 'unpaid invoices', whole: 'all invoices' },
    partToPartText: ({ first, second }) =>
      `An office has ${first} paid invoices and ${second} unpaid invoices, ${first + second} invoices in all. Write paid to unpaid.`,
    partToWholeText: ({ first, second }) =>
      `An office has ${first} paid invoices and ${second} unpaid invoices, ${first + second} invoices in all. Write paid to all invoices.`,
  },
  {
    id: 'work-schedule',
    prompt: 'Write the requested shift ratio.',
    labels: { first: 'day shifts', second: 'night shifts', whole: 'all shifts' },
    partToPartText: ({ first, second }) =>
      `A schedule has ${first} day shifts and ${second} night shifts, ${first + second} shifts in all. Write day to night.`,
    partToWholeText: ({ first, second }) =>
      `A schedule has ${first} day shifts and ${second} night shifts, ${first + second} shifts in all. Write day to all shifts.`,
  },
  {
    id: 'file-storage',
    prompt: 'Write the requested file ratio.',
    labels: { first: 'digital files', second: 'paper files', whole: 'all files' },
    partToPartText: ({ first, second }) =>
      `An archive has ${first} digital files and ${second} paper files, ${first + second} files in all. Write digital to paper.`,
    partToWholeText: ({ first, second }) =>
      `An archive has ${first} digital files and ${second} paper files, ${first + second} files in all. Write digital to all files.`,
  },
  {
    id: 'warehouse-stock',
    prompt: 'Write the requested stock ratio.',
    labels: { first: 'full pallets', second: 'empty pallets', whole: 'all pallets' },
    partToPartText: ({ first, second }) =>
      `A warehouse has ${first} full pallets and ${second} empty pallets, ${first + second} pallets in all. Write full to empty.`,
    partToWholeText: ({ first, second }) =>
      `A warehouse has ${first} full pallets and ${second} empty pallets, ${first + second} pallets in all. Write full to all pallets.`,
  },
  {
    id: 'training-status',
    prompt: 'Write the requested training ratio.',
    labels: { first: 'trained staff', second: 'untrained staff', whole: 'all staff' },
    partToPartText: ({ first, second }) =>
      `A team has ${first} trained staff and ${second} untrained staff, ${first + second} staff in all. Write trained to untrained.`,
    partToWholeText: ({ first, second }) =>
      `A team has ${first} trained staff and ${second} untrained staff, ${first + second} staff in all. Write trained to all staff.`,
  },
  {
    id: 'delivery-status',
    prompt: 'Write the requested delivery ratio.',
    labels: { first: 'delivered orders', second: 'pending orders', whole: 'all orders' },
    partToPartText: ({ first, second }) =>
      `A route has ${first} delivered orders and ${second} pending orders, ${first + second} orders in all. Write delivered to pending.`,
    partToWholeText: ({ first, second }) =>
      `A route has ${first} delivered orders and ${second} pending orders, ${first + second} orders in all. Write delivered to all orders.`,
  },
  {
    id: 'budget-status',
    prompt: 'Write the requested budget ratio.',
    labels: { first: 'approved requests', second: 'deferred requests', whole: 'all requests' },
    partToPartText: ({ first, second }) =>
      `A budget has ${first} approved requests and ${second} deferred requests, ${first + second} requests in all. Write approved to deferred.`,
    partToWholeText: ({ first, second }) =>
      `A budget has ${first} approved requests and ${second} deferred requests, ${first + second} requests in all. Write approved to all requests.`,
  },
]
