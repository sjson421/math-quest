import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { makeRng } from '../lib/rng'
import type { Difficulty, Display, EquationData, Problem, Relation } from '../lib/types'
import { manifestIndex } from './index'
import { sample } from './recorded-output'
import {
  RELATIONS,
  REVERSED,
  STRICTNESS_SWAPPED,
  holds,
  isStrict,
  offer,
  offerStatements,
  pointsUp,
  satisfyingCount,
  relationId,
  statementId,
  statementLabel,
  unit15,
} from './unit-15-inequalities'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const problemCache = new Map<string, Problem[]>()

/** Every draw of one skill: 100 seeds at each of the five difficulties. */
const problems = (id: string) => {
  const cached = problemCache.get(id)
  if (cached) return cached
  const skill = unit15.find((entry) => entry.id === id)
  if (!skill) throw new Error(`unknown Unit 15 skill ${id}`)
  const generated = difficulties.flatMap((difficulty) =>
    Array.from({ length: 100 }, (_, seed) => generateProblem(skill, seed * 7919 + difficulty, difficulty)),
  )
  problemCache.set(id, generated)
  return generated
}

const atDifficulty = (id: string, difficulty: Difficulty) =>
  problems(id).filter((problem) => problem.difficulty === difficulty)

const equationOf = (problem: Problem) => {
  if (problem.display.kind !== 'equation' || !problem.display.equation) {
    throw new Error(`${problem.skillId}: expected an equation display`)
  }
  return problem.display as Extract<Display, { kind: 'equation' }> & { equation: EquationData }
}

const dataOf = <K extends EquationData['operation']>(problem: Problem, operation: K) => {
  const data = equationOf(problem).equation
  if (data.operation !== operation) throw new Error(`${problem.skillId}: expected ${operation}`)
  return data as Extract<EquationData, { operation: K }>
}

const chosenId = (problem: Problem): string => {
  if (problem.answer.kind !== 'choice') throw new Error(`${problem.skillId}: expected a choice answer`)
  return problem.answer.id
}

/** Every predicted identity that survived `generateProblem`'s filtering. */
const predictedIds = (problem: Problem): string[] =>
  (problem.misconceptions ?? [])
    .map((m) => m.value)
    .filter((value): value is { kind: 'text'; value: string } => typeof value !== 'number')
    .map((value) => value.value)

const optionIds = (problem: Problem): string[] => (problem.choices ?? []).map((choice) => choice.id)

type Unit15EquationData = Extract<EquationData, {
  operation:
    | 'inequality-meaning'
    | 'inequality-graph'
    | 'inequality-addsub'
    | 'inequality-two-step'
    | 'inequality-multdiv'
    | 'inequality-compound'
}>

/**
 * A boundary as the course draws it, and the statement it sits in.
 *
 * These two are spelled out rather than imported, because they are what the
 * displayed row is compared against and a shared helper would agree with the
 * generator whichever way it was wrong. The rest of this file deliberately does
 * import the unit's own vocabulary — `holds`, `satisfyingCount`, the two relation
 * tables — because its job is the *draw constraints*, and the independent
 * recomputation of every answer already lives in `generators.test.ts`, which
 * imports nothing from the unit but a type.
 */
const drawnBound = (value: number): string => String(value).replace('-', '−')

const statementOf = (relation: Relation, bound: number): string => `x ${relation} ${drawnBound(bound)}`

