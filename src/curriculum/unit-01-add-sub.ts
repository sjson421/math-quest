import { constrain } from '../lib/rng'
import { intAnswer } from '../lib/answer'
import type { Difficulty, SkillGenerator, Unit } from '../lib/types'

/** Digit at position `place` (0 = ones, 1 = tens, ...). */
const digitAt = (value: number, place: number) => Math.floor(value / 10 ** place) % 10

/** Range of operands for a given difficulty, per skill. */
type Band = [min: number, max: number]

const band = (difficulty: Difficulty, bands: Record<Difficulty, Band>): Band =>
  bands[difficulty]

// ---------------------------------------------------------------------------
// 1. Single-digit addition facts
// ---------------------------------------------------------------------------

const addFacts: SkillGenerator = {
  id: 'add-facts',
  name: 'Addition Facts',
  blurb: 'Adding small numbers',
  prerequisites: [],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [1, 5],
      2: [1, 7],
      3: [2, 9],
      4: [3, 9],
      5: [5, 9],
    })

    const { a, b } = constrain(
      () => ({ a: rng.int(min, max), b: rng.int(min, max) }),
      // Adding 0 or 1 teaches nothing at this stage.
      ({ a, b }) => a > 1 && b > 1,
    )

    const sum = a + b

    return {
      skillId: 'add-facts',
      prompt: 'What is the sum?',
      display: { kind: 'inline', text: `${a} + ${b}` },
      answer: intAnswer(sum),
      inputMode: 'keypad',
      misconceptions: [
        { value: sum - 1, tag: 'off-by-one-low', nudge: 'So close! Count once more — it lands one higher.' },
        { value: sum + 1, tag: 'off-by-one-high', nudge: 'Very close! That is one too many.' },
        { value: Math.abs(a - b), tag: 'subtracted', nudge: 'That is the difference. This one is asking you to add.' },
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
      difficulty,
    }
  },
}

// ---------------------------------------------------------------------------
// 2. Single-digit subtraction facts
// ---------------------------------------------------------------------------

const subFacts: SkillGenerator = {
  id: 'sub-facts',
  name: 'Subtraction Facts',
  blurb: 'Taking away small numbers',
  prerequisites: ['add-facts'],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [2, 6],
      2: [3, 9],
      3: [4, 12],
      4: [6, 15],
      5: [8, 18],
    })

    const { a, b } = constrain(
      () => {
        const a = rng.int(min, max)
        return { a, b: rng.int(1, Math.min(9, a)) }
      },
      // Avoid `x - x = 0`, `x - 1`, and results that are trivially the whole.
      ({ a, b }) => b > 1 && a - b > 0 && a !== b,
    )

    const diff = a - b

    return {
      skillId: 'sub-facts',
      prompt: 'What is the difference?',
      display: { kind: 'inline', text: `${a} − ${b}` },
      answer: intAnswer(diff),
      inputMode: 'keypad',
      misconceptions: [
        { value: a + b, tag: 'added', nudge: 'That is the sum. This one is asking you to take away.' },
        { value: diff - 1, tag: 'off-by-one-low', nudge: 'Nearly — that is one too few.' },
        { value: diff + 1, tag: 'off-by-one-high', nudge: 'Nearly — that is one too many.' },
      ],
      hint: `Start at ${a} and count back ${b}.`,
      solution: [
        { text: `Start at ${a}.` },
        { text: `Count back ${b}.`, detail: `${a} → ${diff}` },
        { text: `So ${a} − ${b} = ${diff}.` },
      ],
      difficulty,
    }
  },
}

// ---------------------------------------------------------------------------
// 3. Two-digit addition, no carrying
// ---------------------------------------------------------------------------

