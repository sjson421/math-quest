import { intAnswer } from '../lib/answer'
import type { Rng } from '../lib/rng'
import { band, defineSkill, drawn, padFor, type BuildContext, type Ladder } from './engine'
import type { Choice, EquationData, Misconception, Relation, SkillGenerator } from '../lib/types'

/**
 * Unit 15 · Inequalities.
 *
 * The course's first content whose answers are **relations rather than values**.
 * `−3x > 12` solves to `x < −4`, and a keypad can submit the `−4` and nothing
 * else — which drops the direction, on the unit whose wall is precisely that the
 * direction reverses. So five of the six skills answer through choice input,
 * where an option's label is a whole statement, and only `compound-inequalities`
 * takes the pad, because a count genuinely is a value.
 *
 * `graph-inequality` names its graph in words rather than drawing one, for a
 * reason recorded over the skill itself.
 *
 * **Every display is an `equation` arm, and the frame row follows the input
 * rather than the unit.** An inequality already carries its relation, so
 * appending `= answer` would draw `x ≥ −2 = closed`, and the five choice skills
 * drop the frame entirely — `special-solutions`' shape, for `special-solutions`'
 * reason. `compound-inequalities` keeps it, and only the browser said so: with
 * the frame dropped it had a keypad and no slot, so a learner pressed a digit
 * and nothing on screen moved. That is 14b's finding from the other side, a slot
 * with no pad becoming a pad with no slot, and the rule underneath both is that
 * the frame is a *claim* — the answer is a value of the thing named. False of a
 * graph or a solved relation, true of a count, which is why the label is `how
 * many` and why `variable` was always a label rather than a variable name.
 *
 * **The option order is drawn, not sorted, and that is not fussiness.** The
 * three distractors are derived *from* the answer — reverse its relation, swap
 * its strictness, substitute a wrong boundary — so any order that reads only the
 * options stays correlated with which is right. Sorting by relation under
 * `< ≤ > ≥` puts `solve-one-step-ineq`'s answer at position 1, 2, 2 and 3 as the
 * displayed relation runs through the four symbols: position 4 is never correct.
 * `special-solutions` sorts safely only because it draws its *answer* from a
 * fixed list, which is the opposite direction.
 *
 * **A predicted mistake here is not filtered against the answer.**
 * `generateProblem` drops a numeric prediction equal to the answer; for a choice
 * answer it compares against `Number(answer.id)`, which is `NaN` for `x<-4`, and
 * a text prediction is only checked for being empty or duplicated. Five of these
 * six skills predict text, so the unit's own tests assert no predicted identity
 * equals its problem's correct one — a gate that comes free everywhere else.
 */

const VARIABLE = 'x'

/** The reverse of a relation: what multiplying by a negative does to it. */
export const REVERSED: Record<Relation, Relation> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }

/**
 * The same direction with the boundary let in or shut out — `<` against `≤`.
 *
 * Named for what the learner gets wrong rather than for the symbol operation:
 * this is the open-or-closed circle of 15.2 and the "at most" against "less
 * than" of 15.1, which are one confusion in two representations.
 */
export const STRICTNESS_SWAPPED: Record<Relation, Relation> = {
  '<': '≤',
  '≤': '<',
  '>': '≥',
  '≥': '>',
}

/** Whether the relation excludes its own boundary — an open circle. */
export const isStrict = (relation: Relation): boolean => relation === '<' || relation === '>'

/** Whether the relation admits values above the boundary — shading to the right. */
export const pointsUp = (relation: Relation): boolean => relation === '>' || relation === '≥'

export const RELATIONS: readonly Relation[] = ['<', '≤', '>', '≥']

/**
 * A relation as the checker reads it.
 *
 * The learner-facing `≤` is one character; a choice's *id* is matched against a
 * predicted mistake by exact string and is never drawn, so it spells the same
 * relation in plain characters. This is the split `number-line.ts` keeps between
 * `tickEntry` and `tickLabel`, one level up: the two forms meet here, where the
 * difference is the point, instead of drifting apart at whichever call site got
 * the wrong one.
 */
const ASCII: Record<Relation, string> = { '<': '<', '≤': '<=', '>': '>', '≥': '>=' }

/** What choosing this relation submits, where the option *is* the relation. */
export const relationId = (relation: Relation): string => ASCII[relation]