const teachingLines = [
  ['inequality-symbols', 'An inequality shows which side is larger and whether the boundary is included.'],
  ['graph-inequality', 'Use an open circle for a strict boundary and a closed circle when included.'],
  ['solve-one-step-ineq', 'Undo one operation on both sides without changing the inequality sign.'],
  ['solve-multi-step-ineq', 'Undo the constant first, then undo the positive coefficient.'],
  ['flip-the-sign', 'Multiplying or dividing both sides by a negative reverses the inequality sign.'],
  ['compound-inequalities', 'For and, keep values that satisfy both; for or, keep values that satisfy at least one.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit15.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 15 skill: ${id}`)
  return found
}

describe('Stage E Unit 15 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    const generator = teachingSkill(id)
    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage E Unit 15 intro examples', () => {
  it('recomputes every fixed example from the displayed inequality', () => {
    const satisfies = (relation: Relation, left: number, right: number): boolean => {
      if (relation === '<') return left < right
      if (relation === '>') return left > right
      if (relation === '≤') return left <= right
      return left >= right
    }

    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)
      const data = equationOf(problem).equation as Unit15EquationData

      switch (data.operation) {
        case 'inequality-meaning':
          expect(chosenId(problem)).toBe(relationId(data.relation))
          expect(equationOf(problem).text).toBe(statementOf(data.relation, data.bound))
          break
        case 'inequality-graph': {
          const circle = isStrict(data.relation) ? 'open' : 'closed'
          const shading = pointsUp(data.relation) ? 'right' : 'left'
          expect(chosenId(problem)).toBe(`${circle}-${shading}`)
          expect(equationOf(problem).text).toBe(statementOf(data.relation, data.bound))
          break
        }
        case 'inequality-addsub': {
          const bound = data.adds ? data.rightHand - data.constant : data.rightHand + data.constant
          expect(chosenId(problem)).toBe(statementId({ relation: data.relation, bound }))
          break
        }
        case 'inequality-two-step': {
          const afterUndo = data.adds ? data.rightHand - data.constant : data.rightHand + data.constant
          const bound = afterUndo / data.coefficient
          expect(chosenId(problem)).toBe(statementId({ relation: data.relation, bound }))
          break
        }
        case 'inequality-multdiv': {
          const bound = data.multiplies ? data.rightHand / data.coefficient : data.rightHand * data.coefficient
          const relation = data.coefficient < 0 ? REVERSED[data.relation] : data.relation
          expect(chosenId(problem)).toBe(statementId({ relation, bound }))
          break
        }
        case 'inequality-compound': {
          const count = Array.from({ length: data.rangeMax + 1 }, (_, value) => value).filter((value) => {
            const first = satisfies(data.firstRelation, value, data.firstBound)
            const second = satisfies(data.secondRelation, value, data.secondBound)
            return data.form === 'or' ? first || second : first && second
          }).length
          if (problem.answer.kind !== 'exact') throw new Error(`${id}: expected exact answer`)
          expect(problem.answer).toMatchObject({ n: count, d: 1 })
          break
        }
        default: {
          const unhandled: never = data
          throw new Error(`Unhandled Unit 15 intro: ${JSON.stringify(unhandled)}`)
        }
      }
    }
  })
})

describe.each(unit15.map((skill) => [skill.id, skill] as const))('recorded output: %s', (_id, skill) => {
  it('matches the wording recorded when the skill landed', () => {
    expect(sample(skill)).toMatchSnapshot()
  })
})

/**
 * The rule the central filter cannot enforce for this unit.
 *
 * `generateProblem` drops a numeric prediction equal to the answer; for a choice
 * answer it compares against `Number(answer.id)`, and every id here is `x<-4` or
 * `<=` — never a number. So a prediction that repeats the correct option would
 * survive, count as a diagnosis, and fire on the right answer.
 */
const predictionsAreWrongOptions = (id: string) => {
  for (const problem of problems(id)) {
    const offered = optionIds(problem)
    const correct = chosenId(problem)
    expect(predictedIds(problem).length, id).toBeGreaterThanOrEqual(2)
    for (const predicted of predictedIds(problem)) {
      expect(offered, `${id}: predicted "${predicted}" is not on screen`).toContain(predicted)
      expect(predicted, `${id}: predicted the correct option`).not.toBe(correct)
    }
  }
}

/** Four options, all distinct, exactly one of them the stated answer. */
const offersFourWithOneCorrect = (id: string) => {
  for (const problem of problems(id)) {
    const offered = optionIds(problem)
    expect(offered.length, id).toBe(4)
    expect(new Set(offered).size, id).toBe(4)
    expect(offered.filter((option) => option === chosenId(problem)).length, id).toBe(1)
  }
}

/**
 * The difficulty ladder, asserted the same way for every skill that has one.
 *
 * `measure` names what that skill's bands actually widen — a bound, a
 * right-hand side, a counting range — which is the only part that differs.
 */
