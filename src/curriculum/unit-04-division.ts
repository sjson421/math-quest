import { intAnswer } from '../lib/answer'
import { constrain } from '../lib/rng'
import type { Rng } from '../lib/rng'
import type { SkillGenerator } from '../lib/types'
import {
  band,
  type Band,
  countOf,
  defineSkill,
  digitWidth,
  divisionStep,
  divisionTrace,
  forgotBringDown,
  forgotBringDownValue,
  ignoredStepRemainder,
  ignoredStepRemainderValue,
  offBy,
  pickFrame,
  storyProblem,
  type DivisionTrace,
} from './engine'
import { DIVISION_FRAMES } from './phrasing/division'

/**
 * Unit 4 · Division.
 *
 * Every skill here composes its operands from a divisor and a quotient rather
 * than drawing a dividend and filtering for one that divides. Exactness is then
 * structural, which matters more than it sounds: `sub-across-zero` shipped a
 * three-property filter that genuinely exhausted its 300 attempts in front of a
 * learner, and a division wanting an exact quotient, a quotient of a given width
 * and a non-zero intermediate remainder wants three of them at once.
 *
 * The ladders are written over the **quotient**, not the dividend. Difficulty is
 * measured from the answer for any problem that does not carry display values,
 * so a ladder growing the dividend while the divisor grows with it reads as flat.
 */

const shareErrors = (share: number, noun = 'group') =>
  offBy(share, 1, {
    tag: 'one-each',
    low: `That leaves one over in each ${noun}. Share one more.`,
    high: `That runs the total out early. Each ${noun} gets one fewer.`,
  })

/**
 * Inline, not a column, on every division skill.
 *
 * `ColumnView` right-aligns its operands on one digit width, so a stacked
 * division would sit the divisor's ones digit under the dividend's — the one
 * alignment long division does not use, on the skills whose subject is the
 * algorithm. The working belongs in the solution steps, which can show a
 * bring-down; a static stack cannot.
 */
const divisionDisplay = (dividend: number, divisor: number) =>
  ({ kind: 'inline', text: `${dividend} ÷ ${divisor}` }) as const

/** The step that writes the quotient's leading digit — where the work starts. */
const leadingStep = (trace: DivisionTrace) =>
  divisionStep(trace, digitWidth(trace.quotient) - 1)

/**
 * A division that deliberately does not come out exactly.
 *
 * Shared by the two skills built on one: `div-remainder` asks for what is left,
 * `long-div-remainder` asks for the whole quotient that ignores it. The
 * remainder is drawn strictly inside the divisor, so something is always left
 * and never enough for another group — which is the definition of a remainder,
 * and the one part of this that must not drift between the two skills.
 */
const drawInexact = (rng: Rng, [min, max]: Band) => {
  const quotient = rng.int(min, max)
  const divisor = rng.int(3, 9)
  const remainder = rng.int(1, divisor - 1)
  const taken = quotient * divisor

  return { quotient, divisor, remainder, taken, dividend: taken + remainder }
}

// ---------------------------------------------------------------------------
// Meaning: sharing and grouping
// ---------------------------------------------------------------------------