/** The statement as the display draws it. */
const statementText = (relation: Relation, bound: number): string =>
  `${VARIABLE} ${relation} ${drawn(bound)}`

/** One solved statement about the variable: `x relation bound`. */
type Statement = { relation: Relation; bound: number }

type CompoundData = Extract<EquationData, { operation: 'inequality-compound' }>

/** What choosing this statement submits. Plain characters, never drawn. */
export const statementId = ({ relation, bound }: Statement): string =>
  `${VARIABLE}${ASCII[relation]}${bound}`

/** What the statement reads as. The same drawn form the display row uses. */
export const statementLabel = ({ relation, bound }: Statement): string =>
  statementText(relation, bound)

/**
 * Offer four options in an order drawn from this problem's own rng.
 *
 * Distinctness is checked rather than assumed: the callers build their four from
 * a correct answer and three transformations of it, and a draw that lets two
 * transformations agree would silently offer three options and two right ones.
 * A zero boundary is that draw — `x < 0` and `x < −0` are one option — which is
 * why `flip-the-sign` starts its magnitude at 2 rather than relying on this.
 */
export function offer(rng: Rng, choices: readonly Choice[]): Choice[] {
  if (choices.length !== 4) {
    throw new Error(`unit 15: expected four options, got ${choices.length}`)
  }
  if (new Set(choices.map((choice) => choice.id)).size !== 4) {
    throw new Error(`unit 15: options are not distinct: ${choices.map((c) => c.id).join(', ')}`)
  }
  return rng.shuffle(choices)
}

/** The four statements as options, in a drawn order. */
export const offerStatements = (rng: Rng, statements: readonly Statement[]): Choice[] =>
  offer(
    rng,
    statements.map((statement) => ({ id: statementId(statement), label: statementLabel(statement) })),
  )

/** Whether `value relation bound` holds. */
export const holds = (relation: Relation, value: number, bound: number): boolean =>
  relation === '<'
    ? value < bound
    : relation === '≤'
      ? value <= bound
      : relation === '>'
        ? value > bound
        : value >= bound

/**
 * How many whole numbers in the stated range satisfy a compound statement.
 *
 * Counted by testing every candidate rather than by arithmetic on the bounds.
 * The arithmetic is where the off-by-one lives — it is the mistake 15.6 exists
 * to diagnose — and a count that made it would agree with a generator that made
 * it too.
 */
export const satisfyingCount = (data: CompoundData): number => {
  let count = 0
  for (let value = 0; value <= data.rangeMax; value += 1) {
    const first = holds(data.firstRelation, value, data.firstBound)
    const second = holds(data.secondRelation, value, data.secondBound)
    if (data.form === 'or' ? first || second : first && second) count += 1
  }
  return count
}

const BOUND_BAND: Ladder = {
  1: [2, 9],
  2: [3, 15],
  3: [4, 25],
  4: [6, 50],
  5: [10, 99],
}

/**
 * How each relation reads in words.
 *
 * "At most" and "at least" rather than "less than or equal to": it is the
 * phrasing the GED uses, it is shorter on a phone, and it is the pairing that
 * makes the strictness mistake a different *word* rather than a missing clause.
 */
const READING: Record<Relation, (bound: number) => string> = {
  '<': (bound) => `${VARIABLE} is less than ${drawn(bound)}`,
  '≤': (bound) => `${VARIABLE} is at most ${drawn(bound)}`,
  '>': (bound) => `${VARIABLE} is more than ${drawn(bound)}`,
  '≥': (bound) => `${VARIABLE} is at least ${drawn(bound)}`,
}

/**
 * 15.1 · Reading the four symbols.
 *
 * The obvious first draft displays `7 __ 3` and offers the four symbols — and it
 * has no unique answer, which is worth writing down because the shape looks
 * right until the options are listed. Both `>` and `≥` are true of `7 __ 3`, and
 * both `≤` and `≥` are true of any equal pair; there is no draw over four
 * offered symbols with exactly one true option.
 *
 * So the statement is displayed and the *reading* is the answer. The four
 * readings are direction × strictness, which is the same 2×2 the rest of the
 * unit runs on and the same one 15.2 meets again as a drawing.
 */
