import { motion } from 'framer-motion'

/**
 * How much of a unit or stage is mastered.
 *
 * Its own module because both browsing levels use it and neither owns it. The
 * skill cards deliberately do not: a single skill shows five mastery pips, which
 * says "level 3 of 5" in a way a bar cannot.
 */
export function ProgressBar({ share, fill }: { share: number; fill: string }) {
  const percent = Math.round(share * 100)

  return (
    <div
      className="h-2 rounded-full bg-cream-deep overflow-hidden mt-2"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% mastered`}
    >
      <motion.div
        className={`h-full rounded-full ${fill}`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 24 }}
      />
    </div>
  )
}
