import { parseInput } from './answer'
import {
  assertCoordinatePlane,
  coordinateEntry,
  isCoordinate,
  isCoordinateTarget,
  parseCoordinateEntry,
  type CoordinatePlane,
} from './coordinate-plane'
import { makeRng } from './rng'
import { toNumber, rational } from './rational'
import type { Difficulty, Problem, SkillGenerator } from './types'

/**
 * Single entry point for producing a problem.
 *
 * Generators predict misconception values arithmetically, which means a
 * predicted "wrong" value can coincide with the correct answer — e.g. the
 * forgot-to-carry value equals the true sum whenever no carry actually occurs.
 * Filtering centrally here means every generator is protected without each one
 * having to remember.
 */
export function generateProblem(
  skill: SkillGenerator,
  seed: number,
  difficulty: Difficulty,
): Problem {
  const problem = skill.generate(makeRng(seed), difficulty)

  let inputPlane: CoordinatePlane | undefined
  if (problem.inputMode === 'coordinate-plane') {
    if (problem.display.kind !== 'coordinate-plane') {
      throw new Error(`${problem.skillId}: coordinate-plane input needs a coordinate-plane display`)
    }
    if (problem.answer.kind !== 'point') {
      throw new Error(`${problem.skillId}: coordinate-plane input needs a point answer`)
    }
    assertCoordinatePlane(problem.display.plane)
    if (!isCoordinateTarget(problem.display.plane, problem.answer)) {
      throw new Error(`${problem.skillId}: point answer must be a declared lattice target`)
    }
    inputPlane = problem.display.plane
  } else if (problem.answer.kind === 'point') {
    throw new Error(`${problem.skillId}: point answer needs coordinate-plane input`)
  }

  if (!problem.misconceptions?.length) return problem

  // An expression answer has no numeric "correct" value to compare a
  // misconception against, and no algebraic comparison happens here, so a
  // text-valued prediction is deduplicated but never excluded for equalling the
  // answer. A generator predicting one is responsible for constructing it so it
  // cannot coincide, for every draw it allows. NaN never equals a predicted
  // numeric value, so the numeric branch below is simply inert for this kind,
  // same as it already is for `choice`.
  const correct =
    problem.answer.kind === 'exact'
      ? toNumber(rational(problem.answer.n, problem.answer.d))
      : problem.answer.kind === 'approx'
        ? problem.answer.value
        : problem.answer.kind === 'choice'
          ? Number(problem.answer.id)
          : NaN

  const seenNumbers = new Set<number>()
  const seenText = new Set<string>()
  const seenPoints = new Set<string>()
  const misconceptions = problem.misconceptions.filter((m) => {
    if (typeof m.value === 'number') {
      if (!Number.isFinite(m.value)) return false
      if (m.value === correct) return false
      if (seenNumbers.has(m.value)) return false
      seenNumbers.add(m.value)
      return true
    }
    if (m.value.kind === 'text') {
      const text = m.value.value.trim()
      if (!text) return false
      if (seenText.has(text)) return false
      seenText.add(text)
      return true
    }

    if (!isCoordinate(m.value)) return false
    if (
      problem.answer.kind === 'point' &&
      m.value.x === problem.answer.x &&
      m.value.y === problem.answer.y
    ) return false
    if (!inputPlane || !isCoordinateTarget(inputPlane, m.value)) return false
    const key = coordinateEntry(m.value)
    if (seenPoints.has(key)) return false
    seenPoints.add(key)
    return true
  })

  return { ...problem, misconceptions }
}

/** Match a wrong entry against this problem's predicted mistakes. */
export function diagnose(problem: Problem, raw: string) {
  const trimmed = raw.trim()
  const parsed = parseInput(raw)
  const value = parsed.kind === 'invalid' ? undefined : toNumber(parsed.value)
  const point = parseCoordinateEntry(raw)
  return problem.misconceptions?.find((m) => {
    if (typeof m.value === 'number') return m.value === value
    if (m.value.kind === 'text') return m.value.value === trimmed
    return point?.x === m.value.x && point.y === m.value.y
  })
}
