import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ExpressionKeypad } from './ExpressionKeypad'

const render = (variable = 'x') =>
  renderToStaticMarkup(
    <ExpressionKeypad value="" variable={variable} onEntry={() => {}} onSubmit={() => {}} />,
  )

const has = (html: string, label: string) => html.includes(`aria-label="${label}"`)

describe('ExpressionKeypad', () => {
  it('offers digits, parens, backspace and Check', () => {
    const html = render()
    for (const d of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
      expect(has(html, d)).toBe(true)
    }
    expect(has(html, 'Open parenthesis')).toBe(true)
    expect(has(html, 'Close parenthesis')).toBe(true)
    expect(has(html, 'Backspace')).toBe(true)
    expect(html).toContain('Check')
  })

  it('offers the declared variable letter, not a hardcoded one', () => {
    expect(has(render('x'), 'Variable x')).toBe(true)
    expect(has(render('y'), 'Variable y')).toBe(true)
    expect(has(render('y'), 'Variable x')).toBe(false)
  })

  it('offers infix plus and minus', () => {
    const html = render()
    expect(has(html, 'Plus')).toBe(true)
    expect(has(html, 'Minus')).toBe(true)
  })
})
