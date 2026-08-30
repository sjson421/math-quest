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
 * One catalogue covers all three kinds, so `buy` never needs to know which it was
 * handed. `standing` and `equip` do, and they ask the item itself rather than
 * take a discriminant from a caller that could get it wrong.
 */

import {
  isRoomSlot,
  itemById,
  type CatalogueItem,
  type CosmeticSlot,
  type RoomSlot,
} from '../cosmetics'
import { canHoldFreeze, STREAK_FREEZE_PRICE } from './streak'
import type { Progress } from '../store/progress'

/** Where the learner stands with one item. What a shop card renders from. */
export type ItemStanding =
  | 'in-use'
  | 'owned'
  | 'streak-locked'
  | 'affordable'
  | 'out-of-reach'

/**
 * Owning something is having bought it — with the one exception that costs
 * nothing to make and would cost a migration to avoid.
 *
 * The starting character is priced at zero, and a price of zero is owned before
 * anything happens. Seeding the inventory with it instead would mean rewriting
 * every record that predates characters, and pushing that rewrite to the server
 * on first load, to record a fact the catalogue already states.
 */
export const owns = (progress: Progress, id: string): boolean =>
  progress.inventory.includes(id) || itemById.get(id)?.price === 0

/**
 * Where an item would be in use, and what is there now.
 *
 * A character has no slot, because there is only ever one of them and it is
 * never empty — `progress.character` is that slot, spelled out. The other two
 * kinds route on slot membership rather than on `kind`, even where a `kind` is
 * in hand: `unequip` is given a slot and no item, so it can only ask that
 * question, and if the others asked a different one the same fact would be
 * written down twice.
 *
 * It reads the *value* rather than handing back the map, because narrowing the
 * slot is what makes the index legal — a function returning the map loses that
 * pairing and leaves a slot union indexing a record union.
 */
const inUse = (progress: Progress, item: CatalogueItem): string | undefined => {
  if (item.kind === 'character') return progress.character

  const slot = item.slot
  return isRoomSlot(slot) ? progress.room[slot] : progress.equipped[slot]
}

/** A slot map with one slot removed. The copy is what keeps the record immutable. */
const without = <T extends object, K extends keyof T>(map: T, slot: K): T => {
  const next = { ...map }
  delete next[slot]
  return next
}

/**
 * **Ownership is checked before the streak, and the order is the promise.**
 * An item bought at a hundred days stays owned, worn and equippable through
 * every broken streak afterwards: the gate decides what is still to come and
 * never reaches back for what the learner already has. Swapping these two lines
 * would confiscate a cosmetic for missing a day.
 */
export function standing(progress: Progress, item: CatalogueItem): ItemStanding {
  if (inUse(progress, item) === item.id) return 'in-use'
  if (owns(progress, item.id)) return 'owned'
  if (progress.streakCount < (item.requiresStreak ?? 0)) return 'streak-locked'

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
  // Asked as one question rather than re-listing owned, locked and affordable
  // here. A shop card and a purchase that decide separately are a shop card
  // and a purchase that can disagree — which is exactly how the streak gate
  // first shipped, showing a lock over a buy that still went through.
  if (standing(progress, item) !== 'affordable') return null

  return {
    ...progress,
    coins: progress.coins - item.price,
    inventory: [...progress.inventory, id],
  }
}

/**
 * Play as a character, wear a cosmetic, or stand a decoration in the room.
 * Refused when it is unknown or not owned; going into an occupied slot replaces
 * what was there, which is the whole point of a slot.
 *
 * Becoming a character replaces the one before it and takes nothing off: every
 * accessory is authored against anchors all three share, so what was worn on Pip
 * is still worn, and still fits, on Mochi.
 */
export function equip(progress: Progress, id: string): Progress | null {
  const item = itemById.get(id)
  if (!item) return null
  if (!owns(progress, id)) return null
  if (inUse(progress, item) === id) return null

  if (item.kind === 'character') return { ...progress, character: id }

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
 * There is no slot here for a character, and that is the point: someone is
 * always on screen, so the only way to stop being one is to become another.
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

/* ------------------------------------------------------------------------- *
 * The one consumable
 * ------------------------------------------------------------------------- */

/**
 * Where the learner stands with a streak freeze. What its shop card renders
 * from, and the consumable's answer to `ItemStanding`.
 *
 * There is no `in-use` and no `owned`: a freeze is held rather than worn, and
 * held in a quantity rather than as a fact, so the two standings that describe a
 * permanent item have nothing to say about it. `at-cap` is the one they do not
 * cover — the learner can afford another and still may not have one.
 */
export type FreezeStanding = 'affordable' | 'at-cap' | 'out-of-reach'

export function freezeStanding(progress: Progress): FreezeStanding {
  if (!canHoldFreeze(progress)) return 'at-cap'
  return progress.coins >= STREAK_FREEZE_PRICE ? 'affordable' : 'out-of-reach'
}

/**
 * Buy one streak freeze. Refused at the cap, or when it costs more than the
 * learner has.
 *
 * **A freeze is deliberately not a catalogue item.** Everything in the
 * catalogue is permanent and unique — `owns()` is membership of `inventory`,
 * and `buy()` refuses anything already owned — so a consumable held two at a
 * time cannot be expressed there without weakening the rule every cosmetic,
 * decoration and character depends on. It also has no geometry, no slot and
 * nothing to equip, so all three of `CatalogueItem`'s shapes would be carrying
 * fields it has no use for. One count on the record and one function here is
 * the whole feature.
 *
 * Refusal is `null` for the reason the three above return it: the store
 * persists only a non-null result, so a tap the learner cannot afford advances
 * no version and schedules no push.
 */
export function buyFreeze(progress: Progress): Progress | null {
  if (freezeStanding(progress) !== 'affordable') return null

  return {
    ...progress,
    coins: progress.coins - STREAK_FREEZE_PRICE,
    streakFreezes: progress.streakFreezes + 1,
  }
}
