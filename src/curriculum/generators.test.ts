import { describe, expect, it } from 'vitest'
import { allSkills, manifestIndex } from './index'
import { checkContent, formatViolations } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { checkAnswer } from '../lib/answer'
import { makeRng } from '../lib/rng'
import { toNumber, rational } from '../lib/rational'
import type { Difficulty, Problem, SkillGenerator } from '../lib/types'

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]
const ITERATIONS = 200 // per skill per difficulty → 1000 problems per skill

const seedFor = (i: number, difficulty: Difficulty) => i * 7919 + difficulty * 104729

/**
 * Misconception tags a skill declares that never once reach the learner.
 *
 * `generateProblem()` drops any prediction whose value equals the answer, which
 * is deliberate — the forgot-carry value *is* the sum when nothing carries. But
 * a prediction that collapses on **every** problem is an authoring bug wearing
 * the filter as a disguise: the skill looks like it diagnoses mistakes and never
 * does. `add-2digit-nocarry` shipped that way, predicting a digit-concatenation
 * that a no-carry sum makes identical to the answer by construction.
 *
 * Compares what the generator authored against what survived, so it needs both.
 */
function alwaysFiltered(skill: SkillGenerator): string[] {
  const declared = new Set<string>()
  const surviving = new Set<string>()

  for (const difficulty of DIFFICULTIES) {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const seed = seedFor(i, difficulty)
      for (const m of skill.generate(makeRng(seed), difficulty).misconceptions ?? [])
        declared.add(m.tag)
      for (const m of generateProblem(skill, seed, difficulty).misconceptions ?? [])
        surviving.add(m.tag)
    }
  }

  return [...declared].filter((tag) => !surviving.has(tag))
}

/**
 * Recompute the answer independently from what is displayed to the learner.
 *
 * This is the test that matters most: it does not trust the generator's own
 * arithmetic, it re-derives the result from the operands actually shown on
 * screen. A generator that displays one problem and stores another answer —
 * the single worst bug this app could ship — fails here.
 */
function numberWords(value: number): string {
  const ones = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen',
  ]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  if (value < 20) return ones[value]
  if (value < 100) {
    const rest = value % 10
    return `${tens[Math.floor(value / 10)]}${rest ? `-${ones[rest]}` : ''}`
  }

  const rest = value % 100
  return `${ones[Math.floor(value / 100)]} hundred${rest ? ` ${numberWords(rest)}` : ''}`
}

const expandedText = (value: number) =>
  [Math.floor(value / 100) * 100, Math.floor((value % 100) / 10) * 10, value % 10]
    .filter((part) => part > 0)
    .join(' + ')

function choiceIdFor(problem: Problem, label: string): string {
  const choices = problem.choices ?? []
  const ids = choices.map((choice) => choice.id)
  if (new Set(ids).size !== ids.length)
    throw new Error(`${problem.skillId}: choice ids are not unique`)

  const matching = choices.filter((choice) => choice.label === label)
  if (matching.length !== 1)
    throw new Error(`${problem.skillId}: expected exactly one choice labelled "${label}"`)
  return matching[0].id
}

