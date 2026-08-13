import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { diagnose, generateProblem } from '../lib/generator'
import type { Difficulty, Problem } from '../lib/types'
import { sample, unrenderedKeys } from './recorded-output'
import { unit13 } from './unit-13-expressions'

describe.each(unit13.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit13.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 13 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const inlineText = (problem: Problem): string => {
  if (problem.display.kind !== 'inline') throw new Error('expected inline display')
  return problem.display.text
}

const storyText = (problem: Problem): string => {
  if (problem.display.kind !== 'story') throw new Error('expected story display')
  return problem.display.text
}

/** The one number a translation phrase names, read back out of the phrase. */
const phraseNumber = (text: string): string => {
  const match = /\d+/.exec(text)
  if (!match) throw new Error(`no number in phrase: "${text}"`)
  return match[0]
}

/** An unwritten coefficient is one: `x` is `1x`, and the display shows `x`. */
const coefficient = (digits: string): number => (digits === '' ? 1 : Number(digits))

const meanAt = (id: string, difficulty: Difficulty, value: (problem: Problem) => number) => {
  const values = problems(id)
    .filter((problem) => problem.difficulty === difficulty)
    .map(value)
  return values.reduce((sum, entry) => sum + entry, 0) / values.length
}

describe('variable-meaning', () => {
  it('substitutes into a one-term expression, recomputed from what is shown', () => {
    for (const problem of problems('variable-meaning')) {
      const text = inlineText(problem)
      const termMatch = /^(\d*)x$/.exec(text)
      if (!termMatch) throw new Error(`unexpected term display: "${text}"`)
      const coeff = termMatch[1] === '' ? 1 : Number(termMatch[1])
      const valueMatch = /x = (\d+)/.exec(problem.prompt)
      if (!valueMatch) throw new Error(`unexpected prompt: "${problem.prompt}"`)
      const value = Number(valueMatch[1])
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBe(coeff * value)
      expect(problem.answer.d).toBe(1)
      expect(problem.inputMode).toBe('keypad')
    }
  })

  it('grows the coefficient and value with difficulty', () => {
    const magnitude = (problem: Problem) => {
      const text = inlineText(problem)
      const coeff = text === 'x' ? 1 : Number(/^(\d+)x$/.exec(text)?.[1])
      const value = Number(/x = (\d+)/.exec(problem.prompt)?.[1])
      return coeff + value
    }
    expect(meanAt('variable-meaning', 5, magnitude)).toBeGreaterThan(meanAt('variable-meaning', 1, magnitude))
  })
})

describe('evaluate-expression', () => {
  it('substitutes into a multi-term expression, recomputed from what is shown', () => {
    for (const problem of problems('evaluate-expression')) {
      const text = inlineText(problem)
      const termMatch = /^(\d*)x (\+|−) (\d+)$/.exec(text)
      if (!termMatch) throw new Error(`unexpected term display: "${text}"`)
      const coeff = termMatch[1] === '' ? 1 : Number(termMatch[1])
      const adds = termMatch[2] === '+'
      const constant = Number(termMatch[3])
      const valueMatch = /x = (\d+)/.exec(problem.prompt)
      if (!valueMatch) throw new Error(`unexpected prompt: "${problem.prompt}"`)
      const value = Number(valueMatch[1])
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBe(adds ? coeff * value + constant : coeff * value - constant)
      expect(problem.inputMode).toBe('keypad')
    }
  })

  // The keypad draws a sign key only for a problem declaring `allowNegative`,
  // and this skill declares no keypad rules at all — so a subtraction landing
  // below zero would be an answer the learner has no key to type.
  it('never subtracts past zero, since its keypad has no sign key', () => {
    for (const problem of problems('evaluate-expression')) {
      if (problem.answer.kind !== 'exact') throw new Error('expected exact answer')
      expect(problem.answer.n).toBeGreaterThanOrEqual(0)
      expect(problem.keypad?.allowNegative ?? false).toBe(false)
    }
  })

  it('still subtracts at every difficulty', () => {
    for (const difficulty of difficulties) {
      const subtracting = problems('evaluate-expression').filter(
        (problem) => problem.difficulty === difficulty && inlineText(problem).includes('−'),
      )
      expect(subtracting.length).toBeGreaterThan(0)
    }
  })

  it('grows its operands with difficulty', () => {
    const magnitude = (problem: Problem) => {
      const text = inlineText(problem)
      const match = /^(\d*)x (?:\+|−) (\d+)$/.exec(text)
      if (!match) throw new Error(`unexpected term display: "${text}"`)
      return (match[1] === '' ? 1 : Number(match[1])) + Number(match[2])
    }
    expect(meanAt('evaluate-expression', 5, magnitude)).toBeGreaterThan(meanAt('evaluate-expression', 1, magnitude))
  })
})

describe('words-to-expression', () => {
  it('translates both reversing phrase families and predicts two distinct misconceptions', () => {
    const families = new Set<string>()
    for (const problem of problems('words-to-expression')) {
      const text = storyText(problem)
      if (problem.answer.kind !== 'expression') throw new Error('expected expression answer')
      expect(problem.inputMode).toBe('expression')
      expect(problem.expression).toEqual({ variable: 'x' })
      expect(problem.answer.form).toBe('expanded')
      expect(problem.misconceptions).toHaveLength(2)
      expect(new Set(problem.misconceptions?.map((m) => m.tag)).size).toBe(2)

      const lessThan = /less than a number/.exec(text)
      const subtractedFrom = /number subtracted from/.exec(text)
      const n = phraseNumber(text)
      if (lessThan) {
        families.add('less-than')
        expect(checkAnswer(problem.answer, `x-${n}`)).toEqual({ status: 'correct' })
        expect(diagnose(problem, `${n}-x`)?.tag).toBe('reversed-order')
        expect(diagnose(problem, `x+${n}`)?.tag).toBe('used-addition')
      } else if (subtractedFrom) {
        families.add('subtracted-from')
        expect(checkAnswer(problem.answer, `${n}-x`)).toEqual({ status: 'correct' })
        expect(diagnose(problem, `x-${n}`)?.tag).toBe('reversed-order')
        expect(diagnose(problem, `${n}+x`)?.tag).toBe('used-addition')
      } else {
        throw new Error(`unexpected phrase: "${text}"`)
      }
    }
    expect(families).toEqual(new Set(['less-than', 'subtracted-from']))
  })

  // The phrase is the problem, and `inline` would frame it as `text = answer`
  // — putting `6 = x-6` on screen, which is false. A story takes no such frame.
  it('presents the phrase as a story, not as an equality', () => {
    for (const problem of problems('words-to-expression')) {
      expect(problem.display.kind).toBe('story')
      expect(problem.prompt).toBe('Write the expression.')
      expect(storyText(problem)).toMatch(/^(\d+ less than a number|a number subtracted from \d+)$/)
    }
  })

  it('grows the named number with difficulty', () => {
    const magnitude = (problem: Problem) => Number(phraseNumber(storyText(problem)))
    expect(meanAt('words-to-expression', 5, magnitude)).toBeGreaterThan(meanAt('words-to-expression', 1, magnitude))
  })
})

describe('identify-like-terms', () => {
  it('offers exactly one matching term and two distinct distractors', () => {
    for (const problem of problems('identify-like-terms')) {
      const text = inlineText(problem)
      if (problem.answer.kind !== 'choice') throw new Error('expected choice answer')
      expect(problem.inputMode).toBe('choice')

      const choices = problem.choices ?? []
      expect(choices).toHaveLength(3)
      const labels = choices.map((c) => c.label)
      expect(new Set(labels).size).toBe(3)

      const targetLetter = /[a-z]/.exec(text)?.[0]
      if (!targetLetter) throw new Error(`unexpected term display: "${text}"`)
      const matching = choices.filter((c) => c.label.includes(targetLetter))
      expect(matching).toHaveLength(1)
      expect(problem.answer.id).toBe(matching[0].id)
    }
  })

  it('grows coefficients with difficulty', () => {
    const magnitude = (problem: Problem) => {
      const text = inlineText(problem)
      const coeff = /^(\d+)/.exec(text)?.[1]
      return coeff === undefined ? 1 : Number(coeff)
    }
    expect(meanAt('identify-like-terms', 5, magnitude)).toBeGreaterThan(meanAt('identify-like-terms', 1, magnitude))
  })
})

describe('combine-like-terms', () => {
  it('combines the matching x terms, recomputed from what is shown, and predicts two misconceptions', () => {
    for (const problem of problems('combine-like-terms')) {
      const text = inlineText(problem)
      const match = /^(\d*)x \+ (\d*)x \+ (\d+)$/.exec(text)
      if (!match) throw new Error(`unexpected term display: "${text}"`)
      const [first, second] = [match[1], match[2]].map(coefficient)
      const constant = Number(match[3])
      const combined = first + second

      if (problem.answer.kind !== 'expression') throw new Error('expected expression answer')
      expect(problem.answer.form).toBe('expanded')
      expect(checkAnswer(problem.answer, `${combined}x+${constant}`)).toEqual({ status: 'correct' })
      expect(problem.misconceptions).toHaveLength(2)
      expect(diagnose(problem, `${combined + constant}x`)?.tag).toBe('combined-unlike-terms')
      expect(diagnose(problem, `${combined + constant}`)?.tag).toBe('dropped-variable')
    }
  })

  it('grows coefficients with difficulty', () => {
    const magnitude = (problem: Problem) => {
      const text = inlineText(problem)
      const match = /^(\d*)x \+ (\d*)x \+ (\d+)$/.exec(text)
      if (!match) throw new Error(`unexpected term display: "${text}"`)
      return coefficient(match[1]) + coefficient(match[2]) + Number(match[3])
    }
    expect(meanAt('combine-like-terms', 5, magnitude)).toBeGreaterThan(meanAt('combine-like-terms', 1, magnitude))
  })
})

describe('distributive', () => {
  it('distributes across the parentheses, recomputed from what is shown, and predicts two misconceptions', () => {
    for (const problem of problems('distributive')) {
      const text = inlineText(problem)
      const match = /^(\d+)\(x \+ (\d+)\)$/.exec(text)
      if (!match) throw new Error(`unexpected term display: "${text}"`)
      const [coeff, constant] = match.slice(1).map(Number)
      const product = coeff * constant

      if (problem.answer.kind !== 'expression') throw new Error('expected expression answer')
      expect(problem.answer.form).toBe('expanded')
      expect(checkAnswer(problem.answer, `${coeff}x+${product}`)).toEqual({ status: 'correct' })
      // An undistributed equivalent is not the point of this skill, so it is accepted too.
      expect(checkAnswer(problem.answer, `${coeff}(x+${constant})`)).toEqual({ status: 'correct' })
      expect(problem.misconceptions).toHaveLength(2)
      expect(diagnose(problem, `${coeff}x+${constant}`)?.tag).toBe('distributed-first-term-only')
      expect(diagnose(problem, `x+${product}`)?.tag).toBe('distributed-second-term-only')
    }
  })

  it('grows the coefficient and constant with difficulty', () => {
    const magnitude = (problem: Problem) => {
      const text = inlineText(problem)
      const match = /^(\d+)\(x \+ (\d+)\)$/.exec(text)
      if (!match) throw new Error(`unexpected term display: "${text}"`)
      return match.slice(1).map(Number).reduce((a, b) => a + b, 0)
    }
    expect(meanAt('distributive', 5, magnitude)).toBeGreaterThan(meanAt('distributive', 1, magnitude))
  })
})

// The unit that teaches term notation cannot write a term two ways. `1x` in a
// display, a choice label, or a worked step teaches that `1x` and `x` are
// different terms — the exact confusion 13.4 and 13.5 exist to clear up.
it('never writes a coefficient of one', () => {
  for (const skill of unit13) {
    for (const problem of problems(skill.id)) {
      const written = [
        problem.prompt,
        problem.hint,
        problem.display.kind === 'inline' || problem.display.kind === 'story' ? problem.display.text : '',
        ...(problem.choices ?? []).map((choice) => `${choice.id} ${choice.label}`),
        ...problem.solution.map((step) => `${step.text} ${step.detail ?? ''}`),
        ...(problem.misconceptions ?? []).map((m) => (typeof m.value === 'number' ? '' : m.value.value)),
      ].join(' | ')
      // A digit before the letter is a coefficient; `1 × 3` and `= 1` are not.
      expect(written).not.toMatch(/(?<!\d)1[a-z]/)
    }
  }
})

it('records every field Unit 13 sets', () => {
  expect(unrenderedKeys(unit13)).toEqual([])
})
