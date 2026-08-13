import { intAnswer } from '../lib/answer'
import { entryLabel, type KeypadRules } from '../lib/keypad'
import { rational } from '../lib/rational'
import type { Misconception, SkillGenerator } from '../lib/types'
import { band, countOf, defineSkill } from './engine'
import type { BuildContext, Ladder, ProblemSpec } from './engine'

/**
 * Unit 6 · Negative Numbers.
 *
 * The first unit where a *value* carries a sign rather than an operator, which
 * is a different thing from every unit before it: `5 − 3` has a minus in it and
 * `−5` has a minus in it, and only one of them is an operation.
 *
 * Two rules do most of the work here and both are stated once, at the top,
 * because getting either wrong is invisible until a learner is looking at it:
 * every value the learner reads is drawn through `drawn()`, and every keypad
 * problem derives what its pad offers from the answer and the predictions it
 * just computed rather than declaring it by hand.
 *
 * Nothing here is in `engine/`. Every consumer is a Unit 6 skill, which is the
 * rule Unit 4's number theory states and Unit 5's expressions restate — a
 * helper moves to the engine when a second *unit* needs it, so that Unit 13's
 * signed variables shape their own rather than inherit something guessed at
 * from arithmetic.
 */

// ---------------------------------------------------------------------------
// Drawing and answering
// ---------------------------------------------------------------------------

/**
 * A value as the learner reads it: typographic minus, matching every other
 * display in the course and the label on the pad's own sign key.
 *
 * The answer checker parses the ASCII hyphen, and that difference is deliberate
 * and lives in `lib/keypad.ts`. What matters here is that nothing in this file
 * interpolates a raw negative number into learner-facing text — `${-3}` is
 * `-3`, one glyph away from everything around it, and the difference is small
 * enough on screen to survive review and obvious enough to look broken.
 */
const drawn = (value: number): string => entryLabel(String(value))

/**
 * What the pad must offer for this problem.
 *
 * Derived from the answer *and* the predictions, not from the answer alone. A
 * pad that withholds the sign key does not merely fail to record a negative
 * answer: it tells the learner the answer is not negative, at exactly the three
 * skills whose question is what sign it has. `add-neg-pos`'s documented
 * misconception is `−8` where the answer is `2`, and a learner who makes it
 * would find they could not type it.
 *
 * Taking both means the declaration cannot drift from what the problem holds —
 * a prediction added later brings the key with it.
 */
const padFor = (
  answer: number,
  misconceptions: readonly Misconception[],
): KeypadRules | undefined =>
  answer < 0 || misconceptions.some((m) => typeof m.value === 'number' && m.value < 0)
    ? { allowNegative: true }
    : undefined

/**
 * The parts of a problem a builder here still decides for itself, which is the
 * diagnosis and the words. Stated as a `Pick` rather than restated field by
 * field, the way Unit 5 states the same thing, so a field added to
 * `ProblemSpec` reaches these builders instead of stopping at a copy.
 */
type Working = Pick<ProblemSpec, 'misconceptions' | 'hint' | 'solution'>

/**
 * One expression, shown and answered.
 *
 * The display and the answer are taken from the same call, the way Unit 5's
 * `valueOf` is — written out per skill they would be seven chances to render
 * one sum and answer another, which type-checks and is the single worst defect
 * this app can ship. Each builder binds its expression once and passes that
 * binding both here and to the step that closes the working, so the two cannot
 * be spelled differently.
 */
const arithmetic = (text: string, answer: number, working: Working): ProblemSpec => ({
  prompt: 'What is the value?',
  display: { kind: 'inline', text },
  answer: intAnswer(answer),
  keypad: padFor(answer, working.misconceptions ?? []),
  ...working,
})

// ---------------------------------------------------------------------------
// 6.1 · Reading below zero
// ---------------------------------------------------------------------------

