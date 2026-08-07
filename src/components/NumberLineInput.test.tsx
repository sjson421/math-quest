import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { tickLabel, ticks, type NumberLineSpec } from '../lib/number-line'
import { rational } from '../lib/rational'
import { NumberLineInput } from './NumberLineInput'

/**
 * First paint, rendered to a string in the node environment.
 *
 * What this can cover is what the line *offers*: a control per tick, named by
 * its value, with no route to the system keyboard. What happens after a tap is
 * covered by the pure placement policy in `lib/number-line.test.ts`, because a
 * static render attaches no handlers.
 */

const line = (start: number, step: [number, number], count: number): NumberLineSpec => ({
  start: rational(start, 1),
  step: rational(step[0], step[1]),
  count,
})

const wholeNumbers = line(-5, [1, 1], 11)
const quarters = line(0, [1, 4], 9)
const dense = line(0, [1, 1], 31)

const render = (spec: NumberLineSpec, entry = '') =>
  renderToStaticMarkup(
    <NumberLineInput spec={spec} entry={entry} onPlace={() => {}} onConfirm={() => {}} />,
  )

const ariaLabels = (html: string) =>
  [...html.matchAll(/aria-label="([^"]*)"/g)].map((match) => match[1])

describe('NumberLineInput', () => {
  it('offers one button per tick, plus the confirm', () => {
    // Eleven ticks and one Check. A line that quietly dropped a tick would
    // still look like a number line.
    expect(render(wholeNumbers).match(/<button/g)).toHaveLength(12)
    expect(render(quarters).match(/<button/g)).toHaveLength(10)
  })

  it('names every tick by its value, in ascending order', () => {
    const expected = ticks(wholeNumbers).map(tickLabel)
    const labels = ariaLabels(render(wholeNumbers))

    // The group label comes first; the ticks follow it in order.
    expect(labels[0]).toBe('Number line')
    expect(labels.slice(1)).toEqual(expected)
    expect(expected[0]).toBe('−5')
    expect(expected.at(-1)).toBe('5')
  })

  it('names a fraction tick as a fraction', () => {
    expect(ariaLabels(render(quarters))).toContain('3/4')
  })

  it('keeps every tick reachable on a line too dense to label', () => {
    const html = render(dense)
    const labels = ariaLabels(html).slice(1)

    // Every tick is still a named button...
    expect(labels).toEqual(ticks(dense).map(tickLabel))
    // ...but only some of them draw their label, or they overlap at 375px.
    const drawn = [...html.matchAll(/leading-none[^>]*>([^<]*)</g)].filter(
      (match) => match[1] !== '',
    )
    expect(drawn.length).toBeLessThan(labels.length)
    expect(drawn.length).toBeGreaterThan(0)
  })

  it('marks the placed tick and nothing else', () => {
    const html = render(wholeNumbers, '-3')

    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(10)
  })

  it('cannot be confirmed until a value is placed', () => {
    // A tap is the only thing that fills the entry, so an empty entry means
    // nothing has been placed and there is nothing to submit.
    expect(render(wholeNumbers)).toContain('disabled=""')
    expect(render(wholeNumbers, '-3')).not.toContain('disabled=""')
  })

  it('opens no system keyboard', () => {
    const html = render(wholeNumbers)

    expect(html).not.toContain('<input')
    expect(html).not.toContain('<textarea')
    expect(html).not.toContain('contenteditable')
  })
})