function recompute(problem: Problem): number | string {
  const { display } = problem

  if (display.kind === 'inline' && display.wholeNumber) {
    const { operation, values } = display.wholeNumber
    const [a, b] = values
    const expectedText =
      operation === 'read'
        ? numberWords(a)
        : operation === 'expanded-form'
          ? expandedText(a)
          : operation === 'compare'
            ? `${a} ? ${b}`
            : operation === 'order-ascending'
              ? values.join(', ')
              : String(a)

    if (display.text !== expectedText)
      throw new Error(
        `${problem.skillId}: visible text "${display.text}" does not match "${expectedText}"`,
      )

    switch (operation) {
      case 'read':
      case 'expanded-form':
        return a
      case 'tens-digit':
        return Math.floor(a / 10) % 10
      case 'hundreds-digit':
        return Math.floor(a / 100) % 10
      case 'compare':
        return choiceIdFor(problem, a < b ? '<' : a > b ? '>' : '=')
      case 'order-ascending':
        return choiceIdFor(problem, [...values].sort((x, y) => x - y).join(', '))
      case 'round-to-10':
        return Math.round(a / 10) * 10
      case 'round-to-100':
        return Math.round(a / 100) * 100
      default: {
        const unhandled: never = operation
        throw new Error(`Unknown whole-number operation: ${unhandled}`)
      }
    }
  }

  let operands: number[]
  let operator: string

  if (display.kind === 'column' || display.kind === 'story') {
    // A story carries its quantities precisely so this stays possible. Reading
    // them out of the prose would not work: a word problem mentions numbers the
    // answer does not use, which is most of what makes it a word problem.
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

const answerValue = (problem: Problem): number | string => {
  if (problem.answer.kind === 'exact') {
    return toNumber(rational(problem.answer.n, problem.answer.d))
  }
  if (problem.answer.kind === 'approx') return problem.answer.value
  return problem.answer.id
}

function sourceMagnitude(problem: Problem): number {
  if (problem.display.kind === 'inline' && problem.display.wholeNumber) {
    const { values } = problem.display.wholeNumber
    return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
  }

  const value = answerValue(problem)
  if (typeof value !== 'number') {
    throw new Error(`${problem.skillId}: choice answer has no source values`)
  }
  return Math.abs(value)
}

function scalingProblems(skill: SkillGenerator): string[] {
  const magnitude = (difficulty: Difficulty) => {
    const problems = Array.from({ length: ITERATIONS }, (_, i) =>
      generateProblem(skill, seedFor(i, difficulty), difficulty),
    )
    return problems.reduce((sum, problem) => sum + sourceMagnitude(problem), 0) / problems.length
  }

  const low = magnitude(1)
  const high = magnitude(5)
  return high > low
    ? []
    : [`${skill.id}: difficulty 5 magnitude ${high} is not above difficulty 1 magnitude ${low}`]
}

describe.each(allSkills.map((s) => [s.id, s] as const))('generator: %s', (_id, skill) => {
  const sample = (difficulty: Difficulty) =>
    Array.from({ length: ITERATIONS }, (_, i) =>
      generateProblem(skill, seedFor(i, difficulty), difficulty),
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

  it('declares no misconception that is always filtered away', () => {
    // What this file used to assert here — no prediction equal to the answer,
    // no duplicate values — described `generateProblem()`'s own output, which it
    // had already cleaned. Neither could fail whatever a generator authored.
    // That guarantee is real and is checked where it is made, in
    // `lib/generator.test.ts`, against skills that deliberately author the bad
    // cases. What belongs here is the property those assertions looked like they
    // were making: that the skill's predictions actually survive to a learner.
    const never = alwaysFiltered(skill)

    expect(never, `${skill.id} predicts these and they never reach anyone`).toEqual([])
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
    expect(scalingProblems(skill)).toEqual([])
  })

  it('produces varied problems rather than repeating one', () => {
    const shown = new Set(all.map((p) => JSON.stringify(p.display)))
    expect(shown.size).toBeGreaterThan(20)
  })
})

describe('alwaysFiltered', () => {
  // A checker that returns "no problems" looks exactly like a clean codebase —
  // which is precisely how the assertions this replaced went unnoticed. These
  // are the synthetic skills proving it names the offender.
  const skillPredicting = (
    build: (sum: number) => { value: number; tag: string }[],
  ): SkillGenerator => ({
    id: 'synthetic',
    name: 'Synthetic',
    blurb: 'For testing the checker',
    generate(rng, difficulty) {
      const a = rng.int(2, 9)
      const b = rng.int(2, 9)
      return {
        skillId: 'synthetic',
        prompt: 'What is the sum?',
        display: { kind: 'inline', text: `${a} + ${b}` },
        answer: { kind: 'exact', n: a + b, d: 1 },
        inputMode: 'keypad',
        misconceptions: build(a + b).map((m) => ({ ...m, nudge: 'n' })),
        hint: 'Add them.',
        solution: [{ text: `Add ${a} and ${b}.` }],
        difficulty,
      }
    },
  })

  it('names a tag whose value is always the answer', () => {
    // `add-2digit-nocarry`'s actual failure, in miniature.
    const skill = skillPredicting((sum) => [
      { value: sum, tag: 'always-the-answer' },
      { value: sum - 1, tag: 'off-by-one' },
    ])

    expect(alwaysFiltered(skill)).toEqual(['always-the-answer'])
  })

  it('passes a tag that collapses only sometimes', () => {
    // `add-3digit` is this case: its forgot-carry predictions equal the answer
    // whenever that column does not carry, and are real diagnoses otherwise.
    // Collapsing sometimes is the design, not a defect.
    const skill = skillPredicting((sum) => [
      { value: sum % 2 === 0 ? sum : sum - 1, tag: 'sometimes' },
    ])

    expect(alwaysFiltered(skill)).toEqual([])
  })

  it('names a tag always shadowed by an earlier duplicate', () => {
    // The other way a prediction can never reach anyone: a second tag that
    // always carries a value the first already claimed, so dedup drops it every
    // time and the skill silently offers one diagnosis instead of two.
    const skill = skillPredicting((sum) => [
      { value: sum - 1, tag: 'first' },
      { value: sum - 1, tag: 'always-shadowed' },
    ])

    expect(alwaysFiltered(skill)).toEqual(['always-shadowed'])
  })

  it('is quiet on a skill whose predictions all survive', () => {
    const skill = skillPredicting((sum) => [
      { value: sum - 1, tag: 'low' },
      { value: sum + 1, tag: 'high' },
    ])

    expect(alwaysFiltered(skill)).toEqual([])
  })
})

describe('recompute', () => {
  // A checker that returns "no problems" looks exactly like a clean codebase.
  // These are the synthetic cases proving the story branch actually verifies.
  const story = (operands: number[], stated: number): Problem => ({
    skillId: 'synthetic',
    prompt: 'How many in total?',
    display: {
      kind: 'story',
      // Mentions a quantity the answer does not use, which is the whole reason
      // the operands are carried separately from the prose.
      text: `Pip has 4 stickers and 3 more in a box. Jun has 9. How many does Pip have?`,
      operands,
      operator: '+',
    },
    answer: { kind: 'exact', n: stated, d: 1 },
    inputMode: 'keypad',
    hint: 'Add what Pip has.',
    solution: [{ text: 'Add 4 and 3.' }],
    difficulty: 1,
  })

  const whole = (overrides: Partial<Problem> = {}): Problem => ({
    skillId: 'synthetic-whole',
    prompt: 'Which digit is in the tens place?',
    display: {
      kind: 'inline',
      text: '347',
      wholeNumber: { values: [347], operation: 'tens-digit' },
    },
    answer: { kind: 'exact', n: 4, d: 1 },
    inputMode: 'keypad',
    hint: 'Read the middle digit.',
    solution: [{ text: 'The tens digit is 4.' }],
    difficulty: 1,
    ...overrides,
  })

  it('verifies a story from its carried operands, not its prose', () => {
    const problem = story([4, 3], 7)
    expect(recompute(problem)).toBe(7)
    expect(answerValue(problem)).toBe(recompute(problem))
  })

  it('catches a story whose stated answer disagrees with its operands', () => {
    // The failure this branch exists to prevent: prose and answer look
    // plausible together, and the answer key is still wrong.
    const problem = story([4, 3], 13)
    expect(recompute(problem)).toBe(7)
    expect(answerValue(problem)).not.toBe(recompute(problem))
  })

  it('is not fooled by a distractor quantity in the sentence', () => {
    // 9 appears in the text; reading numbers out of the prose would find it.
    const problem = story([4, 3], 7)
    expect(recompute(problem)).not.toBe(16)
  })

  it('recomputes a whole-number keypad answer from carried values', () => {
    expect(recompute(whole())).toBe(4)
  })

  it('names visible text that disagrees with carried values', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '346',
        wholeNumber: { values: [347], operation: 'tens-digit' },
      },
    })

    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('catches a whole-number numeric answer that disagrees with its values', () => {
    const wrong = whole({ answer: { kind: 'exact', n: 7, d: 1 } })

    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('resolves a choice id through the independently derived label', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { values: [347, 354], operation: 'compare' },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '1', label: '>' },
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
      ],
    })

    expect(recompute(comparison)).toBe('-1')
    expect(answerValue(comparison)).toBe(recompute(comparison))
  })

  it('catches a correct label mapped to the wrong answer id', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { values: [347, 354], operation: 'compare' },
      },
      answer: { kind: 'choice', id: '1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(answerValue(comparison)).not.toBe(recompute(comparison))
  })

  it.each([
    [
      'missing',
      [
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    ],
    [
      'duplicated',
      [
        { id: '-1', label: '<' },
        { id: '2', label: '<' },
        { id: '1', label: '>' },
      ],
    ],
  ])('names an expected label that is %s', (_case, choices) => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { values: [347, 354], operation: 'compare' },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices,
    })

    expect(() => recompute(comparison)).toThrow(
      'synthetic-whole: expected exactly one choice labelled "<"',
    )
  })

  it('names duplicate choice ids even when the expected label is unique', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { values: [347, 354], operation: 'compare' },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '-1', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(() => recompute(comparison)).toThrow('synthetic-whole: choice ids are not unique')
  })
})

