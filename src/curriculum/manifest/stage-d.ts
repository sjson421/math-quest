/**
 * Stage D · Parts of a Whole — Units 7–11, 50 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * The stage declares all three of its capability needs, and unlike Stage C the
 * stage-wide marking is honest: fractions cannot render as plain text, so KaTeX
 * gates the whole stage, and Units 9–11 keep reaching back for the other two —
 * `fraction-to-decimal` and `percent-to-fraction` need fraction input, and
 * `scale-drawings` needs a diagram. Every skill here stays `planned` until those
 * land, which is the accurate report rather than a defect.
 *
 * Units run in a straight line, so `percent-to-decimal` reaches decimals through
 * Unit 10's dependency on Unit 9 rather than by a second edge.
 */

import type { StageEntry } from './types'

export const stageD: StageEntry = {
  id: 'stage-d',
  name: 'Parts of a Whole',
  requires: ['katex', 'fraction-input', 'diagram'],
  units: [
    {
      // Conceptual only — adults fail fractions when procedure arrives before
      // meaning, so not one problem in this unit asks for a calculation.
      id: 'unit-7',
      name: 'Fractions: Meaning',
      dependsOn: ['unit-6'],
      skills: [
        {
          id: 'fraction-meaning',
          name: 'What a Fraction Is',
          blurb: 'Parts of a whole',
          quick: true,
        },
        {
          id: 'fraction-of-shape',
          name: 'Fractions in Pictures',
          blurb: 'Read a fraction from a diagram',
        },
        {
          // The first new vocabulary in the course. Both terms are introduced
          // here, which is what the forward-reference check keys off.
          id: 'name-parts',
          name: 'Numerator & Denominator',
          blurb: 'Name the parts of a fraction',
        },
        {
          id: 'fractions-numberline',
          name: 'Fractions on a Line',
          blurb: 'Place a fraction on a number line',
        },
        {
          id: 'equivalent-visual',
          name: 'Same Amount, Different Names',
          blurb: '1/2 = 2/4, seen in a picture',
        },
        {
          id: 'equivalent-multiply',
          name: 'Scaling Fractions',
          blurb: 'Scale up and down',
        },
        {
          // Wall: partial simplification. 6/8 goes to 3/4, but 8/12 stops at 4/6
          // because only the first common factor gets taken out.
          id: 'simplify-fractions',
          name: 'Lowest Terms',
          blurb: 'Simplify a fraction',
          wall: true,
        },
        {
          id: 'compare-same-den',
          name: 'Comparing Like Fractions',
          blurb: 'Same denominator',
        },
        {
          // Wall: comparing numerators only, ignoring that the denominators name
          // different-sized pieces.
          id: 'compare-diff-den',
          name: 'Comparing Unlike Fractions',
          blurb: 'Different denominators',
          wall: true,
        },
      ],
    },
    {
      id: 'unit-8',
      name: 'Fractions: Operations',
      dependsOn: ['unit-7'],
      skills: [
        {
          // Wall: adding the denominators too, so 1/5 + 2/5 comes out as 3/10.
          id: 'add-frac-same-den',
          name: 'Adding Like Fractions',
          blurb: 'Same denominator',
          wall: true,
        },
        {
          id: 'sub-frac-same-den',
          name: 'Subtracting Like Fractions',
          blurb: 'Same denominator',
        },
        {
          id: 'common-denominator',
          name: 'Common Denominators',
          blurb: 'Find the lowest common denominator',
        },
        {
          // Major wall: two procedures at once — rewrite both fractions, then
          // add. Either half can fail on its own.
          id: 'add-frac-diff-den',
          name: 'Adding Unlike Fractions',
          blurb: 'Different denominators',
          wall: true,
        },
        {
          id: 'sub-frac-diff-den',
          name: 'Subtracting Unlike Fractions',
          blurb: 'Different denominators',
        },
        {
          id: 'improper-to-mixed',
          name: 'Improper to Mixed',
          blurb: '7/4 becomes 1 and 3/4',
        },
        {
          id: 'mixed-to-improper',
          name: 'Mixed to Improper',
          blurb: '1 and 3/4 becomes 7/4',
        },
        {
          id: 'add-mixed',
          name: 'Adding Mixed Numbers',
          blurb: 'Wholes and parts together',
        },
        {
          // Wall: borrowing from the whole. There is nothing to subtract from in
          // the fraction part, so a whole has to be broken up first.
          id: 'sub-mixed',
          name: 'Subtracting Mixed Numbers',
          blurb: 'Wholes and parts together',
          wall: true,
        },
        {
          // Easier than adding, and placed after it deliberately — the unit hands
          // back a win once the hard part is done.
          id: 'mult-fractions',
          name: 'Multiplying Fractions',
          blurb: 'Straight across',
        },
        {
          // Wall: flipping the wrong fraction. The rule is memorised without
          // which of the two gets inverted.
          id: 'div-fractions',
          name: 'Dividing Fractions',
          blurb: 'Keep, change, flip',
          wall: true,
        },
        {
          id: 'fraction-words',
          name: 'Fraction Word Problems',
          blurb: 'Find the fraction in the words',
        },
      ],
    },
    {
      id: 'unit-9',
      name: 'Decimals',
      dependsOn: ['unit-8'],
      skills: [
        {
          id: 'decimal-place-value',
          name: 'Decimal Places',
          blurb: 'Tenths and hundredths',
        },
        {
          id: 'read-decimals',
          name: 'Reading Decimals',
          blurb: 'Say a decimal out loud',
          quick: true,
        },
        {
          // Wall: longer means bigger, so 0.15 reads as larger than 0.9. Whole
          // numbers taught exactly that, and decimals break it.
          id: 'compare-decimals',
          name: 'Comparing Decimals',
          blurb: 'Which decimal is larger',
          wall: true,
        },
        {
          id: 'round-decimals',
          name: 'Rounding Decimals',
          blurb: 'Round to a given place',
        },
        {
          id: 'add-decimals',
          name: 'Adding Decimals',
          blurb: 'Line up the points',
        },
        {
          id: 'sub-decimals',
          name: 'Subtracting Decimals',
          blurb: 'Line up the points',
        },
        {
          // Wall: misplacing the point. The count of decimal places in the
          // factors decides it, and the columns give no hint.
          id: 'mult-decimals',
          name: 'Multiplying Decimals',
          blurb: 'Count the places',
          wall: true,
        },
        {
          id: 'div-decimal-by-whole',
          name: 'Dividing a Decimal',
          blurb: 'Divide by a whole number',
        },
        {
          // Wall — the document flags it without naming the misconception, so
          // this one needs its diagnosis worked out from scratch.
          id: 'div-by-decimal',
          name: 'Dividing by a Decimal',
          blurb: 'Shift both numbers',
          wall: true,
        },
        {
          id: 'fraction-to-decimal',
          name: 'Fraction to Decimal',
          blurb: 'Convert by dividing',
        },
        {
          id: 'decimal-to-fraction',
          name: 'Decimal to Fraction',
          blurb: 'Convert by place value',
        },
        {
          // Leans on money intuition the learner already has, which is why it
          // closes the unit instead of a word-problem skill.
          id: 'money-problems',
          name: 'Money',
          blurb: 'Decimals applied to money',
        },
      ],
    },
    {
      id: 'unit-10',
      name: 'Percents',
      dependsOn: ['unit-9'],
      skills: [
        {
          id: 'percent-meaning',
          name: 'What a Percent Is',
          blurb: 'Out of 100',
          quick: true,
        },
        {
          id: 'percent-to-decimal',
          name: 'Percent to Decimal',
          blurb: 'Move the point left',
        },
        {
          // Wall: shifting the wrong way. The two conversions are mirror images,
          // and nothing in the notation says which direction this one goes.
          id: 'decimal-to-percent',
          name: 'Decimal to Percent',
          blurb: 'Move the point right',
          wall: true,
        },
        {
          id: 'percent-to-fraction',
          name: 'Percent to Fraction',
          blurb: 'Over 100, then simplify',
        },
        {
          id: 'percent-of',
          name: 'Percent Of',
          blurb: '15% of 80',
        },
        {
          // Wall: which number divides which. Both are given, and the wrong order
          // produces a plausible-looking percent.
          id: 'find-the-percent',
          name: 'Finding the Percent',
          blurb: '12 is what percent of 60',
          wall: true,
        },
        {
          // Major wall: the part is known and the whole is not, so the division
          // runs opposite to every percent problem before it.
          id: 'find-the-whole',
          name: 'Finding the Whole',
          blurb: '20% is 15 — find the total',
          wall: true,
        },
        {
          id: 'percent-change',
          name: 'Percent Change',
          blurb: 'Increase and decrease',
        },
        {
          id: 'discount-tax-tip',
          name: 'Discount, Tax & Tip',
          blurb: 'Percents applied to a bill',
        },
        {
          // On the GED formula sheet, so the formula is given rather than
          // recalled — the skill is substituting into it.
          id: 'simple-interest',
          name: 'Simple Interest',
          blurb: 'I = Prt',
        },
      ],
    },
    {
      id: 'unit-11',
      name: 'Ratios & Proportions',
      dependsOn: ['unit-10'],
      skills: [
        {
          id: 'write-ratios',
          name: 'Writing Ratios',
          blurb: 'Express a comparison',
          quick: true,
        },
        {
          id: 'simplify-ratios',
          name: 'Simplifying Ratios',
          blurb: 'Reduce to lowest terms',
        },
        {
          id: 'unit-rate',
          name: 'Unit Rate',
          blurb: 'Which is the better value',
        },
        {
          id: 'solve-proportions',
          name: 'Solving Proportions',
          blurb: 'Cross-multiply',
        },
        {
          id: 'scale-drawings',
          name: 'Scale Drawings',
          blurb: 'Read a scaled measurement',
        },
        {
          id: 'unit-conversion',
          name: 'Unit Conversion',
          blurb: 'Convert between units',
        },
        {
          // Wall: part-to-part versus part-to-whole. "Three to two" and "three of
          // five" describe the same mix, and the words rarely say which is meant.
          id: 'ratio-words',
          name: 'Ratio Word Problems',
          blurb: 'Find the ratio in the words',
          wall: true,
        },
      ],
    },
  ],
}
