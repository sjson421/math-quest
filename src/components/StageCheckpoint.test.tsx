import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StageCheckpoint } from './StageCheckpoint'

const render = () =>
  renderToStaticMarkup(
    <StageCheckpoint
      checkpoint={{ id: 'stage-a', name: 'Numbers' }}
      onContinue={() => {}}
    />,
  )

describe('StageCheckpoint', () => {
  it('names the progression boundary without claiming full mastery', () => {
    const html = render()

    expect(html).toContain('Stage checkpoint')
    expect(html).toContain('Numbers boundary reached!')
    expect(html).toContain('keep building mastery')
    expect(html).not.toContain('mastered')
    expect(html).not.toContain('finished')
  })

  it('offers one clear next action', () => {
    const html = render()

    expect(html.match(/<button/g)).toHaveLength(1)
    expect(html).toContain('Continue')
  })
})