const inequalitySymbols = defineSkill({
  id: 'inequality-symbols',
  name: 'Inequality Symbols',
  blurb: 'Read <, >, ≤ and ≥',
  teachingLine: 'An inequality shows which side is larger and whether the boundary is included.',
  build(context: BuildContext) {
    const [boundMin, boundMax] = band(context.difficulty, BOUND_BAND)
    const bound = context.rng.int(boundMin, boundMax)
    const relation = context.rng.pick(RELATIONS)

    const misconceptions: Misconception[] = [
      {
        value: { kind: 'text', value: relationId(REVERSED[relation]) },
        tag: 'direction-reversed',
        nudge: 'The symbol opens toward the larger side — check which way it faces.',
      },
      {
        value: { kind: 'text', value: relationId(STRICTNESS_SWAPPED[relation]) },
        tag: 'boundary-swapped',
        nudge: isStrict(relation)
          ? `With no line underneath, ${drawn(bound)} itself is left out.`
          : `The line underneath lets ${drawn(bound)} itself count.`,
      },
    ]

    return {
      prompt: 'What does this say?',
      display: {
        kind: 'equation',
        text: statementText(relation, bound),
        equation: { operation: 'inequality-meaning', relation, bound },
      },
      answer: { kind: 'choice', id: relationId(relation) },
      inputMode: 'choice',
      choices: offer(
        context.rng,
        RELATIONS.map((option) => ({ id: relationId(option), label: READING[option](bound) })),
      ),
      misconceptions,
      hint: 'Check which way the symbol opens, then look for a line underneath.',
      solution: [
        {
          text: 'Read the direction first.',
          detail: `${relation} keeps ${VARIABLE} ${pointsUp(relation) ? 'above' : 'below'} ${drawn(bound)}`,
        },
        {
          text: isStrict(relation)
            ? 'No line underneath, so the boundary is left out.'
            : 'The line underneath lets the boundary count.',
          detail: READING[relation](bound),
        },
      ],
    }
  },
})

/** Magnitudes only — `graph-inequality` draws the sign separately. */
const GRAPH_BOUND_BAND: Ladder = {
  1: [2, 6],
  2: [2, 9],
  3: [3, 14],
  4: [4, 22],
  5: [5, 35],
}

/** A graph named by its two features, which is what the option ids are. */
const graphId = (relation: Relation): string =>
  `${isStrict(relation) ? 'open' : 'closed'}-${pointsUp(relation) ? 'right' : 'left'}`

const graphLabel = (relation: Relation, bound: number): string =>
  `${isStrict(relation) ? 'Open' : 'Closed'} circle at ${drawn(bound)}, shaded ` +
  `${pointsUp(relation) ? 'right' : 'left'}`

/**
 * 15.2 · The graph, named rather than drawn.
 *
 * The roadmap left this skill's input mode open and offered "picks among
 * rendered lines (choice input, built)" as the cheap resolution. Choice input is
 * built; a choice that renders a line is not — `ChoiceInput` draws
 * `{choice.label}` and nothing else — so that fork was the same capability work
 * as growing `NumberLineInput`, which submits one tick's value and can express
 * neither an open circle nor a ray. This skill is that capability's only
 * consumer in the whole course, so it names its graph instead.
 *
 * The four options are the two features crossed, so neither can be read off the
 * other, and the bound takes either sign — otherwise "shaded right" is reliably
 * "toward the bigger-looking number" and the direction never has to be thought
 * about.
 */
