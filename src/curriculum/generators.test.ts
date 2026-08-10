import { describe, expect, it } from 'vitest'
import { allSkills, manifestIndex } from './index'
import { checkContent, formatViolations } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { checkAnswer } from '../lib/answer'
import { makeRng } from '../lib/rng'
import { toNumber, rational } from '../lib/rational'
import type { Difficulty, Problem, SkillGenerator, WholeNumberData } from '../lib/types'

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

/**
 * Number theory, written out independently.
 *
 * Trial division rather than anything the unit file shares, for the same reason
 * the arithmetic above is recomputed rather than imported: a helper used by both
 * the generator and its check verifies nothing about the generator.
 */
const factorsOf = (n: number) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)

const multiplesOf = (n: number, count: number) =>
  Array.from({ length: count }, (_, i) => n * (i + 1))

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

/**
 * A value as the course draws it, with the typographic minus every display uses.
 *
 * Written here rather than imported from the unit that draws it, for the same
 * reason the number theory above is written twice: a helper shared with the
 * generator agrees with it by construction. A positive value passes through
 * untouched, so every display that shipped before Unit 6 is unaffected.
 */
const drawn = (value: number): string => String(value).replace('-', '−')

/**
 * What the learner must be looking at for the carried data to describe it.
 *
 * Checked before anything is derived, so a problem that displays one number and
 * carries another is named rather than silently verified against itself.
 */
