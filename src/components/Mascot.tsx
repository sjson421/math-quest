import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { wornIn, type Equipped, type MascotState } from '../cosmetics'
import { earSwing, loopIf } from '../cosmetics/motion'
import { BLUSH, CREAM, CREAM_SHADE, INK } from '../cosmetics/palette'

/**
 * Pip — an original character in the kawaii idiom.
 *
 * Built as layered SVG (ears/head, face, accessory) rather than flat artwork so
 * expressions and outfits are composable data instead of separate drawings.
 * Every part is plain geometry, so new cosmetics cost a few lines.
 */

export type { MascotState }

type Props = {
  state?: MascotState
  /** A face that differs from the movement state, such as smiling while still. */
  expression?: MascotState
  size?: number
  className?: string
  /**
   * What the learner has on. Ids are resolved against the catalogue here rather
   * than by the caller, so one that no longer exists draws nothing in exactly
   * one place — and so the shop can preview an unequipped item by passing
   * `{ [slot]: id }` without owning any of that logic.
   */
  equipped?: Equipped
}

export function Mascot({ state = 'idle', expression, size = 160, className, equipped }: Props) {
  const expressionState = expression ?? state
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

  // The ear's numbers come from the catalogue side, because every cosmetic that
  // rides an ear has to repeat them exactly and cannot import them from here.
  const leftEar = earSwing(state, -1)
  const rightEar = earSwing(state, 1)

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
      aria-label={`Pip is ${expressionState}`}
      role="img"
    >
      {/* 1 · soft ground shadow */}
      <ellipse cx="100" cy="180" rx="42" ry="7" fill={BLUSH} opacity="0.22" />

      {/* 2 · back cosmetics — the only slot painted before Pip */}
      {back?.render?.(state)}

      {/* 3 · headwear back fragments — a crown behind the ear tips */}
      {headwear?.back?.(state)}

      {/* 4 · ears and head */}
      <g>
        <motion.ellipse
          cx="56"
          cy="72"
          rx="17"
          ry="30"
          fill={CREAM}
          stroke={CREAM_SHADE}
          strokeWidth="3"
          animate={{ rotate: leftEar.rotate }}
          // `loopIf`, not a bare `repeat: Infinity`. Both of these are keyframe
          // arrays so both do repeat — but the helper is what keeps that a
          // decision rather than a default. A scalar under an infinite repeat
          // does not hold its value; it sweeps up to it and snaps back for ever,
          // which is exactly what these ears used to do in four of six states.
          //
          // transformOrigin in user units — originX/originY take 0–1, not px,
          // and passing px there detaches the ear from the head.
          transition={loopIf(leftEar.rotate, leftEar.duration)}
          style={{ transformOrigin: '56px 96px' }}
        />
        <motion.ellipse
          cx="144"
          cy="72"
          rx="17"
          ry="30"
          fill={CREAM}
          stroke={CREAM_SHADE}
          strokeWidth="3"
          animate={{ rotate: rightEar.rotate }}
          transition={loopIf(rightEar.rotate, rightEar.duration)}
          style={{ transformOrigin: '144px 96px' }}
        />
        <ellipse cx="56" cy="70" rx="8" ry="18" fill={BLUSH} opacity="0.35" transform="rotate(-24 56 70)" />
        <ellipse cx="144" cy="70" rx="8" ry="18" fill={BLUSH} opacity="0.35" transform="rotate(24 144 70)" />
      </g>

      <circle cx="100" cy="112" r="57" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="3" />

      {/* little tuft */}
      <path
        d="M92 58 Q100 42 108 58"
        stroke={CREAM_SHADE}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 5 · headwear front fragments — a brim over the forehead. A headwear
          item that does not split is drawn here too: in front is the side that
          reads, and only a shape needing to pass behind declares a `back`. */}
      {headwear?.front?.(state) ?? headwear?.render?.(state)}

      {/* 6 · expression: cheeks, then eyes and mouth */}
      <ellipse cx="66" cy="126" rx="11" ry="7" fill={BLUSH} opacity="0.75" />
      <ellipse cx="134" cy="126" rx="11" ry="7" fill={BLUSH} opacity="0.75" />
      <Face state={expressionState} blinking={blinking} />

      {/* 7 · face cosmetics */}
      {face?.render?.(state)}

      {/* 8 · neck cosmetics */}
      {neck?.render?.(state)}

      {/* 9 · pin — the signature star unless something replaces it */}
      {pin ? pin.render?.(state) : <SignatureStar state={state} />}

      {/* 10 · foreground effects */}
      {state === 'sleeping' && <SleepZs />}
    </motion.svg>
  )
}

/**
 * Pip's own charm, and what the `pin` slot falls back to.
 *
 * It is a default rather than a fixture: a cosmetic equipped there takes its
 * place, which the contract calls a deliberate identity change. Nothing in the
 * catalogue does that today.
 */
function SignatureStar({ state }: { state: MascotState }) {
  return (
    <motion.path
      d="M148 150 l4.2 8.6 9.4 1.4 -6.8 6.7 1.6 9.4 -8.4 -4.4 -8.4 4.4 1.6 -9.4 -6.8 -6.7 9.4 -1.4z"
      fill="#ffe5a3"
      stroke="#e8b53d"
      strokeWidth="2.5"
      strokeLinejoin="round"
      animate={{
        rotate: state === 'celebrating' ? [0, 360] : [0, 12, 0, -12, 0],
        scale: state === 'celebrating' ? [1, 1.25, 1] : 1,
      }}
      transition={{
        rotate: { duration: state === 'celebrating' ? 1.2 : 3.4, repeat: Infinity, ease: 'easeInOut' },
        scale: loopIf(state === 'celebrating' ? [1, 1.25, 1] : 1, 1.2),
      }}
      style={{ transformOrigin: '148px 162px' }}
    />
  )
}

function Face({ state, blinking }: { state: MascotState; blinking: boolean }) {
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
          fill={BLUSH}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    ),
    celebrating: (
      <path d="M86 133 q14 22 28 0 q-14 7 -28 0z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
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

function SleepZs() {
  return (
    <g>
      {[
        { x: 152, y: 74, size: 15, delay: 0 },
        { x: 168, y: 56, size: 11, delay: 0.6 },
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
