import { motion } from 'framer-motion'
import type { Equipped } from '../cosmetics'
import type { PinUpgrade as Upgrade } from '../lib/pin'
import { Mascot } from './Mascot'

/**
 * The moment a pin gets fancier.
 *
 * Modelled on `StageCheckpoint` down to the single Continue action, because it
 * sits in the same sequence and a second visual language for "something good
 * happened, tap once" would make the pair read as two unrelated interruptions.
 *
 * **The copy is about the pin, never about the learner.** A stage checkpoint is
 * careful not to claim mastery, and this is under the same rule for the same
 * reason: the pin marks distance covered, and saying so plainly is honest where
 * "you're brilliant" is a claim the app cannot make.
 */
export function PinUpgrade({
  upgrade,
  onContinue,
  character,
  equipped,
}: {
  upgrade: Upgrade
  onContinue: () => void
  character?: string
  equipped?: Equipped
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center"
    >
      <div className="rounded-full bg-butter-soft px-4 py-2 text-sm font-bold text-butter-deep">
        New pin
      </div>

      {/* At the tier just earned, not the one being left — the whole point of
          the screen is seeing the new one on your own character. */}
      <Mascot
        state="celebrating"
        size={190}
        character={character}
        equipped={equipped}
        tier={upgrade.tier}
      />

      <div>
        {/* The name is a noun on its own line rather than the object of a
            sentence: "your pin is now a rosette" and "your pin is now studded"
            cannot both be phrased one way, and the tier count tells the learner
            the ladder has an end. */}
        <h2 className="text-3xl font-bold">Your pin grew!</h2>
        <p className="mt-1 font-bold text-butter-deep">
          {upgrade.name} — tier {upgrade.tier} of {upgrade.of}
        </p>
        <p className="text-ink-soft mt-2 max-w-xs">
          It grows as you take more skills past the point that opens the next one. Nothing to
          buy — you earned this one.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full max-w-xs h-14 rounded-2xl bg-butter-deep text-white font-bold text-lg active:scale-[0.98] transition-transform"
      >
        Continue
      </button>
    </motion.div>
  )
}
