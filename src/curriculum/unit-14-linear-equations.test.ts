import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import type { Difficulty, Problem } from '../lib/types'
import { sample } from './recorded-output'
import { unit14 } from './unit-14-linear-equations'

describe.each(unit14.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit14.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 14 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const equationOf = (problem: Problem) => {
  if (problem.display.kind !== 'equation') throw new Error(`${problem.skillId}: expected an equation display`)
  return problem.display
}

const answerOf = (problem: Problem): number => {
  if (problem.answer.kind !== 'exact') throw new Error(`${problem.skillId}: expected an exact answer`)
  return problem.answer.n / problem.answer.d
}

/** Every predicted mistake that survived `generateProblem`'s filtering. */
const predicted = (problem: Problem): number[] =>
  (problem.misconceptions ?? []).map((m) => m.value).filter((v): v is number => typeof v === 'number')

describe('every Unit 14a skill', () => {
  it('displays an equation and answers on the keypad', () => {
    for (const skill of unit14) {
      for (const problem of problems(skill.id)) {
        expect(problem.display.kind, skill.id).toBe('equation')
        expect(problem.inputMode, skill.id).toBe('keypad')
      }
    }
  })

  it('answers with a whole number, never a fraction', () => {
    for (const skill of unit14) {
      const fractional = problems(skill.id).filter((p) => !Number.isInteger(answerOf(p)))
      expect(fractional.map((p) => equationOf(p).text), skill.id).toEqual([])
    }
  })

  it('predicts only whole numbers, so no diagnosis is dropped as unenterable', () => {
    // The gate nothing else in the suite provides. A fractional prediction is
    // finite, so `generateProblem` keeps it and `alwaysFiltered` counts it as
    // surviving — it is simply unenterable on a whole-number pad. Every
    // composition in this unit exists to keep its divisions exact, and this is
    // where that stops being an intention and becomes a check.
    for (const skill of unit14) {
      const fractional = problems(skill.id).flatMap((p) =>
        predicted(p).filter((v) => !Number.isInteger(v)).map((v) => `${skill.id}: ${equationOf(p).text} → ${v}`),
      )
      expect(fractional).toEqual([])
    }
  })

  it('offers the sign key exactly when a negative value is plausible', () => {
    for (const skill of unit14) {
      for (const problem of problems(skill.id)) {
        const plausible = answerOf(problem) < 0 || predicted(problem).some((v) => v < 0)
        expect(problem.keypad?.allowNegative ?? false, `${skill.id}: ${equationOf(problem).text}`).toBe(plausible)
      }
    }
  })

  it('draws the minus the learner reads, never the one they type', () => {
    // Unit 6's rule. `x − 15 = -10` shipped in a first draft of
    // `one-step-addsub` and was caught by the width measurement rather than by
    // a test, which is why this one exists.
    for (const skill of unit14) {
      const hyphenated = problems(skill.id)
        .map((p) => equationOf(p).text)
        .filter((text) => text.includes('-'))
      expect(hyphenated, skill.id).toEqual([])
    }
  })
})

describe('equation-balance', () => {
  it('shows a sum whose stated total already holds', () => {
    for (const problem of problems('equation-balance')) {
      const [left, right] = equationOf(problem).text.split(' = ')
      const [first, second] = left.split(' + ').map(Number)
      expect(first + second).toBe(Number(right))
    }
  })

  it('lands both sides on the same value after the change', () => {
    for (const problem of problems('equation-balance')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'balance') throw new Error('wrong payload')
      const { first, second, change, adds } = display.equation
      const total = first + second
      expect(answerOf(problem)).toBe(adds ? total + change : total - change)
    }
  })

  it('frames the slot for both sides rather than for a variable', () => {
    for (const problem of problems('equation-balance')) {
      expect(equationOf(problem).variable).toBe('each side')
    }
  })
})

describe('one-step-addsub', () => {
  it('undoes the displayed operation', () => {
    for (const problem of problems('one-step-addsub')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'one-step-addsub') throw new Error('wrong payload')
      const { constant, adds, rightHand } = display.equation
      expect(answerOf(problem)).toBe(adds ? rightHand - constant : rightHand + constant)
    }
  })

  it('predicts repeating the operation instead of reversing it', () => {
    for (const problem of problems('one-step-addsub')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'one-step-addsub') throw new Error('wrong payload')
      const { constant, adds, rightHand } = display.equation
      expect(predicted(problem)).toContain(adds ? rightHand + constant : rightHand - constant)
    }
  })
})

