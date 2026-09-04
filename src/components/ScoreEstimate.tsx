import { useId } from 'react'
import {
  bandForScore,
  estimateGedScore,
  GED_SCORE_ANCHORS,
  type PracticePoints,
} from '../lib/score-estimation'

const TECHNICAL_MANUAL_URL =
  'https://www.ged.com/wp-content/uploads/2014-GED-Test-Technical-Manual-2022-V2022.01-SECURED2.pdf'
const SCORE_GUIDANCE_URL = 'https://www.ged.com/about-test/scores.html'

/**
 * A composable estimate result for the future Stage H form.
 *
 * It owns no learner state or actions. The future form supplies points, and
 * this card keeps those points, the approximation, and its limits together.
 */
export function ScoreEstimate({ earned, possible }: PracticePoints) {
  const estimate = estimateGedScore({ earned, possible })
  const band = bandForScore(estimate.score)
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '') || 'result'
  const titleId = `ged-score-estimate-title-${id}`
  const caveatId = `ged-score-estimate-caveat-${id}`

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={caveatId}
      className="mx-auto flex w-full max-w-md min-w-0 flex-col gap-2 px-4 py-3"
      data-score-estimate
    >
      <div className="min-w-0 rounded-blob bg-white p-4 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wide text-lilac-deep">Practice result</p>
        <h2 id={titleId} className="mt-1 text-2xl font-bold">
          Estimated GED Math score
        </h2>
        <p className="mt-3 text-4xl font-bold tabular-nums" data-score-estimate-score>
          About {estimate.score}
        </p>
        <p className="mt-1 text-ink-soft" data-score-estimate-points>
          {estimate.earned} of {estimate.possible} practice points earned
        </p>
        <p className="mt-2 font-bold" data-score-estimate-band>
          Estimated range: {band.label}
        </p>
      </div>

      <p id={caveatId} className="rounded-2xl bg-butter-soft px-4 py-2.5 text-sm leading-5">
        This is an estimate, not an official GED score. GED Testing Service uses scored points and
        form-specific equating, so an official score can differ. Only an official score report
        determines a test outcome.
      </p>

      <details className="min-w-0 rounded-2xl bg-white shadow-soft" data-score-estimate-details>
        <summary className="cursor-pointer px-4 py-2 font-bold">How this estimate works</summary>
        <div className="min-w-0 px-4 pb-3 text-sm leading-4">
          <p>
            Math Quest linearly interpolates values between these rows, then rounds the result to a
            whole scaled-score point.
          </p>

          <div className="mt-2 min-w-0 overflow-hidden rounded-xl border border-cream-deep">
            <table className="w-full table-fixed text-left" data-score-estimate-table>
              <caption className="sr-only">Practice-point mapping used for this estimate</caption>
              <colgroup>
                <col className="w-3/5" />
                <col className="w-2/5" />
              </colgroup>
              <thead className="bg-cream-deep">
                <tr>
                  <th className="break-words px-3 py-1 font-bold" scope="col">
                    Practice points earned
                  </th>
                  <th className="break-words px-3 py-1 font-bold" scope="col">
                    Estimated scaled score
                  </th>
                </tr>
              </thead>
              <tbody>
                {GED_SCORE_ANCHORS.map((anchor) => (
                  <tr key={anchor.percent} className="border-t border-cream-deep">
                    <td className="px-3 py-1 tabular-nums" data-score-estimate-percent>
                      {anchor.percent}%
                    </td>
                    <td className="px-3 py-1 tabular-nums" data-score-estimate-anchor-score>
                      {anchor.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[0.6875rem] leading-4">
            <p className="font-bold">Sources for this approximation</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <a
                  className="break-words font-semibold underline"
                  href={TECHNICAL_MANUAL_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  GED Testing Service 2022 Technical Manual
                </a>{' '}
                — score scaling and Mathematical Reasoning reference points; updated performance-level ranges.
              </li>
              <li>
                <a
                  className="break-words font-semibold underline"
                  href={SCORE_GUIDANCE_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  GED Testing Service current score guidance
                </a>{' '}
                — current score-level guidance for the four performance-level ranges and labels.
              </li>
            </ul>
          </div>
        </div>
      </details>
    </section>
  )
}
