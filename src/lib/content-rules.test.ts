import { describe, expect, it } from 'vitest'
import {
  checkContent,
  checkTeachingLine,
  formatViolations,
  learnerText,
  teachingLineTerms,
  VOCABULARY,
} from './content-rules'
import { rational } from './rational'
import type { ContentLocation } from './content-rules'
import type { Problem, SolutionStep } from './types'

/**
 * Each rule is tested from both sides — a clean problem produces nothing, and a
 * violating one produces a message naming the skill and the specifics. A checker
 * that silently returns `[]` looks identical to clean content, so proving it
 * fires is the point.
 */

const at = (overrides: Partial<ContentLocation['skill']> = {}, unit = 'unit-1'): ContentLocation => ({
  skill: { id: 'test-skill', name: 'Test', blurb: 'test', ...overrides },
  unit: { id: unit },
})

const problem = (overrides: Partial<Problem> = {}): Problem => ({
  skillId: 'test-skill',
  prompt: 'What is the sum?',
  display: { kind: 'inline', text: '2 + 3' },
  answer: { kind: 'exact', n: 5, d: 1 },
  inputMode: 'keypad',
  hint: 'Count up from the bigger number.',
  solution: [{ text: 'Start at 3.' }, { text: 'Count up 2.', detail: '3 → 5' }],
  difficulty: 1,
  ...overrides,
})

const steps = (count: number): SolutionStep[] =>
  Array.from({ length: count }, (_, i) => ({ text: `Step ${i + 1}.` }))

describe('a problem that meets the contract', () => {
  it('collects root-pair answer values and input labels as learner-facing text', () => {
    const pair = problem({
      answer: { kind: 'root-pair', roots: [rational(-3, 4), rational(2, 1)] },
      inputMode: 'root-pair',
    })
    expect(learnerText(pair)).toEqual(expect.arrayContaining([
      'Root 1: −3/4',
      'Root 2: 2',
      'Root 1',
      'Root 2',
      'Check both roots',
    ]))
  })

  it('reports nothing', () => {
    expect(checkContent(problem(), at())).toEqual([])
  })

  it('accepts exactly four steps and a twelve-word step', () => {
    const twelve = 'One two three four five six seven eight nine ten eleven twelve'

    expect(
      checkContent(problem({ solution: [...steps(3), { text: twelve }] }), at()),
    ).toEqual([])
  })
})

describe('length limits', () => {
  it('rejects a fifth solution step', () => {
    const violations = checkContent(problem({ solution: steps(5) }), at())

    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('step-count')
    expect(violations[0].message).toContain('5 solution steps')
  })

  it('rejects a thirteen-word step, reporting the step and its count', () => {
    const thirteen = 'One two three four five six seven eight nine ten eleven twelve thirteen'
    const violations = checkContent(problem({ solution: [{ text: thirteen }] }), at())

    expect(violations).toHaveLength(1)
    expect(violations[0].rule).toBe('step-length')
    expect(violations[0].message).toContain('13 words')
    expect(violations[0].message).toContain(thirteen)
  })

  it('counts words in the step text only, not its detail', () => {
    const detail = 'this detail line is deliberately far longer than twelve words in total, easily'

    expect(checkContent(problem({ solution: [{ text: 'Add.', detail }] }), at())).toEqual([])
  })
})