/**
 * The line is symmetric about zero, which is not decoration. The mirrored tick
 * is one of this skill's two predictions, so a line that reached further one
 * way than the other would put that prediction off the end and quietly stop
 * diagnosing the mistake it exists for.
 */
const buildNumberline = ({ rng, difficulty }: BuildContext): ProblemSpec => {
  const [reachMin, reachMax] = band(difficulty, {
    1: [5, 5],
    2: [6, 7],
    3: [8, 9],
    4: [10, 12],
    5: [12, 15],
  })
  const reach = rng.int(reachMin, reachMax)

  // Never zero: its mirror is itself, so the prediction would collapse onto the
  // answer and be filtered — and a skill named for reading below zero would
  // occasionally ask about the one value that is neither above nor below it.
  const size = rng.int(1, reach)
  const target = rng.bool(0.75) ? -size : size

  const misconceptions: Misconception[] = [
    {
      value: -target,
      tag: 'mirrored-across-zero',
      nudge: `That is ${countOf(size, 'step')} from zero, but the other way.`,
    },
    {
      // Counting zero itself as the first step lands one short, on either side.
      value: target - Math.sign(target),
      tag: 'counted-the-zero',
      nudge: 'Zero is where the counting starts, not the first step.',
    },
  ]

  return {
    prompt: 'Place this value on the line.',
    display: { kind: 'inline', text: drawn(target) },
    answer: intAnswer(target),
    inputMode: 'number-line',
    numberLine: { start: rational(-reach, 1), step: rational(1, 1), count: reach * 2 + 1 },
    misconceptions,
    hint: 'Start at zero and count one tick at a time.',
    solution: [
      { text: 'Find zero in the middle of the line.' },
      {
        text: `Count ${countOf(size, 'tick')} to the ${target < 0 ? 'left' : 'right'}.`,
        detail: `0 → ${drawn(target)}`,
      },
    ],
  }
}

const negativesNumberline = defineSkill({
  id: 'negatives-numberline',
  name: 'Below Zero',
  blurb: 'Read values below zero',
  build: buildNumberline,
})

// ---------------------------------------------------------------------------
// 6.2 · Comparing below zero
// ---------------------------------------------------------------------------

const buildCompare = ({ rng, difficulty }: BuildContext): ProblemSpec => {
  const [min, max] = band(difficulty, {
    1: [1, 9],
    2: [2, 15],
    3: [3, 25],
    4: [5, 40],
    5: [8, 60],
  })

  const a = rng.int(min, max)
  const b = rng.intExcept(min, max, [a])

  // Two thirds both below zero, where the documented wall lives — a larger
  // digit reads as a larger number and the order inverts. The other third
  // crosses zero, without which "the negative one is smaller" passes every
  // problem and is a different wrong rule rather than the one being unlearned.
  const pair = rng.bool(0.65) ? [-a, -b] : [-a, b]
  const [left, right] = rng.bool() ? pair : [pair[1], pair[0]]

  // Never equal: `a ≠ b` and no negative equals a positive, so both predictions
  // survive on every problem — which is what a wall has to guarantee.
  const relation = left < right ? -1 : 1
  const symbol = relation < 0 ? '<' : '>'

  return {
    prompt: 'Choose the symbol that makes this true.',
    display: {
      kind: 'inline',
      text: `${drawn(left)} ? ${drawn(right)}`,
      wholeNumber: { operation: 'compare', left, right },
    },
    answer: { kind: 'choice', id: String(relation) },
    inputMode: 'choice',
    choices: rng.shuffle([
      { id: '-1', label: '<' },
      { id: '0', label: '=' },
      { id: '1', label: '>' },
    ]),
    misconceptions: [
      {
        value: -relation,
        tag: 'reversed-comparison',
        nudge: 'Below zero, the bigger the digit the smaller the value.',
      },
      {
        value: 0,
        tag: 'called-equal',
        nudge: 'These sit at different places on the line.',
      },
    ],
    hint: 'Whichever sits further left on the line is smaller.',
    solution: [
      { text: 'Picture both of them on a number line.' },
      { text: 'The one further left is smaller.', detail: `${drawn(left)} ${symbol} ${drawn(right)}` },
    ],
  }
}

