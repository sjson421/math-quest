import { describe, expect, it } from 'vitest'
import { diagnose, generateProblem } from './generator'
import type { Difficulty, Misconception, Problem, SkillGenerator } from './types'

/**
 * The central misconception filter, tested where it lives.
 *
 * `generators.test.ts` used to assert "no prediction equals the answer" and "no
 * duplicate values" over the output of `generateProblem()` — which is to say,
 * over output this filter had already cleaned. Those assertions could not fail
 * whatever a generator authored, which is the failure mode the repository warns
 * about: a checker that returns "no problems" looks exactly like a clean
 * codebase.
 *
 * The guarantee is real, but it is made here rather than by any generator, so
 * this is where it is checked — against synthetic skills that deliberately
 * author the bad cases.
 */

const miss = (value: number, tag: string): Misconception => ({
  value,
  tag,
  nudge: `nudge for ${tag}`,
})

/** A skill that predicts exactly what the test tells it to, ignoring the rng. */
function skillPredicting(misconceptions: Misconception[], answer = 12): SkillGenerator {
  return {
    id: 'synthetic',
    name: 'Synthetic',
    blurb: 'For testing the filter',
    generate(_rng, difficulty) {
      return {
        skillId: 'synthetic',
        prompt: 'What is the sum?',
        display: { kind: 'inline', text: '7 + 5' },
        answer: { kind: 'exact', n: answer, d: 1 },
        inputMode: 'keypad',
        misconceptions,
        hint: 'Add them.',
        solution: [{ text: 'Add 7 and 5.' }],
        difficulty,
      }
    },
  }
}

const tagsOf = (problem: Problem) => (problem.misconceptions ?? []).map((m) => m.tag)

describe('generateProblem drops predictions that cannot help', () => {
  it('drops one that equals the correct answer', () => {
    // The case the filter exists for: `forgot-carry` predicts the true sum
    // whenever no carry actually occurs, and answering correctly must never be
    // diagnosed as a mistake.
    const skill = skillPredicting([miss(12, 'equals-answer'), miss(11, 'off-by-one')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['off-by-one'])
  })

  it('keeps the first of two predictions sharing a value', () => {
    // `sub-2digit-borrow` predicts 25 twice for 31 − 16. One diagnosis reaches
    // the learner, and it must be a stable choice rather than whichever the
    // Set happened to hold.
    const skill = skillPredicting([miss(25, 'flipped'), miss(25, 'unreduced'), miss(9, 'other')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['flipped', 'other'])
  })

  it('drops a value that is not a finite number', () => {
    const skill = skillPredicting([
      miss(Number.NaN, 'not-a-number'),
      miss(Number.POSITIVE_INFINITY, 'infinite'),
      miss(11, 'fine'),
    ])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['fine'])
  })

  it('can empty the list entirely', () => {
    // Not hypothetical: `add-2digit-nocarry` shipped in this state, predicting
    // one value that was structurally always the answer. Nothing reported it,
    // which is why `generators.test.ts` now checks that a declared tag survives.
    const skill = skillPredicting([miss(12, 'always-the-answer')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual([])
  })

  it('leaves a clean list untouched, in order', () => {
    const declared = [miss(11, 'low'), miss(13, 'high'), miss(2, 'subtracted')]

    expect(tagsOf(generateProblem(skillPredicting(declared), 1, 1))).toEqual([
      'low',
      'high',
      'subtracted',
    ])
  })

  it('passes a problem with no predictions straight through', () => {
    const problem = generateProblem(skillPredicting([]), 1, 1)

    expect(problem.misconceptions).toEqual([])
    expect(problem.prompt).toBe('What is the sum?')
  })

  it('carries the keypad rules on both paths through the filter', () => {
    // Named separately from the case below because that one compares against a
    // fixture with no rules on it, so it cannot see this field go missing. A
    // problem that loses its rules is offered on a pad its own answer cannot be
    // typed into — the sign key is gone and the answer is negative.
    const withRules = (misconceptions: Misconception[]): SkillGenerator => {
      const base = skillPredicting(misconceptions)
      return {
        ...base,
        generate: (rng, difficulty) => ({
          ...base.generate(rng, difficulty),
          keypad: { allowNegative: true },
        }),
      }
    }

    // The rebuild path, where a prediction was filtered out.
    expect(generateProblem(withRules([miss(12, 'dropped'), miss(11, 'kept')]), 1, 1).keypad).toEqual(
      { allowNegative: true },
    )
    // And the early return, which skips the rebuild entirely.
    expect(generateProblem(withRules([]), 1, 1).keypad).toEqual({ allowNegative: true })
  })

  it('changes nothing else about the problem', () => {
    // The filter rebuilds the object, so this pins that it rebuilds it faithfully.
    const skill = skillPredicting([miss(12, 'dropped'), miss(11, 'kept')])
    const { misconceptions: _raw, ...beforeRest } = skill.generate(
      { next: () => 0 } as never,
      1 as Difficulty,
    )
    const { misconceptions: _filtered, ...afterRest } = generateProblem(skill, 1, 1)

    expect(afterRest).toEqual(beforeRest)
  })

  it('compares against the answer as a value, not as a written form', () => {
    // The answer is a rational, so 24/2 is 12 and a prediction of 12 is the
    // answer however the generator chose to spell it.
    const skill: SkillGenerator = {
      ...skillPredicting([miss(12, 'equals-answer'), miss(11, 'off-by-one')]),
      generate(rng, difficulty) {
        const problem = skillPredicting([
          miss(12, 'equals-answer'),
          miss(11, 'off-by-one'),
        ]).generate(rng, difficulty)
        return { ...problem, answer: { kind: 'exact', n: 24, d: 2 } }
      },
    }

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['off-by-one'])
  })
})

describe('diagnose', () => {
  const problem = generateProblem(
    skillPredicting([miss(11, 'off-by-one-low'), miss(2, 'subtracted')]),
    1,
    1,
  )

  it('names the mistake a wrong entry matches', () => {
    expect(diagnose(problem, '11')?.tag).toBe('off-by-one-low')
    expect(diagnose(problem, '2')?.tag).toBe('subtracted')
  })

  it('returns nothing for a wrong answer it did not predict', () => {
    expect(diagnose(problem, '99')).toBeUndefined()
  })

  it('returns nothing for an entry that is not a number', () => {
    expect(diagnose(problem, '')).toBeUndefined()
    expect(diagnose(problem, 'twelve')).toBeUndefined()
  })

  it('cannot match a prediction the filter removed', () => {
    // The two halves meeting: a dropped prediction must not come back as a
    // diagnosis, or a correct answer would be explained as a mistake.
    const filtered = generateProblem(skillPredicting([miss(12, 'equals-answer')]), 1, 1)

    expect(diagnose(filtered, '12')).toBeUndefined()
  })
})
