import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { checkTeachingLine } from '../lib/content-rules'
import { diagnose, generateProblem } from '../lib/generator'
import { ticks } from '../lib/number-line'
import { equals, gcd, rational, toNumber } from '../lib/rational'
import { shapeDiagramFraction } from '../lib/shape-diagram'
import type { FractionData, MathNotation, Problem } from '../lib/types'
import { manifestIndex } from './index'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import { unit07 } from './unit-07-fractions-meaning'

describe.each(unit07.map((skill) => [skill.id, skill] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const { everyProblem } = sweep(unit07, 'Unit 7')
const allProblems = () => unit07.flatMap((skill) => everyProblem(skill.id))

const exact = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error('expected an exact answer')
  return rational(problem.answer.n, problem.answer.d)
}

const fractionData = (problem: Problem): FractionData => {
  if (problem.display.kind !== 'math' || !problem.display.fraction) {
    throw new Error('expected fraction operation data')
  }
  return problem.display.fraction
}

const comparisonData = (problem: Problem) => {
  const data = fractionData(problem)
  if (data.operation !== 'compare') throw new Error('expected comparison data')
  return data
}

const relation = (
  leftNumerator: number,
  leftDenominator: number,
  rightNumerator: number,
  rightDenominator: number,
) => {
  const difference = leftNumerator * rightDenominator - rightNumerator * leftDenominator
  return difference < 0 ? -1 : difference > 0 ? 1 : 0
}

const textValue = (notation: MathNotation): string => {
  if (notation.kind !== 'text') throw new Error('expected text notation')
  return notation.value
}

const fractionValues = (notation: MathNotation): [string, string] => {
  if (notation.kind !== 'fraction') throw new Error('expected fraction notation')
  return [textValue(notation.numerator), textValue(notation.denominator)]
}

const comparisonValues = (problem: Problem): [string, string, string, string] => {
  if (problem.display.kind !== 'math' || problem.display.notation.kind !== 'row') {
    throw new Error('expected comparison notation')
  }
  const [left, mark, right] = problem.display.notation.children
  expect(textValue(mark)).toBe('?')
  return [...fractionValues(left), ...fractionValues(right)]
}

const teachingLines = [
  ['fraction-meaning', 'A fraction writes selected equal parts over all equal parts.'],
  ['fraction-of-shape', 'Count shaded equal parts over all equal parts in the shape.'],
  ['name-parts', "A fraction's top number counts selected parts; its bottom counts all equal parts."],
  ['fractions-numberline', 'Split the space from zero to one into equal parts, then count right.'],
  ['equivalent-visual', 'Equivalent fractions name the same amount with different equal pieces.'],
  ['equivalent-multiply', 'Multiply or divide both fraction parts by the same number.'],
  ['simplify-fractions', 'Lowest terms use no shared factor except 1.'],
  ['compare-same-den', 'With matching denominators, the larger top number makes the larger fraction.'],
  ['compare-diff-den', 'Rename both fractions with one shared denominator, then compare their top numbers.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit07.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 7 skill: ${id}`)
  return found
}

const answerChoiceLabel = (problem: Problem): string => {
  if (problem.answer.kind !== 'choice') throw new Error(`Expected choice answer for ${problem.skillId}`)
  const answerId = problem.answer.id
  const choice = problem.choices?.find((candidate) => candidate.id === answerId)
  if (!choice) throw new Error(`Missing answer choice for ${problem.skillId}`)
  return choice.label
}

describe('Stage D Unit 7 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage D Unit 7 intro examples', () => {
  it('recomputes every fixed example from visible notation or diagram data', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)

      if (id === 'fraction-of-shape' || id === 'equivalent-visual') {
        if (problem.display.kind !== 'diagram') throw new Error(`Expected diagram for ${id}`)
        if (problem.display.diagram.kind === 'geometry') throw new Error(`Expected fraction diagram for ${id}`)
        const visible = shapeDiagramFraction(problem.display.diagram)
        if (id === 'fraction-of-shape') {
          expect(exact(problem)).toEqual(visible)
        } else {
          const matching = (problem.choices ?? []).filter(
            (choice) => choice.value && equals(choice.value, visible),
          )
          expect(matching).toHaveLength(1)
          expect(problem.answer).toEqual({ kind: 'choice', id: matching[0].id })
        }
        continue
      }

      if (id === 'name-parts') {
        const data = fractionData(problem)
        if (data.operation !== 'name-part') throw new Error('expected name-part data')
        expect(problem.answer).toEqual({ kind: 'choice', id: data.requestedPart })
        expect(answerChoiceLabel(problem)).toBe(
          data.requestedPart === 'numerator' ? 'Numerator' : 'Denominator',
        )
        continue
      }

      if (id === 'fractions-numberline') {
        const data = fractionData(problem)
        if (data.operation !== 'place' || !problem.numberLine) throw new Error('expected number-line data')
        expect(ticks(problem.numberLine).some((tick) => equals(tick, rational(data.numerator, data.denominator)))).toBe(true)
        expect(exact(problem)).toEqual(rational(data.numerator, data.denominator))
        continue
      }

      if (id === 'compare-same-den' || id === 'compare-diff-den') {
        const data = comparisonData(problem)
        const expected = relation(
          data.leftNumerator,
          data.leftDenominator,
          data.rightNumerator,
          data.rightDenominator,
        )
        expect(problem.answer).toEqual({ kind: 'choice', id: String(expected) })
        expect(answerChoiceLabel(problem)).toBe(expected < 0 ? '<' : expected > 0 ? '>' : '=')
        continue
      }

      const data = fractionData(problem)
      if (id === 'fraction-meaning') {
        if (data.operation !== 'read') throw new Error('expected read data')
        expect(exact(problem)).toEqual(rational(data.numerator, data.denominator))
      } else if (id === 'equivalent-multiply') {
        if (data.operation !== 'scale-missing') throw new Error('expected scale data')
        const base = data.missing === 'numerator' ? data.numerator : data.denominator
        const expected = data.direction === 'up' ? base * data.factor : base
        expect(exact(problem)).toEqual(rational(expected, 1))
      } else if (id === 'simplify-fractions') {
        if (data.operation !== 'simplify') throw new Error('expected simplify data')
        expect(exact(problem)).toEqual(rational(data.numerator, data.denominator))
        expect(problem.answer).toMatchObject({ requireSimplified: true })
      } else {
        throw new Error(`Unhandled Unit 7 intro: ${id}`)
      }
    }
  })
})

