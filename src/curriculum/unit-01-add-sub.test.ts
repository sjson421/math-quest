import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import { unit01 } from './unit-01-add-sub'
import type { Difficulty, Problem } from '../lib/types'

/**
 * The behaviour-preservation gate for the generator-engine extraction.
 *
 * `generators.test.ts` recomputes every answer from what is displayed, so it
 * catches a broken carry. It never compares a hint or a solution step against
 * anything, so a refactor could reword every sentence in the course and that
 * suite would stay green. This one pins the words.
 *
 * Recorded before the engine existed. A diff here while moving a generator onto
 * shared helpers is a regression, not a prompt to re-record.
 *
 * Five seeds rather than the 200 per difficulty `generators.test.ts` draws: a
 * wording regression from an extraction is systematic, so it shows up in the
 * first few seeds or not at all, and 30,000 problems is not a reviewable diff.
 */

const SEEDS = [1, 12345, 67890, 424242, 987654321]
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

/**
 * Every field a generator currently sets. `format()` below renders all of them,
 * and the coverage test fails if a new one appears — a field the snapshot does
 * not render is a field the gate does not protect.
 */
const RENDERED_KEYS = [
  'skillId',
  'prompt',
  'display',
  'answer',
  'inputMode',
  'choices',
  'misconceptions',
  'hint',
  'solution',
  'difficulty',
]

const formatDisplay = (display: Problem['display']): string => {
  switch (display.kind) {
    case 'inline':
      return `inline "${display.text}"`
    case 'column':
      return `column ${display.operands.join(` ${display.operator} `)}`
    case 'story':
      return `story [${display.operands.join(` ${display.operator} `)}] "${display.text}"`
    default: {
      // A new Display variant must be rendered here or it slips past the gate.
      const unhandled: never = display
      throw new Error(`Unhandled display: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatAnswer = (answer: Problem['answer']): string => {
  switch (answer.kind) {
    case 'exact':
      return `exact ${answer.n}/${answer.d}${answer.requireSimplified ? ' (simplified)' : ''}`
    case 'approx':
      return `approx ${answer.value} ±${answer.tolerance}`
    case 'choice':
      return `choice ${answer.id}`
    default: {
      const unhandled: never = answer
      throw new Error(`Unhandled answer: ${JSON.stringify(unhandled)}`)
    }
  }
}

const format = (problem: Problem, seed: number): string => {
  const lines = [
    `--- ${problem.skillId} · seed ${seed} · difficulty ${problem.difficulty}`,
    `prompt   ${problem.prompt}`,
    `display  ${formatDisplay(problem.display)}`,
    `answer   ${formatAnswer(problem.answer)}`,
    `input    ${problem.inputMode}`,
    `hint     ${problem.hint}`,
  ]

  for (const choice of problem.choices ?? []) {
    lines.push(`choice   ${choice.id} = ${choice.label}`)
  }

  problem.solution.forEach((step, i) => {
    lines.push(`step ${i + 1}   ${step.text}${step.detail ? `   [${step.detail}]` : ''}`)
  })

  for (const m of problem.misconceptions ?? []) {
    lines.push(`miss     ${m.tag} = ${m.value}   ${m.nudge}`)
  }

  return lines.join('\n')
}

const sample = (skill: (typeof unit01.skills)[number]) =>
  DIFFICULTIES.flatMap((difficulty) =>
    SEEDS.map((seed) => format(generateProblem(skill, seed, difficulty), seed)),
  ).join('\n\n')

describe.each(unit01.skills.map((s) => [s.id, s] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the output recorded before the engine extraction', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

describe('the gate itself', () => {
  it('renders every field the generators set', () => {
    const seen = new Set<string>()
    for (const skill of unit01.skills) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          Object.keys(generateProblem(skill, seed, difficulty)).forEach((k) => seen.add(k))
        }
      }
    }

    const unrendered = [...seen].filter((k) => !RENDERED_KEYS.includes(k))
    expect(unrendered, 'add these to RENDERED_KEYS and render them in format()').toEqual([])
  })

  it('notices a reworded hint', () => {
    // A checker that returns "no problems" looks exactly like a clean codebase.
    const problem = generateProblem(unit01.skills[0], 1, 1)
    const reworded = { ...problem, hint: 'Something else entirely.' }
    expect(format(reworded, 1)).not.toBe(format(problem, 1))
  })

  it('notices a changed misconception nudge', () => {
    const problem = generateProblem(unit01.skills[0], 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 ? { ...m, nudge: 'Reworded.' } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
