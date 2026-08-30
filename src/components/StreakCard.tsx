import { MAX_STREAK_FREEZES } from '../lib/streak'

/**
 * The streak, given the room it needs to matter.
 *
 * It used to be a 🔥 and a number in the header, the same size as the coin
 * count, which said the run of days was worth about as much as one lesson's
 * change. It is the only thing in the app the learner can lose, so it is the
 * one thing the home screen states in full.
 *
 * Props rather than the store, like every other level of the tree: `Home` is
 * the single component that reaches for the live record, which is what lets a
 * node test render this against a made-up one.
 *
 * **Nothing here loops.** The warning is the one element in the app that would
 * most tempt a pulse, and a pulsing warning is exactly what a learner with
 * reduced motion has turned off — so it reads standing still, in words, and the
 * colour is the decoration rather than the message.
 */
export function StreakCard({
  streakCount,
  atRisk,
  freezes,
  justSpent,
  multiplier,
  nextMilestone,
}: {
  streakCount: number
  atRisk: boolean
  freezes: number
  /** Freezes spent covering days away since the app was last opened. */
  justSpent: number
  multiplier: number
  nextMilestone?: { days: number; away: number }
}) {
  return (
    <div className="w-full max-w-xs px-6 mt-4">
      <div
        className={`rounded-blob px-4 py-3.5 shadow-soft ${
          atRisk ? 'bg-butter-soft' : 'bg-white'
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl" aria-hidden="true">
            🔥
          </span>
          <span className="font-bold text-2xl tabular-nums">{streakCount}</span>
          <span className="font-semibold text-ink-soft">day streak</span>
          {multiplier > 1 && (
            <span className="ml-auto rounded-full bg-mint-soft px-2.5 py-1 text-sm font-bold text-mint-deep tabular-nums">
              {multiplier}× coins
            </span>
          )}
        </div>

        {/* One line of state, chosen by what is actually true. A card that
            stacked all of them would bury the warning under the trivia. */}
        <p className="text-sm mt-1.5 text-ink-soft">
          {streakCount === 0 ? (
            'Finish a lesson to start one.'
          ) : atRisk ? (
            <span className="font-semibold text-butter-deep">
              Not practised today — finish a lesson to keep it.
            </span>
          ) : nextMilestone ? (
            <>
              {nextMilestone.away} {nextMilestone.away === 1 ? 'day' : 'days'} to the{' '}
              {nextMilestone.days}-day milestone.
            </>
          ) : (
            'Every milestone reached.'
          )}
        </p>

        {/* A freeze is bought and then spent by the app on the learner's
            behalf, on a day they were not here to see it. Saying so is the
            whole of what they paid for — a streak that survived with no
            explanation reads as one that was never at risk. */}
        {justSpent > 0 && (
          <p className="text-sm mt-1 font-semibold text-mint-deep">
            <span aria-hidden="true">❄ </span>
            {justSpent === 1
              ? 'A freeze covered the day you missed.'
              : `${justSpent} freezes covered the days you missed.`}
          </p>
        )}

        {freezes > 0 && (
          <p className="text-sm mt-1 text-ink-soft">
            <span aria-hidden="true">❄ </span>
            {freezes} of {MAX_STREAK_FREEZES} freezes held —{' '}
            {freezes === 1 ? 'covers one missed day' : 'covers two missed days'}.
          </p>
        )}
      </div>
    </div>
  )
}
