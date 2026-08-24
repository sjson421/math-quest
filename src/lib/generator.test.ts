import { describe, expect, it } from 'vitest'
import { diagnose, generateProblem } from './generator'
import { rational, type Rational } from './rational'
import { encodeRootPairEntry } from './root-pair'
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

const missText = (value: string, tag: string): Misconception => ({
  value: { kind: 'text', value },
  tag,
  nudge: `nudge for ${tag}`,
})

const missPoint = (x: number, y: number, tag: string): Misconception => ({
  value: { kind: 'point', x, y },
  tag,
  nudge: `nudge for ${tag}`,
})

const missRootPair = (first: Rational, second: Rational, tag: string): Misconception => ({
  value: { kind: 'root-pair', roots: [first, second] },
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

function choiceSkill(id: string, misconceptions: Misconception[]): SkillGenerator {
  return {
    ...skillPredicting(misconceptions),
    generate(rng, difficulty) {
      const problem = skillPredicting(misconceptions).generate(rng, difficulty)
      return {
        ...problem,
        answer: { kind: 'choice', id },
        inputMode: 'choice',
        choices: [
          { id, label: 'Expected' },
          { id: 'other', label: 'Other' },
        ],
      }
    },
  }
}

function pointSkill(
  answer: { x: number; y: number },
  misconceptions: Misconception[],
  step = 1,
): SkillGenerator {
  return {
    id: 'synthetic-point',
    name: 'Synthetic Point',
    blurb: 'For testing point input',
    generate(_rng, difficulty) {
      return {
        skillId: 'synthetic-point',
        prompt: 'Plot the point.',
        display: {
          kind: 'coordinate-plane',
          plane: {
            x: { min: -4, max: 4, step },
            y: { min: -4, max: 4, step },
            points: [],
            lines: [],
          },
        },
        answer: { kind: 'point', ...answer },
        inputMode: 'coordinate-plane',
        misconceptions,
        hint: 'Read x first, then y.',
        solution: [{ text: 'Move across, then up or down.' }],
        difficulty,
      }
    },
  }
}

function rootPairSkill(misconceptions: Misconception[]): SkillGenerator {
  return {
    id: 'synthetic-root-pair',
    name: 'Synthetic Root Pair',
    blurb: 'For testing root pairs',
    generate(_rng, difficulty) {
      return {
        skillId: 'synthetic-root-pair',
        prompt: 'Find both roots.',
        display: { kind: 'inline', text: 'x² − x − 12' },
        answer: {
          kind: 'root-pair',
          roots: [rational(-3, 1), rational(4, 1)],
        },
        inputMode: 'root-pair',
        keypad: { allowNegative: true, allowFraction: true },
        misconceptions,
        hint: 'Find both values that make zero.',
        solution: [{ text: 'Set each factor equal to zero.' }],
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

  it('drops a prediction matching a numeric choice id', () => {
    const skill = choiceSkill('1', [miss(1, 'equals-choice'), miss(2, 'other-choice')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['other-choice'])
  })

  it('keeps numeric predictions when the choice id is opaque', () => {
    const skill = choiceSkill('right-choice', [miss(1, 'numeric-mistake')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['numeric-mistake'])
  })

  it('carries a non-numeric prediction through unfiltered', () => {
    const skill = skillPredicting([missText('2x + 3', 'did-not-distribute')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['did-not-distribute'])
  })

  it('drops a blank or whitespace-only non-numeric prediction', () => {
    const skill = skillPredicting([missText('', 'blank'), missText('   ', 'also-blank'), missText('2x', 'kept')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['kept'])
  })

  it('keeps the first of two non-numeric predictions sharing a value', () => {
    const skill = skillPredicting([missText('2x + 3', 'first'), missText('2x + 3', 'second'), missText('3x', 'other')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['first', 'other'])
  })

  it('does not let a numeric and a non-numeric prediction collide', () => {
    // Value 5 and text "5" look alike but must not dedup or filter against
    // each other — each kind's Set is independent.
    const skill = skillPredicting([miss(5, 'numeric-five'), missText('5', 'text-five')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['numeric-five', 'text-five'])
  })

  it('drops a point prediction equal to the point answer', () => {
    const skill = pointSkill(
      { x: 3, y: 2 },
      [missPoint(3, 2, 'equals-answer'), missPoint(2, 3, 'swapped')],
    )

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['swapped'])
  })

  it('deduplicates ordered points without colliding with a swapped point', () => {
    const skill = pointSkill(
      { x: 0, y: 0 },
      [
        missPoint(3, 2, 'first'),
        missPoint(3, 2, 'duplicate'),
        missPoint(2, 3, 'swapped'),
      ],
    )

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['first', 'swapped'])
  })

  it('drops invalid and unreachable point predictions', () => {
    const skill = pointSkill(
      { x: 2, y: 2 },
      [
        missPoint(Number.NaN, 2, 'not-finite'),
        missPoint(1.5, 2, 'not-integer'),
        missPoint(1, 2, 'between-ticks'),
        missPoint(6, 2, 'out-of-bounds'),
        missPoint(-2, 2, 'reachable'),
      ],
      2,
    )

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['reachable'])
  })

  it('drops a point prediction when no coordinate input surface can reach it', () => {
    const skill = skillPredicting([missPoint(3, 2, 'no-point-surface')])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual([])
  })

  it('keeps numeric, text, and point prediction kinds independent', () => {
    const skill = pointSkill(
      { x: 0, y: 0 },
      [miss(3, 'numeric'), missText('3,0', 'text'), missPoint(3, 0, 'point')],
    )

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['numeric', 'text', 'point'])
  })

  it('drops answer-equal and reversed duplicate root-pair predictions', () => {
    const skill = rootPairSkill([
      missRootPair(rational(4, 1), rational(-3, 1), 'equals-answer'),
      missRootPair(rational(-3, 2), rational(5, 2), 'first'),
      missRootPair({ n: 10, d: 4 }, { n: -6, d: 4 }, 'reversed-equivalent'),
      missRootPair(rational(-3, 1), rational(-3, 1), 'repeated-root'),
    ])

    expect(tagsOf(generateProblem(skill, 1, 1))).toEqual(['first', 'repeated-root'])
  })

  it('drops malformed root pairs and pairs on another input surface', () => {
    const malformed = [
      missRootPair({ n: Number.POSITIVE_INFINITY, d: 1 }, rational(2, 1), 'infinite'),
      missRootPair({ n: 1, d: 0 }, rational(2, 1), 'zero-denominator'),
    ]
    expect(tagsOf(generateProblem(rootPairSkill(malformed), 1, 1))).toEqual([])
    expect(tagsOf(generateProblem(skillPredicting([
      missRootPair(rational(1, 1), rational(2, 1), 'wrong-surface'),
    ]), 1, 1))).toEqual([])
  })

  it('rejects a point answer the declared lattice cannot place', () => {
    expect(() => generateProblem(pointSkill({ x: 1, y: 2 }, [], 2), 1, 1)).toThrow(
      'synthetic-point: point answer must be a declared lattice target',
    )
  })

  it('rejects mismatched point answer and input declarations', () => {
    const wrongDisplay: SkillGenerator = {
      ...pointSkill({ x: 2, y: 2 }, []),
      generate(rng, difficulty) {
        const problem = pointSkill({ x: 2, y: 2 }, []).generate(rng, difficulty)
        return { ...problem, display: { kind: 'inline', text: '(2, 2)' } }
      },
    }
    const wrongMode: SkillGenerator = {
      ...pointSkill({ x: 2, y: 2 }, []),
      generate(rng, difficulty) {
        const problem = pointSkill({ x: 2, y: 2 }, []).generate(rng, difficulty)
        return { ...problem, inputMode: 'keypad' }
      },
    }

    expect(() => generateProblem(wrongDisplay, 1, 1)).toThrow(
      'coordinate-plane input needs a coordinate-plane display',
    )
    expect(() => generateProblem(wrongMode, 1, 1)).toThrow(
      'point answer needs coordinate-plane input',
    )
  })

  it('rejects mismatched root-pair answer and input declarations', () => {
    const rootAnswerOnKeypad: SkillGenerator = {
      ...rootPairSkill([]),
      generate(rng, difficulty) {
        return { ...rootPairSkill([]).generate(rng, difficulty), inputMode: 'keypad' }
      },
    }
    const scalarAnswerOnPairInput: SkillGenerator = {
      ...rootPairSkill([]),
      generate(rng, difficulty) {
        return {
          ...rootPairSkill([]).generate(rng, difficulty),
          answer: { kind: 'exact', n: 4, d: 1 },
        }
      },
    }

    expect(() => generateProblem(rootAnswerOnKeypad, 1, 1)).toThrow(
      'root-pair answer needs root-pair input',
    )
    expect(() => generateProblem(scalarAnswerOnPairInput, 1, 1)).toThrow(
      'root-pair input needs a root-pair answer',
    )
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

  it('matches fractions and decimals through the answer parser', () => {
    const fractional = generateProblem(
      skillPredicting([miss(0.5, 'one-half'), miss(0.25, 'one-quarter')], 1),
      1,
      1,
    )

    expect(diagnose(fractional, '1/2')?.tag).toBe('one-half')
    expect(diagnose(fractional, '2/4')?.tag).toBe('one-half')
    expect(diagnose(fractional, '0.25')?.tag).toBe('one-quarter')
  })

  it('matches a mixed-number entry through the answer parser', () => {
    const fractional = generateProblem(
      skillPredicting([miss(1.5, 'one-and-a-half'), miss(3.25, 'three-and-a-quarter')], 1),
      1,
      1,
    )

    expect(diagnose(fractional, '1 1/2')?.tag).toBe('one-and-a-half')
    expect(diagnose(fractional, '3 1/4')?.tag).toBe('three-and-a-quarter')
  })

  it('returns nothing for a wrong answer it did not predict', () => {
    expect(diagnose(problem, '99')).toBeUndefined()
  })

  it('returns nothing for an entry that is not a number', () => {
    expect(diagnose(problem, '')).toBeUndefined()
    expect(diagnose(problem, 'twelve')).toBeUndefined()
    expect(diagnose(problem, '5/')).toBeUndefined()
  })

  it('cannot match a prediction the filter removed', () => {
    // The two halves meeting: a dropped prediction must not come back as a
    // diagnosis, or a correct answer would be explained as a mistake.
    const filtered = generateProblem(skillPredicting([miss(12, 'equals-answer')]), 1, 1)

    expect(diagnose(filtered, '12')).toBeUndefined()
  })

  it('matches a non-numeric prediction by trimmed exact text', () => {
    const withText = generateProblem(skillPredicting([missText('2x + 3', 'did-not-distribute')]), 1, 1)

    expect(diagnose(withText, '2x + 3')?.tag).toBe('did-not-distribute')
    expect(diagnose(withText, '  2x + 3  ')?.tag).toBe('did-not-distribute')
    expect(diagnose(withText, '2x+3')).toBeUndefined()
  })

  it('matches a structured point by exact coordinate order', () => {
    const problem = generateProblem(
      pointSkill({ x: 3, y: 2 }, [missPoint(2, 3, 'swapped'), missPoint(-1, 4, 'other')]),
      1,
      1,
    )

    expect(diagnose(problem, '2,3')?.tag).toBe('swapped')
    expect(diagnose(problem, '-1,4')?.tag).toBe('other')
    expect(diagnose(problem, '3,2')).toBeUndefined()
    expect(diagnose(problem, '(2, 3)')).toBeUndefined()
    expect(diagnose(problem, '4,4')).toBeUndefined()
  })

  it('matches an exact root-pair prediction in either order', () => {
    const problem = generateProblem(rootPairSkill([
      missRootPair(rational(-3, 1), rational(-3, 1), 'repeated-root'),
      missRootPair(rational(-2, 1), rational(6, 1), 'other'),
    ]), 1, 1)

    expect(diagnose(problem, encodeRootPairEntry(['-3', '-3']))?.tag).toBe('repeated-root')
    expect(diagnose(problem, encodeRootPairEntry(['6', '-2']))?.tag).toBe('other')
    expect(diagnose(problem, encodeRootPairEntry(['-2', '5/']))).toBeUndefined()
    expect(diagnose(problem, 'not-a-pair')).toBeUndefined()
  })
})
