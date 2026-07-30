/**
 * Stage A · Numbers — Unit 0, 8 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * Unit 0 is the start of the course, so it declares no `dependsOn` and its first
 * skill is a root of the whole prerequisite graph.
 */

import type { StageEntry } from './types'

export const stageA: StageEntry = {
  id: 'stage-a',
  name: 'Numbers',
  units: [
    {
      id: 'unit-0',
      name: 'Numbers & Place Value',
      skills: [
        {
          id: 'read-numbers',
          name: 'Read Numerals',
          blurb: 'Read numerals to 999',
          quick: true,
        },
        {
          id: 'place-value-tens',
          name: 'Tens Digit',
          blurb: 'Name the tens digit',
        },
        {
          id: 'place-value-hundreds',
          name: 'Hundreds Digit',
          blurb: 'Name the hundreds digit',
        },
        {
          id: 'expanded-form',
          name: 'Expanded Form',
          blurb: '347 = 300 + 40 + 7',
        },
        {
          id: 'compare-numbers',
          name: 'Compare Numbers',
          blurb: 'Use <, >, and =',
        },
        {
          id: 'order-numbers',
          name: 'Order Numbers',
          blurb: 'Order three numbers',
        },
        {
          id: 'round-to-10',
          name: 'Round to Ten',
          blurb: 'Round to the nearest ten',
        },
        {
          // Wall: the midpoint rule. 45 rounds to 50, and a learner who has been
          // told "round down when it's below halfway" has no rule for exactly
          // halfway. Needs the midpoint predicted explicitly.
          id: 'round-to-100',
          name: 'Round to Hundred',
          blurb: 'Round to the nearest hundred',
          wall: true,
        },
      ],
    },
  ],
}
