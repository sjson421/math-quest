import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { characters } from './characters'
import { EARS, EAR_X, onEar, type Ear } from './ears'
import { INK, families } from './palette'
import { decorations } from './room'
import { RainbowWings } from './wings'
import type {
  CatalogueItem,
  Character,
  Cosmetic,
  CosmeticSlot,
  Decoration,
  Equipped,
  Placed,
  RoomSlot,
} from './types'

/**
 * The cosmetics a character can wear, and the one catalogue holding them beside
 * the room's decorations and the characters themselves.
 *
 * Each cosmetic is a small layer hung off the character's existing geometry,
 * never a second drawing of one — that is what keeps a wardrobe of any size from
 * multiplying every future expression by the number of items shipped, and it is
 * also why a new character costs the wardrobe nothing: all three are the same
 * anchors under a different coat.
 *
 * Geometry is written in Pip's own `0 0 200 200` view box against the anchors in
 * the `mascot-design` contract, so nothing here is scaled or repositioned into
 * place. The root `<svg>` carries the per-state bob, and a cosmetic drawn as its
 * child inherits it: re-applying the bob doubles it.
 */

export type {
  CatalogueItem,
  Character,
  Cosmetic,
  CosmeticSlot,
  Decoration,
  Equipped,
  MascotState,
  Placed,
  RoomSlot,
} from './types'

/* ------------------------------------------------------------------------- *
 * The catalogue
 * ------------------------------------------------------------------------- */

const { blossom, butter, lilac, mint, powder } = families

/**
 * Prices are set against what a lesson actually pays — 15 coins for a lesson
 * that raises mastery, 8 for a repeat. Two or three lessons is an ordinary
 * sitting, so roughly 30–45 coins a day.
 *
 * The five original items keep their original prices, so the glasses still land
 * just past a good first day and the cape at about five. What is new is the
 * climb above them, to 1000. A five-item wardrobe was cleared in a fortnight and
 * then there was nothing left to want; the top of the list is now about a month
 * of saving, and the middle gives the learner somewhere to spend before then.
 *
 * **A price is a promise about how much there is to look at.** The earmuffs are
 * a band and two muffs; the crown adds points and gems that breathe; the comet
 * adds a tail, sparkles and a spin. An expensive item that is no more elaborate
 * than a cheap one is the thing that makes the whole ladder feel dishonest.
 *
 * The list is ordered by price, and the shop shows each category in this order —
 * so a category reads plain to elaborate from top to bottom.
 */
