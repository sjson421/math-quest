import { describe, expect, it } from 'vitest'
import {
  bandForScore,
  estimateGedScore,
  GED_SCORE_BANDS,
  GED_SCORE_ANCHORS,
  ScoreEstimationError,
  type PracticePoints,
} from './score-estimation'

describe('GED score estimation', () => {
  it('keeps every published reference anchor exact', () => {
    for (const anchor of GED_SCORE_ANCHORS) {
      expect(estimateGedScore({ earned: anchor.percent, possible: 100 }).score).toBe(anchor.score)
    }
  })

  it('treats equivalent point ratios the same', () => {
    expect(estimateGedScore({ earned: 43, possible: 100 }).score).toBe(150)
    expect(estimateGedScore({ earned: 86, possible: 200 }).score).toBe(150)
  })

  it('interpolates between anchors and rounds one final half point upward', () => {
    // 73/160 = 45.625%, which is 151.5 before the final rounding step.
    expect(estimateGedScore({ earned: 73, possible: 160 })).toMatchObject({
      percentage: 45.625,
      score: 152,
      band: 'high-school-equivalency',
    })
  })

  it('keeps endpoint scores in the supported scale', () => {
    expect(estimateGedScore({ earned: 0, possible: 1 }).score).toBe(100)
    expect(estimateGedScore({ earned: 1, possible: 1 }).score).toBe(200)
  })

  it('never lowers an estimate when earned points increase', () => {
    let previous = estimateGedScore({ earned: 0, possible: 100 }).score

    for (let earned = 1; earned <= 100; earned += 1) {
      const score = estimateGedScore({ earned, possible: 100 }).score
      expect(score).toBeGreaterThanOrEqual(previous)
      previous = score
    }
  })

  it('classifies every documented band edge from the rounded score', () => {
    const edges = [
      [144, 'below-passing'],
      [145, 'high-school-equivalency'],
      [164, 'high-school-equivalency'],
      [165, 'college-ready'],
      [174, 'college-ready'],
      [175, 'college-ready-credit'],
    ] as const

    for (const [score, id] of edges) expect(bandForScore(score).id).toBe(id)
    expect(bandForScore(100).id).toBe(GED_SCORE_BANDS[0].id)
    expect(bandForScore(200).id).toBe(GED_SCORE_BANDS[3].id)
  })

  it('rejects every invalid practice-point class with one named error', () => {
    const invalid: unknown[] = [
      { earned: 1.5, possible: 10 },
      { earned: 1, possible: 10.5 },
      { earned: Number.NaN, possible: 10 },
      { earned: 1, possible: Number.POSITIVE_INFINITY },
      { earned: Number.MAX_SAFE_INTEGER + 1, possible: Number.MAX_SAFE_INTEGER + 1 },
      { earned: -1, possible: 10 },
      { earned: 0, possible: 0 },
      { earned: 0, possible: -1 },
      { earned: 11, possible: 10 },
    ]

    for (const points of invalid) {
      expect(() => estimateGedScore(points as PracticePoints)).toThrow(ScoreEstimationError)
      expect(() => estimateGedScore(points as PracticePoints)).toThrow('Invalid GED practice points')
    }
  })
})
