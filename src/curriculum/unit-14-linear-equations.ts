import { intAnswer } from '../lib/answer'
import { entryLabel } from '../lib/keypad'
import { band, defineSkill, drawn, padFor, term, type BuildContext, type Ladder } from './engine'
import { EQUATION_FRAMES, equationStoryProblem } from './phrasing/equations'
import type { MathNotation, Misconception } from '../lib/types'

/**
 * Unit 14a · Linear Equations, the first six.
 *
 * The course's first content to display an *equation* — a statement that
 * already carries its relation. Every skill here answers with a number on the
 * existing keypad, so nothing new was needed below `Display`.
 *
 * **Every draw composes; none filters.** The skills solve for x, so a drawn
 * equation would have to be rejected until its solution came out whole, and
 * three of them need a *predicted mistake* to come out whole as well — several
 * independent divisibility properties at once, which is the shape that
 * exhausted `sub-across-zero`'s draw in front of a learner. Each generator here
 * picks the value its predictions divide by first and builds the equation
 * around it, so every property holds by construction and no draw can fail.
 *
 * **A fractional prediction here is dead, not dropped, and that is the trap.**
 * The obvious worry is that `generateProblem` filters it — it does not.
 * Filtering removes predictions equal to the answer, duplicates, and values
 * that are not finite, and `8 ÷ 6` is perfectly finite. So it survives, counts
 * as a surviving diagnosis, satisfies `alwaysFiltered`, and is a value the
 * whole-number keypad can never submit. `one-step-multdiv` shipped one in a
 * first draft and nothing in the existing suite objected. The unit's own tests
 * check every predicted value for integrality across all six skills.
 *
 * Three of the six reach `padFor`'s sign key, and none of them for its own
 * answer: `vars-both-sides` always predicts the negation of its answer,
 * `one-step-addsub` predicts below zero whenever the constant outruns the
 * solution twice over, and `equation-balance` does when the change is more than
 * half the total. `one-step-multdiv` and `equation-parentheses` are positive by
 * construction and never see it — they call `padFor` anyway, so the rule stays
 * one rule rather than a per-skill judgement.
 */

const VARIABLE = 'x'

const TOTAL_BAND: Ladder = {
  1: [3, 8],
  2: [4, 12],
  3: [5, 18],
  4: [6, 25],
  5: [8, 40],
}

const CHANGE_BAND: Ladder = {
  1: [2, 5],
  2: [2, 8],
  3: [3, 12],
  4: [4, 16],
  5: [5, 20],
}

/**
 * 14.1 · The axiom the rest of the unit rests on.
 *
 * No variable and nothing to isolate. An earlier draft asked which operation
 * undoes `x + 7 = 12`, which is answerable by reading 7 off the screen and is
 * anyway 14.2's question asked one step earlier. This asks what the learner has
 * to believe before any of that: apply the same thing to both sides and the
 * equality survives.
 */
