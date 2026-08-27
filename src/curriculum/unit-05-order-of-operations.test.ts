import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import type { Problem } from '../lib/types'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import {
  evaluate,
  foldInOrder,
  ignoringParentheses,
  op,
  render,
  unit05,
} from './unit-05-order-of-operations'
import { manifestIndex } from './index'

describe.each(unit05.map((skill) => [skill.id, skill] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const teachingLines = [
  ['two-operations', 'Multiply or divide before adding or subtracting.'],
  ['with-parentheses', 'Work inside parentheses before using operations outside them.'],
  ['pemdas', 'Use parentheses first, then multiply or divide left to right, then add or subtract left to right.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit05.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 5 skill: ${id}`)
  return found
}

describe('Stage B Unit 5 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

const { everyProblem, exactValue, skill } = sweep(unit05, 'Unit 5')

const allProblems = () => unit05.flatMap((generator) => everyProblem(generator.id))

const shown = (problem: Problem) => {
  if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
  return problem.display.text
}

/**
 * Evaluate the displayed expression, written independently of both the unit file
 * and `generators.test.ts`.
 *
 * A shunting-yard fold rather than the recursive descent either of those uses:
 * the point of a third copy is that it agrees by getting the same answer, not by
 * running the same code. Integers, four operators, and balanced parentheses is
 * all this unit ever displays.
 */
function evaluateText(text: string): number {
  const rank: Record<string, number> = { '+': 1, '−': 1, '×': 2, '÷': 2 }
  // A table rather than a chain of ternaries, whose last arm would have meant
  // "anything else is division". When Unit 6 or 12 puts a new symbol on a
  // display, this throws instead of quietly returning a wrong number and
  // reading like a generator bug.
  const arithmetic: Record<string, (left: number, right: number) => number> = {
    '+': (left, right) => left + right,
    '−': (left, right) => left - right,
    '×': (left, right) => left * right,
    '÷': (left, right) => left / right,
  }
  const values: number[] = []
  const operators: string[] = []

  const reduce = () => {
    const operator = operators.pop()
    const right = values.pop()
    const left = values.pop()
    if (operator === undefined || right === undefined || left === undefined) {
      throw new Error(`cannot evaluate "${text}"`)
    }
    const combine = arithmetic[operator]
    if (!combine) throw new Error(`cannot evaluate "${text}": unknown operator "${operator}"`)
    values.push(combine(left, right))
  }

  for (const token of text.match(/\d+|[+−×÷()]/g) ?? []) {
    if (/^\d/.test(token)) {
      values.push(Number(token))
    } else if (token === '(') {
      operators.push(token)
    } else if (token === ')') {
      while (operators.at(-1) !== '(') reduce()
      operators.pop()
    } else {
      while (
        operators.length > 0 &&
        operators.at(-1) !== '(' &&
        rank[operators.at(-1)!] >= rank[token]
      ) {
        reduce()
      }
      operators.push(token)
    }
  }

  while (operators.length > 0) reduce()
  if (values.length !== 1) throw new Error(`cannot evaluate "${text}"`)
  return values[0]
}

/** The same text with its brackets stripped — what a learner who skips them reads. */
const withoutBrackets = (text: string) => text.replace(/[()]/g, '')

describe('Stage B Unit 5 intro examples', () => {
  it('recomputes every fixed example from its visible expression', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)
      const tags = new Set(problem.misconceptions?.map((misconception) => misconception.tag))

      expect(problem.answer).toEqual({ kind: 'exact', n: evaluateText(shown(problem)), d: 1 })
      expect(tags).toContain('first-step-only')
      expect(tags.size).toBe(2)
      if (id === 'two-operations') expect(tags).toContain('left-to-right')
      if (id === 'with-parentheses') expect(tags).toContain('ignored-parentheses')
      if (id === 'pemdas') {
        expect(tags.has('ignored-parentheses') || tags.has('pemdas-letter-order')).toBe(true)
      }
    }
  })
})

describe('the expression model', () => {
  it('prints brackets only where they change the value', () => {
    expect(render(op(3, '+', op(4, '×', 2)))).toBe('3 + 4 × 2')
    expect(render(op(op(3, '+', 4), '×', 2))).toBe('(3 + 4) × 2')
    // Same precedence on the left needs nothing: `(a − b) + c` is `a − b + c`.
    expect(render(op(op(20, '−', 8), '+', 3))).toBe('20 − 8 + 3')
    // Same precedence on the right does: `a − (b + c)` is not.
    expect(render(op(20, '−', op(8, '+', 3)))).toBe('20 − (8 + 3)')
    expect(render(op(op(24, '÷', 4), '×', 2))).toBe('24 ÷ 4 × 2')
    expect(render(op(24, '÷', op(4, '×', 2)))).toBe('24 ÷ (4 × 2)')
  })

  it('evaluates by precedence, not by written order', () => {
    expect(evaluate(op(3, '+', op(4, '×', 2)))).toBe(11)
    expect(evaluate(op(op(3, '+', 4), '×', 2))).toBe(14)
    expect(evaluate(op(op(20, '−', 8), '+', 3))).toBe(15)
    expect(evaluate(op(op(24, '÷', 4), '×', 2))).toBe(12)
  })

  it('folds in written order for the mistake the unit is named for', () => {
    expect(foldInOrder(op(3, '+', op(4, '×', 2)))).toBe(14)
    // Brackets are structure, and folding throws structure away.
    expect(foldInOrder(op(7, '+', op(3, '×', op(9, '−', 4))))).toBe(86)
  })

  it('discards brackets but keeps precedence for the other mistake', () => {
    expect(ignoringParentheses(op(op(3, '+', 4), '×', 2))).toBe(11)
    expect(ignoringParentheses(op(7, '+', op(3, '×', op(9, '−', 4))))).toBe(30)
    // With nothing bracketed it is just the answer, which is exactly why
    // `with-parentheses` may never display a bracket that does not bind.
    expect(ignoringParentheses(op(3, '+', op(4, '×', 2)))).toBe(11)
  })
})

describe('what the unit guarantees about every problem it makes', () => {
  it('answers a non-negative whole number on the existing digit keypad', () => {
    const violations = allProblems()
      .filter(
        (problem) =>
          problem.inputMode !== 'keypad' ||
          problem.keypad !== undefined ||
          !Number.isInteger(exactValue(problem)) ||
          exactValue(problem) < 0,
      )
      .map((problem) => `${problem.skillId}: ${shown(problem)} = ${exactValue(problem)}`)

    expect([...new Set(violations)]).toEqual([])
  })

  it('never predicts a value no keypad could produce', () => {
    // A negative or fractional prediction is a diagnosis that sits in the bank
    // looking like coverage and can never once fire, which `div-words` learned
    // one unit ago. Here it is a whole-unit rule rather than one skill's.
    for (const problem of allProblems()) {
      for (const misconception of problem.misconceptions ?? []) {
        expect(Number.isInteger(misconception.value), `${problem.skillId} ${misconception.tag}`).toBe(true)
        expect(misconception.value, `${problem.skillId} ${misconception.tag}`).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('shows only whole numbers between whole-number steps', () => {
    // Every value the working names, not only the two ends. A step reading
    // `18 − 25 = −7` would be a forward reference to Unit 6 inside a solution.
    for (const problem of allProblems()) {
      for (const step of problem.solution) {
        for (const value of (step.detail ?? '').match(/-?\d+/g) ?? []) {
          expect(Number(value), `${problem.skillId}: ${step.detail}`).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('displays an expression whose value is the stated answer', () => {
    // A third evaluator, agreeing with the generator and with the one in
    // `generators.test.ts` by arriving at the same number a different way.
    for (const problem of allProblems()) {
      expect(evaluateText(shown(problem)), problem.skillId).toBe(exactValue(problem))
    }
  })

  it('uses no exponent, which the course does not introduce until unit 12', () => {
    for (const problem of allProblems()) {
      expect(shown(problem)).toMatch(/^[\d +−×÷()]+$/)
    }
  })
})

describe('brackets that do nothing are never displayed', () => {
  it('changes the value whenever it shows a bracket', () => {
    // The property the render rule gives for free, asserted because it is what
    // makes `ignored-parentheses` a real diagnosis rather than a filtered one:
    // a bracket precedence would have taken first anyway predicts the answer.
    const bracketed = allProblems().filter((problem) => shown(problem).includes('('))

    expect(bracketed.length).toBeGreaterThan(0)
    for (const problem of bracketed) {
      const text = shown(problem)
      expect(evaluateText(withoutBrackets(text)), text).not.toBe(exactValue(problem))
    }
  })
})

describe('the ordering wall', () => {
  it('keeps two distinct diagnoses on every problem', () => {
    // The content contract asserts this over sampled problems; asserted here
    // against the draw, because it is the draw that guarantees it. A candidate
    // whose predictions collide is filtered down to one and the wall ships with
    // a bare "not quite" on a skill learners historically quit at.
    for (const problem of everyProblem('two-operations')) {
      const tags = new Set((problem.misconceptions ?? []).map((m) => m.tag))
      const values = (problem.misconceptions ?? []).map((m) => m.value)

      expect(tags.size, shown(problem)).toBe(2)
      expect(new Set(values).size, shown(problem)).toBe(2)
      expect(values, shown(problem)).not.toContain(exactValue(problem))
    }
  })

  it('predicts the bracketing a positional habit actually produces', () => {
    for (const problem of everyProblem('two-operations')) {
      const text = shown(problem)
      const [a, first, b, second, c] = text.split(' ')
      const values = new Map((problem.misconceptions ?? []).map((m) => [m.tag, m.value]))

      // Read straight across, and read from the right. Those are the two habits
      // that stand in for the rule; exactly one of them is wrong on any given
      // problem, and it is the one that problem predicts.
      const leftToRight = evaluateText(`${evaluateText(`${a} ${first} ${b}`)} ${second} ${c}`)
      const rightToLeft = evaluateText(`${a} ${first} ${evaluateText(`${b} ${second} ${c}`)}`)

      if (values.has('left-to-right')) {
        expect(values.get('left-to-right'), text).toBe(leftToRight)
        expect(leftToRight, text).not.toBe(exactValue(problem))
      } else {
        expect(values.get('right-to-left'), text).toBe(rightToLeft)
        expect(rightToLeft, text).not.toBe(exactValue(problem))
      }
    }
  })

  it('teaches both positions, so no positional habit passes every problem', () => {
    // Reading left to right is *correct* when the multiplication comes first.
    // Showing only the failing half would swap one wrong rule for another.
    const tags = everyProblem('two-operations').flatMap((problem) =>
      (problem.misconceptions ?? []).map((m) => m.tag),
    )

    expect(tags).toContain('left-to-right')
    expect(tags).toContain('right-to-left')
  })
})

describe('the full rule', () => {
  it('divides exactly wherever it divides', () => {
    const divisions = everyProblem('pemdas').filter((problem) => shown(problem).includes('÷'))

    expect(divisions.length).toBeGreaterThan(0)
    for (const problem of divisions) {
      // Family T's division is always `a ÷ b × c`, and its draw composes the
      // dividend from a quotient rather than filtering for one that divides.
      const [dividend, , divisor] = shown(problem).split(' ')
      expect(Number(dividend) % Number(divisor), shown(problem)).toBe(0)
    }
  })

  it('predicts PEMDAS read as six steps rather than three tiers', () => {
    const myths = everyProblem('pemdas').filter((problem) =>
      (problem.misconceptions ?? []).some((m) => m.tag === 'pemdas-letter-order'),
    )

    expect(myths.length).toBeGreaterThan(0)
    for (const problem of myths) {
      const [a, first, b, second, c] = shown(problem).split(' ')
      const value = (problem.misconceptions ?? []).find(
        (m) => m.tag === 'pemdas-letter-order',
      )?.value
      // The letter order does the *second* operation first, which is what
      // "M before D" and "A before S" amount to on a same-tier pair.
      const inner = evaluateText(`${b} ${second} ${c}`)

      expect(value, shown(problem)).toBe(evaluateText(`${a} ${first} ${inner}`))
      expect(value, shown(problem)).not.toBe(exactValue(problem))
    }
  })

  it('draws both families, so neither half of the rule goes untaught', () => {
    const texts = everyProblem('pemdas').map(shown)

    expect(texts.some((text) => text.includes('('))).toBe(true)
    expect(texts.some((text) => text.includes('÷'))).toBe(true)
    expect(texts.some((text) => /^\d+ − \d+ \+ \d+$/.test(text))).toBe(true)
  })
})

describe('the wording gate itself', () => {
  it('renders every field the generators set', () => {
    expect(
      unrenderedKeys(unit05),
      'add these to RENDERED_KEYS and render them in format()',
    ).toEqual([])
  })

  it('notices a changed order-of-operations hint', () => {
    const problem = generateProblem(unit05[0], 1, 1)
    expect(format({ ...problem, hint: 'Something else entirely.' }, 1)).not.toBe(
      format(problem, 1),
    )
  })

  it('notices a changed ordering diagnosis', () => {
    const problem = generateProblem(skill('two-operations'), 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 && typeof m.value === 'number' ? { ...m, value: m.value + 1 } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
