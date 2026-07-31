import { intAnswer } from '../lib/answer'
import type { Unit } from '../lib/types'
import {
  THREE_DIGIT,
  TWO_DIGIT,
  band,
  borrowedWithoutReducing,
  columnTrace,
  defineSkill,
  digitConcat,
  drawPair,
  flippedColumns,
  forgotCarry,
  offByOne,
  pickFrame,
  place,
  skippedUpperSubtraction,
  storyProblem,
  wroteFullColumn,
  wrongOperation,
} from './engine'
import { ADDITION_FRAMES } from './phrasing/addition'

// ---------------------------------------------------------------------------
// 1. Single-digit addition facts
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
// 2. Single-digit subtraction facts
// ---------------------------------------------------------------------------

const subFacts = defineSkill({
  id: 'sub-facts',
  name: 'Subtraction Facts',
  blurb: 'Taking away small numbers',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-facts',
      rng,
      band: band(difficulty, {
        1: [2, 6],
        2: [3, 9],
        3: [4, 12],
        4: [6, 15],
        5: [8, 18],
      }),
      second: (drawn, r) => r.int(1, Math.min(9, drawn)),
      // Avoid `x - x = 0`, `x - 1`, and results that are trivially the whole.
      where: ({ a, b }) => b > 1 && a - b > 0 && a !== b,
    })

    const diff = a - b

    return {
      prompt: 'What is the difference?',
      display: { kind: 'inline', text: `${a} − ${b}` },
      answer: intAnswer(diff),
      misconceptions: [
        wrongOperation(a, b, '−', 'That is the sum. This one is asking you to take away.'),
        ...offByOne(diff, {
          low: 'Nearly — that is one too few.',
          high: 'Nearly — that is one too many.',
        }),
      ],
      hint: `Start at ${a} and count back ${b}.`,
      solution: [
        { text: `Start at ${a}.` },
        { text: `Count back ${b}.`, detail: `${a} → ${diff}` },
        { text: `So ${a} − ${b} = ${diff}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// 3. Two-digit addition, no carrying
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
        digitConcat(trace, 'Check the columns line up — add ones to ones, tens to tens.'),
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
// 4. Two-digit addition with carrying
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
// 5. Two-digit subtraction with borrowing
// ---------------------------------------------------------------------------

const sub2Borrow = defineSkill({
  id: 'sub-2digit-borrow',
  name: 'Borrowing',
  blurb: 'When the ones column runs short',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-2digit-borrow',
      rng,
      band: band(difficulty, {
        1: [21, 45],
        2: [21, 65],
        3: [25, 85],
        4: [30, 95],
        5: [40, 99],
      }),
      second: (drawn, r) => r.int(11, Math.max(11, drawn - 1)),
      // Must need a borrow, and stay two-digit.
      where: ({ a, b }) => b < a && place(columnTrace(a, b, '−'), 0).carry === 1 && a - b > 0,
    })

    const trace = columnTrace(a, b, '−')
    const ones = place(trace, 0)
    const tens = place(trace, 1)

    return {
      prompt: 'Subtract. You will need to borrow.',
      display: { kind: 'column', operands: [a, b], operator: '−' },
      answer: intAnswer(trace.result),
      misconceptions: [
        // Classic: subtract smaller from larger in each column, ignoring borrow.
        flippedColumns(
          trace,
          `In the ones column you have ${ones.top} and need to take away ${ones.bottom}. Borrow a ten instead of flipping them around.`,
        ),
        // Borrowed but forgot to reduce the tens digit.
        borrowedWithoutReducing(
          trace,
          `You borrowed correctly, but the tens digit drops from ${tens.top} to ${tens.reduced} once you lend that ten away.`,
        ),
        // Borrowed, subtracted the ones, then left the tens column alone.
        //
        // A third prediction is not padding: this is a wall skill, and the two
        // above collide with each other whenever the ones digits are five
        // apart (31 − 16 predicts 25 twice), leaving one after dedup. This one
        // cannot collide — its tens digit is `t1`, while the real answer's is
        // `t1 − 1 − t2` and the flipped guess's is `t1 − t2`, and `t2` is never
        // zero because a borrow needs a two-digit subtrahend.
        skippedUpperSubtraction(
          trace,
          `The ones are right. There is still the ${tens.bottom} to take off the tens column.`,
        ),
      ],
      hint: `You cannot take ${ones.bottom} from ${ones.top}, so borrow a ten from the ${tens.top}.`,
      // Four steps is the contract's limit, so the closing "So a − b = …" line
      // the other generators use rides on the tens step instead of taking a step
      // of its own. The two column subtractions stay separate: on a borrowing
      // wall, seeing each column done is the whole point.
      solution: [
        {
          text: `Ones: ${ones.top} − ${ones.bottom}. Not enough to take away.`,
        },
        {
          text: `Borrow a ten — ${tens.top} becomes ${tens.reduced}, ones become ${ones.borrowed}.`,
        },
        {
          text: 'Now subtract the ones.',
          detail: `${ones.borrowed} − ${ones.bottom} = ${ones.digit}`,
        },
        {
          text: `Then the tens, giving ${trace.result}.`,
          detail: `${tens.reduced} − ${tens.bottom} = ${tens.digit}`,
        },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// 6. Three-digit addition
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
// 7. Addition word problems
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

export const unit01: Unit = {
  id: 'unit-01',
  name: 'Adding & Subtracting',
  color: 'blossom',
  // Curriculum order, not the order these were written, because this is the
  // order the cards are rendered in and therefore the order they open in. The
  // two subtraction skills are last: the manifest puts them in Unit 2, behind
  // all of Unit 1. A test pins this against `implementedSkillIds`.
  skills: [addFacts, add2NoCarry, add2Carry, add3Digit, addWords, subFacts, sub2Borrow],
}
