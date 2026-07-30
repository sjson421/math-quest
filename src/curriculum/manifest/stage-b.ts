/**
 * Stage B · The Four Operations — Units 1–5, 44 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * No capability requirements: everything here is whole-number arithmetic on the
 * plain number keypad, which is all that exists today.
 *
 * The units run in a straight line — each depends on the one before it, so
 * multiplication reaches addition transitively rather than by a second edge. The
 * six skills that already have generators keep the `name` and `blurb` their
 * generators use, so pointing the app at the manifest changes no learner-facing
 * text. Comments on wall skills carry the document's note, which is what
 * misconception authoring works from later.
 */

import type { StageEntry } from './types'

export const stageB: StageEntry = {
  id: 'stage-b',
  name: 'The Four Operations',
  units: [
    {
      id: 'unit-1',
      name: 'Addition',
      dependsOn: ['unit-0'],
      skills: [
        {
          id: 'add-facts-small',
          name: 'Small Sums',
          blurb: 'Sums to 10',
          quick: true,
        },
        {
          id: 'add-facts',
          name: 'Addition Facts',
          blurb: 'Adding small numbers',
        },
        {
          id: 'add-tens',
          name: 'Adding Tens',
          blurb: '20 + 30',
        },
        {
          id: 'add-2digit-nocarry',
          name: 'Two-Digit Addition',
          blurb: 'Column addition, no carrying yet',
        },
        {
          // Wall: forgetting the carry. The ones column is answered correctly and
          // the carried ten is dropped, so the tens digit is one short.
          id: 'add-2digit-carry',
          name: 'Carrying',
          blurb: 'When the ones column overflows',
          wall: true,
        },
        {
          id: 'add-3digit',
          name: 'Bigger Numbers',
          blurb: 'Three-digit column addition',
        },
        {
          id: 'add-three-numbers',
          name: 'Three Addends',
          blurb: 'Add a stack of three numbers',
        },
        {
          id: 'add-words',
          name: 'Addition Word Problems',
          blurb: 'Spot the addition',
        },
      ],
    },
    {
      id: 'unit-2',
      name: 'Subtraction',
      dependsOn: ['unit-1'],
      skills: [
        {
          id: 'sub-facts-small',
          name: 'Small Differences',
          blurb: 'Subtracting within 10',
          quick: true,
        },
        {
          id: 'sub-facts',
          name: 'Subtraction Facts',
          blurb: 'Taking away small numbers',
        },
        {
          id: 'sub-tens',
          name: 'Subtracting Tens',
          blurb: '50 − 20',
        },
        {
          id: 'sub-2digit-noborrow',
          name: 'Two-Digit Subtraction',
          blurb: 'Column subtraction, no borrowing',
        },
        {
          // Wall: flipping the digits to avoid borrowing. Faced with 4 − 7 in the
          // ones column, a learner subtracts the smaller from the larger and
          // reports 3.
          id: 'sub-2digit-borrow',
          name: 'Borrowing',
          blurb: 'When the ones column runs short',
          wall: true,
        },
        {
          id: 'sub-3digit-borrow',
          name: 'Three-Digit Borrowing',
          blurb: 'Borrowing across three digits',
        },
        {
          // Major wall: the double borrow. There is no ten to take from the zero,
          // so the borrow has to travel two columns before anything can be
          // subtracted.
          id: 'sub-across-zero',
          name: 'Borrowing Across Zero',
          blurb: '500 − 237',
          wall: true,
        },
        {
          id: 'sub-words',
          name: 'Subtraction Word Problems',
          blurb: 'Spot the subtraction',
        },
      ],
    },
    {
      // The slowest unit by design. Tables arrive easiest first so momentum
      // builds before the hard ones, which is why 9 is taught before 7 and 8.
      id: 'unit-3',
      name: 'Multiplication',
      dependsOn: ['unit-2'],
      skills: [
        {
          id: 'mult-meaning',
          name: 'What Multiplication Is',
          blurb: 'Repeated addition and arrays',
          quick: true,
        },
        {
          id: 'times-2',
          name: 'Twos',
          blurb: 'Doubling',
          quick: true,
        },
        {
          id: 'times-10',
          name: 'Tens',
          blurb: 'The pattern of zeros',
          quick: true,
        },
        {
          id: 'times-5',
          name: 'Fives',
          blurb: 'Half of ten',
        },
        {
          id: 'times-3',
          name: 'Threes',
          blurb: 'The three times table',
        },
        {
          id: 'times-4',
          name: 'Fours',
          blurb: 'Double twice',
        },
        {
          id: 'times-6',
          name: 'Sixes',
          blurb: 'The six times table',
        },
        {
          id: 'times-9',
          name: 'Nines',
          blurb: 'The digit-sum pattern',
        },
        {
          // Wall: the hardest facts in the table, with no pattern to lean on.
          id: 'times-7-8',
          name: 'Sevens & Eights',
          blurb: 'The facts with no shortcut',
          wall: true,
        },
        {
          id: 'times-mixed',
          name: 'Mixed Tables',
          blurb: 'Full table review',
        },
        {
          id: 'mult-by-10-100',
          name: 'Times 10 and 100',
          blurb: 'Shifting places',
        },
        {
          // Wall: carrying inside multiplication. The carried digit has to be
          // added *after* the next column is multiplied, not before.
          id: 'mult-2by1',
          name: 'Two Digits by One',
          blurb: '34 × 6',
          wall: true,
        },
        {
          // Wall: the placeholder zero on row two. Without it the second partial
          // product lands one column too far right.
          id: 'mult-2by2',
          name: 'Two Digits by Two',
          blurb: '34 × 26',
          wall: true,
        },
        {
          id: 'mult-words',
          name: 'Multiplication Word Problems',
          blurb: 'Spot the multiplication',
        },
      ],
    },
    {
      id: 'unit-4',
      name: 'Division',
      dependsOn: ['unit-3'],
      skills: [
        {
          id: 'div-meaning',
          name: 'What Division Is',
          blurb: 'Sharing and grouping',
          quick: true,
        },
        {
          id: 'div-facts',
          name: 'Division Facts',
          blurb: 'The inverse of the tables',
        },
        {
          id: 'div-remainder',
          name: 'Remainders',
          blurb: 'What is left over',
        },
        {
          id: 'div-by-10-100',
          name: 'Divide by 10 and 100',
          blurb: 'Shifting places back',
        },
        {
          // Wall: the algorithm itself. Four steps repeated per digit, and losing
          // track of any one of them derails the whole quotient.
          id: 'long-div-1digit',
          name: 'Long Division',
          blurb: 'Single-digit divisor',
          wall: true,
        },
        {
          id: 'long-div-remainder',
          name: 'Long Division with Remainder',
          blurb: 'When it does not divide evenly',
        },
        {
          // Wall: estimating the quotient. A two-digit divisor no longer comes
          // straight off a known table, so each digit is a guess to check.
          id: 'long-div-2digit',
          name: 'Two-Digit Divisor',
          blurb: 'Estimating each digit',
          wall: true,
        },
        {
          id: 'factors',
          name: 'Factors',
          blurb: 'Find all factors of a number',
        },
        {
          id: 'multiples',
          name: 'Multiples',
          blurb: 'List the multiples of a number',
        },
        {
          id: 'primes',
          name: 'Primes',
          blurb: 'Prime or composite',
        },
        {
          id: 'div-words',
          name: 'Division Word Problems',
          blurb: 'Spot the division',
        },
      ],
    },
    {
      id: 'unit-5',
      name: 'Order of Operations',
      dependsOn: ['unit-4'],
      skills: [
        {
          // Wall: the left-to-right instinct. Every expression read so far ran
          // left to right, and multiplication is the first thing that does not.
          id: 'two-operations',
          name: 'Two Operations',
          blurb: '3 + 4 × 2',
          wall: true,
        },
        {
          id: 'with-parentheses',
          name: 'Parentheses First',
          blurb: 'Brackets change the order',
        },
        {
          // Exponents are revisited at 12.10, once Stage E introduces them.
          id: 'pemdas',
          name: 'Full Order of Operations',
          blurb: 'PEMDAS, without exponents yet',
        },
      ],
    },
  ],
}
