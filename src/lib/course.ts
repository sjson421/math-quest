/**
 * What the navigation needs to know about a learner's position in the course.
 *
 * Pure functions of the derived course tree and a `Progress`, for the reason
 * `submit.ts` exists: a node test has no DOM and attaches no handlers, so
 * anything a component works out for itself is unreachable from a test. These
 * are the decisions worth pinning — which unit to open at, and how much of a
 * unit is done — so they live where a test can reach them.
 */

import type { CourseStage, CourseUnit } from '../curriculum/manifest'
import { isUnlocked, MAX_MASTERY, UNLOCK_THRESHOLD, type Progress } from '../store/progress'

/** Mastery earned against mastery available. `possible` is 0 for an empty unit. */
export type Mastery = {
  earned: number
  possible: number
  /** `earned / possible`, or 0 when there is nothing to earn. */
  share: number
}

function masteryOver(skillIds: readonly string[], progress: Progress): Mastery {
  const earned = skillIds.reduce((sum, id) => sum + (progress.skills[id]?.mastery ?? 0), 0)
  const possible = skillIds.length * MAX_MASTERY

  return { earned, possible, share: possible === 0 ? 0 : earned / possible }
}

/**
 * How much of a unit the learner has mastered, over its *playable* skills only.
 *
 * Counting the planned ones would cap a half-written unit below full for reasons
 * that have nothing to do with the learner, and would let them read how much of
 * the course is unwritten off the bar. The accepted cost is the other direction:
 * a full unit drops back when a new generator lands, because there is genuinely
 * more of it to learn than there was.
 */
export function unitProgress(unit: CourseUnit, progress: Progress): Mastery {
  return masteryOver(
    unit.skills.map((skill) => skill.id),
    progress,
  )
}

/** The same figure across every playable skill in a stage's units. */
export function stageProgress(stage: CourseStage, progress: Progress): Mastery {
  return masteryOver(
    stage.units.flatMap(({ skills }) => skills.map((skill) => skill.id)),
    progress,
  )
}

/**
 * The unit the app opens at: the one holding the learner's frontier skill.
 *
 * The frontier is the first playable skill, in curriculum order, that is
 * unlocked and still below `UNLOCK_THRESHOLD` — the first one not yet taken far
 * enough to open what follows, which is also the first that could be holding the
 * course up.
 *
 * Deliberately not "below `MAX_MASTERY`". A skill opens the next at 2 and caps
 * at 5, so a learner who keeps moving leaves a trail of skills at 2, 3 and 4
 * behind them; that rule would name the very first skill in the course forever
 * and open the app at Unit 0 for someone halfway through Unit 2.
 *
 * Falls back to the last playable unit when every playable skill is past the
 * threshold, so a learner at the end of what is built lands there rather than
 * back at the beginning. `undefined` only for an empty course, which cannot
 * happen while any generator is registered.
 */
export function currentUnitId(
  course: readonly CourseStage[],
  progress: Progress,
): string | undefined {
  let lastUnitId: string | undefined

  for (const { units } of course)
    for (const { unit, skills } of units) {
      lastUnitId = unit.id

      for (const skill of skills)
        if (
          (progress.skills[skill.id]?.mastery ?? 0) < UNLOCK_THRESHOLD &&
          isUnlocked(skill.id, progress)
        )
          return unit.id
    }

  return lastUnitId
}
