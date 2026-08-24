import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { encodeRootPairEntry } from '../lib/root-pair'
import { RootPairInput } from './RootPairInput'

const render = (entry: string) => renderToStaticMarkup(
  <RootPairInput
    entry={entry}
    onEntry={() => {}}
    onConfirm={() => {}}
    rules={{ allowNegative: true, allowFraction: true }}
  />,
)

describe('RootPairInput', () => {
  it('renders two labelled slots with exactly one active', () => {
    const html = render('')
    expect(html).toContain('aria-label="Root 1" aria-pressed="true"')
    expect(html).toContain('aria-label="Root 2" aria-pressed="false"')
    expect(html.match(/data-root-pair-input/g)).toHaveLength(1)
  })

  it('shows exact problem keys and disables Check for an incomplete pair', () => {
    const html = render(encodeRootPairEntry(['-3', '']))
    expect(html).toContain('aria-label="−"')
    expect(html).toContain('aria-label="/"')
    expect(html).toContain('>Check</button>')
    expect(html).toContain('disabled=""')
  })

  it('shows signed fraction echoes and enables Check for a complete pair', () => {
    const html = render(encodeRootPairEntry(['-3/4', '1/2']))
    expect(html).toContain('aria-label="negative 3 over 4"')
    expect(html).toContain('aria-label="1 over 2"')
    expect(html).not.toContain('disabled=""')
  })
})