const equationBalance = defineSkill({
  id: 'equation-balance',
  name: 'Keeping the Balance',
  blurb: 'Both sides stay equal',
  build(context: BuildContext) {
    const [totalMin, totalMax] = band(context.difficulty, TOTAL_BAND)
    const [changeMin, changeMax] = band(context.difficulty, CHANGE_BAND)
    const total = context.rng.int(totalMin, totalMax)
    const first = context.rng.int(1, total - 1)
    const second = total - first
    const adds = context.rng.bool()
    // Subtracting has to leave both sides at or above zero: this is Stage E, but
    // the skill is about balance, not about signs, and a negative here would
    // want a sign key for a reason that has nothing to do with what it teaches.
    // Only the ceiling needs clamping — `TOTAL_BAND`'s minimum is above
    // `CHANGE_BAND`'s at every difficulty, so the draw cannot start above it.
    const change = adds
      ? context.rng.int(changeMin, changeMax)
      : context.rng.int(changeMin, Math.min(changeMax, total))
    const answer = adds ? total + change : total - change

    const misconceptions: Misconception[] = [
      {
        value: total,
        tag: 'changed-one-side-only',
        nudge: 'That is the total before the change — it happens to both sides, not one.',
      },
      {
        // Goes below zero whenever the change is more than half the total, which
        // is why this skill declares a sign key despite answering positively.
        value: adds ? total + change * 2 : total - change * 2,
        tag: 'applied-change-twice',
        nudge: 'Each side changes by that amount once, not twice.',
      },
    ]

    return {
      prompt: `${adds ? 'Add' : 'Subtract'} ${change} ${adds ? 'to' : 'from'} both sides. What does each side equal?`,
      display: {
        kind: 'equation',
        text: `${first} + ${second} = ${total}`,
        variable: 'each side',
        equation: { operation: 'balance', first, second, change, adds },
      },
      answer: intAnswer(answer),
      keypad: padFor(answer, misconceptions),
      misconceptions,
      hint: 'Whatever happens to one side happens to the other, so both land on the same value.',
      solution: [
        { text: 'Both sides start equal.', detail: `${first} + ${second} = ${total}` },
        {
          text: `${adds ? 'Add' : 'Subtract'} the same amount ${adds ? 'to' : 'from'} each.`,
          detail: `${total} ${adds ? '+' : '−'} ${change} = ${answer}`,
        },
      ],
    }
  },
})

const SOLUTION_BAND: Ladder = {
  1: [2, 6],
  2: [3, 9],
  3: [4, 12],
  4: [5, 16],
  5: [6, 20],
}

const ADDSUB_CONSTANT_BAND: Ladder = {
  1: [2, 6],
  2: [3, 9],
  3: [4, 12],
  4: [5, 15],
  5: [6, 19],
}

