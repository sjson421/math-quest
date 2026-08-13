import { motion } from 'framer-motion'

/**
 * The shared button chrome both pads are built from.
 *
 * `Keypad` and `ExpressionKeypad` accept two different key alphabets and apply
 * two entirely different grammars (`applyKey` vs `applyExpressionKey` — see
 * `src/lib/keypad.ts`), which is why they stay separate components. The
 * button markup underneath has no grammar in it, so it is the one thing
 * worth sharing between them.
 */
export const KEY_STYLE =
  'flex items-center justify-center rounded-3xl bg-white text-ink font-bold shadow-[0_3px_0_0_var(--color-cream-deep)] active:shadow-none active:translate-y-[3px] transition-[transform,box-shadow] duration-75 h-16 text-3xl select-none'

export function KeypadKey({
  label,
  onPress,
  ariaLabel = label,
  className = '',
  disabled,
}: {
  label: string
  onPress: () => void
  ariaLabel?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      className={`${KEY_STYLE} ${className}`}
      onClick={onPress}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label}
    </motion.button>
  )
}