export const cosmetics: Cosmetic[] = [
  {
    kind: 'cosmetic',
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
    kind: 'cosmetic',
    id: 'ear-bows',
    slot: 'headwear',
    name: 'Ear bows',
    price: 60,
    render: (state) => <g>{EARS.map((ear) => onEar(ear, state, bow(ear)))}</g>,
  },

  {
    kind: 'cosmetic',
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
          animate={{ rotate: [0, 6, 0, -6, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: 'none', stroke: mint.deep, transformOrigin: '124px 168px' }}
        />
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'mint-earmuffs',
    slot: 'headwear',
    name: 'Mint earmuffs',
    price: 100,
    // The band is fixed to the head and only the muffs ride the ears, which is
    // a join that has to be checked rather than assumed. The `happy` waggle takes
    // an ear 10° either side of rest, sliding a muff about 5 units along its arc
    // in each direction, and the rest sway another 1.5. That is a third of the
    // muff's radius at worst, so the band still ends well inside it at every
    // extreme and no gap opens.
    render: (state) => (
      <g>
        <path
          d="M56 68 Q100 30 144 68"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: mint.deep }}
        />
        {EARS.map((ear) => onEar(ear, state, muff(ear)))}
      </g>
    ),
  },

  {
    kind: 'cosmetic',
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
          animate={{ y: [0, -3, 0, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'cosmetic',
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

  {
    kind: 'cosmetic',
    id: 'heart-shades',
    slot: 'face',
    name: 'Heart shades',
    price: 200,
    // The lenses are tinted rather than solid. Pip says everything he says with
    // his eyes, and a `face` item that switches four of the six expressions off
    // costs more than it adds — at 0.72 the eyes read straight through the pink.
    render: () => (
      <g>
        {[78, 122].map((cx) => (
          <path
            key={cx}
            // Two semicircular arcs for the lobes and two quadratics down to the
            // point: a heart in four segments rather than the six a pair of
            // cubics would take, because the extra control is invisible at 92px.
            d={`M${cx - 14} 105 a7 7 0 0 1 14 0 a7 7 0 0 1 14 0 q0 9 -14 17 q-14 -8 -14 -17z`}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            fillOpacity="0.72"
            style={{ fill: blossom.base, stroke: blossom.deep }}
          />
        ))}
        <path
          d="M92 104 q8 -5 16 0"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: blossom.deep }}
        />
        {/* Arms, stopping on the head's own edge — at y 99 the circle reaches
            x 44.5 and x 155.5, so they end on the silhouette rather than short
            of it or out in the air beside it. */}
        <path
          d="M64 106 q-10 -2 -19 -7"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: blossom.deep }}
        />
        <path
          d="M136 106 q10 -2 19 -7"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: blossom.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'butter-crown',
    slot: 'headwear',
    name: 'Butter crown',
    price: 350,
    // No `back` fragment, unlike the party hat: the points span x 66–134 and the
    // ears render at x 26–66 and x 134–174, so there is nothing for a crown this
    // width to pass behind. Splitting it anyway would be two fragments doing one
    // fragment's work.
    render: () => (
      <g>
        <path
          d="M66 68 L74 38 L87 60 L100 32 L113 60 L126 38 L134 68 Z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: butter.base, stroke: butter.deep }}
        />
        <path
          d="M64 64 h72 a6 6 0 0 1 0 12 h-72 a6 6 0 0 1 0 -12z"
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ fill: butter.soft, stroke: butter.deep }}
        />
        {/* Deep rather than base: a 9-unit gem is 4 CSS pixels at the shop's
            92px, and base on its own soft tint is not a gem at that size, it is
            a dent. They breathe out of phase so the band reads as lit. */}
        {[84, 100, 116].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy="70"
            r="4.5"
            strokeWidth="2.5"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            style={{ fill: butter.deep, stroke: butter.deep }}
          />
        ))}
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'wizard-hat',
    slot: 'headwear',
    name: 'Wizard hat',
    price: 700,
    // The cone leans right so it clears the tuft at x 92–108 rather than sitting
    // on it, and its tip stops at y 12 — the party hat's pompom already sits at
    // y 5, so this is the shallower of the two claims on the top of the canvas.
    render: () => (
      <g>
        <path
          d="M74 70 Q88 20 126 12 Q116 34 122 70 Z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: powder.base, stroke: powder.deep }}
        />
        {/* Outer radius 9, inner 4, about (101, 42) — 17 units across, which is
            8 CSS pixels at 92px. A star drawn at the 7 units this started as is
            the one the room's bunting had to give up on. */}
        <motion.path
          d="M101 33 L103.4 38.8 L109.6 39.2 L104.8 43.2 L106.3 49.3 L101 46 L95.7 49.3 L97.2 43.2 L92.4 39.2 L98.6 38.8 Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
        <ellipse
          cx="100"
          cy="70"
          rx="42"
          ry="9"
          strokeWidth="3"
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
        <path
          d="M78 58 h44 a4.5 4.5 0 0 1 0 9 h-44 a4.5 4.5 0 0 1 0 -9z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ fill: powder.base, stroke: powder.deep }}
        />
        <motion.circle
          cx="128"
          cy="10"
          r="6"
          strokeWidth="2.5"
          animate={{ y: [0, -3, 0, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'rainbow-wings',
    slot: 'back',
    name: 'Rainbow wings',
    price: 1000,
    // The dearest thing Pip can wear, and the only one whose colour moves.
    //
    // Two lobes a side plus a spot on each, swept up-and-out and down-and-out
    // from behind the head — the shape this item started as, kept over a wider
    // four-feather fan that showed about twice as much wing. The fan was the
    // better answer to the occlusion and the worse answer to what the thing
    // should look like, and the silhouette won.
    //
    // What that costs is written down in `wings.tsx`: step 2 is painted before
    // Pip, so the head circle hides the inner half of every lobe and the ears —
    // opaque cream across `y 46–102` — take a good part of the upper pair. What
    // reads is the outer sweep and the four spots.
    render: () => <RainbowWings />,
  },

]

/* ------------------------------------------------------------------------- *
 * Layers that ride an ear
 * ------------------------------------------------------------------------- */

/** One bow, in its ear's unrotated coordinates. `onEar` does the rest. */
function bow(ear: Ear): ReactNode {
  const x = EAR_X[ear]
  const y = 64

  return (
    <g>
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
    </g>
  )
}

/** One muff, sized to cover the ear it is drawn over (rx 17, ry 30). */
function muff(ear: Ear): ReactNode {
  const x = EAR_X[ear]

  return (
    <g>
      <circle
        cx={x}
        cy="68"
        r="15"
        strokeWidth="3"
        style={{ fill: mint.base, stroke: mint.deep }}
      />
      <circle
        cx={x}
        cy="68"
        r="8"
        strokeWidth="2.5"
        style={{ fill: mint.soft, stroke: mint.deep }}
      />
    </g>
  )
}

export const cosmeticById = new Map(cosmetics.map((c) => [c.id, c]))

/* ------------------------------------------------------------------------- *
 * One catalogue over both surfaces
 * ------------------------------------------------------------------------- */

/**
 * Everything the learner can own, in the order the shop offers it.
 *
 * One list rather than three, because there is one purse and one inventory: a
 * character is bought with the coins a rug is bought with, and `buy()` should
 * not need to know which kind it was handed. What the three kinds do *not*
 * share is their geometry limits — a character draws its own face and is held
 * to Pip's heavier weights, where an accessory is held to the cosmetic range —
 * and `catalogue.test.tsx` checks each kind against its own rule.
 */
export { decorations } from './room'

export const catalogue: CatalogueItem[] = [...characters, ...cosmetics, ...decorations]

export const itemById = new Map(catalogue.map((item) => [item.id, item]))

/**
 * The two slot lists, as values rather than only types.
 *
 * `unequip` is given a slot and has to decide which map it belongs to. That
 * works only while no string is in both slot unions — true today, and exactly
 * the kind of thing that breaks silently when someone adds a `back` shelf, so
 * `catalogue.test.tsx` asserts the two sets stay disjoint.
 *
 * Both are in the contract's own order — the order the two render orders paint
 * in — and the shop lays its categories out by walking them, so the wardrobe and
 * the room are offered in the same order they are drawn.
 */
export const COSMETIC_SLOTS: readonly CosmeticSlot[] = [
  'back',
  'headwear',
  'face',
  'neck',
  'pin',
]

export const ROOM_SLOTS: readonly RoomSlot[] = ['rug', 'wall', 'left', 'right']

const roomSlots = new Set<string>(ROOM_SLOTS)

export const isRoomSlot = (slot: CosmeticSlot | RoomSlot): slot is RoomSlot =>
  roomSlots.has(slot)

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

export { characters }

export const characterById = new Map(characters.map((c) => [c.id, c]))

/**
 * The character a fresh record starts as, and the one an unknown id becomes.
 *
 * Written out rather than read off `characters[0]`, because a constant export
 * with a computed initializer costs this whole module its Fast Refresh — oxlint
 * flags every other export in the file the moment one appears. `catalogue.test`
 * pins the two together, so the literal cannot drift from the list.
 */
export const DEFAULT_CHARACTER = 'pip'


/**
 * Who to draw. **Unlike `wornIn`, this cannot return nothing** — an unrecognised
 * id leaves a slot empty, but there is no such thing as an empty character, so a
 * record naming one the catalogue has retired draws the default rather than a
 * face with no head. The case is real for the same reason it is for cosmetics:
 * progress is stored opaquely on the server and never migrated, so a copy naming
 * anything at all can arrive from sync.
 */
export function characterOf(id: string | undefined): Character {
  return (id ? characterById.get(id) : undefined) ?? characters[0]
}

export const decorationById = new Map(decorations.map((d) => [d.id, d]))

/**
 * The decoration standing in a room slot, or `undefined`. `wornIn`'s twin, and
 * deliberately its mirror image rather than a lookup in `itemById` with a kind
 * check bolted on: each surface resolves its own ids, so neither can be handed
 * an item belonging to the other.
 */
export function placedIn(placed: Placed | undefined, slot: RoomSlot): Decoration | undefined {
  const id = placed?.[slot]
  return id ? decorationById.get(id) : undefined
}
