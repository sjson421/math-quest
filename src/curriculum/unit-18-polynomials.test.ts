import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { canonicalForm } from '../lib/expression'
import { diagnose, generateProblem } from '../lib/generator'
import { applyExpressionKey, applyKey } from '../lib/keypad'
import { format as formatRational, gcd, rational } from '../lib/rational'
import { encodeRootPairEntry, rootPairsEqual } from '../lib/root-pair'
import type { Difficulty, PolynomialData, Problem, RootPairValue } from '../lib/types'
import { sample, unrenderedKeys } from './recorded-output'
import { unit18 } from './unit-18-polynomials'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()

const problems = (id: string): Problem[] => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit18.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 18 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const displayOf = (problem: Problem) => {
  if (problem.display.kind !== 'story' || !problem.display.polynomial) {
    throw new Error(`${problem.skillId}: expected a polynomial story display`)
  }
  return problem.display
}

const polynomialOf = (problem: Problem): PolynomialData => {
  const display = problem.display
  if (
    (display.kind !== 'story' && display.kind !== 'equation' && display.kind !== 'math') ||
    !display.polynomial
  ) {
    throw new Error(`${problem.skillId}: expected polynomial operation data`)
  }
  return display.polynomial
}

const dataOf = <K extends PolynomialData['operation']>(problem: Problem, operation: K) => {
  const data = polynomialOf(problem)
  if (data.operation !== operation) throw new Error(`${problem.skillId}: expected ${operation}`)
  return data as Extract<PolynomialData, { operation: K }>
}

const answerOf = (problem: Problem) => {
  if (problem.answer.kind !== 'expression') throw new Error(`${problem.skillId}: expected expression answer`)
  return problem.answer
}

const body = (coefficient: number, degree: 0 | 1 | 2): string => {
  const magnitude = Math.abs(coefficient)
  const variable = degree === 2 ? 'x²' : degree === 1 ? 'x' : ''
  if (degree === 0) return String(magnitude)
  return magnitude === 1 ? variable : `${magnitude}${variable}`
}

const compact = (coefficients: { quadratic: number; linear: number; constant: number }): string => {
  const entries = [
    [coefficients.quadratic, 2 as const],
    [coefficients.linear, 1 as const],
    [coefficients.constant, 0 as const],
  ].filter(([coefficient]) => coefficient !== 0) as Array<[number, 0 | 1 | 2]>
  if (entries.length === 0) return '0'
  return entries.reduce((text, [coefficient, degree], index) => {
    const value = body(coefficient, degree)
    if (index === 0) return coefficient < 0 ? `-${value}` : value
    return `${text}${coefficient < 0 ? '-' : '+'}${value}`
  }, '')
}

