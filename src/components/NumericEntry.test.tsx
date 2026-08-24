import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { NumericEntry } from './NumericEntry'

describe('NumericEntry', () => {
  it('renders the shared empty numeric cursor', () => {
    const html = renderToStaticMarkup(<NumericEntry value="" />)
    expect(html).toContain('animate-pulse')
    expect(html).toContain('min-width:1.36em')
  })

  it('renders a signed fraction through structured notation', () => {
    const html = renderToStaticMarkup(<NumericEntry value="−3/4" />)
    expect(html).toContain('aria-label="negative 3 over 4"')
    expect(html).toContain('mq-math-fraction')
  })

  it('keeps non-fraction entry as ordinary text', () => {
    const html = renderToStaticMarkup(<NumericEntry value="−3.5" />)
    expect(html).toContain('>−3.5<')
    expect(html).not.toContain('mq-math-fraction')
  })
})
