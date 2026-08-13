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
      /**
       * The answer must be written as a decimal, not an equivalent fraction.
       *
       * `fraction-to-decimal` teaches the conversion itself, so retyping the
       * displayed fraction is answered as right in value but wrong form — see
       * `checkAnswer`. Mutually exclusive with `requireFraction` on one answer.
       */
      requireDecimal?: boolean
      /**
       * The answer must be written as a fraction, not an equivalent decimal.
       *
       * `decimal-to-fraction`'s counterpart to `requireDecimal`.
       */
      requireFraction?: boolean
    }
  /** Numeric match within a tolerance, for irrational or rounded results. */
  | { kind: 'approx'; value: number; tolerance: number }
  /** Multiple choice. */
  | { kind: 'choice'; id: string }
  /**
   * A single-variable expression, compared under a canonical form rather than
   * by value — expressions do not have a value until the variable does.
   *
   * `canonical` is written naturally by the generator (e.g. `"2x + 2"` or
   * `"2(x + 1)"`) and is itself canonicalized before comparison, so it need
   * not be pre-normalized by hand.
   */
  | {
      kind: 'expression'
      canonical: string
      variable: string
      /**
       * `'expanded'` treats a distributed and undistributed form as the same
       * answer — `2(x + 1)` and `2x + 2` are one answer. `'exact'` keeps them
       * distinct, for skills like `factor-gcf` where un-distributing is the
       * point. See `src/lib/expression.ts`.
       */
      form: 'expanded' | 'exact'
    }

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
  /**
   * The wrong value this mistake produces. A plain number for arithmetic
   * mistakes; `{ kind: 'text' }` for a mistake whose result isn't a scalar
   * (e.g. an unsimplified expression) — matched by exact string, not by
   * numeric or algebraic equivalence.
   */
  value: number | { kind: 'text'; value: string }
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
        /** "N%", answer is N itself — the identity a percent's meaning rests on. */
        | 'percent-of-hundred'
        /** "N out of 100", answer is N — the other framing of the same identity. */
        | 'parts-of-hundred'
        /** "N%", answer is N/100 — percent read as a decimal or as a fraction agree numerically. */
        | 'percent-rational'
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
  /** "P% of Q", answer is P × Q ÷ 100 — not reachable by evaluating the "of" as anything arithmetic. */
  | { operation: 'percent-of'; percent: number; quantity: number }

export type WholeNumberOperation = WholeNumberData['operation']

/** A nonnegative decimal as written, including a meaningful trailing zero. */
export type DecimalValue = {
  coefficient: number
  scale: 1 | 2
}

/** The decimal property or operation a display asks about. */
export type DecimalData =
  | {
      operation: 'digit'
      value: DecimalValue
      place: 'tenths' | 'hundredths'
    }
  | { operation: 'read'; value: DecimalValue }
  | { operation: 'compare'; left: DecimalValue; right: DecimalValue }
  | { operation: 'round'; value: DecimalValue; targetScale: 0 | 1 }
  | { operation: 'add'; left: DecimalValue; right: DecimalValue }
  | { operation: 'sub'; left: DecimalValue; right: DecimalValue }
  | { operation: 'mult'; left: DecimalValue; right: DecimalValue }
  /** A whole-number divisor has no decimal point, so it is a plain integer, not a `DecimalValue`. */
  | { operation: 'div-whole'; dividend: DecimalValue; divisor: number }
  | { operation: 'div-decimal'; dividend: DecimalValue; divisor: DecimalValue }
  /** A plain decimal value, shown as digits rather than words or an operation. */
  | { operation: 'display'; value: DecimalValue }
  /** A displayed decimal whose answer is the same value read as a percent (×100). */
  | { operation: 'to-percent'; value: DecimalValue }

export type DecimalArithmeticData = Extract<DecimalData, { operation: 'add' | 'sub' | 'mult' }>

/**
 * The source quantities behind prose-shaped percent problems.
 *
 * Story text is for the learner, not a data format. These named arms let the
 * generator checks reconstruct both that text and its answer without parsing
 * English or trusting the arithmetic that authored the problem.
 */
export type PercentData =
  | { operation: 'find-percent'; part: number; whole: number }
  | { operation: 'find-whole'; percent: number; part: number }
  | { operation: 'percent-change'; original: number; current: number }
  | { operation: 'discount' | 'tax' | 'tip'; baseCents: number; percent: number }
  | { operation: 'simple-interest'; principalCents: number; percent: number; years: number }

