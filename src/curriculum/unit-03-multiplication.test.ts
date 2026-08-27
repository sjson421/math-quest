import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import type { Problem } from '../lib/types'
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
import { manifestIndex } from './index'
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

const teachingLines = [
  ['mult-meaning', 'Multiplication counts equal groups of the same size.'],
  ['times-2', 'Multiplying by 2 doubles the other number.'],
  ['times-10', 'Multiplying by 10 shifts every digit one place left.'],
  ['times-5', 'Five equal groups make half of ten equal groups.'],
  ['times-3', 'Multiplying by 3 adds three equal groups.'],
  ['times-4', 'Multiply by 4 by doubling the number, then doubling again.'],
  ['times-6', 'Six equal groups are five equal groups plus one more.'],
  ['times-9', 'Nine equal groups are ten equal groups minus one group.'],
  ['times-7-8', 'Build seven or eight equal groups from five groups plus the rest.'],
  ['times-mixed', 'Either number can be the group size; the other tells how many groups.'],
  ['mult-by-10-100', 'Multiplying by 10 or 100 shifts every digit left one or two places.'],
  ['mult-2by1', 'Multiply the ones first, write the ones digit, then multiply tens and add the carry.'],
  ['mult-2by2', 'Make one row for each bottom digit, shift the tens row, then add both rows.'],
  ['mult-words', 'Use multiplication when equal groups hold the same amount.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit03.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 3 skill: ${id}`)
  return found
}

const shownFactors = (problem: Problem): [number, number] => {
  if (problem.display.kind === 'inline') {
    const factors = problem.display.text.split(' × ').map(Number)
    if (factors.length === 2 && factors.every(Number.isInteger)) return factors as [number, number]
    throw new Error(`Cannot parse multiplication: ${problem.display.text}`)
  }

  if (problem.display.kind === 'column') {
    if (problem.display.operands.length !== 2) throw new Error(`Expected two factors for ${problem.skillId}`)
    return problem.display.operands as [number, number]
  }
  if (problem.display.kind === 'story') {
    const { operands } = problem.display
    if (!operands || operands.length !== 2) throw new Error(`Expected two factors for ${problem.skillId}`)
    return operands as [number, number]
  }

  throw new Error(`Expected multiplication factors for ${problem.skillId}`)
}

const wallTags: Record<string, string[]> = {
  'times-7-8': ['one-group-low', 'one-group-high'],
  'mult-2by1': ['forgot-multiplication-carry', 'carried-before-multiplying'],
  'mult-2by2': ['missing-placeholder', 'first-partial-only'],
}

describe('Stage B Unit 3 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage B Unit 3 intro examples', () => {
  it('recomputes every fixed example from its visible factors', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)
      const [left, right] = shownFactors(problem)

      expect(problem.answer).toEqual({ kind: 'exact', n: left * right, d: 1 })

      const expectedTags = wallTags[id]
      if (expectedTags) {
        expect(new Set(problem.misconceptions?.map((misconception) => misconception.tag))).toEqual(
          new Set(expectedTags),
        )
      }
    }
  })
})

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
      i === 0 && typeof m.value === 'number' ? { ...m, value: m.value + 1 } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })
})
