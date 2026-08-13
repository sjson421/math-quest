import type { DecimalArithmeticData, Display, Problem } from '../lib/types'
import { decimalColumnText } from '../lib/decimal'
import { entrySpokenLabel, fractionEntryNotation } from '../lib/math-notation'
import { MathNotation } from './MathNotation'
import { ShapeDiagram } from './ShapeDiagram'

/**
 * Column layout matters pedagogically — it is how the carrying and borrowing
 * skills are actually taught, and seeing the digits stacked is most of the
 * explanation. Digits are right-aligned on a fixed grid so places line up.
 */
export function ProblemView({
  display,
  entry,
  entryMode = 'keypad',
}: {
  display: Display
  entry: string
  entryMode?: Problem['inputMode']
}) {
  // Exhaustive rather than a fall-through to the column layout. `story` carries
  // the same `operands` and `operator` fields as `column`, so TypeScript narrows
  // the two together and an `if (inline)` guard would have rendered a word
  // problem as a stack of digits without a compile error.
  switch (display.kind) {
    case 'inline':
      return <InlineView display={display} entry={entry} entryMode={entryMode} />
    case 'column':
      return <ColumnView display={display} entry={entry} entryMode={entryMode} />
    case 'decimal-column':
      return <DecimalColumnView display={display} entry={entry} entryMode={entryMode} />
    case 'story':
      return <StoryView display={display} entry={entry} entryMode={entryMode} />
    case 'math':
      return <MathView display={display} entry={entry} entryMode={entryMode} />
    case 'diagram':
      return <DiagramView display={display} entry={entry} entryMode={entryMode} />
    default: {
      const unhandled: never = display
      throw new Error(`Unhandled display: ${JSON.stringify(unhandled)}`)
    }
  }
}

/**
 * Which slot each input mode's answer wants.
 *
 * A choice label is prose and wraps; a typed answer and a value placed on a
 * line are both numbers and want the tabular slot. Keyed on the union rather
 * than written as "choice, and everything else is a number", so the next mode
 * added is a compile error here instead of quietly inheriting a shape — which
 * is what happened when `number-line` widened `inputMode` and nothing broke.
 */
const SLOT: Record<Problem['inputMode'], 'prose' | 'number'> = {
  keypad: 'number',
  choice: 'prose',
  'number-line': 'number',
}

type Of<K extends Display['kind']> = Extract<Display, { kind: K }>

type EntryProps = { entry: string; entryMode: Problem['inputMode'] }

function InlineView({
  display,
  entry,
  entryMode,
}: { display: Of<'inline'> } & EntryProps) {
  if (display.decimal?.operation === 'read') {
    return (
      <div className="flex max-w-xs flex-col items-center gap-4 text-center">
        <span className="text-balance text-2xl font-bold leading-snug">{display.text}</span>
        <div className="flex items-baseline justify-center gap-3 text-4xl">
          <span className="font-bold text-ink-faint">=</span>
          <EntrySlot value={entry} mode={entryMode} />
        </div>
      </div>
    )
  }

  // Sized so the expression, the equals sign and the answer slot fit one line at
  // 375px — the phone this is installed on.
  //
  // These thresholds are measured rather than judged, and the measurement is the
  // whole row, not the text: `=` and the slot are sized in `em`, so they grow
  // with the font too, and the slot grows again as the learner types. A display
  // that fits while the slot is empty can still wrap on the third digit, which
  // is exactly how the previous ladder passed inspection and failed in use.
  //
  // The previous version had one step from 7 characters to 20, and everything in
  // between overflowed: `1482 ÷ 6` and `2800 ÷ 100` want 4xl, `100 + 10 + 5` and
  // `121, 104, 178` want 3xl, and all four were set at 5xl. Those are shipped
  // skills, so this is a fix to them and not only to Unit 5 — whose expressions
  // reach 18 characters and cannot be drawn short enough to dodge the question.
  //
  // A word-based display still does not fit at any of these sizes: `read-numbers`
  // spells out 27 characters and wants wrapping rather than shrinking, which is a
  // different mechanism and is left alone here.
  const length = display.text.length
  const size =
    length > 16
      ? 'text-2xl'
      : length > 11
        ? 'text-3xl'
        : length > 7
          ? 'text-4xl'
          : length > 6
            ? 'text-5xl'
            : 'text-6xl'

  return (
    <div className={`flex items-baseline justify-center gap-3 ${size}`}>
      <span className="font-bold tabular-nums tracking-tight">{display.text}</span>
      <span className="font-bold text-ink-faint">=</span>
      <EntrySlot value={entry} mode={entryMode} />
    </div>
  )
}

/**
 * Prose above, answer slot below. The sentence is set at reading size rather
 * than problem size: the work here is understanding the situation, and a story
 * rendered in 6xl digits reads as an eye test.
 */
function StoryView({ display, entry, entryMode }: { display: Of<'story'> } & EntryProps) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-md text-6xl">
      <p className="text-2xl font-medium leading-snug text-center text-balance">
        {display.text}
      </p>
      <EntrySlot value={entry} mode={entryMode} />
    </div>
  )
}