const oneStepAddSub = defineSkill({
  id: 'one-step-addsub',
  name: 'One Step: Add or Subtract',
  blurb: 'Undo a + or −',
  build(context: BuildContext) {
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [constMin, constMax] = band(context.difficulty, ADDSUB_CONSTANT_BAND)
    const solution = context.rng.int(solMin, solMax)
    const constant = context.rng.int(constMin, constMax)
    const adds = context.rng.bool()
    const rightHand = adds ? solution + constant : solution - constant

    const misconceptions: Misconception[] = [
      {
        // The equation's own operation repeated instead of reversed.
        value: adds ? rightHand + constant : rightHand - constant,
        tag: 'repeated-operation',
        nudge: `The equation ${adds ? 'adds' : 'subtracts'}, so undo it by ${adds ? 'subtracting' : 'adding'}.`,
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: `${VARIABLE} ${adds ? '+' : '−'} ${constant} = ${drawn(rightHand)}`,
        variable: VARIABLE,
        equation: { operation: 'one-step-addsub', constant, adds, rightHand },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Do the opposite operation to both sides.',
      solution: [
        {
          text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides.`,
          detail: `${VARIABLE} = ${drawn(rightHand)} ${adds ? '−' : '+'} ${constant}`,
        },
        { text: 'That leaves x alone.', detail: `${VARIABLE} = ${solution}` },
      ],
    }
  },
})

const COEFFICIENT_BAND: Ladder = {
  1: [2, 4],
  2: [2, 6],
  3: [3, 8],
  4: [3, 10],
  5: [4, 12],
}

/**
 * The division family's own coefficient, kept small — and the reason is the
 * prediction, not the answer.
 *
 * `x ÷ a = c` is undone by multiplying, and the mistake is dividing again,
 * which is `c ÷ a`. That is a whole number only when the coefficient divides
 * the right-hand side, so this family composes `c = a · m` and the solution
 * becomes `a² · m`. Squaring is what makes the coefficient's range matter: at
 * `a = 12` the answers reach the hundreds for a skill about undoing one
 * operation. Levels 4 and 5 share a ceiling deliberately: the squaring means
 * the answers grow with `m` alone from there.
 *
 * This is the family the header's dead-not-dropped note is about.
 */
const DIVISION_COEFF_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 5],
  4: [3, 6],
  5: [3, 6],
}

const DIVISION_INNER_BAND: Ladder = {
  1: [2, 5],
  2: [2, 6],
  3: [3, 8],
  4: [3, 9],
  5: [4, 10],
}

const oneStepMultDiv = defineSkill({
  id: 'one-step-multdiv',
  name: 'One Step: Multiply or Divide',
  blurb: 'Undo a × or ÷',
  build(context: BuildContext) {
    const multiplies = context.rng.bool()
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [coeffMin, coeffMax] = band(
      context.difficulty,
      multiplies ? COEFFICIENT_BAND : DIVISION_COEFF_BAND,
    )
    const [innerMin, innerMax] = band(context.difficulty, DIVISION_INNER_BAND)
    const coefficient = context.rng.int(coeffMin, coeffMax)
    // Both families compose from the right-hand side rather than drawing the
    // solution, because both predictions run *through* that side: multiplying
    // again is `c × a`, dividing again is `c ÷ a`, and only the second imposes
    // anything — it wants the coefficient to divide `c`, which is what the
    // inner multiplier gives.
    const rightHand = multiplies
      ? context.rng.int(solMin, solMax) * coefficient
      : context.rng.int(innerMin, innerMax) * coefficient
    const solution = multiplies ? rightHand / coefficient : rightHand * coefficient

    const misconceptions: Misconception[] = [
      {
        value: multiplies ? rightHand * coefficient : rightHand / coefficient,
        tag: 'repeated-operation',
        nudge: `The equation ${multiplies ? 'multiplies' : 'divides'}, so undo it by ${multiplies ? 'dividing' : 'multiplying'}.`,
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: multiplies
          ? `${coefficient}${VARIABLE} = ${drawn(rightHand)}`
          : `${VARIABLE} ÷ ${coefficient} = ${drawn(rightHand)}`,
        variable: VARIABLE,
        equation: { operation: 'one-step-multdiv', coefficient, multiplies, rightHand },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Do the opposite operation to both sides.',
      solution: [
        {
          text: `${multiplies ? 'Divide' : 'Multiply'} both sides by ${coefficient}.`,
          detail: `${VARIABLE} = ${drawn(rightHand)} ${multiplies ? '÷' : '×'} ${coefficient}`,
        },
        { text: 'That leaves x alone.', detail: `${VARIABLE} = ${solution}` },
      ],
    }
  },
})

/**
 * How many coefficients the constant is worth — never zero.
 *
 * Shared by `two-step` and `equation-parentheses`, which want it for the same
 * reason: each has a predicted mistake that divides by the coefficient, so the
 * mistake is whole only when the coefficient divides the constant. Composing
 * the constant as `a·k` gives that, and starting `k` at one is what keeps the
 * prediction off the correct answer — at `k = 0` `two-step`'s two predictions
 * both collapse onto it.
 *
 * One ladder rather than two: they shipped identical element for element, and
 * two names for one set of numbers reads as a distinction that does not exist.
 */
const MULTIPLIER_BAND: Ladder = {
  1: [1, 2],
  2: [1, 3],
  3: [1, 4],
  4: [2, 5],
  5: [2, 6],
}

/**
 * The coefficient, never one.
 *
 * At `a = 1` the wrong-order mistake — dividing before undoing the constant —
 * *is* the correct answer, because dividing by one does nothing. The wall would
 * then predict its own answer and the prediction would be filtered away, on
 * exactly the skill that owes two surviving diagnoses.
 */
const TWO_STEP_COEFF_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 6],
  4: [3, 8],
  5: [3, 9],
}

const twoStep = defineSkill({
  id: 'two-step',
  name: 'Two Steps',
  blurb: 'Undo in the right order',
  build(context: BuildContext) {
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [coeffMin, coeffMax] = band(context.difficulty, TWO_STEP_COEFF_BAND)
    const [multMin, multMax] = band(context.difficulty, MULTIPLIER_BAND)
    const coefficient = context.rng.int(coeffMin, coeffMax)
    const multiplier = context.rng.int(multMin, multMax)
    const constant = coefficient * multiplier
    const adds = context.rng.bool()
    // A subtraction has to leave the right-hand side at or above zero, so the
    // solution clears the multiple the constant takes away.
    const solution = adds
      ? context.rng.int(solMin, solMax)
      : context.rng.int(solMin + multiplier, solMax + multiplier)
    const rightHand = adds ? coefficient * solution + constant : coefficient * solution - constant

    // Both whole by construction: `rightHand` and `constant` are multiples of
    // `coefficient`, so every division below is exact.
    const wrongOrder = adds ? rightHand / coefficient - constant : rightHand / coefficient + constant
    const wrongSign = adds
      ? (rightHand + constant) / coefficient
      : (rightHand - constant) / coefficient

    const misconceptions: Misconception[] = [
      {
        value: wrongOrder,
        tag: 'undid-in-wrong-order',
        nudge: 'Undo the + or − first, and divide by the coefficient last.',
      },
      {
        value: wrongSign,
        tag: 'undid-with-wrong-sign',
        nudge: `The equation ${adds ? 'adds' : 'subtracts'} that number, so undo it by ${adds ? 'subtracting' : 'adding'}.`,
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: `${coefficient}${VARIABLE} ${adds ? '+' : '−'} ${constant} = ${drawn(rightHand)}`,
        variable: VARIABLE,
        equation: { operation: 'two-step', coefficient, constant, adds, rightHand },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Undo the addition or subtraction first, then the multiplication.',
      solution: [
        {
          text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides.`,
          detail: `${coefficient}${VARIABLE} = ${coefficient * solution}`,
        },
        {
          text: `Divide both sides by ${coefficient}.`,
          detail: `${VARIABLE} = ${solution}`,
        },
      ],
    }
  },
})

const GAP_BAND: Ladder = {
  1: [1, 3],
  2: [2, 4],
  3: [2, 6],
  4: [3, 7],
  5: [3, 9],
}

const varsBothSides = defineSkill({
  id: 'vars-both-sides',
  name: 'Variables on Both Sides',
  blurb: 'Gather the terms first',
  build(context: BuildContext) {
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [coeffMin, coeffMax] = band(context.difficulty, COEFFICIENT_BAND)
    const [gapMin, gapMax] = band(context.difficulty, GAP_BAND)
    const rightCoefficient = context.rng.int(coeffMin, coeffMax)
    // The gap is drawn rather than the second coefficient, so the two can never
    // land equal — at which point the variable cancels and there is no solution
    // to find, which is 14.8's subject rather than this one's.
    const gap = context.rng.int(gapMin, gapMax)
    const leftCoefficient = rightCoefficient + gap
    const solution = context.rng.int(solMin, solMax)
    // A multiple of the gap, so "left the constants where they were" divides
    // exactly. Without it that prediction is a fraction on most draws and is
    // dropped before anyone sees it.
    const leftConstant = gap * context.rng.int(1, 4)
    const rightConstant = gap * solution + leftConstant

    const misconceptions: Misconception[] = [
      {
        // Subtracting the larger coefficient from the smaller negates the gap,
        // and with it the answer.
        value: -solution,
        tag: 'gathered-wrong-direction',
        nudge: 'Take the smaller x term from the larger so the coefficient stays positive.',
      },
      {
        value: rightConstant / gap,
        tag: 'left-constants-unmoved',
        nudge: 'The constants move to the other side too, not just the x terms.',
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text:
          `${leftCoefficient}${VARIABLE} + ${leftConstant} = ` +
          `${rightCoefficient}${VARIABLE} + ${rightConstant}`,
        variable: VARIABLE,
        equation: {
          operation: 'vars-both-sides',
          leftCoefficient,
          leftConstant,
          rightCoefficient,
          rightConstant,
        },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Move the x terms to one side and the plain numbers to the other.',
      solution: [
        {
          text: `Subtract ${rightCoefficient}${VARIABLE} from both sides.`,
          detail: `${gap}${VARIABLE} + ${leftConstant} = ${rightConstant}`,
        },
        {
          text: `Subtract ${leftConstant} from both sides.`,
          detail: `${gap}${VARIABLE} = ${gap * solution}`,
        },
        { text: `Divide both sides by ${gap}.`, detail: `${VARIABLE} = ${solution}` },
      ],
    }
  },
})

const equationParentheses = defineSkill({
  id: 'equation-parentheses',
  name: 'Equations with Parentheses',
  blurb: 'Distribute, then solve',
  build(context: BuildContext) {
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [coeffMin, coeffMax] = band(context.difficulty, TWO_STEP_COEFF_BAND)
    const [multMin, multMax] = band(context.difficulty, MULTIPLIER_BAND)
    const coefficient = context.rng.int(coeffMin, coeffMax)
    const constant = coefficient * context.rng.int(multMin, multMax)
    const adds = context.rng.bool()
    const solution = adds
      ? context.rng.int(solMin, solMax)
      : context.rng.int(solMin + constant, solMax + constant)
    const rightHand = adds ? coefficient * (solution + constant) : coefficient * (solution - constant)

    const misconceptions: Misconception[] = [
      {
        value: adds ? (rightHand - constant) / coefficient : (rightHand + constant) / coefficient,
        tag: 'distributed-first-term-only',
        nudge: 'The number outside multiplies both terms in the bracket, not just the x.',
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: `${coefficient}(${VARIABLE} ${adds ? '+' : '−'} ${constant}) = ${drawn(rightHand)}`,
        variable: VARIABLE,
        equation: { operation: 'parentheses', coefficient, constant, adds, rightHand },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Multiply the bracket out first, or divide both sides by the number outside.',
      solution: [
        {
          text: `Divide both sides by ${coefficient}.`,
          detail: `${VARIABLE} ${adds ? '+' : '−'} ${constant} = ${drawn(rightHand / coefficient)}`,
        },
        {
          text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides.`,
          detail: `${VARIABLE} = ${solution}`,
        },
      ],
    }
  },
})

/**
 * Unit 14b · the four that close the unit.
 *
 * Three of them ask the equation display something 14a's plain-text row could
 * not say, and each extension has exactly one consumer here: `with-fractions`
 * needs a stacked fraction, `special-solutions` needs the frame to go away, and
 * `equation-words` needs the prose display to carry equation terms.
 *
 * `rearrange-formula` is the one that looks like it needs new machinery and does
 * not. "Solve for y" reads like a two-variable answer with division in it, which
 * the shipped expression grammar admits neither of — but `y` is the frame label
 * and never typed, so the answer holds one letter, and composing the draw so the
 * subject's coefficient divides everything keeps division out of it entirely.
 */

const text = (value: string): MathNotation => ({ kind: 'text', value })

const fraction = (numerator: string, denominator: string): MathNotation => ({
  kind: 'fraction',
  numerator: text(numerator),
  denominator: text(denominator),
})

const DENOMINATOR_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 5],
  4: [3, 6],
  5: [3, 8],
}

/** The value `x / denominator` comes to — the solution is this times the denominator. */
const QUOTIENT_BAND: Ladder = {
  1: [2, 5],
  2: [2, 7],
  3: [3, 9],
  4: [3, 12],
  5: [4, 15],
}

const FRACTION_CONSTANT_BAND: Ladder = {
  1: [1, 3],
  2: [1, 4],
  3: [2, 6],
  4: [2, 8],
  5: [3, 10],
}

/**
 * 14.7 · The first equation the course draws rather than spells.
 *
 * Composed from the quotient rather than from the solution, which is the same
 * move the rest of the unit makes for a different divisibility: `x / d` has to
 * land on a whole number for the working to be followable, so the quotient is
 * drawn and the solution is `d × q`.
 *
 * A subtraction keeps the right-hand side at or above zero, so the quotient
 * clears the constant. Strictly, not loosely — at `q = c` the predicted mistake
 * equals the answer and the skill's only diagnosis disappears.
 */
const withFractions = defineSkill({
  id: 'with-fractions',
  name: 'Equations with Fractions',
  blurb: 'Clear the denominators',
  build(context: BuildContext) {
    const [denMin, denMax] = band(context.difficulty, DENOMINATOR_BAND)
    const [quotMin, quotMax] = band(context.difficulty, QUOTIENT_BAND)
    const [constMin, constMax] = band(context.difficulty, FRACTION_CONSTANT_BAND)
    const denominator = context.rng.int(denMin, denMax)
    const constant = context.rng.int(constMin, constMax)
    const adds = context.rng.bool()
    const quotient = adds
      ? context.rng.int(quotMin, quotMax)
      : context.rng.int(Math.max(quotMin, constant + 1), Math.max(quotMax, constant + 1))
    const rightHand = adds ? quotient + constant : quotient - constant
    const solution = denominator * quotient

    const misconceptions: Misconception[] = [
      {
        // Multiplying through on the left and forgetting the right. Goes below
        // zero when the constant outweighs the quotient, which is why this skill
        // reaches `padFor`'s sign key despite answering positively.
        value: adds ? rightHand - constant * denominator : rightHand + constant * denominator,
        tag: 'multiplied-one-side-only',
        nudge: 'The whole of the other side is multiplied too, not just the fraction.',
      },
    ]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: `${VARIABLE}/${denominator} ${adds ? '+' : '−'} ${constant} = ${drawn(rightHand)}`,
        variable: VARIABLE,
        equation: { operation: 'clear-fraction', denominator, constant, adds, rightHand },
        // The row is drawn, not spelled. `text` stays its name and the form the
        // carried values are checked against; a slash between characters is the
        // presentation item 17 exists to replace.
        notation: {
          kind: 'row',
          children: [
            fraction(VARIABLE, String(denominator)),
            text(` ${adds ? '+' : '−'} ${constant} = ${drawn(rightHand)}`),
          ],
        },
      },
      answer: intAnswer(solution),
      keypad: padFor(solution, misconceptions),
      misconceptions,
      hint: 'Multiply both sides by the denominator to clear the fraction.',
      solution: [
        {
          text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides.`,
          detail: `${VARIABLE}/${denominator} = ${quotient}`,
        },
        {
          text: `Multiply both sides by ${denominator}.`,
          detail: `${VARIABLE} = ${solution}`,
        },
      ],
    }
  },
})

const SPECIAL_COEFF_BAND: Ladder = {
  1: [2, 4],
  2: [2, 6],
  3: [3, 8],
  4: [3, 10],
  5: [4, 12],
}

const SPECIAL_CONSTANT_BAND: Ladder = {
  1: [1, 5],
  2: [2, 8],
  3: [2, 12],
  4: [3, 16],
  5: [4, 20],
}

/** The three outcomes, as stable ids. The labels are copy; these are the vocabulary. */
const OUTCOMES = [
  { id: 'none', label: 'No solution' },
  { id: 'infinite', label: 'Infinitely many solutions' },
  { id: 'one', label: 'Exactly one solution' },
] as const

/**
 * 14.8 · The answer is a property of the equation, not a value.
 *
 * All three cases are drawn, and the third is the one that makes the skill
 * honest: with only "none" and "infinitely many" on offer, noticing that the
 * variable appears twice is enough to be right half the time, and every earlier
 * skill in the unit has been a one-solution equation anyway.
 *
 * The frame is omitted. `x = ⟦No solution⟧` would assert that a solution exists
 * and then name it, in the skill whose question is whether one does.
 */
const specialSolutions = defineSkill({
  id: 'special-solutions',
  name: 'No Solution or Every Solution',
  blurb: 'When the variable disappears',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, SPECIAL_COEFF_BAND)
    const [constMin, constMax] = band(context.difficulty, SPECIAL_CONSTANT_BAND)
    const outcome = context.rng.pick(OUTCOMES).id
    const leftCoefficient = context.rng.int(coeffMin, coeffMax)
    const leftConstant = context.rng.int(constMin, constMax)
    // Composed per outcome rather than drawn and classified. Classifying a draw
    // would leave the mix to chance, and "infinitely many" needs two exact
    // coincidences that a random draw almost never produces.
    const rightCoefficient =
      outcome === 'one' ? context.rng.intExcept(coeffMin, coeffMax, [leftCoefficient]) : leftCoefficient
    const rightConstant =
      outcome === 'none'
        ? context.rng.intExcept(constMin, constMax, [leftConstant])
        : outcome === 'infinite'
          ? leftConstant
          : context.rng.int(constMin, constMax)

    // The mistake in every case is reading a cancelled variable as a verdict.
    // On a one-solution draw nothing cancels, and the mistake is expecting it to.
    const predicted = outcome === 'none' ? 'infinite' : 'none'
    const nudge =
      outcome === 'infinite'
        ? 'Both sides are the same statement, so every value of x works.'
        : outcome === 'none'
          ? 'The x terms cancel and the numbers left over disagree — nothing works.'
          : 'The x terms are different sizes, so they do not cancel.'

    return {
      prompt: 'How many solutions does this equation have?',
      display: {
        kind: 'equation',
        text:
          `${leftCoefficient}${VARIABLE} + ${leftConstant} = ` +
          `${rightCoefficient}${VARIABLE} + ${rightConstant}`,
        equation: {
          operation: 'special-solutions',
          letter: VARIABLE,
          leftCoefficient,
          leftConstant,
          rightCoefficient,
          rightConstant,
        },
      },
      answer: { kind: 'choice', id: outcome },
      inputMode: 'choice',
      choices: [...OUTCOMES],
      // Text-valued at the choice's id: a choice submits its id, and `diagnose`
      // matches a text prediction against the raw entry by exact string.
      misconceptions: [{ value: { kind: 'text', value: predicted }, tag: `expected-${predicted}`, nudge }],
      hint: 'Gather the x terms and see whether anything is left of them.',
      solution: [
        {
          // Where the coefficients match, the x terms are gone and writing `0x`
          // would show the learner a term that is not there — on the skill whose
          // whole subject is what it means for the variable to disappear.
          text: 'Take the smaller x term from both sides.',
          detail:
            rightCoefficient === leftCoefficient
              ? `${leftConstant} = ${rightConstant}`
              : `${leftConstant} = ${rightCoefficient - leftCoefficient}${VARIABLE} + ${rightConstant}`,
        },
        {
          text:
            outcome === 'one'
              ? 'An x term survives, so one value works.'
              : outcome === 'infinite'
                ? 'Both sides are identical, so every value works.'
                : 'No x is left and the numbers disagree.',
        },
      ],
    }
  },
})

/**
 * 14.9 · The same two-step equation, stated in prose.
 *
 * The prose is drawn from a fixed bank and the numbers are composed here, so a
 * sentence cannot disagree with the arithmetic it describes. The constant is a
 * multiple of the coefficient for the wrong-order prediction's sake — see the
 * bank, which states why in full.
 */
const equationWords = defineSkill({
  id: 'equation-words',
  name: 'Equation Word Problems',
  blurb: 'Build the equation',
  build(context: BuildContext) {
    const [solMin, solMax] = band(context.difficulty, SOLUTION_BAND)
    const [coeffMin, coeffMax] = band(context.difficulty, TWO_STEP_COEFF_BAND)
    const [multMin, multMax] = band(context.difficulty, MULTIPLIER_BAND)
    const coefficient = context.rng.int(coeffMin, coeffMax)
    const constant = coefficient * context.rng.int(multMin, multMax)
    const solution = context.rng.int(solMin, solMax)
    const frame = context.rng.pick(EQUATION_FRAMES)

    return equationStoryProblem(frame, {
      coefficient,
      constant,
      rightHand: coefficient * solution + constant,
    })
  },
})

const SUBJECT = 'y'


/**
 * The subject's coefficient, never one.
 *
 * At one, dividing both sides by it does nothing, so "divided only one term" —
 * the second of the two predicted mistakes — *is* the correct answer and is
 * filtered away. The same bound `two-step` and `equation-parentheses` carry, for
 * the same shape of reason.
 */
const SUBJECT_COEFF_BAND: Ladder = {
  1: [2, 3],
  2: [2, 4],
  3: [2, 5],
  4: [2, 6],
  5: [3, 8],
}

/** How many subject coefficients the other term is worth, and separately the constant. */
const REARRANGE_MULTIPLIER_BAND: Ladder = {
  1: [1, 3],
  2: [1, 4],
  3: [2, 6],
  4: [2, 8],
  5: [3, 10],
}

/**
 * 14.10 · Solve for y, and the reason Unit 16 waits on it.
 *
 * Two letters are on screen and exactly one is on the pad. `y` is the frame
 * label — the row reads `y = ⟦slot⟧` — and the answer is written in `x` alone,
 * which is what lets this ship against the single-variable grammar item 20b
 * built without widening it.
 *
 * Both the other coefficient and the constant are composed as multiples of the
 * subject's, so dividing through comes out whole and no division reaches the
 * answer. Filtering for that instead would want two divisibility properties at
 * once from one draw, which is the shape this unit rules out everywhere else.
 */
const rearrangeFormula = defineSkill({
  id: 'rearrange-formula',
  name: 'Rearranging a Formula',
  blurb: 'Solve for y',
  build(context: BuildContext) {
    const [coeffMin, coeffMax] = band(context.difficulty, SUBJECT_COEFF_BAND)
    const [multMin, multMax] = band(context.difficulty, REARRANGE_MULTIPLIER_BAND)
    const subjectCoefficient = context.rng.int(coeffMin, coeffMax)
    const termCoefficient = subjectCoefficient * context.rng.int(multMin, multMax)
    const constant = subjectCoefficient * context.rng.int(multMin, multMax)

    const coefficient = -termCoefficient / subjectCoefficient
    const intercept = constant / subjectCoefficient
    const canonical = `${term(coefficient, VARIABLE)}+${intercept}`

    return {
      prompt: 'Solve for y.',
      display: {
        kind: 'equation',
        text: `${subjectCoefficient}${SUBJECT} + ${termCoefficient}${VARIABLE} = ${drawn(constant)}`,
        variable: SUBJECT,
        equation: {
          operation: 'rearrange',
          subject: SUBJECT,
          term: VARIABLE,
          subjectCoefficient,
          termCoefficient,
          constant,
        },
      },
      answer: { kind: 'expression', canonical, variable: VARIABLE, form: 'expanded' },
      inputMode: 'expression',
      // Written exactly as the pad produces them — no spaces, ASCII `-` — since
      // a text prediction is matched against the raw entry by exact string.
      misconceptions: [
        {
          value: { kind: 'text', value: `${term(-coefficient, VARIABLE)}+${intercept}` },
          tag: 'moved-term-unchanged',
          nudge: 'The x term changes sign as it crosses the equals sign.',
        },
        {
          value: { kind: 'text', value: `${term(-termCoefficient, VARIABLE)}+${intercept}` },
          tag: 'divided-one-term-only',
          nudge: 'Dividing by the coefficient divides every term, not just the number.',
        },
      ],
      hint: 'Move the x term across, then divide the whole side by the y coefficient.',
      solution: [
        {
          text: `Subtract ${term(termCoefficient, VARIABLE)} from both sides.`,
          detail: `${term(subjectCoefficient, SUBJECT)} = ${drawn(constant)} − ${term(termCoefficient, VARIABLE)}`,
        },
        {
          text: `Divide every term by ${subjectCoefficient}.`,
          detail: `${SUBJECT} = ${entryLabel(term(coefficient, VARIABLE))} + ${intercept}`,
        },
      ],
    }
  },
})

export const unit14 = [
  equationBalance,
  oneStepAddSub,
  oneStepMultDiv,
  twoStep,
  varsBothSides,
  equationParentheses,
  withFractions,
  specialSolutions,
  equationWords,
  rearrangeFormula,
]
