import type { KeypadRules } from './keypad'
import type { NumberLineSpec } from './number-line'
import type { Rational } from './rational'
import type { ShapeDiagram } from './shape-diagram'
import type { GeometryDiagram } from './geometry-diagram'
import type { Coordinate, CoordinatePlane } from './coordinate-plane'
import type { Chart } from './chart'

export type Difficulty = 1 | 2 | 3 | 4 | 5

/** One exact ordered pair, shared by point answers and point misconceptions. */
export type PointValue = Coordinate & { kind: 'point' }

/** Two exact roots whose order is not meaningful. */
export type RootPairValue = {
  kind: 'root-pair'
  roots: readonly [Rational, Rational]
}

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
      /** Omitted for the existing degree-one grammar. */
      maxDegree?: 2
      /**
       * `'expanded'` treats a distributed and undistributed form as the same
       * answer — `2(x + 1)` and `2x + 2` are one answer. `'exact'` keeps them
       * distinct, for skills like `factor-gcf` where un-distributing is the
       * point. See `src/lib/expression.ts`.
       */
      form: 'expanded' | 'exact'
    }
  /** Exact ordered-pair match for coordinate-plane placement. */
  | PointValue
  /** Exact unordered match for two numeric roots. */
  | RootPairValue

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
   * numeric or algebraic equivalence. A point keeps its coordinates structured
   * so order reversal can be filtered and diagnosed exactly.
   */
  value: number | { kind: 'text'; value: string } | PointValue | RootPairValue
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

/** A closed integer linear equation used by the systems lessons. */
export type LinearEquation =
  | { form: 'standard'; a: number; b: number; c: number }
  | { form: 'isolated'; slope: number; intercept: number }

/** The fixed variable order used by every ordered-pair systems answer. */
export type SystemVariables = ['x', 'y']

/**
 * What one coordinate-plane problem asks the learner to read or place.
 *
 * The plane remains geometry: axes, points, and lines. This record gives that
 * geometry one content meaning so independent verification never has to guess
 * whether the same line is being read for slope, intercept, or something else.
 */
export type CoordinateData =
  | { operation: 'plot-point'; point: Coordinate }
  | { operation: 'quadrant' }
  | { operation: 'table-to-graph'; rows: Coordinate[]; targetX: number }
  | { operation: 'slope-from-graph' }
  | { operation: 'slope-from-points' }
  | { operation: 'y-intercept' }
  | {
      operation: 'slope-intercept'
      slope: number
      intercept: number
      asks: 'slope' | 'intercept'
    }
  | { operation: 'graph-from-equation'; slope: number; intercept: number }
  | { operation: 'equation-from-graph' }
  | {
      operation: 'parallel-perpendicular'
      relationship: 'parallel' | 'perpendicular'
    }
  /** Two visible lines meet at the ordered pair the learner places. */
  | {
      operation: 'system-by-graphing'
      variables: SystemVariables
    }
  /** One equation is isolated so its expression can be substituted. */
  | {
      operation: 'system-substitution'
      variables: SystemVariables
      equations: readonly [LinearEquation, LinearEquation]
    }
  /** Standard equations with a declared non-unit cancellation constraint. */
  | {
      operation: 'system-elimination'
      variables: SystemVariables
      equations: readonly [
        Extract<LinearEquation, { form: 'standard' }>,
        Extract<LinearEquation, { form: 'standard' }>,
      ]
      scaleEquation: 0 | 1
      scaleFactor: number
      eliminate: 'x' | 'y'
    }
  /** A finite function relation whose domain, range, or linearity is read from its points. */
  | { operation: 'domain-range'; asks: 'domain' | 'range' }
  | { operation: 'linear-vs-nonlinear' }
  /**
   * Three linear rules shown as a table, graph, and equation. The graph line
   * remains in the plane; the other two representations carry their own rows.
   */
  | {
      operation: 'compare-functions'
      tableRows: Coordinate[]
      equationSlope: number
      equationIntercept: number
      asks: 'slope' | 'intercept'
    }
  /** Quantities behind the fixed pass-sales story; counts are deliberately absent. */
  | {
      operation: 'system-words'
      variables: SystemVariables
      frameId: 'pass-sales'
      firstPrice: number
      secondPrice: number
      totalCount: number
      totalRevenue: number
    }

export type Operator = '+' | '−' | '×' | '÷'

