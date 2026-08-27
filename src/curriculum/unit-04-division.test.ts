import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import type { Problem } from '../lib/types'
import {
  divisionTrace,
  forgotBringDown,
  ignoredStepRemainder,
} from './engine'
import { manifestIndex } from './index'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import { factorsOf, isPrime, multiplesOf, unit04 } from './unit-04-division'

describe.each(unit04.map((skill) => [skill.id, skill] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const { everyProblem, exactValue, skill } = sweep(unit04, 'Unit 4')

/** The `a ÷ b` an inline division shows, read back off the screen text. */
const shownOperands = (problem: Problem): [number, number] => {
  if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
  const [a, b] = problem.display.text.split(' ÷ ').map(Number)
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error(`${problem.skillId} does not display a whole division: ${problem.display.text}`)
  }
  return [a, b]
}

const teachingLines = [
  ['div-meaning', 'Division shares a total equally or counts equal groups.'],
  ['div-facts', 'Use a multiplication fact backward to find how many groups fit.'],
  ['div-remainder', 'A remainder is what stays after making every full group.'],
  ['div-by-10-100', 'Dividing by 10 or 100 shifts every digit right one or two places.'],
  ['long-div-1digit', 'Repeat divide, multiply, subtract, and bring down for each digit.'],
  ['long-div-remainder', 'Count only full groups; an unfinished group does not add one.'],
  ['long-div-2digit', 'Estimate each quotient digit, multiply to check, then adjust if needed.'],
  ['factors', 'A factor divides a number exactly with nothing left over.'],
  ['multiples', 'A multiple comes from multiplying a number by a whole number.'],
  ['primes', 'A prime number can be divided exactly only by 1 and itself.'],
  ['div-words', 'Find the total and number of equal groups, then divide.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit04.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 4 skill: ${id}`)
  return found
}

const trialFactors = (value: number): number[] =>
  Array.from({ length: value }, (_, index) => index + 1).filter((candidate) => value % candidate === 0)

const answerChoiceLabel = (problem: Problem): string => {
  const answer = problem.answer
  if (answer.kind !== 'choice') throw new Error(`Expected choice answer for ${problem.skillId}`)
  const choice = problem.choices?.find((candidate) => candidate.id === answer.id)
  if (!choice) throw new Error(`Missing answer choice for ${problem.skillId}`)
  return choice.label
}

const fixedDivisionOperands = (problem: Problem): [number, number] => {
  if (problem.display.kind === 'inline') return shownOperands(problem)
  if (problem.display.kind === 'story') {
    const { operands } = problem.display
    if (operands?.length === 2) return operands as [number, number]
  }
  throw new Error(`Expected division operands for ${problem.skillId}`)
}

describe('Stage B Unit 4 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage B Unit 4 intro examples', () => {
  it('recomputes keypad examples and resolves choice examples from visible data', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)

      if (id === 'factors' || id === 'multiples' || id === 'primes') {
        if (problem.display.kind !== 'inline') throw new Error(`Expected inline display for ${id}`)
        const value = Number(problem.display.text)
        const label = answerChoiceLabel(problem)

        if (id === 'factors') expect(label).toBe(trialFactors(value).join(', '))
        if (id === 'multiples') {
          expect(label).toBe([1, 2, 3, 4].map((index) => value * index).join(', '))
        }
        if (id === 'primes') {
          expect(label).toBe(trialFactors(value).length === 2 ? 'prime' : 'composite')
        }
        continue
      }

      const [dividend, divisor] = fixedDivisionOperands(problem)
      const expected = id === 'div-remainder'
        ? dividend % divisor
        : id === 'long-div-remainder'
          ? Math.floor(dividend / divisor)
          : dividend / divisor

      expect(problem.answer).toEqual({ kind: 'exact', n: expected, d: 1 })

      const expectedTags: Record<string, string[]> = {
        'long-div-1digit': ['forgot-bring-down', 'ignored-step-remainder'],
        'long-div-2digit': ['estimate-low', 'estimate-high'],
      }
      if (expectedTags[id]) {
        expect(new Set(problem.misconceptions?.map((misconception) => misconception.tag))).toEqual(
          new Set(expectedTags[id]),
        )
      }
    }
  })
})

const KEYPAD_SKILLS = [
  'div-meaning',
  'div-facts',
  'div-remainder',
  'div-by-10-100',
  'long-div-1digit',
  'long-div-remainder',
  'long-div-2digit',
  'div-words',
]

const CHOICE_SKILLS = ['factors', 'multiples', 'primes']