const compareNegatives = defineSkill({
  id: 'compare-negatives',
  name: 'Comparing Negatives',
  blurb: '−7 < −3',
  build: buildCompare,
})

// ---------------------------------------------------------------------------
// 6.3 · Negative plus positive
// ---------------------------------------------------------------------------

/**
 * Two sizes that differ, from one band.
 *
 * `a ≠ b` is the constraint the three additive skills share, and every one of
 * them needs it for the same reason: their second prediction is a difference of
 * the two sizes, which at `a === b` is zero or equal to the answer and is
 * filtered away — leaving a skill that looks like it diagnoses two mistakes and
 * diagnoses one.
 */
const sizes = ({ rng, difficulty }: BuildContext, ladder: Ladder) => {
  const [min, max] = band(difficulty, ladder)
  const a = rng.int(min, max)
  return [a, rng.intExcept(min, max, [a])] as const
}

const ADDITION_LADDER: Ladder = {
  1: [1, 6],
  2: [2, 11],
  3: [3, 19],
  4: [4, 30],
  5: [6, 45],
}

const buildAddNegPos = (context: BuildContext): ProblemSpec => {
  const [a, b] = sizes(context, ADDITION_LADDER)
  const answer = b - a

  const misconceptions: Misconception[] = [
    {
      value: -(a + b),
      tag: 'added-magnitudes',
      // Same reason as 6.5's: the first worked step opens "The signs differ, so
      // subtract the sizes", and a nudge opening the same four words above it
      // reads as one sentence printed twice.
      nudge: `That stacks ${a} and ${b} up. Opposite signs pull against each other.`,
    },
    {
      value: a - b,
      tag: 'wrong-sign',
      nudge: `The larger size is ${Math.max(a, b)}, and it decides the sign.`,
    },
  ]

  const expression = `${drawn(-a)} + ${b}`

  return arithmetic(expression, answer, {
    misconceptions,
    hint: 'Different signs pull against each other, so take one size from the other.',
    solution: [
      { text: 'The signs differ, so subtract the sizes.' },
      {
        text: 'Take the smaller size from the larger.',
        detail: `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(answer)}`,
      },
      {
        text: 'The larger size decides the sign.',
        detail: `${expression} = ${drawn(answer)}`,
      },
    ],
  })
}

const addNegPos = defineSkill({
  id: 'add-neg-pos',
  name: 'Negative Plus Positive',
  blurb: '−3 + 5',
  build: buildAddNegPos,
})

// ---------------------------------------------------------------------------
// 6.4 · Two negatives added
// ---------------------------------------------------------------------------

const buildAddTwoNegs = (context: BuildContext): ProblemSpec => {
  const [a, b] = sizes(context, ADDITION_LADDER)
  const answer = -(a + b)

  const misconceptions: Misconception[] = [
    {
      value: a + b,
      tag: 'dropped-the-signs',
      nudge: 'Both start below zero, so the total cannot end up above it.',
    },
    {
      value: -Math.abs(a - b),
      tag: 'subtracted-instead',
      nudge: 'Sizes are taken apart when the signs differ. These match.',
    },
  ]

  const expression = `${drawn(-a)} + ${drawn(-b)}`

  return arithmetic(expression, answer, {
    misconceptions,
    hint: 'Two values below zero stack up further below zero.',
    solution: [
      { text: 'The signs match, so add the sizes.' },
      { text: 'Add them.', detail: `${a} + ${b} = ${a + b}` },
      {
        text: 'Both started below zero, so the total does too.',
        detail: `${expression} = ${drawn(answer)}`,
      },
    ],
  })
}

const addTwoNegs = defineSkill({
  id: 'add-two-negs',
  name: 'Adding Two Negatives',
  blurb: '−3 + −5',
  build: buildAddTwoNegs,
})

