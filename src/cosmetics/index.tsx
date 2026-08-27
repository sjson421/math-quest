import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { characters } from './characters'
import { onEar } from './ears'
import { inverseFaceTransform } from './frame'
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
  Point,
  RoomSlot,
} from './types'
import { EARS } from './types'

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
 * **Every item is drawn from the wearer's `anchors`, never from literal
 * coordinates.** That is what lets three differently-shaped bodies share one
 * wardrobe: a hat band is "cross the brow, this much wider than the head", and
 * the brow is wherever that character says it is. Hard-coding `x 64` instead is
 * an item that fits Pip and hangs off a cat.
 *
 * The `face` slot is the exception that proves it: those items are drawn in the
 * face's own frame by `Mascot.tsx`, so they are authored in Pip's coordinates
 * and carried onto whoever is wearing them — see `frame.tsx`.
 *
 * Geometry is in the shared `0 0 200 200` view box. The root `<svg>` carries the
 * per-state bob, and a cosmetic drawn as its child inherits it: re-applying the
 * bob doubles it.
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
 * a band and two muffs; the crown adds points and gems that breathe; the wings
 * add four lobes, a sweep and a travelling hue. An expensive item that is no
 * more elaborate than a cheap one is the thing that makes the whole ladder feel
 * dishonest.
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
    //
    // Authored in the face frame — `Mascot.tsx` carries the whole `face` slot
    // onto the wearer, so these are Pip's eye coordinates and land on the eyes
    // of a wider or a narrower head without knowing whose they are.
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
    render: (state, anchors) => (
      <g>
        {EARS.map((ear) =>
          onEar(ear, state, anchors.ear[ear].base, bow(anchors.ear[ear].hold)),
        )}
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'mint-scarf',
    slot: 'neck',
    name: 'Mint scarf',
    price: 90,
    // None of the three has a neck. This reads as a scarf because it crosses the
    // chin line inside the lower body, not because there is anything to wrap —
    // so it is drawn from `chin`, and on Mochi that line is under a soft jaw.
    render: (_state, { chin }) => {
      const w = chin.halfWidth
      const tailX = 100 + w * 0.75

      return (
        <g>
          <path
            d={path`M${100 - w} ${chin.y - 2}
                q${w} 16 ${2 * w} 0
                q-4 12 -12 15
                q-${w - 12} 7 -${2 * (w - 12)} 0
                q-8 -3 -12 -15z`}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ fill: mint.base, stroke: mint.deep }}
          />
          <motion.path
            d={path`M${tailX} ${chin.y + 10} q10 8 8 20`}
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ rotate: [0, 6, 0, -6, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fill: 'none',
              stroke: mint.deep,
              transformOrigin: `${tailX}px ${chin.y + 10}px`,
            }}
          />
        </g>
      )
    },
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
    render: (state, anchors) => {
      const left = anchors.ear.left.hold
      const right = anchors.ear.right.hold

      return (
        <g>
          {/* Muff to muff, arcing clear of the crown between them — so the band
              passes over a cat's tuft rather than through it. */}
          <path
            d={path`M${left.x} ${left.y} Q100 ${anchors.crown - 25} ${right.x} ${right.y}`}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ fill: 'none', stroke: mint.deep }}
          />
          {EARS.map((ear) =>
            onEar(ear, state, anchors.ear[ear].base, muff(anchors.ear[ear].hold)),
          )}
        </g>
      )
    },
  },

  {
    kind: 'cosmetic',
    id: 'party-hat',
    slot: 'headwear',
    name: 'Party hat',
    price: 120,
    // The cone passes behind the ear tips, the band crosses the forehead in
    // front. One item, one id, two fragments the render order interleaves.
    //
    // It rises from `crown` rather than from the top of the canvas: on a low
    // flat head the hat sits lower and stays the same hat, where a fixed apex
    // would leave a tall gap between the brim and the head on one character and
    // crush the cone on another.
    back: (_state, { crown, brow }) => (
      <path
        d={path`M100 ${crown - 42} L${100 + brow.halfWidth * 0.66} ${brow.y - 6} H${100 - brow.halfWidth * 0.66} Z`}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: lilac.base, stroke: lilac.deep }}
      />
    ),
    front: (_state, { crown, brow }) => {
      const w = brow.halfWidth * 0.72

      return (
        <g>
          <path
            d={path`M${100 - w} ${brow.y - 8} h${2 * w} a5 5 0 0 1 0 10 h-${2 * w} a5 5 0 0 1 0 -10z`}
            strokeWidth="3"
            strokeLinejoin="round"
            style={{ fill: lilac.soft, stroke: lilac.deep }}
          />
          <motion.circle
            cx="100"
            cy={crown - 44}
            r="7"
            strokeWidth="2.5"
            animate={{ y: [0, -3, 0, 3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fill: lilac.soft, stroke: lilac.deep }}
          />
        </g>
      )
    },
  },

  {
    kind: 'cosmetic',
    id: 'powder-cape',
    slot: 'back',
    name: 'Powder cape',
    price: 160,
    // The only slot painted before the character. That is the whole design
    // problem: the body ends somewhere low, so a cape hung below the chin shows
    // up as a flat band across it and reads as a bib. The hem therefore curves
    // *up* through the middle, behind the body — and what the learner sees is
    // the two flares to either side, which is what makes it read as fabric
    // spreading out rather than something worn in front.
    render: (_state, { shoulder, chin }) => {
      const w = shoulder.halfWidth
      // Past the widest point of the body, or the flares hide behind it.
      const flare = w * 1.34
      const hem = chin.y + 12

      return (
        <motion.path
          d={path`M${100 - w * 0.42} ${shoulder.y - 6}
              Q${100 - flare + 8} ${shoulder.y + 16} ${100 - flare} ${hem}
              Q100 ${hem - 10} ${100 + flare} ${hem}
              Q${100 + flare - 8} ${shoulder.y + 16} ${100 + w * 0.42} ${shoulder.y - 6} Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fill: powder.base,
            stroke: powder.deep,
            transformOrigin: `100px ${shoulder.y}px`,
          }}
        />
      )
    },
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
    // Lenses and bridge are face-frame geometry, carried onto the wearer with the
    // eyes. The arms are not: they have to reach the *silhouette*, which is a
    // different distance away on each body, so they are drawn from `temple` in
    // the shared view box and undo the frame to get there.
    render: (_state, { face, temple }) => (
      <g>
        {[78, 122].map((cx) => (
          <path
            key={cx}
            // Two semicircular arcs for the lobes and two quadratics down to the
            // point: a heart in four segments rather than the six a pair of
            // cubics would take, because the extra control is invisible at 92px.
            d={path`M${cx - 14} 105 a7 7 0 0 1 14 0 a7 7 0 0 1 14 0 q0 9 -14 17 q-14 -8 -14 -17z`}
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
        {/* Arms, stopping on the body's own edge wherever that is — which is why
            these alone are pulled back out of the face frame. One end stays
            welded to the lens, the other to the silhouette. */}
        <g transform={inverseFaceTransform(face)}>
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={path`M${100 + side * (temple.halfWidth - 19)} ${temple.y + 7} q${side * 10} -2 ${side * 19} -7`}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ fill: 'none', stroke: blossom.deep }}
            />
          ))}
        </g>
      </g>
    ),
  },

  {
    kind: 'cosmetic',
    id: 'butter-crown',
    slot: 'headwear',
    name: 'Butter crown',
    price: 350,
    // No `back` fragment, unlike the party hat: the points sit inside the brow
    // and the ears are outside it on all three bodies, so there is nothing for a
    // crown this width to pass behind. Splitting it anyway would be two
    // fragments doing one fragment's work.
    render: (_state, { brow, crown }) => {
      const w = brow.halfWidth * 0.94
      const band = brow.y - 4
      // Points rise off the band rather than off the canvas, so a low head gets
      // a crown sitting on it instead of floating above it.
      const tall = crown - 20
      const short = crown - 14

      return (
      <g>
        <path
          d={path`M${100 - w} ${band + 4}
              L${100 - w * 0.78} ${short}
              L${100 - w * 0.4} ${band - 4}
              L100 ${tall}
              L${100 + w * 0.4} ${band - 4}
              L${100 + w * 0.78} ${short}
              L${100 + w} ${band + 4} Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: butter.base, stroke: butter.deep }}
        />
        <path
          d={path`M${100 - w - 2} ${band} h${2 * w + 4} a6 6 0 0 1 0 12 h-${2 * w + 4} a6 6 0 0 1 0 -12z`}
          strokeWidth="3"
          strokeLinejoin="round"
          style={{ fill: butter.soft, stroke: butter.deep }}
        />
        {/* Deep rather than base: a 9-unit gem is 4 CSS pixels at the shop's
            92px, and base on its own soft tint is not a gem at that size, it is
            a dent. They breathe out of phase so the band reads as lit. */}
        {[-0.45, 0, 0.45].map((at, i) => (
          <motion.circle
            key={at}
            cx={100 + w * at}
            cy={band + 6}
            r="4.5"
            strokeWidth="2.5"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            style={{ fill: butter.deep, stroke: butter.deep }}
          />
        ))}
      </g>
      )
    },
  },

  {
    kind: 'cosmetic',
    id: 'wizard-hat',
    slot: 'headwear',
    name: 'Wizard hat',
    price: 700,
    // The cone leans right so it clears the crest rather than sitting on it, and
    // like the party hat it is measured off `crown` — the top of whichever skull
    // is wearing it — so the lean clears a cat's tuft and a bunny's
    // alike.
    render: (_state, { brow, crown }) => {
      const brim = brow.y + 2
      const tip = crown - 44

      return (
      <g>
        <path
          d={path`M${100 - brow.halfWidth * 0.72} ${brim}
              Q${100 - brow.halfWidth * 0.33} ${tip + 8} ${100 + brow.halfWidth * 0.66} ${tip}
              Q${100 + brow.halfWidth * 0.4} ${tip + 22} ${100 + brow.halfWidth * 0.61} ${brim} Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: powder.base, stroke: powder.deep }}
        />
        {/* Outer radius 9, inner 4, about (101, 42) — 17 units across, which is
            8 CSS pixels at 92px. A star drawn at the 7 units this started as is
            the one the room's bunting had to give up on. */}
        <motion.path
          // Outer radius 9, inner 4 — 17 units across, which is 8 CSS pixels at
          // 92px. A star drawn at the 7 units this started as is the one the
          // room's bunting had to give up on.
          d={star(101, tip + 22, 9, 4)}
          strokeWidth="2.5"
          strokeLinejoin="round"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
        <ellipse
          cx="100"
          cy={brim}
          rx={brow.halfWidth * 1.16}
          ry="9"
          strokeWidth="3"
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
        <path
          d={path`M${100 - brow.halfWidth * 0.61} ${brim - 12} h${brow.halfWidth * 1.22} a4.5 4.5 0 0 1 0 9 h-${brow.halfWidth * 1.22} a4.5 4.5 0 0 1 0 -9z`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ fill: powder.base, stroke: powder.deep }}
        />
        <motion.circle
          cx={100 + brow.halfWidth * 0.77}
          cy={tip - 2}
          r="6"
          strokeWidth="2.5"
          animate={{ y: [0, -3, 0, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
      </g>
      )
    },
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
    render: (_state, { shoulder }) => <RainbowWings shoulder={shoulder} />,
  },

]

/* ------------------------------------------------------------------------- *
 * Layers that ride an ear
 * ------------------------------------------------------------------------- */

/**
 * Build a path string, rounding every number interpolated into it.
 *
 * Anchor arithmetic produces values like `29.649999999999999`, which are the
 * same shape on screen and pure noise in the markup — in a snapshot, in a
 * diff, and in the bytes shipped for ten mascots on the shop screen.
 */
function path(parts: TemplateStringsArray, ...values: number[]): string {
  return parts.reduce(
    (out, part, i) => out + part + (i < values.length ? String(Number(values[i].toFixed(2))) : ''),
    '',
  )
}

/**
 * A five-pointed star as a path. Two of them are drawn at different sizes and a
 * literal ten-point `d` string is unreadable at either.
 */
function star(cx: number, cy: number, outer: number, inner: number): string {
  return (
    Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? outer : inner
      const a = (Math.PI / 5) * i - Math.PI / 2
      return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
    }).join(' L ') + ' Z'
  ).replace(/^/, 'M ')
}

/** One bow, tied at its ear's hold point. `onEar` does the rest. */
function bow(hold: Point): ReactNode {
  const x = hold.x
  const y = hold.y - 4

  return (
    <g>
      {/* The two loops differ only in which way they point. */}
      {[-13, 13].map((dx) => (
        <path
          key={dx}
          d={path`M${x} ${y} l${dx} -8 v16z`}
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

/** One muff, centred on its ear's hold point and sized to cover the ear. */
function muff(hold: Point): ReactNode {
  const x = hold.x
  const y = hold.y

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="15"
        strokeWidth="3"
        style={{ fill: mint.base, stroke: mint.deep }}
      />
      <circle
        cx={x}
        cy={y}
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
