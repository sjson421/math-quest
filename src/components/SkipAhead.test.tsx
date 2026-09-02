import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SkipAheadChoice, SkipAheadResult, SkipUnitAction, type SkipBlock } from './SkipAhead'

const block: SkipBlock = { kind: 'stage', id: 'stage-a', name: 'Numbers' }

describe('skip-ahead surfaces', () => {
  it('offers check first and direct skip without making either mandatory', () => {
    const html = renderToStaticMarkup(
      <SkipAheadChoice
        block={block}
        freshStart
        onCheck={() => {}}
        onSkip={() => {}}
        onBack={() => {}}
      />,
    )

    expect(html).toContain('Check first')
    expect(html).toContain('Just skip it')
    expect(html).toContain('Start practice')
  })

  it('keeps a passed check separate from rewards and achievements', () => {
    const html = renderToStaticMarkup(
      <SkipAheadResult
        block={block}
        correct={7}
        passed
        onContinue={() => {}}
      />,
    )

    expect(html).toContain('Ready for what comes next')
    expect(html).toContain('7/8 correct')
    expect(html).not.toContain('XP')
    expect(html).not.toContain('coins')
    expect(html).not.toContain('achievement')
  })

  it('offers the current frontier with neutral copy after a check needs practice', () => {
    const html = renderToStaticMarkup(
      <SkipAheadResult
        block={block}
        correct={6}
        passed={false}
        frontierName="Addition"
        onContinue={() => {}}
      />,
    )

    expect(html).toContain('Let’s build from here')
    expect(html).toContain('A little practice will help you get ready.')
    expect(html).toContain('Practice Addition')
    expect(html).not.toContain('failed')
    expect(html).not.toContain('penalty')
  })

  it('renders one unit action surface for either skip state', () => {
    const fresh = renderToStaticMarkup(
      <SkipUnitAction label="I already know this" onActivate={() => {}} />,
    )
    const reversal = renderToStaticMarkup(
      <SkipUnitAction label="Actually, let me practice this" onActivate={() => {}} />,
    )

    expect(fresh.match(/data-skip-unit-action/g)).toHaveLength(1)
    expect(reversal.match(/data-skip-unit-action/g)).toHaveLength(1)
  })
})
