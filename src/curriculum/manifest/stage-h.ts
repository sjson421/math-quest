/**
 * Stage H · GED Prep — Unit 22, 6 modules.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * The document calls these modules rather than skills, and none carries a `quick`
 * or wall marker — they are review and rehearsal over content already learned,
 * not new ground.
 *
 * Mixed reviews inherit the input and display needs of every source unit.
 * These content requirements are measured in coverage.test.ts; timed is retained
 * separately for the two future full-length forms, not for the four lessons.
 */

import type { StageEntry } from './types'

export const stageH: StageEntry = {
  id: 'stage-h',
  name: 'GED Prep',
  requires: ['choice-input', 'math-notation', 'fraction-input', 'diagram', 'number-line', 'expression-input', 'coordinate-plane', 'root-pair-input', 'chart', 'timed'],
  units: [
    {
      id: 'unit-22',
      name: 'Test Preparation',
      dependsOn: ['unit-21'],
      skills: [
        {
          // The TI-30XS is allowed on all but the first five questions of the
          // test, so operating it is worth its own module.
          id: 'calculator-skills',
          name: 'Calculator Skills',
          blurb: 'Operate the TI-30XS',
        },
        {
          id: 'formula-sheet',
          name: 'Formula Sheet',
          blurb: 'Navigate the provided sheet',
        },
        {
          id: 'review-quantitative',
          name: 'Quantitative Review',
          blurb: 'Mixed — about 45% of the test',
        },
        {
          id: 'review-algebraic',
          name: 'Algebraic Review',
          blurb: 'Mixed — about 55% of the test',
        },
        {
          // The first timed content anywhere in the app. Everything before this
          // point is deliberately untimed.
          id: 'timed-practice-1',
          name: 'Timed Practice 1',
          blurb: 'A full-length practice test',
        },
        {
          id: 'timed-practice-2',
          name: 'Timed Practice 2',
          blurb: 'A second full-length test',
        },
      ],
    },
  ],
}
