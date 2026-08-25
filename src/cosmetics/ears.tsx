import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { earSwing, loopIf } from './motion'
import type { MascotState } from './types'

/**
 * The one place an ear's position and rotation are written down.
 *
 * Three callers need them and none may import from the others: `Mascot.tsx`
 * draws the character's own ears, `index.tsx` pins bows and muffs to them, and
 * `characters.tsx` authors the shapes themselves. They were two copies of the
 * rotation and two of the origin until the third was about to be written.
 *
 * `motion.ts` holds the numbers the ear moves *by*; this holds where it is and
 * the wrapper that applies them. They are apart because that module is free of
 * JSX and `onEar` cannot be.
 */

export const EARS = ['left', 'right'] as const

export type Ear = (typeof EARS)[number]

/** Ear base x, which is also that ear's transform origin. From the contract. */
export const EAR_X: Record<Ear, number> = { left: 56, right: 144 }

/** Both ears rotate about this y — the `left-ear-base` / `right-ear-base` line. */
const EAR_Y = 96

/**
 * Wrap a layer so it repeats one ear's rotation about that ear's base.
 *
 * The character's own ear goes through here, and so does every cosmetic pinned
 * to it — which is what makes a bow that cannot drift from the ear it sits on,
 * whatever shape that ear is.
 *
 * `originX`/`originY` take a 0–1 fraction and would silently detach the layer
 * from the ear it belongs to; only a transform origin in user units works.
 */
export function onEar(ear: Ear, state: MascotState, children: ReactNode): ReactNode {
  const side = ear === 'left' ? -1 : 1
  const { rotate, duration } = earSwing(state, side)

  return (
    <motion.g
      key={ear}
      animate={{ rotate }}
      transition={loopIf(rotate, duration)}
      style={{ transformOrigin: `${EAR_X[ear]}px ${EAR_Y}px` }}
    >
      {children}
    </motion.g>
  )
}
