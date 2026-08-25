import { motion, useReducedMotion } from 'framer-motion'
import { families } from './palette'

/**
 * The rainbow wings.
 *
 * A file of its own because this is the catalogue's only React *component*, and
 * a component sitting in `index.tsx` breaks fast refresh for the whole catalogue
 * — the same reason `palette.ts` and `room.tsx` are separate. Everything else in
 * the wardrobe is a fragment function the mascot calls directly; this one needs
 * a hook, so it has to be a component, so it lives here.
 */

const { lilac } = families

/**
 * One side of the pair, in left-wing coordinates. The right wing is this
 * mirrored about x 100 — position and tilt both — which is why only one table
 * exists.
 *
 * Each lobe is one ellipse rotated about its own centre, with a spot near its
 * outer end. The rotation is the shape, not a way of moving the item into
 * place, the same way Pip's own inner ears are drawn.
 *
 * **These sit in the band the ears occupy, and that is a known trade.** The ears
 * are opaque cream across `x 26–66` and `x 134–174`, `y 46–102`, so the inner
 * half of each upper lobe is hidden and what shows is the outer sweep plus the
 * spot. A fan swept below `y 102` shows about twice as much wing; this shape was
 * chosen over that one anyway, for the silhouette rather than the coverage.
 *
 * The lower lobes are clear of the ears entirely and stop at `y 165`, above the
 * ground shadow at `y 173`. Leftmost point is `x 22.6`, which the ±3° sway takes
 * to `x 20` with the stroke counted.
 */
const LOBES = [
  { cx: 54, cy: 96, rx: 34, ry: 22, rotate: 30, spotX: 38, spotY: 90 },
  { cx: 58, cy: 146, rx: 26, ry: 18, rotate: -20, spotX: 46, spotY: 148 },
]

/**
 * Wings whose colour travels the wheel, one lobe-pair at a time.
 *
 * A component rather than a bare fragment, because it is the only item needing
 * a hook. `useReducedMotion` is the mechanism the contract names, and this is
 * the first item to use it: nothing else in the app respects the setting, and
 * turning it on globally would change every animation Pip already has, so the
 * one item that warrants it asks for itself. It gates the sway; the colour
 * cycle carries its own media query in the stylesheet, next to the keyframe.
 *
 * **The static presentation is the whole item.** With motion off these are plain
 * lilac wings — the shape carries everything, and the colour is the delight on
 * top. That is the contract's rule, and it is also what a screenshot shows.
 *
 * The hue is turned by a CSS keyframe — `.pip-hue-cycle` in `src/index.css` —
 * rather than from here. Framer Motion does not apply `filter` to an SVG
 * element: it routes the value to the presentation attribute of that name,
 * which expects a `url(#…)` reference to a <filter> and ignores a CSS filter
 * function, so the wings simply stayed lilac. The keyframe also keeps a
 * seven-second loop off the JavaScript thread when the shop is painting ten
 * Pips at once, and carries its own reduced-motion media query.
 *
 * A filter rather than five animated `fill` values: it turns the deep-shade
 * outline with the fill, so a feather is never green outlined in purple, and it
 * needs no gradient — so there is no generated id to collide across those ten.
 *
 * One cycle per feather *pair*, each a fraction of a turn behind the one inside
 * it. That is what makes the colour travel outward along the wing, and it keeps
 * the two wings in step so they read as one bird rather than two props.
 */
export function RainbowWings() {
  const still = useReducedMotion()

  return (
    <motion.g
      animate={still ? undefined : { rotate: [-3, 3, -3] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '100px 120px' }}
    >
      {LOBES.map((lobe, i) => (
        <g
          key={lobe.cy}
          className="pip-hue-cycle"
          style={{ animationDelay: `${i * 1.2}s` }}
        >
          {[-1, 1].map((side) => {
            // The table is written for the left wing, so the right one takes
            // the mirror of the position and of the tilt.
            const cx = side === -1 ? lobe.cx : 200 - lobe.cx
            const spotX = side === -1 ? lobe.spotX : 200 - lobe.spotX
            const rotate = side === -1 ? lobe.rotate : -lobe.rotate

            return (
              <g key={side}>
                <ellipse
                  cx={cx}
                  cy={lobe.cy}
                  rx={lobe.rx}
                  ry={lobe.ry}
                  transform={`rotate(${rotate} ${cx} ${lobe.cy})`}
                  strokeWidth="3"
                  style={{ fill: lilac.soft, stroke: lilac.deep }}
                />
                <circle
                  cx={spotX}
                  cy={lobe.spotY}
                  r="7"
                  strokeWidth="2.5"
                  style={{ fill: lilac.base, stroke: lilac.deep }}
                />
              </g>
            )
          })}
        </g>
      ))}
    </motion.g>
  )
}