describe('difficulty reporting', () => {
  const synthetic = (wholeNumber: boolean, flat: boolean): SkillGenerator => ({
    id: flat ? 'flat-whole' : wholeNumber ? 'growing-whole' : 'growing-arithmetic',
    name: 'Synthetic',
    blurb: 'For testing difficulty',
    generate(_rng, difficulty) {
      const value = flat ? 40 : difficulty * 40
      return wholeNumber
        ? {
            skillId: flat ? 'flat-whole' : 'growing-whole',
            prompt: 'Round this value.',
            display: {
              kind: 'inline',
              text: String(value),
              wholeNumber: { values: [value], operation: 'round-to-10' },
            },
            answer: { kind: 'exact', n: value, d: 1 },
            inputMode: 'keypad',
            hint: 'Use the ones digit.',
            solution: [{ text: `This rounds to ${value}.` }],
            difficulty,
          }
        : {
            skillId: 'growing-arithmetic',
            prompt: 'What is the sum?',
            display: { kind: 'inline', text: `${value} + ${value}` },
            answer: { kind: 'exact', n: value * 2, d: 1 },
            inputMode: 'keypad',
            hint: 'Add the values.',
            solution: [{ text: `Add ${value} and ${value}.` }],
            difficulty,
          }
    },
  })

  it('names a flat whole-number ladder', () => {
    expect(scalingProblems(synthetic(true, true))).toEqual([
      'flat-whole: difficulty 5 magnitude 40 is not above difficulty 1 magnitude 40',
    ])
  })

  it('accepts growing whole-number source values', () => {
    expect(scalingProblems(synthetic(true, false))).toEqual([])
  })

  it('keeps measuring existing arithmetic by its numeric answer', () => {
    expect(scalingProblems(synthetic(false, false))).toEqual([])
  })
})

// The prerequisite graph is asserted in `manifest/manifest.test.ts` — acyclic,
// no dangling ids, every skill reachable from the single root — across all 201
// skills rather than the seven with generators. Generators do not declare edges.