const widensWithDifficulty = (id: string, measure: (problem: Problem) => number) => {
  const widest = (difficulty: Difficulty) => Math.max(...atDifficulty(id, difficulty).map(measure))
  for (const difficulty of [2, 3, 4, 5] as const) {
    expect(widest(difficulty), `${id} at difficulty ${difficulty}`).toBeGreaterThan(
      widest((difficulty - 1) as Difficulty),
    )
  }
}

/** Both signs at every difficulty, so neither is what the answer correlates with. */
const drawsBothSigns = (id: string, measure: (problem: Problem) => number) => {
  for (const difficulty of difficulties) {
    const values = atDifficulty(id, difficulty).map(measure)
    expect(values.some((value) => value < 0), `${id} at difficulty ${difficulty}`).toBe(true)
    expect(values.some((value) => value > 0), `${id} at difficulty ${difficulty}`).toBe(true)
  }
}

describe('the relation vocabulary', () => {
  it('reverses every relation to exactly one other, and back again', () => {
    for (const relation of RELATIONS) {
      expect(REVERSED[relation]).not.toBe(relation)
      expect(REVERSED[REVERSED[relation]]).toBe(relation)
      // Reversing changes the direction and leaves the boundary's fate alone —
      // `>` becomes `<`, never `≤`. The wall's four options are the two swaps
      // applied independently, so an overlap here would collapse them to three.
      expect(isStrict(REVERSED[relation])).toBe(isStrict(relation))
    }
  })

  it('swaps strictness without changing direction', () => {
    for (const relation of RELATIONS) {
      expect(STRICTNESS_SWAPPED[relation]).not.toBe(relation)
      expect(STRICTNESS_SWAPPED[STRICTNESS_SWAPPED[relation]]).toBe(relation)
      expect(isStrict(STRICTNESS_SWAPPED[relation])).toBe(!isStrict(relation))
      expect(pointsUp(STRICTNESS_SWAPPED[relation])).toBe(pointsUp(relation))
    }
  })

  it('reaches all four relations from any one by the two swaps', () => {
    // What makes a four-option list exhaustive rather than authored: direction
    // and strictness are independent, so one relation plus its two swaps plus
    // both together is the whole set.
    for (const relation of RELATIONS) {
      const reached = new Set<Relation>([
        relation,
        REVERSED[relation],
        STRICTNESS_SWAPPED[relation],
        REVERSED[STRICTNESS_SWAPPED[relation]],
      ])
      expect([...reached].sort()).toEqual([...RELATIONS].sort())
    }
  })

  it('decides each relation against a value the way it reads', () => {
    expect(holds('<', 2, 3)).toBe(true)
    expect(holds('<', 3, 3)).toBe(false)
    expect(holds('≤', 3, 3)).toBe(true)
    expect(holds('>', 4, 3)).toBe(true)
    expect(holds('>', 3, 3)).toBe(false)
    expect(holds('≥', 3, 3)).toBe(true)
    expect(holds('<', -5, -4)).toBe(true)
  })
})

describe('how a statement is written down', () => {
  it('spells its id in plain characters and its label in drawn ones', () => {
    // The whole point of the split: a prediction is matched against the id by
    // exact string, and nothing puts `<=` or an ASCII hyphen on screen.
    expect(statementId({ relation: '<', bound: -4 })).toBe('x<-4')
    expect(statementLabel({ relation: '<', bound: -4 })).toBe('x < −4')
    expect(statementId({ relation: '≤', bound: 5 })).toBe('x<=5')
    expect(statementLabel({ relation: '≤', bound: 5 })).toBe('x ≤ 5')
    expect(statementId({ relation: '≥', bound: 0 })).toBe('x>=0')
  })

  it('gives distinct ids to statements differing only in strictness or sign', () => {
    const ids = [
      statementId({ relation: '<', bound: -4 }),
      statementId({ relation: '>', bound: -4 }),
      statementId({ relation: '<', bound: 4 }),
      statementId({ relation: '>', bound: 4 }),
    ]
    expect(new Set(ids).size).toBe(4)
  })
})

