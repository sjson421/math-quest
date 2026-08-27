import { intAnswer } from '../lib/answer'
import type { Misconception, Operator, SkillGenerator } from '../lib/types'
import {
  band,
  defineSkill,
  evaluateExpression as evaluate,
  foldInOrder,
  ignoringParentheses,
  op,
  renderExpression as render,
  type NumericExpression as Expression,
} from './engine'
import type { ProblemSpec } from './engine'

export { foldInOrder, ignoringParentheses, op } from './engine'
export { evaluateExpression as evaluate, renderExpression as render } from './engine'
export type { NumericExpression as Expression } from './engine'

/**
 * Unit 5 · Order of Operations.
 *
 * The first unit whose problems are expressions rather than a pair of operands,
 * and the first where reading left to right gives the wrong answer. Everything
 * a skill here needs — the display, the correct answer, and the value each
 * predicted mistake produces — comes off one tree, so a diagnosis cannot drift
 * away from the arithmetic it diagnoses.
 *
 * `generators.test.ts` parses the rendered string back and evaluates it with its
 * own parser. That duplication is the point: a helper shared with the check
 * verifies nothing, and a precedence bug now has to be made twice, by two
 * different methods, to survive.
 *
 * Unit 12 became the second consumer of the numeric expression tree, so that
 * model now lives in `engine/`. The Unit 5 skill wording and problem shapes stay
 * local here; only the shared structure, rendering, and evaluation moved.
 */

// ---------------------------------------------------------------------------
// Shared wording
// ---------------------------------------------------------------------------

/** The name of an operation, for a sentence that has to say which comes first. */
const NAMED: Record<Operator, string> = {
  '+': 'addition',
  '−': 'subtraction',
  '×': 'multiplication',
  '÷': 'division',
}

const working = (node: Expression) => `${render(node)} = ${evaluate(node)}`

/**
 * One tree, shown and answered.
 *
 * Every skill here asks the same question of a different expression, so the
 * display and the answer are taken from the same node by construction. Written
 * out per skill they were six chances to render one tree and answer another —
 * which type-checks, and which is the single worst defect this app can ship.
 */
const valueOf = (
  tree: Expression,
  rest: Pick<ProblemSpec, 'misconceptions' | 'hint' | 'solution'>,
): ProblemSpec => ({
  prompt: 'What is the value?',
  display: { kind: 'inline', text: render(tree) },
  answer: intAnswer(evaluate(tree)),
  ...rest,
})

/**
 * The step the learner is owed after doing the first one correctly.
 *
 * Every skill here predicts it, because getting the order right and then
 * stopping is a different mistake from getting the order wrong — and a wall
 * needs two distinct diagnoses on every problem, not on average.
 */
const stoppedEarly = (part: Expression, rest: string): Misconception => ({
  value: evaluate(part),
  tag: 'first-step-only',
  nudge: `That is ${render(part)} on its own. The ${rest} still has to happen.`,
})

// ---------------------------------------------------------------------------
// 5.1 · Two operations, no brackets
// ---------------------------------------------------------------------------

