import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { WholeNumberData } from '../lib/types'
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
    // The smallest band. Even here a spelled-out number overruns 375px — it is
    // 27 characters of words, and wants wrapping rather than shrinking. Pinned
    // at the floor so a later fix to that is a deliberate one.
    expect(html).toContain('text-2xl')
    expect(html).toContain('=')
  })

  it.each([
    ['347', { operation: 'tens-digit', value: 347 }],
    ['347 ? 354', { operation: 'compare', left: 347, right: 354 }],
    ['347, 102, 880', { operation: 'order-ascending', values: [347, 102, 880] }],
  ] as const satisfies readonly (readonly [string, WholeNumberData])[])(
    'renders carried values through the existing inline branch: %s',
    (text, wholeNumber) => {
      const html = renderToStaticMarkup(
        <ProblemView display={{ kind: 'inline', text, wholeNumber }} entry="" />,
      )

      expect(html).toContain(text)
      expect(html).toContain('text-ink-faint')
    },
  )

  it.each([
    // Each of these was measured in a real 375px viewport, as the whole row —
    // expression, equals sign, and an answer slot holding the widest answer that
    // skill produces. The size named is the largest that keeps it on one line.
    ['18 − 9', 'text-6xl'],
    ['40 + 40', 'text-5xl'],
    ['1482 ÷ 6', 'text-4xl'],
    ['9 − 3 × 2', 'text-4xl'],
    ['2800 ÷ 100', 'text-4xl'],
    ['100 + 10 + 5', 'text-3xl'],
    ['121, 104, 178', 'text-3xl'],
    ['10 × (32 + 31)', 'text-3xl'],
    ['19 + 10 × (41 − 6)', 'text-2xl'],
  ])('sizes "%s" at %s', (text, size) => {
    const html = renderToStaticMarkup(<ProblemView display={{ kind: 'inline', text }} entry="" />)

    expect(html).toContain(text)
    expect(html).toContain(size)
  })

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

  it('renders structured notation beside the existing answer slot', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'fraction',
            numerator: { kind: 'text', value: '3' },
            denominator: { kind: 'text', value: '4' },
          },
          label: 'three fourths',
        }}
        entry=""
      />,
    )

    expect(html).toContain('role="math"')
    expect(html).toContain('aria-label="three fourths"')
    expect(html).toContain('mq-math-fraction')
    expect(html).toContain('=')
  })

  it('renders a diagram above the existing fraction answer slot', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'diagram',
          diagram: { kind: 'bar', parts: 4, shadedParts: 3 },
        }}
        entry="3/4"
      />,
    )

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="bar in 4 parts, 3 shaded"')
    expect(html.match(/data-diagram-part=/g)).toHaveLength(4)
    expect(html).toContain('mq-math-fraction')
    expect(html).toContain('aria-label="3 over 4"')
    expect(html).toContain('=')
  })

  it.each([
    ['3/4', '3 over 4'],
    ['3/', '3 over blank'],
  ])('echoes the keypad entry %s as one named stacked fraction', (entry, label) => {
    const html = renderToStaticMarkup(
      <ProblemView display={{ kind: 'inline', text: '1 + 1' }} entry={entry} />,
    )

    expect(html).toContain('mq-math-fraction')
    expect(html).toContain(`aria-label="${label}"`)
    expect(html).toContain('mq-math-entry')
    expect(html).not.toContain(`>${entry}<`)
  })

  it('leaves an ordinary keypad entry on the text path', () => {
    const html = renderToStaticMarkup(
      <ProblemView display={{ kind: 'inline', text: '40 + 2' }} entry="42" />,
    )

    expect(html).toContain('>42<')
    expect(html).not.toContain('aria-label="42"')
  })

  it('lets the column own a nested fraction answer as one accessible expression', () => {
    const html = renderToStaticMarkup(
      <ProblemView display={{ kind: 'column', operands: [3, 4], operator: '+' }} entry="3/4" />,
    )

    expect(html).toContain('aria-label="3 + 4 equals 3 over 4"')
    expect(html).toMatch(/aria-hidden="true">[\s\S]*aria-label="3 over 4"/)
    expect(html).toContain('mq-math-fraction')
  })
})
