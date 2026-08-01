import { motion } from 'framer-motion'
import { tap } from '../lib/haptics'
import type { Choice } from '../lib/types'

type Props = {
  choices: readonly Choice[]
  onChoose: (id: string) => void
  disabled?: boolean
}

/** A problem's authored answer options, kept separate from the lesson state machine. */
export function ChoiceInput({ choices, onChoose, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto px-3 pb-3">
      {choices.map((choice) => (
        <motion.button
          key={choice.id}
          type="button"
          whileTap={{ scale: 0.98 }}
          className="min-h-16 rounded-2xl bg-white px-5 py-3 text-lg font-bold leading-snug text-ink shadow-[0_3px_0_0_var(--color-cream-deep)] break-words active:shadow-none active:translate-y-[3px] transition-[transform,box-shadow] disabled:opacity-50"
          onClick={() => {
            tap()
            onChoose(choice.id)
          }}
          disabled={disabled}
        >
          {choice.label}
        </motion.button>
      ))}
    </div>
  )
}
