import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { characterOf, wornIn, type Equipped, type MascotState } from '../cosmetics'
import { onEar } from '../cosmetics/ears'
import { onFace } from '../cosmetics/frame'
import { loopIf } from '../cosmetics/motion'
import { INK } from '../cosmetics/palette'
import { EARS, type Anchors, type Point } from '../cosmetics/types'

/**
 * The mascot — one of three original characters in the kawaii idiom.
 *
 * Built as layered SVG (ears/head, face, accessory) rather than flat artwork so
 * expressions and outfits are composable data instead of separate drawings.
 * Every part is plain geometry, so new cosmetics cost a few lines.
 *
 * **This component owns the ten paint steps and all of the motion; a character
 * owns only the geometry that varies between them.** So the six expressions, the
 * blink, the bob, the ear swing and the charm's spin are written once here and
 * are the same on all three — which is what makes them one app's characters
 * rather than three drawings that happen to share a file.
 */

export type { MascotState }

type Props = {
  state?: MascotState
  /** A face that differs from the movement state, such as smiling while still. */
  expression?: MascotState
  size?: number
  className?: string
  /**
   * Who to draw. Resolved here like the cosmetic ids below, with the difference
   * that an unknown one falls back to Pip rather than to nothing — there is no
   * such thing as an empty character.
   */
  character?: string
  /**
   * What the learner has on. Ids are resolved against the catalogue here rather
   * than by the caller, so one that no longer exists draws nothing in exactly
   * one place — and so the shop can preview an unequipped item by passing
   * `{ [slot]: id }` without owning any of that logic.
   */
  equipped?: Equipped
}

