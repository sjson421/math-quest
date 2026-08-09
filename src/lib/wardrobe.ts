/**
 * Buying, wearing and placing, as pure functions over a progress record.
 *
 * None of this lives in the shop component, for the same reason `submit.ts`
 * exists rather than a branch inside `Lesson.tsx`: component tests render first
 * paint to a string in node, no handler ever fires, and a decision behind a tap
 * is a decision no test can reach.
 *
 * Every function returns a new record or `null`, and `null` means the request
 * was refused. The store persists only a non-null result — a refused purchase
 * that advanced `updatedAt` would schedule a push carrying no change, on every
 * tap of something the learner cannot afford.
 *
 * One catalogue covers both surfaces, so `buy` never needs to know which kind it
 * was handed. `standing`, `equip` and `unequip` do, and all three ask the same
 * question — which map does this slot belong to — rather than a caller passing a
 * discriminant it could get wrong.
 */

import {
  isRoomSlot,
  itemById,
  type CatalogueItem,
  type CosmeticSlot,
  type RoomSlot,
} from '../cosmetics'
import type { Progress } from '../store/progress'

/** Where the learner stands with one item. What a shop card renders from. */
export type ItemStanding = 'in-use' | 'owned' | 'affordable' | 'out-of-reach'

export const owns = (progress: Progress, id: string): boolean => progress.inventory.includes(id)

/**
 * Which map a slot belongs to — the single fact all three operations route on.
 *
 * Slot membership rather than the item's `kind`, even where a `kind` is in hand.
 * `unequip` is given a slot and no item, so it can only ask this question; if
 * the others asked a different one, the same fact would be written down twice
 * and a third surface would have to be added correctly in two places.
 *
 * It reads the *value* rather than handing back the map, because narrowing the
 * slot is what makes the index legal — a function returning the map loses that
 * pairing and leaves a slot union indexing a record union.
 */
const inUse = (progress: Progress, item: CatalogueItem): string | undefined => {
  const slot = item.slot
  return isRoomSlot(slot) ? progress.room[slot] : progress.equipped[slot]
}

/** A slot map with one slot removed. The copy is what keeps the record immutable. */
const without = <T extends object, K extends keyof T>(map: T, slot: K): T => {
  const next = { ...map }
  delete next[slot]
  return next
}

export function standing(progress: Progress, item: CatalogueItem): ItemStanding {
  if (inUse(progress, item) === item.id) return 'in-use'
  if (owns(progress, item.id)) return 'owned'
  return progress.coins >= item.price ? 'affordable' : 'out-of-reach'
}

/**
 * Buy one item, of either kind. Refused when it is unknown, already owned, or
 * costs more than the learner has.
 *
 * Buying does not equip. Deciding to own something and deciding to use it are
 * separate, and collapsing them would take the choice away at the only moment
 * the learner is thinking about it.
 */
export function buy(progress: Progress, id: string): Progress | null {
  const item = itemById.get(id)
  if (!item) return null
  if (owns(progress, id)) return null
  if (progress.coins < item.price) return null

  return {
    ...progress,
    coins: progress.coins - item.price,
    inventory: [...progress.inventory, id],
  }
}

/**
 * Wear a cosmetic, or stand a decoration in the room. Refused when it is unknown
 * or not owned; going into an occupied slot replaces what was there, which is
 * the whole point of a slot.
 */
export function equip(progress: Progress, id: string): Progress | null {
  const item = itemById.get(id)
  if (!item) return null
  if (!owns(progress, id)) return null
  if (inUse(progress, item) === id) return null

  const slot = item.slot
  return isRoomSlot(slot)
    ? { ...progress, room: { ...progress.room, [slot]: id } }
    : { ...progress, equipped: { ...progress.equipped, [slot]: id } }
}

/**
 * Empty a slot, keeping what was in it owned. Refused when the slot is already
 * empty — the one operation that cannot fail is otherwise the one that can push
 * a no-op to the server.
 *
 * The slot alone says which map it belongs to, because the two unions share no
 * string. `catalogue.test.tsx` asserts that they stay disjoint, since the day
 * they overlap this routes silently to the wrong map.
 */
export function unequip(progress: Progress, slot: CosmeticSlot | RoomSlot): Progress | null {
  if (isRoomSlot(slot)) {
    if (!progress.room[slot]) return null
    return { ...progress, room: without(progress.room, slot) }
  }

  if (!progress.equipped[slot]) return null
  return { ...progress, equipped: without(progress.equipped, slot) }
}
