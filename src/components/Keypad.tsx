import { motion } from 'framer-motion'
import { tap } from '../lib/haptics'
import { applyKey, type KeypadRules } from '../lib/keypad'

/**
 * A purpose-built number pad.
 *
 * The iOS system keyboard covers half the screen, animates in slowly, and makes
 * the whole thing feel like a web form. A custom pad is the single biggest
 * contributor to this reading as a real app.
 *
 * Emits a functional update rather than the next string — two taps landing in
 * the same React render must each apply to the value the previous one produced,
 * or the first digit is silently dropped. Very reachable when someone types
 * quickly on a phone.
 *
 * The pad both decides which keys to show and applies them, from the one
 * `rules` object. Splitting those across two owners is a rule that drifts, and
 * drift here is invisible: a key the entry logic discards looks exactly like a
 * key that is broken.
 */

type Props = {
  value: string
  onEntry: (apply: (prev: string) => string) => void
  onSubmit: () => void
  disabled?: boolean
  /** What this problem's answer may contain. Omitted means whole digits only. */
  rules?: KeypadRules
}

const KEY_STYLE =
  'flex items-center justify-center rounded-3xl bg-white text-ink font-bold shadow-[0_3px_0_0_var(--color-cream-deep)] active:shadow-none active:translate-y-[3px] transition-[transform,box-shadow] duration-75 h-16 text-3xl select-none'

export function Keypad({ value, onEntry, onSubmit, disabled, rules }: Props) {
  const { allowFraction = false, allowNegative = false, allowDecimal = false } = rules ?? {}

  const press = (k: string) => {
    tap()
    onEntry((prev) => applyKey(prev, k, rules))
  }

  const Key = ({ label, k, className = '' }: { label: string; k: string; className?: string }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      className={`${KEY_STYLE} ${className}`}
      onClick={() => press(k)}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </motion.button>
  )

  return (
    <div className="w-full max-w-sm mx-auto px-3 pb-3">
      <div className="grid grid-cols-4 gap-2.5">
        {['1', '2', '3'].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          className={`${KEY_STYLE} row-span-2 h-auto bg-blossom-soft text-2xl`}
          onClick={() => press('back')}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </motion.button>

        {['4', '5', '6', '7', '8', '9'].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          className={`${KEY_STYLE} row-span-2 h-auto bg-mint text-xl text-ink`}
          onClick={() => {
            tap()
            onSubmit()
          }}
          disabled={disabled || value.trim() === ''}
          style={{ opacity: disabled || value.trim() === '' ? 0.45 : 1 }}
        >
          Check
        </motion.button>

        {/* Bottom row adapts to the unit: whole-number skills need none of these. */}
        {allowNegative ? <Key label="−" k="-" /> : <span aria-hidden />}
        <Key label="0" k="0" />
        {allowFraction ? (
          <Key label="/" k="/" />
        ) : allowDecimal ? (
          <Key label="." k="." />
        ) : (
          <span aria-hidden />
        )}
      </div>
    </div>
  )
}
