import type { Difficulty } from '../../lib/types'

/**
 * Operand ranges per difficulty.
 *
 * Difficulty is derived from the learner's mastery, so a ladder that does not
 * actually widen leaves someone repeating the same problem at every level. The
 * named ladders below are for new skills; the ones already built keep their own
 * ranges, which were each chosen for the skill rather than shared.
 */

export type Band = [min: number, max: number]

export type Ladder = Record<Difficulty, Band>

export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

export const band = (difficulty: Difficulty, ladder: Ladder): Band => ladder[difficulty]

/** Sums and differences within the facts a learner memorises. */
export const SINGLE_DIGIT: Ladder = {
  1: [2, 5],
  2: [2, 7],
  3: [2, 9],
  4: [3, 9],
  5: [4, 9],
}

export const TWO_DIGIT: Ladder = {
  1: [10, 40],
  2: [10, 60],
  3: [12, 80],
  4: [15, 90],
  5: [20, 95],
}

export const THREE_DIGIT: Ladder = {
  1: [100, 400],
  2: [100, 600],
  3: [150, 800],
  4: [200, 900],
  5: [350, 989],
}

/**
 * Everything wrong with a ladder, named. Returns an empty array for a good one.
 *
 * A checker that returns "no problems" looks exactly like a clean codebase, so
 * the test that uses this also feeds it a deliberately flat ladder.
 */
export function ladderProblems(name: string, ladder: Ladder): string[] {
  const problems: string[] = []
  const levels = DIFFICULTIES.map((d) => ladder[d])

  levels.forEach(([min, max], i) => {
    if (min > max) problems.push(`${name} difficulty ${i + 1}: min ${min} above max ${max}`)
  })

  for (let i = 1; i < levels.length; i += 1) {
    const [min, max] = levels[i]
    const [prevMin, prevMax] = levels[i - 1]
    if (min < prevMin) {
      problems.push(`${name} difficulty ${i + 1}: min drops from ${prevMin} to ${min}`)
    }
    if (max < prevMax) {
      problems.push(`${name} difficulty ${i + 1}: max drops from ${prevMax} to ${max}`)
    }
  }

  const [, easiestMax] = levels[0]
  const [, hardestMax] = levels[levels.length - 1]
  if (hardestMax <= easiestMax) {
    problems.push(`${name} never widens: difficulty 5 tops out at ${hardestMax}, same as ${easiestMax}`)
  }

  return problems
}
