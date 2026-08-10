/**
 * Stage E · Powers & Early Algebra — Units 12–15, 34 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * `requires` lists every capability this stage's own skills need to be playable,
 * not only the one it introduces — the field is a statement about the stage, and
 * a reader should not have to walk back through earlier stages to assemble the
 * real set. Expression input is the new need (variables on the keypad, from Unit
 * 13); math notation is just as real, since `3⁴` and a fraction inside an
 * equation cannot render as plain text.
 *
 * `zero-neg-exponents` may also want fraction input, since 2⁻³ is 1/8. Left
 * undeclared until the generator settles whether the answer is entered as a
 * fraction or a decimal.
 */

import type { StageEntry } from './types'

export const stageE: StageEntry = {
  id: 'stage-e',
  name: 'Powers & Early Algebra',
  requires: ['math-notation', 'expression-input'],
  units: [
    {
      id: 'unit-12',
      name: 'Exponents & Roots',
      dependsOn: ['unit-11'],
      skills: [
        {
          id: 'exponent-meaning',
          name: 'What an Exponent Is',
          blurb: 'Repeated multiplication',
          quick: true,
        },
        {
          // Wall: 3⁴ read as 3 × 4. The notation looks like a second factor, and
          // nothing about it says "multiply by itself".
          id: 'evaluate-powers',
          name: 'Evaluating Powers',
          blurb: 'Work out a power',
          wall: true,
        },
        {
          id: 'perfect-squares',
          name: 'Perfect Squares',
          blurb: 'Squares and roots to 144',
        },
        {
          id: 'estimate-roots',
          name: 'Estimating Roots',
          blurb: 'Between which whole numbers',
        },
        {
          id: 'exponent-multiply',
          name: 'Multiplying Powers',
          blurb: 'Add the exponents',
        },
        {
          id: 'exponent-divide',
          name: 'Dividing Powers',
          blurb: 'Subtract the exponents',
        },
        {
          // Wall: confused with multiplying powers. Two rules that both act on
          // the exponents, and the wrong one is a plausible answer.
          id: 'power-of-power',
          name: 'Power of a Power',
          blurb: 'Multiply the exponents',
          wall: true,
        },
        {
          id: 'zero-neg-exponents',
          name: 'Zero & Negative Exponents',
          blurb: 'What they stand for',
        },
        {
          id: 'scientific-notation',
          name: 'Scientific Notation',
          blurb: 'Powers of ten as shorthand',
        },
        {
          // Completes 5.3, which deliberately left exponents out until now.
          id: 'pemdas-exponents',
          name: 'Order of Operations with Exponents',
          blurb: 'The full rule',
        },
      ],
    },
    {
      id: 'unit-13',
      name: 'Expressions',
      dependsOn: ['unit-12'],
      skills: [
        {
          id: 'variable-meaning',
          name: 'What a Variable Is',
          blurb: 'A letter standing for a number',
          quick: true,
        },
        {
          id: 'evaluate-expression',
          name: 'Evaluating Expressions',
          blurb: 'Substitute and compute',
        },
        {
          // Wall: "less than" reverses the order. "Five less than x" is x − 5,
          // but it is read left to right as 5 − x.
          id: 'words-to-expression',
          name: 'Words to Expressions',
          blurb: 'Translate a phrase',
          wall: true,
        },
        {
          id: 'identify-like-terms',
          name: 'Like Terms',
          blurb: 'Spot the terms that match',
        },
        {
          // Wall: combining unlike terms, so 3x + 2y collapses to 5xy.
          id: 'combine-like-terms',
          name: 'Combining Like Terms',
          blurb: 'Add and subtract terms',
          wall: true,
        },
        {
          // Wall: distributing to the first term only, so 3(x + 4) becomes
          // 3x + 4.
          id: 'distributive',
          name: 'Distributing',
          blurb: 'Multiply across a bracket',
          wall: true,
        },
        {
          // Major wall: the sign on the second term. −3(x − 4) needs two sign
          // decisions, and the second one is the reliable failure.
          id: 'distribute-negative',
          name: 'Distributing a Negative',
          blurb: '−3(x − 4)',
          wall: true,
        },
        {
          id: 'factor-gcf',
          name: 'Factoring Out',
          blurb: 'The reverse of distributing',
        },
      ],
    },
    {
      id: 'unit-14',
      name: 'Linear Equations',
      dependsOn: ['unit-13'],
      skills: [
        {
          id: 'equation-balance',
          name: 'Keeping the Balance',
          blurb: 'Both sides stay equal',
          quick: true,
        },
        {
          id: 'one-step-addsub',
          name: 'One Step: Add or Subtract',
          blurb: 'Undo a + or −',
        },
        {
          id: 'one-step-multdiv',
          name: 'One Step: Multiply or Divide',
          blurb: 'Undo a × or ÷',
        },
        {
          // Wall: undoing in the wrong order. Both operations get reversed, but
          // the multiplication is undone before the addition.
          id: 'two-step',
          name: 'Two Steps',
          blurb: 'Undo in the right order',
          wall: true,
        },
        {
          id: 'vars-both-sides',
          name: 'Variables on Both Sides',
          blurb: 'Gather the terms first',
        },
        {
          // Renamed from `with-parentheses` — 5.2 in Order of Operations already
          // claimed that id, and two skills cannot share one.
          id: 'equation-parentheses',
          name: 'Equations with Parentheses',
          blurb: 'Distribute, then solve',
        },
        {
          id: 'with-fractions',
          name: 'Equations with Fractions',
          blurb: 'Clear the denominators',
        },
        {
          id: 'special-solutions',
          name: 'No Solution or Every Solution',
          blurb: 'When the variable disappears',
        },
        {
          id: 'equation-words',
          name: 'Equation Word Problems',
          blurb: 'Build the equation',
        },
        {
          // Needed for Unit 16 — a line has to be rearranged into y = mx + b
          // before it can be graphed.
          id: 'rearrange-formula',
          name: 'Rearranging a Formula',
          blurb: 'Solve for y',
        },
      ],
    },
    {
      id: 'unit-15',
      name: 'Inequalities',
      dependsOn: ['unit-14'],
      skills: [
        {
          id: 'inequality-symbols',
          name: 'Inequality Symbols',
          blurb: 'Read <, >, ≤ and ≥',
          quick: true,
        },
        {
          // Leans on a number line, though only this one skill in the stage does,
          // so it is not a stage-wide requirement. See the note in stage-c.ts.
          id: 'graph-inequality',
          name: 'Graphing an Inequality',
          blurb: 'Open or closed circle',
        },
        {
          id: 'solve-one-step-ineq',
          name: 'One-Step Inequalities',
          blurb: 'Solve in a single move',
        },
        {
          id: 'solve-multi-step-ineq',
          name: 'Multi-Step Inequalities',
          blurb: 'Solve in several moves',
        },
        {
          // Major wall, and its own skill deliberately rather than a footnote on
          // the two solving skills: multiplying or dividing by a negative flips
          // the inequality, and nothing in the algebra so far behaves that way.
          id: 'flip-the-sign',
          name: 'Flipping the Sign',
          blurb: 'Multiply or divide by a negative',
          wall: true,
        },
        {
          id: 'compound-inequalities',
          name: 'Compound Inequalities',
          blurb: 'And, or, and between',
        },
      ],
    },
  ],
}
