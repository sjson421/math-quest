import type { ReactNode } from 'react'
import type { Tone } from '../components/tone'
import type { Coat } from './palette'

/**
 * What the learner can own, across both surfaces.
 *
 * These live apart from the catalogues that use them because `index.tsx` must
 * import the decorations in order to combine them into one catalogue, while
 * `room.tsx` must import these types in order to declare one — a cycle if the
 * types stay in either file. Nothing here is JSX, so this module is free of it.
 *
 * `index.tsx` re-exports everything below, so importing from `../cosmetics`
 * still reaches all of it.
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

/**
 * The two ears, in paint order.
 *
 * Here rather than in `ears.tsx` because `Anchors` names them and this module
 * may not import that one — `ears.tsx` holds the wrapper that applies the swing,
 * which is JSX, and re-exports these for everyone who only wants the names.
 */
export const EARS = ['left', 'right'] as const

export type Ear = (typeof EARS)[number]

/** Two items in the same slot cannot be worn at once. That is what a slot is for. */
export type CosmeticSlot = 'back' | 'headwear' | 'face' | 'neck'

/** The four places a decoration can stand. Same rule: one item each. */
export type RoomSlot = 'rug' | 'wall' | 'left' | 'right'

/** Slot → the id worn in it. An absent slot means Pip's own default. */
export type Equipped = Partial<Record<CosmeticSlot, string>>

/** Slot → the id standing in it. An absent slot means nothing is there. */
export type Placed = Partial<Record<RoomSlot, string>>

/** A point in the shared `0 0 200 200` view box. */
export type Point = { x: number; y: number }

/**
 * A span across the body: how high it sits, and how far the silhouette reaches
 * either side of the midline there. A band, a brim and a scarf are all "cross
 * the body at this height, this wide", which is the whole reason they can be
 * written once and fit three different heads.
 */
export type Span = { y: number; halfWidth: number }

/**
 * Where the six expressions are drawn.
 *
 * The face is authored once, in Pip's coordinates, and *moved* onto each
 * character rather than redrawn for it: `centre` is where Pip's face centre
 * `(100, 120)` lands, and `scale` is how much bigger it gets there. A wider
 * head does not get its own eyes — it gets Pip's, further apart.
 *
 * The `face` slot rides this same frame, so glasses land on the eyes on every
 * character without knowing which one they are on.
 */
export type Frame = { centre: Point; scale: number }

/**
 * The contract between a body and everything worn on it.
 *
 * **This type is why a character can be redrawn from scratch.** It used to be
 * that a head was a circle at `(100, 112) r 57` on all three, because ten
 * accessories were authored against those literal numbers — so a new creature
 * could vary its ears and its coat and nothing else. Now the accessories are
 * authored against the names below and each character says where its own are,
 * which moves the constraint from "every body is the same shape" to the far
 * weaker "every body can say where its brow is".
 *
 * Adding an anchor is a real cost: it is a question every future character has
 * to answer. These eight are the ones the shipped wardrobe actually asks.
 */
export type Anchors = {
  /** Where the expression is drawn, and what the `face` slot rides. */
  face: Frame
  /**
   * Each ear: where it pivots, and where things are tied to it.
   *
   * Two points rather than one because they answer different questions and the
   * answers came apart the moment the ears did. `base` is on the head and is
   * what the swing rotates about. `hold` is out on the ear's own mass, and is
   * where a bow ties and an earmuff centres — a bunny's is far up a long ellipse
   * and a cat's is barely above the base of a short triangle, and nothing but
   * the character knows which. Guessing it from `base` is an earmuff floating
   * above the ear it is meant to cover.
   */
  ear: Record<Ear, { base: Point; hold: Point }>
  /** The top of the skull. A hat rises from here; nothing is drawn below it. */
  crown: number
  /** Where a hat band, a brim or a muff strap crosses. */
  brow: Span
  /** Where the arms of a pair of glasses meet the silhouette. */
  temple: Span
  /** Where a scarf crosses. */
  chin: Span
  /** Where a cape hangs from and a pair of wings emerges behind. */
  shoulder: Span
  /**
   * Where the charm hangs, at whatever tier the learner has earned. Not a
   * cosmetic slot: nothing bought can stand here, because what stands here is
   * a record of progress rather than a purchase.
   */
  pin: Point
}

/**
 * A fragment gets the state so it can follow a part that moves on its own — only
 * the ears do, which is why most items ignore it — and the anchors of whoever is
 * wearing it, so one drawing fits three bodies.
 */
type Fragment = (state: MascotState, anchors: Anchors) => ReactNode

type Owned = {
  id: string
  /** Shown in the shop. */
  name: string
  price: number
  /**
   * Days of streak needed before this can be bought at all. Absent means it is
   * for sale from the first lesson, which is every item that shipped before
   * streaks had stakes.
   *
   * **A gate on buying, never on keeping.** `standing()` checks ownership
   * first, so an item bought at a hundred days stays worn, equippable and
   * owned through every broken streak afterwards. The streak decides what is
   * still to come; it never reaches back for what the learner already has.
   *
   * On `Owned` rather than on `Cosmetic` because it is a fact about acquiring
   * something, which is what this type is — and one field here is what lets
   * `standing()` ask the question once instead of narrowing by kind first.
   */
  requiresStreak?: number
}

