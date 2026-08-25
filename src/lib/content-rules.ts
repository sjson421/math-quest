/**
 * The content style contract, as an enforceable check.
 *
 * The text being constrained is *generated*, so no static analyser can see it —
 * these rules run over sampled problems inside the test suite instead. Brevity
 * is a requirement here, not a preference: a worked example outperforms prose for
 * novice learners, and long explanations make a difficult idea harder to approach.
 *
 * Every rule reports which skill broke it and by how much, because a bare
 * failure on generated text is nearly impossible to trace back to a line.
 */

import type { SkillEntry, UnitEntry } from '../curriculum/manifest/types'
import { coordinateEquationLabel, coordinateLabel, coordinatePlaneLabel, type CoordinatePlane } from './coordinate-plane'
import { lineEquation, linearEquationLabel, passSalesEquations, passSalesStory } from './linear-system'
import { shapeDiagramLabel } from './shape-diagram'
import { chartLearnerText } from './chart'
import { entryLabel } from './keypad'
import { format as formatRational } from './rational'
import type { CoordinateData, Display, Problem } from './types'

export const MAX_SOLUTION_STEPS = 4
export const MAX_WORDS_PER_STEP = 12
export const MIN_WALL_MISCONCEPTIONS = 2

export type ContentRule =
  | 'empty-hint'
  | 'empty-solution'
  | 'hint-sentences'
  | 'empty-teaching-line'
  | 'teaching-line-sentences'
  | 'teaching-line-forward-reference'
  | 'teaching-line-vocabulary'
  | 'step-count'
  | 'step-length'
  | 'wall-misconceptions'
  | 'forward-reference'

export type ContentViolation = {
  rule: ContentRule
  skillId: string
  message: string
}

/** Where a skill sits, which the forward-reference rule needs. */
export type ContentLocation = {
  skill: SkillEntry
  unit: Pick<UnitEntry, 'id'>
}

/**
 * Math vocabulary mapped to the unit that introduces it.
 *
 * Deliberately narrow. Detecting "assumes an unbuilt idea" in general is not
 * tractable, so this is a hand-maintained list of *technical* terms only —
 * "numerator", "slope", "coefficient". Everyday teaching words that happen to be
 * mathematical ("sum", "difference", "carry", "borrow", "column") are left out on
 * purpose: they are how the early units talk, and including them would bury a
 * real hit under noise.
 *
 * This catches vocabulary leakage, not conceptual leakage. A skill can still
 * assume understanding it has not built without using a flagged word.
 */
export const VOCABULARY: ReadonlyMap<string, number> = new Map([
  ['numeral', 0],
  ['expanded form', 0],
  ['ascending order', 0],
  ['rounding', 0],
  ['factor', 4],
  ['multiple', 4],
  ['prime', 4],
  ['composite', 4],
  ['remainder', 4],
  ['integer', 6],
  ['absolute value', 6],
  ['numerator', 7],
  ['denominator', 7],
  ['equivalent fraction', 7],
  ['lowest terms', 7],
  ['improper fraction', 8],
  ['mixed number', 8],
  ['common denominator', 8],
  ['reciprocal', 8],
  ['decimal', 9],
  ['tenths', 9],
  ['hundredths', 9],
  ['percent', 10],
  ['ratio', 11],
  ['proportion', 11],
  ['unit rate', 11],
  ['exponent', 12],
  ['square root', 12],
  ['perfect square', 12],
  ['scientific notation', 12],
  ['variable', 13],
  ['coefficient', 13],
  ['like terms', 13],
  ['distribute', 13],
  ['equation', 14],
  ['inequality', 15],
  ['coordinate', 16],
  ['quadrant', 16],
  ['slope', 16],
  ['intercept', 16],
  ['polynomial', 18],
  ['binomial', 18],
  ['quadratic', 18],
  ['function', 19],
  ['domain', 19],
  ['perimeter', 20],
  ['area', 20],
  ['volume', 20],
  ['circumference', 20],
  ['radius', 20],
  ['diameter', 20],
  ['hypotenuse', 20],
  ['median', 21],
  ['probability', 21],
])

/** `unit-12` → 12. Ordering by number is what makes "later unit" meaningful. */
function unitNumber(unitId: string): number {
  return Number(unitId.replace('unit-', ''))
}

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

/**
 * Sentence count.
 *
 * Terminators only count when followed by whitespace or the end of the string,
 * so `0.5` and `1.28` are not two sentences.
 */
