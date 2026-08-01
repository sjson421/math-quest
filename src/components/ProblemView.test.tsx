import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
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
    ['347', [347], 'tens-digit'],
    ['347 ? 354', [347, 354], 'compare'],
    ['347, 102, 880', [347, 102, 880], 'order-ascending'],
  ] as const)(
    'renders carried values through the existing inline branch: %s',
    (text, values, operation) => {
      const html = renderToStaticMarkup(
        <ProblemView
          display={{ kind: 'inline', text, wholeNumber: { values: [...values], operation } }}
          entry=""
        />,
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
