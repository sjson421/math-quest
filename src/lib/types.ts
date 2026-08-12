import type { KeypadRules } from './keypad'
import type { NumberLineSpec } from './number-line'
import type { Rational } from './rational'
import type { ShapeDiagram } from './shape-diagram'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Answer =
  /** Exact rational match — covers integers and fractions alike. */
  | {
      kind: 'exact'
      n: number
      d: number
      requireSimplified?: boolean
      /**
       * The answer must be written as a whole part plus a proper fraction.
       *
       * The value check is exact-rational, so `7/4` and `1 3/4` are the same
       * answer to it; this flag makes `improper-to-mixed` teach the form rather
       * than accept the prompt retyped. The written entry must decompose into
       * the same whole part and remainder — see `checkAnswer`.
       */
      requireMixed?: boolean
    }
  /** Numeric match within a tolerance, for irrational or rounded results. */
  | { kind: 'approx'; value: number; tolerance: number }
  /** Multiple choice. */
  | { kind: 'choice'; id: string }

export type Choice = {
  id: string
  label: string
  /** Exact meaning for prose choices that represent a rational amount. */
  value?: Rational
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
   * reads or expands, what it rounds to, what divides it, whether anything does,
   * how far from zero it sits.
   *
   * Grouped by payload, not by how they draw. Most of these show the value
   * plainly; `absolute-value` wraps it in bars, and `read` and `expanded-form`
   * do not show a numeral at all. What they share is that one number is enough
   * to re-derive the answer, which is the only thing this arm claims.
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
        | 'absolute-value'
      value: number
    }
  | { operation: 'compare'; left: number; right: number }
  | { operation: 'order-ascending'; values: number[] }
  /**
   * A division displayed in full whose answer is a *property* of it rather than
   * its value. `47 ÷ 5` evaluates to 9.4; the remainder is 2 and the whole
   * quotient is 9, and neither can be reached by evaluating what is on screen.
   */
  | {
      operation: 'divide-remainder' | 'divide-quotient'
      dividend: number
      divisor: number
    }
  /** The first `count` multiples of `value`, counted from `value` itself. */
  | { operation: 'multiples'; value: number; count: number }

export type WholeNumberOperation = WholeNumberData['operation']

/**
 * Structured notation for the closed expression surface used by Stages D–G.
 *
 * Generators build this tree directly rather than passing TeX or a string to a
 * parser. Every node nests through the same five primitives, so a quadratic
 * formula is composition rather than a formula-specific display case.
 */
export type MathNotation =
  | { kind: 'text'; value: string }
  | { kind: 'row'; children: MathNotation[] }
  | { kind: 'fraction'; numerator: MathNotation; denominator: MathNotation }
  | { kind: 'superscript'; base: MathNotation; exponent: MathNotation }
  | { kind: 'root'; radicand: MathNotation }

/** The fraction question a structured math display asks. */
export type FractionData =
  | { operation: 'read'; numerator: number; denominator: number }
  | { operation: 'place'; numerator: number; denominator: number }
  | { operation: 'simplify'; numerator: number; denominator: number }
  | {
      operation: 'name-part'
      numerator: number
      denominator: number
      requestedPart: 'numerator' | 'denominator'
    }
  | {
      operation: 'scale-missing'
      numerator: number
      denominator: number
      factor: number
      direction: 'up' | 'down'
      missing: 'numerator' | 'denominator'
    }
  | {
      operation: 'compare'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }
  /**
   * Fraction arithmetic: both displayed fractions and the operator, so the
   * result is re-derived over the common denominator without trusting the
   * generator. Separate `add` and `sub` arms so a compound `===` check narrows
   * reliably; the denominator relationship (like or unlike) is a draw property,
   * and recomputation over the LCM works for both.
   */
  | {
      operation: 'add'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }
  | {
      operation: 'sub'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }
  /** Two fractions whose least common denominator is the answer. */
  | {
      operation: 'common-denominator'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }
  /** An improper fraction whose mixed-number form is the answer. */
  | { operation: 'improper-to-mixed'; numerator: number; denominator: number }

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
  /** Structured notation with the one complete name assistive technology reads. */
  | {
      kind: 'math'
      notation: MathNotation
      label: string
      fraction?: FractionData
    }
  /** A shaded equal-part shape whose visible fraction is carried as data. */
  | { kind: 'diagram'; diagram: ShapeDiagram }

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