function sentences(text: string): string[] {
  return text
    .split(/[.!?]+(?=\s|$)/)
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Every learner-facing string a problem carries. */
function displayText(display: Display): string {
  switch (display.kind) {
    case 'inline':
    case 'story':
    case 'equation':
      return display.text
    case 'math':
      return display.label
    case 'diagram':
      return shapeDiagramLabel(display.diagram)
    case 'coordinate-plane':
      return [coordinatePlaneLabel(display.plane), coordinateDataText(display.coordinate, display.plane)]
        .filter(Boolean)
        .join('; ')
    case 'chart':
      return chartLearnerText(display.chart).join('; ')
    case 'column':
    case 'decimal-column':
      return ''
    default: {
      const unhandled: never = display
      throw new Error(`Unhandled display: ${JSON.stringify(unhandled)}`)
    }
  }
}

const drawn = (value: number): string => String(value).replace('-', '−')

const functionEquationLabel = (slope: number, intercept: number): string => {
  const term = slope === 1 ? 'x' : slope === -1 ? '−x' : `${drawn(slope)}x`
  if (intercept === 0) return `f(x) = ${term}`
  return `f(x) = ${term} ${intercept > 0 ? '+' : '−'} ${drawn(Math.abs(intercept))}`
}

function coordinateDataText(data?: CoordinateData, plane?: CoordinatePlane): string {
  if (!data) return ''
  switch (data.operation) {
    case 'plot-point':
      return `Point ${coordinateLabel(data.point)}`
    case 'table-to-graph':
      return `Table ${data.rows.map(coordinateLabel).join(', ')}; target x ${data.targetX}`
    case 'slope-intercept':
      return `${data.operation} ${coordinateEquationLabel(data.slope, data.intercept)}; ask ${data.asks}`
    case 'graph-from-equation':
      return `${data.operation} ${coordinateEquationLabel(data.slope, data.intercept)}`
    case 'domain-range':
      return `${data.operation} ask ${data.asks}; points ${(plane?.points ?? []).map(coordinateLabel).join(', ')}`
    case 'linear-vs-nonlinear':
      return `${data.operation} points ${(plane?.points ?? []).map(coordinateLabel).join(', ')}`
    case 'compare-functions':
      return (
        `${data.operation} ask ${data.asks}; table ${data.tableRows.map(coordinateLabel).join(', ')}; ` +
        `${functionEquationLabel(data.equationSlope, data.equationIntercept)}`
      )
    case 'quadrant':
    case 'slope-from-graph':
    case 'slope-from-points':
    case 'y-intercept':
    case 'equation-from-graph':
      return data.operation
    case 'parallel-perpendicular':
      return `${data.operation} ${data.relationship}`
    case 'system-by-graphing': {
      const equations = plane?.lines.flatMap((line) => {
        const equation = lineEquation(line)
        return equation ? [linearEquationLabel(equation).visible] : []
      }) ?? []
      return `${data.operation} variables (x, y) ${equations.join('; ')}`
    }
    case 'system-substitution':
      return `${data.operation} variables (x, y) ` +
        data.equations.map((equation) => linearEquationLabel(equation).visible).join('; ')
    case 'system-elimination':
      return `${data.operation} variables (x, y) ` +
        data.equations.map((equation) => linearEquationLabel(equation).visible).join('; ')
    case 'system-words':
      return `${data.operation} ${passSalesStory(data)} ` +
        passSalesEquations(data).map((equation) => linearEquationLabel(equation).visible).join('; ')
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled coordinate data: ${JSON.stringify(unhandled)}`)
    }
  }
}

export function learnerText(problem: Problem): string[] {
  const rootPair = problem.answer.kind === 'root-pair'
    ? [
        `Root 1: ${entryLabel(formatRational(problem.answer.roots[0]))}`,
        `Root 2: ${entryLabel(formatRational(problem.answer.roots[1]))}`,
      ]
    : []
  const input = problem.inputMode === 'root-pair'
    ? ['Root 1', 'Root 2', 'Check both roots']
    : []
  return [
    problem.prompt,
    // A story is the longest learner-facing string in the course and the most
    // likely to reach for a word from a later unit. Leaving it out would have
    // exempted exactly the text the forward-reference rule exists for.
    displayText(problem.display),
    problem.hint,
    ...problem.solution.flatMap((step) => [step.text, step.detail ?? '']),
    ...(problem.misconceptions ?? []).map((m) => m.nudge),
    ...(problem.choices ?? []).map((c) => c.label),
    ...rootPair,
    ...input,
  ].filter(Boolean)
}

function mentions(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}(?:s|es)?\\b`, 'i').test(text)
}

/** Curated current-unit terms a teaching line introduces, in authority order. */
export function teachingLineTerms(teachingLine: string, unitId: string): string[] {
  const here = unitNumber(unitId)
  return [...VOCABULARY]
    .filter(([term, introducedIn]) => introducedIn === here && mentions(teachingLine, term))
    .map(([term]) => term)
}

/** Check authored teaching prose directly; generated samples cannot cover it. */
export function checkTeachingLine(
  teachingLine: string | undefined,
  at: ContentLocation,
): ContentViolation[] {
  if (teachingLine === undefined) return []

  const violations: ContentViolation[] = []
  const report = (rule: ContentRule, message: string) =>
    violations.push({ rule, skillId: at.skill.id, message })

  if (!teachingLine.trim()) {
    report('empty-teaching-line', 'teaching line is empty')
    return violations
  }

  const count = sentences(teachingLine).length
  if (count !== 1)
    report('teaching-line-sentences', `teaching line is ${count} sentences: "${teachingLine}"`)

  const here = unitNumber(at.unit.id)
  for (const [term, introducedIn] of VOCABULARY) {
    if (introducedIn > here && mentions(teachingLine, term)) {
      report(
        'teaching-line-forward-reference',
        `"${term}" is introduced in unit ${introducedIn} but used in unit ${here}: "${teachingLine}"`,
      )
    }
  }

  const currentTerms = teachingLineTerms(teachingLine, at.unit.id)
  if (currentTerms.length > 1)
    report(
      'teaching-line-vocabulary',
      `teaching line introduces ${currentTerms.length} current-unit terms, limit is 1: ${currentTerms.join(', ')}`,
    )

  return violations
}

/**
 * Check one generated problem against the contract.
 *
 * Returns every violation rather than the first, so one run reports everything
 * an authoring pass needs to fix.
 */
export function checkContent(problem: Problem, at: ContentLocation): ContentViolation[] {
  const { skill, unit } = at
  const violations: ContentViolation[] = []
  const report = (rule: ContentRule, message: string) =>
    violations.push({ rule, skillId: skill.id, message })

  if (!problem.hint.trim()) report('empty-hint', 'hint is empty')
  else {
    const count = sentences(problem.hint).length
    if (count > 1)
      report('hint-sentences', `hint is ${count} sentences: "${problem.hint}"`)
  }

  if (problem.solution.length === 0) report('empty-solution', 'solution has no steps')

  if (problem.solution.length > MAX_SOLUTION_STEPS)
    report(
      'step-count',
      `${problem.solution.length} solution steps, limit is ${MAX_SOLUTION_STEPS}`,
    )

  for (const step of problem.solution) {
    if (!step.text.trim()) {
      report('empty-solution', 'solution step has no text')
      continue
    }
    const count = words(step.text).length
    if (count > MAX_WORDS_PER_STEP)
      report(
        'step-length',
        `step is ${count} words, limit is ${MAX_WORDS_PER_STEP}: "${step.text}"`,
      )
  }

  // Walls are where learners historically quit, so a bare "incorrect" there is
  // the most costly response the app can give. Distinct *tags*, not values: two
  // predictions of the same mistake are one prediction.
  if (skill.wall) {
    const tags = new Set((problem.misconceptions ?? []).map((m) => m.tag))
    if (tags.size < MIN_WALL_MISCONCEPTIONS)
      report(
        'wall-misconceptions',
        `wall skill predicts ${tags.size} distinct misconceptions, needs ${MIN_WALL_MISCONCEPTIONS}`,
      )
  }

  const here = unitNumber(unit.id)
  for (const text of learnerText(problem))
    for (const [term, introducedIn] of VOCABULARY)
      if (introducedIn > here && mentions(text, term))
        report(
          'forward-reference',
          `"${term}" is introduced in unit ${introducedIn} but used in unit ${here}: "${text}"`,
        )

  return violations
}

/** One line per violation, for a test failure message that can be acted on. */
export function formatViolations(violations: readonly ContentViolation[]): string[] {
  return violations.map((v) => `${v.skillId} [${v.rule}] ${v.message}`)
}