const twoOperations = defineSkill({
  id: 'two-operations',
  name: 'Two Operations',
  blurb: '3 + 4 × 2',
  teachingLine: 'Multiply or divide before adding or subtracting.',
  build({ rng, difficulty }) {
    const [factorMin, factorMax] = band(difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [2, 7],
      4: [3, 9],
      5: [4, 12],
    })
    const [termMin, termMax] = band(difficulty, {
      1: [2, 9],
      2: [3, 14],
      3: [4, 22],
      4: [6, 35],
      5: [8, 50],
    })

    // The multiplication sits second on roughly two problems in three, because
    // that is the half where reading left to right actually fails and the skill
    // is named for that instinct. The other third is not decoration: without it
    // "always do the last one first" passes every problem, which is a different
    // wrong rule rather than the one being unlearned.
    const multiplySecond = rng.bool(0.65)
    const subtract = rng.bool(0.4)
    const additive: Operator = subtract ? '−' : '+'

    const b = rng.int(factorMin, factorMax)
    // Drawn before the branch, and unconditionally, because the draw order is
    // part of what a seed means — pushing it inside would repoint every recorded
    // problem in the skill.
    const factor = rng.int(factorMin, factorMax)

    // Whichever shape is drawn, the lesson and the second diagnosis are the
    // same: multiply first, then do the rest. Only the tree and the way the
    // order is got wrong actually differ.
    const shaped = (tree: Expression, x: number, y: number, wrong: Misconception) => {
      const multiplication = op(x, '×', y)
      return valueOf(tree, {
        misconceptions: [wrong, stoppedEarly(multiplication, NAMED[additive])],
        hint: `Multiply ${x} and ${y} before the ${NAMED[additive]}.`,
        solution: [
          { text: `Multiplication comes before ${NAMED[additive]}.` },
          { text: 'Multiply first.', detail: working(multiplication) },
          { text: `Then the ${NAMED[additive]}.`, detail: working(tree) },
        ],
      })
    }

    if (multiplySecond) {
      const product = b * factor
      // `a − b × c` needs a above the product, or the difference is negative.
      // The two excluded values are where a prediction would land on another:
      // at 2bc the product equals the answer, and at 2b it equals the
      // left-to-right value. Two points out of a wide band, which is what
      // reject-and-retry is for — the structural constraint is composed above it.
      const a = subtract
        ? rng.intExcept(product + 1, product + termMax, [2 * product, 2 * b])
        : rng.int(termMin, termMax)
      const tree = op(a, additive, op(b, '×', factor))

      return shaped(tree, b, factor, {
        value: foldInOrder(tree),
        tag: 'left-to-right',
        nudge: `Reading straight across skips ahead. ${b} × ${factor} is done first.`,
      })
    }

    // `a × b − c` keeps the subtrahend under b so the right-to-left value stays
    // positive. This shape draws its own multiplicand and addend, so the draw
    // above goes unused here — deliberately, per the note on it: it is spent to
    // keep both shapes at the same position in the seed's stream.
    const a = rng.int(Math.max(2, factorMin), factorMax)
    const addend = subtract ? rng.int(1, b - 1) : rng.int(termMin, termMax)
    const tree = op(op(a, '×', b), additive, addend)

    return shaped(tree, a, b, {
      value: evaluate(op(a, '×', op(b, additive, addend))),
      tag: 'right-to-left',
      nudge: `That does the ${NAMED[additive]} first. ${a} × ${b} comes before it.`,
    })
  },
})

// ---------------------------------------------------------------------------
// 5.2 · Brackets change the order
// ---------------------------------------------------------------------------

const withParentheses = defineSkill({
  id: 'with-parentheses',
  name: 'Parentheses First',
  blurb: 'Brackets change the order',
  teachingLine: 'Work inside parentheses before using operations outside them.',
  build({ rng, difficulty }) {
    const [factorMin, factorMax] = band(difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [2, 7],
      4: [3, 9],
      5: [4, 11],
    })
    const [termMin, termMax] = band(difficulty, {
      1: [2, 9],
      2: [3, 13],
      3: [4, 20],
      4: [5, 30],
      5: [7, 45],
    })

    const subtract = rng.bool(0.4)
    const additive: Operator = subtract ? '−' : '+'
    // A subtracting group always sits on the right, and that is arithmetic
    // rather than taste. Dropping the brackets on `(a − b) × c` leaves
    // `a − b × c`, so the minuend has to clear the product or the prediction is
    // negative and unreachable on a digit keypad — which forces three-digit
    // operands into a unit whose arithmetic is meant to be already fluent.
    // `c × (a − b)` drops to `c × a − b`, which is positive for free.
    const groupFirst = !subtract && rng.bool()

    const c = rng.int(factorMin, factorMax)
    const b = rng.int(termMin, termMax)
    const a = subtract ? rng.int(b + 1, b + termMax) : rng.int(termMin, termMax)

    const group = op(a, additive, b)
    const tree = groupFirst ? op(group, '×', c) : op(c, '×', group)

    return valueOf(tree, {
      misconceptions: [
        {
          value: ignoringParentheses(tree),
          tag: 'ignored-parentheses',
          nudge: `That works without the brackets. ${render(group)} is done first.`,
        },
        stoppedEarly(group, 'multiplication'),
      ],
      hint: `Work out ${render(group)} before multiplying.`,
      solution: [
        { text: 'Brackets come before everything else.' },
        { text: 'Work out the brackets first.', detail: working(group) },
        { text: 'Then multiply.', detail: working(tree) },
      ],
    })
  },
})

// ---------------------------------------------------------------------------
// 5.3 · The whole rule
// ---------------------------------------------------------------------------

