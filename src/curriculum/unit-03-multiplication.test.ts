import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import {
  carriedBeforeMultiplying,
  firstPartialOnly,
  forgotMultiplicationCarry,
  missingPlaceholder,
  multiplicationPlace,
  multiplicationTrace,
  partialProductRow,
  partialProductTrace,
} from './engine'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import { unit03 } from './unit-03-multiplication'

describe.each(unit03.map((skill) => [skill.id, skill] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const { everyProblem, exactValue, skill } = sweep(unit03, 'Unit 3')

describe('what the unit guarantees about every problem it makes', () => {
  it('offers only the existing whole-digit keypad', () => {
    const violations = unit03.flatMap((generator) =>
      everyProblem(generator.id)
        .filter(
          (problem) =>
            problem.inputMode !== 'keypad' ||
            problem.keypad !== undefined ||
            exactValue(problem) < 0,
        )
        .map((problem) => `${problem.skillId}: ${JSON.stringify(problem.keypad)}`),
    )

    expect([...new Set(violations)]).toEqual([])
  })

  it('aligns fixed-table diagnoses with the groups used in the teaching', () => {
    for (const [id, table] of [
      ['times-2', 2],
      ['times-5', 5],
      ['times-3', 3],
      ['times-4', 4],
      ['times-6', 6],
    ] as const) {
      for (const problem of everyProblem(id)) {
        if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
        const [left, right] = problem.display.text.split(' × ').map(Number)
        const partner = left === table ? right : left
        const product = exactValue(problem)
        const values = problem.misconceptions?.map((misconception) => misconception.value)

        expect(values).toContain(product - partner)
        expect(values).toContain(product + partner)
      }
    }
  })

  it('describes the multiplication meaning as rows and repeated addition', () => {
    for (const problem of everyProblem('mult-meaning')) {
      expect(problem.prompt).toContain('rows')
      expect(problem.solution.some((step) => step.detail?.includes(' + '))).toBe(true)
    }
  })

  it('keeps the nines digit-sum pattern in every generated problem', () => {
    for (const problem of everyProblem('times-9')) {
      const product = exactValue(problem)
      const digitSum = String(product)
        .split('')
        .reduce((sum, digit) => sum + Number(digit), 0)

      expect(digitSum % 9).toBe(0)
      expect(problem.hint).toContain(`add to ${digitSum}`)
    }
  })

  it('derives two-by-one wording and diagnoses from one trace', () => {
    for (const problem of everyProblem('mult-2by1')) {
      if (problem.display.kind !== 'column') throw new Error('expected a column problem')
      const [a, b] = problem.display.operands
      const trace = multiplicationTrace(a, b)
      const ones = multiplicationPlace(trace, 0)
      const tens = multiplicationPlace(trace, 1)
      const detail = problem.solution.map((step) => step.detail ?? '').join('\n')
      const values = new Map(problem.misconceptions?.map((m) => [m.tag, m.value]))

      expect(exactValue(problem)).toBe(trace.result)
      expect(problem.hint).toContain(`write ${ones.written} and carry ${ones.carry}`)
      expect(detail).toContain(`${ones.digit} × ${b} = ${ones.raw}`)
      expect(detail).toContain(`${tens.digit} × ${b} + ${tens.incoming} = ${tens.total}`)
      expect(values.get('forgot-multiplication-carry')).toBe(
        forgotMultiplicationCarry(trace, 0, 'n').value,
      )
      expect(values.get('carried-before-multiplying')).toBe(
        carriedBeforeMultiplying(trace, 0, 'n').value,
      )
    }
  })

  it('derives two-by-two wording and diagnoses from aligned rows', () => {
    for (const problem of everyProblem('mult-2by2')) {
      if (problem.display.kind !== 'column') throw new Error('expected a column problem')
      const [a, b] = problem.display.operands
      const trace = partialProductTrace(a, b)
      const ones = partialProductRow(trace, 0)
      const tens = partialProductRow(trace, 1)
      const detail = problem.solution.map((step) => step.detail ?? '').join('\n')
      const values = new Map(problem.misconceptions?.map((m) => [m.tag, m.value]))

      expect(exactValue(problem)).toBe(trace.result)
      expect(problem.hint).toContain(`zero after ${tens.unshifted}`)
      expect(detail).toContain(`${a} × ${ones.digit} = ${ones.value}`)
      expect(detail).toContain(`${a} × ${tens.digit} × 10 = ${tens.value}`)
      expect(detail).toContain(`${ones.value} + ${tens.value} = ${trace.result}`)
      expect(values.get('missing-placeholder')).toBe(missingPlaceholder(trace, 1, 'n').value)
      expect(values.get('first-partial-only')).toBe(firstPartialOnly(trace, 'n').value)
    }
  })
})

describe('the wording gate itself', () => {
  it('renders every field the generators set', () => {
    expect(
      unrenderedKeys(unit03),
      'add these to RENDERED_KEYS and render them in format()',
    ).toEqual([])
  })

  it('notices a changed multiplication hint', () => {
    const problem = generateProblem(unit03[0], 1, 1)
    expect(format({ ...problem, hint: 'Something else entirely.' }, 1)).not.toBe(
      format(problem, 1),
    )
  })

  it('notices a changed multiplication diagnosis', () => {
    const problem = generateProblem(skill('mult-2by1'), 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 ? { ...m, value: m.value + 1 } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