// ---------------------------------------------------------------------------
// 6.5 · Subtracting a negative — the major wall
// ---------------------------------------------------------------------------

/**
 * Two shapes, because one is not enough to teach the rule.
 *
 * `a − (−b)` is where the rule is most visible: the answer is *larger* than
 * what it started at, which is the whole surprise. But a skill that only ever
 * drew it would let "subtracting a negative makes it bigger" pass as a rule
 * about size rather than about signs, so `−a − (−b)` draws too, where the same
 * collapse happens and the answer can land either side of zero.
 *
 * They predict a different second mistake each, which is why the mapping is
 * written per shape rather than shared: on `a − (−b)` the learner who does not
 * collapse the signs gets `a − b`, and the one who over-collapses them negates
 * the whole result. On `−a − (−b)` those two swap roles.
 */
const SUBTRACTION_LADDER: Ladder = {
  1: [2, 7],
  2: [3, 12],
  3: [4, 20],
  4: [5, 32],
  5: [7, 48],
}

const buildSubNegatives = (context: BuildContext): ProblemSpec => {
  const [a, b] = sizes(context, SUBTRACTION_LADDER)
  const negativeMinuend = context.rng.bool(0.4)
  const minuend = negativeMinuend ? -a : a
  const answer = minuend + b

  const stillSubtracted: Misconception = {
    value: minuend - b,
    tag: 'still-subtracted',
    // Names what the learner did, not the rule — the first worked step states
    // the rule directly below this, and two near-identical sentences one above
    // the other read as the app repeating itself rather than answering.
    nudge: `That takes ${b} away. Subtracting a negative puts it back instead.`,
  }

  const misconceptions: Misconception[] = negativeMinuend
    ? [
        stillSubtracted,
        {
          value: a - b,
          tag: 'dropped-both-signs',
          nudge: 'Both signs are written, and both of them count.',
        },
      ]
    : [
        stillSubtracted,
        {
          value: -(a + b),
          tag: 'negated-the-whole',
          nudge: 'The two signs cancel each other, not the answer.',
        },
      ]

  const expression = `${drawn(minuend)} − (${drawn(-b)})`
  // The rewritten form, which the last two steps both work from: this skill's
  // closing line shows the addition it became rather than the subtraction it
  // was, because the collapse is the thing being taught.
  const rewritten = `${drawn(minuend)} + ${b}`

  return arithmetic(expression, answer, {
    misconceptions,
    hint: 'Subtracting a negative is the same as adding it back.',
    solution: [
      { text: 'Two minus signs together make a plus.' },
      { text: 'Rewrite it as an addition.', detail: `${expression} = ${rewritten}` },
      {
        text: negativeMinuend ? 'The signs differ, so subtract the sizes.' : 'Then add.',
        detail: `${rewritten} = ${drawn(answer)}`,
      },
    ],
  })
}

const subNegatives = defineSkill({
  id: 'sub-negatives',
  name: 'Subtracting a Negative',
  blurb: '5 − (−3)',
  build: buildSubNegatives,
})

// ---------------------------------------------------------------------------
// 6.6 and 6.7 · The sign rules
// ---------------------------------------------------------------------------

/** How a pair of signs reads, for the sentence that has to name the rule. */
const signRule = (matching: boolean) =>
  matching ? 'Two signs the same give a positive.' : 'Two different signs give a negative.'

/**
 * Both sign-rule skills range over the same sizes.
 *
 * Shared rather than written twice because 6.7's blurb is "The same sign rules":
 * the two skills exist to teach one rule, and widening one ladder without the
 * other would practise it over different numbers on each side while nothing
 * failed — `ladderProblems` checks a ladder in isolation, and the unit's own
 * sweep compares a skill against itself.
 */
const SIGN_RULE_LADDER: Ladder = {
  1: [2, 5],
  2: [2, 7],
  3: [3, 9],
  4: [3, 11],
  5: [4, 14],
}

