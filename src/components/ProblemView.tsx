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
  // `add-tens` is the first inline skill with two operands of two digits, and
  // "40 + 40" at 6xl does not fit beside the equals sign and the answer slot on
  // a 375px phone — it wrapped, orphaning the operator on its own line.
  //
  // Seven characters, not six: `sub-facts` tops out at "18 − 9", which still
  // fits, and it is already shipped. Every inline skill built so far therefore
  // renders at exactly the size it does today.
  const wide = display.text.length > 6

  return (
    <div
      className={`flex items-baseline justify-center gap-3 ${wide ? 'text-5xl' : 'text-6xl'}`}
    >
      <span className="font-bold tabular-nums tracking-tight">{display.text}</span>
      <span className="font-bold text-ink-faint">=</span>
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
    <div className="flex flex-col items-center gap-6 max-w-md text-6xl">
      <p className="text-2xl font-medium leading-snug text-center text-balance">
        {display.text}
      </p>
      <EntrySlot value={entry} />
    </div>
  )
}

function ColumnView({ display, entry }: { display: Of<'column'>; entry: string }) {
  const width = Math.max(...display.operands.map((n) => String(n).length))

  // A stack of three is a row taller than any column the course had before it,
  // and at 6xl that row pushes "Show me a hint" underneath the keypad on a
  // phone — the hint becomes unreachable on exactly the skill whose hint
  // explains the carry. One size down buys back the row and still reads as
  // stacked digits, which is most of the explanation.
  //
  // Only the root size branches. Everything inside sizes in `em`, so the
  // operator, the rule and the answer slot follow it down on their own — which
  // is also what makes a fourth row cost one number here rather than four.
  const rows = display.operands.length

  return (
    <div
      className={`inline-flex flex-col items-end font-bold tabular-nums leading-tight ${
        rows > 2 ? 'text-5xl' : 'text-6xl'
      }`}
      // Digits are split into per-character spans to keep places aligned, which
      // reads as "3, 8, plus, 1, 1" without this.
      role="math"
      aria-label={`${display.operands.join(` ${display.operator} `)} equals ${entry || 'blank'}`}
    >
      {display.operands.map((operand, i) => (
        <div key={i} className="flex items-center gap-4" aria-hidden>
          <span className="w-8 text-ink-soft text-[0.8em]">
            {i === display.operands.length - 1 ? display.operator : ''}
          </span>
          <Digits value={String(operand)} width={width} />
        </div>
      ))}

      <div className="h-1.5 self-stretch rounded-full bg-ink-faint my-[0.2em]" aria-hidden />

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

/**
 * Sized in `em` throughout, and deliberately sets no size of its own — it takes
 * the problem's, so a display that scales itself down carries the answer slot
 * with it rather than having to thread a size in.
 */
function EntrySlot({ value, minWidth = 2 }: { value: string; minWidth?: number }) {
  const chars = Math.max(minWidth, value.length || 1)

  return (
    <span
      className="inline-flex items-center justify-end rounded-2xl bg-white/70 px-3 py-1 font-bold tabular-nums text-blossom-deep min-h-[1.3em]"
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
