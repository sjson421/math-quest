/**
 * Transparent GED Mathematical Reasoning practice-score estimation.
 *
 * The anchors are published reference points, not an official raw-score table.
 * Keeping them beside the interpolation makes the calculation inspectable and
 * gives the result card one source for the rows it explains.
 */

export type PracticePoints = Readonly<{
  earned: number
  possible: number
}>

export const GED_SCORE_ANCHORS = [
  { percent: 0, score: 100 },
  { percent: 43, score: 150 },
  { percent: 78, score: 170 },
  { percent: 100, score: 200 },
] as const

export const GED_SCORE_BANDS = [
  { id: 'below-passing', min: 100, max: 144, label: 'Below Passing' },
  { id: 'high-school-equivalency', min: 145, max: 164, label: 'High School Equivalency' },
  { id: 'college-ready', min: 165, max: 174, label: 'College Ready' },
  { id: 'college-ready-credit', min: 175, max: 200, label: 'College Ready + Credit' },
] as const

export type GedScoreBand = (typeof GED_SCORE_BANDS)[number]
export type GedScoreBandId = GedScoreBand['id']

export type GedScoreEstimate = Readonly<PracticePoints & {
  percentage: number
  score: number
  band: GedScoreBandId
}>

export class ScoreEstimationError extends Error {
  constructor(message = 'Invalid GED practice points') {
    super(message)
    this.name = 'ScoreEstimationError'
  }
}

function assertPracticePoints(points: PracticePoints): void {
  if (
    !points ||
    typeof points !== 'object' ||
    !Number.isSafeInteger(points.earned) ||
    !Number.isSafeInteger(points.possible) ||
    points.earned < 0 ||
    points.possible <= 0 ||
    points.earned > points.possible
  ) {
    throw new ScoreEstimationError()
  }
}

/** Return current GED Math guidance for one already-rounded scaled score. */
export function bandForScore(score: number): GedScoreBand {
  const band = GED_SCORE_BANDS.find(({ min, max }) => score >= min && score <= max)
  if (!band) throw new ScoreEstimationError(`Invalid GED scaled score: ${score}`)
  return band
}

function interpolateScore(percent: number): number {
  for (let index = 1; index < GED_SCORE_ANCHORS.length; index += 1) {
    const lower = GED_SCORE_ANCHORS[index - 1]
    const upper = GED_SCORE_ANCHORS[index]
    if (percent <= upper.percent) {
      const position = (percent - lower.percent) / (upper.percent - lower.percent)
      return lower.score + position * (upper.score - lower.score)
    }
  }

  return GED_SCORE_ANCHORS[GED_SCORE_ANCHORS.length - 1].score
}

/**
 * Estimate one practice form from its earned and possible points.
 *
 * The percentage stays unrounded until after interpolation. Rounding earlier
 * would make equivalent point totals disagree near an anchor.
 */
export function estimateGedScore(points: PracticePoints): GedScoreEstimate {
  assertPracticePoints(points)

  const percentage = (points.earned / points.possible) * 100
  const score = Math.round(interpolateScore(percentage))

  return {
    earned: points.earned,
    possible: points.possible,
    percentage,
    score,
    band: bandForScore(score).id,
  }
}