const graphInequality = defineSkill({
  id: 'graph-inequality',
  name: 'Graphing an Inequality',
  blurb: 'Open or closed circle',
  teachingLine: 'Use an open circle for a strict boundary and a closed circle when included.',
  build(context: BuildContext) {
    const [magnitudeMin, magnitudeMax] = band(context.difficulty, GRAPH_BOUND_BAND)
    const magnitude = context.rng.int(magnitudeMin, magnitudeMax)
    const bound = context.rng.bool() ? -magnitude : magnitude
    const relation = context.rng.pick(RELATIONS)

    const misconceptions: Misconception[] = [
      {
        value: { kind: 'text', value: graphId(STRICTNESS_SWAPPED[relation]) },
        tag: 'circle-strictness',
        nudge: isStrict(relation)
          ? `${drawn(bound)} is not a solution here, so its circle stays open.`
          : `${drawn(bound)} is a solution here, so its circle is filled in.`,
      },
      {
        value: { kind: 'text', value: graphId(REVERSED[relation]) },
        tag: 'shaded-wrong-way',
        nudge: `Shading runs toward the numbers that satisfy it, ${pointsUp(relation) ? 'right' : 'left'} of ${drawn(bound)}.`,
      },
    ]

    return {
      prompt: 'What does the graph of this look like?',
      display: {
        kind: 'equation',
        text: statementText(relation, bound),
        equation: { operation: 'inequality-graph', relation, bound },
      },
      answer: { kind: 'choice', id: graphId(relation) },
      inputMode: 'choice',
      choices: offer(
        context.rng,
        RELATIONS.map((option) => ({ id: graphId(option), label: graphLabel(option, bound) })),
      ),
      misconceptions,
      hint: 'The line under the symbol fills the circle in.',
      solution: [
        {
          text: isStrict(relation)
            ? 'No line under the symbol, so the circle stays open.'
            : 'The line under the symbol fills the circle in.',
          detail: `circle at ${drawn(bound)}`,
        },
        {
          text: `Shade ${pointsUp(relation) ? 'right' : 'left'}, toward the ${pointsUp(relation) ? 'larger' : 'smaller'} numbers.`,
          detail: statementText(relation, bound),
        },
      ],
    }
  },
})

/**
 * A coefficient is written out here rather than through `engine/algebra.ts`'s
 * `term`, and the reason is one character: `term` emits an ASCII hyphen for a
 * negative coefficient, and `flip-the-sign` always displays one. Everything the
 * learner reads goes through `drawn`. The unit never draws a coefficient of ±1,
 * which is the other half of what `term` exists for.
 */

/**
 * The answer and the three distractors every solving skill offers beside it.
 *
 * Built from the answer by the two independent swaps plus one wrong boundary,
 * which is what makes the four exhaustive rather than authored: whatever the
 * learner got wrong, the option is there.
 */
const solvingOptions = (relation: Relation, bound: number, wrongBound: number): Statement[] => [
  { relation, bound },
  { relation, bound: wrongBound },
  { relation: REVERSED[relation], bound },
  { relation: STRICTNESS_SWAPPED[relation], bound },
]

const SOLUTION_BAND: Ladder = {
  1: [2, 9],
  2: [3, 14],
  3: [4, 20],
  4: [5, 30],
  5: [6, 45],
}

const CONSTANT_BAND: Ladder = {
  1: [2, 6],
  2: [2, 9],
  3: [3, 12],
  4: [4, 18],
  5: [5, 25],
}

const FACTOR_BAND: Ladder = {
  1: [2, 3],
  2: [2, 3],
  3: [2, 4],
  4: [2, 4],
  5: [3, 5],
}

const QUOTIENT_BAND: Ladder = {
  1: [2, 4],
  2: [2, 6],
  3: [3, 8],
  4: [3, 10],
  5: [4, 12],
}

/** Turning the symbol round where nothing calls for it — 15.5's lesson, applied too early. */
const needlessFlip = (relation: Relation, bound: number): Misconception => ({
  value: { kind: 'text', value: statementId({ relation: REVERSED[relation], bound }) },
  tag: 'flipped-without-a-negative',
  nudge: 'Only multiplying or dividing by a negative turns the symbol round.',
})

/**
 * 15.3 · One operation undone, and the whole relation answered.
 *
 * The answer is a statement rather than a number, and that is the unit's
 * decision rather than this skill's: `x > 5` and `x < 5` are different answers
 * with the same boundary, so a pad that submits `5` cannot distinguish them.
 *
 * Both families compose from the value the predictions divide by rather than
 * drawing and filtering, the rule 14a set down. The multiply and divide forms
 * are symmetric on purpose: both put `a·m` on the right, so one is the other
 * read backwards, and both the answer and the repeated-operation mistake come
 * out whole with no draw able to fail.
 */
