import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { KeypadRules } from '../lib/keypad'
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

  it('gives the fraction key the one slot when both it and the decimal are allowed', () => {
    // One slot, and a fraction skill wants the slash. `applyKey` would accept
    // either character; the pad has to pick, and this pins which.
    const html = render({ allowFraction: true, allowDecimal: true })
    expect(has(html, '/')).toBe(true)
    expect(has(html, '.')).toBe(false)
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