describe('teaching lines', () => {
  it('accepts one sentence with at most one current-unit term', () => {
    const location = at({}, 'unit-0')
    expect(checkTeachingLine('A numeral shows a number.', location)).toEqual([])
    expect(teachingLineTerms('A numeral shows a number.', 'unit-0')).toEqual(['numeral'])
  })

  it('names an empty teaching line', () => {
    const violations = checkTeachingLine('   ', at({}, 'unit-0'))

    expect(violations.map((violation) => violation.rule)).toEqual(['empty-teaching-line'])
    expect(violations[0].message).toContain('teaching line is empty')
  })

  it('names a multi-sentence teaching line', () => {
    const violations = checkTeachingLine('Read the places. Then write the number.', at({}, 'unit-0'))

    expect(violations.map((violation) => violation.rule)).toEqual(['teaching-line-sentences'])
    expect(violations[0].message).toContain('2 sentences')
  })

  it('names a later-unit term used in a teaching line', () => {
    const violations = checkTeachingLine('A numerator is the top number.', at({}, 'unit-0'))

    expect(violations.map((violation) => violation.rule)).toEqual(['teaching-line-forward-reference'])
    expect(violations[0].message).toContain('"numerator"')
  })

  it('names multiple current-unit terms', () => {
    const violations = checkTeachingLine('A numeral uses rounding.', at({}, 'unit-0'))

    expect(violations.map((violation) => violation.rule)).toEqual(['teaching-line-vocabulary'])
    expect(violations[0].message).toContain('numeral, rounding')
  })

  it('does not require lines for generators outside the shipped increment', () => {
    expect(checkTeachingLine(undefined, at({}, 'unit-1'))).toEqual([])
  })
})

describe('the hint', () => {
  it('rejects two sentences', () => {
    const violations = checkContent(
      problem({ hint: 'Add the ones. Then the tens.' }),
      at(),
    )

    expect(violations.map((v) => v.rule)).toEqual(['hint-sentences'])
    expect(violations[0].message).toContain('2 sentences')
  })

  it('accepts a decimal, which is not a sentence break', () => {
    expect(checkContent(problem({ hint: 'Line up 0.5 and 1.28 by the point.' }), at())).toEqual(
      [],
    )
  })

  it('accepts one sentence with internal punctuation', () => {
    expect(
      checkContent(problem({ hint: 'Work right to left — ones, then tens.' }), at()),
    ).toEqual([])
  })

  it('rejects an empty hint', () => {
    expect(checkContent(problem({ hint: '   ' }), at()).map((v) => v.rule)).toEqual([
      'empty-hint',
    ])
  })
})

describe('the solution', () => {
  it('rejects no steps at all', () => {
    expect(checkContent(problem({ solution: [] }), at()).map((v) => v.rule)).toEqual([
      'empty-solution',
    ])
  })

  it('rejects a step with no text', () => {
    expect(
      checkContent(problem({ solution: [{ text: '' }] }), at()).map((v) => v.rule),
    ).toEqual(['empty-solution'])
  })
})

describe('wall skills', () => {
  const wall = at({ wall: true })

  it('need two distinct predicted misconceptions', () => {
    const violations = checkContent(
      problem({
        misconceptions: [{ value: 6, tag: 'off-by-one', nudge: 'One too many.' }],
      }),
      wall,
    )

    expect(violations.map((v) => v.rule)).toEqual(['wall-misconceptions'])
    expect(violations[0].message).toContain('predicts 1 distinct')
  })

  it('counts distinct tags, so two predictions of one mistake are one', () => {
    const violations = checkContent(
      problem({
        misconceptions: [
          { value: 6, tag: 'off-by-one', nudge: 'One too many.' },
          { value: 4, tag: 'off-by-one', nudge: 'One too few.' },
        ],
      }),
      wall,
    )

    expect(violations.map((v) => v.rule)).toEqual(['wall-misconceptions'])
  })

  it('pass with two different mistakes predicted', () => {
    expect(
      checkContent(
        problem({
          misconceptions: [
            { value: 6, tag: 'off-by-one', nudge: 'One too many.' },
            { value: 1, tag: 'subtracted', nudge: 'That is the difference.' },
          ],
        }),
        wall,
      ),
    ).toEqual([])
  })

  it('is not required of a skill that is not a wall', () => {
    expect(checkContent(problem({ misconceptions: [] }), at())).toEqual([])
  })
})

