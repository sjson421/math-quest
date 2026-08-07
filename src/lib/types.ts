import type { KeypadRules } from './keypad'
import type { NumberLineSpec } from './number-line'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Answer =
  /** Exact rational match — covers integers and fractions alike. */
  | { kind: 'exact'; n: number; d: number; requireSimplified?: boolean }
  /** Numeric match within a tolerance, for irrational or rounded results. */
  | { kind: 'approx'; value: number; tolerance: number }
  /** Multiple choice. */
  | { kind: 'choice'; id: string }

export type Choice = {
  id: string
  label: string
}

/**
 * A specific wrong answer this problem is likely to attract, and why.
 *
 * Because generators know every intermediate value, they can predict the exact
 * number a learner lands on when they make a particular mistake. When a typed
 * answer matches one, we can respond to the actual error ("it looks like you
 * forgot to carry the 1") instead of a bare "incorrect" — which is the whole
 * diagnostic benefit of multiple choice, without giving up free response.
 */
export type Misconception = {
  /** The wrong value this mistake produces. */
  value: number
  /** Stable tag for tracking recurring errors across sessions. */
  tag: string
  /** Shown to the learner. Warm, specific, never scolding. */
  nudge: string
}

export type SolutionStep = {
  text: string
  /** Optional working shown beneath the step, e.g. "7 + 5 = 12". */
  detail?: string
}

export type Operator = '+' | '−' | '×' | '÷'

/**
 * What a problem's answer is derived from, and which derivation.
 *
 * Named for the representation skills of Unit 0, which asked the first questions
 * a displayed expression could not answer on its own. Unit 4 is the second
 * caller and the name has stretched: a division is whole-number work too, but it
 * is arithmetic rather than representation.
 *
 * Nothing that renders reads this. It exists so the answer can be recomputed
 * without trusting the generator — which is why the payload is named per
 * operation rather than a shared `number[]`. That list meant a different thing
 * in each case, so writing a dividend and divisor in the order they came to hand
 * type-checked, and verification would then recompute the remainder of the wrong
 * division and agree with the generator it exists to check. A union makes that
 * swap a compile error instead of a silent pass.
 */
export type WholeNumberData =
  /**
   * A property of the one displayed number: which digit sits in a place, how it
   * reads or expands, what it rounds to, what divides it, whether anything does.
   */
  | {
      operation:
        | 'read'
        | 'tens-digit'
        | 'hundreds-digit'
        | 'expanded-form'
        | 'round-to-10'
        | 'round-to-100'
        | 'factors'
        | 'classify-prime'
      value: number
    }
  | { operation: 'compare'; left: number; right: number }
  | { operation: 'order-ascending'; values: number[] }
  /**
   * A division displayed in full whose answer is a *property* of it rather than
   * its value. `47 ÷ 5` evaluates to 9.4; the remainder is 2 and the whole
   * quotient is 9, and neither can be reached by evaluating what is on screen.
   */
  | { operation: 'divide-remainder' | 'divide-quotient'; dividend: number; divisor: number }
  /** The first `count` multiples of `value`, counted from `value` itself. */
  | { operation: 'multiples'; value: number; count: number }

export type WholeNumberOperation = WholeNumberData['operation']

/** How the problem is presented. Column layout matches how arithmetic is taught. */
export type Display =
  | { kind: 'inline'; text: string; wholeNumber?: WholeNumberData }
  | { kind: 'column'; operands: number[]; operator: Operator }
  /**
   * A word problem: prose for the learner, operands for everything else.
   *
   * The operands are not redundant with the text. The answer has to be
   * recomputable from what is displayed without trusting the generator, and
   * nothing can do that by reading English — least of all a sentence that
   * deliberately mentions quantities the answer does not use.
   */
  | { kind: 'story'; text: string; operands: number[]; operator: Operator }

export type Problem = {
  skillId: string
  /** Short instruction, e.g. "What is the sum?" */
  prompt: string
  display: Display
  answer: Answer
  inputMode: 'keypad' | 'choice' | 'number-line'
  /**
   * What this answer may be typed with. Omitted means whole digits only, which
   * is what every skill built so far wants.
   *
   * On the problem rather than on the generator because a skill can need both:
   * Unit 6 asks for −3 + 5 and −3 + −5 under the same id, and only one of those
   * answers is negative. A generator knows the shape of the answer it has just
   * computed; nothing above it does.
   */
  keypad?: KeypadRules
  choices?: Choice[]
  /**
   * The line this answer is placed on, when `inputMode` is `number-line`.
   *
   * Per problem for the same reason `keypad` is: one skill asks about several
   * lines. `fractions-numberline` walks a line of halves before it walks one of
   * fifths, and which one a problem got is known only to the generator that
   * just built it.
   */
  numberLine?: NumberLineSpec
  misconceptions?: Misconception[]
  hint: string
  /** Worked steps, generated procedurally from the actual operands. */
  solution: SolutionStep[]
  difficulty: Difficulty
}

export type SkillGenerator = {
  id: string
  name: string
  /** Shown on the skill tree node. */
  blurb: string
  /**
   * Deliberately no `prerequisites`. What unlocks what is the manifest's, and
   * only the manifest's — see `unlockPrerequisites` in `curriculum/index.ts`. A
   * generator that also declared its edges would be a second graph nothing keeps
   * in step with the first.
   */
  generate(rng: import('./rng').Rng, difficulty: Difficulty): Problem
}
