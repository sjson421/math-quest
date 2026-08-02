import { intAnswer } from '../lib/answer'
import type { SkillGenerator } from '../lib/types'
import {
  THREE_DIGIT,
  TWO_DIGIT,
  band,
  columnTrace,
  countOf,
  defineSkill,
  drawOperands,
  drawPair,
  forgotCarry,
  misalignedColumns,
  offBy,
  offByOne,
  pickFrame,
  place,
  stackPlace,
  stackTrace,
  storyProblem,
  wroteFullColumn,
  wrongOperation,
} from './engine'
import { ADDITION_FRAMES } from './phrasing/addition'

// ---------------------------------------------------------------------------
// Sums within ten
// ---------------------------------------------------------------------------

const addFactsSmall = defineSkill({
  id: 'add-facts-small',
  name: 'Small Sums',
  blurb: 'Sums to 10',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'add-facts-small',
      rng,
      // Its own ladder, like `add-facts` next door: `SINGLE_DIGIT` bounds each
      // operand at 9, which is not the same constraint as a sum within 10.
      //
      // Every band starts at 2, which is what excludes an operand of 1 — the
      // same call `add-facts` makes, because this skill is about combining.
      //
      // That leaves only 28 ordered pairs in total, so the ladder was chosen by
      // enumerating them rather than by eye. Difficulty 1 keeps 9 — the most any
      // band can hold while still opening on sums of 8 or less, which matters
      // more here than variety, because this is the first thing anyone sees.
      band: band(difficulty, {
        1: [2, 4],
        2: [2, 5],
        3: [2, 6],
        4: [2, 8],
        5: [3, 8],
      }),
      where: ({ a, b }) => a + b <= 10,
    })

    const sum = a + b
    // Counting on works from the bigger number, so name the two sides once
    // rather than re-deriving which is which in the hint and every step.
    const [bigger, smaller] = a >= b ? [a, b] : [b, a]

    return {
      prompt: 'What is the sum?',
      display: { kind: 'inline', text: `${a} + ${b}` },
      answer: intAnswer(sum),
      misconceptions: [
        ...offByOne(sum, {
          low: 'Almost — one more to count.',
          high: 'Almost — that counts one too far.',
        }),
        // Only where the operands differ. On a double the difference is 0,
        // which nobody types for a sum — a prediction that can never fire, with
        // a nudge that would not make sense if it did.
        ...(a === b
          ? []
          : [wrongOperation(a, b, '+', 'That is the gap between them. This one is adding.')]),
      ],
      hint: `Hold ${bigger} in your head and count on ${smaller}.`,
      solution: [
        { text: `Start at ${bigger}.` },
        {
          text: `Count on ${smaller}.`,
          detail: `${bigger} → ${sum}`,
        },
        { text: `So ${a} + ${b} = ${sum}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Single-digit addition facts
// ---------------------------------------------------------------------------

const addFacts = defineSkill({
  id: 'add-facts',
  name: 'Addition Facts',
  blurb: 'Adding small numbers',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'add-facts',
      rng,
      // Its own ladder rather than SINGLE_DIGIT: these ranges were chosen for
      // counting-on, and sub-facts next door needs different ones.
      band: band(difficulty, {
        1: [1, 5],
        2: [1, 7],
        3: [2, 9],
        4: [3, 9],
        5: [5, 9],
      }),
      // Adding 0 or 1 teaches nothing at this stage.
      where: ({ a, b }) => a > 1 && b > 1,
    })

    const sum = a + b

    return {
      prompt: 'What is the sum?',
      display: { kind: 'inline', text: `${a} + ${b}` },
      answer: intAnswer(sum),
      misconceptions: [
        ...offByOne(sum, {
          low: 'So close! Count once more — it lands one higher.',
          high: 'Very close! That is one too many.',
        }),
        wrongOperation(a, b, '+', 'That is the difference. This one is asking you to add.'),
      ],
      hint:
        a >= b
          ? `Start at ${a} and count up ${b} more.`
          : `Start at ${b} and count up ${a} more.`,
      solution: [
        {
          text: `Start with the bigger number, ${Math.max(a, b)}.`,
        },
        {
          text: `Count up ${Math.min(a, b)} from there.`,
          detail: `${Math.max(a, b)} → ${sum}`,
        },
        { text: `So ${a} + ${b} = ${sum}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Adding whole tens
// ---------------------------------------------------------------------------

const addTens = defineSkill({
  id: 'add-tens',
  name: 'Adding Tens',
  blurb: '20 + 30',
  build({ rng, difficulty }) {
    // The *count* of tens is drawn, then multiplied up. Drawing from [10, 90]
    // and rejecting everything that is not a whole ten would throw away nine
    // draws in ten for a constraint that is really about which numbers exist.
    const { a, b } = drawPair({
      label: 'add-tens',
      rng,
      band: band(difficulty, {
        1: [1, 4],
        2: [1, 5],
        3: [2, 7],
        4: [2, 8],
        5: [3, 9],
      }),
    })

    // The skill's one idea, named: you add the counts, then read them as tens.
    const count = a + b
    const [x, y] = [a * 10, b * 10]
    const sum = count * 10
    // The total is always 2 tens or more, so only the operands need `countOf`'s
    // singular — but they do need it: "10 is 1 tens" reads as the app talking
    // down to someone.

    return {
      prompt: 'What is the sum?',
      display: { kind: 'inline', text: `${x} + ${y}` },
      answer: intAnswer(sum),
      misconceptions: [
        // The error the skill exists to catch: added the tens digits, then wrote
        // the count instead of the quantity. Can never equal the sum, which is
        // ten times it.
        {
          value: count,
          tag: 'dropped-place-value',
          nudge: `That is ${a} and ${b} added — but you are counting tens here, not ones.`,
        },
        ...offBy(sum, 10, {
          tag: 'off-by-ten',
          low: 'One ten short — count the tens again.',
          high: 'One ten too many — count the tens again.',
        }),
      ],
      hint: `Add ${a} and ${b}, then remember you are counting tens.`,
      solution: [
        { text: `${x} is ${countOf(a, 'ten')}, and ${y} is ${countOf(b, 'ten')}.` },
        {
          text: 'Add the tens.',
          detail: `${a} + ${b} = ${count}`,
        },
        { text: `${count} tens is ${sum}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two-digit addition, no carrying
// ---------------------------------------------------------------------------

const add2NoCarry = defineSkill({
  id: 'add-2digit-nocarry',
  name: 'Two-Digit Addition',
  blurb: 'Column addition, no carrying yet',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'add-2digit-nocarry',
      rng,
      band: band(difficulty, TWO_DIGIT),
      where: ({ a, b }) => {
        const t = columnTrace(a, b, '+')
        // No carrying in either column, and no round numbers that skip the point.
        return t.places.every((p) => p.carry === 0) && place(t, 0).top > 0 && place(t, 0).bottom > 0
      },
    })

    const trace = columnTrace(a, b, '+')
    const ones = place(trace, 0)
    const tens = place(trace, 1)

    return {
      prompt: 'Add the columns.',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(trace.result),
      misconceptions: [
        // Was `digitConcat`, which on a skill that forbids carrying is the
        // correct answer by construction — so this skill predicted nothing at
        // all, on every problem, and every wrong answer got a bare "not quite".
        // This is the error the nudge always described, actually modelled.
        misalignedColumns(
          trace,
          'Check the columns line up — add ones to ones, tens to tens.',
        ),
        wrongOperation(a, b, '+', 'That is the difference. This one is asking you to add.'),
      ],
      hint: 'Add the ones column first, then the tens column.',
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${ones.top} + ${ones.bottom} = ${ones.raw}`,
        },
        {
          text: 'Add the tens column.',
          detail: `${tens.top} + ${tens.bottom} = ${tens.raw}`,
        },
        { text: `Put them together: ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two-digit addition with carrying
// ---------------------------------------------------------------------------

const add2Carry = defineSkill({
  id: 'add-2digit-carry',
  name: 'Carrying',
  blurb: 'When the ones column overflows',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'add-2digit-carry',
      rng,
      band: band(difficulty, {
        1: [15, 45],
        2: [15, 60],
        3: [18, 80],
        4: [25, 90],
        5: [35, 95],
      }),
      // Must carry out of the ones column — that is the whole skill.
      where: ({ a, b }) => place(columnTrace(a, b, '+'), 0).carry === 1,
    })

    const trace = columnTrace(a, b, '+')
    const ones = place(trace, 0)
    const tens = place(trace, 1)

    return {
      prompt: 'Add the columns. Watch the ones!',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(trace.result),
      misconceptions: [
        // The canonical carrying error: write the ones digit, forget the carry.
        forgotCarry(trace, 0, {
          tag: 'forgot-carry',
          nudge: `The ones came to ${ones.raw}, so a 1 carries over into the tens. Try adding that in.`,
        }),
        wroteFullColumn(trace, 0, {
          tag: 'wrote-full-ones',
          nudge: `Only the ${ones.digit} stays in the ones place — the 1 moves to the tens column.`,
        }),
      ],
      hint: `The ones column adds to ${ones.raw}, which is more than 9, so a ten carries over.`,
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${ones.top} + ${ones.bottom} = ${ones.raw}`,
        },
        {
          text: `Write the ${ones.digit}, and carry the 1 into the tens.`,
        },
        {
          text: 'Now add the tens column, plus the 1 you carried.',
          detail: `${tens.top} + ${tens.bottom} + 1 = ${tens.total}`,
        },
        { text: `So ${a} + ${b} = ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Three-digit addition
// ---------------------------------------------------------------------------

const add3Digit = defineSkill({
  id: 'add-3digit',
  name: 'Bigger Numbers',
  blurb: 'Three-digit column addition',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'add-3digit',
      rng,
      band: band(difficulty, THREE_DIGIT),
      // At least one carry, or it is just the previous skill with more digits.
      where: ({ a, b }) => {
        const t = columnTrace(a, b, '+')
        return place(t, 0).carry === 1 || place(t, 1).raw > 9
      },
    })

    const trace = columnTrace(a, b, '+')
    const ones = place(trace, 0)
    const tens = place(trace, 1)
    const hundreds = place(trace, 2)

    return {
      prompt: 'Add the columns.',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(trace.result),
      misconceptions: [
        forgotCarry(trace, 0, {
          tag: 'forgot-carry-ones',
          nudge: 'Check the ones column — a ten needs to carry across.',
        }),
        forgotCarry(trace, 1, {
          tag: 'forgot-carry-tens',
          nudge: 'Check the tens column — a hundred needs to carry across.',
        }),
      ],
      hint: 'Work right to left — ones, then tens, then hundreds — carrying as you go.',
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${ones.top} + ${ones.bottom} = ${ones.raw}${ones.carry ? ' — carry 1' : ''}`,
        },
        {
          text: 'Add the tens column.',
          detail: `${tens.top} + ${tens.bottom}${ones.carry ? ' + 1' : ''} = ${tens.total}${tens.carry ? ' — carry 1' : ''}`,
        },
        {
          text: 'Add the hundreds column.',
          detail: `${hundreds.top} + ${hundreds.bottom}${tens.carry ? ' + 1' : ''} = ${hundreds.total}`,
        },
        { text: `So ${a} + ${b} = ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// A stack of three addends
// ---------------------------------------------------------------------------

const addThreeNumbers = defineSkill({
  id: 'add-three-numbers',
  name: 'Three Addends',
  blurb: 'Add a stack of three numbers',
  build({ rng, difficulty }) {
    const operands = drawOperands({
      label: 'add-three-numbers',
      rng,
      band: band(difficulty, TWO_DIGIT),
      count: 3,
      where: (drawn) => {
        const ones = stackPlace(stackTrace(drawn), 0)
        // Must carry out of the ones — a stack that does not is `add-3digit`
        // with an extra row. The second clause keeps the two predictions below
        // from landing on the same value: dropping the carry gives
        // `result − 10 × carry`, and adding only the first two gives
        // `result − c`, which coincide exactly when `c` is `10 × carry`.
        return ones.carry >= 1 && drawn[2] !== 10 * ones.carry
      },
    })

    const [first, second, third] = operands
    const trace = stackTrace(operands)
    const ones = stackPlace(trace, 0)
    const tens = stackPlace(trace, 1)
    // Three digits can send two tens up, so this reads "one ten" or "two tens"
    // rather than the "a ten" the two-operand skills can hardcode.
    const carried = ones.carry === 1 ? 'one ten' : 'two tens'

    return {
      prompt: 'Add the columns.',
      display: { kind: 'column', operands, operator: '+' },
      answer: intAnswer(trace.result),
      misconceptions: [
        // Adding three digits can send two tens up, not one, so this is short by
        // the carry itself rather than by a fixed ten.
        forgotCarry(trace, 0, {
          tag: 'forgot-carry',
          nudge: `The ones digit is right, but ${carried} never made it into the tens column.`,
        }),
        {
          value: first + second,
          tag: 'added-two-of-three',
          nudge: `That is ${first} and ${second}. There is still the ${third} to add.`,
        },
      ],
      hint: `The ones come to ${ones.raw}, so ${carried} ${ones.carry === 1 ? 'carries' : 'carry'} into the next column.`,
      // Four steps is the contract's limit, so the total rides on the tens step
      // rather than taking one of its own.
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${ones.digits.join(' + ')} = ${ones.raw}`,
        },
        {
          text: `Write the ${ones.digit}, and carry the ${ones.carry}.`,
        },
        {
          text: 'Add the tens column, plus what you carried.',
          detail: `${tens.digits.join(' + ')} + ${tens.incoming} = ${tens.total}`,
        },
        { text: `That gives ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Addition word problems
// ---------------------------------------------------------------------------

const addWords = defineSkill({
  id: 'add-words',
  name: 'Addition Word Problems',
  blurb: 'Spot the addition',
  build({ rng, difficulty }) {
    const frame = pickFrame(rng, ADDITION_FRAMES)

    const { a, b } = drawPair({
      label: 'add-words',
      rng,
      band: band(difficulty, TWO_DIGIT),
      // Reading the situation is the work here, so the arithmetic stays inside
      // what Unit 1 has already built rather than adding a second difficulty.
      where: ({ a, b }) => a !== b,
    })

    // Mentioned in the sentence and absent from the answer. Kept clear of `b` so
    // the wrong-pair prediction cannot land on the correct total.
    const distractor = rng.intExcept(2, 99, [a, b])

    return storyProblem(frame, { a, b, distractor })
  },
})

// Curriculum order, not the order these were written, because this is the
// order the cards are rendered in and therefore the order they open in. A test
// pins this against `implementedSkillIds`. The unit's id, name and colour are
// not repeated here: the manifest declares the first two and `course` derives
// the tree from it.
export const unit01: SkillGenerator[] = [
  addFactsSmall,
  addFacts,
  addTens,
  add2NoCarry,
  add2Carry,
  add3Digit,
  addThreeNumbers,
  addWords,
]
