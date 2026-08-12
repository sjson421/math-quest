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

describe('the six-skill unit', () => {
  it('uses the intended input mode for every skill', () => {
    expect(unit08.map((skill) => `${skill.id} ${everyProblem(skill.id)[0].inputMode}`)).toEqual([
      'add-frac-same-den keypad',
      'sub-frac-same-den keypad',
      'common-denominator keypad',
      'add-frac-diff-den keypad',
      'sub-frac-diff-den keypad',
      'improper-to-mixed keypad',
    ])
  })

  it('renders every field the generators set', () => {
    expect(unrenderedKeys(unit08)).toEqual([])
  })

  it('widens each skill from difficulty one to five', () => {
    const magnitude = (problem: Problem) => {
      if (problem.display.kind !== 'math' || !problem.display.fraction) {
        throw new Error('expected fraction operation data')
      }
      const data = problem.display.fraction
      const values =
        data.operation === 'add' || data.operation === 'sub' || data.operation === 'common-denominator'
          ? [data.leftNumerator, data.leftDenominator, data.rightNumerator, data.rightDenominator]
          : data.operation === 'improper-to-mixed'
            ? [data.numerator, data.denominator]
            : (() => {
                throw new Error(`unexpected unit-8 operation: ${data.operation}`)
              })()
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