describe('forward references', () => {
  it('rejects a term from a later unit, naming the term and both units', () => {
    const violations = checkContent(
      problem({ hint: 'Compare the numerator of each side.' }),
      at({}, 'unit-1'),
    )

    expect(violations.map((v) => v.rule)).toEqual(['forward-reference'])
    expect(violations[0].message).toContain('"numerator"')
    expect(violations[0].message).toContain('unit 7')
    expect(violations[0].message).toContain('unit 1')
  })

  it('allows the same term once its unit has been reached', () => {
    expect(
      checkContent(problem({ hint: 'Compare the numerator of each side.' }), at({}, 'unit-7')),
    ).toEqual([])
    expect(
      checkContent(problem({ hint: 'Compare the numerator of each side.' }), at({}, 'unit-9')),
    ).toEqual([])
  })

  it('checks misconception nudges and prompts, not just the hint', () => {
    const fromNudge = checkContent(
      problem({
        misconceptions: [{ value: 6, tag: 'x', nudge: 'That is the slope, not the total.' }],
      }),
      at(),
    )
    const fromPrompt = checkContent(problem({ prompt: 'Find the percent.' }), at())

    expect(fromNudge.map((v) => v.rule)).toEqual(['forward-reference'])
    expect(fromPrompt.map((v) => v.rule)).toEqual(['forward-reference'])
  })

  it('checks learner-facing inline display text', () => {
    const violations = checkContent(
      problem({ display: { kind: 'inline', text: 'Find the numerator' } }),
      at({}, 'unit-1'),
    )

    expect(violations.map((v) => v.rule)).toEqual(['forward-reference'])
    expect(violations[0].message).toContain('Find the numerator')
  })

  it('checks the authored label instead of walking visual math nodes', () => {
    const violations = checkContent(
      problem({
        display: {
          kind: 'math',
          notation: { kind: 'text', value: 'x' },
          label: 'Find the exponent',
        },
      }),
      at({}, 'unit-1'),
    )

    expect(violations.map((v) => v.rule)).toEqual(['forward-reference'])
    expect(violations[0].message).toContain('Find the exponent')
  })

  it('reads a diagram name from its mathematical data', () => {
    expect(
      checkContent(
        problem({
          display: {
            kind: 'diagram',
            diagram: { kind: 'circle', parts: 4, shadedParts: 3 },
          },
        }),
        at({}, 'unit-7'),
      ),
    ).toEqual([])
  })

  it('collects geometry names, units, and formula choices as learner text', () => {
    const geometry: Problem['display'] = {
      kind: 'diagram',
      diagram: { kind: 'geometry', operation: 'area-triangle', base: 6, height: 4, unit: 'ft' },
    }
    const learner = learnerText(problem({ display: geometry }))

    expect(learner).toContain(
      'Triangle with base 6 ft and perpendicular height 4 ft; ' +
        'A equals b times h; A equals b times h divided by 2',
    )
    expect(checkContent(problem({ display: geometry }), at({}, 'unit-20'))).toEqual([])
  })

  it('reads a coordinate-plane name from its mathematical data', () => {
    const graph: Problem['display'] = {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: 5, step: 1 },
        y: { min: -5, max: 5, step: 1 },
        points: [{ x: -2, y: 1 }],
        lines: [{ through: [{ x: 0, y: 1 }, { x: 2, y: 3 }] }],
      },
    }
    const tooEarly = checkContent(problem({ display: graph }), at({}, 'unit-15'))

    expect(tooEarly.map((violation) => violation.rule)).toEqual(['forward-reference'])
    expect(tooEarly[0].message).toContain('Coordinate plane')
    expect(checkContent(problem({ display: graph }), at({}, 'unit-16'))).toEqual([])
  })

  it('collects chart titles, axes, categories, series, and values from one declaration', () => {
    const chart: Problem['display'] = {
      kind: 'chart',
      chart: {
        title: 'Median by group',
        xLabel: 'Group',
        yLabel: 'Value',
        kind: 'bar',
        labels: ['A', 'B'],
        y: { min: 0, max: 10, step: 5 },
        series: [{ label: 'Scores', values: [4, 7] }],
      },
    }
    const learner = learnerText(problem({ display: chart }))

    expect(learner).toContain('Median by group; Group; Value; A; B; Scores; 4; 7')
    expect(checkContent(problem({ display: chart }), at({}, 'unit-21'))).toEqual([])
    expect(checkContent(problem({ display: chart }), at({}, 'unit-20')).map((v) => v.rule)).toEqual([
      'forward-reference',
    ])
  })

  it('collects every visible statistics value and weight', () => {
    const values: Problem['display'] = {
      kind: 'story',
      text: 'Values: −4, 6, 8',
      statistics: { operation: 'median', values: [-4, 6, 8] },
    }
    const weighted: Problem['display'] = {
      kind: 'story',
      text: 'Values with weights: 60 (weight 1), 75 (weight 2)',
      statistics: {
        operation: 'weighted-mean',
        entries: [{ value: 60, weight: 1 }, { value: 75, weight: 2 }],
      },
    }

    expect(learnerText(problem({ display: values }))).toContain('Values: −4, 6, 8; −4; 6; 8')
    expect(learnerText(problem({ display: weighted }))).toContain(
      'Values with weights: 60 (weight 1), 75 (weight 2); 60; 1; 75; 2',
    )
  })

  it('reads coordinate operation context from its structured values', () => {
    const graph: Problem['display'] = {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: 5, step: 1 },
        y: { min: -5, max: 5, step: 1 },
        points: [],
        lines: [],
      },
      coordinate: {
        operation: 'table-to-graph',
        rows: [{ x: -2, y: -1 }, { x: 0, y: 1 }, { x: 2, y: 3 }],
        targetX: 2,
      },
    }

    expect(checkContent(problem({ display: graph }), at({}, 'unit-16'))).toEqual([])
  })

  it('includes every linear-equation source value in learner text', () => {
    const graph: Problem['display'] = {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: 5, step: 1 },
        y: { min: -5, max: 5, step: 1 },
        points: [],
        lines: [{ through: [{ x: 0, y: -3 }, { x: 1, y: -1 }] }],
      },
      coordinate: { operation: 'slope-intercept', slope: 2, intercept: -3, asks: 'slope' },
    }

    expect(checkContent(problem({ display: graph }), at({}, 'unit-16'))).toEqual([])
    const tooEarly = checkContent(problem({ display: graph }), at({}, 'unit-15'))
    expect(tooEarly.map((violation) => violation.rule)).toContain('forward-reference')
    expect(tooEarly.map((violation) => violation.message).join(' ')).toContain('y = 2x − 3')
  })

  it('matches plurals but not words that merely contain a term', () => {
    const plural = checkContent(problem({ hint: 'Add the exponents together.' }), at())
    // "primer" contains "prime"; a substring match would flag it.
    const substring = checkContent(problem({ hint: 'Read the primer for this step.' }), at())

    expect(plural.map((v) => v.rule)).toEqual(['forward-reference'])
    expect(substring).toEqual([])
  })

  it('leaves everyday arithmetic words out of the map on purpose', () => {
    // Including these would bury real hits under noise — "difference" in a Unit 1
    // subtraction nudge is how the early units talk, not jargon debt.
    for (const word of ['sum', 'difference', 'product', 'carry', 'borrow', 'column'])
      expect(VOCABULARY.has(word)).toBe(false)
  })
})

describe('reporting', () => {
  it('returns every violation, not just the first', () => {
    const violations = checkContent(
      problem({ hint: 'Two sentences. Right here.', solution: steps(5) }),
      at(),
    )

    expect(violations.map((v) => v.rule).sort()).toEqual(['hint-sentences', 'step-count'])
  })

  it('formats one actionable line per violation', () => {
    const violations = checkContent(problem({ solution: steps(5) }), at())

    expect(formatViolations(violations)).toEqual([
      'test-skill [step-count] 5 solution steps, limit is 4',
    ])
  })
})