/** The source quantities behind Unit 11's ratio and proportion displays. */
export type RatioData =
  | {
      operation: 'write-ratio'
      firstLabel: string
      secondLabel: string
      first: number
      second: number
    }
  | { operation: 'simplify-ratio'; first: number; second: number }
  | {
      operation: 'unit-rate'
      firstCount: number
      firstCents: number
      secondCount: number
      secondCents: number
    }
  | {
      operation: 'solve-proportion'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
      missing: 'leftNumerator' | 'leftDenominator' | 'rightNumerator' | 'rightDenominator'
    }
  | {
      operation: 'scale-drawing'
      scale: number
      given: number
      direction: 'drawing-to-actual' | 'actual-to-drawing'
    }
  | {
      operation: 'unit-conversion'
      factor: number
      given: number
      direction: 'large-to-small' | 'small-to-large'
      largeSingular: string
      largePlural: string
      smallSingular: string
      smallPlural: string
    }
  | {
      operation: 'ratio-word'
      frameId: string
      first: number
      second: number
      comparison: 'part-to-part' | 'part-to-whole'
    }

/** The source quantities behind Unit 12's exponent and root displays. */
export type PowerData =
  /** `exponent-meaning`: repeated multiplication expands to `exponent` factors of `base`. */
  | { operation: 'expand-power'; base: number; exponent: number }
  | { operation: 'evaluate-power'; base: number; exponent: number }
  | { operation: 'square'; value: number }
  | { operation: 'square-root'; value: number }
  /** The answer is `floor(sqrt(value))`, the lesser of the two bounding whole numbers. */
  | { operation: 'estimate-root'; value: number }
  | {
      operation: 'power-multiply' | 'power-divide'
      base: number
      leftExponent: number
      rightExponent: number
    }

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
  /** A displayed mixed number whose improper-fraction form is the answer. */
  | { operation: 'mixed-to-improper'; whole: number; numerator: number; denominator: number }
  /** Two displayed mixed numbers whose exact sum is the answer. */
  | {
      operation: 'add-mixed'
      leftWhole: number
      leftNumerator: number
      leftDenominator: number
      rightWhole: number
      rightNumerator: number
      rightDenominator: number
    }
  /** Two displayed mixed numbers whose exact difference is the answer. */
  | {
      operation: 'sub-mixed'
      leftWhole: number
      leftNumerator: number
      leftDenominator: number
      rightWhole: number
      rightNumerator: number
      rightDenominator: number
    }
  /** Two displayed fractions whose exact product is the answer. */
  | {
      operation: 'multiply'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }
  /** Two displayed fractions whose exact quotient is the answer. */
  | {
      operation: 'divide'
      leftNumerator: number
      leftDenominator: number
      rightNumerator: number
      rightDenominator: number
    }

/** How the problem is presented. Column layout matches how arithmetic is taught. */
export type Display =
  | { kind: 'inline'; text: string; wholeNumber?: WholeNumberData; decimal?: DecimalData }
  | { kind: 'column'; operands: number[]; operator: Operator }
  /** Decimal columns render from exact source data so trailing zeroes survive. */
  | { kind: 'decimal-column'; decimal: DecimalArithmeticData }
  /**
   * A word problem: prose for the learner, operands for everything else.
   *
   * The operands are not redundant with the text. The answer has to be
   * recomputable from what is displayed without trusting the generator, and
   * nothing can do that by reading English — least of all a sentence that
   * deliberately mentions quantities the answer does not use. Arithmetic
   * stories carry operands and one operator; percent stories carry a named
   * relationship instead.
   */
  | ({ kind: 'story'; text: string } & (
      | { operands: number[]; operator: Operator; percent?: never; ratio?: never }
      | { percent: PercentData; operands?: never; operator?: never; ratio?: never }
      | { ratio: RatioData; operands?: never; operator?: never; percent?: never }
    ))
  /** Structured notation with the one complete name assistive technology reads. */
  | ({
      kind: 'math'
      notation: MathNotation
      label: string
    } & (
      | { fraction: FractionData; ratio?: never; power?: never }
      | { ratio: RatioData; fraction?: never; power?: never }
      | { power: PowerData; fraction?: never; ratio?: never }
      | { fraction?: never; ratio?: never; power?: never }
    ))
  /** A shaded equal-part shape whose visible fraction is carried as data. */
  | { kind: 'diagram'; diagram: ShapeDiagram }

export type Problem = {
  skillId: string
  /** Short instruction, e.g. "What is the sum?" */
  prompt: string
  display: Display
  answer: Answer
  inputMode: 'keypad' | 'choice' | 'number-line' | 'expression'
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
  /**
   * The variable letter offered on the pad, when `inputMode` is `expression`.
   *
   * Per problem for the same reason `keypad` and `numberLine` are: a generator
   * knows which letter its own answer just used; nothing above it does.
   */
  expression?: { variable: string }
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
