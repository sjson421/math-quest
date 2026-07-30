/**
 * Stage F · Graphs & Algebra II — Units 16–19, 28 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * `requires` is the full set this stage's skills need, per the rule stated in
 * stage-e.ts. Coordinate-plane input is the new one — tap to plot, from 16.1 —
 * alongside expression input for the equation and factored-form answers and
 * KaTeX for the slope and quadratic formulas.
 */

import type { StageEntry } from './types'

export const stageF: StageEntry = {
  id: 'stage-f',
  name: 'Graphs & Algebra II',
  requires: ['katex', 'expression-input', 'coordinate-plane'],
  units: [
    {
      id: 'unit-16',
      name: 'Coordinate Plane & Lines',
      dependsOn: ['unit-15'],
      skills: [
        {
          // The one skill in the course marked both `quick` and a wall: (x, y)
          // order is a single fact that either lands in five problems or gets
          // reversed every time, so it is worth predicting and worth keeping
          // short.
          id: 'plot-points',
          name: 'Plotting Points',
          blurb: 'Place a point on the grid',
          quick: true,
          wall: true,
        },
        {
          id: 'quadrants',
          name: 'Quadrants',
          blurb: 'Name the four regions',
        },
        {
          id: 'table-to-graph',
          name: 'Table to Graph',
          blurb: 'Plot a table of values',
        },
        {
          id: 'slope-from-graph',
          name: 'Slope from a Graph',
          blurb: 'Rise over run',
        },
        {
          // Wall: inconsistent subtraction order. The two differences have to be
          // taken with the points in the same order, and swapping one flips the
          // sign of the slope.
          id: 'slope-from-points',
          name: 'Slope from Two Points',
          blurb: 'Use the formula',
          wall: true,
        },
        {
          id: 'y-intercept',
          name: 'Y-Intercept',
          blurb: 'Where the line crosses',
        },
        {
          id: 'slope-intercept',
          name: 'Slope-Intercept Form',
          blurb: 'y = mx + b',
        },
        {
          id: 'graph-from-equation',
          name: 'Graphing an Equation',
          blurb: 'Draw the line from its equation',
        },
        {
          id: 'equation-from-graph',
          name: 'Equation from a Graph',
          blurb: 'Read off the slope and intercept',
        },
        {
          id: 'parallel-perpendicular',
          name: 'Parallel & Perpendicular',
          blurb: 'Negative reciprocal slopes',
        },
      ],
    },
    {
      id: 'unit-17',
      name: 'Systems of Equations',
      dependsOn: ['unit-16'],
      skills: [
        {
          id: 'system-by-graphing',
          name: 'Systems by Graphing',
          blurb: 'Where two lines meet',
        },
        {
          id: 'substitution',
          name: 'Substitution',
          blurb: 'Replace one variable',
        },
        {
          // Wall: scaling one side only. Multiplying an equation through to line
          // the coefficients up has to hit every term, including the constant.
          id: 'elimination',
          name: 'Elimination',
          blurb: 'Cancel a variable out',
          wall: true,
        },
        {
          id: 'system-words',
          name: 'System Word Problems',
          blurb: 'Build two equations',
        },
      ],
    },
    {
      id: 'unit-18',
      name: 'Polynomials & Quadratics',
      dependsOn: ['unit-17'],
      skills: [
        {
          id: 'add-polynomials',
          name: 'Adding Polynomials',
          blurb: 'Combine the like terms',
        },
        {
          // Wall: distributing the minus. The subtraction applies to every term
          // in the second polynomial, not just the first.
          id: 'sub-polynomials',
          name: 'Subtracting Polynomials',
          blurb: 'Distribute the minus first',
          wall: true,
        },
        {
          id: 'mult-monomial',
          name: 'Multiplying by a Monomial',
          blurb: 'Distribute a single term',
        },
        {
          id: 'foil',
          name: 'FOIL',
          blurb: 'Multiply two binomials',
        },
        {
          id: 'factor-gcf-poly',
          name: 'Factoring a Polynomial',
          blurb: 'Take out the common factor',
        },
        {
          // Major wall: the search itself. Two numbers have to hit a product and
          // a sum at once, and there is no procedure that finds them — only
          // trial against a shrinking list.
          id: 'factor-trinomial',
          name: 'Factoring Trinomials',
          blurb: 'Find the pair that works',
          wall: true,
        },
        {
          id: 'difference-of-squares',
          name: 'Difference of Squares',
          blurb: 'A pattern worth recognising',
        },
        {
          id: 'solve-by-factoring',
          name: 'Solving by Factoring',
          blurb: 'The zero product rule',
        },
        {
          // On the GED formula sheet, so the work is substituting into it
          // correctly rather than recalling it.
          id: 'quadratic-formula',
          name: 'The Quadratic Formula',
          blurb: 'Substitute into the formula',
        },
      ],
    },
    {
      id: 'unit-19',
      name: 'Functions',
      dependsOn: ['unit-18'],
      skills: [
        {
          // Wall — the document marks it without naming the misconception, but
          // the Skill cell says it outright: f(x) reads as f times x. Worth
          // predicting both that and the reverse, where f(3) is treated as an
          // answer rather than an input.
          id: 'function-notation',
          name: 'Function Notation',
          blurb: 'f(x) is not multiplication',
          wall: true,
        },
        {
          id: 'evaluate-function',
          name: 'Evaluating a Function',
          blurb: 'Substitute into f(x)',
        },
        {
          id: 'domain-range',
          name: 'Domain & Range',
          blurb: 'Inputs and outputs',
        },
        {
          id: 'linear-vs-nonlinear',
          name: 'Linear or Not',
          blurb: 'Tell the two apart',
        },
        {
          // GED-specific: the test asks for the same function in three forms and
          // expects them to be matched up.
          id: 'compare-functions',
          name: 'Comparing Functions',
          blurb: 'Table, graph, or equation',
        },
      ],
    },
  ],
}