function MathView({ display, entry, entryMode }: { display: Of<'math'> } & EntryProps) {
  // These fraction prompts already carry the answer relationship in their
  // authored notation. Appending the ordinary "= answer" frame turns a
  // vocabulary answer into an equality, duplicates a missing-term equality,
  // and adds an unrelated blank after a comparison. Keep those displays intact,
  // then give only the keypad equality a labelled echo for its typed digits.
  if (
    display.fraction?.operation === 'name-part' ||
    display.fraction?.operation === 'compare'
  ) {
    return (
      <div className="flex items-center justify-center max-w-full">
        <MathNotation notation={display.notation} label={display.label} />
      </div>
    )
  }

  if (display.fraction?.operation === 'scale-missing') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 max-w-full">
        <MathNotation notation={display.notation} label={display.label} />
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg font-bold text-ink-soft">Answer</span>
          <span className="text-4xl">
            <EntrySlot value={entry} mode={entryMode} fractionSize="fluid" />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 max-w-full">
      <MathNotation notation={display.notation} label={display.label} />
      <span className="text-4xl font-bold text-ink-faint">=</span>
      <span className="text-4xl">
        <EntrySlot value={entry} mode={entryMode} fractionSize="fluid" />
      </span>
    </div>
  )
}

function DiagramView({ display, entry, entryMode }: { display: Of<'diagram'> } & EntryProps) {
  return (
    <div className="flex flex-col items-center gap-3 max-w-full">
      <ShapeDiagram diagram={display.diagram} />
      <div className="flex items-center justify-center gap-3 text-4xl">
        <span className="font-bold text-ink-faint">=</span>
        <EntrySlot value={entry} mode={entryMode} fractionSize="fluid" />
      </div>
    </div>
  )
}

function ColumnView({ display, entry, entryMode }: { display: Of<'column'> } & EntryProps) {
  const values = display.operands.map(String)
  return <FormattedColumn values={values} operator={display.operator} entry={entry} entryMode={entryMode} />
}

const DECIMAL_COLUMN_OPERATOR: Record<DecimalArithmeticData['operation'], '+' | '−' | '×'> = {
  add: '+',
  sub: '−',
  mult: '×',
}

function DecimalColumnView({ display, entry, entryMode }: { display: Of<'decimal-column'> } & EntryProps) {
  const values = decimalColumnText(display.decimal)
  const operator = DECIMAL_COLUMN_OPERATOR[display.decimal.operation]
  return <FormattedColumn values={values} operator={operator} entry={entry} entryMode={entryMode} />
}

function FormattedColumn({
  values,
  operator,
  entry,
  entryMode,
}: {
  values: readonly string[]
  operator: '+' | '−' | '×' | '÷'
} & EntryProps) {
  const width = Math.max(...values.map((value) => value.length))
  // A stack of three is a row taller than any two-operand column. One size down
  // keeps the hint reachable while every nested measurement follows in `em`.
  const size = values.length > 2 ? 'text-5xl' : 'text-6xl'

  return (
    <div
      className={`inline-flex flex-col items-end font-bold tabular-nums leading-tight ${size}`}
      // Per-character spans align places; the complete expression lives here
      // so assistive technology does not read each digit as a separate item.
      role="math"
      aria-label={`${values.join(` ${operator} `)} equals ${entrySpokenLabel(entry)}`}
    >
      {values.map((value, i) => (
        <div key={i} className="flex items-center gap-4" aria-hidden>
          <span className="w-8 text-ink-soft text-[0.8em]">{i === values.length - 1 ? operator : ''}</span>
          <Digits value={value} width={width} />
        </div>
      ))}
      <div className="h-1.5 self-stretch rounded-full bg-ink-faint my-[0.2em]" aria-hidden />
      <div className="flex items-center gap-4" aria-hidden>
        <span className="w-8" />
        <EntrySlot value={entry} mode={entryMode} minWidth={width} />
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
function EntrySlot({
  value,
  mode,
  minWidth = 2,
  fractionSize = 'entry',
}: {
  value: string
  mode: Problem['inputMode']
  minWidth?: number
  fractionSize?: 'fluid' | 'entry'
}) {
  const fraction = mode === 'keypad' ? fractionEntryNotation(value) : undefined
  const content =
    value === '' ? (
      <span className="inline-block w-[3px] h-[0.9em] bg-blossom-deep animate-pulse rounded-full" />
    ) : fraction ? (
      <MathNotation notation={fraction.notation} label={fraction.label} size={fractionSize} />
    ) : (
      value
    )

  if (SLOT[mode] === 'prose') {
    return (
      <span className="inline-flex items-center justify-center max-w-40 min-h-11 rounded-2xl bg-white/70 px-3 py-2 text-center text-xl font-bold leading-snug text-blossom-deep break-words">
        {content}
      </span>
    )
  }

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
