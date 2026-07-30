/**
 * The curriculum manifest — one import site for the whole course.
 *
 * `stages` is the authority: 8 stages, 23 units, 201 skills, in curriculum order.
 * The lookups below are conveniences built from it, not separate sources.
 *
 * Duplicate ids resolve first-wins here, the same rule `indexSkills()` uses, so
 * the manifest still loads with one. Catching a duplicate is the uniqueness
 * test's job, where it can name both offenders instead of silently hiding one.
 */

import type { SkillEntry, StageEntry, UnitEntry } from './types'
import { stageA } from './stage-a'
import { stageB } from './stage-b'
import { stageC } from './stage-c'
import { stageD } from './stage-d'
import { stageE } from './stage-e'
import { stageF } from './stage-f'
import { stageG } from './stage-g'
import { stageH } from './stage-h'

export * from './types'
export * from './resolve'
export { stageA, stageB, stageC, stageD, stageE, stageF, stageG, stageH }

/** Every stage in curriculum order. The manifest itself. */
export const stages: readonly StageEntry[] = [
  stageA,
  stageB,
  stageC,
  stageD,
  stageE,
  stageF,
  stageG,
  stageH,
]

/** Every unit in curriculum order, flattened across stages. */
export const allUnits: readonly UnitEntry[] = stages.flatMap((stage) => stage.units)

/** Every skill in curriculum order, flattened across units. */
export const allSkills: readonly SkillEntry[] = allUnits.flatMap((unit) => unit.skills)

/** Build a first-wins id lookup, so a duplicate cannot hide the original. */
function byId<T extends { id: string }>(entries: readonly T[]): ReadonlyMap<string, T> {
  const index = new Map<string, T>()
  for (const entry of entries) if (!index.has(entry.id)) index.set(entry.id, entry)
  return index
}

export const skillById = byId(allSkills)
export const unitById = byId(allUnits)
export const stageById = byId(stages)
