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
})