describe('how the four options are offered', () => {
  const four = [
    { relation: '<' as Relation, bound: -4 },
    { relation: '>' as Relation, bound: -4 },
    { relation: '<' as Relation, bound: 4 },
    { relation: '>' as Relation, bound: 4 },
  ]

  it('rejects a set that is not four distinct options', () => {
    const rng = makeRng(1)
    expect(() => offer(rng, [{ id: 'a', label: 'a' }])).toThrow(/four options/)
    expect(() =>
      offer(rng, [
        { id: 'a', label: 'a' },
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
        { id: 'c', label: 'c' },
      ]),
    ).toThrow(/not distinct/)
  })

  it('keeps the same four options whatever the order', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const ids = offerStatements(makeRng(seed), four).map((choice) => choice.id)
      expect([...ids].sort()).toEqual(four.map(statementId).sort())
    }
  })

  it('puts a given option at every one of the four positions across seeds', () => {
    // The property sorting cannot give. Under `< ≤ > ≥` the correct option's
    // index is a function of its own relation, so some position is never
    // correct — see the module comment for the worked case.
    const positions = new Set<number>()
    for (let seed = 0; seed < 200; seed += 1) {
      positions.add(offerStatements(makeRng(seed), four).findIndex((c) => c.id === 'x<-4'))
    }
    expect([...positions].sort()).toEqual([0, 1, 2, 3])
  })

  it('puts a real skill’s correct option at every position across seeds', () => {
    // The synthetic case above proves the shuffle; this proves the skills use it.
    // Sorting by content would pin `solve-one-step-ineq`'s answer to positions
    // 1–3 and `flip-the-sign`'s to two of the four — see the module comment.
    for (const id of ['solve-one-step-ineq', 'flip-the-sign']) {
      const positions = new Set(
        problems(id).map((problem) => optionIds(problem).indexOf(chosenId(problem))),
      )
      expect([...positions].sort(), id).toEqual([0, 1, 2, 3])
    }
  })

  it('orders one seed the same way every time', () => {
    const once = offerStatements(makeRng(4242), four).map((choice) => choice.id)
    const twice = offerStatements(makeRng(4242), four).map((choice) => choice.id)
    expect(once).toEqual(twice)
  })
})

describe('counting what satisfies a compound statement', () => {
  it('counts a range by testing every whole number in it', () => {
    // `2 < x ≤ 6` over 0–10 is {3, 4, 5, 6}.
    expect(
      satisfyingCount({
        operation: 'inequality-compound',
        form: 'between',
        firstRelation: '>',
        firstBound: 2,
        secondRelation: '≤',
        secondBound: 6,
        rangeMax: 10,
      }),
    ).toBe(4)
  })

  it('counts both sides of a disjunction', () => {
    // `x < 2 or x > 7` over 0–10 is {0, 1} together with {8, 9, 10}.
    expect(
      satisfyingCount({
        operation: 'inequality-compound',
        form: 'or',
        firstRelation: '<',
        firstBound: 2,
        secondRelation: '>',
        secondBound: 7,
        rangeMax: 10,
      }),
    ).toBe(5)
  })

  it('counts a conjunction the same way whether or not it is drawn chained', () => {
    const shape = {
      operation: 'inequality-compound',
      firstRelation: '≥' as Relation,
      firstBound: 3,
      secondRelation: '<' as Relation,
      secondBound: 9,
      rangeMax: 10,
    } as const
    // `between` is `and` with a rendering, so it must not be a second meaning.
    expect(satisfyingCount({ ...shape, form: 'and' })).toBe(6)
    expect(satisfyingCount({ ...shape, form: 'between' })).toBe(6)
  })
})

