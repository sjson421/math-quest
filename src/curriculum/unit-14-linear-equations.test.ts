import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import { canonicalForm } from '../lib/expression'
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

/** Whatever this problem puts on screen, whichever display it uses. */
const displayTextOf = (problem: Problem): string => {
  const { display } = problem
  if (display.kind === 'equation' || display.kind === 'story') return display.text
  throw new Error(`${problem.skillId}: expected an equation or story display`)
}

/**
 * The skills that display an equation and answer it with a number.
 *
 * 14a's whole set, plus `with-fractions`. The other three of 14b answer
 * differently on purpose — a solution count, a rearranged expression, a value
 * read out of prose — so the assertions below would be asking them about a
 * contract they were built to break.
 */
const keypadEquationSkills = unit14.filter(
  (skill) => !['special-solutions', 'equation-words', 'rearrange-formula'].includes(skill.id),
)

describe('every Unit 14 skill answering a displayed equation on the keypad', () => {
  it('displays an equation and answers on the keypad', () => {
    for (const skill of keypadEquationSkills) {
      for (const problem of problems(skill.id)) {
        expect(problem.display.kind, skill.id).toBe('equation')
        expect(problem.inputMode, skill.id).toBe('keypad')
      }
    }
  })

  it('answers with a whole number, never a fraction', () => {
    for (const skill of keypadEquationSkills) {
      const fractional = problems(skill.id).filter((p) => !Number.isInteger(answerOf(p)))
      expect(fractional.map((p) => equationOf(p).text), skill.id).toEqual([])
    }
  })

  it('offers the sign key exactly when a negative value is plausible', () => {
    for (const skill of keypadEquationSkills) {
      for (const problem of problems(skill.id)) {
        const plausible = answerOf(problem) < 0 || predicted(problem).some((v) => v < 0)
        expect(problem.keypad?.allowNegative ?? false, `${skill.id}: ${equationOf(problem).text}`).toBe(plausible)
      }
    }
  })
})

