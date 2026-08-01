import type { CheckResult } from './answer'

/**
 * What the lesson does about one submitted answer.
 *
 * Split out of the component so the policy is stated once, in a place a test can
 * reach, rather than as a chain of conditions inside a render function.
 */
export type SubmitResponse = {
  /** Whether this answer completes the problem and advances the correct count. */
  advances: boolean
  /** How the attempt is written to progress, if at all. */
  record: 'correct' | 'incorrect' | 'none'
  /** Whether dismissing the response sends the problem round again. */
  requeues: boolean
  /** Whether the response shows the worked solution. */
  showsSolution: boolean
  /** Whether the entry survives, so a half-typed number can be finished. */
  keepsEntry: boolean
}

/**
 * Keyed on the status union on purpose.
 *
 * The defect this replaced was a missing branch: the lesson handled `correct`
 * and let the other three fall through to one wrong-answer path, so a learner
 * who typed the right value in the wrong form was shown the working for a sum
 * they had already done. A `Record` over the union makes the next status
 * someone adds a compile error instead of a silent fourth collapse.
 */
export const responseTo: Record<CheckResult['status'], SubmitResponse> = {
  correct: {
    advances: true,
    record: 'correct',
    requeues: false,
    showsSolution: false,
    keepsEntry: false,
  },

  incorrect: {
    advances: false,
    record: 'incorrect',
    requeues: true,
    showsSolution: true,
    keepsEntry: false,
  },

  // Right value, wrong form. A miss everywhere below the surface — it records,
  // it re-queues, it does not advance — but the working stays hidden. The
  // arithmetic was correct; handing it back answers a question the learner did
  // not get wrong and removes the one step they still have to take.
  'not-simplified': {
    advances: false,
    record: 'incorrect',
    requeues: true,
    showsSolution: false,
    keepsEntry: false,
  },

  // Not an answer at all — `-` on its own, or `5/` with the denominator still to
  // come, both reachable the moment a sign or slash is on the pad. Charging an
  // attempt for a half-typed number punishes typing speed, and re-queueing would
  // shuffle away a problem that was never attempted.
  unparseable: {
    advances: false,
    record: 'none',
    requeues: false,
    showsSolution: false,
    keepsEntry: true,
  },
}
