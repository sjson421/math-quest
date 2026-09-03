import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  SkipAheadChoice,
  SkipAheadResult,
  SkipUnitAction,
  WarmUpOffer,
  type SkipBlock,
} from './SkipAhead'

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

  it('offers a warm-up in the unit’s name, without failure or penalty wording', () => {
    const html = renderToStaticMarkup(
      <WarmUpOffer unitName="Numbers & Place Value" onActivate={() => {}} />,
    )

    expect(html).toContain('data-warm-up-offer')
    expect(html).toContain('Warm up Numbers &amp; Place Value?')
    expect(html).not.toContain('failed')
    expect(html).not.toContain('penalty')
    expect(html).not.toContain('lost')
  })

  it('names the skill that pointed at the unit when there is one', () => {
    const html = renderToStaticMarkup(
      <WarmUpOffer
        unitName="Numbers & Place Value"
        skillName="Add facts to 10"
        onActivate={() => {}}
      />,
    )

    expect(html).toContain('Add facts to 10')
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