function displayedText(data: WholeNumberData): string {
  switch (data.operation) {
    case 'read':
      return numberWords(data.value)
    case 'expanded-form':
      return expandedText(data.value)
    case 'compare':
      return `${drawn(data.left)} ? ${drawn(data.right)}`
    // Bars, not a numeral: distance from zero is a question about the value, and
    // a display that dropped the sign to look like arithmetic would stop asking it.
    case 'absolute-value':
      return `|${drawn(data.value)}|`
    case 'order-ascending':
      return data.values.join(', ')
    case 'divide-remainder':
    case 'divide-quotient':
      return `${data.dividend} ÷ ${data.divisor}`
    case 'tens-digit':
    case 'hundreds-digit':
    case 'round-to-10':
    case 'round-to-100':
    case 'factors':
    case 'classify-prime':
      return String(data.value)
    case 'multiples':
      return String(data.value)
    default: {
      const unhandled: never = data
      throw new Error(`Unknown whole-number operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * Evaluate a displayed expression the way a reader does.
 *
 * The branch this replaced matched two operands around one operator, which every
 * skill through Unit 4 satisfied. Unit 5 displays `3 + 4 × 2`, where the answer
 * depends on which operation runs first — and folding the operators in written
 * order is precisely the mistake that unit teaches against, so a check that
 * folded would agree with a generator that made it.
 *
 * Recursive descent, written from scratch rather than shared with the unit that
 * builds these expressions, for the same reason the number theory above is
 * written twice: a helper used by both the generator and its check verifies
 * nothing. A precedence bug now has to be made identically by two different
 * methods to survive.
 *
 * The grammar is the conventional one, and its shape *is* the precedence rule:
 *
 *     expression := term (('+' | '−') term)*
 *     term       := factor (('×' | '÷') factor)*
 *     factor     := '-'? number | '(' expression ')'
 *
 * Both loops consume left to right, which is what makes `20 − 8 + 3` fifteen
 * rather than nine — the same-precedence case `pemdas` exists to teach.
 */
function tokenize(text: string): (string | number)[] {
  // The third alternative is the point: anything that is neither a number nor an
  // operator is captured and thrown on, rather than skipped. A tokenizer that
  // ignored what it did not recognise would read `3 + 4 ? 2` as `3 + 4 2` and
  // report a parse failure a character too late.
  return [...text.matchAll(/(\d+)|([-+−×÷()])|(\S)/g)].map(([, digits, symbol, unknown]) => {
    if (unknown) throw new Error(`unexpected "${unknown}"`)
    return digits ? Number(digits) : symbol
  })
}

function evaluateExpression(text: string): number {
  const tokens = tokenize(text)
  let at = 0

  const peek = () => tokens[at]

  function factor(): number {
    const token = peek()

    if (token === '(') {
      at += 1
      const value = expression()
      if (peek() !== ')') throw new Error('unbalanced parentheses')
      at += 1
      return value
    }

    // A signed literal, which the two-operand branch also accepted. No generator
    // produces one today; Unit 6 will, and narrowing here would drop that
    // silently rather than loudly.
    if (token === '-' || token === '−') {
      at += 1
      return -factor()
    }

    if (typeof token !== 'number') {
      throw new Error(`expected a number, found "${token ?? 'end of expression'}"`)
    }
    at += 1
    return token
  }

  function term(): number {
    let value = factor()
    for (;;) {
      const token = peek()
      if (token === '×') {
        at += 1
        value *= factor()
      } else if (token === '÷') {
        at += 1
        value /= factor()
      } else {
        return value
      }
    }
  }

  function expression(): number {
    let value = term()
    for (;;) {
      const token = peek()
      if (token === '+') {
        at += 1
        value += term()
      } else if (token === '-' || token === '−') {
        at += 1
        value -= term()
      } else {
        return value
      }
    }
  }

  const value = expression()
  if (at !== tokens.length) throw new Error(`unexpected "${tokens[at]}"`)
  return value
}

function recompute(problem: Problem): number | string {
  const { display } = problem

  if (display.kind === 'inline' && display.wholeNumber) {
    const data = display.wholeNumber
    const expectedText = displayedText(data)

    if (display.text !== expectedText)
      throw new Error(
        `${problem.skillId}: visible text "${display.text}" does not match "${expectedText}"`,
      )

    switch (data.operation) {
      case 'read':
      case 'expanded-form':
        return data.value
      case 'tens-digit':
        return Math.floor(data.value / 10) % 10
      case 'hundreds-digit':
        return Math.floor(data.value / 100) % 10
      case 'compare':
        return choiceIdFor(
          problem,
          data.left < data.right ? '<' : data.left > data.right ? '>' : '=',
        )
      case 'order-ascending':
        return choiceIdFor(problem, [...data.values].sort((x, y) => x - y).join(', '))
      case 'round-to-10':
        return Math.round(data.value / 10) * 10
      case 'round-to-100':
        return Math.round(data.value / 100) * 100
      // The third case the arithmetic branch would get wrong, after the two
      // divisions below: `|−7|` is not an expression, and the sign is the
      // question rather than something to evaluate past.
      case 'absolute-value':
        return Math.abs(data.value)
      // The two cases the arithmetic branch below would get wrong: `47 ÷ 5`
      // evaluates to 9.4, and neither answer is that.
      case 'divide-remainder':
        return data.dividend % data.divisor
      case 'divide-quotient':
        return Math.floor(data.dividend / data.divisor)
      case 'factors':
        return choiceIdFor(problem, factorsOf(data.value).join(', '))
      case 'multiples':
        return choiceIdFor(problem, multiplesOf(data.value, data.count).join(', '))
      case 'classify-prime':
        return choiceIdFor(problem, factorsOf(data.value).length === 2 ? 'prime' : 'composite')
      default: {
        const unhandled: never = data
        throw new Error(`Unknown whole-number operation: ${JSON.stringify(unhandled)}`)
      }
    }
  }

  if (display.kind === 'inline') {
    try {
      return evaluateExpression(display.text)
    } catch (error) {
      throw new Error(
        `${problem.skillId}: cannot evaluate "${display.text}" — ${(error as Error).message}`,
      )
    }
  }

  if (display.kind === 'math') {
    throw new Error(
      `${problem.skillId}: a math display needs operation-specific data for independent verification`,
    )
  }

  // A story carries its quantities precisely so this stays possible. Reading
  // them out of the prose would not work: a word problem mentions numbers the
  // answer does not use, which is most of what makes it a word problem.
  //
  // The ASCII hyphen this switch used to accept is gone with the regex that
  // produced it. A column or story declares `Operator`, which spells subtraction
  // `−`, so the extra case was unreachable — and now that `operator` is no longer
  // widened to `string` on its way here, the compiler says so.
  const { operands, operator } = display

  switch (operator) {
    case '+':
      return operands.reduce((a, b) => a + b)
    case '−':
      return operands.reduce((a, b) => a - b)
    case '×':
      return operands.reduce((a, b) => a * b)
    case '÷':
      return operands.reduce((a, b) => a / b)
    default: {
      const unhandled: never = operator
      throw new Error(`Unknown operator: ${unhandled}`)
    }
  }
}

const answerValue = (problem: Problem): number | string => {
  if (problem.answer.kind === 'exact') {
    return toNumber(rational(problem.answer.n, problem.answer.d))
  }
  if (problem.answer.kind === 'approx') return problem.answer.value
  return problem.answer.id
}

/**
 * The numbers a difficulty ladder is meant to be growing, per operation.
 *
 * `multiples` deliberately reports only its value: `count` is fixed at four, so
 * averaging it in would drag the mean toward a constant and make a real ladder
 * look flatter than it is.
 */
function sourceValues(data: WholeNumberData): number[] {
  switch (data.operation) {
    case 'compare':
      return [data.left, data.right]
    case 'order-ascending':
      return data.values
    case 'divide-remainder':
    case 'divide-quotient':
      return [data.dividend, data.divisor]
    default:
      return [data.value]
  }
}

function sourceMagnitude(problem: Problem): number {
  if (problem.display.kind === 'inline' && problem.display.wholeNumber) {
    const values = sourceValues(problem.display.wholeNumber)
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
      wholeNumber: { operation: 'tens-digit', value: 347 },
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

  it('rejects a math display until its generator adds independently verifiable data', () => {
    const candidate = whole({
      skillId: 'synthetic-math',
      display: {
        kind: 'math',
        notation: {
          kind: 'fraction',
          numerator: { kind: 'text', value: '3' },
          denominator: { kind: 'text', value: '4' },
        },
        label: 'three fourths',
      },
    })

    expect(() => recompute(candidate)).toThrow(
      'synthetic-math: a math display needs operation-specific data',
    )
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
        wholeNumber: { operation: 'tens-digit', value: 347 },
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
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
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
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
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
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices,
    })

    expect(() => recompute(comparison)).toThrow(
      'synthetic-whole: expected exactly one choice labelled "<"',
    )
  })

  it('derives a remainder rather than evaluating the division shown', () => {
    // The case the arithmetic branch gets wrong. Evaluating "47 ÷ 5" gives 9.4;
    // this problem asks what is left over, and the answer is 2.
    const remainder = whole({
      prompt: 'What is left over?',
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: { operation: 'divide-remainder', dividend: 47, divisor: 5 },
      },
      answer: { kind: 'exact', n: 2, d: 1 },
    })

    expect(recompute(remainder)).toBe(2)
    expect(answerValue(remainder)).toBe(recompute(remainder))
  })

  it('catches a remainder answer that disagrees with its carried operands', () => {
    const wrong = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: { operation: 'divide-remainder', dividend: 47, divisor: 5 },
      },
      // 9 is the quotient, which is exactly the confusion the skill diagnoses —
      // and an answer key that made it would be shipped without this branch.
      answer: { kind: 'exact', n: 9, d: 1 },
    })

    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('discards the remainder when the whole quotient is asked for', () => {
    const quotient = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 5',
        wholeNumber: { operation: 'divide-quotient', dividend: 47, divisor: 5 },
      },
      answer: { kind: 'exact', n: 9, d: 1 },
    })

    expect(recompute(quotient)).toBe(9)
    expect(answerValue(quotient)).toBe(recompute(quotient))
  })

  it('names a division whose displayed text does not match its operands', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '47 ÷ 6',
        wholeNumber: { operation: 'divide-remainder', dividend: 47, divisor: 5 },
      },
    })

    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('derives a magnitude rather than evaluating the value shown', () => {
    // `|−7|` is not arithmetic, so the expression branch cannot read it at all;
    // and a display of `−7` alone would evaluate to −7, which is the answer this
    // problem exists to say is wrong.
    const distance = whole({
      prompt: 'How far is this from zero?',
      display: {
        kind: 'inline',
        text: '|−7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      answer: { kind: 'exact', n: 7, d: 1 },
    })

    expect(recompute(distance)).toBe(7)
    expect(answerValue(distance)).toBe(recompute(distance))
  })

  it('catches a distance answer that kept the sign', () => {
    const wrong = whole({
      display: {
        kind: 'inline',
        text: '|−7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      // The mistake the skill diagnoses, shipped as the answer key — which is
      // exactly what this branch exists to catch.
      answer: { kind: 'exact', n: -7, d: 1 },
    })

    expect(recompute(wrong)).toBe(7)
    expect(answerValue(wrong)).not.toBe(recompute(wrong))
  })

  it('names a distance display that does not match its carried value', () => {
    const mismatched = whole({
      display: {
        kind: 'inline',
        text: '|7|',
        wholeNumber: { operation: 'absolute-value', value: -7 },
      },
      answer: { kind: 'exact', n: 7, d: 1 },
    })

    // Both display the same answer, which is what makes this worth pinning: the
    // problem asked a different question from the one it carries.
    expect(() => recompute(mismatched)).toThrow('synthetic-whole: visible text')
  })

  it('expects a compared display to draw its signs the way the course does', () => {
    const negatives = whole({
      display: {
        kind: 'inline',
        text: '−7 ? −3',
        wholeNumber: { operation: 'compare', left: -7, right: -3 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })
    const hyphenated = whole({
      ...negatives,
      display: {
        kind: 'inline',
        text: '-7 ? -3',
        wholeNumber: { operation: 'compare', left: -7, right: -3 },
      },
    })

    expect(recompute(negatives)).toBe('-1')
    // The pair the number line already separates: `−` is drawn, `-` is entered.
    // A display carrying the entry form is named rather than quietly accepted.
    expect(() => recompute(hyphenated)).toThrow('synthetic-whole: visible text')
  })

  it('leaves a comparison of positive values exactly as it was', () => {
    const positives = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
      },
      answer: { kind: 'choice', id: '-1' },
      inputMode: 'choice',
      choices: [
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ],
    })

    expect(recompute(positives)).toBe('-1')
  })

  it('resolves a factor list through its visible label', () => {
    const factors = whole({
      prompt: 'Which list holds every factor?',
      display: {
        kind: 'inline',
        text: '12',
        wholeNumber: { operation: 'factors', value: 12 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '1', label: '2, 3, 4, 6' },
        { id: '0', label: '1, 2, 3, 4, 6, 12' },
        { id: '2', label: '1, 2, 3, 4, 5, 6, 12' },
      ],
    })

    expect(recompute(factors)).toBe('0')
    expect(answerValue(factors)).toBe(recompute(factors))
  })

  it('catches a correct factor list mapped to the wrong choice id', () => {
    const factors = whole({
      display: {
        kind: 'inline',
        text: '12',
        wholeNumber: { operation: 'factors', value: 12 },
      },
      // Points at the list with 1 and 12 stripped out — the distractor.
      answer: { kind: 'choice', id: '1' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: '1, 2, 3, 4, 6, 12' },
        { id: '1', label: '2, 3, 4, 6' },
      ],
    })

    expect(answerValue(factors)).not.toBe(recompute(factors))
  })

  it('resolves multiples and a primality classification through their labels', () => {
    const multiples = whole({
      display: {
        kind: 'inline',
        text: '6',
        wholeNumber: { operation: 'multiples', value: 6, count: 4 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: '6, 12, 18, 24' },
        { id: '1', label: '0, 6, 12, 18' },
      ],
    })
    const classify = whole({
      display: {
        kind: 'inline',
        text: '51',
        wholeNumber: { operation: 'classify-prime', value: 51 },
      },
      answer: { kind: 'choice', id: '0' },
      inputMode: 'choice',
      choices: [
        { id: '0', label: 'composite' },
        { id: '1', label: 'prime' },
      ],
    })

    expect(recompute(multiples)).toBe('0')
    // 51 looks prime and is 3 × 17, which is the whole point of the skill.
    expect(recompute(classify)).toBe('0')
  })

  // The expression evaluator is the branch every keypad arithmetic skill routes
  // through, so a bug in it weakens the check protecting the whole course rather
  // than one unit. These are the cases proving it does the reading.
  // `stated` defaults, because most cases below assert on `recompute` alone and
  // never read the answer. Spelling out a value there invited reading it as the
  // assertion when the `.toBe()` beside it is.
  const expression = (text: string, stated = 0): Problem => ({
    skillId: 'synthetic-expression',
    prompt: 'What is the value?',
    display: { kind: 'inline', text },
    answer: { kind: 'exact', n: stated, d: 1 },
    inputMode: 'keypad',
    hint: 'Work out which operation comes first.',
    solution: [{ text: 'Multiply before adding.' }],
    difficulty: 1,
  })

  it('applies precedence rather than the order the operators are written in', () => {
    const problem = expression('3 + 4 × 2', 11)

    expect(recompute(problem)).toBe(11)
    expect(answerValue(problem)).toBe(recompute(problem))
  })

  it('catches an answer folded left to right', () => {
    // The `two-operations` wall in miniature, and the reason this branch cannot
    // stay a fold: 14 is the mistake the skill exists to diagnose, and a checker
    // that folded would have called it correct.
    const problem = expression('3 + 4 × 2', 14)

    expect(recompute(problem)).toBe(11)
    expect(answerValue(problem)).not.toBe(recompute(problem))
  })

  it('evaluates a parenthesised group first', () => {
    expect(recompute(expression('(3 + 4) × 2'))).toBe(14)
    expect(recompute(expression('7 + 3 × (9 − 4)'))).toBe(22)
  })

  it('runs equal precedence left to right, not in PEMDAS letter order', () => {
    // The `pemdas` misconception, checked on the checker. Reading A before S
    // gives 9 and M before D gives 3; both are wrong and both are values a
    // learner reaches.
    expect(recompute(expression('20 − 8 + 3'))).toBe(15)
    expect(recompute(expression('24 ÷ 4 × 2'))).toBe(12)
  })

  it('keeps evaluating the two-operand displays that already ship', () => {
    expect(recompute(expression('40 + 40'))).toBe(80)
    expect(recompute(expression('1482 ÷ 6'))).toBe(247)
    expect(recompute(expression('30 − 10'))).toBe(20)
  })

  it.each([
    ['unbalanced parentheses', '(3 + 4 × 2'],
    ['a stray operator', '3 + × 2'],
    ['a character that is not arithmetic', '3 + 4 ? 2'],
    ['nothing to evaluate', ''],
  ])('names a display it cannot read: %s', (_case, text) => {
    // Loud beats silent: an unreadable display that returned NaN would compare
    // unequal to every answer and look like a generator bug in the wrong place.
    expect(() => recompute(expression(text))).toThrow('synthetic-expression: cannot evaluate')
  })

  it('names duplicate choice ids even when the expected label is unique', () => {
    const comparison = whole({
      display: {
        kind: 'inline',
        text: '347 ? 354',
        wholeNumber: { operation: 'compare', left: 347, right: 354 },
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
              wholeNumber: { operation: 'round-to-10', value },
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