/**
 * How two sides of a statement compare, where they are not equal.
 *
 * Beside `Operator` because it is the same kind of thing one level up: an
 * operator says what to do to two values, a relation says how they stand. Unit
 * 15 is the first content to need one, and it needs it in four places at once —
 * the display's text, the option labels, the option ids, and the reversal that
 * multiplying by a negative forces — so a string literal per generator would be
 * four spellings of one idea.
 *
 * The symbols are the ones the learner reads. `≤` is a single character rather
 * than `<=`, for the same reason `Operator` carries `−` and `×`: nothing
 * interpolates a keyboard approximation into learner-facing text. The ASCII
 * forms exist only as option ids, which the checker reads and nobody sees.
 */
export type Relation = '<' | '>' | '≤' | '≥'

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
  | { operation: 'power-of-power'; base: number; innerExponent: number; outerExponent: number }
  | { operation: 'zero-exponent'; base: number }
  | { operation: 'negative-exponent'; base: number; magnitude: number }
  | {
      operation: 'scientific-notation'
      /** Integer digits of the coefficient; `coefficientScale` places its decimal point. */
      coefficient: number
      coefficientScale: 0 | 1
      exponent: number
    }
  | {
      operation: 'pemdas-power-first'
      addend: number
      base: number
      exponent: number
      factor: number
    }
  | {
      operation: 'pemdas-group-power'
      left: number
      right: number
      exponent: number
      divisor: number
    }

/** The source quantities behind Unit 13's single-variable expression displays. */
export type AlgebraData =
  /** `variable-meaning`: one term, `coefficient` times the variable. */
  | { operation: 'substitute-term'; coefficient: number; value: number }
  /** `evaluate-expression`: a term plus or minus a constant. */
  | { operation: 'substitute-expression'; coefficient: number; constant: number; adds: boolean; value: number }
  /** `words-to-expression`: which order-sensitive phrasing produced the shown text. */
  | { operation: 'words-to-expression'; n: number; lessThan: boolean }
  /** `identify-like-terms`: the target term and its one matching choice among the offered ids. */
  | { operation: 'identify-like-terms'; targetCoefficient: number; targetLetter: string; matchCoefficient: number }
  /** `combine-like-terms`: two terms in the declared variable, plus a constant. */
  | { operation: 'combine-like-terms'; first: number; second: number; constant: number }
  /** `distributive`: a coefficient distributed across the variable and a constant. */
  | { operation: 'distributive'; coefficient: number; constant: number }
  /**
   * `distribute-negative`: the coefficient's magnitude — the displayed one is
   * its negation — the constant, and whether the bracket adds or subtracts it.
   */
  | { operation: 'distribute-negative'; coefficient: number; constant: number; adds: boolean }
  /**
   * `factor-gcf`: the greatest common factor taken outside, and the coefficient
   * and constant left inside. The displayed sum is their products, so it is
   * derived from this rather than carried alongside it.
   */
  | { operation: 'factor-gcf'; factor: number; coefficient: number; constant: number }

/** The visible source quantities behind Unit 18's polynomial rewrites. */
export type PolynomialCoefficients = {
  quadratic: number
  linear: number
  constant: number
}

/**
 * Unit 18's operations stay separate from `AlgebraData`: the same-looking
 * expression display asks a different question, and each arm carries only
 * the operands that appear in that polynomial operation.
 */
export type PolynomialData =
  | {
      operation: 'add' | 'sub'
      left: PolynomialCoefficients
      right: PolynomialCoefficients
    }
  | {
      operation: 'mult-monomial'
      outerCoefficient: number
      innerLinear: number
      innerConstant: number
    }
  | {
      operation: 'foil'
      leftConstant: number
      rightConstant: number
    }
  | {
      operation: 'factor-gcf-poly'
      quadratic: number
      linear: number
    }
  | {
      operation: 'factor-trinomial'
      linear: number
      constant: number
    }
  | {
      operation: 'difference-of-squares'
      squareRoot: number
    }
  | {
      operation: 'factored-zero'
      firstConstant: number
      secondConstant: number
    }
  | {
      operation: 'quadratic-formula'
      a: number
      b: number
      c: number
    }

