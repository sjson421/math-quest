import type { Display } from '../lib/types'

/**
 * Column layout matters pedagogically — it is how the carrying and borrowing
 * skills are actually taught, and seeing the digits stacked is most of the
 * explanation. Digits are right-aligned on a fixed grid so places line up.
 */
export function ProblemView({ display, entry }: { display: Display; entry: string }) {
  // Exhaustive rather than a fall-through to the column layout. `story` carries
  // the same `operands` and `operator` fields as `column`, so TypeScript narrows
  // the two together and an `if (inline)` guard would have rendered a word
  // problem as a stack of digits without a compile error.
  switch (display.kind) {
    case 'inline':
      return <InlineView display={display} entry={entry} />
    case 'column':
      return <ColumnView display={display} entry={entry} />
    case 'story':
      return <StoryView display={display} entry={entry} />
    default: {
      const unhandled: never = display
      throw new Error(`Unhandled display: ${JSON.stringify(unhandled)}`)
    }
  }
}

type Of<K extends Display['kind']> = Extract<Display, { kind: K }>

function InlineView({ display, entry }: { display: Of<'inline'>; entry: string }) {
  return (
    <div className="flex items-baseline justify-center gap-3">
      <span className="text-6xl font-bold tabular-nums tracking-tight">{display.text}</span>
      <span className="text-6xl font-bold text-ink-faint">=</span>
      <EntrySlot value={entry} />
    </div>
  )
}

/**
 * Prose above, answer slot below. The sentence is set at reading size rather
 * than problem size: the work here is understanding the situation, and a story
 * rendered in 6xl digits reads as an eye test.
 */
function StoryView({ display, entry }: { display: Of<'story'>; entry: string }) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-md">
      <p className="text-2xl font-medium leading-snug text-center text-balance">
        {display.text}
      </p>
      <EntrySlot value={entry} />
    </div>
  )
}

function ColumnView({ display, entry }: { display: Of<'column'>; entry: string }) {
  const width = Math.max(...display.operands.map((n) => String(n).length))

  return (
    <div
      className="inline-flex flex-col items-end font-bold tabular-nums text-6xl leading-tight"
      // Digits are split into per-character spans to keep places aligned, which
      // reads as "3, 8, plus, 1, 1" without this.
      role="math"
      aria-label={`${display.operands.join(` ${display.operator} `)} equals ${entry || 'blank'}`}
    >
      {display.operands.map((operand, i) => (
        <div key={i} className="flex items-center gap-4" aria-hidden>
          <span className="w-8 text-ink-soft text-5xl">
            {i === display.operands.length - 1 ? display.operator : ''}
          </span>
          <Digits value={String(operand)} width={width} />
        </div>
      ))}

      <div className="h-1.5 self-stretch rounded-full bg-ink-faint my-3" aria-hidden />

      <div className="flex items-center gap-4" aria-hidden>
        <span className="w-8" />
        <EntrySlot value={entry} minWidth={width} />
      </div>
    </div>
  )
}

function Digits({ value, width }: { value: string; width: number }) {
  const padded = value.padStart(width, ' ')
  return (
    <span className="flex">
      {[...padded].map((ch, i) => (
        <span key={i} className="w-[0.62em] text-center">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

function EntrySlot({ value, minWidth = 2 }: { value: string; minWidth?: number }) {
  const chars = Math.max(minWidth, value.length || 1)

  return (
    <span
      className="inline-flex items-center justify-end rounded-2xl bg-white/70 px-3 py-1 text-6xl font-bold tabular-nums text-blossom-deep min-h-[1.3em]"
      style={{ minWidth: `${chars * 0.68}em` }}
    >
      {value === '' ? (
        <span className="inline-block w-[3px] h-[0.9em] bg-blossom-deep animate-pulse rounded-full" />
      ) : (
        value
      )}
    </span>
  )
}
