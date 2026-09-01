/**
 * Marking a block of the course already known, and taking it back.
 *
 * Pure functions over a progress record, for the reason `wardrobe.ts` and
 * `submit.ts` exist: component tests render first paint to a string in node with
 * no handler attached, so a decision behind a tap is a decision no test can
 * reach. Each mutation returns a new record or `null`, and `null` means the
 * request was refused — the store persists only a non-null result, so a mark
 * that raises nothing advances no version and schedules no push.
 *
 * A block is a stage or a unit. Which skills it holds is the curriculum
 * manifest's answer and nothing else's, read through the course tree the
 * navigation already renders, so a block that gains or loses a skill needs no
 * migration and no stored block state can disagree with it.
 */

import { courseStageById, courseUnitById } from '../curriculum'
/**
 * Type-only, and deliberately so: `store/progress.ts` imports this module, so a
 * value imported back would be the runtime cycle `checkpoint.ts` and `pin.ts`
 * refuse for the same reason. Types erase at build time.
 */
import type { Progress, SkillProgress, SkillSource } from '../store/progress'

/**
 * Mastery a skip grants: clear of `UNLOCK_THRESHOLD` so everything downstream
 * opens, and short of `MAX_MASTERY` so a skipped skill reads as not needed yet
 * rather than finished.
 */
export const SKIP_MASTERY = 3

/**
 * What a learner may declare about a block. Practised is missing on purpose —
 * it is what a lesson earns and what a reversal restores, never something
 * claimed.
 */
export type DeclaredSource = Exclude<SkillSource, 'practiced'>

const SOURCES: readonly unknown[] = ['practiced', 'tested-out', 'self-assessed']

const isSource = (value: unknown): value is SkillSource => SOURCES.includes(value)

/**
 * One skill's source, without changing the object it was given.
 *
 * Defaulted and normalised here rather than in `reconcile()`, as `review.ts`
 * does for strength and review dates: a record with no source predates skipping,
 * so its mastery came from lessons, and a value the app does not recognise is a
 * corrupt or hand-edited blob that should still load. Both read as practised,
 * which is the reading that cannot destroy anything — a reversal leaves a
 * practised skill alone.
 */
export function readSource(skill: SkillProgress | undefined): SkillSource {
  const source = skill?.source
  return isSource(source) ? source : 'practiced'
}

/**
 * The mastery one skill's record says a mark found, without changing the object
 * it was given.
 *
 * Bounded above by the mastery the skill currently holds, which is the point
 * rather than a nicety: taking a block back is the only thing in the app allowed
 * to lower a mastery level, so no stored value may make it *raise* one. A
 * corrupt, negative, fractional or absent value reads as 0 — the level a skip
 * finds on a skill nobody has touched, and the reading that cannot invent
 * progress.
 *
 * `MAX_MASTERY` would be the wrong bound here: `reconcile()` never caps a stored
 * mastery, so the level a reversal must not exceed is the one the record
 * actually holds.
 */
export function readPriorMastery(skill: SkillProgress | undefined): number {
  if (!skill) return 0
  return Math.min(masteryLevel(skill.priorMastery), masteryLevel(skill.mastery))
}

/**
 * A stored value read as a mastery level: a positive integer, or 0.
 *
 * The current mastery goes through it too, not just the recorded one. A record
 * holding `NaN` or a fraction is a corrupt or hand-edited blob, and clamping
 * against it directly would carry that value straight into the record a
 * reversal writes.
 */
