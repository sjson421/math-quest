import type { MathNotation as MathNotationNode } from '../lib/types'

/**
 * The one semantic owner for structured notation.
 *
 * The visible nodes are hidden beneath one authored name. Letting a screen
 * reader walk them would turn a stacked fraction into two unrelated numbers,
 * and its reading order would be an accident of the layout markup.
 */
export function MathNotation({
  notation,
  label,
  size = 'fluid',
}: {
  notation: MathNotationNode
  label: string
  size?: 'fluid' | 'entry'
}) {
  return (
    <span
      className={`mq-math${size === 'entry' ? ' mq-math-entry' : ''}`}
      role="math"
      aria-label={label}
    >
      <span className="mq-math-visual" aria-hidden>
        <NotationNode notation={notation} />
      </span>
    </span>
  )
}

function NotationNode({ notation }: { notation: MathNotationNode }) {
  switch (notation.kind) {
    case 'text':
      return <span className="mq-math-text">{notation.value || ' '}</span>
    case 'row':
      return (
        <span className="mq-math-row">
          {notation.children.map((child, index) => (
            <NotationNode key={index} notation={child} />
          ))}
        </span>
      )
    case 'fraction':
      return (
        <span className="mq-math-fraction">
          <span className="mq-math-numerator">
            <NotationNode notation={notation.numerator} />
          </span>
          <span className="mq-math-denominator">
            <NotationNode notation={notation.denominator} />
          </span>
        </span>
      )
    case 'superscript':
      return (
        <span className="mq-math-superscript">
          <NotationNode notation={notation.base} />
          <sup className="mq-math-exponent">
            <NotationNode notation={notation.exponent} />
          </sup>
        </span>
      )
    case 'root':
      return (
        <span className="mq-math-root">
          <span className="mq-math-root-sign">√</span>
          <span className="mq-math-radicand">
            <NotationNode notation={notation.radicand} />
          </span>
        </span>
      )
    default: {
      const unhandled: never = notation
      throw new Error(`Unhandled notation: ${JSON.stringify(unhandled)}`)
    }
  }
}