describe('number theory helpers', () => {
  it('lists every factor, including both ends', () => {
    expect(factorsOf(1)).toEqual([1])
    expect(factorsOf(13)).toEqual([1, 13])
    expect(factorsOf(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36])
    expect(factorsOf(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24])
  })

  it('counts a perfect square once at its root', () => {
    // 6 × 6 is one factor, not two, which is what makes 36 have nine factors
    // rather than ten. A pair-based implementation gets this wrong.
    expect(factorsOf(36).filter((d) => d === 6)).toHaveLength(1)
  })

  it('treats one as neither prime nor composite by counting its factors', () => {
    // Exactly two factors. 1 has one, so it falls out without a special case.
    expect(isPrime(1)).toBe(false)
    expect(isPrime(2)).toBe(true)
    expect(isPrime(13)).toBe(true)
    // 51 is the case the skill exists for: it looks prime and is 3 × 17.
    expect(isPrime(51)).toBe(false)
    expect(isPrime(36)).toBe(false)
  })

  it('counts multiples up from the number itself', () => {
    expect(multiplesOf(6, 4)).toEqual([6, 12, 18, 24])
    expect(multiplesOf(1, 3)).toEqual([1, 2, 3])
  })
})

describe('what the unit guarantees about every problem it makes', () => {
  it('answers on the existing whole-digit keypad or with a choice', () => {
    const violations = unit04.flatMap((generator) =>
      everyProblem(generator.id)
        .filter((problem) => {
          if (problem.keypad !== undefined) return true
          if (CHOICE_SKILLS.includes(problem.skillId)) return problem.inputMode !== 'choice'
          return problem.inputMode !== 'keypad' || exactValue(problem) < 0
        })
        .map((problem) => `${problem.skillId}: ${problem.inputMode} ${JSON.stringify(problem.keypad)}`),
    )

    expect([...new Set(violations)]).toEqual([])
    expect([...KEYPAD_SKILLS, ...CHOICE_SKILLS].sort()).toEqual(
      unit04.map((generator) => generator.id).sort(),
    )
  })

  it('never asks for a fraction, whatever the division leaves behind', () => {
    // The unit's hard line. Decimals arrive in Unit 9; here a division that does
    // not come out exactly is asked as a remainder or as a whole quotient.
    for (const id of KEYPAD_SKILLS) {
      for (const problem of everyProblem(id)) {
        expect(Number.isInteger(exactValue(problem)), problem.skillId).toBe(true)
        expect(exactValue(problem), problem.skillId).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('shows a division whose displayed operands really make its answer', () => {
    // The whole reason `divide-remainder` and `divide-quotient` exist: for these
    // two the shown expression does not evaluate to the answer, and the carried
    // operation says which property does.
    for (const problem of everyProblem('div-remainder')) {
      const [dividend, divisor] = shownOperands(problem)
      expect(exactValue(problem)).toBe(dividend % divisor)
      expect(exactValue(problem)).toBeGreaterThan(0)
    }

    for (const problem of everyProblem('long-div-remainder')) {
      const [dividend, divisor] = shownOperands(problem)
      expect(exactValue(problem)).toBe(Math.floor(dividend / divisor))
      expect(dividend % divisor, 'a remainder skill must leave a remainder').toBeGreaterThan(0)
    }
  })
})

describe('division stories', () => {
  it('divides exactly by the distractor as well as the real group count', () => {
    // The distractor drives a predicted value of `total ÷ distractor`. If it
    // does not divide, that prediction is a fraction nothing on a whole-number
    // pad can produce — a diagnosis that sits in the bank and never once fires.
    for (const problem of everyProblem('div-words')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected a story problem')
      const [total, groups] = problem.display.operands
      const distractorPair = (problem.misconceptions ?? []).find(
        (m) => m.tag === 'distractor-pair',
      )

      expect(total % groups).toBe(0)
      expect(Number.isInteger(distractorPair?.value), problem.display.text).toBe(true)
    }
  })

  it('never prints the answer in the sentence as some other quantity', () => {
    // `8 units over 2 shelves, a pallet holds 4` shipped once: the distractor
    // was 4 and so was the answer, so the sentence said the answer out loud
    // meaning something else, and a learner could be right for the wrong reason.
    for (const problem of everyProblem('div-words')) {
      if (problem.display.kind !== 'story' || !problem.display.operands) throw new Error('expected a story problem')
      const [total, groups] = problem.display.operands
      const share = total / groups
      // Whatever the sentence names that is neither the total nor the group
      // count is the distractor, read back off the prose the learner reads.
      const mentioned = problem.display.text.match(/\d+/g)?.map(Number) ?? []
      const distractors = mentioned.filter((n) => n !== total && n !== groups)

      expect(distractors, problem.display.text).not.toContain(share)
    }
  })
})

describe('long division reads one trace', () => {
  it('derives single-digit wording and both diagnoses from it', () => {
    for (const problem of everyProblem('long-div-1digit')) {
      const [dividend, divisor] = shownOperands(problem)
      const trace = divisionTrace(dividend, divisor)
      const first = trace.steps[trace.steps.length - String(trace.quotient).length]
      const next = trace.steps[trace.steps.indexOf(first) + 1]
      const detail = problem.solution.map((step) => step.detail ?? '').join('\n')
      const text = problem.solution.map((step) => step.text).join('\n')
      const values = new Map((problem.misconceptions ?? []).map((m) => [m.tag, m.value]))

      expect(exactValue(problem)).toBe(trace.quotient)
      expect(trace.remainder).toBe(0)
      expect(detail).toContain(`${divisor} × ${first.digit} = ${first.product}`)
      expect(text).toContain(`Bring the next digit down to make ${next.working}.`)
      expect(values.get('forgot-bring-down')).toBe(forgotBringDown(trace, 'n').value)
      expect(values.get('ignored-step-remainder')).toBe(ignoredStepRemainder(trace, 'n').value)
    }
  })

  it('keeps two distinct diagnoses on the algorithm wall, on every problem', () => {
    // The content contract asserts this over sampled problems; asserted here
    // against the draw, because it is the draw that guarantees it. A candidate
    // whose two predictions collide is filtered down to one and the wall ships
    // with a bare "incorrect" on the skill learners historically quit at.
    for (const problem of everyProblem('long-div-1digit')) {
      const tags = new Set((problem.misconceptions ?? []).map((m) => m.tag))

      expect(tags, problem.display.kind === 'inline' ? problem.display.text : '').toEqual(
        new Set(['forgot-bring-down', 'ignored-step-remainder']),
      )
    }
  })

  it('predicts the estimating wall one whole place high and low', () => {
    for (const problem of everyProblem('long-div-2digit')) {
      const [dividend, divisor] = shownOperands(problem)
      const quotient = exactValue(problem)
      const place = 10 ** (String(quotient).length - 1)
      const values = new Map((problem.misconceptions ?? []).map((m) => [m.tag, m.value]))

      expect(dividend / divisor).toBe(quotient)
      expect(divisor).toBeGreaterThan(9)
      expect(values.get('estimate-low')).toBe(quotient - place)
      expect(values.get('estimate-high')).toBe(quotient + place)
    }
  })
})

describe('the choice skills', () => {
  it('offers the correct option exactly once, and every prediction is another option', () => {
    for (const id of CHOICE_SKILLS) {
      for (const problem of everyProblem(id)) {
        const choices = problem.choices ?? []
        const ids = choices.map((choice) => choice.id)
        const labels = choices.map((choice) => choice.label)

        expect(new Set(ids).size, `${id} ids`).toBe(ids.length)
        expect(new Set(labels).size, `${id} labels`).toBe(labels.length)
        expect(problem.answer.kind).toBe('choice')
        if (problem.answer.kind !== 'choice') throw new Error('unreachable')
        expect(ids, `${id} answer id`).toContain(problem.answer.id)
      }
    }
  })

  it('numbers every choice id, because filtering and diagnosis parse them', () => {
    // `generateProblem()` reads the correct value as `Number(answer.id)` and
    // `diagnose()` compares `Number(entry)`. An id like 'prime' makes both NaN:
    // no prediction is ever filtered, none can ever match, and every other test
    // here still passes. This is the only thing that catches it.
    for (const id of CHOICE_SKILLS) {
      for (const problem of everyProblem(id)) {
        for (const choice of problem.choices ?? []) {
          expect(Number.isFinite(Number(choice.id)), `${id} id "${choice.id}"`).toBe(true)
        }

        const optionValues = (problem.choices ?? []).map((choice) => Number(choice.id))
        for (const misconception of problem.misconceptions ?? []) {
          expect(optionValues, `${id} predicts ${misconception.tag}`).toContain(
            misconception.value,
          )
        }
      }
    }
  })

  it('builds each factor list from the number on screen', () => {
    for (const problem of everyProblem('factors')) {
      if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
      const value = Number(problem.display.text)
      const all = factorsOf(value)
      const labels = (problem.choices ?? []).map((choice) => choice.label)

      expect(all.length, `${value} needs a list worth stripping`).toBeGreaterThanOrEqual(6)
      expect(labels).toContain(all.join(', '))
      expect(labels).toContain(all.slice(1, -1).join(', '))
    }
  })

  it('classifies primes both ways rather than always answering composite', () => {
    const problems = everyProblem('primes')
    const primesShown = problems.filter((problem) => {
      if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
      return isPrime(Number(problem.display.text))
    })

    expect(primesShown.length).toBeGreaterThan(0)
    expect(primesShown.length).toBeLessThan(problems.length)
  })
})

describe('the wording gate itself', () => {
  it('renders every field the generators set', () => {
    expect(
      unrenderedKeys(unit04),
      'add these to RENDERED_KEYS and render them in format()',
    ).toEqual([])
  })

  it('notices a changed division hint', () => {
    const problem = generateProblem(unit04[0], 1, 1)
    expect(format({ ...problem, hint: 'Something else entirely.' }, 1)).not.toBe(
      format(problem, 1),
    )
  })

  it('notices a changed long-division diagnosis', () => {
    const problem = generateProblem(skill('long-div-1digit'), 1, 1)
    const misconceptions = (problem.misconceptions ?? []).map((m, i) =>
      i === 0 && typeof m.value === 'number' ? { ...m, value: m.value + 1 } : m,
    )
    expect(format({ ...problem, misconceptions }, 1)).not.toBe(format(problem, 1))
  })

  it('notices a changed choice label', () => {
    const problem = generateProblem(skill('primes'), 1, 1)
    const choices = (problem.choices ?? []).map((choice, i) =>
      i === 0 ? { ...choice, label: 'neither' } : choice,
    )
    expect(format({ ...problem, choices }, 1)).not.toBe(format(problem, 1))
  })
})
