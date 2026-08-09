/**
 * Buying and wearing cosmetics, as pure functions over a progress record.
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
 */

import { cosmeticById, type Cosmetic, type CosmeticSlot } from '../cosmetics'
import type { Progress } from '../store/progress'

/** Where the learner stands with one cosmetic. What a shop card renders from. */
export type CosmeticStanding = 'worn' | 'owned' | 'affordable' | 'out-of-reach'

export const owns = (progress: Progress, id: string): boolean => progress.inventory.includes(id)

export function standing(progress: Progress, cosmetic: Cosmetic): CosmeticStanding {
  if (progress.equipped[cosmetic.slot] === cosmetic.id) return 'worn'
  if (owns(progress, cosmetic.id)) return 'owned'
  return progress.coins >= cosmetic.price ? 'affordable' : 'out-of-reach'
}

/**
 * Buy one cosmetic. Refused when it is unknown, already owned, or costs more
 * than the learner has.
 *
 * Buying does not equip. Deciding to own something and deciding to wear it are
 * separate, and collapsing them would take the choice away at the only moment
 * the learner is thinking about it.
 */
export function buy(progress: Progress, id: string): Progress | null {
  const cosmetic = cosmeticById.get(id)
  if (!cosmetic) return null
  if (owns(progress, id)) return null
  if (progress.coins < cosmetic.price) return null

  return {
    ...progress,
    coins: progress.coins - cosmetic.price,
    inventory: [...progress.inventory, id],
  }
}

/**
 * Wear one cosmetic. Refused when it is unknown or not owned; equipping into an
 * occupied slot replaces what was there, which is the whole point of a slot.
 */
export function equip(progress: Progress, id: string): Progress | null {
  const cosmetic = cosmeticById.get(id)
  if (!cosmetic) return null
  if (!owns(progress, id)) return null
  if (progress.equipped[cosmetic.slot] === id) return null

  return { ...progress, equipped: { ...progress.equipped, [cosmetic.slot]: id } }
}

/**
 * Take off whatever is in a slot, keeping it owned. Refused when the slot is
 * already empty — the one operation that cannot fail is otherwise the one that
 * can push a no-op to the server.
 */
export function unequip(progress: Progress, slot: CosmeticSlot): Progress | null {
  if (!progress.equipped[slot]) return null

  const equipped = { ...progress.equipped }
  delete equipped[slot]
  return { ...progress, equipped }
}
