import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { diagnose, generateProblem } from '../lib/generator'
import { gcd, rational } from '../lib/rational'
import type { Difficulty, Problem, RatioData } from '../lib/types'
import { sample, unrenderedKeys } from './recorded-output'
import { unit11 } from './unit-11-ratios-proportions'

describe.each(unit11.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit11.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 11 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const ratioData = (problem: Problem): RatioData => {
  if ((problem.display.kind !== 'story' && problem.display.kind !== 'math') || !problem.display.ratio) {
    throw new Error('expected ratio data')
  }
  return problem.display.ratio
}

const exact = (problem: Problem) => {
  if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
  return rational(problem.answer.n, problem.answer.d)
}

const meanAt = (id: string, difficulty: Difficulty, value: (data: RatioData) => number) => {
  const values = problems(id)
    .filter((problem) => problem.difficulty === difficulty)
    .map((problem) => value(ratioData(problem)))
  return values.reduce((sum, entry) => sum + entry, 0) / values.length
}

describe('write-ratios', () => {
  it('preserves the requested first-to-second order and requires fraction form', () => {
    for (const problem of problems('write-ratios')) {
      const data = ratioData(problem)
      if (data.operation !== 'write-ratio') throw new Error('expected write-ratio data')
      expect(exact(problem)).toEqual(rational(data.first, data.second))
      expect(problem.answer).toMatchObject({ requireFraction: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
      expect(diagnose(problem, `${data.second}/${data.first}`)?.tag).toBe('reversed-ratio-order')
    }
    expect(checkAnswer({ kind: 'exact', n: 1, d: 2, requireFraction: true }, '0.5').status).toBe('not-fraction')
  })

  it('varies its categories and grows its counts with difficulty', () => {
    expect(new Set(problems('write-ratios').map((problem) => JSON.stringify(problem.display))).size).toBeGreaterThan(100)
    expect(meanAt('write-ratios', 5, (data) => data.operation === 'write-ratio' ? data.first + data.second : 0))
      .toBeGreaterThan(meanAt('write-ratios', 1, (data) => data.operation === 'write-ratio' ? data.first + data.second : 0))
  })
})

describe('simplify-ratios', () => {
  it('constructs a reducible ratio and requires a lowest-terms fraction', () => {
    for (const problem of problems('simplify-ratios')) {
      const data = ratioData(problem)
      if (data.operation !== 'simplify-ratio') throw new Error('expected simplify-ratio data')
      const factor = gcd(data.first, data.second)
      expect(factor).toBeGreaterThan(1)
      expect(exact(problem)).toEqual(rational(data.first, data.second))
      expect(problem.answer).toMatchObject({ requireFraction: true, requireSimplified: true })
      expect(checkAnswer(problem.answer, `${data.first}/${data.second}`).status).toBe('not-simplified')
      expect(diagnose(problem, `${data.first / factor}/${data.second}`)?.tag).toBe('divided-first-term-only')
      expect(diagnose(problem, `${data.first}/${data.second / factor}`)?.tag).toBe('divided-second-term-only')
    }
  })

  it('grows both displayed terms with difficulty', () => {
    expect(meanAt('simplify-ratios', 5, (data) => data.operation === 'simplify-ratio' ? data.first + data.second : 0))
      .toBeGreaterThan(meanAt('simplify-ratios', 1, (data) => data.operation === 'simplify-ratio' ? data.first + data.second : 0))
  })
})

describe('unit-rate', () => {
  it('selects the unique lower exact price per item', () => {
    const firstChoiceLabels = new Set<string>()
    for (const problem of problems('unit-rate')) {
      const data = ratioData(problem)
      if (data.operation !== 'unit-rate') throw new Error('expected unit-rate data')
      const firstRate = data.firstCents / data.firstCount
      const secondRate = data.secondCents / data.secondCount
      if (problem.answer.kind !== 'choice') throw new Error('expected choice answer')
      expect(firstRate).not.toBe(secondRate)
      expect(problem.answer.id).toBe(firstRate < secondRate ? 'offer-a' : 'offer-b')
      firstChoiceLabels.add(problem.choices?.[0]?.label ?? '')
    }
    expect(firstChoiceLabels).toEqual(new Set(['Offer A', 'Offer B']))
  })

  it('grows offer prices with difficulty', () => {
    expect(meanAt('unit-rate', 5, (data) => data.operation === 'unit-rate' ? data.firstCents + data.secondCents : 0))
      .toBeGreaterThan(meanAt('unit-rate', 1, (data) => data.operation === 'unit-rate' ? data.firstCents + data.secondCents : 0))
  })
})

describe('solve-proportions', () => {
  it('keeps both ratios equal and covers numerator and denominator blanks', () => {
    const missing = new Set<string>()
    for (const problem of problems('solve-proportions')) {
      const data = ratioData(problem)
      if (data.operation !== 'solve-proportion') throw new Error('expected solve-proportion data')
      expect(data.leftNumerator * data.rightDenominator).toBe(data.rightNumerator * data.leftDenominator)
      expect(exact(problem)).toEqual(rational(data[data.missing], 1))
      missing.add(data.missing.includes('Numerator') ? 'numerator' : 'denominator')
    }
    expect(missing).toEqual(new Set(['numerator', 'denominator']))
  })

  it('grows its proportion terms with difficulty', () => {
    expect(meanAt('solve-proportions', 5, (data) => data.operation === 'solve-proportion' ? data.rightNumerator + data.rightDenominator : 0))
      .toBeGreaterThan(meanAt('solve-proportions', 1, (data) => data.operation === 'solve-proportion' ? data.rightNumerator + data.rightDenominator : 0))
  })
})

describe('scale-drawings', () => {
  it('applies the scale in both directions and diagnoses the opposite direction', () => {
    const directions = new Set<string>()
    for (const problem of problems('scale-drawings')) {
      const data = ratioData(problem)
      if (data.operation !== 'scale-drawing') throw new Error('expected scale-drawing data')
      const answer = data.direction === 'drawing-to-actual' ? data.given * data.scale : data.given / data.scale
      const wrong = data.direction === 'drawing-to-actual' ? data.given / data.scale : data.given * data.scale
      expect(exact(problem)).toEqual(rational(answer, 1))
      expect(diagnose(problem, String(wrong))?.tag).toBe('used-opposite-scale-direction')
      directions.add(data.direction)
    }
    expect(directions).toEqual(new Set(['drawing-to-actual', 'actual-to-drawing']))
  })

  it('grows its measurements with difficulty', () => {
    expect(meanAt('scale-drawings', 5, (data) => data.operation === 'scale-drawing' ? data.given + data.scale : 0))
      .toBeGreaterThan(meanAt('scale-drawings', 1, (data) => data.operation === 'scale-drawing' ? data.given + data.scale : 0))
  })
})

describe('unit-conversion', () => {
  it('uses the complete fixed within-system set in both directions with exact answers', () => {
    const relations = new Set<string>()
    const directions = new Set<string>()
    for (const problem of problems('unit-conversion')) {
      const data = ratioData(problem)
      if (data.operation !== 'unit-conversion') throw new Error('expected unit-conversion data')
      const answer = data.direction === 'large-to-small' ? data.given * data.factor : data.given / data.factor
      const wrong = data.direction === 'large-to-small' ? data.given / data.factor : data.given * data.factor
      expect(Number.isInteger(answer)).toBe(true)
      expect(exact(problem)).toEqual(rational(answer, 1))
      expect(diagnose(problem, String(wrong))?.tag).toBe('used-opposite-conversion-direction')
      relations.add(`${data.factor} ${data.smallPlural}/${data.largeSingular}`)
      directions.add(data.direction)
    }
    expect(relations).toEqual(new Set([
      '2 cups/pint',
      '3 feet/yard',
      '4 quarts/gallon',
      '12 inches/foot',
      '16 ounces/pound',
      '100 centimeters/meter',
      '1000 meters/kilometer',
      '1000 milliliters/liter',
      '1000 grams/kilogram',
      '2 pints/quart',
    ]))
    expect(directions).toEqual(new Set(['large-to-small', 'small-to-large']))
  })

  it('grows source measurements with difficulty', () => {
    expect(meanAt('unit-conversion', 5, (data) => data.operation === 'unit-conversion' ? data.factor + data.given : 0))
      .toBeGreaterThan(meanAt('unit-conversion', 1, (data) => data.operation === 'unit-conversion' ? data.factor + data.given : 0))
  })
})

it('records every field Unit 11a sets', () => {
  expect(unrenderedKeys(unit11)).toEqual([])
})