describe('one-step-multdiv', () => {
  it('undoes the displayed operation in either family', () => {
    for (const problem of problems('one-step-multdiv')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'one-step-multdiv') throw new Error('wrong payload')
      const { coefficient, multiplies, rightHand } = display.equation
      expect(answerOf(problem)).toBe(multiplies ? rightHand / coefficient : rightHand * coefficient)
    }
  })

  it('keeps the division family divisible, so its prediction is whole', () => {
    // The composition, checked as a property. Without it, "divide again" is a
    // fraction — finite, so it survives filtering, and unenterable.
    for (const problem of problems('one-step-multdiv')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'one-step-multdiv') throw new Error('wrong payload')
      const { coefficient, multiplies, rightHand } = display.equation
      if (!multiplies) expect(rightHand % coefficient).toBe(0)
    }
  })
})

describe('two-step, the wall', () => {
  it('keeps the constant a non-zero multiple of the coefficient', () => {
    // The composition, checked as a property rather than trusted. Both
    // predictions divide by the coefficient, so this is what makes them whole.
    for (const problem of problems('two-step')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'two-step') throw new Error('wrong payload')
      const { coefficient, constant, rightHand } = display.equation
      expect(coefficient).toBeGreaterThan(1)
      expect(constant).toBeGreaterThan(0)
      expect(constant % coefficient).toBe(0)
      expect(rightHand % coefficient).toBe(0)
    }
  })

  it('carries two distinct surviving diagnoses on every problem', () => {
    for (const problem of problems('two-step')) {
      const values = predicted(problem)
      expect(values.length, equationOf(problem).text).toBeGreaterThanOrEqual(2)
      expect(new Set(values).size, equationOf(problem).text).toBe(values.length)
      expect(values, equationOf(problem).text).not.toContain(answerOf(problem))
    }
  })

  it('predicts the wrong order and the wrong sign', () => {
    for (const problem of problems('two-step')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'two-step') throw new Error('wrong payload')
      const { coefficient, constant, adds, rightHand } = display.equation
      const wrongOrder = adds ? rightHand / coefficient - constant : rightHand / coefficient + constant
      const wrongSign = adds ? (rightHand + constant) / coefficient : (rightHand - constant) / coefficient
      expect(predicted(problem)).toContain(wrongOrder)
      expect(predicted(problem)).toContain(wrongSign)
    }
  })
})

describe('vars-both-sides', () => {
  it('keeps the coefficients apart so the variable cannot cancel', () => {
    for (const problem of problems('vars-both-sides')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'vars-both-sides') throw new Error('wrong payload')
      const { leftCoefficient, rightCoefficient } = display.equation
      expect(leftCoefficient).toBeGreaterThan(rightCoefficient)
    }
  })

  it('predicts the negated answer and the unmoved constants, both whole', () => {
    for (const problem of problems('vars-both-sides')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'vars-both-sides') throw new Error('wrong payload')
      const { leftCoefficient, leftConstant, rightCoefficient, rightConstant } = display.equation
      const gap = leftCoefficient - rightCoefficient
      expect(leftConstant % gap).toBe(0)
      expect(predicted(problem)).toContain(-answerOf(problem))
      expect(predicted(problem)).toContain(rightConstant / gap)
    }
  })

  it('offers the sign key, since the negated answer is always predicted', () => {
    for (const problem of problems('vars-both-sides')) {
      expect(problem.keypad?.allowNegative).toBe(true)
    }
  })
})

describe('equation-parentheses', () => {
  it('keeps the inner constant a non-zero multiple of the coefficient', () => {
    for (const problem of problems('equation-parentheses')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'parentheses') throw new Error('wrong payload')
      const { coefficient, constant, rightHand } = display.equation
      expect(coefficient).toBeGreaterThan(1)
      expect(constant).toBeGreaterThan(0)
      expect(constant % coefficient).toBe(0)
      expect(rightHand % coefficient).toBe(0)
    }
  })

  it('predicts distributing to the first term only, whole and never the answer', () => {
    // Its only prediction, which is why "usually whole" would not do: a
    // declared misconception that never survives fails the contract check.
    for (const problem of problems('equation-parentheses')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'parentheses') throw new Error('wrong payload')
      const { coefficient, constant, adds, rightHand } = display.equation
      const firstTermOnly = adds
        ? (rightHand - constant) / coefficient
        : (rightHand + constant) / coefficient

      expect(Number.isInteger(firstTermOnly), equationOf(problem).text).toBe(true)
      expect(firstTermOnly, equationOf(problem).text).not.toBe(answerOf(problem))
      expect(predicted(problem)).toContain(firstTermOnly)
    }
  })
})
