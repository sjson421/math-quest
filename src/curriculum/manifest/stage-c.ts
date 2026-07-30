/**
 * Stage C · Negatives — Unit 6, 9 skills.
 *
 * Transcribed from `docs/curriculum.md`. Ids are verbatim; the document and this
 * file cross-check each other in the manifest tests.
 *
 * No stage-level `requires`, deliberately. The document's capability table lists
 * number-line input as first needed at 6.1, but `requires` is stage-wide, so
 * declaring it would hold the other eight skills — all answerable on the plain
 * keypad — behind a tap-to-place input mode. This is the gate to all algebra and
 * nothing in it is optional, so blocking it wholesale is the wrong trade. See the
 * note in tasks 2.3 / 6.x about marking capability needs per skill.
 */

import type { StageEntry } from './types'

export const stageC: StageEntry = {
  id: 'stage-c',
  name: 'Negatives',
  units: [
    {
      // The gate to all algebra. Nothing here is optional, which is why the unit
      // ends on an interleaved review rather than a word-problem skill.
      id: 'unit-6',
      name: 'Negative Numbers',
      dependsOn: ['unit-5'],
      skills: [
        {
          id: 'negatives-numberline',
          name: 'Below Zero',
          blurb: 'Read values below zero',
          quick: true,
        },
        {
          // Wall: "bigger digit means bigger number". −7 reads as larger than −3
          // because 7 is larger than 3, and the order below zero inverts.
          id: 'compare-negatives',
          name: 'Comparing Negatives',
          blurb: '−7 < −3',
          wall: true,
        },
        {
          // Wall: adding the magnitudes and keeping the first sign, so −3 + 5
          // comes out as −8.
          id: 'add-neg-pos',
          name: 'Negative Plus Positive',
          blurb: '−3 + 5',
          wall: true,
        },
        {
          id: 'add-two-negs',
          name: 'Adding Two Negatives',
          blurb: '−3 + −5',
        },
        {
          // Major wall: minus a minus. Two adjacent signs have to collapse into
          // addition before anything else can happen, and nothing in whole-number
          // arithmetic prepares a learner for that.
          id: 'sub-negatives',
          name: 'Subtracting a Negative',
          blurb: '5 − (−3)',
          wall: true,
        },
        {
          id: 'mult-negatives',
          name: 'Multiplying Negatives',
          blurb: 'The sign rules',
        },
        {
          id: 'div-negatives',
          name: 'Dividing Negatives',
          blurb: 'The same sign rules',
        },
        {
          id: 'absolute-value',
          name: 'Absolute Value',
          blurb: 'Distance from zero',
        },
        {
          id: 'negatives-mixed',
          name: 'Mixed Negatives',
          blurb: 'Interleaved review',
        },
      ],
    },
  ],
}
