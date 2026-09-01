import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { intAnswer } from '../lib/answer'
import type { KeypadRules } from '../lib/keypad'
import { rational } from '../lib/rational'
import { encodeRootPairEntry } from '../lib/root-pair'
import type { Choice, Difficulty, SkillGenerator } from '../lib/types'
import { Lesson, LessonComplete, ReviewLesson } from './Lesson'

/**
 * The lesson's first paint, rendered to a string in the node environment.
 *
 * This covers one thing `Keypad.test.tsx` cannot: that a problem's declared
 * rules actually travel from the generator to the pad. The pad is the single
 * owner of those rules, so the only way they can be lost is the lesson failing
 * to hand them over — one prop, and every positive case below fails without it.
 *
 * Interaction is out of reach: a static render attaches no handlers, so what
 * happens after Check is pressed stays covered by the pure submit and lesson
 * session policies the component reads.
 */

/** A skill whose every problem carries the rules under test, ignoring the rng. */
const skillNeeding = (
  keypad?: KeypadRules,
  id = 'synthetic',
  generated?: Difficulty[],
): SkillGenerator => ({
  id,
  name: 'Synthetic',
  blurb: 'For testing the wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => {
    generated?.push(difficulty)
    return {
      skillId: id,
      prompt: 'What is the sum?',
      display: { kind: 'inline', text: '−3 + −5' },
      answer: intAnswer(-8),
      inputMode: 'keypad',
      keypad,
      hint: 'Add the sizes, keep the sign.',
      solution: [{ text: 'Add 3 and 5.' }],
      difficulty,
    }
  },
})

const render = (keypad?: KeypadRules) =>
  renderToStaticMarkup(<Lesson skill={skillNeeding(keypad)} onExit={() => {}} />)

const answerChoices: Choice[] = [
  { id: 'less-than-id', label: 'Less than' },
  { id: 'equal-to-id', label: 'Equal to' },
  { id: 'greater-than-id', label: 'Greater than' },
]

const choiceSkill: SkillGenerator = {
  id: 'synthetic-choice',
  name: 'Synthetic Choice',
  blurb: 'For testing choice wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-choice',
    prompt: 'How do these compare?',
    display: { kind: 'inline', text: '4 ? 7' },
    answer: { kind: 'choice', id: 'less-than-id' },
    inputMode: 'choice',
    choices: answerChoices,
    hint: 'Read the values from left to right.',
    solution: [{ text: 'Four is less than seven.' }],
    difficulty,
  }),
}

const numberLineSkill: SkillGenerator = {
  id: 'synthetic-number-line',
  name: 'Synthetic Number Line',
  blurb: 'For testing number-line wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-number-line',
    prompt: 'Where does −3 sit?',
    display: { kind: 'inline', text: '−3' },
    answer: intAnswer(-3),
    inputMode: 'number-line',
    numberLine: { start: rational(-5, 1), step: rational(1, 1), count: 11 },
    hint: 'Count left from zero.',
    solution: [{ text: 'Step three places below zero.' }],
    difficulty,
  }),
}

const diagramSkill: SkillGenerator = {
  id: 'synthetic-diagram',
  name: 'Synthetic Diagram',
  blurb: 'For testing diagram wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-diagram',
    prompt: 'What fraction is shaded?',
    display: {
      kind: 'diagram',
      diagram: { kind: 'circle', parts: 4, shadedParts: 3 },
    },
    answer: { kind: 'exact', n: 3, d: 4 },
    inputMode: 'keypad',
    keypad: { allowFraction: true },
    hint: 'Count all parts, then shaded parts.',
    solution: [{ text: 'Three of four parts are shaded.' }],
    difficulty,
  }),
}

const chartDisplay = {
  kind: 'chart' as const,
  chart: {
    title: 'Monthly output',
    xLabel: 'Month',
    yLabel: 'Units',
    kind: 'bar' as const,
    labels: ['Jan', 'Feb', 'Mar'],
    y: { min: 0, max: 20, step: 5 },
    series: [{ label: 'North', values: [4, 12, 8] }],
  },
}

const chartKeypadSkill: SkillGenerator = {
  id: 'synthetic-chart-keypad',
  name: 'Synthetic Chart Keypad',
  blurb: 'For testing chart keypad wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-chart-keypad',
    prompt: 'What value appears in February?',
    display: chartDisplay,
    answer: intAnswer(12),
    inputMode: 'keypad',
    hint: 'Read the February column.',
    solution: [{ text: 'The February value is 12.' }],
    difficulty,
  }),
}

