import { motion } from 'framer-motion'
import type { Equipped } from '../cosmetics'
import type { StageCheckpoint as Checkpoint } from '../lib/checkpoint'
import { Mascot } from './Mascot'

export function StageCheckpoint({
  checkpoint,
  onContinue,
  character,
  equipped,
}: {
  checkpoint: Checkpoint
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
      <div className="rounded-full bg-lilac-soft px-4 py-2 text-sm font-bold text-lilac-deep">
        Stage checkpoint
      </div>

      <Mascot state="celebrating" size={190} character={character} equipped={equipped} />

      <div>
        <h2 className="text-3xl font-bold">{checkpoint.name} boundary reached!</h2>
        <p className="text-ink-soft mt-2 max-w-xs">
          The next stretch is ready. You can still return here and keep building mastery.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full max-w-xs h-14 rounded-2xl bg-lilac-deep text-white font-bold text-lg active:scale-[0.98] transition-transform"
      >
        Continue
      </button>
    </motion.div>
  )
}
