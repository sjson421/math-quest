import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Display, WholeNumberData } from '../lib/types'
import { ProblemView } from './ProblemView'

describe('ProblemView', () => {
  it('does not expose a root-pair tuple or duplicate answer frame', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{ kind: 'inline', text: 'x² − x − 12' }}
        entry={'["-3","4"]'}
        entryMode="root-pair"
      />,
    )
    expect(html).toContain('x² − x − 12')
    expect(html).not.toContain('[&quot;-3&quot;,&quot;4&quot;]')
    expect(html).not.toContain('text-ink-faint')
    expect(html).not.toContain('animate-pulse')
  })

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

  it('wraps decimal-reading prose above its answer slot', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'inline',
          text: 'three and four hundredths',
          decimal: { operation: 'read', value: { coefficient: 304, scale: 2 } },
        }}
        entry="3.04"
      />,
    )

    expect(html).toContain('three and four hundredths')
    expect(html).toContain('max-w-xs')
    expect(html).toContain('flex-col')
    expect(html).toContain('text-balance')
  })

  it('aligns exact decimal columns without dropping a trailing zero', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'decimal-column',
          decimal: {
            operation: 'add',
            left: { coefficient: 12, scale: 1 },
            right: { coefficient: 35, scale: 2 },
          },
        }}
        entry="1.55"
      />,
    )

    expect(html).toContain('aria-label="1.20 + 0.35 equals 1.55"')
    expect(html).toContain('role="math"')
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

  it('sizes the whole quadratic row from both expressions', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{ kind: 'inline', text: 'x² + 5x + 6' }}
        entry="(x+2)(x+3)"
        entryMode="expression"
      />,
    )

    expect(html).toContain('text-2xl')
    expect(html).toContain('whitespace-nowrap')
  })

  it('wraps a long polynomial rewrite at term boundaries with a bounded entry slot', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'story',
          text: '(18x² + 17x + 16) + (15x² + 14x + 13)',
          polynomial: {
            operation: 'add',
            left: { quadratic: 18, linear: 17, constant: 16 },
            right: { quadratic: 15, linear: 14, constant: 13 },
          },
        }}
        entry="15x²+29x+27"
        entryMode="expression"
      />,
    )

    expect(html).toContain('whitespace-normal')
    expect(html).toContain('max-w-full')
    expect(html).toContain('overflow-hidden')
    expect(html).toContain('text-2xl')
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

  it('keeps the supplied quadratic formula as one bounded root-pair display', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'row',
            children: [
              { kind: 'text', value: 'x' },
              { kind: 'text', value: '=' },
              {
                kind: 'fraction',
                numerator: {
                  kind: 'row',
                  children: [
                    { kind: 'text', value: '−b' },
                    { kind: 'text', value: '±' },
                    {
                      kind: 'root',
                      radicand: {
                        kind: 'row',
                        children: [
                          {
                            kind: 'superscript',
                            base: { kind: 'text', value: 'b' },
                            exponent: { kind: 'text', value: '2' },
                          },
                          { kind: 'text', value: '−' },
                          { kind: 'text', value: '4ac' },
                        ],
                      },
                    },
                  ],
                },
                denominator: { kind: 'text', value: '2a' },
              },
            ],
          },
          label: 'x equals negative b plus or minus the square root of b squared minus four a c, all over two a',
          polynomial: { operation: 'quadratic-formula', a: 2, b: 5, c: 2 },
        }}
        entry={'["-2","-1/2"]'}
        entryMode="root-pair"
      />,
    )

    expect(html).toContain('max-w-full')
    expect(html).toContain('mq-math-fraction')
    expect(html).toContain('mq-math-root')
    expect(html).toContain('mq-math-superscript')
    expect(html.match(/role="math"/g)).toHaveLength(1)
    expect(html).not.toContain('[&quot;-2&quot;,&quot;-1/2&quot;]')
    expect(html).not.toContain('text-ink-faint">=')
  })

  it('renders an expression prompt through the existing text/row notation, with no new display kind', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'row',
            children: [
              { kind: 'text', value: '2' },
              { kind: 'text', value: '(' },
              { kind: 'text', value: 'x + 1' },
              { kind: 'text', value: ')' },
            ],
          },
          label: '2 times the quantity x plus 1',
        }}
        entry="2x+2"
        entryMode="expression"
      />,
    )

    expect(html).toContain('role="math"')
    expect(html).toContain('aria-label="2 times the quantity x plus 1"')
    expect(html).toContain('mq-math-text">2<')
    expect(html).toContain('mq-math-text">x + 1<')
    expect(html).toContain('>2x+2<')
  })

  it('shows a named fraction part without claiming the fraction equals a word', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'fraction',
            numerator: { kind: 'text', value: '1' },
            denominator: { kind: 'text', value: '3' },
          },
          label: 'one third',
          fraction: {
            operation: 'name-part',
            numerator: 1,
            denominator: 3,
            requestedPart: 'numerator',
          },
        }}
        entry=""
        entryMode="choice"
      />,
    )

    expect(html).toContain('aria-label="one third"')
    expect(html).not.toContain('text-ink-faint')
    expect(html).not.toContain('bg-blossom-deep')
  })

  it('shows a fraction comparison without appending a second answer blank', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'row',
            children: [
              {
                kind: 'fraction',
                numerator: { kind: 'text', value: '2' },
                denominator: { kind: 'text', value: '3' },
              },
              { kind: 'text', value: '?' },
              {
                kind: 'fraction',
                numerator: { kind: 'text', value: '3' },
                denominator: { kind: 'text', value: '5' },
              },
            ],
          },
          label: '2 over 3, blank, 3 over 5',
          fraction: {
            operation: 'compare',
            leftNumerator: 2,
            leftDenominator: 3,
            rightNumerator: 3,
            rightDenominator: 5,
          },
        }}
        entry=""
        entryMode="choice"
      />,
    )

    expect(html).toContain('aria-label="2 over 3, blank, 3 over 5"')
    expect(html).not.toContain('text-ink-faint')
    expect(html).not.toContain('bg-blossom-deep')
  })

  it('labels the entry beneath a missing-term equality instead of appending another equals sign', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'math',
          notation: {
            kind: 'row',
            children: [
              {
                kind: 'fraction',
                numerator: { kind: 'text', value: '3' },
                denominator: { kind: 'text', value: '6' },
              },
              { kind: 'text', value: '=' },
              {
                kind: 'fraction',
                numerator: { kind: 'text', value: '?' },
                denominator: { kind: 'text', value: '2' },
              },
            ],
          },
          label: '3 over 6 equals blank over 2',
          fraction: {
            operation: 'scale-missing',
            numerator: 1,
            denominator: 2,
            factor: 3,
            direction: 'down',
            missing: 'numerator',
          },
        }}
        entry="1"
      />,
    )

    expect(html).toContain('aria-label="3 over 6 equals blank over 2"')
    expect(html).toContain('>Answer<')
    expect(html).toContain('>1<')
    expect(html).not.toContain('text-ink-faint')
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

  const coordinatePlaneDisplay: Display = {
    kind: 'coordinate-plane',
    plane: {
      x: { min: -5, max: 5, step: 1 },
      y: { min: -5, max: 5, step: 1 },
      points: [{ x: -2, y: 1 }],
      lines: [{ through: [{ x: 0, y: 1 }, { x: 2, y: 3 }] }],
    },
  }

  it.each(['choice', 'number-line', 'coordinate-plane'] as const)(
    'lets %s own a coordinate-plane answer surface without a display echo',
    (entryMode) => {
      const html = renderToStaticMarkup(
        <ProblemView
          display={coordinatePlaneDisplay}
          entry="greater-than-id"
          entryMode={entryMode}
        />,
      )

      expect(html).toContain('role="img"')
      expect(html).toContain('aria-label="Coordinate plane, x-axis −5 to 5 by 1')
      expect(html).toContain('data-coordinate-point')
      expect(html).toContain('data-coordinate-line="1"')
      expect(html).not.toContain('greater-than-id')
      expect(html).not.toContain('data-coordinate-plane-answer')
      expect(html).toContain('data-coordinate-plane-size="full"')
      expect(html).not.toContain('text-ink-faint">=')
    },
  )

  it.each(['keypad', 'expression'] as const)(
    'frames a %s coordinate-plane entry as an answer without graph equality',
    (entryMode) => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={coordinatePlaneDisplay}
        entry="1"
        entryMode={entryMode}
      />,
    )

      expect(html).toContain('data-coordinate-plane-answer')
      expect(html).toContain('data-coordinate-plane-size="compact"')
      expect(html).toContain('>Answer<')
      expect(html).toContain('>1<')
      expect(html).not.toContain('text-ink-faint">=')
    },
  )

  it('keeps coordinate operation context beside the passive graph', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          ...coordinatePlaneDisplay,
          coordinate: { operation: 'plot-point', point: { x: -2, y: 3 } },
        }}
        entry=""
        entryMode="choice"
      />,
    )

    expect(html).toContain('Point (−2, 3)')
    expect(html.match(/role="img"/g)).toHaveLength(1)
    expect(html).not.toContain('data-coordinate-plane-answer')
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

  const equation = {
    kind: 'equation',
    text: '3x + 5 = 20',
    variable: 'x',
    equation: { operation: 'two-step', coefficient: 3, constant: 5, adds: true, rightHand: 20 },
  } as const

  it('frames an equation answer with its variable and never a second equals sign', () => {
    const html = renderToStaticMarkup(<ProblemView display={equation} entry="5" />)

    // The whole reason this is not an `InlineView`. Appending the usual frame
    // would draw `3x + 5 = 20 = 5`, which is false — in the unit whose subject
    // is that both sides of an equals sign hold the same value.
    expect(html).toContain('3x + 5 = 20')
    expect(html).not.toContain('3x + 5 = 20 =')
    expect(html).toContain('>x<')
    expect(html).toContain('>5<')
    // Counted over what the learner sees, not over the markup — every attribute
    // carries an equals sign of its own. One for the equation, one for the
    // frame; a third would mean the inline frame had crept back in.
    const visible = html.replace(/<[^>]*>/g, '')
    expect([...visible.matchAll(/=/g)]).toHaveLength(2)
  })

  it('gives the equation one accessible name rather than loose digits', () => {
    const html = renderToStaticMarkup(<ProblemView display={equation} entry="" />)

    expect(html).toContain('role="math"')
    expect(html).toContain('aria-label="3x + 5 = 20"')
  })

  it('still shows the cursor when nothing has been entered', () => {
    const html = renderToStaticMarkup(<ProblemView display={equation} entry="" />)

    expect(html).toContain('animate-pulse')
  })

  it('drops the widest equation a draw can produce into the smallest band', () => {
    // `vars-both-sides` at its widest: 20 characters observed, against the
    // 21-character cap `coverage.test.ts` enforces. It has to land below the
    // band the shorter equations use, or the row wraps at 375px.
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'equation',
          text: '17x + 14 = 10x + 119',
          variable: 'x',
          equation: {
            operation: 'vars-both-sides',
            leftCoefficient: 17,
            leftConstant: 14,
            rightCoefficient: 10,
            rightConstant: 119,
          },
        }}
        entry="15"
      />,
    )

    expect(html).toContain('17x + 14 = 10x + 119')
    // On the equation's own element, not merely somewhere in the markup.
    expect(html).toMatch(/<span class="[^"]*text-3xl[^"]*" role="math"/)
  })

  it('drops the frame where the answer is not a value of the variable', () => {
    // `special-solutions` omits the label. The frame is a claim — this equation
    // has a solution and the answer is it — and framing this one would draw
    // `x = No solution`, asserting exactly what the learner is asked to rule out.
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'equation',
          text: '4x + 3 = 4x + 9',
          equation: {
            operation: 'special-solutions',
            letter: 'x',
            leftCoefficient: 4,
            leftConstant: 3,
            rightCoefficient: 4,
            rightConstant: 9,
          },
        }}
        entry="No solution"
        entryMode="choice"
      />,
    )

    // The whole row goes, slot included. An unlabelled slot is a cursor
    // inviting entry on a screen with no keypad, and the value it would echo is
    // the choice's id — a slug here, not the sentence the learner tapped.
    expect(html).not.toContain('No solution')
    expect(html).not.toContain('animate-pulse')
    // One equals sign reaches the learner — the equation's own. A second would
    // be the frame, and there is nothing true for it to say here.
    const visible = html.replace(/<[^>]*>/g, '')
    expect([...visible.matchAll(/=/g)]).toHaveLength(1)
  })

  it('renders a notated equation through the notation surface, under one name', () => {
    const html = renderToStaticMarkup(
      <ProblemView
        display={{
          kind: 'equation',
          text: 'x/3 + 2 = 7',
          variable: 'x',
          equation: { operation: 'clear-fraction', denominator: 3, constant: 2, adds: true, rightHand: 7 },
          notation: {
            kind: 'row',
            children: [
              { kind: 'fraction', numerator: { kind: 'text', value: 'x' }, denominator: { kind: 'text', value: '3' } },
              { kind: 'text', value: ' + 2 = 7' },
            ],
          },
        }}
        entry="15"
      />,
    )

    // Stacked, not a slash between characters — the presentation `math-notation`
    // exists to replace, and the equation arm was the last display without it.
    expect(html).toContain('mq-math')
    expect(html).not.toContain('x/3 + 2 = 7<')
    // Exactly one accessible name for the equation. `MathNotation` carries its
    // own role, so a wrapper carrying a second one would announce it twice.
    expect([...html.matchAll(/role="math"/g)]).toHaveLength(1)
    expect(html).toContain('aria-label="x/3 + 2 = 7"')
    // The frame still applies: this answer *is* a value of x.
    expect(html).toContain('>x<')
    expect(html).toContain('>15<')
  })
})