const chartChoiceSkill: SkillGenerator = {
  id: 'synthetic-chart-choice',
  name: 'Synthetic Chart Choice',
  blurb: 'For testing chart choice wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-chart-choice',
    prompt: 'Which month is highest?',
    display: chartDisplay,
    answer: { kind: 'choice', id: 'february' },
    inputMode: 'choice',
    choices: [
      { id: 'january', label: 'January' },
      { id: 'february', label: 'February' },
      { id: 'march', label: 'March' },
    ],
    hint: 'Compare the three bars.',
    solution: [{ text: 'February has the tallest bar.' }],
    difficulty,
  }),
}

const coordinatePlaneChoiceSkill: SkillGenerator = {
  id: 'synthetic-coordinate-plane-choice',
  name: 'Synthetic Coordinate Plane Choice',
  blurb: 'For testing graph wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-coordinate-plane-choice',
    prompt: 'How does this line move?',
    display: {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: 5, step: 1 },
        y: { min: -5, max: 5, step: 1 },
        points: [],
        lines: [{ through: [{ x: 0, y: 1 }, { x: 2, y: 3 }] }],
      },
    },
    answer: { kind: 'choice', id: 'greater-than-id' },
    inputMode: 'choice',
    choices: answerChoices,
    hint: 'Read the line from left to right.',
    solution: [{ text: 'The line rises.' }],
    difficulty,
  }),
}

const coordinatePlaneInputSkill: SkillGenerator = {
  id: 'synthetic-coordinate-plane-input',
  name: 'Synthetic Coordinate Plane Input',
  blurb: 'For testing point wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-coordinate-plane-input',
    prompt: 'Plot (3, 2).',
    display: {
      kind: 'coordinate-plane',
      plane: {
        x: { min: -5, max: 5, step: 1 },
        y: { min: -5, max: 5, step: 1 },
        points: [],
        lines: [],
      },
    },
    answer: { kind: 'point', x: 3, y: 2 },
    inputMode: 'coordinate-plane',
    hint: 'Read x first, then y.',
    solution: [{ text: 'Move across, then up.' }],
    difficulty,
  }),
}

const expressionSkill = (maxDegree?: 2): SkillGenerator => ({
  id: 'synthetic-expression',
  name: 'Synthetic Expression',
  blurb: 'For testing expression wiring',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-expression',
    prompt: 'Write the expression.',
    display: { kind: 'inline', text: 'A quadratic in y' },
    answer: {
      kind: 'expression',
      canonical: maxDegree === 2 ? 'y² + 2y + 1' : '2y + 1',
      variable: 'y',
      form: 'expanded',
      maxDegree,
    },
    inputMode: 'expression',
    hint: 'Use the terms shown.',
    solution: [{ text: 'Write each term.' }],
    difficulty,
  }),
})

const rootPairSkill: SkillGenerator = {
  id: 'synthetic-root-pair',
  name: 'Synthetic Root Pair',
  blurb: 'For testing root input',
  teachingLine: '',
  generate: (_rng, difficulty) => ({
    skillId: 'synthetic-root-pair',
    prompt: 'Find both roots.',
    display: { kind: 'inline', text: 'x² − x − 12' },
    answer: { kind: 'root-pair', roots: [rational(-3, 1), rational(4, 1)] },
    inputMode: 'root-pair',
    keypad: { allowNegative: true, allowFraction: true },
    hint: 'Find both values that make zero.',
    solution: [{ text: 'Set each factor equal to zero.' }],
    difficulty,
  }),
}

const has = (html: string, label: string) => html.includes(`aria-label="${label}"`)