export function Mascot({
  state = 'idle',
  expression,
  size = 160,
  className,
  character,
  equipped,
}: Props) {
  const expressionState = expression ?? state
  const who = characterOf(character)
  const { blush } = who.coat
  const anchors = who.anchors
  const [blinking, setBlinking] = useState(false)

  // Irregular blink cadence reads as alive; a fixed interval reads as a loop.
  useEffect(() => {
    if (
      expressionState === 'sleeping' ||
      expressionState === 'happy' ||
      expressionState === 'celebrating'
    )
      return
    let timer: number
    let blinkTimer: number | undefined
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setBlinking(true)
          blinkTimer = window.setTimeout(() => setBlinking(false), 140)
          schedule()
        },
        2200 + Math.random() * 3400,
      )
    }
    schedule()
    return () => {
      window.clearTimeout(timer)
      if (blinkTimer !== undefined) window.clearTimeout(blinkTimer)
    }
  }, [expressionState])

  // The bob always loops; the tilt is a fixed pose in four of the six states and
  // an oscillation in the other two. They are kept apart because they need
  // different transitions — see `loopIf`.
  const { y: bob, rotate: tilt } = {
    idle: { y: [0, -4, 0], rotate: 0 },
    thinking: { y: [0, -2, 0], rotate: -4 },
    happy: { y: [0, -14, 0], rotate: 0 },
    encouraging: { y: [0, -3, 0], rotate: 5 },
    celebrating: { y: [0, -18, 0], rotate: [0, -6, 6, 0] },
    sleeping: { y: [0, -2, 0], rotate: [0, 8, 0] },
  }[state] as { y: number[]; rotate: number | number[] }

  const duration = {
    idle: 3.2,
    thinking: 2.6,
    happy: 0.6,
    encouraging: 2.8,
    celebrating: 0.7,
    sleeping: 4.5,
  }[state]

  // Resolved once, so an id the catalogue has retired costs one lookup and then
  // reads the same as an empty slot everywhere below.
  const back = wornIn(equipped, 'back')
  const headwear = wornIn(equipped, 'headwear')
  const face = wornIn(equipped, 'face')
  const neck = wornIn(equipped, 'neck')
  const pin = wornIn(equipped, 'pin')

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: bob, rotate: tilt }}
      transition={{ y: loopIf(bob, duration), rotate: loopIf(tilt, duration) }}
      aria-label={`${who.name} is ${expressionState}`}
      role="img"
    >
      {/* 1 · soft ground shadow */}
      <ellipse
        cx="100"
        cy="180"
        rx={anchors.shoulder.halfWidth * 0.8}
        ry="7"
        fill={blush}
        opacity="0.22"
      />

      {/* 2 · back cosmetics — the only slot painted before the character */}
      {back?.render?.(state, anchors)}

      {/* 3 · headwear back fragments — a crown behind the ear tips */}
      {headwear?.back?.(state, anchors)}

      {/* 4 · ears and head. `onEar` is the same wrapper the ear-riding cosmetics
          go through, so an ear and the bow tied to it cannot move differently
          whatever shape the ear is — see `cosmetics/ears.tsx`. */}
      <g>{EARS.map((ear) => onEar(ear, state, anchors.ear[ear].base, who.ear(ear)))}</g>

      {/* The body itself belongs to the character — this is the step that used
          to be one circle for all three. */}
      {who.head}

      {/* the crest between the ears — a tuft, twin peaks, or spines */}
      {who.crest}

      {/* 5 · headwear front fragments — a brim over the forehead. A headwear
          item that does not split is drawn here too: in front is the side that
          reads, and only a shape needing to pass behind declares a `back`. */}
      {headwear?.front?.(state, anchors) ?? headwear?.render?.(state, anchors)}

      {/* 6 · expression: cheeks, then the character's own markings, then eyes
          and mouth. Markings go under the face and over the cheeks, so a muzzle
          is something the mouth is drawn *on* and never something drawn over an
          expression.
          Cheeks and expression ride the face frame together — they are one face,
          and a cheek left behind in Pip's coordinates would sit off a wider one. */}
      {onFace(
        anchors.face,
        <>
          <ellipse cx="66" cy="126" rx="11" ry="7" fill={blush} opacity="0.75" />
          <ellipse cx="134" cy="126" rx="11" ry="7" fill={blush} opacity="0.75" />
        </>,
      )}
      {who.markings}
      {onFace(anchors.face, <Face state={expressionState} blinking={blinking} blush={blush} />)}

      {/* 7 · face cosmetics — the same frame, so glasses land on the eyes
          without knowing whose they are */}
      {face && onFace(anchors.face, face.render?.(state, anchors))}

      {/* 8 · neck cosmetics */}
      {neck?.render?.(state, anchors)}

      {/* 9 · pin — the character's own charm unless something replaces it */}
      {pin ? pin.render?.(state, anchors) : (
        <Charm state={state} at={anchors.pin}>
          {who.charm}
        </Charm>
      )}

      {/* 10 · foreground effects */}
      {state === 'sleeping' && <SleepZs anchors={anchors} />}
    </motion.svg>
  )
}

/**
 * The character's own charm, and what the `pin` slot falls back to.
 *
 * It is a default rather than a fixture: a cosmetic equipped there takes its
 * place, which the contract calls a deliberate identity change. Nothing in the
 * catalogue does that today.
 *
 * **The motion is here and the shape is not.** Pip's star, Mochi's fish and
 * Taro's lily pad all rock gently and all spin once on `celebrating`, because
 * that beat belongs to the moment rather than to the object — a charm that chose
 * its own would make the celebration land differently depending on who you had
 * bought.
 */
function Charm({
  state,
  at,
  children,
}: {
  state: MascotState
  at: Point
  children: ReactNode
}) {
  const celebrating = state === 'celebrating'
  const scale = celebrating ? [1, 1.25, 1] : 1

  return (
    <motion.g
      animate={{ rotate: celebrating ? [0, 360] : [0, 12, 0, -12, 0], scale }}
      transition={{
        rotate: { duration: celebrating ? 1.2 : 3.4, repeat: Infinity, ease: 'easeInOut' },
        scale: loopIf(scale, 1.2),
      }}
      style={{ transformOrigin: `${at.x}px ${at.y}px` }}
    >
      {children}
    </motion.g>
  )
}

