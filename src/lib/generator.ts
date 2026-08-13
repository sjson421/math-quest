import { parseInput } from './answer'
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

  const seenNumbers = new Set<number>()
  const seenText = new Set<string>()
  const misconceptions = problem.misconceptions.filter((m) => {
    if (typeof m.value === 'number') {
      if (!Number.isFinite(m.value)) return false
      if (m.value === correct) return false
      if (seenNumbers.has(m.value)) return false
      seenNumbers.add(m.value)
      return true
    }
    const text = m.value.value.trim()
    if (!text) return false
    if (seenText.has(text)) return false
    seenText.add(text)
    return true
  })

  return { ...problem, misconceptions }
}

/** Match a wrong entry against this problem's predicted mistakes. */
export function diagnose(problem: Problem, raw: string) {
  const trimmed = raw.trim()
  const parsed = parseInput(raw)
  const value = parsed.kind === 'invalid' ? undefined : toNumber(parsed.value)
  return problem.misconceptions?.find((m) =>
    typeof m.value === 'number' ? m.value === value : m.value.value === trimmed,
  )
}
