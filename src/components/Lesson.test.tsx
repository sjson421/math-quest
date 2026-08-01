import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { intAnswer } from '../lib/answer'
import type { KeypadRules } from '../lib/keypad'
import type { Difficulty, SkillGenerator } from '../lib/types'
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
