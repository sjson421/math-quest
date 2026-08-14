import { generateProblem } from '../lib/generator'
import { tickLabel, ticks, type NumberLineSpec } from '../lib/number-line'
// Aliased: this module exports a `format` of its own, over a whole problem.
import { format as formatRational } from '../lib/rational'
import { shapeDiagramLabel } from '../lib/shape-diagram'
import { decimalColumnText, decimalText } from '../lib/decimal'
import type {
  AlgebraData,
  DecimalData,
  Difficulty,
  EquationData,
  FractionData,
  MathNotation,
  PercentData,
  PowerData,
  Problem,
  RatioData,
  SkillGenerator,
} from '../lib/types'

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
  'expression',
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

const formatFractionData = (data: FractionData): string => {
  switch (data.operation) {
    case 'read':
    case 'place':
    case 'simplify':
      return `${data.operation} ${data.numerator}/${data.denominator}`
    case 'name-part':
      return `${data.operation} ${data.numerator}/${data.denominator} ${data.requestedPart}`
    case 'scale-missing':
      return (
        `${data.operation} ${data.numerator}/${data.denominator} ×${data.factor} ${data.direction} ` +
        `missing-${data.missing}`
      )
    case 'compare':
      return (
        `${data.operation} ${data.leftNumerator}/${data.leftDenominator} ` +
        `? ${data.rightNumerator}/${data.rightDenominator}`
      )
    case 'add':
    case 'sub':
      return (
        `${data.operation} ${data.leftNumerator}/${data.leftDenominator} ` +
        `${data.operation === 'add' ? '+' : '−'} ${data.rightNumerator}/${data.rightDenominator}`
      )
    case 'common-denominator':
      return (
        `${data.operation} ${data.leftNumerator}/${data.leftDenominator} ` +
        `and ${data.rightNumerator}/${data.rightDenominator}`
      )
    case 'improper-to-mixed':
      return `${data.operation} ${data.numerator}/${data.denominator}`
    case 'mixed-to-improper':
      return `${data.operation} ${data.whole} ${data.numerator}/${data.denominator}`
    case 'add-mixed':
    case 'sub-mixed':
      return (
        `${data.operation} ${data.leftWhole} ${data.leftNumerator}/${data.leftDenominator} ` +
        `${data.operation === 'add-mixed' ? '+' : '−'} ` +
        `${data.rightWhole} ${data.rightNumerator}/${data.rightDenominator}`
      )
    case 'multiply':
    case 'divide':
      return (
        `${data.operation} ${data.leftNumerator}/${data.leftDenominator} ` +
        `${data.operation === 'multiply' ? '×' : '÷'} ` +
        `${data.rightNumerator}/${data.rightDenominator}`
      )
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled fraction data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatDecimalData = (data: DecimalData): string => {
  switch (data.operation) {
    case 'digit':
      return `${data.operation} ${decimalText(data.value)} ${data.place}`
    case 'read':
      return `${data.operation} ${decimalText(data.value)}`
    case 'compare':
      return `${data.operation} ${decimalText(data.left)} ? ${decimalText(data.right)}`
    case 'round':
      return `${data.operation} ${decimalText(data.value)} to ${data.targetScale === 0 ? 'whole' : 'tenth'}`
    case 'add':
    case 'sub':
    case 'mult': {
      const [left, right] = decimalColumnText(data)
      const symbol = data.operation === 'add' ? '+' : data.operation === 'sub' ? '−' : '×'
      return `${data.operation} ${left} ${symbol} ${right}`
    }
    case 'div-whole':
      return `${data.operation} ${decimalText(data.dividend)} ÷ ${data.divisor}`
    case 'div-decimal':
      return `${data.operation} ${decimalText(data.dividend)} ÷ ${decimalText(data.divisor)}`
    case 'display':
    case 'to-percent':
      return `${data.operation} ${decimalText(data.value)}`
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled decimal data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatPercentData = (data: PercentData): string => {
  switch (data.operation) {
    case 'find-percent':
      return `${data.operation} ${data.part}/${data.whole}`
    case 'find-whole':
      return `${data.operation} ${data.part} at ${data.percent}%`
    case 'percent-change':
      return `${data.operation} ${data.original} to ${data.current}`
    case 'discount':
    case 'tax':
    case 'tip':
      return `${data.operation} ${data.baseCents} cents at ${data.percent}%`
    case 'simple-interest':
      return `${data.operation} ${data.principalCents} cents at ${data.percent}% for ${data.years} years`
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled percent data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatPowerData = (data: PowerData): string => {
  switch (data.operation) {
    case 'expand-power':
    case 'evaluate-power':
      return `${data.operation} ${data.base}^${data.exponent}`
    case 'square':
    case 'square-root':
    case 'estimate-root':
      return `${data.operation} ${data.value}`
    case 'power-multiply':
    case 'power-divide':
      return `${data.operation} ${data.base}^${data.leftExponent} ${data.base}^${data.rightExponent}`
    case 'power-of-power':
      return `${data.operation} (${data.base}^${data.innerExponent})^${data.outerExponent}`
    case 'zero-exponent':
      return `${data.operation} ${data.base}^0`
    case 'negative-exponent':
      return `${data.operation} ${data.base}^-${data.magnitude}`
    case 'scientific-notation':
      return (
        `${data.operation} ${data.coefficient}e-${data.coefficientScale} × ` +
        `10^${data.exponent}`
      )
    case 'pemdas-power-first':
      return (
        `${data.operation} ${data.addend} + ${data.base}^${data.exponent} × ${data.factor}`
      )
    case 'pemdas-group-power':
      return (
        `${data.operation} (${data.left} + ${data.right})^${data.exponent} ÷ ${data.divisor}`
      )
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled power data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatRatioData = (data: RatioData): string => {
  switch (data.operation) {
    case 'write-ratio':
      return `${data.operation} ${data.first} ${data.firstLabel} to ${data.second} ${data.secondLabel}`
    case 'simplify-ratio':
      return `${data.operation} ${data.first}:${data.second}`
    case 'unit-rate':
      return (
        `${data.operation} ${data.firstCount} for ${data.firstCents} cents vs ` +
        `${data.secondCount} for ${data.secondCents} cents`
      )
    case 'solve-proportion':
      return (
        `${data.operation} ${data.leftNumerator}/${data.leftDenominator} = ` +
        `${data.rightNumerator}/${data.rightDenominator} missing-${data.missing}`
      )
    case 'scale-drawing':
      return `${data.operation} 1:${data.scale} ${data.direction} given-${data.given}`
    case 'unit-conversion':
      return (
        `${data.operation} 1 ${data.largeSingular}:${data.factor} ${data.smallPlural} ` +
        `${data.direction} given-${data.given}`
      )
    case 'ratio-word':
      return `${data.operation} ${data.frameId} ${data.first}:${data.second} ${data.comparison}`
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled ratio data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatAlgebraData = (data: AlgebraData): string => {
  switch (data.operation) {
    case 'substitute-term':
      return `${data.operation} ${data.coefficient}x @ x=${data.value}`
    case 'substitute-expression':
      return `${data.operation} ${data.coefficient}x ${data.adds ? '+' : '-'} ${data.constant} @ x=${data.value}`
    case 'words-to-expression':
      return `${data.operation} ${data.n} ${data.lessThan ? 'less-than' : 'subtracted-from'}`
    case 'identify-like-terms':
      return `${data.operation} ${data.targetCoefficient}${data.targetLetter} → ${data.matchCoefficient}${data.targetLetter}`
    case 'combine-like-terms':
      return `${data.operation} ${data.first}x + ${data.second}x + ${data.constant}`
    case 'distributive':
      return `${data.operation} ${data.coefficient}(x + ${data.constant})`
    case 'distribute-negative':
      return `${data.operation} -${data.coefficient}(x ${data.adds ? '+' : '-'} ${data.constant})`
    case 'factor-gcf':
      // Written the way the unit writes a term: recording `2(1x + 2)` beside an
      // answer of `2(x + 2)` reads as a disagreement rather than as the same
      // coefficient.
      return `${data.operation} ${data.factor}(${data.coefficient === 1 ? 'x' : `${data.coefficient}x`} + ${data.constant})`
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled algebra data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatEquationData = (data: EquationData): string => {
  switch (data.operation) {
    case 'balance':
      return `${data.operation} ${data.first} + ${data.second} ${data.adds ? '+' : '-'}${data.change} both sides`
    case 'one-step-addsub':
      return `${data.operation} x ${data.adds ? '+' : '-'} ${data.constant} = ${data.rightHand}`
    case 'one-step-multdiv':
      return data.multiplies
        ? `${data.operation} ${data.coefficient}x = ${data.rightHand}`
        : `${data.operation} x / ${data.coefficient} = ${data.rightHand}`
    case 'two-step':
      return `${data.operation} ${data.coefficient}x ${data.adds ? '+' : '-'} ${data.constant} = ${data.rightHand}`
    case 'vars-both-sides':
      return (
        `${data.operation} ${data.leftCoefficient}x + ${data.leftConstant} = ` +
        `${data.rightCoefficient}x + ${data.rightConstant}`
      )
    case 'parentheses':
      return `${data.operation} ${data.coefficient}(x ${data.adds ? '+' : '-'} ${data.constant}) = ${data.rightHand}`
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled equation data: ${JSON.stringify(unhandled)}`)
    }
  }
}

const formatDisplay = (display: Problem['display']): string => {
  switch (display.kind) {
    case 'inline':
      return (
        `inline "${display.text}"` +
        (display.decimal ? ` [${formatDecimalData(display.decimal)}]` : '') +
        (display.algebra ? ` [${formatAlgebraData(display.algebra)}]` : '')
      )
    case 'column':
      return `column ${display.operands.join(` ${display.operator} `)}`
    case 'decimal-column':
      return `decimal-column [${formatDecimalData(display.decimal)}]`
    case 'story':
      if (display.percent) return `story [${formatPercentData(display.percent)}] "${display.text}"`
      if (display.ratio) return `story [${formatRatioData(display.ratio)}] "${display.text}"`
      if (display.algebra) return `story [${formatAlgebraData(display.algebra)}] "${display.text}"`
      return `story [${display.operands.join(` ${display.operator} `)}] "${display.text}"`
    case 'math':
      return (
        `math "${display.label}" ${formatNotation(display.notation)}` +
        (display.fraction ? ` [${formatFractionData(display.fraction)}]` : '') +
        (display.ratio ? ` [${formatRatioData(display.ratio)}]` : '') +
        (display.power ? ` [${formatPowerData(display.power)}]` : '')
      )
    case 'diagram':
      return (
        `diagram ${display.diagram.kind} ${display.diagram.shadedParts}/${display.diagram.parts} ` +
        `"${shapeDiagramLabel(display.diagram)}"`
      )
    case 'equation':
      return `equation "${display.text}" solve ${display.variable} [${formatEquationData(display.equation)}]`
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
      return (
        `exact ${answer.n}/${answer.d}` +
        (answer.requireSimplified ? ' (simplified)' : '') +
        (answer.requireMixed ? ' (mixed)' : '') +
        (answer.requireDecimal ? ' (decimal)' : '') +
        (answer.requireFraction ? ' (fraction)' : '')
      )
    case 'approx':
      return `approx ${answer.value} ±${answer.tolerance}`
    case 'choice':
      return `choice ${answer.id}`
    case 'expression':
      return `expression ${answer.canonical} (${answer.variable}, ${answer.form})`
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
  if (problem.expression) lines.push(`variable ${problem.expression.variable}`)

  lines.push(`hint     ${problem.hint}`)

  for (const choice of problem.choices ?? []) {
    const value = choice.value ? ` [${formatRational(choice.value)}]` : ''
    lines.push(`choice   ${choice.id} = ${choice.label}${value}`)
  }

  problem.solution.forEach((step, i) => {
    lines.push(`step ${i + 1}   ${step.text}${step.detail ? `   [${step.detail}]` : ''}`)
  })

  for (const m of problem.misconceptions ?? []) {
    const value = typeof m.value === 'number' ? m.value : m.value.value
    lines.push(`miss     ${m.tag} = ${value}   ${m.nudge}`)
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
