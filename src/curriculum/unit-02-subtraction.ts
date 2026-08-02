import { intAnswer } from '../lib/answer'
import type { SkillGenerator } from '../lib/types'
import {
  THREE_DIGIT,
  TWO_DIGIT,
  band,
  borrowChain,
  borrowedWithoutReducing,
  chainStoppedAtLender,
  columnTrace,
  countOf,
  defineSkill,
  digitAt,
  drawPair,
  flippedColumns,
  misalignedColumns,
  misalignedValue,
  offBy,
  offByOne,
  pickFrame,
  place,
  skippedUpperSubtraction,
  storyProblem,
  wrongOperation,
} from './engine'
import { SUBTRACTION_FRAMES } from './phrasing/subtraction'

// ---------------------------------------------------------------------------
// Differences within ten
// ---------------------------------------------------------------------------

const subFactsSmall = defineSkill({
  id: 'sub-facts-small',
  name: 'Small Differences',
  blurb: 'Subtracting within 10',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-facts-small',
      rng,
      // Its own ladder, like `sub-facts` next door: the whole is what climbs,
      // and it is capped at 10 rather than at `SINGLE_DIGIT`'s 9 because a
      // difference within ten includes taking from ten itself.
      band: band(difficulty, {
        1: [4, 6],
        2: [4, 7],
        3: [5, 8],
        4: [6, 9],
        5: [7, 10],
      }),
      second: (drawn, r) => r.int(2, drawn - 2),
      // Taking away 1, or all of it, teaches nothing at this stage.
      where: ({ a, b }) => b > 1 && a - b > 1,
    })

    const diff = a - b

    return {
      prompt: 'What is the difference?',
      display: { kind: 'inline', text: `${a} − ${b}` },
      answer: intAnswer(diff),
      misconceptions: [
        ...offByOne(diff, {
          low: 'Almost — that counts back one too far.',
          high: 'Almost — one more to count back.',
        }),
        wrongOperation(a, b, '−', 'That is the two put together. This one is taking away.'),
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
// Single-digit subtraction facts
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
// Subtracting whole tens
// ---------------------------------------------------------------------------

const subTens = defineSkill({
  id: 'sub-tens',
  name: 'Subtracting Tens',
  blurb: '50 − 20',
  build({ rng, difficulty }) {
    // The *count* of tens is drawn, then multiplied up, exactly as `add-tens`
    // does — drawing from [20, 90] and rejecting everything that is not a whole
    // ten would throw away nine draws in ten for a constraint that is really
    // about which numbers exist.
    const { a, b } = drawPair({
      label: 'sub-tens',
      rng,
      band: band(difficulty, {
        1: [3, 5],
        2: [3, 6],
        3: [4, 8],
        4: [5, 9],
        5: [6, 9],
      }),
      second: (drawn, r) => r.int(1, drawn - 2),
      // A count of tens left over, so the answer is never a bare 10 or 0.
      where: ({ a, b }) => b >= 1 && a - b >= 2,
    })

    // The skill's one idea, named: you subtract the counts, then read them as tens.
    const count = a - b
    const [x, y] = [a * 10, b * 10]
    const diff = count * 10
    // The difference is always 2 tens or more, so only `y` needs `countOf`'s
    // singular — but it does need it: "10 is 1 tens" reads as the app talking
    // down to someone.

    return {
      prompt: 'What is the difference?',
      display: { kind: 'inline', text: `${x} − ${y}` },
      answer: intAnswer(diff),
      misconceptions: [
        // The error the skill exists to catch: subtracted the tens digits, then
        // wrote the count instead of the quantity. Can never equal the
        // difference, which is ten times it.
        {
          value: count,
          tag: 'dropped-place-value',
          nudge: `That is ${b} taken from ${a} — but you are counting tens here, not ones.`,
        },
        ...offBy(diff, 10, {
          tag: 'off-by-ten',
          low: 'One ten too few — count the tens again.',
          high: 'One ten too many — count the tens again.',
        }),
      ],
      hint: `Take ${b} from ${a}, then remember you are counting tens.`,
      solution: [
        { text: `${x} is ${countOf(a, 'ten')}, and ${y} is ${countOf(b, 'ten')}.` },
        {
          text: 'Take away the tens.',
          detail: `${a} − ${b} = ${count}`,
        },
        { text: `${count} tens is ${diff}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two-digit subtraction, no borrowing
// ---------------------------------------------------------------------------

const sub2NoBorrow = defineSkill({
  id: 'sub-2digit-noborrow',
  name: 'Two-Digit Subtraction',
  blurb: 'Column subtraction, no borrowing',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-2digit-noborrow',
      rng,
      band: band(difficulty, TWO_DIGIT),
      // Each digit of `b` is built under the digit of `a` above it, which makes
      // "no column runs short" true by construction rather than something to
      // reject on. Drawing both operands from the band and filtering threw away
      // 19 draws in 20 at the lowest difficulty — the same waste `sub-tens`
      // avoids by drawing counts of tens. `Math.max` guards the one shape this
      // cannot serve, an `a` with a zero digit, which `where` then rejects.
      second: (drawn, r) =>
        r.int(1, Math.max(1, digitAt(drawn, 1))) * 10 + r.int(1, Math.max(1, digitAt(drawn, 0))),
      where: ({ a, b }) => {
        const t = columnTrace(a, b, '−')
        const ones = place(t, 0)
        const tens = place(t, 1)
        return (
          // Only reachable where `a` had a zero digit and the guard above put a
          // 1 under it. Everything else about the columns is already true.
          t.places.every((p) => p.carry === 0) &&
          // A repdigit subtrahend makes the misaligned prediction below equal
          // the answer.
          ones.bottom !== tens.bottom &&
          // That prediction also has to stay a number the learner could have
          // typed: this pad offers digits only, so taking the swapped operand
          // can land below zero and never fire. 48 − 15 misread as 48 − 51 is
          // −3, and that shipped once.
          misalignedValue(t) > 0 &&
          t.result > 9
        )
      },
    })

    const trace = columnTrace(a, b, '−')
    const ones = place(trace, 0)
    const tens = place(trace, 1)

    return {
      prompt: 'Subtract the columns.',
      display: { kind: 'column', operands: [a, b], operator: '−' },
      answer: intAnswer(trace.result),
      misconceptions: [
        wrongOperation(a, b, '−', 'That is the sum. This one is asking you to take away.'),
        // Deliberately not `flippedColumns`: with nothing to borrow, taking the
        // smaller digit from the larger *is* the answer, so that prediction
        // would be filtered on every problem — the state `add-2digit-nocarry`
        // shipped in, which `alwaysFiltered` now catches.
        misalignedColumns(
          trace,
          'Check the columns line up — ones under ones, tens under tens.',
        ),
      ],
      hint: 'Subtract the ones column first, then the tens column.',
      solution: [
        {
          text: 'Subtract the ones column.',
          detail: `${ones.top} − ${ones.bottom} = ${ones.digit}`,
        },
        {
          text: 'Subtract the tens column.',
          detail: `${tens.top} − ${tens.bottom} = ${tens.digit}`,
        },
        { text: `Put them together: ${trace.result}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Two-digit subtraction with borrowing
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
// Three-digit subtraction with borrowing
// ---------------------------------------------------------------------------

const sub3Borrow = defineSkill({
  id: 'sub-3digit-borrow',
  name: 'Three-Digit Borrowing',
  blurb: 'Borrowing across three digits',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-3digit-borrow',
      rng,
      band: band(difficulty, THREE_DIGIT),
      second: (drawn, r) => r.int(111, Math.max(111, drawn - 1)),
      where: ({ a, b }) => {
        if (b >= a) return false
        const t = columnTrace(a, b, '−')
        const [ones, tens] = [place(t, 0), place(t, 1)]
        return (
          // Exactly one borrow, out of the ones. A tens borrow as well would be
          // a second idea, and a borrow that has to travel is the next skill.
          ones.carry === 1 &&
          tens.carry === 0 &&
          tens.top > 0 &&
          // Keeps the two predictions below apart: they coincide only when the
          // tens digits are ten apart after the borrow, which is `t2 === 5` on
          // the flipped side. Rejecting an equal-digit subtrahend is cheaper
          // than reasoning about it per problem.
          place(t, 2).bottom !== tens.bottom
        )
      },
    })

    const trace = columnTrace(a, b, '−')
    const ones = place(trace, 0)
    const tens = place(trace, 1)
    const hundreds = place(trace, 2)

    return {
      prompt: 'Subtract. You will need to borrow.',
      display: { kind: 'column', operands: [a, b], operator: '−' },
      answer: intAnswer(trace.result),
      misconceptions: [
        flippedColumns(
          trace,
          `The ones column has ${ones.top} and needs ${ones.bottom} taken off it. Borrow a ten rather than flipping them around.`,
        ),
        borrowedWithoutReducing(
          trace,
          `The borrow is right, but the tens digit drops from ${tens.top} to ${tens.reduced} once it lends that ten away.`,
        ),
      ],
      hint: `You cannot take ${ones.bottom} from ${ones.top}, so borrow a ten from the ${tens.top}.`,
      // Four steps is the contract's limit, so the total rides on the hundreds
      // step rather than taking one of its own.
      solution: [
        {
          text: `Borrow a ten — ${tens.top} becomes ${tens.reduced}, ones become ${ones.borrowed}.`,
        },
        {
          text: 'Subtract the ones.',
          detail: `${ones.borrowed} − ${ones.bottom} = ${ones.digit}`,
        },
        {
          text: 'Subtract the tens.',
          detail: `${tens.reduced} − ${tens.bottom} = ${tens.digit}`,
        },
        {
          text: `Then the hundreds, giving ${trace.result}.`,
          detail: `${hundreds.top} − ${hundreds.bottom} = ${hundreds.digit}`,
        },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Borrowing across a zero — the unit's major wall
// ---------------------------------------------------------------------------

const subAcrossZero = defineSkill({
  id: 'sub-across-zero',
  name: 'Borrowing Across Zero',
  blurb: '500 − 237',
  build({ rng, difficulty }) {
    const { a, b } = drawPair({
      label: 'sub-across-zero',
      rng,
      band: band(difficulty, THREE_DIGIT),
      // `b` is built digit by digit rather than drawn and filtered: its ones
      // digit above `a`'s so the ones column runs short, its tens digit at least
      // 1, and its hundreds digit below `a`'s so it stays the smaller number.
      // Those three are what the skill *is*, and rejecting for them accepted
      // only one draw in 27 — enough that `drawPair` genuinely exhausted its 300
      // attempts and threw at a learner. Composing is the move `sub-tens`
      // documents next door. The accepted set is unchanged: a `b` whose hundreds
      // digit equalled `a`'s would exceed `a`, since `a`'s tens are 0.
      second: (drawn, r) =>
        r.int(1, Math.max(1, digitAt(drawn, 2) - 1)) * 100 +
        r.int(1, 9) * 10 +
        r.int(Math.min(9, digitAt(drawn, 0) + 1), 9),
      where: ({ a, b }) => {
        // Only `a`'s shape is left to reject: three digits, a zero in the tens
        // for the borrow to travel past, and room above and below for the
        // composition to have been possible.
        if (b >= a) return false
        const t = columnTrace(a, b, '−')
        const tens = place(t, 1)

        // The tens' own `carry` is not asserted because it cannot be anything
        // else — a zero lending downward reduces to −1, which is below any digit.
        //
        // The subtrahend's tens digit must not be 0 either, and that is a wall
        // rule rather than a taste: with nothing to take from the tens, the
        // chain-stopped prediction lands exactly on the un-reduced one, and
        // where the ones digits are also five apart all three collapse onto a
        // single value — 502 − 107 predicts 405 three times.
        return place(t, 0).carry === 1 && tens.top === 0 && tens.bottom > 0
      },
    })

    const trace = columnTrace(a, b, '−')
    const ones = place(trace, 0)
    const tens = place(trace, 1)
    // The column that pays, found rather than assumed: under this draw it is
    // always the hundreds, but saying so twice is how a wider ladder would come
    // apart silently.
    const { lender } = borrowChain(trace, 0)

    return {
      prompt: 'Subtract. The tens have nothing to lend.',
      display: { kind: 'column', operands: [a, b], operator: '−' },
      answer: intAnswer(trace.result),
      misconceptions: [
        flippedColumns(
          trace,
          `The ones column has ${ones.top} and needs ${ones.bottom} taken off it. The borrow has to come from further along.`,
        ),
        borrowedWithoutReducing(
          trace,
          `The ten arrived, but nothing paid for it — the ${lender.top} hundreds drop to ${lender.reduced}.`,
        ),
        // The error the zero column specifically invites, and the reason this
        // skill carries three predictions: the two above collide with each other
        // on some draws, exactly as they do on `sub-2digit-borrow`.
        chainStoppedAtLender(
          trace,
          0,
          `The hundreds are right. The tens became 10, then lent a ten on to the ones, so they stand at ${tens.borrowed}.`,
        ),
      ],
      hint: `The tens are 0, so the ten has to come from the ${lender.top} hundreds.`,
      solution: [
        {
          text: `Ones: ${ones.top} − ${ones.bottom}. The tens are 0 and cannot lend.`,
        },
        {
          text: `So the hundreds lend: ${lender.top} becomes ${lender.reduced}, tens become 10.`,
        },
        {
          text: `Now the tens lend to the ones, standing at ${tens.borrowed}.`,
          detail: `${ones.borrowed} − ${ones.bottom} = ${ones.digit}`,
        },
        {
          text: `Subtract the rest, giving ${trace.result}.`,
          detail: `${tens.borrowed} − ${tens.bottom} = ${tens.digit}, ${lender.borrowed} − ${lender.bottom} = ${lender.digit}`,
        },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Subtraction word problems
// ---------------------------------------------------------------------------

const subWords = defineSkill({
  id: 'sub-words',
  name: 'Subtraction Word Problems',
  blurb: 'Spot the subtraction',
  build({ rng, difficulty }) {
    const frame = pickFrame(rng, SUBTRACTION_FRAMES)

    const { a, b } = drawPair({
      label: 'sub-words',
      rng,
      band: band(difficulty, TWO_DIGIT),
      // Reading the situation is the work here, so the arithmetic stays inside
      // what the unit has already built rather than adding a second difficulty.
      // `a` is the whole and `b` comes off it, which every frame's wording says.
      where: ({ a, b }) => a - b > 1,
    })

    // Mentioned in the sentence and absent from the answer. Below `a` so the
    // wrong-pair prediction stays a number the learner could have typed, and
    // clear of `b` so it cannot land on the correct difference.
    const distractor = rng.intExcept(2, a - 1, [a, b])

    return storyProblem(frame, { a, b, distractor })
  },
})

// Curriculum order, which is the order the cards render and therefore the order
// they open in. A test pins this against `implementedSkillIds`. The unit's id,
// name and colour are not repeated here: the manifest declares the first two and
// `course` derives the tree from it.
export const unit02: SkillGenerator[] = [
  subFactsSmall,
  subFacts,
  subTens,
  sub2NoBorrow,
  sub2Borrow,
  sub3Borrow,
  subAcrossZero,
  subWords,
]
