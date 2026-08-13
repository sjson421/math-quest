import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { diagnose } from '../lib/generator'
import { gcd, rational } from '../lib/rational'
import type { Difficulty, FractionData, MathNotation, Problem } from '../lib/types'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import { unit08 } from './unit-08-fraction-operations'

describe.each(unit08.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const { everyProblem } = sweep(unit08, 'Unit 8')

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

const operationData = (problem: Problem) => {
  const data = fractionData(problem)
  if (data.operation !== 'add' && data.operation !== 'sub') {
    throw new Error('expected operation data')
  }
  return data
}

const mixedOperationData = (problem: Problem) => {
  const data = fractionData(problem)
  if (data.operation !== 'add-mixed' && data.operation !== 'sub-mixed') {
    throw new Error('expected mixed-number operation data')
  }
  return data
}

const productData = (problem: Problem) => {
  const data = fractionData(problem)
  if (data.operation !== 'multiply' && data.operation !== 'divide') {
    throw new Error('expected fraction product data')
  }
  return data
}

const textValue = (notation: MathNotation): string => {
  if (notation.kind !== 'text') throw new Error('expected text notation')
  return notation.value
}

const fractionValues = (notation: MathNotation): [string, string] => {
  if (notation.kind !== 'fraction') throw new Error('expected fraction notation')
  return [textValue(notation.numerator), textValue(notation.denominator)]
}

/** The operation expression a problem displays: left, operator, right. */
const operationValues = (problem: Problem): [string, string, string, string] => {
  if (problem.display.kind !== 'math' || problem.display.notation.kind !== 'row') {
    throw new Error('expected operation notation')
  }
  const [left, mark, right] = problem.display.notation.children
  const operator = operationData(problem).operation
  expect(textValue(mark)).toBe(operator === 'add' ? '+' : '−')
  return [...fractionValues(left), ...fractionValues(right)]
}

const denominatorBounds: Record<Difficulty, readonly [number, number]> = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 6],
  4: [4, 8],
  5: [5, 10],
}

describe.each(['common-denominator', 'add-frac-diff-den', 'sub-frac-diff-den'])(
  '%s denominator draws',
  (skillId) => {
    it('keeps both denominators inside the difficulty band', () => {
      for (const problem of everyProblem(skillId)) {
        const data = fractionData(problem)
        if (data.operation !== 'common-denominator' && data.operation !== 'add' && data.operation !== 'sub') {
          throw new Error('expected a two-fraction operation')
        }
        const [min, max] = denominatorBounds[problem.difficulty]

        expect(data.leftDenominator).toBeGreaterThanOrEqual(min)
        expect(data.leftDenominator).toBeLessThanOrEqual(max)
        expect(data.rightDenominator).toBeGreaterThanOrEqual(min)
        expect(data.rightDenominator).toBeLessThanOrEqual(max)
      }
    })
  },
)

