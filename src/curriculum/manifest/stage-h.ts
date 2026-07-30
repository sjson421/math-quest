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
 * `requires: ['timed']` breaks the rule stated in stage-e.ts on purpose. The
 * mixed reviews and full-length tests draw their items from every earlier stage,
 * so what they truly need is "whatever the sampled items need" — which is close
 * to all eight capabilities and which a stage-level field cannot express.
 * Restating the other seven here would read as this stage introducing them.
 * Timed mode is the one thing genuinely new at Stage H, and since the stage is
 * last in build order the sampled content will exist before it runs regardless.
 */

import type { StageEntry } from './types'

export const stageH: StageEntry = {
  id: 'stage-h',
  name: 'GED Prep',
  requires: ['timed'],
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