export type Cosmetic = Owned & {
  kind: 'cosmetic'
  slot: CosmeticSlot
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

export type Decoration = Owned & {
  kind: 'decoration'
  slot: RoomSlot
  /**
   * **No state argument, and that is the point.** A decoration responds to
   * nothing — not to Pip's six states, not to a streak, not to a lesson — so a
   * signature that cannot receive the state makes a state-dependent decoration
   * unwritable rather than merely discouraged.
   *
   * It may still run a loop of its own — a bulb glowing, a fish drifting — since
   * that needs nothing passed in. Responding is what is forbidden here, not
   * moving; `references/room.md` says which items have earned a loop.
   *
   * There is no `back`/`front` pair either. The room paints Pip as one step, so
   * it never opens a gap for a decoration to span.
   */
  render: () => ReactNode
}

/**
 * Who the learner is playing as — the body every cosmetic is hung off.
 *
 * **A character draws its own body and says where things go on it.** It used to
 * be the opposite: one head circle at `(100, 112) r 57` on all three, because
 * ten accessories were authored against those literal numbers, so a creature
 * could vary its ears and its coat and little else — three colours of the same
 * animal. A character now brings its own `head` and its own `anchors`, and the
 * wardrobe reads the anchors instead of the numbers.
 *
 * The promise that constraint was protecting is unchanged and now lives in
 * `anchors`: **buying a character never costs the learner an accessory.** A body
 * that answers the eight anchors holds all ten items; `catalogue.test.tsx`
 * renders every item on every character to keep it true.
 *
 * **No state argument anywhere, for the reason `Decoration` has none.** All of
 * the motion belongs to `Mascot.tsx`: the ears take the ear swing, the charm
 * takes the charm's sway and celebration spin, and everything else rides the
 * root bob. A character that animated a part itself would either double the
 * motion already on it or invent a second vocabulary beside the shared one.
 */
export type Character = Owned & {
  kind: 'character'
  /** Body fill, outline, and the warm tone cheeks and inner ears share. */
  coat: Coat
  /**
   * Where everything worn on this body goes. The one thing a character may not
   * leave out and may not get wrong: an anchor in the wrong place is an item
   * hanging in the air beside the creature rather than on it.
   */
  anchors: Anchors
  /**
   * The head and body silhouette, drawn once and shared by all six states — the
   * motion is the root bob, which it inherits.
   *
   * This is the layer that makes a character a different creature rather than a
   * different colour, so it is deliberately unconstrained in shape. What it owes
   * is only that its outline actually passes through the spans in `anchors`: a
   * brim drawn at the `brow` half-width hangs off a head narrower than that.
   */
  head: ReactNode
  /**
   * One ear, drawn upright about its own base at `anchors.ear[ear]`.
   * `Mascot.tsx` applies the rotation, so this is the shape *before* the rest
   * pose — the same frame `bow()` and `muff()` are written in.
   *
   * It must hold what rides it: both of those are drawn centred on the ear base
   * and sized off it, so an ear that is much smaller than its own anchor claims
   * is an ear the earmuff swallows.
   */
  ear: (ear: Ear) => ReactNode
  /**
   * What sits between the ears, above `anchors.crown` and no wider than the
   * brow. Wider or taller and it collides with the hats, which is a collision
   * the render order cannot fix: a crest is one of the character's own layers
   * and paints over the party hat's crown, which passes behind them.
   */
  crest: ReactNode
  /**
   * A muzzle, whiskers, a nose — drawn over the cheeks and under the eyes and
   * mouth, so the expression always wins. Optional: Pip has none.
   */
  markings?: ReactNode
  /**
   * The five pins this character can be wearing, cheapest-looking first.
   *
   * **A tuple rather than a `charm(tier)` function, deliberately.** A function
   * taking the tier is a state argument in all but name, and the rule directly
   * above — that a character receives nothing and owns no motion — is what keeps
   * a character from growing a second expression set or a second animation
   * vocabulary. Five slots of data break neither, and make a character that
   * declares four tiers a compile error rather than an index into nothing.
   *
   * Index 0 is the plain charm this character has always had, so a fresh record
   * looks exactly as it did. Every later entry keeps that same charm visible and
   * adds only around it: a tier is the same object more finely mounted, never a
   * different object. `Mascot.tsx` gives whichever is drawn the sway and the
   * celebration spin, so none of these carries motion of its own.
   *
   * Which one a learner sees is earned, not owned — see `src/lib/pin.ts`.
   */
  charms: readonly [ReactNode, ReactNode, ReactNode, ReactNode, ReactNode]
  /**
   * The family the charm and its frames are drawn in — butter, powder, mint.
   *
   * Declared rather than baked into the geometry because the frame is shared:
   * one `charmFrame()` builds all three ladders, and the three must still be
   * told apart by colour before shape at 92px, which is the rule the charms
   * themselves are already under.
   */
  charmTone: Tone
}

export type CatalogueItem = Cosmetic | Decoration | Character