describe('add-frac-same-den', () => {
  it('displays two reduced like fractions and answers their exact sum', () => {
    for (const problem of everyProblem('add-frac-same-den')) {
      const data = operationData(problem)
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(operationValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(data.leftDenominator).toBe(data.rightDenominator)
      expect(data.leftNumerator).not.toBe(data.rightNumerator)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)
      expect(data.leftNumerator + data.rightNumerator).toBeLessThan(data.leftDenominator)
      expect(exact(problem)).toEqual(rational(data.leftNumerator + data.rightNumerator, data.leftDenominator))
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('keeps both wall predictions distinct and diagnosable on every problem', () => {
    for (const problem of everyProblem('add-frac-same-den')) {
      const data = operationData(problem)
      const addedDenominators = (data.leftNumerator + data.rightNumerator) / (2 * data.leftDenominator)
      const copiedAddend = data.rightNumerator / data.rightDenominator

      expect(problem.misconceptions?.map(({ value }) => value)).toEqual([addedDenominators, copiedAddend])
      expect(diagnose(problem, `${data.leftNumerator + data.rightNumerator}/${2 * data.leftDenominator}`)?.tag).toBe(
        'adds-denominators',
      )
      expect(diagnose(problem, `${data.rightNumerator}/${data.rightDenominator}`)?.tag).toBe('copies-addend')
    }
  })

  it('answers a reducible result with the right-value/wrong-form response', () => {
    const reducible = everyProblem('add-frac-same-den').filter((problem) => {
      const data = operationData(problem)
      return gcd(data.leftNumerator + data.rightNumerator, data.leftDenominator) > 1
    })
    expect(reducible.length).toBeGreaterThan(0)

    for (const problem of reducible) {
      const data = operationData(problem)
      const sum = data.leftNumerator + data.rightNumerator
      const reduced = rational(sum, data.leftDenominator)
      expect(checkAnswer(problem.answer, `${sum}/${data.leftDenominator}`).status).toBe('not-simplified')
      expect(checkAnswer(problem.answer, `${reduced.n}/${reduced.d}`).status).toBe('correct')
    }
  })
})

describe('sub-frac-same-den', () => {
  it('displays two reduced like fractions and answers their exact difference', () => {
    for (const problem of everyProblem('sub-frac-same-den')) {
      const data = operationData(problem)
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(operationValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(data.leftDenominator).toBe(data.rightDenominator)
      expect(data.leftNumerator).toBeGreaterThan(data.rightNumerator)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)
      expect(exact(problem)).toEqual(rational(data.leftNumerator - data.rightNumerator, data.leftDenominator))
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      // The flipped prediction is negative, so the sign key must be offered.
      expect(problem.keypad).toEqual({
        allowFraction: true,
        allowNegative: true,
      })
    }
  })

  it('diagnoses the negative flipped subtraction through the sign key', () => {
    for (const problem of everyProblem('sub-frac-same-den')) {
      const data = operationData(problem)
      const flipped = `${data.rightNumerator - data.leftNumerator}/${data.leftDenominator}`

      // The flipped value is negative on every draw, which is why the sign key
      // is on the pad; the copied-subtrahend prediction is dropped whenever it
      // equals the difference (e.g. 2/7 − 1/7 = 1/7), so it is asserted only
      // where it survives.
      expect(diagnose(problem, flipped)?.tag).toBe('flipped-order')
      expect(checkAnswer(problem.answer, flipped).status).toBe('incorrect')
      expect(problem.misconceptions?.map(({ tag }) => tag)).toContain('flipped-order')
      const copied = problem.misconceptions?.find(({ tag }) => tag === 'copies-subtrahend')
      if (copied) {
        expect(diagnose(problem, `${data.rightNumerator}/${data.rightDenominator}`)?.tag).toBe('copies-subtrahend')
      }
    }
  })

  it('answers a reducible difference with the right-value/wrong-form response', () => {
    const reducible = everyProblem('sub-frac-same-den').filter((problem) => {
      const data = operationData(problem)
      return gcd(data.leftNumerator - data.rightNumerator, data.leftDenominator) > 1
    })
    expect(reducible.length).toBeGreaterThan(0)

    for (const problem of reducible) {
      const data = operationData(problem)
      const difference = data.leftNumerator - data.rightNumerator
      expect(checkAnswer(problem.answer, `${difference}/${data.leftDenominator}`).status).toBe('not-simplified')
    }
  })
})

describe('common-denominator', () => {
  it('asks for the least common denominator of two reduced proper fractions', () => {
    for (const problem of everyProblem('common-denominator')) {
      const data = fractionData(problem)
      if (data.operation !== 'common-denominator') throw new Error('expected LCD data')
      if (problem.display.kind !== 'math' || problem.display.notation.kind !== 'row') {
        throw new Error('expected LCD notation')
      }
      const [left, mark, right] = problem.display.notation.children
      expect(textValue(mark)).toBe('and')
      expect(fractionValues(left)).toEqual([String(data.leftNumerator), String(data.leftDenominator)])
      expect(fractionValues(right)).toEqual([String(data.rightNumerator), String(data.rightDenominator)])
      expect(data.leftDenominator).not.toBe(data.rightDenominator)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)

      const lcm = (data.leftDenominator * data.rightDenominator) / gcd(data.leftDenominator, data.rightDenominator)
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer).toEqual({ kind: 'exact', n: lcm, d: 1 })
      expect(problem.keypad).toBeUndefined()
    }
  })

  it('teaches both the product rule and divisibility', () => {
    const problems = everyProblem('common-denominator')
    const dataList = problems.map(fractionData) as Extract<FractionData, { operation: 'common-denominator' }>[]
    const coprime = dataList.filter((data) => gcd(data.leftDenominator, data.rightDenominator) === 1)
    const divisor = dataList.filter(
      (data) =>
        data.leftDenominator % data.rightDenominator === 0 || data.rightDenominator % data.leftDenominator === 0,
    )

    expect(coprime.length).toBeGreaterThan(0)
    expect(divisor.length).toBeGreaterThan(0)
  })

  it('keeps each prediction only where it differs from the answer', () => {
    for (const problem of everyProblem('common-denominator')) {
      const data = fractionData(problem)
      if (data.operation !== 'common-denominator') throw new Error('expected LCD data')
      const lcm = (data.leftDenominator * data.rightDenominator) / gcd(data.leftDenominator, data.rightDenominator)
      const tags = new Set(problem.misconceptions?.map(({ tag }) => tag) ?? [])

      if (gcd(data.leftDenominator, data.rightDenominator) === 1) {
        // The product equals the LCD on a coprime pair, so it is filtered;
        // the larger denominator is the wrong answer that remains.
        expect(tags).toEqual(new Set(['larger-denominator']))
        expect(diagnose(problem, String(Math.max(data.leftDenominator, data.rightDenominator)))?.tag).toBe(
          'larger-denominator',
        )
      } else {
        expect(lcm).not.toBe(data.leftDenominator * data.rightDenominator)
        expect(tags).toEqual(new Set(['product-not-lcm']))
        expect(diagnose(problem, String(data.leftDenominator * data.rightDenominator))?.tag).toBe('product-not-lcm')
      }
    }
  })
})

describe('add-frac-diff-den', () => {
  it('displays two reduced coprime fractions and answers the exact sum over the LCD', () => {
    for (const problem of everyProblem('add-frac-diff-den')) {
      const data = operationData(problem)
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(operationValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(data.leftDenominator).not.toBe(data.rightDenominator)
      expect(gcd(data.leftDenominator, data.rightDenominator)).toBe(1)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)
      const common = data.leftDenominator * data.rightDenominator
      expect(exact(problem)).toEqual(
        rational(data.leftNumerator * data.rightDenominator + data.rightNumerator * data.leftDenominator, common),
      )
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('keeps both wall predictions distinct and diagnosable on every problem', () => {
    for (const problem of everyProblem('add-frac-diff-den')) {
      const data = operationData(problem)
      const common = data.leftDenominator * data.rightDenominator

      expect(problem.misconceptions?.map(({ value }) => value)).toEqual([
        (data.leftNumerator + data.rightNumerator) / (data.leftDenominator + data.rightDenominator),
        (data.leftNumerator + data.rightNumerator) / common,
      ])
      expect(
        diagnose(problem, `${data.leftNumerator + data.rightNumerator}/${data.leftDenominator + data.rightDenominator}`)
          ?.tag,
      ).toBe('adds-across')
      expect(diagnose(problem, `${data.leftNumerator + data.rightNumerator}/${common}`)?.tag).toBe(
        'unscaled-numerators',
      )
    }
  })

  it('keeps the sum proper at low difficulty and lets it exceed one higher up', () => {
    const low = everyProblem('add-frac-diff-den').filter(
      (problem) => problem.difficulty === 1 || problem.difficulty === 2,
    )
    const high = everyProblem('add-frac-diff-den').filter(
      (problem) => problem.difficulty === 4 || problem.difficulty === 5,
    )

    for (const problem of low) {
      const data = operationData(problem)
      expect(data.leftNumerator * data.rightDenominator + data.rightNumerator * data.leftDenominator).toBeLessThan(
        data.leftDenominator * data.rightDenominator,
      )
    }
    const improperHigh = high.filter((problem) => {
      const data = operationData(problem)
      return (
        data.leftNumerator * data.rightDenominator + data.rightNumerator * data.leftDenominator >
        data.leftDenominator * data.rightDenominator
      )
    })
    expect(improperHigh.length).toBeGreaterThan(0)
  })

  it('produces sums already in lowest terms, and still answers an unreduced equivalent with the form response', () => {
    for (const problem of everyProblem('add-frac-diff-den')) {
      const data = operationData(problem)
      const common = data.leftDenominator * data.rightDenominator
      const sum = data.leftNumerator * data.rightDenominator + data.rightNumerator * data.leftDenominator
      // Coprime denominators and reduced numerators make the sum irreducible,
      // so the answer is always in lowest terms by construction; an unreduced
      // equivalent the learner types still reaches the form response.
      expect(gcd(sum, common)).toBe(1)
      expect(checkAnswer(problem.answer, `${2 * sum}/${2 * common}`).status).toBe('not-simplified')
      expect(checkAnswer(problem.answer, `${sum}/${common}`).status).toBe('correct')
    }
  })
})

describe('sub-frac-diff-den', () => {
  it('displays two reduced coprime fractions and answers the exact positive difference', () => {
    for (const problem of everyProblem('sub-frac-diff-den')) {
      const data = operationData(problem)
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(operationValues(problem)).toEqual([
        String(data.leftNumerator),
        String(data.leftDenominator),
        String(data.rightNumerator),
        String(data.rightDenominator),
      ])
      expect(gcd(data.leftDenominator, data.rightDenominator)).toBe(1)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)
      expect(data.leftNumerator * data.rightDenominator).toBeGreaterThan(data.rightNumerator * data.leftDenominator)
      const common = data.leftDenominator * data.rightDenominator
      expect(exact(problem)).toEqual(
        rational(data.leftNumerator * data.rightDenominator - data.rightNumerator * data.leftDenominator, common),
      )
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({
        allowFraction: true,
        allowNegative: true,
      })
    }
  })

  it('diagnoses the flipped subtraction and the added-instead mistake', () => {
    for (const problem of everyProblem('sub-frac-diff-den')) {
      const data = operationData(problem)
      const common = data.leftDenominator * data.rightDenominator
      const left = data.leftNumerator * data.rightDenominator
      const right = data.rightNumerator * data.leftDenominator

      expect(diagnose(problem, `${right - left}/${common}`)?.tag).toBe('flipped-order')
      expect(diagnose(problem, `${left + right}/${common}`)?.tag).toBe('added-instead')
    }
  })
})

describe('improper-to-mixed', () => {
  it('displays the source improper fraction and requires the mixed form', () => {
    for (const problem of everyProblem('improper-to-mixed')) {
      const data = fractionData(problem)
      if (data.operation !== 'improper-to-mixed') throw new Error('expected conversion data')
      if (problem.display.kind !== 'math') throw new Error('expected math display')

      expect(fractionValues(problem.display.notation)).toEqual([String(data.numerator), String(data.denominator)])
      expect(data.numerator).toBeGreaterThan(data.denominator)
      const whole = Math.floor(data.numerator / data.denominator)
      const remainder = data.numerator % data.denominator
      expect(whole).toBeGreaterThanOrEqual(1)
      expect(remainder).toBeGreaterThanOrEqual(1)
      expect(problem.answer).toEqual({
        kind: 'exact',
        n: data.numerator,
        d: data.denominator,
        requireMixed: true,
        requireSimplified: true,
      })
      expect(problem.keypad).toEqual({ allowMixed: true })
    }
  })

  it('accepts the reduced mixed form and answers the improper form as not-mixed', () => {
    for (const problem of everyProblem('improper-to-mixed')) {
      const data = fractionData(problem)
      if (data.operation !== 'improper-to-mixed') throw new Error('expected conversion data')
      const whole = Math.floor(data.numerator / data.denominator)
      const remainder = data.numerator % data.denominator
      const factor = gcd(data.numerator, data.denominator)

      expect(checkAnswer(problem.answer, `${whole} ${remainder / factor}/${data.denominator / factor}`).status).toBe(
        'correct',
      )
      expect(checkAnswer(problem.answer, `${data.numerator}/${data.denominator}`).status).toBe('not-mixed')
    }
  })

  it('answers a reducible source with the lowest-terms response, not a form question', () => {
    const reducible = everyProblem('improper-to-mixed').filter((problem) => {
      const data = fractionData(problem)
      if (data.operation !== 'improper-to-mixed') throw new Error('expected conversion data')
      return gcd(data.numerator, data.denominator) > 1
    })
    expect(reducible.length).toBeGreaterThan(0)

    for (const problem of reducible) {
      const data = fractionData(problem)
      if (data.operation !== 'improper-to-mixed') throw new Error('expected conversion data')
      const whole = Math.floor(data.numerator / data.denominator)
      const remainder = data.numerator % data.denominator
      // The unreduced mixed form has the right value and a genuine whole part;
      // only the reduction is missing.
      expect(checkAnswer(problem.answer, `${whole} ${remainder}/${data.denominator}`).status).toBe('not-simplified')
    }
  })

  it('diagnoses both conversion mistakes where their values survive the filter', () => {
    const seen = new Set<string>()
    for (const problem of everyProblem('improper-to-mixed')) {
      const data = fractionData(problem)
      if (data.operation !== 'improper-to-mixed') throw new Error('expected conversion data')
      const whole = Math.floor(data.numerator / data.denominator)
      const remainder = data.numerator % data.denominator

      // The swapped prediction equals the correct value when the quotient and
      // remainder coincide (e.g. 10/4 → 2 2/4), so the central filter drops it
      // there; assert each prediction where it survives, and both somewhere.
      const tags = new Set(problem.misconceptions?.map(({ tag }) => tag) ?? [])
      if (tags.has('quotient-remainder-swapped')) {
        expect(diagnose(problem, `${remainder} ${whole}/${data.denominator}`)?.tag).toBe('quotient-remainder-swapped')
        seen.add('quotient-remainder-swapped')
      }
      if (tags.has('whole-with-original-fraction')) {
        expect(diagnose(problem, `${whole} ${data.numerator}/${data.denominator}`)?.tag).toBe(
          'whole-with-original-fraction',
        )
        seen.add('whole-with-original-fraction')
      }
    }
    expect(seen).toEqual(new Set(['quotient-remainder-swapped', 'whole-with-original-fraction']))
  })
})

describe('mixed-to-improper', () => {
  it('displays a reduced mixed number and derives its exact improper fraction', () => {
    for (const problem of everyProblem('mixed-to-improper')) {
      const data = fractionData(problem)
      if (data.operation !== 'mixed-to-improper') throw new Error('expected mixed conversion data')

      expect(gcd(data.numerator, data.denominator)).toBe(1)
      expect(exact(problem)).toEqual(rational(data.whole * data.denominator + data.numerator, data.denominator))
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('diagnoses omitting the numerator and multiplying by the wrong part', () => {
    for (const problem of everyProblem('mixed-to-improper')) {
      const data = fractionData(problem)
      if (data.operation !== 'mixed-to-improper') throw new Error('expected mixed conversion data')

      expect(diagnose(problem, String(data.whole))?.tag).toBe('dropped-numerator')
      expect(diagnose(problem, `${data.whole * data.numerator}/${data.denominator}`)?.tag).toBe(
        'multiplied-by-numerator',
      )
    }
  })
})

describe('add-mixed', () => {
  it('adds every displayed whole and fraction part into a reduced mixed answer', () => {
    for (const problem of everyProblem('add-mixed')) {
      const data = mixedOperationData(problem)
      if (data.operation !== 'add-mixed') throw new Error('expected mixed addition data')
      const denominator = data.leftDenominator
      const numerator =
        (data.leftWhole + data.rightWhole) * denominator + data.leftNumerator + data.rightNumerator

      expect(data.rightDenominator).toBe(denominator)
      expect(exact(problem)).toEqual(rational(numerator, denominator))
      expect(problem.answer).toMatchObject({ requireMixed: true, requireSimplified: true })
      expect(problem.keypad).toEqual({ allowMixed: true })
      expect(gcd(numerator, denominator)).toBe(1)
    }
  })

  it('covers no-carry work low and carry work high', () => {
    const problems = everyProblem('add-mixed')
    for (const problem of problems.filter(({ difficulty }) => difficulty <= 2)) {
      const data = mixedOperationData(problem)
      expect(data.leftNumerator + data.rightNumerator).toBeLessThan(data.leftDenominator)
    }
    for (const problem of problems.filter(({ difficulty }) => difficulty >= 4)) {
      const data = mixedOperationData(problem)
      expect(data.leftNumerator + data.rightNumerator).toBeGreaterThan(data.leftDenominator)
    }
  })

  it('uses the mixed-form response for an unregrouped fractional part', () => {
    for (const problem of everyProblem('add-mixed').filter(({ difficulty }) => difficulty >= 4)) {
      const data = mixedOperationData(problem)
      const whole = data.leftWhole + data.rightWhole
      const numerator = data.leftNumerator + data.rightNumerator
      expect(checkAnswer(problem.answer, `${whole} ${numerator}/${data.leftDenominator}`).status).toBe('not-mixed')
    }
  })

  it('diagnoses answers containing only the whole or fractional sum', () => {
    for (const problem of everyProblem('add-mixed')) {
      const data = mixedOperationData(problem)
      expect(diagnose(problem, String(data.leftWhole + data.rightWhole))?.tag).toBe('added-wholes-only')
      expect(
        diagnose(problem, `${data.leftNumerator + data.rightNumerator}/${data.leftDenominator}`)?.tag,
      ).toBe('added-fractions-only')
    }
  })
})

describe('sub-mixed', () => {
  it('borrows on every draw and derives a positive reduced mixed answer', () => {
    for (const problem of everyProblem('sub-mixed')) {
      const data = mixedOperationData(problem)
      if (data.operation !== 'sub-mixed') throw new Error('expected mixed subtraction data')
      const denominator = data.leftDenominator
      const numerator =
        (data.leftWhole - data.rightWhole) * denominator + data.leftNumerator - data.rightNumerator

      expect(data.rightDenominator).toBe(denominator)
      expect(data.leftNumerator).toBeLessThan(data.rightNumerator)
      expect(data.leftWhole - data.rightWhole).toBeGreaterThanOrEqual(2)
      expect(exact(problem)).toEqual(rational(numerator, denominator))
      expect(exact(problem).n).toBeGreaterThan(exact(problem).d)
      expect(gcd(numerator, denominator)).toBe(1)
      expect(problem.answer).toMatchObject({ requireMixed: true, requireSimplified: true })
      expect(problem.keypad).toEqual({ allowMixed: true })
    }
  })

  it('keeps both positive borrowing predictions distinct and diagnosable', () => {
    for (const problem of everyProblem('sub-mixed')) {
      const data = mixedOperationData(problem)
      const denominator = data.leftDenominator
      const gap = data.leftWhole - data.rightWhole
      const reversed = gap * denominator + data.rightNumerator - data.leftNumerator
      const onePiece = (gap - 1) * denominator + data.leftNumerator + 1 - data.rightNumerator

      expect(reversed).toBeGreaterThan(0)
      expect(onePiece).toBeGreaterThan(0)
      expect(problem.misconceptions?.map(({ tag }) => tag)).toEqual([
        'reversed-fraction-without-borrowing',
        'borrowed-one-piece',
      ])
      expect(diagnose(problem, `${reversed}/${denominator}`)?.tag).toBe(
        'reversed-fraction-without-borrowing',
      )
      expect(diagnose(problem, `${onePiece}/${denominator}`)?.tag).toBe('borrowed-one-piece')
    }
  })
})

describe('mult-fractions', () => {
  it('multiplies reduced proper fractions straight across', () => {
    for (const problem of everyProblem('mult-fractions')) {
      const data = productData(problem)
      if (data.operation !== 'multiply') throw new Error('expected multiplication data')

      expect(data.leftNumerator).toBeLessThan(data.leftDenominator)
      expect(data.rightNumerator).toBeLessThan(data.rightDenominator)
      expect(gcd(data.leftNumerator, data.leftDenominator)).toBe(1)
      expect(gcd(data.rightNumerator, data.rightDenominator)).toBe(1)
      expect(exact(problem)).toEqual(
        rational(data.leftNumerator * data.rightNumerator, data.leftDenominator * data.rightDenominator),
      )
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('diagnoses addition and keeping one denominator where each survives', () => {
    const seen = new Set<string>()
    for (const problem of everyProblem('mult-fractions')) {
      const data = productData(problem)
      const tags = new Set(problem.misconceptions?.map(({ tag }) => tag) ?? [])
      if (tags.has('added-instead')) {
        expect(
          diagnose(
            problem,
            `${data.leftNumerator + data.rightNumerator}/${data.leftDenominator + data.rightDenominator}`,
          )?.tag,
        ).toBe('added-instead')
        seen.add('added-instead')
      }
      if (tags.has('kept-one-denominator')) {
        expect(diagnose(problem, `${data.leftNumerator * data.rightNumerator}/${data.leftDenominator}`)?.tag).toBe(
          'kept-one-denominator',
        )
        seen.add('kept-one-denominator')
      }
    }
    expect(seen).toEqual(new Set(['added-instead', 'kept-one-denominator']))
  })
})

describe('div-fractions', () => {
  it('keeps the first fraction, flips the unequal second, and divides exactly', () => {
    for (const problem of everyProblem('div-fractions')) {
      const data = productData(problem)
      if (data.operation !== 'divide') throw new Error('expected division data')

      expect(data.leftNumerator * data.rightDenominator).not.toBe(
        data.rightNumerator * data.leftDenominator,
      )
      expect(exact(problem)).toEqual(
        rational(data.leftNumerator * data.rightDenominator, data.leftDenominator * data.rightNumerator),
      )
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('keeps both wall predictions distinct and diagnosable on every draw', () => {
    for (const problem of everyProblem('div-fractions')) {
      const data = productData(problem)
      const flippedFirstNumerator = data.leftDenominator * data.rightNumerator
      const flippedFirstDenominator = data.leftNumerator * data.rightDenominator
      const straightNumerator = data.leftNumerator * data.rightNumerator
      const straightDenominator = data.leftDenominator * data.rightDenominator

      expect(problem.misconceptions?.map(({ tag }) => tag)).toEqual([
        'flipped-first',
        'multiplied-without-flip',
      ])
      expect(diagnose(problem, `${flippedFirstNumerator}/${flippedFirstDenominator}`)?.tag).toBe('flipped-first')
      expect(diagnose(problem, `${straightNumerator}/${straightDenominator}`)?.tag).toBe(
        'multiplied-without-flip',
      )
    }
  })
})

const mixedDenominatorBounds: Record<Difficulty, readonly [number, number]> = {
  1: [3, 5],
  2: [4, 6],
  3: [5, 8],
  4: [6, 10],
  5: [8, 12],
}

const productDenominatorBounds: Record<Difficulty, readonly [number, number]> = {
  1: [2, 4],
  2: [2, 5],
  3: [3, 7],
  4: [4, 9],
  5: [6, 12],
}

describe('new fraction-operation draw bounds', () => {
  it('keeps mixed conversion inside its denominator ladder', () => {
    for (const problem of everyProblem('mixed-to-improper')) {
      const data = fractionData(problem)
      if (data.operation !== 'mixed-to-improper') throw new Error('expected mixed conversion data')
      const [min, max] = denominatorBounds[problem.difficulty]
      expect(data.denominator).toBeGreaterThanOrEqual(min)
      expect(data.denominator).toBeLessThanOrEqual(max)
    }
  })

  it('keeps mixed arithmetic inside its denominator ladder', () => {
    for (const skillId of ['add-mixed', 'sub-mixed']) {
      for (const problem of everyProblem(skillId)) {
        const data = mixedOperationData(problem)
        const [min, max] = mixedDenominatorBounds[problem.difficulty]
        expect(data.leftDenominator).toBeGreaterThanOrEqual(min)
        expect(data.leftDenominator).toBeLessThanOrEqual(max)
      }
    }
  })

  it('keeps multiplication and division inside their denominator ladder', () => {
    for (const skillId of ['mult-fractions', 'div-fractions']) {
      for (const problem of everyProblem(skillId)) {
        const data = productData(problem)
        const [min, max] = productDenominatorBounds[problem.difficulty]
        expect(data.leftDenominator).toBeGreaterThanOrEqual(min)
        expect(data.leftDenominator).toBeLessThanOrEqual(max)
        expect(data.rightDenominator).toBeGreaterThanOrEqual(min)
        expect(data.rightDenominator).toBeLessThanOrEqual(max)
      }
    }
  })
})

describe('fraction-words', () => {
  const wholeBounds: Record<Difficulty, readonly [number, number]> = {
    1: [4, 8],
    2: [6, 12],
    3: [10, 18],
    4: [16, 26],
    5: [24, 40],
  }

  it('carries a proper part and whole and answers with their exact fraction', () => {
    for (const problem of everyProblem('fraction-words')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected a fraction story')
      const [part, whole] = problem.display.operands
      const [min, max] = wholeBounds[problem.difficulty]

      expect(problem.display.operator).toBe('÷')
      expect(part).toBeGreaterThan(0)
      expect(part).toBeLessThan(whole)
      expect(whole).toBeGreaterThanOrEqual(min)
      expect(whole).toBeLessThanOrEqual(max)
      expect(exact(problem)).toEqual(rational(part, whole))
      expect(problem.answer).toMatchObject({ requireSimplified: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
    }
  })

  it('keeps prose, operands, and all three frame-owned diagnoses aligned', () => {
    for (const problem of everyProblem('fraction-words')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected a fraction story')
      const [part, whole] = problem.display.operands
      const numbers = problem.display.text.match(/\d+/g)?.map(Number) ?? []
      const distractor = numbers[2]

      expect(numbers.slice(0, 2)).toEqual([whole, part])
      expect(distractor).toBeGreaterThan(1)
      expect(distractor).not.toBe(whole)
      expect(problem.misconceptions?.map(({ tag }) => tag)).toEqual([
        'wrong-operation',
        'distractor-pair',
        'answered-part',
      ])
      expect(diagnose(problem, String(part * whole))?.tag).toBe('wrong-operation')
      expect(diagnose(problem, `${part}/${distractor}`)?.tag).toBe('distractor-pair')
      expect(diagnose(problem, String(part))?.tag).toBe('answered-part')
    }
  })

  it('draws every authored frame across the sampled problems', () => {
    const prompts = new Set(everyProblem('fraction-words').map(({ prompt }) => prompt))
    expect(prompts.size).toBeGreaterThanOrEqual(8)
  })
})

describe('the fraction-operation unit', () => {
  it('uses the intended input mode for every skill', () => {
    expect(unit08.map((skill) => `${skill.id} ${everyProblem(skill.id)[0].inputMode}`)).toEqual([
      'add-frac-same-den keypad',
      'sub-frac-same-den keypad',
      'common-denominator keypad',
      'add-frac-diff-den keypad',
      'sub-frac-diff-den keypad',
      'improper-to-mixed keypad',
      'mixed-to-improper keypad',
      'add-mixed keypad',
      'sub-mixed keypad',
      'mult-fractions keypad',
      'div-fractions keypad',
      'fraction-words keypad',
    ])
  })

  it('renders every field the generators set', () => {
    expect(unrenderedKeys(unit08)).toEqual([])
  })

  it('widens each skill from difficulty one to five', () => {
    const magnitude = (problem: Problem) => {
      if (problem.display.kind === 'story' && problem.display.operands) {
        return problem.display.operands.reduce((sum, value) => sum + value, 0) / problem.display.operands.length
      }
      if (problem.display.kind !== 'math' || !problem.display.fraction) {
        throw new Error('expected fraction operation data')
      }
      const data = problem.display.fraction
      let values: number[]
      switch (data.operation) {
        case 'add':
        case 'sub':
        case 'common-denominator':
        case 'multiply':
        case 'divide':
          values = [data.leftNumerator, data.leftDenominator, data.rightNumerator, data.rightDenominator]
          break
        case 'improper-to-mixed':
          values = [data.numerator, data.denominator]
          break
        case 'mixed-to-improper':
          values = [data.whole, data.numerator, data.denominator]
          break
        case 'add-mixed':
        case 'sub-mixed':
          values = [
            data.leftWhole,
            data.leftNumerator,
            data.leftDenominator,
            data.rightWhole,
            data.rightNumerator,
            data.rightDenominator,
          ]
          break
        default:
          throw new Error(`unexpected unit-8 operation: ${data.operation}`)
      }
      return values.reduce((sum, value) => sum + value, 0) / values.length
    }

    const flat = unit08
      .filter((skill) => {
        const low = everyProblem(skill.id).filter((problem) => problem.difficulty === 1)
        const high = everyProblem(skill.id).filter((problem) => problem.difficulty === 5)
        const lowMean = low.reduce((sum, problem) => sum + magnitude(problem), 0) / low.length
        const highMean = high.reduce((sum, problem) => sum + magnitude(problem), 0) / high.length
        return highMean > lowMean
      })
      .map((skill) => skill.id)

    expect(flat).toEqual(unit08.map((skill) => skill.id))
  })

  it('records every problem without throwing', () => {
    expect(() => {
      for (const skill of unit08) {
        format(generateOne(skill), 1)
      }
    }).not.toThrow()
  })
})

import { generateProblem } from '../lib/generator'

function generateOne(skill: (typeof unit08)[number]): Problem {
  return generateProblem(skill, 1, 1)
}