const divMeaning = defineSkill({
  id: 'div-meaning',
  name: 'What Division Is',
  blurb: 'Sharing and grouping',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 4],
      2: [2, 5],
      3: [2, 6],
      4: [2, 8],
      5: [2, 10],
    })
    const share = rng.int(min, max)
    const groups = rng.int(2, 6)
    const total = share * groups

    return {
      prompt: `${total} is shared into ${groups} equal groups. How many in each?`,
      display: divisionDisplay(total, groups),
      answer: intAnswer(share),
      misconceptions: shareErrors(share),
      hint: `Share ${total} evenly across ${groups} groups.`,
      solution: [
        { text: `Split ${total} into ${groups} equal groups.` },
        { text: 'Count what lands in one group.', detail: `${total} ÷ ${groups} = ${share}` },
        { text: `Each group gets ${share}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Facts: the tables, run backwards
// ---------------------------------------------------------------------------

const divFacts = defineSkill({
  id: 'div-facts',
  name: 'Division Facts',
  blurb: 'The inverse of the tables',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 4],
      2: [2, 6],
      3: [2, 8],
      4: [3, 10],
      5: [4, 12],
    })
    const quotient = rng.int(min, max)
    const divisor = rng.int(2, 10)
    const dividend = quotient * divisor

    return {
      prompt: 'What is the quotient?',
      display: divisionDisplay(dividend, divisor),
      answer: intAnswer(quotient),
      misconceptions: [
        {
          value: dividend * divisor,
          tag: 'multiplied-instead',
          nudge: `That multiplies. This asks how many ${divisor}s fit inside ${dividend}.`,
        },
        ...shareErrors(quotient),
      ],
      hint: `Ask what times ${divisor} makes ${dividend}.`,
      solution: [
        { text: `Use the ${divisor} times table backwards.` },
        {
          text: `Find what times ${divisor} makes ${dividend}.`,
          detail: `${divisor} × ${quotient} = ${dividend}`,
        },
        { text: `So ${dividend} ÷ ${divisor} = ${quotient}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Remainders: what the tables leave behind
// ---------------------------------------------------------------------------

const divRemainder = defineSkill({
  id: 'div-remainder',
  name: 'Remainders',
  blurb: 'What is left over',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 5],
      2: [3, 8],
      3: [4, 12],
      4: [5, 16],
      5: [6, 20],
    })
    const { quotient, divisor, remainder, dividend, taken } = drawInexact(rng, [min, max])

    return {
      prompt: 'What is left over?',
      display: {
        ...divisionDisplay(dividend, divisor),
        // The answer is a property of this division, not its value. `${dividend}
        // ÷ ${divisor}` evaluates to a fraction, and the remainder is neither
        // that nor its whole part, so verification is told which to derive.
        wholeNumber: { values: [dividend, divisor], operation: 'divide-remainder' as const },
      },
      answer: intAnswer(remainder),
      misconceptions: [
        {
          value: quotient,
          tag: 'gave-quotient',
          nudge: `That counts whole groups of ${divisor}, not what is left after them.`,
        },
        {
          value: divisor - remainder,
          tag: 'counted-to-the-next-group',
          nudge: `That counts up to the next ${divisor} instead of down from ${dividend}.`,
        },
      ],
      hint: `Take groups of ${divisor} away until fewer than ${divisor} remain.`,
      solution: [
        {
          text: `${divisor} fits into ${dividend} ${countOf(quotient, 'time')}.`,
          detail: `${divisor} × ${quotient} = ${taken}`,
        },
        { text: 'Take that away from the total.', detail: `${dividend} − ${taken} = ${remainder}` },
        { text: `So ${remainder} is left over.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Dividing by powers of ten
// ---------------------------------------------------------------------------

const divBy10100 = defineSkill({
  id: 'div-by-10-100',
  name: 'Divide by 10 and 100',
  blurb: 'Shifting places back',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 12],
      2: [5, 25],
      3: [10, 45],
      4: [20, 70],
      5: [30, 99],
    })
    const quotient = rng.int(min, max)
    const divisor = rng.pick(difficulty <= 2 ? [10] : [10, 100])
    const dividend = quotient * divisor
    const zeros = divisor === 10 ? 1 : 2
    const places = countOf(zeros, 'place')

    return {
      prompt: 'What is the quotient?',
      display: divisionDisplay(dividend, divisor),
      answer: intAnswer(quotient),
      misconceptions: [
        {
          value: quotient * 10,
          tag: 'shifted-too-few',
          nudge: `That shifts one place too few. Dividing by ${divisor} shifts ${places}.`,
        },
        {
          value: dividend * divisor,
          tag: 'shifted-wrong-way',
          nudge: 'That shifts left, which makes it larger. Dividing shifts right.',
        },
      ],
      hint: `Shift every digit ${places} right.`,
      solution: [
        { text: `Start with ${dividend}.` },
        { text: `Shift its digits ${places} right.`, detail: `${dividend} → ${quotient}` },
        { text: `So ${dividend} ÷ ${divisor} = ${quotient}.` },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Long division
// ---------------------------------------------------------------------------

const longDiv1Digit = defineSkill({
  id: 'long-div-1digit',
  name: 'Long Division',
  blurb: 'Single-digit divisor',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [12, 39],
      2: [15, 60],
      3: [20, 120],
      4: [40, 250],
      5: [60, 400],
    })

    const trace = constrain(
      () => {
        const divisor = rng.int(2, 9)
        return divisionTrace(rng.int(min, max) * divisor, divisor)
      },
      // Both wall diagnoses have to survive the central filter on *every*
      // problem, so the draw proves it here rather than hoping. The values come
      // from the engine rather than being recomputed, which is what stops the
      // check and the prediction drifting apart.
      (candidate) => {
        if (candidate.steps.every((step) => step.remainder === 0)) return false
        const ignored = ignoredStepRemainderValue(candidate)
        if (ignored === 0) return false
        return (
          new Set([candidate.quotient, forgotBringDownValue(candidate), ignored]).size === 3
        )
      },
    )

    const first = leadingStep(trace)
    // By place, not by array position: `divisionStep` names the division if the
    // step is missing, where indexing past the end would reach a learner as a
    // TypeError on `undefined`. Every band here starts at 12, so there is always
    // a place below the leading one — this keeps that assumption legible.
    const next = divisionStep(trace, first.place - 1)

    return {
      prompt: 'What is the quotient?',
      display: divisionDisplay(trace.dividend, trace.divisor),
      answer: intAnswer(trace.quotient),
      misconceptions: [
        forgotBringDown(trace, 'One more digit still has to come down before you stop.'),
        ignoredStepRemainder(
          trace,
          'Each step divides what was left over plus the next digit.',
        ),
      ],
      hint: `Divide, multiply, subtract, then bring the next digit down.`,
      solution: [
        {
          text: `Divide ${first.working} by ${trace.divisor} first.`,
          detail: `${trace.divisor} × ${first.digit} = ${first.product}, leaving ${first.remainder}`,
        },
        { text: `Bring the next digit down to make ${next.working}.` },
        {
          text: 'Repeat to the last digit.',
          detail: `${trace.dividend} ÷ ${trace.divisor} = ${trace.quotient}`,
        },
      ],
    }
  },
})

const longDivRemainder = defineSkill({
  id: 'long-div-remainder',
  name: 'Long Division with Remainder',
  blurb: 'When it does not divide evenly',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [12, 39],
      2: [15, 60],
      3: [20, 120],
      4: [40, 250],
      5: [60, 400],
    })
    const { quotient, divisor, remainder, dividend, taken } = drawInexact(rng, [min, max])

    return {
      prompt: 'How many whole groups fit?',
      display: {
        ...divisionDisplay(dividend, divisor),
        wholeNumber: { values: [dividend, divisor], operation: 'divide-quotient' as const },
      },
      answer: intAnswer(quotient),
      misconceptions: [
        {
          value: remainder,
          tag: 'gave-remainder',
          nudge: 'That is what was left over. The question asks how many groups.',
        },
        {
          value: quotient + 1,
          tag: 'rounded-up',
          nudge: `The last ${remainder} cannot make another group of ${divisor}.`,
        },
      ],
      hint: `Stop once what is left is under ${divisor}.`,
      solution: [
        {
          text: `${divisor} fits into ${dividend} ${countOf(quotient, 'whole time')}.`,
          detail: `${divisor} × ${quotient} = ${taken}`,
        },
        {
          text: `That leaves ${remainder}, too few for another group.`,
          detail: `${dividend} − ${taken} = ${remainder}`,
        },
        { text: `So the quotient is ${quotient}.` },
      ],
    }
  },
})

const longDiv2Digit = defineSkill({
  id: 'long-div-2digit',
  name: 'Two-Digit Divisor',
  blurb: 'Estimating each digit',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [12, 29],
      2: [14, 45],
      3: [18, 70],
      4: [25, 99],
      5: [35, 140],
    })
    const quotient = rng.int(min, max)
    const divisor = rng.int(11, 40)
    const trace = divisionTrace(quotient * divisor, divisor)
    const first = leadingStep(trace)
    // The place the first estimate lands in, so a wrong guess there is off by a
    // whole unit of it rather than by one.
    const place = 10 ** (digitWidth(quotient) - 1)

    return {
      prompt: 'What is the quotient?',
      display: divisionDisplay(trace.dividend, divisor),
      answer: intAnswer(quotient),
      misconceptions: offBy(quotient, place, {
        tag: 'estimate',
        low: `That first estimate was one too low; another ${divisor} still fits.`,
        high: `That first estimate was one too high; the product passes ${first.working}.`,
      }),
      hint: `Try a digit, multiply it by ${divisor}, and check it fits.`,
      solution: [
        {
          text: `Estimate how many ${divisor}s fit into ${first.working}.`,
          detail: `${divisor} × ${first.digit} = ${first.product}`,
        },
        {
          text: 'Subtract, then bring the next digit down.',
          detail: `${first.working} − ${first.product} = ${first.remainder}`,
        },
        {
          text: 'Estimate again for the last place.',
          detail: `${trace.dividend} ÷ ${divisor} = ${quotient}`,
        },
      ],
    }
  },
})

// ---------------------------------------------------------------------------
// Number properties, answered by choosing a complete list
// ---------------------------------------------------------------------------

/**
 * Trial division, local to this unit.
 *
 * Not in the engine. Number theory over values under a few hundred is three
 * one-liners, and the engine's rule is that a helper arrives when a second skill
 * outside its own unit needs it — otherwise multiplication inherits shapes
 * guessed at from division. `generators.test.ts` writes its own copies, which is
 * the point: a helper shared with the check verifies nothing.
 */
export const factorsOf = (n: number): number[] =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)

export const multiplesOf = (n: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => n * (i + 1))

/** Exactly two factors — which is why 1 is not prime and needs no special case. */
export const isPrime = (n: number): boolean => factorsOf(n).length === 2

const asList = (values: number[]) => values.join(', ')

/**
 * Choice ids are numeric strings, and that is load-bearing.
 *
 * `generateProblem()` reads the correct value for a choice answer as
 * `Number(answer.id)` and `diagnose()` compares `Number(entry)` against
 * misconception values. An id like `'prime'` makes both `NaN`: nothing is ever
 * filtered, nothing is ever diagnosed, and every test still passes. Unit 0's
 * choice skills already number their ids; these follow.
 */
const CORRECT = '0'

const MULTIPLES_SHOWN = 4

const factors = defineSkill({
  id: 'factors',
  name: 'Factors',
  blurb: 'Find all factors of a number',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [12, 30],
      2: [12, 48],
      3: [18, 72],
      4: [24, 96],
      5: [30, 140],
    })
    // Six factors or more, so stripping 1 and the number itself still leaves a
    // list. Below that the distractor is a single value or nothing at all, and
    // an option nobody could mistake for the answer teaches nothing.
    //
    // The candidate carries the list the predicate had to build anyway. Trial
    // division is O(n) and this runs on every problem a learner sees.
    const { value, all } = constrain(
      () => {
        const candidate = rng.int(min, max)
        return { value: candidate, all: factorsOf(candidate) }
      },
      (candidate) => candidate.all.length >= 6,
    )
    // Anything in range that is not a factor. `intExcept` is the same draw
    // `mult-words` uses one file over.
    const intruder = rng.intExcept(2, value - 1, all)
    const withIntruder = [...all, intruder].sort((a, b) => a - b)

    return {
      prompt: 'Choose the list of every factor.',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'factors' as const },
      },
      answer: { kind: 'choice', id: CORRECT },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: CORRECT, label: asList(all) },
        { id: '1', label: asList(all.slice(1, -1)) },
        { id: '2', label: asList(withIntruder) },
      ]),
      misconceptions: [
        {
          value: 1,
          tag: 'omitted-ends',
          nudge: `1 and ${value} divide ${value} exactly, so both belong in the list.`,
        },
        {
          value: 2,
          tag: 'included-non-factor',
          nudge: `${intruder} does not divide ${value} exactly, so it is not a factor.`,
        },
      ],
      hint: `A factor divides ${value} with nothing left over.`,
      solution: [
        { text: `Try each number from 1 up to ${value}.` },
        { text: `Keep the ones dividing ${value} exactly.`, detail: asList(all) },
      ],
    }
  },
})

const multiples = defineSkill({
  id: 'multiples',
  name: 'Multiples',
  blurb: 'List the multiples of a number',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [2, 7],
      2: [3, 11],
      3: [4, 15],
      4: [6, 20],
      5: [8, 25],
    })
    const value = rng.int(min, max)
    const correct = multiplesOf(value, MULTIPLES_SHOWN)

    return {
      prompt: `Choose the first ${MULTIPLES_SHOWN} multiples.`,
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: {
          values: [value, MULTIPLES_SHOWN],
          operation: 'multiples' as const,
        },
      },
      answer: { kind: 'choice', id: CORRECT },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: CORRECT, label: asList(correct) },
        { id: '1', label: asList(factorsOf(value)) },
        { id: '2', label: asList([0, ...multiplesOf(value, MULTIPLES_SHOWN - 1)]) },
      ]),
      misconceptions: [
        {
          value: 1,
          tag: 'listed-factors',
          nudge: `Those divide into ${value}. Multiples count upward from ${value}.`,
        },
        {
          value: 2,
          tag: 'started-at-zero',
          // Not "zero is not a multiple" — it is. The first one counted here is
          // the number itself, and saying so is true as well as useful.
          nudge: `The first multiple counted is ${value} itself.`,
        },
      ],
      hint: `Count up in ${value}s, starting at ${value}.`,
      solution: [
        { text: `Start at ${value} and keep adding ${value}.` },
        { text: `The first ${MULTIPLES_SHOWN} land here.`, detail: asList(correct) },
      ],
    }
  },
})

const primes = defineSkill({
  id: 'primes',
  name: 'Primes',
  blurb: 'Prime or composite',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [10, 40],
      2: [10, 60],
      3: [20, 80],
      4: [30, 99],
      5: [40, 140],
    })
    // Drawn to a decided answer rather than taken as it comes: composites
    // outnumber primes badly in this range, and a skill that is nearly always
    // "composite" teaches the guess rather than the test.
    const wantPrime = rng.bool(0.4)
    // Carries the factor list the predicate built, rather than running trial
    // division over the same value a second time to read one entry off it.
    const { value, all } = constrain(
      () => {
        const candidate = rng.int(min, max)
        return { value: candidate, all: factorsOf(candidate) }
      },
      // `isPrime`'s rule, read off the list already built rather than rebuilding it.
      (candidate) => (candidate.all.length === 2) === wantPrime,
    )
    // The smallest factor above 1 — what makes a composite composite. For a
    // prime this is the number itself, which is why only the composite branch
    // below reads it.
    const divisor = all[1]

    return {
      prompt: 'Is this number prime or composite?',
      display: {
        kind: 'inline',
        text: String(value),
        wholeNumber: { values: [value], operation: 'classify-prime' as const },
      },
      answer: { kind: 'choice', id: wantPrime ? '1' : CORRECT },
      inputMode: 'choice',
      choices: rng.shuffle([
        { id: CORRECT, label: 'composite' },
        { id: '1', label: 'prime' },
      ]),
      misconceptions: wantPrime
        ? [
            {
              value: 0,
              tag: 'called-composite',
              nudge: `Nothing between 2 and ${value - 1} divides ${value} exactly.`,
            },
          ]
        : [
            {
              value: 1,
              tag: 'called-prime',
              nudge: `${value} is ${divisor} × ${value / divisor}, so it has another factor.`,
            },
          ],
      hint: 'Try dividing by 2, 3, 5 and 7.',
      solution: wantPrime
        ? [
            { text: `Test 2, 3, 5 and 7 against ${value}.` },
            { text: 'None of them divide it exactly.' },
            { text: `So ${value} is prime.` },
          ]
        : [
            { text: `Test 2, 3, 5 and 7 against ${value}.` },
            { text: `${divisor} divides it exactly.`, detail: `${divisor} × ${value / divisor} = ${value}` },
            { text: `So ${value} is composite.` },
          ],
    }
  },
})

// ---------------------------------------------------------------------------
// Division word problems
// ---------------------------------------------------------------------------

const divWords = defineSkill({
  id: 'div-words',
  name: 'Division Word Problems',
  blurb: 'Spot the division',
  build({ rng, difficulty }) {
    const [min, max] = band(difficulty, {
      1: [3, 5],
      2: [3, 7],
      3: [4, 9],
      4: [5, 12],
      5: [7, 15],
    })

    // The total is composed from the share and the groups, and the distractor is
    // drawn from what divides that total. Both matter: the frame predicts
    // `total ÷ distractor`, and a distractor that does not divide exactly makes
    // that prediction a fraction — a diagnosis nothing on a whole-number pad can
    // ever match, sitting in the bank looking like coverage.
    const draw = constrain(
      () => {
        const share = rng.int(min, max)
        const groups = rng.int(2, 8)
        const total = share * groups
        return {
          share,
          groups,
          total,
          // Never 1 (which returns the total, already predicted), never the real
          // group count, never the total itself — "144 batches archived" is not
          // a sentence anybody wrote — and never the share, which would print
          // the answer in the sentence as a quantity meaning something else and
          // let a learner be right for the wrong reason.
          options: factorsOf(total).filter(
            (d) => d !== 1 && d !== groups && d !== total && d !== share,
          ),
        }
      },
      (candidate) => candidate.options.length > 0,
    )

    return storyProblem(pickFrame(rng, DIVISION_FRAMES), {
      a: draw.total,
      b: draw.groups,
      distractor: rng.pick(draw.options),
    })
  },
})

export const unit04: SkillGenerator[] = [
  divMeaning,
  divFacts,
  divRemainder,
  divBy10100,
  longDiv1Digit,
  longDivRemainder,
  longDiv2Digit,
  factors,
  multiples,
  primes,
  divWords,
]
