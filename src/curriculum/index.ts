/**
 * The generator registry, resolved against the curriculum manifest.
 *
 * The manifest declares all 201 skills; generators arrive a unit at a time, so
 * most manifest entries have no generator and that is the normal state. This
 * module is the join between the two: it registers what exists under its
 * manifest id, and derives which skills can actually be played.
 *
 * Only `implemented` skills are offered to the learner. `units` stays the list
 * the skill tree renders, so a skill becomes visible by gaining a generator —
 * never by being added to the manifest.
 */

import type { SkillGenerator, Unit } from '../lib/types'
import { unit01 } from './unit-01-add-sub'
import { indexSkills, resolveSkillStates, stages } from './manifest'
import type { SkillState } from './manifest'

/** Units in learning order. Phase 1 ships Unit 1 only. */
export const units: Unit[] = [unit01]

export const allSkills: SkillGenerator[] = units.flatMap((u) => u.skills)

/**
 * Generators keyed by manifest skill id.
 *
 * Named for what it holds, because `manifest/index.ts` exports a `skillById` of
 * manifest *entries* — same shape of lookup, entirely different contents. A test
 * asserts every key here exists in the manifest.
 */
export const generators = new Map(allSkills.map((s) => [s.id, s]))

export const unitBySkillId = new Map(
  units.flatMap((u) => u.skills.map((s) => [s.id, u] as const)),
)

export function getSkill(id: string): SkillGenerator {
  const skill = generators.get(id)
  if (!skill) throw new Error(`Unknown skill: ${id}`)
  return skill
}

/** Manifest location — unit and stage membership — for every declared skill. */
export const manifestIndex = indexSkills(stages)

/**
 * Playable state for every manifest skill, derived at load.
 *
 * Never stored: adding a generator flips its skill on with no bookkeeping, and a
 * skill blocked only on missing infrastructure reports honestly instead of
 * looking broken.
 */
export const skillStates: ReadonlyMap<string, SkillState> = resolveSkillStates(stages, {
  generators,
})

/** Unknown ids read as `planned`, which is the safe answer for a skill we cannot play. */
export function skillState(id: string): SkillState {
  return skillStates.get(id) ?? 'planned'
}

/** Manifest ids that can be played today, in curriculum order. */
export const implementedSkillIds = [...skillStates]
  .filter(([, state]) => state === 'implemented')
  .map(([id]) => id)