describe('15.1 · inequality-symbols', () => {
  it('predicts the reversed direction and the swapped boundary, both on screen', () => {
    for (const problem of problems('inequality-symbols')) {
      const { relation } = dataOf(problem, 'inequality-meaning')
      expect(predictedIds(problem).sort()).toEqual(
        [relationId(REVERSED[relation]), relationId(STRICTNESS_SWAPPED[relation])].sort(),
      )
    }
  })

  it('answers with the relation the display shows', () => {
    for (const problem of problems('inequality-symbols')) {
      const { relation, bound } = dataOf(problem, 'inequality-meaning')
      expect(chosenId(problem)).toBe(relationId(relation))
      expect(equationOf(problem).text).toBe(statementOf(relation, bound))
      // The label the learner picks must name the same relation the id carries.
      const chosen = (problem.choices ?? []).find((choice) => choice.id === chosenId(problem))
      expect(chosen?.label).toContain(String(bound))
    }
  })

  it('offers all four readings, so neither distinction can be read off the other', () => {
    for (const problem of problems('inequality-symbols')) {
      expect(optionIds(problem).sort()).toEqual(RELATIONS.map(relationId).sort())
    }
  })

  it('draws every relation across the seeds rather than favouring one', () => {
    const drawnRelations = new Set(
      problems('inequality-symbols').map((problem) => dataOf(problem, 'inequality-meaning').relation),
    )
    expect([...drawnRelations].sort()).toEqual([...RELATIONS].sort())
  })

  it('widens its bound with difficulty', () => {
    widensWithDifficulty('inequality-symbols', (p) => dataOf(p, 'inequality-meaning').bound)
  })

  it('never displays a frame label, so no slot is drawn beneath the statement', () => {
    for (const problem of problems('inequality-symbols')) {
      expect(equationOf(problem).variable).toBeUndefined()
    }
  })
})

describe('15.2 · graph-inequality', () => {
  it('derives the circle from strictness and the shading from direction', () => {
    for (const problem of problems('graph-inequality')) {
      const { relation, bound } = dataOf(problem, 'inequality-graph')
      const [circle, shading] = chosenId(problem).split('-')
      expect(circle).toBe(isStrict(relation) ? 'open' : 'closed')
      expect(shading).toBe(pointsUp(relation) ? 'right' : 'left')
      expect(equationOf(problem).text).toBe(statementOf(relation, bound))
    }
  })

  it('offers all four pairings of circle with direction', () => {
    for (const problem of problems('graph-inequality')) {
      expect(optionIds(problem).sort()).toEqual(
        ['closed-left', 'closed-right', 'open-left', 'open-right'],
      )
    }
  })

  it('draws negative boundaries at every difficulty', () => {
    // Otherwise "shaded right" is reliably "toward the bigger-looking number"
    // and the direction never has to be worked out.
    drawsBothSigns('graph-inequality', (problem) => dataOf(problem, 'inequality-graph').bound)
  })

  it('names the drawn boundary in every option label', () => {
    for (const problem of problems('graph-inequality')) {
      const { bound } = dataOf(problem, 'inequality-graph')
      for (const choice of problem.choices ?? []) {
        expect(choice.label).toContain(drawnBound(bound))
      }
    }
  })

  it('widens its boundary with difficulty', () => {
    widensWithDifficulty('graph-inequality', (p) => Math.abs(dataOf(p, 'inequality-graph').bound))
  })
})

/**
 * Read a statement back out of a choice id.
 *
 * The decode is written here rather than shared with the unit, so an id spelled
 * wrongly by the generator is spelled wrongly against a reader that does not
 * make the same mistake.
 */
const FROM_ASCII: Record<string, Relation> = { '<': '<', '<=': '≤', '>': '>', '>=': '≥' }

const parseStatement = (id: string): { relation: Relation; bound: number } => {
  const match = /^x(<=|>=|<|>)(-?\d+)$/.exec(id)
  if (!match) throw new Error(`not a statement id: ${id}`)
  return { relation: FROM_ASCII[match[1]], bound: Number(match[2]) }
}

const tagsOf = (problem: Problem): string[] => (problem.misconceptions ?? []).map((m) => m.tag)

const relationShown = (problem: Problem): Relation => {
  const data = equationOf(problem).equation
  if (!('relation' in data)) throw new Error(`${problem.skillId}: no relation carried`)
  return data.relation
}