function masteryLevel(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

/**
 * The playable skills a block holds, or `undefined` when there are none.
 *
 * The course tree carries only implemented skills and drops the units and stages
 * left empty by them, so an unknown block and a block with nothing playable in it
 * are the same miss — neither is in either map. Unit ids and stage ids are
 * disjoint (a test below pins that), so the order these are tried is a detail.
 */
function blockSkillIds(blockId: string): readonly string[] | undefined {
  const unit = courseUnitById.get(blockId)
  if (unit) return unit.skills.map((skill) => skill.id)

  const stage = courseStageById.get(blockId)
  return stage?.units.flatMap(({ skills }) => skills.map((skill) => skill.id))
}

/** A record with the named skills replaced, or `null` when there are none. */
function withSkills(
  progress: Progress,
  changed: Record<string, SkillProgress>,
): Progress | null {
  if (Object.keys(changed).length === 0) return null
  return { ...progress, skills: { ...progress.skills, ...changed } }
}

/**
 * Mark a block already known, declaring how the learner knows it.
 *
 * Raises to `SKIP_MASTERY` rather than setting it: the mark is per block and
 * practice is per skill, so a learner who had already taken one skill to 5
 * inside a unit they then marked known would otherwise be demoted, and no rule
 * may reduce an earned mastery level.
 *
 * The declared source is recorded **only on the skills this actually raised**,
 * which is what makes the reversal correct — a skill left where it was keeps
 * saying it was practised, so taking the block back does not touch it.
 *
 * Each raised skill also records the mastery this found. A skill practised only
 * to 1 or 2 is still raised, because leaving it below `UNLOCK_THRESHOLD` would
 * keep the course shut and defeat the skip, and once raised it is
 * indistinguishable from one found at 0 — so the level it came from is written
 * down here or lost, and the reversal would have to destroy earned practice.
 *
 * Refused when the block holds no playable skill, and when every skill in it
 * already stands at `SKIP_MASTERY` or above: re-marking a block the learner
 * already knows is the ordinary way to reach this, and it has nothing to write.
 */
export function markKnown(
  progress: Progress,
  blockId: string,
  source: DeclaredSource,
): Progress | null {
  const skillIds = blockSkillIds(blockId)
  if (!skillIds) return null

  const raised: Record<string, SkillProgress> = {}
  for (const id of skillIds) {
    // A skill the record does not carry is built here rather than taken from the
    // store's default, so a mark writes no review field — what a skip should do
    // to review scheduling is the safety net's to decide, not this mutation's. A
    // record the app produced always carries the skill, since `reconcile()` seeds
    // every skill the manifest offers.
    const skill: SkillProgress = progress.skills[id] ?? {
      mastery: 0,
      lastPracticed: null,
      attempts: 0,
      correct: 0,
    }
    if (skill.mastery >= SKIP_MASTERY) continue
    raised[id] = {
      ...skill,
      mastery: SKIP_MASTERY,
      source,
      // Normalised on the way in as well as on the way out: writing a level the
      // reader would reject would silently cost the learner what they earned.
      priorMastery: masteryLevel(skill.mastery),
    }
  }

  return withSkills(progress, raised)
}

/**
 * Take a block back: *actually, let me practice this.*
 *
 * The only thing in the app that lowers a mastery level, and it reaches exactly
 * the skills the skip granted — those whose source is a declaration rather than
 * practice. Resetting everything sitting at `SKIP_MASTERY` instead would be a
 * heuristic that misfires the moment a learner earns that level honestly, which
 * is the whole reason the source is stored.
 *
 * The source decides *which* skills this reaches; the mastery each of them
 * recorded at the mark decides *what it returns to*. That is 0 for a skill the
 * skip found untouched and the earned level for one it found part-practised, so
 * a withdrawn claim returns the learner exactly where they stood and costs them
 * nothing they did. Both fields are cleared in the same write, because there is
 * no granted level left to restore afterwards.
 *
 * Refused when the block holds nothing the skip granted.
 */
export function unmark(progress: Progress, blockId: string): Progress | null {
  const skillIds = blockSkillIds(blockId)
  if (!skillIds) return null

  const reset: Record<string, SkillProgress> = {}
  for (const id of skillIds) {
    const skill = progress.skills[id]
    // An absent record was never granted anything, so there is nothing here to
    // take back and no reason to write one.
    if (!skill || readSource(skill) === 'practiced') continue
    reset[id] = {
      ...skill,
      mastery: readPriorMastery(skill),
      source: 'practiced',
      priorMastery: 0,
    }
  }

  return withSkills(progress, reset)
}
