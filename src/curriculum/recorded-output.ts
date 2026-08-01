import { generateProblem } from '../lib/generator'
import type { Difficulty, Problem, SkillGenerator } from '../lib/types'

/**
 * The shared half of the per-unit wording gates.
 *
 * `generators.test.ts` recomputes every answer from what is displayed, so it
 * catches a broken carry or borrow. It never compares a hint or a solution step
 * against anything, so a refactor could reword every sentence in the course and
 * that suite would stay green. The unit gates pin the words.
 *
 * The *snapshots* stay per unit — Vitest keys them by test file — and so do the
 * `describe.each` blocks that record them, because their titles are part of the
 * key. What lives here is the formatting, which has no per-unit content: two
 * copies of an exhaustive `switch` over `Display` means a new variant has to be
 * rendered twice, and the gate silently stops covering the unit whose copy was
 * missed. That is the hole `RENDERED_KEYS` exists to close.
 */

export const SEEDS = [1, 12345, 67890, 424242, 987654321]
export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

/**
 * Every field a generator currently sets. `format()` renders all of them, and
 * `unrenderedKeys()` fails if a new one appears — a field the snapshot does not
 * render is a field the gate does not protect.
 */
export const RENDERED_KEYS = [
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

export const format = (problem: Problem, seed: number): string => {
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

/** One skill across every seed and difficulty, as the snapshot records it. */
export const sample = (skill: SkillGenerator) =>
  DIFFICULTIES.flatMap((difficulty) =>
    SEEDS.map((seed) => format(generateProblem(skill, seed, difficulty), seed)),
  ).join('\n\n')

/** Fields the generators set that `format()` would not show. Empty is passing. */
export const unrenderedKeys = (skills: readonly SkillGenerator[]): string[] => {
  const seen = new Set<string>()
  for (const skill of skills) {
    for (const difficulty of DIFFICULTIES) {
      for (const seed of SEEDS) {
        Object.keys(generateProblem(skill, seed, difficulty)).forEach((k) => seen.add(k))
      }
    }
  }

  return [...seen].filter((k) => !RENDERED_KEYS.includes(k))
}