/**
 * The source quantities behind Unit 14's equation displays.
 *
 * Separate from `AlgebraData` because that one is reachable only from `inline`
 * and `story`, where an equation operation would mean nothing — the same reason
 * `WholeNumberData` above is a union rather than a shared `number[]`.
 *
 * **No arm carries the solution.** Every value here is one the equation puts on
 * screen, and verification does the arithmetic to reach the answer. A payload
 * carrying the answer and a check that reads it back is the generator's stated
 * answer under another name, which is the one thing the recompute rule exists
 * to prevent.
 */
export type EquationData =
  /**
   * `equation-balance`: the displayed sum `first + second`, whose stated total
   * is their sum, and the amount applied to both sides.
   */
  | { operation: 'balance'; first: number; second: number; change: number; adds: boolean }
  /** `one-step-addsub`: `x + constant = rightHand`, or `−` when `adds` is false. */
  | { operation: 'one-step-addsub'; constant: number; adds: boolean; rightHand: number }
  /**
   * `one-step-multdiv`: `coefficient · x = rightHand` when `multiplies`, else
   * `x / coefficient = rightHand`.
   */
  | { operation: 'one-step-multdiv'; coefficient: number; multiplies: boolean; rightHand: number }
  /** `two-step`: `coefficient · x ± constant = rightHand`. */
  | { operation: 'two-step'; coefficient: number; constant: number; adds: boolean; rightHand: number }
  /**
   * `vars-both-sides`: all four displayed terms. The only arm needing nothing
   * else, because both sides are on screen in full.
   */
  | {
      operation: 'vars-both-sides'
      leftCoefficient: number
      leftConstant: number
      rightCoefficient: number
      rightConstant: number
    }
  /** `equation-parentheses`: `coefficient(x ± constant) = rightHand`. */
  | { operation: 'parentheses'; coefficient: number; constant: number; adds: boolean; rightHand: number }
  /**
   * `with-fractions`: `x / denominator ± constant = rightHand`, drawn as a
   * stacked fraction rather than a slash.
   */
  | {
      operation: 'clear-fraction'
      denominator: number
      constant: number
      adds: boolean
      rightHand: number
    }
  /**
   * `special-solutions`: all four displayed terms, like `vars-both-sides` — and
   * deliberately not that arm.
   *
   * The two derive different things from the same four numbers: one a solution,
   * one a solution *count*. `4x + 3 = 4x + 9` has no solution at all, so
   * `vars-both-sides`'s derivation divides by zero on it. One arm serving both
   * would let a generator claim either answer from either shape, which is the
   * swap this union exists to make a compile error.
   */
  | {
      operation: 'special-solutions'
      /**
       * The letter, carried rather than taken from the display's frame label —
       * this arm is the one that omits that label, and a check that assumed the
       * letter instead would stop being independent of the generator.
       */
      letter: string
      leftCoefficient: number
      leftConstant: number
      rightCoefficient: number
      rightConstant: number
    }
  /**
   * `rearrange-formula`: `subjectCoefficient·subject + termCoefficient·term =
   * constant`, solved for `subject`.
   *
   * The only arm carrying letters. Every other equation is written in the one
   * variable the display already names; this one puts two on screen and the
   * answer contains only `term`, so the text cannot be rebuilt from
   * `display.variable` alone.
   */
  | {
      operation: 'rearrange'
      subject: string
      term: string
      subjectCoefficient: number
      termCoefficient: number
      constant: number
    }
  /**
   * `function-notation`: the input and output shown in `f(input) = output`.
   * Choices own the reading answer, so this display has no answer frame.
   */
  | { operation: 'function-notation'; input: number; output: number }
  /**
   * `evaluate-function`: the displayed linear rule and the named input on the
   * separate answer row.
   */
  | {
      operation: 'evaluate-function'
      coefficient: number
      constant: number
      input: number
      inputLabel: string
    }
  /*
   * Unit 15's six. Every arm below states an *inequality*, so its `relation` is
   * the one the display shows — never the one the answer carries, which for two
   * of these is its reverse and would be the generator's answer smuggled into
   * the payload that exists to check it.
   */
  /**
   * `inequality-symbols`: `x relation bound`, answered by what that reads as in
   * words.
   *
   * Carries exactly what `inequality-graph` carries, and is deliberately not
   * that arm. The two derive different things from the same two values — a
   * reading and a drawing — and one arm serving both would let either generator
   * claim either answer. `vars-both-sides` and `special-solutions` are separate
   * for this reason on the same evidence: identical fields, different question.
   */
  | { operation: 'inequality-meaning'; relation: Relation; bound: number }
  /** `graph-inequality`: `x relation bound`, answered by the graph it draws. */
  | { operation: 'inequality-graph'; relation: Relation; bound: number }
  /** `solve-one-step-ineq`: `x + constant relation rightHand`, or `−` when `adds` is false. */
  | {
      operation: 'inequality-addsub'
      relation: Relation
      constant: number
      adds: boolean
      rightHand: number
    }
  /**
   * `coefficient·x relation rightHand` when `multiplies`, else
   * `x / coefficient relation rightHand`.
   *
   * **One arm across two skills, and the coefficient is signed.** The solved
   * relation reverses exactly when that coefficient is negative, which is one
   * derivation rather than two — and the sign is a number the display puts on
   * screen, so there is nothing here a generator could swap. What separates
   * `solve-one-step-ineq` from `flip-the-sign` is which sign each *draws*, and a
   * draw constraint belongs in the unit's tests rather than in this union.
   *
   * Deliberately unlike 14a's `one-step-multdiv`/`two-step` split, which
   * separates genuinely different *shapes*. These two differ in the sign of one
   * carried number, and two arms would mean two copies of the same reversal rule.
   */
  | {
      operation: 'inequality-multdiv'
      relation: Relation
      coefficient: number
      multiplies: boolean
      rightHand: number
    }
  /** `solve-multi-step-ineq`: `coefficient·x ± constant relation rightHand`. */
  | {
      operation: 'inequality-two-step'
      relation: Relation
      coefficient: number
      constant: number
      adds: boolean
      rightHand: number
    }
  /**
   * `compound-inequalities`: two conditions on the variable and how they
   * combine, answered by how many whole numbers from 0 to `rangeMax` satisfy
   * them.
   *
   * **Both relations read as they apply to the variable** — `x relation bound`,
   * always in that order — even for `between`, which draws the first one flipped
   * so the range reads left to right (`2 < x ≤ 6` for `x > 2 and x ≤ 6`). The
   * alternative, letting each form carry relations in the order it happens to
   * draw them, means the same two fields mean different things per form, and
   * verification would then agree with a generator that displayed the wrong way
   * round.
   *
   * `between` is `and` with a rendering, so it is a third value here rather than
   * a flag beside the connective: a chained `or` reads as a range that is not
   * one, and this way it cannot be written down at all.
   */
  | {
      operation: 'inequality-compound'
      form: 'and' | 'or' | 'between'
      firstRelation: Relation
      firstBound: number
      secondRelation: Relation
      secondBound: number
      /** The count runs over 0 through this value, both ends included. */
      rangeMax: number
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
  | { kind: 'inline'; text: string; wholeNumber?: WholeNumberData; decimal?: DecimalData; algebra?: AlgebraData }
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
   *
   * A story is also the right shape for a phrase the learner translates rather
   * than computes. `inline` appends an `= answer` frame, which is true of every
   * skill whose answer is the value of what is shown and false of one whose
   * answer is a rewriting of it: `13.3` would read `6 = x-6`. Story text takes
   * no such frame.
   */
  | ({ kind: 'story'; text: string } & (
      | { operands: number[]; operator: Operator; percent?: never; ratio?: never; algebra?: never; polynomial?: never; equation?: never }
      | { percent: PercentData; operands?: never; operator?: never; ratio?: never; algebra?: never; polynomial?: never; equation?: never }
      | { ratio: RatioData; operands?: never; operator?: never; percent?: never; algebra?: never; polynomial?: never; equation?: never }
      | { algebra: AlgebraData; operands?: never; operator?: never; percent?: never; ratio?: never; polynomial?: never; equation?: never }
      | { polynomial: PolynomialData; operands?: never; operator?: never; percent?: never; ratio?: never; algebra?: never; equation?: never }
      /**
       * A situation whose structure is an equation. `equation-words` is the
       * consumer: its sentence states two operations applied in sequence, and
       * `operands` with one `operator` states exactly one by construction.
       */
      | { equation: EquationData; operands?: never; operator?: never; percent?: never; ratio?: never; algebra?: never; polynomial?: never }
    ))
  /** Structured notation with the one complete name assistive technology reads. */
  | ({
      kind: 'math'
      notation: MathNotation
      label: string
    } & (
      | { fraction: FractionData; ratio?: never; power?: never; polynomial?: never }
      | { ratio: RatioData; fraction?: never; power?: never; polynomial?: never }
      | { power: PowerData; fraction?: never; ratio?: never; polynomial?: never }
      | { polynomial: PolynomialData; fraction?: never; ratio?: never; power?: never }
      | { fraction?: never; ratio?: never; power?: never; polynomial?: never }
    ))
  /** A shaded equal-part or labelled geometry figure carried as data. */
  | { kind: 'diagram'; diagram: ShapeDiagram | GeometryDiagram }
  /** A bounded graph whose axes, points, lines, and optional content meaning are data. */
  | { kind: 'coordinate-plane'; plane: CoordinatePlane; coordinate?: CoordinateData }
  /** A labelled chart whose marks and accessible table share one source declaration. */
  | { kind: 'chart'; chart: Chart }
  /**
   * A statement that already contains its relation — an equation, or since Unit
   * 15 an inequality.
   *
   * The third thing a display's answer can be, and the reason it cannot be an
   * `inline`. Where an inline expression's answer is *the value of what is
   * shown*, appending `= answer` states something true. Where a story's answer
   * is *a rewriting of* what is shown, no frame is appended at all. Here the
   * answer is neither: `3x + 5 = 20` evaluates to no number, and appending a
   * second equality would put `3x + 5 = 20 = 5` on screen — a false statement,
   * in the unit whose whole subject is that both sides of an equals sign hold
   * the same value. The same argument covers `x ≥ −2`, where the appended frame
   * would read `x ≥ −2 = closed`.
   *
   * The arm was written for equations and its first sentence used to end
   * "answered by the value of `variable` that makes it true". That was already
   * only usually so — `special-solutions` answers a solution *count*, which is
   * why 14b made the frame optional — and Unit 15 makes it the exception rather
   * than the rule: a relation's answer is a reading, a graph, a solved relation
   * or a count, and not one of the six is a value of anything. `variable` is set
   * where the answer *is* such a value, and `ProblemView` then frames the slot
   * as `x = ⟦slot⟧` beneath; where it is absent the frame row is dropped whole.
   *
   * `EquationData` keeps its name while carrying arms that are not equations.
   * The alternative was renaming the arm and the payload type across this file,
   * `ProblemView`, the recorded-output gate, the generator checks and Unit 14 —
   * a rename with no behaviour in it, and the arm renders, measures and
   * announces an inequality exactly as it does an equation.
   */
  | ({
      kind: 'equation'
      /**
       * The equation in plain characters. Three jobs at once, and they have to
       * stay one string: it is the row when there is no `notation`, it is the
       * accessible name when there is, and it is what independent verification
       * rebuilds from the carried values and compares against.
       */
      text: string
      /**
       * The label on the answer row — a letter for most skills, but `'each side'`
       * for `equation-balance`, so this is a label rather than a variable name.
       *
       * Omitted where the answer is *not* a value of anything the equation
       * solves for. `special-solutions` is the consumer: framing its slot would
       * draw `x = No solution`, asserting a solution exists in the one skill
       * whose question is whether it does.
       */
      variable?: string
      /**
       * The equation as structured notation, drawn instead of `text` when set.
       *
       * `with-fractions` is the consumer and the reason this exists: a fraction
       * written as a slash between plain characters is exactly the presentation
       * `math-notation` was built to replace, and the equation arm was the one
       * display with no way to avoid it.
       */
      notation?: MathNotation
    } & (
      | { equation: EquationData; polynomial?: never }
      | { polynomial: PolynomialData; equation?: never }
    ))

export type Problem = {
  skillId: string
  /** Short instruction, e.g. "What is the sum?" */
  prompt: string
  display: Display
  answer: Answer
  inputMode: 'keypad' | 'choice' | 'number-line' | 'expression' | 'coordinate-plane' | 'root-pair'
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
  /** One concise explanation shown before first practice, when this increment ships it. */
  teachingLine: string
  /**
   * Deliberately no `prerequisites`. What unlocks what is the manifest's, and
   * only the manifest's — see `unlockPrerequisites` in `curriculum/index.ts`. A
   * generator that also declared its edges would be a second graph nothing keeps
   * in step with the first.
   */
  generate(rng: import('./rng').Rng, difficulty: Difficulty): Problem
}
