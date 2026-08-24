import { fractionEntryNotation } from '../lib/math-notation'
import { MathNotation } from './MathNotation'

/** The shared visible echo for one numeric keypad entry. */
export function NumericEntry({
  value,
  minWidth = 2,
  fractionSize = 'entry',
  allowFraction = true,
}: {
  value: string
  minWidth?: number
  fractionSize?: 'fluid' | 'entry'
  allowFraction?: boolean
}) {
  const fraction = allowFraction ? fractionEntryNotation(value) : undefined
  const content =
    value === '' ? (
      <span className="inline-block w-[3px] h-[0.9em] bg-blossom-deep animate-pulse rounded-full" />
    ) : fraction ? (
      <MathNotation notation={fraction.notation} label={fraction.label} size={fractionSize} />
    ) : (
      value
    )
  const chars = Math.max(minWidth, value.length || 1)

  return (
    <span
      className="inline-flex items-center justify-end rounded-2xl bg-white/70 px-3 py-1 font-bold tabular-nums text-blossom-deep min-h-[1.3em]"
      style={{ minWidth: `${chars * 0.68}em` }}
    >
      {content}
    </span>
  )
}
