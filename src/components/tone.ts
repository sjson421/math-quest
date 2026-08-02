/**
 * Which pastel a unit wears.
 *
 * Colour is the one thing the manifest does not declare and the only thing the
 * old hand-written `Unit` literals carried that was worth keeping. Rather than a
 * table of 23 unit ids to maintain — where a missing row is a runtime hole — the
 * tone comes from the unit's position in the manifest, cycling through the
 * palette so neighbouring units always differ.
 *
 * The cycle opens powder, blossom, mint deliberately: those are the colours
 * Units 0, 1 and 2 already wear, so deriving the tone does not quietly recolour
 * the app. Manifest order is fixed at 23 units, so a unit's colour is stable.
 */

import { allUnits } from '../curriculum/manifest'

export type Tone = 'blossom' | 'lilac' | 'mint' | 'butter' | 'powder'

const TONE_CYCLE: readonly Tone[] = ['powder', 'blossom', 'mint', 'butter', 'lilac']

/**
 * Tailwind class fragments per tone, so a component never builds one by hand.
 * Tailwind scans for whole class names, so these stay spelled out rather than
 * assembled from the tone.
 */
export const TONE_CLASSES: Record<Tone, { fill: string; text: string }> = {
  blossom: { fill: 'bg-blossom', text: 'text-blossom-deep' },
  lilac: { fill: 'bg-lilac', text: 'text-lilac-deep' },
  mint: { fill: 'bg-mint', text: 'text-mint-deep' },
  butter: { fill: 'bg-butter', text: 'text-butter-deep' },
  powder: { fill: 'bg-powder', text: 'text-powder-deep' },
}

const toneByUnitId = new Map(
  allUnits.map((unit, i) => [unit.id, TONE_CYCLE[i % TONE_CYCLE.length]] as const),
)

/** An unknown unit reads as the first tone rather than rendering uncoloured. */
export function toneForUnit(unitId: string): Tone {
  return toneByUnitId.get(unitId) ?? TONE_CYCLE[0]
}