/**
 * Which of the two operands carry a sign.
 *
 * All three combinations, and the both-negative one last so the two
 * single-negative shapes are not each half of the skill — the surprise is that
 * two negatives give a positive, and it needs to arrive often.
 */
const signPair = (rng: BuildContext['rng']) => {
  const combination = rng.int(0, 2)
  return [combination !== 1, combination !== 0] as const
}

/**
 * The shape 6.6 and 6.7 share, which is all of it but the operation.
 *
 * Written once because the two skills teach one rule and the second is named
 * for that — a reworded nudge or an added step landing on multiplication and
 * not division is the same failure `negatives-mixed` reuses its builders to
 * avoid, between two skills instead of between a skill and its review.
 */
const signRuleProblem = ({
  left,
  right,
  operator,
  verb,
  answer,
  sizeDetail,
  otherMistake,
}: {
  left: number
  right: number
  operator: '×' | '÷'
  verb: 'Multiply' | 'Divide'
  answer: number
  sizeDetail: string
  otherMistake: Misconception
}): ProblemSpec => {
  const matching = left < 0 === right < 0
  const expression = `${drawn(left)} ${operator} ${drawn(right)}`

  return arithmetic(expression, answer, {
    misconceptions: [
      {
        value: -answer,
        tag: 'wrong-sign',
        // Says what is right before what is wrong, and does not repeat the
        // solution step verbatim — the worked steps sit directly beneath it.
        nudge: `The size is right. ${signRule(matching)}`,
      },
      otherMistake,
    ],
    hint: `${verb} the sizes, then read the two signs together.`,
    solution: [
      { text: `${verb} the sizes first.`, detail: sizeDetail },
      { text: signRule(matching), detail: `${expression} = ${drawn(answer)}` },
    ],
  })
}

const buildMultNegatives = ({ rng, difficulty }: BuildContext): ProblemSpec => {
  const [min, max] = band(difficulty, SIGN_RULE_LADDER)
  const [leftNegative, rightNegative] = signPair(rng)

  const a = rng.int(min, max)
  // At 2 × 2 the sum equals the product, so the predicted addition would land on
  // the answer's magnitude and be filtered. One pair out of a wide band.
  const b =
    leftNegative && rightNegative && a === 2 ? rng.intExcept(min, max, [2]) : rng.int(min, max)

  const left = leftNegative ? -a : a
  const right = rightNegative ? -b : b

  return signRuleProblem({
    left,
    right,
    operator: '×',
    verb: 'Multiply',
    answer: left * right,
    sizeDetail: `${a} × ${b} = ${a * b}`,
    otherMistake: {
      value: left + right,
      tag: 'added-instead',
      nudge: 'That combines them. This one asks for groups of them.',
    },
  })
}

const multNegatives = defineSkill({
  id: 'mult-negatives',
  name: 'Multiplying Negatives',
  blurb: 'The sign rules',
  build: buildMultNegatives,
})

/**
 * Composed from the quotient outward: draw the answer's size and the divisor,
 * and multiply to get the dividend. Drawing a dividend and filtering for one
 * that divides exactly is the shape that exhausted `sub-across-zero`'s draw in
 * front of a learner; here exactness is structural.
 */
const buildDivNegatives = ({ rng, difficulty }: BuildContext): ProblemSpec => {
  const [min, max] = band(difficulty, SIGN_RULE_LADDER)
  const [dividendNegative, divisorNegative] = signPair(rng)

  const size = rng.int(min, max)
  // Capped at 9 so the dividend stays inside the width the display is sized for.
  const divisorSize = rng.int(2, Math.min(max, 9))

  const dividend = (dividendNegative ? -1 : 1) * size * divisorSize
  const divisor = (divisorNegative ? -1 : 1) * divisorSize

  return signRuleProblem({
    left: dividend,
    right: divisor,
    operator: '÷',
    verb: 'Divide',
    answer: dividend / divisor,
    sizeDetail: `${size * divisorSize} ÷ ${divisorSize} = ${size}`,
    otherMistake: {
      value: dividend * divisor,
      tag: 'multiplied-instead',
      nudge: 'That grows it. Dividing asks how many fit inside.',
    },
  })
}