describe('15.3 · solve-one-step-ineq', () => {
  it('predicts the repeated operation and the needless flip, both on screen', () => {
    for (const problem of problems('solve-one-step-ineq')) {
      expect(tagsOf(problem).sort()).toEqual(['flipped-without-a-negative', 'repeated-the-operation'])
    }
  })

  it('never reverses the relation, because nothing negative multiplies x', () => {
    for (const problem of problems('solve-one-step-ineq')) {
      const data = equationOf(problem).equation
      if (data.operation === 'inequality-multdiv') expect(data.coefficient).toBeGreaterThan(0)
      else expect(data.operation).toBe('inequality-addsub')
      expect(parseStatement(chosenId(problem)).relation).toBe(relationShown(problem))
    }
  })

  it('solves to a whole boundary on every draw', () => {
    for (const problem of problems('solve-one-step-ineq')) {
      expect(Number.isInteger(parseStatement(chosenId(problem)).bound)).toBe(true)
    }
  })

  it('draws both the add/subtract family and the multiply/divide family', () => {
    const operations = new Set(
      problems('solve-one-step-ineq').map((problem) => equationOf(problem).equation.operation),
    )
    expect([...operations].sort()).toEqual(['inequality-addsub', 'inequality-multdiv'])
  })

  it('widens the numbers it displays with difficulty', () => {
    widensWithDifficulty('solve-one-step-ineq', (problem) => {
      const data = equationOf(problem).equation
      return 'rightHand' in data ? Math.abs(data.rightHand) : 0
    })
  })
})

describe('15.4 · solve-multi-step-ineq', () => {
  it('predicts the wrong order and the needless flip, both on screen', () => {
    for (const problem of problems('solve-multi-step-ineq')) {
      expect(tagsOf(problem).sort()).toEqual(['flipped-without-a-negative', 'undid-in-the-wrong-order'])
    }
  })

  it('makes the wrong order a reachable whole number that is not the answer', () => {
    // The finding this skill exists around: `3x + 4 ≤ 19` mis-orders to a
    // fraction, so its whole diagnosis would be unofferable.
    for (const problem of problems('solve-multi-step-ineq')) {
      const data = dataOf(problem, 'inequality-two-step')
      const divided = data.rightHand / data.coefficient
      const wrongOrder = data.adds ? divided - data.constant : divided + data.constant
      expect(Number.isInteger(wrongOrder), `${data.rightHand} ÷ ${data.coefficient}`).toBe(true)
      const { relation, bound } = parseStatement(chosenId(problem))
      expect(wrongOrder).not.toBe(bound)
      expect(optionIds(problem)).toContain(statementId({ relation, bound: wrongOrder }))
    }
  })

  it('keeps the coefficient above one and the constant non-zero', () => {
    // At either boundary the two orders agree and the mistake disappears.
    for (const problem of problems('solve-multi-step-ineq')) {
      const data = dataOf(problem, 'inequality-two-step')
      expect(data.coefficient).toBeGreaterThan(1)
      expect(data.constant).not.toBe(0)
      expect(data.constant % data.coefficient).toBe(0)
    }
  })

  it('never reverses the relation', () => {
    for (const problem of problems('solve-multi-step-ineq')) {
      expect(parseStatement(chosenId(problem)).relation).toBe(relationShown(problem))
    }
  })
})

describe('15.5 · flip-the-sign', () => {
  it('always multiplies or divides by a negative, and always reverses', () => {
    for (const problem of problems('flip-the-sign')) {
      const data = dataOf(problem, 'inequality-multdiv')
      expect(data.coefficient).toBeLessThan(0)
      expect(parseStatement(chosenId(problem)).relation).toBe(REVERSED[data.relation])
    }
  })

  it('never solves to zero, so all four options stay distinct', () => {
    for (const problem of problems('flip-the-sign')) {
      expect(parseStatement(chosenId(problem)).bound).not.toBe(0)
    }
  })

  it('offers the four combinations of reversed-or-not by sign-kept-or-not', () => {
    for (const problem of problems('flip-the-sign')) {
      const { relation } = dataOf(problem, 'inequality-multdiv')
      const { bound } = parseStatement(chosenId(problem))
      expect(optionIds(problem).sort()).toEqual(
        [
          statementId({ relation: REVERSED[relation], bound }),
          statementId({ relation, bound }),
          statementId({ relation: REVERSED[relation], bound: -bound }),
          statementId({ relation, bound: -bound }),
        ].sort(),
      )
    }
  })

  it('draws both the multiply and the divide form', () => {
    const forms = new Set(problems('flip-the-sign').map((p) => dataOf(p, 'inequality-multdiv').multiplies))
    expect(forms).toEqual(new Set([true, false]))
  })

  it('solves negative on some draws and positive on others', () => {
    // Otherwise picking the option carrying a minus sign is right every time,
    // without reversing anything, on the skill built around the reversal.
    drawsBothSigns('flip-the-sign', (problem) => parseStatement(chosenId(problem)).bound)
  })

  it('predicts three distinct mistakes, none of them the answer', () => {
    for (const problem of problems('flip-the-sign')) {
      expect(tagsOf(problem).sort()).toEqual(['did-not-flip', 'kept-both', 'lost-the-sign'])
    }
  })
})

