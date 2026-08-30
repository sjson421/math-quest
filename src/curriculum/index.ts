/**
 * The generator registry, resolved against the curriculum manifest.
 *
 * The manifest declares all 201 skills; generators arrive a unit at a time, so
 * most manifest entries have no generator and that is the normal state. This
 * module is the join between the two: it registers what exists under its
 * manifest id, and derives which skills can actually be played.
 *
 * Only `implemented` skills are offered to the learner. `course` is the tree the
 * navigation renders, derived from the manifest rather than written down, so a
 * skill becomes visible by gaining a generator — never by being added to the
 * manifest, and never by being added to a second list here.
 */

import type { SkillGenerator } from '../lib/types'
import { unit00 } from './unit-00-numbers'
import { unit01 } from './unit-01-addition'
import { unit02 } from './unit-02-subtraction'
import { unit03 } from './unit-03-multiplication'
import { unit04 } from './unit-04-division'
import { unit05 } from './unit-05-order-of-operations'
import { unit06 } from './unit-06-negatives'
import { unit07 } from './unit-07-fractions-meaning'
import { unit08 } from './unit-08-fraction-operations'
import { unit09 } from './unit-09-decimals'
import { unit10 } from './unit-10-percents'
import { unit11 } from './unit-11-ratios-proportions'
import { unit12 } from './unit-12-exponents-roots'
import { unit13 } from './unit-13-expressions'
import { unit14 } from './unit-14-linear-equations'
import { unit15 } from './unit-15-inequalities'
import { unit16 } from './unit-16-coordinate-plane-lines'
import { unit17 } from './unit-17-systems-equations'
import { unit18 } from './unit-18-polynomials'
import { unit19 } from './unit-19-functions'
import { unit20 } from './unit-20-geometry-measurement'
import {
  indexSkills,
  resolveCourseTree,
  resolvePrerequisites,
  resolveSkillStates,
  resolveUnlockPrerequisites,
  stages,
} from './manifest'
import type { CourseStage, CourseUnit, SkillState } from './manifest'

/**
 * Every registered generator. Order is the order units are listed here and
 * skills within them, which the manifest re-imposes on anything the learner
 * sees — see `course` below.
 */
export const allSkills: SkillGenerator[] = [
  ...unit00,
  ...unit01,
  ...unit02,
  ...unit03,
  ...unit04,
  ...unit05,
  ...unit06,
  ...unit07,
  ...unit08,
  ...unit09,
  ...unit10,
  ...unit11,
  ...unit12,
  ...unit13,
  ...unit14,
  ...unit15,
  ...unit16,
  ...unit17,
  ...unit18,
  ...unit19,
  ...unit20,
]

/**
 * Generators keyed by manifest skill id.
 *
 * Named for what it holds, because `manifest/index.ts` exports a `skillById` of
 * manifest *entries* — same shape of lookup, entirely different contents. A test
 * asserts every key here exists in the manifest.
 */
export const generators = new Map(allSkills.map((s) => [s.id, s]))

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
export const implementedSkillIds = [...skillStates].filter(([, state]) => state === 'implemented').map(([id]) => id)

/**
 * What must be mastered before each skill opens — the runtime unlock graph.
 *
 * The third derivation over the same two inputs as `skillStates`, and never
 * stored for the same reason: the manifest declares edges between all 201
 * skills, most of which have no generator, so the edges that can actually gate a
 * learner change every time one lands.
 *
 * Keyed by every manifest id, planned ones included — but every id in a *value*
 * is implemented, because `resolveUnlockPrerequisites()` sees through the rest.
 * That is the half that matters: it is what stops a learner being held behind a
 * skill nobody can play. A key is not a claim that its skill is playable, so ask
 * `skillState()` rather than `unlockPrerequisites.has()`.
 *
 * Named to survive the crowd. `resolvePrerequisites()` returns the *raw* edges
 * including planned skills, `resolveUnlockPrerequisites()` is the function that
 * collapses them, and this is that function's result over the live registry.
 * Reach for this one when the question is "can the learner start this yet".
 */
export const unlockPrerequisites: ReadonlyMap<string, readonly string[]> = resolveUnlockPrerequisites(
  resolvePrerequisites(stages),
  skillStates,
)

/**
 * The course the learner can navigate — stages, their units, and the playable
 * skills in each.
 *
 * The fourth derivation over the same two inputs as `skillStates`, and the one
 * the navigation renders. It replaced a hand-written array of units, which had
 * already drifted: those literals declared `unit-00` while the manifest declared
 * `unit-0`, and nothing failed because nothing read the hand-written id. There
 * is now nothing to drift from.
 *
 * Holds manifest entries rather than generators. Reach for `getSkill(id)` at the
 * point a lesson starts; everything a card renders — name, blurb, `quick`,
 * `wall` — is on the entry, and a test pins the two descriptions equal.
 */
export const course: readonly CourseStage[] = resolveCourseTree(stages, skillStates)

/**
 * Id lookups into `course`, built once.
 *
 * The navigation asks all three every render — which unit is open, which stage
 * it belongs to, which stage is open — and scanning the tree for each would walk
 * 23 units to answer a question the shape of the course already fixes.
 */
export const courseUnitById: ReadonlyMap<string, CourseUnit> = new Map(
  course.flatMap(({ units }) => units.map((entry) => [entry.unit.id, entry] as const)),
)

export const courseStageById: ReadonlyMap<string, CourseStage> = new Map(
  course.map((entry) => [entry.stage.id, entry] as const),
)

/** The stage a playable unit sits in — where back from its skills goes. */
export const courseStageByUnitId: ReadonlyMap<string, CourseStage> = new Map(
  course.flatMap((entry) => entry.units.map(({ unit }) => [unit.id, entry] as const)),
)
