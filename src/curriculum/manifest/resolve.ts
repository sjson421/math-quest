/**
 * Derivation over the curriculum manifest.
 *
 * Four things are computed rather than written down, each for the same reason:
 * writing them out by hand across 201 skills would be 201 chances to make a
 * mistake, and storing them would go stale.
 *
 *  - prerequisites — derived from unit order plus unit-level `dependsOn`
 *  - skill state   — derived from the generator registry and built capabilities
 *  - unlock edges  — derived by seeing through skills that have no generator yet
 *  - course tree   — the stages and units that hold a playable skill
 */

import type { Capability, SkillEntry, SkillState, StageEntry, UnitEntry } from './types'

/** Key-shaped lookup. Both `Set<K>` and `Map<K, V>` satisfy this. */
type Lookup<K> = { has(key: K): boolean }

/**
 * Capabilities that are actually built today.
 *
 * Entries are added here only after their infrastructure lands. A stage that
 * declares any other requirement stays `planned` on that infrastructure.
 */
export const AVAILABLE_CAPABILITIES: ReadonlySet<Capability> = new Set([
  'choice-input',
  'math-notation',
  'fraction-input',
  'diagram',
  'number-line',
])

export type SkillLocation = {
  skill: SkillEntry
  unit: UnitEntry
  stage: StageEntry
}

/**
 * Flatten the manifest into a skill id → location map, in curriculum order.
 *
 * First entry wins on a duplicate id, so the manifest still loads; catching the
 * duplicate is the uniqueness test's job, where it can name both offenders.
 */
export function indexSkills(stages: readonly StageEntry[]): Map<string, SkillLocation> {
  const index = new Map<string, SkillLocation>()
  for (const stage of stages)
    for (const unit of stage.units)
      for (const skill of unit.skills)
        if (!index.has(skill.id)) index.set(skill.id, { skill, unit, stage })
  return index
}

/**
 * Expand every skill's prerequisites into explicit skill ids.
 *
 * Three rules, in priority order:
 *  1. An explicit `prerequisites` array on the skill replaces the default
 *     entirely — including replacing it with nothing.
 *  2. Otherwise a skill's prerequisite is the previous skill in its unit.
 *  3. The first skill of a unit instead takes the last skill of each unit named
 *     in `dependsOn`, or nothing if the unit depends on nothing (a root).
 *
 * The returned map is the reviewable form of the graph — dangling ids are
 * passed through as declared, for validation to report.
 */
export function resolvePrerequisites(
  stages: readonly StageEntry[],
): Map<string, string[]> {
  // First entry wins on a duplicate unit id, matching `indexSkills()` and the
  // lookups in `index.ts`. Last-wins here would point `dependsOn` edges at the
  // duplicate while every lookup returned the original, so the graph and the
  // manifest would disagree without anything failing.
  const lastSkillByUnit = new Map<string, string>()
  for (const stage of stages)
    for (const unit of stage.units) {
      const last = unit.skills.at(-1)
      if (last && !lastSkillByUnit.has(unit.id)) lastSkillByUnit.set(unit.id, last.id)
    }

  const resolved = new Map<string, string[]>()

  for (const stage of stages)
    for (const unit of stage.units)
      unit.skills.forEach((skill, i) => {
        if (skill.prerequisites) {
          resolved.set(skill.id, [...skill.prerequisites])
        } else if (i > 0) {
          resolved.set(skill.id, [unit.skills[i - 1].id])
        } else {
          resolved.set(
            skill.id,
            (unit.dependsOn ?? []).map((unitId) => {
              const last = lastSkillByUnit.get(unitId)
              if (!last)
                throw new Error(
                  `${unit.id} declares dependsOn "${unitId}", ` +
                    `which is not a unit with any skills`,
                )
              return last
            }),
          )
        }
      })

  return resolved
}

export type StateOptions = {
  /** Skill ids with a registered generator. The registry `Map` works as-is. */
  generators: Lookup<string>
  /** Capabilities that are built. Defaults to `AVAILABLE_CAPABILITIES`. */
  available?: Lookup<Capability>
}

/**
 * Whether a skill can be played.
 *
 * `implemented` needs both halves: a generator for the id, and every capability
 * its stage requires. A fractions skill with a finished generator but no math
 * notation to render it is `planned` — which is honest, rather than shipping a
 * lesson that renders as mush.
 */