/**
 * The six expressions, in `INK` on every character.
 *
 * `blush` is the one colour passed in: the delighted mouth is filled with it, so
 * an open smile is the character's own pink rather than a fourth cream in the
 * middle of a ginger face.
 */
function Face({
  state,
  blinking,
  blush,
}: {
  state: MascotState
  blinking: boolean
  blush: string
}) {
  const L = 78
  const R = 122
  const eyeY = 110

  // Closed-arc eyes: used for blinking, delight, and sleep alike.
  const closed = (cx: number) => (
    <path
      key={cx}
      d={`M${cx - 8} ${eyeY} q8 7 16 0`}
      stroke={INK}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  )

  // Upward arcs — the classic delighted ^ ^
  const joyful = (cx: number) => (
    <path
      key={cx}
      d={`M${cx - 9} ${eyeY + 3} q9 -11 18 0`}
      stroke={INK}
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
  )

  const open = (cx: number, dx = 0, dy = 0) => (
    <g key={cx}>
      <ellipse cx={cx + dx} cy={eyeY + dy} rx="7" ry="9" fill={INK} />
      <circle cx={cx + dx + 2.4} cy={eyeY + dy - 3.4} r="2.6" fill="#fff" />
    </g>
  )

  let eyes
  if (state === 'sleeping') eyes = [closed(L), closed(R)]
  else if (state === 'happy' || state === 'celebrating') eyes = [joyful(L), joyful(R)]
  else if (blinking) eyes = [closed(L), closed(R)]
  else if (state === 'thinking') eyes = [open(L, 2, -3), open(R, 2, -3)]
  else eyes = [open(L), open(R)]

  const mouth = {
    // gentle closed smile
    idle: <path d="M92 138 q8 7 16 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />,
    // small considering 'o'
    thinking: <ellipse cx="100" cy="140" rx="5" ry="6" fill={INK} opacity="0.85" />,
    // open delighted smile
    happy: (
      <g>
        <path
          d="M88 133 q12 26 24 0 q-12 7 -24 0z"
          fill={blush}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    ),
    // The same open smile as `happy`, wider. Same blush fill for the same
    // reason — the two are one expression at two sizes, and an inked interior
    // here was the only place a delighted mouth went black.
    celebrating: (
      <path
        d="M86 133 q14 22 28 0 q-14 7 -28 0z"
        fill={blush}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    ),
    // small, warm, tilted — sympathetic rather than sad
    encouraging: (
      <path d="M92 139 q8 5 16 -1" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    ),
    sleeping: <path d="M94 139 q6 5 12 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />,
  }[state]

  return (
    <g>
      {eyes}
      {mouth}
      {state === 'thinking' && (
        <motion.g
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <circle cx="163" cy="88" r="3.5" fill={INK} opacity="0.5" />
          <circle cx="173" cy="76" r="5" fill={INK} opacity="0.5" />
        </motion.g>
      )}
    </g>
  )
}

/**
 * Rising past the widest part of the head rather than off a fixed point, so they
 * clear a body broader than Pip's instead of landing on it. `temple` sets how
 * far out and `brow` how high, which on Pip is exactly where they always were.
 */
function SleepZs({ anchors }: { anchors: Anchors }) {
  const x = 100 + anchors.temple.halfWidth - 3
  const y = anchors.brow.y

  return (
    <g>
      {[
        { x, y: y + 6, size: 15, delay: 0 },
        { x: x + 16, y: y - 12, size: 11, delay: 0.6 },
      ].map(({ x, y, size, delay }) => (
        <motion.text
          key={x}
          x={x}
          y={y}
          fontSize={size}
          fontWeight="700"
          fill={INK}
          opacity="0.45"
          animate={{ y: [y, y - 10], opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeOut' }}
        >
          z
        </motion.text>
      ))}
    </g>
  )
}
