import { Fragment } from 'react'
import { ROOM_SLOTS, placedIn, type Equipped, type MascotState, type Placed } from '../cosmetics'
import { INK, families } from '../cosmetics/palette'
import { Mascot } from './Mascot'

/**
 * The room Pip stands in.
 *
 * One view box, `0 0 320 200`, with Pip's own `0 0 200 200` canvas nested inside
 * it at `(60, 0)` at the same unit scale — placed with a single `translate`, so
 * his geometry is untouched by being in a room and every coordinate in the
 * `mascot-design` layer contract is the same coordinate here plus 60 on x.
 *
 * **Pip is painted as one step**, last. That is the whole occlusion rule: the
 * room never opens a gap inside his ten, so the two paint orders cannot disagree
 * about what covers what. A decoration is therefore always behind him and behind
 * everything he wears, and no decoration needs the back/front split a hat crown
 * uses — `Decoration` has no such fields to declare.
 */

const { butter, powder } = families

/**
 * The room's canvas, and where Pip's sits inside it.
 *
 * `WIDTH`/`HEIGHT` are named because they appear in three places — the view box,
 * the rendered width, and the two surface rects — and a resize that reached only
 * some of them would silently stretch the room. `PIP_X` is the offset every
 * coordinate in the layer contract is shifted by: Pip's canvas is `HEIGHT` units
 * square, so it fills the room's height and leaves `PIP_X` units of floor either
 * side.
 */
const WIDTH = 320
const HEIGHT = 200
const PIP_X = (WIDTH - HEIGHT) / 2

/**
 * Where the wall ends and the floor begins.
 *
 * Below Pip's head, not level with it. At 168 the line met his chin exactly and
 * the whole thing read as a windowsill he was leaning on; at 150 he overlaps the
 * floor and stands *in* the room, and the floor is a surface rather than a
 * stripe. His ground shadow spans y 173–187 either way, so it stays on the floor.
 */
const HORIZON = 150

type Props = {
  state?: MascotState
  /**
   * CSS pixels. The room's box is 200 units tall and Pip's canvas fills that
   * height, so this is also Pip's rendered size — 148 here is exactly what he
   * rendered at before he had a room.
   */
  height?: number
  className?: string
  /** Who is standing in it. Resolved against the catalogue by `Mascot`, not here. */
  character?: string
  /** What they have on. Resolved against the catalogue by `Mascot`, not here. */
  equipped?: Equipped
  /** What stands in the room. Resolved here, in one place, for the same reason. */
  placed?: Placed
  /** A temporary message Pip is saying inside the room. */
  message?: string | null
}

export function Room({
  state = 'idle',
  height = 148,
  className,
  character,
  equipped,
  placed,
  message,
}: Props) {
  return (
    <svg
      // Rounded like every card in the app — a hard-cornered rectangle reads as
      // pasted on. `overflow: hidden` is the default for an outermost <svg>, so
      // the radius clips the surface without a clip path or a generated id.
      className={`rounded-blob ${className ?? ''}`}
      width={(height * WIDTH) / HEIGHT}
      height={height}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // Deliberately no `role` and no label. Pip's own `aria-label` is inside
      // this element, and the room must not announce itself a second time or
      // read out its furniture.
    >
      {/* 1 · wall — cool, because Pip is warm cream and would otherwise have no
          edge against the surface behind him */}
      <rect x="0" y="0" width={WIDTH} height={HORIZON} style={{ fill: powder.soft }} />

      {/* 2 · floor */}
      <rect
        x="0"
        y={HORIZON}
        width={WIDTH}
        height={HEIGHT - HORIZON}
        style={{ fill: butter.soft }}
      />
      <path
        d={`M0 ${HORIZON} h${WIDTH}`}
        strokeWidth="3"
        style={{ fill: 'none', stroke: powder.deep }}
      />

      {/* 3–6 · decorations, in the contract's slot order. `placedIn` is where an
          id the catalogue has retired becomes nothing, so this never sees one. */}
      {ROOM_SLOTS.map((slot) => (
        <Fragment key={slot}>{placedIn(placed, slot)?.render()}</Fragment>
      ))}

      {/* 7 · Pip, as one step. The bubble uses room coordinates so it can sit
          to his right without changing the centered placement of his canvas. */}
      <g>
        {message && <SpeechBubble message={message} />}
        <g transform={`translate(${PIP_X} 0)`}>
          <Mascot
            character={character}
            state={state}
            expression={message ? 'happy' : undefined}
            size={HEIGHT}
            equipped={equipped}
          />
        </g>
      </g>
    </svg>
  )
}

function SpeechBubble({ message }: { message: string }) {
  return (
    <g role="status" aria-live="polite" aria-label={message}>
      <rect
        x="172"
        y="7"
        width="140"
        height="32"
        rx="16"
        fill="#ffffff"
        stroke={powder.deep}
        strokeWidth="2"
      />
      <path
        d="M184 38 l-8 8 24-8"
        fill="#ffffff"
        stroke={powder.deep}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x="242"
        y="23"
        fill={INK}
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {message}
      </text>
    </g>
  )
}
