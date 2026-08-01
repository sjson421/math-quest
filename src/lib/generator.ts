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

  if (!problem.misconceptions?.length) return problem

  const correct =
    problem.answer.kind === 'exact'
      ? toNumber(rational(problem.answer.n, problem.answer.d))
      : problem.answer.kind === 'approx'
        ? problem.answer.value
        : Number(problem.answer.id)

  const seen = new Set<number>()
  const misconceptions = problem.misconceptions.filter((m) => {
    if (!Number.isFinite(m.value)) return false
    if (m.value === correct) return false
    if (seen.has(m.value)) return false
    seen.add(m.value)
    return true
  })

  return { ...problem, misconceptions }
}

/** Match a wrong entry against this problem's predicted mistakes. */
export function diagnose(problem: Problem, raw: string) {
  const value = Number(raw)
  if (!Number.isFinite(value)) return undefined
  return problem.misconceptions?.find((m) => m.value === value)
}