describe('Lesson', () => {
  it('starts a review from selected generators with mixed progress and first input mode', () => {
    const html = renderToStaticMarkup(
      <ReviewLesson skills={[numberLineSkill, choiceSkill]} onExit={() => {}} />,
    )

    expect(html).toContain('0/2')
    expect(html).toContain('Where does −3 sit?')
    expect(html).toContain('aria-label="Number line"')
    expect(html).not.toContain('Review intro')
  })

  it('renders review completion copy and one reward surface', () => {
    const html = renderToStaticMarkup(
      <LessonComplete
        review
        outcome={{ xpGained: 20, coinsGained: 10, leveledUp: false }}
        onExit={() => {}}
      />,
    )

    expect(html).toContain('Review complete!')
    expect(html).toContain('+20 XP')
    expect(html).toContain('+10')
    expect(html).not.toContain('level')
  })

  it('routes a root pair to one dedicated control with no private or fallback surface', () => {
    const html = renderToStaticMarkup(<Lesson skill={rootPairSkill} onExit={() => {}} />)
    expect(html.match(/data-root-pair-input/g)).toHaveLength(1)
    expect(html).toContain('aria-label="Root 1"')
    expect(html).toContain('aria-label="Root 2"')
    expect(html).toContain('>Check</button>')
    expect(html).not.toContain(encodeRootPairEntry(['-3', '4']))
    expect(html).not.toContain('aria-label="Number line"')
    expect(html).not.toContain('data-coordinate-plane="true"')
    expect(html).not.toContain('aria-label="Variable x"')
    for (const { label } of answerChoices) expect(html).not.toContain(label)
  })

  it('fails closed when root-pair input carries another answer shape', () => {
    const mismatched: SkillGenerator = {
      ...rootPairSkill,
      generate: (rng, difficulty) => ({
        ...rootPairSkill.generate(rng, difficulty),
        answer: intAnswer(4),
      }),
    }
    expect(() => renderToStaticMarkup(<Lesson skill={mismatched} onExit={() => {}} />)).toThrow(
      'root-pair input needs a root-pair answer',
    )
  })

  it('opens on the first problem with the pad ready', () => {
    const html = render()
    expect(html).toContain('What is the sum?')
    expect(html).toContain('0/10')
    for (const d of ['1', '5', '9', '0']) expect(has(html, d)).toBe(true)
  })

  it('keeps a diagram on the ordinary fraction-keypad path', () => {
    const html = renderToStaticMarkup(<Lesson skill={diagramSkill} onExit={() => {}} />)

    expect(html).toContain('aria-label="circle in 4 parts, 3 shaded"')
    expect(html).toContain('What fraction is shaded?')
    expect(has(html, '/')).toBe(true)
    expect(html).toContain('Check')
  })

  it('keeps a chart on the ordinary keypad path with one neutral answer frame', () => {
    const html = renderToStaticMarkup(<Lesson skill={chartKeypadSkill} onExit={() => {}} />)

    expect(html).toContain('aria-label="Bar chart &quot;Monthly output&quot;')
    expect(html.match(/data-chart-table/g)).toHaveLength(1)
    expect(html).toContain('data-chart-answer')
    expect(html).toContain('>Answer<')
    expect(html).toContain('>Check<')
    expect(html).not.toContain('text-ink-faint">=')
  })

  it('keeps a chart on the declared choice path without a duplicate answer frame', () => {
    const html = renderToStaticMarkup(<Lesson skill={chartChoiceSkill} onExit={() => {}} />)

    expect(html).toContain('aria-label="Bar chart &quot;Monthly output&quot;')
    expect(html.match(/data-chart-table/g)).toHaveLength(1)
    expect(html).not.toContain('data-chart-answer')
    expect(html).not.toContain('february')
    expect(html).not.toContain('>Check<')
    for (const choice of ['January', 'February', 'March']) expect(html).toContain(choice)
  })

  it('keeps a coordinate-plane display on the declared choice path', () => {
    const html = renderToStaticMarkup(
      <Lesson skill={coordinatePlaneChoiceSkill} onExit={() => {}} />,
    )

    expect(html).toContain('aria-label="Coordinate plane, x-axis −5 to 5 by 1')
    expect(html).toContain('data-coordinate-line="1"')
    for (const { label } of answerChoices) expect(html).toContain(label)
    expect(has(html, 'Backspace')).toBe(false)
    expect(html).not.toContain('>Check<')
    expect(html).not.toContain('greater-than-id')
    expect(html).not.toContain('data-coordinate-plane-answer')
    expect(html).not.toContain('text-ink-faint">=')
  })

  it('replaces the passive graph with the declared point-placement surface', () => {
    const html = renderToStaticMarkup(
      <Lesson skill={coordinatePlaneInputSkill} onExit={() => {}} />,
    )

    expect(html.match(/data-coordinate-plane="true"/g)).toHaveLength(1)
    expect(html.match(/data-coordinate-target=/g)).toHaveLength(121)
    expect(html).toContain('aria-label="Coordinate plane point placement"')
    expect(html).toContain('>Check</button>')
    expect(html).toContain('disabled=""')
    expect(has(html, 'Backspace')).toBe(false)
    expect(html).not.toContain('aria-label="Number line"')
    for (const { label } of answerChoices) expect(html).not.toContain(label)
    expect(html).not.toContain('data-coordinate-plane-answer')
  })

  it('reads the expression keypad rules from the answer declaration', () => {
    const quadratic = renderToStaticMarkup(
      <Lesson skill={expressionSkill(2)} onExit={() => {}} />,
    )
    const linear = renderToStaticMarkup(
      <Lesson skill={expressionSkill()} onExit={() => {}} />,
    )

    expect(has(quadratic, 'Variable y')).toBe(true)
    expect(has(quadratic, 'Square')).toBe(true)
    expect(has(linear, 'Variable y')).toBe(true)
    expect(has(linear, 'Square')).toBe(false)
  })

  it('gives the pad the sign key when the problem asks for one', () => {
    expect(has(render({ allowNegative: true }), '−')).toBe(true)
  })

  it('gives the pad the decimal key when the problem asks for one', () => {
    expect(has(render({ allowDecimal: true }), '.')).toBe(true)
  })

  it('gives the pad the fraction key when the problem asks for one', () => {
    expect(has(render({ allowFraction: true }), '/')).toBe(true)
  })

  it('gives the pad nothing extra when the problem declares nothing', () => {
    // The offender that proves the four above are not passing on an empty pad:
    // same lesson, same generator, rules withheld.
    const html = render()
    expect(has(html, '−')).toBe(false)
    expect(has(html, '.')).toBe(false)
    expect(has(html, '/')).toBe(false)
  })

  it('replaces the keypad with declared choices for a choice problem', () => {
    const html = renderToStaticMarkup(<Lesson skill={choiceSkill} onExit={() => {}} />)
    const positions = answerChoices.map(({ label }) => html.indexOf(label))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    expect(has(html, '1')).toBe(false)
    expect(html).not.toContain('Check')
  })

  it('ignores stray choice data when the problem asks for the keypad', () => {
    const keypadSkill = skillNeeding()
    const skill: SkillGenerator = {
      ...keypadSkill,
      generate: (rng, difficulty) => ({
        ...keypadSkill.generate(rng, difficulty),
        choices: answerChoices,
      }),
    }
    const html = renderToStaticMarkup(<Lesson skill={skill} onExit={() => {}} />)

    for (const { label } of answerChoices) expect(html).not.toContain(label)
    expect(has(html, '1')).toBe(true)
    expect(html).toContain('Check')
  })

  it('replaces the keypad with the declared line for a number-line problem', () => {
    const html = renderToStaticMarkup(
      <Lesson skill={numberLineSkill} onExit={() => {}} />,
    )

    expect(html).toContain('aria-label="Number line"')
    for (const label of ['−5', '−3', '0', '5']) expect(has(html, label)).toBe(true)
    // Checked on Backspace, not on a digit: this line runs −5 to 5, so it has
    // a tick legitimately labelled `1` and a digit proves nothing either way.
    expect(has(html, 'Backspace')).toBe(false)
    for (const { label } of answerChoices) expect(html).not.toContain(label)
  })

  it('offers nothing to confirm before a value is placed', () => {
    // The lesson opens with an empty entry, so the line has nothing placed and
    // confirming must be unavailable — a tap is what makes an answer, and none
    // has happened yet.
    const html = renderToStaticMarkup(
      <Lesson skill={numberLineSkill} onExit={() => {}} />,
    )

    expect(html).toContain('Check')
    expect(html).toContain('disabled=""')
  })

  it('ignores stray line data when the problem asks for the keypad', () => {
    const keypadSkill = skillNeeding()
    const skill: SkillGenerator = {
      ...keypadSkill,
      generate: (rng, difficulty) => ({
        ...keypadSkill.generate(rng, difficulty),
        numberLine: { start: rational(-5, 1), step: rational(1, 1), count: 11 },
      }),
    }
    const html = renderToStaticMarkup(<Lesson skill={skill} onExit={() => {}} />)

    expect(html).not.toContain('aria-label="Number line"')
    expect(has(html, '1')).toBe(true)
  })

  it('uses the manifest quick flag for a five-correct target', () => {
    const html = renderToStaticMarkup(
      <Lesson skill={skillNeeding(undefined, 'add-facts-small')} onExit={() => {}} />,
    )
    expect(html).toContain('0/5')
  })

  it('keeps a manifest non-quick skill at ten correct', () => {
    const html = renderToStaticMarkup(
      <Lesson skill={skillNeeding(undefined, 'add-facts')} onExit={() => {}} />,
    )
    expect(html).toContain('0/10')
  })

  it('generates only the opening warm-up and clamps it at difficulty one', () => {
    const generated: Difficulty[] = []
    renderToStaticMarkup(
      <Lesson skill={skillNeeding(undefined, 'add-facts', generated)} onExit={() => {}} />,
    )
    expect(generated).toEqual([1])
  })

  it("shows an unseen teaching skill's fixed example before creating a warm-up", () => {
    const generated: Difficulty[] = []
    const skill = {
      ...skillNeeding(undefined, 'synthetic-intro', generated),
      teachingLine: 'A clear line teaches one idea.',
    }

    const html = renderToStaticMarkup(<Lesson skill={skill} onExit={() => {}} />)

    expect(generated).toEqual([1])
    expect(html).toContain('data-skill-intro="automatic"')
    expect(html).toContain('A clear line teaches one idea.')
    expect(html).not.toContain('0/10')
  })

})