const divNegatives = defineSkill({
  id: 'div-negatives',
  name: 'Dividing Negatives',
  blurb: 'The same sign rules',
  build: buildDivNegatives,
})

// ---------------------------------------------------------------------------
// 6.8 · Distance from zero
// ---------------------------------------------------------------------------

/**
 * The one problem in the unit that is not arithmetic, and the reason the
 * display carries its value in machine-readable form: `|−7|` cannot be
 * evaluated, and a display of `−7` alone evaluates to the answer this skill
 * exists to say is wrong.
 */
const buildAbsoluteValue = ({ rng, difficulty }: BuildContext): ProblemSpec => {
  const [min, max] = band(difficulty, {
    1: [1, 9],
    2: [2, 15],
    3: [3, 27],
    4: [5, 45],
    5: [8, 70],
  })

  // Never zero, whose distance from itself is zero and whose mirror is itself:
  // the prediction would collapse and the skill would diagnose nothing there.
  const size = rng.int(min, max)
  const value = rng.bool(0.7) ? -size : size

  // Derived rather than declared, like every other keypad problem in the unit:
  // the sign key is correct here only because of the prediction below it, and a
  // literal would keep claiming so if that prediction ever moved.
  const misconceptions: Misconception[] = [
    {
      value: -size,
      tag: 'kept-the-sign',
      nudge: 'A distance counts steps, and steps do not run backwards.',
    },
  ]

  return {
    prompt: 'How far is this from zero?',
    display: {
      kind: 'inline',
      text: `|${drawn(value)}|`,
      wholeNumber: { operation: 'absolute-value', value },
    },
    answer: intAnswer(size),
    keypad: padFor(size, misconceptions),
    misconceptions,
    hint: 'Absolute value asks the distance, and no distance is below zero.',
    solution: [
      { text: 'The bars ask how far from zero.' },
      {
        text: `${drawn(value)} sits ${countOf(size, 'step')} away.`,
        detail: `|${drawn(value)}| = ${size}`,
      },
    ],
  }
}

const absoluteValue = defineSkill({
  id: 'absolute-value',
  name: 'Absolute Value',
  blurb: 'Distance from zero',
  build: buildAbsoluteValue,
})

// ---------------------------------------------------------------------------
// 6.9 · Interleaved review
// ---------------------------------------------------------------------------

/**
 * Every shape the unit taught, drawn one at a time.
 *
 * Calls the same builders the standalone skills call rather than restating
 * them. Written twice, a reworded diagnosis would land on the standalone skill
 * and silently not on the review — the failure Unit 5 avoided by writing
 * `sameTier` once for both of its families.
 *
 * The number line and the comparison are left out, and that is the input mode
 * rather than the content: a lesson whose control changes shape between
 * problems is a different thing to answer, and the review is of the arithmetic
 * plus the one question that is not arithmetic. Both of those answer on the pad.
 */
const MIXED_SHAPES = [
  buildAddNegPos,
  buildAddTwoNegs,
  buildSubNegatives,
  buildMultNegatives,
  buildDivNegatives,
  buildAbsoluteValue,
]

const negativesMixed = defineSkill({
  id: 'negatives-mixed',
  name: 'Mixed Negatives',
  blurb: 'Interleaved review',
  build: (context) => context.rng.pick(MIXED_SHAPES)(context),
})

export const unit06: SkillGenerator[] = [
  negativesNumberline,
  compareNegatives,
  addNegPos,
  addTwoNegs,
  subNegatives,
  multNegatives,
  divNegatives,
  absoluteValue,
  negativesMixed,
]
