import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { INK, families } from './palette'

/**
 * The cosmetics Pip can wear.
 *
 * Each one is a small layer hung off Pip's existing geometry, never a second
 * drawing of the character — that is what keeps a wardrobe of any size from
 * multiplying every future expression by the number of items shipped.
 *
 * Geometry is written in Pip's own `0 0 200 200` view box against the anchors in
 * the `mascot-design` contract, so nothing here is scaled or repositioned into
 * place. The root `<svg>` carries the per-state bob, and a cosmetic drawn as its
 * child inherits it: re-applying the bob doubles it.
 */

/**
 * Pip's six states. Declared here rather than in `Mascot.tsx` because responding
 * to them is part of what a cosmetic promises, and the component that draws
 * cosmetics cannot be the one they import from. `Mascot.tsx` re-exports it.
 */
export type MascotState =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'encouraging'
  | 'celebrating'
  | 'sleeping'

/** Two items in the same slot cannot be worn at once. That is what a slot is for. */
export type CosmeticSlot = 'back' | 'headwear' | 'face' | 'neck' | 'pin'

/** Slot → the id worn in it. An absent slot means Pip's own default. */
export type Equipped = Partial<Record<CosmeticSlot, string>>

/**
 * A fragment gets the state so it can follow a part that moves on its own. Only
 * the ears do — everything else rides the root `<svg>` and needs no state at
 * all, which is why most items ignore the argument.
 */
type Fragment = (state: MascotState) => ReactNode

export type Cosmetic = {
  id: string
  slot: CosmeticSlot
  /** Shown in the shop. */
  name: string
  price: number
  /**
   * Drawn in one pass, at the step its slot owns. Mutually exclusive with the
   * fragment pair below.
   */
  render?: Fragment
  /**
   * A shape that passes on both sides of Pip — a hat crown behind the ear tips
   * while its brim crosses the forehead. Still one item with one id: both
   * fragments equip and unequip together and share one inventory entry.
   *
   * **`headwear` only.** The render order opens two gaps around Pip's head and
   * nowhere else, so splitting is not a general capability of a cosmetic — it is
   * the answer to the one place the head sits between a shape and itself. Every
   * other slot has a single step, and `catalogue.test.tsx` holds the line.
   */
  back?: Fragment
  front?: Fragment
}

/* ------------------------------------------------------------------------- *
 * The catalogue
 * ------------------------------------------------------------------------- */

const { blossom, lilac, mint, powder } = families

/**
 * Prices are set against what a lesson actually pays — 15 coins for a lesson
 * that raises mastery, 8 for a repeat. Two or three lessons is an ordinary
 * sitting, so roughly 30–45 coins a day: the glasses land just past a good first
 * day and the cape at about five. The set totals 470, which is something new
 * every other day for a week and a half rather than a grind.
 */
