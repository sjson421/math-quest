import { intAnswer } from '../../lib/answer'
import type { EquationData, Misconception } from '../../lib/types'
import type { ProblemSpec } from '../engine'

/**
 * The sentences `equation-words` draws from.
 *
 * A third bank shape, beside the whole-number frames and the ratio frames, and
 * for the same reason ratios needed their own: the existing `Frame` states one
 * operation between two quantities, and an equation word problem states two
 * applied in sequence. `a + b` cannot describe "four to a crate, then eight
 * more".
 *
 * Every frame reads the same underlying equation — `coefficient · x + constant
 * = rightHand`, solved for `x`. The frame owns only the wording; the numbers,
 * the answer and the predicted mistake all belong to the generator, so no
 * sentence here can disagree with the arithmetic it describes.
 */

export type EquationQuantities = {
  /** How many go into each group. */
  coefficient: number
  /** The amount added on top, after the grouping. */
  constant: number
  /** The stated result. */
  rightHand: number
}

export type EquationFrame = {
  id: string
  prompt: string
  text(q: EquationQuantities): string
  hint(q: EquationQuantities): string
}

/** The equation data a frame's sentence describes. */
const equationWordData = (q: EquationQuantities): EquationData => ({
  operation: 'two-step',
  coefficient: q.coefficient,
  constant: q.constant,
  adds: true,
  rightHand: q.rightHand,
})

/**
 * The answer, and the one mistake this skill predicts.
 *
 * Undoing in the wrong order — dividing by the coefficient before taking the
 * constant off — is `two-step`'s wall arriving in prose, and prose invites it
 * harder: a sentence states the steps in the order they are *applied*, so
 * reading it straight through and undoing in that same order is the natural
 * misreading rather than a slip.
 *
 * It is whole only when the coefficient divides the constant, which is why the
 * generator composes the constant as a multiple of it. A fractional prediction
 * would be finite, so nothing filters it, and it would sit here as a diagnosis
 * the whole-number pad can never submit.
 */
const equationWordAnswer = (q: EquationQuantities): number =>
  (q.rightHand - q.constant) / q.coefficient

const equationWordMisconceptions = (q: EquationQuantities): Misconception[] => [
  {
    value: q.rightHand / q.coefficient - q.constant,
    tag: 'undid-in-wrong-order',
    nudge: 'Take the added amount off first, then divide by the group size.',
  },
]

/**
 * The letter the worked steps write.
 *
 * Not taken from the caller: this bank exists for one skill in one unit, and a
 * parameter would imply a reuse that no second consumer has asked for. Unit 14
 * writes `x` throughout.
 */
const VARIABLE = 'x'

export function equationStoryProblem(frame: EquationFrame, q: EquationQuantities): ProblemSpec {
  const answer = equationWordAnswer(q)

  return {
    prompt: frame.prompt,
    display: {
      kind: 'story',
      text: frame.text(q),
      equation: equationWordData(q),
    },
    answer: intAnswer(answer),
    misconceptions: equationWordMisconceptions(q),
    hint: frame.hint(q),
    solution: [
      {
        text: `Take off the ${q.constant} that was added.`,
        detail: `${q.coefficient}${VARIABLE} = ${q.rightHand - q.constant}`,
      },
      {
        text: `Divide by ${q.coefficient}.`,
        detail: `${VARIABLE} = ${answer}`,
      },
    ],
  }
}

export const EQUATION_FRAMES: EquationFrame[] = [
  {
    id: 'crates',
    prompt: 'How many full crates are there?',
    text: (q) =>
      `A shipment packs ${q.coefficient} boxes into every crate, plus ${q.constant} loose boxes. ` +
      `It holds ${q.rightHand} boxes in all.`,
    hint: (q) => `Set the ${q.constant} loose boxes aside, then split the rest into crates.`,
  },
  {
    id: 'shifts',
    prompt: 'How many shifts were worked?',
    text: (q) =>
      `A technician logs ${q.coefficient} hours each shift, plus ${q.constant} hours of training. ` +
      `The timesheet totals ${q.rightHand} hours.`,
    hint: (q) => `Subtract the ${q.constant} training hours before dividing by the shift length.`,
  },
  {
    id: 'invoices',
    prompt: 'How many invoices were paid?',
    text: (q) =>
      `Each invoice costs $${q.coefficient}, and a $${q.constant} handling fee is added once. ` +
      `The total charge is $${q.rightHand}.`,
    hint: (q) => `Remove the $${q.constant} fee first, then divide by the price of one invoice.`,
  },
  {
    id: 'shelves',
    prompt: 'How many shelves are filled?',
    text: (q) =>
      `A stockroom fits ${q.coefficient} cartons on each shelf and keeps ${q.constant} on the floor. ` +
      `It stores ${q.rightHand} cartons.`,
    hint: (q) => `The ${q.constant} on the floor are not on a shelf, so take them off first.`,
  },
  {
    id: 'rides',
    prompt: 'How many rides were taken?',
    text: (q) =>
      `A transit pass charges $${q.coefficient} a ride after a $${q.constant} monthly fee. ` +
      `The statement comes to $${q.rightHand}.`,
    hint: (q) => `Deduct the $${q.constant} monthly fee, then divide by the fare.`,
  },
  {
    id: 'batches',
    prompt: 'How many batches were made?',
    text: (q) =>
      `A kitchen bakes ${q.coefficient} loaves per batch and starts with ${q.constant} from yesterday. ` +
      `There are ${q.rightHand} loaves on the rack.`,
    hint: (q) => `The ${q.constant} from yesterday came from no batch — set them aside.`,
  },
  {
    id: 'panels',
    prompt: 'How many panels were installed?',
    text: (q) =>
      `An installer bills ${q.coefficient} minutes a panel, plus ${q.constant} minutes to set up. ` +
      `The job took ${q.rightHand} minutes.`,
    hint: (q) => `Setup happens once, so remove ${q.constant} minutes before dividing.`,
  },
  {
    id: 'rooms',
    prompt: 'How many rooms were painted?',
    text: (q) =>
      `A decorator uses ${q.coefficient} litres of paint per room and ${q.constant} litres for the trim. ` +
      `The job used ${q.rightHand} litres.`,
    hint: (q) => `Trim is a one-off, so take its ${q.constant} litres off the total first.`,
  },
]