const solveOneStepIneq = defineSkill({
  id: 'solve-one-step-ineq',
  name: 'One-Step Inequalities',
  blurb: 'Solve in a single move',
  teachingLine: 'Undo one operation on both sides without changing the inequality sign.',
  build(context: BuildContext) {
    const relation = context.rng.pick(RELATIONS)
    const scales = context.rng.bool()

    if (!scales) {
      const [solutionMin, solutionMax] = band(context.difficulty, SOLUTION_BAND)
      const [constantMin, constantMax] = band(context.difficulty, CONSTANT_BAND)
      const solution = context.rng.int(solutionMin, solutionMax)
      const constant = context.rng.int(constantMin, constantMax)
      const adds = context.rng.bool()
      const rightHand = adds ? solution + constant : solution - constant
      // Repeating the displayed operation instead of undoing it. Never equal to
      // the solution, because the constant is drawn from 2 upward.
      const repeated = adds ? rightHand + constant : rightHand - constant

      return {
        prompt: 'Solve for x.',
        display: {
          kind: 'equation',
          text: `${VARIABLE} ${adds ? '+' : '−'} ${constant} ${relation} ${drawn(rightHand)}`,
          equation: { operation: 'inequality-addsub', relation, constant, adds, rightHand },
        },
        answer: { kind: 'choice', id: statementId({ relation, bound: solution }) },
        inputMode: 'choice',
        choices: offerStatements(context.rng, solvingOptions(relation, solution, repeated)),
        misconceptions: [
          {
            value: { kind: 'text', value: statementId({ relation, bound: repeated }) },
            tag: 'repeated-the-operation',
            nudge: `Undo it: ${adds ? 'subtract' : 'add'} ${constant} on both sides instead.`,
          },
          needlessFlip(relation, solution),
        ],
        hint: 'Undo the operation on both sides and leave the symbol alone.',
        solution: [
          {
            text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides.`,
            detail: `${VARIABLE} ${relation} ${drawn(solution)}`,
          },
          { text: 'Nothing multiplies x, so the symbol stays as it is.' },
        ],
      }
    }

    const [factorMin, factorMax] = band(context.difficulty, FACTOR_BAND)
    const [quotientMin, quotientMax] = band(context.difficulty, QUOTIENT_BAND)
    const coefficient = context.rng.int(factorMin, factorMax)
    const multiplier = context.rng.int(quotientMin, quotientMax)
    const rightHand = coefficient * multiplier
    const multiplies = context.rng.bool()
    // `a·x R a·m` solves to `m`; `x ÷ a R a·m` solves to `a²·m`. The repeated
    // operation is the other one of the pair, so both are whole by construction.
    const solution = multiplies ? multiplier : coefficient * rightHand
    const repeated = multiplies ? coefficient * rightHand : multiplier

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: multiplies
          ? `${coefficient}${VARIABLE} ${relation} ${drawn(rightHand)}`
          : `${VARIABLE} ÷ ${coefficient} ${relation} ${drawn(rightHand)}`,
        equation: { operation: 'inequality-multdiv', relation, coefficient, multiplies, rightHand },
      },
      answer: { kind: 'choice', id: statementId({ relation, bound: solution }) },
      inputMode: 'choice',
      choices: offerStatements(context.rng, solvingOptions(relation, solution, repeated)),
      misconceptions: [
        {
          value: { kind: 'text', value: statementId({ relation, bound: repeated }) },
          tag: 'repeated-the-operation',
          nudge: `Undo it: ${multiplies ? 'divide' : 'multiply'} both sides by ${coefficient} instead.`,
        },
        needlessFlip(relation, solution),
      ],
      hint: 'Undo the operation on both sides and leave the symbol alone.',
      solution: [
        {
          text: `${multiplies ? 'Divide' : 'Multiply'} both sides by ${coefficient}.`,
          detail: `${VARIABLE} ${relation} ${drawn(solution)}`,
        },
        { text: `${coefficient} is positive, so the symbol stays as it is.` },
      ],
    }
  },
})

const MULTIPLIER_BAND: Ladder = {
  1: [1, 2],
  2: [1, 3],
  3: [2, 4],
  4: [2, 5],
  5: [3, 7],
}

/**
 * 15.4 · Two operations, undone in the right order.
 *
 * **The constant is a multiple of the coefficient, and that is what makes the
 * wrong order offerable.** Dividing before clearing the constant computes
 * `r ÷ a`, so an ordinary draw like `3x + 4 ≤ 19` mis-orders to `19/3 − 4` — a
 * fraction, which no option can state and no learner lands on, leaving the
 * skill's whole diagnosis unreachable. Drawing the constant as `a·k` makes the
 * right-hand side a multiple of `a` too, so both orders come out whole.
 *
 * They differ by `k(1 − a)`, which is why `MULTIPLIER_BAND` starts at 1 and
 * `FACTOR_BAND` at 2: at either boundary the two orders agree and the mistake
 * disappears. The bands carry that constraint, so the draw does not clamp.
 */
const solveMultiStepIneq = defineSkill({
  id: 'solve-multi-step-ineq',
  name: 'Multi-Step Inequalities',
  blurb: 'Solve in several moves',
  teachingLine: 'Undo the constant first, then undo the positive coefficient.',
  build(context: BuildContext) {
    const relation = context.rng.pick(RELATIONS)
    const [factorMin, factorMax] = band(context.difficulty, FACTOR_BAND)
    const [solutionMin, solutionMax] = band(context.difficulty, SOLUTION_BAND)
    const [multiplierMin, multiplierMax] = band(context.difficulty, MULTIPLIER_BAND)
    const coefficient = context.rng.int(factorMin, factorMax)
    const solution = context.rng.int(solutionMin, solutionMax)
    const step = context.rng.int(multiplierMin, multiplierMax)
    const constant = coefficient * step
    const adds = context.rng.bool()
    const rightHand = adds ? coefficient * solution + constant : coefficient * solution - constant
    // Dividing first, then clearing the constant. Whole because the right-hand
    // side is a multiple of the coefficient, and never equal to the solution
    // because they differ by `step × (1 − coefficient)`.
    const wrongOrder = adds ? rightHand / coefficient - constant : rightHand / coefficient + constant
    const cleared = adds ? rightHand - constant : rightHand + constant

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text:
          `${coefficient}${VARIABLE} ${adds ? '+' : '−'} ${constant} ` +
          `${relation} ${drawn(rightHand)}`,
        equation: { operation: 'inequality-two-step', relation, coefficient, constant, adds, rightHand },
      },
      answer: { kind: 'choice', id: statementId({ relation, bound: solution }) },
      inputMode: 'choice',
      choices: offerStatements(context.rng, solvingOptions(relation, solution, wrongOrder)),
      misconceptions: [
        {
          value: { kind: 'text', value: statementId({ relation, bound: wrongOrder }) },
          tag: 'undid-in-the-wrong-order',
          nudge: `Clear the ${constant} first, then divide what is left by ${coefficient}.`,
        },
        needlessFlip(relation, solution),
      ],
      hint: 'Clear the number added or subtracted before you divide.',
      solution: [
        {
          text: `${adds ? 'Subtract' : 'Add'} ${constant} on both sides first.`,
          detail: `${coefficient}${VARIABLE} ${relation} ${drawn(cleared)}`,
        },
        {
          text: `Then divide both sides by ${coefficient}.`,
          detail: `${VARIABLE} ${relation} ${drawn(solution)}`,
        },
        { text: `${coefficient} is positive, so the symbol stays as it is.` },
      ],
    }
  },
})

/**
 * 15.5 · The wall, and its own skill deliberately.
 *
 * Nothing in the algebra so far behaves this way: every earlier operation leaves
 * the relation alone, and this one turns it round. The four options are the two
 * independent mistakes crossed — did the symbol turn, did the boundary keep its
 * sign — so neither can be guessed from the other and three of the four are
 * named diagnoses.
 *
 * **The boundary takes either sign, and that is not decoration.** Drawn from a
 * positive right-hand side, `c ÷ −a` is negative every time, and "pick the
 * option with the minus sign" would then be right on every draw without the
 * learner ever reversing anything — on the one skill whose entire subject is the
 * reversal. So the multiply form draws its solution signed and the divide form
 * draws its right-hand side signed, which lands the same freedom on both.
 */
const flipTheSign = defineSkill({
  id: 'flip-the-sign',
  name: 'Flipping the Sign',
  blurb: 'Multiply or divide by a negative',
  teachingLine: 'Multiplying or dividing both sides by a negative reverses the inequality sign.',
  build(context: BuildContext) {
    const relation = context.rng.pick(RELATIONS)
    const [factorMin, factorMax] = band(context.difficulty, FACTOR_BAND)
    const [quotientMin, quotientMax] = band(context.difficulty, QUOTIENT_BAND)
    const coefficient = -context.rng.int(factorMin, factorMax)
    const magnitude = context.rng.int(quotientMin, quotientMax)
    const signed = context.rng.bool() ? -magnitude : magnitude
    const multiplies = context.rng.bool()
    // Drawn from opposite ends so neither form needs a divisibility it might not
    // get: multiplying knows its solution and builds the right-hand side from
    // it, dividing knows its right-hand side and multiplies through.
    const rightHand = multiplies ? coefficient * signed : signed
    const solution = multiplies ? signed : coefficient * signed
    const flipped = REVERSED[relation]

    return {
      prompt: 'Solve for x.',
      display: {
        kind: 'equation',
        text: multiplies
          ? `${drawn(coefficient)}${VARIABLE} ${relation} ${drawn(rightHand)}`
          : `${VARIABLE} ÷ ${drawn(coefficient)} ${relation} ${drawn(rightHand)}`,
        equation: { operation: 'inequality-multdiv', relation, coefficient, multiplies, rightHand },
      },
      answer: { kind: 'choice', id: statementId({ relation: flipped, bound: solution }) },
      inputMode: 'choice',
      choices: offerStatements(context.rng, [
        { relation: flipped, bound: solution },
        { relation, bound: solution },
        { relation: flipped, bound: -solution },
        { relation, bound: -solution },
      ]),
      misconceptions: [
        {
          value: { kind: 'text', value: statementId({ relation, bound: solution }) },
          tag: 'did-not-flip',
          nudge: `${multiplies ? 'Dividing' : 'Multiplying'} by a negative turns the symbol round.`,
        },
        {
          value: { kind: 'text', value: statementId({ relation: flipped, bound: -solution }) },
          tag: 'lost-the-sign',
          nudge: `The symbol turned, but ${drawn(rightHand)} ${multiplies ? '÷' : '×'} ${drawn(coefficient)} is ${drawn(solution)}.`,
        },
        {
          value: { kind: 'text', value: statementId({ relation, bound: -solution }) },
          tag: 'kept-both',
          nudge: 'A negative changes two things here: the symbol and the sign.',
        },
      ],
      hint: 'A negative multiplier turns the symbol round as well.',
      solution: [
        {
          text: `${multiplies ? 'Divide' : 'Multiply'} both sides by ${drawn(coefficient)}.`,
          detail: `${drawn(rightHand)} ${multiplies ? '÷' : '×'} ${drawn(coefficient)} = ${drawn(solution)}`,
        },
        {
          text: 'It was a negative, so the symbol turns round.',
          detail: `${VARIABLE} ${flipped} ${drawn(solution)}`,
        },
      ],
    }
  },
})

const RANGE_BAND: Ladder = {
  1: [8, 10],
  2: [10, 12],
  3: [10, 14],
  4: [12, 16],
  5: [14, 20],
}

/** The same statement with every strict bound let in — 15.6's first predicted mistake. */
const loosenStrict = (data: CompoundData): CompoundData => ({
  ...data,
  firstRelation: isStrict(data.firstRelation) ? STRICTNESS_SWAPPED[data.firstRelation] : data.firstRelation,
  secondRelation: isStrict(data.secondRelation)
    ? STRICTNESS_SWAPPED[data.secondRelation]
    : data.secondRelation,
})

/**
 * 15.6 · The one skill in the unit whose answer really is a value.
 *
 * "And, or, and between" is a question about which numbers survive, so counting
 * them is the honest question and the keypad is the honest surface. It is also
 * what stops the unit being five multiple-choice screens in a row.
 *
 * The bounds are drawn inside the stated range rather than drawn and checked, so
 * the count is never nothing and never everything: `low` starts at 1 and `high`
 * stops one short of the end, which leaves 0 and `rangeMax` outside every `and`
 * and inside every `or`, and `high ≥ low + 2` keeps at least one number between
 * them however the strictness falls.
 */
const compoundInequalities = defineSkill({
  id: 'compound-inequalities',
  name: 'Compound Inequalities',
  blurb: 'And, or, and between',
  teachingLine: 'For and, keep values that satisfy both; for or, keep values that satisfy at least one.',
  build(context: BuildContext) {
    const [rangeMin, rangeCap] = band(context.difficulty, RANGE_BAND)
    const rangeMax = context.rng.int(rangeMin, rangeCap)
    const low = context.rng.int(1, rangeMax - 3)
    const form = context.rng.pick(['and', 'or', 'between'] as const)

    // At least one bound is strict, or loosening changes nothing and the first
    // prediction is the answer under another name.
    const firstStrict = context.rng.bool()
    const secondStrict = firstStrict ? context.rng.bool() : true
    const lower: Relation = firstStrict ? '>' : '≥'
    const upper: Relation = secondStrict ? '<' : '≤'
    // An `or` reaches outward from the same two bounds, so the pair turns round.
    const firstRelation = form === 'or' ? REVERSED[lower] : lower
    const secondRelation = form === 'or' ? REVERSED[upper] : upper

    const shape = {
      operation: 'inequality-compound',
      form,
      firstRelation,
      firstBound: low,
      secondRelation,
      rangeMax,
    } as const
    // The upper bound is drawn from the values that leave both diagnoses
    // standing, rather than drawn and then checked. Two of the three ways they
    // can collapse are invisible from the arithmetic: the complement can land on
    // the answer, and — the one that actually bit — the complement can land on
    // the *loosened count*, which `generateProblem` then dedups away, leaving a
    // skill that predicts one mistake where its contract promises two.
    //
    // Each candidate carries the counts it was judged on, so the chosen one is
    // not scanned a second time to learn what the loop already knew.
    const candidates: { secondBound: number; count: number; loosened: number; complement: number }[] = []
    for (let secondBound = low + 2; secondBound <= rangeMax - 1; secondBound += 1) {
      const count = satisfyingCount({ ...shape, secondBound })
      const loosened = satisfyingCount(loosenStrict({ ...shape, secondBound }))
      const complement = rangeMax + 1 - count
      if (count !== loosened && count !== complement && loosened !== complement) {
        candidates.push({ secondBound, count, loosened, complement })
      }
    }
    if (candidates.length === 0) {
      throw new Error(`compound-inequalities: no upper bound leaves two diagnoses at low ${low} of ${rangeMax}`)
    }
    const { secondBound: high, count, loosened, complement } = context.rng.pick(candidates)

    const data: CompoundData = { ...shape, secondBound: high }
    const first = `${VARIABLE} ${firstRelation} ${drawn(low)}`
    const second = `${VARIABLE} ${secondRelation} ${drawn(high)}`

    const misconceptions: Misconception[] = [
      {
        value: loosened,
        tag: 'counted-a-strict-boundary',
        nudge: 'A symbol with no line underneath leaves its own number out.',
      },
      {
        value: complement,
        tag: 'counted-the-other-side',
        nudge: 'Count the numbers that make it true, not the ones that do not.',
      },
    ]

    return {
      prompt: `How many whole numbers from 0 to ${rangeMax} make this true?`,
      display: {
        kind: 'equation',
        // Chained, so the lower bound moves to the left of the variable and its
        // relation turns round with it. The payload keeps both relations
        // variable-first, which is what stops this drawing the opposite of what
        // it carries.
        text:
          form === 'between'
            ? `${drawn(low)} ${REVERSED[firstRelation]} ${VARIABLE} ${secondRelation} ${drawn(high)}`
            : `${first} ${form} ${second}`,
        // The one Unit 15 display that frames its slot — see the header for why
        // the other five do not. A label rather than a variable name, which is
        // what this field has always been: `equation-balance` frames `each
        // side`. This one echoes the prompt, and the answer really is a value of
        // it, so the claim the frame makes is true here.
        variable: 'how many',
        equation: data,
      },
      answer: intAnswer(count),
      keypad: padFor(count, misconceptions),
      misconceptions,
      hint: 'Walk the range and keep the numbers the statement admits.',
      solution: [
        { text: `Take the whole numbers from 0 to ${rangeMax}.` },
        {
          text:
            form === 'or'
              ? 'Keep every number satisfying either part.'
              : 'Keep only the numbers satisfying both parts.',
          detail: `${first} ${form === 'or' ? 'or' : 'and'} ${second}`,
        },
        { text: `That leaves ${count} of them.` },
      ],
    }
  },
})

export const unit15: SkillGenerator[] = [
  inequalitySymbols,
  graphInequality,
  solveOneStepIneq,
  solveMultiStepIneq,
  flipTheSign,
  compoundInequalities,
]
