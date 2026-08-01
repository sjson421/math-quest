import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProblemView } from './ProblemView'

describe('ProblemView', () => {
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
