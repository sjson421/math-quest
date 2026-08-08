import { motion } from 'framer-motion'
import { tap } from '../lib/haptics'
import {
  placement,
  tickEntry,
  tickLabel,
  ticks,
  type NumberLineSpec,
} from '../lib/number-line'

type Props = {
  spec: NumberLineSpec
  /** The placed value, as the lesson's ordinary entry. Empty means none. */
  entry: string
  onPlace: (entry: string) => void
  onConfirm: () => void
  disabled?: boolean
}

/**
 * A line the learner places a value on.
 *
 * Every tick is a real button rather than a hit-tested coordinate. That is what
 * gives assistive technology a control per position with the value as its name,
 * and it keeps the whole interaction out of pointer arithmetic — which matters
 * here beyond taste, because coordinate maths is precisely what a first-paint
 * test cannot execute.
 *
 * A tap places; it does not answer. Choice input can submit on tap because its
 * controls are tall and few, but a line packs every tick into one strip, so at
 * phone width a tap that lands one tick out is a slip rather than a wrong
 * answer. Confirming is the separate, deliberate step — the same shape as the
 * pad, whose Check is likewise dead until there is something to check.
 */
export function NumberLineInput({ spec, entry, onPlace, onConfirm, disabled }: Props) {
  const tickList = ticks(spec)
  const placed = placement(tickList, entry)

  // Labels thin out rather than overlapping: at 375px a dozen is what fits, and
  // a line that draws every one of thirty is unreadable. The button and its
  // accessible name stay on every tick, so this is a visual density rule and
  // never a reachability one.
  const labelEvery = Math.ceil(tickList.length / 11)

  // Phased so zero always carries a label, rather than counted from the left
  // end. Anchored at the end, roughly half of `negatives-numberline`'s lines
  // drew every second tick and skipped zero — on the one skill whose hint says
  // to start there and whose first worked step is "find zero in the middle of
  // the line". Shifting the phase rather than adding a label keeps the spacing
  // exactly as measured; an extra label between two existing ones is what
  // collides at this width. Falls back to the left end on a line with no zero
  // on it, which is what `fractions-numberline` will mostly draw.
  const zeroAt = tickList.findIndex((tick) => tick.n === 0)
  const anchor = zeroAt === -1 ? 0 : zeroAt % labelEvery

  return (
    <div className="w-full max-w-sm mx-auto px-3 pb-3">
      <div className="relative flex items-end pt-2" role="group" aria-label="Number line">
        <div
          className="absolute left-0 right-0 top-[1.15rem] h-1 rounded-full bg-ink-faint"
          aria-hidden
        />

        {tickList.map((tick, i) => {
          const value = tickEntry(tick)
          const isPlaced = i === placed.index

          return (
            <motion.button
              key={value}
              type="button"
              whileTap={{ scale: 0.9 }}
              // Narrow but tall: the target is the full column, not the dot.
              className="relative flex-1 flex flex-col items-center gap-1.5 min-h-16 pt-1 disabled:opacity-50"
              onClick={() => {
                tap()
                onPlace(value)
              }}
              disabled={disabled}
              aria-label={tickLabel(tick)}
              aria-pressed={isPlaced}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isPlaced
                    ? 'bg-blossom-deep border-blossom-deep'
                    : 'bg-white border-ink-faint'
                }`}
                aria-hidden
              />
              <span
                className={`text-xs font-bold tabular-nums leading-none ${
                  isPlaced ? 'text-blossom-deep' : 'text-ink-soft'
                }`}
                aria-hidden
              >
                {i % labelEvery === anchor ? tickLabel(tick) : ''}
              </span>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        className="mt-3 w-full h-14 rounded-2xl bg-mint text-ink font-bold text-lg shadow-[0_3px_0_0_var(--color-cream-deep)] active:shadow-none active:translate-y-[3px] transition-[transform,box-shadow]"
        onClick={() => {
          tap()
          onConfirm()
        }}
        disabled={disabled || !placed.canConfirm}
        style={{ opacity: disabled || !placed.canConfirm ? 0.45 : 1 }}
      >
        Check
      </motion.button>
    </div>
  )
}
