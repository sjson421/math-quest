import { motion } from 'framer-motion'
import type { Equipped } from '../cosmetics'
import type { PinTier } from '../lib/pin'
import { streakMultiplier, type StreakMilestone as Milestone } from '../lib/streak'
import { Mascot } from './Mascot'

/**
 * The moment a run of days pays out.
 *
 * Modelled on `PinUpgrade` down to the single Continue action, for the reason
 * that screen is modelled on `StageCheckpoint`: it sits in the same sequence,
 * and a third visual language for "something good happened, tap once" would
 * make the set read as unrelated interruptions.
 *
 * **The copy is about the days, never about the learner.** Same rule the pin
 * screen is under: the app can say how many days in a row a lesson was done,
 * because it counted them. It cannot say what that makes somebody.
 */
export function StreakMilestone({
  milestone,
  streakCount,
  onContinue,
  character,
  equipped,
  tier,
}: {
  milestone: Milestone
  streakCount: number
  onContinue: () => void
  character?: string
  equipped?: Equipped
  tier?: PinTier
}) {
  // Read from the streak rather than from the milestone, so the line is right
  // on a record that jumped several days and landed above the day it names.
  const multiplier = streakMultiplier(streakCount)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center"
    >
      <div className="rounded-full bg-blossom-soft px-4 py-2 text-sm font-bold text-blossom-deep">
        Streak milestone
      </div>

      <Mascot
        state="celebrating"
        size={190}
        character={character}
        equipped={equipped}
        tier={tier}
      />

      <div>
        <h2 className="text-3xl font-bold">
          <span aria-hidden="true">🔥 </span>
          {milestone.days} days in a row
        </h2>
        <p className="mt-1 font-bold text-blossom-deep">
          Milestone {milestone.index} of {milestone.of} · +{milestone.coins} coins
        </p>
        {multiplier > 1 && (
          <p className="text-ink-soft mt-2 max-w-xs">
            Lessons now pay {multiplier}× coins while the streak holds.
          </p>
        )}
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full max-w-xs h-14 rounded-2xl bg-blossom-deep text-white font-bold text-lg active:scale-[0.98] transition-transform"
      >
        Continue
      </button>
    </motion.div>
  )
}
