import { motion } from 'framer-motion'
import { tap } from '../lib/haptics'
import { applyExpressionKey } from '../lib/keypad'
import { KEY_STYLE, KeypadKey } from './keypad-key'

/**
 * A pad for typing a single-variable expression.
 *
 * A sibling of `Keypad` rather than a mode of it: the expression grammar
 * shares no character with the numeric pad (no decimal point or fraction
 * slash) and needs parentheses, infix operators, and a variable key the
 * numeric pad's four columns have no room for — see design.md in
 * `add-expression-input` for why this is a separate layout rather than a
 * squeezed-in bottom row.
 */

type Props = {
  value: string
  variable: string
  maxDegree?: 2
  onEntry: (apply: (prev: string) => string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function ExpressionKeypad({ value, variable, maxDegree, onEntry, onSubmit, disabled }: Props) {
  const degree = maxDegree ?? 1
  const press = (k: string) => {
    tap()
    onEntry((prev) => applyExpressionKey(prev, k, variable, degree))
  }

  return (
    <div className="w-full max-w-sm mx-auto px-3 pb-3">
      <div className="grid grid-cols-4 gap-2.5">
        {['1', '2', '3'].map((d) => (
          <KeypadKey key={d} label={d} onPress={() => press(d)} />
        ))}
        <KeypadKey label="(" ariaLabel="Open parenthesis" onPress={() => press('(')} />

        {['4', '5', '6'].map((d) => (
          <KeypadKey key={d} label={d} onPress={() => press(d)} />
        ))}
        <KeypadKey label=")" ariaLabel="Close parenthesis" onPress={() => press(')')} />

        {['7', '8', '9'].map((d) => (
          <KeypadKey key={d} label={d} onPress={() => press(d)} />
        ))}
        <KeypadKey
          label={variable}
          ariaLabel={`Variable ${variable}`}
          className="bg-lilac-soft"
          onPress={() => press(variable)}
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          className={`${KEY_STYLE} bg-blossom-soft text-2xl`}
          onClick={() => press('back')}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </motion.button>
        <KeypadKey label="−" ariaLabel="Minus" onPress={() => press('-')} />
        <KeypadKey label="0" onPress={() => press('0')} />
        <KeypadKey label="+" ariaLabel="Plus" onPress={() => press('+')} />

        {degree === 2 ? (
          <KeypadKey
            label="²"
            ariaLabel="Square"
            className="bg-lilac-soft"
            onPress={() => press('²')}
          />
        ) : (
          <div aria-hidden="true" />
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          className={`${KEY_STYLE} col-span-3 bg-mint text-xl text-ink`}
          onClick={() => {
            tap()
            onSubmit()
          }}
          disabled={disabled || value.trim() === ''}
          style={{ opacity: disabled || value.trim() === '' ? 0.45 : 1 }}
        >
          Check
        </motion.button>
      </div>
    </div>
  )
}