describe('fraction-meaning', () => {
  it('shows selected parts over all equal parts and answers that exact fraction', () => {
    for (const problem of everyProblem('fraction-meaning')) {
      const data = fractionData(problem)
      if (data.operation !== 'read') throw new Error('expected read data')
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(fractionValues(problem.display.notation)).toEqual([
        `${data.numerator} selected`,
        `${data.denominator} equal parts`,
      ])
      expect(exact(problem)).toEqual(rational(data.numerator, data.denominator))
      expect(data.numerator).toBeGreaterThan(0)
      expect(data.numerator).toBeLessThan(data.denominator)
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })
})

describe('fraction-of-shape', () => {
  it('derives each answer from valid proper diagram counts', () => {
    for (const problem of everyProblem('fraction-of-shape')) {
      if (problem.display.kind !== 'diagram') throw new Error('expected diagram display')
      if (problem.display.diagram.kind === 'geometry') throw new Error('expected fraction diagram')
      expect(exact(problem)).toEqual(shapeDiagramFraction(problem.display.diagram))
      expect(problem.display.diagram.shadedParts).toBeGreaterThan(0)
      expect(problem.display.diagram.shadedParts).toBeLessThan(problem.display.diagram.parts)
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('uses every supported diagram shape', () => {
    const shapes = new Set(
      everyProblem('fraction-of-shape').map((problem) =>
        problem.display.kind === 'diagram' ? problem.display.diagram.kind : '',
      ),
    )
    expect([...shapes].sort()).toEqual(['bar', 'circle', 'grid'])
  })
})

describe('name-parts', () => {
  it('keeps the requested position, answer id, label, and notation together', () => {
    const requested = new Set<string>()
    for (const problem of everyProblem('name-parts')) {
      const data = fractionData(problem)
      if (data.operation !== 'name-part') throw new Error('expected name-part data')
      requested.add(data.requestedPart)

      const position = data.requestedPart === 'numerator' ? 'top' : 'bottom'
      expect(problem.prompt).toContain(position)
      expect(problem.answer).toEqual({ kind: 'choice', id: data.requestedPart })
      expect(problem.choices).toEqual(
        expect.arrayContaining([
          { id: 'numerator', label: 'Numerator' },
          { id: 'denominator', label: 'Denominator' },
        ]),
      )
      expect(problem.inputMode).toBe('choice')
    }
    expect([...requested].sort()).toEqual(['denominator', 'numerator'])
  })
})

describe('fractions-numberline', () => {
  it('places its exact target on a line divided by the same denominator', () => {
    for (const problem of everyProblem('fractions-numberline')) {
      const data = fractionData(problem)
      if (data.operation !== 'place') throw new Error('expected place data')
      if (!problem.numberLine) throw new Error('expected number line')

      expect(problem.inputMode).toBe('number-line')
      expect(problem.numberLine.start).toEqual(rational(0, 1))
      expect(problem.numberLine.step).toEqual(rational(1, data.denominator))
      expect(problem.numberLine.count).toBe(data.denominator + 1)
      expect(ticks(problem.numberLine).some((tick) => equals(tick, exact(problem)))).toBe(true)
    }
  })
})

describe('equivalent-visual', () => {
  it('gives every prose choice the exact value its counts describe', () => {
    const label = /^(\d+) shaded parts? in every (\d+) equal parts$/

    for (const problem of everyProblem('equivalent-visual')) {
      for (const choice of problem.choices ?? []) {
        const match = label.exec(choice.label)
        expect(match, choice.label).not.toBeNull()
        expect(choice.value).toEqual(rational(Number(match![1]), Number(match![2])))
      }
    }
  })

  it('offers exactly one description equivalent to each reducible diagram', () => {
    const shapes = new Set<string>()
    for (const problem of everyProblem('equivalent-visual')) {
      if (problem.display.kind !== 'diagram') throw new Error('expected diagram display')
      if (problem.display.diagram.kind === 'geometry') throw new Error('expected fraction diagram')
      const visible = shapeDiagramFraction(problem.display.diagram)
      const matching = (problem.choices ?? []).filter(
        (choice) => choice.value && equals(choice.value, visible),
      )

      shapes.add(problem.display.diagram.kind)
      expect(gcd(problem.display.diagram.shadedParts, problem.display.diagram.parts)).toBeGreaterThan(1)
      expect(matching.map((choice) => choice.id)).toEqual(['equivalent'])
      expect(problem.answer).toEqual({ kind: 'choice', id: 'equivalent' })
    }
    expect([...shapes].sort()).toEqual(['bar', 'circle', 'grid'])
  })
})

describe('equivalent-multiply', () => {
  it('shows and solves both scale directions with either term missing', () => {
    const shapes = new Set<string>()
    for (const problem of everyProblem('equivalent-multiply')) {
      const data = fractionData(problem)
      if (data.operation !== 'scale-missing') throw new Error('expected scaling data')
      if (problem.display.kind !== 'math' || problem.display.notation.kind !== 'row') {
        throw new Error('expected equality notation')
      }

      const [left, equalsSign, right] = problem.display.notation.children
      const scaledNumerator = data.numerator * data.factor
      const scaledDenominator = data.denominator * data.factor
      const base = [String(data.numerator), String(data.denominator)] as [string, string]
      const scaled = [String(scaledNumerator), String(scaledDenominator)] as [string, string]
      const missingIndex = data.missing === 'numerator' ? 0 : 1
      const shownBase = [...base] as [string, string]
      const shownScaled = [...scaled] as [string, string]
      if (data.direction === 'up') shownScaled[missingIndex] = '?'
      else shownBase[missingIndex] = '?'
      const expectedAnswer = Number((data.direction === 'up' ? scaled : base)[missingIndex])
      const unchanged = Number((data.direction === 'up' ? base : scaled)[missingIndex])
      const changedByOffset =
        data.direction === 'up' ? unchanged + data.factor : unchanged - data.factor
      const arithmetic = data.direction === 'up'
        ? `${unchanged} × ${data.factor} = ${expectedAnswer}`
        : `${unchanged} ÷ ${data.factor} = ${expectedAnswer}`

      shapes.add(`${data.direction}-${data.missing}`)
      expect(textValue(equalsSign)).toBe('=')
      expect(fractionValues(left)).toEqual(data.direction === 'up' ? shownBase : shownScaled)
      expect(fractionValues(right)).toEqual(data.direction === 'up' ? shownScaled : shownBase)
      expect(exact(problem)).toEqual(rational(expectedAnswer, 1))
      expect(problem.misconceptions?.map(({ value }) => value)).toEqual([
        unchanged,
        changedByOffset,
      ])
      expect(problem.solution[0].detail).toBe(arithmetic)
    }
    expect([...shapes].sort()).toEqual([
      'down-denominator',
      'down-numerator',
      'up-denominator',
      'up-numerator',
    ])
  })
})

describe('simplify-fractions', () => {
  it('derives lowest terms and keeps both one-part mistakes diagnosable', () => {
    for (const problem of everyProblem('simplify-fractions')) {
      const data = fractionData(problem)
      if (data.operation !== 'simplify') throw new Error('expected simplification data')
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')

      const reduced = rational(data.numerator, data.denominator)
      const factor = gcd(data.numerator, data.denominator)
      const partialDivisor = Array.from({ length: factor - 2 }, (_, i) => i + 2)
        .find((candidate) => factor % candidate === 0)
      const numeratorOnly = toNumber(rational(reduced.n, data.denominator))
      const denominatorOnly = toNumber(rational(data.numerator, reduced.d))

      if (problem.display.kind !== 'math') throw new Error('expected math display')
      expect(fractionValues(problem.display.notation)).toEqual([
        String(data.numerator),
        String(data.denominator),
      ])
      expect(data.numerator).toBeGreaterThan(0)
      expect(data.numerator).toBeLessThan(data.denominator)
      expect(factor).toBeGreaterThan(1)
      expect(partialDivisor).toBeDefined()
      expect(problem.answer).toEqual({ kind: 'exact', ...reduced, requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
      expect(problem.misconceptions?.map(({ value }) => value)).toEqual([
        numeratorOnly,
        denominatorOnly,
      ])
      expect(diagnose(problem, `${reduced.n}/${data.denominator}`)?.tag)
        .toBe('reduced-numerator-only')
      expect(diagnose(problem, `${data.numerator}/${reduced.d}`)?.tag)
        .toBe('reduced-denominator-only')
      expect(checkAnswer(problem.answer, `${data.numerator}/${data.denominator}`).status)
        .toBe('not-simplified')
      expect(
        checkAnswer(
          problem.answer,
          `${data.numerator / partialDivisor!}/${data.denominator / partialDivisor!}`,
        ).status,
      ).toBe('not-simplified')
    }
  })
})

describe('compare-same-den', () => {
  it('compares distinct numerators over one denominator', () => {
    const seen = new Set<number>()
    for (const problem of everyProblem('compare-same-den')) {
      const data = comparisonData(problem)
      const expected = relation(
        data.leftNumerator,
        data.leftDenominator,
        data.rightNumerator,
        data.rightDenominator,
      )

      seen.add(expected)
      expect(comparisonValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(data.leftDenominator).toBe(data.rightDenominator)
      expect(data.leftNumerator).not.toBe(data.rightNumerator)
      expect(problem.answer).toEqual({ kind: 'choice', id: String(expected) })
      expect(problem.inputMode).toBe('choice')
      expect(problem.choices).toEqual(expect.arrayContaining([
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ]))
    }
    expect([...seen].sort()).toEqual([-1, 1])
  })
})

describe('compare-diff-den', () => {
  it('makes numerator-only comparison wrong and retains both wall diagnoses', () => {
    const denominatorPairs = new Set<string>()
    for (const problem of everyProblem('compare-diff-den')) {
      const data = comparisonData(problem)
      const expected = relation(
        data.leftNumerator,
        data.leftDenominator,
        data.rightNumerator,
        data.rightDenominator,
      )
      const numeratorOnly = data.leftNumerator < data.rightNumerator ? -1 : 1

      denominatorPairs.add(`${data.leftDenominator}/${data.rightDenominator}`)
      expect(comparisonValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(data.leftDenominator).not.toBe(data.rightDenominator)
      expect(expected).not.toBe(0)
      expect(numeratorOnly).toBe(-expected)
      expect(problem.answer).toEqual({ kind: 'choice', id: String(expected) })
      expect(problem.inputMode).toBe('choice')
      expect(problem.choices).toEqual(expect.arrayContaining([
        { id: '-1', label: '<' },
        { id: '0', label: '=' },
        { id: '1', label: '>' },
      ]))
      expect(problem.misconceptions?.map(({ value }) => value)).toEqual([numeratorOnly, 0])
      expect(diagnose(problem, String(numeratorOnly))?.tag).toBe('compared-numerators-only')
      expect(diagnose(problem, '0')?.tag).toBe('called-equal')
    }
    expect(denominatorPairs.size).toBeGreaterThan(10)
  })
})

describe('the nine-skill unit', () => {
  it('uses the intended input mode for every skill', () => {
    expect(
      unit07.map((skill) => `${skill.id} ${everyProblem(skill.id)[0].inputMode}`),
    ).toEqual([
      'fraction-meaning keypad',
      'fraction-of-shape keypad',
      'name-parts choice',
      'fractions-numberline number-line',
      'equivalent-visual choice',
      'equivalent-multiply keypad',
      'simplify-fractions keypad',
      'compare-same-den choice',
      'compare-diff-den choice',
    ])
  })

  it('renders every field the generators set', () => {
    expect(unrenderedKeys(unit07)).toEqual([])
  })

  it('widens each skill from difficulty one to five', () => {
    const magnitude = (problem: Problem) => {
      if (problem.display.kind === 'diagram') {
        if (problem.display.diagram.kind === 'geometry') throw new Error('expected fraction diagram')
        return problem.display.diagram.parts
      }
      const data = fractionData(problem)
      let values: number[]
      switch (data.operation) {
        case 'compare':
          values = [data.leftNumerator, data.leftDenominator, data.rightNumerator, data.rightDenominator]
          break
        case 'scale-missing':
          values = [data.numerator, data.denominator, data.factor]
          break
        case 'read':
        case 'place':
        case 'simplify':
        case 'name-part':
          values = [data.numerator, data.denominator]
          break
        default:
          throw new Error(`unexpected unit-7 operation: ${data.operation}`)
      }
      return values.reduce((sum, value) => sum + value, 0) / values.length
    }

    const flat = unit07
      .filter((skill) => {
        const low = everyProblem(skill.id).filter((problem) => problem.difficulty === 1)
        const high = everyProblem(skill.id).filter((problem) => problem.difficulty === 5)
        const mean = (problems: Problem[]) =>
          problems.reduce((sum, problem) => sum + magnitude(problem), 0) / problems.length
        return mean(high) <= mean(low)
      })
      .map((skill) => skill.id)

    expect(flat).toEqual([])
  })

  it('records every problem without throwing', () => {
    expect(allProblems().every((problem) => format(problem, 1).includes(problem.skillId))).toBe(true)
  })
})
