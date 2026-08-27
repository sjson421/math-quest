import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PinTier } from '../lib/pin'
import { PinUpgrade } from './PinUpgrade'

const render = (tier: PinTier = 3, character?: string) =>
  renderToStaticMarkup(
    <PinUpgrade
      upgrade={{ tier, name: 'Medal', of: 5 }}
      onContinue={() => {}}
      character={character}
    />,
  )

describe('PinUpgrade', () => {
  it('names the new pin and says it cost nothing', () => {
    const html = render()

    expect(html).toContain('New pin')
    expect(html).toContain('Medal')
    expect(html).toContain('tier 3 of 5')
    expect(html).toContain('earned this one')
  })

  it('describes the pin rather than the learner', () => {
    // The same rule the stage checkpoint's copy is under: the app can say how
    // far someone has come and cannot say how clever they are.
    const html = render()

    expect(html).not.toContain('mastered')
    expect(html).not.toContain('genius')
    expect(html).not.toContain('smart')
  })

  it('offers one clear next action and nothing to choose', () => {
    const html = render()

    expect(html.match(/<button/g)).toHaveLength(1)
    expect(html).toContain('Continue')
  })

  it('draws the tier just earned, not the one being left', () => {
    // The whole point of the screen is seeing the new pin on your own
    // character, so this must follow the upgrade rather than stored progress.
    const plate = 'fill:var(--color-butter-soft)'

    expect(render(3), 'tier 3 is the first that fills').toContain(plate)
    expect(render(1), 'tier 1 has no frame').not.toContain(plate)
  })

  it('draws whichever character the learner plays as', () => {
    expect(render(5, 'mochi')).toContain('Mochi is celebrating')
    expect(render(5, 'taro')).toContain('Taro is celebrating')
  })
})
