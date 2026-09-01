/**
 * Settings already owns the global misconception insight. These first-paint
 * checks pin its ranking and empty-state contract without creating another
 * progress model for the report.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MistakeInsight } from './Settings'

const render = (mistakes: Record<string, number>) => {
  return renderToStaticMarkup(<MistakeInsight mistakes={mistakes} />)
}

describe('Settings mistake insight', () => {
  it('shows the three most frequent patterns in descending order', () => {
    const html = render({
      'forgot-carry': 8,
      'custom-pattern': 6,
      'off-by-one-high': 5,
      added: 4,
    })

    expect(html).toContain('Things to watch')
    expect(html.indexOf('Forgetting to carry')).toBeLessThan(html.indexOf('custom pattern'))
    expect(html.indexOf('custom pattern')).toBeLessThan(html.indexOf('Counting one too far'))
    for (const count of ['8×', '6×', '5×']) expect(html).toContain(count)
    expect(html).not.toContain('Adding when it asked to subtract')
    expect(html).not.toContain('4×')
  })

  it('omits insight when no diagnosed mistakes exist', () => {
    expect(render({})).not.toContain('Things to watch')
  })
})
