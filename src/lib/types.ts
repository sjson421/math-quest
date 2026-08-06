import type { KeypadRules } from './keypad'

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

export type WholeNumberOperation =
  | 'read'
  | 'tens-digit'
  | 'hundreds-digit'
  | 'expanded-form'
  | 'compare'
  | 'order-ascending'
  | 'round-to-10'
  | 'round-to-100'
  /**
   * A division displayed in full whose answer is a *property* of it rather than
   * its value. `47 ÷ 5` evaluates to 9.4; the remainder is 2 and the whole
   * quotient is 9, and neither can be reached by evaluating what is on screen.
   */
  | 'divide-remainder'
  | 'divide-quotient'
  /** Properties of the one displayed number, answered by choosing a label. */
  | 'factors'
  | 'multiples'
  | 'classify-prime'

/**
 * The values a problem's answer is derived from, and which derivation.
 *
 * Named for the representation skills of Unit 0, which asked the first questions
 * a displayed expression could not answer on its own. Unit 4 is the second
 * caller and the name has stretched: a division is whole-number work too, but
 * it is arithmetic rather than representation. Renaming it would touch every
 * Unit 0 test for no behavioural gain, so it stays and this comment carries the
 * meaning — carried values plus the operation applied to them.
 *
 * Nothing that renders reads this. It exists so the answer can be recomputed
 * without trusting the generator.
 *
 * `values` is positional and means something different per operation, which is
 * a real weakness: writing a dividend and divisor the wrong way round type-checks.
 * Making it a union keyed by the operation is the fix, and is deliberately left
 * to its own change rather than folded into a content unit.
 */
export type WholeNumberData = {
  values: number[]
  operation: WholeNumberOperation
}

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
  inputMode: 'keypad' | 'choice'
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
