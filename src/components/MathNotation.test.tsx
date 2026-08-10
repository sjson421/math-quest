import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MathNotation as MathNotationNode } from '../lib/types'
import { MathNotation } from './MathNotation'

const text = (value: string): MathNotationNode => ({ kind: 'text', value })
const row = (...children: MathNotationNode[]): MathNotationNode => ({ kind: 'row', children })
const fraction = (numerator: MathNotationNode, denominator: MathNotationNode): MathNotationNode =>
  ({ kind: 'fraction', numerator, denominator })
const superscript = (base: MathNotationNode, exponent: MathNotationNode): MathNotationNode =>
  ({ kind: 'superscript', base, exponent })
const root = (radicand: MathNotationNode): MathNotationNode => ({ kind: 'root', radicand })

const fixtures: { label: string; notation: MathNotationNode }[] = [
  { label: 'three fourths', notation: fraction(text('3'), text('4')) },
  {
    label: 'two and three fifths',
    notation: row(text('2'), fraction(text('3'), text('5'))),
  },
  {
    label: 'one half equals two fourths',
    notation: row(fraction(text('1'), text('2')), text('='), fraction(text('2'), text('4'))),
  },
  { label: 'three to the fourth power', notation: superscript(text('3'), text('4')) },
  { label: 'two to the negative third power', notation: superscript(text('2'), text('−3')) },
  { label: 'square root of one hundred forty-four', notation: root(text('144')) },
  {
    label: 'square root of x squared plus y squared',
    notation: root(row(superscript(text('x'), text('2')), text('+'), superscript(text('y'), text('2')))),
  },
  {
    label: 'x equals negative b plus or minus the square root of b squared minus four a c, all over two a',
    notation: row(
      text('x'),
      text('='),
      fraction(
        row(text('−b'), text('±'), root(row(superscript(text('b'), text('2')), text('−'), text('4ac')))),
        text('2a'),
      ),
    ),
  },
  {
    label: 'area equals pi r squared',
    notation: row(text('A'), text('='), text('π'), superscript(text('r'), text('2'))),
  },
  {
    label: 'area equals one half b h',
    notation: row(text('A'), text('='), fraction(text('1'), text('2')), text('bh')),
  },
]

describe('MathNotation', () => {
  it('renders the complete curriculum-derived structure set through five primitives', () => {
    const html = renderToStaticMarkup(
      <div>
        {fixtures.map((fixture) => (
          <MathNotation key={fixture.label} {...fixture} />
        ))}
      </div>,
    )

    expect(html.match(/role="math"/g)).toHaveLength(10)
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(10)
    expect(html).toContain('mq-math-fraction')
    expect(html).toContain('mq-math-superscript')
    expect(html).toContain('mq-math-root')
    expect(html).toContain('mq-math-row')
    expect(html).toContain('π')
  })

  it.each(fixtures)('gives "$label" one authored name', ({ label, notation }) => {
    const html = renderToStaticMarkup(<MathNotation notation={notation} label={label} />)

    expect(html.match(/role="math"/g)).toHaveLength(1)
    expect(html).toContain(`aria-label="${label}"`)
  })

  it('scales from its caller only when embedded in an answer slot', () => {
    const entry = renderToStaticMarkup(
      <MathNotation notation={fixtures[0].notation} label={fixtures[0].label} size="entry" />,
    )
    const fluid = renderToStaticMarkup(<MathNotation {...fixtures[0]} />)

    expect(entry).toContain('mq-math-entry')
    expect(fluid).not.toContain('mq-math-entry')
  })
})
