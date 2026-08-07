import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { intAnswer } from '../lib/answer'
import type { KeypadRules } from '../lib/keypad'
import { rational } from '../lib/rational'
import type { Choice, Difficulty, SkillGenerator } from '../lib/types'
import { Lesson } from './Lesson'

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

const has = (html: string, label: string) => html.includes(`aria-label="${label}"`)

describe('Lesson', () => {
  it('opens on the first problem with the pad ready', () => {
    const html = render()
    expect(html).toContain('What is the sum?')
    expect(html).toContain('0/10')
    for (const d of ['1', '5', '9', '0']) expect(has(html, d)).toBe(true)
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

})
