import { intAnswer } from '../../lib/answer'
import type { Rng } from '../../lib/rng'
import type { Misconception, Operator, SolutionStep } from '../../lib/types'
import type { ProblemSpec } from './problem'

/**
 * Templated phrasing for word problems.
 *
 * Fixed sentence frames with generated numbers, rather than prose composed at
 * generation time. The reason is not technical: an adult restarting math reads a
 * clumsy sentence as their own failure to understand, not as ours to write. Every
 * sentence that reaches a learner has been read by a person first.
 *
 * Frames also carry their own misconceptions, because only the sentence that
 * mentioned three quantities knows which two a learner is likely to have added.
 */

export type Quantities = {
  /** The two quantities the answer uses. */
  a: number
  b: number
  /**
   * A quantity the sentence mentions and the answer does not use.
   *
   * Word problems fail on comprehension, and picking up the wrong number is how.
   * A story with nothing to pick up wrongly is an arithmetic problem wearing a
   * sentence.
   */
  distractor: number
}

/** Nudges are per frame: the error is the same, the words that name it are not. */
export type FrameNudges = {
  wrongOperation(q: Quantities): string
  distractorPair(q: Quantities): string
  answeredPart(q: Quantities): string
}

export type Frame = {
  /** Stable id, named when the static check rejects this frame. */
  id: string
  operator: Operator
  prompt: string
  text(q: Quantities): string
  hint(q: Quantities): string
  solution(q: Quantities, answer: number): SolutionStep[]
  nudges: FrameNudges
}

export const applyOperator = (a: number, b: number, operator: Operator): number => {
  switch (operator) {
    case '+':
      return a + b
    case '−':
      return a - b
    case '×':
      return a * b
    case '÷':
      return a / b
    default: {
      const unhandled: never = operator
      throw new Error(`Unhandled operator: ${unhandled}`)
    }
  }
}

/**
 * The three ways a word problem is misread.
 *
 * Values are computed here so every frame predicts the same errors; the words
 * come from the frame, which is the only thing that knows what its numbers were
 * standing for. None of the three can equal the answer while `b` is non-zero and
 * the distractor differs from `b`, which the drawing constraint guarantees.
 */
export function storyMisconceptions(frame: Frame, q: Quantities): Misconception[] {
  const { a, b, distractor } = q

  return [
    {
      value: Math.abs(applyOperator(a, b, frame.operator === '+' ? '−' : '+')),
      tag: 'wrong-operation',
      nudge: frame.nudges.wrongOperation(q),
    },
    {
      value: applyOperator(a, distractor, frame.operator),
      tag: 'distractor-pair',
      nudge: frame.nudges.distractorPair(q),
    },
    {
      value: a,
      tag: 'answered-part',
      nudge: frame.nudges.answeredPart(q),
    },
  ]
}

/**
 * Choose a frame from the seeded stream.
 *
 * Not `Math.random`, and not module state: a story that varies between two runs
 * of one seed makes the whole problem unreproducible, not merely its wording.
 */
export const pickFrame = (rng: Rng, frames: readonly Frame[]): Frame => rng.pick(frames)

/**
 * Build the problem a frame describes.
 *
 * Shared by the generator and by the static frame check on purpose: a check that
 * assembled the problem its own way would be verifying something no learner ever
 * sees.
 */
export function storyProblem(frame: Frame, q: Quantities): ProblemSpec {
  const answer = applyOperator(q.a, q.b, frame.operator)

  return {
    prompt: frame.prompt,
    display: {
      kind: 'story',
      text: frame.text(q),
      operands: [q.a, q.b],
      operator: frame.operator,
    },
    answer: intAnswer(answer),
    misconceptions: storyMisconceptions(frame, q),
    hint: frame.hint(q),
    solution: frame.solution(q, answer),
  }
}

/** Quantity sets the static frame check instantiates every frame with. */
export const CHECK_QUANTITIES: Quantities[] = [
  { a: 2, b: 3, distractor: 5 },
  { a: 14, b: 27, distractor: 9 },
  // Widest numerals the ladder reaches, which is where a step runs long.
  { a: 486, b: 375, distractor: 128 },
]