export const cosmetics: Cosmetic[] = [
  {
    id: 'round-glasses',
    slot: 'face',
    name: 'Round glasses',
    price: 40,
    // INK rather than a colour family: glasses sit on the face and read as part
    // of the expression, and a lilac frame competes with the eyes it surrounds.
    render: () => (
      <g>
        <circle cx="78" cy="110" r="13" fill="none" stroke={INK} strokeWidth="3" />
        <circle cx="122" cy="110" r="13" fill="none" stroke={INK} strokeWidth="3" />
        <path d="M91 110 h18" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },

  {
    id: 'ear-bows',
    slot: 'headwear',
    name: 'Ear bows',
    price: 60,
    // The ears rotate independently of the body — including a swing to ∓14° on
    // `happy` and `celebrating` — so each bow repeats its ear's animation about
    // that ear's exact base. `originX`/`originY` take a 0–1 fraction and would
    // silently detach the bow from the ear it belongs to.
    render: (state) => (
      <g>
        {bow({ x: 56, y: 64, origin: '56px 96px', state, side: -1 })}
        {bow({ x: 144, y: 64, origin: '144px 96px', state, side: 1 })}
      </g>
    ),
  },

  {
    id: 'mint-scarf',
    slot: 'neck',
    name: 'Mint scarf',
    price: 90,
    // Pip has no neck. This reads as a scarf because it crosses the chin line
    // inside the lower head, not because there is anything to wrap.
    render: () => (
      <g>
        <path
          d="M68 156 q32 16 64 0 q-4 12 -12 15 q-20 7 -40 0 q-8 -3 -12 -15z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.base, stroke: mint.deep }}
        />
        <motion.path
          d="M124 168 q10 8 8 20"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: 'none', stroke: mint.deep, transformOrigin: '124px 168px' }}
        />
      </g>
    ),
  },

  {
    id: 'party-hat',
    slot: 'headwear',
    name: 'Party hat',
    price: 120,
    // The crown passes behind the ear tips, the band crosses the forehead in
    // front. One item, one id, two fragments the render order interleaves.
    back: () => (
      <path
        d="M100 14 L124 64 H76 Z"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: lilac.base, stroke: lilac.deep }}
      />
    ),
    front: () => (
      <g>
        <path
          d="M74 62 h52 a5 5 0 0 1 0 10 h-52 a5 5 0 0 1 0 -10z"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
        <motion.circle
          cx="100"
          cy="12"
          r="7"
          strokeWidth="2.5"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
      </g>
    ),
  },

  {
    id: 'powder-cape',
    slot: 'back',
    name: 'Powder cape',
    price: 160,
    // The only slot painted before Pip. That is the whole design problem: the
    // head is a circle ending at y 169, so a cape hung below the chin shows up
    // as a flat band across it and reads as a bib. The hem therefore curves
    // *up* through the middle — at x 100 it reaches y 165, behind the head —
    // and what the learner sees is the two flares to either side, which is what
    // makes it read as fabric spreading out rather than something worn in front.
    render: () => (
      <motion.path
        d="M78 118 Q38 140 30 168 Q100 158 170 168 Q162 140 122 118 Z"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        animate={{ rotate: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fill: powder.base, stroke: powder.deep, transformOrigin: '100px 124px' }}
      />
    ),
  },
]

/**
 * One bow, repeating its ear's rotation about that ear's base.
 *
 * The numbers are the ear's own: −24°/+24° at rest, swinging to ∓14° on the two
 * excited states, over 0.6s. They are duplicated rather than shared because the
 * ear owns them; a bow that reads them from somewhere else would be a second
 * place the ear's motion is written down.
 */
function bow({
  x,
  y,
  origin,
  state,
  side,
}: {
  x: number
  y: number
  origin: string
  state: MascotState
  side: -1 | 1
}): ReactNode {
  const excited = state === 'happy' || state === 'celebrating'
  const rest = 24 * side
  const swung = 14 * side

  return (
    <motion.g
      animate={{ rotate: excited ? [rest, swung, rest] : rest }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: origin }}
    >
      {/* The two loops differ only in which way they point. */}
      {[-13, 13].map((dx) => (
        <path
          key={dx}
          d={`M${x} ${y} l${dx} -8 v16z`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: blossom.base, stroke: blossom.deep }}
        />
      ))}
      <circle
        cx={x}
        cy={y}
        r="4.5"
        strokeWidth="2.5"
        style={{ fill: blossom.soft, stroke: blossom.deep }}
      />
    </motion.g>
  )
}

export const cosmeticById = new Map(cosmetics.map((c) => [c.id, c]))

/**
 * The cosmetic worn in a slot, or `undefined`.
 *
 * An id the catalogue does not know resolves to nothing rather than throwing.
 * That case is real: the record is stored opaquely on the server and is never
 * migrated, so a copy naming a retired item can arrive from sync at any time.
 */
export function wornIn(equipped: Equipped | undefined, slot: CosmeticSlot): Cosmetic | undefined {
  const id = equipped?.[slot]
  return id ? cosmeticById.get(id) : undefined
}