const pemdas = defineSkill({
  id: 'pemdas',
  name: 'Full Order of Operations',
  blurb: 'PEMDAS, without exponents yet',
  teachingLine: 'Use parentheses first, then multiply or divide left to right, then add or subtract left to right.',
  build({ rng, difficulty }) {
    // Tighter than the other two skills at every level, and that is the display
    // rather than the arithmetic: four operands and a bracket pair reach 18
    // characters, which is the widest `ProblemView` sizes for. A learner reaching
    // 5.3 has already done harder sums in Units 3 and 4.
    const [factorMin, factorMax] = band(difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [2, 6],
      4: [3, 8],
      5: [3, 10],
    })
    const [termMin, termMax] = band(difficulty, {
      1: [2, 8],
      2: [3, 12],
      3: [4, 18],
      4: [5, 26],
      5: [6, 38],
    })

    // Two families, because neither alone covers the rule. Brackets have nothing
    // to change without operations from both tiers, and PEMDAS read as six
    // ordered steps has nowhere to show itself without two operations from one.
    if (rng.bool()) {
      const b = rng.int(1, Math.max(2, factorMax - 1))
      const a = rng.int(b + 2, b + termMax)
      const c = rng.int(factorMin, factorMax)
      const d = rng.int(termMin, termMax)
      const group = op(a, '−', b)
      const tree = op(d, '+', op(c, '×', group))

      return valueOf(tree, {
        misconceptions: [
          {
            value: ignoringParentheses(tree),
            tag: 'ignored-parentheses',
            nudge: `That multiplies by ${a} alone. The brackets take ${render(group)} first.`,
          },
          {
            value: foldInOrder(tree),
            tag: 'left-to-right',
            nudge: 'That works straight across. Brackets first, then multiply, then add.',
          },
        ],
        hint: 'Take the brackets, then the multiplication, then the addition.',
        solution: [
          { text: 'Brackets, then multiply, then add.' },
          { text: 'Start inside the brackets.', detail: working(group) },
          { text: 'Multiply that.', detail: working(op(c, '×', group)) },
          { text: 'Then add.', detail: working(tree) },
        ],
      })
    }

    /**
     * `a ∘ b ∘' c` where both operators share a tier, so the rule is left to
     * right and PEMDAS's letters are the trap.
     *
     * Both families are the same three sentences over the same shape, so the
     * diagnosis is written once. Two copies would let a fix to the tier
     * explanation land on division and silently not on subtraction — and that
     * diagnosis is the whole of what separates 5.3 from 5.1.
     */
    const sameTier = (
      a: number,
      first: Operator,
      b: number,
      second: Operator,
      c: number,
      words: { rank: string; lead: string; then: string },
    ) => {
      const leading = op(a, first, b)
      const tree = op(leading, second, c)

      return valueOf(tree, {
        misconceptions: [
          {
            value: evaluate(op(a, first, op(b, second, c))),
            tag: 'pemdas-letter-order',
            nudge: `PEMDAS is tiers, not steps. ${render(leading)} is leftmost, so it goes first.`,
          },
          stoppedEarly(leading, NAMED[second]),
        ],
        hint: `${words.lead} left to right, starting at ${render(leading)}.`,
        solution: [
          { text: words.rank },
          { text: 'So work left to right.', detail: working(leading) },
          { text: words.then, detail: working(tree) },
        ],
      })
    }

    const divide = rng.bool()

    if (divide) {
      // Composed from the quotient outward. Drawing a dividend and filtering for
      // one that divides by b and again by b × c is three properties at once,
      // which is the shape that exhausted `sub-across-zero`'s draw in front of a
      // learner. Here exactness is structural.
      const b = rng.int(2, 6)
      // Never the divisor: at b === c the answer is the dividend unchanged, and
      // a problem that appears to do nothing teaches nothing.
      const c = rng.intExcept(2, 5, [b])
      const quotient = rng.int(factorMin, factorMax)
      const a = quotient * b * c

      return sameTier(a, '÷', b, '×', c, {
        rank: 'Divide and multiply rank equally.',
        lead: 'Divide and multiply',
        then: 'Then multiply.',
      })
    }

    const b = rng.int(termMin, termMax)
    const c = rng.int(termMin, termMax)
    const a = rng.int(b + c + 1, b + c + termMax)

    return sameTier(a, '−', b, '+', c, {
      rank: 'Adding and subtracting rank equally.',
      lead: 'Add and subtract',
      then: 'Then add.',
    })
  },
})

export const unit05: SkillGenerator[] = [twoOperations, withParentheses, pemdas]