describe('15.6 · compound-inequalities', () => {
  const answerCount = (problem: Problem): number => {
    if (problem.answer.kind !== 'exact') throw new Error(`${problem.skillId}: expected an exact answer`)
    return problem.answer.n / problem.answer.d
  }

  const predictedCounts = (problem: Problem): number[] =>
    (problem.misconceptions ?? []).map((m) => m.value).filter((v): v is number => typeof v === 'number')

  it('answers on the keypad, not by choice', () => {
    for (const problem of problems('compound-inequalities')) {
      expect(problem.inputMode).toBe('keypad')
      expect(problem.choices).toBeUndefined()
    }
  })

  it('recomputes its count by testing every whole number in the stated range', () => {
    for (const problem of problems('compound-inequalities')) {
      const data = dataOf(problem, 'inequality-compound')
      let expected = 0
      for (let value = 0; value <= data.rangeMax; value += 1) {
        const first = holds(data.firstRelation, value, data.firstBound)
        const second = holds(data.secondRelation, value, data.secondBound)
        if (data.form === 'or' ? first || second : first && second) expected += 1
      }
      expect(answerCount(problem)).toBe(expected)
    }
  })

  it('states the range it counts over in the prompt', () => {
    for (const problem of problems('compound-inequalities')) {
      const { rangeMax } = dataOf(problem, 'inequality-compound')
      expect(problem.prompt).toContain(`0 to ${rangeMax}`)
    }
  })

  it('is satisfied by neither nothing nor everything', () => {
    for (const problem of problems('compound-inequalities')) {
      const { rangeMax } = dataOf(problem, 'inequality-compound')
      expect(answerCount(problem)).toBeGreaterThan(0)
      expect(answerCount(problem)).toBeLessThan(rangeMax + 1)
    }
  })

  it('draws all three statement forms', () => {
    const forms = new Set(
      problems('compound-inequalities').map((problem) => dataOf(problem, 'inequality-compound').form),
    )
    expect([...forms].sort()).toEqual(['and', 'between', 'or'])
  })

  it('carries both relations variable-first, whatever the form draws', () => {
    // A `between` draw renders its lower bound flipped. The payload must not be.
    for (const problem of problems('compound-inequalities')) {
      const data = dataOf(problem, 'inequality-compound')
      expect(data.firstBound).toBeLessThan(data.secondBound)
      if (data.form === 'or') {
        expect(['<', '≤']).toContain(data.firstRelation)
        expect(['>', '≥']).toContain(data.secondRelation)
      } else {
        expect(['>', '≥']).toContain(data.firstRelation)
        expect(['<', '≤']).toContain(data.secondRelation)
      }
    }
  })

  it('always leaves at least one bound strict, or the first prediction is the answer', () => {
    for (const problem of problems('compound-inequalities')) {
      const data = dataOf(problem, 'inequality-compound')
      expect(isStrict(data.firstRelation) || isStrict(data.secondRelation)).toBe(true)
    }
  })

  it('keeps both predictions alive, whole, and enterable on the pad', () => {
    for (const problem of problems('compound-inequalities')) {
      const { rangeMax } = dataOf(problem, 'inequality-compound')
      const predicted = predictedCounts(problem)
      // Two survive filtering, which the upper bound is drawn to guarantee: the
      // complement lands on neither the answer nor the loosened count.
      expect(predicted.length, equationOf(problem).text).toBe(2)
      expect(new Set(predicted).size).toBe(2)
      for (const value of predicted) {
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(rangeMax + 1)
        expect(value).not.toBe(answerCount(problem))
      }
    }
  })

  it('widens the range it counts over with difficulty', () => {
    widensWithDifficulty('compound-inequalities', (p) => dataOf(p, 'inequality-compound').rangeMax)
  })
})

