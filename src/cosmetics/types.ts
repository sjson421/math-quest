import type { ReactNode } from 'react'
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

/** Two items in the same slot cannot be worn at once. That is what a slot is for. */
export type CosmeticSlot = 'back' | 'headwear' | 'face' | 'neck' | 'pin'

/** The four places a decoration can stand. Same rule: one item each. */
export type RoomSlot = 'rug' | 'wall' | 'left' | 'right'

/** Slot → the id worn in it. An absent slot means Pip's own default. */
export type Equipped = Partial<Record<CosmeticSlot, string>>

/** Slot → the id standing in it. An absent slot means nothing is there. */
export type Placed = Partial<Record<RoomSlot, string>>

/**
 * A fragment gets the state so it can follow a part that moves on its own. Only
 * the ears do — everything else rides the root `<svg>` and needs no state at
 * all, which is why most items ignore the argument.
 */
type Fragment = (state: MascotState) => ReactNode

type Owned = {
  id: string
  /** Shown in the shop. */
  name: string
  price: number
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
 * **A character varies the parts no cosmetic anchors to, and nothing else.** The
 * head circle, the eye line, the mouth, and the two ear bases are the same on
 * all of them, because every shipped accessory is authored against those exact
 * numbers: move the head and the scarf stops crossing a chin, move an ear base
 * and the earmuffs come off. What is left to vary — coat, ear silhouette, crest,
 * markings, charm — is enough to read as a different creature, and that is the
 * whole trade this type encodes.
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
   * One ear, drawn upright about its own base. `Mascot.tsx` applies the
   * rotation, so this is the shape *before* the −24° / +24° rest pose — the same
   * frame `bow()` and `muff()` are written in.
   *
   * It must hold what rides it: an ear bow sits at `y 64` and an earmuff covers
   * a 30-unit circle at `y 68`, both centred on the ear base. An ear with
   * nothing there is an ear those two items fall off.
   */
  ear: (ear: 'left' | 'right') => ReactNode
  /**
   * What sits between the ears, in the tuft's envelope — `x 86–114`, `y 45–61`.
   * Wider or taller and it collides with the hats, which is a collision the
   * render order cannot fix: a crest is one of Pip's own layers and paints over
   * the party hat's crown, which passes behind them.
   */
  crest: ReactNode
  /**
   * A muzzle, whiskers, a nose — drawn over the cheeks and under the eyes and
   * mouth, so the expression always wins. Optional: Pip has none.
   */
  markings?: ReactNode
  /**
   * What stands in the `pin` slot when nothing is equipped there. Static
   * geometry about the `pin` anchor `(148, 162)`; `Mascot.tsx` gives it the sway
   * and the celebration spin that Pip's star has always had.
   */
  charm: ReactNode
}

export type CatalogueItem = Cosmetic | Decoration | Character
