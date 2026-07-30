import { describe, expect, it } from 'vitest'
import { allSkills, generators, manifestIndex } from './index'
import { checkContent, formatViolations } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { checkAnswer } from '../lib/answer'
import { toNumber, rational } from '../lib/rational'
import type { Difficulty, Problem } from '../lib/types'

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]
const ITERATIONS = 200 // per skill per difficulty → 1000 problems per skill

/**
 * Recompute the answer independently from what is displayed to the learner.
 *
 * This is the test that matters most: it does not trust the generator's own
 * arithmetic, it re-derives the result from the operands actually shown on
 * screen. A generator that displays one problem and stores another answer —
 * the single worst bug this app could ship — fails here.
 */
function recompute(problem: Problem): number {
  const { display } = problem

  let operands: number[]
  let operator: string

  if (display.kind === 'column') {
    operands = display.operands
    operator = display.operator
  } else {
    const m = /^(-?\d+)\s*([+\-−×÷])\s*(-?\d+)$/.exec(display.text)
    if (!m) throw new Error(`Cannot parse inline display: "${display.text}"`)
    operands = [Number(m[1]), Number(m[3])]
    operator = m[2]
  }

  switch (operator) {
    case '+':
      return operands.reduce((a, b) => a + b)
    case '-':
    case '−':
      return operands.reduce((a, b) => a - b)
    case '×':
      return operands.reduce((a, b) => a * b)
    case '÷':
      return operands.reduce((a, b) => a / b)
    default:
      throw new Error(`Unknown operator: ${operator}`)
  }
}

const answerValue = (problem: Problem): number => {
  if (problem.answer.kind === 'exact') {
    return toNumber(rational(problem.answer.n, problem.answer.d))
  }
  if (problem.answer.kind === 'approx') return problem.answer.value
  throw new Error('choice answers have no numeric value')
}

describe.each(allSkills.map((s) => [s.id, s] as const))('generator: %s', (_id, skill) => {
  const sample = (difficulty: Difficulty) =>
    Array.from({ length: ITERATIONS }, (_, i) =>
      generateProblem(skill, i * 7919 + difficulty * 104729, difficulty),
    )

  const all = DIFFICULTIES.flatMap(sample)

  it('states an answer that matches the problem it displays', () => {
    for (const problem of all) {
      expect(answerValue(problem), JSON.stringify(problem.display)).toBe(recompute(problem))
    }
  })

  it('accepts its own answer through the real answer checker', () => {
    for (const problem of all) {
      const typed = String(answerValue(problem))
      expect(checkAnswer(problem.answer, typed).status).toBe('correct')
    }
  })

  it('never predicts a misconception equal to the correct answer', () => {
    for (const problem of all) {
      const correct = answerValue(problem)
      for (const m of problem.misconceptions ?? []) {
        expect(m.value, `${skill.id} / ${m.tag}`).not.toBe(correct)
      }
    }
  })

  it('produces no duplicate misconception values', () => {
    for (const problem of all) {
      const values = (problem.misconceptions ?? []).map((m) => m.value)
      expect(new Set(values).size).toBe(values.length)
    }
  })

  it('satisfies the content style contract on every sampled problem', () => {
    // Sampled rather than static: the text is generated, so the only way to
    // check it is to generate a lot of it. One failure lists every violation
    // across all five difficulties so an authoring pass can fix them together.
    const at = manifestIndex.get(skill.id)
    expect(at, `${skill.id} is not in the manifest`).toBeDefined()

    const violations = all.flatMap((problem) => checkContent(problem, at!))
    const distinct = [...new Set(formatViolations(violations))]

    expect(distinct).toEqual([])
  })

  it('always ships a hint and worked solution', () => {
    for (const problem of all) {
      expect(problem.hint.length).toBeGreaterThan(0)
      expect(problem.solution.length).toBeGreaterThan(0)
      for (const step of problem.solution) {
        expect(step.text.length).toBeGreaterThan(0)
      }
    }
  })

  it('is deterministic for a given seed', () => {
    const a = generateProblem(skill, 12345, 3)
    const b = generateProblem(skill, 12345, 3)
    expect(a).toEqual(b)
  })

  it('scales operand size with difficulty', () => {
    const magnitude = (d: Difficulty) => {
      const problems = sample(d)
      const total = problems.reduce((sum, p) => sum + Math.abs(answerValue(p)), 0)
      return total / problems.length
    }
    expect(magnitude(5)).toBeGreaterThan(magnitude(1))
  })

  it('produces varied problems rather than repeating one', () => {
    const shown = new Set(all.map((p) => JSON.stringify(p.display)))
    expect(shown.size).toBeGreaterThan(20)
  })
})

describe('skill graph', () => {
  it('references only skills that exist', () => {
    for (const skill of allSkills) {
      for (const prereq of skill.prerequisites) {
        expect(generators.has(prereq), `${skill.id} → ${prereq}`).toBe(true)
      }
    }
  })

  it('is acyclic', () => {
    const state = new Map<string, 'visiting' | 'done'>()

    const visit = (id: string, trail: string[]) => {
      if (state.get(id) === 'done') return
      if (state.get(id) === 'visiting') {
        throw new Error(`Cycle: ${[...trail, id].join(' → ')}`)
      }
      state.set(id, 'visiting')
      for (const prereq of generators.get(id)!.prerequisites) {
        visit(prereq, [...trail, id])
      }
      state.set(id, 'done')
    }

    expect(() => allSkills.forEach((s) => visit(s.id, []))).not.toThrow()
  })

  it('has at least one skill with no prerequisites to start from', () => {
    expect(allSkills.some((s) => s.prerequisites.length === 0)).toBe(true)
  })
})