const add2NoCarry: SkillGenerator = {
  id: 'add-2digit-nocarry',
  name: 'Two-Digit Addition',
  blurb: 'Column addition, no carrying yet',
  prerequisites: ['add-facts'],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [10, 40],
      2: [10, 60],
      3: [12, 80],
      4: [15, 90],
      5: [20, 95],
    })

    const { a, b } = constrain(
      () => ({ a: rng.int(min, max), b: rng.int(min, max) }),
      ({ a, b }) =>
        // No carrying in either column, and no round numbers that skip the point.
        digitAt(a, 0) + digitAt(b, 0) <= 9 &&
        digitAt(a, 1) + digitAt(b, 1) <= 9 &&
        digitAt(a, 0) > 0 &&
        digitAt(b, 0) > 0,
    )

    const sum = a + b

    return {
      skillId: 'add-2digit-nocarry',
      prompt: 'Add the columns.',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(sum),
      inputMode: 'keypad',
      misconceptions: [
        {
          value: Number(`${digitAt(a, 1) + digitAt(b, 1)}${digitAt(a, 0) + digitAt(b, 0)}`),
          tag: 'digit-concat',
          nudge: 'Check the columns line up — add ones to ones, tens to tens.',
        },
      ],
      hint: 'Add the ones column first, then the tens column.',
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${digitAt(a, 0)} + ${digitAt(b, 0)} = ${digitAt(a, 0) + digitAt(b, 0)}`,
        },
        {
          text: 'Add the tens column.',
          detail: `${digitAt(a, 1)} + ${digitAt(b, 1)} = ${digitAt(a, 1) + digitAt(b, 1)}`,
        },
        { text: `Put them together: ${sum}.` },
      ],
      difficulty,
    }
  },
}

// ---------------------------------------------------------------------------
// 4. Two-digit addition with carrying
// ---------------------------------------------------------------------------

const add2Carry: SkillGenerator = {
  id: 'add-2digit-carry',
  name: 'Carrying',
  blurb: 'When the ones column overflows',
  prerequisites: ['add-2digit-nocarry'],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [15, 45],
      2: [15, 60],
      3: [18, 80],
      4: [25, 90],
      5: [35, 95],
    })

    const { a, b } = constrain(
      () => ({ a: rng.int(min, max), b: rng.int(min, max) }),
      // Must carry out of the ones column — that is the whole skill.
      ({ a, b }) => digitAt(a, 0) + digitAt(b, 0) > 9,
    )

    const sum = a + b
    const onesSum = digitAt(a, 0) + digitAt(b, 0)
    const tensSum = digitAt(a, 1) + digitAt(b, 1)

    return {
      skillId: 'add-2digit-carry',
      prompt: 'Add the columns. Watch the ones!',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(sum),
      inputMode: 'keypad',
      misconceptions: [
        {
          // The canonical carrying error: write the ones digit, forget the carry.
          value: Number(`${tensSum}${onesSum % 10}`),
          tag: 'forgot-carry',
          nudge: `The ones came to ${onesSum}, so a 1 carries over into the tens. Try adding that in.`,
        },
        {
          value: Number(`${tensSum}${onesSum}`),
          tag: 'wrote-full-ones',
          nudge: `Only the ${onesSum % 10} stays in the ones place — the 1 moves to the tens column.`,
        },
      ],
      hint: `The ones column adds to ${onesSum}. That is more than 9, so a ten carries over.`,
      solution: [
        {
          text: 'Add the ones column.',
          detail: `${digitAt(a, 0)} + ${digitAt(b, 0)} = ${onesSum}`,
        },
        {
          text: `Write the ${onesSum % 10}, and carry the 1 into the tens.`,
        },
        {
          text: 'Now add the tens column, plus the 1 you carried.',
          detail: `${digitAt(a, 1)} + ${digitAt(b, 1)} + 1 = ${tensSum + 1}`,
        },
        { text: `So ${a} + ${b} = ${sum}.` },
      ],
      difficulty,
    }
  },
}

// ---------------------------------------------------------------------------
// 5. Two-digit subtraction with borrowing
// ---------------------------------------------------------------------------

const sub2Borrow: SkillGenerator = {
  id: 'sub-2digit-borrow',
  name: 'Borrowing',
  blurb: 'When the ones column runs short',
  prerequisites: ['sub-facts', 'add-2digit-carry'],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [21, 45],
      2: [21, 65],
      3: [25, 85],
      4: [30, 95],
      5: [40, 99],
    })

    const { a, b } = constrain(
      () => {
        const a = rng.int(min, max)
        return { a, b: rng.int(11, Math.max(11, a - 1)) }
      },
      // Must need a borrow, and stay two-digit.
      ({ a, b }) => b < a && digitAt(a, 0) < digitAt(b, 0) && a - b > 0,
    )

    const diff = a - b
    const borrowedOnes = digitAt(a, 0) + 10
    const reducedTens = digitAt(a, 1) - 1

    return {
      skillId: 'sub-2digit-borrow',
      prompt: 'Subtract. You will need to borrow.',
      display: { kind: 'column', operands: [a, b], operator: '−' },
      answer: intAnswer(diff),
      inputMode: 'keypad',
      misconceptions: [
        {
          // Classic: subtract smaller from larger in each column, ignoring borrow.
          value: Number(
            `${Math.abs(digitAt(a, 1) - digitAt(b, 1))}${Math.abs(digitAt(a, 0) - digitAt(b, 0))}`,
          ),
          tag: 'flipped-column',
          nudge: `In the ones column you have ${digitAt(a, 0)} and need to take away ${digitAt(b, 0)}. Borrow a ten instead of flipping them around.`,
        },
        {
          // Borrowed but forgot to reduce the tens digit.
          value: Number(`${digitAt(a, 1) - digitAt(b, 1)}${borrowedOnes - digitAt(b, 0)}`),
          tag: 'forgot-to-reduce-tens',
          nudge: `You borrowed correctly, but the tens digit drops from ${digitAt(a, 1)} to ${reducedTens} once you lend that ten away.`,
        },
      ],
      hint: `You cannot take ${digitAt(b, 0)} from ${digitAt(a, 0)}, so borrow a ten from the ${digitAt(a, 1)}.`,
      solution: [
        {
          text: `Look at the ones: ${digitAt(a, 0)} − ${digitAt(b, 0)}. There is not enough to take away.`,
        },
        {
          text: `Borrow one ten. The ${digitAt(a, 1)} becomes ${reducedTens}, and the ones become ${borrowedOnes}.`,
        },
        {
          text: 'Now subtract the ones.',
          detail: `${borrowedOnes} − ${digitAt(b, 0)} = ${borrowedOnes - digitAt(b, 0)}`,
        },
        {
          text: 'Then subtract the tens.',
          detail: `${reducedTens} − ${digitAt(b, 1)} = ${reducedTens - digitAt(b, 1)}`,
        },
        { text: `So ${a} − ${b} = ${diff}.` },
      ],
      difficulty,
    }
  },
}

// ---------------------------------------------------------------------------
// 6. Three-digit addition
// ---------------------------------------------------------------------------

const add3Digit: SkillGenerator = {
  id: 'add-3digit',
  name: 'Bigger Numbers',
  blurb: 'Three-digit column addition',
  prerequisites: ['add-2digit-carry'],
  generate(rng, difficulty) {
    const [min, max] = band(difficulty, {
      1: [100, 400],
      2: [100, 600],
      3: [150, 800],
      4: [200, 900],
      5: [350, 989],
    })

    const { a, b } = constrain(
      () => ({ a: rng.int(min, max), b: rng.int(min, max) }),
      // At least one carry, or it is just the previous skill with more digits.
      ({ a, b }) => digitAt(a, 0) + digitAt(b, 0) > 9 || digitAt(a, 1) + digitAt(b, 1) > 9,
    )

    const sum = a + b
    const onesSum = digitAt(a, 0) + digitAt(b, 0)
    const carryOnes = onesSum > 9 ? 1 : 0
    const tensSum = digitAt(a, 1) + digitAt(b, 1) + carryOnes
    const carryTens = tensSum > 9 ? 1 : 0
    const hundredsSum = digitAt(a, 2) + digitAt(b, 2) + carryTens

    const steps = [
      {
        text: 'Add the ones column.',
        detail: `${digitAt(a, 0)} + ${digitAt(b, 0)} = ${onesSum}${carryOnes ? ' — carry 1' : ''}`,
      },
      {
        text: 'Add the tens column.',
        detail: `${digitAt(a, 1)} + ${digitAt(b, 1)}${carryOnes ? ' + 1' : ''} = ${tensSum}${carryTens ? ' — carry 1' : ''}`,
      },
      {
        text: 'Add the hundreds column.',
        detail: `${digitAt(a, 2)} + ${digitAt(b, 2)}${carryTens ? ' + 1' : ''} = ${hundredsSum}`,
      },
      { text: `So ${a} + ${b} = ${sum}.` },
    ]

    return {
      skillId: 'add-3digit',
      prompt: 'Add the columns.',
      display: { kind: 'column', operands: [a, b], operator: '+' },
      answer: intAnswer(sum),
      inputMode: 'keypad',
      misconceptions: [
        {
          value: sum - (carryOnes ? 10 : 0),
          tag: 'forgot-carry-ones',
          nudge: 'Check the ones column — a ten needs to carry across.',
        },
        {
          value: sum - (carryTens ? 100 : 0),
          tag: 'forgot-carry-tens',
          nudge: 'Check the tens column — a hundred needs to carry across.',
        },
      ],
      hint: 'Work right to left: ones, then tens, then hundreds. Carry as you go.',
      solution: steps,
      difficulty,
    }
  },
}

export const unit01: Unit = {
  id: 'unit-01',
  name: 'Adding & Subtracting',
  color: 'blossom',
  skills: [addFacts, subFacts, add2NoCarry, add2Carry, sub2Borrow, add3Digit],
}
