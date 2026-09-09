import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { KeypadRules } from '../lib/keypad'
import { generateProblem } from '../lib/generator'
import { unit09 } from '../curriculum/unit-09-decimals'
import { unit22 } from '../curriculum/unit-22-test-preparation'
import { Keypad } from './Keypad'

/**
 * The pad rendered to a string, in the node environment, with no DOM.
 *
 * Handlers are not attached by a static render, so this covers what the pad
 * *offers* — which is the half that can silently disagree with what it accepts.
 * The accepting half is `applyKey`, covered in `lib/keypad.test.ts` against the
 * same rules object the pad is given here.
 */
const render = (rules?: KeypadRules) =>
  renderToStaticMarkup(
    <Keypad value="" onEntry={() => {}} onSubmit={() => {}} rules={rules} />,
  )

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

/** Where a key's label appears in the markup — a source-ordered grid, so this is position. */
const positionOf = (html: string, label: string) => html.indexOf(`aria-label="${label}"`)

const has = (html: string, label: string) => positionOf(html, label) >= 0

describe('Keypad', () => {
  it('preserves single-value Check readiness by default', () => {
    const empty = renderToStaticMarkup(
      <Keypad value="" onEntry={() => {}} onSubmit={() => {}} />,
    )
    const filled = renderToStaticMarkup(
      <Keypad value="7" onEntry={() => {}} onSubmit={() => {}} />,
    )
    expect(empty).toContain('>Check</button>')
    expect(empty).toContain('disabled=""')
    expect(filled).not.toContain('disabled=""')
  })

  it('uses composite readiness when the caller supplies it', () => {
    const waiting = renderToStaticMarkup(
      <Keypad value="private-pair" submitReady={false} onEntry={() => {}} onSubmit={() => {}} />,
    )
    const ready = renderToStaticMarkup(
      <Keypad value="" submitReady onEntry={() => {}} onSubmit={() => {}} />,
    )
    expect(waiting).toContain('disabled=""')
    expect(ready).not.toContain('disabled=""')
  })

  it('offers digits, backspace and Check with no rules at all', () => {
    const html = render()
    for (const d of DIGITS) expect(has(html, d)).toBe(true)
    expect(has(html, 'Backspace')).toBe(true)
    expect(html).toContain('Check')
  })

  it('offers no sign, point or slash when the problem permits none', () => {
    const html = render()
    expect(has(html, '−')).toBe(false)
    expect(has(html, '.')).toBe(false)
    expect(has(html, '/')).toBe(false)
  })

  it('offers the sign key, and only it, when a negative answer is allowed', () => {
    const html = render({ allowNegative: true })
    expect(has(html, '−')).toBe(true)
    expect(has(html, '.')).toBe(false)
    expect(has(html, '/')).toBe(false)
  })

  it('offers the decimal key, and only it, when a decimal answer is allowed', () => {
    const html = render({ allowDecimal: true })
    expect(has(html, '.')).toBe(true)
    expect(has(html, '−')).toBe(false)
    expect(has(html, '/')).toBe(false)
  })

  it('offers the fraction key, and only it, when a fraction answer is allowed', () => {
    const html = render({ allowFraction: true })
    expect(has(html, '/')).toBe(true)
    expect(has(html, '−')).toBe(false)
    expect(has(html, '.')).toBe(false)
  })

  it('offers the space key and the slash when mixed entry is allowed', () => {
    const html = render({ allowMixed: true })
    expect(has(html, 'Space')).toBe(true)
    expect(html).toContain('>␣</button>')
    expect(has(html, '/')).toBe(true)
    // The sign cell is the space's: a mixed problem shows no sign.
    expect(has(html, '−')).toBe(false)
    expect(has(html, '.')).toBe(false)
  })

  it('keeps the digits in the same places for mixed entry too', () => {
    const html = render({ allowMixed: true })
    const ranks = DIGITS.map((d) => positionOf(html, d))
    expect(ranks.every((i) => i >= 0)).toBe(true)
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks)
  })

  it.each([
    { allowFraction: true, allowDecimal: true },
    { allowFraction: true, allowDecimal: true, allowNegative: true },
    { allowMixed: true, allowDecimal: true },
  ])('offers both permitted forms without hiding another key: %j', (rules) => {
    const html = render(rules)
    expect(has(html, '/')).toBe(true)
    expect(has(html, '.')).toBe(true)
    expect(has(html, '−')).toBe('allowNegative' in rules)
    expect(has(html, 'Space')).toBe('allowMixed' in rules)
    for (const d of DIGITS) expect(has(html, d)).toBe(true)
    expect(has(html, 'Backspace')).toBe(true)
    expect(html).toContain('>Check</button>')
  })

  it.each(['fraction-to-decimal', 'decimal-to-fraction', 'calculator-skills'])(
    '%s exposes both forms from its actual problem declaration', (id) => {
      const skill = [...unit09, ...unit22].find((skill) => skill.id === id)!
      // This stable calculator draw asks for decimal form; both Unit 9 draws
      // also permit the other form so the learner can receive form feedback.
      const problem = generateProblem(skill, 12345, 1)
      expect(problem.keypad).toEqual({ allowFraction: true, allowDecimal: true })
      const html = render(problem.keypad)
      expect(has(html, '.')).toBe(true)
      expect(has(html, '/')).toBe(true)
    },
  )

  it('keeps Backspace large unless its second cell is needed for decimal entry', () => {
    for (const rules of [
      { allowFraction: true, allowDecimal: true },
      { allowFraction: true, allowNegative: true },
      { allowMixed: true },
    ]) {
      const button = render(rules).match(/<button[^>]*aria-label="Backspace"[^>]*>/)![0]
      expect(button).toContain('row-span-2')
    }
    for (const rules of [
      { allowFraction: true, allowDecimal: true, allowNegative: true },
      { allowMixed: true, allowDecimal: true },
    ]) {
      const button = render(rules).match(/<button[^>]*aria-label="Backspace"[^>]*>/)![0]
      expect(button).not.toContain('row-span-2')
    }
  })

  it('keeps the digits in the same places whatever the rules are', () => {
    // A pad that reflows as the course advances is its own bug: the digits have
    // to stay where the learner's thumb already expects them.
    for (const rules of [
      undefined,
      { allowNegative: true },
      { allowDecimal: true },
      { allowFraction: true },
      { allowNegative: true, allowFraction: true },
      { allowFraction: true, allowDecimal: true },
      { allowNegative: true, allowFraction: true, allowDecimal: true },
      { allowMixed: true, allowDecimal: true },
    ]) {
      const html = render(rules)
      const ranks = DIGITS.map((d) => positionOf(html, d))
      expect(ranks.every((i) => i >= 0)).toBe(true)
      // Compare order rather than raw offsets — an added key shifts every
      // absolute index after it without moving anything on screen.
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks)
    }
  })

  it('would notice a pad that offered a key its rules forbid', () => {
    // The check above passes trivially if `has` never finds anything. This is
    // the synthetic offender proving it can fail.
    const html = render({ allowNegative: true })
    expect(has(html, '−')).toBe(true)
    expect(has(render(), '−')).toBe(false)
  })
})
