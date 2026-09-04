import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useProgress } from '../store/progress'
import { ScoreEstimate } from './ScoreEstimate'

const ANCHORS = [
  { percent: 0, score: 100 },
  { percent: 43, score: 150 },
  { percent: 78, score: 170 },
  { percent: 100, score: 200 },
] as const

const BANDS = [
  { min: 100, max: 144, label: 'Below Passing' },
  { min: 145, max: 164, label: 'High School Equivalency' },
  { min: 165, max: 174, label: 'College Ready' },
  { min: 175, max: 200, label: 'College Ready + Credit' },
] as const

function expectedScore(earned: number, possible: number): number {
  const percent = (earned / possible) * 100
  for (let index = 1; index < ANCHORS.length; index += 1) {
    const lower = ANCHORS[index - 1]
    const upper = ANCHORS[index]
    if (percent <= upper.percent) {
      const position = (percent - lower.percent) / (upper.percent - lower.percent)
      return Math.round(lower.score + position * (upper.score - lower.score))
    }
  }
  return ANCHORS[ANCHORS.length - 1].score
}

function expectedBand(score: number): string {
  return BANDS.find(({ min, max }) => score >= min && score <= max)?.label ?? ''
}

const render = (earned: number, possible: number) =>
  renderToStaticMarkup(<ScoreEstimate earned={earned} possible={possible} />)

describe('ScoreEstimate', () => {
  it('keeps an anchor result and its evidence together on first paint', () => {
    const earned = 43
    const possible = 100
    const score = expectedScore(earned, possible)
    const html = render(earned, possible)

    expect(html).toContain('Estimated GED Math score')
    expect(html).toContain(`About ${score}`)
    expect(html).toContain(`${earned} of ${possible} practice points earned`)
    expect(html).toContain(`Estimated range: ${expectedBand(score)}`)
    expect(html).toContain('This is an estimate, not an official GED score')
    expect(html).toContain('form-specific equating')
    expect(html).toContain('scored points')
    expect(html).toContain('official score report')
  })

  it('derives an interpolated result and band independently from its visible points', () => {
    const earned = 73
    const possible = 160
    const score = expectedScore(earned, possible)
    const html = render(earned, possible)

    expect(html).toContain(`About ${score}`)
    expect(html).toContain(`Estimated range: ${expectedBand(score)}`)
    expect(html).toContain('linearly interpolates values between these rows')
  })

  it('renders every estimated band label without making a pass or credential claim', () => {
    for (const [earned, possible] of [
      [0, 100],
      [43, 100],
      [78, 100],
      [100, 100],
    ]) {
      const html = render(earned, possible)
      expect(html).toContain(expectedBand(expectedScore(earned, possible)))
      expect(html).not.toMatch(/you (?:have )?passed|earned a GED|received a GED|credential/i)
    }
  })

  it('uses one labelled result section and one semantic four-row mapping table', () => {
    const html = render(43, 100)

    expect(html.match(/<section /g)).toHaveLength(1)
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('<details')
    expect(html).toContain('How this estimate works')
    expect(html.match(/<table/g)).toHaveLength(1)
    expect(html).toMatch(/<th[^>]*scope="col">Practice points earned<\/th>/)
    expect(html).toMatch(/<th[^>]*scope="col">Estimated scaled score<\/th>/)
    expect(html.match(/data-score-estimate-percent/g)).toHaveLength(4)
    expect(html.match(/data-score-estimate-anchor-score/g)).toHaveLength(4)
    expect(html.indexOf('>0%<')).toBeLessThan(html.indexOf('>43%<'))
    expect(html.indexOf('>43%<')).toBeLessThan(html.indexOf('>78%<'))
    expect(html.indexOf('>78%<')).toBeLessThan(html.indexOf('>100%<'))
    expect(html).toContain('GED Testing Service 2022 Technical Manual')
    expect(html).toContain('GED Testing Service current score guidance')
    expect(html).toContain('updated performance-level ranges')
    expect(html).toContain('current score-level guidance')
    expect(html).toContain('href="https://www.ged.com/wp-content/uploads/2014-GED-Test-Technical-Manual-2022-V2022.01-SECURED2.pdf"')
    expect(html).toContain('href="https://www.ged.com/about-test/scores.html"')
  })

  it('does not touch progress state, version, or the network while rendering', () => {
    const before = useProgress.getState().progress
    const beforeSnapshot = JSON.stringify(before)
    const beforeVersion = before.version
    const fetchBefore = globalThis.fetch

    render(100, 100)

    expect(useProgress.getState().progress).toBe(before)
    expect(JSON.stringify(useProgress.getState().progress)).toBe(beforeSnapshot)
    expect(useProgress.getState().progress.version).toBe(beforeVersion)
    expect(globalThis.fetch).toBe(fetchBefore)
  })
})