const polynomialAnswer = (data: PolynomialData): string => {
  switch (data.operation) {
    case 'add':
      return compact({
        quadratic: data.left.quadratic + data.right.quadratic,
        linear: data.left.linear + data.right.linear,
        constant: data.left.constant + data.right.constant,
      })
    case 'sub':
      return compact({
        quadratic: data.left.quadratic - data.right.quadratic,
        linear: data.left.linear - data.right.linear,
        constant: data.left.constant - data.right.constant,
      })
    case 'mult-monomial':
      return compact({
        quadratic: data.outerCoefficient * data.innerLinear,
        linear: data.outerCoefficient * data.innerConstant,
        constant: 0,
      })
    case 'foil':
      return compact({
        quadratic: 1,
        linear: data.leftConstant + data.rightConstant,
        constant: data.leftConstant * data.rightConstant,
      })
    case 'factor-gcf-poly': {
      const factor = gcd(Math.abs(data.quadratic), Math.abs(data.linear))
      return `${factor}x(${compact({
        quadratic: 0,
        linear: data.quadratic / factor,
        constant: data.linear / factor,
      })})`
    }
    case 'factor-trinomial': {
      for (let first = -100; first <= 100; first += 1) {
        if (first === 0 || data.constant % first !== 0) continue
        const second = data.constant / first
        if (first + second === data.linear) return `(x${first < 0 ? '-' : '+'}${Math.abs(first)})(x${second < 0 ? '-' : '+'}${Math.abs(second)})`
      }
      throw new Error('no factor pair')
    }
    case 'difference-of-squares':
      return `(x-${data.squareRoot})(x+${data.squareRoot})`
    case 'factored-zero':
    case 'quadratic-formula':
      throw new Error(`${data.operation}: not an expression answer`)
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled polynomial operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

const sourceValues = (data: PolynomialData): number[] => {
  switch (data.operation) {
    case 'add':
    case 'sub':
      return [
        data.left.quadratic,
        data.left.linear,
        data.left.constant,
        data.right.quadratic,
        data.right.linear,
        data.right.constant,
      ]
    case 'mult-monomial':
      return [data.outerCoefficient, data.innerLinear, data.innerConstant]
    case 'foil':
      return [data.leftConstant, data.rightConstant]
    case 'factor-gcf-poly':
      return [data.quadratic, data.linear]
    case 'factor-trinomial':
      return [data.linear, data.constant]
    case 'difference-of-squares':
      return [data.squareRoot]
    case 'factored-zero':
      return [data.firstConstant, data.secondConstant]
    case 'quadratic-formula':
      return [data.a, data.b, data.c]
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled polynomial operation: ${JSON.stringify(unhandled)}`)
    }
  }
}

const meanAt = (id: string, difficulty: Difficulty): number => {
  const values = problems(id)
    .filter((problem) => problem.difficulty === difficulty)
    .map((problem) => sourceValues(polynomialOf(problem)))
    .flat()
  return values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
}

const predictionText = (value: string): string => {
  let typed = ''
  for (const key of value) typed = applyExpressionKey(typed, key, 'x', 2, 80)
  return typed
}

const rootAnswerOf = (problem: Problem): RootPairValue => {
  if (problem.answer.kind !== 'root-pair') throw new Error(`${problem.skillId}: expected root-pair answer`)
  return problem.answer
}

const rootEntry = (problem: Problem, pair: RootPairValue, reverse = false): string => {
  const roots = reverse ? [pair.roots[1], pair.roots[0]] : pair.roots
  const typed = roots.map((root) => {
    let entry = ''
    for (const key of formatRational(root)) entry = applyKey(entry, key, problem.keypad)
    return entry
  }) as [string, string]
  return encodeRootPairEntry(typed)
}

describe.each(unit18.map((skill) => [skill.id, skill] as const))('Unit 18 recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

describe('Unit 18 shared expression contract', () => {
  it('keeps every generated answer in the bounded quadratic expression surface', () => {
    for (const skill of unit18.filter((candidate) => !['solve-by-factoring', 'quadratic-formula'].includes(candidate.id))) {
      for (const problem of problems(skill.id)) {
        const answer = answerOf(problem)
        expect(problem.inputMode).toBe('expression')
        expect(answer.variable).toBe('x')
        expect(answer.maxDegree).toBe(2)
        expect(displayOf(problem).text.length).toBeGreaterThan(0)
      }
    }
  })

  it('makes every text prediction enterable, wrong, and diagnosable', () => {
    for (const skill of unit18) {
      for (const problem of problems(skill.id)) {
        for (const misconception of problem.misconceptions ?? []) {
          if (typeof misconception.value !== 'object' || misconception.value.kind !== 'text') continue
          const typed = predictionText(misconception.value.value)
          expect(typed, `${problem.skillId}: ${misconception.tag}`).toBe(misconception.value.value)
          expect(checkAnswer(problem.answer, typed).status, `${problem.skillId}: ${misconception.tag}`).toBe('incorrect')
          expect(diagnose(problem, typed)?.tag, `${problem.skillId}: ${misconception.tag}`).toBe(misconception.tag)
        }
      }
    }
  })

  it('records every generated field', () => {
    expect(unrenderedKeys(unit18)).toEqual([])
  })

  it('grows source magnitude with difficulty for every skill', () => {
    for (const skill of unit18) expect(meanAt(skill.id, 5)).toBeGreaterThan(meanAt(skill.id, 1))
  })
})

describe('add-polynomials', () => {
  it('adds every matching degree from its two visible sources', () => {
    for (const problem of problems('add-polynomials')) {
      const data = dataOf(problem, 'add')
      expect(answerOf(problem).form).toBe('expanded')
      expect(answerOf(problem).canonical).toBe(polynomialAnswer(data))
      expect(canonicalForm(displayOf(problem).text, 'x', 'expanded', 2)).toBe(
        canonicalForm(answerOf(problem).canonical, 'x', 'expanded', 2),
      )
    }
  })
})

describe('sub-polynomials', () => {
  it('subtracts all three degrees and reaches both sign directions', () => {
    const signs = new Set<string>()
    for (const problem of problems('sub-polynomials')) {
      const data = dataOf(problem, 'sub')
      const answer = answerOf(problem)
      expect(answer.form).toBe('expanded')
      expect(answer.canonical).toBe(polynomialAnswer(data))
      signs.add(answer.canonical.startsWith('-') ? 'negative' : 'positive')
      expect(problem.misconceptions?.map((misconception) => misconception.tag)).toEqual([
        'subtracted-first-term-only',
        'added-polynomials',
      ])
    }
    expect(signs).toEqual(new Set(['positive', 'negative']))
  })
})

describe('mult-monomial', () => {
  it('distributes the x-bearing monomial into a quadratic and a linear term', () => {
    for (const problem of problems('mult-monomial')) {
      const data = dataOf(problem, 'mult-monomial')
      expect(answerOf(problem).canonical).toBe(polynomialAnswer(data))
      expect(answerOf(problem).canonical).toContain('x²')
      expect(answerOf(problem).canonical).toContain('x')
    }
  })
})

describe('foil', () => {
  it('covers positive, negative, and opposite-sign binomial families', () => {
    const families = new Set<string>()
    for (const problem of problems('foil')) {
      const data = dataOf(problem, 'foil')
      const signs = [Math.sign(data.leftConstant), Math.sign(data.rightConstant)].sort().join(',')
      families.add(signs)
      expect(answerOf(problem).canonical).toBe(polynomialAnswer(data))
    }
    expect(families).toEqual(new Set(['-1,-1', '-1,1', '1,1']))
  })
})

describe('factor-gcf-poly', () => {
  it('takes out the unique greatest numeric and variable factors', () => {
    for (const problem of problems('factor-gcf-poly')) {
      const data = dataOf(problem, 'factor-gcf-poly')
      const factor = gcd(Math.abs(data.quadratic), Math.abs(data.linear))
      expect(factor).toBeGreaterThan(1)
      expect(gcd(Math.abs(data.quadratic / factor), Math.abs(data.linear / factor))).toBe(1)
      expect(answerOf(problem).form).toBe('exact')
      expect(answerOf(problem).canonical).toBe(polynomialAnswer(data))
      expect(checkAnswer(answerOf(problem), compact({ quadratic: data.quadratic, linear: data.linear, constant: 0 })).status).toBe('incorrect')
    }
  })
})

describe('factor-trinomial', () => {
  it('finds one product-and-sum pair and accepts reversed factors', () => {
    const families = new Set<string>()
    for (const problem of problems('factor-trinomial')) {
      const data = dataOf(problem, 'factor-trinomial')
      const pair = answerOf(problem).canonical.match(/x([+-]\d+)\)\(x([+-]\d+)/)
      if (!pair) throw new Error(`unexpected factor answer ${answerOf(problem).canonical}`)
      const first = Number(pair[1])
      const second = Number(pair[2])
      families.add(first > 0 && second > 0 ? 'positive' : first < 0 && second < 0 ? 'negative' : 'opposite')
      expect(first + second).toBe(data.linear)
      expect(first * second).toBe(data.constant)
      expect(answerOf(problem).form).toBe('exact')
      const reversed = `(x${second < 0 ? '' : '+'}${second})(x${first < 0 ? '' : '+'}${first})`
      expect(checkAnswer(answerOf(problem), reversed).status).toBe('correct')
      expect(checkAnswer(answerOf(problem), displayOf(problem).text.replaceAll('−', '-')).status).toBe('incorrect')
    }
    expect(families).toEqual(new Set(['positive', 'negative', 'opposite']))
  })
})

describe('difference-of-squares', () => {
  it('derives conjugate factors from the visible perfect square', () => {
    for (const problem of problems('difference-of-squares')) {
      const data = dataOf(problem, 'difference-of-squares')
      const answer = answerOf(problem)
      expect(displayOf(problem).text).toBe(`x² − ${data.squareRoot * data.squareRoot}`)
      expect(answer.canonical).toBe(polynomialAnswer(data))
      expect(answer.form).toBe('exact')
      expect(checkAnswer(answer, `(x+${data.squareRoot})(x-${data.squareRoot})`).status).toBe('correct')
      expect(checkAnswer(answer, `x²-${data.squareRoot * data.squareRoot}`).status).toBe('incorrect')
      expect(problem.misconceptions?.map((misconception) => misconception.tag)).toEqual([
        'used-same-sign',
        'used-square-not-root',
      ])
    }
  })

  it('grows the square root and varies seeded frames', () => {
    expect(meanAt('difference-of-squares', 5)).toBeGreaterThan(meanAt('difference-of-squares', 1))
    expect(new Set(problems('difference-of-squares').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
  })
})

describe('solve-by-factoring', () => {
  it('recovers two exact roots from distinct visible factors in either order', () => {
    const families = new Set<string>()
    for (const problem of problems('solve-by-factoring')) {
      const data = dataOf(problem, 'factored-zero')
      if (problem.display.kind !== 'equation') throw new Error('expected equation display')
      expect(data.firstConstant).not.toBe(0)
      expect(data.secondConstant).not.toBe(0)
      expect(data.firstConstant).not.toBe(data.secondConstant)
      expect(data.firstConstant + data.secondConstant).not.toBe(0)
      expect(problem.display.text).toBe(
        `(${data.firstConstant < 0 ? `x − ${Math.abs(data.firstConstant)}` : `x + ${data.firstConstant}`})` +
        `(${data.secondConstant < 0 ? `x − ${Math.abs(data.secondConstant)}` : `x + ${data.secondConstant}`}) = 0`,
      )
      const expected: RootPairValue = {
        kind: 'root-pair',
        roots: [rational(-data.firstConstant, 1), rational(-data.secondConstant, 1)],
      }
      expect(rootPairsEqual(rootAnswerOf(problem), expected)).toBe(true)
      expect(checkAnswer(problem.answer, rootEntry(problem, expected)).status).toBe('correct')
      expect(checkAnswer(problem.answer, rootEntry(problem, expected, true)).status).toBe('correct')
      families.add(
        data.firstConstant > 0 && data.secondConstant > 0
          ? 'positive'
          : data.firstConstant < 0 && data.secondConstant < 0
            ? 'negative'
            : 'mixed',
      )
    }
    expect(families).toEqual(new Set(['positive', 'mixed', 'negative']))
  })

  it('keeps both predicted pairs reachable and diagnosable', () => {
    for (const problem of problems('solve-by-factoring')) {
      expect(problem.keypad).toEqual({ allowNegative: true })
      expect(problem.misconceptions).toHaveLength(2)
      for (const misconception of problem.misconceptions ?? []) {
        if (typeof misconception.value !== 'object' || misconception.value.kind !== 'root-pair') {
          throw new Error('expected root-pair prediction')
        }
        const entry = rootEntry(problem, misconception.value)
        expect(checkAnswer(problem.answer, entry).status).toBe('incorrect')
        expect(diagnose(problem, entry)?.tag).toBe(misconception.tag)
      }
    }
  })
})

describe('quadratic-formula', () => {
  it('recomputes exact roots from normalized visible coefficients', () => {
    for (const problem of problems('quadratic-formula')) {
      const data = dataOf(problem, 'quadratic-formula')
      const discriminant = data.b * data.b - 4 * data.a * data.c
      const squareRoot = Math.sqrt(discriminant)
      expect([data.a, data.b, data.c].every((value) => value !== 0)).toBe(true)
      expect(gcd(gcd(Math.abs(data.a), Math.abs(data.b)), Math.abs(data.c))).toBe(1)
      expect(discriminant).toBeGreaterThan(0)
      expect(Number.isInteger(squareRoot)).toBe(true)
      const expected: RootPairValue = {
        kind: 'root-pair',
        roots: [
          rational(-data.b - squareRoot, 2 * data.a),
          rational(-data.b + squareRoot, 2 * data.a),
        ],
      }
      expect(expected.roots.every((root) => root.n !== 0)).toBe(true)
      expect(rootPairsEqual(rootAnswerOf(problem), expected)).toBe(true)
      expect(checkAnswer(problem.answer, rootEntry(problem, expected, true)).status).toBe('correct')
    }
  })

  it('keeps formula, label, prompt, keys, and diagnoses aligned', () => {
    for (const problem of problems('quadratic-formula')) {
      const data = dataOf(problem, 'quadratic-formula')
      if (problem.display.kind !== 'math') throw new Error('expected math display')
      expect(problem.display.label).toBe(
        'x equals negative b plus or minus the square root of b squared minus four a c, all over two a',
      )
      expect(JSON.stringify(problem.display.notation)).toContain('superscript')
      expect(JSON.stringify(problem.display.notation)).toContain('root')
      expect(JSON.stringify(problem.display.notation)).toContain('fraction')
      expect(problem.prompt).toContain(`a = ${data.a}, b = ${String(data.b).replace('-', '−')}, c = ${String(data.c).replace('-', '−')}`)
      const pairs = [rootAnswerOf(problem), ...(problem.misconceptions ?? []).map((misconception) => {
        if (typeof misconception.value !== 'object' || misconception.value.kind !== 'root-pair') {
          throw new Error('expected root-pair prediction')
        }
        return misconception.value
      })]
      expect(problem.keypad?.allowNegative).toBe(pairs.some((pair) => pair.roots.some((root) => root.n < 0)))
      expect(problem.keypad?.allowFraction).toBe(pairs.some((pair) => pair.roots.some((root) => root.d > 1)))
      expect(problem.misconceptions?.map((misconception) => misconception.tag)).toEqual([
        'used-positive-b',
        'divided-by-a',
      ])
      for (const misconception of problem.misconceptions ?? []) {
        if (typeof misconception.value !== 'object' || misconception.value.kind !== 'root-pair') continue
        const entry = rootEntry(problem, misconception.value, true)
        expect(checkAnswer(problem.answer, entry).status).toBe('incorrect')
        expect(diagnose(problem, entry)?.tag).toBe(misconception.tag)
      }
    }
  })

  it('moves from monic whole roots to non-monic rational roots', () => {
    const early = problems('quadratic-formula').filter((problem) => problem.difficulty <= 2)
    const later = problems('quadratic-formula').filter((problem) => problem.difficulty >= 3)
    expect(early.every((problem) => {
      const data = dataOf(problem, 'quadratic-formula')
      return data.a === 1 && rootAnswerOf(problem).roots.every((root) => root.d === 1)
    })).toBe(true)
    expect(later.every((problem) => {
      const data = dataOf(problem, 'quadratic-formula')
      return data.a > 1 && rootAnswerOf(problem).roots.some((root) => root.d > 1)
    })).toBe(true)
    expect(meanAt('quadratic-formula', 5)).toBeGreaterThan(meanAt('quadratic-formula', 1))
    expect(new Set(problems('quadratic-formula').map((problem) => JSON.stringify(problem.display))).size)
      .toBeGreaterThan(20)
  })
})
