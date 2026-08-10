import { generateProblem } from '../lib/generator'
import { tickLabel, ticks, type NumberLineSpec } from '../lib/number-line'
// Aliased: this module exports a `format` of its own, over a whole problem.
import { format as formatRational } from '../lib/rational'
import type { Difficulty, MathNotation, Problem, SkillGenerator } from '../lib/types'

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
  'keypad',
  'numberLine',
  'choices',
  'misconceptions',
  'hint',
  'solution',
  'difficulty',
]

const formatNotation = (notation: MathNotation): string => {
  switch (notation.kind) {
    case 'text':
      return JSON.stringify(notation.value)
    case 'row':
      return `row(${notation.children.map(formatNotation).join(', ')})`
    case 'fraction':
      return `fraction(${formatNotation(notation.numerator)}, ${formatNotation(notation.denominator)})`
    case 'superscript':
      return `superscript(${formatNotation(notation.base)}, ${formatNotation(notation.exponent)})`
    case 'root':
      return `root(${formatNotation(notation.radicand)})`
    default: {
      const unhandled: never = notation
      throw new Error(`Unhandled notation: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatDisplay = (display: Problem['display']): string => {
  switch (display.kind) {
    case 'inline':
      return `inline "${display.text}"`
    case 'column':
      return `column ${display.operands.join(` ${display.operator} `)}`
    case 'story':
      return `story [${display.operands.join(` ${display.operator} `)}] "${display.text}"`
    case 'math':
      return `math "${display.label}" ${formatNotation(display.notation)}`
    default: {
      // A new Display variant must be rendered here or it slips past the gate.
      const unhandled: never = display
      throw new Error(`Unhandled display: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * What the problem permits to be typed into it.
 *
 * Read off the object rather than from a list of the rules this file knows
 * about. A hand-written list is a second declaration of `KeypadRules` that
 * nothing forces anyone to update, so a fifth rule would be dropped here in
 * silence — and `unrenderedKeys()` could not catch it, because it walks the
 * problem's own keys and `keypad` is one key whatever is inside it. That is the
 * exact drift `RENDERED_KEYS` exists to stop, one level down.
 *
 * Rendered only when a problem declares something: every skill through Unit 5
 * declares nothing, so printing an empty line would have re-recorded the whole
 * course to say so.
 */
const formatKeypad = (keypad: Problem['keypad']): string | undefined =>
  Object.entries(keypad ?? {})
    .map(([rule, value]) => `${rule}=${value}`)
    .join(' ') || undefined

/**
 * The line a placement is made on, as its ticks rather than its fields.
 *
 * `start`/`step`/`count` are what the spec stores; the first tick, the last and
 * the spacing are what a reviewer can check against the problem beside them —
 * and a line drawn one tick short is invisible in the stored form.
 */
const formatNumberLine = (spec: NumberLineSpec): string => {
  const tickList = ticks(spec)
  const first = tickLabel(tickList[0])
  const last = tickLabel(tickList[tickList.length - 1])

  return `${first} to ${last} by ${formatRational(spec.step)} (${spec.count} ticks)`
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
  ]

  const keypad = formatKeypad(problem.keypad)
  if (keypad) lines.push(`keypad   ${keypad}`)
  if (problem.numberLine) lines.push(`line     ${formatNumberLine(problem.numberLine)}`)

  lines.push(`hint     ${problem.hint}`)

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

/**
 * The seeds the per-unit property sweeps run over — a much wider net than the
 * five `SEEDS` above, because those pin exact wording and these only assert
 * invariants, so they can afford the breadth.
 */
const SWEEP_SEEDS = Array.from({ length: 100 }, (_, i) => i * 7919 + 1)

/**
 * The fixture plumbing every unit's "what this guarantees about every problem"
 * block needs: look a skill up by id, generate its whole sweep once, and read a
 * whole-number answer back off a problem.
 *
 * Shared because it cross-checks nothing — it only feeds problems to the
 * assertions each unit writes for itself. Three copies had already drifted in
 * their types by the time this moved here.
 */
export const sweep = (unit: readonly SkillGenerator[], unitName: string) => {
  const cache = new Map<string, Problem[]>()

  const skill = (id: string) => {
    const found = unit.find((candidate) => candidate.id === id)
    if (!found) throw new Error(`Missing ${unitName} skill: ${id}`)
    return found
  }

  const everyProblem = (id: string) => {
    const cached = cache.get(id)
    if (cached) return cached

    const problems = DIFFICULTIES.flatMap((difficulty) =>
      SWEEP_SEEDS.map((seed) => generateProblem(skill(id), seed, difficulty)),
    )
    cache.set(id, problems)
    return problems
  }

  const exactValue = (problem: Problem) => {
    if (problem.answer.kind !== 'exact' || problem.answer.d !== 1) {
      throw new Error(`${problem.skillId} did not make a whole-number answer`)
    }
    return problem.answer.n
  }

  return { skill, everyProblem, exactValue }
}

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