describe('every Unit 14 skill', () => {
  it('predicts only whole numbers, so no diagnosis is dropped as unenterable', () => {
    // The gate nothing else in the suite provides. A fractional prediction is
    // finite, so `generateProblem` keeps it and `alwaysFiltered` counts it as
    // surviving — it is simply unenterable on a whole-number pad. Every
    // composition in this unit exists to keep its divisions exact, and this is
    // where that stops being an intention and becomes a check.
    //
    // It covers all ten because the trap does. `equation-words` states its two
    // steps in prose and predicts undoing them in the wrong order, which is a
    // fraction unless its constant is a multiple of its coefficient — the same
    // arithmetic as `two-step`, reached by reading rather than by looking.
    // Text-valued predictions are not numbers and are checked by their own
    // skills' cases below.
    for (const skill of unit14) {
      const fractional = problems(skill.id).flatMap((p) =>
        predicted(p).filter((v) => !Number.isInteger(v)).map((v) => `${skill.id}: ${displayTextOf(p)} → ${v}`),
      )
      expect(fractional).toEqual([])
    }
  })

  it('draws the minus the learner reads, never the one they type', () => {
    // Unit 6's rule. `x − 15 = -10` shipped in a first draft of
    // `one-step-addsub` and was caught by the width measurement rather than by
    // a test, which is why this one exists.
    for (const skill of unit14) {
      const hyphenated = problems(skill.id)
        .map(displayTextOf)
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

describe('with-fractions', () => {
  it('composes from the quotient, so clearing the denominator lands whole', () => {
    for (const problem of problems('with-fractions')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'clear-fraction') throw new Error('wrong payload')
      const { denominator, constant, adds, rightHand } = display.equation
      const quotient = adds ? rightHand - constant : rightHand + constant

      expect(denominator, display.text).toBeGreaterThan(1)
      expect(quotient, display.text).toBeGreaterThan(0)
      expect(answerOf(problem), display.text).toBe(denominator * quotient)
    }
  })

  it('predicts multiplying one side only, whole and never the answer', () => {
    for (const problem of problems('with-fractions')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'clear-fraction') throw new Error('wrong payload')
      const { denominator, constant, adds, rightHand } = display.equation
      const oneSide = adds ? rightHand - constant * denominator : rightHand + constant * denominator

      expect(Number.isInteger(oneSide), display.text).toBe(true)
      expect(oneSide, display.text).not.toBe(answerOf(problem))
      expect(predicted(problem), display.text).toContain(oneSide)
    }
  })

  it('draws the fraction rather than spelling it, under the equation text as its name', () => {
    // The extension this skill exists to consume. A slash between characters is
    // the presentation item 17 replaced everywhere else; the equation arm was
    // the last display that had no way to avoid it.
    for (const problem of problems('with-fractions')) {
      const display = equationOf(problem)
      if (!display.notation) throw new Error(`${display.text}: expected structured notation`)
      expect(display.notation.kind).toBe('row')
      const [first] = display.notation.kind === 'row' ? display.notation.children : []
      expect(first?.kind, display.text).toBe('fraction')
    }
  })
})

describe('special-solutions', () => {
  const outcomeOf = (problem: Problem): string => {
    if (problem.answer.kind !== 'choice') throw new Error('expected a choice answer')
    return problem.answer.id
  }

  it('draws all three outcomes, so the skill is not a coin flip', () => {
    const drawn = new Set(problems('special-solutions').map(outcomeOf))

    expect([...drawn].sort()).toEqual(['infinite', 'none', 'one'])
  })

  it('separates no-solution from infinitely-many by the constants alone', () => {
    // The whole diagnostic content. Both cases share every coefficient, so a
    // learner — or a check — reading only the x terms cannot tell them apart.
    for (const problem of problems('special-solutions')) {
      const display = equationOf(problem)
      if (display.equation.operation !== 'special-solutions') throw new Error('wrong payload')
      const { leftCoefficient, leftConstant, rightCoefficient, rightConstant } = display.equation
      const same = leftCoefficient === rightCoefficient

      expect(outcomeOf(problem), display.text).toBe(
        same ? (leftConstant === rightConstant ? 'infinite' : 'none') : 'one',
      )
    }
  })

  it('offers no variable frame, because the answer is not a value of one', () => {
    for (const problem of problems('special-solutions')) {
      expect(equationOf(problem).variable, equationOf(problem).text).toBeUndefined()
    }
  })

  it('predicts a wrong outcome that is offered and is not the answer', () => {
    // Text-valued at a choice id, which is what a choice problem submits. A
    // prediction naming an outcome that is not on screen could never fire.
    for (const problem of problems('special-solutions')) {
      const offered = (problem.choices ?? []).map((choice) => choice.id)
      const predictions = (problem.misconceptions ?? []).map((m) =>
        typeof m.value === 'number' ? String(m.value) : m.value.value,
      )

      expect(predictions.length, equationOf(problem).text).toBeGreaterThan(0)
      for (const prediction of predictions) {
        expect(offered, equationOf(problem).text).toContain(prediction)
        expect(prediction, equationOf(problem).text).not.toBe(outcomeOf(problem))
      }
    }
  })
})

describe('equation-words', () => {
  const storyOf = (problem: Problem) => {
    if (problem.display.kind !== 'story' || !problem.display.equation) {
      throw new Error(`${problem.skillId}: expected a story carrying equation terms`)
    }
    return problem.display
  }

  it('keeps the constant a non-zero multiple of the coefficient', () => {
    // What makes the wrong-order prediction whole. `two-step` composes the same
    // way for the same reason; prose does not change the arithmetic.
    for (const problem of problems('equation-words')) {
      const { equation } = storyOf(problem)
      if (equation.operation !== 'two-step') throw new Error('wrong payload')
      expect(equation.coefficient).toBeGreaterThan(1)
      expect(equation.constant).toBeGreaterThan(0)
      expect(equation.constant % equation.coefficient).toBe(0)
    }
  })

  it('predicts undoing in the wrong order, whole and never the answer', () => {
    for (const problem of problems('equation-words')) {
      const { equation, text } = storyOf(problem)
      if (equation.operation !== 'two-step') throw new Error('wrong payload')
      const wrongOrder = equation.rightHand / equation.coefficient - equation.constant

      expect(Number.isInteger(wrongOrder), text).toBe(true)
      expect(wrongOrder, text).not.toBe(answerOf(problem))
      expect(predicted(problem), text).toContain(wrongOrder)
    }
  })

  it('states every carried quantity in the sentence the learner reads', () => {
    // The sentence and the terms are checked against each other in both
    // directions: the terms have to reproduce the answer, and the sentence has
    // to actually contain them, or the story is describing another problem.
    for (const problem of problems('equation-words')) {
      const { equation, text } = storyOf(problem)
      if (equation.operation !== 'two-step') throw new Error('wrong payload')
      for (const value of [equation.coefficient, equation.constant, equation.rightHand]) {
        expect(text, `omits ${value}`).toContain(String(value))
      }
    }
  })
})

describe('rearrange-formula', () => {
  const dataOf = (problem: Problem) => {
    const display = equationOf(problem)
    if (display.equation.operation !== 'rearrange') throw new Error('wrong payload')
    return { ...display.equation, text: display.text, display }
  }

  const canonicalOf = (problem: Problem): string => {
    if (problem.answer.kind !== 'expression') throw new Error('expected an expression answer')
    return problem.answer.canonical
  }

  it('composes so the subject coefficient divides both other terms', () => {
    for (const problem of problems('rearrange-formula')) {
      const { subjectCoefficient, termCoefficient, constant, text } = dataOf(problem)

      // Never one: at one, dividing changes nothing and the second prediction
      // collapses onto the answer.
      expect(subjectCoefficient, text).toBeGreaterThan(1)
      expect(termCoefficient % subjectCoefficient, text).toBe(0)
      expect(constant % subjectCoefficient, text).toBe(0)
    }
  })

  it('answers inside the shipped grammar, in the one letter on the pad', () => {
    // The claim this skill rests on. Two letters are on screen and the answer
    // holds one, which is what let it ship against `expression-input` unchanged.
    for (const problem of problems('rearrange-formula')) {
      const { subject, term, text } = dataOf(problem)
      const canonical = canonicalOf(problem)

      expect(problem.expression?.variable, text).toBe(term)
      expect(equationOf(problem).variable, text).toBe(subject)
      expect(canonical, text).not.toContain(subject)
      expect(canonicalForm(canonical, term, 'expanded'), text).not.toBeNull()
      // Whole coefficients throughout — a fractional one is unenterable and
      // outside the grammar in the same breath.
      for (const digits of canonical.split(/[^0-9]+/).filter(Boolean)) {
        expect(Number.isInteger(Number(digits)), text).toBe(true)
      }
    }
  })

  it('predicts two mistakes the pad can actually produce', () => {
    // `1x+2` was the first draft of the sign mistake and could never once have
    // fired: the pad emits `x+2`. A text prediction is matched against the raw
    // entry by exact string, so a coefficient of one written out is a diagnosis
    // that does not exist — the dead-not-dropped trap, reached through notation
    // rather than through arithmetic.
    for (const problem of problems('rearrange-formula')) {
      const { text, term } = dataOf(problem)
      const predictions = (problem.misconceptions ?? []).map((m) =>
        typeof m.value === 'number' ? String(m.value) : m.value.value,
      )

      expect(predictions, text).toHaveLength(2)
      expect(new Set(predictions).size, text).toBe(2)
      for (const prediction of predictions) {
        expect(prediction, text).not.toContain(' ')
        expect(prediction, text).not.toMatch(/(^|[^0-9])1[a-z]/)
        expect(prediction, text).not.toBe(canonicalOf(problem))
        // Enterable: it has to parse as an expression in the offered letter, or
        // no sequence of key presses produces it.
        expect(canonicalForm(prediction, term, 'expanded'), `${text} → ${prediction}`).not.toBeNull()
      }
    }
  })
})
