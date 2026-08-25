import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SolutionSteps } from './SolutionSteps'

describe('SolutionSteps', () => {
  it('keeps numbered working and optional detail in one shared markup owner', () => {
    const html = renderToStaticMarkup(
      <SolutionSteps solution={[{ text: 'Add the ones.', detail: '3 + 2 = 5' }, { text: 'Write 5.' }]} />,
    )

    expect(html).toContain('<ol')
    expect(html).toContain('>1<')
    expect(html).toContain('>2<')
    expect(html).toContain('Add the ones.')
    expect(html).toContain('3 + 2 = 5')
  })
})
