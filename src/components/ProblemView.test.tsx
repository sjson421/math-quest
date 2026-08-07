import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { WholeNumberData } from '../lib/types'
import { ProblemView } from './ProblemView'

describe('ProblemView', () => {
  it('shrinks long number names while keeping them on the inline surface', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{ kind: 'inline', text: 'nine hundred eighty-seven' }}
        entry="987"
      />,
    )

    expect(html).toContain('nine hundred eighty-seven')
    expect(html).toContain('text-3xl')
    expect(html).toContain('=')
  })

  it.each([
    ['347', { operation: 'tens-digit', value: 347 }],
    ['347 ? 354', { operation: 'compare', left: 347, right: 354 }],
    ['347, 102, 880', { operation: 'order-ascending', values: [347, 102, 880] }],
  ] as const satisfies readonly (readonly [string, WholeNumberData])[])(
    'renders carried values through the existing inline branch: %s',
    (text, wholeNumber) => {
      const html = renderToStaticMarkup(
        <ProblemView display={{ kind: 'inline', text, wholeNumber }} entry="" />,
      )

      expect(html).toContain(text)
      expect(html).toContain('text-ink-faint')
    },
  )

  it('bounds and wraps a selected choice label instead of sizing it like digits', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{ kind: 'inline', text: '4 ? 7' }}
        entry="Greater than"
        entryMode="choice"
      />,
    )

    expect(html).toContain('Greater than')
    expect(html).toContain('max-w-40')
    expect(html).toContain('break-words')
    expect(html).not.toContain('min-width')
  })
})