export function resolveSkillState(
  skillId: string,
  stage: Pick<StageEntry, 'requires'>,
  options: StateOptions,
): SkillState {
  if (!options.generators.has(skillId)) return 'planned'

  const available = options.available ?? AVAILABLE_CAPABILITIES
  const blocked = (stage.requires ?? []).some((capability) => !available.has(capability))

  return blocked ? 'planned' : 'implemented'
}

/** `resolveSkillState()` across the whole manifest. */
export function resolveSkillStates(
  stages: readonly StageEntry[],
  options: StateOptions,
): Map<string, SkillState> {
  const states = new Map<string, SkillState>()
  for (const [id, { stage }] of indexSkills(stages))
    states.set(id, resolveSkillState(id, stage, options))
  return states
}

/** A unit that holds at least one playable skill, carrying only those skills. */
export type CourseUnit = {
  unit: UnitEntry
  skills: readonly SkillEntry[]
}

/** A stage that holds at least one playable unit, carrying only those units. */
export type CourseStage = {
  stage: StageEntry
  units: readonly CourseUnit[]
}

/**
 * The playable shape of the course: what the learner can actually navigate.
 *
 * Unbuilt course is absent rather than empty. A unit whose skills are all
 * `planned` does not appear, nor does a stage left with no such unit, so the
 * navigation surface cannot leak how much of the course is unwritten.
 *
 * Derived, never stored, for the same reason skill state is: registering a
 * generator files its skill under the unit and stage the *manifest* declares,
 * with no second list to keep in step. Order comes from the manifest at all
 * three levels, so it cannot be lost by writing a generator in the wrong file
 * or appending one to the end of the right one.
 *
 * Carries `SkillEntry`, not the generator: this stays a pure function of the
 * manifest and a state map, and the entry is the side that knows `quick` and
 * `wall`. The registry is reached by id at the point a lesson starts.
 */
export function resolveCourseTree(
  stages: readonly StageEntry[],
  states: ReadonlyMap<string, SkillState>,
): CourseStage[] {
  const course: CourseStage[] = []

  for (const stage of stages) {
    const units: CourseUnit[] = []

    for (const unit of stage.units) {
      const skills = unit.skills.filter((skill) => states.get(skill.id) === 'implemented')
      if (skills.length > 0) units.push({ unit, skills })
    }

    if (units.length > 0) course.push({ stage, units })
  }

  return course
}

/**
 * Rewrite prerequisites so `planned` skills are transparent.
 *
 * A skill with no generator must not become a wall the learner cannot pass, so
 * it is skipped when resolving unlock and its dependants inherit *its*
 * prerequisites instead. The learner therefore only ever sees a contiguous run
 * of playable skills, and adding a generator later slots it into place without
 * stranding anything behind it.
 *
 * Unknown ids are treated as planned with no prerequisites of their own, so they
 * drop out rather than throwing — a dangling id is validation's to report.
 *
 * @throws if pass-through hits a cycle, naming the full path. Implemented skills
 * terminate expansion, so this guards the traversal rather than validating the
 * graph — whole-graph acyclicity is checked separately.
 */
export function resolveUnlockPrerequisites(
  prerequisites: ReadonlyMap<string, readonly string[]>,
  states: ReadonlyMap<string, SkillState>,
): Map<string, string[]> {
  const cache = new Map<string, string[]>()
  const visiting: string[] = []

  /** Unlock prerequisites *of* `id`, seeing through planned skills. */
  const expand = (id: string): string[] => {
    const cached = cache.get(id)
    if (cached) return cached

    const cycleStart = visiting.indexOf(id)
    if (cycleStart !== -1)
      throw new Error(
        `Prerequisite cycle: ${[...visiting.slice(cycleStart), id].join(' → ')}`,
      )

    visiting.push(id)

    const edges: string[] = []
    for (const prerequisite of prerequisites.get(id) ?? []) {
      const inherited =
        states.get(prerequisite) === 'implemented' ? [prerequisite] : expand(prerequisite)
      for (const edge of inherited) if (!edges.includes(edge)) edges.push(edge)
    }

    visiting.pop()
    cache.set(id, edges)
    return edges
  }

  const unlock = new Map<string, string[]>()
  for (const id of prerequisites.keys()) unlock.set(id, expand(id))
  return unlock
}
