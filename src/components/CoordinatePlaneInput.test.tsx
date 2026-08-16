import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CoordinatePlane as CoordinatePlaneSpec } from '../lib/coordinate-plane'
import { CoordinatePlaneInput } from './CoordinatePlaneInput'

const plane = (reach: number, step = 1): CoordinatePlaneSpec => ({
  x: { min: -reach, max: reach, step },
  y: { min: -reach, max: reach, step },
  points: [],
  lines: [],
})

const render = (graph: CoordinatePlaneSpec, entry = '', disabled = false) =>
  renderToStaticMarkup(
    <CoordinatePlaneInput
      plane={graph}
      entry={entry}
      onPlace={() => {}}
      onConfirm={() => {}}
      disabled={disabled}
    />,
  )

const targetTags = (html: string) =>
  [...html.matchAll(/<button[^>]*data-coordinate-target[^>]*>/g)].map((match) => match[0])

const nudgeTags = (html: string) =>
  [...html.matchAll(/<button[^>]*data-coordinate-nudge[^>]*>/g)].map((match) => match[0])

describe('CoordinatePlaneInput', () => {
  it('offers every declared target, five large nudges, and one confirmation', () => {
    const html = render(plane(2, 2))

    expect(html.match(/data-coordinate-target=/g)).toHaveLength(9)
    expect(html.match(/<button/g)).toHaveLength(15)
    expect(nudgeTags(html)).toHaveLength(5)
    expect(nudgeTags(html).every((tag) => tag.includes('h-12 min-w-12'))).toBe(true)
    expect(html).toContain('aria-label="(−2, 2)"')
    expect(html).toContain('aria-label="(2, −2)"')
    expect(html).toContain('aria-label="Place point at origin"')
    expect(html).toContain('>Check</button>')
  })

  it('starts with origin as the sole tab stop and nothing selected', () => {
    const html = render(plane(2, 2))

    expect(targetTags(html).filter((tag) => tag.includes('tabindex="0"'))).toHaveLength(1)
    expect(html).toContain(
      'aria-label="(0, 0)" aria-pressed="false" tabindex="0"',
    )
    expect(html.match(/aria-pressed="true"/g) ?? []).toHaveLength(0)
    expect(html.match(/disabled=""/g)).toHaveLength(1)
  })

  it('marks only the placed point, moves the tab stop, and enables Check', () => {
    const html = render(plane(2, 2), '2,-2')

    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toContain(
      'aria-label="(2, −2)" aria-pressed="true" tabindex="0"',
    )
    expect(html.match(/data-coordinate-selection=/g)).toHaveLength(1)
    expect(html).toContain('aria-label="Move point y minus" disabled=""')
    expect(html).toContain('aria-label="Move point x plus" disabled=""')
    expect(html.match(/disabled=""/g)).toHaveLength(2)
    expect(html.match(/<button[^>]*>Check<\/button>/)?.[0]).not.toContain('disabled=""')
  })

  it('keeps all 441 dense targets available with one sequential tab stop', () => {
    const html = render(plane(10))

    expect(html.match(/data-coordinate-target=/g)).toHaveLength(441)
    expect(nudgeTags(html)).toHaveLength(5)
    expect(targetTags(html).filter((tag) => tag.includes('tabindex="0"'))).toHaveLength(1)
    expect(targetTags(html).filter((tag) => tag.includes('tabindex="-1"'))).toHaveLength(440)
  })

  it('uses buttons rather than a system text entry', () => {
    const html = render(plane(2, 2))

    expect(html).not.toContain('<input')
    expect(html).not.toContain('<textarea')
    expect(html).not.toContain('contenteditable')
    expect(html).not.toContain('<canvas')
  })

  it('disables every target, nudge, and confirmation while feedback owns the lesson', () => {
    const html = render(plane(2, 2), '2,-2', true)

    expect(html.match(/disabled=""/g)).toHaveLength(15)
  })
})
