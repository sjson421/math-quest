/**
 * Stage G · Geometry & Data — Units 20–21, 22 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * `requires` is the full set this stage's skills need, per the rule stated in
 * stage-e.ts: choice input for the scatter reading, diagram rendering for the
 * shapes, chart rendering from 21.5, and math notation for the formulas the
 * skills apply.
 */

import type { StageEntry } from './types'

export const stageG: StageEntry = {
  id: 'stage-g',
  name: 'Geometry & Data',
  requires: ['choice-input', 'math-notation', 'diagram', 'chart'],
  units: [
    {
      // The GED *provides* a formula sheet, so every skill here teaches choosing
      // and applying the right formula. Nothing in this unit asks a learner to
      // recall one from memory.
      id: 'unit-20',
      name: 'Geometry & Measurement',
      dependsOn: ['unit-19'],
      skills: [
        {
          id: 'perimeter',
          name: 'Perimeter',
          blurb: 'Distance around a shape',
          quick: true,
        },
        {
          id: 'area-rectangle',
          name: 'Area of a Rectangle',
          blurb: 'Length times width',
        },
        {
          // Wall: forgetting the half. The rectangle formula is fresh and this
          // one looks like it, so the halving step drops out.
          id: 'area-triangle',
          name: 'Area of a Triangle',
          blurb: 'Half the base times the height',
          wall: true,
        },
        {
          id: 'area-parallelogram-trapezoid',
          name: 'Parallelograms & Trapezoids',
          blurb: 'Two more area formulas',
        },
        {
          // Wall: radius for diameter. The formula sheet offers both forms, and
          // the figure gives whichever one the formula does not want.
          id: 'circumference',
          name: 'Circumference',
          blurb: 'Distance around a circle',
          wall: true,
        },
        {
          // Wall — the document flags it without naming the misconception. The
          // likely pair is squaring the diameter instead of the radius, and
          // confusing this formula with circumference; both need confirming when
          // the generator is written.
          id: 'area-circle',
          name: 'Area of a Circle',
          blurb: 'Space inside a circle',
          wall: true,
        },
        {
          id: 'composite-figures',
          name: 'Composite Figures',
          blurb: 'Split the shape into pieces',
        },
        {
          id: 'volume-prism',
          name: 'Volume of a Prism',
          blurb: 'Base area times height',
        },
        {
          id: 'volume-cylinder',
          name: 'Volume of a Cylinder',
          blurb: 'A round base, the same idea',
        },
        {
          id: 'volume-cone-pyramid-sphere',
          name: 'Cones, Pyramids & Spheres',
          blurb: 'The fractional volume formulas',
        },
        {
          id: 'surface-area',
          name: 'Surface Area',
          blurb: 'Add up every face',
        },
        {
          // Wall: hypotenuse placement. The theorem only holds with the longest
          // side alone on one side of the equation, and a figure that hides which
          // side that is defeats a memorised a² + b² = c².
          id: 'pythagorean',
          name: 'Pythagorean Theorem',
          blurb: 'Find a missing side',
          wall: true,
        },
        {
          id: 'similar-figures',
          name: 'Similar Figures',
          blurb: 'Same shape, scaled',
        },
      ],
    },
    {
      id: 'unit-21',
      name: 'Data & Probability',
      dependsOn: ['unit-20'],
      skills: [
        {
          id: 'mean',
          name: 'Mean',
          blurb: 'The average of a set',
          quick: true,
        },
        {
          // Wall: forgetting to sort first. The middle of the list as given is
          // not the middle value, and the answer looks reasonable either way.
          id: 'median',
          name: 'Median',
          blurb: 'The middle value',
          wall: true,
        },
        {
          id: 'mode-range',
          name: 'Mode & Range',
          blurb: 'Most common, and the spread',
        },
        {
          // GED-specific: the test asks for averages where some values carry more
          // weight than others.
          id: 'weighted-mean',
          name: 'Weighted Mean',
          blurb: 'When some values count more',
        },
        {
          id: 'read-bar-line',
          name: 'Bar & Line Graphs',
          blurb: 'Read values off a chart',
        },
        {
          id: 'read-scatterplot',
          name: 'Scatterplots',
          blurb: 'Read a trend line',
        },
        {
          id: 'basic-probability',
          name: 'Probability',
          blurb: 'How likely an outcome is',
        },
        {
          // Wall — the document flags it without naming the misconception. The
          // likely one is adding where the events call for multiplying, since
          // "and" and "or" are the only cue and they are easy to swap.
          id: 'compound-probability',
          name: 'Compound Probability',
          blurb: 'And, or',
          wall: true,
        },
        {
          id: 'counting-outcomes',
          name: 'Counting Outcomes',
          blurb: 'How many ways it can happen',
        },
      ],
    },
  ],
}
