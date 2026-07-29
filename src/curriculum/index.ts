import type { SkillGenerator, Unit } from '../lib/types'
import { unit01 } from './unit-01-add-sub'

/** Units in learning order. Phase 1 ships Unit 1 only. */
export const units: Unit[] = [unit01]

export const allSkills: SkillGenerator[] = units.flatMap((u) => u.skills)

export const skillById = new Map(allSkills.map((s) => [s.id, s]))

export const unitBySkillId = new Map(
  units.flatMap((u) => u.skills.map((s) => [s.id, u] as const)),
)

export function getSkill(id: string): SkillGenerator {
  const skill = skillById.get(id)
  if (!skill) throw new Error(`Unknown skill: ${id}`)
  return skill
}