describe('the chained form the snapshot seeds happen to miss', () => {
  /**
   * `between` is the one form whose text is not its payload read straight out:
   * the lower bound moves to the left of the variable and its relation turns
   * round with it. None of the five recorded seeds draws one, so the rendering
   * is pinned here instead of being left to chance.
   */
  it('draws a range with the lower bound on the left and its relation turned round', () => {
    const chained = problems('compound-inequalities').filter(
      (problem) => dataOf(problem, 'inequality-compound').form === 'between',
    )
    expect(chained.length).toBeGreaterThan(0)

    for (const problem of chained) {
      const data = dataOf(problem, 'inequality-compound')
      expect(equationOf(problem).text).toBe(
        `${data.firstBound} ${REVERSED[data.firstRelation]} x ${data.secondRelation} ${data.secondBound}`,
      )
      expect(equationOf(problem).text).not.toContain('and')
    }
  })

  it('counts a chained range exactly as it counts the same statement joined by and', () => {
    for (const problem of problems('compound-inequalities')) {
      const data = dataOf(problem, 'inequality-compound')
      if (data.form !== 'between') continue
      expect(satisfyingCount(data)).toBe(satisfyingCount({ ...data, form: 'and' }))
    }
  })
})

describe('every Unit 15 skill', () => {
  const choiceSkills = unit15.filter((skill) => skill.id !== 'compound-inequalities')

  it('displays a statement that already carries its relation', () => {
    for (const skill of unit15) {
      for (const problem of problems(skill.id)) {
        expect(problem.display.kind, skill.id).toBe('equation')
      }
    }
  })

  it('frames its slot exactly where the learner has something to type', () => {
    // The five choice skills answer a reading, a graph or a relation, and a
    // frame would claim a solution that is not on offer — 14b's finding, where
    // an unlabelled slot still echoed the choice's id.
    //
    // `compound-inequalities` is the other side of the same coin, and only the
    // browser said so: it has a keypad, and with the frame dropped the learner
    // pressed a digit and nothing moved. Its answer *is* a value of the label it
    // frames, so the claim the frame makes is true there.
    for (const skill of unit15) {
      for (const problem of problems(skill.id)) {
        const framed = equationOf(problem).variable
        if (problem.inputMode === 'keypad') expect(framed, skill.id).toBe('how many')
        else expect(framed, skill.id).toBeUndefined()
      }
    }
  })

  it('offers four distinct options with exactly one correct, wherever it offers any', () => {
    for (const skill of choiceSkills) {
      offersFourWithOneCorrect(skill.id)
      for (const problem of problems(skill.id)) {
        expect(problem.inputMode, skill.id).toBe('choice')
      }
    }
  })

  it('never predicts the correct option, which no central filter would catch here', () => {
    for (const skill of choiceSkills) predictionsAreWrongOptions(skill.id)
  })

  it('gives every predicted mistake a distinct tag', () => {
    for (const skill of unit15) {
      for (const problem of problems(skill.id)) {
        const tags = tagsOf(problem)
        expect(new Set(tags).size, skill.id).toBe(tags.length)
        expect(tags.length, skill.id).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('draws the typographic minus in every label and the plain one in every id', () => {
    for (const skill of choiceSkills) {
      for (const problem of problems(skill.id)) {
        for (const choice of problem.choices ?? []) {
          expect(choice.label, `${skill.id}: ${choice.label}`).not.toContain('-')
          expect(choice.id, `${skill.id}: ${choice.id}`).not.toContain('−')
        }
        expect(equationOf(problem).text, skill.id).not.toContain('-')
      }
    }
  })

  it('keeps every statement inside the equation row’s measured width', () => {
    // `coverage.test.ts` caps a plain equation row at 21 characters, measured in
    // the browser at 375px. Checked here too so a widening fails in the unit
    // that caused it.
    for (const skill of unit15) {
      for (const problem of problems(skill.id)) {
        expect(equationOf(problem).text.length, equationOf(problem).text).toBeLessThanOrEqual(21)
      }
    }
  })
})
