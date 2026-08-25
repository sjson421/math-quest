import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { earSwing, loopIf } from './motion'
import type { Ear, MascotState, Point } from './types'

/**
 * The one place an ear's rotation is applied.
 *
 * *Where* an ear is now comes from the wearer — `anchors.ear` — because three
 * characters no longer share one ear line. What stays here is the wrapper that
 * turns a base point into the swing, so `Mascot.tsx` drawing a character's own
 * ear and `index.tsx` pinning a bow to it cannot rotate them differently.
 *
 * `motion.ts` holds the numbers the ear moves *by*; this holds the wrapper that
 * applies them. They are apart because that module is free of JSX. `EARS` and
 * `Ear` are in `types.ts` with the rest of the contract — re-exporting them from
 * here costs this module its Fast Refresh for no one's benefit.
 */

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
export function onEar(
  ear: Ear,
  state: MascotState,
  base: Point,
  children: ReactNode,
): ReactNode {
  const side = ear === 'left' ? -1 : 1
  const { rotate, duration } = earSwing(state, side)

  return (
    <motion.g
      key={ear}
      animate={{ rotate }}
      transition={loopIf(rotate, duration)}
      style={{ transformOrigin: `${base.x}px ${base.y}px` }}
    >
      {children}
    </motion.g>
  )
}
